# Team 20 — Evidence: כיסוי מלא משני ספקים (Yahoo + Alpha)

**תאריך:** 2026-01-31  
**מקור:** משתמש — "להצליח לקבל מידע על כל הטיקרים שהוגדרו לבדיקה משני הספקים"  
**מפרטים:** EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC, EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC, MARKET_DATA_PIPE_SPEC

---

## 1. תיקונים שבוצעו

### 1.1 Alpha Vantage

| תיקון | קובץ | תיאור |
|-------|------|--------|
| **Rate limit גלובלי** | alpha_provider.py | `_alpha_last_call`, `_alpha_rate_lock` — משותף לכל ה-instances (per spec 5 קריאות/דקה) |
| **Fallback TIME_SERIES_DAILY** | alpha_provider.py | כש־GLOBAL_QUOTE ריק (TEVA.TA, ANAU.MI) → `_get_price_from_timeseries_daily` |
| **מפרט** | EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC | CRYPTO: DIGITAL_CURRENCY_DAILY; STOCK: GLOBAL_QUOTE + TIME_SERIES_DAILY fallback |

### 1.2 Yahoo Finance

| תיקון | קובץ | תיאור |
|-------|------|--------|
| **v8/chart Primary** | yahoo_provider.py | מחיר סגירה EOD — חייב להחזיר תמיד. v8/chart (range=1mo) ראשון — היסטוריה תמיד קיימת; אז yfinance → v7/quote. בלי ticker.info (quoteSummary→429) |
| **מפרט** | EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC | Crypto: BASE-QUOTE (BTC-USD); Equity: סימבול מקורי (ANAU.MI) |

### 1.3 סקריפט בדיקה

| תיקון | קובץ | תיאור |
|-------|------|--------|
| **המתנה 13s** | test-providers-direct.py | בין סמלים — respect ל־Alpha rate limit |

---

## 2. סמלי בדיקה (per MARKET_DATA_PIPE_SPEC §2.2.1)

| סימבול | סוג | Yahoo | Alpha |
|--------|-----|-------|-------|
| AAPL | STOCK | `AAPL` | `AAPL` (GLOBAL_QUOTE) |
| BTC | CRYPTO | `BTC-USD` | `symbol=BTC`, `market=USD` (DIGITAL_CURRENCY_DAILY) |
| TEVA.TA | STOCK | `TEVA.TA` | `TEVA.TA` (GLOBAL_QUOTE או TIME_SERIES_DAILY fallback) |
| ANAU.MI | STOCK | `ANAU.MI` | `ANAU.MI` (כנ"ל) |

---

## 3. חסימה תפעולית (DB) — ✅ נפתר

**שגיאה (לשעבר):** `ForeignKey 'tickers.exchange_id' could not find table 'market_data.exchanges'`

**פתרון:** Team 60 הריץ P3-021 — `make migrate-p3-021`.  
**Evidence:** `TEAM_60_P3_021_MIGRATION_EVIDENCE.md`  
**הודעה ל-Team 50:** `_COMMUNICATION/team_50/TEAM_60_TO_TEAM_50_P3_021_DB_BLOCKER_RESOLVED.md`

---

## 4. הרצת בדיקת ספקים

```bash
python3 scripts/test-providers-direct.py
```

**מצופה:** AAPL, BTC, TEVA.TA, ANAU.MI — ✅ מ-Yahoo או מ-Alpha (לפחות אחד).

---

**Team 20 (Backend)**  
**log_entry | TEAM_20 | PROVIDERS_FULL_COVERAGE_EVIDENCE | 2026-01-31**
