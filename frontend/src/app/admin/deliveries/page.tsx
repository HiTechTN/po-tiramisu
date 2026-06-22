'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Truck, MapPin, Clock, CheckCircle, XCircle,
  User, Phone, Home, Edit3, Users, Crosshair, X, Loader2, ChevronDown,
} from 'lucide-react';
import { adminApi, deliveriesApi } from '@/lib/api';
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

interface DeliveryPerson {
  id: number;
  full_name: string;
  phone: string | null;
}

type ModalType = 'assign' | 'status' | 'location' | null;

const statusTransitions: Record<string, string[]> = {
  pending: ['assigned', 'failed'],
  assigned: ['in_progress', 'failed'],
  in_progress: ['delivered', 'failed'],
  delivered: [],
  failed: ['pending'],
};

export default function AdminDeliveriesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null);

  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Assign modal
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [loadingPersons, setLoadingPersons] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  // Status modal
  const [newStatus, setNewStatus] = useState('');

  // Location modal
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');

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

  const openModal = (type: ModalType, delivery: DeliveryItem) => {
    setSelectedDelivery(delivery);
    setModalType(type);
    setModalError('');
    setSelectedPersonId(null);
    setNewStatus('');
    setNewLat(delivery.current_latitude?.toString() || '');
    setNewLng(delivery.current_longitude?.toString() || '');

    if (type === 'assign') {
      setLoadingPersons(true);
      adminApi.getUsers({ role: 'delivery', limit: 50 })
        .then(res => setDeliveryPersons(res.data.items))
        .catch(() => setDeliveryPersons([]))
        .finally(() => setLoadingPersons(false));
    }
    if (type === 'status') {
      const transitions = statusTransitions[delivery.status] || [];
      setNewStatus(transitions[0] || '');
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedDelivery(null);
    setModalError('');
  };

  const handleAssign = async () => {
    if (!selectedDelivery || !selectedPersonId) return;
    setModalLoading(true);
    setModalError('');
    try {
      await deliveriesApi.assign(selectedDelivery.id, selectedPersonId);
      closeModal();
      loadDeliveries();
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.detail || (err as Error).message || "Erreur lors de l'assignation";
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedDelivery || !newStatus) return;
    setModalLoading(true);
    setModalError('');
    try {
      await deliveriesApi.updateStatus(selectedDelivery.id, newStatus);
      closeModal();
      loadDeliveries();
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.detail || (err as Error).message || 'Erreur lors de la mise à jour';
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleLocationUpdate = async () => {
    if (!selectedDelivery) return;
    const lat = parseFloat(newLat);
    const lng = parseFloat(newLng);
    if (isNaN(lat) || isNaN(lng)) {
      setModalError('Coordonnées invalides');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      await deliveriesApi.updateLocation(selectedDelivery.id, lat, lng);
      closeModal();
      loadDeliveries();
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.detail || (err as Error).message || 'Erreur de localisation';
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
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
              const isSelected = selectedDelivery?.id === d.id && modalType === null;
              const allowedTransitions = statusTransitions[d.status] || [];

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
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded details + actions */}
                  {isSelected && (
                    <div className="border-t bg-gray-50 px-5 py-4">
                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                      {/* Action buttons */}
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); openModal('assign', d); }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                          <Users className="h-4 w-4" />
                          {d.delivery_person_name ? 'Réassigner' : 'Assigner'}
                        </button>

                        {allowedTransitions.length > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal('status', d); }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                          >
                            <Edit3 className="h-4 w-4" />
                            Changer statut
                          </button>
                        )}

                        <button
                          onClick={(e) => { e.stopPropagation(); openModal('location', d); }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                          <Crosshair className="h-4 w-4" />
                          Localisation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────── */}
      {modalType && selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {modalType === 'assign' && 'Assigner un livreur'}
                {modalType === 'status' && 'Changer le statut'}
                {modalType === 'location' && 'Mettre à jour la position'}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {modalError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {modalError}
                </div>
              )}

              {/* Assign modal */}
              {modalType === 'assign' && (
                <>
                  <p className="text-sm text-gray-500">
                    Livraison #{selectedDelivery.id} — Commande #{selectedDelivery.order_id}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Livreur</label>
                    <select
                      value={selectedPersonId ?? ''}
                      onChange={e => setSelectedPersonId(Number(e.target.value))}
                      className="input-field w-full"
                    >
                      <option value="">— Sélectionner un livreur —</option>
                      {deliveryPersons.map(dp => (
                        <option key={dp.id} value={dp.id}>
                          {dp.full_name}{dp.phone ? ` (${dp.phone})` : ''}
                        </option>
                      ))}
                    </select>
                    {loadingPersons && (
                      <p className="mt-1 text-xs text-gray-400">Chargement des livreurs...</p>
                    )}
                    {!loadingPersons && deliveryPersons.length === 0 && (
                      <p className="mt-1 text-xs text-gray-400">Aucun livreur disponible</p>
                    )}
                  </div>
                </>
              )}

              {/* Status modal */}
              {modalType === 'status' && (
                <>
                  <p className="text-sm text-gray-500">
                    Statut actuel: <span className={`font-semibold ${statusColors[selectedDelivery.status]}`}>{statusLabels[selectedDelivery.status] || selectedDelivery.status}</span>
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau statut</label>
                    <select
                      value={newStatus}
                      onChange={e => setNewStatus(e.target.value)}
                      className="input-field w-full"
                    >
                      <option value="">— Sélectionner —</option>
                      {(statusTransitions[selectedDelivery.status] || []).map(s => (
                        <option key={s} value={s}>{statusLabels[s] || s}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Location modal */}
              {modalType === 'location' && (
                <>
                  <p className="text-sm text-gray-500">
                    Mettre à jour la position GPS de la livraison #{selectedDelivery.id}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={newLat}
                        onChange={e => setNewLat(e.target.value)}
                        className="input-field w-full"
                        placeholder="36.8065"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={newLng}
                        onChange={e => setNewLng(e.target.value)}
                        className="input-field w-full"
                        placeholder="10.1815"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Entrez les coordonnées GPS (WGS 84)</p>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
              <button onClick={closeModal} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                Annuler
              </button>
              <button
                onClick={
                  modalType === 'assign' ? handleAssign :
                  modalType === 'status' ? handleStatusUpdate :
                  handleLocationUpdate
                }
                disabled={modalLoading || (modalType === 'assign' && !selectedPersonId) || (modalType === 'status' && !newStatus)}
                className="btn-primary inline-flex items-center gap-2"
              >
                {modalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {modalType === 'assign' && 'Assigner'}
                {modalType === 'status' && 'Mettre à jour'}
                {modalType === 'location' && 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
