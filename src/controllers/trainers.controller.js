const supabase = require('../config/supabase')
const { successResponse, errorResponse } = require('../utils/response')

const getMe = async (req, res) => {
  try {
    const { data: trainer, error } = await supabase
      .from('trainers')
      .select('id, email, full_name, slug, avatar_url, cover_url, bio, speciality, hourly_rate, rating, review_count, is_active, created_at')
      .eq('id', req.user.id)
      .single()

    if (error || !trainer)
      return res.status(404).json(errorResponse('Formateur introuvable'))

    res.json(successResponse({ trainer }))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const updateMe = async (req, res) => {
  try {
    const { full_name, bio, speciality, hourly_rate, avatar_url, cover_url } = req.body

    const updates = {}
    if (full_name !== undefined) updates.full_name = full_name
    if (bio !== undefined) updates.bio = bio
    if (speciality !== undefined) updates.speciality = speciality
    if (hourly_rate !== undefined) updates.hourly_rate = hourly_rate
    if (avatar_url !== undefined) updates.avatar_url = avatar_url
    if (cover_url !== undefined) updates.cover_url = cover_url

    if (Object.keys(updates).length === 0)
      return res.status(400).json(errorResponse('Aucun champ à mettre à jour'))

    const { data: trainer, error } = await supabase
      .from('trainers')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, email, full_name, slug, avatar_url, cover_url, bio, speciality, hourly_rate, is_active')
      .single()

    if (error) throw error

    res.json(successResponse({ trainer }, 'Profil mis à jour'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const applyTrainer = async (req, res) => {
  try {
    const { full_name, email, speciality, experience, linkedin_url } = req.body

    if (!full_name || !email)
      return res.status(400).json(errorResponse('Champs manquants'))

    const { data, error } = await supabase
      .from('candidatures')
      .insert({ full_name, email, speciality, experience, linkedin_url })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(successResponse({ candidature: data }, 'Candidature envoyée'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

module.exports = { getMe, updateMe, applyTrainer }