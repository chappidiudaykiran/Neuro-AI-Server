const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const { submitFeedback, getMyFeedback } = require('../controllers/feedbackController')

router.post('/', verifyToken, submitFeedback)
router.get('/my', verifyToken, getMyFeedback)

module.exports = router
