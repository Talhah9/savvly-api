const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')

router.post('/checkout', authenticate, (req, res) => res.json({ todo: 'POST Stripe checkout' }))
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => res.json({ todo: 'POST Stripe webhook' }))
router.get('/portal', authenticate, (req, res) => res.json({ todo: 'GET Stripe portal' }))

module.exports = router
