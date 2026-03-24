const supabase = require('../config/supabase')
const { successResponse, errorResponse } = require('../utils/response')

// GET
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

    const from = (parseInt(page, 10) - 1) * parseInt(limit, 10)
    const to = from + parseInt(limit, 10) - 1
    query = query.range(from, to)

    const { data, error, count } = await query
    if (error) throw error

    res.json(successResponse({
      courses: data,
      total: count,
      page: parseInt(page, 10),
      pages: Math.ceil((count || 0) / parseInt(limit, 10))
    }))
  } catch (err) {
    console.error('GET COURSES ERROR =>', err)
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

// POST
const createCourse = async (req, res) => {
  try {
    console.log('BODY =>', req.body)
    console.log('USER =>', req.user)

    const { title, description, duration_minutes, price, category, level } = req.body

    if (!title || price === undefined) {
      return res.status(400).json(errorResponse('Champs manquants'))
    }

    const payload = {
      title,
      description: description || null,
      duration_minutes: duration_minutes || null,
      price: Number(price),
      category: category || null,
      level: level || null,
      trainer_id: req.user.id
    }

    console.log('PAYLOAD =>', payload)

    const { data, error } = await supabase
      .from('courses')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('SUPABASE ERROR =>', error)
      throw error
    }

    res.status(201).json(successResponse({ course: data }, 'Formation créée'))
  } catch (err) {
    console.error('CREATE COURSE ERROR =>', err)
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

// UPDATE
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
    console.error('UPDATE ERROR =>', err)
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

// DELETE
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
    console.error('DELETE ERROR =>', err)
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

// PUBLISH
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
    console.error('PUBLISH ERROR =>', err)
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse
}