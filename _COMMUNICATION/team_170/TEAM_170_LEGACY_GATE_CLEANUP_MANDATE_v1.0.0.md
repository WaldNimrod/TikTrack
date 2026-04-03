date: 2026-03-24
historical_record: true

# MANDATE — Team 170: Legacy Gate Cleanup (docs-governance)
**From:** Team 00 (System Designer)
**To:** Team 170 (Spec & Governance)
**Date:** 2026-03-24
**Priority:** HIGH — Documentation drift correction
**Mandate ID:** TEAM_00_TO_TEAM_170_LEGACY_GATE_CLEANUP_v1.0.0

---

## Context

The active pipeline has **GATE_0 through GATE_5 only** (6 gates).

- **GATE_6** = organizational administrative action, NOT a pipeline gate
- **GATE_7** = historical drift from an old process model — does NOT exist
- **GATE_8** = historical drift from an old process model — does NOT exist

All runtime layers (dashboard, agent context files, orchestrator, gate_router) have been corrected this session (2026-03-24). The remaining drift lives in `documentation/docs-governance/`.

---

## Deliverable

For each file in the two tiers below: add a canonical LEGACY banner and/or update inline references. You do NOT rewrite content — you annotate.

---

## Tier 1 — Live governance docs (agents read these) — MUST fix

These files are actively loaded or referenced. GATE_6/7/8 references must be clearly marked LEGACY.

| File | Action |
|---|---|
| `01-FOUNDATIONS/GATE_LIFECYCLE_DESCRIPTION_AND_OWNERS_v1.1.0.md` | Add LEGACY banner at top of any GATE_6/7/8 section |
| `01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` | Add LEGACY note wherever GATE_6/7/8 appear as active gates |
| `04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` | Add LEGACY note on GATE_6/7/8 references |
| `04-PROCEDURES/GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md` | Add file-level LEGACY banner: "⚠️ LEGACY — pipeline is GATE_0–GATE_5 only. GATE_6/7 sections are superseded." |
| `04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md` | Add LEGACY note on any GATE_6/7/8 steps |
| `00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md` | Mark GATE_6/7/8 contract entries as LEGACY in index |
| `00-INDEX/GOVERNANCE_PROCEDURES_SOURCE_MAP.md` | Same |

---

## Tier 2 — Legacy artifact files (archive-in-place) — mark with banner only

These files are historical artifacts. Do NOT delete or move them. Add a single LEGACY banner at the top of each.

Banner template:
```
> ⚠️ **LEGACY DOCUMENT — DO NOT USE IN NEW WORK**
> This document references GATE_6, GATE_7, or GATE_8, which are NOT active pipeline gates.
> Active pipeline: GATE_0 through GATE_5 only (2026-03-24).
> Preserved for historical reference only.
```

| File |
|---|
| `05-CONTRACTS/GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.0.0.md` |
| `05-CONTRACTS/GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md` |
| `05-CONTRACTS/G7_HUMAN_RESIDUALS_MATRIX_CONTRACT_v1.0.0.md` |
| `05-CONTRACTS/G6_TRACEABILITY_MATRIX_CONTRACT_v1.0.0.md` |
| `01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.0.0.md` | (superseded by v2.3.0)
| `01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.2.0.md` | (superseded by v2.3.0)
| `01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL.md` | (superseded)
| `01-FOUNDATIONS/GATE_LIFECYCLE_DESCRIPTION_AND_OWNERS_v1.0.0.md` | (superseded by v1.1.0)
| `01-FOUNDATIONS/GATE_LIFECYCLE_PRESENTATION_PANTHEON_v1.0.0.md` |
| `01-FOUNDATIONS/GATE_LIFECYCLE_PRESENTATION_PANTHEON_v1.1.0.md` |
| `01-FOUNDATIONS/GATE_LIFECYCLE_FLOWCHART_v1.0.0.mmd` |
| `01-FOUNDATIONS/GATE_LIFECYCLE_FLOWCHART_v1.1.0.mmd` |
| `01-FOUNDATIONS/GATE_LIFECYCLE_FLOWCHART_PRESENTATION_v1.0.0.mmd` |
| `01-FOUNDATIONS/GATE_LIFECYCLE_FLOWCHART_PRESENTATION_v1.1.0.mmd` |

---

## What to skip (Team 00 handles separately)

- `01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` — Team 00 domain, do not modify
- `01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` — Team 00 domain, do not modify
- `01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` — historical record entries, context-appropriate
- `01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md` — bug entries are historical records, leave as-is

---

## Completion Criteria

- All Tier 1 files have inline LEGACY notes on GATE_6/7/8 references
- All Tier 2 files have the LEGACY banner at the top
- No content deleted — annotation only
- Submit: `TEAM_170_LEGACY_GATE_CLEANUP_DELIVERY_v1.0.0.md` to `_COMMUNICATION/team_170/`

**log_entry | TEAM_00 | MANDATE_ISSUED | TEAM_170_LEGACY_GATE_CLEANUP | 2026-03-24**
