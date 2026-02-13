# Team 60 → Team 10: External Data Automated Testing Mandate — Complete (Suite D)

**from:** Team 60 (Infrastructure)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מנדט:** TEAM_10_TO_TEAM_60_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE  
**הנחיה:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE — סוויטה D (Retention & Cleanup)

---

## 1. סיכום ביצוע

| # | משימה | תוצר / Evidence | סטטוס |
|---|--------|------------------|--------|
| 1 | עדכון Job Evidence | `scripts/cleanup_market_data.py` — פלט JSON ל־`TEAM_60_CLEANUP_EVIDENCE.json`; שדות: `last_run_time`, `rows_pruned`, `rows_updated`, `intraday`, `daily`, `fx_history` | ✅ |
| 2 | בדיקה אוטומטית (סוויטה D) | `tests/test_retention_cleanup_suite_d.py` — מריץ cleanup ובודק קיום Evidence תקין | ✅ |
| 3 | אינטגרציה ב-CI | משולב ב־Smoke (PR) וב־Nightly (Full) | ✅ |

---

## 2. הרצת הבדיקה

```bash
make test-suite-d
# או
python3 tests/test_retention_cleanup_suite_d.py
```

---

## 3. מיקום Evidence (ל-CI / Team 50)

- **קובץ Evidence:** `documentation/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE.json`

---

## 4. קבצים רלוונטיים

- `scripts/cleanup_market_data.py` — פלט JSON
- `tests/test_retention_cleanup_suite_d.py` — בדיקה אוטומטית

---

**log_entry | TEAM_60 | AUTOMATED_TESTING_MANDATE_COMPLETE | SUITE_D | 2026-02-13**
