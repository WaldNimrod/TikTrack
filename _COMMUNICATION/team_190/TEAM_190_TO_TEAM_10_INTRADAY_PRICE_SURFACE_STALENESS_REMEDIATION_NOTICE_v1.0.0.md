# TEAM_190 -> TEAM_10 | INTRADAY_PRICE_SURFACE_STALENESS_REMEDIATION_NOTICE_v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_190_TO_TEAM_10_INTRADAY_PRICE_SURFACE_STALENESS_REMEDIATION_NOTICE  
**from:** Team 190 (Constitutional Validation)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 20, Team 30, Team 50, Team 60, Team 90, Team 00, Team 100  
**date:** 2026-03-06  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_3  
**program_id:** S002-P003  
**work_package_id:** S002-P003-WP002  
**scope:** DATA_FRESHNESS_ALIGNMENT (runtime jobs vs surfaced ticker price)

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P003 |
| work_package_id | S002-P003-WP002 |
| task_id | N/A |
| gate_id | GATE_3 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

Add a blocking remediation item to the active correction cycle: runtime background jobs are operating, but user-facing ticker price surface is stale due to source mismatch.

## 2) Validated Findings (Team 190)

Validation timestamp: **2026-03-06 (UTC)**.

1. Background orchestration is present and active.
   - `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/api/main.py`
   - `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/api/background/scheduler_registry.py`
   - `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/api/background/scheduler_startup.py`
   - `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/api/background/job_runner.py`

2. Runtime evidence confirms recent executions in `admin_data.job_run_log` for:
   - `sync_ticker_prices_intraday`
   - `check_alert_conditions`
   Including completed runs and concurrency protection behavior (`skipped_concurrent`).

3. Data freshness mismatch exists:
   - `market_data.ticker_prices_intraday` latest record: **2026-03-06 07:47:43 UTC** (fresh)
   - `market_data.ticker_prices` latest record: **2026-02-14 00:05:18 UTC** (stale)

4. Price surface path reads stale table in ticker service flows.
   - `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/api/services/tickers_service.py`

## 3) Impact

- UI/feature flows can show old prices even when background jobs are healthy.
- This creates false-negative operational perception and undermines gate evidence trust.
- Scope relevance: D22 + D33 + D34 + D35 presentation and validation lineage.

## 4) Required Actions (Execution Package Add-on)

Team 10 to open an immediate add-on remediation lane under current WP002 cycle:

1. **Backend (Team 20):**
   - Add deterministic fallback/read strategy: use latest intraday price when EOD (`ticker_prices`) is stale beyond defined threshold.
   - Return explicit provenance fields in API response:
     - `price_source` (`EOD` or `INTRADAY_FALLBACK`)
     - `price_as_of_utc`

2. **Frontend (Team 30):**
   - Surface provenance safely (no hidden silent fallback semantics).
   - Ensure rendering does not imply same-day EOD when fallback is intraday.

3. **Runtime corroboration (Team 60):**
   - Provide target-runtime evidence that scheduler runs and intraday writes remain continuous after remediation.

4. **QA/FAV (Team 50):**
   - Add targeted scenario: stale EOD + fresh intraday -> UI shows fresh value with correct source semantics.

## 5) Acceptance Criteria

1. API returns fresh price under stale-EOD condition with explicit source metadata.
2. UI reflects source semantics without misleading labeling.
3. Regression: existing EOD paths remain valid when EOD is fresh.
4. Team 60 evidence confirms no scheduler regression.
5. Team 50 targeted rerun reports PASS for stale-EOD scenario.

## 6) Response Required

Team 10 to publish:
1. activation notice for the add-on remediation lane,
2. owner mapping (20/30/50/60),
3. expected evidence artifact list,
4. closure report reference path.

---

**log_entry | TEAM_190 | INTRADAY_PRICE_SURFACE_STALENESS_REMEDIATION_NOTICE | ACTION_REQUIRED | 2026-03-06**
