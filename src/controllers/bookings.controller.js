const supabase = require('../config/supabase')
const { successResponse, errorResponse } = require('../utils/response')

const getBooking = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, courses(title, duration_minutes, price), trainers(full_name, slug, avatar_url)')
      .eq('id', req.params.id)
      .single()

    if (error || !data) return res.status(404).json(errorResponse('Réservation introuvable'))
    res.json(successResponse({ booking: data }))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const createBooking = async (req, res) => {
  try {
    const { course_id, learner_email, learner_name, scheduled_at } = req.body
    if (!course_id || !learner_email) return res.status(400).json(errorResponse('Champs manquants'))

    const { data: course, error: courseError } = await supabase
      .from('courses').select('trainer_id, price').eq('id', course_id).single()

    if (courseError || !course) return res.status(404).json(errorResponse('Formation introuvable'))

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        course_id,
        trainer_id: course.trainer_id,
        learner_email,
        learner_name,
        scheduled_at,
        amount: course.price,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(successResponse({ booking: data }, 'Réservation créée'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const acceptBooking = async (req, res) => {
  try {
    const visio_url = `https://savvly.daily.co/${req.params.id}`

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed', visio_url })
      .eq('id', req.params.id)
      .eq('trainer_id', req.user.id)
      .select()
      .single()

    if (error) throw error
    res.json(successResponse({ booking: data }, 'Réservation confirmée'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const cancelBooking = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(successResponse({ booking: data }, 'Réservation annulée'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

module.exports = { getBooking, createBooking, acceptBooking, cancelBooking }