const { errorResponse } = require('../utils/response')

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json(errorResponse('Données invalides', result.error.errors.map(e => e.message)))
  }
  req.validated = result.data
  next()
}

module.exports = { validate }
