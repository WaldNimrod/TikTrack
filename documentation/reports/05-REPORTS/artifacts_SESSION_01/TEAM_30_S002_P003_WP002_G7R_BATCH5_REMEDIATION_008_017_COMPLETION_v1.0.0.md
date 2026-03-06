# TEAM_30 → TEAM_10 | S002-P003-WP002 G7R Batch 5 Remediation (BF-G7-008, BF-G7-017)

**project_domain:** TIKTRACK  
**id:** TEAM_30_S002_P003_WP002_G7R_BATCH5_REMEDIATION_008_017_COMPLETION_v1.0.0  
**from:** Team 30 (Frontend)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 20, Team 50, Team 90  
**date:** 2026-03-04  
**status:** COMPLETE  
**gate_id:** GATE_4 re-run blocker  
**work_package_id:** S002-P003-WP002  
**in_response_to:** TEAM_10 S002_P003_WP002_G7R_V13_BATCH5_REMEDIATION_008_017_v1.0.0

---

## 1) Overall status

| Field | Value |
|-------|-------|
| **overall_status** | PASS |

---

## 2) Per-BF changes and verification

### BF-G7-008 (Invalid symbol — error message visible)

| Item | Value |
|------|-------|
| **File** | `ui/src/views/management/tickers/tickersForm.js` |
| **Elements** | `#tickerFormValidationSummary`, `#tickerSymbolError` |
| **Selectors (E2E)** | `[data-testid="ticker-form-validation-summary"]`, `[data-testid="ticker-symbol-error"]` |
| **role/aria** | `role="alert"`, `aria-live="polite"` on validation summary; `role="alert"` on symbol error |
| **Message source** | `String(error?.message ?? error?.detail ?? 'שגיאה בשמירה').trim()` |

**Behavior:**
- On 422/400 from backend, the catch block sets the error in both `#tickerSymbolError` and `#tickerFormValidationSummary`.
- Message is not cleared before user sees it; persists until next interaction.
- No async validation race; UI does not hide the message prematurely.

**E2E update** | `tests/g7-26bf-deep-e2e.test.js`:
- Uses `#tickerFormValidationSummary, [data-testid="ticker-form-validation-summary"]` and `#tickerSymbolError, [data-testid="ticker-symbol-error"]`.
- Asserts combined error text from summary, symbol error, and modal content; passes if any non-empty error is shown.

---

### BF-G7-017 (Linked entity required — submit blocked)

| Item | Value |
|------|-------|
| **File** | `ui/src/views/data/alerts/alertsForm.js` |
| **Element** | `#alertFormValidationSummary` |
| **Selector (E2E)** | `#alertFormValidationSummary`, `[data-testid="alert-form-validation-summary"]` |
| **role/aria** | `role="alert"`, `aria-live="polite"` |
| **Message** | `"יש לבחור ישות מקושרת."` |

**Behavior:**
- When `target_type` is not `datetime` and `target_id`/`ticker_id` is empty, form blocks submit.
- Inline validation message shown in `#alertFormValidationSummary` instead of a replacement modal.
- Form stays open; user can fix selection without losing data.

**E2E update** | `tests/g7-26bf-deep-e2e.test.js`:
- Checks `#alertFormValidationSummary, [data-testid="alert-form-validation-summary"]` first, then modal content as fallback.
- Assertion: `(summaryText || modalText).includes('יש לבחור ישות מקושרת')`.

---

## 3) Changes made

| File | Change |
|------|--------|
| `ui/src/views/management/tickers/tickersForm.js` | Added `data-testid="ticker-form-validation-summary"` to summary; `role="alert"` + `data-testid="ticker-symbol-error"` to symbol error. |
| `ui/src/views/data/alerts/alertsForm.js` | Added `#alertFormValidationSummary` (role="alert", data-testid="alert-form-validation-summary"); moved BF-G7-017 and condition validation from modal to inline summary; API errors in catch use summary instead of modal. |
| `tests/g7-26bf-deep-e2e.test.js` | BF-G7-008: added symbol error element check, combined error text assertion. BF-G7-017: added validation summary selector, assert on summary or modal text. |

---

## 4) Response contract (Backend / Team 20)

UI expects:
- `error.message ?? error.detail` (or equivalent backend field) for display.
- Same format for validation summary and symbol error.

---

**log_entry | TEAM_30 | G7R_BATCH5_REMEDIATION_008_017 | S002_P003_WP002 | PASS | 2026-03-04**
