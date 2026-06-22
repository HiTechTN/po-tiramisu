-- 00005_security_hardening.sql
-- Security hardening: role-based access, order validation RPC, tightened RLS

-- ============================================================
-- 1. User roles table
-- ============================================================
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage roles"
  ON user_roles FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Helper: check if current user is admin
-- SECURITY DEFINER is needed here because user_roles has restrictive RLS.
-- auth.uid() returns the JWT user ID regardless of SECURITY DEFINER in Supabase.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 2. Tighten existing RLS policies
-- ============================================================

-- Orders: restrict SELECT/UPDATE to admins only (customers use create_order RPC)
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view order items" ON order_items;

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin());

-- INSERT is handled exclusively by create_order() SECURITY DEFINER RPC.
-- No direct INSERT policies on orders or order_items.

-- Order items: restrict SELECT to admins only
CREATE POLICY "Admins can view order items"
  ON order_items FOR SELECT
  USING (is_admin());

-- Daily capacity: restrict to admins
DROP POLICY IF EXISTS "Authenticated users can view daily capacity" ON daily_capacity;
DROP POLICY IF EXISTS "Authenticated users can manage daily capacity" ON daily_capacity;

CREATE POLICY "Admins can view daily capacity"
  ON daily_capacity FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage daily capacity"
  ON daily_capacity FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Ingredients: restrict to admins
DROP POLICY IF EXISTS "Authenticated users can view ingredients" ON ingredients;
DROP POLICY IF EXISTS "Authenticated users can manage ingredients" ON ingredients;

CREATE POLICY "Admins can view ingredients"
  ON ingredients FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage ingredients"
  ON ingredients FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Product ingredients: restrict to admins
DROP POLICY IF EXISTS "Authenticated users can view product_ingredients" ON product_ingredients;
DROP POLICY IF EXISTS "Authenticated users can manage product_ingredients" ON product_ingredients;

CREATE POLICY "Admins can view product_ingredients"
  ON product_ingredients FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage product_ingredients"
  ON product_ingredients FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 3. Secure order creation RPC (replaces direct INSERT)
-- ============================================================
CREATE OR REPLACE FUNCTION create_order(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_address TEXT,
  p_delivery_zone_id UUID,
  p_delivery_date DATE,
  p_items JSONB  -- [{product_id: uuid, quantity: int}]
)
RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_total_amount NUMERIC := 0;
  v_delivery_fee NUMERIC := 0;
  v_item JSONB;
  v_product RECORD;
  v_day_booked INT;
  v_day_max INT;
  v_item_qty INT;
  v_item_total NUMERIC;
BEGIN
  -- Validate delivery date is in the future (at least tomorrow)
  IF p_delivery_date < (CURRENT_DATE + INTERVAL '1 day')::DATE THEN
    RETURN jsonb_build_object('error', 'Delivery date must be at least tomorrow');
  END IF;

  -- Validate items array is not empty
  IF jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object('error', 'Order must contain at least one item');
  END IF;

  -- Check daily capacity
  SELECT max_capacity, current_booked INTO v_day_max, v_day_booked
  FROM daily_capacity
  WHERE delivery_date = p_delivery_date;

  -- Default capacity if no row exists
  IF NOT FOUND THEN
    v_day_max := 20;
    v_day_booked := 0;
  END IF;

  -- Check store is not closed
  IF FOUND AND EXISTS (
    SELECT 1 FROM daily_capacity WHERE delivery_date = p_delivery_date AND is_closed = true
  ) THEN
    RETURN jsonb_build_object('error', 'Store is closed for this date');
  END IF;

  -- Validate each item and calculate totals
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_qty := (v_item->>'quantity')::INT;

    IF v_item_qty IS NULL OR v_item_qty <= 0 THEN
      RETURN jsonb_build_object('error', 'Invalid quantity for product ' || v_item->>'product_id');
    END IF;

    SELECT id, price, is_active INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('error', 'Product not found: ' || v_item->>'product_id');
    END IF;

    IF NOT v_product.is_active THEN
      RETURN jsonb_build_object('error', 'Product is inactive: ' || v_product.id);
    END IF;

    v_item_total := v_product.price * v_item_qty;
    v_total_amount := v_total_amount + v_item_total;

    -- Check capacity for each item
    IF (v_day_booked + v_item_qty) > v_day_max THEN
      RETURN jsonb_build_object('error', 'Insufficient capacity for date ' || p_delivery_date);
    END IF;

    -- Reserve capacity
    v_day_booked := v_day_booked + v_item_qty;
  END LOOP;

  -- Get delivery fee
  IF p_delivery_zone_id IS NOT NULL THEN
    SELECT fee_amount INTO v_delivery_fee
    FROM delivery_zones
    WHERE id = p_delivery_zone_id AND is_active = true;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('error', 'Invalid delivery zone');
    END IF;
  END IF;

  -- Create order (via SECURITY DEFINER, bypasses RLS)
  INSERT INTO orders (customer_name, customer_phone, customer_address, delivery_zone_id, total_amount, delivery_fee, delivery_date, status)
  VALUES (p_customer_name, p_customer_phone, p_customer_address, p_delivery_zone_id, v_total_amount, v_delivery_fee, p_delivery_date, 'pending')
  RETURNING id INTO v_order_id;

  -- Insert order items (capacity trigger handles daily_capacity updates)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
    SELECT v_order_id, p.id, (v_item->>'quantity')::INT, p.price
    FROM products p
    WHERE p.id = (v_item->>'product_id')::UUID;
  END LOOP;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'total_amount', v_total_amount,
    'delivery_fee', v_delivery_fee,
    'grand_total', v_total_amount + v_delivery_fee
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
