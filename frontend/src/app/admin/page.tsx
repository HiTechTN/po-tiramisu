'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatPrice, statusColors, statusLabels, formatDate } from '@/lib/utils';
import Layout from '@/components/Layout/Layout';
import type { AdminDashboard } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/login'); return; }
    adminApi.getDashboard()
      .then(res => setDashboard(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, user]);

  if (loading) return <Layout><div className="py-20 text-center text-gray-500">Chargement...</div></Layout>;
  if (!dashboard) return <Layout><div className="py-20 text-center text-red-500">Erreur de chargement</div></Layout>;

  const kpis = [
    { label: 'Total Commandes', value: dashboard.total_orders, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Revenu Total', value: formatPrice(dashboard.total_revenue_dt), icon: TrendingUp, color: 'bg-green-500' },
    { label: 'En Attente', value: dashboard.pending_orders, icon: Clock, color: 'bg-amber-500' },
    { label: 'Clients Actifs', value: dashboard.active_customers, icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="mt-1 text-sm text-gray-500">Vue d'ensemble de votre boutique</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/orders" className="btn-secondary text-sm">Commandes</Link>
            <Link href="/admin/products" className="btn-primary text-sm">Produits</Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {kpis.map(kpi => (
            <div key={kpi.label} className="card p-5">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Orders */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Commandes récentes</h2>
              <Link href="/admin/orders" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Voir tout</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-left font-semibold text-gray-600">ID</th>
                    <th className="pb-3 text-left font-semibold text-gray-600">Client</th>
                    <th className="pb-3 text-left font-semibold text-gray-600">Montant</th>
                    <th className="pb-3 text-left font-semibold text-gray-600">Statut</th>
                    <th className="pb-3 text-left font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dashboard.recent_orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">#{order.id}</td>
                      <td className="py-3 text-gray-600">Client #{order.user_id}</td>
                      <td className="py-3 font-medium text-gray-900">{formatPrice(order.total_dt)}</td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleDateString('fr-TN') : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Statuts des commandes</h2>
            <div className="space-y-3">
              {Object.entries(dashboard.order_status_distribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[status] || status}
                  </span>
                  <span className="font-semibold text-gray-900">{count as number}</span>
                </div>
              ))}
            </div>

            {/* Revenue by Day */}
            {dashboard.revenue_by_day.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Revenu par jour</h3>
                <div className="space-y-2">
                  {dashboard.revenue_by_day.slice(-7).map(day => (
                    <div key={day.date} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{day.date}</span>
                      <span className="font-medium text-gray-900">{formatPrice(day.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
