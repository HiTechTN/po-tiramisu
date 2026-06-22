import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartProvider } from './CartProvider';
import { CheckoutClient } from './CheckoutClient';
import { Product } from '@potiramisu/shared';
import { ReactNode } from 'react';

const mockProduct: Product = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Classic Tiramisu',
  description: 'Authentic recipe',
  price: 10,
  image_url: '/images/classic.png',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Supabase
const mockSupabaseFrom = vi.fn();
const mockSupabaseRpc = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockSupabaseFrom(...args),
    rpc: (...args: unknown[]) => mockSupabaseRpc(...args),
  },
}));

// Mock next/navigation
vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

function Wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

function addItemToCart() {
  // Seed localStorage with a cart item
  localStorage.setItem('tiramisu_cart', JSON.stringify([
    { ...mockProduct, quantity: 2 },
  ]));
}

describe('CheckoutClient', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Default mock for delivery zones fetch
    mockSupabaseFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: [
              { id: 'zone-1', name: 'Tunis Centre', fee_amount: 5, is_active: true },
            ],
            error: null,
          }),
        }),
      }),
    });
  });

  it('shows empty cart message when cart is empty', () => {
    render(<CheckoutClient />, { wrapper: Wrapper });
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('shows cart items when cart has items', () => {
    addItemToCart();
    render(<CheckoutClient />, { wrapper: Wrapper });
    expect(screen.getByText('Classic Tiramisu')).toBeInTheDocument();
    expect(screen.getByText('10.00 TND')).toBeInTheDocument();
  });

  it('shows order summary sidebar', () => {
    addItemToCart();
    render(<CheckoutClient />, { wrapper: Wrapper });
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Delivery')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('shows Proceed to Details button', () => {
    addItemToCart();
    render(<CheckoutClient />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: /proceed to details/i })).toBeInTheDocument();
  });

  it('validates name field when proceeding to details', () => {
    addItemToCart();
    render(<CheckoutClient />, { wrapper: Wrapper });

    // Don't fill in any fields, just click proceed
    fireEvent.click(screen.getByRole('button', { name: /proceed to details/i }));

    // Should show validation errors (step stays at 2 since validation fails)
    // The form should still be visible
    expect(screen.getByText('Delivery Details')).toBeInTheDocument();
  });

  it('shows quantity controls', () => {
    addItemToCart();
    render(<CheckoutClient />, { wrapper: Wrapper });

    // Should show quantity of 2
    expect(screen.getByText('2')).toBeInTheDocument();
    // Should show + and - buttons
    const buttons = screen.getAllByText('-');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows order total in summary', () => {
    addItemToCart();
    render(<CheckoutClient />, { wrapper: Wrapper });
    // 2 x 10 TND = 20 TND subtotal (also total, since no zone selected)
    const totals = screen.getAllByText('20.00 TND');
    expect(totals.length).toBeGreaterThanOrEqual(1);
  });
});
