import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import {
    createPaymentIntent,
    confirmPayment,
    stripeWebhook,
} from '../controllers/paymentController.js'

const paymentsRouter = Router()

// Create payment intent (user)
paymentsRouter.post('/create-intent', protect, createPaymentIntent)

// Confirm payment after Stripe success (user)
paymentsRouter.post('/confirm', protect, confirmPayment)

// Stripe webhook (NO auth middleware)
paymentsRouter.post('/webhook', stripeWebhook)

export default paymentsRouter