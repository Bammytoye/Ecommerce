import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'
import { sendWelcomeEmail } from '../services/emailService.js'

const generateAccessToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' })

const generateRefreshToken = (id) =>
    jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' })

// ── Register ─────────────────────────────────────────────────
export const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'All fields are required' })
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' })
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) return res.status(409).json({ error: 'Email already registered' })

        const passwordHash = await bcrypt.hash(password, 12)
        const user = await prisma.user.create({
            data: { email, passwordHash, firstName, lastName, phone },
            select: { id: true, email: true, firstName: true, lastName: true, role: true },
        })

        await prisma.cart.create({ data: { userId: user.id } })
        await prisma.wishlist.create({ data: { userId: user.id } })

        const accessToken = generateAccessToken(user.id)
        const refreshToken = generateRefreshToken(user.id)

        await prisma.refreshToken.create({
            data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        })

        // Send welcome email
        sendWelcomeEmail(user)

        res.status(201).json({ user, accessToken, refreshToken })
    } catch (error) {
        console.error('Register error:', error)
        res.status(500).json({ error: 'Registration failed' })
    }
}

// ── Login ────────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' })

        const isMatch = await bcrypt.compare(password, user.passwordHash)
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' })

        const accessToken = generateAccessToken(user.id)
        const refreshToken = generateRefreshToken(user.id)

        await prisma.refreshToken.create({
            data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        })

        const { passwordHash, ...userWithoutPassword } = user
        res.json({ user: userWithoutPassword, accessToken, refreshToken })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ error: 'Login failed' })
    }
}

// ── Refresh token ────────────────────────────────────────────
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body
        if (!token) return res.status(401).json({ error: 'Refresh token required' })

        const stored = await prisma.refreshToken.findUnique({ where: { token } })
        if (!stored || stored.expiresAt < new Date()) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' })
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        const accessToken = generateAccessToken(decoded.id)
        res.json({ accessToken })
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' })
    }
}

// ── Logout ───────────────────────────────────────────────────
export const logout = async (req, res) => {
    try {
        const { refreshToken: token } = req.body
        if (token) await prisma.refreshToken.deleteMany({ where: { token } })
        res.json({ message: 'Logged out successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' })
    }
}

// ── Get current user ─────────────────────────────────────────
export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                phone: true, avatarUrl: true, role: true, isVerified: true, createdAt: true,
            },
        })
        res.json({ user })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user' })
    }
}

// ── Change password ──────────────────────────────────────────
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        const user = await prisma.user.findUnique({ where: { id: req.user.id } })
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' })
        if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' })

        const passwordHash = await bcrypt.hash(newPassword, 12)
        await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } })
        await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } })

        res.json({ message: 'Password changed successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' })
    }
}

// ── Forgot password ──────────────────────────────────────────
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ error: 'Email is required' })

        const user = await prisma.user.findUnique({ where: { email } })

        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If this email exists, a reset link has been sent.' })
        }

        // Generate reset token
        const crypto = await import('crypto')
        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Delete any existing tokens for this user
        await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

        // Create new token
        await prisma.passwordResetToken.create({
            data: { token, userId: user.id, expiresAt },
        })

        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`

        // Send email
        const { sendPasswordResetEmail } = await import('../services/emailService.js')
        sendPasswordResetEmail(user, resetUrl)

        res.json({ message: 'If this email exists, a reset link has been sent.' })
    } catch (error) {
        console.error('Forgot password error:', error)
        res.status(500).json({ error: 'Failed to process request' })
    }
}

// ── Reset password ───────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password are required' })
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' })
        }

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        })

        if (!resetToken) return res.status(400).json({ error: 'Invalid reset token' })
        if (resetToken.used) return res.status(400).json({ error: 'Reset token already used' })
        if (resetToken.expiresAt < new Date()) return res.status(400).json({ error: 'Reset token has expired' })

        // Update password
        const bcrypt = await import('bcryptjs')
        const passwordHash = await bcrypt.hash(password, 12)

        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash },
        })

        // Mark token as used
        await prisma.passwordResetToken.update({
            where: { token },
            data: { used: true },
        })

        // Invalidate all refresh tokens
        await prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } })

        res.json({ message: 'Password reset successfully. You can now log in.' })
    } catch (error) {
        console.error('Reset password error:', error)
        res.status(500).json({ error: 'Failed to reset password' })
    }
}