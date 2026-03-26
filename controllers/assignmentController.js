const AssignmentSubmission = require('../models/AssignmentSubmission')

exports.submitAssignment = async (req, res, next) => {
	try {
		const { subjectId, moduleNumber, content } = req.body

		if (!subjectId || !moduleNumber || !content) {
			return res.status(400).json({ message: 'Missing required assignment fields.' })
		}

		// Save or update existing submission for this specific module
		const submission = await AssignmentSubmission.findOneAndUpdate(
			{ userId: req.userId, subjectId, moduleNumber },
			{ content },
			{ new: true, upsert: true }
		)

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
