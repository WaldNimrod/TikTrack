# TikTrack – External Data Integration Specification (v1.2)

**Date:** 2025-08-28  
**Scope:** Stage‑1 provider = Yahoo/yfinance; backend‑only provider access; **configurable refresh policy via Preferences**; **user timezone in Stage‑1** (display); single system market clock; UTC storage; conservative rate limits; batching; cache.

---


## 0) Changelog (v1.2)
- **Preferences → Refresh Policy (Stage‑1):** Users can configure refresh cadences per category directly from the **Preferences** page (no code changes required). Defaults are provided with guardrails; effective policy is computed server‑side.  
- **Source of truth for activity:** Per‑ticker activity derives from **`tickers.active_trades`** (BOOLEAN), not from the `trades` table.  
- **Timezone in Stage‑1:** Users can set their **IANA timezone** in Preferences; the **UI renders all times in the user timezone**. Server/API/DB remain on **UTC**.  
- **Single market clock:** The external data scheduler operates on a **single, fixed clock** — **America/New_York** (NYSE/Nasdaq hours) in Stage‑1.  
- **API remains UTC‑only:** No local fields in payloads; localization is performed in the UI according to the user timezone.  
- **DB clarifications:** `quotes_last` adds `asof_utc` + `fetched_at`; unique keys for `quotes_last` and `intraday_slots(slot_start_utc)`; provenance logs encouraged.  
- **Providers:** Backend‑only adapters; batching‑first (25–50 symbols), short TTL; conservative rate limits.

---

## 1) Architecture Overview (Stage‑1: Yahoo only)

```
Preferences (User) ──┐
                     │   (Backend-only)
External (Yahoo) → Adapter → Normalizer → Ingest API → Cache (short TTL) → DB
                                                  ↓
                                     UI via /api/v1/quotes[/batch] (renders in user timezone)
```

**Principles**
- Strict external↔internal boundary (no provider calls from the browser).  
- Single ingress via Ingest API (validation, idempotency, logging).  
- DTO standardization (UTC): `symbol, price, change_pct_day, asof_utc, currency, source`.  
- Batching‑first, cache‑aware, conservative throttling.  
- Preferences drive **display timezone** and **refresh cadences** per category.

---

## 2) Providers — Yahoo/yfinance (Stage‑1)
- Library: `yfinance` (Python).  
- Adapter returns provider‑raw DTOs; Normalizer emits internal DTO (UTC).  
- Rate‑limits unofficial → conservative cadence; monitor 429; backoff with jitter.  
- Batching guidance: prefer 25–50 symbols per batch; small stagger (200–500 ms) between batches under load.

**Suggested provider config (defaults)**
```yaml
provider_configs:
  yahoo_finance:
    is_active: true
    rate_limit_per_hour: 900
    timeout_seconds: 20
    retry_attempts: 2
    cache_ttl_seconds:
      hot: 60
      warm: 300
    batching:
      max_symbols_per_batch: 50
      preferred_range: 25-50
    backoff: exponential(base=0.5s, factor=2, max=60s)
```

---

## 3) Database Model Updates

### 3.1 `quotes_last` (last known price per ticker)
Add/ensure:
- Columns: `asof_utc TIMESTAMP NULL`, `fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`  
- Unique index: `UNIQUE (ticker_id)`  
- Use `asof_utc` to block stale overrides (do not overwrite newer data).

### 3.2 `intraday_slots` (optional)
- Use column name `slot_start_utc TIMESTAMP NOT NULL` (UTC, start of bucket).  
- Unique index: `UNIQUE (ticker_id, slot_start_utc, provider)`.

### 3.3 Activity source of truth
- Use **`tickers.active_trades`** (BOOLEAN) to classify “Open+Active” vs “Open+No‑Active”.  
- “Closed/Cancelled” classification derives from your domain logic (e.g., no open positions and last trade status closed/cancelled).

### 3.4 Preferences storage
Two options (pick one):
1. **`user_preferences` table** (1 row per user):  
   - `user_id` (PK), `timezone` (IANA string), `refresh_overrides_json` (JSON).  
2. **`system_settings` & `user_overrides`**:  
   - System defaults in `system_settings` (singleton rows), user‑level deltas in `user_overrides`.

Illustrative schema (option 1):
```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY,
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  refresh_overrides_json TEXT NULL,   -- JSON object, see §4.3
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4) Refresh Policy (configurable via Preferences)

### 4.1 Assumptions
- **System market clock:** `America/New_York` (fixed in Stage‑1).  
- **Weekend:** Saturday & Sunday are non‑trading days (holidays treated like weekend in Stage‑1).  
- **Outside trading hours:** the **fastest permissible cadence is 60 minutes** (global guardrail).

### 4.2 Default policy (server‑side defaults)
```yaml
refresh_policy_defaults:
  closed_or_cancelled:
    weekdays: daily_after_close      # once/day, ~close+45m NY
    weekend: skip
  open:
    active_trades:                   # tickers.active_trades = 1
      in_hours: 5m
      off_hours: 60m
    no_active_trades:                # tickers.active_trades = 0
      in_hours: 60m
      off_hours: 60m
  weekend_open: daily
  off_hours_min_interval: 60m        # hard guardrail
```

### 4.3 User‑configurable categories (Preferences UI)
Users can override the default minutes per category **without code changes**. Server enforces guardrails.

| Category | Key | Default | Allowed |
|---|---|---:|---|
| Closed/Cancelled (weekdays) | `closed.weekdays.offset_minutes_after_close` | 45 | 0–180 (NY clock) |
| Open + Active (in‑hours) | `open.active.in_minutes` | 5 | 1–60 |
| Open + Active (off‑hours) | `open.active.off_minutes` | 60 | **≥60** |
| Open + No‑Active (in‑hours) | `open.no_active.in_minutes` | 60 | 5–240 |
| Open + No‑Active (off‑hours) | `open.no_active.off_minutes` | 60 | **≥60** |
| Weekend – Open (daily at hour) | `weekend.open.daily_hour_ny` | 12 | 0–23 (NY clock) |

**Persistence format (example)**
```json
{
  "closed": { "weekdays": { "offset_minutes_after_close": 45 } },
  "open": {
    "active":   { "in_minutes": 5,  "off_minutes": 60 },
    "no_active":{ "in_minutes": 60, "off_minutes": 60 }
  },
  "weekend": { "open": { "daily_hour_ny": 12 } }
}
```

**Effective policy resolution**
1) Start from `refresh_policy_defaults`.  
2) Overlay with `user_preferences.refresh_overrides_json` (if any).  
3) Enforce `off_hours_min_interval >= 60m` globally.

---

## 5) API

### 5.1 Quotes (unchanged; UTC)
- `GET /api/v1/quotes/batch?ticker_ids=...` — **preferred for UI**  
- `GET /api/v1/quotes/{ticker_id}`  
- Responses include UTC `asof_utc`, `fetched_at` (no local fields in Stage‑1).

### 5.2 Preferences
- `GET /api/v1/user/preferences` → returns `timezone` and `refresh_overrides_json`.  
- `PUT /api/v1/user/preferences` → updates `timezone` and/or `refresh_overrides_json` (server validates guardrails).

**Note:** The **scheduler uses NY clock** for rule evaluation; UI uses **user timezone** to render all timestamps.

---

## 6) Frontend Rules
- **No provider calls in the browser.**  
- UI consumes internal endpoints only.  
- **Preferences page (Stage‑1):**  
  - Timezone selector (IANA list, default from browser or profile).  
  - Numeric inputs per category (minutes) with validation + helper text.  
  - Preview: shows “Next refresh” per category in both NY and user timezone.  
- UI renders all times in the **user timezone** (converting from API UTC).

---

## 7) Observability & Ops
- Metrics: cache‑hit‑rate, requests/hour, 429 count, avg latency, stale‑override blocks.  
- Logs: `latency_ms`, `error_code`, request/response snippets on failure.  
- Health: `/market-data/status` aggregates provider health + last success.

---

## 8) Risks & Mitigations
- Yahoo has **no official SLA** → keep conservative numbers; rely on batching & cache; watch 429s.  
- Timezone edge‑cases: user sees local time; scheduler runs on NY clock; **store everything in UTC** to avoid drift.  
- Misconfiguration: server enforces guardrails (off‑hours ≥ 60m), surfaces warnings in logs/health.

---

## Appendix — SQL (illustrative)
```sql
-- quotes_last
ALTER TABLE quotes_last ADD COLUMN asof_utc   TIMESTAMP;
ALTER TABLE quotes_last ADD COLUMN fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE UNIQUE INDEX IF NOT EXISTS ux_quotes_last_ticker ON quotes_last(ticker_id);

-- intraday_slots (if used)
CREATE UNIQUE INDEX IF NOT EXISTS ux_intraday_slot ON intraday_slots(ticker_id, slot_start_utc, provider);

-- user preferences (option 1)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY,
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  refresh_overrides_json TEXT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
