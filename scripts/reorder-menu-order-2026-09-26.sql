-- ============================================================
-- MENU CATEGORY ORDER + NON-VEG -> VEG ITEM ORDER REORDER
-- Flavours Restaurant QR  |  generated 2026-09-26
-- ============================================================
-- Scope: ONLY categories.display_order and menu_items.display_order
-- are written. Names, prices, descriptions, image_url, is_available,
-- is_veg, category_id, orders and order_items are never touched.
--
-- Target category order (ids read from the live DB, never assumed):
--   1. Soups         -> Non Veg Soups, Veg-Soups
--   2. Starters      -> Non-Veg Starters, Veg - Starters, Egg Starters
--   3. Tandoori      -> Tandoori - Veg / Non Veg
--   4. Rice Items    -> Rice, Biryani's, Chinese Fried Rice, Chinese Noodles
--   5. Bread / Rotis -> Indian Bread
--   6. Curries       -> Indian Non-Veg Curries, Indian Veg Curries,
--                        Veg - North Indian Curries
--   7. Remaining     -> Andhra Specialities, Salads, Raitas,
--                        Chinese Veg Wet, Chinese Non-Veg Wet, South Indian
--   (inactive)       -> Starters, Main Course, Beverages  (not shown to customers)
--
-- Item rule: inside every category, is_veg = 0 rows keep their current
-- relative order and come first, then is_veg = 1 rows in their current
-- relative order. No alphabetical sorting is applied.
--
-- Pre-change snapshot: database/backup-before-menu-reorder-2026-09-26.json
-- Rollback: run the ROLLBACK section at the bottom of this file.
-- ============================================================

START TRANSACTION;

-- ------------------------------------------------------------
-- 1. categories.display_order
-- ------------------------------------------------------------

-- Veg-Soups
UPDATE categories SET display_order = 2 WHERE id = 12 AND display_order = 1;
-- Non-Veg Starters
UPDATE categories SET display_order = 101 WHERE id = 15 AND display_order = 1;
-- Veg - Starters
UPDATE categories SET display_order = 102 WHERE id = 14 AND display_order = 1;
-- Egg Starters
UPDATE categories SET display_order = 103 WHERE id = 6 AND display_order = 1;
-- Tandoori - Veg / Non Veg
UPDATE categories SET display_order = 201 WHERE id = 7 AND display_order = 1;
-- Rice
UPDATE categories SET display_order = 301 WHERE id = 10 AND display_order = 1;
-- Biryani's
UPDATE categories SET display_order = 302 WHERE id = 11 AND display_order = 1;
-- Chinese Fried Rice
UPDATE categories SET display_order = 303 WHERE id = 25 AND display_order = 5;
-- Chinese Noodles
UPDATE categories SET display_order = 304 WHERE id = 24 AND display_order = 4;
-- Indian Bread
UPDATE categories SET display_order = 401 WHERE id = 9 AND display_order = 1;
-- Indian Non-Veg Curries
UPDATE categories SET display_order = 501 WHERE id = 5 AND display_order = 1;
-- Indian Veg Curries
UPDATE categories SET display_order = 502 WHERE id = 4 AND display_order = 1;
-- Veg - North Indian Curries
UPDATE categories SET display_order = 503 WHERE id = 8 AND display_order = 1;
-- Andhra Specialities
UPDATE categories SET display_order = 601 WHERE id = 16 AND display_order = 1;
-- Salads
UPDATE categories SET display_order = 602 WHERE id = 17 AND display_order = 1;
-- Raitas
UPDATE categories SET display_order = 603 WHERE id = 18 AND display_order = 1;
-- Chinese Veg Wet
UPDATE categories SET display_order = 604 WHERE id = 26 AND display_order = 6;
-- Chinese Non-Veg Wet
UPDATE categories SET display_order = 605 WHERE id = 27 AND display_order = 7;
-- South Indian
UPDATE categories SET display_order = 606 WHERE id = 28 AND display_order = 8;
-- Starters  (inactive)
UPDATE categories SET display_order = 701 WHERE id = 1 AND display_order = 1;
-- Main Course  (inactive)
UPDATE categories SET display_order = 702 WHERE id = 2 AND display_order = 2;
-- Beverages  (inactive)
UPDATE categories SET display_order = 703 WHERE id = 3 AND display_order = 3;

-- ------------------------------------------------------------
-- 2. menu_items.display_order  (non-veg first, then veg)
--    101 of 222 rows actually change
-- ------------------------------------------------------------
-- Tandoori - Veg / Non Veg :: Chicken Tikka (is_veg=0) 4 -> 1
UPDATE menu_items SET display_order = 1 WHERE id = 48 AND display_order = 4;
-- Tandoori - Veg / Non Veg :: Tangidi Kabab (is_veg=0) 6 -> 2
UPDATE menu_items SET display_order = 2 WHERE id = 50 AND display_order = 6;
-- Tandoori - Veg / Non Veg :: Tandoori Chicken Half (is_veg=0) 7 -> 3
UPDATE menu_items SET display_order = 3 WHERE id = 51 AND display_order = 7;
-- Tandoori - Veg / Non Veg :: Tandoori Chicken Full (is_veg=0) 8 -> 4
UPDATE menu_items SET display_order = 4 WHERE id = 52 AND display_order = 8;
-- Tandoori - Veg / Non Veg :: Roasted Papad (is_veg=1) 1 -> 5
UPDATE menu_items SET display_order = 5 WHERE id = 45 AND display_order = 1;
-- Tandoori - Veg / Non Veg :: Masala Papad (is_veg=1) 2 -> 6
UPDATE menu_items SET display_order = 6 WHERE id = 46 AND display_order = 2;
-- Tandoori - Veg / Non Veg :: Paneer Tikka (is_veg=1) 3 -> 7
UPDATE menu_items SET display_order = 7 WHERE id = 47 AND display_order = 3;
-- Tandoori - Veg / Non Veg :: Kaju Kabab (is_veg=1) 5 -> 8
UPDATE menu_items SET display_order = 8 WHERE id = 49 AND display_order = 5;
-- Biryani's :: Chicken Dum Biryani Family Pak (is_veg=0) 0 -> 1
UPDATE menu_items SET display_order = 1 WHERE id = 239 AND display_order = 0;
-- Biryani's :: Chicken Pot Biryani (is_veg=0) 0 -> 2
UPDATE menu_items SET display_order = 2 WHERE id = 230 AND display_order = 0;
-- Biryani's :: Fish Biryani (is_veg=0) 0 -> 3
UPDATE menu_items SET display_order = 3 WHERE id = 236 AND display_order = 0;
-- Biryani's :: Flavours Spl. Chicken Biryani (is_veg=0) 0 -> 4
UPDATE menu_items SET display_order = 4 WHERE id = 229 AND display_order = 0;
-- Biryani's :: Gongura Prawn Biryani (is_veg=0) 0 -> 5
UPDATE menu_items SET display_order = 5 WHERE id = 234 AND display_order = 0;
-- Biryani's :: Mixed Non-veg Biryani (is_veg=0) 0 -> 6
UPDATE menu_items SET display_order = 6 WHERE id = 237 AND display_order = 0;
-- Biryani's :: Mutton Biryani Family Pak (is_veg=0) 0 -> 7
UPDATE menu_items SET display_order = 7 WHERE id = 240 AND display_order = 0;
-- Biryani's :: Mutton Dum Biryani (Sunday Only) (is_veg=0) 0 -> 8
UPDATE menu_items SET display_order = 8 WHERE id = 231 AND display_order = 0;
-- Biryani's :: Mutton Ulavacharu Biryani (is_veg=0) 0 -> 9
UPDATE menu_items SET display_order = 9 WHERE id = 232 AND display_order = 0;
-- Biryani's :: Prawn Pot Biryani (is_veg=0) 0 -> 10
UPDATE menu_items SET display_order = 10 WHERE id = 235 AND display_order = 0;
-- Biryani's :: Prawns Biryani Family Pak (is_veg=0) 0 -> 11
UPDATE menu_items SET display_order = 11 WHERE id = 241 AND display_order = 0;
-- Biryani's :: Spl Prawn Biryani (is_veg=0) 0 -> 12
UPDATE menu_items SET display_order = 12 WHERE id = 233 AND display_order = 0;
-- Biryani's :: Egg Biryani (is_veg=0) 9 -> 13
UPDATE menu_items SET display_order = 13 WHERE id = 103 AND display_order = 9;
-- Biryani's :: Ulavacharu Egg Biryani (is_veg=0) 10 -> 14
UPDATE menu_items SET display_order = 14 WHERE id = 104 AND display_order = 10;
-- Biryani's :: Chicken Dum Biryani (is_veg=0) 11 -> 15
UPDATE menu_items SET display_order = 15 WHERE id = 105 AND display_order = 11;
-- Biryani's :: Chicken Fry Biryani (is_veg=0) 12 -> 16
UPDATE menu_items SET display_order = 16 WHERE id = 106 AND display_order = 12;
-- Biryani's :: Spl Chicken Biryani (is_veg=0) 13 -> 17
UPDATE menu_items SET display_order = 17 WHERE id = 107 AND display_order = 13;
-- Biryani's :: Chicken Mogalai Biryani (is_veg=0) 14 -> 18
UPDATE menu_items SET display_order = 18 WHERE id = 108 AND display_order = 14;
-- Biryani's :: Chicken Wings Biryani (is_veg=0) 15 -> 19
UPDATE menu_items SET display_order = 19 WHERE id = 109 AND display_order = 15;
-- Biryani's :: Chicken Tikka Biryani (is_veg=0) 16 -> 20
UPDATE menu_items SET display_order = 20 WHERE id = 110 AND display_order = 16;
-- Biryani's :: Tandoori Chicken Biryani (is_veg=0) 17 -> 21
UPDATE menu_items SET display_order = 21 WHERE id = 111 AND display_order = 17;
-- Biryani's :: Chicken Keema Biryani (is_veg=0) 18 -> 22
UPDATE menu_items SET display_order = 22 WHERE id = 112 AND display_order = 18;
-- Biryani's :: Chicken Ulavacharu Biryani (is_veg=0) 19 -> 23
UPDATE menu_items SET display_order = 23 WHERE id = 113 AND display_order = 19;
-- Biryani's :: Egg Brown Chicken Biryani (is_veg=0) 20 -> 24
UPDATE menu_items SET display_order = 24 WHERE id = 114 AND display_order = 20;
-- Biryani's :: Tangidi Chicken Biryani (is_veg=0) 21 -> 25
UPDATE menu_items SET display_order = 25 WHERE id = 115 AND display_order = 21;
-- Biryani's :: Gongura Chicken Biryani Bone (is_veg=0) 22 -> 26
UPDATE menu_items SET display_order = 26 WHERE id = 116 AND display_order = 22;
-- Biryani's :: Gongura Chicken Biryani Boneless (is_veg=0) 23 -> 27
UPDATE menu_items SET display_order = 27 WHERE id = 117 AND display_order = 23;
-- Biryani's :: Veg Biryani Family Pak (is_veg=1) 0 -> 28
UPDATE menu_items SET display_order = 28 WHERE id = 238 AND display_order = 0;
-- Biryani's :: Biryani Rice (is_veg=1) 1 -> 29
UPDATE menu_items SET display_order = 29 WHERE id = 95 AND display_order = 1;
-- Biryani's :: Veg Biryani (is_veg=1) 2 -> 30
UPDATE menu_items SET display_order = 30 WHERE id = 96 AND display_order = 2;
-- Biryani's :: Spl. Veg Biryani (is_veg=1) 3 -> 31
UPDATE menu_items SET display_order = 31 WHERE id = 97 AND display_order = 3;
-- Biryani's :: Ulavacharu Veg Biryani (is_veg=1) 4 -> 32
UPDATE menu_items SET display_order = 32 WHERE id = 98 AND display_order = 4;
-- Biryani's :: Mushroom Veg Biryani (is_veg=1) 5 -> 33
UPDATE menu_items SET display_order = 33 WHERE id = 99 AND display_order = 5;
-- Biryani's :: Paneer Veg Biriyani (is_veg=1) 6 -> 34
UPDATE menu_items SET display_order = 34 WHERE id = 100 AND display_order = 6;
-- Biryani's :: Mixed Veg Biriyani (is_veg=1) 7 -> 35
UPDATE menu_items SET display_order = 35 WHERE id = 101 AND display_order = 7;
-- Biryani's :: Kaju Veg Biryani (is_veg=1) 8 -> 36
UPDATE menu_items SET display_order = 36 WHERE id = 102 AND display_order = 8;
-- Non-Veg Starters :: Prawn Salt & Pepper (is_veg=0) 0 -> 1
UPDATE menu_items SET display_order = 1 WHERE id = 257 AND display_order = 0;
-- Non-Veg Starters :: Chilly Chicken (is_veg=0) 1 -> 2
UPDATE menu_items SET display_order = 2 WHERE id = 147 AND display_order = 1;
-- Non-Veg Starters :: Chicken 65 (is_veg=0) 2 -> 3
UPDATE menu_items SET display_order = 3 WHERE id = 148 AND display_order = 2;
-- Non-Veg Starters :: Chicken Manchurian (is_veg=0) 3 -> 4
UPDATE menu_items SET display_order = 4 WHERE id = 149 AND display_order = 3;
-- Non-Veg Starters :: Chicken Hongkong (is_veg=0) 4 -> 5
UPDATE menu_items SET display_order = 5 WHERE id = 150 AND display_order = 4;
-- Non-Veg Starters :: Chicken Spring Rolls (is_veg=0) 5 -> 6
UPDATE menu_items SET display_order = 6 WHERE id = 151 AND display_order = 5;
-- Non-Veg Starters :: Pepper Chicken (is_veg=0) 6 -> 7
UPDATE menu_items SET display_order = 7 WHERE id = 152 AND display_order = 6;
-- Non-Veg Starters :: Bhutanese Chilly Chicken (is_veg=0) 7 -> 8
UPDATE menu_items SET display_order = 8 WHERE id = 153 AND display_order = 7;
-- Non-Veg Starters :: Hakka Corn Chicken (is_veg=0) 8 -> 9
UPDATE menu_items SET display_order = 9 WHERE id = 154 AND display_order = 8;
-- Non-Veg Starters :: Ginger Chicken/Garlic Chicken (is_veg=0) 9 -> 10
UPDATE menu_items SET display_order = 10 WHERE id = 155 AND display_order = 9;
-- Non-Veg Starters :: Schezwan Chicken (is_veg=0) 10 -> 11
UPDATE menu_items SET display_order = 11 WHERE id = 156 AND display_order = 10;
-- Non-Veg Starters :: Lemon Chicken (is_veg=0) 11 -> 12
UPDATE menu_items SET display_order = 12 WHERE id = 157 AND display_order = 11;
-- Non-Veg Starters :: Green Land Chicken (is_veg=0) 12 -> 13
UPDATE menu_items SET display_order = 13 WHERE id = 158 AND display_order = 12;
-- Non-Veg Starters :: Spicy Fried Chicken (is_veg=0) 13 -> 14
UPDATE menu_items SET display_order = 14 WHERE id = 159 AND display_order = 13;
-- Non-Veg Starters :: Chicken 555 (is_veg=0) 14 -> 15
UPDATE menu_items SET display_order = 15 WHERE id = 160 AND display_order = 14;
-- Non-Veg Starters :: Sesame Chicken (is_veg=0) 15 -> 16
UPDATE menu_items SET display_order = 16 WHERE id = 161 AND display_order = 15;
-- Non-Veg Starters :: Popcorn Chicken (is_veg=0) 16 -> 17
UPDATE menu_items SET display_order = 17 WHERE id = 162 AND display_order = 16;
-- Non-Veg Starters :: Red Chilli Fried Chicken (is_veg=0) 17 -> 18
UPDATE menu_items SET display_order = 18 WHERE id = 163 AND display_order = 17;
-- Non-Veg Starters :: Butter Chilly Chicken (is_veg=0) 18 -> 19
UPDATE menu_items SET display_order = 19 WHERE id = 164 AND display_order = 18;
-- Non-Veg Starters :: Crispy Thade Chicken (is_veg=0) 19 -> 20
UPDATE menu_items SET display_order = 20 WHERE id = 165 AND display_order = 19;
-- Non-Veg Starters :: 8 to 8 Chicken (is_veg=0) 20 -> 21
UPDATE menu_items SET display_order = 21 WHERE id = 166 AND display_order = 20;
-- Non-Veg Starters :: Golden Dragon Chicken (is_veg=0) 21 -> 22
UPDATE menu_items SET display_order = 22 WHERE id = 167 AND display_order = 21;
-- Non-Veg Starters :: Chicken Gulzara (is_veg=0) 22 -> 23
UPDATE menu_items SET display_order = 23 WHERE id = 168 AND display_order = 22;
-- Non-Veg Starters :: Loose Chicken/Creamy Chicken (is_veg=0) 23 -> 24
UPDATE menu_items SET display_order = 24 WHERE id = 169 AND display_order = 23;
-- Non-Veg Starters :: Cashew Nut Chicken (is_veg=0) 24 -> 25
UPDATE menu_items SET display_order = 25 WHERE id = 170 AND display_order = 24;
-- Non-Veg Starters :: Mint Chicken (is_veg=0) 25 -> 26
UPDATE menu_items SET display_order = 26 WHERE id = 171 AND display_order = 25;
-- Non-Veg Starters :: Chilly Wings/Chicken Wings (is_veg=0) 26 -> 27
UPDATE menu_items SET display_order = 27 WHERE id = 172 AND display_order = 26;
-- Non-Veg Starters :: Chicken fried Wings (is_veg=0) 27 -> 28
UPDATE menu_items SET display_order = 28 WHERE id = 173 AND display_order = 27;
-- Non-Veg Starters :: Chicken Majestic/Schezwan (is_veg=0) 28 -> 29
UPDATE menu_items SET display_order = 29 WHERE id = 174 AND display_order = 28;
-- Non-Veg Starters :: Chicken Lollipop (is_veg=0) 29 -> 30
UPDATE menu_items SET display_order = 30 WHERE id = 175 AND display_order = 29;
-- Non-Veg Starters :: Chef Spl Chicken (is_veg=0) 30 -> 31
UPDATE menu_items SET display_order = 31 WHERE id = 176 AND display_order = 30;
-- Non-Veg Starters :: Apollo Fish (is_veg=0) 31 -> 32
UPDATE menu_items SET display_order = 32 WHERE id = 177 AND display_order = 31;
-- Non-Veg Starters :: Ginger Fish (is_veg=0) 32 -> 33
UPDATE menu_items SET display_order = 33 WHERE id = 178 AND display_order = 32;
-- Non-Veg Starters :: Chilly Fish/Schezwan Fish (is_veg=0) 33 -> 34
UPDATE menu_items SET display_order = 34 WHERE id = 179 AND display_order = 33;
-- Non-Veg Starters :: Hakka Fish/Garlic Fish (is_veg=0) 34 -> 35
UPDATE menu_items SET display_order = 35 WHERE id = 180 AND display_order = 34;
-- Non-Veg Starters :: Fish Manchurian (is_veg=0) 35 -> 36
UPDATE menu_items SET display_order = 36 WHERE id = 181 AND display_order = 35;
-- Non-Veg Starters :: Pepper Fish (is_veg=0) 36 -> 37
UPDATE menu_items SET display_order = 37 WHERE id = 182 AND display_order = 36;
-- Non-Veg Starters :: Prawn Manchurian (is_veg=0) 37 -> 38
UPDATE menu_items SET display_order = 38 WHERE id = 183 AND display_order = 37;
-- Non-Veg Starters :: Chilly Prawns (is_veg=0) 38 -> 39
UPDATE menu_items SET display_order = 39 WHERE id = 184 AND display_order = 38;
-- Non-Veg Starters :: Loose Prawns (is_veg=0) 39 -> 40
UPDATE menu_items SET display_order = 40 WHERE id = 185 AND display_order = 39;
-- Chinese Noodles :: Veg Soft Noodles (is_veg=1) 0 -> 1
UPDATE menu_items SET display_order = 1 WHERE id = 242 AND display_order = 0;
-- Chinese Fried Rice :: Prawn Fried Rice (is_veg=0) 0 -> 1
UPDATE menu_items SET display_order = 1 WHERE id = 244 AND display_order = 0;
-- Chinese Fried Rice :: Spl / Mutton Fried Rice (is_veg=0) 0 -> 2
UPDATE menu_items SET display_order = 2 WHERE id = 243 AND display_order = 0;
-- Chinese Fried Rice :: Spl Prawn Fried Rice (is_veg=0) 0 -> 3
UPDATE menu_items SET display_order = 3 WHERE id = 245 AND display_order = 0;
-- Chinese Veg Wet :: Baby Corn Manchurian Wet (is_veg=1) 0 -> 1
UPDATE menu_items SET display_order = 1 WHERE id = 249 AND display_order = 0;
-- Chinese Veg Wet :: Chilly Mushroom Wet (is_veg=1) 0 -> 2
UPDATE menu_items SET display_order = 2 WHERE id = 247 AND display_order = 0;
-- Chinese Veg Wet :: Paneer Manchurian Wet (is_veg=1) 0 -> 3
UPDATE menu_items SET display_order = 3 WHERE id = 248 AND display_order = 0;
-- Chinese Veg Wet :: Veg Manchurian Wet (is_veg=1) 0 -> 4
UPDATE menu_items SET display_order = 4 WHERE id = 246 AND display_order = 0;
-- Chinese Non-Veg Wet :: Chicken Chilly Wet (is_veg=0) 0 -> 1
UPDATE menu_items SET display_order = 1 WHERE id = 252 AND display_order = 0;
-- Chinese Non-Veg Wet :: Chicken in Ginger Wet (is_veg=0) 0 -> 2
UPDATE menu_items SET display_order = 2 WHERE id = 250 AND display_order = 0;
-- Chinese Non-Veg Wet :: Chicken Manchurian Wet (is_veg=0) 0 -> 3
UPDATE menu_items SET display_order = 3 WHERE id = 251 AND display_order = 0;
-- Chinese Non-Veg Wet :: Chicken Schezwan Wet (is_veg=0) 0 -> 4
UPDATE menu_items SET display_order = 4 WHERE id = 253 AND display_order = 0;
-- Chinese Non-Veg Wet :: Fish in Chilly Wet (is_veg=0) 0 -> 5
UPDATE menu_items SET display_order = 5 WHERE id = 254 AND display_order = 0;
-- Chinese Non-Veg Wet :: Prawns in Chilly Wet (is_veg=0) 0 -> 6
UPDATE menu_items SET display_order = 6 WHERE id = 255 AND display_order = 0;
-- Chinese Non-Veg Wet :: Prawns Manchurian Wet (is_veg=0) 0 -> 7
UPDATE menu_items SET display_order = 7 WHERE id = 256 AND display_order = 0;
-- South Indian :: Sambar Rice (is_veg=1) 0 -> 1
UPDATE menu_items SET display_order = 1 WHERE id = 259 AND display_order = 0;
-- South Indian :: Veg Thali (is_veg=1) 0 -> 2
UPDATE menu_items SET display_order = 2 WHERE id = 258 AND display_order = 0;

-- ------------------------------------------------------------
-- 3. Verification (run before COMMIT)
-- ------------------------------------------------------------
-- 3a. category order, customer facing
-- SELECT c.display_order, c.name, COUNT(m.id) items
--   FROM categories c LEFT JOIN menu_items m ON m.category_id = c.id
--  WHERE c.is_active = 1
--  GROUP BY c.id ORDER BY c.display_order;
--
-- 3b. no non-veg item may sort after a veg item inside a category
-- SELECT category_id, name, is_veg, display_order FROM (
--   SELECT m.*, MAX(CASE WHEN m.is_veg = 0 THEN m.display_order END) OVER (PARTITION BY m.category_id) AS last_nonveg
--     FROM menu_items m) t
--  WHERE is_veg = 0 AND display_order < last_nonveg;
--
-- 3c. duplicate display_order check (expect 0 rows)
-- SELECT category_id, display_order, COUNT(*) c FROM menu_items
--  GROUP BY category_id, display_order HAVING c > 1;
-- SELECT display_order, COUNT(*) c FROM categories GROUP BY display_order HAVING c > 1;

COMMIT;

-- ============================================================
-- ROLLBACK  (only if the change must be reverted)
-- Replaces the WHERE guard values with the pre-change snapshot.
-- ============================================================
-- START TRANSACTION;
-- UPDATE categories SET display_order = 1 WHERE id = 1 AND display_order = 701;
-- UPDATE categories SET display_order = 2 WHERE id = 2 AND display_order = 702;
-- UPDATE categories SET display_order = 3 WHERE id = 3 AND display_order = 703;
-- UPDATE categories SET display_order = 1 WHERE id = 4 AND display_order = 502;
-- UPDATE categories SET display_order = 1 WHERE id = 5 AND display_order = 501;
-- UPDATE categories SET display_order = 1 WHERE id = 6 AND display_order = 103;
-- UPDATE categories SET display_order = 1 WHERE id = 7 AND display_order = 201;
-- UPDATE categories SET display_order = 1 WHERE id = 8 AND display_order = 503;
-- UPDATE categories SET display_order = 1 WHERE id = 9 AND display_order = 401;
-- UPDATE categories SET display_order = 1 WHERE id = 10 AND display_order = 301;
-- UPDATE categories SET display_order = 1 WHERE id = 11 AND display_order = 302;
-- UPDATE categories SET display_order = 1 WHERE id = 12 AND display_order = 2;
-- UPDATE categories SET display_order = 1 WHERE id = 14 AND display_order = 102;
-- UPDATE categories SET display_order = 1 WHERE id = 15 AND display_order = 101;
-- UPDATE categories SET display_order = 1 WHERE id = 16 AND display_order = 601;
-- UPDATE categories SET display_order = 1 WHERE id = 17 AND display_order = 602;
-- UPDATE categories SET display_order = 1 WHERE id = 18 AND display_order = 603;
-- UPDATE categories SET display_order = 4 WHERE id = 24 AND display_order = 304;
-- UPDATE categories SET display_order = 5 WHERE id = 25 AND display_order = 303;
-- UPDATE categories SET display_order = 6 WHERE id = 26 AND display_order = 604;
-- UPDATE categories SET display_order = 7 WHERE id = 27 AND display_order = 605;
-- UPDATE categories SET display_order = 8 WHERE id = 28 AND display_order = 606;
-- UPDATE menu_items SET display_order = 1 WHERE id = 45 AND display_order = 5;
-- UPDATE menu_items SET display_order = 2 WHERE id = 46 AND display_order = 6;
-- UPDATE menu_items SET display_order = 3 WHERE id = 47 AND display_order = 7;
-- UPDATE menu_items SET display_order = 4 WHERE id = 48 AND display_order = 1;
-- UPDATE menu_items SET display_order = 5 WHERE id = 49 AND display_order = 8;
-- UPDATE menu_items SET display_order = 6 WHERE id = 50 AND display_order = 2;
-- UPDATE menu_items SET display_order = 7 WHERE id = 51 AND display_order = 3;
-- UPDATE menu_items SET display_order = 8 WHERE id = 52 AND display_order = 4;
-- UPDATE menu_items SET display_order = 1 WHERE id = 95 AND display_order = 29;
-- UPDATE menu_items SET display_order = 2 WHERE id = 96 AND display_order = 30;
-- UPDATE menu_items SET display_order = 3 WHERE id = 97 AND display_order = 31;
-- UPDATE menu_items SET display_order = 4 WHERE id = 98 AND display_order = 32;
-- UPDATE menu_items SET display_order = 5 WHERE id = 99 AND display_order = 33;
-- UPDATE menu_items SET display_order = 6 WHERE id = 100 AND display_order = 34;
-- UPDATE menu_items SET display_order = 7 WHERE id = 101 AND display_order = 35;
-- UPDATE menu_items SET display_order = 8 WHERE id = 102 AND display_order = 36;
-- UPDATE menu_items SET display_order = 9 WHERE id = 103 AND display_order = 13;
-- UPDATE menu_items SET display_order = 10 WHERE id = 104 AND display_order = 14;
-- UPDATE menu_items SET display_order = 11 WHERE id = 105 AND display_order = 15;
-- UPDATE menu_items SET display_order = 12 WHERE id = 106 AND display_order = 16;
-- UPDATE menu_items SET display_order = 13 WHERE id = 107 AND display_order = 17;
-- UPDATE menu_items SET display_order = 14 WHERE id = 108 AND display_order = 18;
-- UPDATE menu_items SET display_order = 15 WHERE id = 109 AND display_order = 19;
-- UPDATE menu_items SET display_order = 16 WHERE id = 110 AND display_order = 20;
-- UPDATE menu_items SET display_order = 17 WHERE id = 111 AND display_order = 21;
-- UPDATE menu_items SET display_order = 18 WHERE id = 112 AND display_order = 22;
-- UPDATE menu_items SET display_order = 19 WHERE id = 113 AND display_order = 23;
-- UPDATE menu_items SET display_order = 20 WHERE id = 114 AND display_order = 24;
-- UPDATE menu_items SET display_order = 21 WHERE id = 115 AND display_order = 25;
-- UPDATE menu_items SET display_order = 22 WHERE id = 116 AND display_order = 26;
-- UPDATE menu_items SET display_order = 23 WHERE id = 117 AND display_order = 27;
-- UPDATE menu_items SET display_order = 1 WHERE id = 147 AND display_order = 2;
-- UPDATE menu_items SET display_order = 2 WHERE id = 148 AND display_order = 3;
-- UPDATE menu_items SET display_order = 3 WHERE id = 149 AND display_order = 4;
-- UPDATE menu_items SET display_order = 4 WHERE id = 150 AND display_order = 5;
-- UPDATE menu_items SET display_order = 5 WHERE id = 151 AND display_order = 6;
-- UPDATE menu_items SET display_order = 6 WHERE id = 152 AND display_order = 7;
-- UPDATE menu_items SET display_order = 7 WHERE id = 153 AND display_order = 8;
-- UPDATE menu_items SET display_order = 8 WHERE id = 154 AND display_order = 9;
-- UPDATE menu_items SET display_order = 9 WHERE id = 155 AND display_order = 10;
-- UPDATE menu_items SET display_order = 10 WHERE id = 156 AND display_order = 11;
-- UPDATE menu_items SET display_order = 11 WHERE id = 157 AND display_order = 12;
-- UPDATE menu_items SET display_order = 12 WHERE id = 158 AND display_order = 13;
-- UPDATE menu_items SET display_order = 13 WHERE id = 159 AND display_order = 14;
-- UPDATE menu_items SET display_order = 14 WHERE id = 160 AND display_order = 15;
-- UPDATE menu_items SET display_order = 15 WHERE id = 161 AND display_order = 16;
-- UPDATE menu_items SET display_order = 16 WHERE id = 162 AND display_order = 17;
-- UPDATE menu_items SET display_order = 17 WHERE id = 163 AND display_order = 18;
-- UPDATE menu_items SET display_order = 18 WHERE id = 164 AND display_order = 19;
-- UPDATE menu_items SET display_order = 19 WHERE id = 165 AND display_order = 20;
-- UPDATE menu_items SET display_order = 20 WHERE id = 166 AND display_order = 21;
-- UPDATE menu_items SET display_order = 21 WHERE id = 167 AND display_order = 22;
-- UPDATE menu_items SET display_order = 22 WHERE id = 168 AND display_order = 23;
-- UPDATE menu_items SET display_order = 23 WHERE id = 169 AND display_order = 24;
-- UPDATE menu_items SET display_order = 24 WHERE id = 170 AND display_order = 25;
-- UPDATE menu_items SET display_order = 25 WHERE id = 171 AND display_order = 26;
-- UPDATE menu_items SET display_order = 26 WHERE id = 172 AND display_order = 27;
-- UPDATE menu_items SET display_order = 27 WHERE id = 173 AND display_order = 28;
-- UPDATE menu_items SET display_order = 28 WHERE id = 174 AND display_order = 29;
-- UPDATE menu_items SET display_order = 29 WHERE id = 175 AND display_order = 30;
-- UPDATE menu_items SET display_order = 30 WHERE id = 176 AND display_order = 31;
-- UPDATE menu_items SET display_order = 31 WHERE id = 177 AND display_order = 32;
-- UPDATE menu_items SET display_order = 32 WHERE id = 178 AND display_order = 33;
-- UPDATE menu_items SET display_order = 33 WHERE id = 179 AND display_order = 34;
-- UPDATE menu_items SET display_order = 34 WHERE id = 180 AND display_order = 35;
-- UPDATE menu_items SET display_order = 35 WHERE id = 181 AND display_order = 36;
-- UPDATE menu_items SET display_order = 36 WHERE id = 182 AND display_order = 37;
-- UPDATE menu_items SET display_order = 37 WHERE id = 183 AND display_order = 38;
-- UPDATE menu_items SET display_order = 38 WHERE id = 184 AND display_order = 39;
-- UPDATE menu_items SET display_order = 39 WHERE id = 185 AND display_order = 40;
-- UPDATE menu_items SET display_order = 0 WHERE id = 229 AND display_order = 4;
-- UPDATE menu_items SET display_order = 0 WHERE id = 230 AND display_order = 2;
-- UPDATE menu_items SET display_order = 0 WHERE id = 231 AND display_order = 8;
-- UPDATE menu_items SET display_order = 0 WHERE id = 232 AND display_order = 9;
-- UPDATE menu_items SET display_order = 0 WHERE id = 233 AND display_order = 12;
-- UPDATE menu_items SET display_order = 0 WHERE id = 234 AND display_order = 5;
-- UPDATE menu_items SET display_order = 0 WHERE id = 235 AND display_order = 10;
-- UPDATE menu_items SET display_order = 0 WHERE id = 236 AND display_order = 3;
-- UPDATE menu_items SET display_order = 0 WHERE id = 237 AND display_order = 6;
-- UPDATE menu_items SET display_order = 0 WHERE id = 238 AND display_order = 28;
-- UPDATE menu_items SET display_order = 0 WHERE id = 239 AND display_order = 1;
-- UPDATE menu_items SET display_order = 0 WHERE id = 240 AND display_order = 7;
-- UPDATE menu_items SET display_order = 0 WHERE id = 241 AND display_order = 11;
-- UPDATE menu_items SET display_order = 0 WHERE id = 242 AND display_order = 1;
-- UPDATE menu_items SET display_order = 0 WHERE id = 243 AND display_order = 2;
-- UPDATE menu_items SET display_order = 0 WHERE id = 244 AND display_order = 1;
-- UPDATE menu_items SET display_order = 0 WHERE id = 245 AND display_order = 3;
-- UPDATE menu_items SET display_order = 0 WHERE id = 246 AND display_order = 4;
-- UPDATE menu_items SET display_order = 0 WHERE id = 247 AND display_order = 2;
-- UPDATE menu_items SET display_order = 0 WHERE id = 248 AND display_order = 3;
-- UPDATE menu_items SET display_order = 0 WHERE id = 249 AND display_order = 1;
-- UPDATE menu_items SET display_order = 0 WHERE id = 250 AND display_order = 2;
-- UPDATE menu_items SET display_order = 0 WHERE id = 251 AND display_order = 3;
-- UPDATE menu_items SET display_order = 0 WHERE id = 252 AND display_order = 1;
-- UPDATE menu_items SET display_order = 0 WHERE id = 253 AND display_order = 4;
-- UPDATE menu_items SET display_order = 0 WHERE id = 254 AND display_order = 5;
-- UPDATE menu_items SET display_order = 0 WHERE id = 255 AND display_order = 6;
-- UPDATE menu_items SET display_order = 0 WHERE id = 256 AND display_order = 7;
-- UPDATE menu_items SET display_order = 0 WHERE id = 257 AND display_order = 1;
-- UPDATE menu_items SET display_order = 0 WHERE id = 258 AND display_order = 2;
-- UPDATE menu_items SET display_order = 0 WHERE id = 259 AND display_order = 1;
-- COMMIT;
