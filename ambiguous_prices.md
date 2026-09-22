# AMBIGUOUS Menu Prices

List of 2 menu items whose handwritten new price could not be confidently determined from the menu card analysis. These are **blocked from any price update** until verified against the physical menu card.

Do NOT update these items. Do NOT guess values. This list mirrors the `## AMBIGUOUS ITEMS` section of `price_update_report.md` (Status = AMBIGUOUS).

> Note: IDs 157, 67, 103, 104, 112, 116, 117 were previously AMBIGUOUS and have since been manually verified and moved to READY_TO_UPDATE in `price_update_report.md`. ID 72 (Mushroom Curry/Fry) was manually inspected on Card 3 and resolved to NO_CHANGE (DB 280.00 already matches the card's 200/250 -> 280).

| ID | Category | Item Name | Current DB Price | Possible Prices | Reason for Ambiguity | Source Menu Card / Image |
|----|----------|-----------|------------------|-----------------|----------------------|--------------------------|
| 70 | Veg - North Indian Curries | Baby Corn Curry (Half) | 200.00 | Single card line "210 - 240" | DB splits into Half (200) / Full (250); a single card line cannot be mapped to either DB entry | Card 3 (Veg North Indian Curries) — `media_1789922983432.png` |
| 71 | Veg - North Indian Curries | Baby Corn Curry (Full) | 250.00 | Single card line "210 - 240" | DB splits into Half (200) / Full (250); a single card line cannot be mapped to either DB entry | Card 3 (Veg North Indian Curries) — `media_1789922983432.png` |

---

**Notes**
- Status of all rows above: **AMBIGUOUS** (do not update).
- These 2 items are excluded from the 157 `READY_TO_UPDATE` items in `price_update_report.md`.
- No SQL generated. `price_update_report.md` was updated for the manually verified items and the Card 3 inspection result.