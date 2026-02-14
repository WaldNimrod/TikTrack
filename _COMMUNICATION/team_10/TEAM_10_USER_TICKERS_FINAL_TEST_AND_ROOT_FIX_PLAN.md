# User Tickers — דוח בדיקות אחרון + תיקון מהשורש

**From:** Team 10 (The Gateway)  
**To:** Team 90, Teams 20 / 30 / 60 / 50  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Final Test Report + Root-Cause Fix Plan  
**מקור:** דוח בדיקות אחרון, TEAM_50_USER_TICKERS_AND_PROVIDERS_SEPARATION_REPORT, הנחיות אדריכלית

---

## 1. דוח בדיקות אחרון — ניהול "הטיקרים שלי"

| פעולה | סטטוס |
|--------|--------|
| GET /me/tickers | ✅ עובד |
| POST (הוספת טיקר קיים) | ✅ עובד |
| POST (הוספת טיקר חדש AAPL) | ✅ עובד (201/409) |
| POST (טיקר מזויף) | ⚠️ **500 במקום 422** — חובה תיקון |
| POST (BTC, TEVA.TA, ANAU.MI) | ⚠️ 500 (בעיות בספקים) |
| DELETE | לא נבדק |

**מסקנה:** פונקציונליות בסיסית תקינה; **חובה לתקן 500 → 422** עבור טיקר מזויף (כשלון provider = 422 Unprocessable Entity, לא 500).

---

## 2. נתונים חיצוניים — ספקים (ממצאי בדיקה ישירה)

| Symbol | Type | Yahoo | Alpha | הערות |
|--------|------|-------|-------|-------|
| AAPL | STOCK | ❌ | ✅ | Alpha מחזיר מחיר; Yahoo None |
| BTC | CRYPTO | ❌ | ❌ | **Bug פרסור:** Alpha מחזיר volume כ-float, הקוד עושה `int()` → crash |
| TEVA.TA | STOCK | ❌ | ❌ | שניהם None |
| ANAU.MI | STOCK | ❌ | ❌ | שניהם None |
| ZZZZZZZFAKE999 | STOCK | ❌ | ❌ | כמצופה — אין נתונים |

**סיכום ספקים:**
- **Yahoo:** לא מחזיר נתונים לכל הנבדקים (לבדוק: env, rate limit, תצורה).
- **Alpha:** רק AAPL תקין; **BTC נכשל** — bug פרסור: Alpha מחזיר volume כ-float string, הקוד עושה `int()` → `invalid literal for int() with base 10: '352.20690897'`.

**קובץ Evidence:** `_COMMUNICATION/team_50/TEAM_50_USER_TICKERS_AND_PROVIDERS_SEPARATION_REPORT.md`

---

## 3. הנחיות אדריכלית — מימוש נכון לפי ספק (נעילה)

### 3.1 Yahoo Finance
- **קריפטו:** סימבול זוגי בפורמט BASE-QUOTE — **BTC-USD**, ETH-USD, SOL-USD (לא BTC לבד).
- עובדים עם Yahoo symbol כמו ב-`yfinance.Ticker(...)`.
- מקור: [yfinance Ticker](https://ranaroussi.github.io/yfinance/reference/api/yfinance.Ticker.html), [Yahoo crypto](https://ca.finance.yahoo.com/crypto/).

### 3.2 Alpha Vantage — קריפטו
- **לא** להשתמש ב-GLOBAL_QUOTE לקריפטו.
- **להשתמש ב-DIGITAL_CURRENCY_DAILY** (ובמידת צורך WEEKLY/MONTHLY) עם:
  - `symbol=BTC`
  - `market=USD`
- תוך-יומי (פרימיום): CRYPTO_INTRADAY עם symbol + market + interval.
- מקור: [Alpha Vantage documentation](https://www.alphavantage.co/documentation/).

### 3.3 פורמט provider_mapping_data (נעילה)

**לנעול בשדה המיפוי כך:**

```json
{
  "yahoo_finance": { "symbol": "BTC-USD" },
  "alpha_vantage": { "symbol": "BTC", "market": "USD" }
}
```

אותה ישות טיקר עובדת מול שני הספקים בלי ניחושים.

---

## 4. תיקונים מהשורש — לפי צוות

### 4.1 Team 20 (Backend) — חובה

| # | תיקון | פרטים |
|---|--------|--------|
| 1 | **500 → 422** | כשטיקר מזויף / provider נכשל — להחזיר **422 Unprocessable Entity**, לא 500. |
| 2 | **Alpha BTC — פרסור volume** | Alpha DIGITAL_CURRENCY_DAILY מחזיר volume עשרוני. **תיקון:** `int(float(vol_val))` או `Decimal` — **לא** `int(vol_val)` ישיר. |
| 3 | **Alpha קריפטו — endpoint** | להשתמש ב-**DIGITAL_CURRENCY_DAILY** עם `symbol` + `market`; **לא** GLOBAL_QUOTE לקריפטו. |
| 4 | **provider_mapping_data** | מימוש בפועל: קריאת `yahoo_finance.symbol` ו-`alpha_vantage.symbol` + `alpha_vantage.market` ממיפוי; לא symbol גולמי בלבד. |
| 5 | **Yahoo קריפטו** | לשלוח ל-Yahoo **BTC-USD** (לא BTC). |
| 6 | **Yahoo None לכל** | לבדוק תצורה/rate limit/env — מדוע Yahoo מחזיר None לכל הנבדקים. |

### 4.2 Team 30 (Frontend)
- לוודא שליחת `ticker_type` + `provider_mapping_data` / market כשמבקשים טיקר חדש קריפטו.
- טיפול בשגיאה: **422** — להציג הודעת "אין נתונים מספק" (לא 500).

### 4.3 Team 50 (QA)
- לאחר תיקוני 20: להריץ שוב **POST טיקר מזויף** — צפוי **422**.
- להריץ **POST BTC** (עם mapping נכון) — צפוי 201 או 422 רק אם באמת אין נתונים.
- לבדוק **DELETE** במפורש.
- Evidence ב-`documentation/05-REPORTS/artifacts/`.

### 4.4 Team 60
- אין שינוי נדרש בסבב זה מלבד תאימות ל-provider mapping אם יש jobs שמשתמשים בספקים.

---

## 5. סדר ביצוע מומלץ

1. **Team 20:** תיקון 500→422; תיקון פרסור volume (Alpha); Alpha DIGITAL_CURRENCY_DAILY לקריפטו; מימוש provider_mapping_data; Yahoo BTC-USD; בדיקת Yahoo None.
2. **Team 30:** (אם נדרש) יישור payload ו-422 handling.
3. **Team 50:** הרצת בדיקות חוזרות + DELETE; Evidence.
4. **Team 10:** עדכון SSOT (WP_20_09 / MARKET_DATA) עם פורמט המיפוי הנעול; כיוונון צוותים בהתאם.

---

## 6. מסמכים מחייבים

- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** ROOT-FIX PLAN — Awaiting Team 20 fixes then QA re-run  
**log_entry | TEAM_10 | USER_TICKERS_FINAL_TEST_ROOT_FIX | 2026-02-14**
