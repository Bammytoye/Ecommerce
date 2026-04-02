import { Router } from 'express'
import upload from '../middleware/upload.js'
import { protect, adminOnly } from '../middleware/auth.js'
import {uploadImage, uploadImages, deleteImage } from '../controllers/uploadController.js'

const uploadsRouter = Router()

// Single image
uploadsRouter.post( '/single', protect, adminOnly, upload.single('image'), uploadImage )

// Multiple images
uploadsRouter.post( '/multiple', protect, adminOnly, upload.array('images', 5), // max 5 files uploadImages
)

// Delete
uploadsRouter.delete('/:publicId', protect, adminOnly, deleteImage)

export default uploadsRouter