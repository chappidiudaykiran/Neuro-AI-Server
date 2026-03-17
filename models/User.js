const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	password: { type: String, required: true, minlength: 6 },
	role: { type: String, enum: ['student', 'admin'], default: 'student' },
	age: { type: Number, default: 20 },
	gender: { type: Number, enum: [0, 1], default: 1 },
	learningStyle: { type: Number, enum: [0, 1, 2], default: 0 },
	attendancePercent: { type: Number, default: 80, min: 0, max: 100 },
	usesExtraResources: { type: Boolean, default: false },
	extracurricular: { type: Boolean, default: false },
}, { timestamps: true })

UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next()
	this.password = await bcrypt.hash(this.password, 10)
	next()
})

UserSchema.methods.matchPassword = function (plain) {
	return bcrypt.compare(plain, this.password)
}

module.exports = mongoose.model('User', UserSchema)
