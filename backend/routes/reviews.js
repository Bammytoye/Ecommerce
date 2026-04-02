import { Router } from 'express'
import prisma from '../config/prisma.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

// Add review
router.post('/', protect, async (req, res) => {
    try {
        const { productId, rating, title, body } = req.body
        const review = await prisma.review.upsert({
            where: { userId_productId: { userId: req.user.id, productId } },
            update: { rating, title, body },
            create: { userId: req.user.id, productId, rating, title, body },
        })
        res.status(201).json({ review })
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit review' })
    }
})

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { productId: req.params.productId },
            include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' },
        })
        res.json({ reviews })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' })
    }
})

export default router