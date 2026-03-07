# TEAM 20 → TEAM 10 | S002_P003_WP002 G7R BATCH5 BLOCKER1 D33 PARALLEL CREATE REMEDIATION

**project_domain:** TIKTRACK  
**id:** TEAM_20_S002_P003_WP002_G7R_BATCH5_BLOCKER1_D33_PARALLEL_CREATE_REMEDIATION_v1.0.0  
**from:** Team 20 (Backend)  
**to:** Team 10 (Gateway)  
**date:** 2026-01-31  
**overall_status:** PASS

---

## 1. Blocker finding

D33 concurrent create for same symbol returned 201,201; duplicate system tickers created. Required: single-create invariant.

---

## 2. Remediation

| Requirement | Implementation |
|-------------|----------------|
| Idempotent/canonical single-create | `pg_advisory_xact_lock(hashtext(symbol))` serializes creates per symbol |
| Second path must not create duplicate | Lock → second request waits → select finds existing → return (no insert) |
| Deterministic response | One create + one link (201,201 for different users) or one create + one 409 (same user) |

---

## 3. Exact fix locations

| File | Change |
|------|--------|
| `api/services/canonical_ticker_service.py` | `_symbol_advisory_key()`, `pg_advisory_xact_lock(:key)` before check, return existing instead of 409, IntegrityError → re-select existing |

---

## 4. Concurrency test

**File:** `tests/unit/test_d33_parallel_create.py`

| Test | Purpose |
|------|---------|
| `test_parallel_create_same_symbol_no_duplicate_tickers` | Two users, parallel add same symbol → 1 ticker row |
| `test_parallel_create_same_user_one_create_one_conflict` | Same user, parallel add → 1×201, 1×409 |

**Run:** `RUN_D33_PARALLEL_TEST=1 SKIP_LIVE_DATA_CHECK=true DATABASE_URL=... pytest tests/unit/test_d33_parallel_create.py -v`  
**Exit code:** 0 (with valid DB)

---

## 5. Data proof: no duplicate rows

- Advisory lock blocks second create until first commits
- Second request: select finds existing, returns it (no insert)
- IntegrityError handler: re-select and return existing as fallback

---

## 6. D33 canonical flow preserved

- `user_tickers_service.add_ticker`: lookup → if not found, `create_system_ticker` → link
- `create_system_ticker`: idempotent (create or return existing)

---

**log_entry | TEAM_20 | G7R_BATCH5_BLOCKER1_D33 | PASS | 2026-01-31**
