import prisma from '../config/prisma.js'

// Validate coupon logic
export const validateCouponService = async (code, orderAmount) => {
    const coupon = await prisma.coupon.findFirst({
        where: { code, isActive: true },
    })

    if (!coupon) {
        return { error: 'Invalid coupon code', status: 404 }
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return { error: 'Coupon has expired', status: 400 }
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return { error: 'Coupon usage limit reached', status: 400 }
    }

    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
        return {
            error: `Minimum order amount is $${coupon.minOrderAmount}`,
            status: 400,
        }
    }

    const discount =
        coupon.discountType === 'PERCENT'
            ? (orderAmount * Number(coupon.discountValue)) / 100
            : Number(coupon.discountValue)

    return { coupon, discount }
}

// Create coupon
export const createCouponService = async (data) => {
    return await prisma.coupon.create({ data })
}

// Get coupons
export const getCouponsService = async () => {
    return await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
    })
}