import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,

            login: async (email, password) => {
                set({ isLoading: true })
                const { data } = await api.post('/auth/login', { email, password })
                localStorage.setItem('accessToken', data.accessToken)
                localStorage.setItem('refreshToken', data.refreshToken)
                set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isLoading: false })
                return data
            },

            register: async (formData) => {
                set({ isLoading: true })
                const { data } = await api.post('/auth/register', formData)
                localStorage.setItem('accessToken', data.accessToken)
                localStorage.setItem('refreshToken', data.refreshToken)
                set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isLoading: false })
                return data
            },

            logout: async () => {
                try {
                    const { refreshToken } = get()
                    await api.post('/auth/logout', { refreshToken })
                } finally {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    set({ user: null, accessToken: null, refreshToken: null })
                }
            },

            updateUser: (user) => set({ user }),
        }),
        { name: 'auth-store', partialize: (state) => ({ user: state.user }) }
    )
)