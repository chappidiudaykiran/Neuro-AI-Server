const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
	const authHeader = req.headers.authorization
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'No token provided. Please log in.' })
	}

	const token = authHeader.split(' ')[1]
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.userId = decoded.id
		req.userRole = decoded.role
		next()
	} catch {
		return res.status(401).json({ message: 'Token expired or invalid. Please log in again.' })
	}
}

module.exports = verifyToken
