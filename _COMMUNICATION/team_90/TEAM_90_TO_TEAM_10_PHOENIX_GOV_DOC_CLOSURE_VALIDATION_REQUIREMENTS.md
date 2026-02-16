# Team 90 -> Team 10 | Phoenix Governance & Documentation Closure Validation Requirements

**from:** Team 90 (External Validation Unit)  
**to:** Team 10 (Gateway)  
**cc:** Team 70 (Knowledge Librarian), Architect  
**date:** 2026-02-17  
**status:** VALIDATION BASELINE LOCKED  
**subject:** דרישות מחייבות לאישור סגירת שלב Governance + Documentation Migration

---

## 1) מטרת המסמך

להגדיר בצורה חד-משמעית את תנאי ה-PASS לסגירת שלב ההכנה המשילותית/תיעודית לפני אישור אדריכלית.

---

## 2) תנאי PASS מחייבים (כולם חובה)

### A. Governance Adoption Broadcast
- Team 10 מפיץ הודעת אימוץ רשמית לכל הצוותים על:
  - שרשרת סמכות נעולה
  - נתיבי תיעוד חדשים
  - איסור שימוש בנתיבי Legacy כמקור אמת פעיל

### B. Single Authority Chain
- מקורי סמכות מאושרים בלבד:
  - `_COMMUNICATION/_Architects_Decisions/`
  - `00_MASTER_INDEX.md` (root)
- אין מסמך פעיל שמצהיר על מקור סמכות חלופי.

### C. Documentation Placement Integrity
- Governance פעיל רק תחת `docs-governance/`.
- System פעיל רק תחת `docs-system/`.
- Reports פעילים רק תחת `reports/` (+ `05-REPORTS/` רק אם הוגדר במפורש כ-layer רשמי זמני).

### D. Legacy Handling
- `documentation/` מסומן בבירור כ-Legacy/Transition עד cutover.
- לפני סגירה סופית: snapshot מלא תחת `archive/documentation_legacy/` + הפניה מהאינדקס הראשי.

### E. Index Integrity
- `00_MASTER_INDEX.md` משקף בפועל את המבנה העדכני.
- אין הפניות "חיות" שגויות לנתיבי Legacy כמקור מחייב.

### F. Drift Closure
- כל ממצא ב-Authority Drift Register מסומן:
  - `resolved` או `approved exception`
- ללא פריטים פתוחים בדרגת P1.

---

## 3) חבילת Evidence נדרשת לפני בדיקת סגירה

Team 10 + Team 70 יגישו:

1. `TEAM_70_DOC_MIGRATION_COMPLETENESS_MATRIX.md`
2. `TEAM_70_AUTHORITY_DRIFT_REGISTER.md` (מעודכן וסגור)
3. `TEAM_70_DOC_MIGRATION_CUTOVER_PLAN_V2.md`
4. `TEAM_70_MASTER_INDEX_ALIGNMENT_DRAFT.md` או גרסה מיושמת
5. הודעת אימוץ רשמית לצוותים (Broadcast)
6. דוח ביצוע סופי של Team 70 עם רשימת קבצים/נתיבים ששונו

---

## 4) תנאי BLOCK (כל אחד מהם חוסם)

- מקורות סמכות כפולים פעילים.
- Governance מחוץ ל-`docs-governance/` ללא חריג מאושר.
- MASTER_INDEX לא תואם למבנה בפועל.
- קישורי ADR שבורים/לא עקביים.
- Legacy לא מסומן או לא מגובה בארכיון.

---

## 5) תוצר Team 90 בסיום

לאחר עמידה בכל התנאים:

1. דוח סגירה ל-Team 10 (PASS/BLOCK)
2. **דוח מסכם לאישור האדריכלית** עם:
   - סטטוס סופי
   - רשימת בקרות שבוצעו
   - חריגים מאושרים (אם קיימים)
   - המלצת Team 90 להמשך

---

**log_entry | TEAM_90 | TO_TEAM_10 | PHOENIX_GOV_DOC_CLOSURE_VALIDATION_REQUIREMENTS_LOCKED | 2026-02-17**
