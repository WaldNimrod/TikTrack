# Team 00 → Team 170 | Immediate Activation Supplement — Phase 0 Gate Quality Baseline v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** TEAM_00_TO_TEAM_170_GOVERNANCE_IMMEDIATE_ACTIVATION_SUPPLEMENT_PHASE0_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 170 (Librarian / SSOT Authority)
**cc:** Team 100, Team 50, Team 90, Team 10
**date:** 2026-03-10
**status:** MANDATE — ACTION REQUIRED (IMMEDIATE)
**supplements:** TEAM_00_TO_TEAM_170_GOVERNANCE_IMMEDIATE_ACTIVATION_v1.0.0 (Tasks 1-3 are unchanged)
**authority:** ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0
             + ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0

---

## §0 — Context

The original IMMEDIATE activation (`TEAM_00_TO_TEAM_170_GOVERNANCE_IMMEDIATE_ACTIVATION_v1.0.0`) defined Tasks 1-3 (GATE_7 Contract v1.1.0, Gate Model Protocol §2.3 amendment, Stage Active Portfolio).

**This supplement adds Tasks 4-7** (Phase 0 Gate Quality deliverables) and **amends Task 1** to include §2.7 (residuals-only principle) in the GATE_7 Contract v1.1.0.

**Execute Tasks 1-7 together as one cohesive activation. Tasks 1-3 and Tasks 4-7 are parallel; all must complete before WP003 GATE_5.**

---

## §1 — Amendment to Task 1 (GATE_7 Contract v1.1.0)

In addition to §2.5 (Infrastructure WP provision) and §2.6 (GATE_6 override prohibition), add **§2.7** to the GATE_7 Contract v1.1.0:

```markdown
### §2.7 — Residuals-Only Principle (Integration: ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0)

GATE_7 verifies **only items that cannot be verified programmatically** — the `HUMAN_ONLY` tagged criteria from the GATE_2 approved spec.

**GATE_7 must NOT:**
- Re-run any acceptance criterion already closed deterministically at GATE_5
- Require running terminal commands, executing test scripts, or reviewing logs as the primary approval action
- Include items already in the `G5_AUTOMATION_EVIDENCE.json` verdict scope

**GATE_7 scope = `G7_HUMAN_RESIDUALS_MATRIX.md` only.**
Team 90 prepares this matrix from the `HUMAN_ONLY` tagged items in the GATE_2 approval.
Nimrod signs off only on items in this matrix.

**Lean GATE_7 principle:** If the GATE_2 spec was classified rigorously (minimal HUMAN_ONLY items), GATE_7 should be brief. Quality investment at GATE_1/2 classification = lean GATE_7.
```

Also add this to the v1.1.0 log entries:
```
**log_entry | TEAM_00 | GATE_7_CONTRACT_V1_1_0 | RESIDUALS_ONLY_PRINCIPLE_ADDED_SEC_2_7 | ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0 | 2026-03-11**
```

---

## §2 — Task 4: GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md

### Create
`documentation/docs-governance/04-PROCEDURES/GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md`

### Document structure and required content

```markdown
# Gates 4/5/6/7 Governance Policy v1.0.0

project_domain: SHARED
status: LOCKED
owner: Team 170 (canonical); authority: Team 00
date: 2026-03-11
authority: ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0

---

## 1) Purpose
Single policy document for GATE_4/5/6/7 execution in manual mode.
Phase 2 (agent overlay) uses the same contracts — no gate semantic change.

## 2) GATE_4 — Subset QA (Smoke + Readiness)

| Field | Value |
|---|---|
| Gate owner | Team 10 (QA execution: Team 50) |
| Suite type | Subset — smoke + readiness |
| Entry | GATE_3 implementation complete |
| Evidence artifact | QA smoke report (Team 50 format) |
| Pass criterion | 0 SEVERE blockers on smoke suite |
| Nimrod run required | NO |
| MCP scenarios | Core entity CRUD (agents_os_v2/mcp/test_scenarios.py where applicable) |

## 3) GATE_5 — Canonical Superset Validation

| Field | Value |
|---|---|
| Gate owner | Team 90 |
| Suite type | Superset — all AUTO_TESTABLE criteria from GATE_2 approval |
| Entry | GATE_4 PASS |
| Evidence artifact | G5_AUTOMATION_EVIDENCE.json (canonical schema per GATE_QUALITY_HARDENING §6) |
| Pass criterion | 0 SEVERE blockers; Team 90 deterministic verdict |
| Nimrod run required | NO (Nimrod may be requested for point clarifications only) |
| UI assertions | Mandatory — screen-level automated checks, not API-only |
| Anti-flakiness | Fixed seed, session isolation, explicit timeouts, no retry on first run |

## 4) GATE_6 — Traceability Verdict (Reality Gate)

| Field | Value |
|---|---|
| Gate owner | Team 90 (execution); Team 100 (approval authority) |
| Scope | Traceability-only: implementation vs GATE_2 approved intent |
| Entry | GATE_5 PASS |
| Evidence artifact | G6_TRACEABILITY_MATRIX.md (canonical template per GATE_QUALITY_HARDENING §6) |
| Pass criterion | MATCH_ALL — every GATE_2 spec item has implementation evidence |
| Deviation handling | DOC_ONLY_LOOP / CODE_CHANGE_REQUIRED / ESCALATE_TO_TEAM_00 per rejection protocol |

## 5) GATE_7 — Human Residuals Sign-Off

| Field | Value |
|---|---|
| Gate owner | Team 90 (prepares); Nimrod/Team 00 (signs) |
| Scope | HUMAN_ONLY tagged items only — G7_HUMAN_RESIDUALS_MATRIX.md |
| Entry | GATE_6 PASS |
| Evidence artifact | G7_HUMAN_RESIDUALS_MATRIX.md (completed by Nimrod) |
| Surface | Browser/UI always (product pages for feature WPs; admin panel for infrastructure WPs) |
| Pass criterion | All residuals PASS + explicit Nimrod sign-off (אישור) |
| GATE_7 must NOT | Re-run GATE_5 deterministic checks |

## 6) Anti-Flakiness Policy (enforced at GATE_4 and GATE_5)

| Rule | Requirement |
|------|-------------|
| Seed | Fixed random seed declared in test configuration |
| Session | Isolated per gate run; no shared state |
| Timeout | All async operations: explicit ms timeout |
| Retry | No retry on initial run; retry flag allowed on re-run only |
| Data baseline | Deterministic seed data; no live external state for pass/fail |
| Flaky test | SEVERE blocker until root cause resolved; not masked with retry |

## 7) AUTO_TESTABLE / HUMAN_ONLY Classification

Every acceptance criterion in LOD400 spec must carry one of:
- AUTO_TESTABLE: verified programmatically at GATE_5
- HUMAN_ONLY: verified by Nimrod at GATE_7 only

Classification is GATE_1 responsibility; confirmed at GATE_2 approval.
GATE_5 scope = all AUTO_TESTABLE items.
GATE_7 scope = all HUMAN_ONLY items (G7_HUMAN_RESIDUALS_MATRIX.md).

---

log_entry | TEAM_170 | GATES_4_5_6_7_GOVERNANCE_POLICY | v1.0.0_CREATED | ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0 | 2026-03-11
```

---

## §3 — Task 5: Three Artifact Contract Templates

Create three documents in `documentation/docs-governance/05-CONTRACTS/`:

### 5a — G5_AUTOMATION_EVIDENCE_CONTRACT_v1.0.0.md

**Required content:**
- JSON schema (copy from ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING §6)
- Issuer: Team 90
- Gate: GATE_5 only
- Mandatory fields list with type constraints
- "Artifact invalid if missing any required field" enforcement rule
- Example minimal valid artifact
- Log entry

### 5b — G6_TRACEABILITY_MATRIX_CONTRACT_v1.0.0.md

**Required content:**
- Markdown template (copy from ARCHITECT_DECISION §6)
- Issuer: Team 90 (prepares), Team 100 (approves)
- Gate: GATE_6 only
- Mapping rule: every GATE_2 acceptance criterion must appear as a row
- MATCH / DEVIATION verdict rules
- Log entry

### 5c — G7_HUMAN_RESIDUALS_MATRIX_CONTRACT_v1.0.0.md

**Required content:**
- Markdown template (copy from ARCHITECT_DECISION §6)
- Issuer: Team 90 (prepares matrix); Nimrod (fills actual results)
- Gate: GATE_7 only
- Scope restriction: HUMAN_ONLY tagged items only; explicitly prohibit AUTO_TESTABLE items
- PASS condition: all rows PASS + Nimrod אישור
- Log entry

---

## §4 — Task 6: GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT v1.1.0

### Create
`documentation/docs-governance/05-CONTRACTS/GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md`

**Supersedes:** v1.0.0

**Changes from v1.0.0:**

**1. Add to §2 gate contract matrix, GATE_1 row — in "Mandatory outputs" column:**
```
+ AUTO_TESTABLE / HUMAN_ONLY classification for every acceptance criterion in LOD400 spec
```

**2. Add to §2 gate contract matrix, GATE_2 row — in "Mandatory outputs" column:**
```
+ G7_HUMAN_RESIDUALS_MATRIX.md (shell document with HUMAN_ONLY items; Nimrod fills at GATE_7)
+ Confirmation that AUTO_TESTABLE/HUMAN_ONLY classification is complete and reviewed
```

**3. Add §6 — Acceptance Criteria Classification Rule:**

```markdown
## 6) Acceptance Criteria Classification (AUTO_TESTABLE / HUMAN_ONLY)

Every acceptance criterion in a LOD400 spec MUST be tagged with one of:

| Tag | Meaning | Verified at |
|-----|---------|------------|
| AUTO_TESTABLE | Verifiable programmatically with deterministic result | GATE_5 canonical superset |
| HUMAN_ONLY | Requires human judgement, UX assessment, or browser interaction | GATE_7 residuals matrix |

**Classification rules:**
1. Default to AUTO_TESTABLE — classify HUMAN_ONLY only when automation is genuinely not feasible.
2. "Hard to automate" is NOT sufficient justification for HUMAN_ONLY — must be "impossible to automate reliably."
3. Visual design, accessibility, UX flow correctness = HUMAN_ONLY.
4. Data accuracy, functional correctness, API contract compliance = AUTO_TESTABLE.

**Gate dependency:**
- GATE_5 verdict scope = all AUTO_TESTABLE items.
- GATE_7 matrix = all HUMAN_ONLY items. If no HUMAN_ONLY items → GATE_7 is trivially brief (visual confirmation only).
- Reference: GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md §7.
```

**4. Add log entries:**
```
**log_entry | TEAM_170 | GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT | V1_1_0_CREATED | AUTO_TESTABLE_HUMAN_ONLY_CLASSIFICATION_ADDED | ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0 | 2026-03-11**
```

Also append to v1.0.0:
```
**log_entry | TEAM_170 | GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT | SUPERSEDED_BY_v1.1.0 | 2026-03-11**
```

---

## §5 — Task 7: Update agents_os_v2/context/governance/gate_rules.md

Verify whether `agents_os_v2/context/governance/gate_rules.md` (referenced in AGENTS_OS_V2_OPERATING_PROCEDURES §2.4) contains any GATE_7 or gate quality definitions that conflict with the new policy.

**Required action:**
1. Read the file
2. If it contains any GATE_7 definition → append: "GATE_7 definition superseded by GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md and GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md per ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0."
3. If it contains any reference to `v2.2.0` Gate Model Protocol → update to `v2.3.0`
4. Report findings in completion report (whether changes were needed or file was already aligned)

---

## §6 — Full Completion Report

When ALL Tasks (1-7 from original + this supplement) are done, update the completion report at:
`_COMMUNICATION/team_170/TEAM_170_GOVERNANCE_IMMEDIATE_ACTIVATION_COMPLETION_v1.0.0.md`

Add to the completion checklist:
- [ ] Task 1 amended: GATE_7 Contract v1.1.0 includes §2.5, §2.6, AND §2.7 (residuals-only)
- [ ] Task 4: `GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md` created
- [ ] Task 5a: `G5_AUTOMATION_EVIDENCE_CONTRACT_v1.0.0.md` created
- [ ] Task 5b: `G6_TRACEABILITY_MATRIX_CONTRACT_v1.0.0.md` created
- [ ] Task 5c: `G7_HUMAN_RESIDUALS_MATRIX_CONTRACT_v1.0.0.md` created
- [ ] Task 6: `GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md` created; v1.0.0 has superseded entry
- [ ] Task 7: `agents_os_v2/context/governance/gate_rules.md` checked; conflicts resolved or confirmed clean
- [ ] All log entries added across all files

---

**log_entry | TEAM_00 | GOVERNANCE_PHASE0_ACTIVATION_SUPPLEMENT | MANDATE_ISSUED_TO_TEAM_170 | 2026-03-11**
