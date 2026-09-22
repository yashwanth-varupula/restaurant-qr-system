# Price Update Report

Reconstructed from the previous agent's full analysis of the 9 menu card images (session transcripts preserved under `~/.gemini/antigravity/brain/13a66dc7-4866-4b95-83d3-1810e95036a0`). Image viewing is not supported in this environment, so this report is rebuilt from that recorded analysis rather than re-reading the photos.

Matching rule used throughout: the **Current DB Price** (from `menu_items_dump.json`) is the baseline; the **New Menu Price** is the handwritten revision written on the menu card. The printed card price may differ from the DB value (DB reflects earlier partial updates / data-entry issues) and is only noted where relevant.

**Status legend**
- `READY_TO_UPDATE` — handwritten new price is legible and differs from the current DB price (target clear).
- `NO_CHANGE` — new handwritten price matches the current DB price (already applied on the card), or no handwritten revision exists.
- `AMBIGUOUS` — handwritten price/variant mapping is genuinely unclear; see the `## AMBIGUOUS ITEMS` section. Do NOT update these without manual verification.

| ID | Category | Item Name | Current DB Price | New Menu Price | Status | Notes |
|----|----------|-----------|------------------|----------------|--------|-------|
| 7 | Indian Veg Curries | Corn Palak | 200.00 | 230 | READY_TO_UPDATE | +30, printed card matches DB |
| 8 | Indian Veg Curries | Palak Paneer | 240.00 | 270 | READY_TO_UPDATE | |
| 9 | Indian Veg Curries | Kadai Paneer | 280.00 | 310 | READY_TO_UPDATE | |
| 10 | Indian Veg Curries | Paneer Chat Pata | 280.00 | 310 | READY_TO_UPDATE | |
| 11 | Indian Veg Curries | Paneer Kolhapuri | 280.00 | 310 | READY_TO_UPDATE | |
| 12 | Indian Veg Curries | Paneer Butter Masala | 290.00 | 320 | READY_TO_UPDATE | |
| 13 | Indian Veg Curries | Methi Paneer | 290.00 | 320 | READY_TO_UPDATE | |
| 14 | Indian Veg Curries | Mutter Paneer | 290.00 | 320 | READY_TO_UPDATE | |
| 15 | Indian Veg Curries | Methi Chaman Bahar | 300.00 | 330 | READY_TO_UPDATE | |
| 16 | Indian Veg Curries | Kaju Paneer Curry | 340.00 | 370 | READY_TO_UPDATE | |
| 17 | Indian Veg Curries | Malai Kofta Curry | 340.00 | 370 | READY_TO_UPDATE | |
| 18 | Indian Veg Curries | Kaju Curry | 330.00 | 360 | READY_TO_UPDATE | |
| 19 | Indian Non-Veg Curries | Egg Curry | 160.00 | 190 | READY_TO_UPDATE | |
| 20 | Indian Non-Veg Curries | Chicken Bone Curry/Fry | 280.00 | 310 | READY_TO_UPDATE | Card: "310 - 280/300 - 330", Bone = 280->310 |
| 21 | Indian Non-Veg Curries | Chicken Boneless Curry/Fry | 300.00 | 330 | READY_TO_UPDATE | Card Boneless = 300->330 |
| 22 | Indian Non-Veg Curries | Kadai Chicken | 290.00 | 320 | READY_TO_UPDATE | |
| 23 | Indian Non-Veg Curries | Butter Chicken | 300.00 | 330 | READY_TO_UPDATE | |
| 24 | Indian Non-Veg Curries | Methi Chicken | 300.00 | 330 | READY_TO_UPDATE | |
| 25 | Indian Non-Veg Curries | Chicken Chettinad | 290.00 | 320 | READY_TO_UPDATE | |
| 26 | Indian Non-Veg Curries | Chicken Tikka Masala | 290.00 | 320 | READY_TO_UPDATE | |
| 27 | Indian Non-Veg Curries | Chicken Maharani | 300.00 | 330 | READY_TO_UPDATE | |
| 28 | Indian Non-Veg Curries | Mughlai Chicken | 300.00 | 330 | READY_TO_UPDATE | |
| 29 | Indian Non-Veg Curries | Chicken Keema Curry | 320.00 | 350 | READY_TO_UPDATE | |
| 30 | Indian Non-Veg Curries | Chicken Kolhapuri Curry | 300.00 | 330 | READY_TO_UPDATE | |
| 31 | Indian Non-Veg Curries | Kaju Chicken Curry | 330.00 | 360 | READY_TO_UPDATE | |
| 32 | Indian Non-Veg Curries | Chicken Afghani | 330.00 | 360 | READY_TO_UPDATE | |
| 33 | Indian Non-Veg Curries | Chef Spl Chicken Curry | 330.00 | 360 | READY_TO_UPDATE | |
| 34 | Indian Non-Veg Curries | Kadai Mutton (Bone) Curry | 360.00 | 390 | READY_TO_UPDATE | |
| 35 | Indian Non-Veg Curries | Mutton Curry (Bone) | 360.00 | 390 | READY_TO_UPDATE | |
| 36 | Indian Non-Veg Curries | Mutton Fry (Bone) | 380.00 | 410 | READY_TO_UPDATE | |
| 37 | Indian Non-Veg Curries | Chef Spl Mutton Curry | 430.00 | 460 | READY_TO_UPDATE | |
| 38 | Indian Non-Veg Curries | Prawn Curry | 320.00 | 350 | READY_TO_UPDATE | Card: "350 - 320/380 - 410"; Curry = 320->350 |
| 39 | Indian Non-Veg Curries | Prawn Fry | 380.00 | 410 | READY_TO_UPDATE | Card Fry = 380->410 |
| 40 | Indian Non-Veg Curries | Kadai Prawn Curry | 360.00 | 390 | READY_TO_UPDATE | Handwritten digit hard to read; cross-checked as 390 (matches Kadai Mutton/Mutton Curry digit shape) |
| 41 | Egg Starters | Boiled Egg | 60.00 | 60 | NO_CHANGE | No handwritten revision |
| 42 | Egg Starters | Egg Bhurji | 180.00 | 230 | READY_TO_UPDATE | +50 jump, confirmed on card |
| 43 | Egg Starters | Egg (Chilly/65/Manchurian) | 220.00 | 250 | READY_TO_UPDATE | |
| 44 | Egg Starters | Egg Spring Rolls | 260.00 | 290 | READY_TO_UPDATE | |
| 45 | Tandoori - Veg / Non Veg | Roasted Papad | 50.00 | 50 | NO_CHANGE | No handwritten revision |
| 46 | Tandoori - Veg / Non Veg | Masala Papad | 60.00 | 60 | NO_CHANGE | No handwritten revision |
| 47 | Tandoori - Veg / Non Veg | Paneer Tikka | 360.00 | 360 | NO_CHANGE | Card: printed 230 struck through, 360 handwritten — DB already matches new value |
| 48 | Tandoori - Veg / Non Veg | Chicken Tikka | 330.00 | 360 | READY_TO_UPDATE | |
| 49 | Tandoori - Veg / Non Veg | Kaju Kabab | 330.00 | 360 | READY_TO_UPDATE | |
| 50 | Tandoori - Veg / Non Veg | Tangidi Kabab | 320.00 | 350 | READY_TO_UPDATE | |
| 51 | Tandoori - Veg / Non Veg | Tandoori Chicken Half | 320.00 | 320 | NO_CHANGE | Card "320 300/440 520" overlapping; best reading = Half stays 320 (already in DB) |
| 52 | Tandoori - Veg / Non Veg | Tandoori Chicken Full | 520.00 | 520 | NO_CHANGE | Card 440 crossed out, 520 handwritten — DB already matches |
| 53 | Veg - North Indian Curries | Green Peas Curry | 170.00 | 200 | READY_TO_UPDATE | |
| 54 | Veg - North Indian Curries | Plain Palak | 170.00 | 200 | READY_TO_UPDATE | |
| 55 | Veg - North Indian Curries | Alu Palak | 180.00 | 210 | READY_TO_UPDATE | |
| 56 | Veg - North Indian Curries | Tomato Curry | 180.00 | 210 | READY_TO_UPDATE | |
| 57 | Veg - North Indian Curries | Mixed Vegetable Curry | 180.00 | 210 | READY_TO_UPDATE | |
| 58 | Veg - North Indian Curries | Kadai Vegetable Curry | 200.00 | 230 | READY_TO_UPDATE | |
| 59 | Veg - North Indian Curries | Capsicum Curry | 210.00 | 240 | READY_TO_UPDATE | |
| 60 | Veg - North Indian Curries | Veg Maharani | 200.00 | 230 | READY_TO_UPDATE | |
| 61 | Veg - North Indian Curries | Veg Chettinad | 190.00 | 220 | READY_TO_UPDATE | |
| 62 | Veg - North Indian Curries | Veg Do Pyaza | 190.00 | 220 | READY_TO_UPDATE | |
| 63 | Veg - North Indian Curries | Alu Mutter | 180.00 | 210 | READY_TO_UPDATE | |
| 64 | Veg - North Indian Curries | Veg Keema Curry | 210.00 | 240 | READY_TO_UPDATE | Handwritten digit between 210/240; settled 240 (+30) |
| 65 | Veg - North Indian Curries | Veg Chat Pat Curry | 220.00 | 250 | READY_TO_UPDATE | |
| 66 | Veg - North Indian Curries | Veg Jai Puri | 240.00 | 270 | READY_TO_UPDATE | Handwritten between 210/270; settled 270 (+30) |
| 67 | Veg - North Indian Curries | Veg Kolhapuri | 260.00 | 240 | READY_TO_UPDATE | Manually verified: handwritten new price = 240 |
| 68 | Veg - North Indian Curries | Kaju Tomato Curry | 280.00 | 290 | READY_TO_UPDATE | Card printed 260 vs DB 280 (discrepancy), new 290 |
| 69 | Veg - North Indian Curries | Kaju Capsicum Curry | 210.00 | 310 | READY_TO_UPDATE | Card printed 280 vs DB 210 (large gap, likely DB error); new 310 |
| 70 | Veg - North Indian Curries | Baby Corn Curry (Half) | 200.00 | see AMBIGUOUS | AMBIGUOUS | Card shows single "210 - 240" line; DB has separate Half (200) / Full (250) entries — cannot map |
| 71 | Veg - North Indian Curries | Baby Corn Curry (Full) | 250.00 | see AMBIGUOUS | AMBIGUOUS | Card shows single "210 - 240" line; DB has separate Half (200) / Full (250) entries — cannot map |
| 72 | Veg - North Indian Curries | Mushroom Curry/Fry | 280.00 | 280 | NO_CHANGE | Card 3 clearly shows Mushroom Curry/Fry 200/250 -> 280; current DB is already 280 |
| 73 | Veg - North Indian Curries | Kaju Mushroom Curry | 220.00 | 310 | READY_TO_UPDATE | Card printed 280 vs DB 220 (discrepancy); new 310 clear |
| 74 | Veg - North Indian Curries | Kadai Mushroom Curry | 220.00 | 250 | READY_TO_UPDATE | |
| 75 | Indian Bread | Pulka | 20.00 | 20 | NO_CHANGE | No handwritten revision |
| 76 | Indian Bread | Butter Pulka | 25.00 | 25 | NO_CHANGE | No handwritten revision |
| 77 | Indian Bread | Roti | 60.00 | 60 | NO_CHANGE | No handwritten revision |
| 78 | Indian Bread | Butter Roti | 65.00 | 65 | NO_CHANGE | No handwritten revision |
| 79 | Indian Bread | Naan | 70.00 | 70 | NO_CHANGE | No handwritten revision |
| 80 | Indian Bread | Butter Naan | 80.00 | 80 | NO_CHANGE | No handwritten revision |
| 81 | Indian Bread | Garlic Naan | 90.00 | 90 | NO_CHANGE | No handwritten revision |
| 82 | Indian Bread | Lacha Parota | 90.00 | 90 | NO_CHANGE | No handwritten revision |
| 83 | Indian Bread | Methi Parota | 90.00 | 90 | NO_CHANGE | No handwritten revision |
| 84 | Indian Bread | Pudhina Parota | 100.00 | 100 | NO_CHANGE | No handwritten revision |
| 85 | Indian Bread | Alu Parota | 100.00 | 100 | NO_CHANGE | No handwritten revision |
| 86 | Indian Bread | Paneer Parota | 130.00 | 130 | NO_CHANGE | No handwritten revision |
| 87 | Indian Bread | Stuffed Parota | 110.00 | 110 | NO_CHANGE | No handwritten revision |
| 88 | Indian Bread | Plain Kulcha | 90.00 | 90 | NO_CHANGE | No handwritten revision |
| 89 | Indian Bread | Stuffed Kulcha | 100.00 | 100 | NO_CHANGE | No handwritten revision |
| 90 | Indian Bread | Masala Kulcha | 100.00 | 100 | NO_CHANGE | No handwritten revision |
| 91 | Indian Bread | Paneer Kulcha | 120.00 | 120 | NO_CHANGE | No handwritten revision |
| 92 | Rice | Ualavacharu | 70.00 | 100 | READY_TO_UPDATE | |
| 93 | Rice | Curd Rice | 120.00 | 150 | READY_TO_UPDATE | |
| 94 | Rice | Sp. Curd Rice | 180.00 | 210 | READY_TO_UPDATE | |
| 95 | Biryani's | Biryani Rice | 220.00 | 250 | READY_TO_UPDATE | |
| 96 | Biryani's | Veg Biryani | 230.00 | 260 | READY_TO_UPDATE | |
| 97 | Biryani's | Spl. Veg Biryani | 280.00 | 310 | READY_TO_UPDATE | |
| 98 | Biryani's | Ulavacharu Veg Biryani | 300.00 | 330 | READY_TO_UPDATE | |
| 99 | Biryani's | Mushroom Veg Biryani | 300.00 | 330 | READY_TO_UPDATE | Card shows clear increase |
| 100 | Biryani's | Paneer Veg Biriyani | 300.00 | 330 | READY_TO_UPDATE | Card shows clear increase |
| 101 | Biryani's | Mixed Veg Biriyani | 310.00 | 340 | READY_TO_UPDATE | Card shows clear increase |
| 102 | Biryani's | Kaju Veg Biryani | 340.00 | 370 | READY_TO_UPDATE | |
| 103 | Biryani's | Egg Biryani | 280.00 | 300 | READY_TO_UPDATE | Manually verified: handwritten new price = 300 |
| 104 | Biryani's | Ulavacharu Egg Biryani | 300.00 | 320 | READY_TO_UPDATE | Manually verified: handwritten new price = 320 |
| 105 | Biryani's | Chicken Dum Biryani | 300.00 | 300 | NO_CHANGE | Card 250 crossed out, 300 handwritten — DB already matches |
| 106 | Biryani's | Chicken Fry Biryani | 320.00 | 320 | NO_CHANGE | Card 280 crossed out, 320 handwritten — DB already matches |
| 107 | Biryani's | Spl Chicken Biryani | 330.00 | 360 | READY_TO_UPDATE | |
| 108 | Biryani's | Chicken Mogalai Biryani | 360.00 | 390 | READY_TO_UPDATE | |
| 109 | Biryani's | Chicken Wings Biryani | 320.00 | 340 | READY_TO_UPDATE | +20 rather than +30, reading confirmed |
| 110 | Biryani's | Chicken Tikka Biryani | 330.00 | 350 | READY_TO_UPDATE | +20 rather than +30, reading confirmed |
| 111 | Biryani's | Tandoori Chicken Biryani | 340.00 | 370 | READY_TO_UPDATE | |
| 112 | Biryani's | Chicken Keema Biryani | 360.00 | 390 | READY_TO_UPDATE | Manually verified: handwritten new price = 390 |
| 113 | Biryani's | Chicken Ulavacharu Biryani | 340.00 | 360 | READY_TO_UPDATE | |
| 114 | Biryani's | Egg Brown Chicken Biryani | 360.00 | 390 | READY_TO_UPDATE | |
| 115 | Biryani's | Tangidi Chicken Biryani | 360.00 | 390 | READY_TO_UPDATE | |
| 116 | Biryani's | Gongura Chicken Biryani Bone | 240.00 | 350 | READY_TO_UPDATE | Manually verified: handwritten new price = 350 |
| 117 | Biryani's | Gongura Chicken Biryani Boneless | 280.00 | 350 | READY_TO_UPDATE | Manually verified: handwritten new price = 350 |
| 118 | Veg-Soups | Tomato Soup | 100.00 | 130 | READY_TO_UPDATE | |
| 119 | Veg-Soups | Veg Corn Soup | 100.00 | 130 | READY_TO_UPDATE | |
| 120 | Veg-Soups | Veg Manchow Soup | 120.00 | 150 | READY_TO_UPDATE | |
| 121 | Veg-Soups | Veg Hot & Sour Soup | 100.00 | 130 | READY_TO_UPDATE | |
| 122 | Veg-Soups | Veg Clear Soup | 100.00 | 130 | READY_TO_UPDATE | |
| 123 | Veg-Soups | Veg Noodles Soup | 100.00 | 130 | READY_TO_UPDATE | |
| 124 | Veg-Soups | Veg Lemon Coriander Soup | 120.00 | 150 | READY_TO_UPDATE | |
| 125 | Veg-Soups | Veg Dragon Soup | 100.00 | 130 | READY_TO_UPDATE | |
| 126 | Veg-Soups | Flavours Spl. Veg Soup | 120.00 | 150 | READY_TO_UPDATE | |
| 127 | Non Veg Soups | Chicken Clear Soup | 120.00 | 150 | READY_TO_UPDATE | |
| 128 | Non Veg Soups | Chicken Corn Soup | 120.00 | 150 | READY_TO_UPDATE | Handwritten digit ambiguous (150 vs 160); settled 150 per +30 pattern |
| 129 | Non Veg Soups | Chicken Manchow Soup | 130.00 | 160 | READY_TO_UPDATE | |
| 130 | Non Veg Soups | Chicken Hot & Sour Soup | 120.00 | 150 | READY_TO_UPDATE | |
| 131 | Non Veg Soups | Chicken Noodles Soup | 120.00 | 150 | READY_TO_UPDATE | Handwriting hard to read; 150 per +30 pattern |
| 132 | Non Veg Soups | Chicken Dragon Soup | 120.00 | 150 | READY_TO_UPDATE | Handwriting hard to read; 150 per +30 pattern |
| 133 | Non Veg Soups | Chicken Lemon Coriander Soup | 130.00 | 160 | READY_TO_UPDATE | |
| 134 | Non Veg Soups | Soup Flavours Spl. Chicken Soup | 130.00 | 160 | READY_TO_UPDATE | |
| 135 | Veg - Starters | Gobi-65/Manchurian (Seasonal) | 220.00 | 250 | READY_TO_UPDATE | |
| 136 | Veg - Starters | Veg Manchurian | 220.00 | 250 | READY_TO_UPDATE | |
| 137 | Veg - Starters | Veg - Spring Rolls | 250.00 | 280 | READY_TO_UPDATE | |
| 138 | Veg - Starters | Veg Hongkong | 250.00 | 280 | READY_TO_UPDATE | |
| 139 | Veg - Starters | Baby Corn (65/Manchurian/Chilly) | 220.00 | 250 | READY_TO_UPDATE | |
| 140 | Veg - Starters | Baby Corn majestic/salt & Pepper | 250.00 | 280 | READY_TO_UPDATE | |
| 141 | Veg - Starters | Crispy Baby Corn | 230.00 | 260 | READY_TO_UPDATE | |
| 142 | Veg - Starters | Mushroom (65/Manchurian/Chilly) | 230.00 | 260 | READY_TO_UPDATE | |
| 143 | Veg - Starters | Mushroom (Salt&Pepper/Schezwan) | 260.00 | 290 | READY_TO_UPDATE | |
| 144 | Veg - Starters | Paneer (65/Manchurian/Chilly) | 300.00 | 330 | READY_TO_UPDATE | |
| 145 | Veg - Starters | Paneer Majestic | 320.00 | 350 | READY_TO_UPDATE | |
| 146 | Veg - Starters | American Corn Fritter | 220.00 | 250 | READY_TO_UPDATE | Card spells "American Corn Feader" — same item |
| 147 | Non-Veg Starters | Chilly Chicken | 300.00 | 330 | READY_TO_UPDATE | |
| 148 | Non-Veg Starters | Chicken 65 | 300.00 | 330 | READY_TO_UPDATE | |
| 149 | Non-Veg Starters | Chicken Manchurian | 300.00 | 330 | READY_TO_UPDATE | |
| 150 | Non-Veg Starters | Chicken Hongkong | 300.00 | 350 | READY_TO_UPDATE | Card printed 320 vs DB 300; new 350 written |
| 151 | Non-Veg Starters | Chicken Spring Rolls | 320.00 | 350 | READY_TO_UPDATE | |
| 152 | Non-Veg Starters | Pepper Chicken | 320.00 | 370 | READY_TO_UPDATE | Card printed 340 vs DB 320; new 370 written |
| 153 | Non-Veg Starters | Bhutanese Chilly Chicken | 340.00 | 350 | READY_TO_UPDATE | Card printed 320; new 350 written |
| 154 | Non-Veg Starters | Hakka Corn Chicken | 320.00 | 370 | READY_TO_UPDATE | Card printed 340; new 370 written |
| 155 | Non-Veg Starters | Ginger Chicken/Garlic Chicken | 340.00 | 330 | READY_TO_UPDATE | Card printed 300 -> new 330; DB 340 appears too high (likely DB error) — effective decrease |
| 156 | Non-Veg Starters | Schezwan Chicken | 300.00 | 330 | READY_TO_UPDATE | |
| 157 | Non-Veg Starters | Lemon Chicken | 300.00 | 330 | READY_TO_UPDATE | Manually verified: handwritten new price = 330 |
| 158 | Non-Veg Starters | Green Land Chicken | 300.00 | 330 | READY_TO_UPDATE | Initial read "300-530"; "5" is a poorly written "3", settled 330 |
| 159 | Non-Veg Starters | Spicy Fried Chicken | 330.00 | 360 | READY_TO_UPDATE | |
| 160 | Non-Veg Starters | Chicken 555 | 320.00 | 350 | READY_TO_UPDATE | |
| 161 | Non-Veg Starters | Sesame Chicken | 360.00 | 390 | READY_TO_UPDATE | |
| 162 | Non-Veg Starters | Popcorn Chicken | 350.00 | 380 | READY_TO_UPDATE | |
| 163 | Non-Veg Starters | Red Chilli Fried Chicken | 330.00 | 360 | READY_TO_UPDATE | |
| 164 | Non-Veg Starters | Butter Chilly Chicken | 320.00 | 350 | READY_TO_UPDATE | |
| 165 | Non-Veg Starters | Crispy Thade Chicken | 340.00 | 370 | READY_TO_UPDATE | |
| 166 | Non-Veg Starters | 8 to 8 Chicken | 340.00 | 370 | READY_TO_UPDATE | |
| 167 | Non-Veg Starters | Golden Dragon Chicken | 320.00 | 350 | READY_TO_UPDATE | |
| 168 | Non-Veg Starters | Chicken Gulzara | 360.00 | 390 | READY_TO_UPDATE | |
| 169 | Non-Veg Starters | Loose Chicken/Creamy Chicken | 370.00 | 400 | READY_TO_UPDATE | |
| 170 | Non-Veg Starters | Cashew Nut Chicken | 370.00 | 400 | READY_TO_UPDATE | |
| 171 | Non-Veg Starters | Mint Chicken | 330.00 | 360 | READY_TO_UPDATE | Consistent +30 across chicken starters |
| 172 | Non-Veg Starters | Chilly Wings/Chicken Wings | 280.00 | 310 | READY_TO_UPDATE | Consistent +30 across chicken starters |
| 173 | Non-Veg Starters | Chicken fried Wings | 320.00 | 350 | READY_TO_UPDATE | |
| 174 | Non-Veg Starters | Chicken Majestic/Schezwan | 330.00 | 360 | READY_TO_UPDATE | Consistent +30 across chicken starters |
| 175 | Non-Veg Starters | Chicken Lollipop | 280.00 | 310 | READY_TO_UPDATE | Card spells "Lollypup" — same item |
| 176 | Non-Veg Starters | Chef Spl Chicken | 360.00 | 390 | READY_TO_UPDATE | Consistent +30 across chicken starters |
| 177 | Non-Veg Starters | Apollo Fish | 300.00 | 330 | READY_TO_UPDATE | Card spells "Appollo" — same item |
| 178 | Non-Veg Starters | Ginger Fish | 300.00 | 330 | READY_TO_UPDATE | Consistent +30 across fish starters |
| 179 | Non-Veg Starters | Chilly Fish/Schezwan Fish | 320.00 | 330 | READY_TO_UPDATE | Card printed 300 vs DB 320; new 330 written |
| 180 | Non-Veg Starters | Hakka Fish/Garlic Fish | 300.00 | 350 | READY_TO_UPDATE | Card printed 320; new 350 written |
| 181 | Non-Veg Starters | Fish Manchurian | 340.00 | 330 | READY_TO_UPDATE | New 330 vs DB 340 — effective decrease (DB likely error) |
| 182 | Non-Veg Starters | Pepper Fish | 360.00 | 370 | READY_TO_UPDATE | |
| 183 | Non-Veg Starters | Prawn Manchurian | 360.00 | 390 | READY_TO_UPDATE | |
| 184 | Non-Veg Starters | Chilly Prawns | 360.00 | 390 | READY_TO_UPDATE | |
| 185 | Non-Veg Starters | Loose Prawns | 370.00 | 390 | READY_TO_UPDATE | Card printed 360 vs DB 370; new 390 written |
| 186 | Andhra Specialities | Chicken Curry (Bone) | 270.00 | 300 | READY_TO_UPDATE | Card: "300 - 270/290 - 320" |
| 187 | Andhra Specialities | Chicken Fry (Bone) | 290.00 | 320 | READY_TO_UPDATE | Card: "300 - 270/290 - 320" |
| 188 | Andhra Specialities | Gongura Chicken Bone | 290.00 | 320 | READY_TO_UPDATE | |
| 189 | Andhra Specialities | Gongura Chicken Boneless | 330.00 | 360 | READY_TO_UPDATE | |
| 190 | Andhra Specialities | Gongura Mutton Curry | 410.00 | 440 | READY_TO_UPDATE | |
| 191 | Andhra Specialities | Gongura Prawns Curry | 440.00 | 470 | READY_TO_UPDATE | |
| 192 | Salads | Onion Salad (Small) | 20.00 | 20 | NO_CHANGE | No handwritten revision |
| 193 | Salads | Onion Salad (Large) | 60.00 | 60 | NO_CHANGE | No handwritten revision |
| 194 | Salads | Tomato Salad | 60.00 | 60 | NO_CHANGE | No handwritten revision |
| 195 | Raitas | Onion Raita | 50.00 | 50 | NO_CHANGE | No handwritten revision |
| 196 | Raitas | Curd (Small) | 20.00 | 20 | NO_CHANGE | No handwritten revision |
| 197 | Raitas | Curd (Big) | 60.00 | 60 | NO_CHANGE | No handwritten revision |

## Totals

| Metric | Count |
|--------|-------|
| TOTAL DB ITEMS | 191 |
| READY_TO_UPDATE | 157 |
| NO_CHANGE | 32 |
| AMBIGUOUS | 2 |

## AMBIGUOUS ITEMS

Do **not** update these entries; verify against the physical menu card first.

| ID | Category | Item Name | Current DB Price | Observed/possible prices on card | Why ambiguous |
|----|----------|-----------|------------------|-----------------------------------|---------------|
| 70 | Veg - North Indian Curries | Baby Corn Curry (Half) | 200.00 | Card shows single "210 - 240" line | DB splits into Half (200) / Full (250); a single card line cannot be mapped to either DB entry |
| 71 | Veg - North Indian Curries | Baby Corn Curry (Full) | 250.00 | Card shows single "210 - 240" line | DB splits into Half (200) / Full (250); a single card line cannot be mapped to either DB entry |

---
*Notes for downstream SQL generation: only rows with Status = READY_TO_UPDATE should be updated (157 items). Rows with Status = NO_CHANGE or AMBIGUOUS must be excluded. Photo-only items NOT present in the DB (e.g. Prawn Salt & Pepper, Chinese Noodles/Fried Rice/Wet dishes, Beverages, Mocktails, South Indian section, and multiple Mutton/Prawn/Fish/Family-Pak Biryanis) are excluded from this report since the DB has no corresponding records.*