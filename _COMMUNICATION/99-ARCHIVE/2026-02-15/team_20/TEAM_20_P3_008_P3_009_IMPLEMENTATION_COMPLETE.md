# Team 20 → Team 10: P3-008, P3-009 — מימוש הושלם

**from:** Team 20 (Backend)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**משימות:** P3-008 (M2), P3-009 (M3)  
**מקור:** TEAM_10_TO_TEAM_20_EXTERNAL_DATA_M2_M3_MANDATE

---

## 1. תוצרים

| קובץ | תיאור |
|------|--------|
| `api/integrations/market_data/provider_interface.py` | ממשק אגנוסטי (ABC) — החלפת ספק ללא שינוי מנוע |
| `api/integrations/market_data/providers/yahoo_provider.py` | Yahoo — **User-Agent Rotation** (חובה) |
| `api/integrations/market_data/providers/alpha_provider.py` | Alpha — **RateLimitQueue 12.5s** (5 calls/min) |
| `api/integrations/market_data/cache_first_service.py` | Cache-First: DB → Primary → Fallback; Never block UI |
| `api/requirements.txt` | yfinance>=0.2.36 נוסף |

---

## 2. יישור ל-SSOT

| דרישה | מימוש |
|------|--------|
| **Cache-First** | תמיד בדיקת DB לפני API; HIT→return; MISS→Provider; שניהם נכשלו→stale+staleness=na |
| **FX** | Alpha → Yahoo |
| **Prices** | Yahoo → Alpha |
| **Yahoo Guardrail** | User-Agent Rotation — רוטציה בין 3 UA strings |
| **Alpha Guardrail** | RateLimitQueue 12.5s — asyncio.Lock + last_call |
| **Precision** | 20,8 — Decimal.quantize("0.00000001") |

---

## 3. שימוש (Team 60)

**סקריפט סנכרון EOD (דוגמה):**
```python
from api.integrations.market_data.cache_first_service import (
    get_exchange_rate_cache_first,
    get_ticker_price_cache_first,
)
# skip_fetch=False — מותר קריאה חיצונית (למשל cron)
# skip_fetch=True — DB בלבד (לבקשות API — אין קריאה חיצונית)
```

**חוזי:** `ExchangeRate`, `TickerPrice` — models קיימים. אין שינוי DDL.

---

## 4. תיאום Team 60

- **מסמך תאום:** מצופה מ־Team 60.
- **טבלת ticker_prices_intraday (P3-016):** Schema כשמוכן — נצרוך למימוש Intraday בהמשך.
- **Config:** `ALPHA_VANTAGE_API_KEY` — env (Team 60).

---

## 5. Evidence

- `provider_interface.py` — 3 dataclasses, 1 ABC
- `yahoo_provider.py` — _next_user_agent(), YahooProvider
- `alpha_provider.py` — _rate_limit(), AlphaProvider
- `cache_first_service.py` — get_exchange_rate_cache_first, get_ticker_price_cache_first

---

**הערה:** סגירה תקפה **רק** עם **Seal Message (SOP-013)** — Governance v2.102.

**log_entry | TEAM_20 | P3_008_P3_009 | IMPLEMENTATION_COMPLETE | 2026-02-13**
