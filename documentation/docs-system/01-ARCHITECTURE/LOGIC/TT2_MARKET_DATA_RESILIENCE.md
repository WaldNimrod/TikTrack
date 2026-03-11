# 🛡️ Market Data Resilience
**project_domain:** TIKTRACK

**id:** `TT2_MARKET_DATA_RESILIENCE`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-03-09  
**version:** v1.2

---

## 1. Hierarchy & policy

- **Hierarchy:** Cache > EOD > LocalStore.
- **Policy:** Never block UI for external API.
- **Staleness thresholds (LOCKED — Stage-1):**
  - **Warning:** data older than **15 minutes** → clock color + tooltip "stale warning".
  - **N/A:** data older than **24 hours** (full trading day) → clock color + tooltip "EOD / N/A"; no expectation of intraday freshness.
- **מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MAINTENANCE_LOCKED_UPDATE.

---

## 2. Provider Fix — שורש בעיות ומדיניות (post–Team 60 consultation)

### 2.1 Root causes (לפני תיקון)

| Problem | Root cause |
|--------|------------|
| Alpha 25/day exhausted | Alpha שימש כ־fallback רחב לכל non-CRYPTO + קריאת market_cap נפרדת = 2 קריאות/טיקר |
| Yahoo 429 במהירות | אין ריווח בין סמלים (burst); retry קבוע 5s×3 במקום exponential backoff |
| QQQ/SPY EOD sync fail | Yahoo 429 → cooldown → כל הטיקרים עוברים ל־Alpha → Alpha אזל → אין fallback |

### 2.2 שינויים במימוש (תמצית)

- **provider_cooldown.py:** מכסת Alpha יומית 25, ספירה יומית UTC, `increment_alpha_calls()` / `get_alpha_remaining_today()` / `AlphaQuotaExhaustedException`.
- **alpha_provider.py:** בדיקת מכסה לפני קריאה; הסרת `_fetch_market_cap` מ־`get_ticker_price` (market_cap=None).
- **yahoo_provider.py:** 429 retry — exponential backoff 5s→10s→20s; batch — 100ms בין chunks.
- **market_data_settings.py:** `delay_between_symbols_seconds` default **0 → 1**.
- **sync_ticker_prices_eod.py:** `ALPHA_FX_RESERVE=8`; Alpha non-CRYPTO רק כש־remaining > 8; Alpha CRYPTO במכסה.
- **sync_ticker_prices_intraday.py:** Alpha non-CRYPTO אף פעם; Alpha CRYPTO בלבד ובמכסה.

### 2.3 Daily Alpha budget (אחרי תיקון)

| Use | Calls/day | Notes |
|-----|-----------|--------|
| FX sync (5 pairs) | 5 | שמור — sync_exchange_rates_eod לא מושפע |
| Equity EOD fallback (non-CRYPTO) | 0–17 | רק כש־Yahoo ב־cooldown **ו**־remaining > 8 |
| CRYPTO prices | 0–2 | לפי טיקר |
| **Total** | ≤ 25 | מכסה קשיחה — אכיפה פרואקטיבית |

**log_entry | TEAM_10 | SSOT_UPDATE | PROVIDER_FIX_DOC | 2026-03-09** — §2 Root causes, code changes summary, Daily Alpha budget. מקור: Market Data Provider Fix (Team 60 consultation).