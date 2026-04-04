'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'

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

export default function AdminOrderDetailPage() {
    const { id } = useParams()
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['admin-order', id],
        queryFn: () => api.get(`/orders/${id}`).then((r) => r.data),
    })

    const updateStatus = useMutation({
        mutationFn: (status) => api.put(`/orders/${id}/status`, { status, note: `Status updated to ${status}` }),
        onSuccess: () => {
            toast.success('Status updated!')
            queryClient.invalidateQueries(['admin-order', id])
            queryClient.invalidateQueries(['admin-orders'])
        },
        onError: () => toast.error('Failed to update status'),
    })

    const order = data?.order

    if (isLoading) return (
        <div className="p-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card h-32 animate-pulse bg-dark-600" />
            ))}
        </div>
    )

    if (!order) return (
        <div className="p-8 flex flex-col items-center justify-center h-64 gap-4 text-white/30">
            <Package size={48} strokeWidth={1} />
            <p>Order not found</p>
            <Link href="/admin/orders" className="btn-primary text-sm">Back to Orders</Link>
        </div>
    )

    return (
        <div className="p-8">
            <Link href="/admin/orders" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
                <ArrowLeft size={16} /> Back to Orders
            </Link>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-white mb-1">{order.orderNumber}</h1>
                    <p className="text-white/40 text-sm">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-white/40 text-sm">Update Status:</span>
                    <select
                        className="input py-2 text-sm"
                        value={order.status}
                        onChange={(e) => updateStatus.mutate(e.target.value)}
                        disabled={updateStatus.isPending}>
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Customer Banner */}
            <div className="card p-4 mb-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold">
                        {order.user?.firstName?.[0]}
                    </div>
                    <div>
                        <p className="text-white font-medium">{order.user?.firstName} {order.user?.lastName}</p>
                        <p className="text-white/40 text-sm">{order.user?.email}</p>
                    </div>
                </div>
                <div className="h-8 w-px bg-white/10 hidden sm:block" />
                <div>
                    <p className="text-white/40 text-xs mb-0.5">Total</p>
                    <p className="text-white font-semibold">${Number(order.total).toFixed(2)}</p>
                </div>
                <div className="h-8 w-px bg-white/10 hidden sm:block" />
                <div>
                    <p className="text-white/40 text-xs mb-0.5">Payment</p>
                    <span className={`badge text-xs ${order.payment?.status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {order.payment?.status || 'UNPAID'}
                    </span>
                </div>
                <div className="ml-auto">
                    <span className={`badge ${statusColors[order.status]} px-4 py-2`}>{order.status}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="card p-6">
                        <h2 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Package size={18} className="text-primary-500" /> Items ({order.items?.length})
                        </h2>
                        <div className="space-y-3">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 bg-dark-600 rounded-xl">
                                    <div className="w-16 h-16 bg-dark-500 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.imageUrl || 'https://placehold.co/64x64/1a1a1a/333'} alt={item.productName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{item.productName}</p>
                                        {item.variantName && <p className="text-white/40 text-sm">{item.variantName}</p>}
                                        <p className="text-white/50 text-sm">${Number(item.price).toFixed(2)} × {item.quantity}</p>
                                    </div>
                                    <p className="text-white font-semibold">${Number(item.subtotal).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="card p-6">
                        <h2 className="font-display text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Clock size={18} className="text-primary-500" /> Timeline
                        </h2>
                        {order.statusHistory?.map((h, i) => (
                            <div key={h.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${i === order.statusHistory.length - 1 ? 'bg-primary-500 border-primary-500' : 'bg-dark-600 border-white/20'}`} />
                                    {i < order.statusHistory.length - 1 && <div className="w-0.5 h-10 bg-white/10 my-1" />}
                                </div>
                                <div className="pb-6">
                                    <p className="text-white text-sm font-medium">{h.status}</p>
                                    {h.note && <p className="text-white/40 text-xs">{h.note}</p>}
                                    <p className="text-white/25 text-xs">{new Date(h.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Summary */}
                    <div className="card p-6">
                        <h2 className="font-display text-lg font-semibold text-white mb-4">Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-white/50">Subtotal</span><span className="text-white">${Number(order.subtotal).toFixed(2)}</span></div>
                            {Number(order.discount) > 0 && <div className="flex justify-between"><span className="text-green-400">Discount</span><span className="text-green-400">-${Number(order.discount).toFixed(2)}</span></div>}
                            <div className="flex justify-between"><span className="text-white/50">Shipping</span><span className="text-white">{Number(order.shippingFee) === 0 ? 'Free' : `$${Number(order.shippingFee).toFixed(2)}`}</span></div>
                            <div className="flex justify-between"><span className="text-white/50">Tax</span><span className="text-white">${Number(order.tax).toFixed(2)}</span></div>
                            <div className="flex justify-between font-semibold text-base border-t border-white/5 pt-3 mt-2">
                                <span className="text-white">Total</span><span className="text-primary-400">${Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="card p-6">
                        <h2 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-primary-500" /> Delivery Address
                        </h2>
                        {order.address ? (
                            <div className="text-sm space-y-1">
                                <p className="text-white font-medium">{order.address.fullName}</p>
                                <p className="text-white/60">{order.address.street}</p>
                                <p className="text-white/60">{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                                <p className="text-white/40">{order.address.phone}</p>
                            </div>
                        ) : <p className="text-white/30 text-sm">No address on record</p>}
                    </div>

                    {/* Payment */}
                    <div className="card p-6">
                        <h2 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CreditCard size={16} className="text-primary-500" /> Payment
                        </h2>
                        {order.payment ? (
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-white/50">Method</span><span className="text-white">{order.payment.method}</span></div>
                                <div className="flex justify-between"><span className="text-white/50">Status</span><span className={order.payment.status === 'PAID' ? 'text-green-400' : 'text-amber-400'}>{order.payment.status}</span></div>
                                <div className="flex justify-between"><span className="text-white/50">Amount</span><span className="text-white">${Number(order.payment.amount).toFixed(2)}</span></div>
                            </div>
                        ) : <p className="text-white/30 text-sm">No payment record yet</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}