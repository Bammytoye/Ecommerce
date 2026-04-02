import { Router } from 'express'
import { getProducts, 
    getProduct, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getFeaturedProducts } from '../controllers/productController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const productsRouter = Router()

productsRouter.get('/',           getProducts)
productsRouter.get('/featured',   getFeaturedProducts)
productsRouter.get('/:slug',      getProduct)

//admin
productsRouter.post('/',          protect, adminOnly, createProduct)
productsRouter.put('/:id',        protect, adminOnly, updateProduct)
productsRouter.delete('/:id',     protect, adminOnly, deleteProduct)

export default productsRouter