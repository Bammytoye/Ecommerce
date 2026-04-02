import { validateCouponService, 
    createCouponService, 
    getCouponsService, } from '../services/couponService.js'

// Validate coupon
export const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body

        const result = await validateCouponService(code, orderAmount)

        if (result.error) {
            return res.status(result.status).json({ error: result.error })
        }

        res.json(result)
    } catch (error) {
        res.status(500).json({ error: 'Failed to validate coupon' })
    }
}

// Create coupon (admin)
export const createCoupon = async (req, res) => {
    try {
        const coupon = await createCouponService(req.body)
        res.status(201).json({ coupon })
    } catch (error) {
        res.status(500).json({ error: 'Failed to create coupon' })
    }
}

// Get all coupons (admin)
export const getCoupons = async (req, res) => {
    try {
        const coupons = await getCouponsService()
        res.json({ coupons })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch coupons' })
    }
}