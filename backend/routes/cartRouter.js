import { Router } from 'express'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js'
import { protect } from '../middleware/auth.js'

const cartRouter = Router()

cartRouter.use(protect)

cartRouter.get('/',                   getCart)
cartRouter.post('/',                  addToCart)
cartRouter.put('/items/:itemId',      updateCartItem)
cartRouter.delete('/items/:itemId',   removeFromCart)
cartRouter.delete('/',                clearCart)

export default cartRouter