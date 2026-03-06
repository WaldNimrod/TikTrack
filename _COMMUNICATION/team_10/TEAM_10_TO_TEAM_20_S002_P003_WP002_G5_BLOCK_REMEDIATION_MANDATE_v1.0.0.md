# TEAM_10 → TEAM_20 | S002-P003-WP002 GATE_5 BLOCK — Remediation Mandate (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_S002_P003_WP002_G5_BLOCK_REMEDIATION_MANDATE_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 20 (Backend)  
**cc:** Team 30, Team 50, Team 60, Team 90  
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

GATE_5 נחסם (Team 90). נדרשת מטריצת סגירה דטרמיניסטית ל־26 BF + 19 gaps עם evidence-by-path. מנדט זה מגדיר את **אחריות Team 20** — API/DB — ואת צ'קליסט הסגירה לכל BF ID שבבעלותכם.

---

## 2) Scope — BF IDs (26 BF, חבילה מקורית)

| BF ID | Finding (קיצור) | Closure proof (מינימום) | Checklist |
|-------|------------------|--------------------------|-----------|
| **BF-G7-008** | No ticker symbol validation | Invalid symbols blocked by provider validation; API returns 422 + clear message | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-009** | Duplicate symbol allowed | Unique symbol enforcement (API + DB) | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-010** | Delete ticker ignores user_tickers refs | Delete guard + clear error message | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-011** | Ticker status update not persisted | Status update persists and returns in list | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-013** | Alert without condition allowed | Save blocked unless condition valid | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-014** | `general` linkage still allowed | Create/edit blocks `general` | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-017** | Linked entity optional | Linked entity mandatory (alert/note) | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |
| **BF-G7-025** | Max file size too small | Size limit raised to 2.5MB | [ ] status=CLOSED \| [ ] evidence_path \| [ ] verification_report |

---

## 3) Required deliverable

- **Completion report** הכולל טבלה: לכל שורה (008, 009, 010, 011, 013, 014, 017, 025) — `id | owner | status=CLOSED | evidence_path | verification_report`.
- **evidence_path:** נתיב קובץ או מזהה (קוד, בדיקת API, לוג) המוכיח סגירה.
- **verification_report:** שורת דוח או E2E/תרחיש שמוודא את הסגירה.
- **אין** שורה עם status שונה מ־CLOSED; אין "חלקי" או "בבדיקה".

**נתיב מומלץ:** `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_20_S002_P003_WP002_G5_BLOCK_REMEDIATION_COMPLETION_v1.0.0.md`

---

## 4) References

- חבילה מקורית (26 BF): `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P003_WP002_G7_REMEDIATION_ACTIVATION_v1.0.0.md`
- דוח חסימה: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE5_BLOCKING_REPORT_v1.1.0.md`
- ניתוב תיקון: `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_S002_P003_WP002_G5_BLOCK_REMEDIATION_ROUTING_v1.0.0.md`

---

**log_entry | TEAM_10 | G5_BLOCK_MANDATE | TO_TEAM_20 | S002_P003_WP002 | 2026-03-06**
