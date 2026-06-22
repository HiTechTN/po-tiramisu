'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Layout from '@/components/Layout/Layout';
import type { User } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      login(res.data.user, res.data.access_token, res.data.refresh_token);
      if (res.data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-4xl">🍰</span>
            <h1 className="mt-4 font-display text-2xl font-bold text-gray-900">Connexion</h1>
            <p className="mt-2 text-sm text-gray-500">Accédez à votre compte Po_Tiramisu</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Pas encore de compte?{' '}
              <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Créer un compte
              </Link>
            </p>

            {/* Demo credentials */}
            <div className="rounded-lg bg-brand-50 border border-brand-100 p-3 text-xs text-brand-700">
              <p className="font-semibold mb-1">Comptes de démonstration:</p>
              <p>👤 Client: demo@po-tiramisu.tn / demo123</p>
              <p>🔑 Admin: admin@po-tiramisu.tn / admin123</p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
