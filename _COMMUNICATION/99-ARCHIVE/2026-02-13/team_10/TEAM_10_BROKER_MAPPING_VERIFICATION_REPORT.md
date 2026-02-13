# 🔍 Team 10: בדיקת פילטר — מיפוי ברוקרים (DATA_MAP_FINAL)

**מאת:** Team 10 (The Gateway) — **בתפקיד פילטר, לא צינור**  
**תאריך:** 2026-02-10  
**סטטוס:** ⚠️ **נבדק — נדרש תיקון אחד לפני אישור סופי**  
**מקור מסירה:** צוות 20 + צוות 30 (`DATA_MAP_FINAL.json` + דוחות השלמה)

---

## 1. עיקרון הפעולה

Team 10 **בודק** את המסירה מול הדרישות, **מאחד** לקובץ מיפוי מלא וסופי, ו**מחזיר** לצוותים דרישה לתיקונים במידת הצורך — **לא** מעביר אוטומטית לאישור.

---

## 2. רשימת בדיקה (פילטר)

| # | קריטריון | מקור דרישה | תוצאה |
|---|-----------|-------------|--------|
| 1 | קובץ מיפוי JSON קיים | Pre‑coding Mandate | ✅ קיים: `_COMMUNICATION/team_20/DATA_MAP_FINAL.json` |
| 2 | מיפוי שדות ברוקרים — Singular | מנדט מיפוי + Phoenix | ✅ `broker` (Singular), value/label |
| 3 | API Contract: GET /api/v1/reference/brokers | ADR‑013 | ✅ endpoint, JWT, response data[] + total |
| 4 | מיפוי D16 (Trading Accounts) | מנדט | ✅ broker Optional, קובץ טופס, target_type: dynamic select |
| 5 | מיפוי D18 (Brokers Fees) | מנדט | ✅ broker Required, קובץ טופס, target_type: dynamic select |
| 6 | רשימת ברוקרים תקפים | מנדט | ✅ 10 ברוקרים, value/label, Singular |
| 7 | הנחיות Backend + Frontend | מנדט | ✅ data_source_options, select implementation |
| 8 | **Fallback בהכשלת API** | ADR‑013 (מקור = API) | ❌ **חריגה** — ראה להלן |

---

## 3. ממצאים

### 3.1 ✅ מה תקין

- **מבנה הקובץ:** metadata, api_contract, ui_mapping, valid_brokers_list, backend_implementation_guidance, frontend_implementation_guidance, compliance — מלא וברור.
- **תאימות ADR‑013:** מקור רשימה = API; endpoint ו־schema תואמים.
- **תאימות מנדט:** D16/D18 ממופים; שמות Singular; קבצי forms מצוינים.
- **דוחות המסירה:** Team 20 ו־Team 30 תואמים לתוכן ה־JSON; אין סתירות עובדתיות.

### 3.2 ❌ תיקון נדרש (חסימת אישור)

**Fallback בהכשלת API**

- **בקובץ:**  
  `frontend_implementation_guidance.implementation_notes.fallback_behavior`:  
  *"If API fails, form should handle gracefully (show error or **allow manual entry as fallback - TBD**)"*
- **בעיה:** ADR‑013 קבע מקור יחיד לרשימת ברוקרים — **API**. "Manual entry" (free-text) סותר את ההחלטה ומחזיר מצב שלא select דינמי ממקור תקף.
- **דרישה:** להסיר "allow manual entry as fallback" מהמיפוי וההנחיות, או להעביר שאלה מפורשת לאדריכל. **עד אז:** להגדיר fallback כ־**"הצגת הודעת שגיאה; אין fallback ל־text input"**.

### 3.3 הערה (לא חוסמת)

- **response_example** ב־JSON מכיל 8 פריטים; **valid_brokers_list** מכיל 10. מומלץ ליישר (להרחיב את הדוגמה ל־10 או לסמן במפורש "דוגמה חלקית") — לא חוסם אישור.

---

## 4. איחוד לקובץ מיפוי מלא וסופי

- **קובץ המיפוי המאוחד והסופי** לנושא ברוקרים הוא:  
  **`_COMMUNICATION/team_20/DATA_MAP_FINAL.json`**
- לאחר יישום **התיקון הנדרש** (סעיף 3.2) — Team 10 יאשר את הקובץ כ**מיפוי סופי מאושר** ויעביר לאישור ויזואלי (נמרוד).
- עד לתיקון: המסירה **לא מאושרת**; נדרשת החזרה לצוותים 20 ו־30 עם דרישה לתיקון (מסמך נפרד).

---

## 5. סיכום החלטת פילטר

| פריט | החלטה |
|------|--------|
| **אישור מיידי** | ❌ לא — נדרש תיקון אחד. |
| **תיקון נדרש** | עדכון fallback_behavior: אין fallback ל־manual entry; הצגת שגיאה בלבד (או העברת שאלה לאדריכל). |
| **פעולה** | החזרת דרישה ממוקדת לצוותים 20 ו־30 (מסמך `TEAM_10_TO_TEAMS_20_30_BROKER_MAPPING_CORRECTION_REQUEST.md`). |
| **לאחר תיקון** | Team 10 יוודא עדכון ויאשר את `DATA_MAP_FINAL.json` כמיפוי סופי; אז להעברה לאישור נמרוד. |

---

**Team 10 (The Gateway)**  
**log_entry | BROKER_MAPPING_VERIFICATION | FILTER_CHECK | CORRECTION_REQUESTED | 2026-02-10**
