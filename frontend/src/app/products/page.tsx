'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { productsApi } from '@/lib/api';
import Layout from '@/components/Layout/Layout';
import ProductGrid from '@/components/Products/ProductGrid';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Product } from '@/types';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    productsApi.getCategories().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: any = { limit: 50, sort, order };
    if (category) params.category = category;
    if (search) params.search = search;

    productsApi.list(params)
      .then(res => setProducts(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, sort, order, search]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Nos Produits</h1>
          <p className="mt-2 text-gray-500">Découvrez notre sélection de tiramisus artisanaux</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Categories */}
            <div className="card p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Catégories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCategory('')}
                  className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition ${
                    !category ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Tous
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition ${
                      category === cat.name ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name} <span className="text-gray-400">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="card mt-4 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Trier par</h3>
              <select
                value={`${sort}-${order}`}
                onChange={e => {
                  const [s, o] = e.target.value.split('-');
                  setSort(s);
                  setOrder(o);
                }}
                className="input-field"
              >
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="price_dt-asc">Prix croissant</option>
                <option value="price_dt-desc">Prix décroissant</option>
                <option value="created_at-desc">Plus récent</option>
              </select>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-gray-500">
              {products.length} produit{products.length !== 1 ? 's' : ''}
            </div>
            <ProductGrid products={products} loading={loading} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
