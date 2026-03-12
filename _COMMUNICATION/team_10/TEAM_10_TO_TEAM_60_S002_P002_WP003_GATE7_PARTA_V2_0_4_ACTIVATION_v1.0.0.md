# Team 10 → Team 60 | S002-P002-WP003 GATE_7 Part A v2.0.4 — הפעלה

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_60_S002_P002_WP003_GATE7_PARTA_V2_0_4_ACTIVATION_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 60 (Runtime/Infra)  
**cc:** Team 50, Team 90  
**date:** 2026-03-12  
**status:** MANDATE_ACTIVE  
**authority:** TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_TARGETED_EVIDENCE_MANDATE_v2.0.3  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 Part A |
| phase_owner | Team 90 |

---

## 1) מטרה

לייצר **עדות v2.0.4** — shared run set, **log לא ריק**, תואם Team 50 (אין סתירה).

---

## 2) דרישות חובה (מנדט Team 90)

| # | דרישה | פעולה |
|---|-------|-------|
| 1 | **Log לא ריק** | Backend עם stdout capture — trace runtime אמיתי (לא placeholder) |
| 2 | **Shared run** | אותו run_id, אותה log_path — Team 50 ישתמש בהם לאימות |
| 3 | **CC-01** | Run A (market-open); cc_01_yahoo_call_count ≤ 5 |
| 4 | **CC-02** | Run B (off-hours); cc_02_yahoo_call_count ≤ 2 |
| 5 | **CC-04** | 4-cycle; cc_04_yahoo_429_count = 0 (cooldown activations) |

---

## 3) ביצוע

1. **Backend עם capture:**  
   `uvicorn ... 2>&1 | tee <log_path>` — וודא שהלוג מכיל traces (Yahoo, provider, וכו׳).

2. **הרצות:**
   - Run A: `G7_PART_A_LOG_PATH=<path> G7_PART_A_MODE=market_open python3 scripts/verify_g7_part_a_runtime.py`
   - Run B: `G7_PART_A_LOG_PATH=<path> G7_PART_A_MODE=off_hours python3 scripts/verify_g7_part_a_runtime.py`
   - CC-04: `G7_PART_A_LOG_PATH=<path> G7_PART_A_MODE=four_cycle python3 scripts/verify_g7_part_a_runtime.py`  
   *(או `run_g7_part_a_evidence.py` לפי הגדרת הסקריפט — וודא log_path זהה)*

3. **וודא:** קובץ הלוג לא ריק — grep / וידוא שיש תוכן runtime.

---

## 4) דליברבלים

| ארטיפקט | נתיב |
|----------|------|
| דוח v2.0.4 | `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.4.md` |
| JSON | `documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json` |

**שדות JSON:** `log_path` (קובץ קיים ולא ריק), `cc_01_yahoo_call_count`, `cc_02_yahoo_call_count`, `cc_04_yahoo_429_count`, `pass_01`, `pass_02`, `pass_04`, `run_id` (אם קיים).

---

## 5) העברת נתונים ל־Team 50

עם סיום — העבר ל־Team 50: **log_path, run_id, verdicts (pass_01, pass_02, pass_04)**.  
Team 50 יגיש corroboration v2.0.4 **תואם בדיוק** ל־verdicts שלכם — **ללא ריצה נפרדת**.

---

**log_entry | TEAM_10 | WP003_G7_PARTA_V2_0_4_ACTIVATION | TO_TEAM_60 | MANDATE_ACTIVE | 2026-03-12**
