'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useAuthStore, useCartStore, useUIStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { cartApi } from '@/lib/api';

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      cartApi.get().then(res => useCartStore.getState().setCart(res.data)).catch(() => {});
    }
  }, [isAuthenticated]);

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/products', label: 'Produits' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
          <span className="text-2xl">🍰</span>
          <span className="font-display text-xl font-bold text-brand-700">Po_Tiramisu</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition hover:text-brand-600 ${
                pathname === link.href ? 'text-brand-600' : 'text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link href="/cart" className="relative p-2 text-gray-600 hover:text-brand-600 transition">
            <ShoppingBag className="h-5 w-5" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center gap-3">
              {user.role === 'admin' && (
                <Link href="/admin" className="p-2 text-gray-600 hover:text-brand-600 transition" title="Admin">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              )}
              <Link href="/account" className="p-2 text-gray-600 hover:text-brand-600 transition">
                <User className="h-5 w-5" />
              </Link>
              <button onClick={logout} className="p-2 text-gray-600 hover:text-red-600 transition" title="Déconnexion">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:inline-flex btn-primary text-sm">
              Connexion
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-600 hover:text-brand-600"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-4 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className="block py-3 text-sm font-medium text-gray-700 hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link href="/account" onClick={closeMobileMenu} className="block py-3 text-sm font-medium text-gray-700 hover:text-brand-600">
                Mon compte
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" onClick={closeMobileMenu} className="block py-3 text-sm font-medium text-gray-700 hover:text-brand-600">
                  Admin Dashboard
                </Link>
              )}
              <button onClick={() => { logout(); closeMobileMenu(); }} className="block py-3 text-sm font-medium text-red-600">
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/login" onClick={closeMobileMenu} className="block py-3 text-sm font-medium text-brand-600">
              Connexion
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
