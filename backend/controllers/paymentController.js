import Stripe from 'stripe'
import { createPaymentIntentService, 
    handleStripeWebhookService, } from '../services/paymentService.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create payment intent
export const createPaymentIntent = async (req, res) => {
    try {
        const { orderId } = req.body

        const result = await createPaymentIntentService(
            orderId,
            req.user.id
        )

        if (result.error) {
            return res.status(result.status).json({ error: result.error })
        }

        res.json(result)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create payment intent' })
    }
}

// Stripe webhook
export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature']
    let event

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        return res
            .status(400)
            .json({ error: 'Webhook signature verification failed' })
    }

    try {
        await handleStripeWebhookService(event)
        res.json({ received: true })
    } catch (error) {
        res.status(500).json({ error: 'Webhook processing failed' })
    }
}