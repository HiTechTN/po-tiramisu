'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, Truck, Package, XCircle } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatPrice, formatDate, statusColors, statusLabels } from '@/lib/utils';
import Layout from '@/components/Layout/Layout';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import Image from 'next/image';
import type { Order } from '@/types';

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: Package,
  ready: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    // If redirected from payment with success
    if (searchParams.get('success') === 'true') {
      // Wait a moment for backend to process
      setTimeout(() => {
        ordersApi.get(parseInt(orderId))
          .then(res => setOrder(res.data))
          .catch(() => {})
          .finally(() => setLoading(false));
      }, 1500);
    } else {
      ordersApi.get(parseInt(orderId))
        .then(res => setOrder(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, isAuthenticated]);

  if (loading) return <Layout><div className="py-20"><LoadingSpinner size="lg" /></div></Layout>;
  if (!order) return <Layout><div className="py-20 text-center text-red-500">Commande non trouvée</div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Mes commandes
        </Link>

        {/* Success Banner */}
        {searchParams.get('success') === 'true' && (
          <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Commande confirmée!</p>
              <p className="text-sm text-green-600">Votre commande a été passée avec succès.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Commande #{order.id}</h1>
            <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
              {statusLabels[order.status] || order.status}
            </span>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.payment_status] || 'bg-gray-100 text-gray-800'}`}>
              💳 {statusLabels[order.payment_status] || order.payment_status}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Suivi</h2>
              <div className="space-y-4">
                {order.timeline?.map((step, i) => {
                  const Icon = statusIcons[step.status] || Clock;
                  const isLast = i === order.timeline.length - 1;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isLast ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {!isLast && <div className="w-px h-full bg-gray-200 mt-2" />}
                      </div>
                      <div className={`pb-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
                        <p className={`font-medium ${isLast ? 'text-gray-900' : 'text-gray-600'}`}>
                          {statusLabels[step.status] || step.status}
                        </p>
                        <p className="text-xs text-gray-400">{formatDate(step.timestamp)}</p>
                        {step.message && <p className="text-sm text-gray-500 mt-1">{step.message}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Articles</h2>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.product_image ? (
                        <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl">🍰</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                      <p className="text-sm text-gray-500">{item.quantity} × {formatPrice(item.unit_price_dt)}</p>
                    </div>
                    <span className="font-semibold text-gray-900">{formatPrice(item.total_price_dt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Résumé</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{formatPrice(order.subtotal_dt)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span>{formatPrice(order.delivery_fee_dt)}</span></div>
                {order.discount_dt > 0 && <div className="flex justify-between text-green-600"><span>Réduction</span><span>-{formatPrice(order.discount_dt)}</span></div>}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-brand-700">{formatPrice(order.total_dt)}</span></div>
              </div>
            </div>

            {/* Delivery Address */}
            {order.delivery_address && (
              <div className="card p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-2">📍 Adresse de livraison</h2>
                <p className="text-sm text-gray-600">{order.delivery_address.street}</p>
                <p className="text-sm text-gray-600">{order.delivery_address.city}{order.delivery_address.postal_code ? `, ${order.delivery_address.postal_code}` : ''}</p>
                {order.delivery_address.governorate && <p className="text-xs text-gray-400">{order.delivery_address.governorate}</p>}
              </div>
            )}

            {/* Delivery Info */}
            {order.delivery && (
              <div className="card p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-2">🚗 Livraison</h2>
                <p className="text-sm text-gray-600">Statut: <span className={`font-medium ${statusColors[order.delivery.status] ? '' : 'text-gray-600'}`}>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[order.delivery.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[order.delivery.status] || order.delivery.status}
                  </span>
                </span></p>
                {order.delivery.delivery_person_name && (
                  <p className="text-sm text-gray-600 mt-1">Livreur: {order.delivery.delivery_person_name}</p>
                )}
                {order.delivery.delivery_person_phone && (
                  <p className="text-sm text-gray-500">📞 {order.delivery.delivery_person_phone}</p>
                )}
              </div>
            )}

            {/* Payment Info */}
            <div className="card p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-2">💳 Paiement</h2>
              <p className="text-sm text-gray-600 capitalize">Méthode: {order.payment_method || 'N/A'}</p>
              <p className="text-sm text-gray-600">Réf: {order.payment_ref || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
