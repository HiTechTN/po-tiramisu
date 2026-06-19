import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartProvider';
import { Product } from '@potiramisu/shared';
import { ReactNode } from 'react';

const mockProduct: Product = {
  id: '1',
  name: 'Classic Tiramisu',
  description: 'Authentic recipe',
  price: 10,
  image_url: '/images/classic.png',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('adds a product to the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(mockProduct));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(10);
  });

  it('increments quantity when adding the same product', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(mockProduct));
    act(() => result.current.addToCart(mockProduct));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalPrice).toBe(20);
  });

  it('removes a product from the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(mockProduct));
    act(() => result.current.removeFromCart('1'));

    expect(result.current.items).toHaveLength(0);
  });

  it('updates quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(mockProduct));
    act(() => result.current.updateQuantity('1', 5));

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalPrice).toBe(50);
  });

  it('removes item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(mockProduct));
    act(() => result.current.updateQuantity('1', 0));

    expect(result.current.items).toHaveLength(0);
  });

  it('clears the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(mockProduct));
    act(() => result.current.addToCart({
      ...mockProduct,
      id: '2',
      name: 'Nutella',
      price: 15,
    }));
    act(() => result.current.clearCart());

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('loads cart from localStorage on mount', () => {
    localStorage.setItem('tiramisu_cart', JSON.stringify([
      { ...mockProduct, quantity: 2 },
    ]));

    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(2);
  });

  it('persists cart to localStorage on changes', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(mockProduct));

    const saved = JSON.parse(localStorage.getItem('tiramisu_cart')!);
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('1');
  });

  it('throws when useCart is used outside provider', () => {
    expect(() => renderHook(() => useCart())).toThrow(
      'useCart must be used within a CartProvider'
    );
  });
});
