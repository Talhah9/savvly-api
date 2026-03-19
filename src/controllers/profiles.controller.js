const supabase = require('../config/supabase')
const { successResponse, errorResponse } = require('../utils/response')

const getProfile = async (req, res) => {
  try {
    const { data: trainer, error } = await supabase
      .from('trainers')
      .select('id, full_name, slug, avatar_url, cover_url, bio, speciality, hourly_rate, rating, review_count, is_active')
      .eq('slug', req.params.slug)
      .eq('is_active', true)
      .single()

    if (error || !trainer)
      return res.status(404).json(errorResponse('Formateur introuvable'))

    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, description, duration_minutes, price, category, level')
      .eq('trainer_id', trainer.id)
      .eq('is_published', true)

    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, comment, learner_email, created_at')
      .eq('trainer_id', trainer.id)
      .order('created_at', { ascending: false })
      .limit(10)

    res.json(successResponse({ trainer, courses: courses || [], reviews: reviews || [] }))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

module.exports = { getProfile }