date: 2026-03-25
historical_record: true

# Team 20 — S003-P004-WP001 D33 “הטיקרים שלי” — Backend implementation

**Date:** 2026-03-25  
**Work package:** S003-P004-WP001  
**Normative:** `TEAM_100_S003_P004_WP001_LOD200_v1.0.0.md` | **SSOT:** `TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`  
**G3.5:** PASS (`TEAM_90_S003_P004_WP001_G3_5_VERDICT_v1.0.0.md`)

## Summary

- Extended **GET `/api/v1/me/tickers`** with filters, sort, pagination, and list envelope `{ data, total, page, page_size }` where `total` is the count **after filters, before pagination**.
- **PATCH `/api/v1/me/tickers/{ticker_id}`** now distinguishes omitted `display_name` vs explicit `null` (clears display name) via Pydantic `model_fields_set` + `display_name_provided` in the service.
- **POST/DELETE** unchanged in shape; verified against existing LLD field names (no new fields).
- **D33-IR-05:** `api/utils/privacy_log.log_subject` hashes a short `subject_ref` instead of logging raw user ids on list failure paths.
- **No DDL** changes.

## Files modified

| Path | Notes |
|------|--------|
| `api/schemas/tickers.py` | `TickerListResponse`: `page`, `page_size`; `total` documented |
| `api/services/user_tickers_service.py` | `list_my_tickers`, `sort_ticker_responses_for_list`, `ME_TICKER_SORT_KEYS`; PATCH `display_name_provided` |
| `api/routers/me_tickers.py` | GET query params + validation; `user_ticker_status` (OpenAPI name `status`) to avoid shadowing `fastapi.status`; PATCH wiring |
| `api/routers/tickers.py` | Admin list returns `page=1`, `page_size=max(1,n)` with shared schema |
| `api/utils/privacy_log.py` | New — `log_subject` |
| `tests/unit/test_me_tickers_d33.py` | Sort null rules, envelope, 422 cases, filter+sort+pagination param pass-through |

## GET `/api/v1/me/tickers` — behaviour

| Item | Detail |
|------|--------|
| Defaults | `page=1`, `page_size=25`, `sort_by=display_name`, `sort_dir=asc` |
| `page_size` | Max **50** (422 if `>50`); `page` must be `>=1` (422 if not) |
| `ticker_type` | Repeatable query param; **OR** semantics; invalid value → **422** |
| `status` | `active` \| `inactive` on `user_data.user_tickers.status` |
| `sector_id`, `market_cap_group_id` | ULIDs; invalid → **422** |
| `sort_by` | One of: `display_name`, `company_name`, `current_price`, `daily_change_pct`, `ticker_type`, `currency`, `exchange_code`, `status`, `price_source`; invalid → **422** |
| Nullable sort keys | **ASC** → nulls last; **DESC** → nulls first |
| `sort_by=status` | **Ticker lifecycle** `Ticker.status` (same as `TickerResponse.status`), not `user_tickers.status` |
| Implementation | Filter in SQL; enrich prices; **sort + paginate in Python** (full filtered set in memory — acceptable for typical watchlist size) |

## PATCH / POST / DELETE (verification)

- **PATCH** `display_name`: max length **100** (Pydantic); explicit `null` clears; omitted field leaves value unchanged.
- **POST/DELETE**: existing contracts; no new JSON field names.

## Tests

```bash
cd /path/to/TikTrackAppV2-phoenix
source api/venv/bin/activate
python -m pytest tests/unit/test_me_tickers_d33.py -v
python -m pytest tests/unit/ -q
```

## OpenAPI

`TickerListResponse` includes `data`, `total`, `page`, `page_size` (see `/openapi.json` when the API is running).

---

## Handoff to Team 30

### Sample JSON (200)

```json
{
  "data": [
    {
      "id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
      "symbol": "AAPL",
      "display_name": "Apple",
      "company_name": "Apple Inc.",
      "ticker_type": "STOCK",
      "status": "active",
      "is_active": true,
      "delisted_date": null,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-06-01T12:00:00Z",
      "current_price": "190.12345678",
      "daily_change_pct": "1.25000000",
      "price_source": "INTRADAY_FALLBACK",
      "price_as_of_utc": "2026-03-25T14:30:00Z",
      "last_close_price": "189.00000000",
      "last_close_as_of_utc": "2026-03-24T21:00:00Z",
      "currency": "USD",
      "exchange_id": null,
      "exchange_code": "NASDAQ"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 25
}
```

### Query matrix (GET `/api/v1/me/tickers`)

| Parameter | Type | Notes |
|-----------|------|--------|
| `ticker_type` | string[], optional | Repeat; OR; values from `TICKER_TYPES` |
| `status` | `active` \| `inactive`, optional | `user_tickers` row |
| `sector_id` | ULID, optional | `market_data.tickers.sector_id` |
| `market_cap_group_id` | ULID, optional | `market_data.tickers.market_cap_group_id` |
| `sort_by` | string | See ME_TICKER_SORT_KEYS / table above |
| `sort_dir` | `asc` \| `desc` | |
| `page` | int ≥ 1 | |
| `page_size` | int 1–50 | |

### curl examples

Replace `TOKEN` with a valid JWT from `POST /api/v1/auth/login`.

```bash
# List default page
curl -sS -H "Authorization: Bearer TOKEN" \
  "http://localhost:8082/api/v1/me/tickers"

# Filters + sort + page
curl -sS -H "Authorization: Bearer TOKEN" \
  "http://localhost:8082/api/v1/me/tickers?ticker_type=STOCK&ticker_type=ETF&status=active&sort_by=company_name&sort_dir=desc&page=2&page_size=50"

# PATCH: clear display name (explicit null)
curl -sS -X PATCH -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"display_name":null}' \
  "http://localhost:8082/api/v1/me/tickers/TICKER_ULID"
```

### Known caveats

1. **Two “status” concepts:** Query param `status` filters **user list** membership (`user_tickers.status`). Column `sort_by=status` sorts by **ticker lifecycle** (`Ticker.status` / `TickerResponse.status`).
2. **Performance:** List path loads all rows matching filters, enriches prices, then sorts and slices. Large lists may warrant future SQL-side pagination (not in this WP).
3. **Admin GET `/api/v1/tickers`:** Uses the same `TickerListResponse` model; returns one logical page with `page_size = len(data)` (≥1).

### Contract frozen

- **Date:** 2026-03-25  
- **Repository baseline (pre-merge working tree):** `e9491182b9c39a3547c21a059f8a42c1f0f715bc` — **replace with the commit hash that contains this implementation when merged.**

---

## PRE_FLIGHT (for operators)

- Backend health: `curl -s http://localhost:8082/health` → 200  
- Unit tests above pass in `api/venv`

## HANDOVER_PROMPT (Team 30)

Implement D33 UI against GET `/api/v1/me/tickers` using the envelope (`data`, `total`, `page`, `page_size`), query matrix above, and PATCH explicit `null` for clearing `display_name`. Bind filter chips to `ticker_type` (repeat), `status`, `sector_id`, `market_cap_group_id`; wire table sort to `sort_by` / `sort_dir`; paginate with `page` / `page_size` (max 50). Do not confuse list `status` with ticker lifecycle `status` when sorting.
