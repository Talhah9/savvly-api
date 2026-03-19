const router = require('express').Router()
const { authenticate } = require('../middleware/auth')

router.get('/:id', authenticate, (req, res) => res.json({ todo: 'GET booking' }))
router.post('/', authenticate, (req, res) => res.json({ todo: 'POST create booking' }))
router.patch('/:id/accept', authenticate, (req, res) => res.json({ todo: 'PATCH accept booking' }))
router.patch('/:id/cancel', authenticate, (req, res) => res.json({ todo: 'PATCH cancel booking' }))

module.exports = router
