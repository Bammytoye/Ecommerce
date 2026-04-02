import prisma from '../config/prisma.js'

// ── Get cart ─────────────────────────────────────────────────
export const getCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: { images: { where: { isPrimary: true }, take: 1 } },
                        },
                        variant: true,
                    },
                },
            },
        })

        if (!cart) return res.json({ cart: { items: [], total: 0 } })

        const total = cart.items.reduce((sum, item) => {
            const price = item.variant?.price || item.product.basePrice
            return sum + Number(price) * item.quantity
        }, 0)

        res.json({ cart: { ...cart, total } })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' })
    }
}

// ── Add to cart ──────────────────────────────────────────────
export const addToCart = async (req, res) => {
    try {
        const { productId, variantId, quantity = 1 } = req.body

        const product = await prisma.product.findUnique({ where: { id: productId } })
        if (!product || !product.isActive) {
            return res.status(404).json({ error: 'Product not found' })
        }

        let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId: req.user.id } })
        }

        const existing = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId, variantId: variantId || null },
        })

        if (existing) {
            await prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + Number(quantity) },
            })
        } else {
            await prisma.cartItem.create({
                data: { cartId: cart.id, productId, variantId: variantId || null, quantity: Number(quantity) },
            })
        }

        // Return updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
                        variant: true,
                    },
                },
            },
        })

        res.json({ cart: updatedCart })
    } catch (error) {
        res.status(500).json({ error: 'Failed to add to cart' })
    }
}

// ── Update cart item ─────────────────────────────────────────
export const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body
        const { itemId } = req.params

        if (quantity <= 0) {
            await prisma.cartItem.delete({ where: { id: itemId } })
            return res.json({ message: 'Item removed from cart' })
        }

        await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: Number(quantity) },
        })

        res.json({ message: 'Cart updated' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update cart' })
    }
}

// ── Remove from cart ─────────────────────────────────────────
export const removeFromCart = async (req, res) => {
    try {
        await prisma.cartItem.delete({ where: { id: req.params.itemId } })
        res.json({ message: 'Item removed from cart' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove item' })
    }
}

// ── Clear cart ───────────────────────────────────────────────
export const clearCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })
        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
        }
        res.json({ message: 'Cart cleared' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cart' })
    }
}