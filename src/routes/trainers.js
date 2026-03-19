const router = require('express').Router()
const { authenticate, requireRole } = require('../middleware/auth')

router.get('/me', authenticate, requireRole('trainer'), (req, res) => res.json({ todo: 'GET trainer profile' }))
router.put('/me', authenticate, requireRole('trainer'), (req, res) => res.json({ todo: 'PUT trainer profile' }))
router.post('/apply', (req, res) => res.json({ todo: 'POST candidature formateur' }))

module.exports = router
