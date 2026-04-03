const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const roleCheck = require('../middleware/roleCheck')
const {
	submitAssignment,
	getMySubmissions,
	getAllMySubmissions,
	getCustomAssignment,
	getAdminAssignments,
	upsertAssignment,
	deleteAssignment
} = require('../controllers/assignmentController')

// Student routes
router.post('/submit', verifyToken, submitAssignment)
router.get('/my-submissions', verifyToken, getAllMySubmissions)
router.get('/subject/:subjectId', verifyToken, getMySubmissions)

// Public: fetch custom assignment for quiz
router.get('/custom/:subjectId/:moduleNumber', verifyToken, getCustomAssignment)

// Admin routes
router.get('/admin/:subjectId', verifyToken, roleCheck(['admin', 'educator']), getAdminAssignments)
router.post('/admin', verifyToken, roleCheck(['admin', 'educator']), upsertAssignment)
router.delete('/admin/:id', verifyToken, roleCheck(['admin', 'educator']), deleteAssignment)

module.exports = router
