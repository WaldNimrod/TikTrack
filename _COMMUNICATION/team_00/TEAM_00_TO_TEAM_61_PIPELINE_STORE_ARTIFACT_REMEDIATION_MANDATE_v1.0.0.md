---
project_domain: AGENTS_OS
id: TEAM_00_TO_TEAM_61_PIPELINE_STORE_ARTIFACT_REMEDIATION_MANDATE_v1.0.0
from: Team 00 (Chief Architect)
to: Team 61 (Agents_OS Implementation — Pipeline)
cc: Team 190 (will re-validate), Team 100
date: 2026-03-15
status: MANDATE_ACTIVE
priority: HIGH
exception_clause: Issued directly by Team 00 (pipeline governance tooling, < 30 lines, exception applies)
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP001 |
| mandate_type | REMEDIATION_EXECUTION |
| source_report | `TEAM_190_TO_TEAM_100_UNIFIED_SCAN_CONSOLIDATED_FINDINGS_EXECUTION_APPROVAL_REQUEST_v1.0.0.md` |
| decision | **APPROVE_EXECUTION** |
| issued_by | Team 00, 2026-03-15 |

---

## 1) Decision: APPROVE_EXECUTION

Team 00 מאשר ביצוע remediation לפי ממצאי Team 190.

**Scope מאושר:**
| finding_id | severity | remediation |
|---|---|---|
| AO2-STORE-001 | BLOCKER | R-01: `store_artifact()` → return bool; `main()` → `sys.exit(1)` on failure |
| AO2-STORE-002 | HIGH | R-02: help-text alignment |
| — | REQUIRED | R-03: regression tests for exit codes |

**UI-HISTORY-001** — CLOSED_VERIFIED; אין פעולה נוספת נדרשת.

---

## 2) Architectural Ruling (before implementation)

### שאלת domain ב-`store_artifact()`

ב-`store_artifact()` שורה 1969:
```python
state = PipelineState.load()   # ← no domain arg
```

עם ה-domain guard החדש ב-`state.py` (shipped 2026-03-15), קריאה זו תשתמש ב-`PIPELINE_DOMAIN` env שנקבע ע"י `pipeline_run.sh`. **זה נכון ולא דורש שינוי.** כאשר `store_artifact()` נקרא מחוץ לסקריפט (CLI ישיר), המפעיל אחראי לספק `PIPELINE_DOMAIN`. אין לשנות קריאה זו.

---

## 3) R-01 — Fix `store_artifact()` exit codes (BLOCKER)

**קובץ:** `agents_os_v2/orchestrator/pipeline.py`

### 3.1 שינוי חתימה + error paths

**Current (lines 1953–1996):**
```python
def store_artifact(gate_id: str, file_path: str):
    ...
    if not path.exists():
        _log(f"ERROR: File not found: {file_path}")
        return                          # ← returns None, exit code 0

    ...
    if not field_name:
        _log(f"ERROR: No state field mapping for gate: {gate_id}")
        _log(f"Supported gates: {', '.join(GATE_TO_FIELD.keys())}")
        return                          # ← returns None, exit code 0

    ...
    state.save()
    _log(f"Gate {gate_id} artifact stored successfully.")
    # ← implicit None return, exit code 0
```

**Required change — exact replacement:**
```python
def store_artifact(gate_id: str, file_path: str) -> bool:
    """Store agent output file content to the appropriate pipeline state field.

    Gate → field mapping:
      GATE_1                → state.lld400_content
      G3_PLAN               → state.work_plan
      CURSOR_IMPLEMENTATION → state.implementation_files (one path per line)

    Returns:
      True  — artifact stored successfully.
      False — failure (file not found, unsupported gate, or I/O error).
              Caller should sys.exit(1) when False is returned from CLI context.
    """
    path = Path(file_path)
    if not path.exists():
        path = REPO_ROOT / file_path
    if not path.exists():
        _log(f"ERROR: File not found: {file_path}")
        return False                    # ← was: return

    content = path.read_text(encoding="utf-8")
    state = PipelineState.load()

    GATE_TO_FIELD: dict[str, str] = {
        "GATE_1": "lld400_content",
        "G3_PLAN": "work_plan",
        "CURSOR_IMPLEMENTATION": "implementation_files",
    }

    field_name = GATE_TO_FIELD.get(gate_id)
    if not field_name:
        _log(f"ERROR: No state field mapping for gate: {gate_id}")
        _log(f"Supported gates: {', '.join(GATE_TO_FIELD.keys())}")
        return False                    # ← was: return

    if field_name == "implementation_files":
        files = [
            line.strip()
            for line in content.splitlines()
            if line.strip() and not line.startswith("#")
        ]
        state.implementation_files = files
        _log(f"Stored {len(files)} implementation file paths to state.implementation_files")
    else:
        setattr(state, field_name, content)
        _log(f"Stored {len(content)} chars to state.{field_name}")

    state.save()
    _log(f"Gate {gate_id} artifact stored successfully.")
    return True                         # ← new: explicit success
```

### 3.2 שינוי `main()` — הענף `--store-artifact`

**Current (lines 2036–2038):**
```python
    elif args.store_artifact:
        gate_id, file_path = args.store_artifact
        store_artifact(gate_id, file_path)          # ← return value ignored
```

**Required change — exact replacement:**
```python
    elif args.store_artifact:
        gate_id, file_path = args.store_artifact
        if not store_artifact(gate_id, file_path):  # ← check return value
            sys.exit(1)
```

**אימות:** `sys` כבר מיובא ב-pipeline.py (`import sys` קיים בראש הקובץ). אין imports נוספים נדרשים.

---

## 4) R-02 — Fix help-text (HIGH)

**קובץ:** `agents_os_v2/orchestrator/pipeline.py`, שורה 2006–2007

**Current:**
```python
    parser.add_argument("--store-artifact", nargs=2, metavar=("GATE", "FILE"),
                        help="Store agent output file to pipeline state. G3_PLAN→work_plan, G3_5→validation, CURSOR_IMPLEMENTATION→impl_files")
```

**Required change — exact replacement:**
```python
    parser.add_argument("--store-artifact", nargs=2, metavar=("GATE", "FILE"),
                        help="Store agent output file to pipeline state. GATE_1→lld400_content, G3_PLAN→work_plan, CURSOR_IMPLEMENTATION→implementation_files")
```

**שינויים:**
- הוסר: `G3_5→validation` (gate לא קיים ב-mapping)
- הוסף: `GATE_1→lld400_content` (gate קיים, לא היה מתועד)
- תוקן: `impl_files` → `implementation_files` (שם שדה מדויק)

---

## 5) R-03 — Regression Tests (REQUIRED)

**קובץ:** `agents_os_v2/tests/test_pipeline.py`

**הוסף את שתי הפונקציות הבאות לקובץ הקיים:**

```python
import subprocess
import tempfile


def test_store_artifact_missing_file_exits_nonzero():
    """AO2-STORE-001: --store-artifact with missing file must exit non-zero."""
    result = subprocess.run(
        [
            sys.executable, "-m", "agents_os_v2.orchestrator.pipeline",
            "--store-artifact", "GATE_1", "/tmp/definitely_does_not_exist_ao2_store.md",
        ],
        capture_output=True,
        env={**os.environ, "PIPELINE_DOMAIN": "agents_os"},
    )
    assert result.returncode != 0, (
        f"Expected non-zero exit on missing file, got {result.returncode}. "
        f"stderr: {result.stderr.decode()}"
    )


def test_store_artifact_unsupported_gate_exits_nonzero():
    """AO2-STORE-001: --store-artifact with unsupported gate must exit non-zero."""
    with tempfile.NamedTemporaryFile(suffix=".md", delete=False, mode="w") as f:
        f.write("# test content\n")
        tmp_path = f.name
    try:
        result = subprocess.run(
            [
                sys.executable, "-m", "agents_os_v2.orchestrator.pipeline",
                "--store-artifact", "GATE_999_UNSUPPORTED", tmp_path,
            ],
            capture_output=True,
            env={**os.environ, "PIPELINE_DOMAIN": "agents_os"},
        )
        assert result.returncode != 0, (
            f"Expected non-zero exit on unsupported gate, got {result.returncode}. "
            f"stderr: {result.stderr.decode()}"
        )
    finally:
        os.unlink(tmp_path)
```

**הוסף בראש הקובץ (אם לא קיים כבר):**
```python
import os
import sys
import tempfile
```

**הרצה לאימות:**
```bash
python3 -m pytest agents_os_v2/tests/test_pipeline.py -q
```

כל הטסטים הקיימים חייבים להמשיך לעבור (אין regression).

---

## 6) Completion Deliverable

Team 61 מגיש קובץ completion ב-`_COMMUNICATION/team_61/` עם:
1. קישורים לשלושת ה-diffs (R-01, R-02, R-03)
2. output של `python3 -m pytest agents_os_v2/tests/test_pipeline.py -q` (כולל 2 טסטים חדשים PASS)
3. evidence של runtime: הרצת `--store-artifact GATE_999 /tmp/test.md` → exit code ≠ 0
4. evidence של runtime: הרצת `--store-artifact GATE_1 /tmp/nonexistent.md` → exit code ≠ 0

---

## 7) Re-Validation by Team 190

לאחר completion של Team 61, Team 190 מבצע re-validation לפי:
```
TEAM_190_TO_TEAM_100_UNIFIED_SCAN_CONSOLIDATED_FINDINGS_EXECUTION_APPROVAL_REQUEST_v1.0.0.md
§7 — Acceptance Criteria
```

Verdict נדרש: `PASS` / `BLOCK_FOR_FIX`

---

## 8) Non-Scope (do not touch)

| Item | Reason |
|---|---|
| `PipelineState.load()` call in `store_artifact()` | Domain auto-detect handled at state.py level (shipped 2026-03-15) |
| `pipeline_run.sh store` command | Calls CLI correctly; no change needed |
| Any other `pipeline.py` functions | Outside scope of this mandate |
| `UI-HISTORY-001` | CLOSED_VERIFIED — no action |

---

**log_entry | TEAM_00 | REMEDIATION_MANDATE | TEAM_61 | AO2_STORE_001_AO2_STORE_002 | APPROVE_EXECUTION | 2026-03-15**
