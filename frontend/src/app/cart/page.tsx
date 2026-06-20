'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { cartApi } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import Layout from '@/components/Layout/Layout';
import EmptyState from '@/components/Common/EmptyState';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotal, deliveryFee, discount, total, promoCode, itemCount, setCart } = useCartStore();
  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    cartApi.get()
      .then(res => setCart(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const updateQuantity = async (productId: number, qty: number, productName: string) => {
    if (qty < 1) {
      if (!confirm(`Retirer « ${productName} » du panier ?`)) return;
      await cartApi.remove(productId);
    } else {
      await cartApi.update(productId, qty);
    }
    const res = await cartApi.get();
    setCart(res.data);
  };

  const removeItem = async (productId: number) => {
    await cartApi.remove(productId);
    const res = await cartApi.get();
    setCart(res.data);
  };

  const applyPromo = async () => {
    if (!promoInput) return;
    try {
      const res = await cartApi.applyPromo(promoInput);
      setPromoMsg(res.data.message);
      if (res.data.success) {
        const cartRes = await cartApi.get();
        setCart(cartRes.data);
        setPromoInput('');
      }
    } catch (err: any) {
      setPromoMsg(err.response?.data?.detail || 'Erreur');
    }
  };

  if (loading) return <Layout><div className="py-20 text-center text-gray-500">Chargement...</div></Layout>;

  if (!items.length) {
    return (
      <Layout>
        <EmptyState
          icon="🛒"
          title="Votre panier est vide"
          description="Ajoutez des tiramisus délicieux à votre panier!"
          actionLabel="Voir les produits"
          actionHref="/products"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Panier ({itemCount} articles)</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.product_id} className="card p-4 flex gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.product_image ? (
                    <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">🍰</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.product_name}</h3>
                  <p className="text-sm text-gray-500">{formatPrice(item.unit_price_dt)} par unité</p>
                  {!item.in_stock && (
                    <p className="text-xs text-red-500 mt-1">Stock insuffisant</p>
                  )}
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.product_id)} className="text-gray-400 hover:text-red-500 transition p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center rounded-lg border border-gray-300">
                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.product_name)} className="px-2 py-1 text-gray-500 hover:bg-gray-50">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.product_name)} className="px-2 py-1 text-gray-500 hover:bg-gray-50">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-brand-700">{formatPrice(item.total_price_dt)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Résumé</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span className="font-medium">{formatPrice(deliveryFee)}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-brand-700">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Code promo"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      className="input-field pl-10 text-sm"
                    />
                  </div>
                  <button onClick={applyPromo} className="btn-secondary text-sm px-4">
                    Appliquer
                  </button>
                </div>
                {promoMsg && <p className="mt-2 text-xs text-gray-500">{promoMsg}</p>}
                {promoCode && <p className="mt-1 text-xs text-green-600">✓ Code {promoCode} appliqué</p>}
              </div>

              <Link href="/checkout" className="mt-6 flex w-full items-center justify-center gap-2 btn-primary py-3">
                Passer la commande <ArrowRight className="h-4 w-4" />
              </Link>

              <Link href="/products" className="mt-3 block text-center text-sm text-brand-600 hover:text-brand-700">
                Continuer le shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
