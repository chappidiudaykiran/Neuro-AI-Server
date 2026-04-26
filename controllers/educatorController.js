const User = require('../models/User')
const Prediction = require('../models/Prediction')

exports.getStudents = async (req, res, next) => {
	try {

		   // Only allow admin to access this endpoint
		   if (req.userRole !== 'admin' && req.userRole !== 'educator') {
			   return res.status(403).json({ message: 'Access denied.' })
		   }
		   		const students = await User.find({ role: 'student' })
			.select('name email age gender learningStyle attendancePercent usesExtraResources extracurricular createdAt photo')
			.lean()

		const enriched = await Promise.all(
			students.map(async (student) => {
				const latestPrediction = await Prediction.findOne({ userId: student._id })
					.sort({ createdAt: -1 })
					.lean()
				return { ...student, latestPrediction }
			})
		)

		const stateOrder = { critical: 0, burnout_risk: 1, academic_gap: 2, optimal: 3 }
		enriched.sort((a, b) => {
			const aOrder = a.latestPrediction ? (stateOrder[a.latestPrediction.state] ?? 4) : 5
			const bOrder = b.latestPrediction ? (stateOrder[b.latestPrediction.state] ?? 4) : 5
			return aOrder - bOrder
		})

		res.json(enriched)
	} catch (err) {
		next(err)
	}
}
