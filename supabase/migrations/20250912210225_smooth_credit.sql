/*
  # Insert Sample Data for B2B Beverage Platform

  1. Sample Data
    - Categories with Turkish names and icons
    - Brands with logos
    - Sample products with realistic pricing
    - Demo campaigns
    - Sample user profiles

  2. Notes
    - All prices in Turkish Lira
    - Realistic product names and descriptions
    - Proper category hierarchy
*/

-- Insert sample categories
INSERT INTO categories (id, name, icon, description, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Gazlı İçecekler', '🥤', 'Kola, gazoz ve diğer gazlı içecekler', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'Su Ürünleri', '💧', 'Doğal kaynak suları ve damacana su', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Meyve Suları', '🧃', 'Doğal ve konsantre meyve suları', 3),
  ('550e8400-e29b-41d4-a716-446655440004', 'Enerji İçecekleri', '⚡', 'Enerji ve spor içecekleri', 4),
  ('550e8400-e29b-41d4-a716-446655440005', 'Çay & Kahve', '☕', 'Hazır çay ve kahve ürünleri', 5);

-- Insert sample brands
INSERT INTO brands (id, name, logo_url, description) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Coca-Cola', 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 'Dünya çapında tanınan içecek markası'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Pepsi', 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 'Global gazlı içecek markası'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Fanta', 'https://images.pexels.com/photos/2198165/pexels-photo-2198165.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 'Meyve aromalı gazlı içecekler'),
  ('660e8400-e29b-41d4-a716-446655440004', 'Sprite', 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 'Limon aromalı gazlı içecek'),
  ('660e8400-e29b-41d4-a716-446655440005', 'Aqua', 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 'Doğal kaynak suyu markası'),
  ('660e8400-e29b-41d4-a716-446655440006', 'Tropicana', 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 'Premium meyve suyu markası');

-- Insert sample campaigns
INSERT INTO campaigns (id, title, description, image_url, start_date, end_date, sort_order) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'Yılbaşı Kampanyası', 'Tüm içeceklerde %20''ye varan indirim!', 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1', '2025-01-01', '2025-01-31', 1),
  ('770e8400-e29b-41d4-a716-446655440002', 'Toplu Alım Fırsatı', 'Minimum 100 adet alımda ekstra %10 indirim', 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1', '2025-01-01', '2025-02-28', 2),
  ('770e8400-e29b-41d4-a716-446655440003', 'Bahar Koleksiyonu', 'Yeni sezon ürünleri şimdi stoklarda!', 'https://images.pexels.com/photos/2198165/pexels-photo-2198165.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1', '2025-03-01', '2025-05-31', 3);

-- Note: Sample products and user profiles will be inserted after authentication setup
-- This ensures proper foreign key relationships with auth.users table

-- Insert sample products (using placeholder supplier_id that will be updated after user creation)
INSERT INTO products (id, name, description, category_id, brand_id, shelf_price, sale_price, stock_quantity, min_order_quantity, max_order_quantity, is_opportunity, opportunity_end_date, discount_percentage, main_image_url, hover_image_url) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', 'Coca Cola 330ml x 24', 'Klasik Coca Cola 330ml kutu, 24''lü koli', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 89.90, 79.90, 150, 1, 50, true, '2025-01-15 23:59:59', 11, 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'),
  ('880e8400-e29b-41d4-a716-446655440002', 'Pepsi 500ml x 12', 'Pepsi Cola 500ml şişe, 12''li koli', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 54.90, 49.90, 200, 1, 25, false, null, 9, 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'https://images.pexels.com/photos/3008616/pexels-photo-3008616.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'),
  ('880e8400-e29b-41d4-a716-446655440003', 'Fanta Portakal 250ml x 24', 'Fanta Portakal 250ml kutu, 24''lü koli', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 76.90, 69.90, 88, 1, 30, false, null, 9, 'https://images.pexels.com/photos/2198165/pexels-photo-2198165.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'https://images.pexels.com/photos/4017593/pexels-photo-4017593.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'),
  ('880e8400-e29b-41d4-a716-446655440004', 'Sprite 1L x 12', 'Sprite Limon 1L şişe, 12''li koli', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', 64.90, 59.90, 120, 1, 40, false, null, 8, 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'https://images.pexels.com/photos/4113759/pexels-photo-4113759.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'),
  ('880e8400-e29b-41d4-a716-446655440005', 'Damacana Su 19L', 'Doğal kaynak suyu 19L damacana', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 25.90, 22.90, 75, 2, 20, false, null, 12, 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'),
  ('880e8400-e29b-41d4-a716-446655440006', 'Tropicana Portakal Suyu 1L x 6', 'Premium portakal suyu 1L şişe, 6''lı koli', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440006', 89.90, 84.90, 55, 1, 15, true, '2025-01-12 23:59:59', 6, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'https://images.pexels.com/photos/434295/pexels-photo-434295.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1');

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'Coca Cola 330ml kutu', 1, true),
  ('880e8400-e29b-41d4-a716-446655440001', 'https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'Coca Cola koli görünümü', 2, false),
  ('880e8400-e29b-41d4-a716-446655440002', 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'Pepsi 500ml şişe', 1, true),
  ('880e8400-e29b-41d4-a716-446655440003', 'https://images.pexels.com/photos/2198165/pexels-photo-2198165.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'Fanta Portakal kutu', 1, true),
  ('880e8400-e29b-41d4-a716-446655440004', 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'Sprite 1L şişe', 1, true),
  ('880e8400-e29b-41d4-a716-446655440005', 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'Damacana su', 1, true),
  ('880e8400-e29b-41d4-a716-446655440006', 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1', 'Tropicana portakal suyu', 1, true);