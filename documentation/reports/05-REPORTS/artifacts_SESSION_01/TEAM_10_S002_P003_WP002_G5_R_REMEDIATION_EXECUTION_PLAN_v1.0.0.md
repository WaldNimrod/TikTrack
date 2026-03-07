# TEAM_10 | S002-P003-WP002 GATE_5 — תוכנית ביצוע R-001..R-014 (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P003_WP002_G5_R_REMEDIATION_EXECUTION_PLAN_v1.0.0  
**owner:** Team 10 (Execution Orchestrator)  
**date:** 2026-03-06  
**status:** ACTIVE  
**gate_id:** GATE_5 (BLOCKED)  
**work_package_id:** S002-P003-WP002  
**authority:** TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE5_BLOCK_REMEDIATION_INSTRUCTIONS_v1.0.0.md  

---

## 1) מיפוי R-001..R-014 — בעלים ותוצר

| R | תיאור קצר | בעלים עיקרי | תוצר / פעולה | סטטוס |
|---|------------|-------------|---------------|--------|
| **R-001** | החלפת מקור 19 מ-DRAFT לנעול | **Team 10** | מקור הגשה = רק `TEAM_10_G7_OPEN_ITEMS_CLOSURE_LOCKED_v1.0.0.md`; handoff לא מפנה ל־DRAFT. | להשלים בהגשה |
| **R-002** | מטריצת סגירה אחת נעולה 26+19 | **Team 10** | ארטיפקט יחיד: `TEAM_10_S002_P003_WP002_G5_CLOSURE_MATRIX_LOCKED_v1.0.0.md` — עמודות id\|owner\|status\|evidence_path\|verification_report\|verifier\|closed_date. | ביצוע ישיר Team 10 |
| **R-003** | 008/012/024 — E2E PASS או חריג חתום | **Team 50** (+ 20/30 לתיקון) | דוח: `TEAM_10_S002_P003_WP002_G5_008_012_024_VALIDATION_DECISION_v1.0.0.md` — אופציה A (E2E PASS) או B (חריג Team 90/ארכיטקט). | מנדט ל־50; 20/30 אם נדרש |
| **R-004** | Auth — PASS או CLOSED מאושר חתום | **Team 50** + **Team 10** | או E2E Auth PASS, או החלטה חתומה (Team 90/ארכיטקט) שמאשרת CLOSED. Team 10 להשיג חתימה. | מנדט/תיאום |
| **R-005** | Notes linkage — create עם entity תקין; בלי parent_id=null | **Team 20 + 30** | UI + API: create note עם entity-link עובד; create ללא linkage נחסם; אין שליחת parent_id=null כש־entity נבחר. | מנדט 20+30 |
| **R-006** | Intraday price staleness — fallback + provenance + UI | **Team 20 + 30** | API: provenance (EOD/intraday); UI: רינדור מקור. | מנדט 20+30 |
| **R-007** | "מקושר ל" — סוג + שם רשומה + קישור פרטים | **Team 30** | לא רק "טיקר" — "טיקר: AAPL"; תא מקושר פותח מודול פרטים. | מנדט 30 |
| **R-008** | D35 קבצים — round-trip מלא | **Team 30 + 50** | upload→save→visible in table→details→open/download→remove→verify removed. | מנדט 30+50 |
| **R-009** | רענון טבלאות אחרי CRUD | **Team 30** | כל עדכון CRUD מתבטא מייד בטבלה. | מנדט 30 (וידוא) |
| **R-010** | טיקר קנוני + ולידציית שוק | **Team 20 + 30** | מסלול יחיד; מניעת כפילויות; אין טיקר פעיל בלי נתוני שוק תקינים. | מנדט 20+30 |
| **R-011** | Tooltip coverage — פעולות ופילטרים | **Team 30** | title/aria-label מלא. | מנדט 30 |
| **R-012** | אחידות כפתורים — "ביטול" לא "לבטל" | **Team 30** | כל מודלים. | מנדט 30 |
| **R-013** | יישור UI — notesSummaryToggleSize, pagination, layout | **Team 30** | לפי blueprint. | מנדט 30 |
| **R-014** | מודולי פרטים אחידים — צבעי ישות, מקושרים | **Team 30** | לפי blueprint. | מנדט 30 |

---

## 2) סדר ביצוע מומלץ

1. **Team 10 ישיר:** R-002 — פרסום מטריצה נעולה (עם verifier, closed_date). R-001 — וידוא ש־handoff משתמש רק ב־CLOSURE_LOCKED.  
2. **מנדטים:** 20, 30, 50 — מנדט מאוחד: `_COMMUNICATION/team_10/TEAM_10_TO_TEAMS_20_30_50_S002_P003_WP002_G5_R_REMEDIATION_MANDATE_v1.0.0.md` (רשימת R לכל צוות + פורמט evidence §3 Instructions).  
3. **R-003, R-004:** Team 50 — E2E ל־008/012/024 או בקשת חריג; Auth — E2E או החלטה חתומה. Team 10 — השגת חתימה (חריג/אישור Auth).  
4. **איסוף:** Team 10 אוסף evidence_path ו־verification_report; מעדכן מטריצה נעולה; מכין דוח 008/012/024.  
5. **Handoff:** חבילה ל־Team 90 עם הפניה מפורשת ל־R-001..R-014 כולם CLOSED.

---

## 3) תוצרים חובה (§4 Instructions)

| # | תוצר | בעלים | נתיב |
|---|--------|--------|------|
| 1 | מטריצת סגירה נעולה | Team 10 | `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P003_WP002_G5_CLOSURE_MATRIX_LOCKED_v1.0.0.md` |
| 2 | דוח 008/012/024 (E2E או חריג) | Team 50 + Team 10 | `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P003_WP002_G5_008_012_024_VALIDATION_DECISION_v1.0.0.md` |
| 3 | מקור 19 — נעול (לא DRAFT) | Team 10 | `TEAM_10_G7_OPEN_ITEMS_CLOSURE_LOCKED_v1.0.0.md` (קיים); handoff לא ינה ל־DRAFT |
| 4 | חבילת handoff ל־Team 90 | Team 10 | הפניה מפורשת ל־R-001..R-014 CLOSED + קישורים לארבעת התוצרים |

---

## 4) תנאי כניסה ל־Team 90 (§5 Instructions)

- אין מסמך מקור ב־DRAFT.  
- מטריצה נעולה אחת מכסה 26+19.  
- 008/012/024 לפי A או B (כולל חתימה אם נדרש).  
- אין חוסם פתוח (R-001..R-010).  
- כל evidence paths ניתנים לאימות בדיסק.

---

**log_entry | TEAM_10 | G5_R_REMEDIATION_EXECUTION_PLAN | S002_P003_WP002 | 2026-03-06**
