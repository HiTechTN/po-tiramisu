export function formatPrice(price: number): string {
  return `${(price / 1000).toFixed(3)} DT`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  preparing: '#8B5CF6',
  ready: '#10B981',
  delivered: '#059669',
  cancelled: '#EF4444',
  paid: '#10B981',
  unpaid: '#EF4444',
};

export const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  paid: 'Payée',
  unpaid: 'Non payée',
};
