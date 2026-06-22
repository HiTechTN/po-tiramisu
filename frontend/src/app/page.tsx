'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Star, Truck, Shield, Heart, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api';
import Layout from '@/components/Layout/Layout';
import ProductGrid from '@/components/Products/ProductGrid';
import type { Product } from '@/types';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.list({ limit: 4, sort: 'created_at', order: 'desc' })
      .then(res => setFeatured(res.data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-orange-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold text-brand-700">
                🎉 Livraison 24h à Tunis
              </span>
              <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Tiramisus <span className="text-brand-600">artisanaux</span> faits avec amour
              </h1>
              <p className="mt-6 max-w-lg text-lg text-gray-600">
                Découvrez nos tiramisus faits maison avec des ingrédients frais et importés d&apos;Italie.
                Chaque bouchée est une explosion de saveurs authentiques.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/products" className="btn-primary text-base px-8 py-4">
                  Commander maintenant <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/about" className="btn-secondary text-base px-8 py-4">
                  En savoir plus
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-brand-100 to-brand-200 p-8 shadow-2xl">
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1571877227200-a0fb08a01a09?w=800"
                    alt="Tiramisu artisanal"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">4.8/5 avis clients</p>
                    <p className="text-xs text-gray-500">+200 avis vérifiés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Livraison 24h</h3>
                <p className="text-sm text-gray-500">Grand Tunis & environs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fait main</h3>
                <p className="text-sm text-gray-500">Ingrédients frais & naturels</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Paiement sécurisé</h3>
                <p className="text-sm text-gray-500">Flouci & Paymee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-gray-900">Nos produits phares</h2>
              <p className="mt-2 text-gray-500">Les coups de cœur de nos clients</p>
            </div>
            <Link href="/products" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={featured} loading={loading} />
          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="btn-primary">Voir tous les produits</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold text-white">Prêt à commander?</h2>
          <p className="mt-4 text-lg text-brand-100">
            Vos tiramisus artisanaux préférés livrés chez vous en 24h.
          </p>
          <Link href="/products" className="mt-8 inline-flex items-center rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-lg transition hover:bg-brand-50">
            Voir le menu 🍰
          </Link>
        </div>
      </section>
    </Layout>
  );
}
