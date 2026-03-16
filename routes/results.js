const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const { getResults } = require('../controllers/predictController')

router.get('/', verifyToken, getResults)

module.exports = router
