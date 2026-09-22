# Proposed Missing Menu Items — 2026-09

Completeness-audit follow-up. **No DB changes.** Only missing items whose **name AND current handwritten menu price** are clearly established in the audit/source analysis are included. Ambiguous items, the unreadable fragment, and Beverages/Mocktails are excluded. No prices invented.

Verified against live `menu_items`: none of the 31 candidates exists (exact or similar dish). No exact matches found.

## 1. Biryani

Proposed Category: **Biryani's** — EXISTS in DB (id 11, active) → reuse, **NO new category required**.

| Proposed Category | Item Name | Price | Source/Card | Confidence |
|---|---|---:|---|---|
| Biryani's | Flavours Spl. Chicken Biryani | 360 | Card 6 | High |
| Biryani's | Chicken Pot Biryani | 430 | Card 6 | High |
| Biryani's | Mutton Dum Biryani (Sunday Only) | 450 | Card 6 | High |
| Biryani's | Mutton Ulavacharu Biryani | 460 | Card 6 | Medium |
| Biryani's | Spl Prawn Biryani | 400 | Card 6 | Medium |
| Biryani's | Gongura Prawn Biryani | 420 | Card 6 | High |
| Biryani's | Prawn Pot Biryani | 490 | Card 6 | High |
| Biryani's | Fish Biryani | 350 | Card 6 | High |
| Biryani's | Mixed Non-veg Biryani | 450 | Card 6 | High |
| Biryani's | Veg Biryani Family Pak | 580 | Card 6 | High |
| Biryani's | Chicken Dum Biryani Family Pak | 780 | Card 6 | High |
| Biryani's | Mutton Biryani Family Pak | 880 | Card 6 | High |
| Biryani's | Prawns Biryani Family Pak | 860 | Card 6 | High |

**NEW CATEGORY REQUIRED: No (reuses "Biryani's").**

## 2. Chinese Noodles

Proposed Category: **Chinese Noodles** — does NOT exist in DB → **NEW CATEGORY REQUIRED**.

| Proposed Category | Item Name | Price | Source/Card | Confidence |
|---|---|---:|---|---|
| Chinese Noodles | Veg Soft Noodles | 240 | Card 6 | High |

**NEW CATEGORY REQUIRED: Yes.**

## 3. Chinese Fried Rice

Proposed Category: **Chinese Fried Rice** — does NOT exist in DB → **NEW CATEGORY REQUIRED**.

| Proposed Category | Item Name | Price | Source/Card | Confidence |
|---|---|---:|---|---|
| Chinese Fried Rice | Spl / Mutton Fried Rice | 430 | Card 7 | Medium |
| Chinese Fried Rice | Prawn Fried Rice | 410 | Card 7 | High |
| Chinese Fried Rice | Spl Prawn Fried Rice | 420 | Card 7 | High |

**NEW CATEGORY REQUIRED: Yes.**

## 4. Chinese Veg Wet

Proposed Category: **Chinese Veg Wet** — does NOT exist in DB → **NEW CATEGORY REQUIRED**.

| Proposed Category | Item Name | Price | Source/Card | Confidence |
|---|---|---:|---|---|
| Chinese Veg Wet | Veg Manchurian Wet | 230 | Card 7 | High |
| Chinese Veg Wet | Chilly Mushroom Wet | 260 | Card 7 | High |
| Chinese Veg Wet | Paneer Manchurian Wet | 290 | Card 7 | High |
| Chinese Veg Wet | Baby Corn Manchurian Wet | 240 | Card 7 | High |

**NEW CATEGORY REQUIRED: Yes.**

Note: distinct from existing dry starters (Mushroom / Paneer / Baby Corn "65/Manchurian/Chilly" and "Veg Manchurian") — these are separate "Wet" dishes.

## 5. Chinese Non-Veg Wet

Proposed Category: **Chinese Non-Veg Wet** — does NOT exist in DB → **NEW CATEGORY REQUIRED**.

| Proposed Category | Item Name | Price | Source/Card | Confidence |
|---|---|---:|---|---|
| Chinese Non-Veg Wet | Chicken in Ginger Wet | 310 | Card 7 | High |
| Chinese Non-Veg Wet | Chicken Manchurian Wet | 310 | Card 7 | High |
| Chinese Non-Veg Wet | Chicken Chilly Wet | 310 | Card 7 | High |
| Chinese Non-Veg Wet | Chicken Schezwan Wet | 310 | Card 7 | High |
| Chinese Non-Veg Wet | Fish in Chilly Wet | 310 | Card 7 | High |
| Chinese Non-Veg Wet | Prawns in Chilly Wet | 340 | Card 7 | High |
| Chinese Non-Veg Wet | Prawns Manchurian Wet | 340 | Card 7 | High |

**NEW CATEGORY REQUIRED: Yes.**

Note: distinct from existing dry non-veg starters (Chilly Chicken, Chicken Manchurian, Schezwan Chicken, etc.) — these are separate "Wet" dishes.

## 6. Non-Veg Starters

Proposed Category: **Non-Veg Starters** — EXISTS in DB (id 15, active) → reuse, **NO new category required**.

| Proposed Category | Item Name | Price | Source/Card | Confidence |
|---|---|---:|---|---|
| Non-Veg Starters | Prawn Salt & Pepper | 400 | Card 2 | High |

**NEW CATEGORY REQUIRED: No (reuses "Non-Veg Starters").**

Note: distinct from existing "Mushroom (Salt&Pepper/Schezwan)" and "Baby Corn majestic/salt & Pepper" — separate dish.

## 7. South Indian

Proposed Category: **South Indian** — does NOT exist in DB → **NEW CATEGORY REQUIRED**.

| Proposed Category | Item Name | Price | Source/Card | Confidence |
|---|---|---:|---|---|
| South Indian | Veg Thali | 180 | Card 8 (handwritten) | High |
| South Indian | Sambar Rice | 130 | Card 8 (handwritten) | High |

**NEW CATEGORY REQUIRED: Yes.**

## 8. Other

No clear candidates. Excluded as ambiguous/no readable price: Beverages (Soda, Soft Drink, Tin Drinks, Mineral Water), Butter Milk, Lassi, Mocktails (6), and the unreadable fragment.

## Category rule check

- **Reusable existing categories:** "Biryani's" (id 11), "Non-Veg Starters" (id 15). Both active.
- **NEW CATEGORIES REQUIRED (not created, only flagged):** Chinese Noodles, Chinese Fried Rice, Chinese Veg Wet, Chinese Non-Veg Wet, South Indian → 5.
- No categories created. `Beverages` exists in DB (id 3) but is inactive (`is_active = 0`); not used here.

## Summary

CLEAR CANDIDATES: 31
NEW CATEGORIES REQUIRED: 5
AMBIGUOUS ITEMS EXCLUDED: 49
DATABASE MODIFIED: NO