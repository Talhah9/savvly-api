const router = require('express').Router()
const { authenticate, requireRole } = require('../middleware/auth')
const {
  getCourses, createCourse, updateCourse, deleteCourse, publishCourse
} = require('../controllers/courses.controller')

router.get('/', getCourses)
router.post('/', authenticate, requireRole('trainer'), createCourse)
router.put('/:id', authenticate, requireRole('trainer'), updateCourse)
router.delete('/:id', authenticate, requireRole('trainer'), deleteCourse)
router.patch('/:id/publish', authenticate, requireRole('trainer'), publishCourse)

module.exports = router