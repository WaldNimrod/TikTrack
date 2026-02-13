# Team 10 → Team 20: סטנדרט סטטוסים + D21 ללא סטטוס

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend & DB)  
**תאריך:** 2026-02-12  
**הקשר:** יישום System Status Values — החלטות עדכון

---

## 1. חובה — עדכון לסטנדרט סטטוסים

**כל מקום ב-Backend שמשתמש בסטטוס חייב לעבור לסטנדרט הסטטוסים שלנו** (TT2_SYSTEM_STATUS_VALUES_SSOT):  
ערכים קנוניים בלבד — `active`, `inactive`, `pending`, `cancelled`.

### 1.1 D16 — Trading Accounts

- **משימה:** ליישר את ה-API (list/summary) לסטנדרט.
- **אופציות:** (א) תמיכה ב-query param `status` עם ערכים קנוניים (active|inactive|pending|cancelled), או (ב) תיעוד מפורש של מיפוי `is_active` ↔ active/inactive כחלק מהסטנדרט.
- **מקור:** `documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md`  
  `_COMMUNICATION/team_10/TEAM_10_STATUS_IMPLEMENTATION_READINESS_AND_QUESTIONS.md` §2.2.

---

## 2. D21 — Cash Flows: אין סטטוס

**החלטה:** **לתזרים מזומנים (D21) אין סטטוס.**

- אין להוסיף סינון לפי סטטוס ב-D21.
- לא נדרש שינוי ב-`cash_flows` API לצורך סטטוסים.

---

## 3. סיכום

| נושא | דרישה |
|------|--------|
| D16 (trading_accounts) | עדכון לסטנדרט סטטוסים — קבלה/החזרה של ערכים קנוניים (או תיעוד מיפוי is_active) |
| D21 (cash_flows) | ללא שינוי — אין סטטוס לתזרימים |

---

**log_entry | TEAM_10 | TO_TEAM_20_STATUS_STANDARD_AND_D21 | 2026-02-12**
