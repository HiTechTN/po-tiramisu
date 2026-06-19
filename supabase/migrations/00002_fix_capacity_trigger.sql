-- Fix the daily capacity trigger to count orders, not item quantities
-- The previous trigger on order_items incremented current_booked by item quantity,
-- but the intent is to track number of orders (max_capacity = 20 orders).

DROP TRIGGER IF EXISTS trg_order_items_insert ON order_items;
DROP FUNCTION IF EXISTS update_daily_capacity();

CREATE OR REPLACE FUNCTION update_daily_capacity()
RETURNS TRIGGER AS $$
DECLARE
    date_val DATE;
BEGIN
    date_val := NEW.delivery_date;

    INSERT INTO daily_capacity (delivery_date) VALUES (date_val)
    ON CONFLICT (delivery_date) DO NOTHING;

    UPDATE daily_capacity
    SET current_booked = (
        SELECT COUNT(*) FROM orders
        WHERE delivery_date = date_val
        AND status NOT IN ('cancelled')
    )
    WHERE delivery_date = date_val;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_insert
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION update_daily_capacity();

-- Also fix cancellation handler to use COUNT instead of SUM
CREATE OR REPLACE FUNCTION handle_order_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    order_count INT;
BEGIN
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        SELECT COUNT(*) INTO order_count FROM orders
        WHERE delivery_date = NEW.delivery_date
        AND status NOT IN ('cancelled');

        UPDATE daily_capacity
        SET current_booked = order_count
        WHERE delivery_date = NEW.delivery_date;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
