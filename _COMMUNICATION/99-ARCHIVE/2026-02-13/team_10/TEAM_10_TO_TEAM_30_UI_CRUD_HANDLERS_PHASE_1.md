# 📡 Team 10 → Team 30: מימוש Handlers להוספה/עריכה/מחיקה (D18, D21)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-02-10  
**נושא:** חוסר — כפתורי צפה/ערוך/מחק קיימים אך handlers עם TODO; נדרש מימוש וחיבור ל-API

---

## 1. הקשר

בדיקת ולידציה של השלמה ב' (צוות 50) אימתה **תצוגת נתונים** ב-D16, D18, D21. בממשק — **כפתורי פעולה קיימים אך handlers לא ממומשים** (TODO); אין טופס הוספה ואין קריאה ל-POST/PUT/DELETE.

---

## 2. ממצאים (מקור: דוח Team 50)

| עמוד | קובץ | שורות (בערך) | ממצא |
|------|------|---------------|--------|
| **D18 Brokers Fees** | `ui/src/views/financial/brokersFees/brokersFeesTableInit.js` | 311–328 | `editButtons` / `deleteButtons` — "TODO: Implement edit/delete action" |
| **D21 Cash Flows** | `ui/src/views/financial/cashFlows/cashFlowsTableInit.js` | 697–744 | `initCashFlowsActionHandlers` — "TODO: Implement view/edit action" |
| **D16 Trading Accounts** | `ui/src/views/financial/tradingAccounts/tradingAccountsTableInit.js` | — | Sort/Filter בלבד; לבדוק אם כפתורי פעולה במקום אחר. |

**כל העמודים:** אין טופס "הוסף רשומה" ואין קריאה ל-POST.

---

## 3. מצב API (לחיבור)

- **Cash Flows (D21):** POST, PUT, DELETE עובדים ב-API — ניתן לחבר את הממשק.
- **Brokers Fees (D18):** POST כרגע מחזיר 500 — צוות 20 מטפל; לאחר תיקון — לחבר POST/PUT/DELETE בממשק.
- **Trading Accounts (D16):** ב-API קריאה בלבד (אין CRUD) — אם נדרש CRUD בממשק, יוגדר בהמשך עם Backend.

---

## 4. תוצר מצופה

- **D21 (Cash Flows):** מימוש handlers לעריכה ומחיקה (וחיפוש אם רלוונטי); טופס/מודל הוספה + קריאה ל-POST; חיבור ל-PUT/DELETE.
- **D18 (Brokers Fees):** מימוש handlers לעריכה ומחיקה; טופס הוספה + POST (לאחר שצוות 20 יתקן את ה-500).
- **D16:** אם נדרש — בתיאום עם הגדרת endpoints ב-API.

---

## 5. רפרנסים

- דוח מפורט: `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1_COMPLETION_B_VALIDATION_REPORT.md` (סעיף 4).
- ממצאים ותיעוד: `_COMMUNICATION/team_10/TEAM_10_PHASE_1_COMPLETION_B_FINDINGS_AND_FOLLOWUP.md`.

---

**log_entry | [Team 10] | TO_TEAM_30 | UI_CRUD_HANDLERS_PHASE_1 | SENT | 2026-02-10**
