# Team 60 → Team 10: External Data — Automated Testing Mandate (Suite D) — Complete

**from:** Team 60 (Infrastructure)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**re:** TEAM_10_TO_TEAM_60_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE

---

## 1. סיום מנדט Automated Testing (סוויטה D)

### 1.1 עדכון Job Evidence
- **קובץ:** `scripts/cleanup_market_data.py`
- **פלט JSON:** `TEAM_60_CLEANUP_EVIDENCE.json`
- **שדות:** `last_run_time`, `rows_pruned`, `rows_updated`, `intraday`, `daily`, `fx_history`

### 1.2 בדיקה אוטומטית
- **קובץ:** `tests/test_retention_cleanup_suite_d.py`
- **תיאור:** מריץ cleanup ובודק קיום Evidence תקין.
- **הרצה:** `make test-suite-d` או `python3 tests/test_retention_cleanup_suite_d.py`
- **אינטגרציה:** משולב ב־Smoke (PR) וב־Nightly (Full)

### 1.3 דיווח ל-Team 10
- הודעה זו — TEAM_60_TO_TEAM_10_AUTOMATED_TESTING_MANDATE_COMPLETE.md

### 1.4 Evidence location (לשימוש ב־CI / Team 50)
- **נתיב:** `05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE.json`  
  *(או `documentation/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE.json` לפי תצורת הסקריפט)*

---

**log_entry | TEAM_60 | AUTOMATED_TESTING_MANDATE_COMPLETE | 2026-02-13**
