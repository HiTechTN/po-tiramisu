import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { CartProvider, useCart } from './CartProvider';
import { Product } from '@potiramisu/shared';
import { ReactNode } from 'react';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, className }: { src: string; alt: string; fill?: boolean; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} data-fill={fill} />
  ),
}));

const mockProduct: Product = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Classic Tiramisu',
  description: 'Authentic Italian recipe',
  price: 10.5,
  image_url: 'https://example.com/classic.png',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
};

const productWithoutImage: Product = {
  ...mockProduct,
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Plain Tiramisu',
  image_url: null,
};

const productWithoutDescription: Product = {
  ...mockProduct,
  id: '550e8400-e29b-41d4-a716-446655440002',
  description: null,
};

function CartWrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe('ProductCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />, { wrapper: CartWrapper });
    expect(screen.getByText('Classic Tiramisu')).toBeInTheDocument();
  });

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} />, { wrapper: CartWrapper });
    expect(screen.getByText('10.50 DT')).toBeInTheDocument();
  });

  it('renders product description', () => {
    render(<ProductCard product={mockProduct} />, { wrapper: CartWrapper });
    expect(screen.getByText('Authentic Italian recipe')).toBeInTheDocument();
  });

  it('renders default description when null', () => {
    render(<ProductCard product={productWithoutDescription} />, { wrapper: CartWrapper });
    expect(screen.getByText('Premium homemade dessert.')).toBeInTheDocument();
  });

  it('renders image when image_url is provided', () => {
    render(<ProductCard product={mockProduct} />, { wrapper: CartWrapper });
    const img = screen.getByRole('img', { name: 'Classic Tiramisu' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/classic.png');
  });

  it('does not render img element when image_url is null', () => {
    render(<ProductCard product={productWithoutImage} />, { wrapper: CartWrapper });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders Add to Cart button', () => {
    render(<ProductCard product={mockProduct} />, { wrapper: CartWrapper });
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('adds product to cart when clicked', () => {
    render(<ProductCard product={mockProduct} />, { wrapper: CartWrapper });
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    // Cart should now have 1 item - verify via localStorage
    const saved = JSON.parse(localStorage.getItem('tiramisu_cart')!);
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe(mockProduct.id);
  });
});
