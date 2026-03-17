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

		   let userRole = 'student';
		   if (email === 'test@gmail.com' && password === 'test@123') {
			   userRole = 'admin';
		   }
		   if (role === 'admin' && userRole !== 'admin') {
			   return res.status(403).json({ message: 'You cannot register as admin.' })
		   }

		   const user = await User.create({
			   name,
			   email,
			   password,
			   role: userRole,
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
		   // Only allow admin login for test@gmail.com/test@123
		   if (user.role === 'admin') {
			   if (!(email === 'test@gmail.com' && password === 'test@123')) {
				   return res.status(403).json({ message: 'Only test@gmail.com can login as admin.' })
			   }
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
		const safeRole = role === 'educator' ? 'educator' : 'student'

		if (!user) {
			user = await User.create({
				name: payload.name || 'Google User',
				email,
				password: `google_${crypto.randomUUID()}`,
				role: safeRole,
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

exports.changePassword = async (req, res, next) => {
	try {
		const { currentPassword, newPassword } = req.body

		if (!currentPassword || !newPassword) {
			return res.status(400).json({ message: 'Current password and new password are required.' })
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ message: 'New password must be at least 6 characters.' })
		}

		const user = await User.findById(req.userId)
		if (!user) {
			return res.status(404).json({ message: 'User not found.' })
		}

		const isMatch = await user.matchPassword(currentPassword)
		if (!isMatch) {
			return res.status(401).json({ message: 'Current password is incorrect.' })
		}

		user.password = newPassword
		await user.save()

		res.json({ message: 'Password changed successfully.' })
	} catch (err) {
		next(err)
	}
}

exports.updateProfile = async (req, res, next) => {
	try {
		const {
			name,
			age,
			gender,
			learningStyle,
			attendancePercent,
			usesExtraResources,
			extracurricular,
		} = req.body

		if (!name || !String(name).trim()) {
			return res.status(400).json({ message: 'Name is required.' })
		}

		const user = await User.findById(req.userId)
		if (!user) {
			return res.status(404).json({ message: 'User not found.' })
		}

		user.name = String(name).trim()
		if (age !== undefined) user.age = toNumber(age, user.age)
		if (gender !== undefined) user.gender = toNumber(gender, user.gender)
		if (learningStyle !== undefined) user.learningStyle = toNumber(learningStyle, user.learningStyle)
		if (attendancePercent !== undefined) user.attendancePercent = toNumber(attendancePercent, user.attendancePercent)
		if (usesExtraResources !== undefined) user.usesExtraResources = toBoolean(usesExtraResources)
		if (extracurricular !== undefined) user.extracurricular = toBoolean(extracurricular)

		await user.save()

		res.json({
			message: 'Profile updated successfully.',
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				age: user.age,
				gender: user.gender,
				learningStyle: user.learningStyle,
				attendancePercent: user.attendancePercent,
				usesExtraResources: user.usesExtraResources,
				extracurricular: user.extracurricular,
			},
		})
	} catch (err) {
		next(err)
	}
}
