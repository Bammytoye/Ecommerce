import prisma from '../config/prisma.js'

// Add or update review
export const upsertReview = async (userId, productId, data) => {
    return prisma.review.upsert({
        where: {
            userId_productId: { userId, productId }
        },
        update: data,
        create: {
            userId,
            productId,
            ...data
        }
    })
}

// Get reviews by product
export const getProductReviews = async (productId) => {
    return prisma.review.findMany({
        where: { productId },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export const getProductReviewStats = async (productId) => {
    return prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true }
    })
}