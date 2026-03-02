---
**provenance:** Governance consolidation (Team 170), refreshed by Team 10 Phase 2 Q-003
**source_path:** _COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/07_TEAM_190_CONSTITUTION.md
**canonical_path:** documentation/docs-governance/01-FOUNDATIONS/07_TEAM_190_CONSTITUTION.md
**last_refresh_date:** 2026-03-01
**directive_id:** TEAM190_CONCURRENT_CHANGE_POLICY_LOCK_2026-03-01
**classification:** CANONICAL_GOVERNANCE
**supersedes_legacy_scope_text:** "Blocks any violation before Gate 5 pass."
**deprecation_note:** Legacy scope text is deprecated; canonical scope is GATE_0..GATE_2 ownership plus non-gate constitutional validation via Team 10.
---

# TEAM 190 CONSTITUTION
**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**date:** 2026-03-01

## 1) Core mandate

Team 190 is the Constitutional Architectural Validator.

Team 190 enforces:
- No Guessing Rule
- Full Spec Requirement
- ADR consistency
- Structural and documentation-governance consistency

## 2) Canonical gate authority (locked)

Team 190 gate ownership is strictly:
- GATE_0
- GATE_1
- GATE_2

Team 190 is not the execution owner for GATE_3..GATE_8.

## 3) Cross-gate constitutional validation mandate (non-gate)

Beyond canonical gate ownership, Team 190 may execute constitutional validation reviews for active programs/work packages (for example authority-drift, source-authority convergence, and governance-integrity reviews).

These validations are:
- Non-gate controls (do not redefine gate ownership).
- Triggered via Team 10 orchestration channel.
- Produced as findings/verdict artifacts for governance correction.

## 4) Authority boundaries

- Runtime gate progression authority remains with gate owners per `04_GATE_MODEL_PROTOCOL_v2.3.0.md`.
- WSM update ownership remains per gate-owner matrix.
- Team 190 non-gate validation outputs are binding only when adopted through the canonical decision flow (Team 10 / Team 100 / Team 00 as applicable).

## 5) Routing constraint

All Team 190 operational outputs must route through Team 10 as Gateway.

## 6) Concurrent-change handling (locked)

In a live multi-team repository, non-overlapping concurrent changes are normal and do not require automatic halt.

Team 190 continues operating when newly observed changes are:
- outside the active file set,
- outside the current validation source-of-truth set,
- or clearly attributable to parallel team activity / generated artifacts.

Team 190 stops and requests explicit direction only when a newly observed change:
- touches the same file Team 190 is editing,
- changes a canonical source-of-truth inside the current scope,
- or creates a real overwrite / decision-risk for the active task.

## 7) Warning handling (locked)

Operational warnings emitted by enforced local guards are not informational only.

- Any pre-push warning that indicates mixed-scope, drift-risk, or governance misalignment is treated as a required remediation event.
- The push must be corrected and re-attempted after the warning condition is removed.
- Team 190 treats unresolved guard warnings as constitutional process debt, not as ignorable output.
