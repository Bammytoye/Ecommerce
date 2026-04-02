import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import { fetchCategories, fetchCategory, addCategory, editCategory } from '../controllers/category.controller.js'

const router = Router()

router.get('/', fetchCategories)
router.get('/:slug', fetchCategory)

router.post('/', protect, adminOnly, addCategory)
router.put('/:id', protect, adminOnly, editCategory)

export default router