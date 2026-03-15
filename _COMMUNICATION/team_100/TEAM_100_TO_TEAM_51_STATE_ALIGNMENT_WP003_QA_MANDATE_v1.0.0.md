---
project_domain: AGENTS_OS
id: TEAM_100_TO_TEAM_51_STATE_ALIGNMENT_WP003_QA_MANDATE_v1.0.0
from: Team 100 (AOS Domain Architects)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 10, Team 61, Team 100
date: 2026-03-15
status: MANDATE_ACTIVE
scope: QA mandate — S002-P005-WP003 GATE_4 acceptance criteria
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| program_id | S002-P005 |
| work_package_id | S002-P005-WP003 |
| gate_id | GATE_4 |
| phase_owner | Team 51 |

---

## QA Scope (GATE_4 — all items must PASS before submission to Team 90)

### P0 mandatory — ALL must be green

| test_id | description | pass_condition |
|---|---|---|
| QA-P0-01 | Provenance badge — Dashboard | Source badge visible for all status blocks; correct source labeled |
| QA-P0-02 | Provenance badge — Roadmap | Program status cards show `[live: domain]` or `[registry_mirror]` |
| QA-P0-03 | Provenance badge — Teams | Each domain row shows `[domain_file: X]` badge |
| QA-P0-04 | Gate contradiction check | Create test state with same gate in both completed + failed → pipeline.py rejects / corrects |
| QA-P0-05 | Fallback removal — missing domain file | Delete domain file, load page → `PRIMARY_STATE_READ_FAILED` panel; no fallback state |
| QA-P0-06 | Fallback removal — Python | `state.py` load with no domain file → `NO_ACTIVE_PIPELINE` object; no legacy read |
| QA-P0-07 | Sentinel: NONE inactive | `pipeline_state_tiktrack.json` with `work_package_id: "NONE"` → not detected as active |
| QA-P0-08 | Teams dual-domain strip | Teams page shows two rows: TikTrack + Agents_OS; both accurate |

### P1 mandatory

| test_id | description | pass_condition |
|---|---|---|
| QA-P1-01 | Closed-stage conflict detector | ACTIVE program in COMPLETE stage → banner shown or exception card |
| QA-P1-02 | EXPECTED_FILES idle state | No active WP → section shows "No active WP" message |
| QA-P1-03 | COMPLETE gate prompt | Dashboard in COMPLETE state → no 404, no JS error, informational message shown |
| QA-P1-04 | Snapshot freshness badge | Fresh snapshot → green badge; stale snapshot (manually age it) → yellow or red badge |
| QA-P1-05 | Date placeholders in prompts | At least 3 prompt templates use `{{date}}` or `date -u +%F` pattern |

### Regression
- All 3 AOS UI pages load without JS errors when served via `python3 -m http.server 8090`
- Domain selector (Dashboard) — TikTrack ↔ Agents_OS switching works correctly
- Roadmap tree renders with correct status labels (no ACTIVE label for COMPLETE programs)

### Iron Rules for QA
- Every QA run MUST be a FRESH validation — no repeating prior findings without re-execution
- GATE_4 requires PASS evidence: commands + outputs + exit codes (or browser screenshots with DOM inspection for JS items)
- No GATE_4 submission unless ALL P0 items pass

---

**log_entry | TEAM_100 | TO_TEAM_51 | STATE_ALIGNMENT_WP003_QA_MANDATE_ISSUED | 2026-03-16**
