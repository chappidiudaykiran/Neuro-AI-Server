const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const { submitAssignment, getMySubmissions, getAllMySubmissions } = require('../controllers/assignmentController')

router.post('/submit', verifyToken, submitAssignment)
router.get('/my-submissions', verifyToken, getAllMySubmissions)
router.get('/subject/:subjectId', verifyToken, getMySubmissions)

module.exports = router
