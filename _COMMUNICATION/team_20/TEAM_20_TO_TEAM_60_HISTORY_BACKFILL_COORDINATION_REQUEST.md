# Team 20 → Team 60: בקשת תאום — History Backfill Job

**id:** `TEAM_20_TO_TEAM_60_HISTORY_BACKFILL_COORDINATION_REQUEST`  
**from:** Team 20 (Backend)  
**to:** Team 60 (DevOps & Platform)  
**date:** 2026-02-14  
**מקור:** MARKET_DATA_COVERAGE_MATRIX; MARKET_DATA_PIPE_SPEC §2.4; MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC

---

## 1. הקשר

Indicators (ATR/MA/CCI) מחושבים מ־250 ימי מסחר OHLCV. EOD sync מוסיף שורה אחת ליום — טיקרים חדשים מתחילים עם 0 שורות ולכן אין תשתית ל־Indicators.

**פתרון:** סקריפט History Backfill — מזהה טיקרים עם < 200 שורות, מביא 250 ימים מה־Provider (Yahoo→Alpha), ושומר ל־`market_data.ticker_prices`.

---

## 2. סקריפט (Team 20 מספק)

| פריט | פרטים |
|------|--------|
| **סקריפט** | `scripts/sync_ticker_prices_history_backfill.py` |
| **Make target** | `make sync-history-backfill` |
| **פעולה** | מילוי 250 ימי היסטוריה לטיקרים עם < 200 שורות |
| **Providers** | Yahoo (Primary) → Alpha (Fallback) |
| **טבלה** | `market_data.ticker_prices` (אותה טבלה כמו EOD) |
| **תנאי** | רק טיקרים עם HAVING COUNT(ticker_prices) < 200 |
| **מגבלה** | 15 טיקרים לכל ריצה (Alpha 5/min) |

### 2.1 תכונות

- **Idempotent** — מדלג על תאריכים שכבר קיימים
- **Single-Flight** — lock file `.sync_ticker_prices_history_backfill.lock`
- **Cooldown on 429** — כמו EOD (provider_cooldown)
- **Partitions** — יוצר partitions לפי צורך (ensure_partition)
- **Provider fallback** — Yahoo → Alpha (אותו flow כמו EOD)

---

## 3. תזמון מומלץ (Team 60 מממש)

| פריט | ערך |
|------|------|
| **מועד** | יומית, **לפני** Ticker EOD — כדי שיש היסטוריה לפני Indicators |
| **Cron דוגמה** | `0 21 * * 1-5` — 21:00 UTC, ימים א'–ה' (שעה לפני EOD) |
| **או** | `55 21 * * 1-5` — 21:55 UTC (מיד לפני sync-ticker-prices ב־22:05) |
| **אזור זמן** | UTC |

**הגיון:** ריצה יומית מספקת. טיקרים חדשים מקבלים backfill ב־24 שעות. אין צורך בתדירות גבוהה.

---

## 4. תלויות

| תלות | סטטוס |
|------|--------|
| `market_data.tickers` | קיים |
| `market_data.ticker_prices` | קיים, מפורטסת |
| `ensure_ticker_prices_partitions` | פרטיציות 2025–2027 (קיים) |
| `ALPHA_VANTAGE_API_KEY` | חובה ל־Fallback (Yahoo לא תמיד מחזיר היסטוריה) |
| `DATABASE_URL` | חובה |
| `run_market_data_job.sh` | תומך — העברת `sync-history-backfill` |

---

## 5. סיכום פעולות Team 60

| סדר | פעולה | הערות |
|-----|--------|-------|
| 1 | **הוסף History Backfill ל־cron** | `make sync-history-backfill` או `./scripts/run_market_data_job.sh sync-history-backfill` |
| 2 | **תזמון** | יומית לפני EOD (למשל 21:55 או 0 21) |
| 3 | **עדכון TEAM_60_CRON_SCHEDULE.md** | הוספת History Backfill לרשימת Jobs |

---

## 6. רשימת אימות (Checklist)

### 6.1 Job

- [ ] History Backfill נוסף ל־cron
- [ ] תזמון: יומית (1–5), לפני/אחרי EOD
- [ ] `ALPHA_VANTAGE_API_KEY` זמין (אותו env כמו Jobs אחרים)

### 6.2 תיעוד

- [ ] `documentation/05-REPORTS/artifacts/TEAM_60_CRON_SCHEDULE.md` — מעודכן עם History Backfill

---

## 7. Crontab מעודכן (דוגמה)

```
0 21 * * 1-5 cd /path/to/TikTrackAppV2-phoenix && ./scripts/run_market_data_job.sh sync-history-backfill
0 22 * * 1-5 cd /path/to/TikTrackAppV2-phoenix && ./scripts/run_market_data_job.sh sync-eod
5 22 * * 1-5 cd /path/to/TikTrackAppV2-phoenix && ./scripts/run_market_data_job.sh sync-ticker-prices
*/15 * * * 1-5 cd /path/to/TikTrackAppV2-phoenix && ./scripts/run_market_data_job.sh sync-intraday
30 22 * * 1-5 cd /path/to/TikTrackAppV2-phoenix && ./scripts/run_market_data_job.sh cleanup-market-data
```

---

## 8. קבצים רלוונטיים

| קובץ | תיאור |
|------|--------|
| `scripts/sync_ticker_prices_history_backfill.py` | סקריפט backfill |
| `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md` | סקופ 250d |
| `documentation/01-ARCHITECTURE/MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md` | ATR/MA/CCI |
| `documentation/05-REPORTS/artifacts/TEAM_60_CRON_SCHEDULE.md` | Cron SSOT |
| `scripts/run_market_data_job.sh` | Cron wrapper |

---

## 9. חזרה ל־Team 20

לאחר יישום — נא לעדכן ב־`_COMMUNICATION/team_60/`:
- הודעת סיום או רשימת סטטוס (מה הושלם, מה ממתין).

---

**log_entry | TEAM_20 | TO_TEAM_60 | HISTORY_BACKFILL_COORDINATION_REQUEST | 2026-02-14**
