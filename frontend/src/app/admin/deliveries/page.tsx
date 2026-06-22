'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, MapPin, Clock, CheckCircle, XCircle, User, Phone, Home } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Layout from '@/components/Layout/Layout';
import { formatDate, statusColors, statusLabels } from '@/lib/utils';

const deliveryStatuses = ['', 'pending', 'assigned', 'in_progress', 'delivered', 'failed'];

interface DeliveryItem {
  id: number;
  uuid: string;
  status: string;
  order_id: number;
  order_status: string;
  order_total_dt: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_person_name: string | null;
  delivery_person_phone: string | null;
  delivery_address: { street: string; city: string; governorate: string } | null;
  current_latitude: number | null;
  current_longitude: number | null;
  pickup_time: string | null;
  delivery_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminDeliveriesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null);

  const loadDeliveries = useCallback(() => {
    setLoading(true);
    const params: { limit: number; status?: string } = { limit: 50 };
    if (statusFilter) params.status = statusFilter;

    adminApi.getDeliveries(params)
      .then(res => {
        setDeliveries(res.data.items);
        setTotal(res.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/login'); return; }
    loadDeliveries();
  }, [isAuthenticated, user, router, loadDeliveries]);

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
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Gestion des livraisons</h1>
            <p className="mt-1 text-sm text-gray-500">{total} livraison{total !== 1 ? 's' : ''} au total</p>
          </div>
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
            {deliveries.map(d => {
              const Icon = statusIcons[d.status] || Clock;
              const isSelected = selectedDelivery?.id === d.id;
              return (
                <div key={d.id} className="card overflow-hidden">
                  {/* Main row */}
                  <div
                    className="p-5 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => setSelectedDelivery(isSelected ? null : d)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          d.status === 'delivered' ? 'bg-green-100 text-green-600' :
                          d.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                          d.status === 'failed' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Livraison #{d.id} — Commande #{d.order_id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {d.customer_name || 'Client inconnu'}
                            {d.delivery_person_name ? ` • Livreur: ${d.delivery_person_name}` : ' • Non assigné'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[d.status] || 'bg-gray-100 text-gray-800'}`}>
                            {statusLabels[d.status] || d.status}
                          </span>
                          <p className="mt-1 text-sm text-gray-500">{formatDate(d.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isSelected && (
                    <div className="border-t bg-gray-50 px-5 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Customer info */}
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client</p>
                            <p className="text-sm font-semibold text-gray-900">{d.customer_name}</p>
                            <p className="text-sm text-gray-600">{d.customer_email}</p>
                            {d.customer_phone && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {d.customer_phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Delivery person info */}
                        <div className="flex items-start gap-3">
                          <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Livreur</p>
                            {d.delivery_person_name ? (
                              <>
                                <p className="text-sm font-semibold text-gray-900">{d.delivery_person_name}</p>
                                {d.delivery_person_phone && (
                                  <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {d.delivery_person_phone}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-gray-400 italic">Non assigné</p>
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-start gap-3">
                          <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adresse</p>
                            {d.delivery_address ? (
                              <>
                                <p className="text-sm font-semibold text-gray-900">{d.delivery_address.street}</p>
                                <p className="text-sm text-gray-600">
                                  {d.delivery_address.city}{d.delivery_address.governorate ? `, ${d.delivery_address.governorate}` : ''}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-400 italic">Adresse non disponible</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                        {d.pickup_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" /> Récupéré: {formatDate(d.pickup_time)}
                          </span>
                        )}
                        {d.delivery_time && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" /> Livré: {formatDate(d.delivery_time)}
                          </span>
                        )}
                        {d.current_latitude && d.current_longitude && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-blue-500" /> GPS: {d.current_latitude.toFixed(4)}, {d.current_longitude.toFixed(4)}
                          </span>
                        )}
                        {d.order_total_dt != null && (
                          <span className="font-medium">Total: {d.order_total_dt.toFixed(2)} DT</span>
                        )}
                      </div>

                      {d.notes && (
                        <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm text-yellow-800">
                          📝 {d.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
