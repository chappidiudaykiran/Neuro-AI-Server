const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const { predict } = require('../controllers/predictController')

router.post('/predict', verifyToken, predict)

module.exports = router
