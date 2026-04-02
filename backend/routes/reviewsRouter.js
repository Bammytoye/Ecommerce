import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { addReview, fetchProductReviews } from '../controllers/reviewController.js'

const reviewsRouter = Router()

reviewsRouter.post('/', protect, addReview)
reviewsRouter.get('/product/:productId', fetchProductReviews)

export default reviewsRouter