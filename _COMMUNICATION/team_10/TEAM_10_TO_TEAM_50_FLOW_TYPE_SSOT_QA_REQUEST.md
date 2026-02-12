# Team 10 → Team 50: בקשת QA — Flow Type SSOT (flowTypeValues)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 50 (QA & Fidelity)  
**תאריך:** 2026-02-12  
**הקשר:** TEAM_20_TO_TEAM_30_CURRENCY_CONVERSION_FLOW_TYPE_UPDATE + יישום SSOT בממשק  
**מקור:** documentation/05-REPORTS/artifacts/CASH_FLOW_TYPES_SSOT.md  

---

## 1. רקע

Team 30 השלים יישום **מקור אמת משותף** לסוגי תזרים — `ui/src/utils/flowTypeValues.js`.  
כל תצוגה וטופס משתמשים ב-`toFlowTypeLabel()` ו-`getFlowTypeOptions()`.

**בדיקת CURRENCY_CONVERSION הבסיסית** — אומתה (TEAM_50_TO_TEAM_10_CURRENCY_CONVERSION_QA_REPORT).  
**בקשת QA זו** — וידוא תאימות הממשק לאחר יישום flowTypeValues SSOT.

---

## 2. Scope — בדיקות נדרשות

### 2.1 תצוגה אחידה בכל הממשקים

| # | מיקום | בדיקה | צפוי |
|---|-------|-------|------|
| 1 | **D21 — טבלת תזרימים** | עמודת סוג תנועה | DEPOSIT→הפקדה, WITHDRAWAL→משיכה, CURRENCY_CONVERSION→המרת מטבע, וכו' |
| 2 | **D16 — תנועות חשבון** | עמודת סוג בטבלת תנועות (תוך חשבון מסחר) | אותם תוויות — CURRENCY_CONVERSION→המרת מטבע |
| 3 | **D21 — טופס הוספת תזרים** | תפריט סוג תנועה | 7 אופציות: הפקדה, משיכה, דיבידנד, ריבית, עמלה, המרת מטבע, אחר |
| 4 | **D21 — פילטר סוג** | תפריט סינון | אותן אופציות; סינון לפי "המרת מטבע" עובד |

### 2.2 סדר אופציות (SSOT)

| # | בדיקה | צפוי |
|---|-------|------|
| 1 | סדר בתפריט טופס | DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE, CURRENCY_CONVERSION, OTHER |
| 2 | סדר בפילטר D21 | כל הסוגים → הפקדה → משיכה → דיבידנד → ריבית → עמלה → המרת מטבע → אחר |

---

## 3. תוצרים מבוקשים

- **דוח בדיקות** — PASS/FAIL לכל פריט.
- **אם FAIL** — דיווח ל-Team 10 (ולפי הצורך ל-Team 30) לתיקון.

---

## 4. רפרנסים

| מסמך | נתיב |
|------|------|
| CASH_FLOW_TYPES_SSOT | documentation/05-REPORTS/artifacts/CASH_FLOW_TYPES_SSOT.md |
| flowTypeValues (קוד) | ui/src/utils/flowTypeValues.js |
| עדכון Team 20 | _COMMUNICATION/team_20/TEAM_20_TO_TEAM_30_CURRENCY_CONVERSION_FLOW_TYPE_UPDATE.md |
| דוח CURRENCY_CONVERSION (קיים) | _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_CURRENCY_CONVERSION_QA_REPORT.md |

---

## 5. משתמשים לבדיקה

| משתמש | סיסמה |
|-------|-------|
| TikTrackAdmin | 4181 |
| test_user | 4181 |

---

**Team 10 (The Gateway)**  
**log_entry | FLOW_TYPE_SSOT_QA_REQUEST | TO_TEAM_50 | 2026-02-12**
