'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { User, MapPin, Heart, Package, Plus, Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'

export default function AccountPage() {
    const { user, updateUser } = useAuthStore()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [tab, setTab] = useState('profile')
    const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' })
    const [addressForm, setAddressForm] = useState({ fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'US', isDefault: false })
    const [showAddressForm, setShowAddressForm] = useState(false)

    useEffect(() => {
        if (!user) { router.push('/auth/login'); return }
        setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || '' })
    }, [user])

    const { data: profileData } = useQuery({
        queryKey: ['profile'],
        queryFn: () => api.get('/users/profile').then((r) => r.data),
        enabled: !!user,
    })

    const updateProfile = useMutation({
        mutationFn: (data) => api.put('/users/profile', data),
        onSuccess: (res) => {
            updateUser(res.data.user)
            toast.success('Profile updated!')
            queryClient.invalidateQueries(['profile'])
        },
        onError: () => toast.error('Failed to update profile'),
    })

    const addAddress = useMutation({
        mutationFn: (data) => api.post('/users/addresses', data),
        onSuccess: () => {
            toast.success('Address added!')
            setShowAddressForm(false)
            queryClient.invalidateQueries(['profile'])
        },
        onError: () => toast.error('Failed to add address'),
    })

    const deleteAddress = useMutation({
        mutationFn: (id) => api.delete(`/users/addresses/${id}`),
        onSuccess: () => {
            toast.success('Address removed')
            queryClient.invalidateQueries(['profile'])
        },
    })

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
    ]

    return (
        <div className="min-h-screen bg-dark-900">
            <div className="container-custom py-12">
                <h1 className="section-title mb-8">My Account</h1>

                <div className="flex gap-8 flex-col lg:flex-row">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="card p-4 space-y-1">
                            {/* Avatar */}
                            <div className="flex items-center gap-3 p-4 mb-4">
                                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-bold font-display">
                                    {user?.firstName?.[0]}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-white/40 text-sm">{user?.email}</p>
                                </div>
                            </div>

                            {tabs.map(({ id, label, icon: Icon }) => (
                                <button key={id} onClick={() => setTab(id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${tab === id ? 'bg-primary-500/20 text-primary-400' : 'text-white/60 hover:text-white hover:bg-dark-600'}`}>
                                    <Icon size={16} /> {label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1">

                        {/* Profile Tab */}
                        {tab === 'profile' && (
                            <div className="card p-8">
                                <h2 className="font-display text-xl font-semibold text-white mb-6">Profile Information</h2>
                                <div className="space-y-4 max-w-md">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-white/60 text-sm mb-2 block">First Name</label>
                                            <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-white/60 text-sm mb-2 block">Last Name</label>
                                            <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-white/60 text-sm mb-2 block">Email</label>
                                        <input className="input opacity-50" value={user?.email} disabled />
                                        <p className="text-white/30 text-xs mt-1">Email cannot be changed</p>
                                    </div>
                                    <div>
                                        <label className="text-white/60 text-sm mb-2 block">Phone</label>
                                        <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1234567890" />
                                    </div>
                                    <button onClick={() => updateProfile.mutate(form)} disabled={updateProfile.isPending} className="btn-primary">
                                        {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Addresses Tab */}
                        {tab === 'addresses' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-display text-xl font-semibold text-white">My Addresses</h2>
                                    <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-primary text-sm flex items-center gap-2">
                                        <Plus size={16} /> Add Address
                                    </button>
                                </div>

                                {showAddressForm && (
                                    <div className="card p-6 space-y-4">
                                        <h3 className="text-white font-medium">New Address</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-white/60 text-sm mb-1 block">Full Name</label>
                                                <input className="input" placeholder="John Doe" value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-white/60 text-sm mb-1 block">Phone</label>
                                                <input className="input" placeholder="+1234567890" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-white/60 text-sm mb-1 block">Street</label>
                                            <input className="input" placeholder="123 Main St" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-white/60 text-sm mb-1 block">City</label>
                                                <input className="input" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-white/60 text-sm mb-1 block">State</label>
                                                <input className="input" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-white/60 text-sm mb-1 block">Postal Code</label>
                                                <input className="input" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" id="default" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="accent-primary-500" />
                                            <label htmlFor="default" className="text-white/60 text-sm">Set as default address</label>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => addAddress.mutate(addressForm)} disabled={addAddress.isPending} className="btn-primary text-sm">
                                                {addAddress.isPending ? 'Saving...' : 'Save Address'}
                                            </button>
                                            <button onClick={() => setShowAddressForm(false)} className="btn-secondary text-sm">Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {profileData?.user?.addresses?.map((address) => (
                                    <div key={address.id} className="card p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="text-white font-medium">{address.fullName}</p>
                                                    {address.isDefault && <span className="badge bg-primary-500/20 text-primary-400">Default</span>}
                                                </div>
                                                <p className="text-white/60 text-sm">{address.street}</p>
                                                <p className="text-white/60 text-sm">{address.city}, {address.state} {address.postalCode}</p>
                                                <p className="text-white/60 text-sm">{address.country}</p>
                                                <p className="text-white/40 text-sm mt-1">{address.phone}</p>
                                            </div>
                                            <button onClick={() => deleteAddress.mutate(address.id)} className="text-white/30 hover:text-red-400 transition-colors p-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {profileData?.user?.addresses?.length === 0 && (
                                    <div className="card p-12 flex flex-col items-center gap-3 text-white/30">
                                        <MapPin size={40} strokeWidth={1} />
                                        <p>No addresses saved yet</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Orders Tab */}
                        {tab === 'orders' && (
                            <div className="card p-8 flex flex-col items-center gap-4 text-white/40">
                                <Package size={48} strokeWidth={1} />
                                <p className="text-lg">View your orders</p>
                                <Link href="/orders" className="btn-primary text-sm">Go to Orders</Link>
                            </div>
                        )}

                        {/* Wishlist Tab */}
                        {tab === 'wishlist' && (
                            <div className="card p-8 flex flex-col items-center gap-4 text-white/40">
                                <Heart size={48} strokeWidth={1} />
                                <p className="text-lg">Your saved items</p>
                                <Link href="/products" className="btn-primary text-sm">Browse Products</Link>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}