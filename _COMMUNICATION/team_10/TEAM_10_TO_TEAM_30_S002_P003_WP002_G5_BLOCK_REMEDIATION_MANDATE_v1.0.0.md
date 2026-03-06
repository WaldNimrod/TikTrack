# TEAM_10 → TEAM_30 | S002-P003-WP002 GATE_5 BLOCK — Remediation Mandate (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_30_S002_P003_WP002_G5_BLOCK_REMEDIATION_MANDATE_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 30 (Frontend)  
**cc:** Team 20, Team 50, Team 60, Team 90  
**date:** 2026-03-06  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_5 (BLOCKED_REMEDIATION_INCOMPLETE)  
**work_package_id:** S002-P003-WP002  
**authority:** TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE5_BLOCKING_REPORT_v1.1.0.md, TEAM_10_S002_P003_WP002_G5_BLOCK_REMEDIATION_ROUTING_v1.0.0.md  

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

## 1) Context

GATE_5 נחסם (Team 90). נדרשת מטריצת סגירה דטרמיניסטית ל־26 BF + 19 gaps עם evidence-by-path. מנדט זה מגדיר את **אחריות Team 30** — UI — ואת צ'קליסט הסגירה לכל BF ID שבבעלותכם, **ובנוסף** וידוא UI ל־19 הפערים (linkage, attachments, refresh, forms).

---

## 2) Scope — BF IDs (26 BF, חבילה מקורית)

| BF ID | Finding (קיצור) | Closure proof (מינימום) | Checklist |
|-------|------------------|--------------------------|-----------|
| **BF-G7-001** | Favicon missing | Favicon visible in browser tab + path in app HTML | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-002** | D22 wrong entity color | D22 visual uses ticker entity color | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-003** | D22 validation messaging unclear | Concise inline validation summary | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-004** | D22 filter buttons not canonical | Canonical CSS size/icons applied | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-005** | Missing action tooltips | Tooltips on all row action buttons | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-006** | `לבטל` text | All modal cancel labels are `ביטול` | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-007** | D22 modal entity color missing | Modal header/buttons use ticker entity color | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-012** | linked_to lacks record name | Linked type + linked record name rendered | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-015** | Alert message not rich text | Rich-text editor + persisted content | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-016** | `#alertsSummaryToggleSize` alignment | Aligned to row end | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-018** | Cannot edit linked entity | Edit flow supports linked entity change | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-019** | `#notesPageNumbers` wraps lines | No line break; horizontal pagination | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-020** | File error closes modal | Inline error; modal stays open | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-021** | File error not styled as error | Error style token used | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-022** | New attachment not shown immediately | Optimistic/instant list update | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-023** | Attachments not shown in table | Attachment indicator/render in rows | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-024** | No attachment preview/open in details | Preview + open action implemented | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-026** | Table not refreshed after any update | Post-CRUD table state refresh is immediate | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |

---

## 3) Scope — 19 gaps (UI proof)

וידוא UI לפריטים ברשימת הפערים הרלוונטיים ל־Frontend: linkage semantics, attachment UX, table refresh, ticker validation (הודעת שגיאה ב־UI), טפסים (קישור חובה, ישות מקושרת read-only וכו'). לכל פריט שטופל — **evidence_path** + **verification_report** (E2E או אימות קוד מתועד).

רשימת הפערים: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_G7_OPEN_ITEMS_AND_VALIDATION_GAPS_v1.0.0.md` (סעיפים 1–19). דגש על: 1 (008 UI), 2 (012), 3 (024), 4 (T50-1), 5 (T50-2), 6 (T50-3), 7–11 (T50-4..8), 12 (T190-Notes), 13 (T190-Price), 17 (G7-FD כפתור), 18–19 (G7-FD).

---

## 4) Required deliverable

- **Completion report** הכולל:
  - טבלה לכל BF ID למעלה (001–007, 012, 015, 016, 018–024, 026): `id | owner | status=CLOSED | evidence_path | verification_report`.
  - טבלה או נספח ל־19 הפערים — רק שורות שבאחריות UI; לכל שורה: evidence_path + verification_report.
- **אין** שורה עם status שונה מ־CLOSED; אין "חלקי" או "בבדיקה".

**נתיב מומלץ:** `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_30_S002_P003_WP002_G5_BLOCK_REMEDIATION_COMPLETION_v1.0.0.md`

---

## 5) References

- חבילה מקורית (26 BF): `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P003_WP002_G7_REMEDIATION_ACTIVATION_v1.0.0.md`
- רשימת פערים (19): `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_G7_OPEN_ITEMS_AND_VALIDATION_GAPS_v1.0.0.md`
- דוח חסימה: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE5_BLOCKING_REPORT_v1.1.0.md`
- ניתוב תיקון: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P003_WP002_G5_BLOCK_REMEDIATION_ROUTING_v1.0.0.md`

---

**log_entry | TEAM_10 | G5_BLOCK_MANDATE | TO_TEAM_30 | S002_P003_WP002 | 2026-03-06**
