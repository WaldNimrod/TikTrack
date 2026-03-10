# Team 20 → Team 10 | S002-P002-WP003 GATE_7 Remediation — Completion

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_COMPLETION  
**from:** Team 20 (Backend)  
**to:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-10  
**status:** DONE  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**in_response_to:** TEAM_10_TO_TEAM_20_S002_P002_WP003_GATE7_REMEDIATION_MANDATE, TEAM_50_TO_TEAM_20_S002_P002_WP003_GATE7_CANONICAL_PROMPT  

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

## 1) BF-001 — Ticker Price Transparency

**Problem:** `last_close = close_p or price_val` → `current_price` and `last_close_price` were identical.

**Solution:** Window function fetching 2 EOD rows per ticker.

**Path:** `api/services/tickers_service.py` — `_get_price_with_fallback()`

**Window function snippet:**
```sql
WITH ranked AS (
    SELECT ticker_id, price, open_price, close_price, price_timestamp,
           ROW_NUMBER() OVER (PARTITION BY ticker_id ORDER BY price_timestamp DESC) AS rn
    FROM market_data.ticker_prices
    WHERE ticker_id = ANY(:ticker_ids)
)
SELECT ticker_id, price, open_price, close_price, price_timestamp, rn
FROM ranked WHERE rn <= 2
ORDER BY ticker_id, rn
```

**Rank logic:** rn=1 → current session (`current_price`); rn=2 → previous session (`last_close_price`). Single-row ticker: `last_close` = close_p or price_val from same row. `daily_change_pct` = `(current - last_close) / last_close * 100`.

**Acceptance:** GET /api/v1/tickers — ≥3 tickers with EOD data show distinct `current_price` vs `last_close_price` when 2+ EOD rows exist per ticker.

---

## 2) BF-002 — Currency per Ticker

**Path:** `api/services/tickers_service.py` — `_derive_currency(ticker, country, ticker_type)`

**COUNTRY_TO_CURRENCY map:**
```python
COUNTRY_TO_CURRENCY = {
    "US": "USD", "IL": "ILS", "IT": "EUR", "DE": "EUR", "FR": "EUR", "GB": "GBP",
    "CH": "CHF", "JP": "JPY", "CN": "CNY", "HK": "HKD", "AU": "AUD", "CA": "CAD",
    "NL": "EUR", "ES": "EUR", "SE": "SEK", "SG": "SGD", "IN": "INR", "KR": "KRW",
}
```

**Derivation:** If `country` → map lookup. CRYPTO or symbol contains `-` → parse `SYMBOL-XXX` → XXX (3 chars). Default: USD.

**Outerjoin:** `get_tickers`, `get_ticker_by_id`, `get_my_tickers` use `.outerjoin(Exchange, Ticker.exchange_id == Exchange.id)` and pass `Exchange.country` to `_derive_currency`.

**Sample API response (currency field):**
```json
{
  "id": "01J...",
  "symbol": "TEVA.TA",
  "current_price": 125.50,
  "last_close_price": 124.00,
  "currency": "ILS",
  "price_source": "EOD",
  "price_as_of_utc": "2026-03-11T14:00:00Z",
  ...
}
```

**Acceptance:** TEVA.TA → ILS, BTC-USD → USD, ANAU.MI → EUR.

---

## 3) BF-003

No backend change — handled by Team 30.

---

## 4) BF-004

No backend change — handled by Team 30 and Team 60.

---

## 5) Deliverable Path

This report: `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_COMPLETION.md`

---

**log_entry | TEAM_20 | WP003_G7_REMEDIATION | DONE | 2026-03-11**
