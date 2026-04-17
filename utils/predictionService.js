const axios = require('axios')
const Prediction = require('../models/Prediction')
const buildMLPayload = require('./buildMLPayload')
const suggestSubjects = require('./suggestSubjects')

/**
 * Core prediction logic — calls the Student Performance Inference API v1.0.0
 * and stores the result in MongoDB.
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

		// Support BOTH old nested API formatting and new flat API formatting seamlessly:
		const grade = Number(flaskResult.grade ?? flaskResult.predictions?.academic?.grade_class ?? 0)
		const stress = Number(flaskResult.stress ?? flaskResult.predictions?.psychological?.stress_class ?? 0)
		const riskScore = Number(flaskResult.risk_score ?? flaskResult.bam?.risk_score ?? 0)

		console.log(`[ML Debug] User: ${userId} | Grade: ${grade} | Stress: ${stress} | Risk: ${riskScore}`)
		
		// Map BAM state from either new API format string, or old matrix_label, to our internal lowercase state
		const rawBamState = flaskResult.bam || flaskResult.matrix_label || ''
		const normalizedState = typeof rawBamState === 'string' ? rawBamState.trim().toLowerCase().replace(/[\s-]+/g, '_') : ''

		const stateMap = {
			'optimal': 'optimal',
			'monitor': 'monitor',
			'burnout_risk': 'burnout_risk',
			'underperforming': 'underperforming',
			'at_risk': 'at_risk',
			'critical': 'critical',
			// Fallbacks for any alternate labels
			'burnout': 'burnout_risk',
			'at risk': 'at_risk',
		}
		
		let state = stateMap[normalizedState] || deriveState(grade, stress)
		
		// Final safety check: ensure state matches Mongoose enum
		const validStates = ['optimal', 'monitor', 'burnout_risk', 'underperforming', 'at_risk', 'critical']
		if (!validStates.includes(state)) {
			state = deriveState(grade, stress)
		}

		const suggestions = await suggestSubjects(userId)

		const prediction = await Prediction.create({
			userId,
			mlPayload: payload,
			grade,
			stress,
			state,
			riskScore,
			suggestions,
			rawResponse: flaskResult,
		})

		return prediction
	} catch (err) {
		console.error(`[predictionService] Error for user ${userId}:`, err.message)
		throw err
	}
}

/**
 * Fallback BAM state derivation using the v2 rule set (6 states).
 * grade_class >= 2 → "High", < 2 → "Low"
 * stress_class: 0 = Low, 1 = Medium, 2 = High
 */
function deriveState(grade, stress) {
	const highGrade = grade >= 2

	if (highGrade && stress === 0) return 'optimal'
	if (highGrade && stress === 1) return 'monitor'
	if (highGrade && stress === 2) return 'burnout_risk'
	if (!highGrade && stress === 0) return 'underperforming'
	if (!highGrade && stress === 1) return 'at_risk'
	return 'critical'
}

module.exports = { runPrediction }
