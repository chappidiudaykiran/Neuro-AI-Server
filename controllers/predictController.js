const mongoose = require('mongoose')
const Prediction = require('../models/Prediction')
const buildMLPayload = require('../utils/buildMLPayload')
const { runPrediction } = require('../utils/predictionService')

exports.predict = async (req, res, next) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.userId)) {
			return res.status(401).json({ message: 'Invalid User ID. Please log in again.' })
		}
		
		const prediction = await runPrediction(req.userId)
		res.status(201).json(prediction)
	} catch (err) {
		console.error('[POST /predict] Error:', err.message)
		if (err.response || err.isAxiosError) {
			return res.status(503).json({
				message: 'ML service is currently unavailable. Please try again later.',
			})
		}
		next(err)
	}
}

const User = require('../models/User')
const Subject = require('../models/Subject')

exports.getResults = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId).populate('selectedSubjects')
		const enrolledNames = user?.selectedSubjects?.map(s => s.name) || []

		let predictions = await Prediction.find({ userId: req.userId })
			.sort({ createdAt: -1 })
			.limit(20)
		
		// Filter suggestions in existing predictions to only show enrolled subjects
		predictions = predictions.map(p => {
			const filteredSuggestions = p.suggestions.filter(s => enrolledNames.includes(s.subject))
			return { ...p.toObject(), suggestions: filteredSuggestions }
		})

		res.json(predictions)
	} catch (err) {
		console.error('[GET /results] Error:', err.message)
		next(err)
	}
}

exports.getPreview = async (req, res, next) => {
	try {
		console.log(`[GET /preview] Fetching preview for user: ${req.userId}`)
        if (!mongoose.Types.ObjectId.isValid(req.userId)) {
			return res.status(401).json({ message: 'Invalid User ID. Please log in again.' })
		}
		const payload = await buildMLPayload(req.userId)
		res.json(payload)
	} catch (err) {
		console.error('[GET /preview] Error:', err.message)
		next(err)
	}
}
