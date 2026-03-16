const Subject = require('../models/Subject')
const SubjectFeedback = require('../models/SubjectFeedback')

exports.getCourses = async (req, res, next) => {
	try {
		const courses = await Subject.find().select('-__v')
		res.json(courses)
	} catch (err) {
		next(err)
	}
}

exports.getCourseById = async (req, res, next) => {
	try {
		const course = await Subject.findById(req.params.id)
		if (!course) {
			return res.status(404).json({ message: 'Course not found.' })
		}
		res.json(course)
	} catch (err) {
		next(err)
	}
}

exports.saveWatchTime = async (req, res, next) => {
	try {
		const { subjectId, watchMinutes, completionPct } = req.body

		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const existing = await SubjectFeedback.findOne({
			userId: req.userId,
			subjectId,
			createdAt: { $gte: today },
		})

		if (existing) {
			existing.watchMinutes = (existing.watchMinutes || 0) + (watchMinutes || 0)
			existing.completionPct = Math.max(existing.completionPct || 0, completionPct || 0)
			existing.attemptCount = (existing.attemptCount || 1) + 1
			await existing.save()
			return res.json({ message: 'Watch time updated.', feedback: existing })
		}

		const subject = await Subject.findById(subjectId)

		const feedback = await SubjectFeedback.create({
			userId: req.userId,
			subjectId,
			subjectName: subject?.name,
			subjectTag: subject?.stressTag,
			watchMinutes: watchMinutes || 0,
			completionPct: completionPct || 0,
		})

		res.status(201).json({ message: 'Watch time saved.', feedback })
	} catch (err) {
		next(err)
	}
}
