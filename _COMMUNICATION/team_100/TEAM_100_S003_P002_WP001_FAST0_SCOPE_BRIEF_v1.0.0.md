---
**project_domain:** AGENTS_OS
**id:** TEAM_100_S003_P002_WP001_FAST0_SCOPE_BRIEF_v1.0.0
**from:** Team 100 (Development Architecture Authority — AGENTS_OS)
**to:** Team 190 (FAST_1), Team 61 (FAST_2), Team 51 (FAST_2.5)
**cc:** Team 00, Team 170 (FAST_4)
**date:** 2026-03-11
**status:** ACTIVE — FAST_1 authorization pending Team 190 validation
**activation_condition:** ✅ IMMEDIATELY AUTHORIZED — S003-P001 WP001 FAST_4 PASS confirmed 2026-03-11 per TEAM_00_AGENTS_OS_INDEPENDENT_ADVANCEMENT_DIRECTIVE_v1.0.0 §2.2
**protocol:** FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0 §6.2 (AGENTS_OS sequence)
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P002 |
| work_package_id | WP001 (single WP — fast track) |
| gate_id | FAST_0 |
| phase_owner | Team 100 |
| project_domain | AGENTS_OS |
| required_ssm_version | 1.0.0 |

---

# S003-P002 WP001 — FAST_0 SCOPE BRIEF
## Test Template Generator — AGENTS_OS Fast Track

---

## §1 Status

| Event | Status | Date |
|---|---|---|
| Activation condition | ✅ SATISFIED | 2026-03-11 |
| LOD400 spec (base) | ✅ COMPLETE — all 6 FLAGS resolved | 2026-03-11 |
| Prior concept validation (Team 190) | ✅ CONCEPT_APPROVED_WITH_FLAGS (flags now resolved in LOD400 v1.0.0) | 2026-03-11 |
| **FAST_1 (Team 190 — full LOD400)** | ⏳ **ACTIVE — send to Team 190 now** | — |

---

## §2 Objective

Build the **Test Template Generator** — a new `agents_os_v2/generators/` module that parses LLD400 spec documents and emits pytest + Selenium test scaffold files. First use case: S003-P003 System Settings (D39+D40+D41).

This is a **capability layer** that pays forward across all future WPs. Once deployed, Team 50 (TIKTRACK QA) receives generated scaffolds at G3.7 (new sub-stage in GATE_3 chain) reducing manual scaffolding overhead.

---

## §3 Spec Reference (complete implementation spec)

Team 61 and Team 190 read **both** documents:

| Document | Content | Path |
|---|---|---|
| LOD400 full spec | Deliverables, data classes, parser strategy, FLAG resolutions, test requirements (14), FAST_3 checklist | `_COMMUNICATION/team_00/TEAM_00_S003_P002_TEST_TEMPLATE_GENERATOR_LOD400_v1.0.0.md` |

No addendum. The LOD400 is self-contained.

---

## §4 Fast Stage Assignments

| Stage | Owner | Status |
|---|---|---|
| FAST_0 | Team 100 | ✅ (this document) |
| **FAST_1** | **Team 190** | ⏳ **ACTIVE — validate LOD400 now** |
| FAST_2 | Team 61 | Pending FAST_1 PASS |
| FAST_2.5 | Team 51 | Pending FAST_2 closeout |
| FAST_3 | Nimrod (CLI + output review) | Pending FAST_2.5 PASS |
| FAST_4 | Team 170 | Pending FAST_3 PASS |

---

## §5 Deliverables Summary (Team 61 scope)

### New files (6)

| File | Description |
|---|---|
| `agents_os_v2/generators/__init__.py` | Package init — exports `generate_test_templates` |
| `agents_os_v2/generators/test_templates.py` | Primary generator — `generate_test_templates()`, `GeneratorResult` |
| `agents_os_v2/generators/spec_parser.py` | Spec parser — `APIContract`, `PageContract`, `parse_api_contracts()`, `parse_page_contracts()` |
| `agents_os_v2/generators/templates/api_test.py.jinja` | Jinja2 API test scaffold template |
| `agents_os_v2/generators/templates/ui_test.py.jinja` | Jinja2 Selenium test scaffold template |
| `agents_os_v2/tests/test_template_generator.py` | 14 tests |

### Modified files (2)

| File | Change |
|---|---|
| `agents_os_v2/orchestrator/gate_router.py` | Add G3.7 sub-stage dispatch (LOD400 §5.3) |
| `agents_os_v2/orchestrator/__init__.py` | Export G3.7 handler if needed for CLI entry point |

### New dependency file (1) — see §6

| File | Change |
|---|---|
| `agents_os_v2/requirements.txt` | **CREATE NEW** — `Jinja2>=3.1.0,<4.0` |

---

## §6 Procedural Correction — requirements.txt (IMPORTANT for Team 61)

The LOD400 says "Add Jinja2>=3.1.0 to requirements.txt." Pre-FAST_0 analysis found that:
- `api/requirements.txt` belongs to the TIKTRACK domain and must NOT be modified by AGENTS_OS WPs.
- `agents_os_v2/` has no requirements.txt yet.

**Ruling (Team 100, 2026-03-11):** Team 61 creates a new file:
```
agents_os_v2/requirements.txt
```
Content:
```
# agents_os_v2 dependencies
Jinja2>=3.1.0,<4.0
```

Team 51 QA confirms this file exists and contains the correct Jinja2 pin. Team 170 notes this in FAST_4 closure.

---

## §7 Procedural Correction — FAST_3 Check #3 (sample spec)

LOD400 §8 Check #3 states: "Run generator on S003-P003 System Settings LLD400."

Pre-FAST_0 analysis found that S003-P003 LLD400 (LOD400) has not been written yet and will not be available at FAST_3 time.

**Ruling (Team 100, 2026-03-11):** Team 61 creates a **sample spec document** during FAST_2:
```
agents_os_v2/tests/fixtures/sample_spec_with_contracts.md
```
This synthetic spec contains exactly two sections:
- `## API Contracts` with one standard table row
- `## Page Contracts` with one standard table row

FAST_3 Check #3 runs the generator against this sample spec. When S003-P003 LLD400 is eventually written, Team 170 may optionally re-demo against the real spec in FAST_4 commentary.

---

## §8 Domain Isolation Rules (strict — per LOD400 FLAG-01)

`agents_os_v2/generators/` may import ONLY:
- Python stdlib (`pathlib`, `re`, `dataclasses`, `typing`, `os`, `shutil`)
- Jinja2 (approved)
- `agents_os_v2.config` (REPO_ROOT, etc.)

May NOT import:
- `api.*`, `ui.*` (domain isolation)
- `agents_os_v2.orchestrator.*` (circular dep prevention)
- `agents_os_v2.conversations.*`
- `agents_os_v2.validators.*`

Team 51 FAST_2.5 check will fail on any violation.

---

## §9 GATE_3 Chain Update Note (downstream — not a FAST_2 deliverable)

S003-P002 introduces **G3.7** as a new sub-stage in the GATE_3 chain. The updated sequence:
```
G3.1 → G3.2 → G3.3 → G3.4 → G3.5 → G3.7 (NEW) → G3.6 → G3.8 → G3.9
```

Team 170 updates `TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md` (or issues v2.0.0) as part of FAST_4 closure. Team 10 is notified by Team 170 at FAST_4.

---

## §10 FAST_3 Acceptance Criteria (Nimrod CLI — 7 checks)

| # | Check | Pass Criteria |
|---|---|---|
| 1 | pytest suite | All pre-existing tests + 14 new TT tests = PASS (0 failures) |
| 2 | mypy clean | 0 errors |
| 3 | Live generation demo | Run generator on sample spec → scaffold files written to `tests/api/` and `tests/ui/` |
| 4 | Output validity | `python -m py_compile tests/api/test_*.py` exits 0 |
| 5 | TT-00 live block | Spec with `## API Contracts` section + empty table → generator BLOCKS with TT-00 |
| 6 | SKIP demo | Spec with no contract sections → `GeneratorResult.skipped_sections` populated, 0 files created |
| 7 | Domain isolation | `grep -r "from api\." agents_os_v2/generators/` returns empty |

---

## §11 FAST_4 — Team 170 Actions

At FAST_4, Team 170:
1. Updates `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` — S003-P002 → COMPLETE
2. Updates `TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md` — adds G3.7 sub-stage definition
3. Notifies Team 10 of G3.7 addition to their GATE_3 runbook
4. Notes `agents_os_v2/requirements.txt` as new canonical file in AGENTS_OS registry
5. Updates WSM agents_os_parallel_track note — S003-P001 CLOSED → S003-P002 FAST_2 ACTIVE

---

**log_entry | TEAM_100 | S003_P002_WP001_FAST0_SCOPE_BRIEF | v1.0.0_ISSUED | IMMEDIATELY_ACTIVATED | FAST1_SENT_TO_TEAM_190 | 2 PROCEDURAL_CORRECTIONS_LOCKED | 2026-03-11**
