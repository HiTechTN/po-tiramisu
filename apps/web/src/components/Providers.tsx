'use client';

import { ReactNode } from 'react';
import { CartProvider } from './CartProvider';
import { ErrorBoundary } from './ErrorBoundary';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <CartProvider>{children}</CartProvider>
    </ErrorBoundary>
  );
}
