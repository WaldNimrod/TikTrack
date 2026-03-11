# Team 10 → Team 50 | S002-P002-WP003 GATE_7 Part A — הפעלת QA (לאחר תיקון Team 20)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_S002_P002_WP003_GATE7_PARTA_QA_ACTIVATION_v1.0.0  
**from:** Team 10 (Gateway)  
**to:** Team 50 (QA & Fidelity)  
**cc:** Team 20, Team 60, Team 90  
**date:** 2026-03-11  
**status:** ACTIVATION_AFTER_TEAM_20_COMPLETION  
**trigger:** סבב תיקון מהיר GATE_7 Part A — הרצת בדיקות לאחר שהחבילה מועברת מ־Team 20  
**prerequisite:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_PARTA_REMEDIATION_COMPLETION.md` (סטטוס DONE)

---

## 1) הקשר

Team 20 השלים תיקוני GATE_7 Part A (CC-WP003-04, CC-01, CC-02) והעביר את החבילה ל־Team 50.  
**תפקיד Team 50:** להריץ את הבדיקות הדרושות ולוודא שהתוצאות עקביות עם איסוף העדות של Team 60.

---

## 2) פעולות נדרשות

1. **אימות קבלת חבילה:** וודא שקראתם את דוח ההשלמה של Team 20 ואת התיקונים (קבצים, לוגיקה).
2. **הרצת בדיקות רלוונטיות:**
   - בדיקות שקשורות ל־sync מחירים, Yahoo provider, ו־rate limiting (429) — בהתאם לתרחישים ש־Team 60 ימדוד (market-open, off-hours, 4-cycle).
   - שימוש בכלים זמינים: סקריפטים (`run_g7_part_a_evidence.py`, `sync_ticker_prices_eod.py`), API, לוגים.
3. **תיאום עם Team 60:** לאחר סיום הבדיקות — Team 60 יריץ איסוף עדות רשמי (לוגים, ספירות) ויעדכן דוח + JSON. Team 50 יגיש **corroboration** שתואם בדיוק ל־verdicts של Team 60.

### תנאי להעברה ל־Team 60 (חובה)

**אין העברה ל־Team 60** כל עוד `pass_04=False` (כלומר יש מופעי 429).  
**העברה ל־Team 60** תתבצע **רק אחרי** ש־Team 20 יתקן ו־**pass_04=True** (0×429 ב־4 מחזורים).  
אם הבדיקה חוזרת מסתיימת ב־BLOCKED — Team 50 מדווח ב־`TEAM_50_TO_TEAM_60_S002_P002_WP003_GATE7_PARTA_QA_RECHECK_COMPLETION.md` (סטטוס BLOCKED), מפנה את מסמך החקירה ל־Team 20, ולא מעבירה חבילה ל־Team 60.

---

## 3) דליברבל

**נתיב:**  
`_COMMUNICATION/team_50/TEAM_50_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_QA_CORROBORATION_v2.0.1.md`  
(עדכון המסמך הקיים או גרסה חדשה לפי גרסת הדוח של Team 60.)

**תוכן:**  
- טבלת corroboration: CC-WP003-01, CC-WP003-02, CC-WP003-04 — **התאמה מדויקת** ל־verdicts של Team 60 (PASS / BLOCK / NOT EVIDENCED) ולספירות המפורשות.
- אין סתירה בין Team 50 ל־Team 60.

---

## 4) מנדט מקור

| מסמך | תיאור |
|------|--------|
| `TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_RERUN_MANDATE_v2.0.1.md` | דרישות evidence ו־artifacts מ־Team 90. |
| `TEAM_10_TO_TEAM_20_S002_P002_WP003_GATE7_PARTA_REMEDIATION_CANONICAL_PROMPT_v1.0.0.md` | פרומפט ל־Team 20 — כולל חובת העברת חבילה ל־Team 50. |
| `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_60_S002_P002_WP003_GATE7_PARTA_QA_RECHECK_COMPLETION.md` | דוח בדיקה חוזרת — BLOCKED = אין העברה ל־60 עד pass_04=True. |
| `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_S002_P002_WP003_GATE7_PARTA_BLOCK_ANALYSIS_AND_REMEDIATION_REQUEST.md` | מסמך חקירה/remediation ל־Team 20. |

---

**log_entry | TEAM_10 | GATE7_PARTA_QA_ACTIVATION | TO_TEAM_50 | ACTIVATION_AFTER_TEAM_20 | 2026-03-11**
