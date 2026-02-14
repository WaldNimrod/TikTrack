# הודעת תיקון — User Tickers: Crypto + Provider Mapping + בורסות | Team 20

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend)  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Corrective | Crypto, provider_mapping_data, European & TASE  
**מקור:** TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_GAPS_AND_CORRECTIVE_PLAN.md

---

## 1. רקע

בדיקה מול קוד ו-SSOT זיהתה פערים: **קריפטו (BTC-USD) 422**, **provider_mapping_data** לא בשימוש, Alpha לא מתאים לקריפטו. נדרש תיקון לפני אישור סופי.

---

## 2. משימות תיקון (חובה)

### 2.1 מיפוי ספקים בפועל
- **שימוש ב-`provider_mapping_data`** בעת בדיקת Live data ובכל fetch (לא symbol בלבד).
- מקור: `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`.

### 2.2 תמיכה בקריפטו ב-Alpha
- **DIGITAL_CURRENCY_DAILY** (symbol+market) ל-EOD/History — **לא** GLOBAL_QUOTE לקריפטו.
- מקור: `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`.

### 2.3 Live data check
- אם **ticker_type=CRYPTO** → מיפוי ספקים + market/currency.
- אם **STOCK** → להמשיך כרגיל.
- להציג/לקבל פרמטר market/currency בהתאם ל-mapping.

### 2.4 בורסות אירופאיות
- תמיכה ב-**symbol + exchange suffix** (דוגמה: ANAU.MI — מילאנו).
- **שדה ייעודי** לכל טיקר לבורסה/סיומת; אם חסר באפיונים — לבדוק ולהוסיף.

### 2.5 בורסת תל אביב (TASE)
- להוסיף תמיכה; לאפשר סחירה.
- **לבדוק קבלת נתונים** לנכס דוגמה אמיתי מבורסה זו.

### 2.6 רשימת Seed
- **Team 10 ימסור** רשימת ערכים לטבלת seed (לאחר סריקה).
- ליישם את רשימת ה-seed כשתימסר.

---

## 3. מסמכים מחייבים

- `EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`
- `EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`
- `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`

---

## 4. קריטריון הצלחה

ניתן להוסיף טיקר חדש **קריפטו** (BTC-USD/ETH-USD) דרך UI **בלי 422**; Live-data check משתמש במיפוי ספקים.

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** MANDATORY — Corrective
