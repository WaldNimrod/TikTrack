# Recurring Quality Processes — Cloud Agent Proposal
**Date:** 2026-03-03  
**Source:** Cursor Cloud Agent  
**Target:** Team 00 (Architecture) + Team 10 (Gateway)

---

## הצעת תהליכים קבועים לשמירה על סטנדרט איכות

### תהליך 1: Pre-Commit Quality Gate (כל commit)

**מטרה:** למנוע כניסת קוד שבור ל-repository  
**הפעלה:** אוטומטית לפני כל commit  
**כלי:** Husky + lint-staged (או pre-commit framework)

```bash
# Backend
python3 -m pytest tests/unit/ -v --tb=short
bandit -r api/ --exclude api/venv -ll

# Frontend
cd ui && ./node_modules/.bin/eslint . --ext js,jsx --report-unused-disable-directives
cd ui && npx vite build
```

**הגדרה מומלצת ב-`package.json` (root):**
```json
{
  "scripts": {
    "precommit": "npm run lint:backend && npm run lint:frontend && npm run test:unit",
    "lint:backend": "cd api && source venv/bin/activate && bandit -r . --exclude venv -ll",
    "lint:frontend": "cd ui && ./node_modules/.bin/eslint . --ext js,jsx",
    "test:unit": "cd api && source venv/bin/activate && python3 -m pytest ../tests/unit/ -v --tb=short"
  }
}
```

---

### תהליך 2: CI/CD Pipeline (כל PR)

**מטרה:** לוודא שכל PR עובר בדיקות מלאות לפני merge  
**הפעלה:** GitHub Actions על כל push/PR  
**קובץ:** `.github/workflows/ci.yml`

```yaml
name: CI Quality Gate
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: |
          cd api && python3 -m venv venv && source venv/bin/activate
          pip install -r requirements.txt -q
          pip install bandit pip-audit mypy -q
      - name: Unit Tests
        run: |
          source api/venv/bin/activate
          python3 -m pytest tests/unit/ -v
      - name: Suite B (Cache/Failover)
        run: |
          source api/venv/bin/activate
          python3 -m pytest tests/test_external_data_cache_failover_pytest.py -v
      - name: Security Scan
        run: |
          source api/venv/bin/activate
          bandit -r api/ --exclude api/venv -ll
      - name: Dependency Audit
        run: |
          source api/venv/bin/activate
          pip-audit --format columns || true

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: cd ui && npm install
      - name: ESLint
        run: cd ui && ./node_modules/.bin/eslint . --ext js,jsx --report-unused-disable-directives || true
      - name: Build
        run: cd ui && npx vite build
      - name: npm audit
        run: cd ui && npm audit || true
```

---

### תהליך 3: סריקה שבועית (Weekly Scan)

**מטרה:** לזהות regression, תלויות פגיעות חדשות, schema drift  
**הפעלה:** Cloud Agent session שבועית  
**תדירות:** כל יום ראשון

| בדיקה | פקודה | מה בודק |
|-------|-------|---------|
| Unit tests | `python3 -m pytest tests/unit/ -v` | 30 tests — regression |
| Suite A | `python3 tests/external_data_suite_a_contract_schema.py` | Contract/schema drift |
| Suite B | `python3 -m pytest tests/test_external_data_cache_failover_pytest.py -v` | Cache/failover |
| Suite D | `python3 tests/test_retention_cleanup_suite_d.py` | Retention/cleanup |
| mypy | `mypy api/ --config-file api/mypy.ini` | Type safety regression |
| bandit | `bandit -r api/ --exclude api/venv -ll` | Security |
| pip-audit | `pip-audit` | Python CVEs |
| npm audit | `cd ui && npm audit` | Node CVEs |
| ESLint | `cd ui && ./node_modules/.bin/eslint . --ext js,jsx` | Frontend quality |
| Vite build | `cd ui && npx vite build` | Build integrity |

**Output:** דוח ב-`_COMMUNICATION/team_00/` עם ממצאים חדשים.

---

### תהליך 4: סריקת באגים חוצת שכבות (Cross-Layer Bug Scan)

**מטרה:** לאתר באגים שחוצים שכבות — Backend/Frontend/DB  
**הפעלה:** Cloud Agent session לפי דרישה  
**טריגר:** לפני כל release, אחרי sprint גדול, או לפי בקשה

| שכבה | בדיקה |
|------|-------|
| DB ↔ ORM | השוואת `information_schema.columns` מול SQLAlchemy models |
| ORM ↔ Schema | בדיקת Pydantic schemas מול model fields |
| Schema ↔ API | בדיקת OpenAPI spec מול routers |
| API ↔ Frontend | בדיקת API calls בקוד JS מול endpoints |
| Frontend ↔ Routes | בדיקת `routes.json` מול HTML files |

---

### תהליך 5: Dependency Health Monitor

**מטרה:** שמירה על תלויות מעודכנות ובטוחות  
**הפעלה:** חודשית  
**כלים:**

```bash
# Python
pip-audit --format columns
pip list --outdated

# Node
cd ui && npm audit
cd ui && npm outdated
cd tests && npm audit
```

---

## סיכום — לוח זמנים מומלץ

| תהליך | תדירות | אוטומציה |
|-------|--------|---------|
| Pre-Commit Gate | כל commit | Husky / pre-commit hooks |
| CI/CD Pipeline | כל PR | GitHub Actions |
| Weekly Scan | שבועי | Cloud Agent session |
| Cross-Layer Scan | לפי דרישה | Cloud Agent session |
| Dependency Health | חודשי | Cloud Agent session / GitHub Dependabot |

---

**Prepared by:** Cursor Cloud Agent  
**Date:** 2026-03-03
