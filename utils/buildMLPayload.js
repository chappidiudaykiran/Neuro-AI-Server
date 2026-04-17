const SubjectFeedback = require('../models/SubjectFeedback')
const AssignmentSubmission = require('../models/AssignmentSubmission')
const User = require('../models/User')

/**
 * Builds the 8-feature payload required by the Student Performance Inference API v1.0.0.
 * All engineered features (Engagement, Consistency, etc.) are computed server-side by the ML API.
 */
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

	// 1. StudyHours — average daily study time from watch minutes (last 7 days)
	const totalWatchMinutes = recentFeedbacks.reduce((sum, f) => sum + (f.watchMinutes || 0), 0)
	const StudyHours = Number((totalWatchMinutes / 60).toFixed(1))

	// 2. Attendance — from user profile
	const Attendance = Number((user.attendancePercent ?? 80).toFixed(1))

	// 3. Resources — learning resource usage score
	const Resources = user.usesExtraResources ? 5.0 : 2.0

	// 4. OnlineCourses — number of enrolled subjects
	const OnlineCourses = enrolledIds.length || 0

	// 5. Discussions — forum/discussion participation score
	const discussionCount = recentFeedbacks.filter(f => f.discussionJoined).length
	const Discussions = Math.min(discussionCount + (user.extracurricular ? 1 : 0), 10)

	// 6. AssignmentCompletion — percentage of assignments completed
	const allAssignments = await AssignmentSubmission.find({ userId })
	const totalPossible = enrolledIds.length * 5 // estimate ~5 assignments per subject
	const AssignmentCompletion = totalPossible > 0
		? Number(Math.min((allAssignments.length / totalPossible) * 100, 100).toFixed(1))
		: 0.0

	// 7. EduTech — educational technology usage score
	const EduTech = recentFeedbacks.length > 0 ? Math.min(recentFeedbacks.length, 10) : 3.0

	// 8. Extracurricular — involvement score
	const Extracurricular = user.extracurricular ? 3.0 : 1.0

	const payload = {
		StudyHours,
		Attendance,
		Resources,
		OnlineCourses,
		Discussions,
		AssignmentCompletion,
		EduTech,
		Extracurricular
	}

	return payload
}

module.exports = buildMLPayload
