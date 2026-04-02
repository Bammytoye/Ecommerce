import cloudinary from '../config/cloudinary.js'
import fs from 'fs'

export const uploadSingleImage = async (file, folder) => {
    const result = await cloudinary.uploader.upload(file.path, {
        folder: `ecommerce/${folder}`,
    })

    fs.unlinkSync(file.path) // delete temp file

    return {
        url: result.secure_url,
        publicId: result.public_id,
    }
}

export const uploadMultipleImages = async (files, folder) => {
    const uploads = files.map(file =>
        cloudinary.uploader.upload(file.path, {
            folder: `ecommerce/${folder}`,
        })
    )

    const results = await Promise.all(uploads)

    // delete all temp files
    files.forEach(file => fs.unlinkSync(file.path))

    return results.map(result => ({
        url: result.secure_url,
        publicId: result.public_id,
    }))
}

export const deleteImageService = async (publicId) => {
    return cloudinary.uploader.destroy(publicId)
}