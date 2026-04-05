'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const orderId = searchParams.get('orderId')
    const [order, setOrder] = useState(null)

    useEffect(() => {
        if (!orderId) { router.push('/'); return }
        api.get(`/orders/my/${orderId}`)
            .then((r) => setOrder(r.data.order))
            .catch(() => { })
    }, [orderId])

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="relative inline-flex mb-8">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle size={48} className="text-green-400" />
                    </div>
                    <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping" />
                </div>

                <h1 className="font-display text-4xl font-bold text-white mb-3">
                    Payment Successful!
                </h1>
                <p className="text-white/50 mb-8 text-lg">
                    Your order has been confirmed and is being processed.
                </p>

                {order && (
                    <div className="card p-6 mb-8 text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                <Package size={18} className="text-primary-500" />
                            </div>
                            <div>
                                <p className="text-white font-medium">{order.orderNumber}</p>
                                <p className="text-white/40 text-sm">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="ml-auto">
                                <span className="badge bg-green-500/20 text-green-400">CONFIRMED</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm border-t border-white/5 pt-4">
                            {order.items?.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex justify-between">
                                    <span className="text-white/60 line-clamp-1 flex-1 mr-4">{item.productName} × {item.quantity}</span>
                                    <span className="text-white">${Number(item.subtotal).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between font-semibold border-t border-white/5 pt-2 mt-2">
                                <span className="text-white">Total Paid</span>
                                <span className="text-primary-400">${Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={`/orders/${orderId}`} className="btn-primary flex-1 flex items-center justify-center gap-2">
                        <Package size={18} /> Track Order
                    </Link>
                    <Link href="/" className="btn-secondary flex-1 flex items-center justify-center gap-2">
                        <Home size={18} /> Continue Shopping
                    </Link>
                </div>

                <p className="text-white/30 text-sm mt-6">
                    A confirmation will be sent to your email address.
                </p>
            </div>
        </div>
    )
}