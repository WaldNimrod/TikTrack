---
id: TEAM_100_TO_TEAM_101_S003_P011_WP002_GATE_2_PHASE_2.1_MANDATE_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect)
to: Team 101 (AOS Domain Architect)
date: 2026-03-20
gate: GATE_2
phase: "2.1"
wp: S003-P011-WP002
domain: agents_os
track: TRACK_FOCUSED
type: MANDATE
lod200_ref: _COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1.md
output_file: _COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.0.md---

▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
GATE_2 | PHASE 2.1 | LLD400 PRODUCTION
TEAM: 101 — AOS Domain Architect
WP: S003-P011-WP002 — Pipeline Stabilization & Hardening
ENGINE: OpenAI / Codex API
▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

---

## 0 — Your Role in This Gate

You are **Team 101 — AOS Domain Architect**. Your engine is OpenAI / Codex API.

At GATE_2 Phase 2.1, the **lod200_author_team** (you — Team 101) produces the LLD400 (Level of Design 400): the full technical implementation specification. This is NOT a summary of the LOD200. It is the implementation contract that tells Team 61 (implementers) exactly what to build, function by function, field by field, file by file.

**You are the single author** of this LLD400. After you complete it:
- Phase 2.1v: Team 190 validates it (constitutional review)
- Phase 2.2: Team 11 produces a work plan from it
- Phase 2.3: Team 100 gives architectural sign-off
- GATE_3: Team 61 implements exactly what this LLD400 specifies

**Your LLD400 is the ground truth for implementation.** If something is ambiguous in your LLD400, Team 61 will implement it incorrectly. Precision is your primary obligation.

---

## 1 — Context: What This WP Is Fixing

**Read this section fully before writing anything.**

### 1.1 The Problem

`agents_os_v2/orchestrator/pipeline.py` currently implements a broken hybrid of two gate models simultaneously:

```python
# NEW (correct):
GATE_SEQUENCE = ["GATE_1", "GATE_2", "GATE_3", "GATE_4", "GATE_5"]

# OLD (still present as live routing targets — WRONG):
GATE_CONFIG.update({
    "GATE_0", "WAITING_GATE2_APPROVAL", "G3_PLAN", "G3_5",
    "G3_6_MANDATES", "G3_REMEDIATION", "CURSOR_IMPLEMENTATION",
    "GATE_6", "GATE_7", "GATE_8", ...
})
```

Additionally:
- `GATE_ALIASES` maps old IDs to themselves (identity — useless, KB-39)
- `FAIL_ROUTING` uses old gate IDs as targets (GATE_4→CURSOR_IMPLEMENTATION, etc.) — KB-32
- `_resolve_phase_owner()` incomplete — no entry for Phase 2.1, no GATE_4 or GATE_5 entries
- `PipelineState` is a dataclass — must migrate to Pydantic `BaseModel`
- `_run_migration()` exists but is NOT called on `PipelineState.load()` — KB-33
- GATE_5 Phase 5.1 prompt generator produces wrong content ("Dev Validation / Team 90") — KB-34
- Active TikTrack WP stuck at `G3_6_MANDATES` (old gate ID) — needs auto-migration
- No Pipeline Certification Suite — no end-to-end tests — KB-38
- Dashboard mandate panel reads `G3_6_MANDATES` (old key) — KB-35
- `pass` command has no gate identifier enforcement — KB-36
- `flags.waiting_human_approval` checks old gate IDs — KB-37

### 1.2 LOD200 Reference (MANDATORY READ)

**Before writing your LLD400, read in full:**
```
_COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1.md
```

Key sections you must internalize:
- §2.1: Single canonical gate sequence
- §2.2: Per-gate, per-phase generator architecture (function signatures)
- §2.3: `_DOMAIN_PHASE_ROUTING` complete nested dict (exact schema)
- §2.4: `fail` command requirements
- §2.5: `pass` command requirements
- §2.6: `CORRECTION_CYCLE_BANNER` format
- §2.7: State migration table (with CORRECTED G3_PLAN→GATE_2/2.2 mapping)
- §2.8: FAIL_ROUTING rewrite (5-gate targets)
- §2.9: Pipeline Certification Suite (Tier-1 + Tier-2)
- §2.10: Dashboard alignment
- §4: All 12 deliverables (D-01..D-12)
- §10: Canonical file naming schema (field name `wp_id`, not `domain`)

### 1.3 Active State of the Repository

Before writing, read these files to understand current state:
```
agents_os_v2/orchestrator/pipeline.py         ← what exists (broken hybrid)
agents_os_v2/orchestrator/state.py            ← PipelineState dataclass (to migrate to Pydantic)
agents_os_v2/orchestrator/migrate_state.py    ← migration logic (exists; not called on load)
_COMMUNICATION/agents_os/pipeline_state_agentsos.json  ← AOS domain state (GATE_2/2.1)
_COMMUNICATION/agents_os/pipeline_state_tiktrack.json  ← TikTrack state (G3_6_MANDATES — stranded)
agents_os_v2/config.py                        ← DOMAIN_DOC_TEAM, DOMAIN_DEFAULT_VARIANT, etc.
agents_os_v2/tests/                           ← existing test suite (127 tests currently collected)
agents_os_v2/ui/js/                           ← dashboard JS files (9 files)
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md  ← canonical gate model
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_SINGLE_SOURCE_OF_TRUTH_v1.0.0.md  ← SSOT iron rule
```

---

## 2 — Your Mandate: What the LLD400 Must Contain

Your LLD400 must specify ALL of the following, with implementation-ready precision. "Implementation-ready" means: Team 61 can implement from your LLD400 without asking any questions.

---

### LLD400 §1 — PipelineState: Pydantic Migration (D-02)

Specify the complete `PipelineState` Pydantic model. Include:

**1.1** Full class definition:
```python
from pydantic import BaseModel, Field, model_validator
from typing import Optional, List

class PipelineState(BaseModel):
    # Every field with: name, type annotation, default value, Field description
    # Include ALL fields that currently exist in the dataclass + any new fields needed
```

**1.2** `_run_migration()` as a `@model_validator(mode="after")`:
- Must check `self.current_gate` against the complete migration table from LOD200 §2.7
- Must apply CORRECTED mapping: `G3_PLAN → GATE_2 / "2.2"` (not GATE_3/3.1)
- Must log migration event to stdout AND event file
- Must call `self.save()` after migration

**1.3** `load(domain: str) -> "PipelineState"` classmethod:
- Reads from correct state file based on domain
- Pydantic model_validate() from JSON
- Migration runs automatically via @model_validator

**1.4** `save()` instance method:
- Serializes to JSON (use `.model_dump()`)
- Atomic write pattern (write to temp, rename)

**1.5** Field inventory from current dataclass that MUST be preserved (check `state.py` for exact field names — do not invent or rename):
- All existing fields, same names, migrated to Pydantic field declarations
- `lod200_author_team: str = "team_100"` — important, used for GATE_2/2.3 and GATE_4/4.2 routing

---

### LLD400 §2 — `_DOMAIN_PHASE_ROUTING`: Complete Implementation (D-01)

Specify the exact Python dict literal, ready to paste into pipeline.py:

```python
_DOMAIN_PHASE_ROUTING: dict[str, dict[str, dict[str, str | list[str]]]] = {
    "GATE_1": { ... },
    "GATE_2": { ... },
    "GATE_3": { ... },
    "GATE_4": { ... },
    "GATE_5": { ... },
}
```

Rules:
- Every gate, every phase, both variants (`TRACK_FULL` and `TRACK_FOCUSED`) must be present
- Sentinel `"lod200_author_team"` for Phase 2.1, 2.3, 4.2 — resolves at runtime via `state.lod200_author_team`
- `"team_00"` for human gates (4.3, 1.1) — `gate_state="HUMAN_PENDING"` set on entry
- `"pipeline"` for auto-actions (1.2)
- GATE_3 Phase 3.2 TRACK_FULL: list of teams `["team_20", "team_30", "team_40"]`
- Reference LOD200 §2.3 for the exact routing table

Specify `_resolve_phase_owner(state, gate, phase)` complete function:
```python
def _resolve_phase_owner(state: PipelineState, gate: str, phase: str) -> str | list[str]:
    """Resolve team owner for gate+phase from _DOMAIN_PHASE_ROUTING.
    Handles 'lod200_author_team' sentinel.
    Raises KeyError if gate/phase not found (never silently fall through).
    """
```

---

### LLD400 §3 — Gate Prompt Generator Architecture (D-01)

Specify the function signature and pseudocode for each of the 5 generators.

For each gate, specify:
1. **Function signature** — `_generate_gate{N}_prompt(state: PipelineState) -> str`
2. **Correction-cycle check** — exact condition + banner injection
3. **Phase dispatch** — how it routes to sub-generators based on `state.current_phase`
4. **Sub-generator stubs** — one function per phase: `_generate_gate{N}_phase_{X}_{Y}_prompt(state)`
5. **Domain-specific context** — what domain-specific content each generator injects
6. **Prompt structure** — what sections the generated prompt must contain

**Minimum sub-generators required:**

| Generator | Phases | Key content |
|---|---|---|
| `_generate_gate1_prompt()` | 1.1, 1.2 | LOD200 reference, registration instructions |
| `_generate_gate2_prompt()` | 2.1, 2.1v, 2.2, 2.2v, 2.3 | Per-phase team ID, task description, output path |
| `_generate_gate3_prompt()` | 3.1, 3.2, 3.3 | Mandate/impl/QA instructions; TRACK_FULL handles team list |
| `_generate_gate4_prompt()` | 4.1, 4.2, 4.3 | Dev validation; arch review from lod200_author_team; human PENDING |
| `_generate_gate5_prompt()` | 5.1, 5.2 | AS_MADE doc closure (team_170 AOS / team_70 TT); lock validation |

**For each sub-generator, specify:**
- What team ID it addresses (resolved from `_DOMAIN_PHASE_ROUTING`)
- What output file the team must produce (canonical naming per §10)
- What the prompt body must contain (task + context + AC + output format)
- Whether it sets `gate_state = "HUMAN_PENDING"` (phases 1.1-if-human, 4.3)

---

### LLD400 §4 — `CORRECTION_CYCLE_BANNER` Constant (D-01)

Specify the exact string constant:
```python
CORRECTION_CYCLE_BANNER: str = """
═══════════...
🔴 CORRECTION CYCLE #{cycle} — {gate}
...
"""
```

And the exact injection pattern at the top of every `_generate_gateN_prompt()`:
```python
def _generate_gate{N}_prompt(state: PipelineState) -> str:
    prompt = ""
    if state.last_blocking_gate == f"GATE_{N}" and state.remediation_cycle_count > 0:
        prompt += CORRECTION_CYCLE_BANNER.format(...)
    # then phase dispatch
```

---

### LLD400 §5 — `GATE_ALIASES` Dict (D-01)

Specify the complete dict literal — maps old gate IDs to new canonical IDs:
```python
GATE_ALIASES: dict[str, str] = {
    "GATE_0": "GATE_1",
    "WAITING_GATE2_APPROVAL": "GATE_2",
    ...  # complete — all entries from LOD200 §2.7 migration table
}
```

This replaces the identity-mapping alias dict currently in pipeline.py (KB-39).

---

### LLD400 §6 — `FAIL_ROUTING` Dict Rewrite (D-01)

Specify the complete `FAIL_ROUTING` dict using only new 5-gate IDs as targets:
```python
FAIL_ROUTING: dict[str, dict[str, tuple[str, str]]] = {
    "GATE_1": { ... },
    "GATE_2": { ... },
    "GATE_3": { ... },
    "GATE_4": { ... },
    "GATE_5": { ... },
}
```

Reference: LOD200 §2.8 for the exact table. All targets must be in `["GATE_1","GATE_2","GATE_3","GATE_4","GATE_5"]`. No old gate IDs.

---

### LLD400 §7 — `fail` and `pass` Command Handlers (D-01 + D-06)

**`fail` handler — specify:**
- CLI argument parsing: `fail <reason> [--finding-type TYPE] [--fcp-level LEVEL]`
- Step-by-step pseudocode for all state writes (per LOD200 §2.4)
- FCP ENUM validation (list all valid values from GATE_SEQUENCE_CANON §3)
- Save-before-routing pattern

**`pass` handler — specify:**
- CLI argument parsing: `pass [GATE_ID]` (GATE_ID optional)
- Gate mismatch check: `if GATE_ID and GATE_ID != state.current_gate → abort`
- Correction-cycle warning prompt (interactive `[y/n]`)
- State advance logic (next gate from GATE_SEQUENCE, reset current_phase to first phase of next gate)
- Event log entry format

**`pipeline_run.sh` update (D-06):**
- Specify the bash argument parsing change for `pass [GATE_ID]`
- Show exact `if [ -n "$GATE_ID" ] && [ "$GATE_ID" != "$CURRENT_GATE" ]` logic

---

### LLD400 §8 — GATE_MANDATE_FILES Update (D-01 + D-04)

Specify the updated dict:
```python
GATE_MANDATE_FILES: dict[str, str] = {
    "GATE_1": "GATE_1_mandates.md",
    "GATE_3": "GATE_3_mandates.md",   # replaces G3_6_MANDATES
    "GATE_5": "gate_5_mandates.md",   # replaces GATE_8
}
```

And the updated mandate panel logic in the dashboard JS:
- Old: `if (gate === 'G3_6_MANDATES')`
- New: `if (gate === 'GATE_3' && phase === '3.1')`
- Specify which JS file(s) in `agents_os_v2/ui/js/` contain this logic (read the JS files to find it)

---

### LLD400 §9 — Dashboard `flags.waiting_human_approval` Fix (D-04)

In `pipeline.py` `_write_state_view()`:
- Old: `state.current_gate in ("WAITING_GATE2_APPROVAL", "GATE_7")`
- New: `state.gate_state == "HUMAN_PENDING"`

Specify:
- The exact line in `_write_state_view()` to change
- Any corresponding JS dashboard code that reads this flag

---

### LLD400 §10 — Pipeline Certification Suite Structure (D-03)

Specify the test file structure for `agents_os_v2/tests/test_certification.py`:

**10.1** Fixture definitions:
```python
@pytest.fixture
def aos_track_focused_state() -> PipelineState:
    """Minimal AOS TRACK_FOCUSED state at GATE_2/2.1"""
    return PipelineState(
        work_package_id="TEST-WP",
        project_domain="agents_os",
        process_variant="TRACK_FOCUSED",
        current_gate="GATE_2",
        current_phase="2.1",
        lod200_author_team="team_101",
        ...
    )

@pytest.fixture
def tiktrack_track_full_state() -> PipelineState:
    """Minimal TikTrack TRACK_FULL state"""
    ...

@pytest.fixture
def correction_cycle_state(aos_track_focused_state) -> PipelineState:
    """State with active correction cycle"""
    s = aos_track_focused_state.copy()
    s.remediation_cycle_count = 2
    s.last_blocking_gate = "GATE_3"
    s.last_blocking_findings = "Test finding"
    return s

@pytest.fixture
def old_gate_state() -> PipelineState:
    """State file with old gate ID for migration test"""
    # CERT_13: G3_6_MANDATES
    # CERT_14: G3_PLAN
```

**10.2** For each CERT_01..CERT_15, specify:
- Test function name
- Which fixture(s) it uses
- What assertion(s) it makes
- What it calls to generate output (e.g., `_generate_gate3_prompt(state)`)

**10.3** Specify whether CERT_11 (`fail` command) and CERT_12 (`pass` with gate identifier) test the CLI handlers directly or via subprocess.

---

### LLD400 §11 — Team 90 Verdict Template (D-05)

Specify the complete markdown template that Team 90 must produce at GATE_4 Phase 4.1:

```markdown
## Team 90 Validation Verdict — GATE_4 Phase 4.1
**WP:** {wp_id}
**Date:** {date}

### Verdict
\```json
{
  "verdict": "PASS" | "BLOCK_FOR_FIX",
  "finding_type": null | "PWA" | "doc" | "FCP-1" | "FCP-2" | "FCP-3",
  "fcp_level": null | "FCP-1" | "FCP-2" | "FCP-3",
  "route_recommendation": null | "GATE_3" | "GATE_4"   // BLOCK_FOR_FIX only
}
\```
```

Rules (per LOD200 D-05 + Team 100 M-02 resolution):
- `route_recommendation`: present only when `verdict == BLOCK_FOR_FIX`
- `route_recommendation` absent on PASS
- `finding_type` must be a valid FCP ENUM value or null

---

### LLD400 §12 — CanonicalPathBuilder Class (D-09)

Specify the complete class interface:

```python
# agents_os_v2/utils/path_builder.py

class CanonicalPathBuilder:
    """Build and parse canonical file paths per ARCHITECT_DIRECTIVE_CANONICAL_FILE_NAMING_v1.0.0"""

    @staticmethod
    def build(
        sender: str,            # e.g. "101", "90"
        wp_id: str,             # e.g. "S003_P011_WP002"
        gate: str,              # e.g. "GATE_2"
        doc_type: str,          # TYPE ENUM: "LLD400", "VERDICT", "MANDATE", etc.
        version: str,           # e.g. "v1.0.0"
        recipient: str | None = None,   # e.g. "61"
        phase: str | None = None,       # e.g. "3.1"
    ) -> str:
        """Return canonical filename (not full path). Example:
        TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.0.md
        """

    @staticmethod
    def parse(filename: str) -> dict:
        """Parse canonical filename into field dict.
        Returns: {sender, recipient (or None), wp_id, gate, phase (or None), type, version}
        Raises ValueError if filename does not match canonical schema.
        """
```

Specify the `_read_coordination_file()` update pattern:
- Use `CanonicalPathBuilder.build()` to construct the primary lookup filename
- If file not found at canonical path → fall back to existing glob logic
- Return (path, content) tuple

---

### LLD400 §13 — Known Bugs Register Update Protocol (D-07)

Specify the exact format for:
1. Marking KB items `IN_REMEDIATION` at WP002 GATE_3 start
2. Marking KB items `CLOSED` at WP002 GATE_5 pass

Which items: KB-26..KB-39 (14 items total)

---

### LLD400 §14 — Deliverables D-08, D-11, D-12 (References)

For these deliverables, your LLD400 does NOT need to write the full content — they are authored by Team 170. Your role is to specify:

**D-08 (Canonical file naming ADR):** Reference `§10` of LOD200 v1.0.1 + verify it covers all TYPE ENUM values. No further LLD400 detail needed.

**D-11 (Governance promotion):** Specify the exact list of documents Team 170 must add deprecation headers to, and the exact deprecation text format per `ARCHITECT_DIRECTIVE_SINGLE_SOURCE_OF_TRUTH_v1.0.0.md`.

**D-12 (SSOT audit):** Specify the scan locations and what to look for (reference the SSOT directive). Specify the output file format for Team 170's audit report.

---

## 3 — Output Requirements

### 3.1 Output File

Write your LLD400 to:
```
_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.0.md
```

### 3.2 LLD400 Header (required)

```yaml
---
id: TEAM_101_S003_P011_WP002_GATE_2_LLD400_v1.0.0
from: Team 101 (AOS Domain Architect)
to: Team 190 (for Phase 2.1v validation), Team 11 (for Phase 2.2 work plan)
date: {today}
gate: GATE_2
phase: "2.1"
wp: S003-P011-WP002
status: PRODUCED — awaiting Phase 2.1v validation by Team 190
lod200_ref: _COMMUNICATION/team_00/TEAM_100_S003_P011_WP002_PIPELINE_STABILIZATION_LOD200_v1.0.1.md
---
```

### 3.3 LLD400 Structure

Your LLD400 must contain sections matching §1–§14 of this mandate. Suggested document structure:
```
# LLD400 — S003-P011-WP002 Pipeline Stabilization & Hardening
## §1 — PipelineState Pydantic Model
## §2 — _DOMAIN_PHASE_ROUTING Complete Table
## §3 — Gate Prompt Generator Architecture
## §4 — CORRECTION_CYCLE_BANNER
## §5 — GATE_ALIASES Dict
## §6 — FAIL_ROUTING Rewrite
## §7 — fail/pass Command Handlers
## §8 — GATE_MANDATE_FILES + Dashboard Mandate Panel
## §9 — flags.waiting_human_approval Fix
## §10 — Pipeline Certification Suite Structure
## §11 — Team 90 Verdict Template
## §12 — CanonicalPathBuilder Class
## §13 — Known Bugs Register Protocol
## §14 — D-08/D-11/D-12 References
## §15 — Implementation Sequencing Mandate
## §16 — Acceptance Criteria Checklist (from LOD200 §7)
```

### 3.4 §15 — Implementation Sequencing (Required in LLD400)

You must include a mandatory implementation sequence for Team 61. The sequence must be:
1. D-02 first (PipelineState Pydantic migration + `_run_migration()`) — all other deliverables depend on this
2. D-01 (pipeline.py rewrite) — must import migrated PipelineState
3. D-09 (CanonicalPathBuilder) — no dependencies on D-01
4. D-06 (`pipeline_run.sh`) — depends on D-01 pass handler
5. D-03 (Certification Suite) — depends on D-01 + D-02 (tests must import from them)
6. D-04 (Dashboard alignment) — independent; can parallel with D-03
7. D-05 (Team 90 template) — Team 170 produces; parallel track

---

## 4 — Iron Rules for Your LLD400

1. **No pseudocode for code-critical sections.** For `_DOMAIN_PHASE_ROUTING`, `GATE_ALIASES`, `FAIL_ROUTING`, `CORRECTION_CYCLE_BANNER`, `PipelineState` — write actual Python. For function bodies where implementation is complex, pseudocode + precise step list is acceptable.
2. **No assumptions.** Read `state.py` to see actual field names. Read `pipeline.py` to see exact function names. Your LLD400 must match the existing codebase identifiers where they are preserved.
3. **Test for both variants.** Every routing decision in `_DOMAIN_PHASE_ROUTING` must be verifiable — you must include a "verification table" showing what `_resolve_phase_owner()` returns for each gate/phase/variant combination.
4. **G3_PLAN → GATE_2/2.2.** The migration table correction from Team 190's BF-01 finding is mandatory. This is a change from v1.0.0 LOD200 — the v1.0.1 correction must be applied. No exceptions.
5. **All 14 known bugs (KB-26..KB-39) must be covered.** Your LLD400 must trace each KB item to a specific deliverable section that fixes it.
6. **Baseline: 127 tests.** Your LLD400 must confirm the existing test count (127 currently collected per LOD200 v1.0.1) and specify how the certification suite avoids regression.

---

## 5 — Self-Validation Checklist

Before submitting your LLD400, verify:

- [ ] `PipelineState` Pydantic model: all fields present, `_run_migration()` includes corrected G3_PLAN→GATE_2/2.2
- [ ] `_DOMAIN_PHASE_ROUTING`: all 5 gates, all phases per gate, both variants
- [ ] `_resolve_phase_owner()`: handles `"lod200_author_team"` sentinel correctly
- [ ] 5 generator functions specified with phase dispatch tables
- [ ] `CORRECTION_CYCLE_BANNER` format matches LOD200 §2.6 exactly
- [ ] `GATE_ALIASES`: maps old IDs to new canonical IDs (not identity)
- [ ] `FAIL_ROUTING`: all targets are GATE_1..GATE_5 only (zero old gate IDs)
- [ ] `fail` handler: writes all 6 state fields per LOD200 §2.4
- [ ] `pass` handler: gate identifier check + correction-cycle warning
- [ ] Certification Suite: 15 CERT scenarios specified with fixtures + assertions
- [ ] Team 90 verdict template: `route_recommendation` present only on BLOCK_FOR_FIX
- [ ] `CanonicalPathBuilder`: `build()` and `parse()` fully specified
- [ ] KB-26..KB-39 coverage table included
- [ ] Implementation sequence in §15 is correct (D-02 first)
- [ ] LLD400 header in YAML format with correct status

---

**Next step after your LLD400 is produced:**
→ `./pipeline_run.sh` will generate the Phase 2.1v prompt for **Team 190** (constitutional LLD400 validation).

**log_entry | TEAM_100 | TO_TEAM_101 | S003_P011_WP002 | GATE_2_PHASE_2.1_MANDATE | ISSUED | 2026-03-20**
