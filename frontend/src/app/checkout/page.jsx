'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ShoppingBag, MapPin, Tag, ArrowRight, Truck } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
    const { items, clearCart } = useCartStore()
    const { user } = useAuthStore()
    const router = useRouter()
    const [selectedAddress, setSelectedAddress] = useState('')
    const [couponCode, setCouponCode] = useState('')
    const [couponDiscount, setCouponDiscount] = useState(0)
    const [notes, setNotes] = useState('')

    useEffect(() => {
        if (!user) router.push('/auth/login')
    }, [user])

    const { data: profileData } = useQuery({
        queryKey: ['profile'],
        queryFn: () => api.get('/users/profile').then((r) => r.data),
        enabled: !!user,
    })

    useEffect(() => {
        if (profileData?.user?.addresses?.length > 0 && !selectedAddress) {
            const def = profileData.user.addresses.find((a) => a.isDefault)
            setSelectedAddress(def?.id || profileData.user.addresses[0].id)
        }
    }, [profileData])

    const subtotal = items.reduce((sum, item) => {
        const price = item.variant?.price || item.product?.basePrice || 0
        return sum + Number(price) * item.quantity
    }, 0)

    const shippingFee = subtotal > 100 ? 0 : 10
    const tax = (subtotal - couponDiscount) * 0.075
    const total = subtotal - couponDiscount + shippingFee + tax

    const validateCoupon = async () => {
        if (!couponCode) { toast.error('Enter a coupon code'); return }
        try {
            const { data } = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal })
            setCouponDiscount(data.discount)
            toast.success(`Coupon applied! -$${data.discount.toFixed(2)}`)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Invalid coupon')
        }
    }

    const placeOrder = useMutation({
        mutationFn: () => api.post('/orders', {
            addressId: selectedAddress,
            couponCode: couponDiscount > 0 ? couponCode : undefined,
            notes: notes || undefined,
        }),
        onSuccess: (res) => {
            const orderId = res?.data?.order?.id
            const total = res?.data?.order?.total
            toast.success('Order created! Proceeding to payment...')
            router.push(`/payment?orderId=${orderId}&amount=${total}`)
            setTimeout(() => clearCart(), 1500)
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Failed to place order')
        },
    })

    const handlePlaceOrder = () => {
        if (!selectedAddress) { toast.error('Please select a delivery address'); return }
        if (items.length === 0) { toast.error('Your cart is empty'); return }
        placeOrder.mutate()
    }

    return (
        <div className="min-h-screen bg-dark-900">
            <div className="container-custom py-12">
                <h1 className="section-title mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Delivery Address */}
                        <div className="card p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <MapPin size={20} className="text-primary-500" />
                                <h2 className="font-display text-lg font-semibold text-white">Delivery Address</h2>
                            </div>
                            {!profileData ? (
                                <div className="h-20 bg-dark-600 rounded-xl animate-pulse" />
                            ) : profileData?.user?.addresses?.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-white/40 mb-4">No addresses saved yet</p>
                                    <Link href="/account" className="btn-outline text-sm">Add Address</Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {profileData?.user?.addresses?.map((address) => (
                                        <label key={address.id}
                                            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${selectedAddress === address.id ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-white/20'}`}>
                                            <input type="radio" name="address" value={address.id}
                                                checked={selectedAddress === address.id}
                                                onChange={() => setSelectedAddress(address.id)}
                                                className="mt-1 accent-primary-500" />
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{address.fullName}</p>
                                                <p className="text-white/60 text-sm">{address.street}, {address.city}, {address.state} {address.postalCode}</p>
                                                <p className="text-white/40 text-sm">{address.phone}</p>
                                            </div>
                                            {address.isDefault && <span className="badge bg-primary-500/20 text-primary-400">Default</span>}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Coupon */}
                        <div className="card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Tag size={20} className="text-primary-500" />
                                <h2 className="font-display text-lg font-semibold text-white">Coupon Code</h2>
                            </div>
                            <div className="flex gap-3">
                                <input className="input flex-1" placeholder="e.g. WELCOME20"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                                <button onClick={validateCoupon} className="btn-outline whitespace-nowrap">Apply</button>
                            </div>
                            {couponDiscount > 0 && (
                                <p className="text-green-400 text-sm mt-2">✓ Coupon applied! You save ${couponDiscount.toFixed(2)}</p>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="card p-6">
                            <h2 className="font-display text-lg font-semibold text-white mb-4">Order Notes (optional)</h2>
                            <textarea className="input h-24 resize-none" placeholder="Any special instructions..."
                                value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                    </div>

                    {/* Right - Summary */}
                    <div>
                        <div className="card p-6 sticky top-24">
                            <div className="flex items-center gap-3 mb-6">
                                <ShoppingBag size={20} className="text-primary-500" />
                                <h2 className="font-display text-lg font-semibold text-white">Order Summary</h2>
                            </div>

                            <div className="space-y-3 mb-6">
                                {items.map((item) => {
                                    const price = item.variant?.price || item.product?.basePrice || 0
                                    return (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-dark-600 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={item.product?.images?.[0]?.url || 'https://placehold.co/48x48/1a1a1a/333'} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm line-clamp-1">{item.product?.name}</p>
                                                <p className="text-white/40 text-xs">x{item.quantity}</p>
                                            </div>
                                            <p className="text-white text-sm font-medium">${(Number(price) * item.quantity).toFixed(2)}</p>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="border-t border-white/5 pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Subtotal</span>
                                    <span className="text-white">${subtotal.toFixed(2)}</span>
                                </div>
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-400">Discount</span>
                                        <span className="text-green-400">-${couponDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60 flex items-center gap-1"><Truck size={12} /> Shipping</span>
                                    <span className="text-white">{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/60">Tax (7.5%)</span>
                                    <span className="text-white">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg border-t border-white/5 pt-3">
                                    <span className="text-white">Total</span>
                                    <span className="text-primary-400">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={placeOrder.isPending || !selectedAddress}
                                className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                                {placeOrder.isPending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><ArrowRight size={18} /> Proceed to Payment</>
                                )}
                            </button>

                            <p className="text-white/30 text-xs text-center mt-3">
                                Secure checkout powered by Stripe
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}