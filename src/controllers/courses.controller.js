const supabase = require('../config/supabase')
const { successResponse, errorResponse } = require('../utils/response')

const getCourses = async (req, res) => {
  try {
    const { category, level, search, sort, price_min, price_max, page = 1, limit = 12 } = req.query

    let query = supabase
      .from('courses')
      .select('*, trainers(id, full_name, slug, avatar_url, rating)', { count: 'exact' })
      .eq('is_published', true)

    if (category) query = query.eq('category', category)
    if (level) query = query.eq('level', level)
    if (price_min) query = query.gte('price', parseFloat(price_min))
    if (price_max) query = query.lte('price', parseFloat(price_max))
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

    if (sort === 'price-asc') query = query.order('price', { ascending: true })
    else if (sort === 'price-desc') query = query.order('price', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    const from = (parseInt(page) - 1) * parseInt(limit)
    const to = from + parseInt(limit) - 1
    query = query.range(from, to)

    const { data, error, count } = await query
    if (error) throw error

    res.json(successResponse({
      courses: data,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit))
    }))
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