# הודעת תיקון — User Tickers: Crypto + בורסות | Team 30

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend)  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Corrective | סוג נכס (STOCK/CRYPTO), Market, בורסה/סיומת  
**מקור:** TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_GAPS_AND_CORRECTIVE_PLAN.md

---

## 1. רקע

ה-UI לא מאפשר בחירת market/currency לקריפטו; חסר **סוג נכס** ו**בורסה**. נדרש תיקון לפני אישור סופי.

---

## 2. משימות תיקון (חובה)

### 2.1 סוג נכס (STOCK / CRYPTO)
- **שדה חובה:** בחירה בין STOCK / CRYPTO.
- ברירת מחדל: STOCK (לטובת backward compatibility).
- רכיב UI: `<select>` או radio buttons — ערכים: `STOCK`, `CRYPTO`.

### 2.2 שדה Market (קריפטו בלבד)
- **מותנה:** מוצג רק כאשר סוג נכס = CRYPTO.
- **ברירת מחדל:** USD.
- **ערכים אפשריים:** USD, EUR (או לפי רשימה מ-Team 20 / SSOT).
- נדרש ל-Alpha: DIGITAL_CURRENCY_DAILY (symbol+market).

### 2.3 בורסה / סיומת (מניות / ETF)
- **שדה אופציונלי** לטיקרים מבורסות שאינן ברירת מחדל (NASDAQ/NYSE).
- **דוגמאות סיומת Yahoo:**
  - Milan: `.MI` → ANAU.MI
  - Tel Aviv: `.TA` → TEVA.TA
- **UI:** דרופדאון או טקסט — `exchange_id` / סיומת; **ליישר עם Team 20** (רשימת exchanges).

### 2.4 Payload
- POST `/me/tickers` חייב לכלול:
  - `ticker_type`: `"STOCK"` | `"CRYPTO"`
  - `symbol`: מחרוזת (דוגמה: `AAPL`, `BTC`, `ANAU`)
  - `market`: (אם CRYPTO) — `"USD"` | `"EUR"` וכו'
  - `exchange_id` או סיומת בורסה — לפי מה ש-Team 20 מגדיר ב-API.

### 2.5 יישור
- UI חייב ליישר עם **SSOT** ועם **Team 20** (endpoints, שדות, mapping).

---

## 3. מסמכים מחייבים

- `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`

---

## 4. קריטריון הצלחה

- [ ] משתמש יכול לבחור **CRYPTO** + **Market (USD)** ולהוסיף טיקר קריפטו **בלי 422**.
- [ ] משתמש יכול לבחור **בורסה/סיומת** (למשל Milan, TASE) ולהגיש טיקר — נתונים נטענים.
- [ ] Payload כולל `ticker_type` + `market` (לקריפטו) + `exchange_id`/סיומת (למניות אירופאיות/TASE).

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** MANDATORY — Corrective  
**log_entry | TEAM_10 | TO_TEAM_30_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE | 2026-02-14**
