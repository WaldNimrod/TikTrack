# ✅ דוח ביקורת חיצוני סופי: סטיות/סתירות בין תיעוד לקוד + המלצות

**מאת:** External Audit (Codex)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-04  
**סטטוס:** 🟡 **FINAL REPORT – ACTION REQUIRED**

---

## 📌 תקציר מנהלים
בוצעה ביקורת על מסמכי ארכיטקטורה/מדיניות ועל קוד רלוונטי (UI + Auth + Navigation + Restructure). נמצאו מספר פערים קריטיים העלולים לשבור את ה-SSOT, להפעיל מערכת על פורטים שונים, ולהפר סגירות ארכיטקטוניות (Clean Slate, Boundary Rules). הדוח מפרט את הסתירות וממליץ על תיקון ממוקד במסמכי אמת ובקוד.

---

## 🧭 היקף הבדיקה

**מסמכים עיקריים:**
- `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md`
- `documentation/01-ARCHITECTURE/PHOENIX_REACT_HTML_BOUNDARIES.md`
- `documentation/01-ARCHITECTURE/PHOENIX_NAVIGATION_STRATEGY.md`
- `documentation/01-ARCHITECTURE/PHOENIX_AUTH_INTEGRATION.md`
- `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md`
- `documentation/OPENAPI_SPEC_V2.yaml`
- `documentation/04-DESIGN_UX_UI/CSS_LOADING_ORDER.md`
- `ui/infrastructure/README.md`
- `_COMMUNICATION/team_10/TEAM_10_NAVIGATION_STRATEGY_COMPLETION_REPORT.md`
- `_COMMUNICATION/team_10/TEAM_30_UI_RESTRUCTURE_COMPLETION_REPORT.md`

**קוד נבדק:**
- `ui/index.html`
- `ui/src/components/core/*`
- `ui/src/views/financial/tradingAccounts/*`
- `ui/src/views/financial/shared/portfolioSummaryToggle.js`
- `ui/src/views/shared/*`
- `ui/vite.config.js`
- `ui/src/cubes/identity/services/auth.js`
- `ui/src/cubes/identity/services/apiKeys.js`

---

## 🔴 ממצאים קריטיים (Doc ↔ Code / Doc ↔ Doc)

### 1) פורטים לא עקביים (שובר אינטגרציה)
- **Doc:** `TT2_MASTER_BLUEPRINT.md` מציין Frontend 8080 / Backend 8082.
- **Doc:** `ui/infrastructure/README.md` מציין Frontend 3000 / Backend 8080.
- **Doc:** `OPENAPI_SPEC_V2.yaml` מציין בסיס `http://localhost:8080/api/v1`.
- **Code:** `ui/vite.config.js` מוגדר ל-Frontend 8080 ו-Proxy ל-8082.
- **Code:** `auth.js`, `apiKeys.js` משתמשים ב-`http://localhost:8082/api/v1`.

**סיכון:** סביבת Dev לא עקבית, Auth/Trading לא מתחברים לאותו Backend.

**קבצים:**
- `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md`
- `ui/infrastructure/README.md`
- `documentation/OPENAPI_SPEC_V2.yaml`
- `ui/vite.config.js`
- `ui/src/cubes/identity/services/auth.js`
- `ui/src/cubes/identity/services/apiKeys.js`

---

### 2) Clean Slate Rule סותר שימוש ב-`<script src>` ב-HTML
- **Doc:** `PHOENIX_MASTER_BIBLE.md` קובע איסור מוחלט על `<script>` בתוך HTML/JSX.
- **Code:** `trading_accounts.html` ו-`ui/index.html` כוללים עשרות `<script src>` (כולל header loader, bridge, handlers).

**סיכון:** הכלל בלתי ישים כפי שנוסח – עוצר את הארכיטקטורה ההיברידית בפועל.

**קבצים:**
- `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md`
- `ui/index.html`
- `ui/src/views/financial/tradingAccounts/trading_accounts.html`

---

### 3) מיקום/שמות קבצים: סטיות שיכולות להישבר בלינוקס
**תיעוד** מול **קוד בפועל**:
- `phoenix-filter-bridge.js` (Doc) ↔ `phoenixFilterBridge.js` (Code)
- `header-loader.js` (Doc) ↔ `headerLoader.js` (Code)
- `navigation-handler.js` (Doc) ↔ `navigationHandler.js` (Code)
- `ui/src/components/core/unified-header.html` (Doc) ↔ `ui/src/views/shared/unified-header.html` (Code)
- `ui/src/views/financial/auth-guard.js` (Doc) ↔ `ui/src/components/core/authGuard.js` (Code)

**סיכון:** שבירה מלאה בסביבות רגישות לקייס (Linux/CI), בלבול צוותים, וקישורים שגויים בדוקומנטציה.

**קבצים:**
- `documentation/01-ARCHITECTURE/PHOENIX_REACT_HTML_BOUNDARIES.md`
- `documentation/01-ARCHITECTURE/PHOENIX_NAVIGATION_STRATEGY.md`
- `documentation/01-ARCHITECTURE/PHOENIX_AUTH_INTEGRATION.md`
- `ui/src/components/core/*`
- `ui/src/views/shared/unified-header.html`

---

### 4) דוח השלמה מצהיר הסרת דיבוג, אך בפועל יש `console.log`
- **Report:** `_COMMUNICATION/team_10/TEAM_10_NAVIGATION_STRATEGY_COMPLETION_REPORT.md` מצהיר “הוסרו כל debug logs”.
- **Code:** `ui/src/components/core/navigationHandler.js` מכיל `console.log` לא מאובטח בדיבוג.

**סיכון:** הפרה של פרוטוקול JS, רעש לוגים, פגיעה ביציבות QA.

**קבצים:**
- `_COMMUNICATION/team_10/TEAM_10_NAVIGATION_STRATEGY_COMPLETION_REPORT.md`
- `ui/src/components/core/navigationHandler.js`

---

### 5) PHOENIX_AUTH_INTEGRATION טוען ל-`routeToHtmlMap` מה-Vite
- **Doc:** מציין שימוש ב-`routeToHtmlMap` מתוך `vite.config.js` בזמן ריצה.
- **מציאות:** הקובץ לא נגיש ב-browser runtime. זה לא implementable ללא יצוא JSON/TS.

**סיכון:** Auth Guard לא יודע לזהות clean routes → redirect שגוי.

**קובץ:** `documentation/01-ARCHITECTURE/PHOENIX_AUTH_INTEGRATION.md`

---

## 🟠 ממצאים בינוניים

### 6) עוגני “D16” נשארו בקוד למרות שינוי שמות
בקבצים החדשים (`tradingAccounts*`) נשארו תגיות/הערות/telemetry בשם D16 וכתובות ingest.

**דוגמאות:**
- `tradingAccountsTableInit.js` כולל `initD16Tables()` ו-`d16-table-init.js` בלוגים.
- `tradingAccountsDataLoader.js` כולל `[D16 Data Loader]` בלוגים.

**סיכון:** בלבול, עקבות דיבוג לא מאובטחות, אי-יישור למסמך “Naming”.

**קבצים:**
- `ui/src/views/financial/tradingAccounts/tradingAccountsTableInit.js`
- `ui/src/views/financial/tradingAccounts/tradingAccountsDataLoader.js`
- `ui/src/views/financial/tradingAccounts/tradingAccountsFiltersIntegration.js`

---

### 7) Infra README עדיין מפנה ל-design tokens שהוסרו
- **Doc:** `PHOENIX_MASTER_BIBLE.md` מבטל `design-tokens.css` ומגדיר `phoenix-base.css` כ-SSOT.
- **Doc:** `ui/infrastructure/README.md` עדיין מציין `ui/design-tokens/`.

**סיכון:** החזרה לכפילויות/צנרת CSS ישנה.

**קבצים:**
- `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md`
- `ui/infrastructure/README.md`

---

### 8) D15_SYSTEM_INDEX מצביע למסמך חסר
- `documentation/D15_SYSTEM_INDEX.md` מפנה ל-`TT2_INFRASTRUCTURE_GUIDE.md` שאינו קיים.

**סיכון:** שגיאת SSOT באינדקס הראשי.

**קובץ:** `documentation/D15_SYSTEM_INDEX.md`

---

## ✅ אימות הצהרות Team 30 (UI Restructure)

**מאומת בפועל:**
- מבנה התיקיות החדש קיים:
  - `ui/src/views/financial/tradingAccounts/*`
  - `ui/src/views/financial/brokersFees/brokers_fees.html`
  - `ui/src/views/financial/cashFlows/cash_flows.html`
  - `ui/src/views/financial/shared/portfolioSummaryToggle.js`
- קישורי `<script src>` ב-`trading_accounts.html` עודכנו לנתיבים החדשים.

**פערים נלווים:**
- נשארו תגיות/דיבוג D16 בקבצים החדשים (סעיף 6).

**קובץ רפרנס:** `_COMMUNICATION/team_10/TEAM_30_UI_RESTRUCTURE_COMPLETION_REPORT.md`

---

## 🔧 המלצות ביצוע (לפי עדיפות)

### P0 – חוסם אינטגרציה
1. לבחור **SSOT אחד** לפורטים (8080/8082/3000) ולעדכן: `TT2_MASTER_BLUEPRINT.md`, `OPENAPI_SPEC_V2.yaml`, `ui/infrastructure/README.md`, `ui/vite.config.js`, `auth.js`, `apiKeys.js`.
2. לעדכן את כלל Clean Slate כך שיאסור **inline scripts בלבד**, אך יתיר `<script src>`.

### P1 – יציבות ארכיטקטונית
3. ליישר שמות קבצים: hyphen vs camelCase (במסמכים או בקוד). מומלץ לבחור **kebab-case** במסמכים ולהוסיף “alias note” או לשנות שמות קבצים בפועל.
4. לעדכן `PHOENIX_AUTH_INTEGRATION.md` למנגנון Route Map אמיתי (JSON/TS משותף, נטען ב-build וגם ב-runtime).

### P2 – ניקוי וניטור
5. להסיר/לגדר דיבוגים לא מאושרים (`console.log`, וקריאות ingest חיצוניות) לפי `TT2_JS_STANDARDS_PROTOCOL.md`.
6. לנקות מונחי D16 בקוד שהוחלף ל-TradingAccounts (הערות, פונקציות, telemetry).
7. לעדכן `ui/infrastructure/README.md` להסרה מפורשת של design-tokens.
8. לתקן `D15_SYSTEM_INDEX.md` ולהסיר קישורים למסמכים חסרים.

---

## 📚 קישורים מרכזיים (SSOT / תיעוד)
- `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md`
- `documentation/01-ARCHITECTURE/PHOENIX_REACT_HTML_BOUNDARIES.md`
- `documentation/01-ARCHITECTURE/PHOENIX_NAVIGATION_STRATEGY.md`
- `documentation/01-ARCHITECTURE/PHOENIX_AUTH_INTEGRATION.md`
- `documentation/01-ARCHITECTURE/TT2_MASTER_BLUEPRINT.md`
- `documentation/OPENAPI_SPEC_V2.yaml`
- `documentation/04-DESIGN_UX_UI/CSS_LOADING_ORDER.md`
- `ui/infrastructure/README.md`

---

## ✅ סטטוס סופי
הדוח מציג פערים מוכחים בין תיעוד לקוד ובין מסמכים שונים, כולל אי-יישור ארכיטקטוני קריטי. מומלץ לבצע יישור SSOT מיידי והקשחת מדיניות Clean Slate/Routes כדי להבטיח יציבות מודול האוטנטיקציה והחשבונות המסחריים.

**log_entry | [External Audit] | DOC_CODE_GAPS | FINAL_REPORT | YELLOW | 2026-02-04**
