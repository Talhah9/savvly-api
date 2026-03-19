const stripe = require('../config/stripe')
const supabase = require('../config/supabase')
const { successResponse, errorResponse } = require('../utils/response')

const createCheckout = async (req, res) => {
  try {
    const { booking_id } = req.body
    if (!booking_id) return res.status(400).json(errorResponse('booking_id manquant'))

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, courses(title, price)')
      .eq('id', booking_id)
      .single()

    if (error || !booking) return res.status(404).json(errorResponse('Réservation introuvable'))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: booking.courses.title },
          unit_amount: Math.round(booking.courses.price * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.FRONT_URL}/confirmation?booking=${booking_id}`,
      cancel_url: `${process.env.FRONT_URL}/reservation?booking=${booking_id}`,
      metadata: { booking_id }
    })

    await supabase
      .from('bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking_id)

    res.json(successResponse({ url: session.url }, 'Session créée'))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

const webhook = async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const booking_id = session.metadata.booking_id

    await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        stripe_payment_intent: session.payment_intent
      })
      .eq('id', booking_id)
  }

  res.json({ received: true })
}

const portal = async (req, res) => {
  try {
    const { data: trainer } = await supabase
      .from('trainers')
      .select('stripe_customer_id')
      .eq('id', req.user.id)
      .single()

    if (!trainer?.stripe_customer_id)
      return res.status(404).json(errorResponse('Pas de compte Stripe associé'))

    const session = await stripe.billingPortal.sessions.create({
      customer: trainer.stripe_customer_id,
      return_url: `${process.env.FRONT_URL}/compte-formateur`
    })

    res.json(successResponse({ url: session.url }))
  } catch (err) {
    res.status(500).json(errorResponse('Erreur serveur', err.message))
  }
}

module.exports = { createCheckout, webhook, portal }