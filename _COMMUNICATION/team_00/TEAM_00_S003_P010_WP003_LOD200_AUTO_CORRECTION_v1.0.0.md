---
project_domain: AGENTS_OS
id: TEAM_00_S003_P010_WP003_LOD200_AUTO_CORRECTION_v1.0.0
historical_record: true
from: Team 00 (Chief Architect — Nimrod)
to: Team 100, Team 190, Team 170
cc: Team 61, Team 10
date: 2026-03-19
status: LOD200 — APPROVED FOR GATE_0
authority: ARCHITECT_DIRECTIVE_AOS_ROADMAP_RESET_v1.0.0
depends_on: S003-P010-WP002 GATE_8---

## Mandatory Identity Header

| Field | Value |
|---|---|
| stage_id | S003 |
| program_id | S003-P010 |
| work_package_id | S003-P010-WP003 |
| gate_id | pre-GATE_0 |
| project_domain | AGENTS_OS |

---

## §1 — Work Package Overview

**Name:** Auto-Correction + STATE_VIEW.json + Gate Aliases

**One sentence:** Eliminate token-waste correction cycles caused by stale dates and missing state visibility; produce a runtime-readable state summary file; add non-breaking gate aliases to reduce naming drift friction.

**Source problems (from IDEA-040 Pillar 5 + S003-P008 scope):**
1. The most common BLOCK_FOR_FIX finding across all pipelines: stale `date:` field in mandatory identity headers. A high-tier LLM blocked for a timestamp is architectural waste.
2. Dashboard + external agents have no compact, always-fresh file summarizing pipeline state outside of `pipeline_state_{domain}.json` (which is implementation-detail heavy)
3. Gate naming drift (G3_PLAN, G3_5, CURSOR_IMPLEMENTATION) confuses operators and LLMs reading instructions

---

## §2 — Deliverables

### D-01: Pre-Flight Auto-Correction Hook

**Location:** Called in `pipeline_run.sh` (or `pipeline.py`) before any gate prompt is submitted to a validation LLM.

**Scope:** Auto-correct ONLY the `date:` field in the mandatory identity header of artifact files. No other fields may be auto-corrected.

**Algorithm:**
```bash
# pipeline_run.sh — pre-flight hook, called before every gate prompt generation
_preflight_date_correction() {
    local artifact_file="$1"
    if [[ -f "$artifact_file" ]]; then
        local today
        today=$(date -u +%F)
        # Correct: "date: YYYY-MM-DD" line in YAML frontmatter or identity table
        sed -i.bak "s/^\(date:\s*\)[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}/\1${today}/" "$artifact_file"
        sed -i.bak "s/| date | [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\} |/| date | ${today} |/" "$artifact_file"
        rm -f "${artifact_file}.bak"
    fi
}
```

**Iron rules for auto-correction:**
1. Auto-correction applies ONLY to `date:` field — never to `gate_id`, `decision`, `work_package_id`, or any other field
2. Auto-correction is logged to `pipeline_events.jsonl` with event type `PREFLIGHT_DATE_CORRECTION`
3. Auto-correction fires silently — no prompt, no user interaction, no gate delay
4. If artifact file does not exist (not yet written by agent) → hook is a no-op

**Integration point:** Called between `_auto_store_gate1_artifact()` and the gate prompt display in `pipeline_run.sh`.

---

### D-02: `STATE_VIEW.json` Generator

**Purpose:** A compact, always-fresh JSON file summarizing the current pipeline state for Dashboard and external agent consumption. Designed to be readable without knowledge of `pipeline_state_{domain}.json` internals.

**Location:** `_COMMUNICATION/agents_os/STATE_VIEW.json` (domain-specific)

**Schema:**
```json
{
  "schema_version": "1.0.0",
  "generated_at": "2026-03-19T14:30:00Z",
  "domain": "agents_os",
  "work_package_id": "S003-P010-WP001",
  "stage_id": "S003",
  "program_id": "S003-P010",
  "current_gate": "GATE_1",
  "gate_display_name": "LLD400 Validation",
  "gate_owner": "team_190",
  "gates_completed": ["GATE_0"],
  "gates_failed": [],
  "remediation_cycle_count": 0,
  "last_blocking_gate": null,
  "pipeline_health": "GREEN",
  "next_action": {
    "description": "Team 190 validates LLD400 spec",
    "owner": "team_190",
    "engine": "codex",
    "prompt_file": "_COMMUNICATION/agents_os/prompts/agentsos_GATE_1_prompt.md"
  },
  "flags": {
    "manual_routing_required": false,
    "remediation_active": false,
    "waiting_human_approval": false
  }
}
```

**`pipeline_health` values:**
- `GREEN` — pipeline advancing normally
- `YELLOW` — in remediation cycle (`remediation_cycle_count > 0`)
- `RED` — `MANUAL_ROUTING_REQUIRED` or gate frozen
- `IDLE` — no active WP

**Generation trigger:** `STATE_VIEW.json` is regenerated on every `pipeline.py` `save()` call. It is a derived file — never edited manually.

**Python generator function** (in `pipeline.py`):
```python
def _write_state_view(state: PipelineState) -> None:
    """Write STATE_VIEW.json — compact dashboard-readable summary."""
    gate_cfg = GATE_CONFIG.get(state.current_gate, {})
    effective_owner = _domain_gate_owner(state.current_gate, state.project_domain) or gate_cfg.get("owner", "")
    health = "IDLE"
    if state.current_gate:
        if state.gate_state == "MANUAL_ROUTING_REQUIRED":
            health = "RED"
        elif state.remediation_cycle_count > 0:
            health = "YELLOW"
        else:
            health = "GREEN"
    view = {
        "schema_version": "1.0.0",
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "domain": state.project_domain,
        "work_package_id": state.work_package_id,
        "stage_id": state.stage_id,
        "program_id": state.work_package_id.rsplit("-WP", 1)[0] if state.work_package_id else "",
        "current_gate": state.current_gate,
        "gate_display_name": gate_cfg.get("desc", ""),
        "gate_owner": effective_owner,
        "gates_completed": state.gates_completed,
        "gates_failed": state.gates_failed,
        "remediation_cycle_count": state.remediation_cycle_count,
        "last_blocking_gate": state.last_blocking_gate or None,
        "pipeline_health": health,
        "next_action": {
            "description": gate_cfg.get("desc", ""),
            "owner": effective_owner,
            "engine": gate_cfg.get("engine", ""),
            "prompt_file": str(AGENTS_OS_OUTPUT_DIR / "prompts" / f"{state.project_domain}_{state.current_gate}_prompt.md"),
        },
        "flags": {
            "manual_routing_required": state.gate_state == "MANUAL_ROUTING_REQUIRED",
            "remediation_active": state.remediation_cycle_count > 0,
            "waiting_human_approval": state.current_gate in ("WAITING_GATE2_APPROVAL", "GATE_7"),
        },
    }
    state_view_path = AGENTS_OS_OUTPUT_DIR / "STATE_VIEW.json"
    state_view_path.write_text(json.dumps(view, indent=2, ensure_ascii=False), encoding="utf-8")
```

---

### D-03: Gate Name Aliases (non-breaking)

**Problem:** `G3_PLAN`, `G3_5`, `G3_6_MANDATES`, `CURSOR_IMPLEMENTATION` violate the `GATE_X` naming convention. Full renaming is a breaking change that requires updates to all historical documents, prompt archives, and operator muscle memory.

**Solution:** Non-breaking aliases — both names resolve to the same gate config. Full canonical renaming is deferred to S004.

**Python implementation (in pipeline.py):**
```python
# Non-breaking aliases — resolve legacy names to canonical internal names
# Full gate renaming deferred to S004 (breaking change)
GATE_ALIASES: dict[str, str] = {
    "G3_PLAN":            "GATE_3",    # canonical: GATE_3
    "G3_5":               "GATE_3_5",  # canonical: GATE_3_5
    "G3_6_MANDATES":      "GATE_3_6",  # canonical: GATE_3_6
    "G3_REMEDIATION":     "GATE_3_7",  # canonical: GATE_3_7 (new in WP001)
    "CURSOR_IMPLEMENTATION": "GATE_3_IMPL",  # canonical: GATE_3_IMPL
}
```

**Iron rule:** Both the legacy name AND the alias are accepted in all CLI commands, pipeline_state files, and dashboard reads. Internal code uses the canonical name; external-facing output (prompts, WSM, Dashboard) continues to use the legacy name until S004.

---

## §3 — Files Modified

| File | Change | Description |
|---|---|---|
| `pipeline_run.sh` | ADD | `_preflight_date_correction()` function; call before gate prompt display |
| `agents_os_v2/orchestrator/pipeline.py` | ADD | `_write_state_view()` function; call from `PipelineState.save()` |
| `agents_os_v2/orchestrator/pipeline.py` | ADD | `GATE_ALIASES` dict; resolve aliases in `advance()` and `generate_prompt()` |
| `agents_os_v2/orchestrator/state.py` | MODIFY | `save()` calls `_write_state_view(self)` after writing JSON |
| `_COMMUNICATION/agents_os/STATE_VIEW.json` | CREATED | Auto-generated on each pipeline save |

---

## §4 — Acceptance Criteria

| AC | Criterion |
|---|---|
| AC-01 | `_preflight_date_correction()` updates a stale `date: 2026-03-01` to today's date |
| AC-02 | Auto-correction fires silently; appears in `pipeline_events.jsonl` |
| AC-03 | Auto-correction does NOT modify any field other than `date:` |
| AC-04 | `STATE_VIEW.json` exists and is valid JSON after first pipeline `save()` |
| AC-05 | `pipeline_health` = `GREEN` / `YELLOW` / `RED` / `IDLE` correctly reflects state |
| AC-06 | `./pipeline_run.sh --domain agents_os G3_PLAN` equivalent to `GATE_3` (alias resolves) |
| AC-07 | Historical files with `G3_PLAN` in pipeline_state still load without error |

---

**log_entry | TEAM_00 | LOD200_P010_WP003 | AUTO_CORRECTION_STATE_VIEW_ALIASES_SPEC_APPROVED | 2026-03-19**
