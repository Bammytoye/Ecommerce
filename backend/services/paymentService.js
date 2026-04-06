import Stripe from 'stripe'
import prisma from '../config/prisma.js'
import { sendPaymentConfirmedEmail } from './emailService.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const createPaymentIntentService = async (orderId, userId) => {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } })
    if (!order) return { error: 'Order not found', status: 404 }

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

export const handleStripeWebhookService = async (event) => {
    if (event.type === 'payment_intent.succeeded') {
        const { orderId } = event.data.object.metadata

        await prisma.payment.update({
            where: { orderId },
            data: { status: 'PAID', paidAt: new Date() },
        })

        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CONFIRMED',
                statusHistory: { create: { status: 'CONFIRMED', note: 'Payment confirmed via Stripe' } },
            },
            include: { items: true, address: true },
        })

        // Send payment confirmed email
        const user = await prisma.user.findUnique({
            where: { id: order.userId },
            select: { email: true, firstName: true, lastName: true },
        })
        sendPaymentConfirmedEmail(order, user)
    }

    if (event.type === 'payment_intent.payment_failed') {
        const { orderId } = event.data.object.metadata
        await prisma.payment.update({
            where: { orderId },
            data: {
                status: 'FAILED',
                failureReason: event.data.object.last_payment_error?.message,
            },
        })
    }

    return true
}