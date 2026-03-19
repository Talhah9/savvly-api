const router = require('express').Router()
router.get('/:slug', (req, res) => res.json({ todo: 'GET public trainer profile' }))
module.exports = router
