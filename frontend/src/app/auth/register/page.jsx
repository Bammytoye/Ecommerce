'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

export default function RegisterPage() {
    const { register, isLoading } = useAuthStore()
    const router = useRouter()
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' })
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }
        try {
            await register(form)
            toast.success('Account created successfully!')
            router.push('/')
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed')
        }
    }

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-2">
                    <Link href="/" className="font-display text-3xl font-bold text-white">
                        Shop<span className="text-primary-500">Nest</span>
                    </Link>
                    <p className="text-white/40 mt-0">Create your account</p>
                </div>

                <div className="card p-5">
                    <h1 className="font-display text-2xl font-semibold text-white mb-1">Register</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-white/60 text-sm mb-2 block">First Name</label>
                                <input type="text" className="input" placeholder="First Name" value={form.firstName} onChange={update('firstName')} required />
                            </div>
                            <div>
                                <label className="text-white/60 text-sm mb-2 block">Last Name</label>
                                <input type="text" className="input" placeholder="Last Name" value={form.lastName} onChange={update('lastName')} required />
                            </div>
                        </div>

                        <div>
                            <label className="text-white/60 text-sm mb-2 block">Email</label>
                            <input type="email" className="input" placeholder="youremail@gmail.com" value={form.email} onChange={update('email')} required />
                        </div>

                        <div>
                            <label className="text-white/60 text-sm mb-2 block">Phone (optional)</label>
                            <input type="tel" className="input" placeholder="+1234567890" value={form.phone} onChange={update('phone')} />
                        </div>

                        <div>
                            <label className="text-white/60 text-sm mb-2 block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input pr-12"
                                    placeholder="Min. 8 characters"
                                    value={form.password}
                                    onChange={update('password')}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><UserPlus size={18} /> Create Account</>
                            )}
                        </button>
                    </form>

                    <p className="text-white/40 text-sm text-center mt-6">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 transition-colors">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}