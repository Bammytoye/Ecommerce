'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
    const { addItem } = useCartStore()
    const { user } = useAuthStore()

    const image = product.images?.[0]?.url || 'https://placehold.co/400x400/1a1a1a/333?text=No+Image'
    const discount = product.comparePrice
        ? Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)
        : null
    const avgRating = product.avgRating || 0

    const handleAddToCart = async (e) => {
        e.preventDefault()
        if (!user) {
            toast.error('Please login to add items to cart')
            return
        }
        await addItem(product.id, null, 1)
    }

    return (
        <Link href={`/products/${product.slug}`} className="card group cursor-pointer hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-dark-600">
                <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {discount && (
                    <div className="absolute top-3 left-3 badge bg-primary-500 text-white">
                        -{discount}%
                    </div>
                )}
                {product.isFeatured && (
                    <div className="absolute top-3 right-3 badge bg-dark-900/80 text-white/70 backdrop-blur-sm">
                        ⭐ Featured
                    </div>
                )}

                {/* Quick add overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                        onClick={handleAddToCart}
                        className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2"
                    >
                        <ShoppingCart size={16} /> Add to Cart
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <p className="text-white/40 text-xs mb-1">{product.category?.name}</p>
                <h3 className="text-white font-medium text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                    {product.name}
                </h3>

                {/* Rating */}
                {avgRating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star size={12} className="text-amber-400" fill="currentColor" />
                        <span className="text-white/50 text-xs">{avgRating.toFixed(1)} ({product.reviewCount || 0})</span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">${Number(product.basePrice).toFixed(2)}</span>
                    {product.comparePrice && (
                        <span className="text-white/30 text-sm line-through">${Number(product.comparePrice).toFixed(2)}</span>
                    )}
                </div>
            </div>
        </Link>
    )
}