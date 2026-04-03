const AssignmentSubmission = require('../models/AssignmentSubmission')
const Assignment = require('../models/Assignment')
const { runPrediction } = require('../utils/predictionService')

// ─── Student endpoints ───────────────────────────────────────

exports.submitAssignment = async (req, res, next) => {
	try {
		const { subjectId, moduleNumber, content, score, totalQuestions } = req.body

		if (!subjectId || !moduleNumber || !content) {
			return res.status(400).json({ message: 'Missing required assignment fields.' })
		}

		// Save or update existing submission for this specific module
		const submission = await AssignmentSubmission.findOneAndUpdate(
			{ userId: req.userId, subjectId, moduleNumber },
			{ content, score, totalQuestions },
			{ new: true, upsert: true }
		)

		// Trigger background prediction
		runPrediction(req.userId).catch(err => console.error('[Background Predict Error]:', err.message))

		res.status(200).json({ message: 'Assignment submitted successfully', submission })
	} catch (err) {
		next(err)
	}
}

exports.getMySubmissions = async (req, res, next) => {
	try {
        const { subjectId } = req.params
		const submissions = await AssignmentSubmission.find({ userId: req.userId, subjectId })
		res.status(200).json(submissions)
	} catch (err) {
		next(err)
	}
}

exports.getAllMySubmissions = async (req, res, next) => {
	try {
		const submissions = await AssignmentSubmission.find({ userId: req.userId })
		res.status(200).json(submissions)
	} catch (err) {
		next(err)
	}
}

// ─── Public: get custom assignment for quiz ──────────────────

exports.getCustomAssignment = async (req, res, next) => {
	try {
		const { subjectId, moduleNumber } = req.params
		const assignment = await Assignment.findOne({ subjectId, moduleNumber: Number(moduleNumber) })
		if (!assignment) {
			return res.status(404).json({ message: 'No custom assignment found.' })
		}
		res.json(assignment)
	} catch (err) {
		next(err)
	}
}

// ─── Admin endpoints ─────────────────────────────────────────

exports.getAdminAssignments = async (req, res, next) => {
	try {
		const { subjectId } = req.params
		const assignments = await Assignment.find({ subjectId }).sort({ moduleNumber: 1 })
		res.json(assignments)
	} catch (err) {
		next(err)
	}
}

exports.upsertAssignment = async (req, res, next) => {
	try {
		const { subjectId, moduleNumber, questions } = req.body

		if (!subjectId || !moduleNumber || !questions || !Array.isArray(questions)) {
			return res.status(400).json({ message: 'subjectId, moduleNumber, and questions are required.' })
		}

		if (questions.length < 1 || questions.length > 10) {
			return res.status(400).json({ message: 'Between 1 and 10 questions are required.' })
		}

		for (const q of questions) {
			if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || q.correctAnswer === undefined) {
				return res.status(400).json({ message: 'Each question needs question text, exactly 4 options, and a correctAnswer index (0-3).' })
			}
		}

		const assignment = await Assignment.findOneAndUpdate(
			{ subjectId, moduleNumber },
			{ questions },
			{ new: true, upsert: true, runValidators: true }
		)

		res.json({ message: 'Assignment saved successfully', assignment })
	} catch (err) {
		next(err)
	}
}

exports.deleteAssignment = async (req, res, next) => {
	try {
		const assignment = await Assignment.findByIdAndDelete(req.params.id)
		if (!assignment) {
			return res.status(404).json({ message: 'Assignment not found.' })
		}
		res.json({ message: 'Assignment deleted successfully.' })
	} catch (err) {
		next(err)
	}
}
