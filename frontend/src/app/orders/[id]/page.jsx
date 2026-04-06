'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Package, MapPin, CreditCard, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'

const statusIcons = { PENDING: Clock, CONFIRMED: CheckCircle, PROCESSING: Package, SHIPPED: Truck, DELIVERED: CheckCircle, CANCELLED: XCircle }
const statusColors = {
    PENDING: 'text-amber-400 bg-amber-500/20',
    CONFIRMED: 'text-blue-400 bg-blue-500/20',
    PROCESSING: 'text-purple-400 bg-purple-500/20',
    SHIPPED: 'text-cyan-400 bg-cyan-500/20',
    DELIVERED: 'text-green-400 bg-green-500/20',
    CANCELLED: 'text-red-400 bg-red-500/20',
}

export default function OrderDetailPage() {
    const { id } = useParams()
    const { user } = useAuthStore()
    const router = useRouter()
    const queryClient = useQueryClient()

    useEffect(() => { if (!user) router.push('/auth/login') }, [user])

    const { data, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: () => api.get(`/orders/my/${id}`).then((r) => r.data),
        enabled: !!user,
    })

    const cancelOrder = useMutation({
        mutationFn: () => api.put(`/orders/my/${id}/cancel`),
        onSuccess: () => { toast.success('Order cancelled'); queryClient.invalidateQueries(['order', id]) },
        onError: (err) => toast.error(err.response?.data?.error || 'Cannot cancel order'),
    })

    const order = data?.order

    if (isLoading) return (
        <div className="min-h-screen bg-dark-900 container-custom py-12 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-32 animate-pulse bg-dark-600" />)}
        </div>
    )

    if (!order) return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="text-center text-white/40">
                <p className="mb-2">Order not found</p>
                <Link href="/orders" className="btn-primary text-sm">Back to Orders</Link>
            </div>
        </div>
    )

    const StatusIcon = statusIcons[order.status] || Clock

    return (
        <div className="min-h-screen bg-dark-900">
            <div className="container-custom py-6">
                <Link href="/orders" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back to Orders
                </Link>

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                        <h1 className="section-title mb-1">{order.orderNumber}</h1>
                        <p className="text-white/40 text-sm">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`badge ${statusColors[order.status]} text-sm px-4 py-2`}>
                            <StatusIcon size={14} className="inline mr-2" />
                            {order.status}
                        </span>
                        {['PENDING', 'CONFIRMED'].includes(order.status) && (
                            <button onClick={() => cancelOrder.mutate()} disabled={cancelOrder.isPending} className="btn-secondary text-sm text-red-400 border-red-500/30 hover:bg-red-500/10">
                                Cancel Order
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-3">
                        <div className="card p-6">
                            <h2 className="font-display text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                <Package size={18} className="text-primary-500" /> Items Ordered
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
                                            <p className="text-white/60 text-sm">x{item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-semibold">${Number(item.subtotal).toFixed(2)}</p>
                                            <p className="text-white/40 text-xs">${Number(item.price).toFixed(2)} each</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status History */}
                        <div className="card p-6">
                            <h2 className="font-display text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                <Clock size={18} className="text-primary-500" /> Order Timeline
                            </h2>
                            <div className="space-y-4">
                                {order.statusHistory?.map((h, i) => (
                                    <div key={h.id} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full mt-1 ${i === order.statusHistory.length - 1 ? 'bg-primary-500' : 'bg-white/20'}`} />
                                            {i < order.statusHistory.length - 1 && <div className="w-0.5 h-full bg-white/10 my-1" />}
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-white text-sm font-medium">{h.status}</p>
                                            {h.note && <p className="text-white/40 text-xs">{h.note}</p>}
                                            <p className="text-white/30 text-xs">{new Date(h.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="card p-6">
                            <h2 className="font-display text-lg font-semibold text-white mb-4">Order Summary</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-white/60">Subtotal</span><span className="text-white">${Number(order.subtotal).toFixed(2)}</span></div>
                                {Number(order.discount) > 0 && <div className="flex justify-between"><span className="text-green-400">Discount</span><span className="text-green-400">-${Number(order.discount).toFixed(2)}</span></div>}
                                <div className="flex justify-between"><span className="text-white/60">Shipping</span><span className="text-white">{Number(order.shippingFee) === 0 ? 'Free' : `$${Number(order.shippingFee).toFixed(2)}`}</span></div>
                                <div className="flex justify-between"><span className="text-white/60">Tax</span><span className="text-white">${Number(order.tax).toFixed(2)}</span></div>
                                <div className="flex justify-between font-semibold text-base border-t border-white/5 pt-2 mt-2">
                                    <span className="text-white">Total</span><span className="text-primary-400">${Number(order.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="card p-6">
                            <h2 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <MapPin size={16} className="text-primary-500" /> Delivery Address
                            </h2>
                            {order.address && (
                                <div className="text-white/60 text-sm space-y-1">
                                    <p className="text-white font-medium">{order.address.fullName}</p>
                                    <p>{order.address.street}</p>
                                    <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                                    <p>{order.address.country}</p>
                                    <p className="text-white/40">{order.address.phone}</p>
                                </div>
                            )}
                        </div>

                        {/* Payment */}
                        {order.payment && (
                            <div className="card p-6">
                                <h2 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <CreditCard size={16} className="text-primary-500" /> Payment
                                </h2>
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Method</span>
                                        <span className="text-white">{order.payment.method}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Status</span>
                                        <span className={order.payment.status === 'PAID' ? 'text-green-400' : 'text-amber-400'}>{order.payment.status}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}