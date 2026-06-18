INSERT INTO products (id, name, description, price, image_url, is_active) VALUES
('b2345678-1234-1234-1234-1234567890ab', 'Classic Tiramisu', 'The authentic Italian recipe with mascarpone, espresso, and cocoa.', 25.0, '/images/classic.png', true),
('c2345678-1234-1234-1234-1234567890ab', 'Pistachio Tiramisu', 'A rich twist featuring premium Sicilian pistachio cream.', 32.0, '/images/pistachio.png', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    price = EXCLUDED.price, 
    image_url = EXCLUDED.image_url;
