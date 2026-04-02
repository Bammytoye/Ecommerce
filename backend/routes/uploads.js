import { Router } from 'express'
import upload from '../middleware/upload.js'
import { protect, adminOnly } from '../middleware/auth.js'
import {uploadImage, uploadImages, deleteImage } from '../controllers/upload.controller.js'

const router = Router()

// Single image
router.post( '/single', protect, adminOnly, upload.single('image'), uploadImage )

// Multiple images
router.post( '/multiple', protect, adminOnly, upload.array('images', 5), // max 5 files uploadImages
)

// Delete
router.delete('/:publicId', protect, adminOnly, deleteImage)

export default router