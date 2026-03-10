# Team 20 → Team 10 | S002-P002-WP003 GATE_7 — Remediation Round 2 Completion

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION  
**from:** Team 20 (Backend)  
**to:** Team 10 (Gateway Orchestration)  
**cc:** Team 30  
**date:** 2026-03-10  
**status:** **DONE**  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**in_response_to:** TEAM_10_TO_TEAM_20_S002_P002_WP003_GATE7_R2_MANDATE  
**handoff_from:** TEAM_60_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 |
| phase_owner | Team 10 |

---

## 1) Summary

Team 20 has completed all R2 scope items **1.2, 1.3, 1.5, 1.7**. Deliverables: price_source flow verified; currency with alpha-3 country support (USA, ISR, ITA, GBR); ticker_type from DB; add-form API contract with GET /reference/exchanges, exchange_id in create requests, exchange_code/exchange_id in TickerResponse.

---

## 2) Finding Matrix — Team 20 (completed)

| # | ממצא | פעולה | סטטוס |
|---|------|--------|--------|
| **1.2** | רמזור אדום — price_source null | Verified _get_price_with_fallback returns price_source; EOD/intraday override flow intact; API passes through | ✅ DONE |
| **1.3** | מטבע — הכל $ | COUNTRY_TO_CURRENCY extended for alpha-3 (USA, ISR, ITA, GBR); _derive_currency checks c3 then c2 | ✅ DONE |
| **1.5** | ticker_type שגוי | API returns ticker_type from DB; Team 60 seed sets ETF for SPY/QQQ — no backend change | ✅ DONE |
| **1.7** | טופס הוספה — מטבע, בורסה, ANAU.MI | GET /reference/exchanges; exchange_id in TickerCreateRequest, AddMyTickerRequest; POST /tickers, POST /me/tickers accept exchange_id; TickerResponse has exchange_id, exchange_code | ✅ DONE |

---

## 3) Evidence & Implementation

### 3.1) 1.2 — price_source flow

- **_get_price_with_fallback** (`api/services/tickers_service.py`): Returns `price_source` (EOD | EOD_STALE | INTRADAY_FALLBACK) per ticker.
- **Condition:** Tickers need EOD or intraday data. After Team 60 seed + `make sync-eod` + intraday job, data flows to API.
- **No code change** — flow already correct; red light = no data (run sync after seed).

### 3.2) 1.3 — Currency (alpha-3)

- **COUNTRY_TO_CURRENCY** extended: USA, ISR, ITA, GBR (p3_021 seed uses these).
- **_derive_currency**: Tries `country[:3]` then `country[:2]` for map lookup.

```python
# api/services/tickers_service.py
COUNTRY_TO_CURRENCY = {
    "US": "USD", "USA": "USD", "IL": "ILS", "IS": "ILS", "ISR": "ILS",
    "IT": "EUR", "ITA": "EUR", "GB": "GBP", "GBR": "GBP", ...
}
```

| symbol | exchange | country | currency |
|--------|----------|---------|----------|
| TEVA.TA | TASE | ISR | ILS |
| ANAU.MI | MIL | ITA | EUR |
| AAPL | NASDAQ | USA | USD |
| BTC-USD | — | — | USD (symbol parse) |

### 3.3) 1.5 — ticker_type

- API returns `ticker_type` from `market_data.tickers`.
- Team 60 seed: SPY, QQQ with ticker_type=ETF. No backend change.

### 3.4) 1.7 — Add-form API contract

**New endpoint:**
```
GET /api/v1/reference/exchanges
Response: { "data": [{ "id", "exchange_code", "exchange_name", "country" }], "total" }
```

**TickerResponse** (updated):
- `exchange_id`: Optional[str] — Exchange ULID  
- `exchange_code`: Optional[str] — NASDAQ, TASE, MIL, …  

**TickerCreateRequest** (updated):
- `exchange_id`: Optional[str] — for linking ticker to exchange  

**POST /api/v1/tickers** (admin): Accepts `exchange_id` in body.  
**POST /api/v1/me/tickers**: Accepts `exchange_id` as query param.  

**Example — create ANAU.MI:**
```http
POST /api/v1/tickers
{ "symbol": "ANAU.MI", "ticker_type": "STOCK", "exchange_id": "<MIL_ULID>" }
```
(MIL ULID from GET /reference/exchanges)

---

## 4) API Contract for Team 30

| Endpoint | Method | Purpose |
|----------|--------|---------|
| GET /api/v1/reference/exchanges | GET | Exchange dropdown for add form |
| GET /api/v1/tickers | GET | List tickers — includes currency, exchange_id, exchange_code, price_source, price_as_of_utc |
| GET /api/v1/tickers/{id} | GET | Single ticker — same fields |
| POST /api/v1/tickers | POST | Create — body: symbol, company_name, ticker_type, exchange_id, is_active |
| POST /api/v1/me/tickers | POST | Add my ticker — query: symbol, ticker_type, exchange_id, market (CRYPTO) |

**TickerResponse fields for add-form / details:**
- currency, exchange_id, exchange_code, ticker_type  
- current_price, last_close_price, price_source, price_as_of_utc  

---

## 5) File Change Summary

| File | Changes |
|------|---------|
| `api/services/tickers_service.py` | COUNTRY_TO_CURRENCY alpha-3; exchange_id, exchange_code in get_tickers/get_ticker_by_id/create/update; create_ticker(exchange_id) |
| `api/schemas/tickers.py` | TickerResponse: exchange_id, exchange_code; TickerCreateRequest: exchange_id; AddMyTickerRequest: exchange_id |
| `api/routers/tickers.py` | create_ticker passes exchange_id |
| `api/routers/me_tickers.py` | add_my_ticker accepts exchange_id query param |
| `api/routers/reference.py` | GET /reference/exchanges |
| `api/services/reference_service.py` | get_reference_exchanges() |
| `api/schemas/reference.py` | ExchangeReferenceItem, ExchangeReferenceResponse |
| `api/services/user_tickers_service.py` | add_ticker(exchange_id); get_my_tickers returns exchange_id, exchange_code; outerjoin Exchange |

---

## 6) Handoff to Team 30

- **Binding:** price_source, price_as_of_utc, currency, exchange_code — bind to table columns; no "-" when payload has value.
- **formatCurrency:** Use `currency` from API (ILS, EUR, USD) — no hardcoded USD.
- **Add form:** Symbol + exchange dropdown (GET /reference/exchanges); submit with exchange_id. ANAU.MI = symbol ANAU.MI + exchange MIL.

---

**log_entry | TEAM_20 | WP003_G7_R2_COMPLETION | TO_TEAM_10 | DONE | HANDOFF_TO_30 | 2026-03-11**
