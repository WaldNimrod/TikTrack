# Team 90 -> Team 70 | הוראת תיקון — Documentation Migration

**from:** Team 90 (External Validation Unit)  
**to:** Team 70 (Knowledge Librarian)  
**cc:** Team 10 (Gateway), Architect  
**date:** 2026-02-17  
**status:** ACTION REQUIRED  
**subject:** תיקון תהליך המיגרציה לאחר שחזור מקור `documentation/`

---

## 1) הקשר

בוצע שחזור יזום של `documentation/` עד להשלמת בדיקת שלמות מידע.  
זהו חריג מאושר זמני, אך מחייב תיקון תהליך לפני Cutover סופי.

---

## 2) הוראות תיקון מחייבות

1. **Freeze ביצועי מיגרציה**
   - אין מחיקות/העברות נוספות עד אישור Team 10.

2. **Completeness Matrix מלא (מקור -> יעד)**
   - למפות כל קובץ ב־`documentation/` ליעד: `docs-system/` / `docs-governance/` / `reports/` / `archive/documentation_legacy/`.
   - לכל שורה: `source_path`, `target_path`, `status`, `notes`.

3. **Authority Drift Register**
   - רשימת קבצים עם הפניות סמכות ישנות/כפולות (Master Index, החלטות אדריכל, Policies/Procedures).
   - לכל ממצא: `file`, `issue`, `required_fix`.

4. **Cutover Plan v2 (ללא ביצוע)**
   - סדר פעולות סופי, נקודות עצירה, וולידציה בכל שלב, ו-Rollback ברור.
   - אין ביצוע עד Gate אישור Team 10 + Team 90.

5. **MASTER_INDEX Alignment Draft**
   - להגיש נוסח עדכון (draft) בלבד ליישור אינדקס ראשי מול הארכיטקטורה החדשה.

---

## 3) תוצרים נדרשים

יש להגיש את כל המסמכים תחת `_COMMUNICATION/team_70/`:

1. `TEAM_70_DOC_MIGRATION_COMPLETENESS_MATRIX.md`
2. `TEAM_70_AUTHORITY_DRIFT_REGISTER.md`
3. `TEAM_70_DOC_MIGRATION_CUTOVER_PLAN_V2.md`
4. `TEAM_70_MASTER_INDEX_ALIGNMENT_DRAFT.md`

---

## 4) קריטריוני הצלחה (לבדיקת Team 90)

- כיסוי 100% לקבצי `documentation/` במטריצת המיפוי.
- אפס קבצים ללא יעד מוגדר.
- אפס הפניות סמכות ישנות ללא תיקון מוצע.
- תוכנית Cutover ניתנת להרצה עם נקודות ולידציה ברורות.
- טיוטת אינדקס ראשי תואמת שרשרת סמכות נעולה.

---

## 5) סטטוס שער

עד קבלת התוצרים ואימותם: **Gate Migration נשאר BLOCK/PENDING CUTOVER**.

---

**log_entry | TEAM_90 | TO_TEAM_70 | DOC_MIGRATION_CORRECTION_DIRECTIVE | 2026-02-17**
