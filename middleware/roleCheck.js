const roleCheck = (role) => (req, res, next) => {
	if (req.userRole !== role) {
		return res.status(403).json({ message: 'Access denied. Insufficient permissions.' })
	}
	next()
}

module.exports = roleCheck
