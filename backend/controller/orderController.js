import {
    getUserCart,
    getUserAddress,
    getCoupon,
    createOrderDB,
    clearCart,
    getOrdersByUser,
    countUserOrders,
    getSingleOrder,
    updateOrder,
    getAllOrdersDB,
    countAllOrders
} from '../services/order.service.js'

import { generateOrderNumber } from '../utils/order.util.js'

// ── Create order ─────────────────────────────────────────────
export const createOrder = async (req, res) => {
    try {
        const { addressId, couponCode, notes } = req.body
        const userId = req.user.id

        const cart = await getUserCart(userId)

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' })
        }

        const address = await getUserAddress(addressId, userId)
        if (!address) return res.status(400).json({ error: 'Invalid address' })

        let subtotal = 0
        const orderItems = cart.items.map((item) => {
            const price = item.variant?.price || item.product.basePrice
            const itemSubtotal = Number(price) * item.quantity
            subtotal += itemSubtotal
            return {
                productId: item.productId,
                variantId: item.variantId,
                productName: item.product.name,
                variantName: item.variant ? `${item.variant.name}: ${item.variant.value}` : null,
                imageUrl: null,
                price: Number(price),
                quantity: item.quantity,
                subtotal: itemSubtotal,
            }
        })

        let discount = 0
        if (couponCode) {
            const coupon = await getCoupon(couponCode)
            if (coupon && (!coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount))) {
                if (coupon.discountType === 'PERCENT') {
                    discount = (subtotal * Number(coupon.discountValue)) / 100
                } else {
                    discount = Number(coupon.discountValue)
                }
            }
        }

        const shippingFee = subtotal > 100 ? 0 : 10
        const tax = (subtotal - discount) * 0.075
        const total = subtotal - discount + shippingFee + tax

        const order = await createOrderDB({
            data: {
                orderNumber: generateOrderNumber(),
                userId,
                addressId,
                subtotal,
                discount,
                shippingFee,
                tax,
                total,
                notes,
                couponCode,
                items: { create: orderItems },
                statusHistory: {
                    create: { status: 'PENDING', note: 'Order placed successfully' },
                },
            },
            include: {
                items: true,
                address: true,
                statusHistory: true,
            },
        })

        await clearCart(cart.id)

        res.status(201).json({ order })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to create order' })
    }
}

// ── Get user orders ──────────────────────────────────────────
export const getMyOrders = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const skip = (page - 1) * limit

        const [orders, total] = await Promise.all([
            getOrdersByUser(req.user.id, skip, limit),
            countUserOrders(req.user.id),
        ])

        res.json({
            orders,
            pagination: { page, limit, total }
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' })
    }
}

// ── Get single order ─────────────────────────────────────────
export const getOrder = async (req, res) => {
    try {
        const order = await getSingleOrder(req.params.id, req.user.id)

        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        res.json({ order })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' })
    }
}

// ── Cancel order ─────────────────────────────────────────────
export const cancelOrder = async (req, res) => {
    try {
        const order = await getSingleOrder(req.params.id, req.user.id)

        if (!order) {
            return res.status(404).json({ error: 'Order not found' })
        }

        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
            return res.status(400).json({
                error: 'Order cannot be cancelled at this stage'
            })
        }

        const updated = await updateOrder(order.id, {
            status: 'CANCELLED',
            statusHistory: {
                create: {
                    status: 'CANCELLED',
                    note: 'Cancelled by customer'
                },
            },
        })

        res.json({ order: updated })
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel order' })
    }
}

// ── Admin: get all orders ────────────────────────────────────
export const getAllOrders = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 20
        const skip = (page - 1) * limit

        const { status } = req.query
        const where = status ? { status } : {}

        const [orders, total] = await Promise.all([
            getAllOrdersDB(where, skip, limit),
            countAllOrders(where),
        ])

        res.json({
            orders,
            pagination: { page, limit, total }
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' })
    }
}

// ── Admin: update order status ───────────────────────────────
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body

        const order = await updateOrder(req.params.id, {
            status,
            statusHistory: {
                create: { status, note }
            },
        })

        res.json({ order })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' })
    }
}