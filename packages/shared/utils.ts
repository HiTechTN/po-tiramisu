import type { OrderStatus } from './types';

/**
 * Valid status transitions for orders.
 * Maps current status to the list of allowed next statuses.
 */
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['delivering', 'cancelled'],
  delivering: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/**
 * Check if a status transition is valid.
 */
export function isValidStatusTransition(
  current: OrderStatus,
  next: OrderStatus
): boolean {
  return VALID_STATUS_TRANSITIONS[current].includes(next);
}

/**
 * Get the next logical status in the order lifecycle.
 * Returns null if the order is already completed or cancelled.
 */
export function getNextStatus(current: OrderStatus): OrderStatus | null {
  const transitions = VALID_STATUS_TRANSITIONS[current];
  return transitions.length > 0 ? transitions[0] : null;
}

/**
 * Calculate the order total from items and delivery fee.
 */
export function calculateOrderTotal(
  items: Array<{ quantity: number; unit_price: number }>,
  deliveryFee: number
): { subtotal: number; total: number } {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  return { subtotal, total: subtotal + deliveryFee };
}

/**
 * Format a price in TND currency.
 */
export function formatPrice(price: number): string {
  return `${price.toFixed(2)} TND`;
}

/**
 * Validate a Tunisian phone number.
 */
export function isValidTunisianPhone(phone: string): boolean {
  return /^(\+?216)?\d{8}$/.test(phone);
}

/**
 * Check if a delivery date is valid (at least tomorrow).
 */
export function isValidDeliveryDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return date >= tomorrow;
}

/**
 * Get remaining capacity for a given date.
 */
export function getRemainingCapacity(
  maxCapacity: number,
  currentBooked: number
): number {
  return Math.max(0, maxCapacity - currentBooked);
}
