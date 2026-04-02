import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import { fetchCategories, fetchCategory, addCategory, editCategory } from '../controllers/categoryController.js'

const categoriesRouter = Router()

categoriesRouter.get('/', fetchCategories)
categoriesRouter.get('/:slug', fetchCategory)

//admin
categoriesRouter.post('/', protect, adminOnly, addCategory)
categoriesRouter.put('/:id', protect, adminOnly, editCategory)

export default categoriesRouter