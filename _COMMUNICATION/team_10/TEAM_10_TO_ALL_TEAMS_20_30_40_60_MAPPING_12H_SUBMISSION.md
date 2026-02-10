# 📋 Team 10 → צוותים 20, 30, 40, 60: הגשת קבצי מיפוי — תוך 12 שעות

**אל:** Team 20, Team 30, Team 40, Team 60  
**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-09  
**מקור:** ADR-011 — פקודת הפעלה לשלב 1 (Debt Closure)  
**דדליין:** **12 שעות** מהפצת הודעה זו

---

## 🚨 חובה

1. **עצירת כתיבת קוד חדשה** — עד להשלמת שלב המיפוי (Pre-coding Mapping).  
2. **הגשת קבצי המיפוי** כפי שהוגדרו במפת הבעלות — **תוך 12 שעות**.
3. **אין חריגים ואין עבודה “במקביל”** — כל שינוי קוד לפני מיפוי מלא ייחשב חריגה תהליכית (RED).

**מיקום הגשה:** תיקיית הצוות שלכם — `_COMMUNICATION/team_20/`, `_COMMUNICATION/team_30/`, `_COMMUNICATION/team_40/`, `_COMMUNICATION/team_60/` (קובץ אחד או יותר עם כל הפריטים המפורטים למטה).

**SSOT מחייבים להפניה בכל מיפוי:**
- `documentation/00-MANAGEMENT/ADR_010_PHASE_2_UNIFIED_CLOSURE_MANDATE.md`
- `documentation/05-PROCEDURES/ARCHITECT_DATA_MANAGEMENT_SOP_011.md`
- `documentation/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`
- `documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_TASK_SPEC_SUPPLEMENT_REQUEST.md`

---

## קבצי מיפוי נדרשים — לפי צוות (מפת בעלות)

### Team 20 (Backend)
- רשימת Endpoints סגורה (מסלול, method) + חוזה/SSOT; קריטריון "API פעיל".
- רשימת קבצי config לפורטים 8080/8082.
- רשימת טבלאות ועמודות — Precision 20,6 (NUMERIC(20,6)) או נתיב SSOT.

### Team 60 (DevOps & Infra)
- הגדרה מדויקת של `make db-test-clean` (מה נמחק; מיקום Makefile + target).
- קריטריון הצלחה (פלט מצופה); איך מוכיחים שזה עובד.
- רשימת ישויות לזריעה; מבנה הפלאג `is_test_data`; הגדרת "DB סטרילי"; נתיב סקריפטים ו-Makefile.

### Team 30 + Team 40 (Frontend — תחת SLA 30/40)
- מיפוי קבצי CSS/מבנה לכל טבלה D16, D18, D21 (נתיב + class/קומפוננט).
- זיהוי עמודות Sticky Start / Sticky End לכל עמוד (אם מוגדר).
- רשימת קבצים עם `console.log`; מיפוי שימוש ב-maskedLog/audit.
- מיפוי פונקציות טרנספורמרים ↔ שדות; רשימת שדות כספיים/מספריים (D16, D18, D21); התנהגות null/0.

---

## לאחר הגשה

צוות 10 יבדוק השלמת שלב המיפוי. רק לאחר שכל הצוותים הגישו — יאושר מעבר משלב המיפוי להמשך ביצוע (וקוד). צוות 90 יבצע סריקת "אדמה חרוכה" ברגע שהקוד יוגש; אפס סובלנות לסטיות מ-clamp() או מ-masking.

---

**מפת בעלות / מענה מלא:** ADR-011, `ARCHITECT_CONSOLIDATED_RESPONSE_PHASE_2.md`  
**פקודת הפעלה:** `TEAM_10_DEBT_CLOSURE_EXECUTION_ORDER.md`
