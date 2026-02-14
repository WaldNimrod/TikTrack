# Team 20 — Checklist לפני החזרה ל-QA (User Tickers)

**תאריך:** 2026-02-14  
**מקור:** TEAM_50_RERUN, ROOT_FIX

---

## 1. אופציות 500→422 (כיסוי מלא)

| שכבה | מנגנון | קובץ |
|------|--------|------|
| **Service** | try/except סביב _live_data_check → כל exception → live_ok=False → raise 422 | user_tickers_service.py:208-217 |
| **Router** | fallback: Exception עם "provider"/"could not fetch"/"invalid literal" → 422 | me_tickers.py:92-99 |

---

## 2. Alpha Volume (מניעת crash)

| מיקום | תיקון |
|-------|--------|
| get_ticker_price_crypto | int(float(vol_val)) + try/except |
| get_ticker_history_crypto | int(float(vol_val)) + try/except |
| get_ticker_history (STOCK) | int(float(vol_raw)) + try/except |

---

## 3. provider_mapping_data (פורמט נעול)

| פריט | סטטוס |
|------|--------|
| yahoo_finance, alpha_vantage | ✅ infer_provider_mapping |
| Backward compat (yahoo, alpha) | ✅ resolve_symbols_for_fetch |
| BTC → Yahoo BTC-USD, Alpha BTC+USD | ✅ |

---

## 4. Bypass (dev/QA)

| פריט | סטטוס |
|------|--------|
| SKIP_LIVE_DATA_CHECK | ✅ user_tickers_service |
| api/.env.example | ✅ מתועד |

---

## 5. תנאי להרצת QA

1. **DB** — PostgreSQL פעיל, migrations רצו
2. **Backend** — **הפעלה מחדש** לאחר עדכון קוד (חובה)
3. **אופציונלי:** ALPHA_VANTAGE_API_KEY או SKIP_LIVE_DATA_CHECK=true

---

## 6. הרצת QA

```bash
# 1. וידוא Backend מעודכן
# 2. הפעלה מחדש: python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8082

bash scripts/run-user-tickers-qa-api.sh
```

**מצופה:**
- POST (fake) → 422
- POST (AAPL) → 201 או 409
- POST (BTC) → 201 או 409 (אם Alpha מחזיר נתונים)
- POST (TEVA.TA, ANAU.MI) → 201/409 או 422 (תלוי בספקים)

---

**log_entry | TEAM_20 | USER_TICKERS_PRE_QA_CHECKLIST | 2026-02-14**
