# Team 50 → Team 10 | S002-P002-WP003 GATE_7 — R2 QA Report

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_R2_QA_REPORT  
**from:** Team 50 (QA & Fidelity)  
**to:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-10  
**status:** **BLOCK**  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**trigger:** TEAM_10_TO_TEAM_50_S002_P002_WP003_GATE7_R2_QA_ACTIVATION  
**completion_reports:** Team 60, Team 20, Team 30 (R2)

---

## 0) Completion Reports Received

| Team | Report | Status |
|------|--------|--------|
| Team 60 | TEAM_60_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION | ✅ DONE |
| Team 20 | TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION | ✅ DONE |
| Team 30 | TEAM_30_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION | ✅ DONE |

---

## 1) Executive Summary

**status:** BLOCK

R2 implementation verified at code level; **3 blockers** prevent PASS:

1. **1.3 מטבע** — TEVA.TA, ANAU.MI show $ instead of ₪/€. Root cause: `exchange_id` is null for existing tickers in DB; seed only sets exchange for newly inserted (AAPL, SPY, QQQ).
2. **1.2 רמזור** — AAPL, QQQ, SPY have `price_source=null` (no EOD); MCP screenshot shows red for visible rows. Tickers with EOD (AMZN, BTC, etc.) — binding correct; red = expected when null.
3. **1.7 טופס הוספה** — GET `/reference/exchanges` returns 500 "Failed to fetch exchanges" — dropdown לא יעבוד.

---

## 2) Per-BF + Per-Finding Results

| BF / Finding | Criterion | Result | Evidence |
|--------------|-----------|--------|----------|
| **BF-001** | ≥3 symbols: current≠last_close; source, as_of visible | **PARTIAL** | API: AMZN, GOOGL, META have source+as_of; AAPL, QQQ, SPY null. Binding: sourceCell, asOfCell use getPriceSourceLabel/formatPriceAsOf; show "—" when null. |
| **BF-002** | TEVA.TA→₪, BTC-USD→$, ANAU.MI→€ | **BLOCK** | API returns USD for TEVA.TA, ANAU.MI (exchange_id null). Backend COUNTRY_TO_CURRENCY correct; seed does not link existing tickers to exchange. |
| **BF-003** | Details modal; traffic-light per row | **PASS** | traffic-light class per row; handleDetails→createModal. Code verified. |
| **BF-004** | Last-update coherent | **PASS** | loadAllData→updateStalenessClock from max(price_as_of_utc). |
| **1.1** | מקור + עודכן ב — לא ריקים | **PARTIAL** | Binding exists; when API has value — displays. When null → "—". Tickers with EOD show values. |
| **1.2** | רמזור — לא אדום לכולם | **BLOCK** | AAPL, QQQ, SPY: price_source=null → red. Need EOD sync for new tickers; or verify sync-eod runs. |
| **1.3** | מטבע — TEVA.TA ₪, ANAU.MI € | **BLOCK** | exchange_id null for TEVA.TA, ANAU.MI in DB. Seed must UPDATE existing tickers with exchange. |
| **1.4** | מודל פרטים — מלא | **PASS** | handleDetails: ticker + data-integrity; edit fields + market data. Code verified. |
| **1.5** | ticker_type — SPY/QQQ ETF | **PASS** | API: SPY, QQQ type=ETF. Seed + UI badge. |
| **1.6** | Seed — DDD/TSLA/MSFT removed; SPY/QQQ exist | **PASS** | make seed-tickers: "Cleaned 3 ticker(s) DDD/TSLA/MSFT"; inserted SPY, QQQ. |
| **1.7** | טופס הוספה — מטבע, בורסה, ANAU.MI | **BLOCK** | GET /reference/exchanges → 500. Add form cannot load exchanges. |

---

## 3) MCP Run Summary

| Step | Action | Result |
|------|--------|--------|
| 1 | browser_navigate /tickers.html | Page loaded |
| 2 | browser_click "הצג הכל" | Table populated; 8 rows; combobox has AAPL, AMZN, … |
| 3 | browser_snapshot | Column headers: מקור, סגירה, עודכן ב, בורסה, פעולות |
| 4 | browser_take_screenshot | Tickers AAPL, AMZN, ANAU.MI, BTC-USD; all $; red traffic lights |

**Evidence:** Screenshot `page-2026-03-10T20-44-55-968Z.png`

---

## 4) API Verification

| Endpoint | Result |
|----------|--------|
| GET /tickers | 200, 9 tickers |
| GET /tickers payload | currency, ticker_type, price_source, price_as_of_utc, exchange_code present |
| GET /reference/exchanges | **500** — Failed to fetch exchanges |
| run-tickers-d22-qa-api.sh | 6/7 (POST 422 expected) |

**Payload sample (is_active=true):**
- TEVA.TA: currency=USD, type=STOCK, source=EOD, exchange_code=null
- ANAU.MI: currency=USD, type=STOCK, source=INTRADAY_FALLBACK, exchange_code=null
- SPY: currency=USD, type=ETF, source=null, exchange_code=NYSE
- QQQ: currency=USD, type=ETF, source=null, exchange_code=NASDAQ

---

## 5) Root Causes & Remediation

| Blocker | Root Cause | Owner | Action |
|---------|------------|-------|--------|
| **1.3** | Seed does not set exchange_id for existing tickers (TEVA.TA, ANAU.MI) | Team 60 | Extend seed: UPDATE tickers SET exchange_id=... WHERE symbol IN ('TEVA.TA','ANAU.MI') |
| **1.2** | AAPL, QQQ, SPY have no EOD data (newly seeded) | Team 60 | Run `make sync-eod` after seed; or verify intraday job fills |
| **1.7** | GET /reference/exchanges 500 | Team 20 | Debug reference_service; likely permission or query error |

---

## 6) Nimrod Verification

| Field | Value |
|-------|-------|
| **Status** | **PENDING** |
| **Blocker** | Cannot complete session until 1.3, 1.2, 1.7 resolved |

---

## 7) Recommendation

**BLOCK** — Team 10 to route:

1. **Team 60:** Seed — link TEVA.TA→TASE, ANAU.MI→MIL; run sync-eod after seed.
2. **Team 20:** Fix GET /reference/exchanges 500.
3. **Re-run QA:** After remediation, Team 50 will re-execute MCP + API checks.
4. **Nimrod session:** After QA PASS.

---

**log_entry | TEAM_50 | WP003_G7_R2_QA_REPORT | TO_TEAM_10 | BLOCK | 2026-03-11**
