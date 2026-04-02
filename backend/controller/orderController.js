import prisma from '../config/prisma.js'

const generateOrderNumber = () => {
    const date = new Date()
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `ORD-${y}${m}${d}-${rand}`
}

// ── Create order ─────────────────────────────────────────────
export const createOrder = async (req, res) => {
    try {
        const { addressId, couponCode, notes } = req.body
        const userId = req.user.id

        // Get user cart
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
            },
        })

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' })
        }

        // Validate address
        const address = await prisma.address.findFirst({
            where: { id: addressId, userId },
        })
        if (!address) return res.status(400).json({ error: 'Invalid address' })

        // Calculate totals
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

        // Apply coupon
        let discount = 0
        if (couponCode) {
            const coupon = await prisma.coupon.findFirst({
                where: { code: couponCode, isActive: true },
            })
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

        // Create order
        const order = await prisma.order.create({
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

        // Clear cart
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

        res.status(201).json({ order })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to create order' })
    }
}

// ── Get user orders ──────────────────────────────────────────
export const getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const skip = (Number(page) - 1) * Number(limit)

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { userId: req.user.id },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } },
                    payment: true,
                    shipment: true,
                },
            }),
            prisma.order.count({ where: { userId: req.user.id } }),
        ])

        res.json({ orders, pagination: { page: Number(page), limit: Number(limit), total } })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' })
    }
}

// ── Get single order ─────────────────────────────────────────
export const getOrder = async (req, res) => {
    try {
        const order = await prisma.order.findFirst({
            where: { id: req.params.id, userId: req.user.id },
            include: {
                items: true,
                address: true,
                payment: true,
                shipment: true,
                statusHistory: { orderBy: { createdAt: 'asc' } },
            },
        })

        if (!order) return res.status(404).json({ error: 'Order not found' })
        res.json({ order })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' })
    }
}

// ── Cancel order ─────────────────────────────────────────────
export const cancelOrder = async (req, res) => {
    try {
        const order = await prisma.order.findFirst({
            where: { id: req.params.id, userId: req.user.id },
        })

        if (!order) return res.status(404).json({ error: 'Order not found' })
        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
            return res.status(400).json({ error: 'Order cannot be cancelled at this stage' })
        }

        const updated = await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'CANCELLED',
                statusHistory: {
                    create: { status: 'CANCELLED', note: 'Cancelled by customer' },
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
        const { page = 1, limit = 20, status } = req.query
        const skip = (Number(page) - 1) * Number(limit)
        const where = status ? { status } : {}

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { firstName: true, lastName: true, email: true } },
                    items: true,
                    payment: true,
                },
            }),
            prisma.order.count({ where }),
        ])

        res.json({ orders, pagination: { page: Number(page), limit: Number(limit), total } })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' })
    }
}

// ── Admin: update order status ───────────────────────────────
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body

        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: {
                status,
                statusHistory: { create: { status, note } },
            },
        })

        res.json({ order })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' })
    }
}