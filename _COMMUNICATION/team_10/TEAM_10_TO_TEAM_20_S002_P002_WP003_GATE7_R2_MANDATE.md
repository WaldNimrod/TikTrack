# Team 10 → Team 20 | S002-P002-WP003 GATE_7 — Remediation Round 2 (Step 2)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_S002_P002_WP003_GATE7_R2_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 20 (Backend)  
**date:** 2026-03-10  
**status:** ON_HOLD — **הפעלה רק לאחר Team 60 R2 completion**  
**authority:** TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_ROUND2_MANDATE_v1.0.0  

---

## 0) Order

**התהליך: 60 → 20 → 30.** אתם **שלב 2**. המתן להשלמת Team 60 לפני התחלה.

---

## 1) Scope (per DETAILED_QA_FINDINGS)

| # | ממצא | פעולה |
|---|------|-------|
| **1.2** | רמזור אדום — price_source null | תיקון זרימת EOD/intraday — וידוא price_source נשמר ומוחזר; בדיקת _get_price_with_fallback |
| **1.3** | מטבע — הכל $ | _derive_currency + קישור Exchange; exchange_id מ-DB (אחרי Team 60) → COUNTRY_TO_CURRENCY |
| **1.5** | ticker_type שגוי | וידוא API מחזיר ticker_type נכון (ETF ל-SPY/QQQ) |
| **1.7** | טופס הוספה — מטבע, בורסה, ANAU.MI | API: שדות מטבע, exchange/suffix; POST /tickers תומך ב-symbol+exchange (ANAU.MI) |

---

## 2) Coordination

- **מאת Team 60:** קבלת מידע על exchange_id, ticker_type ב-DB; seed state.
- **ל Team 30:** לפני סיום — העברת חוזה API מעודכן (שדות, endpoints).

---

## 3) Deliverable

**נתיב:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_R2_COMPLETION.md`

עם השלמה → Team 10 מפעיל את Team 30.

---

## 4) SSOT

- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P002_WP003_GATE7_DETAILED_QA_FINDINGS_v1.0.0.md`
- Team 60 R2 completion (handoff)

---

**log_entry | TEAM_10 | WP003_G7_R2_MANDATE | TO_TEAM_20 | ON_HOLD_UNTIL_60 | 2026-03-11**
