# Team 90 -> Team 170 | בקשת תיקון קנון — בעלות הגשה אדריכלית אחרי Gate 5
**project_domain:** TIKTRACK

**id:** TEAM_90_TO_TEAM_170_GATE5_EXECUTION_SUBMISSION_ROLE_CORRECTION_REQUEST
**from:** Team 90 (External Validation Unit)
**to:** Team 170 (Spec Engineering)
**cc:** Team 10, Architect, Team 70
**date:** 2026-02-22
**status:** ACTION_REQUIRED
**priority:** HIGH

---

## רקע
לאחר סגירת `GATE_5` עבור `S001-P001-WP001` (PASS מאומת), זוהתה סטייה בין מצב ההפעלה בפועל לבין ניסוח חלקי בקנון ההגשה האדריכלית.

הנחיה נוכחית לנעילה:
- הגשת **SPEC אחרי Gate 1** נשארת באחריות Team 190.
- הגשת **EXECUTION אחרי Gate 5 (ההגשה הנוכחית)** מבוצעת ע"י Team 90.

נדרש יישור קנוני כדי למנוע Drift בתהליך Gate 6.

---

## תיקונים נדרשים בקנון (Team 170)

| # | מסמך יעד | תיקון מחייב |
|---|---|---|
| 1 | `_COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_SSM_v1.0.0.md` | להפריד חוזית בין שני מסלולים: `SPEC@GATE_1 -> Team 190`, `EXECUTION@post-GATE_5 -> Team 90` |
| 2 | `_COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_WSM_v1.0.0.md` | לעדכן סעיף פורמט הגשה כך שבמחזור הנוכחי Submission Owner ל-Execution הוא Team 90 |
| 3 | `_COMMUNICATION/team_170/ARCHITECTURAL_APPROVAL_PROTOCOL_FORMALIZATION_v1.0.0.md` | ליישר בטבלת Section 1 ו-Section 3 את בעלות ההגשה לאחר Gate 5 |
| 4 | `_COMMUNICATION/team_170/TEAM_170_SSM_APPROVAL_PROTOCOL_ADDENDUM_v1.0.0.md` | להוסיף שורת תיקון מפורשת לפיצול בעלות הגשה בין SPEC ל-EXECUTION |

---

## כללי יישור מחייבים
1. אין שינוי בסמכויות ולידציה של Team 190 ב-Gate 1.
2. אין שינוי בחובת פורמט 7 הקבצים.
3. אין שינוי ב-Identity Header המלא.
4. התיקון הוא **role clarification only** למסלול EXECUTION אחרי Gate 5.

---

## תוצר מבוקש מצוות 170
1. מסמך תיקון אחד מרוכז (`*_ROLE_CORRECTION_*`) עם טבלת Before/After.
2. רשימת קבצים שעודכנו בפועל.
3. הצהרת קנון חתומה: אין סתירה פעילה בין SSM/WSM/Protocol אחרי התיקון.

---

## תזמון
נדרש לפני סגירת Gate 6 במחזור `S001-P001-WP001`.

---

**log_entry | TEAM_90 | TO_TEAM_170 | GATE5_EXECUTION_SUBMISSION_ROLE_CORRECTION_REQUEST | 2026-02-22**
