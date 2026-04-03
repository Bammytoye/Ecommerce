'use client'
import { useCartStore } from '@/store/cartStore'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CartDrawer() {
    const { items, isOpen, closeCart, updateItem, removeItem, total } = useCartStore()

    const cartTotal = items.reduce((sum, item) => {
        const price = item.variant?.price || item.product?.basePrice || 0
        return sum + Number(price) * item.quantity
    }, 0)

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={closeCart} />
            )}

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-dark-800 border-l border-white/5 z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={20} className="text-primary-500" />
                        <h2 className="font-display text-xl font-semibold text-white">Your Cart</h2>
                        <span className="badge bg-primary-500/20 text-primary-400">{items.length}</span>
                    </div>
                    <button onClick={closeCart} className="p-2 text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
                            <ShoppingBag size={48} strokeWidth={1} />
                            <p className="text-lg">Your cart is empty</p>
                            <button onClick={closeCart} className="btn-outline text-sm">Continue Shopping</button>
                        </div>
                    ) : (
                        items.map((item) => {
                            const price = item.variant?.price || item.product?.basePrice || 0
                            const image = item.product?.images?.[0]?.url || 'https://placehold.co/80x80/1a1a1a/333'
                            return (
                                <div key={item.id} className="flex gap-4 p-4 card">
                                    <img src={image} alt={item.product?.name} className="w-20 h-20 object-cover rounded-xl bg-dark-600 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium line-clamp-2 mb-1">{item.product?.name}</p>
                                        {item.variant && <p className="text-white/40 text-xs mb-2">{item.variant.name}: {item.variant.value}</p>}
                                        <p className="text-primary-400 font-semibold">${(Number(price) * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-between">
                                        <button onClick={() => removeItem(item.id)} className="text-white/30 hover:text-red-400 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="flex items-center gap-2 bg-dark-600 rounded-lg p-1">
                                            <button onClick={() => updateItem(item.id, item.quantity - 1)} className="p-1 text-white/60 hover:text-white transition-colors">
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                                            <button onClick={() => updateItem(item.id, item.quantity + 1)} className="p-1 text-white/60 hover:text-white transition-colors">
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-white/60">Subtotal</span>
                            <span className="text-white font-semibold text-lg">${cartTotal.toFixed(2)}</span>
                        </div>
                        <p className="text-white/30 text-xs">Shipping and taxes calculated at checkout</p>
                        <Link href="/checkout" onClick={closeCart} className="btn-primary w-full flex items-center justify-center gap-2">
                            Checkout <ArrowRight size={16} />
                        </Link>
                        <button onClick={closeCart} className="btn-secondary w-full text-sm">
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}