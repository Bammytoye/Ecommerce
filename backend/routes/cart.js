import { Router } from 'express'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/',                   getCart)
router.post('/',                  addToCart)
router.put('/items/:itemId',      updateCartItem)
router.delete('/items/:itemId',   removeFromCart)
router.delete('/',                clearCart)

export default router