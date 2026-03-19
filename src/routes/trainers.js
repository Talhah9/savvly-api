const router = require('express').Router()
const { authenticate, requireRole } = require('../middleware/auth')
const {
  getMe, updateMe, applyTrainer
} = require('../controllers/trainers.controller')

router.get('/me', authenticate, getMe)
router.put('/me', authenticate, updateMe)
router.post('/apply', applyTrainer)

module.exports = router