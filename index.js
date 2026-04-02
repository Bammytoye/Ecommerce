import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit'

// Routes
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import paymentRoutes from './routes/payments.js'
import userRoutes from './routes/users.js'
import uploadRoutes from './routes/uploads.js'
import reviewRoutes from './routes/reviews.js'
import couponRoutes from './routes/coupons.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ── Security middleware ──────────────────────────────────────
app.use(helmet())
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}))

// ── Rate limiting ────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
})
app.use('/api', limiter)

// ── General middleware ───────────────────────────────────────
app.use(compression())
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/admin', adminRoutes)

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    })
})

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app