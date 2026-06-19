import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { TransitionLink } from '@/components/TransitionLink';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Po Tiramisu | Premium Italian Desserts',
  description: 'Authentic homemade tiramisu and desserts with premium logistics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} min-h-screen antialiased flex flex-col`}>
        <Providers>
          <header className="fixed top-0 w-full z-50 glass border-x-0 border-t-0 rounded-none">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <TransitionLink href="/" className="text-2xl font-bold tracking-tighter text-white">
                Po <span className="text-primary">Tiramisu</span>
              </TransitionLink>
            </div>
          </header>
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-24 pb-12">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
