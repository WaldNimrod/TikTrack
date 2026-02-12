# תוכנית עבודה — ADR-015 (מנדט רפרנס ברוקרים ועמלות ברירת מחדל)

**id:** `TEAM_10_ADR_015_WORK_PLAN`  
**owner:** Team 10 (The Gateway)  
**status:** פעיל  
**last_updated:** 2026-02-12  
**מקור:** ARCHITECT_BROKER_REFERENCE_MANDATE.md (ADR-015), PROMPTS FOR THE FIELD.  
**תיקיית האדריכלית:** `_COMMUNICATION/90_Architects_comunication/` (מסונכרן מ-Drive).

---

## 0. זיהוי עמודים (D16 / D18)

| קוד | עמוד (קובץ) | תיאור |
|-----|-------------|--------|
| **D16** | `trading_accounts.html` | חשבונות מסחר — טופס הוספת/עריכת חשבון מסחר (שם חשבון, ברוקר, מספר חשבון, יתרה, מטבע וכו'). |
| **D18** | `brokers_fees.html` | עמלות ברוקרים — טופס הוספת/עריכת עמלה (ברוקר, סוג עמלה, ערך עמלה, מינימום). |

שדות העמלות (commission_type, commission_value, minimum) קיימים **בטופס D18**; Auto-fill יעשה ב-D18 בעת בחירת ברוקר.

---

## 1. סיכום המנדט (ADR-015)

| סעיף | דרישה |
|------|--------|
| **1. מקור נתונים** | GET /api/v1/reference/brokers — רשימה עם `display_name`, `is_supported`, `default_fees`. |
| **2. "אחר"** | פריט 'other' — הכנסת שם ידני; חשבון "אחר" חוסם ייבוא ו-API; הצגת "צור קשר להוספת ברוקר". |
| **3. הזרקת עמלות** | בחירת ברוקר (בטופס הרלוונטי — ראה §0) תאכלס אוטומטית את שדות העמלות לערכי Default. מימוש: **D18** (טופס עמלות). |

---

## 2. סדר ביצוע ותלויות

| שלב | צוות | משימה | תלות | הערה |
|-----|------|--------|------|------|
| **1** | **Team 10** | העברת מנדט + שאלות השלמה לאדריכלית (אם נדרש) | — | ראה § שאלות השלמה להלן. |
| **2** | **Team 20** | הרחבת Endpoint ו-JSON: `display_name`, `is_supported`, `default_fees`. קובץ ברוקרים: **ברוקר אחד לבדיקה (IBKR)** עם **3 עמלות דוגמה** — מבנה כרשומת עמלות קיימת (commission_type, commission_value, minimum). | — | נתוני בדיקה בלבד; העיקר המבנה. |
| **3** | **Team 30** | Conditional Rendering עבור ברוקר "אחר" + הודעת משילות (טקסט מאושר — ראה §3). | — | יכול להתחיל במקביל. |
| **4** | **Team 30** | Auto-fill שדות עמלות ב-**D18** בבחירת ברוקר. | **ממתין ל־Team 20** — חוזה API (default_fees). | |
| **5** | **Team 10** | וידוא השלמה, עדכון Page Tracker / Evidence. | אחרי 2, 3, 4. | |

**עקרון:** אין ניחושים — פערים שדורשים החלטה מתועדים בשאלות השלמה ומועברים לאדריכלית.

---

## 3. הודעת משילות (ברוקר "אחר") — טקסט מאושר

להצגה בבחירת "אחר":

> במידה ולא מצאתם את הברוקר שלכם במערכת, עדין ניתן לייצר את החשבון מסחר — אבל לא ניתן יהיה לייבא אוטומטית נתונים.  
> מומלץ ליצור איתנו קשר ולבקש הוספת הברוקר למערכת, **[קישור למייל של משתמש מנהל ראשי]**.

(במימוש: להחליף את הקטע **[קישור למייל של משתמש מנהל ראשי]** בקישור/מייל בפועל.)

---

## 4. default_fees — מבנה והגדרה לבדיקה

- **מבנה:** בהתאם לרשומת העמלות הקיימת (`brokers_fees`): כל פריט עמלה — `commission_type` (TIERED | FLAT), `commission_value`, `minimum`; שיוך לברוקר via הברוקר שאליו משויכת הרשומה.
- **לבדיקה כרגע:** **ברוקר אחד בלבד — IBKR** — עם **3 עמלות דוגמה ריאליות** שונות. כל הנתונים נתוני בדיקה; העיקר המבנה.

---

## 5. שאלה פתוחה לאדריכלית

| # | שאלה | סיבה |
|---|------|------|
| **3** | **פריט "אחר":** האם "אחר" מוחזר כ־רשומה מה-API (ב־defaults_brokers.json) עם `is_supported: false`, או שמתווסף **רק ב-Frontend** כאופציה ויזואלית? אם מה-API — נדרש מפתח/ערך קבוע (למשל value: "other"). | תיאום Backend–Frontend. |

---

## 6. רפרנסים

- **מנדט:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BROKER_REFERENCE_MANDATE.md` (ADR-015)
- **העתק מקומי:** `_COMMUNICATION/team_10/ARCHITECT_BROKER_REFERENCE_MANDATE.md`
- **API קיים:** `api/routers/reference.py`, `api/services/reference_service.py`, `api/schemas/reference.py`, `api/data/defaults_brokers.json` — כרגע value/label בלבד; נדרשת הרחבה ל־is_supported, default_fees.
- **טפסים:** D16 — `ui/src/views/financial/tradingAccounts/tradingAccountsForm.js` (אין שדות עמלות); D18 — `ui/src/views/financial/brokersFees/brokersFeesForm.js` (commissionType, commissionValue).

---

## 7. הודעות לצוותים

- **Team 20:** [TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md](./TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md)
- **Team 30:** [TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md](./TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md)
- **מסמך סופי לאישור אדריכלית:** [ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md](./ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md)

---

**Team 10 (The Gateway)**  
**log_entry | ADR_015 | WORK_PLAN_CREATED | 2026-02-12**
