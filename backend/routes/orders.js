import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import {
    createOrder,
    getMyOrders,
    getOrder,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
} from '../controllers/order.controller.js'

const router = Router()

router.post('/', protect, createOrder)
router.get('/my', protect, getMyOrders)
router.get('/:id', protect, getOrder)
router.put('/:id/cancel', protect, cancelOrder)

//admin
router.get('/', protect, adminOnly, getAllOrders)
router.put('/:id/status', protect, adminOnly, updateOrderStatus)

export default router