'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, ArrowUpRight, Clock } from 'lucide-react'
import Link from 'next/link'

const statusColors = {
    PENDING: 'bg-amber-500/20 text-amber-400',
    CONFIRMED: 'bg-blue-500/20 text-blue-400',
    PROCESSING: 'bg-purple-500/20 text-purple-400',
    SHIPPED: 'bg-cyan-500/20 text-cyan-400',
    DELIVERED: 'bg-green-500/20 text-green-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
}

export default function AdminDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => api.get('/admin/stats').then((r) => r.data),
    })

    const stats = [
        {
            label: 'Total Revenue',
            value: `$${Number(data?.stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'text-green-400 bg-green-500/20',
            change: '+12.5%',
        },
        {
            label: 'Total Orders',
            value: data?.stats?.totalOrders || 0,
            icon: ShoppingCart,
            color: 'text-blue-400 bg-blue-500/20',
            change: '+8.2%',
        },
        {
            label: 'Total Customers',
            value: data?.stats?.totalUsers || 0,
            icon: Users,
            color: 'text-purple-400 bg-purple-500/20',
            change: '+3.1%',
        },
        {
            label: 'Total Products',
            value: data?.stats?.totalProducts || 0,
            icon: Package,
            color: 'text-amber-400 bg-amber-500/20',
            change: '+5.7%',
        },
    ]

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-white mb-1">Dashboard</h1>
                <p className="text-white/40">Welcome back! Shop Nest Admin</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
                                    <Icon size={22} />
                                </div>
                                <span className="flex items-center gap-1 text-green-400 text-sm font-medium">
                                    <TrendingUp size={12} /> {stat.change}
                                </span>
                            </div>
                            <p className="text-white/40 text-sm mb-1">{stat.label}</p>
                            {isLoading ? (
                                <div className="h-8 bg-dark-600 rounded animate-pulse w-24" />
                            ) : (
                                <p className="font-display text-3xl font-bold text-white">{stat.value}</p>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="xl:col-span-2 card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-xl font-semibold text-white">Recent Orders</h2>
                        <Link href="/admin/orders" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 transition-colors">
                            View all <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-dark-600 rounded-xl animate-pulse" />)}
                        </div>
                    ) : data?.recentOrders?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-white/30 gap-3">
                            <ShoppingCart size={40} strokeWidth={1} />
                            <p>No orders yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data?.recentOrders?.map((order) => (
                                <Link key={order.id} href={`/admin/orders`}
                                    className="flex items-center justify-between p-4 bg-dark-600 hover:bg-dark-500 rounded-xl transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                            <ShoppingCart size={16} className="text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">{order.orderNumber}</p>
                                            <p className="text-white/40 text-xs">{order.user?.firstName} {order.user?.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`badge ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'} text-xs`}>
                                            {order.status}
                                        </span>
                                        <p className="text-white font-semibold text-sm">${Number(order.total || 0).toFixed(2)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <div className="card p-6">
                        <h2 className="font-display text-xl font-semibold text-white mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Add New Product', href: '/admin/products/new', icon: Package, color: 'text-amber-400 bg-amber-500/20' },
                                { label: 'View All Orders', href: '/admin/orders', icon: ShoppingCart, color: 'text-blue-400 bg-blue-500/20' },
                                { label: 'Manage Users', href: '/admin/users', icon: Users, color: 'text-purple-400 bg-purple-500/20' },
                                { label: 'View Storefront', href: '/', icon: Package, color: 'text-green-400 bg-green-500/20' },
                            ].map(({ label, href, icon: Icon, color }) => (
                                <Link key={label} href={href}
                                    className="flex items-center gap-3 p-3 bg-dark-600 hover:bg-dark-500 rounded-xl transition-colors group">
                                    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
                                        <Icon size={16} />
                                    </div>
                                    <span className="text-white/70 group-hover:text-white text-sm transition-colors">{label}</span>
                                    <ArrowUpRight size={14} className="ml-auto text-white/20 group-hover:text-white/60 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Low Stock */}
                    <div className="card p-6">
                        <h2 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock size={16} className="text-amber-400" /> Low Stock Alert
                        </h2>
                        {data?.lowStockProducts?.length === 0 ? (
                            <p className="text-white/30 text-sm">All products well stocked ✓</p>
                        ) : (
                            <div className="space-y-2">
                                {data?.lowStockProducts?.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between">
                                        <p className="text-white/60 text-sm truncate flex-1">{p.name}</p>
                                        <span className="badge bg-red-500/20 text-red-400 ml-2">{p.stock} left</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}