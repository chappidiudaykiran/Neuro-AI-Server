const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')

const signToken = (user) =>
	jwt.sign(
		{ id: user._id, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
	)

const toNumber = (value, fallback) => {
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : fallback
}

const toBoolean = (value) => value === true || value === 'true' || value === 1 || value === '1'

exports.register = async (req, res, next) => {
	try {
		const {
			name,
			email,
			password,
			role,
			age,
			gender,
			learningStyle,
			attendancePercent,
			usesExtraResources,
			extracurricular,
		} = req.body

		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Name, email and password are required.' })
		}

		const exists = await User.findOne({ email })
		if (exists) {
			return res.status(400).json({ message: 'Email already registered.' })
		}

		const user = await User.create({
			name,
			email,
			password,
			role: role || 'student',
			age: Number(age) || 20,
			gender: Number(gender) ?? 1,
			learningStyle: Number(learningStyle) ?? 0,
			attendancePercent: Number(attendancePercent) || 80,
			usesExtraResources: Boolean(usesExtraResources),
			extracurricular: Boolean(extracurricular),
		})

		const token = signToken(user)

		res.status(201).json({
			token,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		})
	} catch (err) {
		next(err)
	}
}

exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body
		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required.' })
		}

		const user = await User.findOne({ email })
		if (!user || !(await user.matchPassword(password))) {
			return res.status(401).json({ message: 'Invalid email or password.' })
		}

		const token = signToken(user)

		res.json({
			token,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		})
	} catch (err) {
		next(err)
	}
}

exports.googleAuth = async (req, res, next) => {
	try {
		const {
			credential,
			role,
			age,
			gender,
			learningStyle,
			attendancePercent,
			usesExtraResources,
			extracurricular,
		} = req.body

		if (!credential) {
			return res.status(400).json({ message: 'Google credential is required.' })
		}

		if (!process.env.GOOGLE_CLIENT_ID) {
			return res.status(500).json({ message: 'Google auth is not configured on server.' })
		}

		const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

		const ticket = await googleClient.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID,
		})

		const payload = ticket.getPayload()
		if (!payload?.email || payload.email_verified !== true) {
			return res.status(401).json({ message: 'Google account email is not verified.' })
		}

		const email = payload.email.toLowerCase().trim()
		let user = await User.findOne({ email })

		if (!user) {
			user = await User.create({
				name: payload.name || 'Google User',
				email,
				password: `google_${crypto.randomUUID()}`,
				role: role || 'student',
				age: toNumber(age, 20),
				gender: toNumber(gender, 1),
				learningStyle: toNumber(learningStyle, 0),
				attendancePercent: toNumber(attendancePercent, 80),
				usesExtraResources: toBoolean(usesExtraResources),
				extracurricular: toBoolean(extracurricular),
			})
		}

		const token = signToken(user)

		res.json({
			token,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		})
	} catch (err) {
		next(err)
	}
}
