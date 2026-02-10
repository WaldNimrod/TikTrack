# Team 50 — Gate B QA Re-Run Feedback (אחרי תיקון Team 30)

**id:** `TEAM_50_GATE_B_QA_RERUN_FEEDBACK`  
**date:** 2026-02-07  
**context:** ריצה חוזרת לאחר `TEAM_30_TO_TEAM_10_NAVIGATION_LINKS_COMPLETE_FIX.md`

---

## תוצאות סופיות

| סדרת בדיקות | תוצאה | פרטים |
|-------------|--------|-------|
| **Runtime** | 12/12 PASS | 0 Failed, 1 Warning (D18 summary 400) |
| **E2E** | 12/24 PASS (50%) | 4 Failed |

---

## Runtime — PASS

כל הבדיקות עברו:
- Login, D16/D18/D21 Page Load, API endpoints, trading_accounts/summary (200)

---

## E2E — פירוט כישלונות

### 1. D16 Trading Accounts — FAIL
- **errorsExcludingFavicon:** 3
- **תסמינים:** pageWrapper או container0 ([data-section="summary-alerts"]) לא נמצאים, או tokenLeakage, או 3+ שגיאות SEVERE
- **Console:** UAI נטען, PhoenixTableSortManager/FilterManager ל-accountsTable — הדף נטען. Header Loader: "Auth page detected" (מעמוד login)

### 2. D18 Brokers Fees — FAIL
- **errorsExcludingFavicon:** 4
- **שגיאה מזוהה:** `brokers_fees/summary` — **400 Bad Request**
  ```
  SEVERE: http://localhost:8080/api/v1/brokers_fees/summary?page=1&page_size=25 - Failed to load resource: 400 (Bad Request)
  ```
- **Console:** UAI נטען, brokersTable מאותחל, Header inserted before .page-wrapper

### 3. D21 Cash Flows — FAIL
- **פירוט:** (לא מופיע SEVERE ספציפי מלבד favicon ב־grep — ייתכן שגיאות מתוך session מלא)

### 4. Security_TokenLeakage — FAIL
- **תסמין:** "Security validation failed - token leakage detected"
- **סיבה אפשרית:** הלוגיקה מזהה "access_token" או "Bearer" ב־Console/DOM גם כשאין הדלפה ממשית (למשל במסגרת maskedLog)

---

## מה עובד

- Login — PASS
- CRUD TradingAccounts, BrokersFees, CashFlows — API calls מזוהים
- Routes_SSOT_Compliance — PASS

---

## בעיות שנותרו (פירוט מלא)

### א. favicon.ico 404 — SEVERE
- מופיע בכל העמודים
- **פתרון מומלץ:** הוספת `favicon.ico` ל־`ui/public/` או `<link rel="icon" ...>` ב־HTML

### ב. brokers_fees/summary — 400 Bad Request
- ה-endpoint מחזיר 400 עם `page=1&page_size=25`
- **פתרון:** Team 20 — בדיקת פרמטרים נדרשים ל־summary (למשל trading_account_id, date range)
- **הערה:** Runtime גם מדווח Warning על D18 Summary 400

### ג. D16/D18/D21 — תנאי PASS
- הבדיקה דורשת: `errors.length === 0` (לאחר הסרת favicon), `!tokenLeakage`, `pageWrapper`, `container0`/`summarySection`
- כשיש SEVERE נוסף (למשל brokers_fees/summary 400) — `errors.length > 0` והבדיקה נכשלת

### ד. Security Token Leakage — False Positive?
- הלוגיקה מחפשת `access_token` או `Bearer` ב־console/DOM
- ייתכן ש־maskedLog או טקסט אחר מכילים את המילה בלי לחשוף token
- **פתרון מומלץ:** צמצום הלוגיקה — לזהות רק JWT מלא (למשל `Bearer eyJ`) או token באורך גדול

---

## קבצי Evidence

- Console: `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/console_logs.json`
- Network: `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/network_logs.json`
- Summary: `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/test_summary.json`

---

## המלצות ל־צוותים

| צוות | משימה |
|------|--------|
| **Team 30** | favicon.ico — הוספת קובץ או link ב־head |
| **Team 20** | brokers_fees/summary — תמיכה בפרמטרים או תיקון 400 |
| **Team 50** | עדכון לוגיקת Token Leakage — צמצום ל־JWT ממשי בלבד |

---

**log_entry | [Team 50] | GATE_B | QA_RERUN_FEEDBACK | 2026-02-07**
