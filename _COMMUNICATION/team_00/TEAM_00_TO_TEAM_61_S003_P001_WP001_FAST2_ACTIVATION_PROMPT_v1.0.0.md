---
**project_domain:** AGENTS_OS
**id:** TEAM_00_TO_TEAM_61_S003_P001_WP001_FAST2_ACTIVATION_PROMPT_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 61 (FAST_2 Executor — AGENTS_OS)
**cc:** Team 51 (FAST_2.5 on standby), Team 100
**date:** 2026-03-11
**status:** ACTIVE — Team 61 begins immediately
**authority:** DIRECTIVE_VALIDATED_WITH_FLAGS (Team 190) + Team 00 acceptance v1.0.0
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P001 |
| work_package_id | WP001 |
| gate_id | FAST_2_ACTIVE |
| phase_owner | Team 61 |
| project_domain | AGENTS_OS |
| required_ssm_version | 1.0.0 |

---

# Team 61 — FAST_2 Activation: S003-P001 Data Model Validator

---

## §1 Authorization

Team 61 is authorized to begin FAST_2 execution of **S003-P001 WP001 — Data Model Validator**.

| Authorization chain | Status |
|---|---|
| Team 00 Independence Directive v1.0.0 | ✅ LOCKED |
| Team 190 constitutional validation | ✅ DIRECTIVE_VALIDATED_WITH_FLAGS |
| Team 00 acceptance + FA-01 ruling | ✅ LOCKED |
| FAST_0 scope brief v1.1.0 | ✅ OPERATIVE |
| FAST_1 PASS (prior session) | ✅ ON RECORD |

**Start immediately. No further approval needed.**

---

## §2 Spec Documents — Read Both Before Writing Any Code

| Priority | Document | Content |
|---|---|---|
| 1 — PRIMARY | `_COMMUNICATION/team_00/TEAM_00_S003_P001_DATA_MODEL_VALIDATOR_LOD400_v1.0.0.md` | Full LOD400 spec: deliverables, check IDs DM-S-01..S-08 + DM-E-01..E-03, integration points, test requirements (22 base) |
| 2 — ADDENDUM | `_COMMUNICATION/team_00/TEAM_00_S003_P001_DATA_MODEL_VALIDATOR_LOD400_ADDENDUM_v1.0.0.md` | **Addendum supersedes the base spec on BF-06 and BF-09 items.** Read this second; apply its implementations. |

**The addendum is not optional.** It resolves two critical implementation details from FAST_1 validation:
- BF-06: explicit BLOCK (not SKIP) when `api/alembic/versions/` is empty or missing
- BF-09: token-level matching for financial column detection (last `_`-split token only)

---

## §3 Deliverables

| File | Action | Notes |
|---|---|---|
| `agents_os_v2/validators/data_model.py` | **CREATE** | Core validator module — DM-S-01..S-08 spec-phase + DM-E-01..E-03 execution-phase checks |
| `agents_os_v2/tests/test_data_model_validator.py` | **CREATE** | 25 tests exactly (see §4 below) |
| `agents_os_v2/orchestrator/gate_router.py` | **MODIFY** | Add data_model validator calls at GATE_0, GATE_1 (spec-phase checks), and GATE_5 (execution-phase checks) |
| `agents_os_v2/validators/__init__.py` | **MODIFY** | Export data_model module |

**Domain isolation is mandatory:** `data_model.py` must only import stdlib modules. No imports from `api/`, `ui/`, `orchestrator/`, or `conversations/`. Violation = V-30..V-33 FAIL in FAST_2.5.

---

## §4 Required Tests — 25 Total

| Test group | Count | Source |
|---|---|---|
| Base tests (LOD400 v1.0.0) | 22 | One positive + one negative per check ID, plus supplemental edge cases |
| BF-06 edge cases (addendum) | 2 | Empty `versions/` dir → BLOCK; missing `versions/` dir → BLOCK |
| BF-09 false-positive guard (addendum) | 1 | `value_date` column → NOT financial (last token = `date`) |
| **Total** | **25** | — |

---

## §5 Key Implementation Details (from addendum)

### BF-09 — Financial Column Token Matching

```python
FINANCIAL_COLUMN_PATTERNS = {
    "price", "amount", "commission", "fee", "value", "balance",
    "pnl", "profit", "loss", "cost", "rate"
}

def _is_financial_column(col_name: str) -> bool:
    last_token = col_name.lower().split("_")[-1]
    return last_token in FINANCIAL_COLUMN_PATTERNS
```

Examples:
- `value_date` → last token `date` → **NOT financial** ✅
- `total_value` → last token `value` → **financial** ✅
- `service_value` → last token `value` → **financial** ✅
- `commission_rate` → last token `rate` → **financial** ✅

### BF-06 — Migration Path Discovery (all BLOCK, no SKIP)

```python
def _find_latest_migration(alembic_versions_dir: str) -> str:
    if not os.path.exists(alembic_versions_dir):
        raise DataModelValidatorError("DM-E-01: BLOCK — alembic versions directory not found")
    files = [f for f in os.listdir(alembic_versions_dir) if f.endswith(".py")]
    if not files:
        raise DataModelValidatorError("DM-E-01: BLOCK — no migration files in alembic versions directory")
    return max(files, key=lambda f: os.path.getmtime(os.path.join(alembic_versions_dir, f)))
```

---

## §6 FAST_2 Closeout — Required Before FAST_2.5

When implementation is complete, Team 61 writes:

**File:** `_COMMUNICATION/team_61/TEAM_61_S003_P001_WP001_FAST2_EXECUTION_CLOSEOUT_v1.0.0.md`

Closeout must confirm:
1. All 4 files delivered (2 new, 2 modified)
2. 25 tests pass locally (`pytest agents_os_v2/tests/test_data_model_validator.py -v`)
3. Full suite passing (no regressions in existing tests)
4. `mypy agents_os_v2/validators/data_model.py` → 0 errors
5. Domain isolation clean: no imports from `api/`, `ui/`, `orchestrator/`, `conversations/` in `data_model.py`
6. Gate integration working: GATE_0/GATE_1/GATE_5 call data_model checks without error on clean input

Once closeout is written, **notify Team 51** to begin FAST_2.5 QA.

---

## §7 FAST_2.5 Handoff to Team 51

After Team 61 writes the closeout, Team 51 runs:
1. Full pytest suite (must include all 25 DM tests passing)
2. mypy on `data_model.py` (0 errors)
3. Domain isolation check (V-30..V-33)
4. Bandit security scan (no HIGH findings)

Team 51 writes FAST_2.5 QA result to `_COMMUNICATION/team_51/`.

---

## §8 After FAST_2.5 — FAST_3 (Nimrod CLI)

FAST_3 is a 5-check CLI demo for Nimrod. Team 51 notifies Team 00 when FAST_2.5 passes. Team 00 schedules the CLI session.

FAST_3 checklist (run by Nimrod directly):
1. Full pytest suite PASS (all tests including 25 new)
2. mypy 0 errors
3. Live DM-S-02 BLOCK: spec file with `price FLOAT` column → GATE_0 stops with DM-S-02 BLOCK message
4. Live DM-E-02 BLOCK: migration file missing `downgrade()` function → GATE_5 stops with DM-E-02 BLOCK message
5. Clean path: valid spec (NUMERIC(20,8)) + valid migration (downgrade present) → all DM checks PASS, gate advances

---

**log_entry | TEAM_00 | TO_TEAM_61 | S003_P001_WP001_FAST2_ACTIVATION | AUTHORIZED | BEGIN_IMMEDIATELY | 2026-03-11**
