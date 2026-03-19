const supabase = require('../config/supabase')
const { successResponse, errorResponse } = require('../utils/response')

const getCourses = async (req, res) => {
  try {
    const { category, level } = req.query
    let query = supabase
      .from('courses')
      .select('*, trainers(id, full_name, slug, avatar_url, rating)')
      .eq('is_published', true)

    if (category) query = query.eq('category', category)
    if (level) query = query.eq('level', level)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error

    res.json(successResponse({ courses: data }))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const createCourse = async (req, res) => {
  try {
    const { title, description, duration_minutes, price, category, level } = req.body
    if (!title || !price) return res.status(400).json(errorResponse('Champs manquants'))

    const { data, error } = await supabase
      .from('courses')
      .insert({ title, description, duration_minutes, price, category, level, trainer_id: req.user.id })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(successResponse({ course: data }, 'Formation créée'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const updateCourse = async (req, res) => {
  try {
    const { title, description, duration_minutes, price, category, level } = req.body
    const { data, error } = await supabase
      .from('courses')
      .update({ title, description, duration_minutes, price, category, level })
      .eq('id', req.params.id)
      .eq('trainer_id', req.user.id)
      .select()
      .single()

    if (error) throw error
    res.json(successResponse({ course: data }, 'Formation mise à jour'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const deleteCourse = async (req, res) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', req.params.id)
      .eq('trainer_id', req.user.id)

    if (error) throw error
    res.json(successResponse(null, 'Formation supprimée'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const publishCourse = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update({ is_published: true })
      .eq('id', req.params.id)
      .eq('trainer_id', req.user.id)
      .select()
      .single()

    if (error) throw error
    res.json(successResponse({ course: data }, 'Formation publiée'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

module.exports = { getCourses, createCourse, updateCourse, deleteCourse, publishCourse }