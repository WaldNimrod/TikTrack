# Cloud Agent Quality Scan Report — Team 00 (Architecture)
**Date:** 2026-03-03  
**Source:** Cursor Cloud Agent — Full Codebase Quality Scan  
**Status:** ACTION REQUIRED

---

## 1. מה בוצע (Completed Actions)

| # | פעולה | קבצים | סטטוס |
|---|-------|-------|--------|
| 1 | ESLint config for frontend | `ui/.eslintrc.cjs` | ✅ Created & verified |
| 2 | mypy type checking config | `api/mypy.ini` | ✅ Created & verified |
| 3 | Unit tests — AuthService | `tests/unit/test_auth_service.py` (17 tests) | ✅ 17/17 PASS |
| 4 | Unit tests — TradingAccountService | `tests/unit/test_trading_accounts_service.py` (7 tests) | ✅ 7/7 PASS |
| 5 | Unit tests — CashFlowService | `tests/unit/test_cash_flows_service.py` (6 tests) | ✅ 6/6 PASS |
| 6 | Security scan — bandit | Application code scanned (excl. venv) | ✅ 0 High, 1 Medium (expected: 0.0.0.0 bind) |
| 7 | Dependency audit — pip-audit | 3 CVEs found | ⚠️ See Known Bugs |
| 8 | Dependency audit — npm audit | 6 vulnerabilities (3 moderate, 3 high) | ⚠️ See Known Bugs |

---

## 2. Known Bugs — נדרש תיקון דחוף

### 2.1 Schema Drift — DDL vs ORM vs Tests

| ID | תיאור | חומרה | קבצים מושפעים |
|----|-------|-------|--------------|
| KB-001 | DDL (`PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`) מכיל partial unique constraints בתחביר לא תקני (`CONSTRAINT ... WHERE`) שגורם לכשלון ביצירת טבלאות `tickers`, `user_api_keys` | **High** | `documentation/docs-system/02-SERVER/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` |
| KB-002 | טבלאות `user_refresh_tokens` ו-`revoked_tokens` חסרות לגמרי מה-DDL אבל נדרשות ע"י ORM (`api/models/tokens.py`) | **High** | DDL file + `api/models/tokens.py` |
| KB-003 | DDL משתמש בשם `brokers_fees` אבל migration שינה ל-`trading_account_fees` | **Medium** | DDL file + `scripts/migrations/rename_brokers_fees_to_trading_account_fees.sql` |
| KB-004 | Suite A test `db_exchange_rates` מצפה לעמודה `conversion_rate` אבל הטבלה מכילה `rate` | **Medium** | `tests/external_data_suite_a_contract_schema.py:80` |
| KB-005 | Suite A test `ticker_prices_precision` מצפה ל-`market_cap NUMERIC(20,8)` אבל migration `p3_019` שינה ל-`NUMERIC(24,4)` | **Medium** | `tests/external_data_suite_a_contract_schema.py:114` |

### 2.2 Type Safety Issues (mypy scan)

| ID | תיאור | חומרה | מיקום |
|----|-------|-------|-------|
| KB-006 | 131 type errors ב-33 קבצים. כולל: `Decimal` mixed with `float` in indicators, missing awaits in cache_first_service, `None` safety in identity schemas | **Medium** | `api/` — full report via `mypy api/ --config-file api/mypy.ini` |
| KB-007 | Missing await: `cache_first_service.py:57` — coroutine value not used | **High** | `api/integrations/market_data/cache_first_service.py:57` |

### 2.3 ESLint Findings

| ID | תיאור | חומרה | מיקום |
|----|-------|-------|-------|
| KB-008 | `ui/src/components/HomePage.jsx:456-457` — unescaped `"` entities in JSX | **Low** | `react/no-unescaped-entities` |
| KB-009 | `ui/scripts/visual-diff.js:260` — `await` outside async function (parse error) | **Medium** | Parsing error |

### 2.4 Dependency Vulnerabilities

| ID | Package | CVE | חומרה | תיקון |
|----|---------|-----|-------|-------|
| KB-010 | `ecdsa 0.19.1` | CVE-2024-23342 | **High** | Upgrade or replace |
| KB-011 | `pip 24.0` | CVE-2025-8869, CVE-2026-1703 | **Medium** | Upgrade to pip ≥ 26.0 |
| KB-012 | `minimatch` (npm) | GHSA-3ppc-4f35-3m26 + 2 more | **High** | `npm audit fix` |
| KB-013 | `rollup 4.x` (npm) | GHSA-mw96-cpmx-2vgc (path traversal) | **High** | `npm audit fix` |

### 2.5 Missing Infrastructure

| ID | תיאור | חומרה |
|----|-------|-------|
| KB-014 | ESLint config file לא היה קיים (נוצר ע"י Cloud Agent) — מומלץ לוודא שנכנס ל-main | **High** |
| KB-015 | אין CI/CD pipeline ל-lint/test/build על PRs | **Critical** |
| KB-016 | אין pre-commit hooks (Husky/pre-commit) | **High** |
| KB-017 | אין code formatting (Black/Prettier) — קוד לא אחיד | **Medium** |
| KB-018 | `structlog` מותקן ב-requirements.txt אבל לא בשימוש — כל ה-API משתמש ב-`logging` רגיל | **Low** |
| KB-019 | `market_data.system_settings` נגש ע"י raw SQL ב-`settings.py` — אין ORM model | **Medium** |
| KB-020 | 14 מתוך 18 services ב-backend עדיין ללא unit tests | **High** |
| KB-021 | Pydantic V2 deprecation warnings: 15 schemas משתמשים ב-`class Config` במקום `ConfigDict` | **Medium** |

---

## 3. פעולות נדרשות מצוות האדריכלות

1. **DDL Update (KB-001/002/003):** יש לעדכן את `PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` כך שיתאים למצב בפועל. להחליף inline CONSTRAINT WHERE ב-CREATE UNIQUE INDEX נפרד. להוסיף טבלאות `user_refresh_tokens` ו-`revoked_tokens`.

2. **CI/CD Pipeline (KB-015):** יש ליצור GitHub Actions workflow שירוץ על כל PR עם: `pytest tests/unit/ -v`, `vite build`, `bandit -r api/ --exclude api/venv -ll`.

3. **Test Suite A (KB-004/005):** יש לעדכן את הטסטים כך שיתאימו למיגרציות שבוצעו.

4. **Dependencies (KB-010/011/012/013):** יש לבדוק ולשדרג חבילות פגיעות.

5. **Pre-commit Hooks (KB-016):** יש להגדיר Husky או pre-commit hooks.

---

**Prepared by:** Cursor Cloud Agent  
**Branch:** `cursor/development-environment-setup-6742`  
**Commit:** Contains all new tooling files
