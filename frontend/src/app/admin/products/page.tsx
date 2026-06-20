'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import Layout from '@/components/Layout/Layout';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price_dt: 0, cost_dt: 0,
    quantity_available: 0, image_url: '', category: '', tags: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/login'); return; }
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    adminApi.getProducts({ limit: 100 })
      .then(res => setProducts(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const startEdit = (product: Product) => {
    setEditing(product.id);
    setForm({
      name: product.name, slug: product.slug, description: product.description || '',
      price_dt: product.price_dt, cost_dt: product.cost_dt || 0,
      quantity_available: product.quantity_available, image_url: product.image_url || '',
      category: product.category || '', tags: (product.tags || []).join(', '),
    });
  };

  const saveProduct = async () => {
    const data = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await adminApi.updateProduct(editing, data);
      } else {
        await adminApi.createProduct(data);
      }
      setEditing(null);
      setShowCreate(false);
      loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Supprimer ce produit?')) return;
    await adminApi.deleteProduct(id);
    loadProducts();
  };

  const toggleActive = async (product: Product) => {
    await adminApi.updateProduct(product.id, { is_active: !product.is_active });
    loadProducts();
  };

  const renderForm = () => (
    <div className="card p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{editing ? 'Modifier' : 'Nouveau produit'}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className="input-field" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field h-20 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix (DT) *</label>
          <input type="number" step="0.01" value={form.price_dt} onChange={e => setForm(p => ({ ...p, price_dt: parseFloat(e.target.value) || 0 }))} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Coût (DT)</label>
          <input type="number" step="0.01" value={form.cost_dt} onChange={e => setForm(p => ({ ...p, cost_dt: parseFloat(e.target.value) || 0 }))} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input type="number" value={form.quantity_available} onChange={e => setForm(p => ({ ...p, quantity_available: parseInt(e.target.value) || 0 }))} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <input type="text" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-field" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input type="url" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="input-field" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (séparés par virgule)</label>
          <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="input-field" />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button onClick={() => { setEditing(null); setShowCreate(false); }} className="btn-secondary text-sm">Annuler</button>
        <button onClick={saveProduct} disabled={!form.name || !form.price_dt} className="btn-primary text-sm">
          <Save className="mr-2 h-4 w-4" /> {editing ? 'Sauvegarder' : 'Créer'}
        </button>
      </div>
    </div>
  );

  if (loading) return <Layout><div className="py-20 text-center text-gray-500">Chargement...</div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">Gestion des produits</h1>
          {!showCreate && !editing && (
            <button onClick={() => { setShowCreate(true); setForm({ name: '', slug: '', description: '', price_dt: 0, cost_dt: 0, quantity_available: 0, image_url: '', category: '', tags: '' }); }} className="btn-primary text-sm">
              <Plus className="mr-2 h-4 w-4" /> Nouveau produit
            </button>
          )}
        </div>

        {showCreate && renderForm()}
        {editing && renderForm()}

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Produit</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Catégorie</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Prix</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Actif</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-400">/{product.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{product.category || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(product.price_dt)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${product.quantity_available < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.quantity_available}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(product)} className="text-gray-500 hover:text-brand-600">
                        {product.is_active ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-red-400" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => startEdit(product)} className="text-gray-500 hover:text-brand-600 p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="text-gray-500 hover:text-red-500 p-1">
                        <Trash2 className="h-4 w-4" />
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
