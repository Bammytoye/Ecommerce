'use client'
import { useAuthStore } from '@/store/authStore'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard, Package, ShoppingCart,
    Users, LogOut, ChevronRight, Store, ArrowLeft
} from 'lucide-react'

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminLayout({ children }) {
    const { user, logout } = useAuthStore()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!user) { router.push('/auth/login'); return }
        if (user.role !== 'ADMIN') { router.push('/'); return }
    }, [user])

    if (!user || user.role !== 'ADMIN') return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-dark-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-dark-800 border-r border-white/5 flex flex-col fixed h-full z-40">
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <Store size={20} className="text-primary-500" />
                        <span className="font-display text-lg font-bold text-white">
                            Shop<span className="text-primary-500">Nest</span>
                        </span>
                    </div>
                    <span className="text-xs text-white/30 bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full">
                        Admin Panel
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
                        return (
                            <Link key={href} href={href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-primary-500/20 text-primary-400 font-medium' : 'text-white/50 hover:text-white hover:bg-dark-600'}`}>
                                <Icon size={16} />
                                {label}
                                {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
                            </Link>
                        )
                    })}

                    {/* Back to store */}
                    <div className="pt-4 border-t border-white/5 mt-4">
                        <Link href="/"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/30 hover:text-white hover:bg-dark-600 transition-all">
                            <ArrowLeft size={16} />
                            Back to Store
                        </Link>
                    </div>
                </nav>

                {/* User */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-dark-700 rounded-xl">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user.firstName?.[0]}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-primary-400 text-xs">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); router.push('/auth/login') }}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-colors">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 ml-64 min-h-screen overflow-auto">
                {children}
            </main>
        </div>
    )
}