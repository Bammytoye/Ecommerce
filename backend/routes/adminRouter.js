import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import {
    getDashboardStats,
    getUsers,
    toggleUserStatus
} from '../controllers/adminController.js'

const adminRouter = Router()

adminRouter.use(protect, adminOnly)

adminRouter.get('/stats', getDashboardStats)
adminRouter.get('/users', getUsers)
adminRouter.put('/users/:id/toggle', toggleUserStatus)

export default adminRouter