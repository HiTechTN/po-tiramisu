'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, AlertTriangle, Plus, Minus } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import Layout from '@/components/Layout/Layout';

interface InventoryItem {
  id: number;
  name: string;
  slug: string;
  quantity_available: number;
  quantity_reserved: number;
  category: string;
  is_active: boolean;
}

export default function AdminInventoryPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState<number | null>(null);
  const [adjustValue, setAdjustValue] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/login'); return; }
    loadInventory();
  }, [isAuthenticated, user, router]);

  const loadInventory = () => {
    setLoading(true);
    adminApi.getInventory()
      .then(res => setItems(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const adjustStock = async (productId: number, adjustment: number) => {
    try {
      await adminApi.adjustInventory(productId, adjustment);
      loadInventory();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur');
    }
    setAdjusting(null);
    setAdjustValue(0);
  };

  if (loading) return <Layout><div className="py-20 text-center text-gray-500">Chargement...</div></Layout>;

  const lowStock = items.filter(i => i.quantity_available < 10);
  const totalStock = items.reduce((sum, i) => sum + i.quantity_available, 0);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">Gestion de l&apos;inventaire</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total en stock</p>
                <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Stock faible</p>
                <p className="text-2xl font-bold text-gray-900">{lowStock.length}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Produits actifs</p>
                <p className="text-2xl font-bold text-gray-900">{items.filter(i => i.is_active).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStock.length > 0 && (
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <h3 className="font-semibold text-amber-800 mb-2">⚠️ Alertes stock faible</h3>
            <div className="space-y-1">
              {lowStock.map(item => (
                <p key={item.id} className="text-sm text-amber-700">
                  {item.name} — <strong>{item.quantity_available}</strong> restant(s)
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Produit</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Catégorie</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Disponible</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Réservé</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Statut</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400">/{item.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{item.category || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${item.quantity_available < 10 ? 'text-red-600' : item.quantity_available < 20 ? 'text-amber-600' : 'text-green-600'}`}>
                        {item.quantity_available}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.quantity_reserved}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {adjusting === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={adjustValue}
                            onChange={e => setAdjustValue(parseInt(e.target.value) || 0)}
                            className="w-20 rounded border px-2 py-1 text-xs"
                            autoFocus
                          />
                          <button onClick={() => adjustStock(item.id, adjustValue)} className="text-xs font-semibold text-green-600 hover:text-green-700">✓</button>
                          <button onClick={() => { setAdjusting(null); setAdjustValue(0); }} className="text-xs font-semibold text-gray-500 hover:text-gray-700">✗</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAdjusting(item.id); setAdjustValue(0); }}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          Ajuster
                        </button>
                      )}
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
