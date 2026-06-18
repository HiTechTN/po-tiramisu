'use client';

import { Product } from '@potiramisu/shared';
import { useCart } from './CartProvider';
import { ShoppingCart } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="glass-panel p-4 flex flex-col card-hover overflow-hidden relative group">
      <div className="aspect-square bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-semibold border border-white/10">
          {product.price} TND
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
          <p className="text-slate-400 text-sm line-clamp-2 mb-4">
            {product.description || 'Premium homemade dessert.'}
          </p>
        </div>
        
        <button
          onClick={() => addToCart(product)}
          className="w-full bg-primary hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
