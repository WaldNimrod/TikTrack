# 📊 מפרט ספק: Yahoo Finance
**project_domain:** TIKTRACK

**SSOT:** MISSION_DIRECTIVE_90_02_FINAL, MISSION_90_02_LEGACY_YAHOO_INVESTIGATION_REPORT  
**SOP-015:** Cooldown Protocol enforced.

---

## תפקיד ועיקרים

- **Role:** Primary for Prices / Fallback for FX.
- **Method:** Query V8 chart API (HTTP ישיר) + yfinance (fallback, **בלי Session**).
- **History 250d:** Primary v8/chart — `range=2y` (full) או `period1`/`period2` (gap-fill); Fallback yfinance.
- **Interval:** 1d (EOD).
- **Enforcement:** User-Agent Rotation required.
- **Precision:** Forced 20,8 — ללא פשרות.
- **Crypto Symbol Contract (Locked):** `BASE-QUOTE` (for example: `BTC-USD`, `ETH-USD`); fallback `BASEQUOTE=X`.
- **Equity Symbol Contract:** Native exchange symbol (for example: `AAPL`, `MSFT`, `ANAU.MI`).

---

## 11 חוקי הזהב (Yahoo Gold Standard — MISSION-90-02)

| # | כלל | מימוש |
|---|------|--------|
| 1 | אין custom Session ל־yfinance | `yf.Ticker(symbol)` בלבד |
| 2 | v8/chart Primary | history לפני quote/quoteSummary |
| 3 | User-Agent חובה — rotation | `_next_user_agent()` |
| 4 | Retry 3×5s על 429 | v8/chart, last-close |
| 5 | Cache-First + Single-Flight + Cooldown | sync scripts, provider_cooldown |
| 6 | רווח בין סמלים | 4+ שניות בבדיקות |
| 7 | אין ticker.info | quoteSummary → 429 |
| 8 | Crypto fallback | BASE-QUOTE → BASEQUOTE=X + 2s |
| 9 | Cooldown אחרי 429 | SOP-015; `set_cooldown`; 15 דקות |
| 10 | EOD תמיד ראשון | v8/chart range=1mo |
| 11 | European fallbacks (אופציונלי) | .DE, .F, .L, .PA, .AS |

---

## Cooldown Protocol (SOP-015)

- `provider_cooldown.set_cooldown(provider, minutes)` on 429.
- `get_cooldown_status()` — לוגים לאודיט Team 90.
- Sync scripts: `📋 [SOP-015] {provider} in cooldown: {sec}s remaining`
