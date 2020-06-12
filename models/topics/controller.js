'use strict'

/************************************************************************
 * Environment variable validations
 ***********************************************************************/


/************************************************************************
 * External Dependencies
 ***********************************************************************/

// Node Modules ========================================================
const nanoid 	= require('nanoid')

// Data Models =========================================================

const Topics 	= require('./model')
const Operators = require('../operators/model')

// Local Dependencies ===============================================

// Module Settings =====================================================


/************************************************************************
 * Private Functions
 ***********************************************************************/


const collectDependantTopics = topic => async consumer => {

	const payload = {
		operator: consumer,
		socket_id: consumer.socket_id,
		payload: {
			channel: topic.channel,
			stream_id: topic.stream_id,
			topics: [topic.topic],
			data:{},
		},
	}
	payload.payload.data[topic.topic] = topic.data

	payload.topics = [topic]

	if(!consumer.consumer_query.and) return payload


	const dependent_topics = await Promise.all(consumer.consumer_query.and.map(dependent_topic => {
		console.log('TOPIC', dependent_topic)
		return Topics.findOne({
			topic: dependent_topic,
			stream_id: topic.stream_id,
			channel_id: topic.channel_id,
			'history_last.state': 'waiting',
		})
		.sort({'history_last.timestamp': 1})
	}))

	const is_complete = dependent_topics.reduce((complete, topic) => {

		return (complete ? !!topic : false)

	}, true)

	if(!is_complete) return false

	dependent_topics.forEach(topic => {
		payload.payload.data[topic.topic] = topic.data
	})

	console.log('DEPENDENT TOPICS', dependent_topics)

	payload.payload.topics = dependent_topics.map(topic => topic.topic)
	payload.topics = dependent_topics

	return payload
}






const emitTopic = async (consumer, io) => {

	console.log('HEEEELLLO', consumer)

	const history_entry = {
		state: 'running',
		timestamp: Date.now(),
		socket_id: consumer.socket_id,
	}
	consumer.operator.engaged = true
	consumer.topics.forEach(topic => {
		topic.history.push(history_entry)
		topic.history_last = history_entry
	})

	await Promise.all([
		consumer.operator.save(),
		Promise.all(consumer.topics.map(topic => topic.save())),
	])

	console.log('DFDDDFDFDFDF')

	io.to(consumer.socket_id).emit('consumption', consumer.payload)
}

/************************************************************************
 * Public Functions
 ***********************************************************************/

const Public = {}


Public.dissemintate = async (payload, socket, io) => {

	const client = JSON.parse(socket.handshake.query.init)

	if(client.produce.indexOf(payload.topic) === -1) return socket.emit(new Error('Client not registered to produce this topic.'))

	if(!payload.channel) return socket.emit(new Error('Producers must include a channel to emit to.'))

	if(!payload.data) return socket.emit(new Error('Producer messages must not be empty.'))

	// console.log('TOPIC', payload, client)

	const history_entry = {
		state: 'waiting',
		timestamp: Date.now(),
		socket_id: socket.id,
	}

	const topic = new Topics({
		topic: payload.topic,
		stream_id: payload.stream_id || nanoid.nanoid(),
		channel: payload.channel,
		producer: client.operator,
		producer_environment: client.environment,
		data: payload.data,
		history: [history_entry],
		history_last: history_entry,
	})

	await topic.save()

	const operators = await Operators.find({consumer_topics: topic.topic, engaged: false})

	let consumers = await Promise.all(operators.map(collectDependantTopics(topic)))

	consumers = consumers.filter(x => x).sort((a, b) => (a.freed_at - b.freed_at))

	if(consumers.length === 0) return

	await emitTopic(consumers[0], io)

	// console.log(payload, '\n\n\n', socket.id, JSON.parse(socket.handshake.query.init), topic)



}


Public.complete = async socket => {

	const history_entry = {
		state: 'complete',
		timestamp: Date.now(),
		socket_id: socket.id,
	}

	await Topics.findOneAndUpdate({'history_last.socket_id': socket.id}, {
		$push: {history: history_entry},
		history_last: history_entry,
	})
}

Public.fail = async socket => {

	const history_fail = {
		state: 'failed',
		timestamp: Date.now(),
		socket_id: socket.id,
	}

	const history_waiting = {
		state: 'waiting',
		timestamp: Date.now(),
		socket_id: socket.id,
	}

	await Topics.updateMany({'history_last.socket_id': socket.id, 'history_last.state': 'running'}, {
		$push: {history: [history_fail, history_waiting]},
		history_last: history_waiting,
	})
}

Public.failAll = async () => {

	const history_fail = {
		state: 'failed',
		timestamp: Date.now(),
		socket_id: 'ALL',
	}

	const history_waiting = {
		state: 'waiting',
		timestamp: Date.now(),
		socket_id: 'ALL',
	}

	await Topics.updateMany({'history_last.state': 'running'}, {
		$push: {history: [history_fail, history_waiting]},
		history_last: history_waiting,
	})
}



/************************************************************************
 * Public Export
 ***********************************************************************/

module.exports = Public
