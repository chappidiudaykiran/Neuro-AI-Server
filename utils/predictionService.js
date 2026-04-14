const axios = require('axios')
const Prediction = require('../models/Prediction')
const buildMLPayload = require('./buildMLPayload')
const suggestSubjects = require('./suggestSubjects')

/**
 * Core prediction logic to be used by controllers or background tasks.
 * @param {string} userId - The ID of the student.
 * @returns {Promise<Object>} - The saved Prediction document.
 */
const runPrediction = async (userId) => {
	try {
		const payload = await buildMLPayload(userId)
		
		const flaskPayload = {
			student_id: userId,
			features: payload
		}

		const flaskRes = await axios.post(
			`${process.env.FLASK_URL}/api/v1/predict`,
			flaskPayload,
			{ timeout: 15000 }
		)
		const flaskResult = flaskRes.data

		// New Schema Mapping: predictions.academic.grade and predictions.psychological.stress
		const grade = flaskResult.predictions?.academic?.grade
		const stress = flaskResult.predictions?.psychological?.stress
		
		// Map matrix_label and action to our internal state
		const rawMlState = flaskResult.matrix_label || flaskResult.action
		const mlState = typeof rawMlState === 'string' ? rawMlState.trim().toUpperCase().replace(/\s+/g, '_') : ''

		const stateMap = {
			'OPTIMAL': 'optimal',
			'BURNOUT_RISK': 'burnout_risk',
			'ACADEMIC_GAP': 'academic_gap',
			'CRITICAL': 'critical',
			'OPTIMAL_PERFORMANCE': 'optimal',
			'STRESSED': 'burnout_risk',
			'UNDERPERFORMING': 'academic_gap',
			'CRITICAL_ALERT': 'critical',
			'BURNOUT_RISK': 'burnout_risk' // Explicitly handle the one we just saw
		}
		
		let state = stateMap[mlState] || (typeof mlState === 'string' && mlState ? mlState.toLowerCase() : deriveState(grade, stress))
		
		// Final safety check: ensure state matches Mongoose enum
		const validStates = ['optimal', 'burnout_risk', 'academic_gap', 'critical'];
		if (!validStates.includes(state)) {
			state = deriveState(grade, stress); // Fallback to safe derivation
		}
		const suggestions = await suggestSubjects(userId)

		const prediction = await Prediction.create({
			userId,
			mlPayload: payload,
			grade,
			stress,
			state,
			suggestions,
		})

		return prediction
	} catch (err) {
		console.error(`[predictionService] Error for user ${userId}:`, err.message)
		throw err
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

module.exports = { runPrediction }
