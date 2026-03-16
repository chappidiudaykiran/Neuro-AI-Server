const mongoose = require('mongoose')

const VideoSchema = new mongoose.Schema({
	title: { type: String, required: true },
	youtubeId: { type: String, required: true },
	duration: { type: Number, default: 0 },
}, { _id: false })

const SubjectSchema = new mongoose.Schema({
	name: { type: String, required: true },
	shortName: { type: String, required: true },
	description: { type: String, default: '' },
	category: { type: String, enum: ['GATE Prep', 'CS Core', 'Programming'], required: true },
	stressTag: { type: String, enum: ['high_stress', 'medium_stress', 'low_stress'], required: true },
	motivationBase: { type: Number, default: 3 },
	videos: [VideoSchema],
}, { timestamps: true })

module.exports = mongoose.model('Subject', SubjectSchema)
