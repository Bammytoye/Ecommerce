'use client'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore.js'
import { useCartStore } from '@/store/cartStore'
import { ShoppingCart, User, Search, Menu, X, Heart, LogOut } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
    const { user, logout } = useAuthStore()
    const { items, toggleCart } = useCartStore()
    const [menuOpen, setMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

    return (
        <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="font-display text-2xl font-bold text-white">
                        Shop<span className="text-primary-500">Nest</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/products" className="text-white/60 hover:text-white text-sm transition-colors">Products</Link>
                        <Link href="/products?category=electronics" className="text-white/60 hover:text-white text-sm transition-colors">Electronics</Link>
                        <Link href="/products?category=clothing" className="text-white/60 hover:text-white text-sm transition-colors">Clothing</Link>
                        <Link href="/products?featured=true" className="text-white/60 hover:text-white text-sm transition-colors">Featured</Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Link href="/products" className="p-2 text-white/60 hover:text-white transition-colors">
                            <Search size={20} />
                        </Link>

                        {user && (
                            <Link href="/account/wishlist" className="p-2 text-white/60 hover:text-white transition-colors">
                                <Heart size={20} />
                            </Link>
                        )}

                        {/* Cart */}
                        <button onClick={toggleCart} className="relative p-2 text-white/60 hover:text-white transition-colors">
                            <ShoppingCart size={20} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        {/* User Menu */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 bg-dark-600 hover:bg-dark-500 px-3 py-2 rounded-xl transition-colors"
                                >
                                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {user.firstName?.[0]}
                                    </div>
                                    <span className="text-white text-sm hidden sm:block">{user.firstName}</span>
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 top-12 w-48 bg-dark-700 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                        <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-dark-600 text-sm transition-colors" onClick={() => setUserMenuOpen(false)}>
                                            <User size={16} /> My Account
                                        </Link>
                                        <Link href="/orders" className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-dark-600 text-sm transition-colors" onClick={() => setUserMenuOpen(false)}>
                                            <ShoppingCart size={16} /> My Orders
                                        </Link>
                                        {user.role === 'ADMIN' && (
                                            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-primary-400 hover:text-primary-300 hover:bg-dark-600 text-sm transition-colors" onClick={() => setUserMenuOpen(false)}>
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <div className="border-t border-white/10" />
                                        <button onClick={() => { logout(); setUserMenuOpen(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-dark-600 text-sm transition-colors">
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/auth/login" className="btn-primary text-sm py-2 px-4">
                                Sign In
                            </Link>
                        )}

                        {/* Mobile menu toggle */}
                        <button className="md:hidden p-2 text-white/60" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden border-t border-white/5 py-4 space-y-2">
                        {['Products', 'Electronics', 'Clothing', 'Featured'].map((item) => (
                            <Link key={item} href={`/products${item !== 'Products' ? `?category=${item.toLowerCase()}` : ''}`}
                                className="block px-4 py-2 text-white/60 hover:text-white text-sm"
                                onClick={() => setMenuOpen(false)}>
                                {item}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
}