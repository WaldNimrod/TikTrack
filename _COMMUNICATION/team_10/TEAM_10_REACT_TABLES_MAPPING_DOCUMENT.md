# 📍 מסמך מיפוי — React Tables (שלב 1)

**מאת:** Team 10 (The Gateway) — בהתבסס על סריקה לפי מפת צוות 90  
**תאריך:** 2026-02-10  
**סטטוס:** ✅ **תוצר שלב 1 — כפוף ל‑SSOT ו‑Stage 0 (נעול)**  
**מקור:** `_COMMUNICATION/team_90/TEAM_90_REACT_HTML_BRIDGE_SCAN_MAP.md`

---

## 1. טבלאות פעילות (D16 / D18 / D21) — זהות ו־HTML

| עמוד | טבלה | id | class | data-table-type | קובץ HTML |
|------|------|-----|-------|-----------------|-----------|
| **D16** Trading Accounts | חשבונות מסחר | `accountsTable` | `phoenix-table js-table` | `trading_accounts` | `ui/src/views/financial/tradingAccounts/trading_accounts.html` |
| **D16** | פעילות חשבון (לפי תאריכים) | `accountActivityTable` | `phoenix-table js-table` | **חסר ב‑HTML** (ראה להלן) | אותו קובץ |
| **D16** | פוזיציות לפי חשבון | `positionsTable` | `phoenix-table js-table` | **חסר ב‑HTML** (ראה להלן) | אותו קובץ |
| **D18** Brokers Fees | ברוקרים ועמלות | `brokersTable` | `phoenix-table js-table` | `brokers` | `ui/src/views/financial/brokersFees/brokers_fees.html` |
| **D21** Cash Flows | יומן תזרים מזומנים | `cashFlowsTable` | `phoenix-table js-table` | `cash_flows` | `ui/src/views/financial/cashFlows/cash_flows.html` |
| **D21** | המרות מטבע | `currencyConversionsTable` | `phoenix-table js-table` | `currency_conversions` | אותו קובץ |

**סיכום:** 6 טבלאות ב־3 קבצי HTML (D16: 3 טבלאות, D18: 1, D21: 2).

**מיפוי data-table-type — accountActivityTable ו־positionsTable:**  
ב־HTML כיום **אין** תגית `data-table-type` לשני הטבלאות (רק `accountsTable` כולל `data-table-type="trading_accounts"`).  
**החלטה:** **N/A (no change required)** — אין חובה להוסיף ל־HTML בשלב ה־Legacy. במעבר ל־React יוגדר סוג/זהות הטבלה ב־column config או ב־React component, לא נדרש שינוי ב־HTML לצורך זה.

---

## 2. קבצי HTML — table skeletons

| קובץ | טבלאות בתוך הקובץ |
|------|-------------------|
| `ui/src/views/financial/tradingAccounts/trading_accounts.html` | accountsTable, accountActivityTable, positionsTable |
| `ui/src/views/financial/brokersFees/brokers_fees.html` | brokersTable |
| `ui/src/views/financial/cashFlows/cash_flows.html` | cashFlowsTable, currencyConversionsTable |

---

## 3. קבצי JS פעילים — Managers / Loaders / Init

| תפקיד | קובץ | שימוש |
|--------|------|--------|
| **Init D16** | `ui/src/views/financial/tradingAccounts/tradingAccountsTableInit.js` | אתחול PhoenixTableSortManager + PhoenixTableFilterManager ל־accountsTable, accountActivityTable, positionsTable; קורא ל־loadContainer1 (DataLoader). |
| **Init D18** | `ui/src/views/financial/brokersFees/brokersFeesTableInit.js` | אתחול Sort+Filter Managers ל־brokersTable. |
| **Init D21** | `ui/src/views/financial/cashFlows/cashFlowsTableInit.js` | אתחול Sort+Filter Managers ל־cashFlowsTable, currencyConversionsTable. |
| **DataLoader D16** | `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js` | loadContainer1, עדכון DOM טבלאות. |
| **DataLoader D18** | `ui/src/views/financial/brokersFees/brokersFeesDataLoader.js` | טעינת נתונים לברוקרים. |
| **DataLoader D21** | `ui/src/views/financial/cashFlows/cashFlowsDataLoader.js` | טעינת נתונים לתזרים והמרות. |
| **Manager (גלובלי)** | `ui/src/cubes/shared/PhoenixTableSortManager.js` | נחשף כ־`window.PhoenixTableSortManager` — משמש את כל ה־TableInit. |
| **Manager (גלובלי)** | `ui/src/cubes/shared/PhoenixTableFilterManager.js` | נחשף כ־`window.PhoenixTableFilterManager` — משמש את כל ה־TableInit. |
| **UAI** | `ui/src/components/core/UnifiedAppInit.js` | כניסת UAI. |
| **Stages** | `ui/src/components/core/stages/DOMStage.js`, `RenderStage.js`, `DataStage.js` | RenderStage מחפש TableInit לפי pageType; DataStage טוען DataLoader. מיפוי paths: tradingAccounts, brokersFees, cashFlows. |

### 3.1 הוכחת קוד — RenderStage / DataStage (UAI Evidence)

**RenderStage.js** (`ui/src/components/core/stages/RenderStage.js`):
- טעינת TableInit: `loadComponentInitializers` — אם `component === 'table'` קורא ל־`getTableInitPath(pageType)` וטוען את הסקריפט (שורות 103–108).
- מיפוי path → pageType: `getTableInitPath(pageType)` מחזיר נתיב לפי `pathMap` (שורות 200–206):  
  `tradingAccounts` → `/src/views/financial/tradingAccounts/tradingAccountsTableInit.js`,  
  `brokersFees` → `.../brokersFeesTableInit.js`,  
  `cashFlows` → `.../cashFlowsTableInit.js`.
- אתחול טבלה: `initializeTable(pageType, config)` (שורות 139–164) — מחפש פונקציית init ב־global: `findTableInitFunction(pageType)` (שורות 171–181), שם פונקציה לפי `getTableInitFunctionName` (שורות 188–193) — למשל `initTradingAccountsTable`.
- זיהוי עמוד: `detectPageType()` (שורות 214–224) — מיפוי pathname ל־pageType: `/trading_accounts.html` → `tradingAccounts`, `/brokers_fees.html` → `brokersFees`, `/cash_flows.html` → `cashFlows`.

**DataStage.js** (`ui/src/components/core/stages/DataStage.js`):
- פילטרים מ־Bridge: `fetchData(config)` (שורות 157–189) — קורא `window.PhoenixBridge?.state?.filters` (שורה 160) לפני קריאה ל־loader.
- זיהוי עמוד: `detectPageType()` (שורות 276–284) — אותו `pageMap` כמו ב־RenderStage: `/trading_accounts.html` → `cashFlows`/`brokersFees`/`tradingAccounts`.
- טעינת DataLoader: `loadDataLoader(loaderPath)` (שורות 98–151) — dynamic import לפי ה־path שמגיע מ־config; `findLoaderFunction(pageType, config.dataLoader)` מחזיר את פונקציית הטעינה (למשל `loadTradingAccountsData`).

---

## 4. מימושים קיימים — React (PhoenixTable, Hooks)

| רכיב | נתיב | שימוש נוכחי |
|------|------|-------------|
| **PhoenixTable.jsx** | `ui/src/cubes/shared/components/tables/PhoenixTable.jsx` | **לא משמש** באף view. משתמש ב־usePhoenixTableSort, usePhoenixTableFilter. |
| **usePhoenixTableSort.js** | `ui/src/cubes/shared/hooks/usePhoenixTableSort.js` | בשימוש רק ב־PhoenixTable.jsx (לא ב־D16/D18/D21). |
| **usePhoenixTableFilter.js** | `ui/src/cubes/shared/hooks/usePhoenixTableFilter.js` | בשימוש רק ב־PhoenixTable.jsx. |
| **usePhoenixTableData.js** | `ui/src/cubes/shared/hooks/usePhoenixTableData.js` | Hook לטעינת נתונים מ־API — לא משולב ב־D16/D18/D21. |

**מסקנה:** טבלאות D16/D18/D21 מופעלות כ־**HTML + Legacy Managers** (PhoenixTableSortManager, PhoenixTableFilterManager) דרך TableInit; רכיב React PhoenixTable וה־Hooks קיימים אך **לא מחוברים** לעמודים אלה.

---

## 5. Selectors חשובים ל־E2E (`js-`)

| Selector | שימוש | דוגמאות בקבצים |
|----------|--------|-----------------|
| `js-table` | זיהוי טבלה | כל `<table>` רלוונטי: class כולל `phoenix-table js-table`. |
| `js-table-sort-trigger` | לחיצה למיון | כותרות עמודות (data-sort-key, data-sort-type). |
| `js-sort-indicator`, `js-sort-icon` | אינדיקציית מיון | ב־trading_accounts.html, brokers_fees.html, cash_flows.html. |
| `js-table-page-size` | בחירת גודל עמוד | select עם data-table-id. |
| `js-table-filter` | שדות פילטר | input/select עם data-filter-key. |
| `js-section-toggle` | הצג/הסתר סקשן | כפתורי toggle. |
| `js-add-trading-account` | הוספת חשבון (D16) | trading_accounts.html. |
| `js-add-broker-fee` | הוספת ברוקר (D18) | brokers_fees.html. |
| `js-summary-toggle` | toggle סיכום (D21) | cash_flows.html. |

**גופי טבלה (לעדכון דינמי):**  
`#accountsTable` + tbody, `#brokersTableBody`, `#cashFlowsTableBody`, `#currencyConversionsTableBody`, `#accountActivityTable`, `#positionsTable`.

---

## 6. תלות במפת הסריקה (Scan Map)

- **מפת סריקה:** `_COMMUNICATION/team_90/TEAM_90_REACT_HTML_BRIDGE_SCAN_MAP.md`
- **דוח Bridge:** `_COMMUNICATION/team_90/TEAM_90_REACT_HTML_BRIDGE_FINDINGS_DRAFT.md`
- **מנדט תהליך:** `_COMMUNICATION/team_10/TEAM_10_REACT_TABLES_MANDATORY_PROCESS.md`
- **SSOT — Stage 0 + React Tables (נעול):** `_COMMUNICATION/team_10/ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md` — Stage 0 (Bridge) חובה לפני כל שלב; React Tables נטענות **רק** דרך TablesReactStage ב־UAI; אין mount per page.

---

**Team 10 (The Gateway)**  
**log_entry | REACT_TABLES_MAPPING_DOCUMENT | STAGE_1_DELIVERABLE | ROUND1_CORRECTIONS | 2026-02-10**
