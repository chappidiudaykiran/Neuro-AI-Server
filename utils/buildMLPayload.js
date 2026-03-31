const SubjectFeedback = require('../models/SubjectFeedback')
const User = require('../models/User')

const buildMLPayload = async (userId) => {
	const user = await User.findById(userId)
	if (!user) throw new Error("User profile not found for the given ID. Session may be corrupted.")
	
	const sevenDaysAgo = new Date()
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

	const enrolledIds = user.selectedSubjects || []

	const recentFeedbacks = await SubjectFeedback.find({ 
		userId, 
		subjectId: { $in: enrolledIds },
		createdAt: { $gte: sevenDaysAgo } 
	})

	// 1. Demographics
	const Age = user.age || 20
	const Gender = user.gender ?? 1
	const LearningStyle = user.learningStyle ?? 0

	// 2. Telemetry
	const StudyHours = recentFeedbacks.reduce((sum, f) => sum + (f.watchMinutes || 0), 0) / 60
	const Attendance = user.attendancePercent ?? 80
	const OnlineCourses = user.selectedSubjects?.length || 0

	const Discussions = recentFeedbacks.some((f) => f.discussionJoined) ? 1 : (user.extracurricular ? 1 : 0)
	const Internet = 1

	const payload = {
		Age,
		Gender,
		LearningStyle,
		StudyHours: Number(StudyHours.toFixed(1)),
		Attendance: Number(Attendance.toFixed(1)),
		OnlineCourses,
		Discussions,
		Internet
	}

	return payload
}

module.exports = buildMLPayload
