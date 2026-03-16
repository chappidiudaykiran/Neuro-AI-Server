const SubjectFeedback = require('../models/SubjectFeedback')
const Subject = require('../models/Subject')

exports.submitFeedback = async (req, res, next) => {
	try {
		const {
			subjectId,
			subjectName,
			subjectTag,
			difficultyRating,
			stressFelt,
			confidenceRating,
			enjoyedSubject,
			watchMinutes,
			completionPct,
		} = req.body

		if (!subjectId || !difficultyRating || !stressFelt || !confidenceRating) {
			return res.status(400).json({ message: 'subjectId and all ratings are required.' })
		}

		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const existing = await SubjectFeedback.findOne({
			userId: req.userId,
			subjectId,
			createdAt: { $gte: today },
		})

		if (existing) {
			Object.assign(existing, {
				difficultyRating,
				stressFelt,
				confidenceRating,
				enjoyedSubject,
				watchMinutes: (existing.watchMinutes || 0) + (watchMinutes || 0),
				completionPct: Math.max(existing.completionPct || 0, completionPct || 0),
				attemptCount: (existing.attemptCount || 1) + 1,
			})
			await existing.save()
			return res.json({ message: 'Feedback updated.', feedback: existing })
		}

		let tag = subjectTag
		if (!tag) {
			const subject = await Subject.findById(subjectId)
			tag = subject?.stressTag
		}

		const feedback = await SubjectFeedback.create({
			userId: req.userId,
			subjectId,
			subjectName,
			subjectTag: tag,
			difficultyRating,
			stressFelt,
			confidenceRating,
			enjoyedSubject,
			watchMinutes: watchMinutes || 0,
			completionPct: completionPct || 0,
		})

		res.status(201).json({ message: 'Feedback saved.', feedback })
	} catch (err) {
		next(err)
	}
}

exports.getMyFeedback = async (req, res, next) => {
	try {
		const feedbacks = await SubjectFeedback.find({ userId: req.userId })
			.sort({ createdAt: -1 })
			.limit(50)
		res.json(feedbacks)
	} catch (err) {
		next(err)
	}
}
