import prisma from '../config/prisma.js'

// cart
export const getUserCart = (userId) => {
    return prisma.cart.findUnique({
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
}

export const getUserAddress = (addressId, userId) => {
    return prisma.address.findFirst({
        where: { id: addressId, userId },
    })
}

export const getCoupon = (couponCode) => {
    return prisma.coupon.findFirst({
        where: { code: couponCode, isActive: true },
    })
}

export const createOrderDB = (data) => {
    return prisma.order.create(data)
}

export const clearCart = (cartId) => {
    return prisma.cartItem.deleteMany({ where: { cartId } })
}

export const getOrdersByUser = (userId, skip, limit) => {
    return prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: { where: { isPrimary: true }, take: 1 }
                        }
                    }
                }
            },
            payment: true,
            shipment: true,
        },
    })
}

export const countUserOrders = (userId) => {
    return prisma.order.count({ where: { userId } })
}

export const getSingleOrder = (id, userId) => {
    return prisma.order.findFirst({
        where: { id, userId },
        include: {
            items: true,
            address: true,
            payment: true,
            shipment: true,
            statusHistory: { orderBy: { createdAt: 'asc' } },
        },
    })
}

export const updateOrder = (id, data) => {
    return prisma.order.update({
        where: { id },
        data,
    })
}

export const getAllOrdersDB = (where, skip, limit) => {
    return prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            items: true,
            payment: true,
        },
    })
}

export const countAllOrders = (where) => {
    return prisma.order.count({ where })
}