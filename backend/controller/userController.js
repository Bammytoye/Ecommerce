import prisma from '../config/prisma.js'

// ── Get profile ──────────────────────────────────────────────
export const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                phone: true, avatarUrl: true, role: true, isVerified: true, createdAt: true,
                addresses: true,
                _count: { select: { orders: true, reviews: true } },
            },
        })
        res.json({ user })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' })
    }
}

// ── Update profile ───────────────────────────────────────────
export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { firstName, lastName, phone },
            select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true },
        })
        res.json({ user })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' })
    }
}

// ── Add address ──────────────────────────────────────────────
export const addAddress = async (req, res) => {
    try {
        const { fullName, phone, street, city, state, postalCode, country, type, isDefault } = req.body

        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: req.user.id },
                data: { isDefault: false },
            })
        }

        const address = await prisma.address.create({
            data: { userId: req.user.id, fullName, phone, street, city, state, postalCode, country, type, isDefault },
        })

        res.status(201).json({ address })
    } catch (error) {
        res.status(500).json({ error: 'Failed to add address' })
    }
}

// ── Update address ───────────────────────────────────────────
export const updateAddress = async (req, res) => {
    try {
        const address = await prisma.address.findFirst({
            where: { id: req.params.id, userId: req.user.id },
        })
        if (!address) return res.status(404).json({ error: 'Address not found' })

        if (req.body.isDefault) {
            await prisma.address.updateMany({
                where: { userId: req.user.id },
                data: { isDefault: false },
            })
        }

        const updated = await prisma.address.update({
            where: { id: req.params.id },
            data: req.body,
        })
        res.json({ address: updated })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update address' })
    }
}

// ── Delete address ───────────────────────────────────────────
export const deleteAddress = async (req, res) => {
    try {
        await prisma.address.deleteMany({
            where: { id: req.params.id, userId: req.user.id },
        })
        res.json({ message: 'Address deleted' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete address' })
    }
}

// ── Get wishlist ─────────────────────────────────────────────
export const getWishlist = async (req, res) => {
    try {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: { images: { where: { isPrimary: true }, take: 1 } },
                        },
                    },
                },
            },
        })
        res.json({ wishlist })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wishlist' })
    }
}

// ── Toggle wishlist item ─────────────────────────────────────
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body

        let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.id } })
        if (!wishlist) {
            wishlist = await prisma.wishlist.create({ data: { userId: req.user.id } })
        }

        const existing = await prisma.wishlistItem.findFirst({
            where: { wishlistId: wishlist.id, productId },
        })

        if (existing) {
            await prisma.wishlistItem.delete({ where: { id: existing.id } })
            return res.json({ message: 'Removed from wishlist', added: false })
        }

        await prisma.wishlistItem.create({
            data: { wishlistId: wishlist.id, productId },
        })

        res.json({ message: 'Added to wishlist', added: true })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update wishlist' })
    }
}