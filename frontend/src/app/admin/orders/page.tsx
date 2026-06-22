'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import Layout from '@/components/Layout/Layout';
import type { Product } from '@/types';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/login'); return; }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadOrders = () => {
    setLoading(true);
    const params: any = { limit: 50 };
    if (statusFilter) params.status = statusFilter;
    adminApi.getOrders(params)
      .then(res => setOrders(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur');
    }
  };

  const statuses = ['', 'pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled'];
  const statusLabels: Record<string, string> = {
    '': 'Tous',
    pending: 'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    ready: 'Prête',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  if (loading) return <Layout><div className="py-20 text-center text-gray-500">Chargement...</div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">Gestion des commandes</h1>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                statusFilter === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {statusLabels[s] || s}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Client</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Articles</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Montant</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Statut</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Paiement</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">#{order.id}</td>
                    <td className="px-4 py-3 text-gray-600">#{order.user_id}</td>
                    <td className="px-4 py-3 text-gray-600">{order.items?.length || 0} article(s)</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(order.total_dt)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold"
                      >
                        {['pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        order.payment_status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        onChange={e => { if (e.target.value) updateStatus(order.id, e.target.value); e.target.value = order.status; }}
                        className="text-xs text-brand-600 font-semibold"
                        defaultValue=""
                      >
                        <option value="" disabled>Actions rapides</option>
                        {order.status === 'pending' && <option value="confirmed">✓ Confirmer</option>}
                        {order.status === 'confirmed' && <option value="preparing">🍳 Préparer</option>}
                        {order.status === 'preparing' && <option value="ready">📦 Marquer prêt</option>}
                        {order.status === 'ready' && <option value="shipped">🚚 Expédier</option>}
                        {order.status === 'shipped' && <option value="delivered">✅ Marquer livré</option>}
                      </select>
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
