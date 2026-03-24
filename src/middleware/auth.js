const jwt = require('jsonwebtoken')
const { errorResponse } = require('../utils/response')

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null

  if (!token) {
    return res.status(401).json(errorResponse('Token manquant'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    console.log('JWT DECODED =>', decoded)

    // Normalisation SAFE
    req.user = {
      id: decoded.id || decoded.userId || decoded.sub || decoded.user?.id || null,
      role: decoded.role || decoded.user?.role || null,
      email: decoded.email || decoded.user?.email || null,
      raw: decoded
    }

    if (!req.user.id) {
      return res.status(401).json(errorResponse('ID utilisateur introuvable dans le token'))
    }

    next()
  } catch (err) {
    console.error('JWT ERROR =>', err)
    return res.status(401).json(errorResponse('Token invalide ou expiré'))
  }
}

const requireRole = (role) => (req, res, next) => {
  console.log('ROLE CHECK =>', req.user?.role)

  if (req.user?.role !== role) {
    return res.status(403).json(errorResponse('Accès interdit'))
  }

  next()
}

module.exports = { authenticate, requireRole }