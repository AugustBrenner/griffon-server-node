const mongoose 	= require('mongoose')
const nanoid 	= require('nanoid')


const TaskSchema = new mongoose.Schema({
	topic: String,
	stream_id: {
		type: String,
		default: nanoid.nanoid,
	},
	channel: String,
	producer: String,
	producer_socket_id: String,
	producer_environment: String,
	consumer: String,
	consumer_socket_id: String,
	consumer_environment: String,
	timestamp: {
		type: Date,
		default: Date.now,
	},
	data: mongoose.Schema.Types.Mixed,
	history:[{
		state: String,
		timestamp: Date,
		socket_id: String,
	}],
	history_last:{
		state: String,
		timestamp: Date,
		socket_id: String,
	},
})


const Task = mongoose.model('Task', TaskSchema)

module.exports = Task
