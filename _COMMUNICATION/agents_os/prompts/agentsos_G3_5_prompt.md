**ACTIVE: TEAM_90 (Dev-Validator)**  gate=G3_5 | wp=S003-P011-WP001 | stage=S003 | 2026-03-19

---

# G3.5 — Validate Work Plan  [FIRST RUN]

**WP:** `S003-P011-WP001`

Validate this work plan for implementation readiness.
Check: completeness, team assignments, deliverables, test coverage.

## MANDATORY: route_recommendation

**If FAIL — include at the top of your response:**

```
route_recommendation: doc
```  ← plan has format/governance/wording issues only
```
route_recommendation: full
``` ← plan has structural/scope/logic problems

Classification:
- `doc`: blockers are grammar, missing paths, credential text, format-only
- `full`: scope unclear, wrong team assignments, missing deliverables, logic errors

This field drives automatic pipeline routing. Missing = manual block.

Respond with: PASS or FAIL + blocking findings.

## Work Plan

---
id: TEAM_11_S003_P011_WP001_WORKPLAN_v1.0.0
from: Team 11 (AOS Gateway)
to: Team 90 (review), Team 100 (arch sign-off)
date: 2026-03-19
gate: GATE_2 / Phase 2.2
process_variant: TRACK_FOCUSED
stage: S003
program: S003-P011
work_package: S003-P011-WP001
spec_source: TEAM_170_S003_P011_WP001_LLD400_v1.0.1
authority: ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0 + ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0
---

# Work Plan — S003-P011-WP001 | Process Architecture v2.0

## §1 Overview

This work plan implements Process Architecture v2.0 for the Agents_OS domain: the 5-gate canonical model, FCP classification, TRACK_FOCUSED routing, team_engine_config.json externalization, Team 00 identity correction, Team 11/102/191 registration, state schema migration from legacy GATE_0..GATE_8.

**Domain:** AGENTS_OS (TRACK_FOCUSED default)
**Implementor:** Team 61 (all 6 layers)
**QA:** Team 51
**Spec authority:** LLD400 v1.0.1 (Team 170) — validated GATE_1 PASS

---

## §2 Phase Sequence

| Phase | ID | Responsible | Description | Dependencies | Risk |
|-------|-----|-------------|-------------|--------------|------|
| **P1** | State schema + config | Team 61 | Add `current_phase`, `process_variant`, `finding_type`, `fcp_level`, `return_target_team`, `lod200_author_team`, `gate_state` to state schema. Create `team_engine_config.json` per LLD400 §2.3 schema (per-team object with engine + domain). | None | MEDIUM |
| **P2** | Migration script | Team 61 | Copy-first migration: backup all `pipeline_state_*.json`, apply legacy→canonical gate ID mapping per LLD400 §3.1 table. Preserve S003-P003-WP001 state (map G3_PLAN → GATE_3, current_phase="3.1"). Validate no data loss. | P1 | HIGH |
| **P3** | pipeline.py GATE_SEQUENCE + GATE_META | Team 61 | Replace `GATE_SEQUENCE` with 5-gate canonical. Refactor `GATE_META` to load team assignments from `team_engine_config.json`. Add Phase 2.2 (Team 11) and Phase 2.2v (Team 90) to GATE_2; remove `WAITING_GATE2_APPROVAL`; add `gate_state="HUMAN_PENDING"`. TRACK_FOCUSED routing: Phase 2.2 → Team 11, Phase 3.1 → Team 11. | P1 | HIGH |
| **P4** | KB-26 + KB-27 remediation | Team 61 | **KB-2026-03-19-26:** Correction-cycle prompt: when `last_blocking_gate == current_gate AND remediation_cycle_count > 0` → inject `last_blocking_findings` in prompt; `fail` command writes to `last_blocking_findings` / `last_blocking_gate`; `pass` preflight blocks if active BLOCK_FOR_FIX. **KB-2026-03-19-27:** Part of P3. | P3 | MEDIUM |
| **P5** | Prompt injection + FCP | Team 61 | Extend directive auto-injection to ALL gate prompts. Add FCP rules to relevant gate prompts. Each prompt states `process_variant` and routing. Add `finding_type` preflight for `fail`. | P3 | MEDIUM |
| **P6** | pipeline_run.sh preflight | Team 61 | Preflight: rejection → `finding_type` required; `process_variant` set and valid; team assignment matches gate+phase+variant; PWA scope check for Team 10. | P3 | LOW |
| **P7** | Dashboard (JS) | Team 61 | GateStatusPanel: `current_phase`, `process_variant` badge. FCPPanel: show when `finding_type === "unclear"`. TeamAssignmentPanel, EngineEditor, Lod200AuthorOverride per LLD400 §4.0 component tree. Read/write `team_engine_config.json`. | P1 | MEDIUM |
| **P8** | Governance + identity | Team 61 | Team 102 and Team 191 activation documents (registration). Retroactive Team 00 identity: "Chief Architect" → "System Designer". Team 11 activation prompt exists (done). | None | LOW |
| **P9** | QA validation | Team 51 | Full E2E per LLD400 §5 MCP scenarios. AC-01..AC-26 validation. Migration integrity check. | P1–P8 | — |

---

## §3 Migration Plan

### 3.1 Approach

1. **Copy-first:** Before any migration, copy `pipeline_state_agentsos.json`, `pipeline_state_tiktrack.json`, and any active WP state files to `_COMMUNICATION/agents_os/backups/` with timestamp.
2. **Migrate:** Script reads state, applies LLD400 §3.1 old→new mapping, writes new state with defaults for new fields.
3. **Validate:** Load migrated state; assert