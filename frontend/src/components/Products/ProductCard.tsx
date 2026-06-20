'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { cartApi } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }: { product: Product }) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsAdding(true);
    try {
      const res = await cartApi.add(product.id, 1);
      useCartStore.getState().setCart(res.data);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">🍰</div>
          )}
          {product.tags?.includes('new') && (
            <span className="absolute top-3 left-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
              Nouveau
            </span>
          )}
          {product.tags?.includes('bestseller') && (
            <span className="absolute top-3 left-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
              Best-seller
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {product.category && (
            <p className="text-xs font-medium uppercase tracking-wider text-brand-600">{product.category}</p>
          )}
          <h3 className="mt-1 text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
            {product.name}
          </h3>

          {/* Rating */}
          {product.average_rating ? (
            <div className="mt-2 flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-gray-700">{product.average_rating}</span>
              <span className="text-xs text-gray-400">({product.reviews_count})</span>
            </div>
          ) : (
            <div className="mt-2 h-5" />
          )}

          {/* Price + CTA */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xl font-bold text-brand-700">{formatPrice(product.price_dt)}</span>
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.quantity_available === 0}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-brand-50 hover:text-brand-600 disabled:opacity-40"
              title="Ajouter au panier"
            >
              {added ? (
                <span className="text-green-500 text-sm font-medium">✓</span>
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
            </button>
          </div>

          {product.quantity_available === 0 && (
            <p className="mt-2 text-xs font-medium text-red-500">Rupture de stock</p>
          )}
        </div>
      </div>
    </Link>
  );
}
