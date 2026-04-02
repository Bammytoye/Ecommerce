import { Router } from 'express'
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeaturedProducts } from '../controllers/productController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

router.get('/',           getProducts)
router.get('/featured',   getFeaturedProducts)
router.get('/:slug',      getProduct)
router.post('/',          protect, adminOnly, createProduct)
router.put('/:id',        protect, adminOnly, updateProduct)
router.delete('/:id',     protect, adminOnly, deleteProduct)

export default router