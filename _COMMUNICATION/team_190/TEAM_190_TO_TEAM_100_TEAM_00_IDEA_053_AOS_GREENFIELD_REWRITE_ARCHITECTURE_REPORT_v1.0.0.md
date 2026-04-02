---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_053_AOS_GREENFIELD_REWRITE_ARCHITECTURE_REPORT_v1.0.0
historical_record: true
from: Team 190 (Constitutional Validator / Intelligence)
to: Team 100 (Chief System Architect)
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-25
status: PROPOSED_FOR_ARCHITECTURAL_DISCUSSION
idea_id: IDEA-053
program: IDEA_PIPELINE
domain: agents_os
type: REPORT
subject: AOS full rewrite option (greenfield) — concept context, architecture recommendations, and alignment to IDEA-052 V3 package---

# Team 190 Strategic Report — IDEA-053 (v1.0.0)
## AOS Greenfield Rewrite Architecture (From Scratch)

## 0) Scope and framing

This report is an **additive track**.
It does **not** modify or invalidate the locked IDEA-052 package.

Purpose:
1. Define a clear concept baseline for architectural rewrite discussion.
2. Reassess IDEA-052 assumptions under a full rewrite option.
3. Provide a practical architecture direction for a maintainable, stable, and rapidly evolvable AOS.

---

## 1) System goals (simple, explicit)

AOS must do the following and only the following as core mission:

1. **Control workflow deterministically**
   - For each domain, work package, gate, and phase: who acts, what is expected, and what transition is valid.
2. **Maintain canonical runtime state**
   - Current position in process (domain/program/wp/gate/phase), correction cycles, and readiness flags.
3. **Generate actionable team context**
   - Produce deterministic, role-correct prompts based on the locked 4-layer model.
4. **Record immutable operational history**
   - Every pass/fail/override/mutation event with actor, timestamp, reason, and evidence references.
5. **Enable human-governed operations (HITL)**
   - User (Team 00) controls critical transitions; system is safe by default.
6. **Provide operator-grade management UX**
   - Dashboard is understandable, low-noise, and supports control without hidden side effects.
7. **Optimize token/cost overhead by design**
   - Context and cache behavior are configurable, measurable, and bounded.

---

## 2) Core system parts required in rewrite architecture

| Part | Responsibility | Canonicality |
|---|---|---|
| `Control Plane` | Runtime/process/control data (teams, routing, state, policy, assignments) | DB-canonical |
| `Artifact Plane` | Prompts, communication docs, reports, evidence files | FILE-canonical |
| `Orchestration Engine` | State machine + transition guards + routing + command handling | DB-driven logic |
| `Context Engine` | 4-layer context assembly + per-layer budget controls | Policy-driven |
| `Prompt Engine` | Deterministic prompt generation from state + contracts | Template/spec driven |
| `Audit Engine` | Append-only event ledger + tamper checks | Immutable-first |
| `Management API` | Validated mutation surface for UI/CLI | RBAC + schema guard |
| `Operations UI` | Monitor + control + drilldown + cache controls | API-consumer only |

---

## 3) Current-system pain points that justify greenfield option

Measured/observed signals in current implementation:

1. Monolithic orchestrator complexity
   - `agents_os_v2/orchestrator/pipeline.py` is ~3854 lines.
2. Multi-source routing and team-definition drift
   - Roster declares SSOT in `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json`, while UI still keeps hardcoded `TEAMS` in `agents_os/ui/js/pipeline-teams.js`.
3. Legacy+canonical overlap still present in active runtime code paths
   - `GATE_CONFIG.update(...)` legacy blocks still exist in orchestrator.
4. UI configuration fragmentation
   - `pipeline-config.js` includes fallback routing/canonical mapping logic that duplicates backend concerns.
5. API mutation scope is partial
   - engine override + lod200 author override exist, but full team/process management is not centralized.

Implication: ongoing patching can improve behavior, but complexity pressure remains structural.

---

## 4) Reassessment of IDEA-052 (V3 DB-first package) under full rewrite

### 4.1 What remains fully valid (keep as-is)

1. **DB-first control plane direction** remains correct.
2. **Deterministic DB-vs-FILE classification** remains mandatory.
3. **4-layer context lock** remains mandatory (no new layer model).
4. **Configurable cache policy** remains mandatory.
5. **RBAC and mutation-channel policy** remains mandatory.
6. **Audit hardening requirement** remains mandatory.

### 4.2 What changes when rewrite is chosen

1. Migration emphasis shifts from “incremental retrofit” to “greenfield kernel + controlled cutover”.
2. Compatibility burden moves to adapters/importers rather than preserving internal legacy structures.
3. Program reverse-references still required, but operationally mapped to new canonical contracts.
4. UI should consume API contracts only; no local fallback business rules.

### 4.3 Net conclusion

IDEA-052 is not discarded.
It becomes the **policy/decision backbone** for implementation through a new architecture path.

---

## 5) Recommended greenfield architecture (target)

## 5.1 Architectural style

1. **Schema-first modular monolith** (phase 1)
2. Strong boundaries by module, not by process/thread.
3. Event ledger append-only with strict mutation services.

## 5.2 Module boundaries

1. `definitions` — gate/phase/team/role/variant/domain contracts.
2. `runtime_state` — active process state per domain/wp.
3. `routing` — owner resolution from definitions + runtime sentinels.
4. `prompting` — templates + 4-layer context assembly.
5. `audit` — immutable events and integrity checks.
6. `policy` — context/cache/token budgets and guardrails.
7. `management` — controlled mutations via API/UI.

## 5.3 Canonical storage split

1. DB-canonical:
   - team profiles and capabilities
   - role-to-team defaults by domain/variant
   - wp-specific assignment overrides
   - runtime state
   - routing contracts
   - context/cache policy
   - audit events
2. File-canonical:
   - team communication artifacts
   - prompts/reports/evidence docs
   - architectural directives and governance documents

## 5.4 API contract principles

1. All mutations are schema-validated and audited.
2. No direct file-side mutation for control-plane semantics.
3. UI uses API only; no hidden fallback logic for routing decisions.
4. CLI and UI share same backend mutation path.

---

## 6) Rewrite execution strategy (compatible with Team 00 constraints)

Given approved constraints (full stop allowed, branch isolation, full backup), recommended path:

1. **Phase A — Freeze + snapshot**
   - freeze active pipelines, export canonical snapshot, lock baseline manifest.
2. **Phase B — Greenfield kernel build**
   - implement minimal modules: definitions, state, routing, pass/fail transitions, audit.
3. **Phase C — Context/prompt integration**
   - attach existing 4-layer model and prompt generators via new contracts.
4. **Phase D — UI/CLI convergence**
   - connect management UI and CLI to same API layer.
5. **Phase E — Replay and parity checks**
   - replay representative pipelines (AOS + TikTrack) against expected outcomes.
6. **Phase F — Cutover and lock**
   - switch canonical runtime to new system, keep read-only legacy archive.

---

## 7) Architectural recommendations and conclusions

### 7.1 Recommendations

1. Approve IDEA-053 as **architecture-discussion track** (not execution yet).
2. Adopt “greenfield kernel + controlled cutover” as preferred rewrite method.
3. Treat IDEA-052 as normative policy baseline for rewrite contracts.
4. Require SSOT enforcement by construction:
   - one canonical definition contract
   - one canonical routing source
   - one canonical mutation channel.
5. Set token-efficiency as a release gate with explicit SLOs.

### 7.2 Conclusions

1. Full rewrite is technically justified if strategic goal is long-term maintainability and rapid evolution.
2. Main risk is transition governance, not implementation capability.
3. With full-stop + backup + branch-isolated rehearsal, rewrite risk becomes manageable.
4. Highest value outcome is not “new code” but **reduction of architectural ambiguity**.

---

## 8) Decision questions for architecture board

1. Approve IDEA-053 intake as formal idea track?
2. Approve greenfield execution principle (kernel-first, adapter-based cutover)?
3. Lock MVP boundary for rewrite wave 1 (which modules are mandatory at go-live)?
4. Lock audit level for wave 1 (hash-chain baseline vs signed critical events)?
5. Lock token SLO thresholds and failure policy for release gating?

---

## 9) References

1. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_AOS_DATABASE_CONTROL_PLANE_MIGRATION_REPORT_v1.2.2.md`
2. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_00_IDEA_052_AOS_V3_DB_SPEC_WORKING_PACKAGE_v1.0.0.md`
3. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_G_DB_FILE_CLASSIFICATION_RULESET_v1.0.0.md`
4. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_H_CONTEXT_FORMAT_AND_CACHE_POLICY_v1.0.0.md`
5. `_COMMUNICATION/team_00/TEAM_00_AOS_GREENFIELD_ARCHITECTURE_v1.0.0.md`
6. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_AOS_V3_COHERENCE_PLAN_v1.0.0.md`
7. `agents_os_v2/orchestrator/pipeline.py`
8. `agents_os/ui/js/pipeline-teams.js`
9. `agents_os/ui/js/pipeline-config.js`
10. `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json`

---

**log_entry | TEAM_190 | IDEA_053_AOS_GREENFIELD_REWRITE_ARCHITECTURE_REPORT | PROPOSED_FOR_ARCHITECTURAL_DISCUSSION | v1.0.0 | 2026-03-25**
