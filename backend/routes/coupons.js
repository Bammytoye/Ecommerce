import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'

import {
    validateCoupon,
    createCoupon,
    getCoupons,
} from '../controllers/couponController.js'

const router = Router()

// Validate coupon (user)
router.post('/validate', protect, validateCoupon)

// Admin routes
router.post('/', protect, adminOnly, createCoupon)
router.get('/', protect, adminOnly, getCoupons)

export default router