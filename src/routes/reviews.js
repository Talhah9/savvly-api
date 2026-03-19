const router = require('express').Router()
const { authenticate } = require('../middleware/auth')

router.post('/', authenticate, (req, res) => res.json({ todo: 'POST submit review' }))
router.get('/trainer/:trainerId', (req, res) => res.json({ todo: 'GET reviews by trainer' }))

module.exports = router
