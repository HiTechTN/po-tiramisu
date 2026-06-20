export interface User {
  id: number;
  uuid: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'customer' | 'admin' | 'delivery';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Address {
  id: number;
  label?: string;
  street: string;
  city: string;
  postal_code?: string;
  governorate?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  price_dt: number;
  cost_dt?: number;
  quantity_available: number;
  quantity_reserved: number;
  image_url?: string;
  images: string[];
  category?: string;
  tags: string[];
  is_active: boolean;
  average_rating?: number;
  reviews_count: number;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price_dt: number;
  total_price_dt: number;
  in_stock: boolean;
}

export interface Cart {
  user_id: number;
  items: CartItem[];
  subtotal_dt: number;
  delivery_fee_dt: number;
  discount_dt: number;
  total_dt: number;
  promo_code?: string;
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price_dt: number;
  total_price_dt: number;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  message: string;
}

export interface DeliveryInfo {
  id: number;
  uuid: string;
  status: string;
  delivery_person_name?: string;
  delivery_person_phone?: string;
  current_location?: { latitude: number; longitude: number };
  estimated_delivery?: string;
  location_history: { latitude: number; longitude: number; timestamp: string }[];
}

export interface Order {
  id: number;
  uuid: string;
  user_id: number;
  status: string;
  payment_status: string;
  subtotal_dt: number;
  delivery_fee_dt: number;
  discount_dt: number;
  total_dt: number;
  items: OrderItem[];
  delivery_address?: {
    street: string;
    city: string;
    postal_code?: string;
    governorate?: string;
  };
  delivery_notes?: string;
  payment_method?: string;
  payment_ref?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  timeline: OrderTimeline[];
  delivery?: DeliveryInfo;
  payment_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Review {
  id: number;
  user_id: number;
  product_id?: number;
  order_id?: number;
  rating: number;
  title?: string;
  comment?: string;
  user_name?: string;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
}

export interface ReviewList {
  items: Review[];
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<string, number>;
}

export interface Payment {
  id: number;
  uuid: string;
  order_id: number;
  user_id: number;
  amount_dt: number;
  currency: string;
  provider: string;
  status: string;
  created_at: string;
  completed_at?: string;
}

export interface AdminDashboard {
  total_orders: number;
  total_revenue_dt: number;
  pending_orders: number;
  active_customers: number;
  recent_orders: any[];
  top_products: any[];
  revenue_by_day: { date: string; revenue: number; count: number }[];
  order_status_distribution: Record<string, number>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}
