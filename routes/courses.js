const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const { getCourses, getCourseById, createSubject } = require('../controllers/courseController')

router.get('/', verifyToken, getCourses)
router.get('/:id', verifyToken, getCourseById)
router.post('/', verifyToken, createSubject)

module.exports = router
