'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Save, Plus, Trash2 } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Layout from '@/components/Layout/Layout';
import type { Address, User as UserType } from '@/types';

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, user: authUser, setUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // New address form
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: '', street: '', city: '', postal_code: '', governorate: '' });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    Promise.all([usersApi.getProfile(), usersApi.getAddresses()])
      .then(([profRes, addrRes]) => {
        setProfile(profRes.data);
        setEditName(profRes.data.full_name);
        setEditPhone(profRes.data.phone || '');
        setAddresses(addrRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const saveProfile = async () => {
    setSaving(true);
    setMsg('');
    try {
      await usersApi.updateProfile({ full_name: editName, phone: editPhone });
      setMsg('Profil mis à jour!');
    } catch {
      setMsg('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async () => {
    try {
      await usersApi.createAddress(newAddr);
      const res = await usersApi.getAddresses();
      setAddresses(res.data);
      setShowAddrForm(false);
      setNewAddr({ label: '', street: '', city: '', postal_code: '', governorate: '' });
    } catch {
      alert('Erreur lors de l\'ajout');
    }
  };

  const deleteAddress = async (id: number) => {
    if (!confirm('Supprimer cette adresse?')) return;
    await usersApi.deleteAddress(id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  if (loading) return <Layout><div className="py-20 text-center text-gray-500">Chargement...</div></Layout>;

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Mon compte</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Profile */}
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <User className="h-5 w-5 text-brand-600" /> Informations personnelles
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={profile?.email || ''} disabled className="input-field bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="input-field" placeholder="+216 ..." />
              </div>
              <button onClick={saveProfile} disabled={saving} className="btn-primary">
                <Save className="mr-2 h-4 w-4" /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              {msg && <p className="text-sm text-green-600">{msg}</p>}
            </div>
          </div>

          {/* Addresses */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <MapPin className="h-5 w-5 text-brand-600" /> Adresses
              </h2>
              <button onClick={() => setShowAddrForm(!showAddrForm)} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                <Plus className="inline h-4 w-4 mr-1" /> Ajouter
              </button>
            </div>

            {addresses.length === 0 && !showAddrForm && (
              <p className="text-sm text-gray-500">Aucune adresse enregistrée.</p>
            )}

            <div className="space-y-3">
              {addresses.map(addr => (
                <div key={addr.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{addr.label || 'Adresse'} {addr.is_default && <span className="text-xs text-brand-600">(par défaut)</span>}</p>
                    <p className="text-sm text-gray-600">{addr.street}, {addr.city}</p>
                    {addr.governorate && <p className="text-xs text-gray-400">{addr.governorate}, {addr.country}</p>}
                  </div>
                  <button onClick={() => deleteAddress(addr.id)} className="text-gray-400 hover:text-red-500 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {showAddrForm && (
              <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-4 space-y-3">
                <input type="text" placeholder="Label (ex: Domicile)" value={newAddr.label} onChange={e => setNewAddr(p => ({ ...p, label: e.target.value }))} className="input-field" />
                <input type="text" placeholder="Rue *" value={newAddr.street} onChange={e => setNewAddr(p => ({ ...p, street: e.target.value }))} className="input-field" required />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Ville *" value={newAddr.city} onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))} className="input-field" required />
                  <input type="text" placeholder="Code postal" value={newAddr.postal_code} onChange={e => setNewAddr(p => ({ ...p, postal_code: e.target.value }))} className="input-field" />
                </div>
                <input type="text" placeholder="Gouvernorat" value={newAddr.governorate} onChange={e => setNewAddr(p => ({ ...p, governorate: e.target.value }))} className="input-field" />
                <div className="flex gap-3">
                  <button onClick={() => setShowAddrForm(false)} className="btn-secondary flex-1 text-sm">Annuler</button>
                  <button onClick={addAddress} disabled={!newAddr.street || !newAddr.city} className="btn-primary flex-1 text-sm">Ajouter</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
