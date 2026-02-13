# Team 60 → Team 20: סיום תאום ENV + Intraday

**id:** `TEAM_60_TO_TEAM_20_ENV_AND_INTRADAY_COORDINATION_COMPLETE`  
**from:** Team 60 (DevOps & Platform)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**מקור:** TEAM_20_TO_TEAM_60_ENV_AND_INTRADAY_COORDINATION_REQUEST

---

## 1. סיכום סטטוס

כל הפעולות שביקש Team 20 הושלמו.

---

## 2. Checklist §5 — סטטוס

### 2.1 ENV

| פריט | סטטוס |
|------|--------|
| api/.env בסביבה | סקריפטים קוראים מ־api/.env (נתיב יחסי ל־PROJECT_ROOT) |
| ALPHA_VANTAGE_API_KEY | מתועד ב־api/.env.example; טעינה דרך run_market_data_job.sh |
| DATABASE_URL | idem |
| CWD = PROJECT_ROOT | wrapper script + make targets רצים מהשורש |

### 2.2 Jobs

| Job | Cron | Make target | סטטוס |
|-----|------|-------------|--------|
| FX EOD | `0 22 * * 1-5` | `make sync-eod` | ✅ |
| Ticker EOD | `5 22 * * 1-5` | `make sync-ticker-prices` | ✅ |
| Intraday | `*/15 * * * 1-5` | `make sync-intraday` | ✅ |
| Cleanup | `30 22 * * 1-5` | `make cleanup-market-data` | ✅ |

### 2.3 תיעוד

| פריט | סטטוס |
|------|--------|
| TEAM_60_CRON_SCHEDULE.md | מעודכן עם Intraday + Cron wrapper |

---

## 3. תוצרים חדשים

### 3.1 Cron Wrapper
- **קובץ:** `scripts/run_market_data_job.sh`
- **תפקיד:** טוען `api/.env` ומריץ `make <target>` — מתאים ל־cron
- **שימוש:** `./scripts/run_market_data_job.sh sync-eod` וכו'

### 3.2 Intraday
- **סקריפט:** `scripts/sync_ticker_prices_intraday.py` (Team 20)
- **Make target:** `make sync-intraday` — מאומת, רץ בהצלחה

---

## 4. אימות

| בדיקה | תוצאה |
|--------|--------|
| `make sync-intraday` | Exit 0 — רץ; Yahoo/Alpha (fallback) |
| `make check-market-data-counts` | tickers: 5, exchange_rates: 5, exchange_rates_history: 5 |
| `./scripts/run_market_data_job.sh check-market-data-counts` | עובד — טעינת .env |

---

## 5. קבצים

| קובץ | תיאור |
|------|--------|
| scripts/run_market_data_job.sh | Cron wrapper — טעינת .env |
| scripts/sync_ticker_prices_intraday.py | Intraday (Team 20) |
| documentation/05-REPORTS/artifacts/TEAM_60_CRON_SCHEDULE.md | מעודכן — Intraday + Crontab דוגמה |

---

**log_entry | TEAM_60 | TO_TEAM_20 | ENV_AND_INTRADAY_COORDINATION_COMPLETE | 2026-02-13**
