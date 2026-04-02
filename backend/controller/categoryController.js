import { getAllCategories, getCategoryBySlug, createCategory, updateCategory } from '../services/category.service.js'

// Get all
export const fetchCategories = async (req, res) => {
    try {
        const categories = await getAllCategories()
        res.json({ categories })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' })
    }
}

// Get single
export const fetchCategory = async (req, res) => {
    try {
        const category = await getCategoryBySlug(req.params.slug)

        if (!category) {
            return res.status(404).json({ error: 'Category not found' })
        }

        res.json({ category })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category' })
    }
}

// Create
export const addCategory = async (req, res) => {
    try {
        const { name, slug } = req.body

        if (!name || !slug) {
            return res.status(400).json({
                error: 'Name and slug are required'
            })
        }

        const category = await createCategory(req.body)

        res.status(201).json({ category })
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' })
    }
}

// Update
export const editCategory = async (req, res) => {
    try {
        const category = await updateCategory(req.params.id, req.body)
        res.json({ category })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' })
    }
}