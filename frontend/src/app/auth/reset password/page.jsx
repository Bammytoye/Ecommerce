'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')
    const [form, setForm] = useState({ password: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) router.push('/auth/forgot-password')
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }

        setLoading(true)
        try {
            await api.post('/auth/reset-password', { token, password: form.password })
            setSuccess(true)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to reset password')
        } finally {
            setLoading(false)
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
                </div>

                <div className="card p-8">
                    {success ? (
                        /* Success state */
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-400" />
                            </div>
                            <h1 className="font-display text-2xl font-semibold text-white mb-3">Password Reset!</h1>
                            <p className="text-white/50 mb-8">
                                Your password has been updated successfully. You can now log in with your new password.
                            </p>
                            <Link href="/auth/login" className="btn-primary w-full flex items-center justify-center gap-2">
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        /* Form state */
                        <>
                            <div className="mb-6">
                                <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-4">
                                    <Lock size={22} className="text-primary-500" />
                                </div>
                                <h1 className="font-display text-2xl font-semibold text-white mb-2">Create new password</h1>
                                <p className="text-white/50 text-sm">
                                    Your new password must be at least 8 characters.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="input pr-12"
                                            placeholder="Min. 8 characters"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Repeat your password"
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        required
                                    />
                                    {form.confirmPassword && form.password !== form.confirmPassword && (
                                        <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                                    )}
                                </div>

                                {/* Password strength */}
                                {form.password && (
                                    <div className="space-y-1">
                                        {[
                                            { label: 'At least 8 characters', valid: form.password.length >= 8 },
                                            { label: 'Contains a number', valid: /\d/.test(form.password) },
                                            { label: 'Contains uppercase', valid: /[A-Z]/.test(form.password) },
                                        ].map(({ label, valid }) => (
                                            <div key={label} className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${valid ? 'bg-green-400' : 'bg-white/20'}`} />
                                                <span className={`text-xs ${valid ? 'text-green-400' : 'text-white/30'}`}>{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || form.password !== form.confirmPassword || form.password.length < 8}
                                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {!success && (
                        <div className="mt-6 text-center">
                            <Link href="/auth/login" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
                                <ArrowLeft size={14} /> Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}