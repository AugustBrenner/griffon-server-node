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
const Tasks 	= require('../tasks/model')
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
		topics: [topic],
		payload: {
			channel: topic.channel,
			stream_id: topic.stream_id,
			topics: [topic.topic],
			data:{},
		},
	}
	payload.payload.data[topic.topic] = topic.data

	if(consumer.consumer_query.and){

		const dependent_topics = await Promise.all(consumer.consumer_query.and.map(dependent_topic => {
			// console.log('TOPIC', dependent_topic)
			return Topics.findOne({
				topic: dependent_topic,
				stream_id: topic.stream_id,
				channel_id: topic.channel_id,
			})
			.sort({'timestamp': -1})
		}))

		const is_complete = dependent_topics.reduce((complete, topic) => {

			return (complete ? !!topic : false)

		}, true)

		if(!is_complete) return false

		payload.topics = dependent_topics

		payload.payload.topics = dependent_topics.map(topic => topic.topic)

		dependent_topics.forEach(topic => {
			payload.payload.data[topic.topic] = topic.data
		})
	}


	const history_entry = {
		state: 'waiting',
		timestamp: Date.now(),
		socket_id: consumer.socket_id,
	}

	const task = new Tasks({
		topics: payload.payload.topics,
		stream_id: payload.payload.stream_id,
		channel: payload.payload.channel,
		producers: payload.topics.map(topic => topic.producer),
		producer_socket_id: payload.topics.map(topic => topic.producer_socket_id),
		producer_environment: payload.topics.map(topic => topic.producer_environment),
		data: payload.payload.data,
		consumer: consumer.name,
		consumer_socket_id: consumer.socket_id,
		consumer_environment: consumer.environment,
		history: [history_entry],
		history_last: history_entry,
	})

	await task.save()

	payload.task = task

	return payload
}






const emitTopic = async (consumer, io) => {

	// console.log('HEEEELLLO', consumer)

	const history_entry = {
		state: 'running',
		timestamp: Date.now(),
		socket_id: consumer.socket_id,
	}
	consumer.operator.engaged = true
	consumer.task.history.push(history_entry)
	consumer.task.history_last = history_entry

	await Promise.all([
		consumer.operator.save(),
		consumer.task.save(),
	])

	console.log('DFDDDFDFDFDF', consumer.payload, consumer.socket_id)

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

	// console.log('TOPIC', client)

	const topic = new Topics({
		topic: payload.topic,
		stream_id: payload.stream_id || nanoid.nanoid(),
		channel: payload.channel,
		producer: client.operator,
		producer_socket_id: socket.id,
		producer_environment: client.environment,
		data: payload.data,
	})

	await topic.save()

	const operators = await Operators.find({consumer_topics: topic.topic, engaged: false})

	let consumers = await Promise.all(operators.map(collectDependantTopics(topic)))

	consumers = consumers.filter(x => x).sort((a, b) => (a.freed_at - b.freed_at))
	
	const unique_consumers = {}

	consumers.forEach(consumer => {
		unique_consumers[consumer.operator.name+consumer.operator.environment] = consumer
	})

	consumers = Object.values(unique_consumers)

	if(consumers.length === 0) return

	await Promise.all(consumers.map(async consumer => {

		await emitTopic(consumer, io)
	}))


	// console.log(payload, '\n\n\n', socket.id, JSON.parse(socket.handshake.query.init), topic)



}


Public.complete = async socket => {

	const history_entry = {
		state: 'completed',
		timestamp: Date.now(),
		socket_id: socket.id,
	}

	await Tasks.findOneAndUpdate({'history_last.socket_id': socket.id}, {
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

	// const history_waiting = {
	// 	state: 'waiting',
	// 	timestamp: Date.now(),
	// 	socket_id: socket.id,
	// }

	await Tasks.updateMany({'history_last.socket_id': socket.id, 'history_last.state': 'running'}, {
		$push: {history: [history_fail, /*history_waiting*/]},
		history_last: history_fail,
	})
}

Public.failAll = async () => {

	const history_fail = {
		state: 'failed',
		timestamp: Date.now(),
		socket_id: 'ALL',
	}

	// const history_waiting = {
	// 	state: 'waiting',
	// 	timestamp: Date.now(),
	// 	socket_id: 'ALL',
	// }

	await Tasks.updateMany({'history_last.state': 'running'}, {
		$push: {history: [history_fail, /*history_waiting*/]},
		history_last: history_fail,
	})
}


Public.index = async params => {
	params = params || {}

	const query = {}

	if(params.states){
		query['history_last.state'] = {$in: params.states}
	}

	return await Tasks.find(query)
}



Public.restart = async (data, io) => {

	console.log(data)

	const task = await Tasks.findById(data.task_id)

	const consumer = await Operators.findOne({name: task.consumer, engaged: false})

	console.log('SOCKET_ID', consumer.socket_id, task)

	const payload = {
		operator: consumer,
		socket_id: consumer.socket_id,
		payload: {
			channel: task.channel,
			stream_id: task.stream_id,
			topics: task.topics,
			data: task.data,
		},
	}

	const history_start = {
		state: 'running',
		timestamp: Date.now(),
		socket_id: consumer.socket_id,
	}

	consumer.engaged = true
	task.history.push(history_start)
	task.history_last = history_start

	await Promise.all([
		consumer.save(),
		task.save(),
	])

	console.log(payload.payload)

	io.to(consumer.socket_id).emit('consumption', payload.payload)
}



/************************************************************************
 * Public Export
 ***********************************************************************/

module.exports = Public
