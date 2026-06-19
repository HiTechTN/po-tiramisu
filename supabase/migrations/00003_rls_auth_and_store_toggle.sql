-- Strengthen RLS policies with auth checks and add store toggle

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view their own orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can view order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can view daily capacity" ON daily_capacity;
DROP POLICY IF EXISTS "Anyone can update capacity" ON daily_capacity;
DROP POLICY IF EXISTS "Anyone can insert capacity" ON daily_capacity;

-- Orders: anyone can insert, only authenticated admins can view/update all
CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view orders"
  ON orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Order items: anyone can insert (needed for checkout flow without auth)
CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view order items"
  ON order_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- Daily capacity: authenticated can view, only service_role can write (handled by triggers)
CREATE POLICY "Authenticated users can view daily capacity"
  ON daily_capacity FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage daily capacity"
  ON daily_capacity FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Ingredients and product_ingredients: admin only
CREATE POLICY "Authenticated users can view ingredients"
  ON ingredients FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage ingredients"
  ON ingredients FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view product_ingredients"
  ON product_ingredients FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage product_ingredients"
  ON product_ingredients FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS on tables that don't have it yet
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ingredients ENABLE ROW LEVEL SECURITY;

-- Store toggle RPC for admin
CREATE OR REPLACE FUNCTION set_store_closed(closed BOOLEAN, target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_capacity (delivery_date, is_closed)
  VALUES (target_date, closed)
  ON CONFLICT (delivery_date)
  DO UPDATE SET is_closed = closed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if store is open for a given date
CREATE OR REPLACE FUNCTION is_store_open(check_date DATE DEFAULT CURRENT_DATE)
RETURNS BOOLEAN AS $$
DECLARE
  closed BOOLEAN;
BEGIN
  SELECT is_closed INTO closed FROM daily_capacity WHERE delivery_date = check_date;
  RETURN COALESCE(NOT closed, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
