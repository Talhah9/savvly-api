const router = require('express').Router()
const { authenticate, requireRole } = require('../middleware/auth')

router.use(authenticate, requireRole('admin'))
router.get('/candidatures', (req, res) => res.json({ todo: 'GET pending candidatures' }))
router.patch('/candidatures/:id/approve', (req, res) => res.json({ todo: 'PATCH approve trainer' }))
router.get('/stats', (req, res) => res.json({ todo: 'GET stats' }))

module.exports = router
