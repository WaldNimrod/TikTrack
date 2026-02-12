# Team 30 → Team 10: Evidence — אודיט Batch 1+2

**מאת:** Team 30 (Frontend Execution)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מקור:** TEAM_10_TO_TEAM_30_BATCH_1_2_EVIDENCE_REQUEST.md  

---

## 1. Option D — טבלאות D16/D18/D21 (Sticky + Fluid)

### 1.1 מטריצת מימוש

| טבלה | דף | קובץ HTML | קובץ CSS | Sticky Selectors |
|------|-----|-----------|----------|------------------|
| **D16 חשבונות מסחר** | trading_accounts.html | `ui/src/views/financial/tradingAccounts/trading_accounts.html` | `phoenix-components.css` | `col-name` (start), `col-actions` (end) |
| **D16 Account Activity** | trading_accounts.html | אותו קובץ | אותו קובץ | `#accountActivityTable .col-date:first-child` (start), `col-actions` (end) |
| **D18 עמלות** | brokers_fees.html | `ui/src/views/financial/brokersFees/brokers_fees.html` | `phoenix-components.css` | `col-broker` (start, משמש גם col-account), `col-actions` (end) |
| **D21 Cash Flows** | cash_flows.html | `ui/src/views/financial/cashFlows/cash_flows.html` | `phoenix-components.css` | `col-trade` (start), `col-actions` (end) |
| **D21 המרות מטבע** | cash_flows.html | אותו קובץ | אותו קובץ | `#currencyConversionsTable .col-date:first-child` (start), `col-actions` (end) |

### 1.2 קובץ CSS — SSOT

**קובץ:** `ui/src/styles/phoenix-components.css` (שורות 1328–1429)

| Selector | שורות |
|----------|--------|
| `.col-name`, `.col-symbol`, `.col-broker`, `.col-trade` | 1332–1393 |
| `#accountActivityTable .col-date:first-child`, `#currencyConversionsTable .col-date:first-child` | 1397–1412 |
| `.col-actions` (inset-inline-end: 0) | 1417–1429 |

### 1.3 אימות Option D

- **Atomic/Fluid/Expansion:** `phoenix-table` משתמש ב-`table-layout: auto`, עמודות נתונים עם `clamp()` ו-`min-width` (שורות 617–649).
- **Sticky Start:** `inset-inline-start: 0` — col-name, col-symbol, col-broker, col-trade, col-date (first).
- **Sticky End:** `inset-inline-end: 0` — col-actions.
- **SSOT:** `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md` (Option D).

---

## 2. Header Persistence (Login → Home)

### 2.1 זרימת הלוגיקה

1. **דף Login:** `index.html` טוען `headerLoader.js` לפני ה-React root.
2. **headerLoader:** בודק `window.location.pathname` — אם `/login` | `/register` | `/reset-password` → **לא טוען Header** (כוונה).
3. **התחברות מוצלחת:** `LoginForm` קורא ל-`navigate('/dashboard')` → React Router מפנה ל-`/` (נתיב ברירת מחדל).
4. **ניווט:** רוב הניווט הוא client-side (ללא reload) — `headerLoader` רץ רק ב-`DOMContentLoaded` הראשוני.

### 2.2 סיכון

כשהמשתמש נכנס ישירות ל-`/login`, ה-Header לא נטען. אחרי התחברות וניווט ל-`/` (client-side), ה-Header עלול לא להופיע כי `headerLoader` לא רץ שוב.

### 2.3 המלצה לאימות

**בדיקה ידנית / E2E:**
1. גלוש ל-`/login`
2. התחבר
3. אמת שה-Header מופיע בעמוד הבית (`/` או `/dashboard`)

**אם לא:** לשקול `window.location.href = '/'` לאחר התחברות (reload מלא) כדי ש-`headerLoader` יטען מחדש.

**סטטוס:** נדרשת בדיקה E2E — לא בוצעה כחלק מהאודיט הנוכחי.

---

## 3. D18 Fees UI — trading_account_id בלבד

### 3.1 אישור

**D18 (עמלות ברוקרים) משתמש ב-`trading_account_id` בלבד ליצירה ולעריכה. אין בורר Broker בשכבת ה-UI.**

### 3.2 הפניות לקוד

| קובץ | שורות | תיאור |
|------|--------|--------|
| `ui/src/views/financial/brokersFees/brokersFeesForm.js` | 62–68, 140–167 | שדה `tradingAccountId` (בחירת חשבון מסחר); אין שדה broker |
| `ui/src/views/financial/brokersFees/brokersFeesTableInit.js` | 522–535 | `handleSaveBrokerFee` שולח `trading_account_id` ב-body של POST/PUT |

### 3.3 Evidence קיים

`documentation/05-REPORTS/artifacts_SESSION_01/TEAM_30_ADR_015_D18_FEES_PER_ACCOUNT_EVIDENCE.md`

---

## 4. רפרנסים

- **SSOT Option D:** `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`
- **בקשת Evidence:** `TEAM_10_TO_TEAM_30_BATCH_1_2_EVIDENCE_REQUEST.md`
- **אודיט:** `TEAM_90_BATCH_1_2_DECISION_AUDIT_REPORT.md`

---

**Team 30 (Frontend Execution)**  
**log_entry | BATCH_1_2_EVIDENCE | TO_TEAM_10 | 2026-02-12**
