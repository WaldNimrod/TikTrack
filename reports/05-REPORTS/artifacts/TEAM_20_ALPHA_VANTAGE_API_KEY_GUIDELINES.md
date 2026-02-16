# ALPHA_VANTAGE_API_KEY — הנחיות ל־QA וסביבה

**מקור:** TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE §6.1.5  
**תאריך:** 2026-01-31  
**SSOT למשתני סביבה:** `documentation/01-ARCHITECTURE/TT2_INFRASTRUCTURE_GUIDE.md`

---

## 1. שימוש

| שירות | דרישת Key |
|--------|------------|
| **User Tickers** (POST /me/tickers — live data check) | **חובה** כשגם Yahoo נכשל; ללא key → 422. Bypass: `SKIP_LIVE_DATA_CHECK=true` (dev/QA only) |
| **FX EOD Sync** (sync_exchange_rates_eod.py) | **חובה** — Alpha Primary; ללא key → fallback ל-Yahoo בלבד |
| **Ticker Prices EOD** (sync_ticker_prices_eod.py) | **חובה** — Fallback אחרי Yahoo; ללא key → Yahoo בלבד |
| **Cache-First / API** | אופציונלי — קריאות API קוראות מ-DB; fetch מספק רק ב-cache miss |

---

## 2. הגדרה

**קובץ:** `api/.env`  
**משתנה:** `ALPHA_VANTAGE_API_KEY=<your_key>`

**קבלת Key:** https://www.alphavantage.co/support/#api-key (חינם — 5 קריאות/דקה)

---

## 3. אופציונליות לבדיקות

- **בלי Key:** FX EOD משתמש ב-Yahoo בלבד; Ticker EOD משתמש ב-Yahoo בלבד.
- **QA:** ניתן להריץ בדיקות E2E עם Yahoo בלבד (בלי Alpha key).
- **פרודקשן:** מומלץ להגדיר key ל-FX EOD (Alpha Primary).

---

## 4. הרשאות / Secrets

- **לא** להכניס key ל-Git.
- `.env` ב-.gitignore.
- Team 60: הגדרת key ב-CI/cron לפי סביבה.

---

## 5. חלוקת אחריות

| צוות | אחריות |
|------|--------|
| **Team 20 (Backend)** | תיעוד הדרישות; הגדרת `api/.env.example`; קריאת המפתח מ־env בקוד |
| **Team 60 (DevOps)** | **שמירת המפתח בסביבה** — וידוא שה־key מוגדר ב־`api/.env` (dev), ב־CI, וב־production; ניהול secrets |
