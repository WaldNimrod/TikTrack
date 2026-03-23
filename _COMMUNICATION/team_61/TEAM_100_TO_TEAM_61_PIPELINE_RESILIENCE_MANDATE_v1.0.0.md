---
project_domain: AGENTS_OS
id: TEAM_100_TO_TEAM_61_PIPELINE_RESILIENCE_MANDATE_v1.0.0
from: Team 100 (AOS Domain Architects)
to: Team 61 (Cursor IDE — Implementation)
cc: Team 00 (Chief Architect), Team 101 (IDE Architecture Authority)
date: 2026-03-17
historical_record: true
status: ACTIVE — AWAITING_IMPLEMENTATION
authority: LOD400 FINALIZED — TEAM_100_PIPELINE_RESILIENCE_LOD400_DRAFT_v1.0.0
priority: P1
program: S003-PXX (pending registry assignment — see §0)
---

# Mandate: Pipeline Resilience Implementation
## Team 100 → Team 61

---

## §0 — Program Registration Note

**Before you begin any implementation work, confirm with Team 00 that S003-PXX has been formally registered in PHOENIX_PROGRAM_REGISTRY and PHOENIX_WORK_PACKAGE_REGISTRY.** The WSM must reflect an active WP ID. You MUST NOT implement until the pipeline state file is initialized with the correct `work_package_id`.

Once confirmed: use `./pipeline_run.sh --domain agents_os` throughout this cycle.

---

## §1 — Scope

You are implementing **three items** of the Pipeline Resilience Package. Two items (4a and 4b) are already in the codebase — do NOT modify them.

| Item | Description | Status |
|------|-------------|--------|
| **Item 1** | File path 3-tier resolution hardening (AC-10 + AC-11) | ⏳ YOUR WORK |
| **Item 2** | WSM auto-write module (`wsm_writer.py`) | ⏳ YOUR WORK |
| **Item 3** | Targeted git operations (pre-GATE_4 + GATE_8) | ⏳ YOUR WORK |
| Item 4a | Route aliases (`artifacts_only`, `full_cycle`) | ✅ ALREADY IMPLEMENTED — DO NOT TOUCH |
| Item 4b | Parser hardening (regex without MULTILINE) | ✅ ALREADY IMPLEMENTED (Team 101 hotfix) — DO NOT TOUCH |

---

## §2 — Item 1: File Path 3-Tier Resolution

### Files to Modify
- `pipeline_run.sh` — functions `_auto_store_gate1_artifact()` and `_auto_store_g3plan_artifact()`

### What to Change

Replace the Python inline script inside **`_auto_store_gate1_artifact()`** (lines 153–187) with the following logic. The outer bash structure (`result=$(python3 -c "..."  2>/dev/null)`) and the `STORE:*` / `ALREADY_STORED` / `NO_FILE` shell handlers remain — only the Python logic changes.

**New Python logic for `_auto_store_gate1_artifact()`:**

```python
import sys, os, json, glob, time

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

# Activation-date guard: reject files older than WP last_updated
wp_activated_raw = state.get('last_updated', '')
activation_ts = None
try:
    from datetime import datetime, timezone
    activation_dt = datetime.fromisoformat(wp_activated_raw.replace('Z', '+00:00'))
    activation_ts = activation_dt.timestamp()
except Exception:
    pass

now = time.time()
cutoff_48h = now - (48 * 3600)

wp_fs = wp.replace('-', '_')

# ── Tier 1: canonical path ──────────────────────────────────────────────
pattern1 = f'_COMMUNICATION/team_170/TEAM_170_{wp_fs}_LLD400_v*.md'
candidates = glob.glob(pattern1)
tier2_used = False

# ── Tier 2: full tree fallback (non-interactive, silent + stderr notice) ─
if not candidates:
    wp_fragment = wp_fs[-8:] if len(wp_fs) >= 8 else wp_fs
    pattern2 = f'_COMMUNICATION/**/TEAM_170_*{wp_fragment}*LLD400*.md'
    candidates = glob.glob(pattern2, recursive=True)
    if candidates:
        tier2_used = True

# Apply time filters
def is_valid(path):
    try:
        mtime = os.path.getmtime(path)
        if mtime < cutoff_48h:
            return False
        if activation_ts and mtime < (activation_ts - 60):  # 60s tolerance
            return False
        return True
    except Exception:
        return False

recent = [f for f in candidates if is_valid(f)]

# If no file passes time filter, use all candidates with a warning (avoid false NO_FILE)
if not recent and candidates:
    recent = candidates
    print('AC10_WARN: no file passed time filter — using oldest candidate (mtime unverified)', file=sys.stderr)

if not recent:
    print('NO_FILE')
    sys.exit(0)

# Sort by mtime descending — newest wins
recent.sort(key=lambda f: os.path.getmtime(f), reverse=True)
latest = recent[0]

if tier2_used:
    print(f'AC10_TIER2: {latest}', file=sys.stderr)

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

**Update the `NO_FILE` shell handler** to include the Tier 3 manual store hint:

```bash
elif [[ "$result" == NO_FILE ]]; then
    echo ""
    echo "  ⚠️  GATE_1: No LLD400 file found for this WP."
    echo "  Searched: _COMMUNICATION/team_170/ (Tier 1) + full _COMMUNICATION/ tree (Tier 2)"
    echo "  Team 170 must produce the LLD400 before this gate can proceed."
    echo "  If the file exists at a non-standard path, store it manually (Tier 3):"
    echo "    ./pipeline_run.sh ${DOMAIN_FLAG_STR:-}store GATE_1 <path/to/LLD400.md>"
    echo ""
fi
```

### Mirror Change: `_auto_store_g3plan_artifact()`

Apply the identical structural change to `_auto_store_g3plan_artifact()` with these substitutions:
- Gate check: `'GATE_1'` → `'G3_PLAN'`
- State field read: `'lld400_content'` → `'work_plan'`
- Tier 1 pattern: `TEAM_170_{wp_fs}_LLD400_v*.md` → `TEAM_10_{wp_fs}_G3_PLAN_WORK_PLAN_v*.md`
- Tier 2 keyword: `TEAM_170_*{wp_fragment}*LLD400*.md` → `TEAM_10_*{wp_fragment}*G3_PLAN*WORK_PLAN*.md`
- AC ref: `AC-10` → `AC-11`
- stderr labels: `AC10_*` → `AC11_*`

### Acceptance Criteria

| AC | Test |
|----|------|
| AC-1-01 | Standard file in `_COMMUNICATION/team_170/` → Tier 1 match, auto-stored |
| AC-1-02 | File in `_COMMUNICATION/team_100/` with matching fragment → Tier 2 match; stderr warning emitted |
| AC-1-03 | File mtime > 48h AND older than `last_updated` → `NO_FILE` |
| AC-1-04 | Two files present, newer one is NOT last alphabetically → newer file is stored |
| AC-1-05 | `NO_FILE` output includes Tier 3 `store` CLI example |
| AC-1-06 | `ALREADY_STORED` on identical content → no output |
| AC-1-07 | Same logic in `_auto_store_g3plan_artifact()` (G3_PLAN + work_plan) |

---

## §3 — Item 2: WSM Auto-Write Module

### File to Create
`agents_os_v2/orchestrator/wsm_writer.py`

### Full Module Specification

```python
"""
wsm_writer.py — Pipeline-driven WSM state table updater.

Constraints (IRON RULES — must not be violated):
  1. Only modifies | Field | Value | table rows in CURRENT_OPERATIONAL_STATE block.
  2. log_entry lines (**log_entry | ...**) are NEVER modified — only appended.
  3. Fires only when state.gate_state is None (not mid-PASS_WITH_ACTION cycle).
  4. Idempotent: if all computed values equal current values, skip write silently.
  5. Source: PipelineState object passed by caller (not re-read from disk).
  6. On WSM field-not-found: emit WARN event to pipeline_events.jsonl, continue.
     Do NOT raise exception to caller — pipeline advancement must not be blocked.
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from ..config import REPO_ROOT

WSM_PATH = REPO_ROOT / "documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md"


def _update_table_field(text: str, field_name: str, new_value: str) -> tuple[str, bool]:
    """
    Update a single | field | value | row in the WSM table.
    Returns (updated_text, was_changed).
    Raises ValueError if field not found or found multiple times.
    """
    pattern = rf'(\|\s*{re.escape(field_name)}\s*\|)[^\|]+'
    replacement = rf'\1 {new_value} '
    new_text, count = re.subn(pattern, replacement, text)
    if count == 0:
        raise ValueError(f"WSM field not found: '{field_name}'")
    if count > 1:
        raise ValueError(f"WSM field '{field_name}' matched {count} times — ambiguous")
    return new_text, (new_text != text)


def _append_log_entry(text: str, entry_body: str) -> str:
    """
    Append a new **log_entry | ... ** line at the end of CURRENT_OPERATIONAL_STATE block.
    Never rewrites or deletes existing log entries.
    Inserts BEFORE the next ## section heading (or at EOF).
    """
    block_end = re.search(r'\n##\s', text)
    insert_pos = block_end.start() if block_end else len(text)
    log_line = f'\n**log_entry | {entry_body}**'
    return text[:insert_pos] + log_line + text[insert_pos:]


def _get_program_id(work_package_id: str) -> str:
    """Derive program ID from WP ID: S003-P001-WP002 → S003-P001."""
    parts = work_package_id.rsplit('-WP', 1)
    return parts[0] if len(parts) == 2 else work_package_id


def _emit_warn_event(field: str, error: str) -> None:
    """Write a WARN event to pipeline_events.jsonl — non-blocking."""
    try:
        import json
        events_file = REPO_ROOT / "_COMMUNICATION/agents_os/pipeline_events.jsonl"
        event = {
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "event_type": "WSM_WRITE_WARN",
            "severity": "WARN",
            "description": f"WSM auto-write warning for field '{field}': {error}",
        }
        with open(events_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(event, ensure_ascii=False) + "\n")
    except Exception:
        pass  # Never block pipeline for logging failures


def write_wsm_state(state, gate_id: str, result: str) -> None:
    """
    Write pipeline state to WSM CURRENT_OPERATIONAL_STATE table.
    Called from pipeline.py advance() after successful state.save().

    Args:
        state: PipelineState instance (post-advance state)
        gate_id: The gate that was just advanced (e.g. "GATE_1")
        result: "PASS" | "FAIL" | "APPROVE"
    """
    # Constraint 3: do not write during PASS_WITH_ACTION cycle
    if state.gate_state is not None:
        return

    if not WSM_PATH.exists():
        _emit_warn_event("(all)", f"WSM file not found at {WSM_PATH}")
        return

    wsm_text = WSM_PATH.read_text(encoding="utf-8")
    new_text = wsm_text
    any_change = False

    # ── Compute target field values ───────────────────────────────────────
    wp_id = state.work_package_id or "NONE"
    program_id = _get_program_id(wp_id) if wp_id != "NONE" else "NONE"
    current_gate = state.current_gate or "NONE"
    is_closed = (gate_id == "GATE_8" and result == "PASS")

    field_updates = {
        "active_flow": f"NONE — {wp_id} DOCUMENTATION_CLOSED ({datetime.now(timezone.utc).strftime('%Y-%m-%d')})" if is_closed
                       else f"{wp_id} {gate_id} {result}",
        "active_work_package_id": "NONE" if is_closed else wp_id,
        "in_progress_work_package_id": "NONE" if is_closed else wp_id,
        "current_gate": "NONE — S003 activation pending" if is_closed else current_gate,
        "active_program_id": "NONE" if is_closed else program_id,
    }
    if is_closed:
        field_updates["last_closed_work_package_id"] = wp_id
        field_updates["last_closed_program_id"] = program_id

    # ── Apply updates ──────────────────────────────────────────────────────
    for field, value in field_updates.items():
        try:
            new_text, changed = _update_table_field(new_text, field, value)
            if changed:
                any_change = True
        except ValueError as e:
            _emit_warn_event(field, str(e))
            # Continue — do not abort the entire write for one missing field

    # ── Append log entry ───────────────────────────────────────────────────
    log_body = f"PIPELINE | {gate_id}_{result} | {wp_id} | {datetime.now(timezone.utc).strftime('%Y-%m-%d')}"
    new_text = _append_log_entry(new_text, log_body)
    any_change = True  # Always write when log entry is appended

    # ── Idempotency: only write if something changed ───────────────────────
    if any_change:
        WSM_PATH.write_text(new_text, encoding="utf-8")
```

### Integration in `pipeline.py`

In the `advance()` function (or wherever gate state is saved after a successful transition), add after `state.save()`:

```python
# WSM auto-write — fires on every gate advance (guarded inside wsm_writer)
try:
    from .wsm_writer import write_wsm_state
    write_wsm_state(state, gate_id, result)
except Exception as e:
    # Non-blocking — pipeline must not fail due to WSM write errors
    print(f"[pipeline] ⚠️  WSM auto-write failed (non-blocking): {e}", file=sys.stderr)
```

The `try/except` wrap is mandatory — WSM write failures MUST NOT block pipeline advancement (OI-01 decision).

### Acceptance Criteria

| AC | Test |
|----|------|
| AC-2-01 | After `pass` at GATE_1: WSM `current_gate` row reflects new gate |
| AC-2-02 | After GATE_8 PASS: WSM shows `active_work_package_id = NONE`, `last_closed_*` updated |
| AC-2-03 | No existing `log_entry` line is modified — only appended |
| AC-2-04 | `gate_state = "PASS_WITH_ACTION"` → WSM write skipped entirely |
| AC-2-05 | Two consecutive identical advances → second run is a no-op (no duplicate log_entry for same state) |
| AC-2-06 | WSM field not found → WARN in `pipeline_events.jsonl`, pipeline continues |
| AC-2-07 | All `write_wsm_state()` exceptions are caught; pipeline advance never fails due to wsm_writer |

---

## §4 — Item 3: Targeted Git Operations

### File to Modify
`pipeline_run.sh` — the `pass)` case

### Part A: Pre-GATE_4 Uncommitted Change Detection

Add the following block inside the `pass)` case, **after** the `_auto_store_gate1_artifact` call and **before** the `./pipeline_run.sh pass` validation section. Insert it immediately after line 355 (after `_auto_store_gate1_artifact`):

```bash
# ── Pre-GATE_4: uncommitted tracked change detection ─────────────────────
# Only fires when advancing from CURSOR_IMPLEMENTATION gate.
# Detects uncommitted tracked changes (not untracked files).
# Blocks advance — Team 191 must commit targeted files before QA.
if [[ "$GATE" == "CURSOR_IMPLEMENTATION" ]]; then
    UNCOMMITTED=$(git -C "$REPO" status --porcelain 2>/dev/null | grep -v "^??" || true)
    if [ -n "$UNCOMMITTED" ]; then
        echo ""
        echo "════════════════════════════════════════════════════════════════════"
        echo "  ⚠️  UNCOMMITTED CHANGES — Advance to GATE_4 blocked"
        echo "  Commit the following tracked files before proceeding to QA:"
        echo ""
        echo "$UNCOMMITTED" | sed 's/^/    /'
        echo ""
        echo "  Team 191 commit command (DO NOT use git add .):"
        echo "    git add <files listed above>"
        echo "    git commit -m \"impl: ${DOMAIN_LABEL}implementation complete\""
        echo ""
        echo "  After commit:"
        echo "    ./pipeline_run.sh ${DOMAIN_FLAG_STR:-}pass"
        echo "════════════════════════════════════════════════════════════════════"
        echo ""
        exit 1
    fi
fi
```

### Part B: GATE_8 Closure Push Checklist

Add the following block inside the `pass)` case, **after** `$CLI --advance "$GATE" PASS` and **after** the `NEXT_GATE` variable is set. Insert after line 469 (after `$CLI --advance "$GATE" PASS`):

```bash
# ── GATE_8 closure: Team 191 push checklist ──────────────────────────────
if [[ "$GATE" == "GATE_8" ]]; then
    echo ""
    echo "  ╔══════════════════════════════════════════════════════════════╗"
    echo "  ║  📦 GATE_8 PASS — Team 191 Closure Push Checklist           ║"
    echo "  ╠══════════════════════════════════════════════════════════════╣"
    echo "  ║                                                              ║"
    echo "  ║  1. Identify closure packet files from Team 70 AS_MADE_REPORT║"
    echo "  ║  2. Stage explicitly (no git add .):"
    echo "  ║     git add <team_70_as_made.md> <team_90_gate8.md> ...     ║"
    echo "  ║  3. Commit:"
    echo "  ║     git commit -m \"closure: [WP_ID] GATE_8 DOC_CLOSED\"     ║"
    echo "  ║  4. Push:"
    echo "  ║     git push origin HEAD                                     ║"
    echo "  ║                                                              ║"
    echo "  ║  ⛔  git add . is ARCHITECTURALLY PROHIBITED                 ║"
    echo "  ╚══════════════════════════════════════════════════════════════╝"
    echo ""
fi
```

### Acceptance Criteria

| AC | Test |
|----|------|
| AC-3-01 | `pass` at `CURSOR_IMPLEMENTATION` with modified tracked file → blocked with file list |
| AC-3-02 | `pass` at `CURSOR_IMPLEMENTATION` with clean tree → proceeds to GATE_4 normally |
| AC-3-03 | Untracked files (new, unstaged) → do NOT trigger block |
| AC-3-04 | `pass` at `GATE_8` → closure push checklist displayed |
| AC-3-05 | `git add .` does not appear anywhere in pipeline output |
| AC-3-06 | Pre-GATE_4 block fires only at `CURSOR_IMPLEMENTATION`, not at other gates |

---

## §5 — Deliverable Checklist

Upon completion, submit the following to the pipeline via GATE_4:

| # | Deliverable |
|---|-------------|
| D-01 | `pipeline_run.sh` — `_auto_store_gate1_artifact()` updated |
| D-02 | `pipeline_run.sh` — `_auto_store_g3plan_artifact()` updated |
| D-03 | `agents_os_v2/orchestrator/wsm_writer.py` — new file |
| D-04 | `agents_os_v2/orchestrator/pipeline.py` — `write_wsm_state()` call added to `advance()` |
| D-05 | `pipeline_run.sh` — pre-GATE_4 uncommitted change detection added |
| D-06 | `pipeline_run.sh` — GATE_8 closure push checklist added |

**Do NOT modify:**
- `_ROUTE_ALIAS` in `pipeline.py` (4a — already correct)
- `_extract_route_recommendation()` regex (4b — already correct, Team 101 hotfix)
- Any file in `_COMMUNICATION/`

---

## §6 — Return Contract

Submit your work as:
```
id: TEAM_61_PIPELINE_RESILIENCE_IMPLEMENTATION_REPORT_v1.0.0
project_domain: AGENTS_OS
gate: GATE_4
verdict: PASS | FAIL
items_completed: [list]
items_failed: [list with reason]
files_modified: [exact file paths]
```

File: `_COMMUNICATION/team_61/TEAM_61_PIPELINE_RESILIENCE_IMPLEMENTATION_REPORT_v1.0.0.md`

---

**log_entry | TEAM_100 | MANDATE_ISSUED | TO_TEAM_61 | PIPELINE_RESILIENCE | v1.0.0 | 2026-03-17**
