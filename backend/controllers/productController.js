import prisma from '../config/prisma.js'

// Get all products 
export const getProducts = async (req, res) => {
    try {
        const {
            page = 1, limit = 12, category, search,
            minPrice, maxPrice, featured, sort = 'createdAt', order = 'desc'
        } = req.query

        const skip = (Number(page) - 1) * Number(limit)

        const where = { isActive: true }
        if (category) where.category = { slug: category }
        if (featured) where.isFeatured = true
        if (search) where.name = { contains: search, mode: 'insensitive' }
        if (minPrice || maxPrice) {
            where.basePrice = {}
            if (minPrice) where.basePrice.gte = Number(minPrice)
            if (maxPrice) where.basePrice.lte = Number(maxPrice)
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { [sort]: order },
                include: {
                    category: { select: { name: true, slug: true } },
                    images: { where: { isPrimary: true }, take: 1 },
                    reviews: { select: { rating: true } },
                    _count: { select: { reviews: true } },
                },
            }),
            prisma.product.count({ where }),
        ])

        const productsWithRating = products.map((p) => ({
            ...p,
            avgRating: p.reviews.length
                ? p.reviews.reduce((a, b) => a + b.rating, 0) / p.reviews.length
                : 0,
            reviewCount: p._count.reviews,
        }))

        res.json({
            products: productsWithRating,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch products' })
    }
}

// Get single product
export const getProduct = async (req, res) => {
    try {
        const product = await prisma.product.findFirst({
            where: { slug: req.params.slug, isActive: true },
            include: {
                category: true,
                images: { orderBy: { position: 'asc' } },
                variants: true,
                tags: { include: { tag: true } },
                reviews: {
                    include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                _count: { select: { reviews: true } },
            },
        })

        if (!product) return res.status(404).json({ error: 'Product not found' })

        const avgRating = product.reviews.length
            ? product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length
            : 0

        res.json({ product: { ...product, avgRating } })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' })
    }
}

// Create product (admin) 
export const createProduct = async (req, res) => {
    try {
        const {
            name, slug, description, basePrice, comparePrice,
            sku, stock, categoryId, isFeatured, variants, tags
        } = req.body

        const product = await prisma.product.create({
            data: {
                name, slug, description, sku,
                basePrice: Number(basePrice),
                comparePrice: comparePrice ? Number(comparePrice) : null,
                stock: Number(stock) || 0,
                categoryId, isFeatured: Boolean(isFeatured),
                variants: variants ? { create: variants } : undefined,
            },
            include: { images: true, variants: true },
        })

        res.status(201).json({ product })
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Product with this slug or SKU already exists' })
        }
        res.status(500).json({ error: 'Failed to create product' })
    }
}

// Update product (admin) 
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const data = req.body

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...data,
                basePrice: data.basePrice ? Number(data.basePrice) : undefined,
                comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
                stock: data.stock ? Number(data.stock) : undefined,
            },
            include: { images: true, variants: true, category: true },
        })

        res.json({ product })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' })
    }
}

// Delete product (admin)
export const deleteProduct = async (req, res) => {
    try {
        await prisma.product.update({
            where: { id: req.params.id },
            data: { isActive: false },
        })
        res.json({ message: 'Product deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' })
    }
}

// Get featured products 
export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true, isFeatured: true },
            take: 8,
            include: {
                images: { where: { isPrimary: true }, take: 1 },
                category: { select: { name: true, slug: true } },
            },
        })
        res.json({ products })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch featured products' })
    }
}