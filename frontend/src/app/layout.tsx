import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Po_Tiramisu | Tiramisus Artisanaux Tunisiens',
  description: 'Commandez vos tiramisus artisanaux faits maison. Livraison à Tunis et environs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
