---
**project_domain:** AGENTS_OS
**id:** TEAM_00_TO_TEAM_51_S003_P002_WP001_FAST25_ACTIVATION_PROMPT_v1.1.0
**from:** Team 00 (Chief Architect)
**to:** Team 51 (Agents_OS QA Agent)
**cc:** Team 100, Team 61
**date:** 2026-03-11
**supersedes:** `TEAM_00_TO_TEAM_51_S003_P002_WP001_FAST25_ACTIVATION_PROMPT_v1.0.0.md`
**status:** READY — activate after Team 61 FAST_2 Execution Closeout received
**prerequisite:** `_COMMUNICATION/team_61/TEAM_61_S003_P002_WP001_FAST2_EXECUTION_CLOSEOUT_v1.0.0.md` must exist before starting
**changes_from_v1.0.0:**
  - Check 5 test count: 14 → **15** (PA-5: test #15 `test_mixed_sections_partial_generation` added)
  - Check 3 command: now uses generic `{new_file_path}` per PA-2 fix to team_51.md
  - Step 4 FAST_3 checklist: test count updated to 15
  - LOD400 Addendum added to Step 0 reads
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P002 |
| work_package_id | WP001 |
| gate_id | FAST_2.5_ACTIVE |
| phase_owner | Team 51 |
| project_domain | AGENTS_OS |
| required_ssm_version | 1.0.0 |

---

# Team 51 — FAST_2.5 Activation: S003-P002 WP001
## Test Template Generator — QA

---

## STEP 0 — Mandatory Context Reads

| # | Document | Why |
|---|---|---|
| 1 | `agents_os_v2/context/identity/team_51.md` | Your identity, standard 6 checks, iron rules |
| 2 | `_COMMUNICATION/team_00/TEAM_00_TEAM_51_CONSTITUTION_v1.0.0.md` | Authority scope and check catalog |
| 3 | This document (you are reading it) | WP-specific criteria |
| 4 | `_COMMUNICATION/team_61/TEAM_61_S003_P002_WP001_FAST2_EXECUTION_CLOSEOUT_v1.0.0.md` | What Team 61 delivered |
| 5 | `_COMMUNICATION/team_00/TEAM_00_S003_P002_TEST_TEMPLATE_GENERATOR_LOD400_v1.0.0.md` | LOD400 spec — base requirements |
| 6 | `_COMMUNICATION/team_00/TEAM_00_S003_P002_TEST_TEMPLATE_GENERATOR_LOD400_ADDENDUM_v1.0.0.md` | **MANDATORY** — supersedes 4 LOD400 items (PA-1 requirements path, PA-3 TT-00 unblock, PA-4 Team 10/50 scope, PA-5 test #15) |

---

## STEP 1 — What Team 61 Delivered

Expected deliverables (verify against closeout):

| File | Type |
|---|---|
| `agents_os_v2/generators/__init__.py` | NEW |
| `agents_os_v2/generators/test_templates.py` | NEW |
| `agents_os_v2/generators/spec_parser.py` | NEW |
| `agents_os_v2/generators/templates/api_test.py.jinja` | NEW |
| `agents_os_v2/generators/templates/ui_test.py.jinja` | NEW |
| `agents_os_v2/tests/test_template_generator.py` | NEW (15 tests) |
| `agents_os_v2/requirements.txt` | NEW (Jinja2>=3.1.0,<4.0) |
| `agents_os_v2/tests/fixtures/sample_spec_with_contracts.md` | NEW |
| `agents_os_v2/orchestrator/gate_router.py` | MODIFIED (G3.7 dispatch added) |
| `agents_os_v2/orchestrator/__init__.py` | MODIFIED (if needed) |

**If any of the first 9 files is missing → FAIL immediately (file missing).**

---

## STEP 2 — Run the 6 Standard Checks

### Check 1 — pytest (full suite)

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
api/venv/bin/python -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"
```

**Expected outcome:**
- All pre-existing tests PASS (no regressions — S003-P001 DM tests must still pass)
- **15 new tests** in `test_template_generator.py` PASS (14 original + test #15 `test_mixed_sections_partial_generation`)
- 0 failures, 0 errors

---

### Check 2 — mypy

```bash
api/venv/bin/python -m mypy \
  agents_os_v2/generators/test_templates.py \
  agents_os_v2/generators/spec_parser.py \
  agents_os_v2/generators/__init__.py \
  agents_os_v2/orchestrator/gate_router.py \
  --ignore-missing-imports
```

**PASS:** 0 errors.

---

### Check 3 — Domain isolation (GENERATORS — new scope)

This WP introduces a **new module**: `generators/`. Run domain isolation on all generator Python files using the generic command from your identity file:

```bash
grep -n "^from\|^import" agents_os_v2/generators/test_templates.py
grep -n "^from\|^import" agents_os_v2/generators/spec_parser.py
grep -n "^from\|^import" agents_os_v2/generators/__init__.py
```

**PASS:** Imports are ONLY from:
- Python stdlib (`pathlib`, `re`, `os`, `shutil`, `dataclasses`, `typing`, `__future__`)
- `jinja2`
- `agents_os_v2.config`

**FAIL if ANY import from:**
- `api.` — prohibited
- `ui.` — prohibited
- `agents_os_v2.orchestrator.` — circular dependency
- `agents_os_v2.conversations.` — prohibited
- `agents_os_v2.validators.` — prohibited

---

### Check 4 — bandit

```bash
api/venv/bin/python -m bandit -r agents_os_v2/generators/ -ll
```

**PASS:** 0 HIGH severity issues. Note any MEDIUM as informational flags.

---

### Check 5 — Test count

```bash
grep -c "def test_" agents_os_v2/tests/test_template_generator.py
```

**PASS:** Count ≥ **15** (per LOD400 §6 + PA-5 addendum).

Note: Count = 14 is a FAIL. Test #15 (`test_mixed_sections_partial_generation`) is mandatory per FAST_1_PASS_WITH_ACTION PA-5.

---

### Check 6 — Gate integration (G3.7 — different from S003-P001)

For S003-P002, gate integration is **G3.7 in gate_router.py** (not DM check IDs):

```bash
grep -n "G3.7\|generate_test_templates\|TT-00" agents_os_v2/orchestrator/gate_router.py
```

**PASS:** Evidence of G3.7 dispatch block with `generate_test_templates` call and TT-00 BLOCK handling present in gate_router.py.

---

### Check 7 — Jinja2 dependency (WP-SPECIFIC — additional check)

```bash
# Confirm requirements.txt exists and contains Jinja2
cat agents_os_v2/requirements.txt

# Confirm Jinja2 is importable
api/venv/bin/python -c "import jinja2; print('Jinja2 version:', jinja2.__version__)"
```

**PASS:** `agents_os_v2/requirements.txt` exists; contains `Jinja2>=3.1.0,<4.0`; `import jinja2` succeeds with version ≥3.1.0.

**FAIL:** File missing; Jinja2 not importable; version <3.1.0.

**Note (PA-1 canonical ruling):** The correct file is `agents_os_v2/requirements.txt`. If you see `api/requirements.txt` was modified instead → FAIL with note that this violates TIKTRACK domain isolation Iron Rule.

---

### Check 8 — Sample fixture exists (WP-SPECIFIC — additional check)

```bash
# Confirm sample spec fixture exists
ls agents_os_v2/tests/fixtures/sample_spec_with_contracts.md

# Confirm it has both contract sections
grep "## API Contracts\|## Page Contracts" agents_os_v2/tests/fixtures/sample_spec_with_contracts.md
```

**PASS:** File exists; both `## API Contracts` and `## Page Contracts` sections present.

**FAIL:** File missing; one or both sections absent.

---

## STEP 3 — Write QA Report

Write your report to:
`_COMMUNICATION/team_51/TEAM_51_S003_P002_WP001_FAST25_QA_REPORT_v1.0.0.md`

Use the standard report format from `agents_os_v2/context/identity/team_51.md` §WHAT YOU PRODUCE.

**This WP has 8 checks** (6 standard + 2 WP-specific: Check 7 Jinja2, Check 8 fixture). Include all 8 in the check matrix.

---

## STEP 4 — Routing After Report

### If PASS:
```
HANDOFF TO TEAM 00:
FAST_2.5 QA PASS confirmed for S003-P002-WP001.
FAST_3 authorized. Nimrod CLI demo checklist (7 checks):
  1. pytest suite PASS (all tests including 15 new TT tests)
  2. mypy 0 errors
  3. Live generation: run generator on sample_spec_with_contracts.md → files written to tests/api/ and tests/ui/
  4. Output validity: python -m py_compile tests/api/test_*.py exits 0
  5. TT-00 live block: spec with ## API Contracts + empty table → BLOCKS with TT-00
  6. SKIP demo: spec with no contract sections → skipped_sections populated, 0 files
  7. Domain isolation: grep -r "from api\." agents_os_v2/generators/ returns empty
Reference: TEAM_100_S003_P002_WP001_FAST0_SCOPE_BRIEF_v1.0.0.md §10
```

### If FAIL:
```
RETURN TO TEAM 61:
FAST_2.5 QA FAIL on S003-P002-WP001.
Blocking items: [list all with file:line]
Fix all blocking items and re-submit FAST_2 Execution Closeout v1.1.0.
```

---

**log_entry | TEAM_00 | TO_TEAM_51 | S003_P002_WP001_FAST25_ACTIVATION_v1.1.0 | SUPERSEDES_v1.0.0 | 15_TESTS | PA2_CHECK3_GENERIC | PA5_TEST15 | READY_AFTER_FAST2_CLOSEOUT | 2026-03-11**
