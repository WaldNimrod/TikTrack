# External Data — Where We See It in the UI (Team 10)

**Date:** 2026-01-30  
**Context:** Post–External Data Seal (P3-008/009/011/013–017). Question: איפה אנחנו רואים בפועל בממשק נתונים? בעמוד ניהול טיקרים — בדקנו?

---

## 1. Where market data IS shown in the UI

| Location | Data shown | Source (backend) |
|----------|------------|-------------------|
| **Staleness clock** (header) | FX staleness + tooltip | `GET /api/v1/reference/exchange-rates` → `market_data.exchange_rates`; `eodStalenessCheck.js` |
| **חשבונות מסחר / Trading Accounts** — Positions table | `currentPrice`, `dailyChangePercent`, P/L | Positions API → `market_data.ticker_prices` (latest price per ticker); `tradingAccountsDataLoader.js` renders rows |

So: **exchange rates** and **EOD ticker prices** are visible today — in the header (clock) and in the **Trading Accounts** view (positions with current price and daily change).

---

## 2. עמוד ניהול טיקרים (tickers management)

- **Menu:** "ניהול טיקרים" links to `/tickers.html` (`routes.json`: `management.tickers` → `/tickers.html`).
- **Current codebase:** There is **no** `tickers.html` (or equivalent view) under `ui/public` or `ui/src/views`. The page is **not implemented** in the Phoenix app.
- **Blueprint/spec only:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/tickers_BLUEPRINT.html` and related docs exist as spec/reference, not as the live app.

**Conclusion:** We have **not** verified market data on "עמוד ניהול טיקרים" because that page does not exist in the built UI. Any future ticker management page could show `market_cap`, EOD price, and staleness once implemented and wired to the existing APIs.

---

## 3. Backend data flow (for reference)

- **Positions**  
  `api/services/positions.py` reads from `market_data.ticker_prices` (latest `price` → `current_price`, `close_price` → `previous_close`) and computes daily change and P/L. So the Trading Accounts positions table is the **main place** where EOD ticker prices are shown.
- **Exchange rates**  
  `GET /api/v1/reference/exchange-rates` reads from `market_data.exchange_rates`; UI uses it for the staleness clock only (no table of rates in the current UI).

---

## 4. Recommendations

1. **QA / documentation:** Add an explicit check: "Verify market data in UI: (1) Staleness clock on a page that loads it, (2) Trading Accounts → positions show current price and daily change."
2. **ניהול טיקרים:** When the tickers management page is implemented, add a verification step: list/card shows EOD price (and optionally `market_cap`) and that the source is the same pipeline (e.g. `ticker_prices` / cache-first).
3. **Index:** Consider a short "Where external data appears in the UI" note in `D15_SYSTEM_INDEX.md` or the relevant UX doc, pointing to this report.

---

**Evidence:** Codebase scan — `ui/` (views, routes, eodStalenessCheck, tradingAccountsDataLoader), `api/services/positions.py`, `api/routers/reference.py`. No tickers.html in built UI.

**סגירה:** התהליך לא נחשב סגור עד **Gate B** (Team 50): נתוני אמת מהספקים, שמירה, מגוון נתונים, EOD vs intraday, שני ספקים, והצגה בממשק. ראה: _COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_EXTERNAL_DATA_GATE_B_QA_REQUEST.md.
