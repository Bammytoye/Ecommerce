import prisma from '../config/prisma.js'

export const fetchDashboardStats = async () => {
    return Promise.all([
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
}