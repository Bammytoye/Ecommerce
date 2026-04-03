'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import ProductCard from '@/components/product/ProductCard'
import HeroSection from '@/components/layout/HeroSection'
import CategoryGrid from '@/components/layout/CategoryGrid'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const { data: featuredData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.get('/products/featured').then((r) => r.data),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  })

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero */}
      <HeroSection />

      {/* Categories */}
      <section className="container-custom py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary-500 text-sm font-medium tracking-widest uppercase mb-2">Browse</p>
            <h2 className="section-title">Shop by Category</h2>
          </div>
        </div>
        <CategoryGrid categories={categoriesData?.categories || []} />
      </section>

      {/* Featured Products */}
      <section className="container-custom py-20 border-t border-white/5">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary-500 text-sm font-medium tracking-widest uppercase mb-2">Handpicked</p>
            <h2 className="section-title">Featured Products</h2>
          </div>
          <Link href="/products" className="flex items-center gap-2 text-white/60 hover:text-primary-500 transition-colors text-sm">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
          {featuredData?.products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {!featuredData && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-80 animate-pulse bg-dark-600" />
            ))
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="container-custom py-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 p-12 md:p-20">
          <div className="relative z-10 max-w-xl">
            <p className="text-primary-200 text-sm font-medium tracking-widest uppercase mb-4">Limited time</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Get 20% off your first order
            </h2>
            <p className="text-primary-100 mb-8 text-lg">Use code <span className="font-bold bg-white/20 px-2 py-1 rounded">WELCOME20</span> at checkout</p>
            <Link href="/products" className="btn-secondary inline-flex items-center gap-2">
              Shop Now <ArrowRight size={16} />
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -right-10 -bottom-20 w-60 h-60 bg-white/5 rounded-full" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-display text-xl font-semibold text-white mb-4">ShopNest</h3>
              <p className="text-white/40 text-sm leading-relaxed">Your one-stop destination for everything you need.</p>
            </div>
            {[
              { title: 'Shop', links: ['All Products', 'Categories', 'Featured', 'Sale'] },
              { title: 'Account', links: ['Login', 'Register', 'Orders', 'Wishlist'] },
              { title: 'Support', links: ['FAQ', 'Shipping', 'Returns', 'Contact'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-medium mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-white/40 hover:text-primary-500 text-sm transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">© 2024 ShopNest. All rights reserved.</p>
            <p className="text-white/30 text-sm">Built with Next.js & Node.js</p>
          </div>
        </div>
      </footer>
    </div>
  )
}