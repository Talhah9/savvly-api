const supabase = require('../config/supabase')
const { successResponse, errorResponse } = require('../utils/response')

const submitReview = async (req, res) => {
  try {
    const { booking_id, rating, comment } = req.body
    if (!booking_id || !rating) return res.status(400).json(errorResponse('Champs manquants'))
    if (rating < 1 || rating > 5) return res.status(400).json(errorResponse('Note entre 1 et 5'))

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('trainer_id, learner_email, status')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) return res.status(404).json(errorResponse('Réservation introuvable'))
    if (booking.status !== 'completed') return res.status(400).json(errorResponse('Séance non terminée'))

    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .single()

    if (existing) return res.status(409).json(errorResponse('Avis déjà soumis'))

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        booking_id,
        trainer_id: booking.trainer_id,
        learner_email: booking.learner_email,
        rating,
        comment
      })
      .select()
      .single()

    if (error) throw error

    // Recalcule la note moyenne du formateur
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('trainer_id', booking.trainer_id)

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    await supabase
      .from('trainers')
      .update({
        rating: Math.round(avg * 100) / 100,
        review_count: reviews.length
      })
      .eq('id', booking.trainer_id)

    res.status(201).json(successResponse({ review }, 'Avis soumis'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const getTrainerReviews = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, learner_email, created_at')
      .eq('trainer_id', req.params.trainerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(successResponse({ reviews: data }))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

module.exports = { submitReview, getTrainerReviews }