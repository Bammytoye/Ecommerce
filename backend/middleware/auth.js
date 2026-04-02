import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'

// Verify JWT token 
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Not authorized, no token' })
        }

        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
            },
        })

        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'User not found or inactive' })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Not authorized, invalid token' })
    }
}

// Admin only
export const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied, admin only' })
    }
    next()
}

// Admin or Vendor 
export const vendorOrAdmin = (req, res, next) => {
    if (!['ADMIN', 'VENDOR'].includes(req.user?.role)) {
        return res.status(403).json({ error: 'Access denied' })
    }
    next()
}