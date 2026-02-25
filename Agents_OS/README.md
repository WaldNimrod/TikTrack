# agents_os

**project_domain:** AGENTS_OS  
**work_package_id:** S002-P001-WP001 (Spec Validation Engine)  
**gate_id:** GATE_3

**created:** Per TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0  
**purpose:** Structural root for AGENTS_OS domain isolation (TIKTRACK | AGENTS_OS | SHARED). Canonical root is `agents_os/` (lowercase) only. **No code dependency on TikTrack.**

## Runtime structure (LLD400 §2.4, §2.5)

| Folder | Purpose |
|--------|---------|
| `runtime/` | Execution context |
| `validators/base/` | message_parser, validator_base, response_generator, seal_generator, wsm_state_reader |
| `validators/spec/` | TIER 1–7 (44 checks): identity header, section structure, gate model, WSM alignment, domain isolation, package completeness, LOD200 traceability |
| `validators/validator_stub.py` | Legacy stub for 10↔90 execution flow (S001-P001-WP002) |
| `llm_gate/` | quality_judge (Q-01–Q-05); HOLD on negative; mock in tests |
| `orchestrator/` | validation_runner CLI — PASS/BLOCK/HOLD |
| `tests/` | Unit tests (spec/, base) |
| `docs-governance/` | Domain governance artifacts |

## Spec validation (170→190)

- **CLI:** `python3 -m agents_os.orchestrator.validation_runner <path-to-spec.md>` (from project root).
- **Output:** PASS (0) / BLOCK (1) / HOLD (2).

## Connection to 10↔90 loop

- **Validator stub:** `validators/validator_stub.py` — runnable entry point for execution flow.
- **Run:** `python3 -m agents_os.validators.validator_stub` (from project root).
- **Tests:** `python3 -m pytest agents_os/tests/` — 18 tests.

## Domain isolation

- All runtime logic under `agents_os/`.
- **Zero imports** from TikTrack (api/, ui/, etc.).
- Per DOMAIN_ISOLATION_MODEL.
