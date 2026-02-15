# Team 50 → Team 10: User Tickers + Crypto + European Exchanges — פערים קריטיים

**From:** Team 50 (QA / Evidence)  
**To:** Team 10 (Gateway, Owner)  
**Date:** 2026-01-31  
**Status:** 🔴 **BLOCKING** — לא לסגירה עד סגירת פערים  
**Supersedes / Relates:** TEAM_90 Market Data Gaps, WP_20_09_FIELD_MAP_TICKERS_MAPPINGS

---

## 1. תמצית מנהלים

בוצעה בדיקה מול הקוד, SSOT ו‑QA. **פערים קריטיים** בנושא:
1. **Crypto** — הוספת טיקר BTC‑USD נכשלת (422); אין מיפוי ספקים, Alpha משתמש ב‑endpoints לא מתאימים לקריפטו.
2. **Provider Mapping** — `provider_mapping_data` מוגדר ב‑SSOT אך **לא ממומש בקוד**.
3. **European Exchanges** *(דרישה נוספת)* — תמיכה בבורסות אירופאיות (דוגמה: ANAU → ANAU.MI בורסת מילאנו); נדרש שדה/מיפוי לבורסה לכל טיקר.

---

## 2. ממצאים (Evidence)

### 2.1 מה עובד
- "הוספת טיקר חדש" עובדת למניות (AAPL).
- Live‑data check קיים לפני יצירת טיקר.

### 2.2 מה לא עובד (Crypto)
| בעיה | פרטים |
|------|--------|
| BTC‑USD → 422 | אין מיפוי ספקים, Alpha לא תומך ב‑CRYPTO |
| Provider Mapping | מוגדר ב‑SSOT, **לא בשימוש** בקוד |
| Alpha Endpoints | משתמש ב‑GLOBAL_QUOTE + TIME_SERIES_DAILY — **לא מתאימים לקריפטו** |
| UI | לא מאפשר לבחור market/currency לקריפטו (דרוש ל‑Alpha) |

### 2.3 European Exchanges (דרישה נוספת)
| דוגמה | דרישה | מצב נוכחי |
|-------|--------|-----------|
| ANAU | ANAU.MI = בורסת מילאנו | `market_data.exchanges` — אין Milan; `exchange_id` קיים ב‑tickers |
| סמל+בורסה | Yahoo: `ANAU.MI`, Alpha: בדיקה נדרשת | שדה `exchange_id` קיים; אין מיפוי provider ספציפי |

**שדות קיימים באפיונים/DB:**
- `market_data.tickers.exchange_id` — FK ל־`market_data.exchanges` ✅
- `market_data.tickers.metadata` (JSONB) — יכול להכיל `provider_mapping_data` ✅
- `market_data.exchanges` — Seed: NASDAQ, NYSE, LSE, TASE — **חסר Milan ו‑European** ❌

---

## 3. Root‑Cause (פערים מול SSOT)

| SSOT | מצב בקוד |
|------|----------|
| `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS` — `provider_mapping_data` | לא בשימוש ב־`user_tickers_service.py`, `alpha_provider.py` |
| Live data check | בודק לפי `symbol` בלבד — לא לפי `ticker_type` + mapping |
| Alpha לקריפטו | אין endpoint DIGITAL_CURRENCY_DAILY — משתמש ב‑GLOBAL_QUOTE |
| European Exchanges | `exchanges` seed חסר Milan; אין מסמך SSOT לסמלי בורסה (Yahoo: .MI וכו') |

---

## 4. פתרון מומלץ — משימות לפי צוותים

### Team 10 (Owner)
- [ ] לעדכן תוכנית עבודה + רשימת משימות מרכזית עם פרקי crypto + provider mapping + European exchanges.
- [ ] לעדכן SSOTים:
  - `MARKET_DATA_PIPE_SPEC` — פורמט `provider_mapping_data` עבור crypto + European tickers.
  - `MARKET_DATA_COVERAGE_MATRIX` — crypto כלול, European exchanges כלולים.
  - `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS` — דוגמאות mapping לקריפטו (BTC‑USD) + European (ANAU.MI).
  - `00_MASTER_INDEX` — הפניות למסמכים המעודכנים.
- [ ] להוציא הודעות הפעלה מתוקנות לצוותים 20/30/60/50.
- [ ] לנהל תהליך ולהחזיר לביקורת Team 90 עם Evidence מלא.

### Team 20 (Backend)
- [ ] **Provider Mapping:** שימוש ב־`provider_mapping_data` (מ־ticker metadata / payload) בעת Live data check ובכל fetch.
- [ ] **Alpha Crypto:** תמיכה ב‑DIGITAL_CURRENCY_DAILY (symbol+market) — **לא** GLOBAL_QUOTE לקריפטו.
- [ ] **Live data check:** אם `ticker_type=CRYPTO` → מיפוי ספקים; אם STOCK → להמשיך כרגיל.
- [ ] **European Exchanges:** הוספת Milan (ודומיו) ל־`market_data.exchanges`; שימוש ב‑`exchange_id` + metadata/provider_mapping ליצירת סמל provider (e.g. ANAU.MI).

### Team 30 (Frontend)
- [ ] הרחבת מודול הוספת טיקר: שדה סוג נכס (STOCK/CRYPTO); אם CRYPTO → שדה Market (ברירת מחדל USD).
- [ ] **European tickers:** שדה/בחירת בורסה (exchange) — אם רלוונטי ל‑symbol.
- [ ] Payload כולל `ticker_type` + `provider_mapping` / `exchange_id` — יישור עם SSOT ו‑Team 20.

### Team 60 (Jobs/Cron)
- [ ] Jobs לקריפטו → שימוש במיפוי ספקים (symbol+market).
- [ ] לוודא intraday/cron לא שוברים קריפטו ו‑European tickers.

### Team 50 (QA)
- [ ] בדיקת קריפטו: יצירת טיקר חדש BTC‑USD או ETH‑USD (לפי mapping); Live data check עובר; טיקר נכנס לרשימה.
- [ ] בדיקת European: ANAU.MI (או דומה) — טיקר נכנס, מחירים נטענים.
- [ ] Evidence מלא לאחר אישור.

---

## 5. קריטריוני הצלחה (חובה לפני סגירה)

1. ניתן להוסיף טיקר חדש **קריפטו** דרך UI בלי 422.
2. Live‑data check משתמש במיפוי ספקים (ולא ב‑symbol בלבד).
3. Alpha עובד בקריפטו דרך endpoint ייעודי (DIGITAL_CURRENCY_DAILY).
4. תמיכה ב‑European tickers (ANAU.MI) — בורסה ב‑DB, מיפוי provider.
5. QA מאשר: 2 מניות + 1 קריפטו (+ אופציונלי: 1 European).

---

## 6. מסמכים מחייבים (הפניה)

- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
- `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md`
- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`

---

## 7. דרישה מצוות 10

**לא להמשיך לסגירה** עד שהפערים לעיל נסגרו.  
לאחר עדכונים → להגיש מחדש לאישור Team 90 עם **Evidence מלא**.

---

*TEAM_50 | QA_EVIDENCE | USER_TICKERS_CRYPTO_EXCHANGE_GAPS | 2026-01-31*
