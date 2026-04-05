'use client'
import Link from 'next/link'
import { ArrowRight, Star, Shield, Truck } from 'lucide-react'

export default function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.15),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(249,115,22,0.08),transparent_60%)]" />

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            <div className="container-custom relative z-10">
                <div className="max-w-3xl">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
                        <Star size={14} fill="currentColor" />
                        New arrivals every week
                    </div>

                    {/* Heading */}
                    <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-fade-up">
                        Everything You
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                            Need, Delivered...
                        </span>
                    </h1>

                    <p className="text-white/50 text-lg md:text-xl mb-10 leading-relaxed max-w-xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        Discover thousands of products across every category. Fast shipping, 
                        easy returns, and unbeatable prices...
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-4 mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                        <Link href="/products" className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3">
                            Shop Now <ArrowRight size={18} />
                        </Link>
                        <Link href="/products?featured=true" className="btn-secondary inline-flex items-center gap-2 text-base px-6 py-3">
                            View Featured
                        </Link>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap gap-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                        {[
                            { icon: Truck, text: 'Free shipping over $100' },
                            { icon: Shield, text: 'Secure payments' },
                            { icon: Star, text: '4.9★ rated store' },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-2 text-white/40 text-sm">
                                <Icon size={16} className="text-primary-500" />
                                {text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating cards decoration */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-10 pr-12">
                {[
                    { label: 'Orders Today', value: '1,240+' },
                    { label: 'Happy Customers', value: '50K+' },
                    { label: 'Products', value: '10K+' },
                ].map((stat) => (
                    <div key={stat.label} className="card px-6 py-2 text-center animate-fade-in">
                        <p className="text-white/40 text-xs mb-0">{stat.label}</p>
                        <p className="text-white font-display text-2xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}