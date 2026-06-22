import Link from 'next/link';
import { Heart, Truck, Shield, Star, MapPin, Phone, Mail } from 'lucide-react';
import Layout from '@/components/Layout/Layout';

export default function AboutPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-orange-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="text-6xl mb-4 block">🍰</span>
          <h1 className="font-display text-4xl font-extrabold text-gray-900 sm:text-5xl">
            À propos de <span className="text-brand-600">Po_Tiramisu</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
            Une aventure née de la passion pour la pâtisserie italienne et le goût tunisien.
            Chaque tiramisu est une promesse de qualité, de fraîcheur et de bonheur.
          </p>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-gray-900 text-center mb-12">Notre Histoire</h2>
          <div className="prose prose-lg mx-auto text-gray-600">
            <p>
              Po_Tiramisu est née d&apos;une simple idée : pourquoi ne pas offrir aux Tunisiens
              des tiramisus artisanaux à la hauteur de ceux qu&apos;on goûte en Italie ?
            </p>
            <p>
              Depuis notre petite cuisine à Tunis, nous préparons chaque tiramisu à la main
              avec des ingrédients soigneusement sélectionnés : mascarpone frais importé d&apos;Italie,
              café espresso tunisien de qualité supérieure, cacao amer et biscuits imbibés avec amour.
            </p>
            <p>
              Notre mission est simple : rendre accessible à tous les amoureux de la pâtisserie
              des tiramisus authentiques, livrés frais chez vous en moins de 24 heures.
            </p>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-gray-900 text-center mb-12">Nos Valeurs</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Heart, title: 'Fait avec amour', desc: 'Chaque tiramisu est préparé à la main avec passion et dévouement.' },
              { icon: Shield, title: 'Qualité garantie', desc: 'Ingrédients frais et naturels, sans conservateurs ni arômes artificiels.' },
              { icon: Truck, title: 'Livraison rapide', desc: 'Vos tiramisus livrés frais chez vous en moins de 24 heures.' },
              { icon: Star, title: 'Satisfaction client', desc: 'Plus de 200 avis vérifiés avec une note moyenne de 4.8/5.' },
            ].map(item => (
              <div key={item.title} className="card p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100 text-brand-600 mb-4">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-8">Nous Contacter</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="card p-6">
              <MapPin className="mx-auto h-8 w-8 text-brand-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
              <p className="text-sm text-gray-500">Tunis, Tunisie</p>
            </div>
            <div className="card p-6">
              <Phone className="mx-auto h-8 w-8 text-brand-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
              <p className="text-sm text-gray-500">+216 99 000 000</p>
            </div>
            <div className="card p-6">
              <Mail className="mx-auto h-8 w-8 text-brand-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
              <p className="text-sm text-gray-500">contact@po-tiramisu.tn</p>
            </div>
          </div>
          <div className="mt-10">
            <Link href="/products" className="btn-primary text-base px-8 py-4">
              Découvrir nos produits
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
