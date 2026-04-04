'use client'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage() {
    const { id } = useParams()
    const router = useRouter()
    const [form, setForm] = useState(null)

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/categories').then((r) => r.data),
    })

    const { data: productData, isLoading } = useQuery({
        queryKey: ['admin-product', id],
        queryFn: () => api.get(`/products`).then((r) => {
            const p = r.data.products?.find((p) => p.id === id)
            return { product: p }
        }),
    })

    useEffect(() => {
        if (productData?.product) {
            const p = productData.product
            setForm({
                name: p.name || '',
                slug: p.slug || '',
                description: p.description || '',
                basePrice: p.basePrice || '',
                comparePrice: p.comparePrice || '',
                sku: p.sku || '',
                stock: p.stock || 0,
                categoryId: p.categoryId || '',
                isFeatured: p.isFeatured || false,
                isActive: p.isActive !== false,
            })
        }
    }, [productData])

    const updateProduct = useMutation({
        mutationFn: (data) => api.put(`/products/${id}`, data),
        onSuccess: () => {
            toast.success('Product updated successfully!')
            router.push('/admin/products')
        },
        onError: (err) => toast.error(err.response?.data?.error || 'Failed to update product'),
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        updateProduct.mutate(form)
    }

    const update = (field) => (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setForm((f) => ({ ...f, [field]: val }))
    }

    if (isLoading || !form) return (
        <div className="p-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-dark-600" />)}
        </div>
    )

    return (
        <div className="p-8">
            <Link href="/admin/products" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
                <ArrowLeft size={16} /> Back to Products
            </Link>

            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-white mb-1">Edit Product</h1>
                <p className="text-white/40">Update product details, pricing and stock</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">

                        {/* Basic Info */}
                        <div className="card p-6 space-y-4">
                            <h2 className="font-display text-lg font-semibold text-white">Basic Information</h2>
                            <div>
                                <label className="text-white/60 text-sm mb-2 block">Product Name</label>
                                <input className="input" value={form.name} onChange={update('name')} required />
                            </div>
                            <div>
                                <label className="text-white/60 text-sm mb-2 block">Slug</label>
                                <input className="input" value={form.slug} onChange={update('slug')} required />
                            </div>
                            <div>
                                <label className="text-white/60 text-sm mb-2 block">Description</label>
                                <textarea className="input h-32 resize-none" value={form.description} onChange={update('description')} required />
                            </div>
                        </div>

                        {/* Pricing & Stock */}
                        <div className="card p-6 space-y-4">
                            <h2 className="font-display text-lg font-semibold text-white">Pricing & Stock</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">Price ($)</label>
                                    <input type="number" step="0.01" className="input" value={form.basePrice} onChange={update('basePrice')} required />
                                </div>
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">Compare Price ($)</label>
                                    <input type="number" step="0.01" className="input" value={form.comparePrice || ''} onChange={update('comparePrice')} />
                                </div>
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">SKU</label>
                                    <input className="input" value={form.sku} onChange={update('sku')} required />
                                </div>
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">Stock Quantity</label>
                                    <input type="number" className="input" value={form.stock} onChange={update('stock')} required />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="card p-6 space-y-4">
                            <h2 className="font-display text-lg font-semibold text-white">Publish</h2>
                            <div className="flex items-center justify-between">
                                <span className="text-white/60 text-sm">Active</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={form.isActive} onChange={update('isActive')} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-dark-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/60 text-sm">Featured</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={form.isFeatured} onChange={update('isFeatured')} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-dark-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                </label>
                            </div>
                            <button type="submit" disabled={updateProduct.isPending} className="btn-primary w-full flex items-center justify-center gap-2">
                                {updateProduct.isPending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><Save size={18} /> Save Changes</>
                                )}
                            </button>
                        </div>

                        <div className="card p-6 space-y-4">
                            <h2 className="font-display text-lg font-semibold text-white">Category</h2>
                            <select className="input" value={form.categoryId} onChange={update('categoryId')} required>
                                <option value="">Select category...</option>
                                {categoriesData?.categories?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}