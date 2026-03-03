# TEAM 00 → TEAM 20 | KB Remediation Activation
**Document ID:** TEAM_00_TO_TEAM_20_KB_REMEDIATION_ACTIVATION_v1.0.0
**Date:** 2026-03-03
**From:** Team 00 (Chief Architect)
**To:** Team 20 (Backend)
**Authority:** ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0
**Status:** ACTIVE — Execute immediately

---

## YOUR MANDATE

Team 20 has 5 actionable KB items assigned. All are backend/Python scope. Execute in priority order.

---

## TASK 1 — Confirm Production Schema (PREREQUISITE for DDL V2.6)

**Priority:** HIGH — Team 170 cannot produce DDL V2.6 until you confirm

For each table listed below, output the current production column list (using `\d+ <table>` in psql or `SELECT column_name, data_type, character_maximum_length, numeric_precision, numeric_scale FROM information_schema.columns WHERE table_name = '<table>' ORDER BY ordinal_position;`):

Required tables:
- `tickers` (confirm partial unique constraint implementation — should be via separate index, not inline)
- `user_api_keys` (same as above)
- `user_refresh_tokens` (confirm table exists + full column list)
- `revoked_tokens` (confirm table exists + full column list)
- `trading_account_fees` (confirm name — NOT `brokers_fees`)
- `exchange_rates` (confirm column name: `rate` not `conversion_rate`)
- `ticker_prices` (confirm `market_cap NUMERIC(24,4)`)

**Deliver:** Schema state summary document OR paste output to your communication with Team 170. Mark as `TEAM_20_PRODUCTION_SCHEMA_CONFIRMATION_v1.0.0.md` in your team folder.

---

## TASK 2 — Test Suite A Fixes (KB-004, KB-005)

**File:** `tests/external_data_suite_a_contract_schema.py`

### Fix 1 — KB-004 (line ~80)

Change test expectation from `conversion_rate` to `rate`:

```python
# BEFORE (wrong)
expected_columns = ['id', 'from_currency', 'to_currency', 'conversion_rate', ...]

# AFTER (correct — 'rate' is the canonical column name per migration)
expected_columns = ['id', 'from_currency', 'to_currency', 'rate', ...]
```

### Fix 2 — KB-005 (line ~114)

Change precision expectation for `market_cap`:

```python
# BEFORE (wrong — NUMERIC(20,8) is the Iron Rule for transactions, not display fields)
'market_cap': 'NUMERIC(20,8)'

# AFTER (correct — RATIFIED by Team 00: market_cap is a display field, NUMERIC(24,4) approved)
'market_cap': 'NUMERIC(24,4)'
```

**After both fixes:** Run `python3 tests/external_data_suite_a_contract_schema.py` against TARGET_RUNTIME DB. Must pass.

**Deliver:** Report that Suite A passes (pass count, exit code, timestamp).

---

## TASK 3 — URGENT: Missing Await Fix (KB-007)

**File:** `api/integrations/market_data/cache_first_service.py`
**Line:** ~57
**Severity:** HIGH — coroutine created but result discarded (silent data loss risk)

Find the line where an async function is called without `await`. Fix by adding `await`.

Example pattern:
```python
# BEFORE (bug — coroutine not awaited)
result = some_async_function()

# AFTER (correct)
result = await some_async_function()
```

Run `mypy api/integrations/market_data/cache_first_service.py --config-file api/mypy.ini` after fix to verify clean.

**Deliver:** Fix committed + confirmation.

---

## TASK 4 — ecdsa CVE (KB-010)

**Package:** `ecdsa 0.19.1` — CVE-2024-23342 (HIGH)

Step 1: Determine if `ecdsa` is a direct or transitive dependency:
```bash
cd api && source venv/bin/activate
pip show ecdsa  # See 'Required-by' field
```

Step 2a — If DIRECT (ecdsa in requirements.txt):
- Check if upgrade to ecdsa ≥ 0.19.2 fixes CVE. If so: `pip install --upgrade ecdsa` + update `requirements.txt`
- If no fix available: assess if ecdsa can be removed/replaced (coordinate with Team 00)

Step 2b — If TRANSITIVE (ecdsa required by another package):
- Identify parent package from `Required-by` output
- Upgrade parent package to version that pulls in safe ecdsa
- Update `requirements.txt` for the parent

Step 3: Verify:
```bash
pip-audit | grep ecdsa  # Should show no CVE
```

**Deliver:** `requirements.txt` updated + `pip-audit` output showing ecdsa CVE resolved.

---

## TASK 5 — pip Upgrade (KB-011)

```bash
cd api && source venv/bin/activate
pip install --upgrade pip
pip --version  # Confirm ≥ 26.0
```

Update `requirements.txt` if pip version is pinned there (unlikely but check).

Coordinate with Team 60 — they also need to update CI/CD environment pip version.

**Deliver:** Confirmation that local venv has pip ≥ 26.0.

---

## COMPLETION CRITERIA

Team 20 is complete when:
- [ ] Production schema confirmation delivered to Team 170
- [ ] Suite A test fixes applied, Suite A PASSES in TARGET_RUNTIME
- [ ] KB-007 missing await fixed
- [ ] ecdsa CVE resolved (pip-audit PASS for ecdsa)
- [ ] pip upgraded to ≥ 26.0 in local venv

**Report completion to Team 10.** Team 10 closes items in master task list.

---

**log_entry | TEAM_00→TEAM_20 | KB_REMEDIATION_ACTIVATION_v1.0.0 | ACTIVE | 2026-03-03**
