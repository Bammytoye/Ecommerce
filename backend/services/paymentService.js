import Stripe from 'stripe'
import prisma from '../config/prisma.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create Stripe payment intent
export const createPaymentIntentService = async (orderId, userId) => {
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
    })

    if (!order) {
        return { error: 'Order not found', status: 404 }
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(order.total) * 100),
        currency: 'usd',
        metadata: { orderId, userId },
    })

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

    return { clientSecret: paymentIntent.client_secret }
}

// Handle webhook events
export const handleStripeWebhookService = async (event) => {
    // Payment success
    if (event.type === 'payment_intent.succeeded') {
        const { orderId } = event.data.object.metadata

        await prisma.payment.update({
            where: { orderId },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        })

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CONFIRMED',
                statusHistory: {
                    create: {
                        status: 'CONFIRMED',
                        note: 'Payment confirmed',
                    },
                },
            },
        })
    }

    // Payment failed
    if (event.type === 'payment_intent.payment_failed') {
        const { orderId } = event.data.object.metadata

        await prisma.payment.update({
            where: { orderId },
            data: {
                status: 'FAILED',
                failureReason:
                    event.data.object.last_payment_error?.message,
            },
        })
    }

    return true
}