-- =========================================
-- REAL RESTAURANT MENU MIGRATION
-- SAFE, IDEMPOTENT, AND TRANSACTIONAL
-- COLLATION-FIXED VERSION
-- =========================================

USE restaurant_qr_db;

START TRANSACTION;

-- SAFETY: Drop temp table if it exists from a previous failed run
DROP TEMPORARY TABLE IF EXISTS tmp_real_menu;

-- 1. CREATE TEMPORARY TABLE FOR REAL MENU DATA
-- IMPORTANT: Explicitly match the collation of existing tables (utf8mb4_unicode_ci)
CREATE TEMPORARY TABLE tmp_real_menu (
    category_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    item_name VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_veg TINYINT(1) NOT NULL,
    display_order INT NOT NULL
) ENGINE=MEMORY DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. POPULATE TEMPORARY TABLE (191 ITEMS)
INSERT INTO tmp_real_menu (category_name, item_name, price, is_veg, display_order) VALUES
-- Indian Veg Curries (12)
('Indian Veg Curries', 'Corn Palak', 200.00, 1, 1),
('Indian Veg Curries', 'Palak Paneer', 240.00, 1, 2),
('Indian Veg Curries', 'Kadai Paneer', 280.00, 1, 3),
('Indian Veg Curries', 'Paneer Chat Pata', 280.00, 1, 4),
('Indian Veg Curries', 'Paneer Kolhapuri', 280.00, 1, 5),
('Indian Veg Curries', 'Paneer Butter Masala', 290.00, 1, 6),
('Indian Veg Curries', 'Methi Paneer', 290.00, 1, 7),
('Indian Veg Curries', 'Mutter Paneer', 290.00, 1, 8),
('Indian Veg Curries', 'Methi Chaman Bahar', 300.00, 1, 9),
('Indian Veg Curries', 'Kaju Paneer Curry', 340.00, 1, 10),
('Indian Veg Curries', 'Malai Kofta Curry', 340.00, 1, 11),
('Indian Veg Curries', 'Kaju Curry', 330.00, 1, 12),

-- Indian Non-Veg Curries (22)
('Indian Non-Veg Curries', 'Egg Curry', 160.00, 0, 1),
('Indian Non-Veg Curries', 'Chicken Bone Curry/Fry', 280.00, 0, 2),
('Indian Non-Veg Curries', 'Chicken Boneless Curry/Fry', 300.00, 0, 3),
('Indian Non-Veg Curries', 'Kadai Chicken', 290.00, 0, 4),
('Indian Non-Veg Curries', 'Butter Chicken', 300.00, 0, 5),
('Indian Non-Veg Curries', 'Methi Chicken', 300.00, 0, 6),
('Indian Non-Veg Curries', 'Chicken Chettinad', 290.00, 0, 7),
('Indian Non-Veg Curries', 'Chicken Tikka Masala', 290.00, 0, 8),
('Indian Non-Veg Curries', 'Chicken Maharani', 300.00, 0, 9),
('Indian Non-Veg Curries', 'Mughlai Chicken', 300.00, 0, 10),
('Indian Non-Veg Curries', 'Chicken Keema Curry', 320.00, 0, 11),
('Indian Non-Veg Curries', 'Chicken Kolhapuri Curry', 300.00, 0, 12),
('Indian Non-Veg Curries', 'Kaju Chicken Curry', 330.00, 0, 13),
('Indian Non-Veg Curries', 'Chicken Afghani', 330.00, 0, 14),
('Indian Non-Veg Curries', 'Chef Spl Chicken Curry', 330.00, 0, 15),
('Indian Non-Veg Curries', 'Kadai Mutton (Bone) Curry', 360.00, 0, 16),
('Indian Non-Veg Curries', 'Mutton Curry (Bone)', 360.00, 0, 17),
('Indian Non-Veg Curries', 'Mutton Fry (Bone)', 380.00, 0, 18),
('Indian Non-Veg Curries', 'Chef Spl Mutton Curry', 430.00, 0, 19),
('Indian Non-Veg Curries', 'Prawn Curry', 320.00, 0, 20),
('Indian Non-Veg Curries', 'Prawn Fry', 380.00, 0, 21),
('Indian Non-Veg Curries', 'Kadai Prawn Curry', 360.00, 0, 22),

-- Egg Starters (4)
('Egg Starters', 'Boiled Egg', 60.00, 0, 1),
('Egg Starters', 'Egg Bhurji', 180.00, 0, 2),
('Egg Starters', 'Egg (Chilly/65/Manchurian)', 220.00, 0, 3),
('Egg Starters', 'Egg Spring Rolls', 260.00, 0, 4),

-- Tandoori - Veg / Non Veg (8)
('Tandoori - Veg / Non Veg', 'Roasted Papad', 50.00, 1, 1),
('Tandoori - Veg / Non Veg', 'Masala Papad', 60.00, 1, 2),
('Tandoori - Veg / Non Veg', 'Paneer Tikka', 360.00, 1, 3),
('Tandoori - Veg / Non Veg', 'Chicken Tikka', 330.00, 0, 4),
('Tandoori - Veg / Non Veg', 'Kaju Kabab', 330.00, 1, 5),
('Tandoori - Veg / Non Veg', 'Tangidi Kabab', 320.00, 0, 6),
('Tandoori - Veg / Non Veg', 'Tandoori Chicken Half', 320.00, 0, 7),
('Tandoori - Veg / Non Veg', 'Tandoori Chicken Full', 520.00, 0, 8),

-- Veg - North Indian Curries (22)
('Veg - North Indian Curries', 'Green Peas Curry', 170.00, 1, 1),
('Veg - North Indian Curries', 'Plain Palak', 170.00, 1, 2),
('Veg - North Indian Curries', 'Alu Palak', 180.00, 1, 3),
('Veg - North Indian Curries', 'Tomato Curry', 180.00, 1, 4),
('Veg - North Indian Curries', 'Mixed Vegetable Curry', 180.00, 1, 5),
('Veg - North Indian Curries', 'Kadai Vegetable Curry', 200.00, 1, 6),
('Veg - North Indian Curries', 'Capsicum Curry', 210.00, 1, 7),
('Veg - North Indian Curries', 'Veg Maharani', 200.00, 1, 8),
('Veg - North Indian Curries', 'Veg Chettinad', 190.00, 1, 9),
('Veg - North Indian Curries', 'Veg Do Pyaza', 190.00, 1, 10),
('Veg - North Indian Curries', 'Alu Mutter', 180.00, 1, 11),
('Veg - North Indian Curries', 'Veg Keema Curry', 210.00, 1, 12),
('Veg - North Indian Curries', 'Veg Chat Pat Curry', 220.00, 1, 13),
('Veg - North Indian Curries', 'Veg Jai Puri', 240.00, 1, 14),
('Veg - North Indian Curries', 'Veg Kolhapuri', 260.00, 1, 15),
('Veg - North Indian Curries', 'Kaju Tomato Curry', 280.00, 1, 16),
('Veg - North Indian Curries', 'Kaju Capsicum Curry', 210.00, 1, 17),
('Veg - North Indian Curries', 'Baby Corn Curry (Half)', 200.00, 1, 18),
('Veg - North Indian Curries', 'Baby Corn Curry (Full)', 250.00, 1, 19),
('Veg - North Indian Curries', 'Mushroom Curry/Fry', 280.00, 1, 20),
('Veg - North Indian Curries', 'Kaju Mushroom Curry', 220.00, 1, 21),
('Veg - North Indian Curries', 'Kadai Mushroom Curry', 220.00, 1, 22),

-- Indian Bread (17)
('Indian Bread', 'Pulka', 20.00, 1, 1),
('Indian Bread', 'Butter Pulka', 25.00, 1, 2),
('Indian Bread', 'Roti', 60.00, 1, 3),
('Indian Bread', 'Butter Roti', 65.00, 1, 4),
('Indian Bread', 'Naan', 70.00, 1, 5),
('Indian Bread', 'Butter Naan', 80.00, 1, 6),
('Indian Bread', 'Garlic Naan', 90.00, 1, 7),
('Indian Bread', 'Lacha Parota', 90.00, 1, 8),
('Indian Bread', 'Methi Parota', 90.00, 1, 9),
('Indian Bread', 'Pudhina Parota', 100.00, 1, 10),
('Indian Bread', 'Alu Parota', 100.00, 1, 11),
('Indian Bread', 'Paneer Parota', 130.00, 1, 12),
('Indian Bread', 'Stuffed Parota', 110.00, 1, 13),
('Indian Bread', 'Plain Kulcha', 90.00, 1, 14),
('Indian Bread', 'Stuffed Kulcha', 100.00, 1, 15),
('Indian Bread', 'Masala Kulcha', 100.00, 1, 16),
('Indian Bread', 'Paneer Kulcha', 120.00, 1, 17),

-- Rice (3)
('Rice', 'Ualavacharu', 70.00, 1, 1),
('Rice', 'Curd Rice', 120.00, 1, 2),
('Rice', 'Sp. Curd Rice', 180.00, 1, 3),

-- Biryani's (23)
('Biryani''s', 'Biryani Rice', 220.00, 1, 1),
('Biryani''s', 'Veg Biryani', 230.00, 1, 2),
('Biryani''s', 'Spl. Veg Biryani', 280.00, 1, 3),
('Biryani''s', 'Ulavacharu Veg Biryani', 300.00, 1, 4),
('Biryani''s', 'Mushroom Veg Biryani', 300.00, 1, 5),
('Biryani''s', 'Paneer Veg Biriyani', 300.00, 1, 6),
('Biryani''s', 'Mixed Veg Biriyani', 310.00, 1, 7),
('Biryani''s', 'Kaju Veg Biryani', 340.00, 1, 8),
('Biryani''s', 'Egg Biryani', 280.00, 0, 9),
('Biryani''s', 'Ulavacharu Egg Biryani', 300.00, 0, 10),
('Biryani''s', 'Chicken Dum Biryani', 300.00, 0, 11),
('Biryani''s', 'Chicken Fry Biryani', 320.00, 0, 12),
('Biryani''s', 'Spl Chicken Biryani', 330.00, 0, 13),
('Biryani''s', 'Chicken Mogalai Biryani', 360.00, 0, 14),
('Biryani''s', 'Chicken Wings Biryani', 320.00, 0, 15),
('Biryani''s', 'Chicken Tikka Biryani', 330.00, 0, 16),
('Biryani''s', 'Tandoori Chicken Biryani', 340.00, 0, 17),
('Biryani''s', 'Chicken Keema Biryani', 360.00, 0, 18),
('Biryani''s', 'Chicken Ulavacharu Biryani', 340.00, 0, 19),
('Biryani''s', 'Egg Brown Chicken Biryani', 360.00, 0, 20),
('Biryani''s', 'Tangidi Chicken Biryani', 360.00, 0, 21),
('Biryani''s', 'Gongura Chicken Biryani Bone', 240.00, 0, 22),
('Biryani''s', 'Gongura Chicken Biryani Boneless', 280.00, 0, 23),

-- Veg-Soups (9)
('Veg-Soups', 'Tomato Soup', 100.00, 1, 1),
('Veg-Soups', 'Veg Corn Soup', 100.00, 1, 2),
('Veg-Soups', 'Veg Manchow Soup', 120.00, 1, 3),
('Veg-Soups', 'Veg Hot & Sour Soup', 100.00, 1, 4),
('Veg-Soups', 'Veg Clear Soup', 100.00, 1, 5),
('Veg-Soups', 'Veg Noodles Soup', 100.00, 1, 6),
('Veg-Soups', 'Veg Lemon Coriander Soup', 120.00, 1, 7),
('Veg-Soups', 'Veg Dragon Soup', 100.00, 1, 8),
('Veg-Soups', 'Flavours Spl. Veg Soup', 120.00, 1, 9),

-- Non Veg Soups (8)
('Non Veg Soups', 'Chicken Clear Soup', 120.00, 0, 1),
('Non Veg Soups', 'Chicken Corn Soup', 120.00, 0, 2),
('Non Veg Soups', 'Chicken Manchow Soup', 130.00, 0, 3),
('Non Veg Soups', 'Chicken Hot & Sour Soup', 120.00, 0, 4),
('Non Veg Soups', 'Chicken Noodles Soup', 120.00, 0, 5),
('Non Veg Soups', 'Chicken Dragon Soup', 120.00, 0, 6),
('Non Veg Soups', 'Chicken Lemon Coriander Soup', 130.00, 0, 7),
('Non Veg Soups', 'Soup Flavours Spl. Chicken Soup', 130.00, 0, 8),

-- Veg - Starters (12)
('Veg - Starters', 'Gobi-65/Manchurian (Seasonal)', 220.00, 1, 1),
('Veg - Starters', 'Veg Manchurian', 220.00, 1, 2),
('Veg - Starters', 'Veg - Spring Rolls', 250.00, 1, 3),
('Veg - Starters', 'Veg Hongkong', 250.00, 1, 4),
('Veg - Starters', 'Baby Corn (65/Manchurian/Chilly)', 220.00, 1, 5),
('Veg - Starters', 'Baby Corn majestic/salt & Pepper', 250.00, 1, 6),
('Veg - Starters', 'Crispy Baby Corn', 230.00, 1, 7),
('Veg - Starters', 'Mushroom (65/Manchurian/Chilly)', 230.00, 1, 8),
('Veg - Starters', 'Mushroom (Salt&Pepper/Schezwan)', 260.00, 1, 9),
('Veg - Starters', 'Paneer (65/Manchurian/Chilly)', 300.00, 1, 10),
('Veg - Starters', 'Paneer Majestic', 320.00, 1, 11),
('Veg - Starters', 'American Corn Fritter', 220.00, 1, 12),

-- Non-Veg Starters (39)
('Non-Veg Starters', 'Chilly Chicken', 300.00, 0, 1),
('Non-Veg Starters', 'Chicken 65', 300.00, 0, 2),
('Non-Veg Starters', 'Chicken Manchurian', 300.00, 0, 3),
('Non-Veg Starters', 'Chicken Hongkong', 300.00, 0, 4),
('Non-Veg Starters', 'Chicken Spring Rolls', 320.00, 0, 5),
('Non-Veg Starters', 'Pepper Chicken', 320.00, 0, 6),
('Non-Veg Starters', 'Bhutanese Chilly Chicken', 340.00, 0, 7),
('Non-Veg Starters', 'Hakka Corn Chicken', 320.00, 0, 8),
('Non-Veg Starters', 'Ginger Chicken/Garlic Chicken', 340.00, 0, 9),
('Non-Veg Starters', 'Schezwan Chicken', 300.00, 0, 10),
('Non-Veg Starters', 'Lemon Chicken', 300.00, 0, 11),
('Non-Veg Starters', 'Green Land Chicken', 300.00, 0, 12),
('Non-Veg Starters', 'Spicy Fried Chicken', 330.00, 0, 13),
('Non-Veg Starters', 'Chicken 555', 320.00, 0, 14),
('Non-Veg Starters', 'Sesame Chicken', 360.00, 0, 15),
('Non-Veg Starters', 'Popcorn Chicken', 350.00, 0, 16),
('Non-Veg Starters', 'Red Chilli Fried Chicken', 330.00, 0, 17),
('Non-Veg Starters', 'Butter Chilly Chicken', 320.00, 0, 18),
('Non-Veg Starters', 'Crispy Thade Chicken', 340.00, 0, 19),
('Non-Veg Starters', '8 to 8 Chicken', 340.00, 0, 20),
('Non-Veg Starters', 'Golden Dragon Chicken', 320.00, 0, 21),
('Non-Veg Starters', 'Chicken Gulzara', 360.00, 0, 22),
('Non-Veg Starters', 'Loose Chicken/Creamy Chicken', 370.00, 0, 23),
('Non-Veg Starters', 'Cashew Nut Chicken', 370.00, 0, 24),
('Non-Veg Starters', 'Mint Chicken', 330.00, 0, 25),
('Non-Veg Starters', 'Chilly Wings/Chicken Wings', 280.00, 0, 26),
('Non-Veg Starters', 'Chicken fried Wings', 320.00, 0, 27),
('Non-Veg Starters', 'Chicken Majestic/Schezwan', 330.00, 0, 28),
('Non-Veg Starters', 'Chicken Lollipop', 280.00, 0, 29),
('Non-Veg Starters', 'Chef Spl Chicken', 360.00, 0, 30),
('Non-Veg Starters', 'Apollo Fish', 300.00, 0, 31),
('Non-Veg Starters', 'Ginger Fish', 300.00, 0, 32),
('Non-Veg Starters', 'Chilly Fish/Schezwan Fish', 320.00, 0, 33),
('Non-Veg Starters', 'Hakka Fish/Garlic Fish', 300.00, 0, 34),
('Non-Veg Starters', 'Fish Manchurian', 340.00, 0, 35),
('Non-Veg Starters', 'Pepper Fish', 360.00, 0, 36),
('Non-Veg Starters', 'Prawn Manchurian', 360.00, 0, 37),
('Non-Veg Starters', 'Chilly Prawns', 360.00, 0, 38),
('Non-Veg Starters', 'Loose Prawns', 370.00, 0, 39),

-- Andhra Specialities (6)
('Andhra Specialities', 'Chicken Curry (Bone)', 270.00, 0, 1),
('Andhra Specialities', 'Chicken Fry (Bone)', 290.00, 0, 2),
('Andhra Specialities', 'Gongura Chicken Bone', 290.00, 0, 3),
('Andhra Specialities', 'Gongura Chicken Boneless', 330.00, 0, 4),
('Andhra Specialities', 'Gongura Mutton Curry', 410.00, 0, 5),
('Andhra Specialities', 'Gongura Prawns Curry', 440.00, 0, 6),

-- Salads (3)
('Salads', 'Onion Salad (Small)', 20.00, 1, 1),
('Salads', 'Onion Salad (Large)', 60.00, 1, 2),
('Salads', 'Tomato Salad', 60.00, 1, 3),

-- Raitas (3)
('Raitas', 'Onion Raita', 50.00, 1, 1),
('Raitas', 'Curd (Small)', 20.00, 1, 2),
('Raitas', 'Curd (Big)', 60.00, 1, 3);

-- 3. UPSERT CATEGORIES (Idempotent)
INSERT INTO categories (restaurant_id, name, display_order, is_active)
SELECT 1, category_name, MIN(display_order), 1
FROM tmp_real_menu
WHERE NOT EXISTS (
    SELECT 1 FROM categories c WHERE c.restaurant_id = 1 AND c.name COLLATE utf8mb4_unicode_ci = tmp_real_menu.category_name COLLATE utf8mb4_unicode_ci
)
GROUP BY category_name;

-- 4. UPDATE EXISTING MENU ITEMS (Fixes prices/spelling if they changed)
UPDATE menu_items m
INNER JOIN categories c ON m.category_id = c.id
INNER JOIN tmp_real_menu t ON c.name COLLATE utf8mb4_unicode_ci = t.category_name COLLATE utf8mb4_unicode_ci AND m.name COLLATE utf8mb4_unicode_ci = t.item_name COLLATE utf8mb4_unicode_ci
SET m.price = t.price, 
    m.is_veg = t.is_veg, 
    m.is_available = 1, 
    m.display_order = t.display_order
WHERE c.restaurant_id = 1;

-- 5. INSERT MISSING MENU ITEMS (Idempotent via NOT EXISTS)
INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, t.item_name, t.price, t.is_veg, 1, t.display_order
FROM categories c
INNER JOIN tmp_real_menu t ON c.name COLLATE utf8mb4_unicode_ci = t.category_name COLLATE utf8mb4_unicode_ci
WHERE c.restaurant_id = 1
AND NOT EXISTS (
    SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name COLLATE utf8mb4_unicode_ci = t.item_name COLLATE utf8mb4_unicode_ci
);

-- 6. SAFE DEMO CLEANUP
-- 6a. Mark referenced demo items as unavailable (Protects historical orders)
UPDATE menu_items m
INNER JOIN categories c ON m.category_id = c.id
LEFT JOIN tmp_real_menu t ON c.name COLLATE utf8mb4_unicode_ci = t.category_name COLLATE utf8mb4_unicode_ci AND m.name COLLATE utf8mb4_unicode_ci = t.item_name COLLATE utf8mb4_unicode_ci
INNER JOIN order_items oi ON m.id = oi.menu_item_id
SET m.is_available = 0
WHERE c.restaurant_id = 1 AND t.item_name IS NULL;

-- 6b. Delete unreferenced demo items (Safe because ON DELETE RESTRICT blocks referenced ones anyway)
DELETE m FROM menu_items m
INNER JOIN categories c ON m.category_id = c.id
LEFT JOIN tmp_real_menu t ON c.name COLLATE utf8mb4_unicode_ci = t.category_name COLLATE utf8mb4_unicode_ci AND m.name COLLATE utf8mb4_unicode_ci = t.item_name COLLATE utf8mb4_unicode_ci
LEFT JOIN order_items oi ON m.id = oi.menu_item_id
WHERE c.restaurant_id = 1 AND t.item_name IS NULL AND oi.id IS NULL;

-- 6c. Hide old categories that are no longer part of the real menu
UPDATE categories c
LEFT JOIN tmp_real_menu t ON c.name COLLATE utf8mb4_unicode_ci = t.category_name COLLATE utf8mb4_unicode_ci
SET c.is_active = 0
WHERE c.restaurant_id = 1 AND t.category_name IS NULL;

-- 7. CLEANUP AND COMMIT
DROP TEMPORARY TABLE IF EXISTS tmp_real_menu;
COMMIT;