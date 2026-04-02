import { Router } from 'express'
import { getProfile, 
    updateProfile, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    getWishlist, 
    toggleWishlist } from '../controllers/userController.js'
import { protect } from '../middleware/auth.js'

const usersRouter = Router()

usersRouter.use(protect)

usersRouter.get('/profile',              getProfile)
usersRouter.put('/profile',              updateProfile)
usersRouter.post('/addresses',           addAddress)
usersRouter.put('/addresses/:id',        updateAddress)
usersRouter.delete('/addresses/:id',     deleteAddress)
usersRouter.get('/wishlist',             getWishlist)
usersRouter.post('/wishlist',            toggleWishlist)

export default usersRouter