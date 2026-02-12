# Team 10 → Team 20: מנדט ADR-015 — Endpoint רפרנס ברוקרים

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend)  
**תאריך:** 2026-02-12  
**מקור:** ARCHITECT_BROKER_REFERENCE_MANDATE.md (ADR-015), PROMPTS FOR THE FIELD.

---

## 1. המנדט (ADR-015)

האדריכלית הפעילה את מנדט הברוקרים (ADR-015). עליכם לממש/להרחיב את Endpoint הרפרנס לברוקרים.

---

## 2. דרישות מהמנדט

| דרישה | פירוט |
|--------|--------|
| **Endpoint** | GET /api/v1/reference/brokers (קיים — נדרשת **הרחבה**). |
| **תוכן התגובה** | רשימה הכוללת: **display_name**, **is_supported**, **default_fees**. |
| **is_supported** | שדה שישמש את ה-Frontend **לחסימת ייבוא עתידי** — חשבון "אחר" יחסום ייבוא ו-API. |
| **קובץ JSON** | הכנת/עדכון קובץ הברוקרים עם **default_fees** — כרגע **ברוקר אחד לבדיקה: IBKR**, עם **3 עמלות דוגמה ריאליות** שונות. העיקר המבנה; כל הנתונים נתוני בדיקה. |

---

## 3. מצב קיים (להרחבה)

- `api/routers/reference.py`, `api/services/reference_service.py`, `api/schemas/reference.py` — מחזירים כיום **value/label** בלבד.
- `api/data/defaults_brokers.json` — מערך של `{ value, label }` בלי `is_supported` ו־`default_fees`.

**נדרש:** הרחבת הסכמה והשירות כך שהתגובה תכלול לכל פריט: `display_name` (או value/label), `is_supported`, `default_fees`.

**מבנה default_fees:** בהתאם לרשומת העמלות הקיימת (`brokers_fees`). כל פריט עמלה: `commission_type` (TIERED | FLAT), `commission_value`, `minimum`; שיוך לברוקר via הברוקר שאליו משויכת הרשומה. כרגע: **ברוקר אחד — IBKR** — עם **3 עמלות דוגמה** (נתוני בדיקה).

---

## 4. תוצר מצופה

- Endpoint GET /api/v1/reference/brokers מחזיר לכל פריט: `display_name` (או מקביל), `is_supported`, `default_fees`.
- קובץ נתוני ברוקרים (למשל defaults_brokers.json) מעודכן במבנה החדש.
- עדכון OpenAPI/תיעוד.
- דוח השלמה ל-Team 10 עם רפרנס ל-ADR-015.

---

## 5. רפרנסים

- **מנדט:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BROKER_REFERENCE_MANDATE.md`
- **שאלות השלמה (אם רלוונטי):** `_COMMUNICATION/team_10/TEAM_10_TO_ARCHITECT_ADR_015_COMPLETION_QUESTIONS.md`
- **תוכנית עבודה:** [TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md](./TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md)

---

**Team 10 (The Gateway)**  
**log_entry | ADR_015 | MANDATE_TO_TEAM_20 | 2026-02-12**
