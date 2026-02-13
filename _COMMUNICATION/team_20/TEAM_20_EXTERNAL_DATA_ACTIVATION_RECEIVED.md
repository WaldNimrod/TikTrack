# Team 20 → Team 10: הפעלת External Data — התקבל

**from:** Team 20 (Backend)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מקור:** `TEAM_10_TO_TEAM_20_EXTERNAL_DATA_ACTIVATION`, `TEAM_10_TO_TEAM_20_EXTERNAL_DATA_M2_M3_MANDATE`  
**סטטוס:** ✅ **התקבל — סדר עבודה מאומץ**

---

## 1. משימות מאומצות

| מזהה | משימה | SSOT |
|------|--------|------|
| **P3-008** | Provider Interface + Cache-First | MARKET_DATA_PIPE_SPEC §2.1, §2.3 |
| **P3-009** | Provider Guardrails | MARKET_DATA_PIPE_SPEC §2.2 |
| **P3-013** | Market Cap | MARKET_DATA_COVERAGE_MATRIX; PRECISION_POLICY_SSOT |
| **P3-014** | Indicators ATR/MA/CCI | MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC |
| **P3-015** | 250d Historical Daily | MARKET_DATA_COVERAGE_MATRIX; MARKET_DATA_PIPE_SPEC §4.1 |

---

## 2. סדר עבודה (כפי בהנחיה)

1. **קריאה** — EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC, EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC + MARKET_DATA_PIPE_SPEC §2, §4.
2. **M2 + M3** — P3-008, P3-009.
3. **P3-013, P3-014, P3-015** — לאחר M2+M3; תיאום DDL עם Team 60.

---

## 3. תלות

- **ticker_prices_intraday** — Team 60 (P3-016). נצרוך Schema כשמוכן.

---

## 4. סגירה

**רק** Seal Message (SOP-013) — Governance v2.102.

---

**log_entry | TEAM_20 | EXTERNAL_DATA_ACTIVATION_RECEIVED | 2026-02-13**
