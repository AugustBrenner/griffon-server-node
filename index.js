'use strict'

/************************************************************************
 * Environment variable validations
 ***********************************************************************/


/************************************************************************
 * External Dependencies
 ***********************************************************************/

// Node Modules ========================================================
const mongoose 		= require('mongoose')
const express 		= require('express')
const http 			= require('http')
const io 			= require('socket.io')

// Data Models =========================================================

const Users 		= require('./models/users/controller')
const Operators 	= require('./models/operators/controller')
const Topics 		= require('./models/topics/controller')

// Local Dependencies ===============================================

// Module Settings =====================================================




/************************************************************************
 * Private Functions
 ***********************************************************************/


// // When successfully connected
// mongoose.connection.on('connected', function () {
//   console.log('Mongoose default connection open');
// })
  
// // If the connection throws an error
// mongoose.connection.on('error',function (err) { 
//   console.log('Mongoose default connection error: ' + err);
// })

// // When the connection is disconnected
// mongoose.connection.on('disconnected', function () { 
//   console.log('Mongoose default connection disconnected')
// })

// If the Node process ends, close the Mongoose connection 

const disconnectAllClients = async () => {

	await Operators.detachAll()

	mongoose.connection.close(function () { 
		console.log('Mongoose default connection disconnected through app termination')
		process.exit(0)
	})
}
process.on('SIGINT', disconnectAllClients)
process.on('SIGUSR2', disconnectAllClients)



const dashboard = express()

dashboard.use(express.static(__dirname + '/dashboard/'))

dashboard.get('/', (req, res) => {
  res.sendFile(__dirname + '/dashboard/index.html')
})


/************************************************************************
 * Public Functions
 ***********************************************************************/

const Public = {}


Public.connectDB = async args => {


	await mongoose.connect(args.mongo_uri, {
		useCreateIndex: true,
	 	useNewUrlParser: true,
	 	useUnifiedTopology: true,
	 	useFindAndModify: false,
	})

	await Users.ensureAdmin()
}


Public.serveDashboard = async args => {


	const server = http.Server(dashboard)

	const sockets = io(server)

	await server.listen(args.port)

	sockets.on('connection', socket => {


		socket.emit('news', { hello: 'world' })

		socket.on('my other event', (data) => {
			console.log(data)
		})
	})




}


Public.serveWorkflow = async args => {

	const app = express()

	const server = http.Server(app)

	server.listen(args.port)
	
	const sockets = io(server)

	sockets.use(Users.authenticateSocketConnection)

	sockets.use(Operators.attach(sockets))

	.on('connection', async socket => {

		console.log('connected')
		
		if(socket.operator === '$$dashboard'){
			Operators.index().then(operators => {
				socket.emit('operators', operators)
			})
		}

		socket.on('production', async data => {

			await Topics.dissemintate(data, socket, sockets)
		})

		socket.on('disconnect', async reason => {

			await Operators.detach(socket)
			
			console.log('disconnected', reason)
		})

		socket.on('error', error => {
			console.log('error', error)
		})

		// socket.emit('server', { hello: 'world' })

		// socket.on('client', (data) => {
		// 	console.log(data)
		// })

		// socket.on('disconnecting', (reason) => {
		// 	console.log('disconnecting', reason)
		// })



	})

}





/************************************************************************
 * Public Export
 ***********************************************************************/

module.exports = Public
