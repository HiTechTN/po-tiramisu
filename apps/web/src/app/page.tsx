import { CatalogSection } from '@/components/CatalogSection';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="animate-fade-in space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 glass-panel relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Indulge in <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-primary">
              Perfection
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Experience the finest homemade tiramisu, crafted with passion and delivered fresh to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#catalog" className="bg-primary hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-full transition-all hover:scale-105 shadow-lg shadow-primary/30">
              Order Now
            </a>
            <Link href="/checkout" className="glass-panel text-white font-bold py-4 px-8 rounded-full transition-all hover:bg-white/10">
              View Cart
            </Link>
          </div>
        </div>
      </section>

      <CatalogSection />
    </div>
  );
}
