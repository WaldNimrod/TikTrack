# TEAM_10 → TEAM_50 | S002-P003-WP002 GATE_5 BLOCK — בקשת אימות E2E (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_S002_P003_WP002_G5_E2E_VERIFICATION_REQUEST_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 50 (QA)  
**cc:** Team 20, Team 30, Team 60, Team 90  
**date:** 2026-03-06  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_5 (BLOCKED_REMEDIATION_INCOMPLETE)  
**work_package_id:** S002-P003-WP002  
**authority:** TEAM_10_S002_P003_WP002_G5_RESUBMISSION_RETRACTION_v1.0.0.md (§3 תנאים להגשה חוזרת)  

---

## Mandatory identity header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |
| gate_id | GATE_5 |
| phase_owner | Team 10 |

---

## 1) מטרה

ההגשה המחדש ל־GATE_5 **נמשכה** כי הבדיקות לא עברו במלואן (חלק נסגר באימות קוד בלבד; E2E נכשל או לא הורץ; Login failed בריצה אחת). Team 10 מבקש מ־Team 50 **ריצת אימות E2E מלאה** ותיעוד תוצאות — כדי שניתן יהיה להגיש מחדש ל־Team 90 רק אחרי אימות מלא או החלטה מתועדת.

---

## 2) מה נדרש

### 2.1 ריצת E2E מלאה (כולל Login)

- **תנאי מקדים:** פרונט (למשל 8080) ו־backend (למשל 8082) **רצים**; flow ההתחברות עובד (או credentials/סלקטורים מעודכנים כך שה־login עובר).
- **להריץ:**
  - `tests/g7-26bf-e2e-validation.test.js` (26-BF E2E) — **כולל** מעבר שלב ה־login; לתעד **PASS/FAIL לכל BF**.
  - אם זמין: `tests/g7-26bf-deep-e2e.test.js` (Deep E2E) — אחרי ChromeDriver על פורט 9515 או הגדרה מקבילה; לתעד תוצאות.
- **תיעוד:** קובץ תוצאות JSON + דוח קצר (טבלה: BF ID | PASS/FAIL | הערה/evidence).  
  **נתיב מומלץ:** `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_S002_P003_WP002_G5_E2E_VERIFICATION_RUN_v1.0.0.md` (או מקביל).

### 2.2 תרחישים ממוקדים (חובה אם E2E כללי נכשל או לא הורץ)

| פריט | מטרה | פעולה |
|------|------|--------|
| **008 (סמל לא תקין ב־UI)** | וידוא שהודעת שגיאה מופיעה ב־UI | להריץ עם backend שמחזיר 422 על סמל לא תקין (למשל `VALIDATE_SYMBOL_ALWAYS=true` ב־api/.env או等价). E2E: הזנת INVALID999E2E → assert שהודעת שגיאה ב־#tickerFormValidationSummary / #tickerSymbolError. לתעד PASS/FAIL + evidence_path. |
| **012 (מקושר ל)** | וידוא שעמודת "מקושר ל" מציגה שם + קישור | E2E או אימות קוד: assert שתא מכיל טקסט רשומה + אלמנט קישור (למשל .linked-object-badge-link). לתעד PASS/FAIL. |
| **024 (פרטי הערה + קבצים)** | וידוא פתיחת פרטי הערה עם קבצים + פתח/הורד | E2E: פתיחת הערה שיש לה קבצים מצורפים; assert על כפתורי פתח/הורד או רשימת קבצים. אם "element not interactable" — לתעד סיבה (סלקטור/תזמון) ולהמליץ תיקון או לאשר סגירה באימות קוד בלבד עם הנמקה. |

### 2.3 עדכון evidence (אם יש תוצאות חדשות)

- אם ריצה חדשה הניבה **PASS** לפריטים 008 / 012 / 024 — לעדכן במטריצת הסגירה (או בדוח נפרד) את **evidence_path** ו־**verification_report** כך שיציינו את הריצה (קובץ תוצאות, תאריך).
- אם ריצה הניבה **FAIL** — לתעד במפורש; Team 10 ינתב חזרה ל־20/30 לפי בעלות.

---

## 3) תוצר נדרש

- **דוח ריצה:** נתיב קובץ + טבלת תוצאות (26-BF ו/או Deep E2E: כל שורה PASS/FAIL + הערה).
- **תרחישים ממוקדים (008, 012, 024):** PASS/FAIL + evidence_path או הנמקה (כולל "סגור באימות קוד בלבד — סיבה: ...").
- **המלצה:** "מוכן להגשה חוזרת ל־GATE_5" **רק אם** כל הפריטים הרלוונטיים PASS או יש החלטה מתועדת (ארכיטקט/Team 90) שסגירה באימות קוד מקובלת לפריט X.

---

## 4) מקורות

- מסמך משיכה ותנאים: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P003_WP002_G5_RESUBMISSION_RETRACTION_v1.0.0.md`
- דוח Batch 3 Verification (פערים): `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_S002_P003_WP002_GATE3_BATCH3_VERIFICATION_v1.0.0.md`
- GATE_4 Execution Rerun (Login failed): `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_S002_P003_WP002_G7R_GATE4_EXECUTION_RERUN_v1.0.0.md`
- מטריצת סגירה (לעדכון evidence): `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_S002_P003_WP002_G5_BLOCK_CLOSURE_MATRIX_v1.0.0.md`

---

**log_entry | TEAM_10 | G5_E2E_VERIFICATION_REQUEST | TO_TEAM_50 | S002_P003_WP002 | 2026-03-06**
