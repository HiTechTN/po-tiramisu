'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatPrice, statusColors, statusLabels } from '@/lib/utils';
import Layout from '@/components/Layout/Layout';
import type { AdminDashboard } from '@/types';

export default function AdminAnalyticsPage() {
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
  }, [isAuthenticated, user, router]);

  if (loading) return <Layout><div className="py-20 text-center text-gray-500">Chargement...</div></Layout>;
  if (!dashboard) return <Layout><div className="py-20 text-center text-red-500">Erreur de chargement</div></Layout>;

  const avgOrderValue = dashboard.total_orders > 0
    ? dashboard.total_revenue_dt / dashboard.total_orders
    : 0;

  const maxRevenue = Math.max(...dashboard.revenue_by_day.map(d => d.revenue), 1);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">Vue détaillée des performances</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Commandes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.total_orders}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenu Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(dashboard.total_revenue_dt)}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Panier Moyen</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(avgOrderValue)}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Clients Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.active_customers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Revenue Chart (Bar) */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Revenu par jour (30 derniers jours)</h2>
            {dashboard.revenue_by_day.length > 0 ? (
              <div className="space-y-2">
                {dashboard.revenue_by_day.slice(-14).map(day => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-gray-500 shrink-0">{day.date}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded transition-all"
                        style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 text-xs font-medium text-gray-900 text-right shrink-0">{formatPrice(day.revenue)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">Aucune donnée de revenu</p>
            )}
          </div>

          {/* Order Status Distribution */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Distribution des statuts</h2>
            <div className="space-y-3">
              {Object.entries(dashboard.order_status_distribution).map(([status, count]) => {
                const total = Object.values(dashboard.order_status_distribution).reduce((a, b) => a + (b as number), 0);
                const pct = total > 0 ? ((count as number) / total) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[status] || status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{count as number} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Products */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Produits les plus vendus</h2>
            {dashboard.top_products.length > 0 ? (
              <div className="space-y-3">
                {dashboard.top_products.slice(0, 5).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{p.name || `Produit #${p.product_id}`}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{p.count} ventes</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">Aucune donnée</p>
            )}
          </div>

          {/* Recent Orders */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Commandes récentes</h2>
            <div className="space-y-3">
              {dashboard.recent_orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{order.id}</p>
                    <p className="text-xs text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleDateString('fr-TN') : 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(order.total_dt)}</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
