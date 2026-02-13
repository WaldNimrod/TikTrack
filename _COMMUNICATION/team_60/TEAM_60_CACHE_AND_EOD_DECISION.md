# Team 60: החלטה — תשתית Cache ו-EOD (Post 1-002)

**id:** `TEAM_60_CACHE_AND_EOD_DECISION`  
**מקור:** TEAM_10_TO_TEAM_20_AND_60_STAGE1_NEXT_SERVER_STEP.md; MARKET_DATA_PIPE_SPEC §5  
**date:** 2026-02-13  
**סטטוס:** אישור מותנה (Spy) — נעילה לאחר עדכון SSOT ע״י Team 10

---

## 1. תשתית Cache — החלטה

**בחירה:** **DB as Cache** (ללא Redis בשלב זה)

| רמה | מימוש | תיאור |
|-----|--------|--------|
| **Cache / LocalStore** | `market_data.ticker_prices`, `market_data.exchange_rates`, `market_data.latest_ticker_prices` (MV) | טבלאות DB משמשות כמאגר נתונים — קריאה מהירה, אין חסימת UI |
| **Redis** | לא נדרש כרגע | ניתן להוסיף בשלב מאוחר אם יהיה צורך ב-cache in-memory |

**הצדקה:** לפי TT2_MARKET_DATA_RESILIENCE — Cache > EOD > LocalStore. הטבלאות והמטריאליזד ויו משמשים כ־Cache ו-LocalStore; Backend קורא מ-DB בלבד (לא חוסם UI).

---

## 2. סנכרון EOD — מימוש

| רכיב | מיקום | תיאור |
|------|--------|--------|
| **סקריפט Python** | `scripts/sync_exchange_rates_eod.py` | מושך שערים מ-API חיצוני ומעדכן `market_data.exchange_rates` |
| **Make target** | `make sync-eod` | הרצת סנכרון ידנית |
| **Cron** | `0 22 * * 1-5` (דוגמה) | הרצה אוטומטית — 22:00 ימים א'–ה' |

**חוזה:** Frankfurter API (חינם, ללא מפתח). **Scope מטבעות ראשוני:** USD, EUR, ILS בלבד — מכוון. הרחבה לפי ISO 4217 — עתידי.

**דיוק:** NUMERIC(20,8) — הסקריפט משתמש ב־`Decimal.quantize` (לא float).

---

## 3. תיאום Team 20

- **Cache:** Backend קורא מ־`market_data.exchange_rates` ו־`ticker_prices` — ללא שינוי.
- **EOD:** הסקריפט `sync_exchange_rates_eod.py` רץ עצמאית; אין צורך ב-Backend פעיל.
- **הרחבה:** Team 20 יכול להוסיף סנכרון ticker_prices או להחליף מקור שערים — במודול `scripts/sync_exchange_rates_eod.py`.

---

## 4. תלות — עדכון SSOT (Team 10)

נעילה מלאה מותנית בעדכון `MARKET_DATA_PIPE_SPEC.md` עם: DB‑as‑Cache, Cron+UTC, Frankfurter, Scope USD/EUR/ILS.  
ראה: `TEAM_60_TO_TEAM_10_CACHE_EOD_CONDITIONAL_APPROVAL_FIXES.md`

---

**log_entry | TEAM_60 | CACHE_EOD_DECISION | 2026-02-13**
