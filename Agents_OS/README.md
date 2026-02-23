# agents_os

**project_domain:** AGENTS_OS  
**work_package_id:** S001-P001-WP002  
**gate_id:** GATE_3

**created:** Per TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0  
**purpose:** Structural root for AGENTS_OS domain isolation (TIKTRACK | AGENTS_OS | SHARED). Canonical root is `agents_os/` (lowercase) only. **No code dependency on TikTrack.**

## Runtime structure (LLD400 §2.4)

| Folder | Purpose |
|--------|---------|
| `runtime/` | Execution context |
| `validators/` | 10↔90 validation hook — validator stub |
| `tests/` | Unit tests |
| `docs-governance/` | Domain governance artifacts |

## Connection to 10↔90 loop

- **Validator stub:** `validators/validator_stub.py` — runnable entry point for the 10↔90 validation workflow.
- **Run:** `python3 -m agents_os.validators.validator_stub` (from project root).
- **Tests:** `pytest agents_os/tests/` or `python -m pytest agents_os/tests/`.

## Domain isolation

- All runtime logic under `agents_os/`.
- **Zero imports** from TikTrack (api/, ui/, etc.).
- Per DOMAIN_ISOLATION_MODEL.
