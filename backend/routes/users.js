import { Router } from 'express'
import { getProfile, updateProfile, addAddress, updateAddress, deleteAddress, getWishlist, toggleWishlist } from '../controllers/userController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.use(protect)

router.get('/profile',              getProfile)
router.put('/profile',              updateProfile)
router.post('/addresses',           addAddress)
router.put('/addresses/:id',        updateAddress)
router.delete('/addresses/:id',     deleteAddress)
router.get('/wishlist',             getWishlist)
router.post('/wishlist',            toggleWishlist)

export default router