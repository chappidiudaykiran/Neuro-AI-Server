const mongoose = require('mongoose')

const SuggestionSchema = new mongoose.Schema({
	subject: String,
	action: { type: String, enum: ['focus_more', 'take_break', 'on_track', 'seek_help', 'keep_going'] },
	message: String,
}, { _id: false })

const PredictionSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	mlPayload: { type: Object },
	grade: { type: Number, min: 0, max: 3 },
	stress: { type: Number, min: 0, max: 2 },
	state: { type: String, enum: ['optimal', 'burnout_risk', 'academic_gap', 'critical'] },
	suggestions: [SuggestionSchema],
}, { timestamps: true })

PredictionSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Prediction', PredictionSchema)
