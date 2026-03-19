const router = require('express').Router()
const { authenticate, requireRole } = require('../middleware/auth')

router.get('/', (req, res) => res.json({ todo: 'GET all published courses' }))
router.post('/', authenticate, requireRole('trainer'), (req, res) => res.json({ todo: 'POST create course' }))
router.put('/:id', authenticate, requireRole('trainer'), (req, res) => res.json({ todo: 'PUT update course' }))
router.delete('/:id', authenticate, requireRole('trainer'), (req, res) => res.json({ todo: 'DELETE course' }))
router.patch('/:id/publish', authenticate, requireRole('trainer'), (req, res) => res.json({ todo: 'PATCH publish course' }))

module.exports = router
