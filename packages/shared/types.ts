export type OrderStatus = 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

export interface ProductIngredient {
  product_id: string;
  ingredient_id: string;
  quantity_required_per_unit: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee_amount: number;
  is_active: boolean;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_zone_id: string | null;
  total_amount: number;
  delivery_fee: number;
  status: OrderStatus;
  delivery_date: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface DailyCapacity {
  delivery_date: string;
  max_capacity: number;
  current_booked: number;
  is_closed: boolean;
}

export interface RawMaterialRequirement {
  ingredient_name: string;
  total_quantity: number;
  unit: string;
}

export interface AvailableDate {
  available_date: string;
  reason: string;
}
