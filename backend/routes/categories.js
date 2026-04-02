import { Router } from 'express'
import prisma from '../config/prisma.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true, parentId: null },
            include: {
                children: { where: { isActive: true } },
                _count: { select: { products: true } },
            },
        })
        res.json({ categories })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' })
    }
})

// Get single category with products
router.get('/:slug', async (req, res) => {
    try {
        const category = await prisma.category.findUnique({
            where: { slug: req.params.slug },
            include: {
                children: true,
                products: {
                    where: { isActive: true },
                    include: { images: { where: { isPrimary: true }, take: 1 } },
                    take: 12,
                },
            },
        })
        if (!category) return res.status(404).json({ error: 'Category not found' })
        res.json({ category })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category' })
    }
})

// Create category (admin)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const category = await prisma.category.create({ data: req.body })
        res.status(201).json({ category })
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' })
    }
})

// Update category (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const category = await prisma.category.update({
            where: { id: req.params.id },
            data: req.body,
        })
        res.json({ category })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' })
    }
})

export default router