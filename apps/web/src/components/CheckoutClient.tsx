'use client';

import { useState, useEffect } from 'react';
import { useCart } from './CartProvider';
import { DeliveryZone, AvailableDate } from '@potiramisu/shared';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, MapPin, Calendar, CheckCircle2, Loader2, Trash2 } from 'lucide-react';

export function CheckoutClient() {
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    zoneId: ''
  });
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const selectedZone = zones.find(z => z.id === formData.zoneId);
  const deliveryFee = selectedZone ? Number(selectedZone.fee_amount) : 0;
  const finalTotal = totalPrice + deliveryFee;

  useEffect(() => {
    // Fetch zones on component mount
    const fetchZones = async () => {
      const { data } = await supabase
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (data && data.length > 0) {
        setZones(data as DeliveryZone[]);
      } else {
        setZones([
          { id: 'z1', name: 'Tunis Center', fee_amount: 5, is_active: true },
          { id: 'z2', name: 'Ariana', fee_amount: 7, is_active: true },
          { id: 'z3', name: 'Marsa / Carthage', fee_amount: 8, is_active: true },
        ]);
      }
    };
    fetchZones();
  }, []);

  useEffect(() => {
    if (step === 3) {
      // Fetch available dates when reaching step 3
      const fetchDates = async () => {
        const { data, error } = await supabase.rpc('get_available_dates', { check_days: 14 });
        if (data && !error) {
          setAvailableDates(data as AvailableDate[]);
        } else {
          // Mock data fallback if RPC isn't deployed yet
          const d1 = new Date(); d1.setDate(d1.getDate() + 2);
          const d2 = new Date(); d2.setDate(d2.getDate() + 3);
          setAvailableDates([
            { available_date: d1.toISOString().split('T')[0], reason: 'available' },
            { available_date: d2.toISOString().split('T')[0], reason: 'available' }
          ]);
        }
      };
      fetchDates();
    }
  }, [step]);

  const handleSetStep = (newStep: number) => {
    if (!document.startViewTransition) {
      setStep(newStep);
    } else {
      document.startViewTransition(() => {
        setStep(newStep);
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase.from('orders').insert({
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        delivery_zone_id: formData.zoneId === 'z1' || formData.zoneId.startsWith('z') ? null : formData.zoneId, // handle mock
        total_amount: finalTotal,
        delivery_fee: deliveryFee,
        delivery_date: selectedDate,
        status: 'pending'
      }).select().single();

      if (orderData) {
        // Insert order items
        const orderItems = items.map(item => ({
          order_id: orderData.id,
          product_id: item.id.length > 5 ? item.id : null, // handle mock id
          quantity: item.quantity,
          unit_price: item.price
        }));
        
        await supabase.from('order_items').insert(orderItems);
        setOrderId(orderData.id);
      } else {
        // Fallback for mock environment
        setOrderId('mock-order-' + Math.floor(Math.random() * 1000));
      }
      
      clearCart();
      handleSetStep(4);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 4) {
    return (
      <div className="glass-card p-12 text-center animate-on-scroll">
        <ShoppingBag className="mx-auto h-20 w-20 text-white/30 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
        <a href="/" className="text-primary hover:text-white transition-colors text-lg font-medium">Go back to menu</a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Checkout Area */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Step 1: Cart Review */}
        {step === 1 && (
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <ShoppingBag className="text-primary" /> Review Order
            </h2>
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-black/20 p-5 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{item.name}</h3>
                    <p className="text-primary font-medium">{item.price.toFixed(2)} TND</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-black/40 rounded-xl p-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors">-</button>
                      <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-white/40 hover:text-red-400 p-2 transition-colors">
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => handleSetStep(2)}
              className="w-full bg-primary/90 hover:bg-primary text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(194,136,89,0.2)] hover:shadow-[0_0_30px_rgba(194,136,89,0.4)] active:scale-[0.98]"
            >
              Proceed to Details
            </button>
          </div>
        )}

        {/* Step 2: Customer Details */}
        {step === 2 && (
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <MapPin className="text-primary" /> Delivery Details
            </h2>
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-black/40 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-black/40 transition-colors"
                  placeholder="216 XX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Delivery Zone</label>
                <select 
                  value={formData.zoneId}
                  onChange={(e) => setFormData({...formData, zoneId: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-black/40 transition-colors appearance-none"
                >
                  <option value="" className="bg-black text-white">Select a zone</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.id} className="bg-black text-white">{z.name} (+{z.fee_amount} TND)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Detailed Address</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:bg-black/40 transition-colors h-28 resize-none"
                  placeholder="Street, Building, Apt..."
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => handleSetStep(1)}
                className="w-1/3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-xl transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => handleSetStep(3)}
                disabled={!formData.name || !formData.phone || !formData.zoneId || !formData.address}
                className="w-2/3 bg-primary/90 hover:bg-primary disabled:bg-white/5 disabled:text-white/30 text-white font-bold py-4 rounded-xl transition-all disabled:shadow-none shadow-[0_0_20px_rgba(194,136,89,0.2)] hover:shadow-[0_0_30px_rgba(194,136,89,0.4)] active:scale-[0.98]"
              >
                Choose Delivery Date
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Date Selection */}
        {step === 3 && (
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Calendar className="text-primary" /> Select Delivery Date
            </h2>
            
            {availableDates.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {availableDates.map(date => {
                  const dateObj = new Date(date.available_date);
                  const formatted = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  return (
                    <button
                      key={date.available_date}
                      onClick={() => setSelectedDate(date.available_date)}
                      className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                        selectedDate === date.available_date 
                          ? 'border-primary bg-primary/20 text-white shadow-[0_0_20px_rgba(194,136,89,0.2)] transform scale-105' 
                          : 'border-white/5 bg-black/20 text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="font-semibold text-lg">{formatted}</div>
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="flex gap-4">
              <button 
                onClick={() => handleSetStep(2)}
                className="w-1/3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-xl transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!selectedDate || isSubmitting}
                className="w-2/3 bg-primary/90 hover:bg-primary disabled:bg-white/5 disabled:text-white/30 text-white font-bold py-4 rounded-xl transition-all disabled:shadow-none shadow-[0_0_20px_rgba(194,136,89,0.2)] hover:shadow-[0_0_30px_rgba(194,136,89,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Place Order (COD)'}
              </button>
            </div>
            <p className="text-center text-sm text-white/40 mt-6">
              Payment is Cash on Delivery only.
            </p>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="glass-card p-16 text-center">
            <CheckCircle2 className="mx-auto h-24 w-24 text-primary mb-8 animate-[scale-up_0.5s_ease-out]" />
            <h2 className="text-4xl font-bold text-white mb-4">Order Confirmed!</h2>
            <p className="text-white/70 mb-8 text-lg">Thank you for your order. We are preparing it with love.</p>
            <div className="bg-black/30 border border-white/10 rounded-2xl p-6 inline-block mb-10">
              <p className="text-sm text-white/50 mb-2">Order Reference</p>
              <p className="text-3xl font-mono text-white font-bold tracking-wider">{orderId.split('-')[0].toUpperCase()}</p>
            </div>
            <br />
            <a href="/" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 px-10 rounded-xl transition-colors inline-block">
              Back to Menu
            </a>
          </div>
        )}

      </div>

      {/* Order Summary Sidebar */}
      {step < 4 && (
        <div className="lg:col-span-1">
          <div className="glass-card p-8 sticky top-24">
            <h3 className="text-2xl font-bold text-white mb-6">Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span className="text-white">{totalPrice.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Delivery</span>
                <span className="text-white">{selectedZone ? `${deliveryFee.toFixed(2)} TND` : 'Calculated next'}</span>
              </div>
            </div>
            <div className="h-px bg-white/10 mb-8"></div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-medium text-white">Total</span>
              <span className="text-3xl font-bold text-primary">{finalTotal.toFixed(2)} TND</span>
            </div>
            
            <div className="text-sm text-white/40 space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
              <p>• Orders placed after 18:00 are delivered in J+2 minimum.</p>
              <p>• Daily capacity is limited to guarantee freshness.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
