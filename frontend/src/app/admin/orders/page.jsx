'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { ShoppingCart, Search, ChevronDown } from 'lucide-react'

const statusColors = {
    PENDING: 'bg-amber-500/20 text-amber-400',
    CONFIRMED: 'bg-blue-500/20 text-blue-400',
    PROCESSING: 'bg-purple-500/20 text-purple-400',
    SHIPPED: 'bg-cyan-500/20 text-cyan-400',
    DELIVERED: 'bg-green-500/20 text-green-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
    REFUNDED: 'bg-gray-500/20 text-gray-400',
}

const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

export default function AdminOrdersPage() {
    const queryClient = useQueryClient()
    const [filterStatus, setFilterStatus] = useState('')
    const [page, setPage] = useState(1)
    const [updatingId, setUpdatingId] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders', filterStatus, page],
        queryFn: () => api.get('/orders', { params: { status: filterStatus || undefined, page, limit: 15 } }).then((r) => r.data),
    })

    const updateStatus = useMutation({
        mutationFn: ({ id, status }) => api.put(`/orders/${id}/status`, { status }),
        onSuccess: () => {
            toast.success('Order status updated')
            queryClient.invalidateQueries(['admin-orders'])
            setUpdatingId(null)
        },
        onError: () => toast.error('Failed to update status'),
    })

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-white mb-1">Orders</h1>
                    <p className="text-white/40">{data?.pagination?.total || 0} total orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    onClick={() => { setFilterStatus(''); setPage(1) }}
                    className={`badge px-4 py-2 cursor-pointer transition-colors ${!filterStatus ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-600 text-white/50 hover:text-white'}`}>
                    All
                </button>
                {statuses.map((s) => (
                    <button key={s}
                        onClick={() => { setFilterStatus(s); setPage(1) }}
                        className={`badge px-4 py-2 cursor-pointer transition-colors ${filterStatus === s ? statusColors[s] : 'bg-dark-600 text-white/50 hover:text-white'}`}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Order</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Customer</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Items</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Total</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Date</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Status</th>
                                <th className="text-right px-6 py-4 text-white/40 text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="px-6 py-4"><div className="h-4 bg-dark-600 rounded animate-pulse" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : data?.orders?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-white/30">
                                            <ShoppingCart size={40} strokeWidth={1} />
                                            <p>No orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data?.orders?.map((order) => (
                                    <tr key={order.id} className="border-b border-white/5 hover:bg-dark-700 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-white text-sm font-medium">{order.orderNumber}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-white text-sm">{order.user?.firstName} {order.user?.lastName}</p>
                                            <p className="text-white/40 text-xs">{order.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white/60 text-sm">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-semibold text-sm">${Number(order.total || 0).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/orders/${order.id}`} className="text-white/40 hover:text-primary-400 text-sm transition-colors">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            {updatingId === order.id ? (
                                                <select
                                                    className="input text-sm py-1.5"
                                                    defaultValue={order.status}
                                                    onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                                                    onBlur={() => setUpdatingId(null)}
                                                    autoFocus>
                                                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            ) : (
                                                <button
                                                    onClick={() => setUpdatingId(order.id)}
                                                    className={`badge ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'} cursor-pointer flex items-center gap-1`}>
                                                    {order.status} <ChevronDown size={12} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {data?.pagination?.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                        <p className="text-white/40 text-sm">Page {page} of {data.pagination.pages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 px-4 disabled:opacity-30">Previous</button>
                            <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pagination.pages} className="btn-secondary text-sm py-2 px-4 disabled:opacity-30">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}