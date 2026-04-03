---
id: ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0
from: Team 00 (System Designer — Nimrod) + Team 100 (Chief System Architect)
date: 2026-03-19
historical_record: true
status: LOCKED — Iron Rule
supersedes: All prior gate sequence definitions (GATE_SEQUENCE in pipeline.py, IDEA-039, all organic naming)
authority: Team 00 constitutional authority + Nimrod approval
---

# Architectural Directive — Canonical Gate Sequence (Process Model v2.0)

## §1 — The 5-Gate Spine

The system operates on exactly **5 top-level gates**. Each gate represents a distinct lifecycle phase.
All pipeline state, WSM references, prompt generation, and routing must use these gate IDs exclusively.

| Gate ID | Name | Exit Criterion | Gate-Close Authority |
|---|---|---|---|
| GATE_1 | NEEDS_AND_PLANNING | LOD200 approved + registered in Program Registry | Team 00 (Nimrod) |
| GATE_2 | SPECIFICATION | LLD400 + Work Plan + Architectural review approved | Team 100 PASS |
| GATE_3 | IMPLEMENTATION | Team 50 full E2E PASS | Team 10 (submits QA package) |
| GATE_4 | VALIDATION | Human UX approval | Team 00 (Nimrod) |
| GATE_5 | DOCUMENTATION | AS_MADE_LOCK | Team 90 |

---

## §2 — Gate Phase Detail

### GATE_1: NEEDS_AND_PLANNING

**Scope:** Idea capture through LOD200 approval. LOD200 creation itself is semi-manual (Nimrod + architectural agent directly); all other processes are pipeline-managed.

**Pipeline-managed deliverables (in scope for S003-P011):**
- Idea registration and management (UI + data)
- Program registration procedure + scripts
- Lifecycle status management UI (create / start / stop / cancel / restart)

**Phases:**

| Phase | Actor | Output |
|---|---|---|
| 1.1 | Nimrod + Team 100/110/111 | LOD200 document (semi-manual) |
| 1.2 | Pipeline | Program registered in PHOENIX_PROGRAM_REGISTRY |

**Exit:** LOD200 exists + registered.

---

### GATE_2: SPECIFICATION

**Scope:** From approved LOD200 to architectural sign-off on both spec and implementation plan.

**Dual-validation model** — mirrors GATE_4 structure:

| Phase | Actor | Validates | Output |
|---|---|---|---|
| 2.1 | Team 170 | — | LLD400 produced |
| 2.1v | Team 190 | LLD400 quality + buildability | LLD400 LOCKED |
| 2.2 | Team 10 | — | Work Plan produced |
| 2.2v | Team 90 | Work Plan quality + feasibility | Work Plan APPROVED |
| 2.3 | Team 100 | Phase 2.1 + Phase 2.2 combined | Architectural PASS / FCP return |

**Phase 2.3 FCP routing** (Team 100 applies FCP on rejection):

| FCP Level | Finding Type | Return Path |
|---|---|---|
| FCP-1 | PWA / canonical deviation / doc / wording | → Team 10 (direct fix, no QA) → re-validate Phase 2.3 |
| FCP-2 | Work plan issue (bounded) | → Team 10 (targeted fix) → re-validate Phase 2.3 |
| FCP-2 | Spec issue (bounded) | → Team 170 (targeted fix) → re-validate from Phase 2.1v |
| FCP-3 | Full spec failure | → Team 170 (full LLD400 rewrite) → restart Phase 2.1 |

**Gate-close:** Team 100 PASS → GATE_2 closed.

---

### GATE_3: IMPLEMENTATION

**Scope:** From mandate creation through full E2E QA pass. Team 10 is the sole coordinator and gateway.

**Team 10 PWA Authority** (Iron Rule — applies during GATE_3 + on returns from GATE_4):
Team 10 is authorized to close the following fix types **directly**, without activating any other team:
- Canonical naming corrections
- Documentation / comment fixes
- Header and metadata corrections
- Minor wording changes in UI strings
- Canonical deviation fixes (PWA-class)

**PWA Scope Boundary (Option Beta — locked):**
```
PERMITTED:   ≤ 2 files modified AND ≤ 50 lines changed
             AND no schema change (DDL)
             AND no API contract change (endpoint / response shape)
             AND no business logic change
NOT PERMITTED: anything outside these bounds → escalates to FCP-2 minimum
```

**Phases:**

| Phase | Actor | Output |
|---|---|---|
| 3.1 | Team 10 | Mandates for implementing teams |
| 3.2 | Implementing teams (domain-dependent — see §4) | Code / UI / config |
| 3.3 | Team 50/51 ↔ implementing teams | QA ping-pong until E2E PASS |

**GATE_3 exit:** Team 50/51 full E2E PASS. Team 10 submits QA package.

---

### GATE_4: VALIDATION

**Scope:** Multi-layer validation post-implementation. All three phases must pass.

| Phase | Actor | Validates |
|---|---|---|
| 4.1 | Team 90 | Technical correctness (dev validation) |
| 4.2 | Team 100 | Architectural alignment (spec vs. implementation) |
| 4.3 | Team 00 (Nimrod) | Human UX + final authority |

**FCP routing on rejection from Phase 4.1 or 4.2:**

| FCP Level | Finding Type | Return Path |
|---|---|---|
| FCP-1 | PWA / canonical / doc / wording | → Team 10 (direct fix) → re-validate from rejecting phase |
| FCP-2 | Bounded code fix (single team) | → Specialist team directly (skip Team 10) → targeted QA → re-validate from rejecting phase |
| FCP-3 | Multi-team / architectural / scope | → Team 10 (full mandate regeneration) → GATE_3 full restart |

**Dashboard mode (Phase 4.3):**
Nimrod receives:
1. All findings with auto-classified FCP levels (based on `finding_type` ENUM)
2. Context per finding (scope, impact)
3. Option to confirm or override classification
Only after Nimrod confirms → pipeline routes accordingly.

**Gate-close:** Team 00 PASS → GATE_4 closed.

---

### GATE_5: DOCUMENTATION

**Scope:** Documentation closure and AS_MADE lock.

| Phase | Actor | Output |
|---|---|---|
| 5.1 | Team 70 | Documentation closure package |
| 5.2 | Team 90 | Closure validation |

**Gate-close:** Team 90 AS_MADE_LOCK → GATE_5 closed → Lifecycle Closed.

---

## §3 — Finding Classification Protocol (FCP)

**Iron Rule: the FCP governs ALL validation actions across ALL gates.**

Every rejection at any phase must carry a `finding_type` field:

```
finding_type ENUM:
  PWA                → FCP-1 (automatic)
  doc                → FCP-1 (automatic)
  wording            → FCP-1 (automatic)
  canonical_deviation → FCP-1 (automatic)
  code_fix_single    → FCP-2 (automatic — route to owning team)
  code_fix_multi     → FCP-3 (automatic)
  architectural      → FCP-3 (automatic)
  scope_change       → FCP-3 (automatic)
  unclear            → human must classify in dashboard (dashboard required)
```

The pipeline auto-routes based on `finding_type`. `unclear` findings are blocked until Nimrod classifies via Dashboard.

---

## §4 — Domain Process Variants

Three named variants. Domain determines the **default** variant; operator may override via Dashboard.

### TRACK_FULL — Full Track (מסלול מלא) — default for TikTrack

Full team roster. Team 10 coordinates; specialist teams implement by layer.

GATE_3 Phase 3.2 implementing teams:
```
Team 10 (coordinator/gateway) + Team 20 (backend) + Team 30 (frontend)
+ Team 40 (UI assets, if applicable) + Team 60 (devops, if applicable)
Team 50: QA
```

### TRACK_FOCUSED — Focused Track (מסלול מרוכז) — default for Agents_OS

Condensed roster. Team 11 (AOS Gateway) plans; Team 61 (single implementor) executes all layers.

GATE_3 Phase 3.2 implementing team:
```
Team 11 (AOS Gateway — Phase 2.2 work plan + Phase 3.1 mandate generation)
Team 61 (implementor — all AOS development, Phase 3.2, full-stack)
Team 51: QA (AOS-specific)
```

**TRACK_FOCUSED is the default for all Agents_OS work packages.**

### TRACK_FAST — Fast Track (מסלול מהיר) — future

**Status: DEFINED (2026-03-19) — not yet implemented**

A single team handles the complete implementation chain with no separate gateway:
**Phase 2.2 (Work Plan) + Phase 3.1 (Mandates) + Phase 3.2 (Implementation) + Phase 3.3 coordination**

| Variant | Domain Default | Gateway | Implementor | QA |
|---|---|---|---|---|
| **TRACK_FULL** | TikTrack | Team 10 | Teams 20 / 30 / 40 / 60 | Team 50 |
| **TRACK_FOCUSED** | Agents_OS | Team 11 | Team 61 | Team 51 |
| **TRACK_FAST** | (operator-selected) | — (single team) | Team 10 (TT) or Team 61 (AOS) | 50 / 51 |

In TRACK_FULL: Team 10 coordinates; work is distributed across specialist teams by layer.
In TRACK_FOCUSED: Team 11 (AOS Gateway) generates work plan + mandates; Team 61 implements all.
In TRACK_FAST: Single team generates own work plan + self-brief + implements (no separate gateway). Team 10 for TikTrack; Team 61 for AOS.

`process_variant` field: `TRACK_FULL | TRACK_FOCUSED | TRACK_FAST`. Domain sets default.

**Reconciliation with prior naming:**
- Legacy `STANDARD_TT` → `TRACK_FULL`
- Legacy `STANDARD_AOS` / `AOS_COMPACT` → `TRACK_FOCUSED`
- Legacy `FAST_TT` / `FAST_AOS` / `track_mode: FAST` → `TRACK_FAST`
Migration: translate on read; write canonical names going forward.

---

## §5 — Uniform Dual-Validation Pattern

**Iron Rule: every gate must have Producer → Validator (different engine). Gate closes by different authority than validator.**

```
┌──────────────────────────────────────────────────────────────┐
│  UNIFORM DUAL-VALIDATION PATTERN                            │
│                                                              │
│  Phase N.a: Producer (Engine A)  → artifact                 │
│  Phase N.b: Validator (Engine B) ≠ Engine A                 │
│  Gate-close: Authority (Engine C) ≠ Engine B                │
└──────────────────────────────────────────────────────────────┘
```

Cross-engine mapping per gate:
```
GATE_2: Gemini/Cursor (170/10) → OpenAI (190/90) → Claude Code (100)
GATE_3: Cursor (20/30/40/60/61) → Gemini/Cursor (50/51) → [Team 10 internal close]
GATE_4: OpenAI (90) → Claude Code (100) → Human (00)
GATE_5: Cursor (70/170) → OpenAI (90) → [auto-close]
         (70 = TikTrack Phase 5.1; 170 = AOS Phase 5.1 — spec owner closes the spec)
```

---

## §6 — Engine Assignment Model

**Iron Rule: engine assignments are RECOMMENDATIONS, not locks.**

Future state: engine-per-team assignments managed in a data file with Dashboard UI for operator override.
Implications:
1. `pipeline.py` GATE_META dict must be refactored to load from `team_engine_config.json`
2. Dashboard must expose team→engine assignment as an editable field
3. Per-task engine override must be possible via CLI (`--team-engine team_10=claude`)
4. This is a required deliverable in S003-P011 scope.

---

## §7 — State Machine Requirements

The following `pipeline_state` fields are required by this model:

| Field | Type | Purpose |
|---|---|---|
| `current_gate` | str (GATE_1..GATE_5) | Top-level gate only. Never sub-phase. |
| `current_phase` | str (e.g. "2.1", "3.2") | Phase within the gate. Separate from gate ID. |
| `process_variant` | enum (TRACK_FULL / TRACK_FOCUSED / TRACK_FAST) | Determines gateway+team routing. Default: TRACK_FULL for TikTrack, TRACK_FOCUSED for AOS |
| `lod200_author_team` | str (team_100 / team_110 / team_111; legacy `team_101` / `team_102` read-only) | Default reviewer for GATE_2.3 + GATE_4.2. Set at GATE_1 close. |
| `fcp_level` | enum (FCP-1 / FCP-2 / FCP-3 / PENDING_HUMAN) | Active FCP classification |
| `finding_type` | str | The `finding_type` ENUM value from rejecting team |
| `return_target_team` | str | Team receiving FCP return (set by routing logic) |

**Gate ID naming is strictly GATE_N (integer).** No sub-phases in gate IDs.
All internal phase tracking uses `current_phase` field only.

---

## §8 — Migration from Current Code

Current pipeline.py `GATE_SEQUENCE`:
```python
["GATE_0", "GATE_1", "GATE_2", "WAITING_GATE2_APPROVAL",
 "G3_PLAN", "G3_5", "G3_6_MANDATES", "CURSOR_IMPLEMENTATION",
 "GATE_4", "GATE_5", "GATE_6", "GATE_7", "GATE_8"]
```

Required migration (S003-P011-WP001 scope):

| Old ID | New ID | Type |
|---|---|---|
| GATE_0 | GATE_1 (phase 1.2) | Rename + renumber |
| GATE_1 | GATE_2 (phase 2.1v) | Rename + renumber |
| GATE_2 | GATE_2 (phase 2.3) | Merge + rename |
| WAITING_GATE2_APPROVAL | REMOVED → gate_state="HUMAN_PENDING" | Remove |
| G3_PLAN | GATE_3 (current_phase="3.1" mandate generation) | Demote to phase field |
| G3_5 | GATE_3 (current_phase="2.2v") | Demote to phase field |
| G3_6_MANDATES | GATE_3 (current_phase="3.1") | Demote to phase field |
| CURSOR_IMPLEMENTATION | GATE_3 (current_phase="3.2") | Demote to phase field |
| GATE_4 | GATE_3 (current_phase="3.3") | Demote + renumber |
| GATE_5 | GATE_4 (current_phase="4.1") | Renumber |
| GATE_6 | GATE_4 (current_phase="4.2") | Renumber |
| GATE_7 | GATE_4 (current_phase="4.3") | Renumber |
| GATE_8 | GATE_5 | Renumber |

**CRITICAL:** Active WPs (S003-P003-WP001 at G3_PLAN = GATE_3 phase 3.1) must be migrated without data loss. Migration script required.

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | GATE_SEQUENCE_CANON_v1.0.0 | LOCKED | 5-GATE MODEL + FCP + DUAL-VALIDATION + DOMAIN-VARIANTS | 2026-03-19**
**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | GATE_SEQUENCE_CANON_v1.0.0 | AMENDMENT | TEAM_11_AOS_GATEWAY | TEAM_10_TT_ONLY | TEAM_170_AOS_GATE5 | 2026-03-19**
**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | GATE_SEQUENCE_CANON_v1.0.0 | AMENDMENT | VARIANT_RENAME | STANDARD_TT→TRACK_FULL | STANDARD_AOS→TRACK_FOCUSED | FAST_TT/FAST_AOS→TRACK_FAST | process_variant_enum_updated | 2026-03-19**
**log_entry | TEAM_100 | ARCHITECT_DIRECTIVE | GATE_SEQUENCE_CANON_v1.0.0 | DIRECT_EDIT_APPROVED_BY_TEAM_00 | §8_G3_PLAN_MIGRATION_FIX | current_phase_2.2→3.1 | INTERNAL_INCONSISTENCY_RESOLVED | TABLE_NOW_CONSISTENT_WITH_CRITICAL_NOTE | 2026-03-19**
