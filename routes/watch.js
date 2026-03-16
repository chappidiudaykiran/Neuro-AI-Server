const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const { saveWatchTime } = require('../controllers/courseController')

router.post('/', verifyToken, saveWatchTime)

module.exports = router
