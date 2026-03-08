# Price Reliability PHASE_3 — Off-Hours Fallback & Runtime Logs

**Authority:** TEAM_10_TO_TEAM_60_PRICE_RELIABILITY_PHASE3_MANDATE  
**Owner:** Team 60 (Runtime/Platform)

---

## 1) Fallback when off-hours feed unavailable

When the live feed is unavailable (e.g. outside market hours or provider failure), the system **retains the last close (EOD) value** so users always see a usable price context.

- **Implementation:** `api/services/tickers_service.py` — `_get_price_with_fallback()`:
  - EOD (ticker_prices) is always preserved; no null regression when EOD exists.
  - If EOD is stale (>48h) and no intraday data: `price_source=EOD_STALE` — **last close value retained**.
  - If EOD is stale but intraday exists (active): `price_source=INTRADAY_FALLBACK` (override).
  - API response includes `price_source`, `price_as_of_utc`, `last_close_price`, `last_close_as_of_utc` for provenance.

**Mandate requirement:** Off-hours must retain close value when feed unavailable — **satisfied** (EOD/close retained; never null when EOD exists).

---

## 2) Runtime logs / artifacts for off-hours mode

- **Scheduler:** After each run of `sync_ticker_prices_intraday`, the job reschedules using the current cadence (market-open vs off-hours) and logs:
  - `PHASE_3 price sync cadence: mode=off_hours|market_open interval_min=<N> next_run=<ISO UTC>`
- **Location:** Backend process stdout/stderr (and any log aggregation). Example:
  - `mode=market_open` when US market is REGULAR (Mon–Fri 9:30–16:00 America/New_York).
  - `mode=off_hours` when market is closed; interval is `off_hours_interval_minutes` (default 60).
- **Evidence:** Job run log (`job_run_log` table / M005b) plus API `price_source` / `price_as_of_utc` provide deterministic evidence for provenance (required tests §2, §4).

---

## 3) Cadence profiles (reference)

| Profile         | When active              | Interval (default) | Config key                     |
|----------------|--------------------------|--------------------|---------------------------------|
| market_open    | US market REGULAR        | 15 min             | `intraday_interval_minutes`     |
| off_hours      | US market not REGULAR    | 60 min             | `off_hours_interval_minutes`    |

Both are configurable via env (e.g. `INTRADAY_INTERVAL_MINUTES`, `OFF_HOURS_INTERVAL_MINUTES`) and/or DB settings.
