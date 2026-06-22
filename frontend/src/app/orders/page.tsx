'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ArrowRight } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatPrice, formatDate, statusColors, statusLabels } from '@/lib/utils';
import Layout from '@/components/Layout/Layout';
import EmptyState from '@/components/Common/EmptyState';
import type { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    ordersApi.list({ limit: 50 })
      .then(res => setOrders(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (loading) return <Layout><div className="py-20 text-center text-gray-500">Chargement...</div></Layout>;

  if (!orders.length) {
    return (
      <Layout>
        <EmptyState
          icon="📦"
          title="Aucune commande"
          description="Vous n'avez pas encore passé de commande."
          actionLabel="Voir les produits"
          actionHref="/products"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Mes commandes</h1>

        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="card p-5 flex items-center justify-between transition hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Commande #{order.id}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatPrice(order.total_dt)}</p>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
