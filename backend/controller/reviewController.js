import { upsertReview, getProductReviews } from '../services/review.service.js'

// Add review
export const addReview = async (req, res) => {
    try {
        const { productId, rating, title, body } = req.body

        if (!productId || !rating) {
            return res.status(400).json({
                error: 'Product ID and rating are required'
            })
        }

        // optional: validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5'
            })
        }

        const review = await upsertReview(req.user.id, productId, {
            rating,
            title,
            body
        })

        res.status(201).json({ review })

    } catch (error) {
        res.status(500).json({ error: 'Failed to submit review' })
    }
}

// Get reviews
export const fetchProductReviews = async (req, res) => {
    try {
        const { productId } = req.params

        const [reviews, stats] = await Promise.all([
            getProductReviews(productId),
            getProductReviewStats(productId)
        ])

        res.json({
            reviews,
            stats: {
                averageRating: stats._avg.rating || 0,
                totalReviews: stats._count.rating
            }
        })

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' })
    }
}