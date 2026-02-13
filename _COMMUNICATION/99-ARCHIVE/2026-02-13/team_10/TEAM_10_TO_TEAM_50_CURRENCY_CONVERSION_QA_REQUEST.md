# Team 10 → Team 50: בקשת QA — CURRENCY_CONVERSION flow_type

**מאת:** Team 10 (The Gateway)  
**אל:** Team 50 (QA)  
**תאריך:** 2026-02-12  
**הקשר:** לאחר הרצת מיגרציה add_currency_conversion_flow_type על ידי Team 60  
**תנאי:** לשלוח **רק לאחר** ש-Team 60 מדווח שמיגרציה הורצה בהצלחה  
**תנאי מולא:** ✅ Team 60 אישר — TEAM_60_TO_TEAM_10_CURRENCY_CONVERSION_MIGRATION_COMPLETE.md (2026-02-12)  
**נוהל:** Team 20 → Team 60 (מיגרציה) → Team 60 מדווח → Team 10 → Team 50 (QA)

---

## 1. רקע

Team 20 הוסיף מזהה ברור `flow_type=CURRENCY_CONVERSION` להמרת מטבע (במקום שימוש ב-OTHER).

- **מיגרציה:** `scripts/migrations/add_currency_conversion_flow_type.sql` — הורצה על ידי Team 60
- **נתוני דוגמה:** מעודכנים — TikTrackAdmin ו-test_user כוללים תזרים המרת מטבע

---

## 2. Scope — בדיקות נדרשות

| # | נושא | סוג בדיקה | תוצאה מצופה |
|---|------|-----------|-------------|
| 1 | **D21 — תצוגת תזרימים** | Login כ-TikTrackAdmin או test_user; D21 תזרימי מזומנים | רשומה עם סוג "המרת מטבע" (CURRENCY_CONVERSION) |
| 2 | **D21 — הוספת תזרים** | פתיחת מודול הוספת תזרים; בחירת סוג "המרת מטבע" | אופציה זמינה; שמירה עובדת |
| 3 | **D21 — סינון** | סינון לפי "המרת מטבע" | מציג רק תזרימי המרה |
| 4 | **API currency_conversions** | `GET /api/v1/cash_flows/currency_conversions` | מחזיר תזרימים עם flow_type=CURRENCY_CONVERSION |

---

## 3. משתמשים לבדיקה

| משתמש | סיסמה |
|-------|-------|
| TikTrackAdmin | 4181 |
| test_user | 4181 |

---

## 4. תוצרים מבוקשים

- דוח בדיקות — PASS/FAIL לכל פריט
- אם FAIL: דיווח ל-Team 10 (ולפי הצורך ל-Team 20) לתיקון

---

## 5. רפרנסים

| מסמך | נתיב |
|------|------|
| CASH_FLOW_TYPES_SSOT | documentation/05-REPORTS/artifacts/CASH_FLOW_TYPES_SSOT.md |
| עדכון Team 20 | _COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_CURRENCY_CONVERSION_FLOW_TYPE_UPDATE.md |

---

**log_entry | TEAM_10 | CURRENCY_CONVERSION_QA_REQUEST | TO_TEAM_50 | 2026-02-12**
