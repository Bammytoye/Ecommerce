'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Users, Search, UserCheck, UserX, ShoppingBag } from 'lucide-react'

export default function AdminUsersPage() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page],
        queryFn: () => api.get('/admin/users', { params: { page, limit: 15 } }).then((r) => r.data),
    })

    const toggleUser = useMutation({
        mutationFn: (id) => api.put(`/admin/users/${id}/toggle`),
        onSuccess: () => {
            toast.success('User status updated')
            queryClient.invalidateQueries(['admin-users'])
        },
        onError: () => toast.error('Failed to update user'),
    })

    const filtered = data?.users?.filter((u) =>
        !search || u.email.includes(search) || `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-white mb-1">Users</h1>
                    <p className="text-white/40">{data?.pagination?.total || 0} total users</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" className="input pl-11 max-w-md" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">User</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Role</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Orders</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Joined</th>
                                <th className="text-left px-6 py-4 text-white/40 text-sm font-medium">Status</th>
                                <th className="text-right px-6 py-4 text-white/40 text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="px-6 py-4"><div className="h-4 bg-dark-600 rounded animate-pulse" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-white/30">
                                            <Users size={40} strokeWidth={1} />
                                            <p>No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered?.map((user) => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-dark-700 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 font-bold text-sm flex-shrink-0">
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{user.firstName} {user.lastName}</p>
                                                    <p className="text-white/40 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge text-xs ${user.role === 'ADMIN' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-500 text-white/50'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-white/60 text-sm">
                                                <ShoppingBag size={14} />
                                                {user._count?.orders || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white/40 text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge text-xs ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {user.isActive ? 'Active' : 'Banned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => toggleUser.mutate(user.id)}
                                                    disabled={user.role === 'ADMIN'}
                                                    className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${user.isActive ? 'text-red-400 hover:bg-red-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                                                    title={user.isActive ? 'Ban user' : 'Activate user'}>
                                                    {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {data?.pagination?.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                        <p className="text-white/40 text-sm">Page {page} of {data.pagination.pages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 px-4 disabled:opacity-30">Previous</button>
                            <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pagination.pages} className="btn-secondary text-sm py-2 px-4 disabled:opacity-30">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}