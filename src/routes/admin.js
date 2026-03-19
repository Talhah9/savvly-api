const router = require('express').Router()
const { authenticate, requireRole } = require('../middleware/auth')
const { getCandidatures, approveCandidature, rejectCandidature, getStats } = require('../controllers/admin.controller')

router.use(authenticate, requireRole('admin'))

router.get('/candidatures', getCandidatures)
router.patch('/candidatures/:id/approve', approveCandidature)
router.patch('/candidatures/:id/reject', rejectCandidature)
router.get('/stats', getStats)

module.exports = router