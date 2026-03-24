require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()

// IMPORTANT (fix Vercel / proxy)
app.set('trust proxy', 1)

// CORS
const corsOptions = {
  origin: [
    process.env.FRONT_URL || 'https://savvly.co',
    'https://savvly.myshopify.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}))
app.use(morgan('dev'))
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
})
app.use('/api/', limiter)

// Body parsing
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/trainers', require('./routes/trainers'))
app.use('/api/courses', require('./routes/courses'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/profiles', require('./routes/profiles'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/admin', require('./routes/admin'))

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV })
})

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable' })
})

// Global error
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR =>', err)
  res.status(500).json({
    success: false,
    message: 'Erreur serveur',
    error: err.message
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`savvly-api running on :${PORT}`))

module.exports = app