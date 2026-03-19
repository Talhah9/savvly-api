const router = require('express').Router()
const { getProfile } = require('../controllers/profiles.controller')

router.get('/:slug', getProfile)

module.exports = router