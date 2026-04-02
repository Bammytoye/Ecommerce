import { Router } from 'express'
import Stripe from 'stripe'
import prisma from '../config/prisma.js'
import { protect } from '../middleware/auth.js'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create payment intent
router.post('/create-intent', protect, async (req, res) => {
    try {
        const { orderId } = req.body

        const order = await prisma.order.findFirst({
            where: { id: orderId, userId: req.user.id },
        })
        if (!order) return res.status(404).json({ error: 'Order not found' })

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(order.total) * 100), // cents
            currency: 'usd',
            metadata: { orderId, userId: req.user.id },
        })

        // Create payment record
        await prisma.payment.upsert({
            where: { orderId },
            update: { stripePaymentId: paymentIntent.id },
            create: {
                orderId,
                method: 'CARD',
                status: 'PENDING',
                amount: order.total,
                stripePaymentId: paymentIntent.id,
            },
        })

        res.json({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
        res.status(500).json({ error: 'Failed to create payment intent' })
    }
})

// Stripe webhook
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature']
    let event

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
        return res.status(400).json({ error: 'Webhook signature verification failed' })
    }

    if (event.type === 'payment_intent.succeeded') {
        const { orderId } = event.data.object.metadata

        await prisma.payment.update({
            where: { orderId },
            data: { status: 'PAID', paidAt: new Date() },
        })

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CONFIRMED',
                statusHistory: {
                    create: { status: 'CONFIRMED', note: 'Payment confirmed' },
                },
            },
        })
    }

    if (event.type === 'payment_intent.payment_failed') {
        const { orderId } = event.data.object.metadata
        await prisma.payment.update({
            where: { orderId },
            data: { status: 'FAILED', failureReason: event.data.object.last_payment_error?.message },
        })
    }

    res.json({ received: true })
})

export default router