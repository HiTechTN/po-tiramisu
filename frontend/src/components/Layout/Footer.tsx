import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍰</span>
              <span className="font-display text-xl font-bold text-brand-700">Po_Tiramisu</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Tiramisus artisanaux faits avec amour à Tunis. Ingrédients frais, saveurs authentiques.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Boutique</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/products" className="text-sm text-gray-500 hover:text-brand-600">Tous les produits</Link></li>
              <li><Link href="/products?category=tiramisu" className="text-sm text-gray-500 hover:text-brand-600">Tiramisus</Link></li>
              <li><Link href="/products?category=coffret" className="text-sm text-gray-500 hover:text-brand-600">Coffrets</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Aide</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-brand-600">À propos</Link></li>
              <li><Link href="/orders" className="text-sm text-gray-500 hover:text-brand-600">Suivi commande</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-gray-500">📍 Tunis, Tunisie</li>
              <li className="text-sm text-gray-500">📞 +216 99 000 000</li>
              <li className="text-sm text-gray-500">✉️ contact@po-tiramisu.tn</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Po_Tiramisu. Tous droits réservés. Fait avec ❤️ en Tunisie.
        </div>
      </div>
    </footer>
  );
}
