const SubjectFeedback = require('../models/SubjectFeedback')

const suggestSubjects = async (userId) => {
	const feedbacks = await SubjectFeedback.find({ userId })
		.sort({ createdAt: -1 })

	const latestPerSubject = {}
	feedbacks.forEach((f) => {
		const key = f.subjectId?.toString()
		if (key && !latestPerSubject[key]) latestPerSubject[key] = f
	})

	const suggestions = []

	Object.values(latestPerSubject).forEach((f) => {
		const { subjectName, stressFelt, confidenceRating, completionPct, attemptCount } = f

		let action
		let message

		if (stressFelt >= 4 && confidenceRating <= 2) {
			action = 'take_break'
			message = `You seem overwhelmed with ${subjectName}. Step back and try easier topics first before returning.`
		} else if (completionPct < 50 && stressFelt <= 2) {
			action = 'focus_more'
			message = `You are calm with ${subjectName} but not completing videos. Dedicate more structured time to it.`
		} else if (stressFelt >= 4 && confidenceRating >= 4) {
			action = 'keep_going'
			message = `${subjectName} is tough but you are handling it well. Keep pushing - you are close to mastering it.`
		} else if (completionPct >= 80 && stressFelt <= 3) {
			action = 'on_track'
			message = `Great progress on ${subjectName}! You are on track - keep the consistency.`
		} else if ((attemptCount || 1) >= 3 && confidenceRating <= 2) {
			action = 'seek_help'
			message = `You have rewatched ${subjectName} multiple times but confidence is low. Consider asking your teacher.`
		} else {
			action = 'on_track'
			message = `You are making steady progress with ${subjectName}. Keep going!`
		}

		suggestions.push({ subject: subjectName || 'Unknown', action, message })
	})

	return suggestions
}

module.exports = suggestSubjects
