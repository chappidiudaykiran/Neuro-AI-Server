const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const { getCourses, getCategoriesSummary, getCoursesByCategory, getCourseById, createSubject, updateSubject, deleteSubject } = require('../controllers/courseController')

router.get('/summary', verifyToken, getCategoriesSummary)
router.get('/category/:categorySlug', verifyToken, getCoursesByCategory)
router.get('/', verifyToken, getCourses)
router.get('/:id', verifyToken, getCourseById)
router.post('/', verifyToken, createSubject)
router.put('/:id', verifyToken, updateSubject)
router.delete('/:id', verifyToken, deleteSubject)

module.exports = router
