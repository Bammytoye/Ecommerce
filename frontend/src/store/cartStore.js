import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            total: 0,
            isOpen: false,

            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

            fetchCart: async () => {
                try {
                    const { data } = await api.get('/cart')
                    set({ items: data.cart.items || [], total: data.cart.total || 0 })
                } catch { }
            },

            addItem: async (productId, variantId, quantity = 1) => {
                try {
                    const { data } = await api.post('/cart', { productId, variantId, quantity })
                    set({ items: data.cart.items || [] })
                    toast.success('Added to cart!')
                    get().openCart()
                } catch {
                    toast.error('Failed to add to cart')
                }
            },

            updateItem: async (itemId, quantity) => {
                try {
                    await api.put(`/cart/items/${itemId}`, { quantity })
                    get().fetchCart()
                } catch {
                    toast.error('Failed to update cart')
                }
            },

            removeItem: async (itemId) => {
                try {
                    await api.delete(`/cart/items/${itemId}`)
                    set((s) => ({ items: s.items.filter((i) => i.id !== itemId) }))
                    toast.success('Item removed')
                } catch {
                    toast.error('Failed to remove item')
                }
            },

            clearCart: async () => {
                try {
                    await api.delete('/cart')
                    set({ items: [], total: 0 })
                } catch { }
            },

            itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
        }),
        { name: 'cart-store', partialize: (state) => ({ items: state.items }) }
    )
)