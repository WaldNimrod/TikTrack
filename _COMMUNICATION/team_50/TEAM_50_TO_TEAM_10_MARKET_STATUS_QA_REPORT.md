# Team 50 → Team 10: דוח QA — מפתח מצב שוק (Market Status)

**id:** `TEAM_50_TO_TEAM_10_MARKET_STATUS_QA_REPORT`  
**from:** Team 50 (QA & Fidelity)  
**to:** Team 10 (The Gateway)  
**re:** TEAM_10_TO_TEAM_50_MARKET_STATUS_QA_NOTE  
**date:** 2026-01-31

---

## 1. סיכום מנהלים

| פריט | תוצאה |
|------|--------|
| **1. שעון + מפתח צבעים** | ✅ PASS — מופיעים בכל 4 הדפים הרלוונטיים |
| **2. כישלון (401, network)** | ✅ PASS — מפתח הצבעים מוסתר, ללא קריסה |
| **3. נגישות** | ✅ PASS — `aria-label` ו־`title` על מפתח הצבעים |

---

## 2. פריטים לבדיקה — תוצאות

### 2.1 שעון + מפתח צבעים בדפים הרלוונטיים

| דף | שעון | מפתח צבעים | צבעים (מצופה) |
|-----|------|------------|----------------|
| tickers | ✅ | ✅ | פתוח (ירוק), פרהמרקט/אפטר (כתום), סגור (אפור) |
| trading_accounts | ✅ | ✅ | — |
| cash_flows | ✅ | ✅ | — |
| brokers_fees | ✅ | ✅ | — |

**הערה:** דשבורד נתונים (`data_dashboard.html`) — אינו טוען `stalenessClock.js` / `eodStalenessCheck.js` (משתמש ב־`dataDashboardTableInit.js` נפרד). מפתח מצב שוק לא מופיע שם. אם נדרש — יש להוסיף את הסקריפטים.

### 2.2 כישלון (401, network)

- **בדיקה:** קריאה ל־`updateStalenessClock('ok', null, null)` — סימולציה של כישלון (ללא `marketStatus`).
- **תוצאה:** מפתח הצבעים מוסתר (`display: none`), אין קריסה.

### 2.3 נגישות

- **Card mode (tickers):** `title="מצב שוק: {label}"` + `aria-label` על אלמנט מפתח הצבעים.
- **Inline mode (trading_accounts, cash_flows, brokers_fees):** `title` + `aria-label="מצב שוק"` על `#market-status-key`.

---

## 3. API

| פריט | ערך |
|------|------|
| **Endpoint** | `GET /api/v1/system/market-status` |
| **Auth** | Bearer token |
| **תשובה** | `market_state`, `display_label` |
| **בדיקה** | ✅ מחזיר JSON תקין (למשל `{"market_state":"unknown","display_label":"—"}`) |

---

## 4. אוטומציה

**קובץ בדיקה:** `tests/market-status-qa.e2e.test.js`  

**הרצה:** `cd tests && node market-status-qa.e2e.test.js`

---

**log_entry | TEAM_50 | TO_TEAM_10 | MARKET_STATUS_QA_REPORT | 2026-01-31**
