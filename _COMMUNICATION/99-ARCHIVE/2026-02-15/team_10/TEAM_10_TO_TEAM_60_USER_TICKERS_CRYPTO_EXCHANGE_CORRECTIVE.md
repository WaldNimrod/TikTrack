# Team 10 → Team 60: מנדט תיקון — User Tickers: Crypto + Provider Mapping

**From:** Team 10 (The Gateway)  
**To:** Team 60 (DevOps & Platform)  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Corrective | Jobs עם מיפוי ספקים, לא לשבור קריפטו  
**מקור:** TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_GAPS_AND_CORRECTIVE_PLAN §3.4

---

## 1. משימות

| # | משימה | תוצר / Evidence |
|---|--------|------------------|
| 1 | **Jobs לקריפטו** | אם קיימים jobs שמטפלים בטיקרים (EOD, Intraday, History Backfill) — לוודא ש־**מיפוי ספקים** (symbol+market) משמש בעת fetch. **תלות:** Team 20 מממש את הלוגיקה בסקריפטים; Team 60 מריץ — יש לוודא שהסקריפטים המעודכנים רצים ב־cron. |
| 2 | **לא לשבור קריפטו** | לוודא ש־intraday/cron **לא שוברים** טיקרי קריפטו — אין סינון/החרגה של `ticker_type=CRYPTO`; אין שינוי בתזמון או ב־env שימנע טעינת קריפטו. |

---

## 2. תיאום עם Team 20

- הלוגיקה של **provider_mapping_data** ו־**DIGITAL_CURRENCY_DAILY** — ב־Team 20 (סקריפטים, providers).
- Team 60: **מריץ** את הסקריפטים המעודכנים; **תיעוד** (CRON_SCHEDULE וכו') מפנה ל־SSOT ולתוכנית התיקון; **אין** שינוי שמחסיר/מבטל טיקרי קריפטו.

---

## 3. מסמכים מחייבים

- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`

---

## 4. Evidence

- עדכון TEAM_60_CRON_SCHEDULE (או תיעוד רלוונטי) — ציון ש־Jobs תואמים לתוכנית התיקון (crypto + provider mapping); אין החרגת קריפטו.
- דיווח ל־Team 10 על סיום.

---

**Status:** ⚠️ CORRECTIVE — חובה לפני סגירת User Tickers  
**log_entry | TEAM_10 | TO_TEAM_60 | USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE | 2026-02-14**
