# הוראת תיקון מהשורש — User Tickers | Team 20

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend)  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Root-Cause Fixes (חובה לפני סגירה)  
**מקור:** TEAM_10_USER_TICKERS_FINAL_TEST_AND_ROOT_FIX_PLAN.md

---

## 1. תיקון Error Handling — 500 → 422

**ממצא:** POST טיקר מזויף (אין נתונים מספק) מחזיר **500**.  
**דרישה:** כשכל הספקים נכשלים / אין נתונים תקפים — להחזיר **422 Unprocessable Entity**, לא 500.

---

## 2. תיקון Bug — Alpha קריפטו (BTC) פרסור volume

**ממצא:**  
`invalid literal for int() with base 10: '352.20690897'`  
Alpha DIGITAL_CURRENCY_DAILY מחזיר **volume כ-float string**.

**תיקון:** לא לעשות `int(vol_val)` ישיר. להשתמש ב-`int(float(vol_val))` או ב-`Decimal` — לפי תקן הפרויקט.

**מיקום משוער:** `alpha_provider.py` (פרסור תשובת DIGITAL_CURRENCY_DAILY).

---

## 3. Alpha קריפטו — Endpoint נכון

- **לא** להשתמש ב-GLOBAL_QUOTE לקריפטו.
- **להשתמש ב-DIGITAL_CURRENCY_DAILY** עם:
  - `symbol=BTC` (או symbol מהמיפוי)
  - `market=USD` (או market מהמיפוי)

מקור: [Alpha Vantage documentation](https://www.alphavantage.co/documentation/).

---

## 4. פורמט provider_mapping_data (נעילה — אדריכלית)

**לנעול בשדה המיפוי:**

```json
{
  "yahoo_finance": { "symbol": "BTC-USD" },
  "alpha_vantage": { "symbol": "BTC", "market": "USD" }
}
```

- **Yahoo:** לשלוח `yahoo_finance.symbol` (למשל BTC-USD).
- **Alpha קריפטו:** לשלוח `alpha_vantage.symbol` + `alpha_vantage.market` (למשל BTC, USD).

אותה ישות טיקר עובדת מול שני הספקים בלי ניחושים.

---

## 5. Yahoo — קריפטו ובירור None

- **קריפטו:** לשלוח ל-Yahoo סימבול **BTC-USD** (לא BTC לבד). מקור: [Yahoo crypto](https://ca.finance.yahoo.com/crypto/).
- **Yahoo מחזיר None לכל הנבדקים** (כולל AAPL) — לבדוק: env, rate limit, תצורה, רשת.

---

## 6. סיכום חובה

| # | פעולה |
|---|--------|
| 1 | החזרת 422 (לא 500) כש-provider נכשל / טיקר מזויף |
| 2 | תיקון פרסור volume Alpha: `int(float(...))` או Decimal |
| 3 | Alpha קריפטו: DIGITAL_CURRENCY_DAILY עם symbol + market |
| 4 | מימוש provider_mapping_data בקריאות ל-Yahoo ו-Alpha |
| 5 | Yahoo קריפטו: symbol BTC-USD; בירור Yahoo None |

לאחר תיקונים — לדווח ל-Team 10; Team 50 יריץ בדיקות חוזרות.

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** MANDATORY
