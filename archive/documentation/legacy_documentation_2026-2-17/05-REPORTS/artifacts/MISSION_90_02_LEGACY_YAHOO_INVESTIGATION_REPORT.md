# MISSION-90-02: דוח חקירת עומק — הפיצוח של Yahoo Finance

**id:** MISSION-90-02  
**owner:** Chief Architect  
**executor:** Team 20 (Backend) — טופל ישירות כפי שנידרש  
**date:** 2026-02-15  
**status:** COMPLETE — Delivered per Architect directive

---

## 1. Findings — תובנות מקוד Legacy

**מקורות נסרקים (עדכון 2026-02-15):**
- `TikTrackApp/trading-ui/scripts/yahoo-finance-service.js`
- `TikTrackApp/Backend/services/external_data/yahoo_finance_adapter.py`

### 1.1 Frontend — yahoo-finance-service.js

| רכיב | ממצא | קוד |
|------|------|-----|
| **API** | אין קריאות ישירות ל־Yahoo; כל הבקשות דרך Backend | `fetch(\`/api/external_data/yahoo/quote/${symbol}\`)` L273 |
| **Batch** | `POST /api/external_data/yahoo/quotes` עם `{ symbols }` | L303–309 |
| **Cache** | 5 דקות TTL; Map | `cacheTimeout = 5 * 60 * 1000` L32 |
| **loadingPromises** | deduplication — בקשה כפולה מחזירה את אותה Promise | L52–64 |
| **cleanCache** | אוטומטי כל 10 דקות | `setInterval(..., 10 * 60 * 1000)` L403–405 |

**מסקנה:** הפרונטאנד Legacy לא "מפצח" את Yahoo — הוא משתמש ב־Backend API בלבד.

### 1.2 Backend — yahoo_finance_adapter.py (הפיצוח האמיתי)

| אופטימיזציה | מימוש Legacy | קוד |
|--------------|--------------|-----|
| **HTTP Client** | `requests.Session()` — לא yfinance | L75–78 |
| **User-Agent** | UA יחיד קבוע | `'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'` L76–77 |
| **Rate Limit** | 900 בקשות/שעה (שמרני); מונה per-hour | L80–83, `_check_rate_limit()` L300–311 |
| **Retry** | 3 ניסיונות + exponential backoff | L94–95, `_make_request` L315–374 |
| **429 Handling** | `wait_time = (2 ** attempt) * 5` → 5s, 10s, 20s | L349–354 |
| **Primary Endpoint** | v8/finance/chart | L441: `url = f"{base_url}/v8/finance/chart/{symbol}"` |
| **params (single quote)** | `range='1d'` | L442–446 |
| **Cache-First** | DB cache לפני API | `_get_cached_quote_by_ticker` L429–433 |
| **Batch** | 25–50 סימובלים; 100ms בין batches | L89–90, L522–524 |
| **European Fallbacks** | .DE, .F, .XETR, .L, .PA, .AS | `_get_fallback_symbols()` L376–405 |
| **Provider Symbol Mapping** | DB mapping per ticker (TickerSymbolMappingService) | L115–143, L453–464 |
| **TTL** | Hot 60s, Warm 300s | L85–86 |
| **404** | לא retry — סימבול לא קיים | L340–344 |

**הערה חשובה:** Legacy משתמש ב־`requests.Session()` ל־HTTP ישיר; אין yfinance. הבעיה שזוהתה ב־DEBUG_YAHOO_RESULTS (Session → 429) מתייחסת להעברת Session **ל־yfinance**; ב־Legacy אין yfinance — יש HTTP ישיר ל־v8/chart.

### 1.3 גאפים: Legacy vs Next-Gen

| נושא | Legacy | Next-Gen (Phoenix) |
|------|--------|-------------------|
| **range למחיר יחיד** | `1d` — עשוי להיות ריק בסוף שבוע | `1mo` — היסטוריה תמיד קיימת ✅ |
| **User-Agent** | יחיד | Rotation (3 UA) ✅ |
| **429 wait** | 5s, 10s, 20s (exponential) | 5s × 3 (קבוע) |
| **European fallbacks** | .DE, .F, .L, .PA, .AS | לא מוּמש — לשקול |
| **Crypto fallback** | לא מופיע | BTC-USD → BTCUSD=X ✅ |
| **Cooldown לאחר 429** | retry בלבד | 15 דקות cooldown ✅ |
| **yfinance** | לא משתמש | fallback — בלי Session ✅ |

### 1.4 עדות G-Lead

> "במערכת ה-Legacy, החיבור ליהו היה 'פיקס', יציב ומעולה לאחר שעבר אופטימיזציה נכונה."

**פרשנות:** הקוד ב־yahoo_finance_adapter.py מכיל את האופטימיזציות: Session+UA, rate limit 900/hr, retry+backoff, v8/chart בלבד (לא quoteSummary), cache-first, batch+delay. Next-Gen משלים/משפר בחלק מהנקודות (range=1mo, cooldown, UA rotation, crypto fallback).

---

## 2. המימוש הנוכחי (Next-Gen) — מה כבר "פוצח"

המימוש ב־`yahoo_provider.py` תואם לרוב הממצאים המקובלים מקהילה ותיעוד yfinance:

| אופטימיזציה | מימוש | מיקום |
|--------------|--------|--------|
| **User-Agent Rotation** | `_next_user_agent()` — 3 UA שונים | yahoo_provider.py L26–40 |
| **אין Session מותאם ל־yfinance** | `yf.Ticker(symbol)` בלבד — לא session=... | DEBUG_YAHOO_RESULTS.md; yfinance GitHub |
| **v8/chart Primary** | history קיימת תמיד; פחות 429 מ־quote/quoteSummary | YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC.md §1 |
| **Retry על 429** | 3×5 שניות | `_fetch_last_close_via_v8_chart_inner`, `_fetch_history_v8_chart` |
| **Crypto fallback** | BTC-USD → BTCUSD=X | `_to_forex_style_symbol` + sleep 2s |
| **meta.regularMarketPrice** | fallback כש־quote.close ריק | v8/chart inner |
| **Cooldown 15 דקות** | provider_cooldown.py | MARKET_DATA_PIPE_SPEC §8 |
| **Single-Flight** | fcntl lock ב־sync_ticker_prices_eod | TEAM_20_RATELIMIT_SCALING_LOCK_EVIDENCE |
| **Cache-First** | skip_fetch ב־request path; EOD sync only | idem |

---

## 3. Comparison — Yahoo (ממוטב) vs Twelve Data

| קריטריון | Yahoo Finance (ממוטב) | Twelve Data |
|----------|----------------------|-------------|
| **עלות** | חינם | Free: 800 req/day; Paid plans |
| **דיוק** | NUMERIC(20,8) — תמיכה מלאה | NUMERIC(20,8) — תמיכה |
| **תיעוד רשמי** | לא מפורסם (Terms: "rate limits at discretion") | API documented, rate limits ברורים |
| **EOD / 250d history** | v8/chart — זמין | כן |
| **Intraday** | אפשרי (v8/chart interval=5m) | כן (plans שונים) |
| **Crypto** | BTC-USD / BTCUSD=X | BTC, ETH וכו׳ |
| **FX** | היסטוריה + quote | כן |
| **סיכון חסימה** | 429 — ~100/hr (קהילה); לא רשמי | מוגדר לפי תוכנית |
| **אינטגרציה קיימת** | מימוש מלא, מאומת | לא מוּמש |
| **Agnostic Interface** | תומך | Provider interface תומך הוספה |

---

## 4. The Verdict — המלצה חד־משמעית

### לפצח את Yahoo קודם

**ההמלצה:** **להמשיך עם Yahoo כספק ראשי** בשלב Stage-1, ולא לרוץ מיד ל־Twelve Data.

**נימוקים:**

1. **המימוש הנוכחי כבר ממוטב** — User-Agent, v8/chart primary, retry, cooldown, single-flight, cache-first.
2. **אי־היציבות שזוהתה** נבעה בעיקר מ:
   - שימוש ב־Session מותאם ל־yfinance (תוקן)
   - שימוש יתר ב־quote/quoteSummary (תוקן — history קודם)
   - העדר cooldown ו־single-flight (תוקן)
3. **LOD 400 (דיוק 20,8 ועדכון שעתי)** — Yahoo מסוגל:
   - דיוק 20,8 — מאומת
   - EOD — תמיד; Intraday — לפי הגדרה (15 דקות ברירת מחדל)
4. **סיכון ל־100 משתמשים סימולטניים** — מנוטרל ע״י:
   - Cache-First — רוב הבקשות מ־DB
   - Single-Flight — job אחד רץ
   - Cooldown 15 דקות — מניעת burst
   - max_active_tickers — 50 ברירת מחדל
5. **Twelve Data** — כדאי כשדרוג עתידי אם Yahoo יתגלה כבלתי מספק; כרגע אין ערך הנדסי דחוף.

---

## 5. Implementation Rules — חוקי הזהב למימוש

### 5.1 חוקים קיימים (לא לשנות)

| # | כלל | מקור |
|---|------|------|
| 1 | **אין custom Session** ל־yfinance | DEBUG_YAHOO_RESULTS.md |
| 2 | **v8/chart Primary** — history לפני quote/quoteSummary | YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC.md |
| 3 | **User-Agent חובה** — rotation | EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC |
| 4 | **Retry 3×5s** על 429 | SPEC-PROV-YF-HIST |
| 5 | **Cache-First + Single-Flight + Cooldown** | TEAM_20_RATELIMIT_SCALING_LOCK_EVIDENCE |

### 5.2 כללים נוספים (לאכיפה)

| # | כלל | פרטים |
|---|------|--------|
| 6 | **רווח בין סמלים** | 4+ שניות בבדיקות; ב־sync — כפוף ל־max_symbols_per_request |
| 7 | **אין ticker.info** | quoteSummary → 429; market_cap מ־v7/quote אם זמין |
| 8 | **Crypto fallback** | BASE-QUOTE → BASEQUOTE=X + 2s delay |
| 9 | **Cooldown אחרי 429** | 15–30 דקות לפני חזרה ידנית; 15 דקות אוטומטי |
| 10 | **EOD תמיד ראשון** | v8/chart range=1mo (או 2y להיסטוריה) — נתונים תמיד קיימים |
| 11 | **European fallbacks (אופציונלי)** | Legacy: .DE, .F, .L, .PA, .AS — לשקול אם טיקרים אירופאיים נכשלים |

### 5.3 קטע קוד Legacy — Retry על 429

```python
# yahoo_finance_adapter.py L349-354
if status_code == 429:
    wait_time = (2 ** attempt) * 5  # 5s, 10s, 20s
    logger.warning(f"⚠️ Rate limit exceeded (429) for {symbol}, waiting {wait_time}s before retry")
    if attempt < self.retry_attempts:
        time.sleep(wait_time)
        continue
```

### 5.4 מבנה Agnostic — Twelve Data בעתיד

- Provider interface כבר תומך multi-provider.
- הוספת Twelve Data = provider חדש — לא שובר קוד.
- Fallback chain: Yahoo → Alpha (Prices); Twelve Data יכול להתווסף כשדרוג ללא שבירת ממשק.

---

## 6. סיכום למנהלים

| שאלה | תשובה |
|------|--------|
| **האם לפצח Yahoo קודם?** | כן |
| **האם Twelve Data נדרש עכשיו?** | לא — שדרוג עתידי |
| **האם LOD 400 (20,8 + עדכון) אפשרי רק ב־Yahoo?** | כן |
| **סיכון 100 משתמשים?** | נמוך — Cache, Single-Flight, Cooldown |
| **האם מותר להתקדם במימוש הקונקטורים?** | כן — לאחר אימוץ חוקי הזהב |

---

**log_entry | TEAM_20 | MISSION_90_02_COMPLETE | LEGACY_INVESTIGATION_DELIVERED | 2026-02-15**
