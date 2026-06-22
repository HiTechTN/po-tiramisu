import { describe, it, expect } from 'vitest';
import {
  ProductSchema,
  OrderSchema,
  OrderItemSchema,
  DeliveryZoneSchema,
  OrderStatusSchema,
  DailyCapacitySchema,
  IngredientSchema,
  AvailableDateSchema,
  RawMaterialRequirementSchema,
} from '../schemas';

describe('OrderStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(OrderStatusSchema.safeParse('pending').success).toBe(true);
    expect(OrderStatusSchema.safeParse('preparing').success).toBe(true);
    expect(OrderStatusSchema.safeParse('delivering').success).toBe(true);
    expect(OrderStatusSchema.safeParse('completed').success).toBe(true);
    expect(OrderStatusSchema.safeParse('cancelled').success).toBe(true);
  });

  it('rejects invalid statuses', () => {
    expect(OrderStatusSchema.safeParse('shipped').success).toBe(false);
    expect(OrderStatusSchema.safeParse('').success).toBe(false);
  });
});

describe('ProductSchema', () => {
  const validProduct = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Classic Tiramisu',
    description: 'Authentic recipe',
    price: 10.5,
    image_url: 'https://example.com/image.png',
    is_active: true,
    created_at: '2024-01-01T00:00:00.000Z',
  };

  it('accepts a valid product', () => {
    expect(ProductSchema.safeParse(validProduct).success).toBe(true);
  });

  it('accepts product with null description', () => {
    expect(ProductSchema.safeParse({ ...validProduct, description: null }).success).toBe(true);
  });

  it('accepts product with null image_url', () => {
    expect(ProductSchema.safeParse({ ...validProduct, image_url: null }).success).toBe(true);
  });

  it('rejects product with empty name', () => {
    expect(ProductSchema.safeParse({ ...validProduct, name: '' }).success).toBe(false);
  });

  it('rejects product with negative price', () => {
    expect(ProductSchema.safeParse({ ...validProduct, price: -5 }).success).toBe(false);
  });

  it('rejects product with zero price', () => {
    expect(ProductSchema.safeParse({ ...validProduct, price: 0 }).success).toBe(false);
  });

  it('rejects product with invalid UUID', () => {
    expect(ProductSchema.safeParse({ ...validProduct, id: 'not-a-uuid' }).success).toBe(false);
  });
});

describe('OrderSchema', () => {
  const validOrder = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    customer_name: 'Ahmed',
    customer_phone: '21612345678',
    customer_address: '123 Rue de la Paix, Tunis',
    delivery_zone_id: '550e8400-e29b-41d4-a716-446655440001',
    total_amount: 25.5,
    delivery_fee: 5.0,
    status: 'pending' as const,
    delivery_date: '2024-06-25',
    created_at: '2024-06-20T10:00:00.000Z',
  };

  it('accepts a valid order', () => {
    expect(OrderSchema.safeParse(validOrder).success).toBe(true);
  });

  it('accepts order with null delivery_zone_id', () => {
    expect(OrderSchema.safeParse({ ...validOrder, delivery_zone_id: null }).success).toBe(true);
  });

  it('accepts all valid statuses', () => {
    for (const status of ['pending', 'preparing', 'delivering', 'completed', 'cancelled']) {
      expect(OrderSchema.safeParse({ ...validOrder, status }).success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    expect(OrderSchema.safeParse({ ...validOrder, status: 'unknown' }).success).toBe(false);
  });

  it('rejects negative total_amount', () => {
    expect(OrderSchema.safeParse({ ...validOrder, total_amount: -10 }).success).toBe(false);
  });
});

describe('OrderItemSchema', () => {
  const validItem = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    order_id: '550e8400-e29b-41d4-a716-446655440001',
    product_id: '550e8400-e29b-41d4-a716-446655440002',
    quantity: 3,
    unit_price: 10.0,
  };

  it('accepts a valid order item', () => {
    expect(OrderItemSchema.safeParse(validItem).success).toBe(true);
  });

  it('rejects zero quantity', () => {
    expect(OrderItemSchema.safeParse({ ...validItem, quantity: 0 }).success).toBe(false);
  });

  it('rejects negative quantity', () => {
    expect(OrderItemSchema.safeParse({ ...validItem, quantity: -1 }).success).toBe(false);
  });

  it('rejects non-integer quantity', () => {
    expect(OrderItemSchema.safeParse({ ...validItem, quantity: 1.5 }).success).toBe(false);
  });
});

describe('DeliveryZoneSchema', () => {
  it('accepts a valid zone', () => {
    expect(DeliveryZoneSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Tunis Centre',
      fee_amount: 5.0,
      is_active: true,
    }).success).toBe(true);
  });

  it('accepts zero fee', () => {
    expect(DeliveryZoneSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Nearby',
      fee_amount: 0,
      is_active: true,
    }).success).toBe(true);
  });

  it('rejects negative fee', () => {
    expect(DeliveryZoneSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Zone',
      fee_amount: -5,
      is_active: true,
    }).success).toBe(false);
  });
});

describe('DailyCapacitySchema', () => {
  it('accepts valid capacity', () => {
    expect(DailyCapacitySchema.safeParse({
      delivery_date: '2024-06-25',
      max_capacity: 20,
      current_booked: 10,
      is_closed: false,
    }).success).toBe(true);
  });

  it('rejects negative current_booked', () => {
    expect(DailyCapacitySchema.safeParse({
      delivery_date: '2024-06-25',
      max_capacity: 20,
      current_booked: -1,
      is_closed: false,
    }).success).toBe(false);
  });
});

describe('AvailableDateSchema', () => {
  it('accepts valid date', () => {
    expect(AvailableDateSchema.safeParse({
      available_date: '2024-06-25',
      reason: 'available',
    }).success).toBe(true);
  });

  it('rejects empty reason', () => {
    expect(AvailableDateSchema.safeParse({
      available_date: '2024-06-25',
      reason: '',
    }).success).toBe(false);
  });
});

describe('RawMaterialRequirementSchema', () => {
  it('accepts valid requirement', () => {
    expect(RawMaterialRequirementSchema.safeParse({
      ingredient_name: 'Mascarpone',
      total_quantity: 5.5,
      unit: 'kg',
    }).success).toBe(true);
  });

  it('accepts zero quantity', () => {
    expect(RawMaterialRequirementSchema.safeParse({
      ingredient_name: 'Sugar',
      total_quantity: 0,
      unit: 'grams',
    }).success).toBe(true);
  });
});
