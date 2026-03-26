const mongoose = require('mongoose')

const AssignmentSubmissionSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
	moduleNumber: { type: Number, required: true },
	content: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('AssignmentSubmission', AssignmentSubmissionSchema)
