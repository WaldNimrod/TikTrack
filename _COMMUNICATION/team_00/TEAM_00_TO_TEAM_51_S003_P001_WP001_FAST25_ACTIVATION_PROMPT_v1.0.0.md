---
**project_domain:** AGENTS_OS
**id:** TEAM_00_TO_TEAM_51_S003_P001_WP001_FAST25_ACTIVATION_PROMPT_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 51 (Agents_OS QA Agent)
**cc:** Team 100, Team 61
**date:** 2026-03-11
**status:** ACTIVE — Team 51 first task
**trigger:** Team 61 FAST_2 Execution Closeout received for S003-P001-WP001
---

# Team 51 — First Activation
## FAST_2.5 QA: S003-P001 WP001 — Data Model Validator

---

## STEP 0 — Mandatory Context Reads (before any action)

Read these documents in order before running a single command:

| # | Document | Why |
|---|---|---|
| 1 | `agents_os_v2/context/identity/team_51.md` | Your identity, commands, iron rules |
| 2 | `_COMMUNICATION/team_00/TEAM_00_TEAM_51_CONSTITUTION_v1.0.0.md` | Your authority scope and check catalog |
| 3 | This document (you are reading it) | The specific task |
| 4 | `_COMMUNICATION/team_61/TEAM_61_S003_P001_WP001_FAST2_EXECUTION_CLOSEOUT_v1.0.0.md` | What Team 61 delivered |
| 5 | `_COMMUNICATION/team_00/TEAM_00_S003_P001_DATA_MODEL_VALIDATOR_LOD400_v1.0.0.md` | Base spec (required test count, check IDs) |
| 6 | `_COMMUNICATION/team_00/TEAM_00_S003_P001_DATA_MODEL_VALIDATOR_LOD400_ADDENDUM_v1.0.0.md` | Addendum (supersedes base on BF-06 + BF-09) |

Do not proceed past this step until all 6 documents are read.

---

## STEP 1 — What Team 61 Delivered

Team 61 implemented the **Data Model Validator** for agents_os_v2. Expected deliverables (verify against Team 61's closeout):

| File | Type | Description |
|---|---|---|
| `agents_os_v2/validators/data_model.py` | NEW | Core validator module |
| `agents_os_v2/tests/test_data_model_validator.py` | NEW | 25 tests |
| `agents_os_v2/orchestrator/gate_router.py` | MODIFIED | Data model calls added |
| `agents_os_v2/validators/__init__.py` | MODIFIED | Export added |

**If any of these files is missing → FAIL on Check 5 or Check 6 immediately. Do not proceed.**

---

## STEP 2 — Run the 6 Standard Checks

### Check 1 — pytest (full suite)

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
api/venv/bin/python -m pytest agents_os_v2/tests/ -v
```

If no API keys are set, use:
```bash
api/venv/bin/python -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"
```

**Expected outcome:**
- All pre-existing tests PASS (no regressions)
- 25 new tests in `test_data_model_validator.py` PASS
- Total: [existing suite count + 25] PASSED, 0 FAILED

**PASS criterion:** 0 failures, 0 errors.

---

### Check 2 — mypy (new and modified files)

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
api/venv/bin/python -m mypy \
  agents_os_v2/validators/data_model.py \
  agents_os_v2/orchestrator/gate_router.py \
  agents_os_v2/validators/__init__.py \
  --ignore-missing-imports
```

**PASS criterion:** `Success: no issues found in N source files` — 0 errors.

---

### Check 3 — Domain isolation

```bash
grep -n "^from\|^import" agents_os_v2/validators/data_model.py
```

**PASS criterion:** All imports are from stdlib (os, sys, re, typing, json, pathlib, logging, etc.) only. No import from `api/`, `ui/`, `conversations/`.

**Known expected imports in data_model.py:**
- `import os` (migration path discovery)
- `import re` (column pattern matching)
- `from typing import ...`
- Possibly `import logging`

**FAIL if you see:** `from api.`, `import api.`, `from ui.`, `import ui.`, `from conversations.`

---

### Check 4 — bandit

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
api/venv/bin/python -m bandit -r agents_os_v2/validators/data_model.py -ll
```

**PASS criterion:** 0 HIGH severity issues.
Note any MEDIUM issues as informational flags (non-blocking).

---

### Check 5 — Test count

```bash
grep -c "def test_" agents_os_v2/tests/test_data_model_validator.py
```

**PASS criterion:** Count ≥ **25** (22 base + 2 BF-06 edge cases + 1 BF-09 guard, per LOD400 addendum).

**What the 25 tests cover:**
- DM-S-01: spec section detection (positive + negative)
- DM-S-02: FLOAT/DOUBLE on financial columns — BLOCK (positive + negative)
- DM-S-03..S-08: additional spec-phase checks (positive + negative each)
- DM-E-01: migration discovery (positive + edge cases: empty dir BLOCK, missing dir BLOCK)
- DM-E-02: downgrade() verification
- DM-E-03: additional execution-phase check
- BF-09 guard: `value_date` column → NOT financial (last token = `date`)

---

### Check 6 — Gate integration

```bash
grep -n "DM-S\|DM-E\|data_model" agents_os_v2/orchestrator/gate_router.py
```

**PASS criterion:** Evidence of DM-S check calls at GATE_0 and GATE_1; evidence of DM-E check calls at GATE_5.

Specifically verify:
- DM-S-01..DM-S-08 (or `run_spec_phase_checks` equivalent) called within GATE_0 and/or GATE_1 handling
- DM-E-01..DM-E-03 (or `run_execution_phase_checks` equivalent) called within GATE_5 handling

**FAIL if:** gate_router.py has no reference to data_model module at any gate.

---

## STEP 3 — Write QA Report

Write your report to:
`_COMMUNICATION/team_51/TEAM_51_S003_P001_WP001_FAST25_QA_REPORT_v1.0.0.md`

(Create the `_COMMUNICATION/team_51/` folder if it doesn't exist.)

Use the standard report format from `agents_os_v2/context/identity/team_51.md` §WHAT YOU PRODUCE.

**Fill in all fields. Leave nothing blank. Every check must have a result and evidence line.**

---

## STEP 4 — Routing After Report

### If PASS:
Your report header: `to: Team 00, Team 100` — `cc: Team 170`

At the end of your report, write:
```
HANDOFF TO TEAM 00:
FAST_2.5 QA PASS confirmed for S003-P001-WP001.
FAST_3 is authorized. Nimrod CLI demo checklist:
  1. Full pytest suite PASS
  2. mypy 0 errors
  3. Live DM-S-02 BLOCK: spec with 'price FLOAT' → GATE_0 stops with DM-S-02 BLOCK
  4. Live DM-E-02 BLOCK: migration missing downgrade() → GATE_5 stops with DM-E-02 BLOCK
  5. Clean path: valid spec (NUMERIC(20,8)) + valid migration → all DM checks PASS
Reference: TEAM_100_S003_P001_WP001_FAST0_SCOPE_BRIEF_v1.1.0.md §6
```

### If FAIL:
Your report header: `to: Team 61` — `cc: Team 00, Team 100`

At the end of your report, write:
```
RETURN TO TEAM 61:
FAST_2.5 QA FAIL on S003-P001-WP001.
Blocking items: [list all with file:line]
Fix all blocking items and re-submit FAST_2 Execution Closeout (version v1.1.0).
Team 51 will re-run all checks from scratch upon receiving updated closeout.
```

---

## Context Note — Why This Work Matters

This is Team 51's **first QA task**. The Data Model Validator (S003-P001) is the first new capability in the agents_os_v2 system built under the Phoenix program. Your PASS/FAIL verdict here establishes the quality baseline for all future AGENTS_OS work packages. The validator will prevent FLOAT columns in financial schemas from ever reaching production — a protection that depends entirely on this QA cycle being rigorous.

Do your job with precision. The Iron Rules exist for a reason.

---

**log_entry | TEAM_00 | TO_TEAM_51 | FIRST_ACTIVATION | S003_P001_WP001_FAST25 | 6_CHECKS_DEFINED | 2026-03-11**
