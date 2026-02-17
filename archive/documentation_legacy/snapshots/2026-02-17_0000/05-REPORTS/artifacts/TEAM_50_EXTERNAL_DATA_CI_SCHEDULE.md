# Team 50 — External Data — CI Schedule

**id:** TEAM_50_EXTERNAL_DATA_CI_SCHEDULE  
**date:** 2026-01-31  
**מקור:** TEAM_10_TO_TEAM_50_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE

---

## 1. לוח זמנים

| אירוע | הרצה | סוויטות | משך משוער |
|-------|------|----------|------------|
| **PR / Commit** | Smoke | A, B, D | ~1–2 דק' |
| **Nightly** | Full | A, B, C, D, E | ~3–5 דק' |

---

## 2. הגדרת CI (המלצה)

### Smoke (PR)
```yaml
- run: ./scripts/run-smoke-external-data.sh
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  # Requires: backend on 8082 (or start in CI)
```

### Nightly
```yaml
- run: ./scripts/run-nightly-external-data.sh
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  # Requires: backend 8082, frontend 8080
```

---

## 3. מיקום Evidence

| פריט | מיקום |
|------|-------|
| Evidence Log | `documentation/05-REPORTS/artifacts/TEAM_50_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG.md` |
| Cleanup Evidence | `documentation/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE.json` |
| לוח זמנים | `documentation/05-REPORTS/artifacts/TEAM_50_EXTERNAL_DATA_CI_SCHEDULE.md` |

---

**log_entry | TEAM_50 | EXTERNAL_DATA_CI_SCHEDULE | 2026-01-31**
