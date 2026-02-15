# Team 20 → Team 10: השלמת שמירת מחירי טיקר EOD (Gate B Gaps)

**id:** `TEAM_20_TO_TEAM_10_GATE_B_TICKER_SYNC_COMPLETE`  
**from:** Team 20 (Backend)  
**to:** Team 10 (The Gateway), Team 50 (QA)  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAM_20_GATE_B_GAPS_AND_SYNC_MANDATE

---

## 1. תוצרים

| תוצר | נתיב | תיאור |
|------|------|--------|
| **סקריפט EOD** | `scripts/sync_ticker_prices_eod.py` | טעינה מ־Yahoo/Alpha ושמירה ל־market_data.ticker_prices |
| **Make target** | `make sync-ticker-prices` | הרצת הסנכרון |
| **cache_first persist** | `api/integrations/market_data/cache_first_service.py` | שמירה ל-DB בעת fetch מוצלח מספק |
| **Partition migration** | `scripts/migrations/ensure_ticker_prices_partitions.sql` | יצירת פרטיציות 2026 (Team 60) |

---

## 2. זרימה

1. **סקריפט EOD:** טוען tickers מ־market_data.tickers → Yahoo (Primary) → Alpha (Fallback) → INSERT ל־ticker_prices (מחיקת רשומה קיימת לאותו יום לפני הוספה).
2. **cache_first:** בעת Cache MISS, fetch מספק → `_persist_price_to_db()` → החזר למשתמש.

---

## 3. שימוש

```bash
make sync-ticker-prices
# או
python3 scripts/sync_ticker_prices_eod.py
```

**תלויות:** `market_data.tickers` עם רשומות; `market_cap` ב־ticker_prices (migration P3-013); פרטיציות לחדש הנוכחי (או הרצת `ensure_ticker_prices_partitions.sql`).

---

## 4. אימות

- טעינה → שמירה → קריאה (Positions API) → הצגה — נתיב מלא זמין.
- Team 50 יכולים להריץ אימות: `make sync-ticker-prices` + בדיקת API/UI.

---

## 5. Evidence

- `scripts/sync_ticker_prices_eod.py`
- `api/integrations/market_data/cache_first_service.py` — `_persist_price_to_db`
- `Makefile` — target `sync-ticker-prices`
- `scripts/migrations/ensure_ticker_prices_partitions.sql`

---

**log_entry | TEAM_20 | GATE_B_TICKER_SYNC | COMPLETE | 2026-02-13**
