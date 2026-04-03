---
id: ARCHITECT_DIRECTIVE_DECISIONS_WP2_02_03_04_v1.0.0
historical_record: true
type: ARCHITECTURAL_DIRECTIVE
from: Team 00 (Nimrod — System Designer)
date: 2026-03-20
status: LOCKED
program: S003-P011
wp: S003-P011-WP002
domain: agents_os
decisions_locked:
  - DECISION-WP2-02
  - DECISION-WP2-03
  - DECISION-WP2-04
authority: Team 00 (constitutional — final approval authority)---

# Architectural Directive — WP002 Decisions WP2-02, WP2-03, WP2-04

**Locked 2026-03-20 by Team 00 (Nimrod).**
These three decisions were presented in `TEAM_100_S003_P011_WP002_GATE_2_ARCHITECTURAL_REVIEW_v1.0.0.md §4`
and approved by Team 00 in session. This directive makes them Iron Rules.

---

## DECISION-WP2-02 — Role-Based Team Management Scope

**Decision: Option A — Defer to WP003.**

**Ruling:**
The `_DOMAIN_PHASE_ROUTING` nested dict (as specified in LLD400 v1.0.1) is the canonical routing
mechanism for WP002. It eliminates all hardcoded team IDs from prompt generators. That is the
correct move for WP002.

The Role-Based Team Management architecture proposed by Team 190 (role_catalog.json,
domain_role_defaults.json, wp_role_assignments/) is strategically correct and is the approved
direction for WP003. It MUST NOT be included in WP002 scope.

**Iron Rules:**
1. WP002 MUST implement `_DOMAIN_PHASE_ROUTING` exactly as specified in LLD400 v1.0.1 §2.
2. No role_catalog.json, domain_role_defaults.json, or wp_role_assignments/ files shall be
   created or referenced by WP002 implementation.
3. Team 61 implementing WP002 must NOT implement a role resolver. The routing table is the
   resolver for WP002.
4. WP003 will be initiated after WP002 GATE_5 PASS. At WP003 activation, `_DOMAIN_PHASE_ROUTING`
   will be superseded by the role-catalog resolver. Until then, `_DOMAIN_PHASE_ROUTING` is
   canonical and immutable.

**Approved by:** Team 00 (Nimrod), 2026-03-20
**Proposed by:** Team 100 (Chief System Architect)
**Background:** Team 190 Monitor Report v1.1 (RBTM-F01..F07)

---

## DECISION-WP2-03 — Team SSOT Precedence Chain

**Decision: Option A — Three-source precedence, TEAMS_ROSTER as identity SSOT.**

**Ruling:**
Team data lives in three legitimate sources. The precedence chain is:

```
HIGHEST PRIORITY:  team_engine_config.json   (operational override — editable via UI engine editor)
                         ↓ fallback
MIDDLE PRIORITY:   config.py TEAM_ENGINE_MAP  (code defaults — engine assignment baseline)
                         ↓ fallback
LOWEST PRIORITY:   TEAMS_ROSTER_v1.0.0.json   (identity + metadata — team existence, domain, authority)
```

The hardcoded UI catalog in `pipeline-teams.js` (TEAMS array) is NOT a source of truth. It is a
display artifact. It MUST be removed and replaced with roster-driven runtime loading in WP003 (C2).

**Iron Rules:**
1. `TEAMS_ROSTER_v1.0.0.json` is the SSOT for team existence, domain, role, and authority.
   A team that does not appear in the roster DOES NOT OFFICIALLY EXIST in the system.
2. `config.py TEAM_ENGINE_MAP` is the code-level operational default for engine assignment.
   It is authoritative when no JSON override is present.
3. `team_engine_config.json` is the operational override. It has highest priority for engine
   determination. It is written ONLY by the UI engine editor — never manually.
4. The pipeline runtime engine resolution order MUST follow: config.json → config.py → roster.
5. No new source of team data may be introduced without an architectural directive.
6. The hardcoded `TEAMS` array in `pipeline-teams.js` remains as-is through WP002 (WP003 removes it).
   WP002 does not modify UI team catalog. This is confirmed deferred scope (C2).

**Approved by:** Team 00 (Nimrod), 2026-03-20
**Proposed by:** Team 100 (Chief System Architect)
**Background:** Team 190 GAP Report DEC-01 (GAP-A1..A4)

---

## DECISION-WP2-04 — Engine Authority Rule (Iron Rule)

**Decision: Option A — Formalize 3-layer precedence as Iron Rule.**

**Ruling:**
When `team_engine_config.json`, `config.py TEAM_ENGINE_MAP`, and `TEAMS_ROSTER` disagree on the
engine for a team, the following Iron Rule governs:

```
IRON RULE: ENGINE AUTHORITY CHAIN

  team_engine_config.json  →  "active override"       (HIGHEST — wins always)
  config.py TEAM_ENGINE_MAP  →  "operational default"  (middle — wins if no JSON override)
  TEAMS_ROSTER engine field  →  "canonical/recommended" (lowest — reference, not operational)

Pipeline uses: team_engine_config.json → fallback to config.py → fallback to roster.
UI engine editor writes ONLY to team_engine_config.json. Never to config.py. Never to roster.
```

This rule applies to ALL domains (agents_os AND tiktrack) and ALL work packages. It is permanent
until explicitly superseded by a future architectural directive.

**Rationale:** The engine editor already writes to team_engine_config.json. This formalizes that
existing behavior, adds the fallback chain, and establishes that roster engine values are advisory
(historical/recommended), not operational.

**Iron Rules:**
1. `team_engine_config.json` ALWAYS wins for engine determination when present for that team.
2. `config.py TEAM_ENGINE_MAP` is the fallback when team_engine_config.json has no entry.
3. `TEAMS_ROSTER` engine field is informational — it is never used for operational dispatch.
4. Engine editor UI MUST write ONLY to team_engine_config.json. Writing to config.py or roster
   from the UI is a constitutional violation.
5. Team 61 implementing WP002 MUST implement the `_resolve_engine_for_team()` helper (or equivalent)
   following this exact precedence. No hardcoded engine assumptions in pipeline.py.

**Approved by:** Team 00 (Nimrod), 2026-03-20
**Proposed by:** Team 100 (Chief System Architect)
**Background:** Team 190 GAP Report DEC-04 (GAP-A4)

---

## Enforcement

| Team | Obligation |
|---|---|
| Team 61 | Implement all three decisions as specified. Engine authority chain + routing table are
implementation contracts. |
| Team 100 | Reference this directive in all future mandates. Do not produce designs that contradict
these rulings. |
| Team 101 | LLD400 v1.0.1 is already aligned with WP2-02 (uses `_DOMAIN_PHASE_ROUTING`). No changes
required. |
| Team 170 | SSOT audit (D-12) must validate that roster is correctly populated before GATE_5 closure. |
| Team 190 | Validate enforcement of all three decisions at GATE_4 architectural review. Any violation
= BLOCK_FOR_FIX. |
| Team 11 | Include all three decisions by reference in the Phase 2.2 Work Plan mandate for Team 61. |

---

## Related Documents

| Document | Relationship |
|---|---|
| `TEAM_100_S003_P011_WP002_GATE_2_ARCHITECTURAL_REVIEW_v1.0.0.md §4` | Source findings and options |
| `TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.1.md` | Aligned with WP2-02 routing approach |
| `ARCHITECT_DIRECTIVE_SINGLE_SOURCE_OF_TRUTH_v1.0.0.md` | Parent SSOT directive (WP2-03/04 are
instances of that directive) |
| `TEAM_190_TO_TEAM_100_S003_P011_WP002_PIPELINE_MONITOR_IMPLEMENTATION_REPORT_v1.1.0.md` | Team 190
role-based proposal (RBTM-F01..F07) — deferred to WP003 per WP2-02 |
| `TEAM_190_TO_TEAM_100_S003_P011_WP002_GATE_2_REPORT_v1.0.0.md` | Team 190 context gap report
(GAP-A1..A6, DEC-01..DEC-04) |

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | DECISIONS_WP2_02_03_04 | LOCKED | 2026-03-20**
