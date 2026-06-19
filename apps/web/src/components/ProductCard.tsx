'use client';

import Image from 'next/image';
import { Product } from '@potiramisu/shared';
import { useCart } from './CartProvider';
import { ShoppingCart, Image as ImageIcon } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="glass-card animate-on-scroll flex flex-col h-full overflow-hidden group">
      <div className="aspect-[4/3] w-full overflow-hidden bg-black/40 relative">
        {product.image_url ? (
          <Image 
            src={product.image_url} 
            alt={product.name} 
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-primary opacity-50 group-hover:scale-110 transition-transform duration-700">
            <ImageIcon size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{product.name}</h3>
          <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{product.price.toFixed(2)} DT</span>
        </div>
        
        <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
          {product.description || 'Premium homemade dessert.'}
        </p>
        
        <button
          onClick={() => addToCart(product)}
          className="w-full bg-primary/90 hover:bg-primary text-white font-medium py-3 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(194,136,89,0.3)] hover:shadow-[0_0_30px_rgba(194,136,89,0.5)]"
        >
          <ShoppingCart size={18} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
