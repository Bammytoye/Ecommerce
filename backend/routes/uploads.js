import { Router } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { protect, adminOnly } from '../middleware/auth.js'

const router = Router()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload image (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { image, folder = 'products' } = req.body

        if (!image) return res.status(400).json({ error: 'No image provided' })

        const result = await cloudinary.uploader.upload(image, {
            folder: `ecommerce/${folder}`,
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
        })

        res.json({
            url: result.secure_url,
            publicId: result.public_id,
        })
    } catch (error) {
        res.status(500).json({ error: 'Image upload failed' })
    }
})

// Delete image (admin only)
router.delete('/:publicId', protect, adminOnly, async (req, res) => {
    try {
        await cloudinary.uploader.destroy(req.params.publicId)
        res.json({ message: 'Image deleted' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete image' })
    }
})

export default router