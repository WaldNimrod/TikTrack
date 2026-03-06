# TEAM_10 → Teams 20, 30, 50 | S002-P003-WP002 GATE_5 R-Remediation Mandate (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAMS_20_30_50_S002_P003_WP002_G5_R_REMEDIATION_MANDATE_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 20 (Backend), Team 30 (Frontend), Team 50 (QA)  
**cc:** Team 60, Team 90  
**date:** 2026-03-06  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_5 (BLOCKED)  
**work_package_id:** S002-P003-WP002  
**authority:** TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE5_BLOCK_REMEDIATION_INSTRUCTIONS_v1.0.0.md; TEAM_10_S002_P003_WP002_G5_R_REMEDIATION_EXECUTION_PLAN_v1.0.0.md  

---

## 1) מטרה

להניע את ביצוע **R-001..R-014** עד **סגירה מלאה** עם evidence-by-path, כדי לאפשר הגשת חבילת GATE_5 Re-validation ל־Team 90. כל צוות מקבל כאן את רשימת ה־R הרלוונטיים לו ואת פורמט ה־evidence המחייב.

---

## 2) פורמט evidence (מחייב לכל R)

לכל סעיף R-00X:

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

**שורה ללא artifact_path קיים בדיסק = לא תקפה** (per Instructions §3).

---

## 3) Team 20 — R-items באחריות

| R | דרישה | תוצר נדרש |
|---|--------|------------|
| **R-005** | Notes linkage: create ללא entity נחסם ב־API; אין קבלת parent_id=null כש־entity נבחר. | עדכון API/validation + evidence_path + verification_report (API/QA). |
| **R-006** | Intraday price: fallback (EOD + intraday) + provenance מה־API. | API מחזיר price_source / provenance; evidence_path. |
| **R-008** | D35 קבצים: round-trip (upload→save→visible→open/download→remove). | וידוא backend תומך; אם חסר — תיקון + evidence. |
| **R-010** | טיקר קנוני: מסלול יחיד, מניעת כפילויות, אין טיקר פעיל בלי נתוני שוק תקינים. | וידוא endpoints ו־validation; evidence_path. |

**תוצר:** דוח השלמה עם שורות evidence לכל R-005, R-006, R-008, R-010 בפורמט §2. נתיב מומלץ: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_20_S002_P003_WP002_G5_R_REMEDIATION_COMPLETION_v1.0.0.md`

---

## 4) Team 30 — R-items באחריות

| R | דרישה | תוצר נדרש |
|---|--------|------------|
| **R-005** | Notes: create עם entity-link תקין; create ללא linkage נחסם ב־UI; אין שליחת parent_id=null. | וידוא UI + evidence_path. |
| **R-006** | רינדור מקור נתון (provenance) ב־UI. | וידוא תצוגת price_source / price_as_of_utc. |
| **R-007** | "מקושר ל": סוג + שם רשומה (למשל "טיקר: AAPL") + קישור למודול פרטים. | וידוא בכל הטבלאות הרלוונטיות; evidence_path. |
| **R-008** | D35: upload→save→visible in table→details→open/download→remove→verify removed. | וידוא UI; evidence_path. |
| **R-009** | רענון טבלאות אחרי כל CRUD מיידי. | וידוא refresh* אחרי כל save; evidence_path. |
| **R-010** | מסלול יצירת טיקר קנוני ב־UI; אין טיקר פעיל בלי נתוני שוק. | וידוא D22 flow; evidence_path. |
| **R-011** | Tooltip coverage — תפריטי פעולות ופילטרים. | title/aria-label מלא; evidence_path. |
| **R-012** | אחידות כפתורים — "ביטול" לא "לבטל". | וידוא כל מודלים; evidence_path. |
| **R-013** | יישור UI — notesSummaryToggleSize, pagination, action menu layout. | evidence_path. |
| **R-014** | מודולי פרטים אחידים — צבעי ישות, אלמנטים מקושרים. | evidence_path. |

**תוצר:** דוח השלמה עם שורות evidence לכל R למעלה בפורמט §2. נתיב מומלץ: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_30_S002_P003_WP002_G5_R_REMEDIATION_COMPLETION_v1.0.0.md`

---

## 5) Team 50 — R-items באחריות

| R | דרישה | תוצר נדרש |
|---|--------|------------|
| **R-003** | 008/012/024: **אופציה A** — E2E PASS לשלושת הסעיפים; **או אופציה B** — חריג חתום (Team 90/ארכיטקט) ל־code-only. | דוח: `TEAM_10_S002_P003_WP002_G5_008_012_024_VALIDATION_DECISION_v1.0.0.md` — תיעוד A (תוצאות E2E) או B (חריג חתום). |
| **R-004** | Auth: או PASS מבצעי מלא (E2E Auth), או החלטה חתומה שמאשרת CLOSED כחלופה קבילה. | תיעוד ב־מטריצה/דוח; אם נדרש — בקשת חתימה מ־Team 90/ארכיטקט. |
| **R-008** | וידוא E2E/QA ל־D35 round-trip. | verification_report + verification_type E2E/QA. |

**תוצר:**  
1. דוח 008/012/024 (R-003) — אופציה A או B.  
2. עדכון R-004 — Auth PASS או CLOSED מאושר חתום.  
3. דוח השלמה עם שורות evidence ל־R-003, R-004, R-008 בפורמט §2.  
נתיב מומלץ: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_S002_P003_WP002_G5_R_REMEDIATION_COMPLETION_v1.0.0.md`

---

## 6) סדר ביצוע

1. Team 20 ו־30 — לסגור R-005..R-014 (כולל R-008, R-009, R-010) עם evidence.  
2. Team 50 — להריץ E2E ל־008/012/024 או להכין בקשת חריג חתום; לסגור R-004 (Auth).  
3. Team 10 — לאסוף דוחות, לעדכן מטריצה נעולה ודוח 008/012/024, להכין חבילת handoff ל־Team 90.

**אין** הגשת handoff ל־Team 90 עד שכל R-001..R-010 ו־R-011..R-014 מסומנים CLOSED עם artifact_path תקף.

---

**log_entry | TEAM_10 | G5_R_REMEDIATION_MANDATE | TO_20_30_50 | S002_P003_WP002 | 2026-03-06**
