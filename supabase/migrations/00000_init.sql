-- 00000_init.sql

CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'delivering', 'completed', 'cancelled');

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    unit VARCHAR(50) NOT NULL -- 'kg', 'grams', 'pieces'
);

CREATE TABLE product_ingredients (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity_required_per_unit NUMERIC NOT NULL,
    PRIMARY KEY (product_id, ingredient_id)
);

CREATE TABLE delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    fee_amount NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_address TEXT NOT NULL,
    delivery_zone_id UUID REFERENCES delivery_zones(id),
    total_amount NUMERIC NOT NULL,
    delivery_fee NUMERIC NOT NULL,
    status order_status DEFAULT 'pending',
    delivery_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price NUMERIC NOT NULL
);

CREATE TABLE daily_capacity (
    delivery_date DATE PRIMARY KEY,
    max_capacity INT NOT NULL DEFAULT 20,
    current_booked INT NOT NULL DEFAULT 0,
    is_closed BOOLEAN DEFAULT false
);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Zones are viewable by everyone" ON delivery_zones FOR SELECT USING (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their own orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (true);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view order items" ON order_items FOR SELECT USING (true);

ALTER TABLE daily_capacity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view daily capacity" ON daily_capacity FOR SELECT USING (true);
CREATE POLICY "Anyone can update capacity" ON daily_capacity FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert capacity" ON daily_capacity FOR INSERT WITH CHECK (true);

-- Triggers for Quota
CREATE OR REPLACE FUNCTION update_daily_capacity()
RETURNS TRIGGER AS $$
DECLARE
    items_count INT;
    date_val DATE;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT delivery_date INTO date_val FROM orders WHERE id = NEW.order_id;
        
        INSERT INTO daily_capacity (delivery_date) VALUES (date_val)
        ON CONFLICT (delivery_date) DO NOTHING;
        
        UPDATE daily_capacity 
        SET current_booked = current_booked + NEW.quantity
        WHERE delivery_date = date_val;
        
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_items_insert
AFTER INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION update_daily_capacity();

CREATE OR REPLACE FUNCTION handle_order_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    total_qty INT;
BEGIN
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        SELECT SUM(quantity) INTO total_qty FROM order_items WHERE order_id = NEW.id;
        IF total_qty IS NOT NULL THEN
            UPDATE daily_capacity 
            SET current_booked = current_booked - total_qty
            WHERE delivery_date = NEW.delivery_date;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_status_update
AFTER UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION handle_order_cancellation();


-- RPC 1: get_available_dates
CREATE OR REPLACE FUNCTION get_available_dates(check_days INT DEFAULT 30)
RETURNS TABLE (available_date DATE, reason TEXT) AS $$
DECLARE
    tunisia_time TIMESTAMPTZ;
    start_date DATE;
    d DATE;
    max_cap INT;
    curr_booked INT;
    closed BOOLEAN;
BEGIN
    tunisia_time := now() AT TIME ZONE 'Africa/Tunis';
    
    IF extract(hour from tunisia_time) >= 18 THEN
        start_date := (tunisia_time + interval '2 days')::date;
    ELSE
        start_date := (tunisia_time + interval '1 day')::date;
    END IF;

    FOR d IN SELECT generate_series(start_date, start_date + (check_days - 1) * interval '1 day', '1 day'::interval) LOOP
        SELECT max_capacity, current_booked, is_closed 
        INTO max_cap, curr_booked, closed
        FROM daily_capacity WHERE delivery_date = d;

        IF NOT FOUND THEN
            available_date := d;
            reason := 'available';
            RETURN NEXT;
        ELSE
            IF closed THEN
                CONTINUE;
            ELSIF curr_booked < max_cap THEN
                available_date := d;
                reason := 'available';
                RETURN NEXT;
            END IF;
        END IF;
    END LOOP;
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- RPC 2: Raw Material Engine
CREATE OR REPLACE FUNCTION get_raw_material_requirements(target_date DATE)
RETURNS TABLE (
    ingredient_name TEXT,
    total_quantity NUMERIC,
    unit VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.name as ingredient_name,
        SUM(oi.quantity * pi.quantity_required_per_unit) as total_quantity,
        i.unit
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN product_ingredients pi ON oi.product_id = pi.product_id
    JOIN ingredients i ON pi.ingredient_id = i.id
    WHERE o.delivery_date = target_date
    AND o.status NOT IN ('cancelled', 'completed')
    GROUP BY i.name, i.unit;
END;
$$ LANGUAGE plpgsql;
