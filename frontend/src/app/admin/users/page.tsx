'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, UserCheck, UserX } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Layout from '@/components/Layout/Layout';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/login'); return; }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, router, roleFilter]);

  const loadUsers = () => {
    setLoading(true);
    const params: any = { limit: 100 };
    if (roleFilter) params.role = roleFilter;
    adminApi.getUsers(params)
      .then(res => setUsers(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const toggleActive = async (userId: number, currentActive: boolean) => {
    try {
      await adminApi.updateUser(userId, { is_active: !currentActive });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur');
    }
  };

  if (loading) return <Layout><div className="py-20 text-center text-gray-500">Chargement...</div></Layout>;

  const customers = users.filter(u => u.role === 'customer');
  const admins = users.filter(u => u.role === 'admin');
  const delivery = users.filter(u => u.role === 'delivery');

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Clients</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 text-white">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Livreurs</p>
                <p className="text-2xl font-bold text-gray-900">{delivery.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['', 'customer', 'admin', 'delivery'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                roleFilter === r ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r ? (r === 'customer' ? 'Clients' : r === 'admin' ? 'Admins' : 'Livreurs') : 'Tous'}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Utilisateur</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Téléphone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Rôle</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Inscrit le</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Statut</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                          {u.full_name?.[0] || '?'}
                        </div>
                        <span className="font-medium text-gray-900">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'delivery' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role === 'customer' ? 'Client' : u.role === 'admin' ? 'Admin' : 'Livreur'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(u.id, u.is_active)}
                        className={`text-xs font-semibold ${u.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                      >
                        {u.is_active ? <UserX className="h-4 w-4 inline" /> : <UserCheck className="h-4 w-4 inline" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
