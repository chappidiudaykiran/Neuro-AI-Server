const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const { predict, getPreview, getResults } = require('../controllers/predictController')

router.post('/predict', verifyToken, predict)
router.get('/preview', verifyToken, getPreview)

module.exports = router
