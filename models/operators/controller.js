'use strict'

/************************************************************************
 * Environment variable validations
 ***********************************************************************/


/************************************************************************
 * External Dependencies
 ***********************************************************************/

// Node Modules ========================================================

// Data Models =========================================================

const Operators 	= require('./model')
const Users 		= require('../users/model')

// Local Dependencies ===============================================

// Module Settings =====================================================


/************************************************************************
 * Private Functions
 ***********************************************************************/

function equalSet(sa, sb) {
	sa = new Set(sa)
	sb = new Set(sb)
    if (sa.size !== sb.size) return false;
    for (var a of sa) if (!sb.has(a)) return false;
    return true;
}

function extractTopics(topics) {
	if(Array.isArray(topics)) return topics
	else if(topics.and) return topics.and
	else if(topics.or) return topics.or
	else throw new Error('Missing topics to extract.')
}

const validOperator = (op1, op2) => {

	const same_consumer_topics = equalSet(op1.consumer_topics, op2.consumer_topics)

	const same_producer_topics = equalSet(op1.producer_topics, op2.producer_topics)

	const same_channels = equalSet(op1.channels, op2.channels)

	let same_consumer_query = true
	if(op1.and){
		if(!op2.and) same_consumer_query = false
		else same_consumer_query = equalSet(op1.consumer_query.and, op2.consumer_query.and)
	}

	return same_consumer_topics && same_producer_topics && same_consumer_query
}

const matchingOperators = op1 => op2 => {

	const matching_environment = op1.environment === op2.environment

	const matching_channels = equalSet(op1.channels, op2.channels)

	return matching_environment && matching_channels
}


const competingOperators = op1 => op2 => {

	const matching_environment = op1.environment === op2.environment

	return !matching_environment
}

/************************************************************************
 * Public Functions
 ***********************************************************************/

const Public = {}


Public.attach = io => async (socket, next) => {

	const query = JSON.parse(socket.handshake.query.init)

	const operator = new Operators({
		name: query.operator,
		environment: query.environment,
		channels: query.channels,
		consumer_topics: extractTopics(query.consume),
		producer_topics:extractTopics(query.produce),
		consumer_query: query.consume,
		socket_id: socket.id,
	})

	const operators = await Operators.find({
		name: operator.name,
		socket_id: {$ne: operator.socket_id},
	})


	// If this is the sole operator skip the rest of the logic
	if(operators.length === 0){

		await operator.save()

		return next()
	}

	// Abort connection of invalid operators
	if(!validOperator(operator, operators[0])){

		return next(new Error('Operator with different topic consumers and producers already registered.'))
	}

	// Connect operator
	await operator.save()

	next()


	// Alert matching operators that a sibling has joined the cluster
	const matching_operators = operators.filter(matchingOperators(operator))

	matching_operators.forEach(op => {
		io.to(op.socket_id).emit('info', {
			message: `Sibling '${op.name}' operator '${operator.socket_id}' has joined the '${op.environment}' consumer group.`,
			// operator: op.operator,
			// environment: op.environment,
			// channels: op.channels,
			// consumer_topics: op.consumer_topics,
			// producer_topics:op.producer_topics,
			// consumer_query: op.consumer_query,
			// socket_id: op.socket_id,
		})
	})


	// Alert competing operators that their channels might be hijacked
	const competing_operators = operators.filter(competingOperators(operator))

	competing_operators.forEach(op => {
		io.to(op.socket_id).emit('info', {
			message: `Competing '${operator.name}' operator '${operator.socket_id}' in environment '${op.environment}' is diverting all channels matching '${JSON.stringify(operator.channels)}'.`,
			// operator: op.operator,
			// environment: op.environment,
			// channels: op.channels,
			// consumer_topics: op.consumer_topics,
			// producer_topics:op.producer_topics,
			// consumer_query: op.consumer_query,
			// socket_id: op.socket_id,
		})
	})

}


Public.getDashboards = async () => {

	return await Operators.find({name: '$$dashboard'})
}

Public.free = async socket => {

	await Operators.findOneAndUpdate({socket_id: socket.id}, {
		engaged: false,
		free_at: Date.now(),
	})
}


Public.detach = async socket => {

	await Operators.findOneAndRemove({socket_id: socket.id})
}


Public.detachAll = async socket => {

	await Operators.deleteMany({})
}

Public.index = async socket => {

	return await Operators.find()
}



/************************************************************************
 * Public Export
 ***********************************************************************/

module.exports = Public
