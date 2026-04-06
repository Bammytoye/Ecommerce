import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit'

// Routes
import authRouter from './routes/authRouter.js'
import adminRouter from './routes/adminRouter.js'
import productsRouter from './routes/productsRouter.js'
import categoriesRouter from './routes/categoriesRouter.js'
import cartRouter from './routes/cartRouter.js'
import ordersRouter from './routes/ordersRouter.js'
import paymentsRouter from './routes/paymentsRouter.js'
import usersRouter from './routes/usersRouter.js'
import uploadsRouter from './routes/uploadsRouter.js'
import reviewsRouter from './routes/reviewsRouter.js'
import couponsRouter from './routes/couponsRouter.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware 
app.use(helmet())
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}))


// Rate limiting 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
})
app.use('/api', limiter)

//Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

// General middleware 
app.use(compression())
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
    res.json({ status: 'Ecommerce backend running', timestamp: new Date().toISOString() })
})

// API Routes 
app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/users', usersRouter)
app.use('/api/uploads', uploadsRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/coupons', couponsRouter)
app.use('/api/admin', adminRouter)

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