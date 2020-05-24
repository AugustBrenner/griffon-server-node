const mongoose = require('mongoose')


const OperatorSchema = new mongoose.Schema({
	name: String,
	environment: String,
	channels: [{
		type: String,
	}],
	consumer_topics: [{
		type: String,
	}],
	producer_topics: [{
		type: String,
	}],
	consumer_query: mongoose.Schema.Types.Mixed,
	socket_id: String,
	connected_at:{
		type: Date,
		default: Date.now,
	}
})


const Operator = mongoose.model('Operator', OperatorSchema)

module.exports = Operator
