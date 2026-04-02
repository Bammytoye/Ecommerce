import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import {
    createOrder,
    getMyOrders,
    getOrder,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
} from '../controllers/orderController.js'

const ordersRouter = Router()

ordersRouter.post('/', protect, createOrder)
ordersRouter.get('/my', protect, getMyOrders)
ordersRouter.get('/:id', protect, getOrder)
ordersRouter.put('/:id/cancel', protect, cancelOrder)

//admin
ordersRouter.get('/', protect, adminOnly, getAllOrders)
ordersRouter.put('/:id/status', protect, adminOnly, updateOrderStatus)

export default ordersRouter