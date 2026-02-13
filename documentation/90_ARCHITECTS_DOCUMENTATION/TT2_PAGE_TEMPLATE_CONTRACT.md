---
id: POL-015
owner: Architect
status: LOCKED
context: UI Structural Integrity
---
# 🏗️ חוזה תבנית עמוד ומבנה קונטיינרים (v1.0)

## 1. מבנה DOM מחייב (The Skeleton)
כל עמוד (למעט Auth) חייב להיבנות מהתבנית המרכזית:
`page-wrapper > page-container > main > tt-container > tt-section`

## 2. סדר טעינת משאבים
1. CSS: Pico ➔ Base (DNA) ➔ Components (Lego) ➔ Header ➔ Page-specific.
2. JS: PageConfig.js ➔ UnifiedAppInit.js (UAI Boot).

## 3. ולידציה אוטומטית (Scripts)
- `generate-pages.js`: מרכיב את העמודים מתוך `.content.html`.
- `validate-pages.js`: פוסל כל עמוד שחורג מהמבנה או מסדר ה-CSS.

**log_entry | [Architect] | TEMPLATE_CONTRACT_LOCKED | GREEN**