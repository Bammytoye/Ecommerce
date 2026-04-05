'use client'
import Link from 'next/link'
import { Grid, Shirt, Smartphone, Home, Dumbbell, BookOpen } from 'lucide-react'

const defaultCategories = [
    { name: 'Electronics', slug: 'electronics', icon: Smartphone, color: 'from-blue-500/20 to-blue-600/10' },
    { name: 'Clothing', slug: 'clothing', icon: Shirt, color: 'from-pink-500/20 to-pink-600/10' },
    { name: 'Home Living', slug: 'home', icon: Home, color: 'from-amber-500/20 to-amber-600/10' },
    { name: 'Sports', slug: 'sports', icon: Dumbbell, color: 'from-green-500/20 to-green-600/10' },
    { name: 'Books', slug: 'books', icon: BookOpen, color: 'from-purple-500/20 to-purple-600/10' },
    { name: 'All', slug: '', icon: Grid, color: 'from-primary-500/20 to-primary-600/10' },
]

export default function CategoryGrid({ categories }) {
    const display = categories.length > 0
        ? categories.slice(0, 6).map((c, i) => ({ ...c, ...defaultCategories[i] }))
        : defaultCategories

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {display.map((cat) => {
                const Icon = cat.icon || Grid
                return (
                    <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                        className="card p-6 flex flex-col items-center gap-3 hover:border-primary-500/30 hover:bg-dark-600 transition-all duration-200 group cursor-pointer">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon size={20} className="text-white/80" />
                        </div>
                        <span className="text-white/70 group-hover:text-white text-sm font-medium transition-colors text-center">
                            {cat.name}
                        </span>
                    </Link>
                )
            })}
        </div>
    )
}