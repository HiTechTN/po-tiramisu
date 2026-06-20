'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Star, Minus, Plus, ArrowLeft } from 'lucide-react';
import { productsApi, cartApi } from '@/lib/api';
import { useAuthStore, useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import Layout from '@/components/Layout/Layout';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import Link from 'next/link';
import type { Product, ReviewList } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ReviewList | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.slug) return;
    Promise.all([
      productsApi.get(params.slug as string),
      productsApi.getReviews(parseInt(params.slug as string) || 0),
    ])
      .then(([prodRes, revRes]) => {
        setProduct(prodRes.data);
        // Try fetching reviews by product id
        productsApi.getReviews(prodRes.data.id).then(r => setReviews(r.data)).catch(() => {});
      })
      .catch(() => setError('Produit non trouvé'))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setAdding(true);
    try {
      const res = await cartApi.add(product!.id, quantity);
      useCartStore.getState().setCart(res.data);
      router.push('/cart');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'ajout au panier');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Layout><div className="py-20"><LoadingSpinner size="lg" /></div></Layout>;
  if (error || !product) return <Layout><div className="py-20 text-center text-red-500">{error || 'Produit non trouvé'}</div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour aux produits
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-8xl">🍰</div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && (
              <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 uppercase">
                {product.category}
              </span>
            )}
            <h1 className="mt-3 font-display text-3xl font-bold text-gray-900">{product.name}</h1>

            {product.average_rating ? (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`h-5 w-5 ${i <= Math.round(product.average_rating!) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{product.average_rating}</span>
                <span className="text-sm text-gray-400">({product.reviews_count} avis)</span>
              </div>
            ) : null}

            <p className="mt-4 text-3xl font-bold text-brand-700">{formatPrice(product.price_dt)}</p>

            {product.description && (
              <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {/* Stock */}
            <div className="mt-6">
              {product.quantity_available > 0 ? (
                <span className="text-sm font-medium text-green-600">
                  ✓ En stock ({product.quantity_available} disponibles)
                </span>
              ) : (
                <span className="text-sm font-medium text-red-500">✗ Rupture de stock</span>
              )}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity + Add to Cart */}
            {product.quantity_available > 0 && (
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-gray-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-3 text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity_available, quantity + 1))}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button onClick={handleAddToCart} disabled={adding} className="flex-1 btn-primary py-3">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {adding ? 'Ajout...' : `Ajouter au panier — ${formatPrice(product.price_dt * quantity)}`}
                </button>
              </div>
            )}

            {/* Delivery info */}
            <div className="mt-8 card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">🚗 Livraison</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Livraison en 24h dans le Grand Tunis</li>
                <li>• Frais de livraison: 5 DT</li>
                <li>• Livraison gratuite à partir de 100 DT d&apos;achat</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {reviews && reviews.items.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
              Avis clients ({reviews.total_reviews})
            </h2>
            <div className="space-y-4">
              {reviews.items.map(review => (
                <div key={review.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm">
                        {review.user_name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{review.user_name}</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.is_verified && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">Vérifié</span>
                    )}
                  </div>
                  {review.title && <p className="mt-2 font-medium text-gray-900">{review.title}</p>}
                  {review.comment && <p className="mt-1 text-sm text-gray-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
