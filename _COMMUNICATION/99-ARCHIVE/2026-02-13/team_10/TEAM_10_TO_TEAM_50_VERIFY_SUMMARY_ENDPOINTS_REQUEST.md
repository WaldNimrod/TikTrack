# Team 10 → Team 50: בקשת אימות — Summary Endpoints (1.2.1)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 50 (QA & Fidelity)  
**תאריך:** 2026-02-12  
**נושא:** אימות בפועל של Endpoints Summary + Conversions  
**מקור:** TEAM_10_BACKEND_SIDE_20_60_GAPS_AND_DECISIONS.md; TEAM_10_BACKEND_GAPS_20_60_TEAM_90_RESPONSE_ACK.md

---

## 1. מטרה

לאמת **בפועל** שכל ה-Summary ו-Conversions endpoints מגיבים תחת Base URL הנכון (למשל `http://localhost:8082/api/v1` או כפי שמוגדר בסביבה). Team 20 מבצע עדכון OpenAPI/SSOT לאחר אימות — נדרש אימות עצמאי (QA) כדי שזה יקרה על בסיס עובדות.

---

## 2. Scope — Endpoints לאימות

| # | נתיב | שיטה | צפוי |
|---|------|------|------|
| 1 | `/api/v1/trading_accounts/summary` | GET | 200; גוף summary (למשל total_accounts, active_accounts) |
| 2 | `/api/v1/brokers_fees/summary` | GET | 200; גוף summary |
| 3 | `/api/v1/cash_flows/summary` | GET | 200; גוף summary (אם קיים כנתיב נפרד) |
| 4 | `/api/v1/cash_flows/currency_conversions` | GET | 200; רשימת תזרימי המרת מטבע |

**הערה:** JWT Bearer token נדרש (לפי מדיניות ה-API). להשתמש במשתמש QA (למשל TikTrackAdmin) כפי שמתועד.

---

## 3. תוצר מבוקש

- **דוח קצר** — PASS/FAIL לכל endpoint; ציון Base URL ו־auth שבו השתמשתם.
- **מיקום:** `_COMMUNICATION/team_50/` — דוח ל-Team 10 (ולפי הצורך ל-Team 20 לעדכון SSOT).

---

## 4. תיאום

- Team 20 קיבל מנדט ביצוע (אימות + עדכון OpenAPI/SSOT). אימות שלכם נותן בסיס אובייקטיבי לסגירת 1.2.1.

---

**Team 10 (The Gateway)**  
**log_entry | TEAM_10 | TO_TEAM_50_VERIFY_SUMMARY_ENDPOINTS_REQUEST | 2026-02-12**
