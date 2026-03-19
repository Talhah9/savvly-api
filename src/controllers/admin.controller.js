const supabase = require('../config/supabase')
const { successResponse, errorResponse } = require('../utils/response')

const getCandidatures = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('candidatures')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(successResponse({ candidatures: data }))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const approveCandidature = async (req, res) => {
  try {
    const { id } = req.params

    // 1. Récupère la candidature
    const { data: candidature, error: cErr } = await supabase
      .from('candidatures')
      .select('*')
      .eq('id', id)
      .single()

    if (cErr || !candidature)
      return res.status(404).json(errorResponse('Candidature introuvable'))

    // 2. Met à jour le statut candidature
    await supabase
      .from('candidatures')
      .update({ status: 'approved' })
      .eq('id', id)

    // 3. Active le formateur en BDD si son compte existe
    const { data: trainer } = await supabase
      .from('trainers')
      .select('id')
      .eq('email', candidature.email)
      .single()

    if (trainer) {
      await supabase
        .from('trainers')
        .update({ is_active: true })
        .eq('id', trainer.id)
    }

    res.json(successResponse({ candidature, trainer: trainer || null }, 'Candidature approuvée'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const rejectCandidature = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('candidatures')
      .update({ status: 'rejected' })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(successResponse({ candidature: data }, 'Candidature rejetée'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const getStats = async (req, res) => {
  try {
    const [trainers, courses, bookings, candidatures] = await Promise.all([
      supabase.from('trainers').select('id', { count: 'exact' }),
      supabase.from('courses').select('id', { count: 'exact' }),
      supabase.from('bookings').select('id', { count: 'exact' }),
      supabase.from('candidatures').select('id', { count: 'exact' }).eq('status', 'pending')
    ])

    res.json(successResponse({
      trainers: trainers.count || 0,
      courses: courses.count || 0,
      bookings: bookings.count || 0,
      pending_candidatures: candidatures.count || 0
    }))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

module.exports = { getCandidatures, approveCandidature, rejectCandidature, getStats }