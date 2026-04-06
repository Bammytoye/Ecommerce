'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Package, ArrowRight, Clock } from 'lucide-react'

const statusColors = {
    PENDING: 'bg-amber-500/20 text-amber-400',
    CONFIRMED: 'bg-blue-500/20 text-blue-400',
    PROCESSING: 'bg-purple-500/20 text-purple-400',
    SHIPPED: 'bg-cyan-500/20 text-cyan-400',
    DELIVERED: 'bg-green-500/20 text-green-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
    REFUNDED: 'bg-gray-500/20 text-gray-400',
}

export default function OrdersPage() {
    const { user } = useAuthStore()
    const router = useRouter()

    useEffect(() => { if (!user) router.push('/auth/login') }, [user])

    const { data, isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: () => api.get('/orders/my').then((r) => r.data),
        enabled: !!user,
    })

    if (isLoading) return (
        <div className="min-h-screen bg-dark-900 container-custom py-12 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-32 animate-pulse bg-dark-600" />)}
        </div>
    )

    return (
        <div className="min-h-screen bg-dark-900">
            <div className="container-custom py-6">
                <h1 className="section-title mb-6">My Orders</h1>

                {data?.orders?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-2 text-white/30">
                        <Package size={48} strokeWidth={1} />
                        <p className="text-lg">No orders yet</p>
                        <Link href="/products" className="btn-primary text-sm">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {data?.orders?.map((order) => (
                            <div key={order.id} className="card p-6">
                                <div className="flex items-start justify-between mb-0">
                                    <div>
                                        <p className="text-white font-medium">{order.orderNumber}</p>
                                        <p className="text-white/40 text-sm flex items-center gap-1 mt-1">
                                            <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`badge ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-white font-semibold">${Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    {order.items?.slice(0, 3).map((item) => (
                                        <div key={item.id} className="w-14 h-14 bg-dark-600 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={item.imageUrl || 'https://placehold.co/56x56/1a1a1a/333'} alt={item.productName} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {order.items?.length > 3 && (
                                        <div className="w-14 h-14 bg-dark-600 rounded-xl flex items-center justify-center text-white/40 text-sm">
                                            +{order.items.length - 3}
                                        </div>
                                    )}
                                </div>

                                <Link href={`/orders/${order.id}`} className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm transition-colors">
                                    View Details <ArrowRight size={14} />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}