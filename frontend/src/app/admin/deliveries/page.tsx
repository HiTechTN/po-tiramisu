'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Layout from '@/components/Layout/Layout';
import { formatDate, statusColors, statusLabels } from '@/lib/utils';

const deliveryStatuses = ['', 'pending', 'assigned', 'in_progress', 'delivered', 'failed'];

export default function AdminDeliveriesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/login'); return; }
    loadDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, router, statusFilter]);

  const loadDeliveries = () => {
    setLoading(true);
    adminApi.getOrders({ limit: 50 })
      .then(res => {
        const ordersWithDelivery = res.data.items.filter((o: any) => o.delivery);
        setDeliveries(ordersWithDelivery);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  if (loading) return <Layout><div className="py-20 text-center text-gray-500">Chargement...</div></Layout>;

  const statusIcons: Record<string, any> = {
    pending: Clock,
    assigned: Truck,
    in_progress: MapPin,
    delivered: CheckCircle,
    failed: XCircle,
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">Gestion des livraisons</h1>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {deliveryStatuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                statusFilter === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s ? (statusLabels[s] || s) : 'Tous'}
            </button>
          ))}
        </div>

        {deliveries.length === 0 ? (
          <div className="card p-12 text-center">
            <Truck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune livraison trouvée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map(order => {
              const delivery = order.delivery;
              const Icon = statusIcons[delivery.status] || Clock;
              return (
                <div key={order.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        delivery.status === 'delivered' ? 'bg-green-100 text-green-600' :
                        delivery.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Commande #{order.id}</p>
                        <p className="text-sm text-gray-500">
                          Livraison #{delivery.id} — {delivery.delivery_person_name || 'Non assigné'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[delivery.status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[delivery.status] || delivery.status}
                      </span>
                      <p className="mt-1 text-sm text-gray-500">{formatDate(delivery.created_at || order.created_at)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
