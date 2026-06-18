'use client';

import { useState, useEffect } from 'react';
import { useCart } from './CartProvider';
import { DeliveryZone, AvailableDate } from '@potiramisu/shared';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, MapPin, Calendar, CheckCircle2, Loader2, Trash2 } from 'lucide-react';

export function CheckoutClient({ zones }: { zones: DeliveryZone[] }) {
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    zoneId: ''
  });
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const selectedZone = zones.find(z => z.id === formData.zoneId);
  const deliveryFee = selectedZone ? Number(selectedZone.fee_amount) : 0;
  const finalTotal = totalPrice + deliveryFee;

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
      setStep(4);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 4) {
    return (
      <div className="glass-panel p-8 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-slate-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
        <a href="/" className="text-primary hover:underline">Go back to menu</a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Checkout Area */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Step 1: Cart Review */}
        {step === 1 && (
          <div className="glass-panel p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <ShoppingBag className="text-primary" /> Review Order
            </h2>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-white/5">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{item.name}</h3>
                    <p className="text-primary text-sm">{item.price} TND</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-800 rounded-md">-</button>
                      <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-800 rounded-md">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 p-2">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setStep(2)}
              className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-colors"
            >
              Proceed to Details
            </button>
          </div>
        )}

        {/* Step 2: Customer Details */}
        {step === 2 && (
          <div className="glass-panel p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <MapPin className="text-primary" /> Delivery Details
            </h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="216 XX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Delivery Zone</label>
                <select 
                  value={formData.zoneId}
                  onChange={(e) => setFormData({...formData, zoneId: e.target.value})}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select a zone</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name} (+{z.fee_amount} TND)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Detailed Address</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors h-24 resize-none"
                  placeholder="Street, Building, Apt..."
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                disabled={!formData.name || !formData.phone || !formData.zoneId || !formData.address}
                className="w-2/3 bg-primary hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-4 rounded-xl transition-colors"
              >
                Choose Delivery Date
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Date Selection */}
        {step === 3 && (
          <div className="glass-panel p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="text-primary" /> Select Delivery Date
            </h2>
            
            {availableDates.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {availableDates.map(date => {
                  const dateObj = new Date(date.available_date);
                  const formatted = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  return (
                    <button
                      key={date.available_date}
                      onClick={() => setSelectedDate(date.available_date)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedDate === date.available_date 
                          ? 'border-primary bg-primary/20 text-white shadow-lg shadow-primary/20' 
                          : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="font-semibold">{formatted}</div>
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="flex gap-4">
              <button 
                onClick={() => setStep(2)}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!selectedDate || isSubmitting}
                className="w-2/3 bg-primary hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Place Order (COD)'}
              </button>
            </div>
            <p className="text-center text-sm text-slate-400 mt-4">
              Payment is Cash on Delivery only.
            </p>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="glass-panel p-12 text-center animate-fade-in">
            <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h2>
            <p className="text-slate-300 mb-6">Thank you for your order. We are preparing it with love.</p>
            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 inline-block mb-8">
              <p className="text-sm text-slate-400">Order Reference</p>
              <p className="text-xl font-mono text-white font-bold">{orderId.split('-')[0].toUpperCase()}</p>
            </div>
            <br />
            <a href="/" className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-colors inline-block">
              Back to Menu
            </a>
          </div>
        )}

      </div>

      {/* Order Summary Sidebar */}
      {step < 4 && (
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-4">Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>{totalPrice.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Delivery</span>
                <span>{selectedZone ? `${deliveryFee.toFixed(2)} TND` : 'Calculated next'}</span>
              </div>
            </div>
            <div className="h-px bg-white/10 mb-6"></div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium text-white">Total</span>
              <span className="text-2xl font-bold text-primary">{finalTotal.toFixed(2)} TND</span>
            </div>
            
            <div className="text-xs text-slate-500 space-y-2">
              <p>• Orders placed after 18:00 are delivered in J+2 minimum.</p>
              <p>• Daily capacity is limited to guarantee freshness.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
