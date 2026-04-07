'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import ProductCard from '@/components/product/ProductCard'
import { Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function FeaturedPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['featured-products-page'],
        queryFn: () => api.get('/products', { params: { featured: true, limit: 20 } }).then((r) => r.data),
    })

    return (
        <div className="min-h-screen bg-dark-900">
            {/* Hero */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.15),transparent_60%)]" />
                <div className="container-custom relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <Star size={14} fill="currentColor" /> Handpicked for you
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
                        Featured Products
                    </h1>
                    <p className="text-white/50 text-lg max-w-xl mx-auto">
                        Our best picks across every category curated for quality, value and style.
                    </p>
                </div>
            </section>

            {/* Products */}
            <section className="container-custom pb-20">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="card h-80 animate-pulse bg-dark-600" />
                        ))}
                    </div>
                ) : data?.products?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/30">
                        <Star size={48} strokeWidth={1} />
                        <p className="text-lg">No featured products yet</p>
                        <Link href="/products" className="btn-primary text-sm">Browse All Products</Link>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <p className="text-white/40">{data?.products?.length} featured products</p>
                            <Link href="/products" className="flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm transition-colors">
                                View all products <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {data?.products?.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    )
}