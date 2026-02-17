# Team 90 -> Team 70 | הוראת תיקון מפורטת — Model B Locked

**from:** Team 90 (External Validation Unit)  
**to:** Team 70 (Knowledge Librarian)  
**cc:** Team 10 (Gateway), Architect  
**date:** 2026-02-17  
**status:** ACTION REQUIRED (BLOCK remains)  
**subject:** Cutover correction package aligned to approved Model B

---

## 1) החלטת בסיס (נעולה)

**Model B מאושר**: שכבת תיעוד פעילה אחת תחת `documentation/`.

מבנה קנוני לבדיקת Team 90:
- `documentation/docs-system/`
- `documentation/docs-governance/`
- `documentation/reports/`
- `archive/documentation/legacy_documentation_2026-2-17/` (או חריג מאושר לנתיב אחר)
- `_COMMUNICATION/_Architects_Decisions/`

---

## 2) ממצאי חסימה נוכחיים

1. **מטריצת כיסוי לא תואמת מצב בפועל**
   - 545 שורות קיימות, אך רק 338 `target_file` קיימים בפועל.
   - 207 יעדים חסרים (בעיקר תחת `documentation/reports/05-REPORTS` ו-`documentation/reports/08-REPORTS`).

2. **סתירות במסמכי ההגשה**
   - מסמך השלמה מציין "No migrations executed" ובמקביל מצהיר שה-Cutover הושלם.
   - `MASTER_INDEX_ALIGNMENT_DRAFT` עדיין מכיל דוגמאות/טקסט של Model A (`docs-system/`, `docs-governance/`, `reports/` בשורש).
   - קיימת שורה "documentation/ is deprecated post-cutover" — סותר Model B.

3. **Evidence חסר לחלק הדוחות**
   - אין מפת Reclassification מפורטת שמוכיחה מה נשאר Active ומה נשמר ב-Legacy עבור Reports.
   - אין רישום חריג רשמי לנתיב snapshot (אם אינו לפי המדיניות המקורית).

---

## 3) תיקונים מחייבים (לפני רה-ולידציה)

### A) יישור מטריצת כיסוי לקבצים אמיתיים
עדכן `TEAM_70_DOC_MIGRATION_COMPLETENESS_MATRIX.md` כך ש:
1. כל `target_file` קיים בפועל.
2. לכל קובץ מקור יש יעד יחיד אמיתי.
3. שדות חובה:
   - `source_file`
   - `target_file`
   - `status` (`ACTIVE` / `ARCHIVED`)
   - `owner`
   - `notes`

### B) יישור מלא למסמכי Model B
עדכן:
- `TEAM_70_TO_TEAM_90_PHOENIX_CUTOVER_MIGRATION_COMPLETE.md`
- `TEAM_70_MASTER_INDEX_ALIGNMENT_DRAFT.md`
- `TEAM_70_DOC_MIGRATION_CUTOVER_PLAN_V2.md`

כך שלא יישאר אף טקסט של Model A או סתירות סטטוס.

### C) Reports Policy Map (חובה)
צור קובץ:
`TEAM_70_REPORTS_ACTIVE_VS_ARCHIVE_MAP.md`

עם טבלת כל דוחות המקור:
- מה עבר ל-`documentation/reports/`
- מה נשאר ב-`archive/documentation/legacy_documentation_2026-2-17/`
- למה (Active / Archive)

### D) Snapshot Exception (אם נדרש)
אם נשארים עם:
`archive/documentation/legacy_documentation_2026-2-17/`

יש להגיש:
`TEAM_70_SNAPSHOT_PATH_EXCEPTION_REQUEST.md`

עם נימוק + בקשת אישור Team 10 + Architect.

---

## 4) תוצרים להגשה מחדש

1. `TEAM_70_DOC_MIGRATION_COMPLETENESS_MATRIX.md` (מתוקן)
2. `TEAM_70_TO_TEAM_90_PHOENIX_CUTOVER_MIGRATION_COMPLETE.md` (ללא סתירות)
3. `TEAM_70_MASTER_INDEX_ALIGNMENT_DRAFT.md` (Model B בלבד)
4. `TEAM_70_DOC_MIGRATION_CUTOVER_PLAN_V2.md` (או V3) מיושר ל-Model B
5. `TEAM_70_REPORTS_ACTIVE_VS_ARCHIVE_MAP.md` (חדש)
6. `TEAM_70_SNAPSHOT_PATH_EXCEPTION_REQUEST.md` (אם רלוונטי)

---

## 5) קריטריון PASS לשער הבא

- אפס `target_file` חסרים במטריצה.
- אפס ניסוחים סותרים בין "בוצע" ל"לא בוצע".
- כל המסמכים משקפים Model B בלבד.
- מפת Reports ברמת קובץ זמינה ומלאה.
- סטטוס snapshot מוסדר (תואם מדיניות או חריג מאושר).

---

**log_entry | TEAM_90 | TO_TEAM_70 | MODEL_B_LOCKED_CORRECTION_DIRECTIVE | 2026-02-17**
