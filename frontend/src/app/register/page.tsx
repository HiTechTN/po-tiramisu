'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Layout from '@/components/Layout/Layout';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        phone: form.phone || undefined,
      });
      login(
        { id: res.data.id, uuid: res.data.uuid, email: res.data.email, full_name: res.data.full_name, role: res.data.role, is_active: true, email_verified: false, created_at: new Date().toISOString() },
        res.data.access_token,
        res.data.refresh_token,
      );
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-4xl">🍰</span>
            <h1 className="mt-4 font-display text-2xl font-bold text-gray-900">Créer un compte</h1>
            <p className="mt-2 text-sm text-gray-500">Rejoignez Po_Tiramisu et commandez en un clic</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Ahmed Ben Ali" required minLength={2} className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="votre@email.com" required className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (optionnel)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+216 99 123 456" className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" required minLength={6} className="input-field pl-10" />
              </div>
              <p className="mt-1 text-xs text-gray-400">Minimum 6 caractères</p>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Déjà un compte?{' '}
              <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
}
