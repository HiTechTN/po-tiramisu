'use client';

import { useState, useEffect } from 'react';
import { Product } from '@potiramisu/shared';
import { supabase } from '@/lib/supabase';
import { ProductCard } from './ProductCard';

const FALLBACK_PRODUCTS: Product[] = [
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

export function CatalogSection() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setProducts(data as Product[]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section id="catalog" className="scroll-mt-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Our Menu</h2>
          <div className="h-px bg-white/10 flex-1 ml-6"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-80 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="catalog" className="scroll-mt-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Our Menu</h2>
        <div className="h-px bg-white/10 flex-1 ml-6"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
