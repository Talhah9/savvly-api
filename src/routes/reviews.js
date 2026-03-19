const router = require('express').Router()
const { authenticate } = require('../middleware/auth')
const { submitReview, getTrainerReviews } = require('../controllers/reviews.controller')

router.post('/', authenticate, submitReview)
router.get('/trainer/:trainerId', getTrainerReviews)

module.exports = router