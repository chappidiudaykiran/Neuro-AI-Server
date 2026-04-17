const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
	const authHeader = req.headers.authorization
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'No token provided. Please log in.' })
	}

	const token = authHeader.split(' ')[1]
	console.log('[AUTH] Token found:', token.substring(0, 10) + '...');
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		console.log('[AUTH] Decoded payload:', decoded);
		const userId = decoded.id || decoded._id || decoded.userId;
		const role = decoded.role || decoded.userRole || decoded.role;
		
		req.userId = userId;
		req.userRole = role;
		req.user = { id: userId, role: role };
		next()
	} catch {
		return res.status(401).json({ message: 'Token expired or invalid. Please log in again.' })
	}
}

module.exports = verifyToken
