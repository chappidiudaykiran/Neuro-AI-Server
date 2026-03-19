const mongoose = require('mongoose')

const SubjectFeedbackSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
	subjectName: { type: String },
	subjectTag: { type: String, enum: ['high_stress', 'medium_stress', 'low_stress'] },
	difficultyRating: { type: Number, min: 1, max: 5 },
	stressFelt: { type: Number, min: 1, max: 5 },
	confidenceRating: { type: Number, min: 1, max: 5 },
	enjoyedSubject: { type: Boolean },
	feedbackText: { type: String },
	watchMinutes: { type: Number, default: 0 },
	completionPct: { type: Number, default: 0, min: 0, max: 100 },
	attemptCount: { type: Number, default: 1 },
	discussionJoined: { type: Boolean, default: false },
}, { timestamps: true })

SubjectFeedbackSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('SubjectFeedback', SubjectFeedbackSchema)
