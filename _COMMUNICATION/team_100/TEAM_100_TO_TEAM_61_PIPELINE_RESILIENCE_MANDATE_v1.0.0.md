---
project_domain: AGENTS_OS
id: TEAM_100_TO_TEAM_61_PIPELINE_RESILIENCE_MANDATE_v1.0.0
from: Team 100 (AOS Domain Architects)
to: Team 61 (Cursor Implementation Team)
cc: Team 00 (Chief Architect), Team 101 (IDE Architecture Authority)
date: 2026-03-17
historical_record: true
status: ACTIVE — AWAITING_IMPLEMENTATION
authority: LOD400 FINALIZED — Team 00 APPROVED 2026-03-17
lod400_ref: TEAM_100_PIPELINE_RESILIENCE_LOD400_DRAFT_v1.0.0
program: S003-PXX-WP001 (registry assignment pending — use this WP ID once assigned by Team 00)
priority: HIGH
---

# Mandate — Team 61 | Pipeline Resilience Implementation
## Issued by Team 100 (AOS Domain Architects)

---

## Your Identity in This Mandate

You are **Team 61 (Cursor Implementation Team)**. You implement exactly what is specified here — no scope additions, no "improvements", no refactoring beyond the stated items. The architecture is set. Your role is precise, faithful execution.

**This mandate covers 3 implementation items.** Items 4a and 4b are already implemented — confirmed via code read. Do NOT touch them.

---

## Pre-Implementation Checklist

Before writing any code:
- [ ] Read `_COMMUNICATION/team_100/TEAM_100_PIPELINE_RESILIENCE_LOD400_DRAFT_v1.0.0.md` — full spec
- [ ] Confirm working branch: create `feature/pipeline-resilience-S003-PXX` from HEAD
- [ ] Verify current `pipeline_run.sh` line counts match: `_auto_store_gate1_artifact()` starts ~line 147; `_auto_store_g3plan_artifact()` starts ~line 209

---

## Item 1 — File Path Resolution Hardening

### Files to Modify
- `pipeline_run.sh` — `_auto_store_gate1_artifact()` and `_auto_store_g3plan_artifact()` functions

### What Must Change

**In `_auto_store_gate1_artifact()`**, replace the Python inline script (currently lines 153–188) with the following:

```python
import sys, os, json, glob, time
from datetime import datetime, timezone

domain = os.environ.get('PIPELINE_DOMAIN') or None
if domain == 'agents_os':
    sf = '_COMMUNICATION/agents_os/pipeline_state_agentsos.json'
elif domain == 'tiktrack':
    sf = '_COMMUNICATION/agents_os/pipeline_state_tiktrack.json'
else:
    sf = '_COMMUNICATION/agents_os/pipeline_state.json'

try:
    state = json.loads(open(sf).read())
except Exception:
    sys.exit(0)

if state.get('current_gate') != 'GATE_1':
    sys.exit(0)

wp = state.get('work_package_id', '')
if not wp:
    sys.exit(0)

# Activation-date guard
wp_activated_at = state.get('last_updated', '')
try:
    activation_dt = datetime.fromisoformat(wp_activated_at.replace('Z', '+00:00'))
    activation_ts = activation_dt.timestamp()
except Exception:
    activation_ts = None

now = time.time()
cutoff_48h = now - (48 * 3600)

wp_fs = wp.replace('-', '_')

# ── Tier 1: canonical path, mtime-based sort ───────────────────────────
pattern1 = f'_COMMUNICATION/team_170/TEAM_170_{wp_fs}_LLD400_v*.md'
candidates = glob.glob(pattern1)
tier2_used = False

# ── Tier 2: full _COMMUNICATION/ tree scan (silent + stderr warning) ───
if not candidates:
    wp_fragment = wp_fs[-8:] if len(wp_fs) >= 8 else wp_fs
    pattern2 = f'_COMMUNICATION/**/TEAM_170_*{wp_fragment}*LLD400*.md'
    candidates = glob.glob(pattern2, recursive=True)
    if candidates:
        tier2_used = True

def is_recent(path):
    try:
        mtime = os.path.getmtime(path)
        if mtime < cutoff_48h:
            return False
        if activation_ts and mtime < activation_ts:
            return False
        return True
    except Exception:
        return False

recent = [f for f in candidates if is_recent(f)]

# If nothing passes time filter, use all candidates with a warning
if not recent and candidates:
    recent = candidates
    print('WARNING:mtime_unverified', file=sys.stderr)

if not recent:
    print('NO_FILE')
    sys.exit(0)

# Sort by mtime descending — newest wins
recent.sort(key=lambda f: os.path.getmtime(f), reverse=True)
latest = recent[0]

if tier2_used:
    print(f'TIER2:{latest}', file=sys.stderr)

try:
    content = open(latest).read()
except Exception:
    sys.exit(0)

current = state.get('lld400_content', '')
if content.strip() == current.strip():
    print(f'ALREADY_STORED:{latest}')
    sys.exit(0)

print(f'STORE:{latest}')
```

**Update the NO_FILE shell handler** (the `elif [[ "$result" == NO_FILE ]]` block) to include the Tier 3 hint:
```bash
elif [[ "$result" == NO_FILE ]]; then
    echo ""
    echo "  ⚠️  GATE_1: No LLD400 file found for this WP."
    echo "  Searched: _COMMUNICATION/team_170/ (Tier 1) + full _COMMUNICATION/ tree (Tier 2)."
    echo "  Team 170 must produce the LLD400 first."
    echo "  If file exists at a non-standard path, store it manually (Tier 3):"
    echo "    ./pipeline_run.sh ${DOMAIN_FLAG_STR:-}store GATE_1 _COMMUNICATION/team_170/<LLD400_FILE>.md"
    echo ""
fi
```

**In `_auto_store_g3plan_artifact()`**, apply the identical structural change:
- Pattern 1: `_COMMUNICATION/team_10/TEAM_10_{wp_fs}_G3_PLAN_WORK_PLAN_v*.md`
- Pattern 2: `_COMMUNICATION/**/TEAM_10_*{wp_fragment}*G3_PLAN*WORK_PLAN*.md`
- Same mtime sort, 48h filter, activation-date guard, NO_FILE Tier 3 hint (referencing `store G3_PLAN`)
- Gate check: `current_gate != 'G3_PLAN'`
- State field: `work_plan` (not `lld400_content`)

### Item 1 Acceptance Criteria
- `AC-1-01`: Tier 1 match finds file correctly in `_COMMUNICATION/team_170/` ✓
- `AC-1-02`: When Tier 1 empty — Tier 2 finds file in non-standard location ✓
- `AC-1-03`: Tier 2 match emits stderr output `TIER2:<path>` ✓
- `AC-1-04`: File older than 48h AND older than `last_updated` → `NO_FILE` ✓
- `AC-1-05`: Newest file by mtime selected when multiple candidates exist ✓
- `AC-1-06`: `NO_FILE` output includes `store` CLI example ✓
- `AC-1-07`: `ALREADY_STORED` produces no stdout output ✓
- `AC-1-08`: `_auto_store_g3plan_artifact()` has identical logic ✓

---

## Item 2 — WSM Auto-Write Module

### Files to Create / Modify

**CREATE:** `agents_os_v2/orchestrator/wsm_writer.py`

**MODIFY:** `agents_os_v2/orchestrator/pipeline.py` — integrate `write_wsm_state()` call in `advance()`

### 2.1 Create `agents_os_v2/orchestrator/wsm_writer.py`

Full module content — implement exactly:

```python
"""
wsm_writer.py — Automatic WSM state table updater.

Writes pipeline state changes to CURRENT_OPERATIONAL_STATE table in the WSM.
Appends log_entry lines. NEVER rewrites or deletes existing log_entry lines.

Safety constraints (Iron Rules for this module):
1. Only modifies | Field | Value | table rows.
2. log_entry lines are append-only — never touched by regex replacement.
3. Fires only when gate_state is None (not mid-PASS_WITH_ACTION cycle).
4. Idempotent — if computed values equal current values, no write occurs.
5. Non-blocking failures — if WSM field not found, emit WARN event and return.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from ..config import REPO_ROOT

WSM_PATH = REPO_ROOT / "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md"

# Canonical fields in the CURRENT_OPERATIONAL_STATE table that we manage.
# Order matters for the idempotency check — must match WSM table field names exactly.
_MANAGED_FIELDS = [
    "active_flow",
    "active_work_package_id",
    "in_progress_work_package_id",
    "last_closed_work_package_id",
    "current_gate",
    "active_program_id",
    "phase_owner_team",
    "next_required_action",
    "next_responsible_team",
]


def _extract_program_id(work_package_id: str) -> str:
    """Derive program ID from WP ID. S002-P005-WP001 → S002-P005."""
    parts = work_package_id.rsplit("-WP", 1)
    return parts[0] if len(parts) == 2 else work_package_id


def _compute_fields(state, gate_id: str, result: str, next_gate: str) -> dict[str, str]:
    """Compute all managed WSM field values from pipeline state."""
    wp = state.work_package_id or "NONE"
    program = _extract_program_id(wp) if wp != "NONE" else "NONE"
    is_closed = (gate_id == "GATE_8" and result == "PASS")

    from .pipeline import GATE_CONFIG
    phase_owner = GATE_CONFIG.get(next_gate, {}).get("owner", "team_00")
    next_owner = GATE_CONFIG.get(next_gate, {}).get("owner", "team_00")

    if is_closed:
        return {
            "active_flow":                   f"NONE — {wp} DOCUMENTATION_CLOSED ({datetime.now(timezone.utc).strftime('%Y-%m-%d')})",
            "active_work_package_id":         "NONE",
            "in_progress_work_package_id":    "NONE",
            "last_closed_work_package_id":    f"{wp} (GATE_8 PASS {datetime.now(timezone.utc).strftime('%Y-%m-%d')})",
            "current_gate":                  "NONE — S003 activation pending",
            "active_program_id":             "NONE",
            "phase_owner_team":              "Team 00 (S003 activation authority)",
            "next_required_action":          f"S003 activation decision; S003-P001 test flight candidate",
            "next_responsible_team":         "Team 00",
        }
    else:
        return {
            "active_flow":                   f"{wp} {gate_id} {result} → {next_gate}",
            "active_work_package_id":         wp,
            "in_progress_work_package_id":    wp,
            "last_closed_work_package_id":    state.work_package_id or "NONE",  # unchanged
            "current_gate":                  next_gate,
            "active_program_id":             program,
            "phase_owner_team":              phase_owner,
            "next_required_action":          f"Advance {next_gate} — see gate prompt",
            "next_responsible_team":         next_owner,
        }


def _update_table_field(text: str, field_name: str, new_value: str) -> tuple[str, bool]:
    """
    Update a single | field | value | row in the WSM table.
    Returns (updated_text, changed: bool).
    Raises ValueError if field not found or found more than once.
    """
    pattern = rf'(\|\s*{re.escape(field_name)}\s*\|)[^\|]+'
    replacement = rf'\1 {new_value} '
    new_text, count = re.subn(pattern, replacement, text)
    if count == 0:
        raise ValueError(f"WSM field '{field_name}' not found")
    if count > 1:
        raise ValueError(f"WSM field '{field_name}' found {count} times — ambiguous")
    changed = new_text != text
    return new_text, changed


def _append_log_entry(text: str, entry_body: str) -> str:
    """
    Append a **log_entry | ... | ...** line at the end of the document.
    NEVER replaces existing lines.
    """
    log_line = f'\n**log_entry | {entry_body}**'
    return text.rstrip() + log_line + "\n"


def write_wsm_state(state, gate_id: str, result: str, next_gate: str) -> None:
    """
    Main entry point. Called from pipeline.py advance() after state.save().

    Args:
        state:     PipelineState object (already saved)
        gate_id:   The gate that was just advanced (e.g. "GATE_1")
        result:    "PASS" | "FAIL" | "APPROVE"
        next_gate: The gate now active after advancement
    """
    # Constraint 3: do not write mid-PASS_WITH_ACTION cycle
    if state.gate_state is not None:
        return

    if not WSM_PATH.exists():
        _emit_warn_event(state, f"WSM not found at {WSM_PATH}")
        return

    try:
        original_text = WSM_PATH.read_text(encoding="utf-8")
    except Exception as e:
        _emit_warn_event(state, f"WSM read failed: {e}")
        return

    target_fields = _compute_fields(state, gate_id, result, next_gate)

    # Idempotency check: extract current values and compare
    text = original_text
    any_changed = False

    for field_name, new_value in target_fields.items():
        try:
            text, changed = _update_table_field(text, field_name, new_value)
            if changed:
                any_changed = True
        except ValueError as e:
            # Non-blocking: emit warning and continue with other fields
            _emit_warn_event(state, str(e))
            continue

    if not any_changed:
        return  # Idempotent — nothing to write

    # Append log_entry
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    entry_body = f"PIPELINE_AUTO | {gate_id}_{result} | {state.work_package_id} | {ts}"
    text = _append_log_entry(text, entry_body)

    try:
        WSM_PATH.write_text(text, encoding="utf-8")
    except Exception as e:
        _emit_warn_event(state, f"WSM write failed: {e}")


def _emit_warn_event(state, message: str) -> None:
    """Emit a WARN event to pipeline_events.jsonl. Non-blocking."""
    try:
        from .log_events import append_event
        from datetime import datetime, timezone
        append_event({
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "pipe_run_id": getattr(state, "pipe_run_id", "unknown"),
            "event_type": "WSM_WRITE_WARN",
            "domain": getattr(state, "project_domain", "unknown"),
            "stage_id": getattr(state, "stage_id", ""),
            "work_package_id": getattr(state, "work_package_id", ""),
            "gate": "",
            "agent_team": "team_100_wsm_writer",
            "severity": "WARN",
            "description": f"WSM auto-write warning: {message}",
            "metadata": {"source": "wsm_writer.py"},
        })
    except Exception:
        pass  # Never let wsm_writer failure cascade to pipeline
```

### 2.2 Integrate into `pipeline.py`

In the `advance()` function (or its equivalent), locate the block where `state.save()` is called after a gate result is recorded. **After `state.save()`**, add:

```python
# WSM auto-write: update state table and append log_entry
try:
    from .wsm_writer import write_wsm_state
    write_wsm_state(state, gate_id, result, state.current_gate)
except Exception:
    pass  # wsm_writer failure must never block pipeline operation
```

The `try/except` wrapper is mandatory — `wsm_writer` must NEVER cause a pipeline exception. All internal errors are handled within the module via `_emit_warn_event`.

### Item 2 Acceptance Criteria
- `AC-2-01`: After `./pipeline_run.sh pass` at any gate, WSM `current_gate` field reflects new gate ✓
- `AC-2-02`: After GATE_8 PASS, WSM shows `active_work_package_id = NONE` ✓
- `AC-2-03`: Existing log_entry lines in WSM are never modified — only new ones appended ✓
- `AC-2-04`: When `gate_state = "PASS_WITH_ACTION"`, WSM write is skipped (no change to file) ✓
- `AC-2-05`: Identical consecutive runs produce no file change (idempotent) ✓
- `AC-2-06`: Missing WSM field emits WARN event to `pipeline_events.jsonl`, does not raise ✓
- `AC-2-07`: `wsm_writer.py` failure never propagates to pipeline — outer try/except catches all ✓

---

## Item 3 — Targeted Git Operations

### Files to Modify
- `pipeline_run.sh` — `pass` case block

### 3.1 Pre-GATE_4: Uncommitted Change Detection

In the `pass)` case of `pipeline_run.sh`, inside the `case "$GATE" in` block (after the existing `GATE_1` and `G3_PLAN` cases), add:

```bash
CURSOR_IMPLEMENTATION)
    UNCOMMITTED=$(git -C "$REPO" status --porcelain 2>/dev/null | grep -v "^??" | grep -v "^!!" || true)
    if [ -n "$UNCOMMITTED" ]; then
        echo ""
        echo "════════════════════════════════════════════════════════════════════"
        echo "  ⚠️  UNCOMMITTED CHANGES — Advance to GATE_4 blocked"
        echo "  The following tracked changes must be committed before QA:"
        echo ""
        echo "$UNCOMMITTED" | while IFS= read -r line; do
            echo "    $line"
        done
        echo ""
        echo "  Team 191 commit command (replace [WP_ID] and list files explicitly):"
        echo "    git add <files-listed-above>"
        echo "    git commit -m \"impl: [WP_ID] implementation complete\""
        echo ""
        echo "  ⛔  'git add .' is PROHIBITED — specify every file explicitly"
        echo "  Retry after commit:"
        echo "    ./pipeline_run.sh ${DOMAIN_FLAG_STR:-}pass"
        echo "════════════════════════════════════════════════════════════════════"
        echo ""
        VALIDATION_FAILED=1
        MISSING_ARTIFACTS="CURSOR_IMPLEMENTATION: uncommitted tracked changes detected — commit before GATE_4"
    fi
    ;;
```

**Important:** Set `VALIDATION_FAILED=1` and `MISSING_ARTIFACTS=...` so the existing advance-block guard (`if [ "$VALIDATION_FAILED" -eq 1 ]`) handles the exit. Do NOT add a separate `exit 1` — let the existing pattern handle it uniformly.

### 3.2 GATE_8: Closure Push Checklist

After the `$CLI --advance "$GATE" PASS` line in the `pass)` case, add:

```bash
# GATE_8 PASS: display Team 191 closure push checklist
if [[ "$GATE" == "GATE_8" ]]; then
    echo ""
    echo "  ────────────────────────────────────────────────────────────────"
    echo "  📦 GATE_8 PASS — Closure Push Checklist for Team 191"
    echo ""
    echo "  1. Identify closure packet files (from Team 70 AS_MADE_REPORT"
    echo "     and Team 90 GATE_8 verdict document)"
    echo "  2. Stage only those files explicitly:"
    echo "     git add <team_70_as_made_file.md> <team_90_gate8_verdict.md> ..."
    echo "  3. Commit:"
    echo "     git commit -m \"closure: [WP_ID] GATE_8 DOCUMENTATION_CLOSED\""
    echo "  4. Push:"
    echo "     git push origin HEAD"
    echo ""
    echo "  ⛔  'git add .' is PROHIBITED — list closure files only"
    echo "  ────────────────────────────────────────────────────────────────"
fi
```

Place this block **before** the `NEXT_GATE=$(_get_gate)` line to ensure it renders before the next gate prompt.

### Item 3 Acceptance Criteria
- `AC-3-01`: At CURSOR_IMPLEMENTATION gate, `pass` with uncommitted tracked changes → BLOCKED with file list ✓
- `AC-3-02`: At CURSOR_IMPLEMENTATION gate, `pass` with clean working tree → proceeds normally ✓
- `AC-3-03`: Untracked files (`??`) and ignored files (`!!`) do NOT trigger the block ✓
- `AC-3-04`: After GATE_8 PASS: Team 191 closure push checklist is displayed ✓
- `AC-3-05`: Neither block uses `git add .` or suggests it ✓
- `AC-3-06`: Both commit message templates contain `[WP_ID]` placeholder ✓

---

## Items 4a + 4b — DO NOT MODIFY

**Item 4a (route aliases):** `_ROUTE_ALIAS` in `pipeline.py` lines 718–719 already contains `"artifacts_only": "doc"` and `"full_cycle": "full"`. Confirmed. No change needed.

**Item 4b (parser hardening):** `_extract_route_recommendation()` in `pipeline.py` lines 726–730 already uses `re.IGNORECASE` without `re.MULTILINE`. Applied by Team 101 Architectural Hotfix. Confirmed. No change needed.

**Do not touch either of these.** Any modification to these functions outside this mandate is unauthorized.

---

## Deliverable Contract

Upon completion, Team 61 submits to `_COMMUNICATION/team_61/`:

```
TEAM_61_PIPELINE_RESILIENCE_IMPLEMENTATION_REPORT_v1.0.0.md
```

Must contain:
1. Exact lines modified in `pipeline_run.sh` (before/after for `_auto_store_gate1_artifact()`, `_auto_store_g3plan_artifact()`, `pass` case additions)
2. Confirmation `agents_os_v2/orchestrator/wsm_writer.py` created — file path + line count
3. Confirmation integration in `pipeline.py` — exact line of insertion
4. Self-assessment against all ACs (AC-1-01..08, AC-2-01..07, AC-3-01..06)
5. Items NOT touched: 4a, 4b — explicit confirmation

---

## Gate Sequence for This WP

```
GATE_0 → GATE_1 → GATE_2 → G3_PLAN → G3_5 → G3_6_MANDATES →
CURSOR_IMPLEMENTATION → GATE_4 → GATE_5 → GATE_6 (dual-arch: Team 100 + Team 101) →
GATE_7 → GATE_8
```

QA team: **Team 50**
GATE_5 validator: **Team 190**
GATE_6 (dual): **Team 100 + Team 101** — see `DUAL_GATE_6_PROTOCOL_TEMPLATE_v1.0.0.md`

---

**log_entry | TEAM_100 | TO_TEAM_61 | PIPELINE_RESILIENCE_MANDATE | v1.0.0 | ISSUED | 2026-03-17**
