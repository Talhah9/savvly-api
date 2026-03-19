const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { createCheckout, webhook, portal } = require('../controllers/payments.controller')

router.post('/checkout', authenticate, createCheckout)
router.post('/webhook', express.raw({ type: 'application/json' }), webhook)
router.get('/portal', authenticate, portal)

module.exports = router