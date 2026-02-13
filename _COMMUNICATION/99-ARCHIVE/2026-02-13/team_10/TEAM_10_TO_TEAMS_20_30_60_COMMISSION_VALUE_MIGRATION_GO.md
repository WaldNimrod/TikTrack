# הודעת Go: מיגרציית commission_value → NUMERIC

**אל:** Team 20 (Backend), Team 30 (Frontend), Team 60 (DevOps)  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**מקור:** `TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md`  
**סטטוס:** 📋 **אישור ביצוע — לפעול לפי התוכנית + ההחלטות למטה**

---

## הקשר

Team 30 הגיש תוכנית פעולה להמרת `commission_value` מ־VARCHAR(255) ל־NUMERIC.  
Gateway קיבל החלטות על השאלות הפתוחות. **אלו ההחלטות המחייבות** לביצוע.

---

## החלטות Gateway (חובה ליישום)

1. **דיוק:** `NUMERIC(20, 6)` — לא 20,8. עקבי עם `minimum` ועם תקן Phase 2.
2. **ערכים קיימים:** חילוץ מספר ממחרוזת; אם לא ניתן — default `0`.
3. **יחידות:** נגזר מ־`commission_type` בלבד (ללא שדה DB חדש).
4. **תאימות לאחור:** אין; מיגרציה חד־פעמית.

---

## מה כל צוות צריך לעשות

- **Team 60:** DDL migration — `commission_value` → `NUMERIC(20, 6)`; טיפול בערכים קיימים (parse + default 0).  
  מקור: `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_COMMISSION_VALUE_NUMERIC_MIGRATION_PLAN.md` (שלב 1) + החלטות למעלה.
- **Team 20:** Model + Schema → `Numeric(20, 6)` / `Decimal`; עדכון API ותיעוד.  
  מקור: אותו מסמך — שלב 2; דיוק 20,**6**.
- **Team 30:** טופס והצגה — מספר טהור בשדה; פורמט/יחידות להצגה בלבד (נגזר מ־commission_type).  
  מקור: אותו מסמך — שלב 3.

סדר ביצוע מומלץ: **60 → 20 → 30** (לאחר migration); אחר כך Team 50 ל־E2E.

---

## מסמכי מקור

| מסמך | תוכן |
|------|--------|
| `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_COMMISSION_VALUE_NUMERIC_MIGRATION_PLAN.md` | תוכנית פעולה מפורטת (שלבים, קבצים) |
| `_COMMUNICATION/team_10/TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md` | החלטות Gateway על שאלות פתוחות |

---

**Team 10 (The Gateway)**  
**log_entry | TO_TEAMS_20_30_60 | COMMISSION_VALUE_MIGRATION_GO | SENT | 2026-02-10**
