# Team 50 → Team 10: דוח בדיקות Central Status Function (Frontend)

**מאת:** Team 50 (QA & Fidelity)  
**אל:** Team 10 (The Gateway), Team 30 (Frontend)  
**תאריך:** 2026-01-31  
**מקור:** `TEAM_10_TO_TEAM_50_CENTRAL_STATUS_FUNCTION_QA_REQUEST.md`

---

## 1. סיכום

**סטטוס:** ⚠️ **אימות קוד מלא | E2E חלקי** (Chrome timeout בסביבת הרצה)

אימות קוד ומבנה מלא בוצע. סבב E2E חלקי הצליח בחלקו; נדרש ריצה חוזרת כשהשרתים פעילים.

---

## 2. אימות קוד (Code Verification)

### 2.1 Header Filter — אופציות סטטוס

| # | בדיקה | קוד | תוצאה |
|---|-------|-----|--------|
| 1 | פילטר מציג 5 אופציות | `unified-header.html` — הכול \| פתוח \| סגור \| ממתין \| מבוטל | ✅ אומת |
| 2 | אופציית "ממתין" בין סגור ל־מבוטל | HTML סדר: סגור → ממתין → מבוטל | ✅ אומת |
| 3 | #selectedStatus מתעדכן | `phoenixFilterBridge.applyFiltersToUI()` מעדכן `#selectedStatus` | ✅ אומת |

### 2.2 סינון ושליחה ל־API

| # | בחירה | קוד | צפוי API |
|---|-------|-----|----------|
| 1 | "פתוח" | `toCanonicalStatus('פתוח')` → `active` | `GET /trading_accounts?status=active` |
| 2 | "סגור" | `toCanonicalStatus('סגור')` → `inactive` | `GET /trading_accounts?status=inactive` |
| 3 | "ממתין" | `toCanonicalStatus('ממתין')` → `pending` | `GET /trading_accounts?status=pending` |
| 4 | "מבוטל" | `toCanonicalStatus('מבוטל')` → `cancelled` | `GET /trading_accounts?status=cancelled` |
| 5 | "הכול" | `value === 'הכול'` → `null` | ללא פרמטר status |

**מיקום:** `tradingAccountsDataLoader.js` (שורות 451–452) — `toCanonicalStatus(statusFilter.textContent)`;  
`phoenixFilterBridge.js` (שורות 363–365) — `normalizeToCanonicalStatus(value)`.

### 2.3 תצוגת Badges בטבלאות

| # | עמודה | קוד | תוצאה |
|---|-------|-----|--------|
| 1 | חשבונות מסחר | `toHebrewStatus(canon)` — פעיל→פתוח, לא פעיל→סגור | ✅ אומת (`tradingAccountsDataLoader.js` 556, 576) |
| 2 | פוזיציות | OPEN→active→"פתוח"; CLOSED→inactive→"סגור" | ✅ אומת (`tradingAccountsDataLoader.js` 799–800) |

### 2.4 סנכרון URL

| # | בדיקה | קוד | תוצאה |
|---|-------|-----|--------|
| 1 | בחירת סטטוס מעדכנת URL | `updateUrlFromFilters()` → `url.searchParams.set('status', ...)` | ✅ אומת |
| 2 | טעינת דף עם `?status=active` | `syncWithUrl()` קורא `urlParams.get('status')` ומחיל על UI | ✅ אומת |

### 2.5 PhoenixFilterBridge / React Context

| # | בדיקה | קוד | תוצאה |
|---|-------|-----|--------|
| 1 | איפוס פילטרים | `clearFilters()` → `statusElement.textContent = 'כל סטטוס'` | ✅ אומת |
| 2 | שמירה ב־sessionStorage | `saveToStorage()` → `sessionStorage.setItem('phoenix-filters', ...)` | ✅ אומת |

---

## 3. תוצאות E2E (סבב חלקי)

**תנאי:** Frontend 8080 + Backend 8082 פעילים. Chrome/Selenium.

| # | בדיקה | תוצאה |
|---|-------|--------|
| 1 | Header Filter — 5 אופציות | ⚠️ FAIL (טקסט ריק ב־getText; תוקן ל־data-value) |
| 2 | בחירת "פתוח" מעדכנת #selectedStatus | לא הושלם (תלוי ב־#1) |
| 3 | URL sync ?status=active | SKIP |
| 4 | תצוגת Badges בטבלה | ✅ PASS — עמודת סטטוס עם פתוח/סגור |

**הערה:** ריצות נוספות נכשלו ב־"Timed out receiving message from renderer" (Chrome). נדרש ריצה חוזרת בסביבה יציבה.

---

## 4. Test Artifact

- **קובץ בדיקה:** `tests/central-status-e2e.test.js`
- **תוצרים:** `documentation/05-REPORTS/artifacts_SESSION_01/central-status-artifacts/CENTRAL_STATUS_RESULTS.json`

---

## 5. מסקנות והמלצות

1. **אימות קוד:** Central Status Function ממומש לפי SSOT — `statusAdapter.js`, `phoenixFilterBridge.js`, `tradingAccountsDataLoader.js` משתמשים בתרגום קנוני/עברי דרך Adapter.
2. **Backend:** אומת בדוח `TEAM_50_TO_TEAM_20_STATUS_STANDARD_QA_REPORT.md` — API תומך ב־status.
3. **E2E:** יש להריץ שוב `node tests/central-status-e2e.test.js` כשהשרתים פעילים.
4. **אם FAIL:** לדווח ל־Team 10 (ולפי הצורך ל־Team 30).

---

**Team 50 (QA & Fidelity)**  
*log_entry | CENTRAL_STATUS_FUNCTION | QA_REPORT | TO_TEAM_10 | 2026-01-31*
