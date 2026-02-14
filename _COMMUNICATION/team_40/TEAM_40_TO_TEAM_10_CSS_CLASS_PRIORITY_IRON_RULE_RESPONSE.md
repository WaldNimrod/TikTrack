# Team 40 → Team 10: תגובה — כלל ברזל עדיפות מחלקות CSS

**id:** `TEAM_40_TO_TEAM_10_CSS_CLASS_PRIORITY_IRON_RULE_RESPONSE`  
**מקור request:** `TEAM_10_TO_TEAM_40_CSS_CLASS_PRIORITY_IRON_RULE_REQUEST.md`  
**מאת:** Team 40 (UI Assets & Design)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-14

---

## 1. סטטוס

Team 40 **אישר** את כלל הברזל (שלושת השלבים) ו**עדכן** את TEAM_40_VISUAL_VALIDATION_CRITERIA בהתאם לבקשה.

---

## 2. שינויים שבוצעו

**קובץ מעודכן:** `_COMMUNICATION/team_40/TEAM_40_VISUAL_VALIDATION_CRITERIA.md` (גרסה v1.3)

### 2.1 כלל ברזל — שילוב במפורש

- נוסף **סעיף 2.0 — כלל ברזל עדיפות מחלקות CSS (חובה)** עם טבלת שלוש העדיפויות:
  - **עדיפות 1:** מחלקות ברירת מחדל או ללא מחלקה — העיצוב מ־phoenix-base / element selectors.
  - **עדיפות 2:** מחלקה **קיימת** כבר בשימוש בממשקים אחרים (כולל בדיקה ב־CSS_CLASSES_INDEX).
  - **עדיפות 3:** מחלקה **חדשה** רק במידת הצורך — חובה לבדוק ב־CSS_CLASSES_INDEX ובקוד לפני יצירה.

- נוספה **הפניה למקור המחייב:** `documentation/05-PROCEDURES/TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE.md` §1.5.

### 2.2 סעיפים 2.1 ו-2.3

- **2.1 CSS Classes Usage:** עודכן כך שיכלול ציות לסדר העדיפויות (1 → 2 → 3) והתאמת הדוגמאות.
- **2.3 No Duplicate Classes:** עודכן להדגשת עדיפות 3 — בדיקה ב-CSS_CLASSES_INDEX **ובקוד** לפני יצירת מחלקה חדשה.

### 2.3 טופס בדיקה

- נוסף פריט בדיקה: **כלל ברזל עדיפות מחלקות** (עדיפות 1 → 2 → 3) עם הפניה ל-TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE §1.5.

### 2.4 קישורים רלוונטיים

- נוספה הפניה לנוהל: `documentation/05-PROCEDURES/TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE.md` §1.5.

---

## 3. הפניות

- **נוהל SSOT:** `documentation/05-PROCEDURES/TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE.md` (§1.5)  
- **קריטריונים מעודכנים:** `_COMMUNICATION/team_40/TEAM_40_VISUAL_VALIDATION_CRITERIA.md` (v1.3)

---

**log_entry | TEAM_40 | CSS_CLASS_PRIORITY_IRON_RULE_RESPONSE | TO_TEAM_10 | 2026-02-14**
