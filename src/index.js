require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()

app.use(helmet())
app.use(morgan('dev'))
app.use(cors({
  origin: [
    process.env.FRONT_URL || 'https://savvly.co',
    'https://savvly.myshopify.com'
  ],
  credentials: true
}))

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use('/api/', limiter)

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth',     require('./routes/auth'))
app.use('/api/trainers', require('./routes/trainers'))
app.use('/api/courses',  require('./routes/courses'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/profiles', require('./routes/profiles'))
app.use('/api/reviews',  require('./routes/reviews'))
app.use('/api/admin',    require('./routes/admin'))

app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))

app.use((req, res) => res.status(404).json({ success: false, message: 'Route introuvable' }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`savvly-api running on :${PORT}`))

module.exports = app
