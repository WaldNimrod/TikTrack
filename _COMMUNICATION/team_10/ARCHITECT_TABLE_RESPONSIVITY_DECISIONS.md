# 🏰 פסיקה אדריכל: אסטרטגיית טבלאות נזילות (Phase 2)
**סטטוס:** 🔒 LOCKED & MANDATORY | **תאריך:** 2026-02-07

### ⚖️ 1. ההכרעה: המודל ההיברידי (Option D)
הטבלה תשתמש ב-table-layout: auto כבסיס עם משקולות עמודה לוגיות:
* **Atomic (Fixed):** אייקונים ו-Checkboxes - רוחב קשיח ב-px/ch.
* **Fluid (Weighted):** עמודות נתונים פיננסיים - שימוש ב-clamp() ו-min-width.
* **Expansion (Flexible):** עמודות טקסט - סופגות את שארית הרוחב.

### ⚓ 2. פרוטוקול ה-Sticky Isolation
במובייל/טאבלט, עמודות הזהות (Start) והפעולות (End) נשארות דבוקות.
* **START:** inset-inline-start: 0;
* **END:** inset-inline-end: 0;

### 🔄 3. מנדט התיקון המיידי (Retrofit Mandate)
חובה לתקן את כל העמודים הקיימים בהתאם לסטנדרט זה תוך 48 שעות:
- D15_INDEX (Dashboard)
- D15_PROF_VIEW (Profile)
- Trading Accounts (D16)