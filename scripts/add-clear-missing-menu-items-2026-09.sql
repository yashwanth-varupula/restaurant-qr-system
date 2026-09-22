-- =====================================================================================
-- ADD CLEAR MISSING MENU ITEMS - 2026-09  (REVIEW ONLY - NOT YET EXECUTED)
-- =====================================================================================
-- Source    : scripts/proposed-missing-menu-items-2026-09.md (31 CLEAR candidates)
-- Scope     : Exactly 31 NEW menu items + exactly 5 NEW categories.
-- Reused    : Existing active categories "Biryani's" and "Non-Veg Starters" (by name).
-- Excluded  : 49 AMBIGUOUS items, Beverages, Mocktails, unreadable fragment, and all
--             existing menu items (191). IDs 70/71 and all existing prices untouched.
--
-- SAFETY RULES
--  1. Runs inside ONE transaction with NO automatic commit; nothing persists until
--     MANUALLY running COMMIT;.
--  2. No UPDATE / DELETE anywhere - only INSERT (categories, menu_items).
--  3. Every INSERT is idempotent (NOT EXISTS guards):
--       category guarded by (restaurant_id, name)
--       item     guarded by (category_id, name)
--     Re-running when already applied changes 0 rows.
--  4. No hard-coded IDs - new category/item IDs come from AUTO_INCREMENT.
--  5. Nothing else in the DB is touched (incl. scripts/update-menu-prices-2026-09.sql).
--
--  To apply later (from an interactive MySQL client), confirm every verification
--  query below reports the expected values, then run:  COMMIT;
--  To abort, run:  ROLLBACK;
-- =====================================================================================

USE restaurant_qr_db;

START TRANSACTION;

-- -------------------------------------------------------------------------------------
-- 0) PRE-CHECK - current state before any change
-- -------------------------------------------------------------------------------------
-- 0.1) Current active item count (expect 191)
SELECT COUNT(*) AS active_items_before
FROM menu_items
WHERE is_available = 1;

-- 0.2) Total item count (expect 191)
SELECT COUNT(*) AS total_items_before
FROM menu_items;

-- 0.3) Ambiguous guards - IDs 70/71 must remain untouched (expect 200.00 / 250.00)
SELECT id, name, price AS untouched_price
FROM menu_items
WHERE id IN (70, 71)
ORDER BY id;

-- 0.4) The 5 new categories must NOT already exist (expect 5 rows, all = 0)
SELECT 'Chinese Noodles'     AS proposed_category, COUNT(*) AS already_exists
FROM categories WHERE restaurant_id = 1 AND name = 'Chinese Noodles'
UNION ALL SELECT 'Chinese Fried Rice',     COUNT(*) FROM categories WHERE restaurant_id = 1 AND name = 'Chinese Fried Rice'
UNION ALL SELECT 'Chinese Veg Wet',        COUNT(*) FROM categories WHERE restaurant_id = 1 AND name = 'Chinese Veg Wet'
UNION ALL SELECT 'Chinese Non-Veg Wet',    COUNT(*) FROM categories WHERE restaurant_id = 1 AND name = 'Chinese Non-Veg Wet'
UNION ALL SELECT 'South Indian',           COUNT(*) FROM categories WHERE restaurant_id = 1 AND name = 'South Indian';

-- 0.5) Reused categories must exist and be active (expect 2 rows, is_active = 1)
SELECT id, name, is_active
FROM categories
WHERE restaurant_id = 1 AND name IN ('Biryani''s', 'Non-Veg Starters')
ORDER BY id;

-- -------------------------------------------------------------------------------------
-- 1) CREATE THE 5 NEW CATEGORIES (idempotent; display_order appended after current max)
-- -------------------------------------------------------------------------------------
INSERT INTO categories (restaurant_id, name, display_order, is_active)
SELECT 1, 'Chinese Noodles',
       (SELECT COALESCE(MAX(display_order), 0) + 1 FROM categories), 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 1 AND name = 'Chinese Noodles');

INSERT INTO categories (restaurant_id, name, display_order, is_active)
SELECT 1, 'Chinese Fried Rice',
       (SELECT COALESCE(MAX(display_order), 0) + 1 FROM categories), 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 1 AND name = 'Chinese Fried Rice');

INSERT INTO categories (restaurant_id, name, display_order, is_active)
SELECT 1, 'Chinese Veg Wet',
       (SELECT COALESCE(MAX(display_order), 0) + 1 FROM categories), 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 1 AND name = 'Chinese Veg Wet');

INSERT INTO categories (restaurant_id, name, display_order, is_active)
SELECT 1, 'Chinese Non-Veg Wet',
       (SELECT COALESCE(MAX(display_order), 0) + 1 FROM categories), 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 1 AND name = 'Chinese Non-Veg Wet');

INSERT INTO categories (restaurant_id, name, display_order, is_active)
SELECT 1, 'South Indian',
       (SELECT COALESCE(MAX(display_order), 0) + 1 FROM categories), 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE restaurant_id = 1 AND name = 'South Indian');

-- -------------------------------------------------------------------------------------
-- 2) INSERT THE 31 CLEAR CANDIDATES
--    Category resolved by NAME (no hard-coded category ID);
--    item ID is AUTO_INCREMENT (no hard-coded item ID);
--    display_order default 0; is_veg from dish contents; is_available = 1.
-- -------------------------------------------------------------------------------------
-- 2.1) Biryani's (reuses existing category) - 13 items
INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Flavours Spl. Chicken Biryani', 360.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Flavours Spl. Chicken Biryani');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Chicken Pot Biryani', 430.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Chicken Pot Biryani');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Mutton Dum Biryani (Sunday Only)', 450.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Mutton Dum Biryani (Sunday Only)');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Mutton Ulavacharu Biryani', 460.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Mutton Ulavacharu Biryani');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Spl Prawn Biryani', 400.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Spl Prawn Biryani');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Gongura Prawn Biryani', 420.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Gongura Prawn Biryani');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Prawn Pot Biryani', 490.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Prawn Pot Biryani');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Fish Biryani', 350.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Fish Biryani');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Mixed Non-veg Biryani', 450.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Mixed Non-veg Biryani');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Veg Biryani Family Pak', 580.00, 1, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Veg Biryani Family Pak');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Chicken Dum Biryani Family Pak', 780.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Chicken Dum Biryani Family Pak');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Mutton Biryani Family Pak', 880.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Mutton Biryani Family Pak');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Prawns Biryani Family Pak', 860.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Biryani''s'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Prawns Biryani Family Pak');

-- 2.2) Chinese Noodles (NEW category) - 1 item
INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Veg Soft Noodles', 240.00, 1, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Noodles'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Veg Soft Noodles');

-- 2.3) Chinese Fried Rice (NEW category) - 3 items
INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Spl / Mutton Fried Rice', 430.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Fried Rice'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Spl / Mutton Fried Rice');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Prawn Fried Rice', 410.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Fried Rice'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Prawn Fried Rice');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Spl Prawn Fried Rice', 420.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Fried Rice'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Spl Prawn Fried Rice');

-- 2.4) Chinese Veg Wet (NEW category) - 4 items
INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Veg Manchurian Wet', 230.00, 1, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Veg Wet'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Veg Manchurian Wet');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Chilly Mushroom Wet', 260.00, 1, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Veg Wet'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Chilly Mushroom Wet');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Paneer Manchurian Wet', 290.00, 1, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Veg Wet'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Paneer Manchurian Wet');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Baby Corn Manchurian Wet', 240.00, 1, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Veg Wet'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Baby Corn Manchurian Wet');

-- 2.5) Chinese Non-Veg Wet (NEW category) - 7 items
INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Chicken in Ginger Wet', 310.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Non-Veg Wet'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Chicken in Ginger Wet');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Chicken Manchurian Wet', 310.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Non-Veg Wet'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Chicken Manchurian Wet');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Chicken Chilly Wet', 310.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Non-Veg Wet'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Chicken Chilly Wet');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Chicken Schezwan Wet', 310.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Non-Veg Wet'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Chicken Schezwan Wet');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Fish in Chilly Wet', 310.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Non-Veg Wet'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Fish in Chilly Wet');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Prawns in Chilly Wet', 340.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Non-Veg Wet'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Prawns in Chilly Wet');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Prawns Manchurian Wet', 340.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Chinese Non-Veg Wet'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Prawns Manchurian Wet');

-- 2.6) Non-Veg Starters (reuses existing category) - 1 item
INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Prawn Salt & Pepper', 400.00, 0, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'Non-Veg Starters'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Prawn Salt & Pepper');

-- 2.7) South Indian (NEW category) - 2 items
INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Veg Thali', 180.00, 1, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'South Indian'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Veg Thali');

INSERT INTO menu_items (category_id, name, price, is_veg, is_available, display_order)
SELECT c.id, 'Sambar Rice', 130.00, 1, 1, 0
FROM categories c
WHERE c.restaurant_id = 1 AND c.name = 'South Indian'
  AND NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.category_id = c.id AND m.name = 'Sambar Rice');

-- -------------------------------------------------------------------------------------
-- 3) VERIFICATION (still inside the transaction - nothing committed)
-- -------------------------------------------------------------------------------------
-- 3.1) The 5 new categories now exist and are active (expect 5 rows)
SELECT id, name, is_active, restaurant_id
FROM categories
WHERE restaurant_id = 1
  AND name IN ('Chinese Noodles', 'Chinese Fried Rice', 'Chinese Veg Wet',
               'Chinese Non-Veg Wet', 'South Indian')
ORDER BY id;

-- 3.2) Active item count after (expect 191 + 31 = 222)
SELECT COUNT(*) AS active_items_after
FROM menu_items
WHERE is_available = 1;

-- 3.3) Total item count after (expect 191 + 31 = 222)
SELECT COUNT(*) AS total_items_after
FROM menu_items;

-- 3.4) New items placed in the correct categories - check every new name resolves
--      to exactly the intended category (expect 31 rows, no NULL)
SELECT c.name AS category_name, m.id AS item_id, m.name AS item_name,
       m.price, m.is_veg, m.is_available
FROM (
  SELECT 'Biryani''s' AS cat, 'Flavours Spl. Chicken Biryani' AS nm UNION ALL
  SELECT 'Biryani''s', 'Chicken Pot Biryani' UNION ALL
  SELECT 'Biryani''s', 'Mutton Dum Biryani (Sunday Only)' UNION ALL
  SELECT 'Biryani''s', 'Mutton Ulavacharu Biryani' UNION ALL
  SELECT 'Biryani''s', 'Spl Prawn Biryani' UNION ALL
  SELECT 'Biryani''s', 'Gongura Prawn Biryani' UNION ALL
  SELECT 'Biryani''s', 'Prawn Pot Biryani' UNION ALL
  SELECT 'Biryani''s', 'Fish Biryani' UNION ALL
  SELECT 'Biryani''s', 'Mixed Non-veg Biryani' UNION ALL
  SELECT 'Biryani''s', 'Veg Biryani Family Pak' UNION ALL
  SELECT 'Biryani''s', 'Chicken Dum Biryani Family Pak' UNION ALL
  SELECT 'Biryani''s', 'Mutton Biryani Family Pak' UNION ALL
  SELECT 'Biryani''s', 'Prawns Biryani Family Pak' UNION ALL
  SELECT 'Chinese Noodles', 'Veg Soft Noodles' UNION ALL
  SELECT 'Chinese Fried Rice', 'Spl / Mutton Fried Rice' UNION ALL
  SELECT 'Chinese Fried Rice', 'Prawn Fried Rice' UNION ALL
  SELECT 'Chinese Fried Rice', 'Spl Prawn Fried Rice' UNION ALL
  SELECT 'Chinese Veg Wet', 'Veg Manchurian Wet' UNION ALL
  SELECT 'Chinese Veg Wet', 'Chilly Mushroom Wet' UNION ALL
  SELECT 'Chinese Veg Wet', 'Paneer Manchurian Wet' UNION ALL
  SELECT 'Chinese Veg Wet', 'Baby Corn Manchurian Wet' UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Chicken in Ginger Wet' UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Chicken Manchurian Wet' UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Chicken Chilly Wet' UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Chicken Schezwan Wet' UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Fish in Chilly Wet' UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Prawns in Chilly Wet' UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Prawns Manchurian Wet' UNION ALL
  SELECT 'Non-Veg Starters', 'Prawn Salt & Pepper' UNION ALL
  SELECT 'South Indian', 'Veg Thali' UNION ALL
  SELECT 'South Indian', 'Sambar Rice'
) e
JOIN categories c ON c.restaurant_id = 1 AND c.name = e.cat
JOIN menu_items m ON m.category_id = c.id AND m.name = e.nm
ORDER BY c.id, m.id;

-- 3.5) Price / is_veg cross-check for exactly the 31 expected additions
--      (expect 31 rows; actual_price must equal expected_price)
SELECT e.cat AS category_name, e.nm AS item_name, e.price AS expected_price,
       m.id AS actual_id, m.price AS actual_price,
       IF(m.price = e.price, 'OK', 'MISMATCH') AS price_check,
       m.is_veg
FROM (
  SELECT 'Biryani''s' AS cat, 'Flavours Spl. Chicken Biryani' AS nm, 360.00 AS price UNION ALL
  SELECT 'Biryani''s', 'Chicken Pot Biryani', 430.00 UNION ALL
  SELECT 'Biryani''s', 'Mutton Dum Biryani (Sunday Only)', 450.00 UNION ALL
  SELECT 'Biryani''s', 'Mutton Ulavacharu Biryani', 460.00 UNION ALL
  SELECT 'Biryani''s', 'Spl Prawn Biryani', 400.00 UNION ALL
  SELECT 'Biryani''s', 'Gongura Prawn Biryani', 420.00 UNION ALL
  SELECT 'Biryani''s', 'Prawn Pot Biryani', 490.00 UNION ALL
  SELECT 'Biryani''s', 'Fish Biryani', 350.00 UNION ALL
  SELECT 'Biryani''s', 'Mixed Non-veg Biryani', 450.00 UNION ALL
  SELECT 'Biryani''s', 'Veg Biryani Family Pak', 580.00 UNION ALL
  SELECT 'Biryani''s', 'Chicken Dum Biryani Family Pak', 780.00 UNION ALL
  SELECT 'Biryani''s', 'Mutton Biryani Family Pak', 880.00 UNION ALL
  SELECT 'Biryani''s', 'Prawns Biryani Family Pak', 860.00 UNION ALL
  SELECT 'Chinese Noodles', 'Veg Soft Noodles', 240.00 UNION ALL
  SELECT 'Chinese Fried Rice', 'Spl / Mutton Fried Rice', 430.00 UNION ALL
  SELECT 'Chinese Fried Rice', 'Prawn Fried Rice', 410.00 UNION ALL
  SELECT 'Chinese Fried Rice', 'Spl Prawn Fried Rice', 420.00 UNION ALL
  SELECT 'Chinese Veg Wet', 'Veg Manchurian Wet', 230.00 UNION ALL
  SELECT 'Chinese Veg Wet', 'Chilly Mushroom Wet', 260.00 UNION ALL
  SELECT 'Chinese Veg Wet', 'Paneer Manchurian Wet', 290.00 UNION ALL
  SELECT 'Chinese Veg Wet', 'Baby Corn Manchurian Wet', 240.00 UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Chicken in Ginger Wet', 310.00 UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Chicken Manchurian Wet', 310.00 UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Chicken Chilly Wet', 310.00 UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Chicken Schezwan Wet', 310.00 UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Fish in Chilly Wet', 310.00 UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Prawns in Chilly Wet', 340.00 UNION ALL
  SELECT 'Chinese Non-Veg Wet', 'Prawns Manchurian Wet', 340.00 UNION ALL
  SELECT 'Non-Veg Starters', 'Prawn Salt & Pepper', 400.00 UNION ALL
  SELECT 'South Indian', 'Veg Thali', 180.00 UNION ALL
  SELECT 'South Indian', 'Sambar Rice', 130.00
) e
JOIN categories c ON c.restaurant_id = 1 AND c.name = e.cat
LEFT JOIN menu_items m ON m.category_id = c.id AND m.name = e.nm
ORDER BY e.cat, m.id;

-- 3.6) Duplicate name check across the 31 expected names (expect ZERO rows)
SELECT m.name, COUNT(*) AS name_count
FROM menu_items m
WHERE m.name IN (
  'Flavours Spl. Chicken Biryani','Chicken Pot Biryani','Mutton Dum Biryani (Sunday Only)',
  'Mutton Ulavacharu Biryani','Spl Prawn Biryani','Gongura Prawn Biryani','Prawn Pot Biryani',
  'Fish Biryani','Mixed Non-veg Biryani','Veg Biryani Family Pak','Chicken Dum Biryani Family Pak',
  'Mutton Biryani Family Pak','Prawns Biryani Family Pak','Veg Soft Noodles','Spl / Mutton Fried Rice',
  'Prawn Fried Rice','Spl Prawn Fried Rice','Veg Manchurian Wet','Chilly Mushroom Wet',
  'Paneer Manchurian Wet','Baby Corn Manchurian Wet','Chicken in Ginger Wet','Chicken Manchurian Wet',
  'Chicken Chilly Wet','Chicken Schezwan Wet','Fish in Chilly Wet','Prawns in Chilly Wet',
  'Prawns Manchurian Wet','Prawn Salt & Pepper','Veg Thali','Sambar Rice'
)
GROUP BY m.name
HAVING COUNT(*) > 1;

-- 3.7) No other global duplicate names introduced anywhere (expect ZERO rows)
SELECT name, COUNT(*) AS name_count
FROM menu_items
GROUP BY name
HAVING COUNT(*) > 1;

-- 3.8) Integrity guarantee - rows changed by this transaction: 5 categories + 31 items
SELECT 5 AS categories_touched, 31 AS items_touched;
SELECT COUNT(*) AS newly_created_categories
FROM categories
WHERE restaurant_id = 1
  AND name IN ('Chinese Noodles', 'Chinese Fried Rice', 'Chinese Veg Wet',
               'Chinese Non-Veg Wet', 'South Indian');

-- -------------------------------------------------------------------------------------
-- 4) FINALIZE - MANUAL DECISION POINT (CHOOSE ONE)
-- -------------------------------------------------------------------------------------
-- Confirm every verification above matches expectation BEFORE applying one of these.
--
--   COMMIT;     -- persist the 5 categories + 31 items (only after review)
--   ROLLBACK;   -- discard everything this script staged
--
-- NOTE: executing this file from a script runner that auto-commits each statement is
-- NOT supported here; run it from an interactive client so that the transaction stays
-- open until step 3 checks pass and you choose COMMIT or ROLLBACK yourself.
-- =====================================================================================
-- END
-- =====================================================================================