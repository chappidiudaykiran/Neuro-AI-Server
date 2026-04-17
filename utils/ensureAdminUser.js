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

	// ENSURE EDUCATOR USER
	const EDUCATOR_EMAIL = (process.env.EDUCATOR_EMAIL || 'educator@gmail.com').toLowerCase().trim()
	const EDUCATOR_PASSWORD = process.env.EDUCATOR_PASSWORD || 'educator@123'
	const EDUCATOR_ID = '222222222222222222222222'

	let educator = await User.findById(EDUCATOR_ID)
	if (!educator) {
		educator = await User.findOne({ email: EDUCATOR_EMAIL })
	}

	if (!educator) {
		await User.create({
			_id: EDUCATOR_ID,
			name: 'Educator',
			email: EDUCATOR_EMAIL,
			password: EDUCATOR_PASSWORD,
			role: 'educator'
		})
		console.log(`Educator user created: ${EDUCATOR_EMAIL}`)
	} else if (educator.role !== 'educator' || String(educator._id) !== EDUCATOR_ID) {
		// If email exists but ID or role is wrong, we might have a conflict.
		// For now, just ensure the role is correct if it's the right ID.
		if (String(educator._id) === EDUCATOR_ID && educator.role !== 'educator') {
			educator.role = 'educator'
			await educator.save()
			console.log(`Educator role updated for: ${EDUCATOR_EMAIL}`)
		}
	}
}

module.exports = ensureAdminUser
