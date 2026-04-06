'use client'
import { useState } from 'react'
import api from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await api.post('/auth/forgot-password', { email })
            setSent(true)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Something went wrong')
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
                    {sent ? (
                        /* Success state */
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-400" />
                            </div>
                            <h1 className="font-display text-2xl font-semibold text-white mb-3">Check your email</h1>
                            <p className="text-white/50 mb-6">
                                We've sent a password reset link to <strong className="text-white">{email}</strong>.
                                Check your inbox and click the link to reset your password.
                            </p>
                            <p className="text-white/30 text-sm mb-6">
                                Didn't receive it? Check your spam folder or try again.
                            </p>
                            <button onClick={() => setSent(false)} className="btn-secondary w-full text-sm">
                                Try again
                            </button>
                        </div>
                    ) : (
                        /* Form state */
                        <>
                            <div className="mb-6">
                                <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-4">
                                    <Mail size={22} className="text-primary-500" />
                                </div>
                                <h1 className="font-display text-2xl font-semibold text-white mb-2">Forgot password?</h1>
                                <p className="text-white/50 text-sm">
                                    Enter your email and we'll send you a reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-white/60 text-sm mb-2 block">Email Address</label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full flex items-center justify-center gap-2">
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="mt-6 text-center">
                        <Link href="/auth/login" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
                            <ArrowLeft size={14} /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}