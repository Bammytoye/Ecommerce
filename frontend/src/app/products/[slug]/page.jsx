'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { ShoppingCart, Heart, Star, Truck, Shield, ArrowLeft, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ProductPage() {
    const { slug } = useParams()
    const { addItem } = useCartStore()
    const { user } = useAuthStore()
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [activeImage, setActiveImage] = useState(0)

    const { data, isLoading } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => api.get(`/products/${slug}`).then((r) => r.data),
    })

    const product = data?.product

    const handleAddToCart = async () => {
        if (!user) { toast.error('Please login first'); return }
        await addItem(product.id, selectedVariant, quantity)
    }

    if (isLoading) return (
        <div className="min-h-screen bg-dark-900 container-custom py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="aspect-square bg-dark-600 rounded-2xl animate-pulse" />
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-dark-600 rounded animate-pulse" />)}
                </div>
            </div>
        </div>
    )

    if (!product) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="text-center text-white/40">
                <p className="text-2xl mb-4">Product not found</p>
                <Link href="/products" className="btn-primary">Browse Products</Link>
            </div>
        </div>
    )

    const avgRating = product.reviews?.length
        ? product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length : 0

    return (
        <div className="min-h-screen bg-dark-900">
            <div className="container-custom py-12">
                {/* Breadcrumb */}
                <Link href="/products" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back to Products
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Images */}
                    <div className="space-y-4">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-dark-700">
                            <img
                                src={product.images?.[activeImage]?.url || 'https://placehold.co/600x600/1a1a1a/333'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto">
                                {product.images.map((img, i) => (
                                    <button key={i} onClick={() => setActiveImage(i)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-primary-500' : 'border-white/10'}`}>
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-primary-500 text-sm font-medium mb-2">{product.category?.name}</p>
                            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">{product.name}</h1>

                            {avgRating > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="flex">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} size={16} className={i < Math.round(avgRating) ? 'text-amber-400' : 'text-white/20'} fill="currentColor" />
                                        ))}
                                    </div>
                                    <span className="text-white/60 text-sm">({product._count?.reviews} reviews)</span>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="flex items-end gap-4">
                            <span className="font-display text-4xl font-bold text-white">${Number(product.basePrice).toFixed(2)}</span>
                            {product.comparePrice && (
                                <span className="text-white/30 text-xl line-through mb-1">${Number(product.comparePrice).toFixed(2)}</span>
                            )}
                        </div>

                        <p className="text-white/60 leading-relaxed">{product.description}</p>

                        {/* Variants */}
                        {product.variants?.length > 0 && (
                            <div>
                                <p className="text-white/60 text-sm mb-3">Select {product.variants[0]?.name}</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((v) => (
                                        <button key={v.id} onClick={() => setSelectedVariant(v.id)}
                                            className={`px-4 py-2 rounded-xl text-sm border transition-all ${selectedVariant === v.id ? 'border-primary-500 bg-primary-500/20 text-primary-400' : 'border-white/10 text-white/60 hover:border-white/30'}`}>
                                            {v.value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="flex items-center gap-4">
                            <p className="text-white/60 text-sm">Quantity</p>
                            <div className="flex items-center gap-3 bg-dark-600 rounded-xl p-1">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-white/60 hover:text-white transition-colors">
                                    <Minus size={16} />
                                </button>
                                <span className="text-white w-8 text-center font-medium">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-white/60 hover:text-white transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>
                            <span className="text-white/40 text-sm">{product.stock} in stock</span>
                        </div>

                        {/* Add to Cart */}
                        <div className="flex gap-3">
                            <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2 py-4">
                                <ShoppingCart size={20} /> Add to Cart
                            </button>
                            <button className="btn-secondary p-4">
                                <Heart size={20} />
                            </button>
                        </div>

                        {/* Trust */}
                        <div className="border-t border-white/5 pt-6 space-y-3">
                            {[
                                { icon: Truck, text: 'Free shipping on orders over $100' },
                                { icon: Shield, text: 'Secure checkout & 30-day returns' },
                            ].map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-3 text-white/40 text-sm">
                                    <Icon size={16} className="text-primary-500" /> {text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reviews */}
                {product.reviews?.length > 0 && (
                    <div className="border-t border-white/5 pt-12">
                        <h2 className="section-title mb-8">Customer Reviews</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {product.reviews.map((review) => (
                                <div key={review.id} className="card p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold">
                                            {review.user?.firstName?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">{review.user?.firstName} {review.user?.lastName}</p>
                                            <div className="flex">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} size={12} className={i < review.rating ? 'text-amber-400' : 'text-white/20'} fill="currentColor" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {review.title && <p className="text-white font-medium mb-1">{review.title}</p>}
                                    {review.body && <p className="text-white/60 text-sm">{review.body}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}