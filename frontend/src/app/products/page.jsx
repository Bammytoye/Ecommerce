'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import ProductCard from '@/components/product/ProductCard'
import { SlidersHorizontal, Search, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function ProductsPage() {
    const searchParams = useSearchParams()
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        minPrice: '',
        maxPrice: '',
        sort: 'createdAt',
        order: 'desc',
        page: 1,
    })

    const { data, isLoading } = useQuery({
        queryKey: ['products', filters],
        queryFn: () => api.get('/products', { params: filters }).then((r) => r.data),
        keepPreviousData: true,
    })

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/categories').then((r) => r.data),
    })

    const update = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }))

    return (
        <div className="min-h-screen bg-dark-900">
            <div className="container-custom py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="section-title mb-2">All Products</h1>
                    <p className="text-white/40">{data?.pagination?.total || 0} products found</p>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="card p-6 sticky top-24 space-y-6">
                            <h3 className="text-white font-medium">Filters</h3>

                            {/* Search */}
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Search</label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="text"
                                        className="input pl-9 text-sm"
                                        placeholder="Search products..."
                                        value={filters.search}
                                        onChange={(e) => update('search', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Category</label>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => update('category', '')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-primary-500/20 text-primary-400' : 'text-white/60 hover:text-white hover:bg-dark-600'}`}>
                                        All Categories
                                    </button>
                                    {categoriesData?.categories?.map((cat) => (
                                        <button key={cat.id}
                                            onClick={() => update('category', cat.slug)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat.slug ? 'bg-primary-500/20 text-primary-400' : 'text-white/60 hover:text-white hover:bg-dark-600'}`}>
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Price Range</label>
                                <div className="flex gap-2">
                                    <input type="number" className="input text-sm" placeholder="Min" value={filters.minPrice} onChange={(e) => update('minPrice', e.target.value)} />
                                    <input type="number" className="input text-sm" placeholder="Max" value={filters.maxPrice} onChange={(e) => update('maxPrice', e.target.value)} />
                                </div>
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Sort By</label>
                                <select
                                    className="input text-sm"
                                    value={`${filters.sort}-${filters.order}`}
                                    onChange={(e) => {
                                        const [sort, order] = e.target.value.split('-')
                                        setFilters((f) => ({ ...f, sort, order }))
                                    }}>
                                    <option value="createdAt-desc">Newest First</option>
                                    <option value="basePrice-asc">Price: Low to High</option>
                                    <option value="basePrice-desc">Price: High to Low</option>
                                    <option value="name-asc">Name A-Z</option>
                                </select>
                            </div>

                            {/* Clear filters */}
                            {(filters.search || filters.category || filters.minPrice || filters.maxPrice) && (
                                <button
                                    onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: 'createdAt', order: 'desc', page: 1 })}
                                    className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors">
                                    <X size={14} /> Clear Filters
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="card h-80 animate-pulse bg-dark-600" />
                                ))}
                            </div>
                        ) : data?.products?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/30">
                                <SlidersHorizontal size={48} strokeWidth={1} />
                                <p className="text-lg">No products found</p>
                                <p className="text-sm">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {data?.products?.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {data?.pagination?.pages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-10">
                                        {Array.from({ length: data.pagination.pages }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                                                className={`w-10 h-10 rounded-xl text-sm transition-colors ${filters.page === i + 1 ? 'bg-primary-500 text-white' : 'bg-dark-600 text-white/60 hover:text-white'}`}>
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}