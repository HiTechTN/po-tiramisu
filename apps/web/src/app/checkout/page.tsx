import { CheckoutClient } from '@/components/CheckoutClient';

export default function CheckoutPage() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Checkout</h1>
      <CheckoutClient />
    </div>
  );
}
