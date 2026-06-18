INSERT INTO products (id, name, description, price, image_url, is_active) VALUES
('b2345678-1234-1234-1234-1234567890ab', 'Classic Tiramisu', 'The authentic Italian recipe with mascarpone, espresso, and cocoa.', 10.0, '/images/classic.png', true),
('c2345678-1234-1234-1234-1234567890ab', 'Nutella Speculoos Tiramisu', 'A rich twist featuring premium Nutella and crushed Speculoos cookies.', 15.0, '/images/nutella_speculoos.png', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    price = EXCLUDED.price, 
    image_url = EXCLUDED.image_url;

INSERT INTO delivery_zones (id, name, fee_amount, is_active) VALUES
('d2345678-1234-1234-1234-1234567890ab', 'Centre Ville', 4.0, true),
('e2345678-1234-1234-1234-1234567890ab', 'Bardo', 4.0, true),
('f2345678-1234-1234-1234-1234567890ab', 'Mourouj', 4.0, true),
('g2345678-1234-1234-1234-1234567890ab', 'Rades', 4.0, true),
('h2345678-1234-1234-1234-1234567890ab', 'Menzah', 4.0, true),
('i2345678-1234-1234-1234-1234567890ab', 'Manar', 4.0, true),
('j2345678-1234-1234-1234-1234567890ab', 'Ariana Ville', 4.0, true)
ON CONFLICT (id) DO UPDATE SET
    fee_amount = EXCLUDED.fee_amount;
