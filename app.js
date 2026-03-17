require('dotenv').config({ path: require('path').resolve(__dirname, '.env') })
const express = require('express')
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(cors({
	origin: process.env.CLIENT_URL || 'http://localhost:5173',
	credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/health', (req, res) => {
	res.json({ status: 'ok', service: 'neuro-ai-server', time: new Date().toISOString() })
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/courses', require('./routes/courses'))
app.use('/api/feedback', require('./routes/feedback'))
app.use('/api', require('./routes/predict'))
app.use('/api/watch', require('./routes/watch'))
app.use('/api/results', require('./routes/results'))
// Removed educator route. Only admin dashboard allowed.

app.use((req, res) => {
	res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` })
})

app.use(errorHandler)

module.exports = app
