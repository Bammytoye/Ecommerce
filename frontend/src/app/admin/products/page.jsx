'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Plus, Search, Edit2, Trash2, Package, Eye, EyeOff } from 'lucide-react'

export default function AdminProductsPage() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    const { data, isLoading } = useQuery({
        queryKey: ['admin-products', search, page],
        queryFn: () => api.get('/products', { params: { search, page, limit: 15 } }).then((r) => r.data),
    })

    const deleteProduct = useMutation({
        mutationFn: (id) => api.delete(`/products/${id}`),
        onSuccess: () => {
            toast.success('Product deleted')
            queryClient.invalidateQueries(['admin-products'])
        },
        onError: () => toast.error('Failed to delete product'),
    })

    const handleDelete = (id, name) => {
        if (confirm(`Delete "${name}"? This cannot be undone.`)) {
            deleteProduct.mutate(id)
        }
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-white mb-1">Products</h1>
                    <p className="text-white/40">{data?.pagination?.total || 0} total products</p>
                </div>
                <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add Product
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                    type="text"
                    className="input pl-11 max-w-md"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Product</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Category</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Price</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Stock</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Status</th>
                                <th className="text-right px-6 py-4 text-white/40 text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-4 bg-dark-600 rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : data?.products?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-white/30">
                                            <Package size={40} strokeWidth={1} />
                                            <p>No products found</p>
                                            <Link href="/admin/products/new" className="btn-primary text-sm">Add First Product</Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data?.products?.map((product) => (
                                    <tr key={product.id} className="border-b border-white/5 hover:bg-dark-700 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-dark-600 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={product.images?.[0]?.url || 'https://placehold.co/48x48/1a1a1a/333'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium line-clamp-1">{product.name}</p>
                                                    <p className="text-white/30 text-xs">SKU: {product.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white/60 text-sm">{product.category?.name || '—'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-white text-sm font-medium">${Number(product.basePrice).toFixed(2)}</p>
                                                {product.comparePrice && (
                                                    <p className="text-white/30 text-xs line-through">${Number(product.comparePrice).toFixed(2)}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge text-xs ${product.stock <= product.lowStockAt ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {product.stock} units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge text-xs ${product.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/products/${product.slug}`} target="_blank"
                                                    className="p-2 text-white/30 hover:text-white transition-colors" title="View">
                                                    <Eye size={16} />
                                                </Link>
                                                <Link href={`/admin/products/${product.id}`}
                                                    className="p-2 text-white/30 hover:text-primary-400 transition-colors" title="Edit">
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    className="p-2 text-white/30 hover:text-red-400 transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data?.pagination?.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                        <p className="text-white/40 text-sm">
                            Page {page} of {data.pagination.pages}
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="btn-secondary text-sm py-2 px-4 disabled:opacity-30">Previous</button>
                            <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pagination.pages}
                                className="btn-secondary text-sm py-2 px-4 disabled:opacity-30">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}