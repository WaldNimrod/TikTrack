---
id: POL-015
owner: Architect
status: LOCKED
context: UI Structural Integrity
---
# 🏗️ חוזה תבנית עמוד ומבנה קונטיינרים (v1.1)

## 1. מבנה DOM מחייב (The Skeleton)
כל עמוד (למעט Auth) חייב להיבנות מהתבנית המרכזית:
`header#unified-header > page-wrapper > page-container > main > tt-container > tt-section`

**אלמנט ראש דף (Header):** חובה. `headerLoader.js` טוען `unified-header.html` דינמית ומזריק לפני `.page-wrapper`.

## 2. סדר טעינת משאבים
1. CSS: Pico ➔ Base (DNA) ➔ Components (Lego) ➔ Header ➔ Page-specific.
2. JS: **headerLoader.js** (ראש דף) ➔ PageConfig.js ➔ UnifiedAppInit.js (UAI Boot).

## 3. תבנית בסיס (page-base-template.html)
- **חובה:** `<script src="/src/components/core/headerLoader.js"></script>` בתחילת `<body>`.
- עמודים: trading_accounts, brokers_fees, cash_flows, tickers, user_tickers, data_dashboard.

## 4. ולידציה אוטומטית (Scripts)
- `generate-pages.js`: מרכיב את העמודים מתוך `.content.html`.
- `validate-pages.js`: פוסל כל עמוד שחורג מהמבנה, מסדר ה-CSS, או חסר headerLoader.

**log_entry | [Architect] | TEMPLATE_CONTRACT_LOCKED | GREEN**