# Team 20 → Team 50: בקשת בדיקה וולידציה — סטנדרט סטטוסים D16

**מאת:** Team 20 (Backend)  
**אל:** Team 50 (QA & Fidelity)  
**תאריך:** 2026-02-12  
**הקשר:** TEAM_10_TO_TEAM_20_STATUS_STANDARD_AND_D21.md  
**מקור:** TT2_SYSTEM_STATUS_VALUES_SSOT  

---

## 1. רקע

Team 20 השלים יישום סטנדרט סטטוסים ב-D16 (trading_accounts) לפי TT2_SYSTEM_STATUS_VALUES_SSOT.  
נדרש **סבב בדיקות וולידציה** לוודא שהשינויים פועלים כמצופה.

---

## 2. Scope — בדיקות נדרשות

### 2.1 Query param — סינון לפי סטטוס קנוני

| # | בדיקה | צפוי | Endpoint |
|---|-------|------|----------|
| 1 | `GET /api/v1/trading_accounts?status=active` | 200; רק חשבונות עם is_active=true | List |
| 2 | `GET /api/v1/trading_accounts?status=inactive` | 200; רק חשבונות עם is_active=false | List |
| 3 | `GET /api/v1/trading_accounts?status=pending` | 200; מיפוי ל-inactive (אין pending ב-D16) | List |
| 4 | `GET /api/v1/trading_accounts?status=cancelled` | 200; מיפוי ל-inactive | List |
| 5 | `GET /api/v1/trading_accounts` (ללא status) | 200; כל החשבונות | List |
| 6 | `GET /api/v1/trading_accounts/summary?status=active` | 200; סיכום מסונן לפעילים | Summary |
| 7 | `GET /api/v1/trading_accounts/summary?status=inactive` | 200; סיכום מסונן ללא-פעילים | Summary |

### 2.2 Response — שדה status בתגובה

| # | בדיקה | צפוי |
|---|-------|------|
| 1 | כל פריט ב-list כולל שדה `status` | `"active"` או `"inactive"` |
| 2 | `status` תואם ל-`is_active` | status=active ↔ is_active=true; status=inactive ↔ is_active=false |
| 3 | GET /api/v1/trading_accounts/{id} | תגובה כוללת `status` קנוני |

### 2.3 ערכים לא חוקיים

| # | בדיקה | צפוי |
|---|-------|------|
| 1 | `?status=invalid` | 200; אין סינון (status מתעלם; כל הנתונים) |
| 2 | `?status=` (ריק) | 200; אין סינון |

---

## 3. תוצרים מבוקשים

- **דוח בדיקות** — אילו בדיקות הורצו, תוצאה (PASS/FAIL).
- **אם FAIL** — דיווח ל-Team 20 (ולפי הצורך ל-Team 10) לצורך תיקון.

---

## 4. רפרנסים

| מסמך | נתיב |
|------|------|
| מנדט Team 10 | _COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_STATUS_STANDARD_AND_D21.md |
| דוח השלמה Team 20 | _COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_STATUS_STANDARD_IMPLEMENTATION_COMPLETE.md |
| SSOT סטטוסים | documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md |

---

## 5. D21 — Cash Flows

**אין שינוי** — D21 ללא סטטוס. אין צורך בבדיקות סטטוס ל-cash_flows.

---

**Team 20 (Backend)**  
**log_entry | STATUS_STANDARD | QA_REQUEST | TO_TEAM_50 | 2026-02-12**
