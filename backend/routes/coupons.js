import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import prisma from '../config/prisma.js'

const router = Router()

// Validate coupon
router.post('/validate', protect, async (req, res) => {
    try {
        const { code, orderAmount } = req.body
        const coupon = await prisma.coupon.findFirst({
            where: { code, isActive: true },
        })

        if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' })
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Coupon has expired' })
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ error: 'Coupon usage limit reached' })
        }
        if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
            return res.status(400).json({
                error: `Minimum order amount is $${coupon.minOrderAmount}`,
            })
        }

        const discount = coupon.discountType === 'PERCENT'
            ? (orderAmount * Number(coupon.discountValue)) / 100
            : Number(coupon.discountValue)

        res.json({ coupon, discount })
    } catch (error) {
        res.status(500).json({ error: 'Failed to validate coupon' })
    }
})

// Admin: create coupon
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const coupon = await prisma.coupon.create({ data: req.body })
        res.status(201).json({ coupon })
    } catch (error) {
        res.status(500).json({ error: 'Failed to create coupon' })
    }
})

// Admin: get all coupons
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
        res.json({ coupons })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch coupons' })
    }
})

export default router