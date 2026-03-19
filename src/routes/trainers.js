const router = require('express').Router()
const { authenticate, requireRole } = require('../middleware/auth')
const {
  getMe, updateMe, applyTrainer
} = require('../controllers/trainers.controller')

router.get('/me', authenticate, requireRole('trainer'), getMe)
router.put('/me', authenticate, requireRole('trainer'), updateMe)
router.post('/apply', applyTrainer)

module.exports = router