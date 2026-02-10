# Team 50 → צוותים: Gate B Feedback (מידע מפורט לתיקון)

**id:** `TEAM_50_GATE_B_FEEDBACK_TO_TEAMS`  
**date:** 2026-02-07  
**context:** ריצת בדיקות לאחר תיקוני צוותים — 4 כישלונות E2E

---

## סיכום ביצוע

| סדרה | תוצאה |
|------|--------|
| Runtime | 12/12 PASS |
| E2E | 12/24 PASS (50%) — 4 FAIL |

---

## כישלון 1: D16 Trading Accounts — Team 30

### תסמינים
- errorsExcludingFavicon: **3**
- הבדיקה נכשלת כי `errors.length > 0` (דרוש 0 SEVERE)

### Console (מהארטיפקט)
- UAI נטען, accountsTable/accountActivityTable/positionsTable מאותחלים
- Header: "Header inserted before .page-wrapper (via parentNode)"
- אין SEVERE מפורש ב־20 הלוגים הראשונים — השגיאות כנראה מ־Network (resource failed)

### השערה
- שגיאות SEVERE מ־Network (כגון 4xx/5xx) שמופיעות ב־Console
- ייתכן endpoint מסוים מחזיר שגיאה

### פעולה נדרשת
- לפתוח D16 בדפדפן, F12 → Console, לסנן SEVERE/Error
- לזהות בדיוק אילו משאבים נכשלים
- לתקן (favicon / endpoint / אחר)

---

## כישלון 2: D18 Brokers Fees — Team 20 + אולי Team 30

### שגיאה מזוהה במדויק
```
SEVERE: http://localhost:8080/api/v1/brokers_fees/summary - Failed to load resource: 400 (Bad Request)
INFO: [Shared Services] GET request failed
```

### סיבה
- `GET /api/v1/brokers_fees/summary` מחזיר **400 Bad Request**
- Runtime: אותה אזהרה (D18 Summary 400)

### פעולה נדרשת — Team 20
- לבדוק מה ה־Backend דורש: פרמטרים חובה? schema?
- לתקן כך שה־summary יעבוד עם הפרמטרים שה־DataLoader שולח (או לעדכן DataLoader בהתאם)
- **קובץ:** `api/routers/brokers_fees.py` או שירות Summary

### הערה — Team 30
- `brokersFeesDataLoader.js` כבר מסיר `page` ו־`pageSize` מקריאת summary (Gate B Fix)
- אם נדרשים פרמטרים נוספים — יש לעדכן את ה־DataLoader

---

## כישלון 3: D21 Cash Flows — ייתכן Team 20

### תסמינים
- errorsExcludingFavicon: **4**
- UAI נטען, cashFlowsTable/currencyConversionsTable מאותחלים
- Header נטען

### השערה
- ייתכן `cash_flows/summary` או `cash_flows/currency_conversions` מחזירים 4xx
- או מספר שגיאות Network

### פעולה נדרשת
- לבדוק Console ב־D21, לסנן SEVERE
- אם יש 400/404/500 — לתקן ב־Backend או ב־DataLoader

---

## כישלון 4: Security_TokenLeakage — Team 50 (לוגיקת הבדיקה)

### תסמינים
- "Security validation failed - token leakage detected"

### סיבה
- הבדיקה מחפשת `access_token` / `Bearer` ב־Console וב־DOM
- `maskedLog` ועוד קוד עשויים להזכיר את המילים בלי לחשוף token

### פעולה נדרשת — Team 50
- לשנות את לוגיקת הזיהוי: רק JWT ממשי (למשל `Bearer eyJ...` באורך מלא)
- לא לסמן כהדלפה רק בגלל המילה `access_token` בטקסט

---

## טבלת אחריות

| כישלון | צוות | פעולה |
|--------|------|--------|
| D16 (3 SEVERE) | Team 30 | איתור SEVERE ב־Console, תיקון מקור |
| D18 (brokers_fees/summary 400) | **Team 20** | תיקון Backend / פרמטרים |
| D21 (4 SEVERE) | Team 20/30 | איתור SEVERE, תיקון |
| Security Token Leakage | **Team 50** | עדכון לוגיקת בדיקה |

---

## נתיבי Evidence

```
documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/
  - console_logs.json   (כל ה־SEVERE לפי test)
  - network_logs.json
  - test_summary.json
```

---

## מה עובד (ללא שינוי)

- Login
- CRUD (API calls מזוהים)
- Routes SSOT
- Runtime (12/12)
- Header Loader
- UAI, Shared Services, Auth Guard

---

**Team 50 (QA & Fidelity)**  
**log_entry | GATE_B | FEEDBACK_TO_TEAMS | 2026-02-07**
