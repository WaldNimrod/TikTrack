# Team 10 → Team 50 | S002-P002-WP003 — Phase 2 Runtime Assertions Mandate (B4)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_S002_P002_WP003_PHASE2_RUNTIME_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 50 (QA/FAV)  
**date:** 2026-03-11  
**status:** MANDATE_ACTIVE  
**gate_id:** GATE_3  
**sub_stage:** G3.7  
**authority:** ARCHITECT_GATE7_REVIEW_S002_P002_WP003_TEAM10_DOCS_v1.0.0 (B4)  
**trigger:** SPEC_RESPONSE §6 (GIN-006), after B2 (TASE fix) resolved

---

## 1) מטרה

יצירת `tests/auto-wp003-runtime.test.js` — Phase 2 runtime assertions.

---

## 2) Spec — 4 Assertions

| # | Assertion | תיאור |
|---|-----------|--------|
| 1 | price_source non-null | לאחר sync trigger: `price_source !== null` לטיקרים פעילים |
| 2 | TEVA.TA shekel range | לאחר sync: TEVA.TA `current_price < 200` |
| 3 | market_cap assertions | לאחר EOD: market_cap IS NOT NULL ל-ANAU.MI, BTC-USD, TEVA.TA |
| 4 | Actions menu stability | hover 200ms → menu visible; Escape closes |

---

## 3) תזמון

**לאחר** B2 (TASE agorot fix) completed — TEVA.TA בטווח שקלים.

---

## 4) Deliverable

**קובץ:** `tests/auto-wp003-runtime.test.js`

**נתיב דוח:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P002_WP003_PHASE2_RUNTIME_COMPLETION.md`

---

**log_entry | TEAM_10 | PHASE2_RUNTIME_MANDATE_B4 | TO_TEAM_50 | 2026-03-11**
