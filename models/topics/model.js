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
	producer_environment: String,
	timestamp: {
		type: Date,
		default: Date.now,
	},
	data: mongoose.Schema.Types.Mixed,
})


const Topic = mongoose.model('Topic', TopicSchema)

module.exports = Topic
