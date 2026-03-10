# Team 10 → Team 60 | S002-P002-WP003 GATE_7 Remediation — Mandate

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_60_S002_P002_WP003_GATE7_REMEDIATION_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 60 (Infrastructure)  
**date:** 2026-03-11  
**status:** MANDATE_ACTIVE  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**authority:** TEAM_90_TO_TEAM_10_S002_P002_WP003_GATE7_BLOCKING_REPORT_v1.0.0  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 |
| phase_owner | Team 10 |

---

## 1) Scope — BF-004 (Investigation)

**SSOT answers:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_WP003_GATE7_REMEDIATION_ANSWERS_v1.0.0.md`

| BF ID | Description | Your responsibility |
|-------|-------------|---------------------|
| **BF-004** | "24 days" root cause | **Finding:** Staleness clock reads from `/reference/exchange-rates` `last_sync_time` — exchange rates not updated 24 days. **Investigation:** Why have exchange rates not been updated for 24 days? Document and recommend fix (scheduler, job, or manual refresh). UI fix is Team 30 (bind clock to ticker `price_as_of_utc`). |

---

## 2) SSOT

- **Remediation scope:** `_COMMUNICATION/team_10/TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_SCOPE_LOCK_v1.0.0.md`
- **Blocking report:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P002_WP003_GATE7_BLOCKING_REPORT_v1.0.0.md`

---

## 3) Deliverable

**נתיב:** `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_COMPLETION.md`

- status: DONE | BLOCKED
- Evidence: pipeline state flow, timestamp sources
- Integration note for Teams 20/30

---

**log_entry | TEAM_10 | WP003_G7_REMEDIATION_MANDATE | TO_TEAM_60 | 2026-03-11**
