# Team 20 → Team 60: דרישה דחופה — ALPHA_VANTAGE_API_KEY

**From:** Team 20 (Backend)  
**To:** Team 60 (DevOps & Platform)  
**Date:** 2026-01-31  
**Subject:** P1 — חוסם User Tickers, FX EOD, Sync scripts  
**דרישה:** דחופה

---

## 1. הקשר

`ALPHA_VANTAGE_API_KEY` **חוסם** את המערכת במקומות הבאים:
- **User Tickers** — Live data check (POST /me/tickers) נכשל ללא מפתח
- **FX EOD** — sync_exchange_rates_eod
- **Sync scripts** — EOD, Intraday, History Backfill

Yahoo משמש Primary; Alpha — Fallback. ללא Alpha, הוספת טיקרים חדשים עלולה להחזיר 422.

---

## 2. משימות (Team 60)

| # | משימה | תוצר |
|---|--------|------|
| 1 | **וידוא `ALPHA_VANTAGE_API_KEY` ב־api/.env** (dev) | מפתח תקין; אימות: `grep ALPHA_VANTAGE_API_KEY api/.env` |
| 2 | **CI** | אם קיים pipeline — הוספת המפתח כ־secret / env var |
| 3 | **Cron** | `run_market_data_job.sh` טוען מ־api/.env — וידוא שהמפתח שם |
| 4 | **Production** | הגדרה מאובטחת (secrets manager / env) — לא ב־repo |

---

## 3. קבלת מפתח

**קישור:** https://www.alphavantage.co/support/#api-key  
מפתח חינם — 5 קריאות לדקה.

---

## 4. Bypass זמני (dev/QA בלבד)

כשהמפתח לא זמין — להשתמש ב־`SKIP_LIVE_DATA_CHECK=true`:

```bash
# סקריפט אוטומטי:
./scripts/ensure-skip-live-data-check.sh
```

או ידנית ב־api/.env:
```
SKIP_LIVE_DATA_CHECK=true
```

**חובה:** להסיר מ־Production. Dev/QA בלבד.

---

## 5. אימות

```bash
grep ALPHA_VANTAGE_API_KEY api/.env
```

תוצאה צפויה: שורת מפתח (לא ריק, לא בהערה).

---

## 6. דרישה — הפעלה מחדש

**לאחר עדכון api/.env — יש להפעיל מחדש את ה־Backend.**

```bash
# משימת Cursor: Restart Backend Server
# או:
./scripts/restart-backend.sh
```

---

**Status:** ⚠️ P1 — חוסם  
**log_entry | TEAM_20 | TO_TEAM_60 | ALPHA_VANTAGE_API_KEY_URGENT_DEMAND | 2026-01-31**
