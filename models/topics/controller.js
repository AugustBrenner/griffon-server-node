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
		socket_id: consumer.socket_id,
		payload: {
			channel: topic.channel,
			stream_id: topic.stream_id,
			topics: [topic.topic],
			data:{},
		}
	}
	payload.payload.data[topic.topic] = topic.data

	if(!consumer.consumer_query.and) return payload


	const dependent_topics = await Promise.all(consumer.consumer_query.and.map(dependent_topic => {
		console.log('TOPIC', dependent_topic)
		return Topics.findOne({
			topic: dependent_topic,
			stream_id: topic.stream_id,
			channel_id: topic.channel_id,
		})
		.sort({timestamp: -1})
	}))

	const is_complete = dependent_topics.reduce((complete, topic) => {

		return (complete ? !!topic : false)

	}, true)

	if(!is_complete) return false

	dependent_topics.forEach(topic => {
		payload.payload.data[topic.topic] = topic.data
	})

	payload.payload.topics = dependent_topics.map(topic => topic.topic)

	return payload
}

/************************************************************************
 * Public Functions
 ***********************************************************************/

const Public = {}


Public.dissemintate = async (payload, socket, io) => {

	const client = JSON.parse(socket.handshake.query.init)

	console.log(payload, client)

	if(client.produce.indexOf(payload.topic) === -1) return socket.emit(new Error('Client not registered to produce this topic.'))

	if(!payload.channel) return socket.emit(new Error('Producers must include a channel to emit to.'))

	if(!payload.data) return socket.emit(new Error('Producer messages must not be empty.'))

	const topic = new Topics({
		topic: payload.topic,
		stream_id: payload.stream_id || nanoid.nanoid(),
		channel: payload.channel,
		producer: client.operator,
		producer_environment: client.environment,
		data: payload.data,
	})

	await topic.save()

	const operators = await Operators.find({consumer_topics: topic.topic})


	let consumers = await Promise.all(operators.map(collectDependantTopics(topic)))

	consumers = consumers.filter(x => x)

	consumers.forEach(consumer => {

		io.to(consumer.socket_id).emit('consumption', consumer.payload)
	})


	// console.log(payload, '\n\n\n', socket.id, JSON.parse(socket.handshake.query.init), topic)



}



/************************************************************************
 * Public Export
 ***********************************************************************/

module.exports = Public
