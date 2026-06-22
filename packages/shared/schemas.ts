import { z } from 'zod';

export const OrderStatusSchema = z.enum([
  'pending',
  'preparing',
  'delivering',
  'completed',
  'cancelled',
]);

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  price: z.number().positive(),
  image_url: z.string().url().nullable(),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
});

export const IngredientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  unit: z.string().min(1),
});

export const ProductIngredientSchema = z.object({
  product_id: z.string().uuid(),
  ingredient_id: z.string().uuid(),
  quantity_required_per_unit: z.number().positive(),
});

export const DeliveryZoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  fee_amount: z.number().min(0),
  is_active: z.boolean(),
});

export const OrderSchema = z.object({
  id: z.string().uuid(),
  customer_name: z.string().min(1),
  customer_phone: z.string().min(1),
  customer_address: z.string().min(1),
  delivery_zone_id: z.string().uuid().nullable(),
  total_amount: z.number().min(0),
  delivery_fee: z.number().min(0),
  status: OrderStatusSchema,
  delivery_date: z.string(),
  created_at: z.string().datetime(),
});

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive(),
});

export const DailyCapacitySchema = z.object({
  delivery_date: z.string(),
  max_capacity: z.number().int().positive(),
  current_booked: z.number().int().min(0),
  is_closed: z.boolean(),
});

export const RawMaterialRequirementSchema = z.object({
  ingredient_name: z.string().min(1),
  total_quantity: z.number().min(0),
  unit: z.string().min(1),
});

export const AvailableDateSchema = z.object({
  available_date: z.string(),
  reason: z.string().min(1),
});
