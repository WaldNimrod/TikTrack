---
**project_domain:** AGENTS_OS
**id:** TEAM_00_S003_P002_TEST_TEMPLATE_GENERATOR_LOD400_v1.0.0.md
**from:** Team 00 (Chief Architect)
**to:** Team 100 (FAST_0 packaging), Team 61 (Executor — FAST_2), Team 51 (QA — FAST_2.5)
**cc:** Team 170 (Registry), Team 190 (FAST_1)
**date:** 2026-03-11
**status:** LOD400 COMPLETE — ready for FAST_0 (Team 100) after S003-P001 FAST_4
**supersedes_concept:** TEAM_00_S003_P002_TEST_TEMPLATE_GENERATOR_LOD200_v1.0.0 (LOD200 — concept only)
**flags_resolved:** FLAG-01..FLAG-06 from TEAM_190_S003_P002_LOD200_CONCEPT_VALIDATION_RESULT_v1.0.0
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P002 |
| work_package_id | WP001 (single WP — fast track) |
| gate_id | N/A (pre-FAST_0) |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S003 |
| project_domain | AGENTS_OS |
| architectural_approval_type | SPEC |

---

# S003-P002 — TEST TEMPLATE GENERATOR
## LOD400 Full Specification

---

## §1 Strategic Purpose

Generate pytest and Selenium test scaffold files from LLD400 spec documents.
Full strategic rationale: see LOD200 §1. Summary: first use = S003-P003 (System Settings); pays forward across 15+ future WPs.

**ROI claim (FLAG-06 resolved):** Target to reduce Team 50 test-scaffolding time. Measured empirically after S003-P003 first use. Pre-measurement value = **hypothesis only** — not stated as fact in any deliverable.

---

## §2 Activation Condition

S003-P002-WP001 activates after **S003-P001-WP001 FAST_4 PASS.**

Rationale: generators/ module architecture benefits from S003-P001 implementation experience; and pre-existing validator tests must remain green through the P002 delivery.

---

## §3 Deliverables

### 3.1 New Files (Team 61 creates)

| File | Type | Description |
|---|---|---|
| `agents_os_v2/generators/__init__.py` | Python | Package init — exports `generate_test_templates` |
| `agents_os_v2/generators/test_templates.py` | Python | Primary generator module |
| `agents_os_v2/generators/spec_parser.py` | Python | LLD400 spec parser — extracts API + Page contracts |
| `agents_os_v2/generators/templates/api_test.py.jinja` | Jinja2 | API test scaffold template |
| `agents_os_v2/generators/templates/ui_test.py.jinja` | Jinja2 | Selenium test scaffold template |
| `agents_os_v2/tests/test_template_generator.py` | Pytest | Generator tests (see §6) |

### 3.2 Modified Files

| File | Change |
|---|---|
| `agents_os_v2/orchestrator/gate_router.py` | Add G3.7 sub-stage dispatch (see §5.2) |
| `agents_os_v2/orchestrator/__init__.py` | Export G3.7 handler if needed for CLI |
| `requirements.txt` | Add `Jinja2>=3.1.0` (see §4 FLAG-05 resolution) |

### 3.3 No modifications to

- `api/`, `ui/`, `tests/` (test files are OUTPUT, not modified by generator)
- `agents_os_v2/validators/` — generators are a separate concern

---

## §4 FLAGS Resolution (all 6 from Team 190 concept validation)

### FLAG-01 RESOLVED: Import contract for `generators/`

`agents_os_v2/generators/` **MAY import:**
- Python stdlib: `pathlib`, `re`, `dataclasses`, `typing`, `os`, `shutil`
- Jinja2 (approved — see FLAG-05)
- `agents_os_v2.config` (REPO_ROOT, etc.)
- Nothing else

`agents_os_v2/generators/` **MUST NOT import:**
- `api.*` — domain isolation Iron Rule (V-31)
- `ui.*` — same
- `agents_os_v2.orchestrator.*` — circular dependency prevention
- `agents_os_v2.conversations.*` — same
- `agents_os_v2.validators.*` — generators are independent; if validation is needed, call from orchestrator

**Enforcement:** Team 51 runs domain_isolation validator V-30..V-33 on generators/ as part of FAST_2.5 QA. FAIL on any illegal import = FAST_2.5 BLOCK.

### FLAG-02 RESOLVED: G3.7 sub-stage sequencing lock

| Property | Value |
|---|---|
| Sub-stage name | `G3.7` |
| Full name | "Test Template Generation" |
| Position in GATE_3 chain | After G3.5 (work plan PASS) — **before G3.6** (team activation mandates) |
| Entry condition | G3.5 PASS confirmed by Team 90 |
| Execution | Team 61 (orchestrated by Team 10 as part of GATE_3 phase) |
| Exit condition | Test scaffold files written to `tests/api/` and `tests/ui/` **OR** explicit `TT-00 SKIP` (no parseable contracts) |
| Impact on G3.6 | Team 10 includes scaffold file paths in Team 50 activation mandate |

Updated GATE_3 chain (full):
```
G3.1 → G3.2 → G3.3 → G3.4 → G3.5 (work plan) → G3.7 (test template) → G3.6 (mandates) → G3.8 (pre-check) → G3.9 (close)
```

**Note on numbering:** G3.7 is inserted between G3.5 and G3.6 in the functional sequence, despite the number ordering. This matches the existing convention where G3.x numbers reflect addition order, not purely alphabetical position. Team 10 updates its GATE_3 orchestration notes accordingly.

### FLAG-03 RESOLVED: Idempotency policy

| Property | Value |
|---|---|
| Default behavior | GENERATE_ONCE — G3.7 runs once per WP, at GATE_3 |
| Re-run trigger | Team 10 explicit `--force-generate` flag only |
| Protection | Before overwrite: existing file is backed up to `{filename}.pre_regen.py` in same directory |
| Team 50 contract | Team 50 MUST NOT put manual content in generated files. If Team 50 wants to extend a generated test, they create a NEW file (e.g., `test_alerts_extended.py`) — never edit the generated file directly |
| Git workflow | Team 61 commits generated files at G3.7 exit. Team 50 sees full diff in their activation mandate. |

### FLAG-04 RESOLVED: Parser failure policy

**Two distinct failure modes:**

| Case | What happens |
|---|---|
| Spec has `## API Contracts` or `## Page Contracts` section but no parseable table within it | **BLOCK — TT-00** (parser found section marker but extracted zero contracts) |
| Spec has NO `## API Contracts` and NO `## Page Contracts` section | **SKIP — TT-SKIP** (no contract scope declared; not a failure) |
| Parser finds contracts in some sections but not others | Generate templates for found contracts; log a WARNING per missing section |

**TT-00 check ID (new — parser failure BLOCK):**
```python
Finding(
    check_id="TT-00",
    status="BLOCK",
    message="Spec section '## API Contracts' found but zero parseable contract tables extracted. "
            "Verify table format matches: | Endpoint | Method | Request | Response | Auth |",
)
```

### FLAG-05 RESOLVED: Dependency decision

**Jinja2: APPROVED.**

| Property | Value |
|---|---|
| Package | Jinja2 |
| Version | `>=3.1.0,<4.0` |
| License | BSD-3-Clause |
| Security | No known CVEs; standard template engine; no arbitrary code execution risk in this usage (templates are static files in repo) |
| Pinning | Team 61 pins in `requirements.txt` |
| Fallback | If Jinja2 is later rejected by security review: replace with Python `string.Template` — API impact is limited to `templates/` files only; `test_templates.py` interface is unchanged |

### FLAG-06 RESOLVED: KPI / ROI baseline

| Metric | Measurement method | Baseline captured |
|---|---|---|
| Scaffolding time saved | Team 50 logs time-to-first-test-run in FAST_2 closeout | After S003-P003 first use |
| Generated lines vs manual lines | `wc -l` on generated files vs Team 50 additions | After S003-P003 first use |
| Test coverage contribution | pytest `--cov` on generated scaffold before Team 50 fills assertions | After S003-P003 first use |

**ROI framing in all documents:** "Expected to reduce scaffolding time; validated empirically after S003-P003 rollout."

---

## §5 Implementation Specification

### 5.1 spec_parser.py — Contract Extraction

```python
from __future__ import annotations
"""
Parses LLD400 spec documents to extract API and Page contracts.
Input: spec document content (string)
Output: list[APIContract] + list[PageContract]
"""
import re
from dataclasses import dataclass, field

@dataclass
class APIContract:
    endpoint: str       # e.g. "/api/v1/alerts/"
    method: str         # e.g. "GET"
    request_shape: str  # raw from table
    response_shape: str # raw from table
    auth_required: bool

@dataclass
class PageContract:
    page_id: str        # e.g. "D34"
    route: str          # e.g. "/alerts"
    components: list[str]  # e.g. ["AlertList", "AlertItem"]

def parse_api_contracts(spec_content: str) -> list[APIContract]: ...
def parse_page_contracts(spec_content: str) -> list[PageContract]: ...
```

**Parsing strategy (FLAG-04 Option A — regex on existing table format):**

API contract tables match: `| {endpoint} | {method} | {request} | {response} | {auth} |`
Page contract tables match: `| {page_id} | {route} | {components} |` (flexible column names)

### 5.2 test_templates.py — Generator Interface

```python
from __future__ import annotations
"""
Test Template Generator — main interface.
Input: spec document path or content
Output: generated test files written to tests/api/ and tests/ui/
"""
from dataclasses import dataclass
from pathlib import Path

@dataclass
class GeneratorResult:
    generated_files: list[Path]
    skipped_sections: list[str]
    blocks: list[str]          # TT-00 BLOCK messages if any

def generate_test_templates(
    spec_path: Path,
    output_base: Path,           # REPO_ROOT / "tests"
    force: bool = False,
) -> GeneratorResult: ...
```

### 5.3 gate_router.py integration — G3.7 handler

```python
# In dispatch_gate() or equivalent GATE_3 sub-stage handler:
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

### 5.4 Template structure: `api_test.py.jinja`

```jinja
# {{ filename }} — generated by agents_os_v2 Test Template Generator (S003-P002)
# DO NOT EDIT. Extend in a separate file (e.g., {{ filename | replace('.py', '_extended.py') }}).
# Generated: {{ generation_timestamp }}
import pytest
from tests.fixtures import auth_client, admin_client, client

{% for contract in api_contracts %}
class Test{{ contract.endpoint | to_class_name }}:
    """Tests for {{ contract.method }} {{ contract.endpoint }}"""

    def test_returns_200_authenticated(self, auth_client):
        # TODO: implement
        ...

    def test_returns_401_unauthenticated(self, client):
        # TODO: implement
        ...

    def test_response_shape(self, auth_client):
        # TODO: assert response matches {{ contract.response_shape }}
        ...
{% endfor %}
```

### 5.5 Template structure: `ui_test.py.jinja`

```jinja
# {{ filename }} — generated by agents_os_v2 Test Template Generator (S003-P002)
# DO NOT EDIT. Extend in a separate file.
import pytest
from selenium.webdriver.common.by import By
from tests.selenium_base import SeleniumTestBase

{% for page in page_contracts %}
class Test{{ page.page_id }}Page(SeleniumTestBase):
    """E2E tests for {{ page.page_id }} ({{ page.route }})"""

    def test_page_loads(self, driver):
        # TODO: driver.get(BASE_URL + "{{ page.route }}")
        ...

    {% for component in page.components %}
    def test_{{ component | to_snake }}_renders(self, driver):
        # TODO: assert {{ component }} is visible
        ...
    {% endfor %}
{% endfor %}
```

---

## §6 Test Requirements

### 6.1 Test file: `agents_os_v2/tests/test_template_generator.py`

Minimum: **one positive + one negative per check + parser edge cases = 14 tests**

| Test | Covers |
|---|---|
| `test_parse_api_contracts_standard_table` | Parser extracts correct APIContract from standard table |
| `test_parse_page_contracts_standard_table` | Parser extracts correct PageContract from standard table |
| `test_parse_no_section_returns_empty` | No `## API Contracts` section → empty list, no error |
| `test_tt00_block_empty_section` | `## API Contracts` section exists but no table → TT-00 BLOCK |
| `test_generate_api_test_file_created` | generate_test_templates writes to tests/api/ |
| `test_generate_ui_test_file_created` | generate_test_templates writes to tests/ui/ |
| `test_generate_output_is_valid_python` | Generated file parses as valid Python (compile()) |
| `test_generate_skip_when_no_contracts` | No sections → GeneratorResult.skipped_sections populated |
| `test_idempotency_backup_on_rerun` | Pre-existing file backed up to `.pre_regen.py` on force rerun |
| `test_no_import_from_api` | generators/ module has no `from api.` import (domain isolation) |
| `test_no_import_from_orchestrator` | generators/ has no circular import from orchestrator/ |
| `test_jinja2_template_renders` | api_test.py.jinja renders with sample APIContract data |
| `test_ui_template_renders` | ui_test.py.jinja renders with sample PageContract data |
| `test_generator_result_lists_generated_files` | GeneratorResult.generated_files populated correctly |

Total: **14 tests.** All must pass for FAST_2.5 QA.

---

## §7 Scope Boundaries

### In Scope

| Item |
|---|
| `agents_os_v2/generators/` new module (5 files) |
| `gate_router.py` G3.7 dispatch |
| Jinja2 templates for API + Selenium test scaffolds |
| 14 tests in `test_template_generator.py` |
| `requirements.txt` Jinja2 pin |

### Out of Scope

| Item | Reason |
|---|---|
| Running generated tests | Generator emits files; Team 50 runs them |
| Spec format changes | Generator adapts to existing LLD400 table format |
| Unit test template generation | Only API + Selenium; unit tests are domain-specific |
| Merge-aware re-generation | Option A (overwrite with backup) is sufficient for initial version |
| GUI / web dashboard | CLI-only |
| Generating test fixtures | Fixtures are project-specific; only stubs are generated |

---

## §8 FAST_3 Acceptance Criteria (Nimrod CLI + Output Review)

| # | Check | Pass Criteria |
|---|---|---|
| 1 | pytest suite | All pre-existing tests + 14 new TT tests = PASS |
| 2 | mypy clean | 0 errors |
| 3 | Live generation demo | Run generator on S003-P003 System Settings LLD400 → scaffold files written to tests/ |
| 4 | Output validity | `python -m py_compile tests/api/test_system_settings.py` exits 0 |
| 5 | TT-00 live block | Spec with `## API Contracts` section but empty table → generator BLOCKS with TT-00 |
| 6 | SKIP demo | Spec with no contract sections → GeneratorResult shows SKIP, no files created |
| 7 | Domain isolation | `grep -r "from api\." agents_os_v2/generators/` returns empty |

---

**log_entry | TEAM_00 | S003_P002_TEST_TEMPLATE_GENERATOR | LOD400_v1.0.0_COMPLETE | FLAG01_TO_FLAG06_RESOLVED | READY_FOR_FAST0_AFTER_P001_FAST4 | 2026-03-11**
