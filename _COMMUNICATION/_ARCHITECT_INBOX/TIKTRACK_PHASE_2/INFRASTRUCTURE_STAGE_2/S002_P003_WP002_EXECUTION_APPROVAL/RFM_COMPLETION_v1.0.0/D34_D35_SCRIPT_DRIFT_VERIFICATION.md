# D34_D35_SCRIPT_DRIFT_VERIFICATION
**project_domain:** TIKTRACK
**id:** S002_P003_WP002_D34_D35_SCRIPT_DRIFT_VERIFICATION_v1.0.0
**from:** Team 90
**to:** Team 00, Team 100
**date:** 2026-03-04
**status:** CONFIRMED_NON_BLOCKING

---

## 1) Requested clarification

Architect request: confirm if D34/D35 API implementation is correct even when automatic scripts reported `exit 1`.

---

## 2) Team 90 verification method

Team 90 performed deterministic contract verification based on:

1. Team 50 rerun artifacts and error payload output
2. Script payload inspection (exact request bodies)
3. Backend validation rule inspection in source code

This verification confirms the API behavior is contract-correct and that the failing script steps are drift in test payloads.

### Explicit tool answer (manual/Postman request)

- API behavior was verified directly from Team 50 runtime request/response evidence in rerun artifacts.
- Additional code-level contract verification was performed by Team 90 on backend validators.
- Result: implementation is valid; failing steps are caused by non-canonical script payloads.

---

## 3) D34 finding verification

### Evidence from QA log

`05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/d34_api.log`

Observed:
- `POST /alerts -> 422`
- log note: create payload missing `ticker_id` / `target_id`

### Script payload source

In `scripts/run-alerts-d34-fav-api.sh:58-63`, create payload uses:
- `target_type="ticker"`
- no `ticker_id`
- no `target_id`

### Backend contract rule

`api/services/alerts_service.py:293-299` explicitly enforces:
- when `target_type=ticker`, at least one of `ticker_id` or `target_id` is required
- otherwise return `422`

### Conclusion

D34 API implementation is correct. The failing script create step is invalid against the locked contract and therefore non-blocking implementation-wise.

---

## 4) D35 finding verification

### Evidence from QA log

`05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/d35_api.log`

Observed response:
- validation error: `parent_type must be one of ['account', 'datetime', 'ticker', 'trade', 'trade_plan'], got 'general'`

### Script payload source

In `scripts/run-notes-d35-qa-api.sh:39-43`, note-create payload uses:
- `parent_type="general"`

### Backend contract rule

`api/services/notes_service.py:175-177` allowlist excludes `general`.
Post-remediation business model removes `general` as a valid linkage target.

### Conclusion

D35 API implementation is correct. The failing script create step is legacy payload drift and non-blocking implementation-wise.

---

## 5) Explicit answer to architect question

Yes — the API implementation is considered valid for D34/D35 in this cycle.

The observed failures are attributable to test-tool payload drift, not to implementation failure in the active contract.

---

**log_entry | TEAM_90 | D34_D35_SCRIPT_DRIFT_VERIFICATION | S002_P003_WP002 | NON_BLOCKING_CONFIRMED | 2026-03-04**
