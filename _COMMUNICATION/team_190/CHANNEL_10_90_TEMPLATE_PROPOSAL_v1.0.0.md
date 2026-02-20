# CHANNEL_10_90_TEMPLATE_PROPOSAL_v1.0.0

**id:** CHANNEL_10_90_TEMPLATE_PROPOSAL_v1.0.0  
**from:** Team 190 (Constitutional Validation)  
**to:** Team 100, Team 10, Team 90  
**date:** 2026-02-20  
**status:** PROPOSED_CANONICAL  
**scope:** Channel 10↔90 validation loop formalization (Roadmap-First, Dual-Manifest aligned)

---

## 1) Alignment Anchors

- Dual-Manifest model: SSM (governance) + WSM (work state).
- Gate chain preserved: Gate 0..6, with Team 90 loop at Gate 4 (legacy alias: Gate-B allowed as label only).
- No inferred ownership: `phase_owner` and `responsible_team` must be explicit in payload.
- Deterministic loop: PASS/FAIL only, with formal blocker IDs and re-submission mapping.

---

## 2) Common Field Schema (Shared)

| Field | Type | Required | Used in | Rule |
|---|---|---|---|---|
| `message_id` | string | YES | A,B,C | Unique per document |
| `channel_id` | enum | YES | A,B,C | `CHANNEL_10_90` |
| `gate_id` | enum | YES | A,B,C | `GATE_4_DEV_VALIDATION` |
| `legacy_gate_alias` | string | NO | A,B,C | Optional label: `GATE_B` |
| `request_id` | string | YES | A,B,C | Stable loop key |
| `work_package_id` | string | YES | A,B,C | L2 package ID |
| `roadmap_l0_id` | string | YES | A,B,C | L0 linkage |
| `roadmap_l1_id` | string | YES | A,B,C | L1 linkage |
| `roadmap_l2_id` | string | YES | A,B,C | Must equal `work_package_id` |
| `required_ssm_version` | string | YES | A,B,C | Must match active SSM |
| `required_active_stage` | string | YES | A,B,C | Must match ACTIVE_STAGE |
| `phase_owner` | string | YES | A,B,C | Explicit owner only |
| `responsible_team` | string/list | YES | A,B,C | Explicit execution team(s) |
| `submission_iteration` | integer | YES | A,B,C | Starts at 1 |
| `max_resubmissions` | integer | YES | A,C | Loop cap for automation |
| `evidence[]` | array | YES | A,B,C | See evidence schema below |
| `overall_status` | enum | YES | B,C | `PASS` or `FAIL` |
| `blocking_report_id` | string | YES (FAIL) | C | Mandatory on FAIL |
| `resubmission_of` | string | YES (iteration>1) | A | Previous `request_id` |
| `declaration` | string | YES | A,B,C | No-guessing + no-overreach |

### Evidence item schema

| Field | Type | Required | Rule |
|---|---|---|---|
| `evidence_id` | string | YES | Unique in document |
| `assertion_id` | string | YES | Which claim it proves |
| `artifact_path` | string | YES | Repository path |
| `artifact_type` | enum | YES | `spec`, `code`, `test`, `report`, `log`, `manifest` |
| `producer_team` | string | YES | Team that produced artifact |
| `verified_by` | string | NO | Team/agent validating evidence |
| `checksum_sha256` | string | NO | Recommended for deterministic reruns |

---

## 3) Template A — WORK_PACKAGE_VALIDATION_REQUEST_TEMPLATE

### A.1 Purpose
Team 10 submits an L2 work package to Team 90 for Gate 4 validation.

### A.2 Required fields
Use all shared required fields plus:
- `scope_statement` (YES)
- `validation_targets[]` (YES)
- `pass_criteria[]` (YES)
- `fail_conditions[]` (YES)
- `deliverables_expected[]` (YES)

### A.3 Template (canonical markdown skeleton)

```md
# WORK_PACKAGE_VALIDATION_REQUEST_TEMPLATE

message_id: <...>
channel_id: CHANNEL_10_90
gate_id: GATE_4_DEV_VALIDATION
legacy_gate_alias: GATE_B
request_id: <...>
work_package_id: <L2-...>
roadmap_l0_id: <L0-...>
roadmap_l1_id: <L1-...>
roadmap_l2_id: <L2-...>
required_ssm_version: <...>
required_active_stage: <...>
phase_owner: <...>
responsible_team: <...>
submission_iteration: <n>
max_resubmissions: <n>
scope_statement: <exact scope>
validation_targets:
  - <target_1>
pass_criteria:
  - <criterion_1>
fail_conditions:
  - <condition_1>
deliverables_expected:
  - VALIDATION_RESPONSE_TEMPLATE
  - BLOCKING_REPORT_TEMPLATE (if FAIL)
evidence:
  - evidence_id: EV-001
    assertion_id: AS-001
    artifact_path: <path>
    artifact_type: <type>
    producer_team: <team>
declaration: "All fields explicit. No inferred ownership."
```

### A.4 Synthetic example (marked synthetic)

`SYNTHETIC_EXAMPLE`
- `request_id`: `REQ-L2-MB3A-ALERTS-001-20260220`
- `work_package_id`: `L2-MB3A-ALERTS-001`
- `phase_owner`: `Team 10`
- `responsible_team`: `Team 30`
- `required_ssm_version`: `1.0.0`
- `required_active_stage`: `GAP_CLOSURE_BEFORE_AGENT_POC`

---

## 4) Template B — VALIDATION_RESPONSE_TEMPLATE

### B.1 Purpose
Team 90 returns the validation verdict for a specific request iteration.

### B.2 Required fields
Use shared required fields plus:
- `validator_team` (YES, must be Team 90)
- `validated_scope` (YES)
- `check_results[]` (YES)
- `overall_status` (YES: `PASS`/`FAIL`)
- `next_action` (YES)

`check_results[]` item schema:
- `check_id` (YES)
- `description` (YES)
- `result` (YES: `PASS`/`FAIL`)
- `evidence_refs[]` (YES)
- `rule_id` (YES)

### B.3 Template (canonical markdown skeleton)

```md
# VALIDATION_RESPONSE_TEMPLATE

message_id: <...>
channel_id: CHANNEL_10_90
gate_id: GATE_4_DEV_VALIDATION
request_id: <...>
work_package_id: <...>
submission_iteration: <n>
validator_team: Team 90
validated_scope: <...>
check_results:
  - check_id: CHK-001
    description: <...>
    result: PASS|FAIL
    rule_id: BR-0X
    evidence_refs: [EV-001]
overall_status: PASS|FAIL
next_action: <If PASS -> route forward; If FAIL -> issue blocking report>
evidence:
  - evidence_id: EV-900-001
    assertion_id: AS-900-001
    artifact_path: <path>
    artifact_type: report
    producer_team: Team 90
declaration: "Validation executed against submitted evidence only."
```

### B.4 Synthetic example (marked synthetic)

`SYNTHETIC_EXAMPLE`
- `request_id`: `REQ-L2-MB3A-ALERTS-001-20260220`
- `overall_status`: `PASS`
- `next_action`: `Gate 4 passed; Team 10 may route to next gate in chain`

---

## 5) Template C — BLOCKING_REPORT_TEMPLATE

### C.1 Purpose
Formal FAIL artifact with deterministic remediation protocol.

### C.2 Required fields
Use shared required fields plus:
- `blocking_report_id` (YES)
- `failed_request_id` (YES)
- `blockers[]` (YES, at least one)
- `resubmission_requirements[]` (YES)
- `resubmission_deadline` (NO)
- `loop_termination_rule` (YES)

`blockers[]` item schema:
- `blocker_id` (YES, stable)
- `severity` (YES: `P0`/`P1`/`P2`)
- `rule_id` (YES)
- `finding` (YES)
- `required_fix` (YES)
- `evidence_refs[]` (YES)

### C.3 Template (canonical markdown skeleton)

```md
# BLOCKING_REPORT_TEMPLATE

message_id: <...>
channel_id: CHANNEL_10_90
gate_id: GATE_4_DEV_VALIDATION
blocking_report_id: <BLK-...>
failed_request_id: <REQ-...>
work_package_id: <L2-...>
submission_iteration: <n>
overall_status: FAIL
blockers:
  - blocker_id: BLK-001
    severity: P1
    rule_id: BR-03
    finding: <exact mismatch>
    required_fix: <exact action>
    evidence_refs: [EV-...]
resubmission_requirements:
  - blocker_id: BLK-001
    required_evidence: <path or artifact spec>
    owner: <team>
loop_termination_rule: <see section 6>
declaration: "FAIL issued with itemized blockers and evidence."
```

### C.4 Synthetic example (marked synthetic)

`SYNTHETIC_EXAMPLE`
- `blocking_report_id`: `BLK-L2-MB3A-001-ITER1`
- `rule_id`: `BR-02`
- `finding`: `required_active_stage mismatch`
- `required_fix`: `resubmit request with stage aligned to ACTIVE_STAGE`

---

## 6) Blocking Logic Formalization (Deterministic)

### Rule set (BR)

| Rule ID | Condition | Result |
|---|---|---|
| `BR-01` | Missing any required field | FAIL |
| `BR-02` | `required_active_stage` != canonical ACTIVE_STAGE | FAIL |
| `BR-03` | `required_ssm_version` != canonical SSM version | FAIL |
| `BR-04` | `phase_owner` or `responsible_team` missing/implicit | FAIL |
| `BR-05` | Evidence missing path or cannot prove mapped assertion | FAIL |
| `BR-06` | Gate mismatch (not Gate 4 for Channel 10↔90 loop) | FAIL |
| `BR-07` | Unresolved blocker from previous iteration without mapped fix evidence | FAIL |
| `BR-08` | Authority boundary violated in request/response content | FAIL |

### Re-submission protocol

1. Team 10 submits new `WORK_PACKAGE_VALIDATION_REQUEST_TEMPLATE` with `submission_iteration = previous + 1`.
2. `resubmission_of` must reference prior `request_id`.
3. Each prior blocker must have explicit fix mapping:
   - `blocker_id`
   - `fix_artifact_path`
   - `fix_assertion_id`
4. If any blocker is unmapped, auto-return `FAIL` under `BR-07`.

### Loop termination condition

- **TERMINATE_PASS:** `VALIDATION_RESPONSE_TEMPLATE.overall_status = PASS`.
- **TERMINATE_FAIL_ESCALATE:** `submission_iteration > max_resubmissions`.
- **TERMINATE_FAIL_STUCK:** same blocker fingerprint repeats for 2 consecutive iterations.
- On terminate-fail: escalate to Team 100 + Team 190 with latest `BLOCKING_REPORT_TEMPLATE`.

---

## 7) Implementation Notes

- `Gate-B` may appear as legacy label, but machine field must use `GATE_4_DEV_VALIDATION`.
- Template IDs and `blocker_id` must be stable across iterations.
- No free-text-only verdicts. PASS/FAIL must be machine-readable in field form.

---

**log_entry | TEAM_190 | CHANNEL_10_90_TEMPLATE_PROPOSAL_v1.0.0 | PROPOSED | 2026-02-20**
