# Team 10: מסמך מרכזי — משימות פתוחות ותוכנית עבודה

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**סטטוס:** SSOT לרשימת המשימות הפתוחות — חלוקה לפי צוותים וסדר ביצוע

**מקורות:** TEAM_10_BATCH_1_2_FINAL_REPORT_AND_CLOSURE_PLAN.md, TT2_PHASE_2_CLOSURE_WORK_PLAN.md, מסמכי מנדט ו-QA בתקיית team_10.

---

## 1. סטטוסים שנסגרו לאחרונה (לעדכון תיעוד)

| נושא | דוח/אישור | סטטוס |
|------|------------|--------|
| **Flow Type SSOT (flowTypeValues)** | TEAM_50_TO_TEAM_10_FLOW_TYPE_SSOT_QA_REPORT.md — כל הבדיקות עברו | ✅ QA מאומת |
| **CURRENCY_CONVERSION flow_type** | TEAM_50_TO_TEAM_10_CURRENCY_CONVERSION_QA_REPORT.md | ✅ סגור |
| **סטנדרט סטטוסים D16 (Backend)** | TEAM_50_TO_TEAM_20_STATUS_STANDARD_QA_REPORT.md | ✅ סגור |
| **פונקציה מרכזית סטטוסים (Team 30)** | TEAM_30_TO_TEAM_10_CENTRAL_STATUS_FUNCTION_COMPLETE.md; דוח QA: TEAM_50_TO_TEAM_10_CENTRAL_STATUS_FUNCTION_QA_REPORT.md | ✅ יישום + QA |
| **Team 60 — 1.2.2 (פורטים 8080/8082, CORS, Precision 20,6)** | TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md; TEAM_60_TO_TEAM_10_TASK_1_2_2_PORT_PRECISION_REPORT.md | ✅ VERIFIED |
| **Team 60 — 1.2.3 (Seeders, make db-test-clean)** | TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md; TEAM_60_TO_TEAM_10_PHASE_1_IMPLEMENTATION_START.md | ✅ COMPLETE |

---

## 2. משימות פתוחות — חלוקה לפי צוות וסדר ביצוע

### 2.1 Team 10 (השער)

| סדר | מזהה | משימה | תוצר מצופה | מקור |
|-----|------|--------|-------------|------|
| 1 | Batch 1+2 | פרסום **"Batch 1+2 Closure Report"** רשמי וסגירת הסבב | מסמך closure רשמי | TEAM_10_BATCH_1_2_FINAL_REPORT_AND_CLOSURE_PLAN.md §4.3 |
| 2 | 1.1.1 | עדכון Page Tracker: D21 Infra → **VERIFIED** (סופי) | TT2_OFFICIAL_PAGE_TRACKER.md מעודכן | TT2_PHASE_2_CLOSURE_WORK_PLAN שלב 1 |
| 3 | 1.1.2 | אכיפת SLA 30/40 — צוות 40 UI (Presentational), צוות 30 לוגיקה (Containers) | הפניה ל-TT2_SLA_TEAMS_30_40.md; טיפול בחריגות | שם |
| 4 | 1.1.3 | וידוא ש־`make db-test-clean` פועל ב-100% (תלוי ב־1.2.3) | תיאום עם 20/60; רישום חסימות | שם |
| 5 | 1.4 | פלט שלב 1 — רשימת חוסרים/פערים; וידוא אין החלטות תלויות פתוחות | מסמך פלט | שם |
| 6 | 4.1.1–4.1.4 | הכנה ל־G-Lead: תיעוד סטטוס עמודים, מסירת חומר, Sign-off, גיבוי GitHub | Handoff + תיעוד | TT2_PHASE_2_CLOSURE_WORK_PLAN שלב 4 |

**הערה:** מסירת קונטקסט ל־Team 50 (1.4א) — חובה לפני הרצת QA כשנפתח scope חדש.

---

### 2.2 Team 20 (Backend & DB)

| סדר | מזהה | משימה | תוצר מצופה | מקור |
|-----|------|--------|-------------|------|
| 1 | 1.2.1 | מימוש Endpoints ל־Summary ו־Conversions (Option A) | API פעילים; תיעוד ב־SSOT | 🟡 **חלקי** — /cash_flows/currency_conversions פעיל; Summary endpoints — יש לבדוק |
| 2 | 1.2.2 | נעילת פורטים 8080/8082 והקשחת Precision ל־20,6 | CORS/Config + NUMERIC(20,6) מאומת | ✅ **הושלם** — מאומת ע"י Team 60 (TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md); סגור רשמית per Team 90 |
| 3 | 1.2.3 | בניית Python Seeders עם `is_test_data = true`; `make db-test-clean` מחזיר DB סטרילי | סקריפטים + Makefile | ✅ **הושלם** — seed_test_data.py, db_test_clean.py, seed_base_test_user.py, reduce_admin_base_to_minimal.py, db_remove_superfluous_users.py; Makefile: db-test-clean, db-test-fill, db-backup, db-base-seed, db-admin-minimal, db-test-report, db-remove-superfluous-users |
| 4 | PDSC | PDSC Boundary Contract — JSON Error Schema, Response Contract, Error Codes (אם טרם הושלם) | מסמך חוזה משותף | ממתין |
| 5 | Auth | חוזה Auth אחיד + עדכון SSOT/OpenAPI (אם טרם הושלם) | תיעוד + OpenAPI | ממתין |

**תלות:** השלמת 1.2.1–1.2.3 פותחת את 1.1.3 ל־Team 10 ואת אינטגרציה מלאה ל־30/40.

---

### 2.3 Team 60 (DevOps & Platform)

**סטטוס:** ✅ **כל המשימות הפתוחות הושלמו** (2026-02-12)

| מזהה | משימה | סטטוס | דוח |
|------|--------|--------|-----|
| 1.2.2 | נעילת פורטים 8080/8082, Config, Precision 20,6 | ✅ VERIFIED | TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md, TEAM_60_TO_TEAM_10_TASK_1_2_2_PORT_PRECISION_REPORT.md |
| 1.2.3 | Seeders, `make db-test-clean` | ✅ COMPLETE | TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md, TEAM_60_TO_TEAM_10_PHASE_1_IMPLEMENTATION_START.md |

**תלויות שפתחו:** משימה 1.1.3 (Team 10) — מוכן לביצוע; אינטגרציה מלאה Team 30/40 — מוכנה.

---

### 2.4 Team 30 (Frontend Execution)

| סדר | מזהה | משימה | תוצר מצופה | מקור |
|-----|------|--------|-------------|------|
| 1 | 1.3.1 | Retrofit רספונסיביות (Option D): **כל הממשק בכל העמודים** רספונסיבי; טבלאות D16/D18/D21 — Sticky + Fluid (clamp) | CSS + layout מעודכן; בדיקות | TT2_PHASE_2_CLOSURE_WORK_PLAN 1.3 |
| 2 | 1.3.2 | ניקוי מוחלט של `console.log` ומעבר ל־`audit.maskedLog` | אין console.log חשוף | שם |
| 3 | 1.3.3 | הקשחת טרנספורמרים: מניעת NaN ו־Undefined בטבלאות | transformers.js + null-safety | שם |
| 4 | Nav/Auth | תיקון Navigation & Auth: כפילויות Header (Phase 1), קישורים סטנדרטיים (Phase 2), React Router (Phase 3), Auth Guard (Phase 4) | קוד מעודכן; בדיקות | TEAM_10_TO_TEAM_30_NAVIGATION_AUTH_FIX_MANDATE.md |
| 5 | UI (אופציונלי) | שינוי שמות קבצים עם `d16`; ארגון למודולים; שינוי שם `portfolioSummary.js` (המלצות אודיט) | שמות ותיקיות מעודכנים | TEAM_10_UI_RESTRUCTURE_AUDIT, UI_FILENAME_QUALITY_ISSUES.md |

**תלות:** אינטגרציה מלאה עם API — 1.2.2 הושלם (Team 60); ממתין להשלמת 1.2.1 (Team 20). עבודה על 1.3.1–1.3.3 מותרת במקביל.

---

### 2.5 Team 40 (UI Assets & Design)

| סדר | מזהה | משימה | תוצר מצופה | מקור |
|-----|------|--------|-------------|------|
| 1 | 1.3.1 | תיאום עם Team 30 — עיצוב/מפרט רספונסיביות, CSS, layout (תחת SLA 30/40) | עיצוב Presentational לפי SSOT | TT2_PHASE_2_CLOSURE_WORK_PLAN 1.3; TT2_SLA_TEAMS_30_40 |
| 2 | SLA | אכיפת SLA: צוות 40 מגיש רכיבי UI (Presentational), צוות 30 מזריק לוגיקה (Containers) | טיפול בחריגות | 1.1.2 (Team 10 מפקח) |

---

### 2.6 Team 50 (QA & Fidelity)

| סדר | מזהה | משימה | תוצר מצופה | מקור |
|-----|------|--------|-------------|------|
| 1 | Context | קבלת קונטקסט מ־Team 10 לפני כל סבב QA חדש — מה פותח, מה לבדוק, SSOT | עדכון מפורט מ־Team 10 | TT2_QUALITY_ASSURANCE_GATE_PROTOCOL 1ב |
| 2 | 1.5 | שער א' — הרצת סוויטת בדיקות (0 SEVERE); דוח ל־Team 10 (כבר הושלם בסבב קודם — להפעיל מחדש לפי צורך) | GATE_A_PASSED / דוח | TT2_PHASE_2_CLOSURE_WORK_PLAN 1.5 |
| 3 | QA Tasks | Auth Guard — בדיקה לאחר תיקון (Team 30); D16 Backend API Testing — לפי עדכון Team 10 | דוחות QA | TEAM_10_QA_TASKS_PRIORITIZATION.md |

---

### 2.7 Team 90 (סבב מאמת)

| סדר | מזהה | משימה | תוצר מצופה | מקור |
|-----|------|--------|-------------|------|
| 1 | 3.1.1 | ריצת Gate B (או סבב מאמת) לאחר תיקוני שלב 1–2 | דוח Team 90 | TT2_PHASE_2_CLOSURE_WORK_PLAN שלב 3 |
| 2 | 3.1.2 | תיעוד ארטיפקטים והחלטת GREEN | ארטיפקטים ב־05-REPORTS/artifacts; GATE_B_STATUS | שם |

---

### 2.8 G-Lead (נמרוד — Visionary)

| סדר | מזהה | משימה | מקור |
|-----|------|--------|------|
| 1 | 4.1.2–4.1.3 | בדיקה ידנית-ויזואלית בדפדפן; Sign-off או רשימת תיקונים ויזואליים | TT2_PHASE_2_CLOSURE_WORK_PLAN שלב 4 |

---

## 3. סדר ביצוע מומלץ (תזמור)

1. **Team 60** — ✅ 1.2.2, 1.2.3 הושלמו (דוח: TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md).
2. **Team 20** — 1.2.1 (Endpoints Summary/Conversions); 1.2.2/1.2.3 — תשתית הושלמה עם Team 60.
3. **Team 10** — 1.1.1, 1.1.2 במקביל; **אחרי** 1.2.3: 1.1.3, 1.4 (1.1.3 כעת מוכן — `make db-test-clean` פועל).
4. **Team 30 + Team 40** — 1.3.1, 1.3.2, 1.3.3 (מותר להתחיל במקביל; אינטגרציה מלאה — אחרי 1.2.1).
4. **Team 10** — פרסום Batch 1+2 Closure Report; הכנה ל־G-Lead (4.1.1–4.1.4).
5. **Team 50** — סבבי QA לפי קונטקסט מ־Team 10.
6. **Team 90** — שלב 3 (Gate B); **G-Lead** — שלב 4 (אישור ויזואלי).

---

## 4. הודעות חלוקה לצוותים (2026-02-12)

| צוות | מסמך הפניה |
|------|-------------|
| Team 20 | TEAM_10_TO_TEAM_20_OPEN_TASKS_ASSIGNMENT.md |
| Team 30 | TEAM_10_TO_TEAM_30_OPEN_TASKS_ASSIGNMENT.md |
| Team 40 | TEAM_10_TO_TEAM_40_OPEN_TASKS_ASSIGNMENT.md |
| Team 50 | TEAM_10_TO_TEAM_50_OPEN_TASKS_ASSIGNMENT.md |
| Team 60 | TEAM_10_TO_TEAM_60_OPEN_TASKS_ASSIGNMENT.md |

---

## 5. הפניות

| מסמך | נתיב |
|------|------|
| תוכנית סגירת Batch 1+2 | 05-REPORTS/artifacts/TEAM_10_BATCH_1_2_FINAL_REPORT_AND_CLOSURE_PLAN.md |
| תוכנית סגירת Phase 2 | documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_WORK_PLAN.md |
| דוח Flow Type SSOT QA | _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_FLOW_TYPE_SSOT_QA_REPORT.md |
| SLA 30/40 | documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md |
| פרוטוקול שערי QA | documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md |

---

**log_entry | TEAM_10 | OPEN_TASKS_MASTER | CREATED | 2026-02-12**
