# Team 90 -> Team 60, Team 50 | S002-P002-WP003 GATE_7 Part A Re-run Mandate v2.0.1

**project_domain:** TIKTRACK  
**id:** TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_RERUN_MANDATE_v2.0.1  
**from:** Team 90 (GATE_7 owner)  
**to:** Team 60 (Runtime/Infra), Team 50 (QA corroboration)  
**cc:** Team 10, Team 00, Team 100, Team 190  
**date:** 2026-03-11  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**supersedes:** TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_RUNTIME_MANDATE_v2.0.0

---

## 1) Trigger

Part A BLOCK due CC-WP003-04 failure and evidence admissibility gaps.

---

## 2) Required re-run evidence set

### CC-WP003-01 (market-open)
- Captured log file path is mandatory.
- Explicit counted Yahoo calls in tested cycle.
- PASS threshold: `<= 5`.

### CC-WP003-02 (off-hours)
- Separate off-hours capture window.
- Explicit counted Yahoo calls in tested cycle.
- PASS threshold: `<= 2`.

### CC-WP003-04 (4-cycle / ~1h)
- Four consecutive cycles in one evidence window.
- Explicit counted Yahoo `429` occurrences.
- PASS threshold: `0`.

---

## 3) Evidence quality requirements (mandatory)

1. Report date must match current cycle date/time (UTC).  
2. `G7_PART_A_RUNTIME_EVIDENCE.json` must include:
   - non-empty `log_path`
   - non-null `pass_01`, `pass_02`, `pass_04`
   - explicit counts.
3. Team 50 corroboration must match Team 60 verdicts exactly (no contradiction).

---

## 4) Output artifacts

1. `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.1.md`  
2. `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_QA_CORROBORATION_v2.0.1.md`  
3. `documentation/reports/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json` (updated in-place with valid fields)

---

**log_entry | TEAM_90 | TO_TEAM_60_TEAM_50 | S002_P002_WP003_GATE7_PARTA_RERUN_MANDATE_v2.0.1 | ACTION_REQUIRED | 2026-03-11**
