---
project_domain: AGENTS_OS
id: TEAM_00_S003_P010_WP001_CONSOLIDATED_LOD200_v1.0.0
historical_record: true
from: Team 00 (Chief Architect — Nimrod)
to: Team 61 (implementation), Team 100 (review)
date: 2026-03-19
status: APPROVED — SUPERVISED SPRINT ACTIVE
authority: ARCHITECT_DIRECTIVE_AOS_ROADMAP_RESET_v1.0.0 + ARCHITECT_DIRECTIVE_SUPERVISED_SPRINT_PROTOCOL_v1.0.0
supersedes: TEAM_00_S003_P010_WP001/WP002/WP003_LOD200 (individual files — merged here)---

## Mandatory Identity Header

| Field | Value |
|---|---|
| stage_id | S003 |
| program_id | S003-P010 |
| work_package_id | S003-P010-WP001 |
| execution_mode | SUPERVISED_SPRINT (no pipeline gate ceremony) |
| project_domain | AGENTS_OS |
| implementation_team | Team 61 (Cursor Composer) |
| supervisor | Team 00 (Nimrod — validates each phase) |

---

## §0 — Sprint Overview

**One sentence:** Fix the pipeline's three core failure modes — blind remediation, brittle verdict parsing, and silent date drift — as a single coherent implementation sprint with four sequential phases.

**Sprint structure:** 4 phases, strictly sequential. Phase N must be validated by Team 00 before Phase N+1 begins.

| Phase | Name | Deliverable | Approx. effort |
|---|---|---|---|
| **Ph-1** | State Infrastructure | 3 new fields in PipelineState; base scaffolding | Small |
| **Ph-2** | Remediation Engine | `_generate_remediation_mandate()`; FAIL_ROUTING fixes; phase separation | Medium |
| **Ph-3** | JSON Verdict Protocol | `json_enforcer.py`; pipeline integration; team templates | Medium |
| **Ph-4** | Auto-Correction + STATE_VIEW | Date pre-flight hook; `STATE_VIEW.json`; gate aliases | Small |

**Repo root:** `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/`

---

## §1 — Phase 1: State Infrastructure

### Goal
Add the three persistent fields to `PipelineState` that all subsequent phases depend on.

### Files to modify

**`agents_os_v2/orchestrator/state.py`**

Locate the `PipelineState` dataclass. Add after the existing `gate_state` field:

```python
# ── Remediation tracking (added S003-P010-WP001) ─────────────────────────
last_blocking_findings: str = ""     # BF bullet list from last failed verdict
last_blocking_gate: str = ""         # gate that produced last failure e.g. "GATE_5"
remediation_cycle_count: int = 0     # increments each FAIL routing
```

These fields MUST serialize to/from `pipeline_state_{domain}.json` automatically (they are dataclass fields — if `PipelineState.save()` uses `dataclasses.asdict()` or similar, they will be included automatically). Verify this is the case.

Also add two phase-tracking fields:

```python
current_phase: int = 0     # 0 = no active phase; 1,2,3 = active phase number
total_phases: int = 0      # total phases defined for current gate
```

### Phase 1 acceptance criteria

| AC | Check |
|---|---|
| AC-1.1 | All 5 new fields appear in `pipeline_state_agentsos.json` after a `save()` call |
| AC-1.2 | Fields survive JSON round-trip (save → load → same values) |
| AC-1.3 | Default values are correct: `""`, `""`, `0`, `0`, `0` |
| AC-1.4 | Existing pipeline state files without the new fields load without error (backwards compat) |

**→ Notify Team 00 (Nimrod) when Phase 1 complete. Wait for approval before Phase 2.**

---

## §2 — Phase 2: Remediation Engine + Gate/Phase Separation

### Goal
When a gate fails and routes back to execution, produce a targeted remediation mandate instead of pointing teams at the original full-scope spec.

### 2.1 Populate `last_blocking_findings` on FAIL advance

**File:** `agents_os_v2/orchestrator/pipeline.py`

In the `advance()` function, locate where FAIL is recorded. After recording the FAIL gate, add:

```python
# Populate remediation state on FAIL
findings, _source = _extract_blocking_findings(gate_id, state.work_package_id)
if findings:
    state.last_blocking_findings = findings
    state.last_blocking_gate = gate_id
    state.remediation_cycle_count += 1
state.save()
```

### 2.2 New function: `_generate_remediation_mandate()`

**File:** `agents_os_v2/orchestrator/pipeline.py`

Add this function. It is called when `state.remediation_cycle_count > 0` and the pipeline is routing back to `CURSOR_IMPLEMENTATION`.

```python
def _generate_remediation_mandate(state: PipelineState) -> str:
    """
    Generate a focused remediation mandate based on last blocking findings.
    Output artifact: remediation_mandates.md (NEVER overwrites implementation_mandates.md).
    """
    wp = state.work_package_id
    cycle = state.remediation_cycle_count
    findings = state.last_blocking_findings or "(no findings recorded — check verdict file manually)"
    failed_gate = state.last_blocking_gate or "unknown gate"

    SEP = "─" * 60
    _dom = getattr(state, "project_domain", "") or ""
    domain_flag = f"--domain {_dom} " if _dom else ""

    return f"""# ⚠️ REMEDIATION MANDATE — {wp} (Cycle #{cycle})

**Spec:** {state.spec_brief}

**Canonical date:** Use `date -u +%F` for today.

{SEP}
  ⛔  DO NOT RE-IMPLEMENT FROM SCRATCH
  ⛔  DO NOT open `implementation_mandates.md`
  ✅  Fix ONLY the specific items listed in §2 below
{SEP}

## §1 — Context

- **Failed gate:** {failed_gate}
- **Remediation cycle:** #{cycle}
- **Source verdict:** check `_COMMUNICATION/` for latest `{failed_gate.replace("_","-")}_VERDICT` or `BLOCKING_REPORT`

## §2 — Blocking Findings (your ONLY scope)

{findings}

## §3 — Your Tasks

For each BF item above:
1. Identify the exact file and function responsible
2. Make the minimal targeted fix — do not refactor unrelated code
3. Confirm the fix addresses the specific evidence path cited in the BF

## §4 — Non-Scope (DO NOT TOUCH)

Any component, file, or function not explicitly named in §2 is OUT OF SCOPE.
If you believe a fix requires touching out-of-scope code, STOP and report to Team 00.

## §5 — Completion

When all BF items are addressed:
1. Run: `./pipeline_run.sh {domain_flag}pass` to re-enter the QA gate
2. Do NOT run pass before all BF items are fixed

"""
```

### 2.3 Update `CURSOR_IMPLEMENTATION` prompt generator

**File:** `agents_os_v2/orchestrator/pipeline.py`

Find `_generate_cursor_implementation_prompt()` (or equivalent function that generates the CURSOR_IMPLEMENTATION gate prompt). Add correction-cycle detection at the top:

```python
if state.remediation_cycle_count > 0:
    # Remediation cycle — generate focused mandate, not original spec
    content = _generate_remediation_mandate(state)
    path = _save_prompt("remediation_mandates.md", content, state.project_domain)
    _log(f"[REMEDIATION] Cycle #{state.remediation_cycle_count} — remediation_mandates.md generated")
    # Still display the ▼▼▼ block pointing to remediation_mandates.md
    ...
    return
```

Also update `pipeline_run.sh`: in the CURSOR_IMPLEMENTATION `pass)` or display case, detect `remediation_cycle_count > 0` in the state JSON and show appropriate messaging.

### 2.4 FAIL_ROUTING changes

**File:** `agents_os_v2/orchestrator/pipeline.py`

Update `FAIL_ROUTING` dict:

```python
"GATE_4": {
    "doc":  ("CURSOR_IMPLEMENTATION", "QA: targeted fix — remediation_mandates.md auto-generated"),
    "full": ("G3_PLAN",               "QA: code failures — Team 10 produces BF-scoped plan → new mandates"),
},
"GATE_5": {
    "doc":  ("CURSOR_IMPLEMENTATION", "Targeted fix — remediation_mandates.md auto-generated"),
    "full": ("G3_PLAN",               "Code/design issues — BF-scoped re-plan required"),
},
```

Note: `GATE_4 full` changes from `G3_6_MANDATES` to `G3_PLAN`. This ensures Team 10 writes a scoped plan rather than regenerating mandates from a stale work_plan.

### 2.5 Gate/Phase Separation — remove Team 50 from implementation

**File:** `agents_os_v2/orchestrator/pipeline.py`

Find `_build_implementation_steps()` or wherever `MandateStep` objects are created for `G3_6_MANDATES`. Add guard:

```python
for step in steps:
    if step.team_id == "team_50":
        raise ValueError(
            f"ARCHITECTURAL VIOLATION: team_50 (QA) cannot appear in implementation mandates. "
            f"Team 50 belongs exclusively at GATE_4. Remove from steps."
        )
```

This turns a silent misconfiguration into a loud error, preventing the QA-during-implementation freeze.

### 2.6 Add `G3_REMEDIATION` gate (scoped — multi-team deadlock only)

**File:** `agents_os_v2/orchestrator/pipeline.py`

Add to `GATE_CONFIG`:
```python
"G3_REMEDIATION": {
    "owner": "team_10", "engine": "cursor",
    "desc": "Team 10 diagnoses multi-team BF deadlock → remediation_work_plan.md (BF scope only)",
    "default_fail_route": "doc",
},
```

Add to `GATE_SEQUENCE` — insert between `G3_6_MANDATES` and `CURSOR_IMPLEMENTATION`:
```python
GATE_SEQUENCE = [
    "GATE_0", "GATE_1", "GATE_2", "WAITING_GATE2_APPROVAL",
    "G3_PLAN", "G3_5", "G3_6_MANDATES",
    "G3_REMEDIATION",          # ← new; skipped when remediation_cycle_count == 0
    "CURSOR_IMPLEMENTATION",
    "GATE_4", "GATE_5", "GATE_6", "GATE_7", "GATE_8",
]
```

**Skip logic:** `G3_REMEDIATION` is only activated by explicit `advance("G3_6_MANDATES", "PASS")` when `remediation_cycle_count > 0` AND the blocking findings contain ≥2 distinct team IDs. Otherwise it is transparent.

### Phase 2 acceptance criteria

| AC | Check |
|---|---|
| AC-2.1 | `GATE_4 FAIL doc` → `CURSOR_IMPLEMENTATION` prompt contains `## ⚠️ REMEDIATION MANDATE` header |
| AC-2.2 | `CURSOR_IMPLEMENTATION` remediation prompt references `remediation_mandates.md`, not `implementation_mandates.md` |
| AC-2.3 | `implementation_mandates.md` is NOT overwritten during remediation cycle |
| AC-2.4 | `state.remediation_cycle_count` increments to 1 after first FAIL; persists in JSON |
| AC-2.5 | `state.last_blocking_findings` contains BF lines from verdict file |
| AC-2.6 | Adding `team_50` to a MandateStep raises `ValueError` with clear message |
| AC-2.7 | `GATE_4 full` routes to `G3_PLAN` (not `G3_6_MANDATES`) |
| AC-2.8 | `G3_REMEDIATION` appears in `GATE_CONFIG` and `GATE_SEQUENCE` |

**→ Notify Team 00 (Nimrod) when Phase 2 complete. Wait for approval before Phase 3.**

---

## §3 — Phase 3: JSON Verdict Protocol + json_enforcer.py

### Goal
Replace brittle regex-based verdict parsing with deterministic `json.loads()` parsing. Build the enforcement module that auto-fixes LLM JSON syntax errors.

### 3.1 New module: `agents_os_v2/orchestrator/json_enforcer.py`

Create this file from scratch:

```python
"""
json_enforcer.py — Pre-flight JSON verdict validation + auto-fix.

Enforces the canonical JSON-fenced-block verdict format:
  ```json
  { "gate_id": "...", "decision": "PASS|BLOCK_FOR_FIX", ... }
  ```

Usage:
    from .json_enforcer import enforce_json_verdict, VerdictParseError
    data = enforce_json_verdict(Path("_COMMUNICATION/team_190/...VERDICT.md"))
"""

from __future__ import annotations
import json
import re
from pathlib import Path


class VerdictParseError(Exception):
    """Raised when a verdict file cannot be parsed as valid JSON after auto-fix attempt."""
    pass


REQUIRED_FIELDS = {"gate_id", "decision", "summary"}
VALID_DECISIONS = {"PASS", "BLOCK_FOR_FIX"}
VALID_ROUTES    = {"doc", "full", None}


def _extract_first_json_block(text: str) -> str | None:
    """Extract content of first ```json ... ``` fenced block."""
    m = re.search(r"```json\s*\n(.*?)\n```", text, re.DOTALL)
    return m.group(1).strip() if m else None


def _validate_schema(data: dict) -> list[str]:
    """Return list of human-readable validation errors."""
    errors: list[str] = []
    for f in REQUIRED_FIELDS:
        if f not in data:
            errors.append(f"Missing required field: '{f}'")
    decision = data.get("decision", "")
    if decision not in VALID_DECISIONS:
        errors.append(f"Invalid decision '{decision}' — must be PASS or BLOCK_FOR_FIX")
    if decision == "BLOCK_FOR_FIX":
        if not data.get("blocking_findings"):
            errors.append("BLOCK_FOR_FIX requires non-empty blocking_findings array")
        route = data.get("route_recommendation")
        if route not in VALID_ROUTES:
            errors.append(f"Invalid route_recommendation '{route}' — must be 'doc' or 'full'")
    return errors


def enforce_json_verdict(file_path: Path, llm_client=None) -> dict:
    """
    Read a verdict file, extract and validate the first JSON block.

    Args:
        file_path:   Path to the .md verdict file
        llm_client:  Optional LLM client for auto-fix retry (not implemented in Phase 3;
                     placeholder for future json_enforcer v2 with active retry)

    Returns:
        Parsed and validated dict

    Raises:
        VerdictParseError: if JSON block is absent, unparseable, or fails schema validation
    """
    if not file_path.exists():
        raise VerdictParseError(f"Verdict file not found: {file_path}")

    text = file_path.read_text(encoding="utf-8")
    raw_json = _extract_first_json_block(text)

    if raw_json is None:
        # No JSON block — legacy Markdown verdict; caller should use legacy fallback
        raise VerdictParseError(
            f"NO_JSON_BLOCK: {file_path.name} — no ```json block found. "
            f"Legacy regex fallback will be used."
        )

    # Attempt parse
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError as e:
        raise VerdictParseError(
            f"JSON_SYNTAX_ERROR in {file_path.name}: {e}. "
            f"Auto-fix LLM retry not yet implemented — set to MANUAL_ROUTING_REQUIRED."
        ) from e

    # Schema validation
    errors = _validate_schema(data)
    if errors:
        raise VerdictParseError(
            f"JSON_SCHEMA_ERROR in {file_path.name}:\n" + "\n".join(f"  - {e}" for e in errors)
        )

    return data


def has_json_verdict_block(file_path: Path) -> bool:
    """Quick check — does this file contain a JSON block? Used for legacy fallback detection."""
    if not file_path.exists():
        return False
    text = file_path.read_text(encoding="utf-8")
    return _extract_first_json_block(text) is not None
```

### 3.2 Integrate `json_enforcer` into `pipeline.py`

**File:** `agents_os_v2/orchestrator/pipeline.py`

Add import at top of file:
```python
from .json_enforcer import enforce_json_verdict, has_json_verdict_block, VerdictParseError
```

In `advance()`, find where `_extract_route_recommendation()` is called. Add detection logic before it:

```python
# ── JSON verdict detection (new S003-P010-WP001) ─────────────────────────
_use_json_enforcer = False
for vpath in _verdict_candidates(gate_id, state.work_package_id):
    if vpath.exists() and has_json_verdict_block(vpath):
        _use_json_enforcer = True
        _json_verdict_path = vpath
        break

if _use_json_enforcer:
    try:
        verdict_data = enforce_json_verdict(_json_verdict_path)
        auto_route = verdict_data.get("route_recommendation")
        # Populate blocking findings from JSON (more reliable than regex)
        bf_list = verdict_data.get("blocking_findings", [])
        if bf_list:
            state.last_blocking_findings = "\n".join(
                f"- {bf['id']}: {bf['description']} | evidence: {bf.get('evidence','')}"
                for bf in bf_list
            )
            state.last_blocking_gate = gate_id
        _log(f"[JSON_ENFORCER] Parsed verdict: decision={verdict_data['decision']} route={auto_route}")
    except VerdictParseError as e:
        _log(f"[JSON_ENFORCER] {e}")
        if "NO_JSON_BLOCK" not in str(e):
            # Real parse failure — not just legacy file
            state.gate_state = "MANUAL_ROUTING_REQUIRED"
            state.save()
            _log("[MANUAL ROUTING REQUIRED] Verdict JSON invalid — operator must route manually")
            return
        # NO_JSON_BLOCK → fall through to legacy regex
        _use_json_enforcer = False

# Legacy regex path (historical files or NO_JSON_BLOCK)
if not _use_json_enforcer:
    auto_route, verdict_path_str = _extract_route_recommendation(gate_id, state.work_package_id)
```

### 3.3 Update prompt templates to require JSON block

**File:** `agents_os_v2/orchestrator/pipeline.py`

In all gate prompt generators that instruct validation teams (GATE_0, GATE_1, G3_5, GATE_4, GATE_5, GATE_6, GATE_8), add this instruction block after the "Output Format" header:

```python
JSON_VERDICT_INSTRUCTION = """
## MANDATORY: JSON Verdict Block

Your response file MUST begin with this exact JSON block (first content in file):

```json
{
  "gate_id": "{gate_id}",
  "decision": "PASS",
  "blocking_findings": [],
  "route_recommendation": null,
  "summary": "One sentence summary here"
}
```

For a BLOCK decision:
```json
{
  "gate_id": "{gate_id}",
  "decision": "BLOCK_FOR_FIX",
  "blocking_findings": [
    {"id": "BF-01", "description": "...", "evidence": "path/file.py:42"}
  ],
  "route_recommendation": "doc",
  "summary": "N blockers found. [summary]"
}
```

**Rules:**
- JSON block must be FIRST — before any Markdown text
- `decision`: exactly `PASS` or `BLOCK_FOR_FIX`
- `blocking_findings`: empty array `[]` for PASS; required non-empty for BLOCK_FOR_FIX
- `route_recommendation`: `null` for PASS; `"doc"` or `"full"` for BLOCK_FOR_FIX
- Detailed analysis may follow the JSON block as free Markdown
"""
```

Substitute `{gate_id}` with the actual gate in each prompt generator.

### Phase 3 acceptance criteria

| AC | Check |
|---|---|
| AC-3.1 | `json_enforcer.py` exists at `agents_os_v2/orchestrator/json_enforcer.py` |
| AC-3.2 | `enforce_json_verdict()` returns correct dict for a valid JSON verdict file |
| AC-3.3 | `enforce_json_verdict()` raises `VerdictParseError` for malformed JSON |
| AC-3.4 | `has_json_verdict_block()` returns `True` for new format, `False` for legacy Markdown |
| AC-3.5 | `pipeline.py advance()` uses json_enforcer when JSON block detected |
| AC-3.6 | Legacy regex path still works when no JSON block present |
| AC-3.7 | `state.last_blocking_findings` is populated from JSON `blocking_findings` array |
| AC-3.8 | GATE_0 prompt contains JSON verdict instruction block |

**→ Notify Team 00 (Nimrod) when Phase 3 complete. Wait for approval before Phase 4.**

---

## §4 — Phase 4: Auto-Correction + STATE_VIEW.json + Gate Aliases

### Goal
Eliminate date-staleness BLOCK cycles. Produce a compact always-fresh state summary file. Add non-breaking aliases to reduce naming friction.

### 4.1 Pre-flight date correction in `pipeline_run.sh`

Add this function near the top of `pipeline_run.sh` (after existing helper functions):

```bash
# ── Pre-flight date correction (S003-P010-WP001 Ph4) ─────────────────────
# Silently corrects stale `date:` field in artifact files before validation.
# Only touches the date field — no other fields are modified.
_preflight_date_correction() {
    local artifact_file="$1"
    [[ -f "$artifact_file" ]] || return 0
    local today
    today=$(date -u +%F)
    # Pattern 1: YAML frontmatter "date: YYYY-MM-DD"
    sed -i.bak "s/^\(date: \)[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}$/\1${today}/" "$artifact_file"
    # Pattern 2: Markdown table "| date | YYYY-MM-DD |"
    sed -i.bak "s/| date | [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\} |/| date | ${today} |/g" "$artifact_file"
    rm -f "${artifact_file}.bak"
    echo "[preflight] date corrected in $(basename "$artifact_file")" >> "${REPO_ROOT}/_COMMUNICATION/agents_os/pipeline_events.jsonl" 2>/dev/null || true
}
```

Call this function in the appropriate place — before any gate prompt is displayed to the user (specifically before the `▼▼▼` block is printed). Identify the artifact file from `state.spec_path` or the most recently modified file in `_COMMUNICATION/`.

### 4.2 `STATE_VIEW.json` generator in `pipeline.py`

Add this function to `agents_os_v2/orchestrator/pipeline.py`:

```python
def _write_state_view(state: "PipelineState") -> None:
    """Write STATE_VIEW.json — compact dashboard-readable summary. Non-blocking."""
    try:
        gate_cfg = GATE_CONFIG.get(state.current_gate, {})
        effective_owner = (
            _domain_gate_owner(state.current_gate, state.project_domain)
            or gate_cfg.get("owner", "")
        )
        # Determine health
        if not state.current_gate or state.current_gate == "COMPLETE":
            health = "IDLE"
        elif getattr(state, "gate_state", None) == "MANUAL_ROUTING_REQUIRED":
            health = "RED"
        elif getattr(state, "remediation_cycle_count", 0) > 0:
            health = "YELLOW"
        else:
            health = "GREEN"

        # Derive program_id from WP ID
        wp = state.work_package_id or ""
        program_id = wp.rsplit("-WP", 1)[0] if "-WP" in wp else ""

        view = {
            "schema_version": "1.0.0",
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "domain": state.project_domain,
            "work_package_id": wp,
            "stage_id": state.stage_id,
            "program_id": program_id,
            "current_gate": state.current_gate,
            "gate_display_name": gate_cfg.get("desc", ""),
            "gate_owner": effective_owner,
            "gates_completed": list(state.gates_completed),
            "gates_failed": list(state.gates_failed),
            "remediation_cycle_count": getattr(state, "remediation_cycle_count", 0),
            "last_blocking_gate": getattr(state, "last_blocking_gate", None) or None,
            "pipeline_health": health,
            "current_phase": getattr(state, "current_phase", 0),
            "total_phases": getattr(state, "total_phases", 0),
            "next_action": {
                "description": gate_cfg.get("desc", ""),
                "owner": effective_owner,
                "engine": gate_cfg.get("engine", ""),
            },
            "flags": {
                "manual_routing_required": getattr(state, "gate_state", None) == "MANUAL_ROUTING_REQUIRED",
                "remediation_active": getattr(state, "remediation_cycle_count", 0) > 0,
                "waiting_human_approval": state.current_gate in ("WAITING_GATE2_APPROVAL", "GATE_7"),
            },
        }
        state_view_path = AGENTS_OS_OUTPUT_DIR / "STATE_VIEW.json"
        state_view_path.write_text(
            json.dumps(view, indent=2, ensure_ascii=False), encoding="utf-8"
        )
    except Exception as exc:
        # Non-blocking — never crash the pipeline for a state view failure
        pass
```

Call `_write_state_view(state)` at the end of `PipelineState.save()` in `state.py`:
```python
def save(self):
    # ... existing save logic ...
    # After writing pipeline_state JSON:
    try:
        from .pipeline import _write_state_view
        _write_state_view(self)
    except Exception:
        pass
```

### 4.3 Gate aliases (non-breaking)

**File:** `agents_os_v2/orchestrator/pipeline.py`

Add after `GATE_SEQUENCE`:

```python
# Non-breaking gate name aliases — legacy names resolve to canonical display names.
# Full gate renaming (breaking change) deferred to S004.
GATE_ALIASES: dict[str, str] = {
    "G3_PLAN":               "G3_PLAN",         # canonical (keep as-is for S003)
    "G3_5":                  "G3_5",             # canonical (keep as-is for S003)
    "G3_6_MANDATES":         "G3_6_MANDATES",    # canonical (keep as-is for S003)
    "G3_REMEDIATION":        "G3_REMEDIATION",   # new in Ph2
    "CURSOR_IMPLEMENTATION": "CURSOR_IMPLEMENTATION",  # canonical (keep as-is for S003)
    # Future canonical names (S004):
    # "G3_PLAN"       → "GATE_3"
    # "CURSOR_IMPLEMENTATION" → "GATE_3_IMPL"
}

def _resolve_gate_alias(gate_id: str) -> str:
    """Resolve gate alias to canonical name. Identity function until S004 rename."""
    return GATE_ALIASES.get(gate_id, gate_id)
```

Wrap CLI argument handling with `_resolve_gate_alias()` so `./pipeline_run.sh --domain agents_os advance GATE_3 PASS` would work (currently not needed, but scaffolding is in place).

### Phase 4 acceptance criteria

| AC | Check |
|---|---|
| AC-4.1 | `_preflight_date_correction()` function exists in `pipeline_run.sh` |
| AC-4.2 | Running the function on a file with `date: 2026-01-01` updates it to today's date |
| AC-4.3 | `STATE_VIEW.json` exists at `_COMMUNICATION/agents_os/STATE_VIEW.json` after any `save()` |
| AC-4.4 | `STATE_VIEW.json` is valid JSON with all required fields |
| AC-4.5 | `pipeline_health` is `GREEN` when no failures, `YELLOW` when remediation_cycle_count > 0 |
| AC-4.6 | `_write_state_view()` failure does NOT crash the pipeline (exception swallowed) |
| AC-4.7 | `GATE_ALIASES` dict and `_resolve_gate_alias()` exist in pipeline.py |

**→ Notify Team 00 (Nimrod): Phase 4 complete — full sprint complete. Team 00 reviews and closes WP.**

---

## §5 — Sprint Completion Checklist (Team 00)

After all 4 phases pass:

```
□ All 7+8+8+7 = 30 ACs across 4 phases verified
□ pipeline_state_agentsos.json fields confirmed (Ph1)
□ remediation_mandates.md generated correctly on test FAIL (Ph2)
□ json_enforcer.py parses a test verdict without error (Ph3)
□ STATE_VIEW.json generated and valid (Ph4)
□ No regressions: existing pipeline_run.sh commands still work
□ WSM EXPLICIT_WSM_PATCH: P010-WP001 DOCUMENTATION_CLOSED
□ Program Registry updated: P010 status → COMPLETE
```

---

**log_entry | TEAM_00 | CONSOLIDATED_LOD200_P010_WP001 | SUPERVISED_SPRINT_APPROVED_4_PHASES | 2026-03-19**
