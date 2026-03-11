---
**project_domain:** AGENTS_OS
**id:** TEAM_00_TO_TEAM_61_S003_P002_WP001_FAST2_ACTIVATION_PROMPT_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 61 (FAST_2 Executor — AGENTS_OS)
**cc:** Team 51 (FAST_2.5 on standby), Team 100
**date:** 2026-03-11
**status:** READY — activate after FAST_1 PASS from Team 190
**prerequisite:** Team 190 FAST_1_PASS on S003-P002 LOD400 — do NOT start until FAST_1 result is confirmed
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P002 |
| work_package_id | WP001 |
| gate_id | FAST_2_ACTIVE |
| phase_owner | Team 61 |
| project_domain | AGENTS_OS |
| required_ssm_version | 1.0.0 |

---

# Team 61 — FAST_2 Activation: S003-P002 WP001
## Test Template Generator — Implementation

---

## STEP 0 — Mandatory Context Reads (before writing any code)

| # | Document | Why |
|---|---|---|
| 1 | `agents_os_v2/context/identity/team_61.md` | Your identity and constraints |
| 2 | `_COMMUNICATION/team_00/TEAM_00_S003_P002_TEST_TEMPLATE_GENERATOR_LOD400_v1.0.0.md` | **Full implementation spec — primary reference** |
| 3 | `_COMMUNICATION/team_100/TEAM_100_S003_P002_WP001_FAST0_SCOPE_BRIEF_v1.0.0.md` | **Two procedural corrections you must follow** |
| 4 | `_COMMUNICATION/team_190/TEAM_190_S003_P002_WP001_FAST1_VALIDATION_RESULT_v1.0.0.md` | FAST_1 result — check for any PASS_WITH_ACTION items |

Read all 4 before writing a single line of code. If any PASS_WITH_ACTION items appear in the FAST_1 result, apply them during FAST_2.

---

## STEP 1 — Two Procedural Corrections (MANDATORY — apply before coding)

### Correction A: `agents_os_v2/requirements.txt` (NEW FILE)

The LOD400 says "add Jinja2 to requirements.txt." This means creating a **new file** (NOT modifying `api/requirements.txt` — that is the TIKTRACK domain).

Create: `agents_os_v2/requirements.txt`
```
# agents_os_v2 dependencies
Jinja2>=3.1.0,<4.0
```

Install in your environment before implementing generators/:
```bash
pip install "Jinja2>=3.1.0,<4.0"
```

### Correction B: Sample spec fixture (NEW FILE)

The FAST_3 check #3 ("run generator on S003-P003 LLD400") was corrected — S003-P003 LLD400 is not yet available. Instead, create:

`agents_os_v2/tests/fixtures/sample_spec_with_contracts.md`

Content (exact — this is the FAST_3 demo spec):
```markdown
# Sample LLD400 Spec — Test Fixture

## API Contracts

| Endpoint | Method | Request | Response | Auth |
|---|---|---|---|---|
| /api/v1/settings/ | GET | — | `{settings: {...}}` | Required |

## Page Contracts

| Page ID | Route | Components |
|---|---|---|
| D39 | /settings | SettingsForm, StatusBadge |
```

---

## STEP 2 — Deliverables

### Files to CREATE (6 new)

| File | Key contents |
|---|---|
| `agents_os_v2/generators/__init__.py` | Exports `generate_test_templates` from test_templates.py |
| `agents_os_v2/generators/test_templates.py` | `GeneratorResult` dataclass + `generate_test_templates(spec_path, output_base, force=False)` |
| `agents_os_v2/generators/spec_parser.py` | `APIContract` + `PageContract` dataclasses + `parse_api_contracts()` + `parse_page_contracts()` |
| `agents_os_v2/generators/templates/api_test.py.jinja` | API test Jinja2 template (see LOD400 §5.4) |
| `agents_os_v2/generators/templates/ui_test.py.jinja` | Selenium test Jinja2 template (see LOD400 §5.5) |
| `agents_os_v2/tests/test_template_generator.py` | 14 tests (see STEP 4) |

**Also create:**
- `agents_os_v2/requirements.txt` (Correction A)
- `agents_os_v2/tests/fixtures/sample_spec_with_contracts.md` (Correction B)
- `agents_os_v2/generators/templates/__init__.py` (empty — needed for package structure)
- `agents_os_v2/tests/fixtures/__init__.py` (if not already existing — needed for package)

### Files to MODIFY (2)

| File | Change |
|---|---|
| `agents_os_v2/orchestrator/gate_router.py` | Add G3.7 sub-stage dispatch (LOD400 §5.3 exact code block) |
| `agents_os_v2/orchestrator/__init__.py` | Export G3.7 handler if a CLI entry point calls sub-stages by name |

---

## STEP 3 — Domain Isolation (Iron Rule — check before committing)

`agents_os_v2/generators/` may ONLY import from:
- Python stdlib: `pathlib`, `re`, `os`, `shutil`, `dataclasses`, `typing`, `__future__`
- `jinja2` (now in `agents_os_v2/requirements.txt`)
- `agents_os_v2.config` (for REPO_ROOT constant)

**Prohibited imports in any file under `generators/`:**
- `from api.` or `import api.`
- `from ui.` or `import ui.`
- `from agents_os_v2.orchestrator.` (circular dependency)
- `from agents_os_v2.conversations.`
- `from agents_os_v2.validators.`

Run this check yourself before writing the closeout:
```bash
grep -rn "^from\|^import" agents_os_v2/generators/*.py
```

---

## STEP 4 — Required Tests (14 exactly)

Write all 14 tests in `agents_os_v2/tests/test_template_generator.py`:

| # | Test name | What it covers |
|---|---|---|
| 1 | `test_parse_api_contracts_standard_table` | Parser extracts APIContract from standard markdown table |
| 2 | `test_parse_page_contracts_standard_table` | Parser extracts PageContract from standard markdown table |
| 3 | `test_parse_no_section_returns_empty` | No `## API Contracts` section → empty list, no error |
| 4 | `test_tt00_block_empty_section` | `## API Contracts` present + no table → `GeneratorResult.blocks` contains TT-00 |
| 5 | `test_generate_api_test_file_created` | `generate_test_templates()` writes file to `tests/api/` |
| 6 | `test_generate_ui_test_file_created` | `generate_test_templates()` writes file to `tests/ui/` |
| 7 | `test_generate_output_is_valid_python` | Generated file passes `compile(source, '<string>', 'exec')` |
| 8 | `test_generate_skip_when_no_contracts` | No sections → `GeneratorResult.skipped_sections` populated, no files written |
| 9 | `test_idempotency_backup_on_rerun` | Existing file + `force=True` → `.pre_regen.py` backup created |
| 10 | `test_no_import_from_api` | Static: `grep "from api\." generators/*.py` returns empty |
| 11 | `test_no_import_from_orchestrator` | Static: `grep "from agents_os_v2.orchestrator" generators/*.py` returns empty |
| 12 | `test_jinja2_template_renders` | `api_test.py.jinja` renders with sample `APIContract` → produces valid string |
| 13 | `test_ui_template_renders` | `ui_test.py.jinja` renders with sample `PageContract` → produces valid string |
| 14 | `test_generator_result_lists_generated_files` | `GeneratorResult.generated_files` contains the written paths |

**Use `tmp_path` pytest fixture for file I/O tests** (tests 5, 6, 7, 8, 9, 14) — do not write to the real `tests/` directory during test runs.

---

## STEP 5 — G3.7 Integration (exact code)

In `agents_os_v2/orchestrator/gate_router.py`, add the following block to the G3.x dispatch logic:

```python
elif sub_stage == "G3.7":
    from ..generators.test_templates import generate_test_templates
    result = generate_test_templates(
        spec_path=state.spec_path,
        output_base=REPO_ROOT / "tests",
        force=getattr(args, "force_generate", False),
    )
    if result.blocks:
        state.current_gate = "WAITING_FOR_SPEC_REMEDIATION"
        state.save()
        for msg in result.blocks:
            _log(f"⛔ TT-00 BLOCK: {msg}")
        return
    _log(f"G3.7 PASS: {len(result.generated_files)} test scaffold(s) generated.")
    state.advance_to("G3.6")
    state.save()
```

---

## STEP 6 — FAST_2 Closeout

When all files are written and all tests pass locally, write:

`_COMMUNICATION/team_61/TEAM_61_S003_P002_WP001_FAST2_EXECUTION_CLOSEOUT_v1.0.0.md`

Closeout must confirm:
1. All 8 deliverable files created (6 core + requirements.txt + sample fixture)
2. 2 existing files modified (gate_router.py + orchestrator/__init__.py)
3. 14 tests pass: `python -m pytest agents_os_v2/tests/test_template_generator.py -v`
4. Full suite passing (no regressions): `python -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"`
5. mypy 0 errors: `mypy agents_os_v2/generators/ --ignore-missing-imports`
6. Domain isolation clean (grep results showing no prohibited imports)
7. Jinja2 importable: `python -c "import jinja2; print(jinja2.__version__)"`
8. G3.7 handler present in gate_router.py (grep evidence)

After writing closeout → **notify Team 51** to begin FAST_2.5.

---

**log_entry | TEAM_00 | TO_TEAM_61 | S003_P002_WP001_FAST2_ACTIVATION | READY_AFTER_FAST1_PASS | 2026-03-11**
