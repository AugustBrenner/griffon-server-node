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


// const collectDependantTopics = topic => async consumer => {

// 	const payload = {
// 		operator: consumer,
// 		socket_id: consumer.socket_id,
// 		topics: [topic],
// 		payload: {
// 			channel: topic.channel,
// 			stream_id: topic.stream_id,
// 			topics: [topic.topic],
// 			data: {},
// 		},
// 	}
// 	payload.payload.data[topic.topic] = topic.data

// 	if(consumer.consumer_query.and){

// 		const dependent_topics = await Promise.all(consumer.consumer_query.and.map(dependent_topic => {
// 			// console.log('TOPIC', dependent_topic)
// 			return Topics.findOne({
// 				topic: dependent_topic,
// 				stream_id: topic.stream_id,
// 				channel_id: topic.channel_id,
// 			})
// 			.sort({'timestamp': -1})
// 		}))

// 		const is_complete = dependent_topics.reduce((complete, topic) => {

// 			return (complete ? !!topic : false)

// 		}, true)

// 		if(!is_complete) return false

// 		payload.topics = dependent_topics

// 		payload.payload.topics = dependent_topics.map(topic => topic.topic)

// 		dependent_topics.forEach(topic => {
// 			payload.payload.data[topic.topic] = topic.data
// 		})
// 	}


// 	const history_entry = {
// 		state: 'waiting',
// 		timestamp: Date.now(),
// 		socket_id: consumer.socket_id,
// 	}

// 	const task = new Tasks({
// 		topics: payload.payload.topics,
// 		stream_id: payload.payload.stream_id,
// 		channel: payload.payload.channel,
// 		producers: payload.topics.map(topic => topic.producer),
// 		producer_socket_id: payload.topics.map(topic => topic.producer_socket_id),
// 		producer_environment: payload.topics.map(topic => topic.producer_environment),
// 		data: payload.payload.data,
// 		consumer: consumer.name,
// 		consumer_socket_id: consumer.socket_id,
// 		consumer_environment: consumer.environment,
// 		history: [history_entry],
// 		history_last: history_entry,
// 	})

// 	await task.save()

// 	payload.task = task

// 	return payload
// }


const collectDependantTopics = topic => async consumer => {

	const pair = {
		topics: [topic],
		consumer: consumer,
	}

	if(consumer.consumer_query.and){

		const dependent_topics = await Promise.all(consumer.consumer_query.and.map(dependent_topic => {
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

		pair.topics = dependent_topics
	}

	return pair
}






// const emitTask = async (consumer, topics, io) => {

// 	// console.log('HEEEELLLO', consumer)

// 	const history_entry = {
// 		state: 'running',
// 		timestamp: Date.now(),
// 		socket_id: consumer.socket_id,
// 	}

// 	const task = new Tasks({
// 		topics: topics.map(topic => topic.topic),
// 		stream_id: topics[0].stream_id,
// 		channel: topics[0].channel,
// 		producers: topics.map(topic => topic.producer),
// 		producer_socket_id: topics.map(topic => topic.producer_socket_id),
// 		producer_environment: topics.map(topic => topic.producer_environment),
// 		data: {},
// 		consumer: consumer.name,
// 		consumer_socket_id: consumer.socket_id,
// 		consumer_environment: consumer.environment,
// 		history: [history_entry],
// 		history_last: history_entry,
// 	})

// 	topics.forEach(topic => {
// 		task.data[topic.topic] = topic.data
// 	})

// 	consumer.engaged = true


// 	await Promise.all([
// 		consumer.save(),
// 		task.save(),
// 	])

// 	io.to(consumer.socket_id).emit('consumption', {
// 		channel: task.channel,
// 		stream_id: task.stream_id,
// 		topics: task.topics,
// 		data: task.data,
// 	})
// }

/************************************************************************
 * Public Functions
 ***********************************************************************/

const Public = {}


Public.dissemintate = async (payload, socket, io) => {

	// Free client
	await Operators.findOneAndUpdate({socket_id: socket.id}, {engaged: false, lock_id: '', freed_at: Date.now()})

	// Mark parent task completed
	console.log('COMPLETED TASK ID:', payload.completed_task_id)
	if(payload.completed_task_id){
		const history_entry = {
			state: 'completed',
			timestamp: Date.now(),
			socket_id: socket.id,
		}

		await Tasks.findByIdAndUpdate(payload.completed_task_id, {
			$push: {history: history_entry},
			history_last: history_entry,
		})
	}


	// Parse client from handshake
	const client = JSON.parse(socket.handshake.query.init)


	// Validate production
	if(client.produce.indexOf(payload.topic) === -1) return socket.emit(new Error('Client not registered to produce this topic.'))

	if(!payload.channel) return socket.emit(new Error('Producers must include a channel to emit to.'))

	if(!payload.data) return socket.emit(new Error('Producer messages must not be empty.'))


	// Generate a new topic for the produuction
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



	// Get all curious consumers
	const curious_consumers = await Operators.find({consumer_topics: topic.topic})



	// Filter for unique curious consumers
	const unique_curious_consumers = {}

	curious_consumers.forEach(consumer => {
		unique_curious_consumers[consumer.name+consumer.environment] = consumer
	})



	// Collect dependant topics from unique curous consumers
	let topic_consumer_pairs = await Promise.all(Object.values(unique_curious_consumers).map(collectDependantTopics(topic)))



	// Generate Tasks
	await Promise.all(topic_consumer_pairs.filter(x=>x).map(pair => {

		const topics = pair.topics

		const history_entry = {
			state: 'waiting',
			timestamp: Date.now(),
			socket_id: socket.id,
		}

		const task = new Tasks({
			topics: topics.map(topic => topic.topic),
			stream_id: topics[0].stream_id,
			channel: topics[0].channel,
			producers: topics.map(topic => topic.producer),
			producer_socket_ids: topics.map(topic => topic.producer_socket_id),
			producer_environments: topics.map(topic => topic.producer_environment),
			consumer: pair.consumer.name,
			consumer_environment: pair.consumer.environment,
			data: {},
			history: [history_entry],
			history_last: history_entry,
		})

		topics.forEach(topic => {
			task.data[topic.topic] = topic.data
		})

		return task.save()
	}))



	// Generate a lock_id to lock curious consumers
	const lock_id = nanoid.nanoid()



	// Lock all waiting tasks and fetch them
	await Tasks.updateMany({'history_last.state': 'waiting', locked: false}, {locked: true, lock_id: lock_id})

	const tasks = await Tasks.find({lock_id: lock_id})

	// console.log('\n\ntasks:\n', tasks.map(x => x.topics.join(',')))



	// Fetch LRU consumers for each task
	let pairs = await Promise.all(tasks.map(async task => {

		const consumer = await Operators.findOneAndUpdate({
			name: task.consumer,
			environment: task.consumer_environment,
			engaged: false,
		}, {
			engaged: true,
		}, {
			new: true,
		})
		.sort({freed_at: 1})

		// console.log(consumer)

		return {
			task: task,
			consumer: consumer,
		}
	}))


	// console.log('\n\nConsumer-Task Pairs:\n', pairs.filter(x => x.consumer))

	console.log(socket.id)


	// Release orphaned tasks
	await Tasks.updateMany({_id: {$in: pairs.filter(x => !x.consumer).map(x => x.task._id)}}, {locked: false, lock_id: ''})



	// Emit tasks to consumers
	await Promise.all(pairs.filter(x => x.consumer).map(async pair => {

		// console.log('HEEEELLLO', consumer)

		const emitTask = pair => new Promise((resolve, reject) => {

			let timed_out = false
			let resolved = false

			setTimeout(() => {
				timed_out = true
				reject({error: 'timeout'})
			}, 10000)

			io.sockets.connected[pair.consumer.socket_id].emit('consumption', {
				task_id: pair.task._id,
				channel: pair.task.channel,
				stream_id: pair.task.stream_id,
				topics: pair.task.topics,
				data: pair.task.data,
			}, response => {

				if(timed_out) return

				resolved = true

				resolve(response)
			})
		})

		await emitTask(pair)
		.then(async response => {

			console.log(response)

			const history_entry = {
				state: 'running',
				timestamp: Date.now(),
				socket_id: pair.consumer.socket_id,
			}

			pair.task.consumer_socket_id = pair.consumer.socket_id
			pair.task.history.push(history_entry)
			pair.task.history_last = history_entry
			pair.task.locked = false
			pair.task.lock_id = ''

			await pair.task.save()

		})
		.catch(async error => {

			console.log(error)

			pair.task.locked = false
			pair.task.lock_id = ''

			await pair.task.save()

		})

	}))
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
			task_id: task._id,
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
