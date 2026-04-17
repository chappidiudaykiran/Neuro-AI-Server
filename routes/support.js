const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const { 
  createTicket, 
  getTickets, 
  getSupportSummary,
  replyToTicket, 
  resolveTicket 
} = require('../controllers/supportController');

router.post('/', verifyToken, createTicket);
router.get('/', verifyToken, getTickets);
router.get('/summary', verifyToken, getSupportSummary);
router.post('/:id/reply', verifyToken, replyToTicket);
router.patch('/:id/resolve', verifyToken, resolveTicket);

module.exports = router;
