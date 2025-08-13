-- Insert sample products
INSERT INTO products (name, category, packaging, price, description, stock, image_url) VALUES
('Premium Coconut Chips', 'coconut', 'canned', 4.99, 'Crispy coconut chips made from fresh coconuts, perfect for snacking.', 50, '/placeholder.svg?height=200&width=300'),
('Organic Coconut Strips', 'coconut', 'paper', 3.99, 'Organic coconut strips in eco-friendly paper packaging.', 75, '/placeholder.svg?height=200&width=300'),
('Cinnamon Sugar Chips', 'cinnamon', 'canned', 5.49, 'Sweet and spicy cinnamon chips with a hint of sugar.', 40, '/placeholder.svg?height=200&width=300'),
('Cinnamon Bark Chips', 'cinnamon', 'paper', 4.49, 'Natural cinnamon bark chips in biodegradable packaging.', 60, '/placeholder.svg?height=200&width=300'),
('Dark Chocolate Chips', 'chocolate', 'canned', 6.99, 'Rich dark chocolate chips, perfect for baking or snacking.', 30, '/placeholder.svg?height=200&width=300'),
('Milk Chocolate Chips', 'chocolate', 'paper', 5.99, 'Creamy milk chocolate chips in convenient paper packaging.', 45, '/placeholder.svg?height=200&width=300'),
('Coconut Chocolate Mix', 'coconut', 'canned', 7.49, 'A delicious mix of coconut and chocolate chips.', 25, '/placeholder.svg?height=200&width=300'),
('Cinnamon Chocolate Fusion', 'cinnamon', 'paper', 6.49, 'Unique blend of cinnamon and chocolate flavors.', 35, '/placeholder.svg?height=200&width=300');

-- Insert sample vendors
INSERT INTO vendors (name, location, phone, email, description) VALUES
('Downtown Snacks Hub', 'Main Building - Floor 1', '+1-555-0101', 'downtown@chipmart.com', 'Located in the main building lobby, serving the downtown office complex.'),
('Tech Campus Vendor', 'Tech Building - Floor 3', '+1-555-0102', 'tech@chipmart.com', 'Specialized vendor for the tech campus with extended hours.'),
('North Wing Express', 'North Building - Floor 2', '+1-555-0103', 'north@chipmart.com', 'Quick service vendor in the north wing of the complex.'),
('South Side Snacks', 'South Building - Ground Floor', '+1-555-0104', 'south@chipmart.com', 'Family-run vendor serving the south side offices.');

-- Create admin user (you'll need to sign up manually first, then update the role)
-- This is just a placeholder - the actual admin user needs to be created through the signup process
-- Then you can run: UPDATE profiles SET role = 'admin' WHERE email = 'admin@chipmart.com';
