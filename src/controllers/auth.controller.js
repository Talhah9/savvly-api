const { successResponse } = require('../utils/response')

const register = async (req, res) => res.json({ todo: 'register trainer' })
const login    = async (req, res) => res.json({ todo: 'login trainer' })
const refresh  = async (req, res) => res.json({ todo: 'refresh token' })
const me       = async (req, res) => res.json(successResponse({ user: req.user }))

module.exports = { register, login, refresh, me }
