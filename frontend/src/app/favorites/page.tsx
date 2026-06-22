'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import ProductGrid from '@/components/Products/ProductGrid';
import EmptyState from '@/components/Common/EmptyState';
import { useAuthStore } from '@/lib/store';
import type { Product } from '@/types';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuthStore();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {}
    setLoading(false);
  }, []);

  if (!isAuthenticated) {
    return (
      <Layout>
        <EmptyState
          icon="🔒"
          title="Connectez-vous"
          description="Vous devez être connecté pour voir vos favoris."
          actionLabel="Se connecter"
          actionHref="/login"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-7 w-7 text-brand-600" />
          <h1 className="font-display text-3xl font-bold text-gray-900">Mes Favoris</h1>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Chargement...</div>
        ) : favorites.length === 0 ? (
          <EmptyState
            icon="🤍"
            title="Aucun favori"
            description="Ajoutez des produits à vos favoris pour les retrouver facilement."
            actionLabel="Voir les produits"
            actionHref="/products"
          />
        ) : (
          <ProductGrid products={favorites} />
        )}
      </div>
    </Layout>
  );
}
