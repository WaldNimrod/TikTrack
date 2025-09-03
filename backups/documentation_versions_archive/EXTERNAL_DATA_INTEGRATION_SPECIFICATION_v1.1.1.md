# TikTrack — External Data Integration Specification (v1.1.1)

**Date:** 2025-08-28  
**Scope:** Yahoo/yfinance as Stage‑1 provider, clean external↔internal boundary, refresh policy, DB tweaks, observability.  
**Change Source:** User clarifications + architecture review.

---


## 0) Changelog (v1.1.1)
- Clarified UTC as the canonical time standard.
- Clarified weekend behavior: open = daily; closed/cancelled = skip.
- Clarified mapping: `change_pct_day` → DB `change_percent`.
- Renamed `intraday_slots.timestamp` to `slot_start_utc` in the unique index (documentation only).
- Clarified that the indicator for active trading **already exists in `trades`** as the field **`Active Trades`** (boolean). We **do not add** `has_active_trade` to `tickers`; instead we **derive per‑ticker activity** from `trades` (see §3.3).
- Refresh policy finalized (Stage‑1/Yahoo): closed/cancelled = daily on weekdays only; open with/without active trades; weekend/holidays = daily; **outside trading hours, the fastest cadence is 1h**.
- Frontend no longer talks to external providers: **Backend‑only** adapters (Yahoo) + **UI consumes internal `/quotes` endpoints only**.
- DB improvements: add `asof_utc` and `fetched_at` to `quotes_last`; add unique indexes; add provenance fields in logs.
- Trading Calendar/Timezone: **future feature**; for now we assume **New York trading hours** and **weekend Sat/Sun** as non‑trading.
- Provider configs: conservative defaults + batching and short‑TTL cache.
- Observability: explicit counters & error taxonomy.

---

## 1) Architecture Overview (Stage‑1: Yahoo only)

```
External Providers (Yahoo via yfinance)
        ↓                       (Provider Adapter: Backend-only)
Normalizer  →  Internal Ingest API  →  Cache (short TTL)  →  DB (quotes_last, intraday_slots)
                                               ↓
                                           UI / API (/api/v1/quotes[/batch])
```

### Principles
- **Separation of concerns:** external adapters isolated from core logic.
- **Single ingress:** only via the **Internal Ingest API** (validation, idempotency, logging).
- **Batching-first:** group symbols per request to reduce rate‑pressure.
- **Short‑TTL cache:** avoid redundant hits during UI bursts.
- **DTO standardization:** `symbol, price, change_pct_day, asof_utc, currency, source`.

- **Time standard:** all timestamps (`asof_utc`, `fetched_at`, slot times) are stored in **UTC**.

---

## 2) Providers — Stage‑1 (Yahoo/yfinance)

- Library: **`yfinance`** (Python).
- Adapter: `YahooFinanceAdapter` (Backend) returns provider‑raw DTOs; **no Frontend provider calls**.
- Normalizer converts to internal DTO with fields:
  ```json
  {
    "symbol": "AAPL",
    "price": 184.32,
    "change_pct_day": 1.2,
    "asof_utc": "2025-08-28T15:45:00Z",
    "currency": "USD",
    "source": "Yahoo (yfinance)"
  }
  ```
- Ingest API persists to DB and updates cache.

**DB mapping note:** `change_pct_day` (DTO) → `quotes_last.change_percent` (DB).

**Batching Guidance**
- Prefer `yf.download([...])` on 25–50 symbols per batch.
- Stagger batches with a small delay (200–500 ms) under load.

**Provider Config Defaults (suggested)**
```yaml
provider_configs:
  yahoo_finance:
    is_active: true
    rate_limit_per_hour: 900        # conservative (no official SLA)
    timeout_seconds: 20
    retry_attempts: 2
    cache_ttl_seconds:
      hot: 60                       # seconds
      warm: 300
    backoff: exponential( base=0.5s, factor=2, max=60s )
```

---

## 3) Database Model Updates

### 3.1 `quotes_last` (last known price per ticker)
**Add columns**
- `asof_utc TIMESTAMP NULL` — timestamp of the quote from the provider
- `fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP` — when **we** fetched it

**Indexes**
- `UNIQUE (ticker_id)` — one row per ticker

**Notes**
- Keep existing fields (`price`, `change_percent`, `previous_close`, `provider`, `last_updated`, …).  
- Use `asof_utc` to prevent stale overrides (do not overwrite a newer quote with an older one).

### 3.2 `intraday_slots` (optional time‑bucketed history)
**Unique index**
- `UNIQUE (ticker_id, slot_start_utc, provider)`

### 3.3 Deriving “has active trade” per ticker
- The flag **already exists** at the **`trades` table** as **`Active Trades`** (boolean).  
- We derive a per‑ticker activity view, e.g.:
  - **`v_ticker_active_trade`**: `(ticker_id, has_active_trade BOOLEAN)` computed as `MAX(CASE WHEN trades."Active Trades" = 1 THEN 1 ELSE 0 END)` grouped by `ticker_id`.
- The scheduler uses this view to classify tickers into **hot** (active trade) vs **warm** (no active trade).

> _Note:_ We keep the column name as provided (`"Active Trades"`). For new migrations we **recommend** snake_case naming, but we do **not** rename existing production fields in v1.1.

---

## 4) Refresh Policy (Default, Stage‑1 / Yahoo)

**Assumptions for v1.1**
- Trading hours = **New York** market hours (NYSE/Nasdaq).  
- Non‑trading days = **Saturday & Sunday** (holidays handled later; see §7.1).  
- **Outside trading hours** the fastest cadence is **1 hour** (even for hot tickers).

### 4.1 By ticker status
- **Closed / Cancelled**: **once per weekday**, not on weekend.  
  _Recommended window:_ 30–60 minutes after market close (local to NY).
- **Open + Active trade (via `v_ticker_active_trade`)**:  
  - **In trading hours**: **every 5 minutes** (default).  
  - **Outside trading hours**: **every 1 hour**.
- **Open + No active trade**:  
  - **Always**: **every 1 hour** (both inside/outside trading hours).
- **Weekend (Sat/Sun)**: all **open** tickers = **once per day**; **closed/cancelled** remain **skipped** on weekend.

### 4.2 Scheduler behavior
- **Batch first:** schedule jobs in symbol‑groups.
- **Cache aware:** short TTL prevents duplicate pulls within the same minute.
- **Backoff & retries:** exponential backoff on transient errors; cap retries to protect rate limits.

Example configuration:
```yaml
refresh_policy:
  closed_or_cancelled:
    weekdays: daily_after_close    # once/day, ~close+45m
    weekend: skip
  open:
    active_trade:                  # v_ticker_active_trade.has_active_trade = 1
      in_hours: 5m
      off_hours: 60m
    no_active_trade:               # = 0
      in_hours: 60m
      off_hours: 60m
  weekend_all: daily
  off_hours_min_interval: 60m      # global guardrail
```

---

## 5) API (Internal)

### 5.1 Quotes
- `GET /api/v1/quotes/batch?ticker_ids=...` — **preferred path** for UI.
- `GET /api/v1/quotes/{ticker_id}`
- `GET /api/v1/quotes/{ticker_id}/history?days=..&interval=..`
- `POST /api/v1/quotes/{ticker_id}/refresh` — on‑demand (admin/ops).

### 5.2 Market‑data system
- `GET /api/v1/market-data/status`
- `POST /api/v1/market-data/refresh`
- `GET /api/v1/market-data/providers`
- `GET /api/v1/market-data/logs`

**Contract**
- Internal DTO (post‑normalization) only.
- Responses include `source`, `asof_utc`, `fetched_at`.

---

## 6) Frontend Rules (Stage‑1)

- **No direct provider calls** from the browser.  
- UI uses only `/api/v1/quotes` (and `/batch`).  
- Keep grid/graphs responsive via cache‑friendly polling intervals.  
- Display provenance (source + asof) when available.

---

## 7) Observability & Operations

### 7.1 Trading Calendar & Timezone
- **Future feature**: Exchange calendars, per‑ticker primary exchange/timezone.  
- v1.1 uses fixed **NY hours** + weekend Sat/Sun; holidays treated like weekend.

### 7.2 Metrics & Logs
- Metrics: cache‑hit‑rate, requests/hour, 429 count, avg latency, stale‑override blocks.  
- Logs: store `latency_ms`, `error_code`, `request/response` snippets for failures.  
- Health: `/market-data/status` aggregates provider health and last successful fetch.

### 7.3 Failure policy
- Circuit‑breaker per provider; disable temporarily on repeated faults.  
- Backoff with jitter; cap retries; alert on sustained degradation.

---

## 8) Risks & Mitigations
- **Unofficial Yahoo endpoints**: use conservative limits, batching, and cache; monitor 429s.  
- **Schema drift**: add `asof_utc`/`fetched_at` now to support staleness checks.  
- **Naming consistency**: keep existing `trades."Active Trades"`; introduce a read‑only view for per‑ticker activity.  
- **Scaling**: if load grows, move cache to Redis and decouple scheduler as a sidecar service.

---

## 9) Roadmap (Data Integration)
1. **v1.1** — Yahoo only; DB tweaks; scheduler with policy above; backend‑only adapters; UI via `/quotes/batch`.  
2. **v1.2** — Observability dashboards; Redis cache (optional); refine batching windows.  
3. **v1.3** — IBKR adapter (delayed), primary/fallback policy; secrets management.  
4. **v1.4** — Exchange calendars (per symbol); holiday tables; regional trading windows.

---

### Appendix A — Suggested Migrations (illustrative)
```sql
-- quotes_last additions
ALTER TABLE quotes_last ADD COLUMN asof_utc     TIMESTAMP;
ALTER TABLE quotes_last ADD COLUMN fetched_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE UNIQUE INDEX IF NOT EXISTS ux_quotes_last_ticker ON quotes_last(ticker_id);

-- intraday_slots unique key
CREATE UNIQUE INDEX IF NOT EXISTS ux_intraday_slot ON intraday_slots(ticker_id, timestamp, provider);

-- (No change to trades: 'Active Trades' already exists)
-- View to derive per‑ticker activity
CREATE VIEW IF NOT EXISTS v_ticker_active_trade AS
SELECT t.id AS ticker_id,
       CASE WHEN MAX(CASE WHEN tr."Active Trades" = 1 THEN 1 ELSE 0 END) = 1
            THEN 1 ELSE 0 END AS has_active_trade
FROM tickers t
LEFT JOIN trades tr ON tr.ticker_id = t.id
GROUP BY t.id;
```
