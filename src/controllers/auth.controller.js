const bcrypt = require('bcryptjs')
const supabase = require('../config/supabase')
const { signToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt')
const { successResponse, errorResponse } = require('../utils/response')

const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body
    if (!email || !password || !full_name)
      return res.status(400).json(errorResponse('Champs manquants'))

    const { data: existing } = await supabase
      .from('trainers').select('id').eq('email', email).single()
    if (existing)
      return res.status(409).json(errorResponse('Email déjà utilisé'))

    const password_hash = await bcrypt.hash(password, 12)
    const slug = full_name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()

    const { data: trainer, error } = await supabase
      .from('trainers')
      .insert({ email, password_hash, full_name, slug })
      .select('id, email, full_name, slug, is_active')
      .single()

    if (error) throw error

    const token = signToken({ id: trainer.id, email: trainer.email, role: 'trainer' })
    const refresh = signRefreshToken({ id: trainer.id })

    res.status(201).json(successResponse({ trainer, token, refresh }, 'Compte créé'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json(errorResponse('Champs manquants'))

    const { data: trainer, error } = await supabase
      .from('trainers').select('*').eq('email', email).single()

    if (error || !trainer)
      return res.status(401).json(errorResponse('Email ou mot de passe incorrect'))

    const valid = await bcrypt.compare(password, trainer.password_hash)
    if (!valid)
      return res.status(401).json(errorResponse('Email ou mot de passe incorrect'))

    const token = signToken({ id: trainer.id, email: trainer.email, role: 'trainer' })
    const refresh = signRefreshToken({ id: trainer.id })

    const { password_hash, ...safeTrainer } = trainer
    res.json(successResponse({ trainer: safeTrainer, token, refresh }, 'Connecté'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const refresh = async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json(errorResponse('Token manquant'))

    const decoded = verifyRefreshToken(token)
    const { data: trainer } = await supabase
      .from('trainers').select('id, email').eq('id', decoded.id).single()

    if (!trainer) return res.status(401).json(errorResponse('Formateur introuvable'))

    const newToken = signToken({ id: trainer.id, email: trainer.email, role: 'trainer' })
    res.json(successResponse({ token: newToken }))
  } catch {
    res.status(401).json(errorResponse('Refresh token invalide ou expiré'))
  }
}

const me = async (req, res) => {
  const { data: trainer } = await supabase
    .from('trainers')
    .select('id, email, full_name, slug, avatar_url, bio, is_active, rating, review_count')
    .eq('id', req.user.id)
    .single()

  res.json(successResponse({ trainer }))
}

module.exports = { register, login, refresh, me } 