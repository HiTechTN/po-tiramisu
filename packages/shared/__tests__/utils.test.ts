import { describe, it, expect } from 'vitest';
import {
  isValidStatusTransition,
  getNextStatus,
  calculateOrderTotal,
  formatPrice,
  isValidTunisianPhone,
  isValidDeliveryDate,
  getRemainingCapacity,
  VALID_STATUS_TRANSITIONS,
} from '../utils';

describe('isValidStatusTransition', () => {
  it('allows pending -> preparing', () => {
    expect(isValidStatusTransition('pending', 'preparing')).toBe(true);
  });

  it('allows pending -> cancelled', () => {
    expect(isValidStatusTransition('pending', 'cancelled')).toBe(true);
  });

  it('rejects pending -> completed', () => {
    expect(isValidStatusTransition('pending', 'completed')).toBe(false);
  });

  it('allows preparing -> delivering', () => {
    expect(isValidStatusTransition('preparing', 'delivering')).toBe(true);
  });

  it('allows delivering -> completed', () => {
    expect(isValidStatusTransition('delivering', 'completed')).toBe(true);
  });

  it('rejects completed -> any status', () => {
    expect(isValidStatusTransition('completed', 'pending')).toBe(false);
    expect(isValidStatusTransition('completed', 'preparing')).toBe(false);
    expect(isValidStatusTransition('completed', 'delivering')).toBe(false);
    expect(isValidStatusTransition('completed', 'cancelled')).toBe(false);
  });

  it('rejects cancelled -> any status', () => {
    expect(isValidStatusTransition('cancelled', 'pending')).toBe(false);
    expect(isValidStatusTransition('cancelled', 'preparing')).toBe(false);
  });
});

describe('getNextStatus', () => {
  it('returns preparing for pending', () => {
    expect(getNextStatus('pending')).toBe('preparing');
  });

  it('returns delivering for preparing', () => {
    expect(getNextStatus('preparing')).toBe('delivering');
  });

  it('returns completed for delivering', () => {
    expect(getNextStatus('delivering')).toBe('completed');
  });

  it('returns null for completed', () => {
    expect(getNextStatus('completed')).toBeNull();
  });

  it('returns null for cancelled', () => {
    expect(getNextStatus('cancelled')).toBeNull();
  });
});

describe('calculateOrderTotal', () => {
  it('calculates subtotal and total correctly', () => {
    const items = [
      { quantity: 2, unit_price: 10 },
      { quantity: 1, unit_price: 15 },
    ];
    const result = calculateOrderTotal(items, 5);
    expect(result.subtotal).toBe(35);
    expect(result.total).toBe(40);
  });

  it('handles empty items array', () => {
    const result = calculateOrderTotal([], 5);
    expect(result.subtotal).toBe(0);
    expect(result.total).toBe(5);
  });

  it('handles zero delivery fee', () => {
    const items = [{ quantity: 3, unit_price: 10 }];
    const result = calculateOrderTotal(items, 0);
    expect(result.subtotal).toBe(30);
    expect(result.total).toBe(30);
  });
});

describe('formatPrice', () => {
  it('formats price with 2 decimals', () => {
    expect(formatPrice(10)).toBe('10.00 TND');
    expect(formatPrice(10.5)).toBe('10.50 TND');
    expect(formatPrice(10.999)).toBe('11.00 TND');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('0.00 TND');
  });
});

describe('isValidTunisianPhone', () => {
  it('accepts valid 8-digit phone', () => {
    expect(isValidTunisianPhone('21612345678')).toBe(true);
    expect(isValidTunisianPhone('12345678')).toBe(true);
  });

  it('accepts phone with +216 prefix', () => {
    expect(isValidTunisianPhone('+21612345678')).toBe(true);
  });

  it('rejects too short phone', () => {
    expect(isValidTunisianPhone('1234567')).toBe(false);
  });

  it('rejects too long phone', () => {
    expect(isValidTunisianPhone('123456789')).toBe(false);
  });

  it('rejects non-numeric phone', () => {
    expect(isValidTunisianPhone('abcdefgh')).toBe(false);
  });
});

describe('isValidDeliveryDate', () => {
  it('rejects past dates', () => {
    expect(isValidDeliveryDate('2020-01-01')).toBe(false);
  });

  it('accepts future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];
    expect(isValidDeliveryDate(dateStr)).toBe(true);
  });
});

describe('getRemainingCapacity', () => {
  it('calculates remaining capacity', () => {
    expect(getRemainingCapacity(20, 10)).toBe(10);
  });

  it('returns 0 when fully booked', () => {
    expect(getRemainingCapacity(20, 20)).toBe(0);
  });

  it('returns 0 when overbooked', () => {
    expect(getRemainingCapacity(20, 25)).toBe(0);
  });

  it('handles zero capacity', () => {
    expect(getRemainingCapacity(0, 0)).toBe(0);
  });
});
