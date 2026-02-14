# Team 20 → Team 10: אישור תיקוני Root Fix — User Tickers

**From:** Team 20 (Backend)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-02-14  
**מקור:** TEAM_10_TO_TEAM_20_USER_TICKERS_ROOT_FIX_DIRECTIVE

---

## 1. תיקונים שבוצעו

| # | תיקון | סטטוס |
|---|--------|--------|
| 1 | **500 → 422** כשטיקר מזויף / provider נכשל | ✅ try/except סביב _live_data_check — כל exception → 422 |
| 2 | **Alpha volume** — פרסור float string | ✅ `int(float(vol_val))` ב־get_ticker_price_crypto + get_ticker_history_crypto |
| 3 | **Alpha קריפטו** — DIGITAL_CURRENCY_DAILY | ✅ כבר יושם |
| 4 | **provider_mapping_data** — מימוש בפועל | ✅ פורמט נעול: `yahoo_finance`, `alpha_vantage`; תאימות לאחור ל־yahoo/alpha |
| 5 | **Yahoo קריפטו** — BTC-USD | ✅ כבר יושם ב־infer_provider_mapping |
| 6 | **Yahoo None** | 📋 בירור: env, rate limit — לא תיקון קוד; Team 50/60 יכולים לבדוק |

---

## 2. קבצים שעודכנו

| קובץ | שינוי |
|------|-------|
| `api/integrations/market_data/providers/alpha_provider.py` | volume: int(float(vol_val)); get_ticker_price_crypto + get_ticker_history_crypto |
| `api/integrations/market_data/provider_mapping_utils.py` | פורמט נעול yahoo_finance, alpha_vantage; backward compat |
| `api/services/user_tickers_service.py` | try/except סביב live check; resolve_symbols_for_fetch; lookup_sym |
| `scripts/test-providers-direct.py` | resolve_symbols_for_fetch |

---

## 3. פורמט provider_mapping_data (נעול)

```json
{
  "yahoo_finance": { "symbol": "BTC-USD" },
  "alpha_vantage": { "symbol": "BTC", "market": "USD" }
}
```

WP_20_09 מעודכן. תאימות לאחור: yahoo/alpha עדיין נתמכים.

---

## 4. המשך

- Team 50: הרצת בדיקות חוזרות — POST מזויף 422, POST BTC (ללא crash).
- Team 10: עדכון SSOT אם נדרש.

---

**log_entry | TEAM_20 | TO_TEAM_10 | USER_TICKERS_ROOT_FIX_ACK | 2026-02-14**
