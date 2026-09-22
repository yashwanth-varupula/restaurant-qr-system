# Add Clear Missing Menu Items - 2026-09 (Migration Prepared for Review)

**Status:** SQL migration prepared for review only — **NOT executed**.
**Files produced:**
- `scripts/add-clear-missing-menu-items-2026-09.sql` (the migration, review-only)
- `scripts/menu-completeness-audit-2026-09.md` (audit: 191 active items, 80 missing, 49 ambiguous)
- `scripts/proposed-missing-menu-items-2026-09.md` (proposal with 31 clear candidates)

## Scope
- **Exactly 31 brand-new menu items** added.
- **Exactly 5 new categories** created.
- Exactly **2 existing active categories reused** (no new category for them).
- Everything non-clear (49 ambiguous items, Beverages, Mocktails, unreadable fragment,
  existing 191 items, IDs 70/71) is **excluded**.
- The 157-price update SQL (`scripts/update-menu-prices-2026-09.sql`) is **untouched**.

## Safety design of the SQL
- Single `START TRANSACTION` with **no auto-commit**; the file ends with a manual
  `COMMIT;` / `ROLLBACK;` decision point.
- **Idempotent inserts only** — every INSERT is guarded with `NOT EXISTS`:
  - categories: guarded by `(restaurant_id, name)`
  - menu_items: guarded by `(category_id, name)`
  - Re-running after a successful apply changes 0 rows.
- **No hard-coded IDs anywhere.** Category resolved by name; item ID via AUTO_INCREMENT.
- No `UPDATE` / `DELETE` statements in the file.
- Every price is the **handwritten (current) menu price** from the proposal, unchanged.

## Categories
| Category | Action | Source |
|---|---|---|
| Biryani's (existing) | Reused | id 11 (active), 13 items |
| Chinese Noodles | **New** | 1 item |
| Chinese Fried Rice | **New** | 3 items |
| Chinese Veg Wet | **New** | 4 items |
| Chinese Non-Veg Wet | **New** | 7 items |
| Non-Veg Starters (existing) | Reused | id 15 (active), 1 item |
| South Indian | **New** | 2 items |

New categories get AUTO_INCREMENT IDs (currently `categories` next = 19, so expected
19–23; not hard-coded in SQL and not guaranteed).

## The 31 items (exact names and prices)
Category names match the SQL's category-by-name lookup.

| # | Category | Item (exact) | Price | is_veg | Confidence |
|---|---|---|---|---|---|
| 1 | Biryani's | Flavours Spl. Chicken Biryani | 360 | N | High |
| 2 | Biryani's | Chicken Pot Biryani | 430 | N | High |
| 3 | Biryani's | Mutton Dum Biryani (Sunday Only) | 450 | N | High |
| 4 | Biryani's | Mutton Ulavacharu Biryani | 460 | N | Medium |
| 5 | Biryani's | Spl Prawn Biryani | 400 | N | Medium |
| 6 | Biryani's | Gongura Prawn Biryani | 420 | N | High |
| 7 | Biryani's | Prawn Pot Biryani | 490 | N | High |
| 8 | Biryani's | Fish Biryani | 350 | N | High |
| 9 | Biryani's | Mixed Non-veg Biryani | 450 | N | High |
| 10 | Biryani's | Veg Biryani Family Pak | 580 | Y | High |
| 11 | Biryani's | Chicken Dum Biryani Family Pak | 780 | N | High |
| 12 | Biryani's | Mutton Biryani Family Pak | 880 | N | High |
| 13 | Biryani's | Prawns Biryani Family Pak | 860 | N | High |
| 14 | Chinese Noodles | Veg Soft Noodles | 240 | Y | High |
| 15 | Chinese Fried Rice | Spl / Mutton Fried Rice | 430 | N | Medium |
| 16 | Chinese Fried Rice | Prawn Fried Rice | 410 | N | High |
| 17 | Chinese Fried Rice | Spl Prawn Fried Rice | 420 | N | High |
| 18 | Chinese Veg Wet | Veg Manchurian Wet | 230 | Y | High |
| 19 | Chinese Veg Wet | Chilly Mushroom Wet | 260 | Y | High |
| 20 | Chinese Veg Wet | Paneer Manchurian Wet | 290 | Y | High |
| 21 | Chinese Veg Wet | Baby Corn Manchurian Wet | 240 | Y | High |
| 22 | Chinese Non-Veg Wet | Chicken in Ginger Wet | 310 | N | High |
| 23 | Chinese Non-Veg Wet | Chicken Manchurian Wet | 310 | N | High |
| 24 | Chinese Non-Veg Wet | Chicken Chilly Wet | 310 | N | High |
| 25 | Chinese Non-Veg Wet | Chicken Schezwan Wet | 310 | N | High |
| 26 | Chinese Non-Veg Wet | Fish in Chilly Wet | 310 | N | High |
| 27 | Chinese Non-Veg Wet | Prawns in Chilly Wet | 340 | N | High |
| 28 | Chinese Non-Veg Wet | Prawns Manchurian Wet | 340 | N | High |
| 29 | Non-Veg Starters | Prawn Salt & Pepper | 400 | N | High |
| 30 | South Indian | Veg Thali | 180 | Y | High |
| 31 | South Indian | Sambar Rice | 130 | Y | High |

Counts: Biryani's 13 + Chinese Noodles 1 + Chinese Fried Rice 3 + Chinese Veg Wet 4
+ Chinese Non-Veg Wet 7 + Non-Veg Starters 1 + South Indian 2 = **31**.

## SQL structure
1. **0) Pre-check** (read-only) — active/total counts (expect 191), IDs 70/71 untouched
   (expect 200 / 250), the 5 new categories absent, reused categories active.
2. **1) Create 5 categories** — idempotent `INSERT ... SELECT ... NOT EXISTS`, display_order
   appended after current max.
3. **2) Insert 31 items** — category resolved by name, `is_veg` from dish contents,
   `is_available = 1`, `display_order = 0`, idempotent `NOT EXISTS`.
4. **3) Verification** — 5 categories present; active count 191 → 222; every new item placed
   in the intended category; price/is_veg cross-check verbatim from this report
   (`expected_price` vs `actual_price`); duplicate-name checks (expect 0).
5. **4) Finalize** — manual `COMMIT;` / `ROLLBACK;` decision point.

## Steps to apply (later, from an interactive client)
1. Open an interactive MySQL session and run the file.
2. Confirm every verification result matches the expected values above.
3. Run `COMMIT;` to persist, or `ROLLBACK;` to discard.

## Expected result after apply
- Active menu items: 191 → **222**
- Total menu items: 191 → **222**
- Active categories: 15 → **20** (5 new active)
- New menu item IDs: AUTO_INCREMENT from 198 (current next); not specified in SQL

## Verification status today
- [x] menu_items / categories column defaults, FKs, AUTO_INCREMENT inspected (read-only)
  - `menu_items.category_id -> categories.id` (ON DELETE RESTRICT)
  - `categories` AUTO_INCREMENT next = 19; `menu_items` AUTO_INCREMENT next = 198
  - No unique constraint on `(category_id, name)` → NOT EXISTS guards are the safety net
  - restaurant id 1 = "The Mobile Bistro", currency INR
- [x] All 31 names absent from live DB
- [x] IDs 70/71 present at 200/250 (guarded)
- [ ] SQL executed and verified against DB (NOT DONE by design)