'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
    const { login, isLoading } = useAuthStore()
    const router = useRouter()
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const data = await login(form.email, form.password)
            toast.success('Welcome back!')
            router.push(data.user?.role === 'ADMIN' ? '/admin' : '/')
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed')
        }
    }

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="font-display text-3xl font-bold text-white">
                        Shop<span className="text-primary-500">Nest</span>
                    </Link>
                    <p className="text-white/40 mt-2">Welcome back</p>
                </div>

                {/* Form */}
                <div className="card p-8">
                    <h1 className="font-display text-2xl font-semibold text-white mb-6">Sign In</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-white/60 text-sm mb-2 block">Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="youremail@gmail.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-white/60 text-sm">Password</label>
                                <Link href="/auth/forgot-password" className="text-primary-400 hover:text-primary-300 text-xs transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input pr-12"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><LogIn size={18} /> Sign In</>
                            )}
                        </button>
                    </form>

                    <p className="text-white/40 text-sm text-center mt-6">
                        Don't have an account?{' '}
                        <Link href="/auth/register" className="text-primary-400 hover:text-primary-300 transition-colors">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}