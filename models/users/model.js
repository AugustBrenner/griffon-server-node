const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		index: true,
		unique: true,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	scopes: [{
		type: String,
		index: true,
	}],
	allowed_environments: [{
		type: String,
	}],
	allowed_channels: [{
		type: String,
	}],
	allowed_consumer_topics: [{
		type: String,
	}],
	allowed_producer_topics: [{
		type: String,
	}],
})

// UserSchema.virtual('inboxes', {
// 	ref: 'Inbox',
// 	localField: '_id',
// 	foreignField: 'parent',
// 	// justOne: false,
// 	// options: { sort: { _id: -1 }, limit: 5 }
// })


const User = mongoose.model('User', UserSchema)

module.exports = User
