const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const { getCourses, getCourseById } = require('../controllers/courseController')

router.get('/', verifyToken, getCourses)
router.get('/:id', verifyToken, getCourseById)

module.exports = router
