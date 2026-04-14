const SubjectFeedback = require('../models/SubjectFeedback')
const AssignmentSubmission = require('../models/AssignmentSubmission')
const User = require('../models/User')
const { calculateStudentSubjectGrades } = require('../subject_grading/calculateGrade')

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

	// 3. New Performance Features - Using the official Subject Grading Service
	const subjectGrades = await calculateStudentSubjectGrades(userId)
	
	// Average grade across all enrolled subjects
	const avgCalculatedGrade = subjectGrades.length > 0
		? subjectGrades.reduce((sum, g) => sum + g.calculatedGrade, 0) / subjectGrades.length
		: 75 // Default 75 if no work done yet

	const assignments = await AssignmentSubmission.find({ userId })
	const AssignmentsCompleted = assignments.length
	
	const ExamScore = avgCalculatedGrade
	
	const Participation = Attendance >= 80 ? 1 : 0
	const InternetQuality = 1

	const payload = {
		Age,
		Gender,
		LearningStyle,
		StudyHours: Number(StudyHours.toFixed(1)),
		Attendance: Number(Attendance.toFixed(1)),
		OnlineCourses,
		Discussions,
		Internet,
		InternetQuality,
		AssignmentsCompleted,
		ExamScore: Number(ExamScore.toFixed(1)),
		Participation
	}

	return payload
}

module.exports = buildMLPayload
