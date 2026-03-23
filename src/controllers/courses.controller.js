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
    else if (sort === 'rating') query = query.order('created_at', { ascending: false })
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