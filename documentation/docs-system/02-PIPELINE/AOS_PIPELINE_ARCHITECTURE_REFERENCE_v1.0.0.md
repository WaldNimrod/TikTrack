# AOS Pipeline Architecture Reference

**Version:** 1.0.2  
**Domain:** Agents_OS + TikTrack (parallel pipelines)  
**Status:** Canonical (Team 170 — 2026-03-23)  
**Code snapshot:** Verified against repository state as of 2026-03-23 (§3 per Team 190 BF-01; §4 BN-1 `PIPELINE_RELAXED_KB84` per Team 100 binding note).

This document is self-contained onboarding for operators and implementers. Primary engines: `pipeline_run.sh` (shell), `agents_os_v2/orchestrator/pipeline.py` (Python), `agents_os/ui/js/pipeline-dashboard.js` + `pipeline-config.js` (dashboard).

---

## §1 — System Overview

### 1.1 What is the AOS Pipeline?

The pipeline is a **deterministic gate machine** that coordinates multi-team work on a single work package (WP). It replaces ad-hoc chat by:

- Persisting state in per-domain JSON (`pipeline_state_tiktrack.json`, `pipeline_state_agentsos.json`).
- Generating **mandates** (prompts) per gate/phase under `_COMMUNICATION/agents_os/prompts/`.
- Requiring **human operators** (Nimrod) to run `./pipeline_run.sh` to advance gates — agents do not self-advance.

Canonical sequence is defined in Python:

```54:54:agents_os_v2/orchestrator/pipeline.py
GATE_SEQUENCE = ["GATE_0", "GATE_1", "GATE_2", "GATE_3", "GATE_4", "GATE_5"]
```

### 1.2 Gate flow (high level)

```mermaid
flowchart LR
  ns[NOT_STARTED] --> g0[GATE_0]
  g0 --> g1[GATE_1]
  g1 --> g2[GATE_2]
  g2 --> g3[GATE_3]
  g3 --> g4[GATE_4]
  g4 --> g5[GATE_5]
  g5 --> co[COMPLETE]
```

**Why:** Each gate is a quality gate with defined inputs/outputs. Legacy gate IDs (e.g. `G3_PLAN`, `WAITING_GATE2_APPROVAL`) are **aliases** mapped to canonical gates via `migration_config` and dashboard `LEGACY_GATE_TO_CANONICAL_FALLBACK` / `window.__PHOENIX_LEGACY_GATE_MAP` (`agents_os/ui/js/pipeline-config.js:8-23`; generated map: `agents_os/ui/js/pipeline-gate-map.generated.js`).

### 1.3 GATE_8 alias

Legacy **`GATE_8`** maps to **`GATE_5`** for canonical closure semantics (`pipeline-config.js:17`, `"GATE_8": "GATE_5"`). The dashboard also defines a dedicated `ALL_GATE_DEFS['GATE_8']` entry for UI routing — see `agents_os/ui/js/pipeline-dashboard.js:1186+`.

### 1.4 Two-phase gates (dashboard model)

`isTwoPhaseGate(gate)` returns true for `GATE_1`, `GATE_2`, `GATE_5`, `GATE_8` (`agents_os/ui/js/pipeline-dashboard.js:1969-1971`). Sub-phases are listed in `GATE_PHASE_ORDER` / `GATE_PHASE_NAMES` (`pipeline-config.js:132-150`).

### 1.5 Process variants

`PipelineState.process_variant` stores `TRACK_FULL`, `TRACK_FOCUSED`, or `TRACK_FAST` (field definition at `agents_os_v2/orchestrator/state.py` line 54). Phase routing consults variant + domain (`resolveOwnerFromPhaseRoutingJson`, `pipeline-config.js` lines 47–63; `_DOMAIN_PHASE_ROUTING`, `pipeline.py` lines 84–).

### 1.6 Gate ownership (summary)

| Canonical gate | Primary role (typical) |
|----------------|------------------------|
| GATE_0 | Team 190 — LOD200 / scope validation |
| GATE_1 | Team 170 (spec) → Team 190 (validate) — LLD400 |
| GATE_2 | Team 10/11 work plan, Team 90 plan review, lod200 architect sign-off |
| GATE_3 | Mandates, implementation, QA (domain-specific) |
| GATE_4 | Dev validation, architect review, human sign-off (4.3) |
| GATE_5 | Documentation closure (Team 70 TT / Team 170 AOS) → Team 90 |

Dashboard `GATE_CONFIG` duplicates ownership for UI (`pipeline-config.js` lines 203–221). Python `DOMAIN_GATE_OWNERS` and `_DOMAIN_PHASE_ROUTING` (`pipeline.py`) are authoritative for orchestration.

---

## §2 — Component Architecture

### 2.1 `pipeline_run.sh` — operator CLI

**Location:** repo root `pipeline_run.sh` (~1600 lines).

**Domain selection:** `--domain tiktrack|agents_os` or `PIPELINE_DOMAIN` env (lines 39–37).

**KB-84 precision identifiers:** Optional `--wp`, `--gate`, `--phase` parsed before subcommand (lines 45–58); `_kb84_guard` validates against live state (`pipeline_run.sh:432-549`).

**Main subcommands (case statement starts at line 610):**

| Pattern | Purpose |
|---------|---------|
| `next` / `""` (default) | Refresh state, auto-store LLD400/G3_PLAN if applicable, run `$CLI --status`, show or generate prompt |
| `pass` | `_kb84_guard pass`, artifact validation, `$CLI --advance` |
| `fail` | KB-84 guard + record failure |
| `route` | Routed remediation |
| `status` | Status only |
| `approve` | Human approval alias |
| `phase*` | Phase mandate extraction (`phase2` sets `current_phase` for GATE_5 before regenerate — FIX-101-07, lines 1411–1422) |
| `store` | Store artifact path into state |
| `revise`, `override`, `insist`, `pass_with_actions`, `actions_clear`, `domain` | Specialized flows |

**Example (precision pass):**

```bash
./pipeline_run.sh --domain tiktrack --wp S003-P013-WP001 --gate GATE_3 --phase 3.3 pass
```

**Python entry:** `python3 -m agents_os_v2.orchestrator.pipeline` (`pipeline_run.sh` line 23).

### 2.2 `pipeline.py` — orchestration engine

**Location:** `agents_os_v2/orchestrator/pipeline.py`.

**HITL prohibition:** `_hitl_prohibition_block()` prepends to generated prompts (`pipeline.py` lines 64–81) — FIX-101-03.

**Mandate engine:**

- `MandateStep` dataclass — lines 527–567.
- `_read_coordination_file` — coordination auto-inject — lines 570–614.
- `_generate_mandate_doc` — generic multi-team mandate — lines 669+.
- `GATE_MANDATE_FILES` — base filenames per gate — lines 519–524.

**GATE_5 two-phase mandates:** `_generate_gate_5_mandates` (`pipeline.py:2709+`).

**Gate dispatch:** CLI `--generate-prompt GATE_N` routes to gate-specific generators (see `generate_prompt` / `GATE_CONFIG` usage around lines 885–903).

### 2.3 `pipeline_state` — `PipelineState`

**Location:** `agents_os_v2/orchestrator/state.py` (not `pipeline.py`).

**Model:** `class PipelineState(BaseModel)` at line 25. Key fields include `work_package_id`, `current_gate`, `gates_completed`, `current_phase`, `lld400_content`, `work_plan`, `process_variant`, `lod200_author_team`, `last_updated` (lines 29–58).

**Why separate file:** Persistence, migration (`_run_migration`), and `advance_gate()` save semantics live here — tests must not corrupt live JSON (see `conftest.py` KB-75 guard).

### 2.4 `pipeline-dashboard.js` — dashboard UI

**Location:** `agents_os/ui/js/pipeline-dashboard.js`.

| Function | Purpose | Lines (approx.) |
|----------|---------|-----------------|
| `ALL_GATE_DEFS` | Per-gate metadata, verdict teams, fail routes | 936+ |
| `getEffectiveVerdictTeam` | Single source of truth for active team at gate+phase | 1387–1424 |
| `_parseMandateSections` | Split mandate markdown into tabs; regex `^## ((?:Team \\d+|Operator)...)` | 711–743 |
| `extractVerdictStatus` | PASS/BLOCK from JSON / markdown / CLOSURE_RESPONSE | 1909–1945 |
| `getExpectedFiles` | Delegated from `pipeline-config.js` | 1846 |
| Pass-Ready CTA | `#csb-fd-pass-ready` injection | 2066–2130 |
| Auto-refresh | `setInterval(loadAll, 5000)` | 4343–4379 |

### 2.5 `pipeline-config.js` — shared config

**Location:** `agents_os/ui/js/pipeline-config.js`.

| Symbol | Role | Lines |
|--------|------|-------|
| `GATE_SEQUENCE` | Ordered gate list | 5 |
| `GATE_CONFIG` | Owner/engine/twoPaths per gate id | 203–221 |
| `GATE_MANDATE_FILES_BASE` | Mandate filename per gate | 227–238 |
| `getGateMandatePath(gate, domain)` | Domain-prefixed path under `prompts/` | 240–247 |
| `getExpectedFiles()` | Phase-aware expected artifact paths | 322+ |

**Note:** The mandate text refers to `ALL_GATE_DEFS`; in code, **comprehensive gate UI definitions** live in `pipeline-dashboard.js` (`ALL_GATE_DEFS`, line 936), while **`GATE_CONFIG`** in `pipeline-config.js` is the slimmer canonical roster for owners.

### 2.6 `pipeline-commands.js` — command popup / prereq

**Location:** `agents_os/ui/js/pipeline-commands.js`.

Prerequisite popups apply to **pass** commands only (`_isPassCmd`, lines 126–131) — prevents blocking intentional `fail`/`route`/`phase` (DEV-GATE5-003 fix).

---

## §3 — Gate-by-Gate Reference (canonical + GATE_8)

**Canonical sequence** is `GATE_0` … `GATE_5` (`agents_os_v2/orchestrator/pipeline.py:54` and `pipeline-config.js:5`). **`GATE_8`** is a **legacy closure gate id** mapped to **`GATE_5`** (`pipeline-config.js:17`; runtime may use `pipeline-gate-map.generated.js`). It is **not** a sixth step after `GATE_5` in Python `GATE_SEQUENCE`; operators may still see `GATE_8` in UI/state where legacy ids persist — treat closure semantics like **documentation + Team 90** with `ALL_GATE_DEFS['GATE_8']` (`agents_os/ui/js/pipeline-dashboard.js:1186+`).

**Routing SSOT:** Per-gate **`failRoutes.doc`** and **`failRoutes.full`** (dashboard `ALL_GATE_DEFS`) are the operator-facing `route_recommendation` targets after `./pipeline_run.sh fail …` (precision fail still uses KB-84 identifiers — `pipeline_run.sh:1123+`).

The subsections below cover **GATE_0, GATE_1, GATE_2, GATE_3, GATE_4, GATE_5, GATE_8** as required. Implementation work between GATE_2 and GATE_4 often uses **sub-states** (`G3_PLAN`, `G3_5`, `G3_6_MANDATES`, `CURSOR_IMPLEMENTATION`, `GATE_3_QA`) — see `ALL_GATE_DEFS` in `agents_os/ui/js/pipeline-dashboard.js:936-1204`.

---

### §3.1 — GATE_0 (Scope validation)

| Field | Detail |
|-------|--------|
| **Purpose** | Team 190 validates program scope, domain isolation, feasibility (`ALL_GATE_DEFS` `desc`). |
| **Trigger** | New WP enters pipeline at `GATE_0` after state init; prompt generated via `./pipeline_run.sh` (`next`). |
| **Phases** | Single-phase (`GATE_PHASE_ORDER.GATE_0` is `[]` — `pipeline-config.js:133`). |
| **Who runs** | Team 190 (Codex) — `verdictTeam: team_190`. |
| **Inputs** | Generated GATE_0 mandate; program registry / WP identity. |
| **Outputs (pattern)** | `TEAM_190_{WP}_GATE_0_VALIDATION_v*.md` (see `getVerdictCandidates` / team_190 paths in `pipeline-dashboard.js:703-710`). |
| **PASS** | Team 190 verdict PASS; operator runs precision `pass` (`KB-84`). |
| **Common failures** | Scope too broad; registry mismatch; missing LOD200 constraints. |
| **`route_recommendation` → doc** | `./pipeline_run.sh route doc GATE_0` — fix scope wording / docs → retry `GATE_0`. |
| **`route_recommendation` → full** | `./pipeline_run.sh route full GATE_0` — rewrite brief / program definition → retry `GATE_0`. |

---

### §3.2 — GATE_1 (Specification — LLD400)

| Field | Detail |
|-------|--------|
| **Purpose** | Team 170 authors LLD400; Team 190 validates (`ALL_GATE_DEFS` `desc`). |
| **Trigger** | After `GATE_0` PASS; `current_phase` `1.1` then `1.2`. |
| **Phases** | `1.1` (spec author) → `1.2` (validation) — `GATE_PHASE_ORDER` / `GATE_PHASE_NAMES` (`pipeline-config.js:135-136`, `143-144`). Transition: `./pipeline_run.sh phase2` when moving from Phase 1 to Phase 2 mandate (`pipeline_run.sh:1393+`). |
| **Who runs** | Phase 1.1: Team 170; 1.2: Team 190 (`getEffectiveVerdictTeam` — `pipeline-dashboard.js:1392-1397`). |
| **Inputs** | Spec brief; prior gate outputs. |
| **Outputs** | `TEAM_170_*_LLD400_*.md`; `TEAM_190_*_GATE_1_VALIDATION_*.md` (tier patterns in `getExpectedFiles` / prompts). |
| **PASS** | Team 190 validation PASS on LLD400; operator `pass`. |
| **Common failures** | Missing identity header; incomplete contract sections; DM validation blocks. |
| **`route_recommendation` → doc** | `./pipeline_run.sh route doc GATE_1` — Team 170 doc fixes → retry `GATE_1`. |
| **`route_recommendation` → full** | `./pipeline_run.sh route full GATE_1` — full LLD400 rewrite → retry `GATE_1`. |

---

### §3.3 — GATE_2 (Architecture / work-plan track)

| Field | Detail |
|-------|--------|
| **Purpose** | Architectural approval and **work-plan** production: phases **2.2** (plan), **2.2v** (Team 90 on `G3_5`), **2.3** (lod200 architect) per `GATE_PHASE_ORDER` / `GATE_PHASE_NAMES` (`pipeline-config.js:137-138`, `145-146`) and `_DOMAIN_PHASE_ROUTING` (`pipeline.py:89-112`). |
| **Trigger** | Enters after `GATE_1` complete. |
| **Phases** | `2.2` → `2.2v` → `2.3` (`GATE_PHASE_ORDER.GATE_2` — `pipeline-config.js:137`). |
| **Who runs** | Team 10 (TikTrack) / Team 11 (AOS) for plan; Team 90 for `G3_5`; team_111 / team_110 / team_100 for 2.3 per domain (`lod200_author_team`; legacy 101/102 tolerated in old state). |
| **Inputs** | LLD400; work plan drafts. |
| **Outputs** | `TEAM_10_*_G3_PLAN_WORK_PLAN_*.md`; `TEAM_90_*_G3_5_*`; architect `GATE_2` verdict files. |
| **PASS** | Each phase’s acceptance met; final `pass` advances toward `GATE_3`. |
| **Common failures** | Plan gaps; Team 90 BLOCK on `G3_5`; architect CONCERN on 2.3. |
| **`route_recommendation` → doc** | `./pipeline_run.sh route doc GATE_2` — spec/plan doc fixes → back to `GATE_1` / plan revision paths per dashboard label (`ALL_GATE_DEFS` `GATE_2.failRoutes`, `pipeline-dashboard.js:984-987`). |
| **`route_recommendation` → full** | `./pipeline_run.sh route full GATE_2` — major revision → `GATE_1`. |

---

### §3.4 — GATE_3 (Implementation & QA)

| Field | Detail |
|-------|--------|
| **Purpose** | Mandates generation, implementation (Team 61 AOS or Team 20/30 TikTrack), QA — canonical **`GATE_3`** phases `3.1`–`3.3`; legacy sub-ids (`G3_6_MANDATES`, `CURSOR_IMPLEMENTATION`) map to `GATE_3` (`pipeline-config.js:14-16`). Dashboard: `ALL_GATE_DEFS` entries such as `GATE_3_QA` (`pipeline-dashboard.js:1090+`). |
| **Trigger** | After `GATE_2` complete. |
| **Phases** | `3.1` mandates → `3.2` implementation → `3.3` QA (`pipeline-config.js:138`, `147-148`). |
| **Who runs** | Team 11/10, Team 61 or 20+30, Team 50/51 (`GATE_3_QA` def — `pipeline-dashboard.js:1090-1114`). |
| **Inputs** | Approved work plan + LLD400; generated mandates. |
| **Outputs** | Implementation reports; `TEAM_50_*_QA_REPORT_*.md` / Team 51 equivalents. |
| **PASS** | QA PASS at phase 3.3; operator advances. |
| **Common failures** | QA BF items; implementation gaps. |
| **`route_recommendation` → doc** | `./pipeline_run.sh route doc GATE_3` — doc/governance fixes → re-QA (`ALL_GATE_DEFS` `GATE_3_QA.failRoutes.doc`, `pipeline-dashboard.js:1107-1108`). |
| **`route_recommendation` → full** | `./pipeline_run.sh route full GATE_3` — new mandates / re-implementation (`pipeline-dashboard.js:1108`). |

---

### §3.5 — GATE_4 (Validation & human sign-off)

| Field | Detail |
|-------|--------|
| **Purpose** | Dev validation (4.1), architect review (4.2), **human** Nimrod sign-off (4.3) — `GATE_PHASE_ORDER` / `PHASE_ACTOR_SUBTITLES` (`pipeline-config.js:139`, `151-154`). |
| **Trigger** | Post–GATE_3 completion. |
| **Phases** | `4.1` → `4.2` → `4.3`. |
| **Who runs** | Team 90; `lod200_author_team`; Team 00 (`4.3`). |
| **Inputs** | Implementation + QA evidence. |
| **Outputs** | `TEAM_50_*_QA_REPORT_*.md`, Team 90 / architect verdicts; human approval recorded via pipeline state. |
| **PASS** | Phases complete; Nimrod approval where required. |
| **Common failures** | BF-G4 blockers; architectural rejection. |
| **`route_recommendation` → doc** | `./pipeline_run.sh route doc GATE_4` — minor fixes → re-QA path (`pipeline-dashboard.js:1145-1146`). |
| **`route_recommendation` → full** | `./pipeline_run.sh route full GATE_4` — full cycle → `G3_PLAN` (`pipeline-dashboard.js:1146-1147`). |

---

### §3.6 — GATE_5 (Closure — canonical five-gate model)

| Field | Detail |
|-------|--------|
| **Purpose** | In the **5-gate canonical model**, `GATE_5` is **lifecycle closure**: documentation (Phase 5.1: Team 70 TikTrack / Team 170 AOS) and **Team 90** validation of closure (Phase 5.2). Orchestrator: `_generate_gate_5_mandates` (`pipeline.py:2709+`). The dashboard `ALL_GATE_DEFS['GATE_5']` `desc` may differ from phase labels — operators should follow **mandate + `current_phase`** for the active WP. |
| **Trigger** | After `GATE_4` complete (canonical path). |
| **Phases** | `5.1` → `5.2` (`pipeline-config.js:140`, `149-150`). Transition: `./pipeline_run.sh phase2` at `GATE_5` updates `current_phase` to `5.2` before mandate regen (`pipeline_run.sh:1411-1422`). |
| **Who runs** | Phase 5.1: Team 70 or Team 170; 5.2: Team 90 (`getEffectiveVerdictTeam` — `pipeline-dashboard.js:1415-1419`). |
| **Inputs** | AS_MADE / closure package per Team 70/170 mandate. |
| **Outputs** | `TEAM_{70|170}_*_GATE5_PHASE51_*_CLOSURE_*.md`; Team 90 closure validation verdict (`getExpectedFiles` / prompts). |
| **PASS** | Team 90 validates closure; operator `pass` completes WP. |
| **Common failures** | Missing archive; incomplete AS_MADE; Team 90 BLOCK. |
| **`route_recommendation` → doc** | `./pipeline_run.sh route doc GATE_5` — governance/docs fix path per `ALL_GATE_DEFS` (`pipeline-dashboard.js:1127-1131`). |
| **`route_recommendation` → full** | `./pipeline_run.sh route full GATE_5` — full replan path (`pipeline-dashboard.js:1133-1137`). |

---

### §3.7 — GATE_8 (Legacy closure gate — parallel to GATE_5)

| Field | Detail |
|-------|--------|
| **Purpose** | **Documentation closure** track: doc team produces **AS_MADE_REPORT** + archive; Team 90 validates; WP closed — `ALL_GATE_DEFS['GATE_8']` (`pipeline-dashboard.js:1186-1203`). |
| **Trigger** | State may show `GATE_8` when using legacy mappings; treat like closure: **Phase 1** doc team → **`./pipeline_run.sh phase2`** → **Phase 2** Team 90 (`advice` field, same block). |
| **Phases** | Two-phase: **Phase 1** = Team 70 (TikTrack) or Team 170 (AOS) per roster note in code comments; **Phase 2** = Team 90. `phase8_content` / phase advance logic may apply (`pipeline_run.sh:1424-1434` for `GATE_8` phase2). |
| **Who runs** | Doc team (70/170) then Team 90 (`getEffectiveVerdictTeam` — `pipeline-dashboard.js:1423-1428`; `ALL_GATE_DEFS['GATE_8'].verdictTeam`). |
| **Inputs** | WP artifacts; mandate `gate_8_mandates.md` domain path (`GATE_MANDATE_FILES_BASE` — `pipeline-config.js:237`). |
| **Outputs** | `TEAM_70_*_AS_MADE_REPORT_*.md` / Team 170 equivalents; `TEAM_90_*_GATE_8_*` verdict candidates (`pipeline-dashboard.js:759-768`). |
| **PASS** | Team 90 closure PASS; operator precision `pass`. |
| **Common failures** | Wrong save path for verdict (`writes_to`); incomplete AS_MADE. |
| **`route_recommendation` → doc** | `./pipeline_run.sh route doc GATE_8` — Team 70/170 corrects docs/archive → re-validate (`pipeline-dashboard.js:1200-1201`). |
| **`route_recommendation` → full** | `./pipeline_run.sh route full GATE_8` — full AS_MADE + archive redo (`pipeline-dashboard.js:1201-1202`). |

---

## §4 — Iron Rules (pipeline layer)

⛔ **IRON RULE:** Agents **never** run `./pipeline_run.sh` — only operators. See `_hitl_prohibition_block()` at `pipeline.py:64-81`.

⛔ **IRON RULE:** **SSOT** — `ssot_check` must be consistent before declaring PASS at critical transitions; WSM `STAGE_PARALLEL_TRACKS` drift was a recurring canary failure (FIX-101-02 addresses automation).

⛔ **IRON RULE:** **KB-84 precision identifiers** — state-mutating commands require `--wp` + `--gate` matching live state; `--phase` when `current_phase` is set (`_kb84_guard`, `pipeline_run.sh:432-549`).

⛔ **IRON RULE:** `PIPELINE_RELAXED_KB84=1` bypass is PERMITTED ONLY for CI runners and legacy migration scripts where full `--wp`/`--gate`/`--phase` context is unavailable at call time. It is FORBIDDEN for human operators and in any agent prompt or mandate. Using it in a manual pipeline run bypasses the identity guard, voids SSOT traceability, and constitutes a protocol violation. (`_kb84_guard` — `pipeline_run.sh:432-549`; relaxed branch `PIPELINE_RELAXED_KB84` ~`460-466`.)

⛔ **IRON RULE:** **`writes_to` on every `MandateStep`** — prevents wrong save paths (DEV-GATE5-002); see `MandateStep` fields `pipeline.py:527-567`.

⛔ **IRON RULE:** **Canonical filenames** — `TEAM_{NN}_{WP_SNAKE}_{PURPOSE}_v{VERSION}.md` under `_COMMUNICATION/team_{NN}/` (see `CanonicalPathBuilder.parse` in `_read_coordination_file`, `pipeline.py:582-588`).

⛔ **IRON RULE:** **Single active verdict team in UI** — use `getEffectiveVerdictTeam` only (`pipeline-dashboard.js:1382-1385` comment block).

⛔ **IRON RULE:** **No pytest corruption of live state** — `agents_os_v2/tests/conftest.py` session guard restores `DOMAIN_STATE_FILES` (`conftest.py:30-79`).

⛔ **IRON RULE:** **Cross-engine validation** — Team 190/90 outputs must match detectable verdict patterns (`extractVerdictStatus`, `pipeline-dashboard.js:1909-1945`).

---

## §5 — Team Roster (pipeline roles)

| Team | Engine (typical) | Gates / phases | Output pattern |
|------|------------------|----------------|----------------|
| 10 | Cursor | TikTrack gateway, G3_PLAN, GATE_3.1 | `TEAM_10_{WP}_G3_PLAN_WORK_PLAN_v*.md` |
| 11 | Cursor | AOS gateway | `_COMMUNICATION/team_11/` |
| 20 / 30 | Cursor | TT implementation | `TEAM_{20|30}_{WP}_*_v*.md` |
| 50 / 51 | Cursor | QA | `TEAM_{50|51}_{WP}_QA_REPORT_v*.md` |
| 61 | Cursor/Cloud | AOS implementation | `TEAM_61_*` |
| 70 | Docs | TikTrack GATE_5.1 | `TEAM_70_*` |
| 90 | Codex | Validation gates | `TEAM_90_*_VERDICT_v*.md` |
| 100 | Claude | Architecture | `TEAM_100_*` |
| 101 / 102 | Claude | Domain architect | `TEAM_101_*` / `TEAM_102_*` |
| 170 | Codex | Spec + AOS GATE_5.1 | `TEAM_170_*_LLD400_*.md` |
| 190 | Codex | Constitutional | `TEAM_190_*_GATE_*_VALIDATION_*.md` |

**BOOSTER_TEAM_DATA** in `pipeline-config.js` (from line 259) lists `writesTo` folders and ISO rules per team.

---

## References (file:line)

| Topic | Anchor |
|-------|--------|
| `GATE_SEQUENCE` | `agents_os_v2/orchestrator/pipeline.py:54` |
| HITL block | `agents_os_v2/orchestrator/pipeline.py:64-81` |
| `MandateStep` | `agents_os_v2/orchestrator/pipeline.py:527-567` |
| `_generate_mandate_doc` | `agents_os_v2/orchestrator/pipeline.py:669` |
| `PipelineState` | `agents_os_v2/orchestrator/state.py:25-58` |
| `_kb84_guard` | `pipeline_run.sh:432-549` |
| `PIPELINE_RELAXED_KB84` (relaxed branch) | `pipeline_run.sh:460-466` |
| `case` main | `pipeline_run.sh:610` |
| `phase*)` + FIX-101-07 | `pipeline_run.sh:1393-1422` |
| `ALL_GATE_DEFS` | `agents_os/ui/js/pipeline-dashboard.js:936` |
| `getEffectiveVerdictTeam` | `agents_os/ui/js/pipeline-dashboard.js:1387-1424` |
| `_parseMandateSections` | `agents_os/ui/js/pipeline-dashboard.js:711` |
| `extractVerdictStatus` | `agents_os/ui/js/pipeline-dashboard.js:1909` |
| `GATE_CONFIG` / `getGateMandatePath` | `agents_os/ui/js/pipeline-config.js:203-247` |
| `getExpectedFiles` | `agents_os/ui/js/pipeline-config.js:322` |
| Prereq pass-only | `agents_os/ui/js/pipeline-commands.js:126-131` |
| State file guard | `agents_os_v2/tests/conftest.py:30` |

---

**log_entry | TEAM_170 | AOS_PIPELINE_ARCHITECTURE_REFERENCE | v1.0.2 | BN1_RELAXED_KB84_IRON_RULE | 2026-03-23**
