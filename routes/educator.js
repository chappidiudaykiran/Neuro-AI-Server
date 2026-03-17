const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const roleCheck = require('../middleware/roleCheck')
const { getStudents } = require('../controllers/educatorController')

router.get('/students', verifyToken, roleCheck(['admin']), getStudents)

module.exports = router
