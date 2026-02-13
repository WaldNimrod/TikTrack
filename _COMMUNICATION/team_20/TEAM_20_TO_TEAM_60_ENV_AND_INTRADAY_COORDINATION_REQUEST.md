# Team 20 → Team 60: בקשת תאום — ENV + Intraday Job

**id:** `TEAM_20_TO_TEAM_60_ENV_AND_INTRADAY_COORDINATION_REQUEST`  
**from:** Team 20 (Backend)  
**to:** Team 60 (DevOps & Platform)  
**date:** 2026-02-13  
**מקור:** TEAM_20_TO_TEAM_60_EXTERNAL_DATA_COORDINATION; MARKET_DATA_PIPE_SPEC §7.1, §8; TEAM_20_DUAL_PROVIDER_FULL_SCOPE_EVIDENCE

---

## 1. הקשר

בהתאם לתאום External Data ולעדכון Rate‑Limit & Scaling — נדרש תאום מדויק עם Team 60 בנושא:

1. **ALPHA_VANTAGE_API_KEY** — הגדרה בסביבת Cron
2. **Intraday Sync Job** — תזמון ותלויות (לאחר מסירת הסקריפט על ידי Team 20)
3. **אימות** — רשימת בדיקות להשלמת התאום

---

## 2. ALPHA_VANTAGE_API_KEY — מפרט מלא לתאום

### 2.1 מיקום וטעינה

| פריט | ערך |
|------|------|
| **קובץ** | `api/.env` |
| **משתנה** | `ALPHA_VANTAGE_API_KEY=<your_key>` |
| **קבלת Key** | https://www.alphavantage.co/support/#api-key (חינם — 5 קריאות/דקה) |

### 2.2 הרצת סקריפטים — אופן טעינה

הסקריפטים קוראים את `.env` באופן הבא:

1. **נתיב:** `{PROJECT_ROOT}/api/.env`
2. **סדר:** קודם קובץ → אם לא מצא, `os.getenv("ALPHA_VANTAGE_API_KEY")`
3. **CWD:** סקריפטים מונעים מ־`PROJECT_ROOT` — יש להריץ `make sync-eod`, `make sync-ticker-prices` (ובעתיד `make sync-intraday`) מתוך **שורש הפרויקט**.

```bash
# דוגמה — יש להריץ מהשורש:
cd /path/to/TikTrackAppV2-phoenix
make sync-eod
make sync-ticker-prices
```

### 2.3 דרישות Cron

| דרישה | פרטים |
|-------|--------|
| **CWD** | `PROJECT_ROOT` (שורש הפרויקט) |
| **Env בפרודקשן** | `ALPHA_VANTAGE_API_KEY` חייב להיות זמין ב־cron. אפשרויות: |
| | א) `source api/.env` או `set -a; . api/.env; set +a` ב־wrapper script לפני `make` |
| | ב) export ב־crontab: `ALPHA_VANTAGE_API_KEY=xxx` בשורת המשימה |
| | ג) קובץ `.env` בנתיב `api/.env` וה־Makefile/scripts טוענים אותו (נתיב יחסי ל-CWD) |
| **DATABASE_URL** | דרוש לסקריפטים — מוגדר באותו אופן (api/.env או env) |

### 2.4 תלות ב־Key לפי שירות

| שירות | דרישת Key | ללא Key |
|-------|------------|---------|
| **FX EOD** (`sync_exchange_rates_eod.py`) | **חובה** — Alpha Primary | fallback ל-Yahoo בלבד |
| **Ticker EOD** (`sync_ticker_prices_eod.py`) | **חובה** — Fallback אחרי Yahoo | Yahoo בלבד |
| **Intraday** (`sync_ticker_prices_intraday.py`) | **חובה** — Fallback אחרי Yahoo | Yahoo בלבד |

---

## 3. Intraday Sync Job — מפרט לתאום

### 3.1 סקריפט (Team 20 מספק)

| פריט | פרטים |
|------|--------|
| **סקריפט** | `scripts/sync_ticker_prices_intraday.py` |
| **Make target** | `make sync-intraday` |
| **פעולה** | רענון `market_data.ticker_prices_intraday` עבור Active tickers |
| **Providers** | Yahoo (Primary) → Alpha (Fallback) |
| **מקור טיקרים** | `market_data.tickers` (is_active=true, LIMIT=max_active_tickers) |

### 3.2 תזמון (Team 60 מממש)

| פריט | ערך |
|------|------|
| **מרווח** | מתוך System Settings: `INTRADAY_INTERVAL_MINUTES` (ברירת מחדל: 15) |
| **Cron דוגמה** | `*/15 * * * 1-5` — כל 15 דקות, ימים א'–ה' (בהתאם ל־INTRADAY_INTERVAL_MINUTES) |
| **אזור זמן** | UTC |
| **שעות מסחר** | אופציונלי: להגביל לשעות 14:30–21:00 UTC (פתיחת US) — לפי SSOT/Team 10 |

### 3.3 תלויות

- `market_data.tickers` — עם רשומות ו־`is_active = true`
- `market_data.ticker_prices_intraday` — טבלה קיימת (P3-016)
- `ALPHA_VANTAGE_API_KEY` — אופציונלי (Yahoo בלבד עובד)
- `DATABASE_URL` — חובה
- System Settings: `MAX_ACTIVE_TICKERS`, `INTRADAY_INTERVAL_MINUTES`, `PROVIDER_COOLDOWN_MINUTES` — env vars (api/.env.example)

### 3.4 Single-Flight + Cooldown

- **Single-Flight:** lock file `.sync_ticker_prices_intraday.lock` — מניעת הרצות מקבילות
- **Cooldown on 429:** כמו EOD — provider_cooldown.py, PROVIDER_COOLDOWN_MINUTES

---

## 4. סיכום פעולות Team 60

| סדר | פעולה | תנאי / הערות |
|-----|--------|--------------|
| 1 | **ודא ALPHA_VANTAGE_API_KEY ב־cron** | api/.env או export ב־crontab — כל job שרץ מהפרויקט חייב גישה |
| 2 | **ודא CWD = PROJECT_ROOT** | make targets רצים מהשורש |
| 3 | **ודא Ticker EOD ב־cron** | `5 22 * * 1-5` — `make sync-ticker-prices` |
| 4 | **הוסף Intraday Job** | לאחר מסירת `sync_ticker_prices_intraday.py` — `make sync-intraday`; תזמון לפי INTRADAY_INTERVAL_MINUTES |
| 5 | **עדכון TEAM_60_CRON_SCHEDULE.md** | הוספת Intraday לרשימת Jobs |

---

## 5. רשימת אימות (Checklist)

### 5.1 ENV

- [ ] `api/.env` קיים בסביבת פרודקשן (או env מועבר ל־cron)
- [ ] `ALPHA_VANTAGE_API_KEY` מוגדר
- [ ] `DATABASE_URL` מוגדר
- [ ] Cron tasks רצים מ־PROJECT_ROOT (CWD נכון)

### 5.2 Jobs

- [ ] FX EOD — `0 22 * * 1-5` — `make sync-eod`
- [ ] Ticker EOD — `5 22 * * 1-5` — `make sync-ticker-prices`
- [ ] Intraday — `*/15 * * * 1-5` (או לפי INTRADAY_INTERVAL_MINUTES) — `make sync-intraday`
- [ ] Cleanup — `30 22 * * 1-5` — `make cleanup-market-data`

### 5.3 תיעוד

- [ ] `documentation/05-REPORTS/artifacts/TEAM_60_CRON_SCHEDULE.md` — מעודכן עם Intraday

---

## 6. קבצים רלוונטיים

| קובץ | תיאור |
|------|--------|
| `documentation/05-REPORTS/artifacts/TEAM_20_ALPHA_VANTAGE_API_KEY_GUIDELINES.md` | הנחיות QA/סביבה |
| `api/.env.example` | תבנית env — ALPHA_VANTAGE_API_KEY מתועד |
| `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_EXTERNAL_DATA_COORDINATION.md` | תאום קודם |
| `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` | SSOT §7, §8 |
| `documentation/05-REPORTS/artifacts/TEAM_60_CRON_SCHEDULE.md` | Cron SSOT |

---

## 7. חזרה ל־Team 20

לאחר יישום — נא לעדכן ב־`_COMMUNICATION/team_60/`:
- הודעת סיום או רשימת סטטוס (מה הושלם, מה ממתין).

---

**log_entry | TEAM_20 | TO_TEAM_60 | ENV_AND_INTRADAY_COORDINATION_REQUEST | 2026-02-13**
