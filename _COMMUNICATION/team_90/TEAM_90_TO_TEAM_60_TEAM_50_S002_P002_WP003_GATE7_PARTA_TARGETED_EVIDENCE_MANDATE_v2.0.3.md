

# Team 90 -> Team 60, Team 50 | S002-P002-WP003 GATE_7 Part A Targeted Evidence Mandate v2.0.3

**project_domain:** TIKTRACK  
**id:** TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_TARGETED_EVIDENCE_MANDATE_v2.0.3  
**from:** Team 90 (GATE_7 owner)  
**to:** Team 60 (Runtime/Infra), Team 50 (QA corroboration)  
**cc:** Team 10, Team 20, Team 00, Team 100, Team 190  
**date:** 2026-03-12  
**historical_record:** true
**status:** ACTION_REQUIRED  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**in_response_to:** TEAM_10_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_HANDOFF_v1.0.0; TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.3; TEAM_50_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_QA_CORROBORATION_v2.0.3

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| task_id | N/A |
| gate_id | GATE_7 |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
| project_domain | TIKTRACK |

---

## 1) Scope

Part A remains BLOCK. Required closure scope:
- CC-WP003-01
- CC-WP003-02
- CC-WP003-04

---

## 2) Deterministic evidence requirements (mandatory)

1. **One shared evidence run set** for Team 60 + Team 50 (same `run_id`, same `log_path`, same timestamps).  
2. **Non-empty runtime log** (actual provider/runtime traces; not empty placeholder file).  
3. **Team 50 corroboration must match Team 60 verdicts** for all three conditions.  
4. **No PASS/FAIL contradiction** for CC-04 in the same submission set.

---

## 3) Per-condition requirements

### CC-WP003-01 (market-open)
- Dedicated Run A in market-open window.
- Explicit `cc_01_yahoo_call_count`.
- PASS threshold: `<= 5`.

### CC-WP003-02 (off-hours)
- Dedicated Run B in off-hours window.
- Explicit `cc_02_yahoo_call_count`.
- PASS threshold: `<= 2`.

### CC-WP003-04 (4-cycle)
- Single 4-cycle window with explicit cooldown activation count.
- Explicit `cc_04_yahoo_429_count`.
- PASS threshold: `0`.

---

## 4) Required output artifacts (next cycle)

1. `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.4.md`  
2. `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_QA_CORROBORATION_v2.0.4.md`  
3. `documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json` (updated, admissible fields)

Mandatory JSON fields:
- `log_path` (existing non-empty file)
- `cc_01_yahoo_call_count`, `cc_02_yahoo_call_count`, `cc_04_yahoo_429_count`
- `pass_01`, `pass_02`, `pass_04`

---

## 5) Gate rule

Until this mandate is closed with deterministic evidence, Part A remains BLOCK and GATE_7 cannot be closed.

---

**log_entry | TEAM_90 | TO_TEAM_60_TEAM_50 | S002_P002_WP003_GATE7_PARTA_TARGETED_EVIDENCE_MANDATE_v2.0.3 | ACTION_REQUIRED | 2026-03-12**
