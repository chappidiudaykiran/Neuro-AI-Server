const mongoose = require('mongoose')

const QuestionSchema = new mongoose.Schema({
	question: { type: String, required: true },
	options: {
		type: [String],
		required: true,
		validate: [arr => arr.length === 4, 'Exactly 4 options required']
	},
	correctAnswer: { type: Number, required: true, min: 0, max: 3 }
}, { _id: false })

const AssignmentSchema = new mongoose.Schema({
	subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
	moduleNumber: { type: Number, required: true },
	questions: {
		type: [QuestionSchema],
		required: true,
		validate: [arr => arr.length >= 1 && arr.length <= 10, 'Between 1 and 10 questions required']
	}
}, { timestamps: true })

AssignmentSchema.index({ subjectId: 1, moduleNumber: 1 }, { unique: true })

module.exports = mongoose.model('Assignment', AssignmentSchema)
