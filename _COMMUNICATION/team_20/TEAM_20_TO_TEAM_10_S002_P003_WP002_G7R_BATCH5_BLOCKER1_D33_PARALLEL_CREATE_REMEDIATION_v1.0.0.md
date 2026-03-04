# TEAM 20 → TEAM 10 | G7R BATCH5 BLOCKER1 D33 PARALLEL CREATE REMEDIATION

```
--- PHOENIX TASK SEAL ---
TASK_ID: S002_P003_WP002_G7R_BATCH5_BLOCKER1_D33_PARALLEL_CREATE_REMEDIATION
STATUS: PASS
FILES_MODIFIED: api/services/canonical_ticker_service.py, tests/unit/test_d33_parallel_create.py, scripts/run-d33-parallel-create-test.sh, Makefile, .cursorrules
PRE_FLIGHT: make test-d33-parallel → exit 0
HANDOVER_PROMPT: D33 single-create invariant enforced. Ready for GATE consolidation.
--- END SEAL ---
```

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P003_WP002_G7R_BATCH5_BLOCKER1_D33_PARALLEL_CREATE_REMEDIATION_v1.0.0  
**from:** Team 20 (Backend)  
**to:** Team 10 (Gateway)  
**date:** 2026-01-31  
**overall_status:** PASS

---

## Summary

D33 concurrent create for same symbol no longer returns 201,201 with duplicate tickers. Single-create invariant enforced via PostgreSQL advisory lock + idempotent get-or-create.

**Evidence:** `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_20_S002_P003_WP002_G7R_BATCH5_BLOCKER1_D33_PARALLEL_CREATE_REMEDIATION_v1.0.0.md`

---

## Exact fix location(s)

| File | Change |
|------|--------|
| `api/services/canonical_ticker_service.py` | 1) `_symbol_advisory_key()` — deterministic bigint for lock 2) `pg_advisory_xact_lock(:key)` before uniqueness check 3) Return existing ticker instead of 409 when found 4) On IntegrityError: re-select and return existing (defense in depth) |

---

## Concurrency test evidence

**Test file:** `tests/unit/test_d33_parallel_create.py`

**Tests:**
- `test_parallel_create_same_symbol_no_duplicate_tickers` — two users, parallel add same symbol → exactly 1 ticker row
- `test_parallel_create_same_user_one_create_one_conflict` — same user, parallel add same symbol → 1 success (201), 1 conflict (409)

**Run:** `make test-d33-parallel` or `bash scripts/run-d33-parallel-create-test.sh`  
(Loads api/.env, sets RUN_D33_PARALLEL_TEST=1, SKIP_LIVE_DATA_CHECK=true)

**Exit code:** 0 when DB is available and contains ≥2 users.

**Note:** Tests skip when `RUN_D33_PARALLEL_TEST` ≠ `1`. For CI, set `RUN_D33_PARALLEL_TEST=1`, valid `DATABASE_URL`, and `SKIP_LIVE_DATA_CHECK=true`.

---

## Data proof: no duplicate rows

- Advisory lock `pg_advisory_xact_lock(hashtext(symbol))` serializes all creates for the same symbol within a transaction.
- First request: lock → select (none) → insert → return.
- Second request: waits for lock → select (finds first) → return existing (no insert).
- `IntegrityError` handler: on duplicate symbol/unique violation, re-select existing and return (defense if constraint exists).

---

## D33 lookup+link flow remains canonical

- `user_tickers_service.add_ticker` unchanged: lookup by symbol → if not found, `create_system_ticker` → link.
- `create_system_ticker` is now idempotent: create or return existing. No parallel create path; single canonical flow.

---

**log_entry | TEAM_20→TEAM_10 | G7R_BATCH5_D33_PARALLEL | PASS | 2026-01-31**
