---
**project_domain:** AGENTS_OS
**id:** TEAM_00_S003_P001_DATA_MODEL_VALIDATOR_LOD400_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 100 (Architectural Review + FAST_0 packaging), Team 61 (Executor — FAST_2), Team 51 (QA — FAST_2.5)
**cc:** Team 170 (Registry sync), Team 190 (FAST_1)
**date:** 2026-03-10
**status:** LOD400 COMPLETE — ready for FAST_0 scope brief (Team 100) → FAST_1 (Team 190)
**program_registry:** S003-P001 Data Model Validator — AGENTS_OS — PLANNED
historical_record: true
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P001 |
| work_package_id | WP001 (single WP — fast track) |
| gate_id | N/A (pre-FAST_0) |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S003 |
| project_domain | AGENTS_OS |
| architectural_approval_type | SPEC |

---

# S003-P001 — DATA MODEL VALIDATOR
## LOD400 Full Specification

---

## §1 Strategic Purpose

### 1.1 Problem Statement

The TikTrack database has critical correctness requirements that are currently enforced only by convention and code review:
- **Iron Rule:** `NUMERIC(20,8)` for all financial transactions (enforced manually)
- **Migration hygiene:** All schema changes must have rollback (`downgrade()`) — currently not automatically verified
- **Null safety:** New columns must explicitly declare `NULL` / `NOT NULL` — currently verified manually
- **FK integrity:** Foreign keys must declare `ON DELETE` behavior — currently verified manually

When a developer proposes a schema change, Team 00 and Team 100 review it manually. This creates:
1. Review bottleneck
2. Human error risk on Iron Rules
3. No automated gate for schema quality

### 1.2 Solution

S003-P001 adds a **Data Model Validator** to agents_os_v2: a deterministic Python module that validates schema and migration correctness at both SPEC level (GATE_0/GATE_1) and EXECUTION level (GATE_5).

### 1.3 Strategic Fit

| Capability | Status before S003-P001 | Status after S003-P001 |
|---|---|---|
| Financial type enforcement | Manual / Iron Rule convention | **Automated BLOCK at GATE_0 and GATE_5** |
| Migration rollback verification | Manual | **Automated check at GATE_5** |
| Null safety declaration | Manual | **Automated check at GATE_0 (spec) and GATE_5 (migration)** |
| FK integrity check | Manual | **Automated BLOCK at GATE_5** |

---

## §2 Program Architecture

### 2.1 Single Work Package

S003-P001 has **one WP** (fast track single-WP model):

```
S003-P001-WP001 — Data Model Validator (agents_os_v2)
    Domain: AGENTS_OS
    Track: FAST (default for AGENTS_OS)
    Stages: FAST_0 → FAST_1 → FAST_2 → FAST_2.5 → FAST_3 → FAST_4
```

### 2.2 Activation Condition

S003-P001-WP001 **may not open** until:
- S002-P001-WP002 GATE_8 PASS ✅ (already met — 2026-02-26)
- S003 GATE_0 (stage transition) open — requires S002 last active WP GATE_8 PASS

**Pre-production:** This LOD400 is prepared ahead of stage transition. Team 100 packages FAST_0 immediately upon S003 activation.

---

## §3 Deliverables

### 3.1 New Files (Team 61 creates)

| File | Type | Description |
|---|---|---|
| `agents_os_v2/validators/data_model.py` | Python module | Primary validator — all DM checks |
| `agents_os_v2/tests/test_data_model_validator.py` | Pytest | Tests for all DM check IDs |

### 3.2 Modified Files (Team 61 modifies)

| File | Change | Impact |
|---|---|---|
| `agents_os_v2/orchestrator/gate_router.py` | Add data_model validator to GATE_0, GATE_1, GATE_5 dispatch | Schema checks run automatically at relevant gates |
| `agents_os_v2/validators/__init__.py` | Export new `data_model` module | Import consistency |

### 3.3 No modifications to

- `api/` directory — AGENTS_OS domain isolation rule (V-31)
- `ui/` directory — same
- Governance documents — Team 170 updates registry mirror only

---

## §4 Check Registry — Complete Specification

### 4.1 SPEC-Phase Checks (DM-S-xx) — run at GATE_0 and GATE_1

These checks validate the **spec document** (LLD400/LOD200) before implementation begins.

| Check ID | Name | What is checked | Input | BLOCK if |
|---|---|---|---|---|
| **DM-S-01** | Schema change declared | Spec includes explicit DDL for all proposed schema changes | spec document text | No DDL block found when schema change is implied by spec |
| **DM-S-02** | Financial columns use NUMERIC(20,8) | Any column storing financial values uses `NUMERIC(20,8)` | DDL in spec | Financial column (by name pattern: `price`, `amount`, `commission`, `fee`, `value`, `balance`, `pnl`) uses any other type |
| **DM-S-03** | Migration declared | Spec references a migration file or explicit migration path | spec document text | Spec proposes schema change but no migration reference found |
| **DM-S-04** | Downgrade path declared | Spec states rollback strategy | spec document text | Spec declares migration but no downgrade/rollback section |
| **DM-S-05** | Column nullability explicit | All new columns have explicit NULL/NOT NULL declaration | DDL in spec | New column without nullability declaration |
| **DM-S-06** | FK ON DELETE declared | Foreign key columns declare ON DELETE behavior | DDL in spec | FK without ON DELETE clause |
| **DM-S-07** | Naming convention | Column names are snake_case, no SQL reserved words | DDL in spec | Column name fails `^[a-z][a-z0-9_]*$` pattern, or is a SQL reserved word (id is exempt as PK) |
| **DM-S-08** | No FLOAT/DOUBLE | No FLOAT, DOUBLE PRECISION, or REAL types used | DDL in spec | `FLOAT`, `DOUBLE PRECISION`, or `REAL` appears in DDL |

**Activation gate:** DM-S-01..DM-S-08 run when the spec document contains any of these markers: `ALTER TABLE`, `CREATE TABLE`, `ADD COLUMN`, `migration`, `schema change`, `DDL`.

**If no schema change is declared:** checks DM-S-01..DM-S-08 emit `SKIP` (not BLOCK) — no schema change is valid.

### 4.2 EXECUTION-Phase Checks (DM-E-xx) — run at GATE_5

These checks validate the **actual migration file** after implementation.

| Check ID | Name | What is checked | Input | BLOCK if |
|---|---|---|---|---|
| **DM-E-01** | Migration file exists | Migration file at declared path exists | filesystem | Spec declared migration path, file not found |
| **DM-E-02** | upgrade() and downgrade() present | Migration file contains both functions | migration file text | `upgrade()` or `downgrade()` not found in file |
| **DM-E-03** | No FLOAT/DOUBLE in migration | Migration SQL does not use FLOAT, DOUBLE PRECISION, REAL | migration file text | `FLOAT`, `DOUBLE PRECISION`, or `REAL` in any `op.execute()`, `op.add_column()`, or inline SQL string |

**Migration path discovery:** DM-E-01 looks in `api/alembic/versions/` for the latest migration file. If the spec declares a specific migration ID, that file is checked directly. If not, the most recently modified `.py` file in the versions directory is used.

---

## §5 Implementation Specification

### 5.1 Module Structure: `agents_os_v2/validators/data_model.py`

```python
from __future__ import annotations
"""
DM-S-01..DM-S-08: Data Model Spec Validator
DM-E-01..DM-E-03: Data Model Execution Validator
Validates schema changes in spec documents and migration files.
"""

from dataclasses import dataclass
from pathlib import Path
from ..config import REPO_ROOT

FINANCIAL_COLUMN_PATTERNS = [
    "price", "amount", "commission", "fee", "value",
    "balance", "pnl", "profit", "loss", "cost", "rate"
]

FORBIDDEN_TYPES = ["FLOAT", "DOUBLE PRECISION", "REAL", "DOUBLE"]

SQL_RESERVED = [
    "select", "from", "where", "table", "column", "index",
    "order", "group", "key", "default", "check", "constraint"
]

DDL_MARKERS = [
    "ALTER TABLE", "CREATE TABLE", "ADD COLUMN",
    "migration", "schema change", "DDL", "alembic"
]


@dataclass
class Finding:
    check_id: str
    status: str   # PASS / BLOCK / SKIP
    message: str
    path: str = ""


def validate_spec_schema(content: str, source_path: str = "") -> list[Finding]:
    """Run DM-S-01..DM-S-08 on a spec document."""
    ...


def validate_migration_file(migration_path: Path | None = None) -> list[Finding]:
    """Run DM-E-01..DM-E-03 on the migration file."""
    ...
```

### 5.2 Integration: `gate_router.py`

The `dispatch_gate()` function in `gate_router.py` calls validators per gate. The following additions are required:

| Gate | Validator call added |
|---|---|
| `GATE_0` | `data_model.validate_spec_schema(spec_content, path)` |
| `GATE_1` | `data_model.validate_spec_schema(spec_content, path)` |
| `GATE_5` | `data_model.validate_migration_file()` |

If any BLOCK is returned: gate stops, state transitions to `WAITING_FOR_REMEDIATION`, BF is raised.

### 5.3 Check ID Namespace

Team 61 MUST use the IDs exactly as defined in §4. No renaming. No new IDs without Team 00 approval.

Full registered namespace after S003-P001:
```
V-01..V-13    identity_header.py       (existing)
V-21..V-24    gate_compliance.py       (existing)
V-25..V-29    wsm_alignment.py         (existing)
V-30..V-33    domain_isolation.py      (existing)
SC-01..SC-02  spec_compliance.py       (existing)
DM-S-01..DM-S-08  data_model.py — spec phase   ← NEW (S003-P001)
DM-E-01..DM-E-03  data_model.py — exec phase   ← NEW (S003-P001)
```

---

## §6 Test Requirements

### 6.1 Test File: `agents_os_v2/tests/test_data_model_validator.py`

Minimum test coverage: **one positive + one negative test per check ID = 22 tests**

| Test | Type | Covers |
|---|---|---|
| `test_dm_s01_pass_no_ddl` | Positive | Spec with no schema change → DM-S-01 SKIP |
| `test_dm_s01_block_implicit_schema` | Negative | Spec references table change but no DDL → BLOCK |
| `test_dm_s02_pass_numeric_2008` | Positive | Price column declared NUMERIC(20,8) → PASS |
| `test_dm_s02_block_float_price` | Negative | `price FLOAT` → BLOCK |
| `test_dm_s03_pass_migration_declared` | Positive | Spec references alembic migration → PASS |
| `test_dm_s03_block_no_migration_ref` | Negative | Spec has DDL, no migration path → BLOCK |
| `test_dm_s04_pass_downgrade_present` | Positive | Spec states rollback strategy → PASS |
| `test_dm_s04_block_no_downgrade` | Negative | Spec has migration, no rollback section → BLOCK |
| `test_dm_s05_pass_explicit_null` | Positive | All columns explicit `NOT NULL` or `NULL` → PASS |
| `test_dm_s05_block_implicit_null` | Negative | New column without nullability → BLOCK |
| `test_dm_s06_pass_fk_on_delete` | Positive | FK with `ON DELETE CASCADE` → PASS |
| `test_dm_s06_block_fk_no_on_delete` | Negative | FK without ON DELETE → BLOCK |
| `test_dm_s07_pass_snake_case` | Positive | All columns snake_case → PASS |
| `test_dm_s07_block_reserved_word` | Negative | Column named `order` → BLOCK |
| `test_dm_s08_pass_numeric_type` | Positive | Only NUMERIC/INTEGER/TEXT types → PASS |
| `test_dm_s08_block_double_precision` | Negative | `DOUBLE PRECISION` in DDL → BLOCK |
| `test_dm_e01_pass_file_exists` | Positive | Migration file exists at path → PASS |
| `test_dm_e01_block_file_missing` | Negative | Declared path not found → BLOCK |
| `test_dm_e02_pass_both_functions` | Positive | upgrade() + downgrade() both present → PASS |
| `test_dm_e02_block_no_downgrade` | Negative | Only upgrade() → BLOCK |
| `test_dm_e03_pass_no_float` | Positive | Migration uses NUMERIC only → PASS |
| `test_dm_e03_block_float_in_migration` | Negative | `FLOAT` in op.add_column → BLOCK |

Total: 22 tests. All must pass before FAST_2.5 QA can issue PASS.

---

## §7 Scope Boundaries

### In Scope

| Item |
|---|
| New `agents_os_v2/validators/data_model.py` module |
| 11 check IDs (DM-S-01..DM-S-08, DM-E-01..DM-E-03) |
| Integration into gate_router.py (GATE_0, GATE_1, GATE_5) |
| 22 pytest tests |
| `validators/__init__.py` export update |

### Out of Scope

| Item | Reason |
|---|---|
| Alembic CLI execution / actual migration run | Too invasive; DM-E-01..03 check file content only |
| Index validation (which queries need which indexes) | S004-P001 scope (Financial Precision Validator) |
| Cross-migration conflict detection | Future validator; too complex for S003-P001 |
| api/ production code changes | Domain isolation — AGENTS_OS validator must not touch api/ |
| Running migrations against test DB | S003-P001 checks files only; live DB testing is Team 50's scope |

---

## §8 FAST_3 Acceptance Criteria (Nimrod / Team 00 CLI Review)

| # | Check | Pass Criteria |
|---|---|---|
| 1 | pytest full suite | 62 (existing) + 22 (new DM) = 84 tests PASS, 0 FAIL |
| 2 | mypy clean | 0 errors with `--ignore-missing-imports` |
| 3 | DM-S-02 live demo | Craft spec with `price FLOAT` → pipeline BLOCKS at GATE_0 with DM-S-02 |
| 4 | DM-E-02 live demo | Craft migration with no downgrade() → pipeline BLOCKS at GATE_5 with DM-E-02 |
| 5 | Clean spec passes | Valid spec with NUMERIC(20,8) + downgrade() → all DM checks PASS |

---

## §9 Iron Rules and Constraints

| Rule | Application |
|---|---|
| Domain isolation (V-30..V-33) | `data_model.py` must NOT import from `api/` |
| Check ID immutability | Once issued, DM-S-xx and DM-E-xx IDs are permanent — changing them is a breaking change requiring Team 00 approval |
| BLOCK semantics | A DM-S or DM-E BLOCK stops gate progression immediately — not a warning |
| SKIP vs BLOCK | DM-S-01..S-08 emit SKIP (not BLOCK) when no schema change is detected — absence of schema change is valid |

---

**log_entry | TEAM_00 | S003_P001_DATA_MODEL_VALIDATOR | LOD400_v1.0.0_COMPLETE | READY_FOR_FAST0 | 2026-03-10**
