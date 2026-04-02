import prisma from '../config/prisma.js'

// Get all categories
export const getAllCategories = async () => {
    return prisma.category.findMany({
        where: { isActive: true, parentId: null },
        include: {
            children: { where: { isActive: true } },
            _count: { select: { products: true } },
        },
    })
}

// Get single category
export const getCategoryBySlug = async (slug) => {
    return prisma.category.findUnique({
        where: { slug },
        include: {
            children: true,
            products: {
                where: { isActive: true },
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    }
                },
                take: 12,
            },
        },
    })
}

// Create
export const createCategory = async (data) => {
    return prisma.category.create({ data })
}

// Update
export const updateCategory = async (id, data) => {
    return prisma.category.update({
        where: { id },
        data,
    })
}