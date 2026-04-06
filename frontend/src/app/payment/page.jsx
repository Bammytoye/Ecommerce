'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { Lock, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null

const cardStyle = {
    style: {
        base: {
            color: '#ffffff',
            fontFamily: 'DM Sans, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': { color: 'rgba(255,255,255,0.3)' },
            backgroundColor: 'transparent',
        },
        invalid: { color: '#ef4444', iconColor: '#ef4444' },
    },
}

function PaymentForm({ orderId, amount }) {
    const stripe = useStripe()
    const elements = useElements()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [clientSecret, setClientSecret] = useState(null)
    const [orderDetails, setOrderDetails] = useState(null)
    const [cardComplete, setCardComplete] = useState(false)

    useEffect(() => {
        if (!orderId) return

        // Fetch order details and create payment intent
        const init = async () => {
            try {
                const [orderRes, intentRes] = await Promise.all([
                    api.get(`/orders/my/${orderId}`),
                    api.post('/payments/create-intent', { orderId }),
                ])
                setOrderDetails(orderRes.data.order)
                setClientSecret(intentRes.data.clientSecret)
            } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to initialize payment')
            }
        }
        init()
    }, [orderId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!stripe || !elements || !clientSecret) return

        setLoading(true)
        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: orderDetails?.address?.fullName || 'Customer',
                    },
                },
            })

            if (error) {
                toast.error(error.message)
                setLoading(false)
                return
            }

            if (paymentIntent.status === 'succeeded') {
                // Confirm payment on backend and send email
                await api.post('/payments/confirm', {
                    orderId,
                    paymentIntentId: paymentIntent.id,
                })
                toast.success('Payment successful! 🎉')
                router.push(`/payment/success?orderId=${orderId}`)
            }
        } catch (err) {
            toast.error('Payment failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-dark-900">
            <div className="container-custom py-4">
                <Link href="/orders" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
                    <ArrowLeft size={16} /> Back to Orders
                </Link>

                <div className="max-w-lg mx-auto">
                    <div className="text-center mb-3">
                        <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CreditCard size={28} className="text-primary-500" />
                        </div>
                        <h1 className="font-display text-3xl font-bold text-white mb-2">Complete Payment</h1>
                        <p className="text-white/40">Your order is ready — complete payment to confirm</p>
                    </div>

                    {/* Order Summary */}
                    {orderDetails && (
                        <div className="card p-4 mb-3">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-white/60 text-sm">Order</p>
                                <p className="text-white font-medium text-sm">{orderDetails.orderNumber}</p>
                            </div>
                            <div className="space-y-2 mb-3">
                                {orderDetails.items?.slice(0, 3).map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-white/60 line-clamp-1 flex-1 mr-4">{item.productName} × {item.quantity}</span>
                                        <span className="text-white">${Number(item.subtotal).toFixed(2)}</span>
                                    </div>
                                ))}
                                {orderDetails.items?.length > 3 && (
                                    <p className="text-white/30 text-xs">+{orderDetails.items.length - 3} more items</p>
                                )}
                            </div>
                            <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                                <span className="text-white font-semibold">Total</span>
                                <span className="text-primary-400 font-bold text-xl">${Number(orderDetails.total).toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {/* Payment Form */}
                    <div className="card p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-white/60 text-sm mb-3 block items-center gap-2">
                                    <CreditCard size={14} /> Card Details
                                </label>
                                <div className="bg-dark-600 border border-white/10 rounded-xl p-4 focus-within:border-primary-500 transition-colors">
                                    {clientSecret ? (
                                        <CardElement
                                            options={cardStyle}
                                            onChange={(e) => setCardComplete(e.complete)}
                                        />
                                    ) : (
                                        <div className="h-5 bg-dark-500 rounded animate-pulse" />
                                    )}
                                </div>
                                <p className="text-white/30 text-xs mt-2">
                                    Test card: 4242 4242 4242 4242 · Any future date · Any CVC
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={!stripe || !clientSecret || loading || !cardComplete}
                                className="btn-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        Pay ${amount ? Number(amount).toFixed(2) : orderDetails ? Number(orderDetails.total).toFixed(2) : '...'}
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
                                <Lock size={12} />
                                Secured by Stripe · SSL Encrypted
                            </div>
                        </form>
                    </div>

                    {/* Card brands */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                        {['VISA', 'MC', 'AMEX', 'JCB'].map((brand) => (
                            <div key={brand} className="bg-dark-700 border border-white/5 px-3 py-1.5 rounded-lg">
                                <span className="text-white/30 text-xs font-medium">{brand}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PaymentPage() {
    const searchParams = useSearchParams()
    const { user } = useAuthStore()
    const router = useRouter()
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    useEffect(() => {
        if (!user) router.push('/auth/login')
        if (!orderId) router.push('/orders')
    }, [user, orderId])

    if (!orderId) return null

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="card p-8 max-w-md text-center">
                    <p className="text-red-400 font-medium mb-2">Stripe key not configured</p>
                    <p className="text-white/40 text-sm">Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env.local file and restart the frontend.</p>
                </div>
            </div>
        )
    }

    return (
        <Elements stripe={stripePromise}>
            <PaymentForm orderId={orderId} amount={amount} />
        </Elements>
    )
}