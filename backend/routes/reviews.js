import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { addReview, fetchProductReviews } from '../controllers/review.controller.js'

const router = Router()

router.post('/', protect, addReview)
router.get('/product/:productId', fetchProductReviews)

export default router