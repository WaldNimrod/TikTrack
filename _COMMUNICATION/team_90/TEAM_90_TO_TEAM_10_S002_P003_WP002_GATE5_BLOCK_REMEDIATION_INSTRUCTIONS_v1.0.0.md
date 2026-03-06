# Team 90 -> Team 10 | GATE_5 BLOCK Remediation Instructions (No-Guess) — S002-P003-WP002
**project_domain:** TIKTRACK

**id:** TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE5_BLOCK_REMEDIATION_INSTRUCTIONS_v1.0.0  
**from:** Team 90 (External Validation Unit — GATE_5 owner)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 50, Team 20, Team 30, Team 60, Team 00, Team 100  
**date:** 2026-03-06  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_5  
**work_package_id:** S002-P003-WP002  
**in_response_to:**  
- `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE5_BLOCKING_REPORT_v1.1.0.md`  
- `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P003_WP002_GATE5_REOPEN_REQUIREMENTS_v1.0.0.md`

---

## Mandatory identity header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |
| task_id | N/A |
| gate_id | GATE_5 |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | TIKTRACK |

---

## 1) מטרת המסמך

מסמך זה מגדיר בצורה דטרמיניסטית וממוספרת מה Team 10 חייב להשלים לפני פתיחה מחדש של GATE_5.  
אין להגיש חבילת Re-validation נוספת עד שכל הסעיפים כאן מסומנים CLOSED עם evidence-by-path.

---

## 2) רשימת תיקונים מחייבת (חוסם/לא חוסם)

### 2.1 חוסמים להגשה חוזרת (חובה לסגור לפני Re-submit)

1. **R-001 | החלפת מקור ה-19 פערים מ-DRAFT לנעול**  
   - נדרש: המסמך `TEAM_10_G7_OPEN_ITEMS_AND_VALIDATION_GAPS_v1.0.0.md` לא יכול להיות מקור הגשה כשהוא `DRAFT`.  
   - פעולה: להוציא גרסה נעולה (`LOCKED_FOR_G5_REVALIDATION`) או מטריצת סגירה חדשה שמחליפה אותו כמקור אמת.

2. **R-002 | מטריצת סגירה אחת נעולה ל-26 BF + 19 gaps**  
   - נדרש: ארטיפקט יחיד עם כל הפריטים, ללא פיצול סטטוסים בין מסמכים.  
   - כל שורה חייבת לכלול: `id | owner | status=CLOSED | evidence_path | verification_report | verifier | closed_date`.

3. **R-003 | סעיפי 008/012/024: החלטה מבצעית קשיחה**  
   - אחת משתי אופציות בלבד:  
     - **A:** E2E PASS לשלושת הסעיפים; או  
     - **B:** חריג חתום מראש (Team 90/Architect) שמאשר code-only עבור שלושתם.  
   - ללא A או B חתום: חוסם.

4. **R-004 | סעיף Auth לא יכול להישאר CLOSED מעורפל**  
   - נדרש: או PASS מבצעי מלא, או החלטה חתומה שמאשרת CLOSED כחלופה קבילה.  
   - "CLOSED עם נימוק פנימי" ללא אישור סמכותי מפורש לא מספיק.

5. **R-005 | Notes linkage mismatch (Team 190 finding) חייב סגירה מוכחת**  
   - נדרש: create note עם entity-link תקין עובד; create ללא linkage נחסם ב-UI וב-API; אין מצב UI שולח `parent_id=null` כשסוג הוא entity.

6. **R-006 | Intraday price surface staleness חייב סגירה מוכחת**  
   - נדרש: fallback ברור ומוכח (EOD ישן + intraday עדכני) + החזרת provenance מה-API + רינדור מקור נתון ב-UI.

7. **R-007 | "מקושר ל" חייב סוג + שם רשומה ספציפית + קישור פרטים**  
   - נדרש: לא רק "טיקר", אלא לדוגמה "טיקר: AAPL"; תא מקושר פותח מודול פרטים של הישות.

8. **R-008 | קבצים בהערות (D35) חייבים round-trip מלא**  
   - נדרש: upload -> save -> visible in table -> visible in details -> open/download -> remove -> verify removed.

9. **R-009 | רענון טבלאות אחרי עדכון רשומה**  
   - נדרש: כל עדכון ב-CRUD מתבטא מייד בטבלה ללא ריענון עמוד ידני.

10. **R-010 | תהליך יצירת טיקר קנוני יחיד + ולידציית נתוני שוק**  
    - נדרש: מסלול canonical יחיד ליצירת system ticker; מניעת כפילויות symbol; אין טיקר פעיל ללא נתוני שוק תקינים.

### 2.2 דרישות איכות משלימות (לא חוסם לבד, אך חייב להיסגר בחבילה)

11. **R-011 | Tooltip coverage לתפריטי פעולות ופילטרים**  
12. **R-012 | אחידות כפתורים וניסוח (`ביטול` ולא `לבטל`)**  
13. **R-013 | יישור UI (כולל `notesSummaryToggleSize`, pagination, action menu layout)**  
14. **R-014 | מודולי פרטים אחידים לפי blueprint (כולל צבעי ישות ואלמנטים מקושרים)**

---

## 3) פורמט evidence מחייב לכל סעיף

לכל סעיף R-001..R-014 יש לצרף שורת ראיה במבנה הבא:

```text
id: R-00X
status: CLOSED
owner: Team XX
artifact_path: <path>
verification_report: <path>
verification_type: E2E | QA | API | CODE_REVIEW | ARCH_EXCEPTION
verified_by: Team 50 | Team 90 | Team 00/100
closed_date: YYYY-MM-DD
notes: <optional>
```

שורה ללא `artifact_path` קיים בדיסק = לא תקפה.

---

## 4) תוצרים ש-Team 10 חייב להגיש בסבב הבא

1. **מטריצת סגירה נעולה אחת**  
   - שם מומלץ:  
     `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P003_WP002_G5_CLOSURE_MATRIX_LOCKED_v1.0.0.md`

2. **דוח אימות E2E/חריג חתום עבור 008/012/024**  
   - שם מומלץ:  
     `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P003_WP002_G5_008_012_024_VALIDATION_DECISION_v1.0.0.md`

3. **גרסת LOCKED למסמך 19 gaps או Replacement נעול**  
   - לא `DRAFT`.

4. **חבילת handoff חדשה ל-Team 90 (Re-validation)**  
   - כוללת הפניה מפורשת לכל R-001..R-014 עם סטטוס CLOSED.

---

## 5) תנאי כניסה לבדיקה חוזרת ב-Team 90

Team 90 יפתח re-validation רק אם כל התנאים מתקיימים:

- אין מסמך מקור במצב `DRAFT`.
- מטריצה נעולה אחת מכסה 26+19 במלואה.
- 008/012/024 נסגרו לפי A או B (כולל חתימה כשנדרש).
- אין סעיף חוסם פתוח (`R-001` עד `R-010`).
- כל evidence paths ניתנים לאימות בדיסק.

אם אחד מהתנאים חסר -> החבילה תוחזר ללא פתיחת סבב ולידציה.

---

## 6) No-Guess Rule

אין סעיפי "בערך סגור", אין "נסגר בקוד" ללא מסמך החלטה מתאים, ואין "CLOSED_PENDING".  
הסגירה הקבילה היחידה: `CLOSED + evidence-by-path + verification_report`.

---

**log_entry | TEAM_90 | TO_TEAM_10 | S002_P003_WP002_GATE5_BLOCK_REMEDIATION_INSTRUCTIONS_v1_0_0 | ACTION_REQUIRED | 2026-03-06**
