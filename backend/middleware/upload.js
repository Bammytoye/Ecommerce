import multer from 'multer'

// store files temporarily
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // temp folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new Error('Only images are allowed'), false)
    }
}

const upload = multer({ storage, fileFilter })

export default upload