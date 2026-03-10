# Team 00 → Team 170 | Governance Immediate Activation — U-03 + Stage Active Portfolio v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** TEAM_00_TO_TEAM_170_GOVERNANCE_IMMEDIATE_ACTIVATION_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 170 (Librarian / SSOT Authority)
**cc:** Team 100, Team 190, Team 90, Team 10
**date:** 2026-03-10
**status:** MANDATE — ACTION REQUIRED (IMMEDIATE)
**authority:** ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | CROSS-STAGE |
| program_id | GOVERNANCE |
| work_package_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 170 |

---

## §0 — Pre-Read (mandatory before any action)

Read these documents IN ORDER before making any changes:

1. `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0.md` — **root authority**
2. `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_100_DUAL_DOMAIN_GOVERNANCE_RESPONSE_v1.0.0.md` — decisions record
3. `documentation/docs-governance/05-CONTRACTS/GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.0.0.md` — Task 1 target
4. `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` — Task 2 target
5. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` — context for Task 3

---

## §1 — Scope of This Mandate (IMMEDIATE — before S003)

Three deliverables in this mandate, all IMMEDIATE:

| Task | Document | Action |
|------|----------|--------|
| Task 1 | `GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.0.0.md` | Create v1.1.0 with infrastructure WP provision |
| Task 2 | `04_GATE_MODEL_PROTOCOL_v2.3.0.md` | Add domain-match enforcement to §2.3 |
| Task 3 | `STAGE_ACTIVE_PORTFOLIO_S002.md` | Create new supplementary document |

**DO NOT modify WSM structure (STAGE_PARALLEL_TRACKS / field split) — that is a separate S003 mandate.**

---

## §2 — Task 1: GATE_7 Contract v1.1.0

### Why
The existing `GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.0.0.md` defines GATE_7 as "human browser/UI review gate" with locked execution semantics (§2). However, it only covers **feature WPs** (product UI surfaces). Infrastructure WPs are not explicitly addressed, creating the gap that allowed semantic drift ("runtime confirmation only" interpretation).

### Seriousness of the gap
This gap was exploited inadvertently in GATE_6 for S002-P002-WP003, which defined GATE_7 as "runtime confirmation only." WSM log entry 247 records "no Nimrod browser UX sign-off required" for S002-P002. Both are now historical anomalies superseded by U-03 Iron Rule. The gap must be closed in the canonical contract.

### What to create
Create `documentation/docs-governance/05-CONTRACTS/GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md`

**Supersedes:** v1.0.0

**Changes from v1.0.0:**
- Add §2.5 (Infrastructure WP provision)
- Add §2.6 (GATE_6 override prohibition)
- Add log entry

**DO NOT change** §1, §2 items 1-4, §3, §4, §5, §6. These remain valid as written.

### Exact text to add (append after §2 item 4, before §3)

```markdown
### §2.5 — Infrastructure WP provision (U-03 Iron Rule)

For Work Packages where **no product-facing UI surface exists** at the time of GATE_7 (infrastructure, background services, data pipelines, provider integrations):

GATE_7 must still be executed through a browser/UI surface. Acceptable surfaces:
- Dedicated admin verification page within the product admin UI
- Operational monitoring dashboard or health panel accessible through the browser
- System status panel embedded in an existing admin page (e.g., market data health section in D40)

**Required evidence via the UI surface:**
- Live demonstration that the infrastructure capability is operational
- Observable metrics, statuses, or results that confirm the WP's functional objectives

**Not acceptable as primary GATE_7 approval path (even for infrastructure WPs):**
- Log file attachments
- Terminal session recordings
- Shell script outputs
- `/tmp` or local file existence checks
- API curl outputs submitted without UI correlation

### §2.6 — GATE_6 override prohibition (U-03 Iron Rule)

A GATE_6 CONDITIONAL_APPROVED decision may define conditions (CC-WPxxx) for GATE_7 entry. However:

**GATE_6 conditional approvals may NOT redefine GATE_7 semantics.** Specifically:
- GATE_6 conditions may NOT specify "runtime confirmation only" as the GATE_7 fulfillment path
- GATE_6 conditions may NOT waive the requirement for browser/UI review
- GATE_6 conditions may NOT state "no Nimrod browser UX sign-off required"

Any such language in a GATE_6 decision is **void on its face** and superseded by this contract.

**Exception:** Team 00 may formally amend GATE_7 semantics for a specific WP via a documented architectural decision in `_COMMUNICATION/_Architects_Decisions/`. No other mechanism is valid.
```

### Log entry to add at end of v1.1.0
```
**log_entry | TEAM_00 | GATE_7_CONTRACT_V1_1_0 | INFRASTRUCTURE_WP_PROVISION_AND_GATE6_OVERRIDE_PROHIBITION_ADDED | ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0 | 2026-03-11**
**log_entry | TEAM_170 | GATE_7_CONTRACT_V1_1_0 | CREATED_UNDER_MANDATE | TEAM_00_TO_TEAM_170_GOVERNANCE_IMMEDIATE_ACTIVATION_v1.0.0 | 2026-03-11**
```

### Update v1.0.0 (append log entry only — do not modify content)
Append to end of v1.0.0:
```
**log_entry | TEAM_170 | GATE_7_HUMAN_UX_APPROVAL_CONTRACT | SUPERSEDED_BY_v1.1.0 | 2026-03-11 | See ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0**
```

---

## §3 — Task 2: Gate Model Protocol §2.3 Domain-Match Enforcement

### Why
`04_GATE_MODEL_PROTOCOL_v2.3.0.md` §2.2 already contains the rule: **"One domain per Program: Each Program is assigned to exactly one domain."** However, §2.3 (Validation rules) does not enumerate the domain-match check as an enforcement point at GATE_0. This means Team 190's validation checklist had no textual basis in the protocol for blocking on domain mismatch. U-01 adds the enforcement to the checklist; §2.3 must simultaneously document the protocol basis.

### What to modify
`documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`

**Modify in-place** (this is an amendment to v2.3.0 — do not create a new version file; add to existing document and update log).

### Exact change: §2.3 Validation rules — append after "Lexicographic" item

Current §2.3 ends with:
```
- Lexicographic: NNN is numeric; leading zeros required (e.g. 001, 002).
```

Add after that line:
```
- Domain-match enforcement: `WP.project_domain` must equal the `project_domain` of the parent Program. Mismatch = BLOCK_FOR_FIX at GATE_0 (enforced by Team 190 per §3 authority). This enforcement operationalizes §2.2 "One domain per Program." Reference: ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0.
```

### Log entry to add at end of v2.3.0 file
```
**log_entry | TEAM_170 | GATE_MODEL_PROTOCOL_v2.3.0 | DOMAIN_MATCH_ENFORCEMENT_ADDED_TO_SEC_2_3 | ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0 | 2026-03-11**
```

### Verification after change
Confirm that §2.2 and §2.3 are now consistent:
- §2.2: "One domain per Program" (rule statement) ✓
- §2.3: Domain-match enforcement at GATE_0 (enforcement mechanism) ✓
- `agents_os_v2/context/identity/team_190.md` item 7 (operational checklist) ✓ (Team 61 implements)

---

## §4 — Task 3: Create STAGE_ACTIVE_PORTFOLIO_S002.md

### Why
Approved in TEAM_00_TO_TEAM_100_DUAL_DOMAIN_GOVERNANCE_RESPONSE_v1.0.0.md §4.2. Supplementary visibility document showing all active domain tracks within S002. Not a WSM replacement — a human-readable portfolio summary updated at each gate transition.

### Where to create
`_COMMUNICATION/team_170/STAGE_ACTIVE_PORTFOLIO_S002.md`

### Document structure

```markdown
# S002 Active Portfolio — Supplementary Visibility Layer

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** STAGE_ACTIVE_PORTFOLIO_S002
**version:** 1.0.0
**owner:** Team 170 (creates/maintains); Team 90 (TikTrack updates); Team 100 (Agents_OS updates)
**purpose:** Supplementary per-stage visibility of all active domain tracks. NOT a WSM replacement.
**wsm_source_of_truth:** documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md
**authority:** ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0
**date:** 2026-03-11
---

## UPDATE PROTOCOL

- This document is updated by the respective domain owner at each gate transition:
  - TIKTRACK track updates: Team 90 (gate owner for GATE_5–GATE_8)
  - AGENTS_OS track updates: Team 100 (architecture authority for AGENTS_OS)
  - Team 170 maintains format consistency; creates new version for each Stage

## S002 ACTIVE TRACKS

| Domain | Program | WP | Current Gate | Gate Owner | Execution Owner | Status |
|--------|---------|-----|-------------|------------|-----------------|--------|
| TIKTRACK | S002-P002 | WP003 | GATE_3 (REMEDIATION_IN_PROGRESS) | Team 10 | Teams 20/30/50/60 | ACTIVE — Team 50 QA in progress |
| AGENTS_OS | S002-P002 | WP001 | GATE_0 (PENDING — BF-01..05 remediation) | Team 100 | Team 61 | BLOCKED — awaiting BF fixes + U-01 |

## S002 CLOSED TRACKS (for reference)

| Domain | Program | WP | Closed Gate | Date |
|--------|---------|-----|-----------:|------|
| TIKTRACK | S002-P003 | WP002 | GATE_8 PASS | 2026-03-07 |
| AGENTS_OS | S002-P002 | — | GATE_8 PASS (program closure) | 2026-03-08 |

## ANOMALY RECORD
WP003 is a TIKTRACK domain WP registered under S002-P002 (AGENTS_OS program).
This is a known historical anomaly per ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0 §6.
No renumbering. U-01 prevents future recurrence.

---

**log_entry | TEAM_170 | STAGE_ACTIVE_PORTFOLIO_S002 | v1.0.0_CREATED | 2026-03-11**
```

---

## §5 — Sequencing

Execute in this order (Tasks 1 and 2 can be parallel; Task 3 independent):

1. Task 2 first (Gate Model Protocol §2.3) — shortest change, establish protocol basis
2. Task 1 (GATE_7 Contract v1.1.0) — creates new version file
3. Task 3 (Stage Active Portfolio) — new document, no dependencies

---

## §6 — Completion Report

When all three tasks are done, create a completion report at:
`_COMMUNICATION/team_170/TEAM_170_GOVERNANCE_IMMEDIATE_ACTIVATION_COMPLETION_v1.0.0.md`

Report must confirm:
- [ ] `04_GATE_MODEL_PROTOCOL_v2.3.0.md` §2.3 updated with domain-match enforcement
- [ ] `GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md` created with §2.5 + §2.6
- [ ] v1.0.0 has superseded log entry appended
- [ ] `STAGE_ACTIVE_PORTFOLIO_S002.md` created with current S002 state
- [ ] All log entries added

---

**log_entry | TEAM_00 | GOVERNANCE_IMMEDIATE_ACTIVATION | MANDATE_ISSUED_TO_TEAM_170 | 2026-03-11**
