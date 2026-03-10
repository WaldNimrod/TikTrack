# Team 00 → Team 170 | Governance U-02 Activation — WSM Structure at S003 v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** TEAM_00_TO_TEAM_170_GOVERNANCE_U02_S003_ACTIVATION_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 170 (Librarian / SSOT Authority)
**cc:** Team 100, Team 10
**date:** 2026-03-11
**status:** MANDATE — QUEUED FOR S003 INITIALIZATION (not immediate)
**authority:** ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 (activation trigger) |
| program_id | GOVERNANCE |
| work_package_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 170 |

---

## §0 — Timing Constraint (critical)

**This mandate is QUEUED — do not execute during S002.**

Execute ONLY at S003 WSM initialization, which occurs after:
- S002 GATE_8 PASS for the last active S002 work package
- S003 GATE_0 opening

**Reason for deferral:** Mid-cycle WSM structural changes in S002 create cross-team confusion. S003 starts with the clean structure from day one. Do not apply U-02 changes to the S002 WSM.

Store this document in your queue. At S003 initialization, execute it as part of the WSM structural setup.

---

## §1 — Pre-Read (at S003 initialization time)

1. `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0.md` — root authority
2. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` — current WSM structure to carry forward
3. `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md` — sync rules context
4. `_COMMUNICATION/team_170/STAGE_ACTIVE_PORTFOLIO_S002.md` — to use as template for S003 Active Portfolio

---

## §2 — U-02: WSM Structure Changes at S003

Two structural changes to the WSM:

### Change 1 — Add STAGE_PARALLEL_TRACKS block

**Location:** After the `CURRENT_OPERATIONAL_STATE` block.

**Purpose:** Per-domain track visibility that does not conflict with the single-source-of-truth `CURRENT_OPERATIONAL_STATE`. This is a READ-ONLY mirror/summary of the current parallel tracks, updated at each gate transition by the respective domain gate owner.

**Format (adapt to S003 actual programs):**

```yaml
## STAGE_PARALLEL_TRACKS (v2.4.0 addition — ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0)

# This block is a per-domain summary. Source of truth: CURRENT_OPERATIONAL_STATE + Portfolio Registries.
# Updaters: Team 90 (TikTrack track) and Team 100 (Agents_OS track) at each gate transition.

TIKTRACK:
  active_program_id: <S003-P00X — fill at S003 activation>
  active_work_package_id: <WPxxx or "—" if no active WP>
  current_gate: <GATE_X>
  gate_owner_team: Team 90
  execution_orchestrator_team: Team 10
  status: <ACTIVE | BLOCKED | CLOSED>

AGENTS_OS:
  active_program_id: <S003-P00X — fill at S003 activation>
  active_work_package_id: <WPxxx or "—" if no active WP>
  current_gate: <GATE_X>
  gate_owner_team: Team 100
  execution_orchestrator_team: Team 10
  status: <ACTIVE | BLOCKED | CLOSED>
```

**Update protocol for STAGE_PARALLEL_TRACKS:**
- Team 90 updates the TIKTRACK block at each gate closure (GATE_5..GATE_8)
- Team 100 updates the AGENTS_OS block at each gate closure (GATE_0..GATE_2 for their domain)
- Team 170 maintains the block structure; does not update gate status
- This block is NEVER the source of truth — only a visibility layer

### Change 2 — phase_owner_team Field Split

**Location:** `CURRENT_OPERATIONAL_STATE` block, field `phase_owner_team`

**Current format:**
```
| phase_owner_team | Team 10 (remediation owner; GATE_3 gate owner) |
```

**New format (at S003 initialization):**
```
| gate_owner_team | Team 10 (GATE_3 gate owner) |
| execution_orchestrator_team | Team 10 (orchestrates implementation; delegates to Teams 20/30/40/50/60) |
```

**Semantic distinction:**
- `gate_owner_team`: the team that holds gate decision authority at the current gate (Gate Model Protocol §3). At GATE_3/4: Team 10. At GATE_5/6/7/8: Team 90. At GATE_0/1/2: Team 190.
- `execution_orchestrator_team`: the team managing the actual implementation work. Almost always Team 10, regardless of which gate is active.

**Migration note:** The old `phase_owner_team` field is deprecated at S003 initialization. All historical S002 log entries retain the old field name — no backfill required. S003 starts clean.

---

## §3 — WSM Protocol Document Update (PORTFOLIO_WSM_SYNC_RULES)

At S003 initialization, also update `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md` to acknowledge the new structure:

**Append to the end of the document (before log entries):**

```markdown
## 7) STAGE_PARALLEL_TRACKS block (v2.4.0 addition)

The WSM may contain a `STAGE_PARALLEL_TRACKS` block as a per-domain summary layer.

- This block is a **READ-ONLY mirror** of `CURRENT_OPERATIONAL_STATE`.
- Source of truth remains `CURRENT_OPERATIONAL_STATE`.
- Portfolio Sync Rules (§1–§6) apply only to `CURRENT_OPERATIONAL_STATE`.
- `STAGE_PARALLEL_TRACKS` does not participate in registry sync — it is an in-WSM summary.
- Updaters: Team 90 (TikTrack track), Team 100 (Agents_OS track) per gate closure.
```

**Log entry to append:**
```
**log_entry | TEAM_170 | PORTFOLIO_WSM_SYNC_RULES | STAGE_PARALLEL_TRACKS_BLOCK_CLARIFICATION_ADDED | ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0 | 2026-03-11**
```

---

## §4 — Create STAGE_ACTIVE_PORTFOLIO_S003.md at S003 Start

At S003 initialization, create `_COMMUNICATION/team_170/STAGE_ACTIVE_PORTFOLIO_S003.md` using `STAGE_ACTIVE_PORTFOLIO_S002.md` as the template.

Populate with actual S003 programs/WPs at initialization time. Leave rows empty with `<TO FILL>` markers if programs are not yet assigned.

---

## §5 — Completion Report

At S003 initialization, after executing this mandate, create:
`_COMMUNICATION/team_170/TEAM_170_GOVERNANCE_U02_S003_COMPLETION_v1.0.0.md`

Report must confirm:
- [ ] `PHOENIX_MASTER_WSM_v1.0.0.md` (or new version) includes `STAGE_PARALLEL_TRACKS` block
- [ ] `phase_owner_team` field split into `gate_owner_team` + `execution_orchestrator_team`
- [ ] `PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md` updated with §7
- [ ] `STAGE_ACTIVE_PORTFOLIO_S003.md` created
- [ ] All log entries added

---

**log_entry | TEAM_00 | GOVERNANCE_U02_S003_ACTIVATION | QUEUED_FOR_TEAM_170 | 2026-03-11**
