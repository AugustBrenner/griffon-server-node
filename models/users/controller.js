'use strict'

/************************************************************************
 * Environment variable validations
 ***********************************************************************/


/************************************************************************
 * External Dependencies
 ***********************************************************************/

// Node Modules ========================================================

const bcrypt		= require('bcrypt')

// Data Models =========================================================

const Users 		= require('./model')

// Local Dependencies ===============================================
const Operators 	= require('../operators/controller')

// Module Settings =====================================================


/************************************************************************
 * Private Functions
 ***********************************************************************/


const regexMatchArray = (array, str) => {

	return array.reduce((match, regex) => {

		return match || (new RegExp(`^${regex}$`)).test(str)

	}, false)
}


const authorizeEnv = (environment, auth) => {

	if(typeof environment !== 'string') return new Error(`Environment must be a string.`)

	if(!regexMatchArray(auth, environment)) return new Error(`User does not have access to this environment`)

	return true
}


const validateArray = (array, auth, param_name) => {

	if(!Array.isArray(array)) return new Error(`Topic fields must be an array.`)

	let authorized = true

	array.forEach(topic => {

		if(authorized !== true) return

		if(typeof topic !== 'string') return authorized = new Error(`'and' array must contain only strings.`)

		if(!regexMatchArray(auth, topic)) return authorized = new Error(`User does not have read access to ${param_name} '${topic}'.`)
	})

	return authorized
}


const authorizeConsumer = (fields, auth) => {

	if(fields.and){

		return validateArray(fields.and, auth)
	}

	else if(fields.or){

		return validateArray(fields.or, auth)
	}

	else return new Error(`Invalid consumer configuration.`)
}


/************************************************************************
 * Public Functions
 ***********************************************************************/

const Public = {}

Public.ensureAdmin = async () => {

	const admins = await Users.find({scopes: 'admin'})

	const password_hash = await bcrypt.hash('password', 10)

	if(admins.length === 0) await Users.create({
		username: 'admin',
		password: password_hash,
		scopes:['admin'],
		allowed_environments: ['.*'],
		allowed_channels: ['.*'],
		allowed_consumer_topics: ['.*'],
		allowed_producer_topics: ['.*'],
	})
}


Public.authenticateSocketConnection = args => async (socket, next) => {

	if(args.secure === false){
		console.log(`WARNING: This Griffon server is configured with '{secure: false}'. Clients require no authorization to connect.`)
		return next()
	}

	console.log('authenticating')

	const query = JSON.parse(socket.handshake.query.init)

	let user

	if(!socket.handshake.query) next(new Error('Authentication error'))


	else if(query.username && query.password){

		user = await Users.findOne({username: query.username})

		if(!user) return next(new Error('User not found'))
	}

	else if(query.token){

		if(!user) return next(new Error('User not found'))
	}

	else return next(new Error('Authentication error'))



	const password_match = await bcrypt.compare(query.password, user.password)

	if(!password_match) return next(new Error('Incorrect password'))

	console.log('Passwords match!')
	

	// Authorize the if user is allowed to connect as the envonment
	const environment_authorized = authorizeEnv(query.environment, user.allowed_environments)
	if(environment_authorized !== true) return next(environment_authorized)
	

	// Authorize the if user is is allowed to subscribe to the topics
	const consumer_topics_authorized = authorizeConsumer(query.consume, user.allowed_consumer_topics)
	if(consumer_topics_authorized !== true) return next(consumer_topics_authorized)


	// Authorize the if user is is allowed to publish to the topics
	const producer_topics_authorized = validateArray(query.produce, user.allowed_producer_topics, 'topic')
	if(producer_topics_authorized !== true) return next(producer_topics_authorized)


	// Authorize if the user is allowed to subscribe to the channel
	const channels_authorized = validateArray(query.channels, user.allowed_channels, 'channel')
	if(channels_authorized !== true) return next(channels_authorized)



	return next()
}


/************************************************************************
 * Public Export
 ***********************************************************************/

module.exports = Public
