# Evidence: Team 50 Gate B Re-Run (ארטיפקטים)

**id:** `TEAM_50_GATE_B_RE_RUN_EVIDENCE`  
**date:** 2026-02-07  
**owner:** Team 50 (QA)  
**type:** QA Re-Run (Gate B) — Evidence Log  
**status:** Complete

---

## 1. Screenshot(s) Summary

| קובץ | תיאור |
|------|-------|
| `phase2-e2e-artifacts/D16_TradingAccounts_screenshot.png` | D16 Trading Accounts — לאחר login |
| `phase2-e2e-artifacts/D18_BrokersFees_screenshot.png` | D18 Brokers Fees |
| `phase2-e2e-artifacts/D21_CashFlows_screenshot.png` | D21 Cash Flows |

**נתיב מלא:**  
`documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/`

---

## 2. Console Snapshot

**מקור:** `phase2-e2e-artifacts/console_logs.json`

### סיכום
- **D16:** 3 SEVERE, 4 WARNING
- **D18:** 3 SEVERE, 4 WARNING  
- **D21:** 3 SEVERE, 4 WARNING

### שגיאות SEVERE (חוזרות)
1. `headerLoader.js`: "Phoenix Header Loader: Failed to load unified-header.html" — NotFoundError (insertBefore)
2. `favicon.ico` — 404 Not Found
3. `navigationHandler.js`: "Cannot use 'import.meta' outside a module"

### Warnings
- React Router Future Flag (v7_startTransition, v7_relativeSplatPath) — לא קריטי

**הערה:** השגיאות אינן קשורות ל-endpoint trading_accounts/summary.

---

## 3. Network Snapshot

**מקור:** `phase2-e2e-artifacts/network_logs.json`

### CRUD Tests (E2E)
| Test | API Calls | Table Rows |
|------|-----------|------------|
| CRUD_TradingAccounts | 0 | 0 |
| CRUD_BrokersFees | 0 | 0 |
| CRUD_CashFlows | 0 | 0 |

**הערה:** E2E ניווט ל-React routes — לא לדפי HTML הפיננסיים; לפיכך 0 API calls.

### Runtime (phase2-runtime.test.js)
| Endpoint | Status |
|----------|--------|
| GET /api/v1/trading_accounts/summary | **200 OK** |
| GET /api/v1/cash_flows/summary | 200 OK |
| GET /api/v1/brokers_fees/summary | 400 (params) |

---

## 4. Artifacts List

| קובץ | תיאור |
|------|-------|
| `phase2-e2e-artifacts/console_logs.json` | Console logs מ-E2E |
| `phase2-e2e-artifacts/network_logs.json` | Network/API calls |
| `phase2-e2e-artifacts/test_summary.json` | E2E test summary |
| `phase2-e2e-artifacts/errors.json` | Errors dump |
| `phase2-e2e-artifacts/D16_TradingAccounts_screenshot.png` | Screenshot D16 |
| `phase2-e2e-artifacts/D18_BrokersFees_screenshot.png` | Screenshot D18 |
| `phase2-e2e-artifacts/D21_CashFlows_screenshot.png` | Screenshot D21 |

---

## 5. Runtime Test Output (Excerpt)

```
✅ Passed: 12
❌ Failed: 0
⚠️  Warnings: 1

✓ D16 Summary API: /api/v1/trading_accounts/summary - Success (200)
```

---

**log_entry | [Team 50] | GATE_B | EVIDENCE_LOG | 2026-02-07**
