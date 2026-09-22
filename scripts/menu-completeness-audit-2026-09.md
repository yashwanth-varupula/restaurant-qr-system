# Menu Completeness Audit — 2026-09

Read-only audit. Nothing in this file modifies the database, `menu_items`, prices, or SQL files.

## 1. Current active menu item count

- **191 active menu items** (IDs 7–197, 15 active categories) — confirmed by live read-only query against `menu_items` (`is_available = 1`).
- Matches `database/real-menu.sql` (191 items) and `menu_items_dump.json`.

## 2–6. Physical-menu items MISSING from the database

Source: recorded prior analysis of the 9 menu-card images (session transcripts under `~/.gemini/antigravity/brain/13a66dc7-4866-4b95-83d3-1810e95036a0`). Prices below are the clearly-read handwritten (current) menu price. Where no price could be determined confidently, the item is marked **AMBIGUOUS**. No values guessed.

### Biryani's (Card 6 continuation) — missing: 20

| Item | Price (INR) |
|------|-------------|
| Flavours Spl. Chicken Biryani | 360 |
| Chicken Pot Biryani | 430 |
| Mutton Fry Biryani | AMBIGUOUS |
| Spl Mutton Biryani | AMBIGUOUS |
| Mutton Biryani | AMBIGUOUS |
| Mutton Dum Biryani (Sunday Only) | 450 |
| Mutton Ulavacharu Biryani | 460 |
| Mutton Keema Biryani | AMBIGUOUS |
| Gongura Mutton Biryani | AMBIGUOUS |
| Mutton Pot Biryani | AMBIGUOUS |
| Prawn Biryani | AMBIGUOUS |
| Spl Prawn Biryani | 400 |
| Gongura Prawn Biryani | 420 |
| Prawn Pot Biryani | 490 |
| Fish Biryani | 350 |
| Mixed Non-veg Biryani | 450 |
| Veg Biryani Family Pak | 580 |
| Chicken Dum Biryani Family Pak | 780 |
| Mutton Biryani Family Pak | 880 |
| Prawns Biryani Family Pak | 860 |

### Chinese — Noodles (Card 6) — missing: 10

| Item | Price (INR) |
|------|-------------|
| Veg Soft Noodles | 240 |
| Veg Chilly Garlic Noodles | AMBIGUOUS |
| Egg Soft Noodles | AMBIGUOUS |
| Hakka Noodles | AMBIGUOUS |
| Schezwan Noodles | AMBIGUOUS |
| Chicken Soft Noodles | AMBIGUOUS |
| Prawn Soft Noodles | AMBIGUOUS |
| Mixed Noodles | AMBIGUOUS |
| American Chopsuey | AMBIGUOUS |
| Chinese Chopsuey | AMBIGUOUS |

### Chinese — Fried Rice (Cards 6–7) — missing: 22

| Item | Price (INR) |
|------|-------------|
| Jeera Rice | AMBIGUOUS |
| Veg Fried Rice | AMBIGUOUS |
| Spl. Veg Fried Rice | AMBIGUOUS |
| Hakka Fried Rice | AMBIGUOUS |
| Mushroom Fried Rice | AMBIGUOUS |
| Tripple Schezwan Fried Rice | AMBIGUOUS |
| Ginger Capsicum Fried Rice | AMBIGUOUS |
| Paneer Veg Fried Rice | AMBIGUOUS |
| Corn Fried Rice | AMBIGUOUS |
| Kaju Fried Rice | AMBIGUOUS |
| Veg Manchurian Fried Rice | AMBIGUOUS |
| Mixed Veg Fried Rice | AMBIGUOUS |
| Tomato Coriander Fried Rice | AMBIGUOUS |
| Egg Fried Rice / More Egg | AMBIGUOUS |
| Schezwan Fried Rice (Veg/Egg/Chicken) | AMBIGUOUS |
| Chicken Fried Rice / More Egg | AMBIGUOUS |
| Special Chicken Fried Rice | AMBIGUOUS |
| Chicken Manchurian Fried Rice | AMBIGUOUS |
| Mixed Fried Rice (Non-veg/Schezwan) | AMBIGUOUS |
| Spl / Mutton Fried Rice | 430 |
| Prawn Fried Rice | 410 |
| Spl Prawn Fried Rice | 420 |

### Chinese — Veg Wet (Card 7) — missing: 5

| Item | Price (INR) |
|------|-------------|
| Veg Manchurian Wet | 230 |
| Chilly Mushroom Wet | 260 |
| Paneer Manchurian Wet | 290 |
| Schezwan Veg Wet | AMBIGUOUS |
| Baby Corn Manchurian Wet | 240 |

### Chinese — Non-Veg Wet (Card 7) — missing: 7

| Item | Price (INR) |
|------|-------------|
| Chicken in Ginger Wet | 310 |
| Chicken Manchurian Wet | 310 |
| Chicken Chilly Wet | 310 |
| Chicken Schezwan Wet | 310 |
| Fish in Chilly Wet | 310 |
| Prawns in Chilly Wet | 340 |
| Prawns Manchurian Wet | 340 |

### Non-Veg Starters (Card 2) — missing: 1

| Item | Price (INR) |
|------|-------------|
| Prawn Salt & Pepper | 400 |

### Beverages (Cards 8–9) — missing: 4 (no printed/handwritten prices on card)

| Item | Price (INR) |
|------|-------------|
| Soda | AMBIGUOUS |
| Soft Drink | AMBIGUOUS |
| Tin Drinks | AMBIGUOUS |
| Mineral Water | AMBIGUOUS |

### Beverages — handwritten additions (Cards 8–9) — missing: 2

| Item | Price (INR) |
|------|-------------|
| Butter Milk | AMBIGUOUS |
| Lassi | AMBIGUOUS |

### South Indian — handwritten additions (Card 8) — missing: 2

| Item | Price (INR) |
|------|-------------|
| Veg Thali | 180 |
| Sambar Rice | 130 |

Note: additional handwritten South Indian lines may exist on the cards but were not readable in the recorded analysis; not counted.

### Mocktails — handwritten additions (Card 9) — missing: 6 (individual prices not determinable; recorded range ~80–206)

| Item | Price (INR) |
|------|-------------|
| Blue Curacao | AMBIGUOUS |
| Mojito | AMBIGUOUS |
| Lime | AMBIGUOUS |
| Kiwi | AMBIGUOUS |
| Blue Berry | AMBIGUOUS |
| Fresh Lime Soda | AMBIGUOUS |

### Unidentifiable fragments (Cards 5/6) — missing: 1

| Item | Price (INR) |
|------|-------------|
| Unreadable fragment ("Veer)" / partial line) | AMBIGUOUS |

## Summary

- Missing (physical-menu items not in DB): **80**
- Ambiguous (price/name not determinable — not guessed): **49**
- Already in DB (physical-menu items matching the 191 active DB records): **191**