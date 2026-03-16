const axios = require('axios')
const Prediction = require('../models/Prediction')
const buildMLPayload = require('../utils/buildMLPayload')
const suggestSubjects = require('../utils/suggestSubjects')

exports.predict = async (req, res, next) => {
	try {
		const payload = await buildMLPayload(req.userId)

		let flaskResult
		try {
			const flaskRes = await axios.post(
				`${process.env.FLASK_URL}/predict`,
				payload,
				{ timeout: 10000 }
			)
			flaskResult = flaskRes.data
		} catch (flaskErr) {
			console.error('Flask error:', flaskErr.message)
			return res.status(503).json({
				message: 'ML service is currently unavailable. Please try again later.',
			})
		}

		const suggestions = await suggestSubjects(req.userId)
		const state = deriveState(flaskResult.grade, flaskResult.stress)

		const prediction = await Prediction.create({
			userId: req.userId,
			mlPayload: payload,
			grade: flaskResult.grade,
			stress: flaskResult.stress,
			state,
			suggestions,
		})

		res.status(201).json(prediction)
	} catch (err) {
		next(err)
	}
}

exports.getResults = async (req, res, next) => {
	try {
		const predictions = await Prediction.find({ userId: req.userId })
			.sort({ createdAt: -1 })
			.limit(20)
		res.json(predictions)
	} catch (err) {
		next(err)
	}
}

function deriveState(grade, stress) {
	const goodGrade = grade >= 2
	const highStress = stress >= 2

	if (goodGrade && !highStress) return 'optimal'
	if (goodGrade && highStress) return 'burnout_risk'
	if (!goodGrade && !highStress) return 'academic_gap'
	return 'critical'
}
