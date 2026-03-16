const SubjectFeedback = require('../models/SubjectFeedback')
const User = require('../models/User')

const buildMLPayload = async (userId) => {
	const user = await User.findById(userId)
	const feedbacks = await SubjectFeedback.find({ userId })
		.sort({ createdAt: -1 })
		.limit(20)

	if (!user) throw new Error('User not found')

	const avg = (key) => {
		if (!feedbacks.length) return 0
		const vals = feedbacks.map((f) => f[key] || 0)
		return vals.reduce((s, v) => s + v, 0) / vals.length
	}

	const totalWatchHours = feedbacks.reduce((s, f) => s + (f.watchMinutes || 0), 0) / 60
	const avgCompletion = Math.round(avg('completionPct'))
	const motivation = avg('confidenceRating') >= 3 ? 1 : 0
	const discussions = feedbacks.some((f) => f.discussionJoined) ? 1 : 0
	const distinctSubjects = new Set(feedbacks.map((f) => f.subjectId?.toString())).size

	const payload = {
		StudyHours: Math.round(totalWatchHours),
		Attendance: user.attendancePercent || 80,
		Resources: user.usesExtraResources ? 1 : 0,
		Extracurricular: user.extracurricular ? 1 : 0,
		Motivation: motivation,
		Internet: 1,
		Gender: user.gender ?? 1,
		Age: user.age || 20,
		LearningStyle: user.learningStyle ?? 0,
		OnlineCourses: distinctSubjects,
		Discussions: discussions,
		AssignmentCompletion: avgCompletion,
		EduTech: 1,
	}

	return payload
}

module.exports = buildMLPayload
