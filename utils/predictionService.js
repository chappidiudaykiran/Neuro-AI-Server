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
			`${process.env.FLASK_URL}/api/v1/predict/student-matrix`,
			flaskPayload,
			{ timeout: 15000 }
		)
		const flaskResult = flaskRes.data

		const grade = flaskResult.analysis?.academic_profile?.raw_score
		const stress = flaskResult.analysis?.psychological_profile?.raw_score
		const rawMlState = flaskResult.analysis?.matrix_state?.state_code
		const mlState = typeof rawMlState === 'string' ? rawMlState.trim() : rawMlState

		const stateMap = {
			'OPTIMAL': 'optimal',
			'BURNOUT_RISK': 'burnout_risk',
			'ACADEMIC_GAP': 'academic_gap',
			'CRITICAL': 'critical',
		}
		
		const state = stateMap[mlState] || (typeof mlState === 'string' ? mlState.toLowerCase() : deriveState(grade, stress))
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
