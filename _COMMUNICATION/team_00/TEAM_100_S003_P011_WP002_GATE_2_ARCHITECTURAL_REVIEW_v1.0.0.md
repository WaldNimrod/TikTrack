---
id: TEAM_100_S003_P011_WP002_GATE_2_ARCHITECTURAL_REVIEW_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 00 (Nimrod), Team 11 (Phase 2.2), Team 101 (awareness), Team 190 (awareness)
date: 2026-03-20
gate: GATE_2
phase: "2.2 entry"
wp: S003-P011-WP002
type: REVIEW
status: ACTIVE — presented to Team 00 for decisions; immediate fixes applied
sources_reviewed:
  - TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.1.md (TEAM_190_PASS)
  - TEAM_190_TO_TEAM_101_S003_P011_WP002_LLD400_VALIDATION_REPORT_v1.0.0.md
  - TEAM_190_TO_TEAM_100_S003_P011_WP002_GATE_2_PHASE_2.1_REPORT_v1.1.0.md
  - TEAM_190_TO_TEAM_100_S003_P011_WP002_GATE_2_REPORT_v1.0.0.md
  - TEAM_190_TO_TEAM_100_S003_P011_WP002_PIPELINE_MONITOR_IMPLEMENTATION_REPORT_v1.1.0.md---

# WP002 GATE_2 — Architectural Review
## Pre-Phase 2.2 Entry Assessment

---

## §0 — Current Status Snapshot

| Item | Status |
|---|---|
| LLD400 v1.0.1 | **TEAM_190_PASS** — all BF-01..BF-05 closed |
| Pipeline state | Updated to `GATE_2 / 2.2` (Phase 2.1 + 2.1v both PASS) |
| Phase 2.2 | **READY** — Team 11 may produce Work Plan |
| LOD200 v1.0.1 | ACTIVE — all Team 190 findings resolved |
| Open decisions | 3 decisions required from Team 00 before Phase 2.3 |

---

## §1 — Findings Register (All Sources)

### Category A — Direct WP002 Fixes (applied or flagged for Team 11 mandate)

| ID | Source | Finding | Action | Status |
|---|---|---|---|---|
| A1 | LLD400 §17.2 | `save()` called inside `@model_validator` — writes to disk on every model instantiation including in tests | Team 11 mandate must clarify: validator sets values only in-memory; `load()` classmethod is the only place that calls `save()` post-migration. See §3.1 below. | Flagged for Team 11 mandate |
| A2 | LLD400 §1+§17.2 | Two migration implementations: `_perform_migration()` (static, dict) and `_run_migration()` (instance validator) | Team 11 mandate must clarify: `_run_migration` (§17.2) is canonical. §1 `_perform_migration` is superseded. Team 61 implements ONE validator. | Flagged for Team 11 mandate |
| A3 | T190 RBTM-F03 | `pipeline-monitor-core.js` has hardcoded phase→owners matrix separate from `_DOMAIN_PHASE_ROUTING` | Add explicit item to D-04 scope: monitor constitution map must be re-driven from `_DOMAIN_PHASE_ROUTING` or an exported JSON, not hardcoded | Added to D-04 scope (see §2) |
| A4 | LLD400 §2+§17.3 | `"pipeline"` sentinel in `_DOMAIN_PHASE_ROUTING` (Phase 1.2) — no handling spec for generators | Team 11 mandate must specify: when `_resolve_phase_owner()` returns `"pipeline"` → no team prompt; execute auto-action (registration) and advance phase | Flagged for Team 11 mandate |
| A5 | T190 GAP-A3 | Missing identity files for active teams: `team_11`, `team_101`, `team_102`, `team_191` | Add to D-12 scope (SSOT audit): Team 170 must create minimal identity files for all active teams lacking them | Added to D-12 scope (see §2) |
| A6 | LLD400 §17.1 | `phase8_content: str` is a legacy field name (references old GATE_8) | Note in Team 11 mandate: preserve field as-is for backward compat; do not introduce new functionality using this field; rename is out of WP002 scope | Flagged for Team 11 mandate |

### Category B — Decisions Required from Team 00 (presented in §4)

| ID | Source | Decision Required |
|---|---|---|
| B1 | T190 Monitor Report v1.1 | Role-Based Team Management: WP002 scope or WP003? |
| B2 | T190 GAP report DEC-01 | SSOT precedence for team data: roster → config → override → UI |
| B3 | T190 GAP report DEC-04 | Engine authority: who wins — `team_engine_config.json` vs `config.py` vs roster? |

### Category C — Future WP / Deferred Scope

| ID | Source | Item | Recommended WP |
|---|---|---|---|
| C1 | T190 Monitor Report | Full Role-Based Team Management (role_catalog.json, domain_role_defaults.json, wp_role_assignments) | WP003 |
| C2 | T190 GAP-A1 | Teams UI refactor to consume roster at runtime (not hardcoded catalog) | WP003 |
| C3 | T190 GAP-A2 | Missing roster entries for `team_11`, `team_101`, `team_102` in TEAMS_ROSTER_v1.0.0.json | WP003 (or quick fix if decision B2 resolves this WP) |
| C4 | T190 GAP-A5 | `.cursorrules` includes subset-only team list | WP003 |
| C5 | T190 RBTM-F06 | Extend engine editor from team→engine to role→preferred_engine | WP003+ |
| C6 | T190 §5 decisions | WP-level role override approval policy (A/B/C) | WP003 (pending B1 decision) |
| C7 | T190 GAP-A6 | Multi-channel context construction parity checks (CI) | WP003 |
| C8 | LLD400 | `TRACK_FAST` variant — not in `_DOMAIN_PHASE_ROUTING` | Deferred (spec defined, implementation later) |

---

## §2 — WP002 Plan Amendments (Direct Updates)

### D-04 Scope Extension (A3 — Monitor Constitution Map)

**Addition to D-04:**
> - [ ] `pipeline-monitor-core.js` phase→owners matrix: replace hardcoded owner values with data sourced from `_DOMAIN_PHASE_ROUTING` (exported as JSON) or an `agents_os_v2/config/phase_routing.json` snapshot. UI must not have a separate hardcoded routing table.
> - This ensures monitor always reflects the same routing truth as the pipeline.

### D-12 Scope Extension (A5 — Missing Identity Files)

**Addition to D-12:**
> - [ ] Identify all active teams missing identity files (`_COMMUNICATION/team_{N}/IDENTITY.md` or equivalent)
> - [ ] Confirmed missing: `team_11`, `team_101`, `team_102`, `team_191`
> - [ ] Team 170 creates minimal identity file for each: team name, engine, domain, constitutional authority reference
> - [ ] This is an SSOT audit finding; GATE_5 closure requires all active teams to have identity file coverage

---

## §3 — Technical Clarifications for Team 11 Work Plan Mandate

Team 11's work plan for Phase 2.2 must include the following binding clarifications as part of the Team 61 implementation mandates.

### 3.1 — Migration: Validator vs Load Clarification

**LLD400 §17.2 specifies** `@model_validator(mode="after")` that calls `self.save()`. This MUST be amended in the implementation mandate:

```
Clarification for Team 61:
The Pydantic @model_validator on PipelineState MUST:
  - Only update in-memory fields (current_gate, current_phase, gate_state, remediation_cycle_count)
  - NOT call self.save() — save causes file I/O on every model instantiation, breaking tests

The PipelineState.load(domain) classmethod MUST:
  - Call _run_migration() or detect gate change after model_validate()
  - Call self.save() only if migration was applied
  - Log migration event only here, not inside the validator

Migration table (_MIGRATION_TABLE) is defined as a module-level dict in pipeline.py.
The @model_validator reads from it. No file I/O inside validators — ever.
```

### 3.2 — Single Migration Implementation

```
Clarification for Team 61:
LLD400 §1 _perform_migration() (static, dict-based) is SUPERSEDED by §17.2.
Implement ONLY the @model_validator approach from §17.2.
The migration table is _MIGRATION_TABLE (module-level, pipeline.py).
```

### 3.3 — `"pipeline"` Sentinel Handling

```
Clarification for Team 61:
When _resolve_phase_owner() returns "pipeline":
  - The gate/phase is an auto-action, not a team prompt
  - No prompt text is generated
  - The pipeline performs the action automatically (e.g., write to registry)
  - Phase immediately advances after auto-action completes
  - Applicable: GATE_1 Phase 1.2 (program registration)
```

### 3.4 — Phase Naming Convention

```
Clarification for Team 61:
GATE_PHASE_GENERATORS dict key naming:
  _g1_1_1 = gate 1, phase 1.1
  _g2_2_1v = gate 2, phase 2.1v (use "v" suffix for validation phases)
Note: "2.1v" is a string — process_variant="TRACK_FOCUSED" is a separate concept
  from phase suffix "v" (which means "validation"). No naming collision.
```

---

## §4 — Decisions Required from Team 00 (Nimrod)

---

### [DECISION-WP2-02] Role-Based Team Management — WP002 or WP003?

**Context:** Team 190 (Monitor Report v1.1) proposes a significant architectural evolution:
- `role_catalog.json` — variant→role→gate/phase contract
- `domain_role_defaults.json` — domain→role→team defaults
- `wp_role_assignments/{wp}.json` — materialized per-WP role assignments
- `_resolve_phase_owner()` refactored to use role resolver, not routing table

This would replace `_DOMAIN_PHASE_ROUTING` (the LLD400-specified approach) with a more flexible, dynamic role catalog.

**Team 100 position:** The `_DOMAIN_PHASE_ROUTING` nested dict approach already eliminates ALL hardcoded team IDs from prompt generators — it is the right move for WP002. The role-based evolution is the natural NEXT step but is a significant scope addition. Implementing it in WP002 would:
- Expand scope significantly (3 new JSON schemas + resolver refactor + UI extensions)
- Risk delaying pipeline stabilization (the primary WP002 goal)
- NOT be additive to WP002's work — it would REPLACE the routing table approach that Team 101 already spec'd

| Option | Scope | Risk | Recommended |
|---|---|---|---|
| A — Defer to WP003 | WP002 stays focused: `_DOMAIN_PHASE_ROUTING` as routing source | LOW | ✅ Team 100 recommends |
| B — Include in WP002 as Phase 2 | After stabilization, add role catalog as extension | MEDIUM | Possible if timeline permits |
| C — Full replacement in WP002 | Replaces LLD400 approach — requires LLD400 v2 | HIGH | Not recommended |

---

### [DECISION-WP2-03] Team SSOT Precedence Chain

**Context:** Team 190 identified that team data exists in multiple places:
1. `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json` — canonical roster
2. `agents_os_v2/config.py TEAM_ENGINE_MAP` — code-level engine defaults
3. `_COMMUNICATION/agents_os/team_engine_config.json` — operational override (editable via UI)
4. `agents_os/ui/js/pipeline-teams.js` — hardcoded UI catalog

Currently there's no explicit precedence rule. Teams can read conflicting data.

**Team 100 proposed precedence:**
```
team_engine_config.json    ← highest (operational override, editable via engine editor)
  ↓ fallback
config.py TEAM_ENGINE_MAP  ← code defaults (canonical for engine assignment)
  ↓ fallback
TEAMS_ROSTER_v1.0.0.json   ← identity + metadata (canonical for team existence/domain)
  ↓
UI hardcoded catalog       ← REMOVE — replace with roster-driven at runtime (WP003)
```

| Option | Description |
|---|---|
| A (recommended) | TEAMS_ROSTER = SSOT for team identity/domain/metadata. config.py = code defaults for engine. team_engine_config.json = operational override (highest priority for engine). UI reads from roster. |
| B | config.py is the primary SSOT; roster is metadata-only |
| C | team_engine_config.json is full SSOT for all team attributes |

---

### [DECISION-WP2-04] Engine Authority Rule

**Context (GAP-A4 / DEC-04):** When `team_engine_config.json`, `config.py`, and `TEAMS_ROSTER` disagree on the engine for a team, who wins?

**Team 100 proposed rule:**
```
RULE: team_engine_config.json overrides config.py. config.py overrides TEAMS_ROSTER.
TEAMS_ROSTER stores the "canonical/recommended" engine (for reference).
config.py stores the "operational default" engine (code-level fallback).
team_engine_config.json stores the "active override" (editable, highest priority).

Pipeline uses: team_engine_config.json → fallback to config.py → fallback to roster.
UI engine editor writes ONLY to team_engine_config.json.
```

This rule is already partially implemented (engine editor writes to team_engine_config.json). The question is whether to formalize it as an Iron Rule.

| Option | Description |
|---|---|
| A (recommended) | Formalize the 3-layer precedence as an Iron Rule: config.json > config.py > roster |
| B | Only one source of truth for engine (choose one) |

---

## §5 — Phase 2.2 Authorization

**All blockers for Phase 2.2 entry are resolved.**

With the clarifications in §3 incorporated into Team 11's work plan mandate, Team 61 will have:
- Complete, unambiguous LLD400 v1.0.1 (TEAM_190_PASS)
- Clear implementation sequence (D-02 → D-01 → D-09 → D-06 → D-03 → D-04/D-05)
- All 15 certification scenarios specified in §17.5
- All architectural clarifications in §3

**Team 11 GATE_2 Phase 2.2 mandate must:**
1. Reference LLD400 v1.0.1 as the implementation specification
2. Include §3.1..§3.4 clarifications above as binding annotations
3. Include updated D-04 scope (monitor constitution map — A3)
4. Include updated D-12 scope (identity files — A5)
5. Set implementation sequence per LLD400 §15

**Next pipeline action (after Team 00 acknowledges this review):**
```bash
./pipeline_run.sh --domain agents_os
```
→ Should generate GATE_2 Phase 2.2 prompt for Team 11 (Work Plan production).
*(Note: This will currently generate an incorrect prompt due to KB-27 — pipeline.py is broken. The correct prompt is the Team 11 mandate that Team 100 will produce directly.)*

---

## §6 — Documentation Status Summary

| Document | Status | Action needed |
|---|---|---|
| LOD200 v1.0.1 | ACTIVE — all fixes applied | None |
| LLD400 v1.0.1 | TEAM_190_PASS | None — proceed to Phase 2.2 |
| Pipeline state (agentsos) | GATE_2 / 2.2 — updated | None |
| SSOT Directive | LOCKED | None |
| GATE_SEQUENCE_CANON | LOCKED | None |
| KNOWN_BUGS_REGISTER | KB-32..39 registered | IN_REMEDIATION at GATE_3 start |
| PROGRAM_REGISTRY | WP002 registered ACTIVE | None |
| WSM | GATE_2/2.1 active | Update to 2.2 after this review |
| Team 11 work plan | NOT YET PRODUCED | Phase 2.2 — next action |
| Monitor hardcoded routing (RBTM-F03) | OPEN | Team 11 must mandate fix in D-04 |
| Missing identity files | OPEN | Added to D-12 scope |

---

**log_entry | TEAM_100 | ARCHITECTURAL_REVIEW | S003_P011_WP002 | GATE_2_PRE_PHASE_2.2 | 2026-03-20**
