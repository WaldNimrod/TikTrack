# ARCHITECT DIRECTIVE — Dual Domain Governance v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0
**from:** Team 00 (Chief Architect)
**date:** 2026-03-11
**status:** LOCKED
**effective:** U-01, U-03 — IMMEDIATE | U-02 — S003 CLEAN START
**authority:** Team 00 constitutional authority
**trigger:** TEAM_100_TO_TEAM_00_DUAL_DOMAIN_GOVERNANCE_RECOMMENDATION_v1.0.0
**response_doc:** TEAM_00_TO_TEAM_100_DUAL_DOMAIN_GOVERNANCE_RESPONSE_v1.0.0

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | CROSS-STAGE |
| program_id | SHARED |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 00 |

---

## §1 — Root Cause (Confirmed)

WP003 (Market Data Hardening — TIKTRACK domain) was registered under S002-P002 (AGENTS_OS program), violating SSM §0 "One domain per Program." This single misclassification caused:

- GATE_7 semantic confusion (Team 90 challenged whether infrastructure WPs need browser UX sign-off)
- WSM domain drift (TIKTRACK state shown under AGENTS_OS program)
- `phase_owner_team` field ambiguity (gate authority vs. execution authority mixed in one field)

This directive locks three governance updates to prevent recurrence.

---

## §2 — Iron Rule: One Domain Per Program

**Existing rule in SSM §0 — hereby enforced at GATE_0:**

> **Every Program is assigned to exactly one project domain. A Work Package's `project_domain` must match its parent Program's `project_domain`. Mismatch = BLOCK_FOR_FIX at GATE_0 — no exceptions.**

**U-01 Implementation:**

Team 190 GATE_0 checklist (canonical location: `agents_os_v2/context/identity/team_190.md`) must include:

```
DOMAIN MATCH CHECK (mandatory, blocking):
□ WP.project_domain == parent_Program.project_domain
  → PASS: proceed
  → FAIL: BLOCK_FOR_FIX
     Reason: "WP domain [{WP.project_domain}] does not match program domain
              [{Program.project_domain}]. Reassign WP to a program in matching
              domain, or reclassify WP domain."
```

Gate Model Protocol §3 GATE_0 section must include this check.

**Executors:** Team 61 (agents_os code) + Team 170 (Gate Model Protocol docs)
**Timing:** Immediate — as part of WP001 BF-03 fix cycle

---

## §3 — Iron Rule: GATE_7 = HUMAN_UX_APPROVAL

**Canonical GATE_7 definition — locked as Iron Rule:**

> **GATE_7 = HUMAN_UX_APPROVAL — Iron Rule.**
> Executor: Nimrod (Team 00) exclusively.
> Surface: **browser/UI always.**
> - Feature WPs: product pages — interactive, functional, live-data verification.
> - Infrastructure WPs: dedicated admin verification page, monitoring dashboard, or operational status panel presenting live evidence of the implemented capability through a UI surface.
> Pure log-file-only or terminal-only review is **not valid GATE_7 evidence.**
> No exceptions without a formal Team 00 architectural amendment documented in `_COMMUNICATION/_Architects_Decisions/`.

**U-03 Implementation:**

Team 170 to update `04_GATE_MODEL_PROTOCOL_v2.3.0.md` §3 with the canonical wording above.

**Prior ad-hoc definitions superseded:** Any GATE_6 conditional or prior cycle document that defined GATE_7 as "runtime confirmation only" or "log-file review" is superseded by this directive. All active GATE_7 re-entries must comply.

**Timing:** Effective immediately from 2026-03-11.

---

## §4 — WSM Structure Changes (U-02)

### §4.1 — STAGE_PARALLEL_TRACKS Block (effective S003)

WSM must include `STAGE_PARALLEL_TRACKS` block at S003 initialization:

```yaml
STAGE_PARALLEL_TRACKS:
  - domain: TIKTRACK
    active_program_id: <S003 TIKTRACK program>
    current_gate: <GATE_X>
    gate_owner_team: Team 90
  - domain: AGENTS_OS
    active_program_id: <S003 AGENTS_OS program>
    current_gate: <GATE_X>
    gate_owner_team: Team 100
```

Updated by respective gate owners (Team 90 for TIKTRACK track; Team 100 for Agents_OS track) at each gate transition.

### §4.2 — phase_owner_team Field Split (effective S003)

`phase_owner_team` in WSM single-track CURRENT_OPERATIONAL_STATE is split into:
- `gate_owner_team`: team holding gate decision authority at current gate (Team 90 or Team 100)
- `execution_orchestrator_team`: team managing implementation execution (typically Team 10)

**Executor:** Team 170, at S003 WSM initialization.
**Rationale:** S002 mid-cycle change creates cross-team confusion; S003 clean start absorbs this with no disruption.

---

## §5 — Stage Active Portfolio Document (Supplementary Layer)

**Adopted alongside Option B as supplementary visibility layer.**

Team 170 to create: `_COMMUNICATION/team_170/STAGE_ACTIVE_PORTFOLIO_S002.md` (or canonical governance docs location per Team 170 discretion).

**Format:**
```markdown
# S002 Active Portfolio

| Domain | Program | WP | Gate | Gate Owner |
|--------|---------|-----|------|------------|
| TIKTRACK | S002-P002 | WP003 | GATE_7 | Team 90 |
| AGENTS_OS | S002-P002 | WP001 | GATE_0 (BLOCKED) | Team 100 |
```

**Maintenance:** Team 90 updates TIKTRACK rows; Team 100 updates Agents_OS rows at each gate transition. Team 170 creates initial document.

**Note:** This is NOT a WSM replacement. It is a human-readable summary of parallel tracks within the stage.

---

## §6 — WP003 Historical Anomaly Record

**S002-P002-WP003 is hereby formally recorded as a historical domain anomaly.**

| Field | Value |
|---|---|
| WP domain | TIKTRACK |
| Registered under | S002-P002 (AGENTS_OS program) |
| Violation | SSM §0 "One domain per Program" |
| Status | Tolerated post-GATE_6 — renumbering creates more confusion than correction |
| Correction action | Anomaly noted in WP003 GATE_8 closure document |
| Prevention | U-01 enforced at GATE_0 for all future WPs |

No renumbering. No retroactive program reclassification. The anomaly is documented and contained.

---

## §7 — WP003 GATE_7 Compliance Note

Under §3 (U-03), all active GATE_7 re-entries must include browser/UI evidence.

WP003 GATE_7 (CC-WP003-01..04) is satisfied through the **D22 Tickers admin page** post-remediation (BF-001..004 fixes). The remediated D22 page constitutes a qualifying UI surface for an infrastructure WP:

| CC Condition | D22 UI evidence |
|---|---|
| CC-WP003-01: batch fetch running | Fresh `price_as_of_utc` per row visible |
| CC-WP003-02: price freshness window | Staleness clock showing actual ticker freshness |
| CC-WP003-03/04: provider chain + validation | Live correct prices, traffic light source indicators |

WP003 GATE_7 = standard D22 browser walk-through. Team 10 determines supplementary evidence path if any CC condition cannot be observed through D22 UI alone.

---

## §8 — Activation Summary

| Rule | Iron Rule? | Effective | Executor |
|------|-----------|-----------|---------|
| U-01: GATE_0 domain-match check | Iron Rule | IMMEDIATE (BF-03 cycle) | Team 61 + Team 170 |
| U-02: WSM field split + STAGE_PARALLEL_TRACKS | Structural change | S003 START | Team 170 |
| U-03: GATE_7 = HUMAN_UX_APPROVAL (browser always) | **Iron Rule** | IMMEDIATE | Team 170 (docs) |
| Stage Active Portfolio | Process layer | IMMEDIATE | Team 170 (create) |
| WP003 anomaly record | Historical note | IMMEDIATE | In GATE_8 closure |

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE | v1.0.0 | LOCKED | 2026-03-11**
