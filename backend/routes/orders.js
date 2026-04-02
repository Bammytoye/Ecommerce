import { Router } from 'express'
import { createOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus } from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.post('/',                        createOrder)
router.get('/my',                       getMyOrders)
router.get('/my/:id',                   getOrder)
router.put('/my/:id/cancel',            cancelOrder)

// Admin
router.get('/',                         adminOnly, getAllOrders)
router.put('/:id/status',               adminOnly, updateOrderStatus)

export default router