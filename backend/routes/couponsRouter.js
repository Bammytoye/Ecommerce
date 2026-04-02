import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'

import {
    validateCoupon,
    createCoupon,
    getCoupons,
} from '../controllers/couponController.js'

const couponRouter = Router()

// Validate coupon (user)
couponRouter.post('/validate', protect, validateCoupon)

// Admin routes
couponRouter.post('/', protect, adminOnly, createCoupon)
couponRouter.get('/', protect, adminOnly, getCoupons)

export default couponRouter