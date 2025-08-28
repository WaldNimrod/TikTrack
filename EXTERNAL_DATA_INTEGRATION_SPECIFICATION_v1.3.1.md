# TikTrack – External Data Integration Specification (v1.3.1)

**Date:** 2025-08-28  
**Scope:** Stage‑1 provider = Yahoo/yfinance; backend‑only provider access; **configurable refresh policy via Preferences**; **user timezone in Stage‑1** (display); single system market clock; UTC storage; conservative rate limits; batching; cache.

---

## 0) Changelog (v1.3.1)
- **Fixed critical SQLite compatibility issues:** BOOLEAN → INTEGER, proper foreign key constraints
- **Added essential indexes:** Performance optimization for quotes_last and user_preferences
- **Enhanced error handling:** Basic fallback mechanism for provider failures
- **Improved validation:** Basic timezone and interval validation
- **Stage separation:** Clear distinction between Stage-1 (lean) and Stage-2 (advanced) features
- **Security considerations:** Identified areas for Stage-2 encryption and rate limiting

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
- Performance index: `INDEX (asof_utc)` for stale data checks
- Use `asof_utc` to block stale overrides (do not overwrite newer data).

### 3.2 `intraday_slots` (optional)
- Use column name `slot_start_utc TIMESTAMP NOT NULL` (UTC, start of bucket).  
- Unique index: `UNIQUE (ticker_id, slot_start_utc, provider)`.

### 3.3 Activity source of truth
- Use **`tickers.active_trades`** (INTEGER DEFAULT 0) to classify "Open+Active" vs "Open+No‑Active".  
- "Closed/Cancelled" classification derives from your domain logic (e.g., no open positions and last trade status closed/cancelled).

### 3.4 Preferences storage
**Stage-1 Implementation (Lean):**
```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  refresh_overrides_json TEXT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Essential index for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_timezone ON user_preferences(timezone);
```

**Stage-2 Enhancement (Advanced):**
- JSON validation constraints
- Advanced indexing strategies
- Audit logging

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
  - Preview: shows "Next refresh" per category in both NY and user timezone.  
- UI renders all times in the **user timezone** (converting from API UTC).

---

## 7) Error Handling & Fallback (Stage-1)

### 7.1 Basic Fallback Mechanism
```python
def get_quote_with_fallback(ticker_id):
    """Stage-1: Basic fallback to cached data"""
    try:
        return yahoo_adapter.get_quote(ticker_id)
    except Exception as e:
        logger.warning(f"Provider failed for ticker {ticker_id}: {e}")
        return get_cached_quote(ticker_id)  # Fallback to cache
```

### 7.2 Validation (Stage-1)
```python
def validate_timezone_basic(timezone):
    """Stage-1: Basic timezone validation"""
    valid_timezones = ['UTC', 'Asia/Jerusalem', 'America/New_York', 'Europe/London']
    return timezone in valid_timezones

def validate_refresh_interval(minutes):
    """Stage-1: Basic interval validation"""
    return 1 <= minutes <= 1440  # 1 minute to 24 hours
```

---

## 8) Observability & Ops (Stage-1)
- Metrics: cache‑hit‑rate, requests/hour, 429 count, avg latency, stale‑override blocks.  
- Logs: `latency_ms`, `error_code`, request/response snippets on failure.  
- Health: `/market-data/status` aggregates provider health + last success.

---

## 9) Stage Separation: Stage-1 vs Stage-2

### Stage-1 (Lean & Stable)
**Focus:** Core functionality with minimal complexity
- Basic error handling with fallback
- Essential indexes only
- Simple validation
- Basic monitoring
- Conservative rate limits

**Timeline:** 2-3 weeks
**Risk Level:** Low

### Stage-2 (Advanced Features)
**Focus:** Performance, security, and advanced features
- Advanced error handling (circuit breakers, retry logic)
- Comprehensive indexing strategy
- Advanced validation (JSON schema, timezone validation)
- Advanced monitoring (metrics, alerting)
- Security features (encryption, rate limiting)
- Multi-level caching
- Configuration management

**Timeline:** 4-6 weeks
**Risk Level:** Medium

---

## 10) Risks & Mitigations

### Stage-1 Risks
- Yahoo has **no official SLA** → keep conservative numbers; rely on batching & cache; watch 429s.  
- Timezone edge‑cases: user sees local time; scheduler runs on NY clock; **store everything in UTC** to avoid drift.  
- Misconfiguration: server enforces guardrails (off‑hours ≥ 60m), surfaces warnings in logs/health.

### Stage-2 Risks
- Complexity increase → thorough testing required
- Performance overhead → monitoring and optimization needed
- Security considerations → proper key management required

---

## Appendix — SQL (Stage-1 Implementation)

```sql
-- quotes_last (Stage-1)
ALTER TABLE quotes_last ADD COLUMN asof_utc   TIMESTAMP;
ALTER TABLE quotes_last ADD COLUMN fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE UNIQUE INDEX IF NOT EXISTS ux_quotes_last_ticker ON quotes_last(ticker_id);
CREATE INDEX IF NOT EXISTS idx_quotes_last_asof_utc ON quotes_last(asof_utc);

-- intraday_slots (if used)
CREATE UNIQUE INDEX IF NOT EXISTS ux_intraday_slot ON intraday_slots(ticker_id, slot_start_utc, provider);

-- user preferences (Stage-1)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  refresh_overrides_json TEXT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_preferences_timezone ON user_preferences(timezone);

-- tickers active_trades (SQLite compatibility)
ALTER TABLE tickers ADD COLUMN active_trades INTEGER DEFAULT 0;
```

---

## Implementation Checklist

### Stage-1 (Critical Path)
- [ ] Database schema updates with proper SQLite compatibility
- [ ] Essential indexes creation
- [ ] Basic error handling implementation
- [ ] Simple validation functions
- [ ] Yahoo Finance adapter
- [ ] Preferences UI integration
- [ ] Basic monitoring setup

### Stage-2 (Future Enhancements)
- [ ] Advanced error handling (circuit breakers)
- [ ] Security features (encryption)
- [ ] Advanced validation (JSON schema)
- [ ] Comprehensive monitoring (metrics, alerting)
- [ ] Multi-level caching
- [ ] Configuration management
- [ ] Performance optimization

---

**Document Version:** 1.3.1  
**Last Updated:** 2025-08-28  
**Stage:** 1 (Lean Implementation)  
**Next Stage:** 2 (Advanced Features)
