import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CartProvider } from './CartProvider';
import { CatalogSection } from './CatalogSection';
import { ReactNode } from 'react';
import { Product } from '@potiramisu/shared';

// Mock Supabase
const mockSelect = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => mockSelect(),
    }),
  },
}));

const mockProducts: Product[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Classic Tiramisu',
    description: 'Authentic recipe',
    price: 10,
    image_url: 'https://example.com/classic.png',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Nutella Tiramisu',
    description: 'Rich twist',
    price: 15,
    image_url: 'https://example.com/nutella.png',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
  },
];

function Wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe('CatalogSection', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading skeleton initially', () => {
    mockSelect.mockReturnValue({
      eq: () => ({ order: () => Promise.resolve({ data: null, error: null }) }),
    });

    render(<CatalogSection />, { wrapper: Wrapper });
    // Should render the section header
    expect(screen.getByText('Our Menu')).toBeInTheDocument();
  });

  it('renders products after loading', async () => {
    mockSelect.mockReturnValue({
      eq: () => ({
        order: () => Promise.resolve({ data: mockProducts, error: null }),
      }),
    });

    render(<CatalogSection />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Classic Tiramisu')).toBeInTheDocument();
    });

    expect(screen.getByText('Nutella Tiramisu')).toBeInTheDocument();
  });

  it('shows fallback products when fetch returns empty', async () => {
    mockSelect.mockReturnValue({
      eq: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    });

    render(<CatalogSection />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Classic Tiramisu')).toBeInTheDocument();
    });
  });

  it('renders product prices', async () => {
    mockSelect.mockReturnValue({
      eq: () => ({
        order: () => Promise.resolve({ data: mockProducts, error: null }),
      }),
    });

    render(<CatalogSection />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('10.00 DT')).toBeInTheDocument();
      expect(screen.getByText('15.00 DT')).toBeInTheDocument();
    });
  });
});
