'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, Calendar, FileText, CheckCircle } from 'lucide-react';
import { cartApi, ordersApi, paymentsApi, usersApi } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import Layout from '@/components/Layout/Layout';
import type { Address, Cart } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const cart = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('flouci');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    Promise.all([
      cartApi.get(),
      usersApi.getAddresses(),
    ])
      .then(([cartRes, addrRes]) => {
        cart.setCart(cartRes.data);
        setAddresses(addrRes.data);
        if (addrRes.data.length) setSelectedAddress(addrRes.data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    if (!selectedAddress) return;
    setSubmitting(true);
    try {
      const res = await ordersApi.create({
        address_id: selectedAddress,
        payment_method: paymentMethod,
        notes: notes || undefined,
      });

      if (paymentMethod === 'flouci' || paymentMethod === 'paymee') {
        try {
          const payRes = await paymentsApi.initFlouci(res.data.id, res.data.total_dt);
          if (payRes.data.payment_url) {
            // Check if it's a demo redirect (contains 'payment=demo')
            if (payRes.data.payment_url.includes('payment=demo')) {
              // Demo mode: simulate payment completion
              await paymentsApi.demoComplete(res.data.id);
            } else {
              // Real Flouci: redirect to their checkout page
              window.location.href = payRes.data.payment_url;
              return;
            }
          }
        } catch {
          // Fallback: demo complete
          await paymentsApi.demoComplete(res.data.id).catch(() => {});
        }
      }

      cart.clearCart();
      router.push(`/orders/${res.data.id}?success=true`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erreur lors de la commande');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><div className="py-20 text-center text-gray-500">Chargement...</div></Layout>;

  if (!cart.items.length) {
    router.push('/cart');
    return null;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Passer la commande</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step >= s ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{s}</span>
              <span className={`text-sm font-medium hidden sm:inline ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                {s === 1 ? 'Adresse' : s === 2 ? 'Paiement' : 'Confirmation'}
              </span>
              {s < 3 && <div className="w-8 h-px bg-gray-300 mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="card p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                  <MapPin className="h-5 w-5 text-brand-600" /> Adresse de livraison
                </h2>
                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune adresse enregistrée.</p>
                    <p className="mt-2 text-sm">Ajoutez une adresse depuis votre <a href="/account" className="text-brand-600 underline">compte</a>.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition ${
                          selectedAddress === addr.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={selectedAddress === addr.id}
                          onChange={() => setSelectedAddress(addr.id)}
                          className="mt-1 accent-brand-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{addr.label || 'Adresse'}</p>
                          <p className="text-sm text-gray-600">{addr.street}, {addr.city}</p>
                          {addr.governorate && <p className="text-xs text-gray-400">{addr.governorate}, {addr.country}</p>}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedAddress}
                  className="mt-6 btn-primary w-full"
                >
                  Continuer
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="card p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                  <CreditCard className="h-5 w-5 text-brand-600" /> Méthode de paiement
                </h2>
                <div className="space-y-3">
                  {[
                    { value: 'flouci', label: 'Flouci', desc: 'Paiement en ligne sécurisé' },
                    { value: 'paymee', label: 'Paymee', desc: 'Paiement en ligne' },
                    { value: 'cash', label: 'Paiement à la livraison', desc: 'Espèces à la livraison' },
                  ].map(method => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition ${
                        paymentMethod === method.value ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value)}
                        className="accent-brand-600"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{method.label}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="inline h-4 w-4 mr-1" /> Notes (optionnel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Ex: Sonner à l'arrivée, étage..."
                    className="input-field h-24 resize-none"
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1">Retour</button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1">Continuer</button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="card p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                  <CheckCircle className="h-5 w-5 text-brand-600" /> Confirmer la commande
                </h2>
                <div className="space-y-4 text-sm">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="font-medium text-gray-700">Adresse:</p>
                    <p className="text-gray-600">{addresses.find(a => a.id === selectedAddress)?.street}, {addresses.find(a => a.id === selectedAddress)?.city}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="font-medium text-gray-700">Paiement:</p>
                    <p className="text-gray-600 capitalize">{paymentMethod}</p>
                  </div>
                  {notes && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="font-medium text-gray-700">Notes:</p>
                      <p className="text-gray-600">{notes}</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1">Retour</button>
                  <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Traitement...' : `Confirmer & Payer ${formatPrice(cart.total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h3>
              <div className="space-y-3">
                {cart.items.map(item => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1 mr-2">{item.product_name} × {item.quantity}</span>
                    <span className="font-medium whitespace-nowrap">{formatPrice(item.total_price_dt)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Sous-total</span><span>{formatPrice(cart.subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Livraison</span><span>{formatPrice(cart.deliveryFee)}</span></div>
                  {cart.discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Réduction</span><span>-{formatPrice(cart.discount)}</span></div>}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-brand-700">{formatPrice(cart.total)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
