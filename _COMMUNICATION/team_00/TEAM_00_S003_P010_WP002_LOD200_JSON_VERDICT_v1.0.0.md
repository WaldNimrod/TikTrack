---
project_domain: AGENTS_OS
id: TEAM_00_S003_P010_WP002_LOD200_JSON_VERDICT_v1.0.0
historical_record: true
from: Team 00 (Chief Architect — Nimrod)
to: Team 100, Team 190, Team 170
cc: Team 50, Team 90, Team 10, Team 61
date: 2026-03-19
status: LOD200 — APPROVED FOR GATE_0
authority: ARCHITECT_DIRECTIVE_AOS_ROADMAP_RESET_v1.0.0
depends_on: S003-P010-WP001 GATE_8---

## Mandatory Identity Header

| Field | Value |
|---|---|
| stage_id | S003 |
| program_id | S003-P010 |
| work_package_id | S003-P010-WP002 |
| gate_id | pre-GATE_0 |
| project_domain | AGENTS_OS |

---

## §1 — Work Package Overview

**Name:** JSON Verdict Protocol + json_enforcer.py

**One sentence:** Replace brittle regex-based verdict parsing with a single deterministic JSON-fenced-block standard across all validation teams, enforced by a pre-flight auto-correction module.

**Source problems:**
1. `_extract_blocking_findings()` uses two regex formats (Format A: YAML-like, Format B: prose section) — both fragile to minor LLM formatting variations
2. No structural enforcement: LLMs occasionally output prose findings without YAML structure; pipeline silently misses them
3. `route_recommendation` extracted by `_extract_route_recommendation()` via regex on a Markdown line — breaks on capitalization or whitespace variants
4. Different validation teams (50, 90, 190) each had slightly different output conventions, preventing unified parsing

**Root cause:** The pipeline is a deterministic state machine but consumes non-deterministic free text. The fix is to make the input deterministic at the source.

---

## §2 — The JSON Verdict Schema (IRON RULE)

### 2.1 Required Format

Every new verdict, blocking report, and validation output file MUST begin with this block as the **first content in the file**:

````
```json
{
  "gate_id": "GATE_5",
  "decision": "PASS",
  "blocking_findings": [],
  "route_recommendation": null,
  "summary": "All 4 acceptance criteria pass. API endpoints return correct data."
}
```
````

**Or for a FAIL:**

````
```json
{
  "gate_id": "GATE_5",
  "decision": "BLOCK_FOR_FIX",
  "blocking_findings": [
    {"id": "BF-01", "description": "ticker_router returns 500 on TASE symbols", "evidence": "backend/routers/ticker_router.py:142"},
    {"id": "BF-02", "description": "currency display missing agorot conversion", "evidence": "agents_os/ui/js/market-data.js:89"}
  ],
  "route_recommendation": "doc",
  "summary": "2 blockers found. Targeted fix scope: ticker_router + market-data.js only."
}
```
````

### 2.2 Field Specification

| Field | Type | Required | Values | Notes |
|---|---|---|---|---|
| `gate_id` | string | Always | `GATE_0`..`GATE_8`, `AUTO-WPxxx` | Exact gate identifier |
| `decision` | string | Always | `PASS` \| `BLOCK_FOR_FIX` | Binary — no other values |
| `blocking_findings` | array | If BLOCK | Array of finding objects | Empty array `[]` if PASS |
| `blocking_findings[].id` | string | Per finding | `BF-01`, `BF-02`, ... | Zero-padded two digits |
| `blocking_findings[].description` | string | Per finding | Free text, max 300 chars | The specific failure |
| `blocking_findings[].evidence` | string | Per finding | `path/to/file.py:linenum` | Canonical repo-relative path |
| `route_recommendation` | string\|null | If BLOCK | `"doc"` \| `"full"` | `null` if PASS |
| `summary` | string | Always | Max 200 chars | One-sentence human summary |

### 2.3 Markdown Body

Everything after the closing ` ``` ` of the JSON block is unrestricted Markdown. Teams are encouraged to include detailed analysis, evidence quotes, and remediation suggestions. The pipeline reads ONLY the JSON block.

---

## §3 — `json_enforcer.py` Module

**Location:** `agents_os_v2/orchestrator/json_enforcer.py`

**Purpose:** Pre-flight JSON syntax validation and auto-fix before pipeline reads the verdict file.

### 3.1 Core Logic

```python
def enforce_json_verdict(file_path: Path, llm_client=None) -> dict:
    """
    Read a verdict file, extract the first ```json block, and validate it.

    If JSON is syntactically invalid:
      - If llm_client provided: send auto-fix prompt, retry once
      - If still invalid: raise VerdictParseError (→ MANUAL ROUTING REQUIRED)

    Returns: parsed dict conforming to verdict schema
    Raises: VerdictParseError if unrecoverable
    """
```

### 3.2 Extraction Logic

```python
import re, json

def _extract_first_json_block(text: str) -> str | None:
    """Extract content of first ```json ... ``` fenced block."""
    m = re.search(r'```json\s*\n(.*?)\n```', text, re.DOTALL)
    return m.group(1).strip() if m else None
```

**Why `re.DOTALL` is safe here:** We're not extracting a YAML field from prose; we're extracting a delimited block with explicit ` ```json ` and ` ``` ` markers. The DOTALL flag simply allows multi-line JSON.

### 3.3 Validation

After extraction, validate against schema:
```python
REQUIRED_FIELDS = {"gate_id", "decision", "summary"}
VALID_DECISIONS = {"PASS", "BLOCK_FOR_FIX"}
VALID_ROUTES = {"doc", "full", None}

def _validate_schema(data: dict) -> list[str]:
    """Return list of validation errors (empty = valid)."""
    errors = []
    for f in REQUIRED_FIELDS:
        if f not in data:
            errors.append(f"Missing required field: {f}")
    if data.get("decision") not in VALID_DECISIONS:
        errors.append(f"Invalid decision value: {data.get('decision')}")
    if data.get("decision") == "BLOCK_FOR_FIX":
        if not data.get("blocking_findings"):
            errors.append("BLOCK_FOR_FIX requires non-empty blocking_findings")
        if data.get("route_recommendation") not in VALID_ROUTES:
            errors.append(f"Invalid route_recommendation: {data.get('route_recommendation')}")
    return errors
```

### 3.4 Auto-fix Prompt (single retry)

If JSON syntax error detected (not schema error), send to LLM:
```
The following JSON block from a verdict file has a syntax error.
Fix ONLY the JSON syntax — do not change any values.
Return ONLY the corrected JSON, no other text.

[raw JSON block]
```

Silent retry: if the fixed JSON passes `json.loads()`, proceed. If second attempt also fails → `VerdictParseError`.

### 3.5 Integration Point

In `pipeline.py` advance(), before reading route_recommendation:
```python
try:
    verdict_data = enforce_json_verdict(verdict_path)
    route = verdict_data.get("route_recommendation")
    findings = verdict_data.get("blocking_findings", [])
except VerdictParseError as e:
    _log(f"[VERDICT PARSE ERROR] {e}")
    state.gate_state = "MANUAL_ROUTING_REQUIRED"
    state.save()
    return
```

---

## §4 — Pipeline.py Changes

### 4.1 Deprecate regex-based extraction (legacy fallback only)

`_extract_route_recommendation()` and `_extract_blocking_findings()` are retained ONLY as legacy fallback for historical verdict files (files written before P010-WP002 GATE_8). They are NOT called for new verdicts.

**Detection logic:** If file `mtime` > P010-WP002 deployment date → use `json_enforcer`. If older → use legacy regex.

Alternatively (simpler): if first ```json block is present → use json_enforcer. If absent → use legacy regex.

### 4.2 `GATE_MANDATE_FILES` update

Add:
```python
GATE_MANDATE_FILES["VERDICT_SCHEMA"] = "verdict_schema.json"  # reference schema for Teams
```

---

## §5 — Team Protocol Changes

### 5.1 Teams That Must Adopt JSON Verdict Format

| Team | Gates | Current format | Migration |
|---|---|---|---|
| Team 190 | GATE_0, GATE_1 | YAML-like in Markdown | WP002 activation mandate |
| Team 90 | GATE_5, GATE_7, G3_5 | YAML-like in Markdown | WP002 activation mandate |
| Team 50 | GATE_4, AUTO-WP | BLOCKING_REPORT Markdown | WP002 activation mandate |

### 5.2 Team 170 Deliverables

Team 170 must produce (as part of WP002 GATE_1):
1. `TEAM_170_VERDICT_SCHEMA_v1.0.0.md` — human-readable schema guide for all validation teams
2. `TEAM_170_VERDICT_TEMPLATE_v1.0.0.md` — copy-paste template with all fields and examples
3. Update all existing verdict prompt sections in mandate templates to include JSON block requirement

---

## §6 — Acceptance Criteria

| AC | Criterion |
|---|---|
| AC-01 | `json_enforcer.py` correctly parses a valid JSON verdict and returns a dict |
| AC-02 | `json_enforcer.py` auto-fixes a JSON with trailing comma and returns correct dict |
| AC-03 | `json_enforcer.py` raises `VerdictParseError` after two failed attempts |
| AC-04 | `pipeline.py` advance() uses json_enforcer for any verdict file with ```json block |
| AC-05 | Legacy regex fallback still works on a historical verdict file (no ```json block) |
| AC-06 | Team 190 GATE_0 verdict follows JSON schema — pipeline parses without MANUAL ROUTING |
| AC-07 | Team 50 GATE_4 BLOCKING_REPORT follows JSON schema — pipeline reads BF list |
| AC-08 | `route_recommendation` correctly routes pipeline after BLOCK_FOR_FIX |
| AC-09 | `blocking_findings` array populates `state.last_blocking_findings` (from WP001) |

---

## §7 — What This Does NOT Include

- Dashboard JSON display (→ P011-WP001)
- Event-driven file watching (→ P011-WP002)
- Gate renaming (→ deferred)
- Historical verdict file migration (legacy fallback preserved indefinitely)

---

**log_entry | TEAM_00 | LOD200_P010_WP002 | JSON_VERDICT_PROTOCOL_SPEC_APPROVED | 2026-03-19**
