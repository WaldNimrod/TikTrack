# Team 20 → Team 30 | Price Reliability PHASE_2 — API Ready for UI

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_30_PRICE_RELIABILITY_PHASE2_API_READY  
**from:** Team 20 (Backend)  
**to:** Team 30 (Frontend)  
**date:** 2026-03-08  
**status:** READY  
**phase:** PHASE_2  
**authority:** TEAM_10_TO_TEAM_30_PRICE_RELIABILITY_PHASE2_MANDATE  

---

## 1) Summary

API fields for PHASE_2 (Price Reliability — UI transparency) are implemented. Team 30 can begin UI work.

---

## 2) API Contract — Fields Available

| Field | Type | Description |
|-------|------|-------------|
| `current_price` | number (Decimal) | Best-available display price |
| `price_source` | string | `EOD` \| `EOD_STALE` \| `INTRADAY_FALLBACK` |
| `price_as_of_utc` | string (ISO8601) | Timestamp of current price source |
| `last_close_price` | number (Decimal) | Last EOD close value — separate from current |
| `last_close_as_of_utc` | string (ISO8601) | Timestamp of last close |

---

## 3) Endpoints

| Endpoint | Scope |
|----------|--------|
| `GET /api/v1/tickers` | Tickers list — all fields |
| `GET /api/v1/tickers/{id}` | Ticker detail — all fields |
| `GET /api/v1/me/tickers` | User tickers (הטיקרים שלי) — all fields |

---

## 4) Example Response (per ticker)

```json
{
  "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "symbol": "AAPL",
  "company_name": "Apple Inc.",
  "ticker_type": "STOCK",
  "status": "active",
  "is_active": true,
  "current_price": 175.50,
  "daily_change_pct": 0.85,
  "price_source": "EOD_STALE",
  "price_as_of_utc": "2026-03-06T21:00:00Z",
  "last_close_price": 174.02,
  "last_close_as_of_utc": "2026-03-06T21:00:00Z",
  "created_at": "...",
  "updated_at": "..."
}
```

---

## 5) UI Requirements (from mandate — for reference)

| # | Action | Details |
|---|--------|---------|
| 1 | current price | Display `current_price` |
| 2 | source label | Display `price_source` — INTRADAY_FALLBACK \| EOD \| EOD_STALE |
| 3 | as-of timestamp | Display `price_as_of_utc` |
| 4 | last close | Display `last_close_price` separately from current |
| 5 | Scope | Tickers table + user_tickers table |

---

## 6) Notes

- `last_close_price` / `last_close_as_of_utc` may be null when no EOD data exists.
- `price_source` is deterministic per PHASE_1 logic (EOD, EOD_STALE, INTRADAY_FALLBACK).
- Backend uses snake_case; Frontend transformers (`apiToReact`) convert to camelCase.

---

**log_entry | TEAM_20 | PRICE_RELIABILITY_PHASE2 | API_READY | TO_TEAM_30 | 2026-03-08**
