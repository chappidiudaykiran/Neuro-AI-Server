const User = require('../models/User')

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'test@gmail.com').toLowerCase().trim()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'test@123'
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Admin'

const ensureAdminUser = async () => {
	let user = await User.findOne({ email: ADMIN_EMAIL })

	if (!user) {
		await User.create({
			name: ADMIN_NAME,
			email: ADMIN_EMAIL,
			password: ADMIN_PASSWORD,
			role: 'admin',
		})
		console.log(`Admin user created: ${ADMIN_EMAIL}`)
		return
	}

	let updated = false
	if (user.role !== 'admin') {
		user.role = 'admin'
		updated = true
	}

	if (!user.name || !String(user.name).trim()) {
		user.name = ADMIN_NAME
		updated = true
	}

	const passwordMatches = await user.matchPassword(ADMIN_PASSWORD)
	if (!passwordMatches) {
		user.password = ADMIN_PASSWORD
		updated = true
	}

	if (updated) {
		await user.save()
		console.log(`Admin user updated: ${ADMIN_EMAIL}`)
	}
}

module.exports = ensureAdminUser
