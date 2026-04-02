import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import {
    getDashboardStats,
    getUsers,
    toggleUserStatus
} from '../controllers/admin.controller.js'

const router = Router()

router.use(protect, adminOnly)

router.get('/stats', getDashboardStats)
router.get('/users', getUsers)
router.put('/users/:id/toggle', toggleUserStatus)

export default router