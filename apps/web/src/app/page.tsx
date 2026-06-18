import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Product } from '@potiramisu/shared';
import Link from 'next/link';

export default async function Home() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Dummy data fallback for UI testing without DB records
  const displayProducts: Product[] = products?.length ? products : [
    {
      id: '1',
      name: 'Classic Tiramisu',
      description: 'The authentic Italian recipe with mascarpone, espresso, and cocoa.',
      price: 10.0,
      image_url: '/images/classic.png',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Nutella Speculoos Tiramisu',
      description: 'A rich twist featuring premium Nutella and crushed Speculoos cookies.',
      price: 15.0,
      image_url: '/images/nutella_speculoos.png',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

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

      {/* Catalog Section */}
      <section id="catalog" className="scroll-mt-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Our Menu</h2>
          <div className="h-px bg-white/10 flex-1 ml-6"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
