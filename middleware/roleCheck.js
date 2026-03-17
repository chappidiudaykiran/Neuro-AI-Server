const roleCheck = (roles) => (req, res, next) => {
	const allowedRoles = Array.isArray(roles) ? roles : [roles]

	if (req.userRole === 'admin') {
		return next()
	}

	if (!allowedRoles.includes(req.userRole)) {
		return res.status(403).json({ message: 'Access denied. Insufficient permissions.' })
	}
	next()
}

module.exports = roleCheck
