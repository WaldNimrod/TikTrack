# TT2_CURRENT_STATE_AND_GAPS

**id:** `TT2_CURRENT_STATE_AND_GAPS`  
**owner:** Team 10  
**status:** ACTIVE  
**last_updated:** 2026-02-14  

---

## 1) Current Phase Status
- Batch 1+2 foundations are implemented and documented.
- Batch 2.5 hardening items (version alignment, account-fees model, "Other" rule, redirect/user-icon policy) are reflected in code and SSOT.
- Stage-1 (external data + user tickers) is in active implementation/verification.

## 2) Open Gaps (Blocking / Non‑Blocking)
| Gap | Status | Owner |
|---|---|---|
| External provider reliability (Yahoo rate limit) under full nightly load | Open (non-blocking with fallback) | Team 20 + Team 60 |
| Crypto add flow end-to-end verification for at least 3 symbols | Open (QA completion pending) | Team 20 + Team 50 |
| Status-driven scheduler full migration (`status` over `is_active`) | Open (progressive transition) | Team 20 + Team 60 |
| PDSC boundary hardening (min vs full final closure) | Open | Team 20 + Team 30 |
| Legacy report files in artifacts that still describe pre-fix state | Open (cleanup/document alignment) | Team 10 |

## 3) Evidence Summary (Last Verified)
- User Tickers API and UI are present (`/me/tickers`, `/user_tickers.html`)
- Stage-1 market data scripts exist (`sync-eod`, `sync-intraday`, `sync-history-backfill`, `cleanup-market-data`)
- Template factory scripts exist (`ui/scripts/generate-pages.js`, `ui/scripts/validate-pages.js`)
- Market status clock was revalidated including `data_dashboard`

## 4) Risks & Dependencies
- Provider limits can degrade freshness if cooldown/fallback is misconfigured
- Crypto symbol mapping must stay provider-specific (Yahoo vs Alpha contracts)
- SSOT/code drift risk remains high without strict knowledge-promotion cycle

## 5) References
- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`
- `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md`
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
- `documentation/09-GOVERNANCE/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md`
- `documentation/05-REPORTS/artifacts/TEAM_50_USER_TICKERS_QA_EVIDENCE.md`
- `documentation/05-REPORTS/artifacts/TEAM_50_TESTING_PROCESSES_SUMMARY_REPORT.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/BATCH_2_5_COMPLETIONS_MANDATE.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md`
