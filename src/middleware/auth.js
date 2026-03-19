const jwt = require('jsonwebtoken')
const { errorResponse } = require('../utils/response')

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json(errorResponse('Token manquant'))
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json(errorResponse('Token invalide ou expiré'))
  }
}

const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role)
    return res.status(403).json(errorResponse('Accès interdit'))
  next()
}

module.exports = { authenticate, requireRole }
