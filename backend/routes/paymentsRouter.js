import { Router } from 'express'
import { protect } from '../middleware/auth.js'

import {
    createPaymentIntent,
    stripeWebhook,
} from '../controllers/paymentController.js'

const paymentsRouter = Router()

// Create payment intent (user)
paymentsRouter.post('/create-intent', protect, createPaymentIntent)

// Stripe webhook (NO auth middleware)
paymentsRouter.post('/webhook', stripeWebhook)

export default paymentsRouter