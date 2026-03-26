const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const { register, login, googleAuth, changePassword, updateProfile, toggleSubject } = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
router.post('/google', googleAuth)
router.post('/change-password', verifyToken, changePassword)
router.put('/profile', verifyToken, updateProfile)
router.post('/toggle-subject/:subjectId', verifyToken, toggleSubject)

module.exports = router
