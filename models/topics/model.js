const mongoose 	= require('mongoose')
const nanoid 	= require('nanoid')


const TopicSchema = new mongoose.Schema({
	topic: String,
	stream_id: {
		type: String,
		default: nanoid.nanoid,
	},
	channel: String,
	producer: String,
	producer_socket_id: String,
	producer_environment: String,
	data: mongoose.Schema.Types.Mixed,
	timestamp: {
		type: Date,
		default: Date.now,
	}
})


const Topic = mongoose.model('Topic', TopicSchema)

module.exports = Topic
