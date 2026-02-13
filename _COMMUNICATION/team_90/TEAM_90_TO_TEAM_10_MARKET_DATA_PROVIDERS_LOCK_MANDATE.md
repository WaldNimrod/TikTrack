# 🕵️ Team 90 → Team 10: Lock Market Data Providers (Stage‑1) — SSOT Update Mandate

**id:** `TEAM_90_TO_TEAM_10_MARKET_DATA_PROVIDERS_LOCK_MANDATE`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**context:** Stage‑1 data providers lock (Roadmap v2.1)  
**status:** 🔒 **MANDATE — SSOT UPDATE REQUIRED**

---

## 1) החלטות נעולות (Owner‑Approved)

**Market Data Providers (Stage‑1):**  
- **Yahoo + Alpha Vantage בלבד** (חיבורי Market Data בשלב זה).  
- **אין Frankfurter** — מוסר לחלוטין.  
- **IBKR הוא ברוקר בלבד בשלב זה** (ייבוא קבצים כעת, API בהמשך) — **לא** ספק מחירי שוק.

**FX (EOD):**  
- **EOD בלבד**.  
- **Primary: Alpha Vantage → Fallback: Yahoo**.  
- Scope מטבעות שלב‑1: **USD/EUR/ILS**.

**Cadence & Precision:**  
- **Prices** דורשים תדירות גבוהה יותר מ‑FX.  
- **Cadence ו‑Precision ינוהלו לפי דומיין** + **סטטוס טיקר** (System Settings).  
- **Fundamentals** – שלבים מתקדמים בלבד (לא Stage‑1).

---

## 2) מקורות אפיון קיימים (Legacy / Archive)
> מידע תכנוני קיים ומעמיק — יש להטמיע ב‑SSOT המתאים:

- **Provider Registry & Fallback Chain (Legacy ERD):**  
  `.../_COMMUNICATION/99-ARCHIVE/_Cursor_full_design_V1_final_PROJECT_PHOENIX/01-PLANNING/PHX_DB_SCHEMA_V2_ERD.md`

- **Ticker Vendor Symbols + Validation Strategy (Legacy Questions):**  
  `.../_COMMUNICATION/99-ARCHIVE/_Cursor_full_design_V1_final_PROJECT_PHOENIX/TEMPORARY/PHASE3_CRITICAL_UPDATE_SUMMARY.txt`

*הערה:* ב‑SSOT הנוכחי קיימת עדיין התייחסות ל‑Yahoo+IBKR בלבד — מחייב תיקון.

---

## 3) דרישות עדכון SSOT (חובה)

**3.1 FOREX_MARKET_SPEC.md**  
נתיב: `documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md`
- להסיר Frankfurter.  
- לציין ספקים: **Alpha (primary) → Yahoo (fallback)**.  
- Scope מטבעות Stage‑1: **USD/EUR/ILS**.  
- להבהיר EOD בלבד.

**3.2 MARKET_DATA_PIPE_SPEC.md**  
נתיב: `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`
- להצהיר **Provider Registry + Connector contract** (אין שינוי קוד בעת הוספת ספק).  
- ליישר ל‑**Yahoo + Alpha בלבד**.  
- להוסיף Cadence/Precision לפי Domain + Ticker Status (System Settings).  
- להוסיף Primary/Fallback order ל‑FX ול‑Prices.

**3.3 WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md**  
נתיב: `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
- `provider_mapping_data` חייב לשקף **Yahoo + Alpha** (ולא IBKR).

**3.4 (אם נדרש) SSOT חדש — Provider Registry**  
אם אין מקום מתאים בתוך MARKET_DATA_PIPE_SPEC → ליצור SSOT ייעודי (Registry + connector schema + priorities + health + fallback).

---

## 4) דרישות עדכון מימוש (Stage‑1)

- **scripts/sync_exchange_rates_eod.py**: הסרה של Frankfurter, מעבר ל‑Alpha primary → Yahoo fallback, Decimal/quantize.  
- **Config**: System Settings לניהול Cadence/Precision לפי domain + ticker status.  

---

## 5) Acceptance Criteria (לסגירה)

1. **SSOT מעודכן** ומכיל את כל ההחלטות בסעיף 1.  
2. **אין אזכור ל‑Frankfurter** במסמכי SSOT/Specs.  
3. `provider_mapping_data` תואם Yahoo + Alpha.  
4. **Registry / Connector model מוגדר** ב‑SSOT (כדי להבטיח הוספת ספק ללא שינוי קוד).  
5. Evidence log ב‑`05-REPORTS/artifacts/` כולל קישורים לכל העדכונים.

---

**log_entry | TEAM_90 | MARKET_DATA_PROVIDERS_LOCK_MANDATE | 2026-02-13**
