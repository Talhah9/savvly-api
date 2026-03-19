const router = require('express').Router()
const { authenticate } = require('../middleware/auth')
const { getBooking, createBooking, acceptBooking, cancelBooking } = require('../controllers/bookings.controller')

router.get('/:id', authenticate, getBooking)
router.post('/', createBooking)
router.patch('/:id/accept', authenticate, acceptBooking)
router.patch('/:id/cancel', authenticate, cancelBooking)

module.exports = router