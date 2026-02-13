# החלטות Gateway: המרת commission_value ל-NUMERIC

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-10  
**מקור:** שאלות פתוחות מתוך `TEAM_30_TO_TEAM_10_COMMISSION_VALUE_NUMERIC_MIGRATION_PLAN.md`  
**סטטוס:** ✅ **החלטות סופיות — לצורך ביצוע**

---

## 1. רמת דיוק

**החלטה:** `NUMERIC(20, 6)` (לא 20,8).

**הצדקה:**
- ב-DDL הרשמי (`PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`) עמודת `minimum` באותה טבלה מוגדרת כ-`NUMERIC(20, 6)`.
- תקן הפרויקט ל־Phase 2: כל השדות הכספיים — **NUMERIC(20,6)** (SSOT / Page Tracker).
- עקביות עם שדות פיננסיים אחרים (`amount`, `commission`, `fee`) ומונעת חריגה מתקן.

---

## 2. ערכים קיימים (Migration)

**החלטה:**
- חילוץ **מספר** מתוך מחרוזות קיימות (למשל regex או פונקציה שמזהה מספר ראשון).
- אם לא ניתן לחלץ ערך תקף — **ברירת מחדל: `0`**.
- תיעוד הלוגיקה ב־migration script; אין תמיכה ב־NULL בשדה (NOT NULL נשמר).

---

## 3. יחידות

**החלטה:** **אפשרות B** — יחידות **נגזרות מ־`commission_type`** (למשל TIERED → `$ / Share`, FLAT → `%`).  
אין שדה DB חדש; יחידות רק להצגה ב־UI/דוחות.

---

## 4. Backward Compatibility

**החלטה:** **לא** — אין תמיכה ongoing ב־VARCHAR.  
מיגרציה חד־פעמית; לאחר הרצתה ה־API והאפליקציה עובדים רק עם NUMERIC.

---

## 5. סיכום להעברה לצוותים

| נושא | החלטה |
|------|--------|
| דיוק DB | `NUMERIC(20, 6)` |
| ערכים קיימים | חילוץ מספר ממחרוזת; default `0` אם unparseable |
| יחידות | נגזר מ־`commission_type` — ללא שדה חדש |
| תאימות לאחור | אין; מיגרציה חד־פעמית |

---

**Team 10 (The Gateway)**  
**log_entry | COMMISSION_VALUE_NUMERIC_DECISIONS | RECORDED | 2026-02-10**
