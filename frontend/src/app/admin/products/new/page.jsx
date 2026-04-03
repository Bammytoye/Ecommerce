'use client'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        name: '', slug: '', description: '', basePrice: '', comparePrice: '',
        sku: '', stock: '', categoryId: '', isFeatured: false, isActive: true,
    })
    const [variants, setVariants] = useState([])
    const [imageUrl, setImageUrl] = useState('')

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/categories').then((r) => r.data),
    })

    const createProduct = useMutation({
        mutationFn: async (data) => {
            const payload = { ...data }
            if (imageUrl) {
                payload.images = [{ url: imageUrl, publicId: 'manual-upload', isPrimary: true, position: 0 }]
            }
            const res = await api.post('/products', payload)
            return res
        },
        onSuccess: () => {
            toast.success('Product created!')
            router.push('/admin/products')
        },
        onError: (err) => toast.error(err.response?.data?.error || 'Failed to create product'),
    })

    const update = (field) => (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setForm((f) => ({
            ...f,
            [field]: val,
            ...(field === 'name' ? { slug: val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : {}),
        }))
    }

    const addVariant = () => setVariants([...variants, { name: 'Size', value: '', stock: 0, sku: '' }])
    const removeVariant = (i) => setVariants(variants.filter((_, idx) => idx !== i))
    const updateVariant = (i, field, val) => setVariants(variants.map((v, idx) => idx === i ? { ...v, [field]: val } : v))

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.name || !form.sku || !form.basePrice || !form.categoryId) {
            toast.error('Please fill in all required fields')
            return
        }
        createProduct.mutate({ ...form, variants: variants.filter((v) => v.value) })
    }

    return (
        <div className="p-8">
            <Link href="/admin/products" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
                <ArrowLeft size={16} /> Back to Products
            </Link>

            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-white mb-1">Add New Product</h1>
                <p className="text-white/40">Fill in the details below to add a new product</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Main Info */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="card p-6 space-y-4">
                            <h2 className="font-display text-lg font-semibold text-white">Basic Information</h2>

                            <div>
                                <label className="text-white/60 text-sm mb-2 block">Product Name *</label>
                                <input className="input" placeholder="e.g. Premium Cotton T-Shirt" value={form.name} onChange={update('name')} required />
                            </div>

                            <div>
                                <label className="text-white/60 text-sm mb-2 block">Slug *</label>
                                <input className="input" placeholder="auto-generated-from-name" value={form.slug} onChange={update('slug')} required />
                                <p className="text-white/30 text-xs mt-1">URL: /products/{form.slug || 'product-slug'}</p>
                            </div>

                            <div>
                                <label className="text-white/60 text-sm mb-2 block">Description *</label>
                                <textarea className="input h-32 resize-none" placeholder="Describe the product..." value={form.description} onChange={update('description')} required />
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="card p-6 space-y-4">
                            <h2 className="font-display text-lg font-semibold text-white">Pricing & Inventory</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">Price ($) *</label>
                                    <input type="number" step="0.01" className="input" placeholder="0.00" value={form.basePrice} onChange={update('basePrice')} required />
                                </div>
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">Compare Price ($)</label>
                                    <input type="number" step="0.01" className="input" placeholder="0.00" value={form.comparePrice} onChange={update('comparePrice')} />
                                    <p className="text-white/30 text-xs mt-1">Original price (for discount display)</p>
                                </div>
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">SKU *</label>
                                    <input className="input" placeholder="e.g. TSH-001" value={form.sku} onChange={update('sku')} required />
                                </div>
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">Stock Quantity *</label>
                                    <input type="number" className="input" placeholder="0" value={form.stock} onChange={update('stock')} required />
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="card p-6 space-y-4">
                            <h2 className="font-display text-lg font-semibold text-white">Product Image</h2>
                            <div>
                                <label className="text-white/60 text-sm mb-2 block">Image URL</label>
                                <input className="input" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                                <p className="text-white/30 text-xs mt-1">Paste a direct image URL. Cloudinary upload coming soon.</p>
                            </div>
                            {imageUrl && (
                                <div className="w-32 h-32 rounded-xl overflow-hidden bg-dark-600">
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                </div>
                            )}
                        </div>

                        {/* Variants */}
                        <div className="card p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-display text-lg font-semibold text-white">Variants</h2>
                                <button type="button" onClick={addVariant} className="btn-secondary text-sm flex items-center gap-2 py-2">
                                    <Plus size={14} /> Add Variant
                                </button>
                            </div>
                            <p className="text-white/40 text-sm">Add size, color, or other variants with individual stock.</p>

                            {variants.map((v, i) => (
                                <div key={i} className="grid grid-cols-4 gap-3 p-4 bg-dark-600 rounded-xl">
                                    <div>
                                        <label className="text-white/40 text-xs mb-1 block">Type</label>
                                        <select className="input text-sm" value={v.name} onChange={(e) => updateVariant(i, 'name', e.target.value)}>
                                            <option>Size</option>
                                            <option>Color</option>
                                            <option>Style</option>
                                            <option>Material</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-white/40 text-xs mb-1 block">Value</label>
                                        <input className="input text-sm" placeholder="e.g. XL" value={v.value} onChange={(e) => updateVariant(i, 'value', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-white/40 text-xs mb-1 block">Stock</label>
                                        <input type="number" className="input text-sm" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} />
                                    </div>
                                    <div className="flex items-end">
                                        <button type="button" onClick={() => removeVariant(i)} className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Publish */}
                        <div className="card p-6 space-y-4">
                            <h2 className="font-display text-lg font-semibold text-white">Publish</h2>

                            <div className="flex items-center justify-between">
                                <span className="text-white/60 text-sm">Active</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={form.isActive} onChange={update('isActive')} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-dark-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-white/60 text-sm">Featured</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={form.isFeatured} onChange={update('isFeatured')} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-dark-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                </label>
                            </div>

                            <button type="submit" disabled={createProduct.isPending} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                                {createProduct.isPending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><Plus size={18} /> Create Product</>
                                )}
                            </button>
                        </div>

                        {/* Category */}
                        <div className="card p-6 space-y-4">
                            <h2 className="font-display text-lg font-semibold text-white">Category *</h2>
                            <select className="input" value={form.categoryId} onChange={update('categoryId')} required>
                                <option value="">Select category...</option>
                                {categoriesData?.categories?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <p className="text-white/30 text-xs">
                                No categories?{' '}
                                <span className="text-primary-400">Add via API first</span>
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}