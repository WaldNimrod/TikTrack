# אישור תיקון — User Tickers: Crypto + Provider Mapping | Team 20 → Team 10

**From:** Team 20 (Backend)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Corrective ACK | Crypto, provider_mapping_data, Alpha DIGITAL_CURRENCY_DAILY  
**מקור:** TEAM_10_TO_TEAM_20_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE.md

---

## 1. קבלה ויישום

קיבלנו את הודעת התיקון. יישמנו את המשימות הבאות:

---

## 2. משימות שבוצעו

### 2.1 מיפוי ספקים בפועל ✅
- **`provider_mapping_data`** בשימוש בבדיקת Live data ויצירת טיקר חדש.
- `_infer_provider_mapping()` בונה מיפוי מ-symbol + ticker_type + market כאשר לא מסופק.
- מיפוי נשמר ב-`ticker_metadata.provider_mapping_data` בטבלת `market_data.tickers`.

### 2.2 תמיכה בקריפטו ב-Alpha ✅
- נוסף `get_ticker_price_crypto(symbol, market)` ב-`alpha_provider.py`.
- משתמש ב-**DIGITAL_CURRENCY_DAILY** — **לא** GLOBAL_QUOTE לקריפטו.
- פורמט: `symbol=BTC`, `market=USD`.

### 2.3 Live data check ✅
- **ticker_type=CRYPTO** → מיפוי ספקים + market; Alpha קורא ל-`get_ticker_price_crypto`.
- **STOCK** → התנהגות קיימת (GLOBAL_QUOTE, TIME_SERIES_DAILY).

### 2.4 בורסות אירופאיות — ממתין
- Alpha תומך כבר ב-symbol+exchange suffix (למשל ANAU.MI, TSCO.LON).
- **שדה ייעודי לבורסה:** ממתין לרשימת seed ו-SSOT מ-Team 10.

### 2.5 בורסת תל אביב (TASE) — ממתין
- תמיכה ב-symbol+exchange; ממתין לרשימת seed עם דוגמאות TASE.

### 2.6 רשימת Seed — ממתין
- **ממתין לקבלת הרשימה** מ-Team 10 (exchanges, דוגמאות mapping).
- ליישם ברגע שתמסר.

---

## 3. שינויים טכניים

| קובץ | שינוי |
|------|-------|
| `api/integrations/market_data/providers/alpha_provider.py` | `get_ticker_price_crypto(symbol, market)` — DIGITAL_CURRENCY_DAILY |
| `api/services/user_tickers_service.py` | `_live_data_check` עם ticker_type, market, provider_mapping; `_infer_provider_mapping` |
| `api/routers/me_tickers.py` | פרמטר `market` ב-POST /me/tickers |

---

## 4. קריטריון הצלחה

- ✅ ניתן להוסיף טיקר קריפטו (BTC-USD, ETH-USD) עם `ticker_type=CRYPTO` — Live-data check משתמש במיפוי.
- ✅ Alpha משתמש ב-DIGITAL_CURRENCY_DAILY לקריפטו.
- ⏳ בורסות אירופה + TASE — ממתינים ל-seed.

---

## 5. בקשה

1. **רשימת seed** — יש למסור לצוות 20 רשימת ערכים לטבלת seed (exchanges, דוגמאות mapping).
2. **בורסות אירופאיות + TASE** — שדה ייעודי או SSOT מעודכן — לאחר קבלת רשימת seed.

---

**Prepared by:** Team 20 (Backend)  
**Status:** PARTIAL — Crypto + provider mapping implemented; awaiting seed from Team 10  
**log_entry | TEAM_20 | USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE_ACK | 2026-02-14**
