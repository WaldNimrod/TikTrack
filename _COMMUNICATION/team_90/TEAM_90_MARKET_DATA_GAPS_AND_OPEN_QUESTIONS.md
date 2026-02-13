# 🕵️ Team 90: Market Data — Gaps & Open Questions (Pre‑SSOT Lock)

**id:** `TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS`  
**date:** 2026-02-13  
**status:** ✅ **PARTIAL CLOSED — core blockers resolved**

---

## 1) **Conflict: Intraday requirement vs Provider Specs** — **RESOLVED**

- **Requirement (Owner):** Intraday prices for **Active tickers** in Stage‑1.  
- **Architect Provider Spec:** Yahoo interval = **1d (EOD)**.  

**Decision:** Stage‑1 includes **Intraday** for Active tickers.  
**Action:** Update provider spec references + `MARKET_DATA_PIPE_SPEC.md` (done in SSOT).

---

## 2) Rate‑Limit Feasibility (Alpha Vantage) — **OPEN (non‑blocking)**

- Alpha rate limit: 5 calls/min → 12.5s queue.  
- Intraday + Active tickers עשוי להיות כבד תחת limit זה.

**Open:** כיצד מתוזמנת משיכת intraday כדי לא להפר SLA?  
**Action:** להגדיר max active tickers / schedule policy ב‑SSOT.

---

## 3) Provider Registry SSOT — **OPEN (non‑blocking)**

- יש החלטה ל‑agnostic interface, אבל **Registry SSOT** לא קיים עדיין.

**Open:** האם ליצור SSOT חדש או להטמיע בתוך `MARKET_DATA_PIPE_SPEC.md`?  
**Action:** החלטת Team 10 לפי נוהל קידום ידע.

---

## 4) **Interval Dimension (Daily vs Intraday)** — **RESOLVED**

- Stage‑1 דורש **Intraday + Daily** לאותו טיקר.  
- ב‑DB קיים `market_data.ticker_prices` ללא שדה interval.

**Decision:** **Separate table** for intraday — `market_data.ticker_prices_intraday`.  
**Action:** Reflected in `MARKET_DATA_PIPE_SPEC.md` + `MARKET_DATA_COVERAGE_MATRIX.md`.

---

## 5) Clock‑based Staleness UI — **RESOLVED**

**Decision:** Clock + Tooltip (no banner) with thresholds:  
- **warning** > 15 minutes  
- **na** > 24 hours  
**Source:** `TT2_MARKET_DATA_RESILIENCE.md`, `FOREX_MARKET_SPEC.md`, `MARKET_DATA_PIPE_SPEC.md`

---

## 6) Cadence Policy per Ticker Status — **RESOLVED**

- נדרש: Active = intraday, inactive = EOD.  
- עדיין אין מיפוי SSOT לערכי `ticker_status` (איפה נשמר, מי מגדיר).

**Decision:** Use existing `is_active_flags` as source of truth.  
**Action:** Add System Settings cadence config (domain + status) in `MARKET_DATA_PIPE_SPEC.md`.

---

## 7) Market Cap Precision — **RESOLVED**

- Market Cap נכנס Stage‑1.  
- Precision Policy לא כולל שדה market_cap.

**Decision:** `market_cap = NUMERIC(20,8)` in `PRECISION_POLICY_SSOT`.  
**Action:** Updated in SSOT.

---

## 8) **Intraday Retention Window** — **RESOLVED**

**Decision:** Intraday DB retention **30 days** → archive files **1 year** → delete.  
**Source:** `MARKET_DATA_PIPE_SPEC.md` §7.3 + `MARKET_DATA_COVERAGE_MATRIX.md`.

---

**log_entry | TEAM_90 | MARKET_DATA_GAPS | 2026-02-13**  
**log_entry | TEAM_90 | MARKET_DATA_GAPS_PARTIAL_CLOSED | 2026-02-13**  
**log_entry | TEAM_90 | MARKET_DATA_GAPS_REVIEW_UPDATE | 2026-02-13**
