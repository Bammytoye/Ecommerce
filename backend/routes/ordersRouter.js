import { Router } from 'express'
import { createOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, getAdminOrder, updateOrderStatus } from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const ordersRouter = Router()
ordersRouter.use(protect)

// Customer routes
ordersRouter.post('/',             createOrder)
ordersRouter.get('/my',            getMyOrders)
ordersRouter.get('/my/:id',        getOrder)
ordersRouter.put('/my/:id/cancel', cancelOrder)

// Admin routes
ordersRouter.get('/',              adminOnly, getAllOrders)
ordersRouter.get('/:id',           adminOnly, getAdminOrder)
ordersRouter.put('/:id/status',    adminOnly, updateOrderStatus)

export default ordersRouter