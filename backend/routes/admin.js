import { Router } from 'express'
import prisma from '../config/prisma.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()
router.use(protect, adminOnly)

// Dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const [
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            recentOrders,
            lowStockProducts,
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'CUSTOMER' } }),
            prisma.product.count({ where: { isActive: true } }),
            prisma.order.count(),
            prisma.payment.aggregate({
                where: { status: 'PAID' },
                _sum: { amount: true },
            }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { firstName: true, lastName: true, email: true } },
                    payment: true,
                },
            }),
            prisma.product.findMany({
                where: { stock: { lte: prisma.product.fields.lowStockAt } },
                take: 5,
                select: { id: true, name: true, stock: true, lowStockAt: true },
            }),
        ])

        res.json({
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: totalRevenue._sum.amount || 0,
            },
            recentOrders,
            lowStockProducts,
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' })
    }
})

// Get all users
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query
        const skip = (Number(page) - 1) * Number(limit)

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, email: true, firstName: true, lastName: true,
                    role: true, isActive: true, createdAt: true,
                    _count: { select: { orders: true } },
                },
            }),
            prisma.user.count(),
        ])

        res.json({ users, pagination: { page: Number(page), limit: Number(limit), total } })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

// Toggle user active status
router.put('/users/:id/toggle', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } })
        const updated = await prisma.user.update({
            where: { id: req.params.id },
            data: { isActive: !user.isActive },
        })
        res.json({ user: updated })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' })
    }
})

export default router