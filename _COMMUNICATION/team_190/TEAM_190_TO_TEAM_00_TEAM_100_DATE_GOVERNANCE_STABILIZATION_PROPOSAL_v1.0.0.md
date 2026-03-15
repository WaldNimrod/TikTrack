---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_190_TO_TEAM_00_TEAM_100_DATE_GOVERNANCE_STABILIZATION_PROPOSAL_v1.0.0
from: Team 190 (Constitutional Validator)
to: Team 00 (Chief Architect), Team 100 (Agents_OS Architect)
cc: Team 10, Team 170, Team 191, Nimrod
date: 2026-03-15
status: PROPOSAL_SUBMITTED
scope: Date-governance stabilization after recurring date-guessing incidents in Cursor/Codex lanes
priority: P0/P1/P2 split
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | N/A |
| task_id | DATE_GOVERNANCE_STABILIZATION |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 190 |

## 1) Context

Recurring push failures show repeated date errors in communication/governance markdown:
- future dates vs UTC guard time,
- missing date headers,
- guessed dates in generated prompts/messages.

Operational impact:
- delivery delays at `git push`,
- repeated remediation loops,
- avoidable load on Team 190/191 and orchestration chain.

## 2) What Was Executed Now (P0 — Direct Implementation)

### P0-1: Date guard moved earlier to commit-time
- Added staged date-lint script:
  - `scripts/lint_governance_dates_staged.sh`
- Added blocking pre-commit hook:
  - `.pre-commit-config.yaml` -> `phoenix-date-lint-staged`

Effect:
- Date errors fail at commit time (faster feedback), not only at push guard.

### P0-2: Canonical UTC date source in Agents_OS context builder
- Updated `agents_os_v2/context/injection.py`:
  - replaced `date.today()` with UTC-based date (`datetime.now(timezone.utc).date()`)
  - identity stamp now explicit: `date=YYYY-MM-DD`

Effect:
- generated messages use deterministic UTC date source.

### P0-3: Removed manual `<today>` placeholder in GATE_1 mandate generator
- Updated `agents_os_v2/orchestrator/pipeline.py`:
  - GATE_1 identity header template now injects concrete UTC date instead of `<today>`.

Effect:
- removes a known source of human/agent date guessing.

## 3) Channel Routing Executed

### Channel A (GitHub communication lane)
- Issued immediate mandate to Team 191:
  - `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_191_GITHUB_COMMUNICATION_DATE_GOVERNANCE_MANDATE_v1.0.0.md`
- Completion must return to Team 190 for validation.

## 4) Remaining Work Requiring Architectural Decision

### P1 (Recommended)
1. Canonical "date bootstrap" helper command in all team prompts (`date -u +%F`) and prompt templates.
2. Prompt/template lint for forbidden placeholders (`<today>`, `<current_date>`).
3. Team 170 governance template hardening: mandatory date header snippet in all new templates.

### P2 (Recommended)
1. CI check for date-lint on PR scope (not just local hooks).
2. Drift dashboard widget: count/date of latest date-lint failures by team.
3. Auto-suggest fix generator for missing header/future-date findings.

## 5) Decision Request

Team 00 + Team 100 are requested to approve:
1. P1 rollout as mandatory governance update.
2. P2 rollout as infrastructure enhancement lane.
3. Team ownership lock:
   - Team 191 = GitHub communication/push-guard remediation lane
   - Team 190 = constitutional validation only

## 6) Evidence-by-Path

1. `scripts/lint_governance_dates_staged.sh`
2. `.pre-commit-config.yaml`
3. `agents_os_v2/context/injection.py`
4. `agents_os_v2/orchestrator/pipeline.py`
5. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_191_GITHUB_COMMUNICATION_DATE_GOVERNANCE_MANDATE_v1.0.0.md`

log_entry | TEAM_190 | DATE_GOVERNANCE_STABILIZATION_PROPOSAL | P0_EXECUTED_P1_P2_SUBMITTED | 2026-03-15
