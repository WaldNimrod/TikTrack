# Team 50 → Team 10: עדכון — POST /me/tickers חסום (live data check)

**From:** Team 50 (QA & Fidelity)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-02-14  
**Subject:** דרישת תיקון נשלחה ל־Team 20

---

## 1. מה נבדק

User Tickers Crypto + Exchanges QA — סקריפט `run-user-tickers-qa-api.sh` (AAPL, BTC, TEVA.TA, ANAU.MI, fake).

## 2. מה נכשל

`POST /me/tickers?symbol=AAPL&ticker_type=STOCK` מחזיר 422:  
`"Provider could not fetch data for this symbol. Ticker not created."`

סיבה: `_live_data_check` (Yahoo → Alpha) נכשל — ככל הנראה API keys / תשתית Providers.

## 3. למי נשלחה דרישת תיקון

**Team 20 (Backend)** — `TEAM_50_TO_TEAM_20_FIX_REQUEST_LIVE_DATA_CHECK_POST_TICKERS.md`

כולל: שחזור, מיקום בקוד, סיבת כשל, תיקון נדרש, אימות.

## 4. סטטוס

E2E: ✅ כל 6 פריטים PASS.  
API: ⚠️ חלקי — חסום על POST לטיקרים חדשים עד תיקון Team 20.

---

**log_entry | TEAM_50 | TO_TEAM_10 | UPDATE_LIVE_DATA_CHECK_BLOCKING | 2026-02-14**
