# Team 50 — External Data Automated Testing — Evidence Log

**id:** TEAM_50_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG  
**date:** 2026-01-31  
**מקור:** TEAM_10_TO_TEAM_50_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE

---

## 1. סקריפטי הרצה

| הרצה | קובץ | פקודה |
|------|------|-------|
| **Nightly (Full)** | `scripts/run-nightly-external-data.sh` | `./scripts/run-nightly-external-data.sh` או `cd tests && npm run test:external-data-nightly` |
| **Smoke (PR/Commit)** | `scripts/run-smoke-external-data.sh` | `./scripts/run-smoke-external-data.sh` או `cd tests && npm run test:external-data-smoke` |

---

## 2. סוויטות

| סוויטה | קובץ | תוכן |
|--------|------|------|
| **A** | `tests/external_data_suite_a_contract_schema.py` | Contract & Schema — staleness enum, fixtures, REPLAY, DB precision |
| **B** | `tests/external_data_suite_b_cache_failover.py` | Cache-First + Failover — API exchange-rates, staleness, precision |
| **C** | `tests/external_data_suite_c_cadence.py` | Cadence — ticker_prices, ticker_prices_intraday tables |
| **D** | `tests/test_retention_cleanup_suite_d.py` | Retention — cleanup job, evidence JSON |
| **E** | `tests/external-data-suite-e-staleness-clock.e2e.test.js` | UI — staleness clock, tooltips (E1–E4) |

---

## 3. תנאים מוקדמים

| הרצה | דרישות |
|------|---------|
| **Smoke** | DB (`DATABASE_URL`), Backend (8082) |
| **Nightly** | DB, Backend (8082), Frontend (8080) — עבור סוויטה E |

---

## 4. תוצאות הרצה (2026-01-31)

### Smoke (A, B, D)
| סוויטה | סטטוס | הערות |
|--------|--------|-------|
| A (Contract & Schema) | ✅ PASS | staleness_enum, fx_contract, fixtures, REPLAY, DB |
| B (Cache-First + Failover) | ✅ PASS | 6/6 pytest — REPLAY mode |
| D (Retention & Cleanup) | ✅ PASS | TEAM_60_CLEANUP_EVIDENCE.json תקין |

**פקודה:** `bash scripts/run-smoke-external-data.sh`

### Nightly (A–E)
| סוויטה | סטטוס | הערות |
|--------|--------|-------|
| A | ✅ PASS | — |
| B | ✅ PASS | 6/6 pytest |
| C (Cadence & Status) | ✅ PASS | cadence_tables |
| D | ✅ PASS | — |
| E (UI Clock + Tooltip) | ✅ PASS | 5/5 — Login, E1–E4 |

**פקודה:** `bash scripts/run-nightly-external-data.sh`  
**דרישות:** Backend 8082, Frontend 8080 (סוויטה E)

---

**log_entry | TEAM_50 | EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG | 2026-01-31**
