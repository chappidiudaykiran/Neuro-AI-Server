const app = require('./app')
const http = require('http')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 3001

const listenWithFallback = (port) => {
	const server = http.createServer(app)

	server.on('error', (err) => {
		if (err.code === 'EADDRINUSE') {
			const nextPort = Number(port) + 1
			console.warn(`Port ${port} is busy, retrying on ${nextPort}...`)
			listenWithFallback(nextPort)
			return
		}

		console.error('Server failed to start:', err.message)
		process.exit(1)
	})

	server.listen(port, () => {
		console.log(`\nServer running on http://localhost:${port}`)
		console.log(`Health check -> http://localhost:${port}/health`)
		console.log('To seed subjects: npm run seed\n')
	})
}

const start = async () => {
	await connectDB()
	listenWithFallback(PORT)
}

start()
