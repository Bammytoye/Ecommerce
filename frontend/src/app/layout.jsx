'use client'
import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import CartDrawer from '@/components/cart/CartDrawer'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

function LayoutContent({ children }) {
  const pathname = usePathname()

  // Hide navbar on auth pages and admin pages
  const isAuthPage = pathname?.startsWith('/auth')
  const isAdminPage = pathname?.startsWith('/admin')
  const isPaymentPage = pathname?.startsWith('/payment')
  const showNavbar = !isAuthPage && !isAdminPage && !isPaymentPage

  return (
    <>
      {showNavbar && <Navbar />}
      {showNavbar && <CartDrawer />}
      <main>{children}</main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
        }}
      />
    </>
  )
}

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
  }))

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <LayoutContent>{children}</LayoutContent>
        </QueryClientProvider>
      </body>
    </html>
  )
}