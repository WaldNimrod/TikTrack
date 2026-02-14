# Team 60: Evidence — Archive/Retention לפי SSOT

**date:** 2026-02-14  
**מקור:** MARKET_DATA_PIPE_SPEC §7.3; MARKET_DATA_COVERAGE_MATRIX Rule 7

---

## 1. דרישות SSOT

| מקור | מדיניות |
|------|----------|
| **Intraday** | 30 יום DB → Archive → Delete; Archive files נמחקים אחרי שנה |
| **EOD/FX** | 250 יום DB → Archive; **אין מחיקת ארכיון** (נשמר לצמיתות) |

---

## 2. יישום

### 2.1 זרימת עבודה

| שלב | intraday | daily (ticker_prices) | fx_history |
|-----|----------|----------------------|------------|
| 1 | Export to CSV | Export to CSV | Export to CSV |
| 2 | DELETE from DB | DELETE from DB | DELETE from DB |
| 3 | Delete archive files > 365d | — | — |

**אין delete של EOD/FX לפני Archive** — תמיד export לפני delete.

### 2.2 מיקום ארכיון

```
archive/market_data/
├── intraday/
├── daily/
└── fx_history/
```

### 2.3 Evidence

| שדה | תיאור |
|-----|--------|
| `rows_archived` | סה"כ שורות שאוחסנו בארכיון |
| `rows_pruned` | סה"כ שורות שנמחקו מ-DB (אחרי Archive) |
| `archive_paths` | נתיבי קבצי CSV שנוצרו |

**קבצים:**
- `documentation/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE.json`
- `documentation/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE_LOG.md`

---

## 3. אימות

| בדיקה | תוצאה |
|--------|--------|
| `make cleanup-market-data` | Export → Delete; Evidence logged |
| Suite D | PASS — rows_archived, rows_pruned, archive_paths |

---

## 4. קבצים

| קובץ | תיאור |
|------|--------|
| `scripts/cleanup_market_data.py` | Archive לפני delete; Evidence |
| `archive/README.md` | תיאור מבנה ומדיניות |
| `tests/test_retention_cleanup_suite_d.py` | בודק rows_archived |

---

**log_entry | TEAM_60 | ARCHIVE_RETENTION_SSOT_EVIDENCE | 2026-02-14**
