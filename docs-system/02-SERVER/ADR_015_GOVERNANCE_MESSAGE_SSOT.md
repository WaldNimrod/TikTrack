# ADR-015 — הודעת משילות "ברוקר אחר" (SSOT)

**id:** `ADR_015_GOVERNANCE_MESSAGE_SSOT`  
**owner:** Team 10 / Architect  
**status:** LOCKED  
**last_updated:** 2026-02-12  

---

## 1. מטרה

ערך קבוע אחד למקור קישור/מייל ל"משתמש מנהל ראשי" — להצגה בהודעת המשילות בבחירת ברוקר "אחר" (D16). אין placeholders במסמכי הפצה.

---

## 2. ערך SSOT (נעול)

| מפתח | ערך | הערה |
|------|-----|------|
| **primary_admin_contact** | `mailto:support@tiktrack.app` | קישור למייל של משתמש מנהל ראשי. ניתן להחלפה ב-runtime via env `PRIMARY_ADMIN_EMAIL` אם מוגדר. |

---

## 3. טקסט הודעה מלא (D16)

להצגה בבחירת ברוקר "אחר" ב-D16:

> במידה ולא מצאתם את הברוקר שלכם במערכת, עדין ניתן לייצר את החשבון מסחר — אבל לא ניתן יהיה לייבא אוטומטית נתונים.  
> מומלץ ליצור איתנו קשר ולבקש הוספת הברוקר למערכת, [קישור למייל מנהל ראשי](mailto:support@tiktrack.app).

**במימוש:** השתמש בערך `primary_admin_contact` מהטבלה למעלה (או מ-env אם קיים). אין להשאיר placeholder טקסט גולמי בממשק.

---

**log_entry | ADR_015 | GOVERNANCE_MESSAGE_SSOT_LOCKED | 2026-02-12**
