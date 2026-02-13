# Team 10 → Team 20: מנדט ADR-015 — רפרנס ברוקרים + עמלות לפי חשבון מסחר

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend)  
**תאריך:** 2026-02-12  
**עדכון:** 2026-02-12 — **עמלות קשורות לחשבון מסחר (Fees per Trading Account).**  
**מקור:** ARCHITECT_BROKER_REFERENCE_MANDATE.md (ADR-015); החלטת אדריכלית.

**סטטוס:** READY FOR DISTRIBUTION — ראה ADR_015_READY_FOR_DISTRIBUTION.md.

---

## 1. עקרון מחייב

**עמלות שייכות לחשבון מסחר (Trading Account), לא לברוקר.**  
ברוקר הוא מטא-דאטה של חשבון. אין קשר ישיר "Broker → Fees" במודל.  
**חובה:** בכל רשומת עמלה — **trading_account_id**. **אין** להשאיר "broker" כ־foreign key בעמלות.

---

## 2. דרישות מהמנדט

### 2.1 Endpoint רפרנס ברוקרים (לשימוש ב-D16)

| דרישה | פירוט |
|--------|--------|
| **Endpoint** | GET /api/v1/reference/brokers (קיים — נדרשת **הרחבה**). |
| **תוכן התגובה** | לכל פריט: **display_name**, **is_supported**, **default_fees**. |
| **is_supported** | לשם חסימת ייבוא עתידי — חשבון "אחר" יחסום ייבוא ו-API. |
| **default_fees** | ערכי ברירת מחדל **להצעת מילוי** (לא "עמלות בבעלות ברוקר"). מבנה: commission_type, commission_value, minimum. כרגע: ברוקר אחד (IBKR) + 3 עמלות דוגמה — נתוני בדיקה. |

### 2.2 DB / API — עמלות לפי חשבון (תיקון עומק)

| דרישה | פירוט |
|--------|--------|
| **קשר Account ↔ Fees** | אם אין today — **להוסיף/לעדכן**: בכל רשומת עמלה **trading_account_id** (או מיפוי מוכר). |
| **commission_value** | **NUMERIC(20,6)** — SSOT: TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md. |
| **אין broker כ-FK בעמלות** | **לא** להשאיר "broker" כ־foreign key / בעלים של עמלות. ברוקר נגזר מחשבון המסחר. |
| **קונטקסט** | ה-DB כרגע מחזיק טבלת brokers_fees עם broker ו-user_id בלבד (ללא account FK). **זה לא תואם את ההחלטה. חובה לבצע תיקון עומק + מיגרציה (§2.3).** |

### 2.3 מיגרציה Account↔Fees (ביצוע בפועל)

**חובה:** מיגרציה מפורשת — ראה תוכנית העבודה §6א. קיצור:

1. **מיפוי:** לכל עמלה קיימת (user_id, broker) — חפש חשבון מסחר עם אותו user_id ו-broker.
2. **התאמה יחידה:** חשבון אחד תואם → עדכן trading_account_id.
3. **כמה התאמות:** שייך לראשון לפי created_at.
4. **אין התאמה:** רשום ב-migration log; החלטה: מחיקה / חשבון דמה / תיקון ידני — **לממש ולתעד** במסמך המיגרציה.
5. **commission_value:** אם VARCHAR — המרה ל-NUMERIC(20,6) לפי TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md.
6. **סיום:** הוספת trading_account_id, מילוי, הסרת broker, NOT NULL.

**תוצר:** סקריפט מיגרציה מתועד; דוח ל-Team 10 (כמה שויכו, כמה ללא התאמה, איך טופלו). **הרצה בסביבה:** תיאום עם Team 60 (הרצת מיגרציה / `make db-*` לפי נוהל) — Team 60 לא כותב את לוגיקת המיגרציה.

---

## 3. תוצר מצופה

- GET /api/v1/reference/brokers — תגובה מורחבת (display_name, is_supported, default_fees); קובץ ברוקרים (למשל defaults_brokers.json) במבנה החדש.
- **מודל עמלות:** עמלות משויכות לחשבון מסחר (trading_account_id); הסרת broker כ-FK בעמלות; מיגרציה/תיקון טבלה קיימת לפי SSOT.
- עדכון OpenAPI/תיעוד.
- דוח השלמה ל-Team 10 עם רפרנס ל-ADR-015.

---

## 4. רפרנסים

- **תוכנית עבודה:** [TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md](./TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md)
- **מסמך סופי לאישור:** [ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md](./ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md)
- **SSOT DDL:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — `user_data.brokers_fees` עם `trading_account_id`, ללא `broker`; `commission_value` NUMERIC(20,6) — TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md.
- **מיגרציה:** תוכנית עבודה §6א + מנדט זה §2.3.
- **"אחר" (נעול):** "אחר" מגיע מה-API עם `value: "other"`, `is_supported: false` — ADR_015_FINAL §8.

---

**Team 10 (The Gateway)**  
**log_entry | ADR_015 | MANDATE_TO_TEAM_20_UPDATED_FEES_PER_ACCOUNT | 2026-02-12**
