-- =====================================================================================
-- MENU PRICE UPDATE SCRIPT - 2026-09
-- =====================================================================================
-- Source   : price_update_report.md (verified 2026-09)
-- Scope    : Exactly the 157 READY_TO_UPDATE menu items
-- Excluded : 32 NO_CHANGE items and 2 AMBIGUOUS items (IDs 70, 71) - NOT touched
--
-- SAFETY RULES
--   1. This script runs inside ONE transaction and contains NO automatic commit.
--      Nothing is persisted until you MANUALLY run  COMMIT;
--   2. Every UPDATE targets menu_items.id exactly and sets ONLY menu_items.price.
--      No other column (name, category_id, image_url, is_veg, is_available, etc.) is modified.
--   3. Every UPDATE is guarded by the report's "Current DB Price" (WHERE price = old).
--      If a row's price has drifted since the dump, that UPDATE affects 0 rows and the
--      mismatch is surfaced by the verification queries below instead of being overwritten.
--   4. Do NOT run  COMMIT;  until EVERY verification query below reports ZERO mismatches.
--   5. Before running, review the PRE-CHECK SELECT and compare each current price
--      against the "Current DB Price" column in price_update_report.md.
--
-- ROLLBACK STRATEGY
--   * All 157 UPDATEs run inside a single transaction. A single  ROLLBACK;  undoes ALL of them.
--   * Two independent rollback layers:
--       (a) transaction-level rollback (primary), and
--       (b) per-row price guard - any row whose actual price differs from the expected
--           old price is skipped (0 rows affected), so a drifted row cannot be overwritten.
--   * Because no COMMIT is issued automatically, an aborted or abandoned session rolls
--     back on disconnect - the database is never left half-updated.
--   * If a problem is detected only after COMMIT, restore prices to the values in the
--     report's "Current DB Price" column (that is the restoration value for every row).
-- =====================================================================================

USE restaurant_qr_db;

START TRANSACTION;

-- -------------------------------------------------------------------------------------
-- 1) PRE-CHECK - current prices of the 157 target IDs
--    Compare with "Current DB Price" in the report. STOP + ROLLBACK if any mismatch.
-- -------------------------------------------------------------------------------------
SELECT id, name, price AS current_db_price
FROM menu_items
WHERE id IN (7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 42, 43, 44, 48, 49, 50, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 73, 74, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191)
ORDER BY id;

-- -------------------------------------------------------------------------------------
-- 2) PRICE UPDATES (157) - set ONLY price, guarded by the report's current DB price
-- -------------------------------------------------------------------------------------
UPDATE menu_items SET price = 230.00 WHERE id = 7 AND price = 200.00;
UPDATE menu_items SET price = 270.00 WHERE id = 8 AND price = 240.00;
UPDATE menu_items SET price = 310.00 WHERE id = 9 AND price = 280.00;
UPDATE menu_items SET price = 310.00 WHERE id = 10 AND price = 280.00;
UPDATE menu_items SET price = 310.00 WHERE id = 11 AND price = 280.00;
UPDATE menu_items SET price = 320.00 WHERE id = 12 AND price = 290.00;
UPDATE menu_items SET price = 320.00 WHERE id = 13 AND price = 290.00;
UPDATE menu_items SET price = 320.00 WHERE id = 14 AND price = 290.00;
UPDATE menu_items SET price = 330.00 WHERE id = 15 AND price = 300.00;
UPDATE menu_items SET price = 370.00 WHERE id = 16 AND price = 340.00;
UPDATE menu_items SET price = 370.00 WHERE id = 17 AND price = 340.00;
UPDATE menu_items SET price = 360.00 WHERE id = 18 AND price = 330.00;
UPDATE menu_items SET price = 190.00 WHERE id = 19 AND price = 160.00;
UPDATE menu_items SET price = 310.00 WHERE id = 20 AND price = 280.00;
UPDATE menu_items SET price = 330.00 WHERE id = 21 AND price = 300.00;
UPDATE menu_items SET price = 320.00 WHERE id = 22 AND price = 290.00;
UPDATE menu_items SET price = 330.00 WHERE id = 23 AND price = 300.00;
UPDATE menu_items SET price = 330.00 WHERE id = 24 AND price = 300.00;
UPDATE menu_items SET price = 320.00 WHERE id = 25 AND price = 290.00;
UPDATE menu_items SET price = 320.00 WHERE id = 26 AND price = 290.00;
UPDATE menu_items SET price = 330.00 WHERE id = 27 AND price = 300.00;
UPDATE menu_items SET price = 330.00 WHERE id = 28 AND price = 300.00;
UPDATE menu_items SET price = 350.00 WHERE id = 29 AND price = 320.00;
UPDATE menu_items SET price = 330.00 WHERE id = 30 AND price = 300.00;
UPDATE menu_items SET price = 360.00 WHERE id = 31 AND price = 330.00;
UPDATE menu_items SET price = 360.00 WHERE id = 32 AND price = 330.00;
UPDATE menu_items SET price = 360.00 WHERE id = 33 AND price = 330.00;
UPDATE menu_items SET price = 390.00 WHERE id = 34 AND price = 360.00;
UPDATE menu_items SET price = 390.00 WHERE id = 35 AND price = 360.00;
UPDATE menu_items SET price = 410.00 WHERE id = 36 AND price = 380.00;
UPDATE menu_items SET price = 460.00 WHERE id = 37 AND price = 430.00;
UPDATE menu_items SET price = 350.00 WHERE id = 38 AND price = 320.00;
UPDATE menu_items SET price = 410.00 WHERE id = 39 AND price = 380.00;
UPDATE menu_items SET price = 390.00 WHERE id = 40 AND price = 360.00;
UPDATE menu_items SET price = 230.00 WHERE id = 42 AND price = 180.00;
UPDATE menu_items SET price = 250.00 WHERE id = 43 AND price = 220.00;
UPDATE menu_items SET price = 290.00 WHERE id = 44 AND price = 260.00;
UPDATE menu_items SET price = 360.00 WHERE id = 48 AND price = 330.00;
UPDATE menu_items SET price = 360.00 WHERE id = 49 AND price = 330.00;
UPDATE menu_items SET price = 350.00 WHERE id = 50 AND price = 320.00;
UPDATE menu_items SET price = 200.00 WHERE id = 53 AND price = 170.00;
UPDATE menu_items SET price = 200.00 WHERE id = 54 AND price = 170.00;
UPDATE menu_items SET price = 210.00 WHERE id = 55 AND price = 180.00;
UPDATE menu_items SET price = 210.00 WHERE id = 56 AND price = 180.00;
UPDATE menu_items SET price = 210.00 WHERE id = 57 AND price = 180.00;
UPDATE menu_items SET price = 230.00 WHERE id = 58 AND price = 200.00;
UPDATE menu_items SET price = 240.00 WHERE id = 59 AND price = 210.00;
UPDATE menu_items SET price = 230.00 WHERE id = 60 AND price = 200.00;
UPDATE menu_items SET price = 220.00 WHERE id = 61 AND price = 190.00;
UPDATE menu_items SET price = 220.00 WHERE id = 62 AND price = 190.00;
UPDATE menu_items SET price = 210.00 WHERE id = 63 AND price = 180.00;
UPDATE menu_items SET price = 240.00 WHERE id = 64 AND price = 210.00;
UPDATE menu_items SET price = 250.00 WHERE id = 65 AND price = 220.00;
UPDATE menu_items SET price = 270.00 WHERE id = 66 AND price = 240.00;
UPDATE menu_items SET price = 240.00 WHERE id = 67 AND price = 260.00;
UPDATE menu_items SET price = 290.00 WHERE id = 68 AND price = 280.00;
UPDATE menu_items SET price = 310.00 WHERE id = 69 AND price = 210.00;
UPDATE menu_items SET price = 310.00 WHERE id = 73 AND price = 220.00;
UPDATE menu_items SET price = 250.00 WHERE id = 74 AND price = 220.00;
UPDATE menu_items SET price = 100.00 WHERE id = 92 AND price = 70.00;
UPDATE menu_items SET price = 150.00 WHERE id = 93 AND price = 120.00;
UPDATE menu_items SET price = 210.00 WHERE id = 94 AND price = 180.00;
UPDATE menu_items SET price = 250.00 WHERE id = 95 AND price = 220.00;
UPDATE menu_items SET price = 260.00 WHERE id = 96 AND price = 230.00;
UPDATE menu_items SET price = 310.00 WHERE id = 97 AND price = 280.00;
UPDATE menu_items SET price = 330.00 WHERE id = 98 AND price = 300.00;
UPDATE menu_items SET price = 330.00 WHERE id = 99 AND price = 300.00;
UPDATE menu_items SET price = 330.00 WHERE id = 100 AND price = 300.00;
UPDATE menu_items SET price = 340.00 WHERE id = 101 AND price = 310.00;
UPDATE menu_items SET price = 370.00 WHERE id = 102 AND price = 340.00;
UPDATE menu_items SET price = 300.00 WHERE id = 103 AND price = 280.00;
UPDATE menu_items SET price = 320.00 WHERE id = 104 AND price = 300.00;
UPDATE menu_items SET price = 360.00 WHERE id = 107 AND price = 330.00;
UPDATE menu_items SET price = 390.00 WHERE id = 108 AND price = 360.00;
UPDATE menu_items SET price = 340.00 WHERE id = 109 AND price = 320.00;
UPDATE menu_items SET price = 350.00 WHERE id = 110 AND price = 330.00;
UPDATE menu_items SET price = 370.00 WHERE id = 111 AND price = 340.00;
UPDATE menu_items SET price = 390.00 WHERE id = 112 AND price = 360.00;
UPDATE menu_items SET price = 360.00 WHERE id = 113 AND price = 340.00;
UPDATE menu_items SET price = 390.00 WHERE id = 114 AND price = 360.00;
UPDATE menu_items SET price = 390.00 WHERE id = 115 AND price = 360.00;
UPDATE menu_items SET price = 350.00 WHERE id = 116 AND price = 240.00;
UPDATE menu_items SET price = 350.00 WHERE id = 117 AND price = 280.00;
UPDATE menu_items SET price = 130.00 WHERE id = 118 AND price = 100.00;
UPDATE menu_items SET price = 130.00 WHERE id = 119 AND price = 100.00;
UPDATE menu_items SET price = 150.00 WHERE id = 120 AND price = 120.00;
UPDATE menu_items SET price = 130.00 WHERE id = 121 AND price = 100.00;
UPDATE menu_items SET price = 130.00 WHERE id = 122 AND price = 100.00;
UPDATE menu_items SET price = 130.00 WHERE id = 123 AND price = 100.00;
UPDATE menu_items SET price = 150.00 WHERE id = 124 AND price = 120.00;
UPDATE menu_items SET price = 130.00 WHERE id = 125 AND price = 100.00;
UPDATE menu_items SET price = 150.00 WHERE id = 126 AND price = 120.00;
UPDATE menu_items SET price = 150.00 WHERE id = 127 AND price = 120.00;
UPDATE menu_items SET price = 150.00 WHERE id = 128 AND price = 120.00;
UPDATE menu_items SET price = 160.00 WHERE id = 129 AND price = 130.00;
UPDATE menu_items SET price = 150.00 WHERE id = 130 AND price = 120.00;
UPDATE menu_items SET price = 150.00 WHERE id = 131 AND price = 120.00;
UPDATE menu_items SET price = 150.00 WHERE id = 132 AND price = 120.00;
UPDATE menu_items SET price = 160.00 WHERE id = 133 AND price = 130.00;
UPDATE menu_items SET price = 160.00 WHERE id = 134 AND price = 130.00;
UPDATE menu_items SET price = 250.00 WHERE id = 135 AND price = 220.00;
UPDATE menu_items SET price = 250.00 WHERE id = 136 AND price = 220.00;
UPDATE menu_items SET price = 280.00 WHERE id = 137 AND price = 250.00;
UPDATE menu_items SET price = 280.00 WHERE id = 138 AND price = 250.00;
UPDATE menu_items SET price = 250.00 WHERE id = 139 AND price = 220.00;
UPDATE menu_items SET price = 280.00 WHERE id = 140 AND price = 250.00;
UPDATE menu_items SET price = 260.00 WHERE id = 141 AND price = 230.00;
UPDATE menu_items SET price = 260.00 WHERE id = 142 AND price = 230.00;
UPDATE menu_items SET price = 290.00 WHERE id = 143 AND price = 260.00;
UPDATE menu_items SET price = 330.00 WHERE id = 144 AND price = 300.00;
UPDATE menu_items SET price = 350.00 WHERE id = 145 AND price = 320.00;
UPDATE menu_items SET price = 250.00 WHERE id = 146 AND price = 220.00;
UPDATE menu_items SET price = 330.00 WHERE id = 147 AND price = 300.00;
UPDATE menu_items SET price = 330.00 WHERE id = 148 AND price = 300.00;
UPDATE menu_items SET price = 330.00 WHERE id = 149 AND price = 300.00;
UPDATE menu_items SET price = 350.00 WHERE id = 150 AND price = 300.00;
UPDATE menu_items SET price = 350.00 WHERE id = 151 AND price = 320.00;
UPDATE menu_items SET price = 370.00 WHERE id = 152 AND price = 320.00;
UPDATE menu_items SET price = 350.00 WHERE id = 153 AND price = 340.00;
UPDATE menu_items SET price = 370.00 WHERE id = 154 AND price = 320.00;
UPDATE menu_items SET price = 330.00 WHERE id = 155 AND price = 340.00;
UPDATE menu_items SET price = 330.00 WHERE id = 156 AND price = 300.00;
UPDATE menu_items SET price = 330.00 WHERE id = 157 AND price = 300.00;
UPDATE menu_items SET price = 330.00 WHERE id = 158 AND price = 300.00;
UPDATE menu_items SET price = 360.00 WHERE id = 159 AND price = 330.00;
UPDATE menu_items SET price = 350.00 WHERE id = 160 AND price = 320.00;
UPDATE menu_items SET price = 390.00 WHERE id = 161 AND price = 360.00;
UPDATE menu_items SET price = 380.00 WHERE id = 162 AND price = 350.00;
UPDATE menu_items SET price = 360.00 WHERE id = 163 AND price = 330.00;
UPDATE menu_items SET price = 350.00 WHERE id = 164 AND price = 320.00;
UPDATE menu_items SET price = 370.00 WHERE id = 165 AND price = 340.00;
UPDATE menu_items SET price = 370.00 WHERE id = 166 AND price = 340.00;
UPDATE menu_items SET price = 350.00 WHERE id = 167 AND price = 320.00;
UPDATE menu_items SET price = 390.00 WHERE id = 168 AND price = 360.00;
UPDATE menu_items SET price = 400.00 WHERE id = 169 AND price = 370.00;
UPDATE menu_items SET price = 400.00 WHERE id = 170 AND price = 370.00;
UPDATE menu_items SET price = 360.00 WHERE id = 171 AND price = 330.00;
UPDATE menu_items SET price = 310.00 WHERE id = 172 AND price = 280.00;
UPDATE menu_items SET price = 350.00 WHERE id = 173 AND price = 320.00;
UPDATE menu_items SET price = 360.00 WHERE id = 174 AND price = 330.00;
UPDATE menu_items SET price = 310.00 WHERE id = 175 AND price = 280.00;
UPDATE menu_items SET price = 390.00 WHERE id = 176 AND price = 360.00;
UPDATE menu_items SET price = 330.00 WHERE id = 177 AND price = 300.00;
UPDATE menu_items SET price = 330.00 WHERE id = 178 AND price = 300.00;
UPDATE menu_items SET price = 330.00 WHERE id = 179 AND price = 320.00;
UPDATE menu_items SET price = 350.00 WHERE id = 180 AND price = 300.00;
UPDATE menu_items SET price = 330.00 WHERE id = 181 AND price = 340.00;
UPDATE menu_items SET price = 370.00 WHERE id = 182 AND price = 360.00;
UPDATE menu_items SET price = 390.00 WHERE id = 183 AND price = 360.00;
UPDATE menu_items SET price = 390.00 WHERE id = 184 AND price = 360.00;
UPDATE menu_items SET price = 390.00 WHERE id = 185 AND price = 370.00;
UPDATE menu_items SET price = 300.00 WHERE id = 186 AND price = 270.00;
UPDATE menu_items SET price = 320.00 WHERE id = 187 AND price = 290.00;
UPDATE menu_items SET price = 320.00 WHERE id = 188 AND price = 290.00;
UPDATE menu_items SET price = 360.00 WHERE id = 189 AND price = 330.00;
UPDATE menu_items SET price = 440.00 WHERE id = 190 AND price = 410.00;
UPDATE menu_items SET price = 470.00 WHERE id = 191 AND price = 440.00;

-- -------------------------------------------------------------------------------------
-- 3) VERIFICATION (run ALL of these before deciding to commit)
-- -------------------------------------------------------------------------------------
-- 3.1) Load the expected target prices (id -> expected_new_price) for the 157 items.
--      This table is session-local and does not touch menu_items.
-- -------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE tmp_expected_new_price (
    id INT PRIMARY KEY,
    expected_new_price DECIMAL(10,2) NOT NULL
);

INSERT INTO tmp_expected_new_price (id, expected_new_price) VALUES
    (7, 230.00),
    (8, 270.00),
    (9, 310.00),
    (10, 310.00),
    (11, 310.00),
    (12, 320.00),
    (13, 320.00),
    (14, 320.00),
    (15, 330.00),
    (16, 370.00),
    (17, 370.00),
    (18, 360.00),
    (19, 190.00),
    (20, 310.00),
    (21, 330.00),
    (22, 320.00),
    (23, 330.00),
    (24, 330.00),
    (25, 320.00),
    (26, 320.00),
    (27, 330.00),
    (28, 330.00),
    (29, 350.00),
    (30, 330.00),
    (31, 360.00),
    (32, 360.00),
    (33, 360.00),
    (34, 390.00),
    (35, 390.00),
    (36, 410.00),
    (37, 460.00),
    (38, 350.00),
    (39, 410.00),
    (40, 390.00),
    (42, 230.00),
    (43, 250.00),
    (44, 290.00),
    (48, 360.00),
    (49, 360.00),
    (50, 350.00),
    (53, 200.00),
    (54, 200.00),
    (55, 210.00),
    (56, 210.00),
    (57, 210.00),
    (58, 230.00),
    (59, 240.00),
    (60, 230.00),
    (61, 220.00),
    (62, 220.00),
    (63, 210.00),
    (64, 240.00),
    (65, 250.00),
    (66, 270.00),
    (67, 240.00),
    (68, 290.00),
    (69, 310.00),
    (73, 310.00),
    (74, 250.00),
    (92, 100.00),
    (93, 150.00),
    (94, 210.00),
    (95, 250.00),
    (96, 260.00),
    (97, 310.00),
    (98, 330.00),
    (99, 330.00),
    (100, 330.00),
    (101, 340.00),
    (102, 370.00),
    (103, 300.00),
    (104, 320.00),
    (107, 360.00),
    (108, 390.00),
    (109, 340.00),
    (110, 350.00),
    (111, 370.00),
    (112, 390.00),
    (113, 360.00),
    (114, 390.00),
    (115, 390.00),
    (116, 350.00),
    (117, 350.00),
    (118, 130.00),
    (119, 130.00),
    (120, 150.00),
    (121, 130.00),
    (122, 130.00),
    (123, 130.00),
    (124, 150.00),
    (125, 130.00),
    (126, 150.00),
    (127, 150.00),
    (128, 150.00),
    (129, 160.00),
    (130, 150.00),
    (131, 150.00),
    (132, 150.00),
    (133, 160.00),
    (134, 160.00),
    (135, 250.00),
    (136, 250.00),
    (137, 280.00),
    (138, 280.00),
    (139, 250.00),
    (140, 280.00),
    (141, 260.00),
    (142, 260.00),
    (143, 290.00),
    (144, 330.00),
    (145, 350.00),
    (146, 250.00),
    (147, 330.00),
    (148, 330.00),
    (149, 330.00),
    (150, 350.00),
    (151, 350.00),
    (152, 370.00),
    (153, 350.00),
    (154, 370.00),
    (155, 330.00),
    (156, 330.00),
    (157, 330.00),
    (158, 330.00),
    (159, 360.00),
    (160, 350.00),
    (161, 390.00),
    (162, 380.00),
    (163, 360.00),
    (164, 350.00),
    (165, 370.00),
    (166, 370.00),
    (167, 350.00),
    (168, 390.00),
    (169, 400.00),
    (170, 400.00),
    (171, 360.00),
    (172, 310.00),
    (173, 350.00),
    (174, 360.00),
    (175, 310.00),
    (176, 390.00),
    (177, 330.00),
    (178, 330.00),
    (179, 330.00),
    (180, 350.00),
    (181, 330.00),
    (182, 370.00),
    (183, 390.00),
    (184, 390.00),
    (185, 390.00),
    (186, 300.00),
    (187, 320.00),
    (188, 320.00),
    (189, 360.00),
    (190, 440.00),
    (191, 470.00)
;

-- -------------------------------------------------------------------------------------
-- 3.2) MISMATCH CHECK - any target ID whose resulting price does NOT equal the expected
--      new price. This should return ZERO rows. If any row appears, RUN ROLLBACK;
-- -------------------------------------------------------------------------------------
SELECT t.id, mi.name AS item_name,
       mi.price AS actual_price, t.expected_new_price
FROM tmp_expected_new_price t
LEFT JOIN menu_items mi ON mi.id = t.id
WHERE mi.price IS NULL OR mi.price <> t.expected_new_price
ORDER BY t.id;

-- -------------------------------------------------------------------------------------
-- 3.3) COUNT CHECK - exactly 157 target IDs must hold their expected new price.
--      Should return 157. If less, RUN ROLLBACK;
-- -------------------------------------------------------------------------------------
SELECT COUNT(*) AS target_ids_with_expected_price
FROM tmp_expected_new_price t
JOIN menu_items mi ON mi.id = t.id AND mi.price = t.expected_new_price;

-- -------------------------------------------------------------------------------------
-- 3.4) AMBIGUOUS ITEMS GUARD - IDs 70 and 71 must remain untouched.
--      Expect exactly: 70 -> 200.00  and  71 -> 250.00. Anything else: RUN ROLLBACK;
-- -------------------------------------------------------------------------------------
SELECT id, name, price AS untouched_price
FROM menu_items
WHERE id IN (70, 71)
ORDER BY id;

-- -------------------------------------------------------------------------------------
-- 3.5) FULL RESULT - IDs 7..197 with resulting prices (hand-verify against the report)
-- -------------------------------------------------------------------------------------
SELECT id, name, price AS resulting_price
FROM menu_items
WHERE id BETWEEN 7 AND 197
ORDER BY id;

-- -------------------------------------------------------------------------------------
-- 3.6) Cleanup the session-local map (safe to run at any point)
-- -------------------------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS tmp_expected_new_price;

-- =====================================================================================
-- 4) FINAL DECISION - MANUAL ONLY (no automatic commit anywhere in this script)
--    Only execute COMMIT; after ALL verification queries above show ZERO mismatches:
--        * 3.2 returns 0 rows
--        * 3.3 returns 157
--        * 3.4 shows exactly 200.00 / 250.00 for IDs 70 / 71
--    To apply the updates :  uncomment the line below   =>   COMMIT;
--    To discard the updates: uncomment the line below   =>   ROLLBACK;
-- =====================================================================================
-- COMMIT;
-- ROLLBACK;
