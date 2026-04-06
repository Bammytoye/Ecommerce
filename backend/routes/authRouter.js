import { Router } from 'express'
import {
    register, login, refreshToken, logout,
    getMe, changePassword, forgotPassword, resetPassword
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/refresh', refreshToken)
authRouter.post('/logout', logout)
authRouter.get('/me', protect, getMe)
authRouter.put('/change-password', protect, changePassword)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/reset-password', resetPassword)

export default authRouter