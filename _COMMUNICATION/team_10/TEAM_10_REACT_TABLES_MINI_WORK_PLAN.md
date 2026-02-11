# 📋 תת‑תוכנית (Mini Work Plan) — React Tables

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**סטטוס:** 🔒 **נעול — TablesReactStage בלבד; Stage 0 Blocking (ראה SSOT)**  
**בסיס:** מסמך המיפוי `TEAM_10_REACT_TABLES_MAPPING_DOCUMENT.md` (שלב 1).  
**SSOT מחייב:** `ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md` — React Tables רק דרך TablesReactStage; Stage 0 לפני כל שלב אחר.

---

## 1. Scope מדויק

### 1.1 טבלאות וקבצים scope

| # | עמוד | טבלה (id) | קובץ HTML | קובץ Init נוכחי | DataLoader נוכחי |
|---|------|------------|-----------|------------------|-------------------|
| 1 | D16 | accountsTable | trading_accounts.html | tradingAccountsTableInit.js | tradingAccountsDataLoader.js |
| 2 | D16 | accountActivityTable | trading_accounts.html | tradingAccountsTableInit.js | tradingAccountsDataLoader.js |
| 3 | D16 | positionsTable | trading_accounts.html | tradingAccountsTableInit.js | tradingAccountsDataLoader.js |
| 4 | D18 | brokersTable | brokers_fees.html | brokersFeesTableInit.js | brokersFeesDataLoader.js |
| 5 | D21 | cashFlowsTable | cash_flows.html | cashFlowsTableInit.js | cashFlowsDataLoader.js |
| 6 | D21 | currencyConversionsTable | cash_flows.html | cashFlowsTableInit.js | cashFlowsDataLoader.js |

**סה"כ:** 6 טבלאות ב־3 עמודי HTML (D16, D18, D21).  
**מחוץ ל־scope בשלב זה:** עמודי React בלבד (Login, Register, Home, Admin) — לא משנים; רק עמודי ה‑Financial HTML נכללים במעבר ל־React Tables.

### 1.2 רכיבים קיימים לשימוש

- `ui/src/cubes/shared/components/tables/PhoenixTable.jsx`
- `ui/src/cubes/shared/hooks/usePhoenixTableSort.js`
- `ui/src/cubes/shared/hooks/usePhoenixTableFilter.js`
- `ui/src/cubes/shared/hooks/usePhoenixTableData.js`

---

## 2. אסטרטגיית React Root (חובה — נעול SSOT)

**החלטה נעולה — אין חלופות:** **React Tables Root Strategy = Option B: UAI TablesReactStage בלבד.**  
**אין mount per page. אין חריגים.**  
**מקור מחייב:** `_COMMUNICATION/team_10/ADR_STAGE0_BRIDGE_AND_REACT_TABLES_SSOT.md`.

| שאלה | תשובה (נעול) |
|------|----------------|
| **איפה נוצר React root?** | בעמודי HTML (D16/D18/D21): React root לכל טבלה נוצר **רק** מתוך **TablesReactStage** ב־UAI — `ReactDOM.createRoot(container)` כאשר `container` הוא אלמנט wrapper שמקיף את מקום הטבלה. |
| **מי אחראי?** | **Team 30** — מימוש TablesReactStage ו־mount של PhoenixTable. |
| **באיזה שלב?** | **TablesReactStage בלבד** — שלב ייעודי ב־UAI שרץ **אחרי DataStage**. אסור: RenderStage לטאבלאות React, mount per page, סקריפט mount נפרד לעמוד. |
| **סדר טעינה** | 1) עמוד HTML נטען. 2) UAI — DOMStage → DataStage (נתונים + Bridge filters). 3) **TablesReactStage** — טוען ו־mount טבלאות React לכל container. 4) כל טבלה: `createRoot(container).render(<PhoenixFilterProvider><PhoenixTable ... /></PhoenixFilterProvider>)`. |

**נעילה:** כל מימוש חייב לעבור דרך TablesReactStage; אין חלופות או ניסוחים פתוחים.

---

## 3. Filter Context — נתיב וזרימה (Flow)

**איפה PhoenixFilterContext Provider:**  
- **SPA (React Router):** ב־`ui/src/main.jsx` (שורות 44–49) — `ReactDOM.createRoot(document.getElementById('root'))` ו־`<PhoenixFilterProvider>` עוטף את `<AppRouter />`.  
- **עמודי HTML (D16/D18/D21):** בכל React root של טבלה — יש **לעטוף** את PhoenixTable ב־`<PhoenixFilterProvider>`, כי אין root אחד משותף. כל root יטען את אותו הקומפוננטה מ־`ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`.

**איך הטבלה React מאזינה לפילטרים מ־PhoenixBridge — Flow קצר:**

1. **Header (Vanilla)** — משתמש משנה פילטר ב־Header (למשל חשבון, תאריך).  
2. **Bridge** — `phoenixFilterBridge.js` מעדכן `PhoenixBridge.state.filters` וקורא `window.dispatchEvent(new CustomEvent('phoenix-filter-change', { detail: { filters } }))` (שורות 381, 421).  
3. **Provider מאזין** — ב־`PhoenixFilterContext.jsx` ה־`PhoenixFilterProvider` ב־`useEffect` (שורות 160–203) נרשם ל־`window.addEventListener('phoenix-filter-change', handleBridgeFilterChange)` ומעדכן את ה־state של הקונטקסט.  
4. **טבלה קוראת** — `PhoenixTable` משתמש ב־`usePhoenixTableFilter` → `usePhoenixFilter` (מ־PhoenixFilterContext) → `context.filters`.  
5. **תוצאה** — כשהפילטרים ב־Bridge משתנים, ה־Provider מעדכן state, ו־PhoenixTable מקבל filters עדכניים ויכול refetch או לסנן.

**Path לקבצים:**  
- Bridge: `ui/src/components/core/phoenixFilterBridge.js` (dispatch 381, 421).  
- Provider + האזנה: `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx` (Provider 232, listen 188).  
- שימוש בטבלה: `usePhoenixTableFilter.js` → `usePhoenixFilter` (context).

---

## 4. Stage 0 Alignment (חובה)

- **Stage 0 = Bridge (Blocking):** מימוש React Tables **חוסם** עד השלמת **שלב 0 (גשר React/HTML)** לפי התוכנית — Lock ל־Hybrid, Auth Redirect (ADR‑013), routes.json, Header אחיד, והחלטת React Tables מאושרת. אין התחלת מימוש טבלאות React לפני סגירת Stage 0.
- **קשר ל־QA Gate Flow:** אחרי כל שלב טבלאות (D16 → D18 → D21) — **אימות מינימלי** (או מלא) לפי שער א': Team 10 מאשר השלמה ומעביר קונטקסט ל־Team 50; הרצת סוויטת E2E; **0 SEVERE**. התת‑תוכנית נכנסת לתוכנית העבודה הכללית רק לאחר אישור Team 90; אז סדר הביצוע כפוף גם ל־`TEAM_10_ORDER_OF_WORK_UNTIL_GATE_A.md` (שער א' אחרי שלבים 0 ו־1).

---

## 5. Actions מדויקות לכל טבלה / עמוד

### 5.1 D16 — Trading Accounts (3 טבלאות)

| פעולה | תיאור | אחראי מוצע |
|--------|--------|-------------|
| A-D16-1 | הגדרת column config ל־accountsTable (מתאימה ל־API ול־data-sort-key הקיים). | Team 30/31 |
| A-D16-2 | החלפת DOM table ב־React root: רינדור PhoenixTable עבור accountsTable עם usePhoenixTableData + endpoints קיימים. | Team 30 |
| A-D16-3 | שמירת selectors `js-*` על רכיבי React (כותרות, פילטרים, pagination) — לפי ARCHITECT_DIRECTIVE_TABLES_REACT. | Team 30 |
| A-D16-4 | אותו תהליך ל־accountActivityTable (נתונים לפי חשבון + תאריכים). | Team 30 |
| A-D16-5 | אותו תהליך ל־positionsTable (נתונים לפי חשבון). | Team 30 |
| A-D16-6 | ניתוק/הסרה מדורגת של tradingAccountsTableInit.js ו־PhoenixTableSortManager/FilterManager רק לאחר אימות. | Team 30 |

### 5.2 D18 — Brokers Fees (1 טבלה)

| פעולה | תיאור | אחראי מוצע |
|--------|--------|-------------|
| A-D18-1 | column config ל־brokersTable. | Team 30/31 |
| A-D18-2 | החלפת DOM ב־PhoenixTable + usePhoenixTableData, שמירת CRUD handlers קיימים (js-add-broker-fee וכו'). | Team 30 |
| A-D18-3 | שמירת `js-*` selectors. | Team 30 |
| A-D18-4 | ניתוק brokersFeesTableInit.js לאחר אימות. | Team 30 |

### 5.3 D21 — Cash Flows (2 טבלאות)

| פעולה | תיאור | אחראי מוצע |
|--------|--------|-------------|
| A-D21-1 | column config ל־cashFlowsTable ו־currencyConversionsTable. | Team 30/31 |
| A-D21-2 | החלפת DOM ב־PhoenixTable לשני הטבלאות, usePhoenixTableData. | Team 30 |
| A-D21-3 | שמירת `js-*` selectors. | Team 30 |
| A-D21-4 | ניתוק cashFlowsTableInit.js לאחר אימות. | Team 30 |

### 5.4 צעדים רוחביים (כל העמודים)

| פעולה | תיאור | אחראי מוצע |
|--------|--------|-------------|
| A-X-1 | אינטגרציה עם PhoenixFilterBridge / Filter Context לפי ARCHITECT_DIRECTIVE_TABLES_V2_FINAL (TtGlobalFilter / PhoenixFilterContext). | Team 30 |
| A-X-2 | Transformation Layer: API snake_case ↔ React camelCase — כבר מוגדר ב־PhoenixTable; לוודא שכל ה־DataLoaders/APIs מחזירים נתונים תואמים. | Team 20/30 |
| A-X-3 | Audit Trail: מיון/סינון מתועדים תחת ?debug (PhoenixAudit) — לפי מנדט האדריכל. | Team 30 |

---

## 6. Acceptance Criteria לכל שלב

### שלב א — D16 (Trading Accounts)

- [ ] שלוש הטבלאות (accounts, accountActivity, positions) מוצגות כ־React (PhoenixTable).
- [ ] מיון ופילטרים פועלים; selectors `js-table`, `js-table-sort-trigger`, `js-table-filter`, `js-table-page-size` קיימים ועובדים.
- [ ] E2E קיימות (כולל CRUD D16) עוברות ללא רגרסיה.
- [ ] אין שימוש ב־PhoenixTableSortManager / PhoenixTableFilterManager בדף trading_accounts.

### שלב ב — D18 (Brokers Fees)

- [ ] brokersTable מוצג כ־React; CRUD (הוספה/עריכה/מחיקה) פועל.
- [ ] E2E (כולל CRUD D18) עוברות.
- [ ] TableInit הוסר/מנותק לעמוד זה.

### שלב ג — D21 (Cash Flows)

- [ ] cashFlowsTable ו־currencyConversionsTable מוצגות כ־React.
- [ ] פילטרים pagination עובדים; E2E עוברות.
- [ ] TableInit מנותק.

### שלב ד — סיום

- [ ] כל ה־Legacy Table Inits (tradingAccounts, brokersFees, cashFlows) אינם נטענים לעמודי ה‑HTML הרלוונטיים (או הוסרו).
- [ ] תיעוד: עדכון מפת הסריקה/מיפוי אם נוספו קבצים; עדכון TEAM_10_REACT_TABLES_MAPPING_DOCUMENT אם יש שינוי מבנה.

---

## 7. Dependencies

| תלות | תיאור |
|------|--------|
| **UAI** | UnifiedAppInit ו־stages (DOMStage, DataStage, RenderStage) — יש להבטיח ש־React root נטען לעמוד ה‑HTML במקום/במקביל ל־TableInit; או מעבר ל־React Router לאותם routes (לפי החלטת Bridge: כרגע D16/D18/D21 נשארים HTML). |
| **PhoenixBridge / Filter** | phoenixFilterBridge.js, PhoenixFilterContext — טבלאות React חייבות לקבל פילטרים גלובליים מהקונטקסט/ברידג' לפי ARCHITECT_DIRECTIVE_TABLES_V2_FINAL. |
| **CSS** | phoenix-base.css, phoenix-tables (אם יוגדר) — class `phoenix-table` ו־styling טבלאות חייבים להישמר או לעבור ל־phoenix-tables.css. |
| **Filter Context** | החלטת אדריכל: TtGlobalFilter → PhoenixFilterContext; יש לשלב את הטבלאות עם הקונטקסט לפני או במהלך המימוש. |
| **API** | Endpoints קיימים (trading_accounts, brokers, cash_flows וכו') — ללא שינוי חוזה; רק הצרכן משתנה (React במקום DataLoader DOM). |
| **Team 50 (QA)** | הרצת סוויטת E2E לאחר כל שלב (D16 → D18 → D21) — 0 SEVERE. |

---

## 8. Risk notes + Rollback plan

### 8.1 סיכונים

| סיכון | השפעה | צמצום |
|--------|--------|--------|
| רגרסיה ב־E2E / CRUD | חסימת שחרור | ביצוע לפי שלבים (D16 → D18 → D21); אימות QA אחרי כל טבלה. |
| אי־התאמה Filter Context | טבלאות לא מקבלות פילטר גלובלי | השלמת ספקט Filter Bridge לפני או במקביל לשלב א'. |
| הבדלי התנהגות (מיון/פילטר) | חוויית משתמש שונה | שמירה על אותם selectors ו־data attributes; בדיקות ידניות. |
| עומס על צוות 30 | עיכוב | חלוקת משימות לפי טבלאות; Team 31/10 תמיכה ב־column config ותיעוד. |

### 8.2 Rollback (קצר)

- **לפני אישור Team 90:** אין ביצוע — אין צורך ב־rollback.
- **אחרי אישור:** כל עמוד/טבלה יועברו ל־React בנפרד. במקרה כשל:
  - **חזרה מיידית:** החזרת טעינת TableInit הישן לאותו עמוד (feature flag או החזרת script entry).
  - **שחזור קוד:** branch ייעודי ל־React Tables; merge רק לאחר אימות מלא. שמירת קבצי TableInit/DataLoader עד סיום כל השלבים ואימות QA.

---

## 9. סדר ביצוע מוצע (לאחר אישור)

1. **אישור Team 90** על מסמך זה + מסמך המיפוי.  
2. **השלמת תלויות:** Filter Context / PhoenixFilterBridge — לפי עדיפות אדריכלית.  
3. **שלב א — D16** (3 טבלאות) → אימות QA → המשך.  
4. **שלב ב — D18** → אימות QA → המשך.  
5. **שלב ג — D21** → אימות QA.  
6. **שלב ד —** ניתוק סופי של Table Inits, עדכון תיעוד.

---

**Team 10 (The Gateway)**  
**log_entry | REACT_TABLES_MINI_WORK_PLAN | STAGE_2_DELIVERABLE | ROUND1_CORRECTIONS | PENDING_TEAM_90_APPROVAL | 2026-02-10**
