const Subject = require('../models/Subject')
const SubjectFeedback = require('../models/SubjectFeedback')
const User = require('../models/User')

exports.getCourses = async (req, res, next) => {
	try {
		const courses = await Subject.find().select('-__v')
		res.json(courses)
	} catch (err) {
		next(err)
	}
}

exports.getCategoriesSummary = async (req, res, next) => {
    try {
        const summary = await Subject.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $project: { category: "$_id", count: 1, _id: 0 } },
            { $sort: { category: 1 } }
        ])
        res.json(summary)
    } catch (err) {
        next(err)
    }
}

exports.getCoursesByCategory = async (req, res, next) => {
    try {
        const { categorySlug } = req.params;
        const slugToCat = {
            'cs-core': 'CS Core',
            'gate-prep': 'GATE Prep',
            'programming': 'Programming',
        }
        const decodedCategory = slugToCat[categorySlug] || categorySlug.replace(/-/g, ' ')
        
        const courses = await Subject.find({ category: new RegExp(`^${decodedCategory}$`, 'i') }).select('-__v')
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

exports.getMySubjects = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate('selectedSubjects', '-__v')
        if (!user) return res.status(404).json({ message: 'User not found' })
        
        res.json(user.selectedSubjects || [])
    } catch (err) {
        next(err)
    }
}

exports.createSubject = async (req, res, next) => {
	try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can perform this action' })
        }
		const { name, shortName, description, category, videos } = req.body

		if (!name || !shortName || !description || !category) {
			return res.status(400).json({ message: 'All required fields must be provided' })
		}
        
        const subject = await Subject.create({
            name, shortName, description, category, videos: videos || [],
            stressTag: 'medium_stress', // default
            motivationBase: 3 // default
        })

		res.status(201).json({ message: 'Subject created successfully', subject })
	} catch (err) {
		next(err)
	}
}

exports.updateSubject = async (req, res, next) => {
	try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can perform this action' })
        }
		const { name, shortName, description, category, videos } = req.body

		const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            { name, shortName, description, category, videos: videos || [] },
            { new: true, runValidators: true }
        )
        if (!subject) return res.status(404).json({ message: 'Subject not found' })

		res.json({ message: 'Subject updated successfully', subject })
	} catch (err) {
		next(err)
	}
}

exports.deleteSubject = async (req, res, next) => {
	try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can perform this action' })
        }
		const subject = await Subject.findByIdAndDelete(req.params.id)
        if (!subject) return res.status(404).json({ message: 'Subject not found' })

		res.json({ message: 'Subject deleted successfully' })
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
