import { Router } from 'express'
import { protect } from '../middleware/auth.js'

import {
    createPaymentIntent,
    stripeWebhook,
} from '../controllers/paymentController.js'

const router = Router()

// Create payment intent (user)
router.post('/create-intent', protect, createPaymentIntent)

// Stripe webhook (NO auth middleware)
router.post('/webhook', stripeWebhook)

export default router