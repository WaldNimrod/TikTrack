# Team 50 → Team 10 | Price Reliability PHASE_2 — QA Report

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE2_QA_REPORT  
**from:** Team 50 (QA & Fidelity)  
**to:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-09  
**status:** **PASS**  
**phase:** PHASE_2  
**trigger:** TEAM_10_TO_TEAM_50_PRICE_RELIABILITY_PHASE2_QA_REQUEST  

---

## 1) Executive Summary

**status:** **PASS**

PHASE_2 QA אושר. כל 4 התרחישים במטריצה אומתו — UI source label, as-of timestamp, last close ו־no misleading stale מיושמים בהתאם למנדט.

---

## 2) Test Matrix Results

| # | Scenario | Expected | Evidence | Result |
|---|----------|----------|----------|--------|
| 1 | UI source label | Correct for INTRADAY_FALLBACK, EOD, EOD_STALE | `priceReliabilityLabels.js` SOURCE_LABELS: EOD→סגירה, EOD_STALE→סגירה (ישן), INTRADAY_FALLBACK→תוך־יומי | **PASS** |
| 2 | UI as-of timestamp | Visible for current source | `formatPriceAsOf(price_as_of_utc)` ב־tickersTableInit, userTickerTableInit — מתחת למחיר; במודל | **PASS** |
| 3 | last close | Visible, unchanged when current source is intraday | עמודת "סגירה"; `last_close_price` בעמודה נפרדת; API שומר last_close מ־EOD כשעובר ל־intraday | **PASS** |
| 4 | no misleading stale | User never sees stale value without stale indication | `EOD_STALE` → "סגירה (ישן)" + `price-source-stale` (warning color); שני הטבלאות | **PASS** |

---

## 3) Evidence (Code Verification)

### 3.1 Source Labels

**File:** `ui/src/utils/priceReliabilityLabels.js`

```javascript
const SOURCE_LABELS = {
  EOD: 'סגירה',
  EOD_STALE: 'סגירה (ישן)',
  INTRADAY_FALLBACK: 'תוך־יומי'
};
```

### 3.2 Table Implementation (Tickers + User Tickers)

| File | Implementation |
|------|----------------|
| `tickersTableInit.js` | `getPriceSourceLabel`, `formatPriceAsOf`; source cell; last-close cell; `price-source-stale` for EOD_STALE |
| `userTickerTableInit.js` | Same; modal `handleView` includes מקור, עודכן ב, סגירה |

### 3.3 Styling

**File:** `ui/src/styles/phoenix-components.css`

```css
.phoenix-table__cell.price-source-stale {
  color: var(--apple-text-warning, #b45309);
  font-weight: 500;
}
```

### 3.4 API Contract

**File:** `api/schemas/tickers.py` — `last_close_price`, `last_close_as_of_utc`  
**File:** `api/services/tickers_service.py` — `_get_price_with_fallback` returns `last_close_price`, `last_close_as_of_utc`; preserves when intraday overrides.

---

## 4) Scope Verified

- **Tickers table (ניהול טיקרים):** current_price, price_source, price_as_of_utc, last_close_price ✓  
- **User tickers table (הטיקרים שלי):** same + modal (מקור, עודכן ב, סגירה) ✓  

---

## 5) On PASS

**Next step:** Team 10 פותח PHASE_3 — מנדט ל־Team 60 (off-hours cadence).

---

**log_entry | TEAM_50 | PRICE_RELIABILITY_PHASE2_QA_REPORT | TO_TEAM_10 | PASS | 2026-03-09**
