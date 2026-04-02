import {
    uploadSingleImage,
    uploadMultipleImages,
    deleteImageService
} from '../services/uploadService.js'

// Single upload
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }

        const folder = req.body.folder || 'products'

        const result = await uploadSingleImage(req.file, folder)

        res.json(result)
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' })
    }
}

// Multiple upload
export const uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' })
        }

        const folder = req.body.folder || 'products'

        const results = await uploadMultipleImages(req.files, folder)

        res.json(results)
    } catch (error) {
        res.status(500).json({ error: 'Multiple upload failed' })
    }
}

// Delete
export const deleteImage = async (req, res) => {
    try {
        await deleteImageService(req.params.publicId)
        res.json({ message: 'Image deleted' })
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' })
    }
}