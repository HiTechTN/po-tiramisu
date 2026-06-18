import { supabase } from '@/lib/supabase';
import { CheckoutClient } from '@/components/CheckoutClient';
import { DeliveryZone } from '@potiramisu/shared';

export const revalidate = 0; // Dynamic, don't cache this as zones/dates might change

export default async function CheckoutPage() {
  const { data: zones } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)
    .order('name');

  // Fallback if no zones in DB
  const displayZones: DeliveryZone[] = zones?.length ? zones : [
    { id: 'z1', name: 'Tunis Center', fee_amount: 5, is_active: true },
    { id: 'z2', name: 'Ariana', fee_amount: 7, is_active: true },
    { id: 'z3', name: 'Marsa / Carthage', fee_amount: 8, is_active: true },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Checkout</h1>
      <CheckoutClient zones={displayZones} />
    </div>
  );
}
