---
project_domain: AGENTS_OS
id: TEAM_00_TO_TEAM_61_S003_P010_WP001_SPRINT_MANDATE_v1.0.0
historical_record: true
from: Team 00 (Chief Architect — Nimrod)
to: Team 61 (Cursor Composer — Implementation)
date: 2026-03-19
execution_mode: SUPERVISED_SPRINT (no pipeline gate ceremony)
repo: /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/---

# TEAM 61 — Sprint Mandate: S003-P010-WP001
## Pipeline Core Reliability — 4 Phases

---

## YOUR IDENTITY FOR THIS SESSION

You are **Team 61 — IDE Implementation Authority**.
You are working in Cursor Composer with full repository access.
Your supervisor is **Team 00 (Nimrod)** — he reviews and approves each phase before you proceed to the next.

**This is a Supervised Sprint.** There is no pipeline ceremony (no `./pipeline_run.sh` gate advancement). Instead:
- You implement Phase N
- You report completion with a checklist
- Nimrod reviews and says "proceed to Phase N+1"
- You proceed

**Do NOT run `./pipeline_run.sh pass`** at any point during this sprint.

---

## WHAT YOU ARE BUILDING

The agents_os pipeline has three critical failure modes:
1. After a gate FAIL, teams are pointed at the original full spec and re-implement from scratch instead of fixing the specific bug
2. Verdict files from validation teams are parsed with brittle regex that breaks on minor formatting variations
3. Stale dates in identity headers cause unnecessary BLOCK cycles

You are fixing all three. The work is organized into 4 sequential phases.

**Repo structure (relevant paths):**
```
agents_os_v2/
  orchestrator/
    state.py          ← Phase 1
    pipeline.py       ← Phase 2, 3, 4
    json_enforcer.py  ← Phase 3 (CREATE NEW)
pipeline_run.sh       ← Phase 4
_COMMUNICATION/agents_os/
  STATE_VIEW.json     ← Phase 4 (auto-generated)
```

---

## PHASE 1 — State Infrastructure
**Prerequisite:** none
**Estimated size:** Small (~20 lines added)

### What to do

Open `agents_os_v2/orchestrator/state.py`.

Find the `PipelineState` dataclass. Locate the `gate_state` field. After it, add these 5 new fields:

```python
# ── Remediation tracking (S003-P010-WP001) ───────────────────────────────
last_blocking_findings: str = ""     # BF bullet list from last failed verdict
last_blocking_gate: str = ""         # gate that produced last failure
remediation_cycle_count: int = 0     # increments each FAIL routing
# ── Phase tracking ────────────────────────────────────────────────────────
current_phase: int = 0               # 0 = no active phase; 1,2,3 = active phase
total_phases: int = 0                # total phases for current gate
```

**Verify:** Check how `PipelineState` is serialized to JSON. If it uses `dataclasses.asdict()` or iterates fields, the new fields will be included automatically. If it manually lists fields, add the 5 new fields to the list.

**Verify backward compat:** Check `PipelineState.load()`. If it raises on unknown keys, add `default` handling. If it uses `**data` dict unpacking, it likely already handles missing fields gracefully.

### Phase 1 done — report this checklist to Nimrod:

```
PHASE 1 COMPLETE — Team 61 checklist:
□ 5 new fields added to PipelineState dataclass in state.py
□ Fields appear in pipeline_state_agentsos.json after save() (verified by running status)
□ Old pipeline_state JSON without new fields loads without error
□ Default values: "" / "" / 0 / 0 / 0
```

---

## PHASE 2 — Remediation Engine + Gate/Phase Separation
**Prerequisite:** Phase 1 approved by Nimrod
**Estimated size:** Medium (~100 lines added/changed)

### Step 2.1 — Populate state on FAIL

Open `agents_os_v2/orchestrator/pipeline.py`.

Find the `advance()` function. Locate where it handles a `FAIL` decision — specifically where it appends to `state.gates_failed` or routes the pipeline backward. After recording the FAIL, add:

```python
# Populate remediation state (S003-P010-WP001)
_findings, _src = _extract_blocking_findings(gate_id, state.work_package_id)
if _findings:
    state.last_blocking_findings = _findings
    state.last_blocking_gate = gate_id
    state.remediation_cycle_count = getattr(state, 'remediation_cycle_count', 0) + 1
```

### Step 2.2 — Add `_generate_remediation_mandate()` function

Add this new function to `pipeline.py` (place it near `_generate_mandate_doc`):

```python
def _generate_remediation_mandate(state: "PipelineState") -> str:
    """
    Focused remediation mandate — replaces implementation_mandates.md
    for correction cycles. Never re-implement from scratch.
    S003-P010-WP001
    """
    wp     = state.work_package_id or "UNKNOWN-WP"
    cycle  = getattr(state, 'remediation_cycle_count', 1)
    findings = getattr(state, 'last_blocking_findings', '') or \
               "(no findings recorded — read verdict file manually)"
    failed_gate = getattr(state, 'last_blocking_gate', '') or "unknown"
    _dom = getattr(state, "project_domain", "") or ""
    domain_flag = f"--domain {_dom} " if _dom else ""

    SEP = "─" * 60
    return (
        f"# ⚠️ REMEDIATION MANDATE — {wp} (Cycle #{cycle})\n\n"
        f"**Spec:** {state.spec_brief}\n\n"
        f"**Canonical date:** Use `date -u +%F` for today.\n\n"
        f"{SEP}\n"
        f"  ⛔  DO NOT RE-IMPLEMENT FROM SCRATCH\n"
        f"  ⛔  DO NOT open `implementation_mandates.md`\n"
        f"  ✅  Fix ONLY the items listed in §2 below\n"
        f"{SEP}\n\n"
        f"## §1 — Context\n\n"
        f"- **Failed gate:** {failed_gate}\n"
        f"- **Remediation cycle:** #{cycle}\n\n"
        f"## §2 — Blocking Findings (your ONLY scope)\n\n"
        f"{findings}\n\n"
        f"## §3 — Your Tasks\n\n"
        f"For each BF item:\n"
        f"1. Identify the exact file and function responsible\n"
        f"2. Make the minimal targeted fix\n"
        f"3. Confirm the fix addresses the specific evidence cited\n\n"
        f"## §4 — Non-Scope (DO NOT TOUCH)\n\n"
        f"Any component not named in §2 is OUT OF SCOPE.\n"
        f"If a fix requires touching out-of-scope code, STOP and report to Team 00.\n\n"
        f"## §5 — Completion\n\n"
        f"When all BF items are fixed:\n"
        f"`./pipeline_run.sh {domain_flag}pass`\n"
    )
```

### Step 2.3 — Update CURSOR_IMPLEMENTATION prompt to detect remediation cycle

Find the function that generates the `CURSOR_IMPLEMENTATION` gate prompt (search for `"CURSOR_IMPLEMENTATION"` in the gate prompt generation logic or the `_generate_cursor_prompts` area). At the start of that function, add:

```python
# Remediation cycle detection (S003-P010-WP001)
if getattr(state, 'remediation_cycle_count', 0) > 0:
    content = _generate_remediation_mandate(state)
    path = _save_prompt("remediation_mandates.md", content, state.project_domain)
    _log(f"[REMEDIATION] Cycle #{state.remediation_cycle_count} — remediation_mandates.md at {path}")
    # Continue to display the prompt block (modify the display to reference remediation_mandates.md)
```

Also update the display text in `pipeline_run.sh` for the CURSOR_IMPLEMENTATION case: when `remediation_cycle_count > 0` in the state JSON, change "Open `implementation_mandates.md`" to "Open `remediation_mandates.md`".

To read `remediation_cycle_count` from the state JSON in the shell script:
```bash
_remediation_count=$(python3 -c "
import json, sys
try:
    data = json.load(open('${STATE_FILE}'))
    print(data.get('remediation_cycle_count', 0))
except:
    print(0)
" 2>/dev/null || echo 0)
```

### Step 2.4 — Fix FAIL_ROUTING

In `pipeline.py`, find `FAIL_ROUTING`. Update these entries:

```python
"GATE_4": {
    "doc":  ("CURSOR_IMPLEMENTATION", "QA: targeted fix — remediation_mandates.md auto-generated"),
    "full": ("G3_PLAN",               "QA: code failures — Team 10 BF-scoped plan → new mandates"),
},
"GATE_5": {
    "doc":  ("CURSOR_IMPLEMENTATION", "Targeted fix — remediation_mandates.md auto-generated"),
    "full": ("G3_PLAN",               "Code/design issues — BF-scoped re-plan required"),
},
```

### Step 2.5 — Gate/Phase separation guard

Find `_build_implementation_steps()` or wherever `MandateStep` objects are built for `G3_6_MANDATES`. Add a guard after the steps list is assembled:

```python
for _step in steps:
    if getattr(_step, 'team_id', '') == "team_50":
        raise ValueError(
            "ARCHITECTURAL VIOLATION (S003-P010): team_50 (QA) cannot appear "
            "in implementation mandates. Team 50 belongs at GATE_4 only."
        )
```

### Step 2.6 — Add G3_REMEDIATION gate

In `GATE_CONFIG`, add:
```python
"G3_REMEDIATION": {
    "owner": "team_10", "engine": "cursor",
    "desc": "Team 10 diagnoses multi-team BF deadlock → remediation_work_plan.md",
    "default_fail_route": "doc",
},
```

In `GATE_SEQUENCE`, insert `"G3_REMEDIATION"` between `"G3_6_MANDATES"` and `"CURSOR_IMPLEMENTATION"`.

### Phase 2 done — report this checklist to Nimrod:

```
PHASE 2 COMPLETE — Team 61 checklist:
□ _generate_remediation_mandate() function added to pipeline.py
□ CURSOR_IMPLEMENTATION prompt detects remediation_cycle_count > 0
□ remediation_mandates.md generated (not implementation_mandates.md) on remediation cycle
□ state.last_blocking_findings populated from verdict on FAIL
□ state.remediation_cycle_count increments on FAIL
□ GATE_4 full → G3_PLAN (not G3_6_MANDATES)
□ GATE_5 full → G3_PLAN
□ team_50 guard raises ValueError if included in implementation mandate steps
□ G3_REMEDIATION in GATE_CONFIG and GATE_SEQUENCE
```

---

## PHASE 3 — JSON Verdict Protocol + json_enforcer.py
**Prerequisite:** Phase 2 approved by Nimrod
**Estimated size:** Medium (~150 lines new + ~50 lines changes)

### Step 3.1 — Create `agents_os_v2/orchestrator/json_enforcer.py`

Create this file from scratch with the following content:

```python
"""
json_enforcer.py — Deterministic JSON verdict parsing.
Replaces brittle regex parsing of validation team outputs.
S003-P010-WP001 | Authority: ARCHITECT_DIRECTIVE_AOS_ROADMAP_RESET_v1.0.0
"""
from __future__ import annotations
import json
import re
from pathlib import Path


class VerdictParseError(Exception):
    """Raised when verdict cannot be parsed as valid JSON."""
    pass


REQUIRED_FIELDS  = {"gate_id", "decision", "summary"}
VALID_DECISIONS  = {"PASS", "BLOCK_FOR_FIX"}
VALID_ROUTES     = {"doc", "full", None}


def _extract_first_json_block(text: str) -> str | None:
    m = re.search(r"```json\s*\n(.*?)\n```", text, re.DOTALL)
    return m.group(1).strip() if m else None


def _validate_schema(data: dict) -> list[str]:
    errors: list[str] = []
    for f in REQUIRED_FIELDS:
        if f not in data:
            errors.append(f"Missing field: '{f}'")
    decision = data.get("decision", "")
    if decision not in VALID_DECISIONS:
        errors.append(f"Invalid decision '{decision}'")
    if decision == "BLOCK_FOR_FIX":
        if not data.get("blocking_findings"):
            errors.append("BLOCK_FOR_FIX requires non-empty blocking_findings")
        if data.get("route_recommendation") not in VALID_ROUTES:
            errors.append(f"Invalid route_recommendation '{data.get('route_recommendation')}'")
    return errors


def has_json_verdict_block(file_path: Path) -> bool:
    """Quick check — does this file have a ```json block?"""
    if not file_path.exists():
        return False
    return _extract_first_json_block(file_path.read_text(encoding="utf-8")) is not None


def enforce_json_verdict(file_path: Path) -> dict:
    """
    Parse and validate the JSON verdict block from a verdict file.
    Returns validated dict on success.
    Raises VerdictParseError on failure.
    """
    if not file_path.exists():
        raise VerdictParseError(f"File not found: {file_path}")

    text = file_path.read_text(encoding="utf-8")
    raw = _extract_first_json_block(text)

    if raw is None:
        raise VerdictParseError(f"NO_JSON_BLOCK: {file_path.name}")

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise VerdictParseError(f"JSON_SYNTAX_ERROR in {file_path.name}: {e}") from e

    errors = _validate_schema(data)
    if errors:
        raise VerdictParseError(
            f"JSON_SCHEMA_ERROR in {file_path.name}:\n" +
            "\n".join(f"  - {e}" for e in errors)
        )
    return data
```

### Step 3.2 — Integrate into `pipeline.py`

Add import at top of `pipeline.py`:
```python
from .json_enforcer import enforce_json_verdict, has_json_verdict_block, VerdictParseError
```

In `advance()`, find the auto-routing section (where `_extract_route_recommendation` is called). Before that call, add:

```python
# ── JSON verdict detection (S003-P010-WP001) ─────────────────────────────
_json_path = None
for _vp in _verdict_candidates(gate_id, state.work_package_id):
    if _vp.exists() and has_json_verdict_block(_vp):
        _json_path = _vp
        break

if _json_path:
    try:
        _vdata = enforce_json_verdict(_json_path)
        auto_route = _vdata.get("route_recommendation")
        _bf_list = _vdata.get("blocking_findings", [])
        if _bf_list:
            state.last_blocking_findings = "\n".join(
                f"- {bf.get('id','BF-??')}: {bf.get('description','')} | evidence: {bf.get('evidence','')}"
                for bf in _bf_list
            )
            state.last_blocking_gate = gate_id
        _log(f"[JSON_ENFORCER] {_json_path.name}: decision={_vdata['decision']} route={auto_route}")
    except VerdictParseError as e:
        _log(f"[JSON_ENFORCER] Parse failed: {e}")
        if "NO_JSON_BLOCK" not in str(e):
            state.gate_state = "MANUAL_ROUTING_REQUIRED"
            state.save()
            return
        _json_path = None  # fall through to legacy

# Legacy path (no JSON block present)
if not _json_path:
    auto_route, _verdict_file = _extract_route_recommendation(gate_id, state.work_package_id)
```

### Step 3.3 — Add JSON verdict instruction to validation gate prompts

In the prompt generators for GATE_0 and GATE_1, add this instruction block (substitute `GATE_0` / `GATE_1` as appropriate):

```python
_JSON_VERDICT_BLOCK = (
    f"## MANDATORY: JSON Verdict Block\n\n"
    f"Your verdict file MUST begin with this JSON block as the first content:\n\n"
    f"```json\n"
    f"{{\n"
    f'  "gate_id": "{gate_id}",\n'
    f'  "decision": "PASS",\n'
    f'  "blocking_findings": [],\n'
    f'  "route_recommendation": null,\n'
    f'  "summary": "One sentence summary"\n'
    f"}}\n"
    f"```\n\n"
    f"For BLOCK_FOR_FIX:\n\n"
    f"```json\n"
    f"{{\n"
    f'  "gate_id": "{gate_id}",\n'
    f'  "decision": "BLOCK_FOR_FIX",\n'
    f'  "blocking_findings": [\n'
    f'    {{"id": "BF-01", "description": "...", "evidence": "path/file.py:42"}}\n'
    f'  ],\n'
    f'  "route_recommendation": "doc",\n'
    f'  "summary": "N blockers. [summary]"\n'
    f"}}\n"
    f"```\n\n"
    f"**Rules:** JSON block must be first. Detailed analysis follows after the block.\n\n"
)
```

### Phase 3 done — report this checklist to Nimrod:

```
PHASE 3 COMPLETE — Team 61 checklist:
□ json_enforcer.py created at agents_os_v2/orchestrator/json_enforcer.py
□ enforce_json_verdict() returns correct dict for valid JSON verdict
□ enforce_json_verdict() raises VerdictParseError for malformed JSON
□ has_json_verdict_block() returns True/False correctly
□ pipeline.py advance() uses json_enforcer when JSON block detected
□ Legacy regex fallback still works for files without JSON block
□ GATE_0 prompt contains JSON verdict instruction block
□ GATE_1 prompt contains JSON verdict instruction block
```

---

## PHASE 4 — Auto-Correction + STATE_VIEW.json + Gate Aliases
**Prerequisite:** Phase 3 approved by Nimrod
**Estimated size:** Small (~80 lines added)

### Step 4.1 — Date correction function in `pipeline_run.sh`

Open `pipeline_run.sh`. Find a good location near the top helper functions. Add:

```bash
# ── Pre-flight date correction (S003-P010-WP001 Ph4) ─────────────────────
_preflight_date_correction() {
    local f="$1"
    [[ -f "$f" ]] || return 0
    local today; today=$(date -u +%F)
    sed -i.bak "s/^\(date: \)[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}$/\1${today}/" "$f"
    sed -i.bak "s/| date | [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\} |/| date | ${today} |/g" "$f"
    rm -f "${f}.bak"
}
```

Call this before the ▼▼▼ block is displayed — look for where prompts are written and shown to the user. A good place is right after `_save_prompt()` is called:

```bash
# Auto-correct date in artifact before displaying
if [[ -n "${SPEC_PATH:-}" && -f "$SPEC_PATH" ]]; then
    _preflight_date_correction "$SPEC_PATH"
fi
```

### Step 4.2 — `_write_state_view()` in `pipeline.py`

Add this function to `pipeline.py`:

```python
def _write_state_view(state: "PipelineState") -> None:
    """Write STATE_VIEW.json — compact summary. Non-blocking (never crashes pipeline)."""
    try:
        gate_cfg = GATE_CONFIG.get(state.current_gate, {})
        owner = (
            _domain_gate_owner(state.current_gate, state.project_domain)
            or gate_cfg.get("owner", "")
        )
        rc = getattr(state, "remediation_cycle_count", 0)
        gs = getattr(state, "gate_state", None)
        health = (
            "IDLE"   if not state.current_gate or state.current_gate == "COMPLETE"
            else "RED"    if gs == "MANUAL_ROUTING_REQUIRED"
            else "YELLOW" if rc > 0
            else "GREEN"
        )
        wp = state.work_package_id or ""
        view = {
            "schema_version": "1.0.0",
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "domain": state.project_domain,
            "work_package_id": wp,
            "stage_id": state.stage_id,
            "program_id": wp.rsplit("-WP", 1)[0] if "-WP" in wp else "",
            "current_gate": state.current_gate,
            "gate_display_name": gate_cfg.get("desc", ""),
            "gate_owner": owner,
            "gates_completed": list(state.gates_completed),
            "gates_failed": list(state.gates_failed),
            "remediation_cycle_count": rc,
            "last_blocking_gate": getattr(state, "last_blocking_gate", None) or None,
            "pipeline_health": health,
            "current_phase": getattr(state, "current_phase", 0),
            "total_phases": getattr(state, "total_phases", 0),
            "next_action": {"description": gate_cfg.get("desc",""), "owner": owner, "engine": gate_cfg.get("engine","")},
            "flags": {
                "manual_routing_required": gs == "MANUAL_ROUTING_REQUIRED",
                "remediation_active": rc > 0,
                "waiting_human_approval": state.current_gate in ("WAITING_GATE2_APPROVAL", "GATE_7"),
            },
        }
        out = AGENTS_OS_OUTPUT_DIR / "STATE_VIEW.json"
        out.write_text(json.dumps(view, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception:
        pass  # never crash the pipeline for a state view failure
```

In `state.py`, add a call at the end of `save()`:

```python
def save(self):
    # ... existing save code ...
    # After writing pipeline_state JSON, update STATE_VIEW
    try:
        from .pipeline import _write_state_view
        _write_state_view(self)
    except Exception:
        pass
```

### Step 4.3 — Gate aliases

In `pipeline.py`, after `GATE_SEQUENCE`, add:

```python
# Gate name aliases — non-breaking (S003-P010-WP001 Ph4)
# Identity mapping for now; S004 will do the full rename.
GATE_ALIASES: dict[str, str] = {
    "G3_PLAN":               "G3_PLAN",
    "G3_5":                  "G3_5",
    "G3_6_MANDATES":         "G3_6_MANDATES",
    "G3_REMEDIATION":        "G3_REMEDIATION",
    "CURSOR_IMPLEMENTATION": "CURSOR_IMPLEMENTATION",
}

def _resolve_gate_alias(gate_id: str) -> str:
    return GATE_ALIASES.get(gate_id, gate_id)
```

### Phase 4 done — report this checklist to Nimrod:

```
PHASE 4 COMPLETE — Team 61 checklist:
□ _preflight_date_correction() added to pipeline_run.sh
□ Function tested: corrects date: 2026-01-01 → today's date
□ Function tested: does NOT modify any other field
□ _write_state_view() added to pipeline.py
□ STATE_VIEW.json generated at _COMMUNICATION/agents_os/STATE_VIEW.json after save()
□ STATE_VIEW.json is valid JSON
□ pipeline_health = GREEN when no failures
□ _write_state_view() failure does NOT raise (exception swallowed)
□ GATE_ALIASES dict and _resolve_gate_alias() added to pipeline.py
```

---

## FINAL SPRINT CHECKLIST (report to Nimrod after Phase 4)

```
S003-P010-WP001 SPRINT COMPLETE — Team 61 final report:

PHASE 1 — State Infrastructure:
□ 5 new PipelineState fields (3 remediation + 2 phase tracking)
□ JSON round-trip verified

PHASE 2 — Remediation Engine:
□ _generate_remediation_mandate() implemented
□ CURSOR_IMPLEMENTATION remediation-aware
□ remediation_mandates.md generated on FAIL cycle
□ FAIL_ROUTING: GATE_4/GATE_5 full → G3_PLAN
□ team_50 guard in implementation mandate generation
□ G3_REMEDIATION gate added

PHASE 3 — JSON Verdict Protocol:
□ json_enforcer.py created and tested
□ pipeline.py uses json_enforcer when JSON block detected
□ Legacy regex fallback preserved
□ GATE_0/GATE_1 prompts include JSON verdict instruction

PHASE 4 — Auto-Correction + STATE_VIEW:
□ _preflight_date_correction() in pipeline_run.sh
□ STATE_VIEW.json generated on every save()
□ GATE_ALIASES and _resolve_gate_alias() added

REGRESSIONS:
□ ./pipeline_run.sh --domain agents_os status — works
□ ./pipeline_run.sh --domain agents_os — generates GATE_0 prompt without error
□ All existing pipeline tests pass (if applicable)
```

---

**log_entry | TEAM_00 | SPRINT_MANDATE_TEAM_61 | S003_P010_WP001_ISSUED | 2026-03-19**
