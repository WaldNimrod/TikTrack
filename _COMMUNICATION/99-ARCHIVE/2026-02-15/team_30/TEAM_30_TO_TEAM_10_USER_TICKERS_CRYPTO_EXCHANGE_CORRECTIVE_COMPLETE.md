# Team 30 → Team 10: User Tickers Crypto + Exchange Corrective — בוצע

**From:** Team 30 (Frontend)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Corrective | סוג נכס, Market, בורסה/סיומת — מימוש  
**מקור:** TEAM_10_TO_TEAM_30_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE.md

---

## 1. סטטוס

✅ **בוצע** — מימוש לפי הודעת התיקון מצוות 10.

---

## 2. שינויים שבוצעו

### 2.1 סוג נכס (STOCK / CRYPTO / ETF)
- **קובץ:** `ui/src/views/management/userTicker/userTickerAddForm.js`
- **שדה:** `<select id="userTickerAssetType">` — ערכים: STOCK (ברירת מחדל), CRYPTO, ETF.
- **Payload:** `ticker_type` נשלח ל־POST /me/tickers.

### 2.2 שדה Market (קריפטו בלבד)
- **מותנה:** מוצג רק כאשר סוג נכס = CRYPTO.
- **ערכים:** USD (ברירת מחדל), EUR.
- **Payload:** `market` נשלח כאשר `ticker_type=CRYPTO`.

### 2.3 בורסה / סיומת
- **שדה:** `<select id="userTickerExchange">` — ברירת מחדל, תל אביב (.TA), מילאנו (.MI), לונדון (.L).
- **לוגיקה:** סיומת מצטרפת לסמל (למשל ANAU + .MI → ANAU.MI).
- **מוסתר** כאשר סוג נכס = CRYPTO (market מטפל).

### 2.4 התאמה ל־API
- **POST /me/tickers** משתמש ב־**Query params** (לא JSON body).
- **sharedServices:** נוספה אפשרות `useQueryParams: true` — שולח פרמטרים ב־URL.
- **Payload:** `ticker_id` | `symbol`, `ticker_type`, `market` (אם CRYPTO).

---

## 3. קבצים שעודכנו

| קובץ | שינוי |
|------|--------|
| `ui/src/views/management/userTicker/userTickerAddForm.js` | הוספת שדות סוג נכס, Market, בורסה; לוגיקת הצגה; payload מלא |
| `ui/src/components/core/sharedServices.js` | `options.useQueryParams` — שליחת פרמטרים ב־URL במקום body |

---

## 4. קריטריוני הצלחה (מתוך המנדט)

- [ ] משתמש יכול לבחור **CRYPTO** + **Market (USD)** ולהוסיף טיקר קריפטו **בלי 422** — *תלוי ב‑Team 20 (Alpha DIGITAL_CURRENCY_DAILY, provider mapping)*.
- [x] משתמש יכול לבחור **בורסה/סיומת** (Milan, TASE, LSE) ולהגיש טיקר.
- [x] Payload כולל `ticker_type` + `market` (לקריפטו) + סיומת משולבת ב־symbol (למניות אירופאיות/TASE).

---

## 5. תלות בצוות 20

- **קריפטו 422:** Backend חייב ליישם provider mapping + Alpha DIGITAL_CURRENCY_DAILY — עד אז BTC‑USD עלול להישאר 422.
- **בורסות:** symbol+סיומת (ANAU.MI, TEVA.TA) נשלחים — Backend חייב לתמוך (Yahoo כבר מבין פורמט זה).

---

**Prepared by:** Team 30 (Frontend)  
**Status:** ✅ COMPLETE — ממתין לאישור Team 20 + QA  
**log_entry | TEAM_30 | USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE | 2026-02-14**
