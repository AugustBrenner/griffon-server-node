const mongoose 	= require('mongoose')
const nanoid 	= require('nanoid')


const TaskSchema = new mongoose.Schema({
	topics: [String],
	stream_id: {
		type: String,
		default: nanoid.nanoid,
	},
	channel: String,
	producers: [String],
	producer_socket_ids: [String],
	producer_environments: [String],
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
	locked:{
		type: Boolean,
		default: false,
	},
	lock_id:{
		type: String,
		default: '',
	},
})


const Task = mongoose.model('Task', TaskSchema)

module.exports = Task
