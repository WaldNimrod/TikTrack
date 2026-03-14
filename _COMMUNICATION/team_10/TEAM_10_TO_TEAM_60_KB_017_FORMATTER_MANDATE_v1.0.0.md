# Team 10 → Team 60 | KB-017 Code Formatter — מנדט Black/Prettier

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_TO_TEAM_60_KB_017_FORMATTER_MANDATE_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 60 (DevOps & Platform)  
**cc:** Team 20, Team 30, Team 170, Team 190  
**date:** 2026-03-13  
**status:** ACTION_REQUIRED  
**scope:** KB-017 — Code formatter policy not enforced (Black/Prettier)

---

## 1) הגדרת משילות — תפקיד Team 60

**מקור:** `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`

| Field | Value |
|-------|-------|
| Team ID | 60 |
| Role | DevOps & Platform |
| Responsibility | Infrastructure, runtimes, CI/CD, platform — all domains |
| Authority | יצירה ותחזוקת pipelines; הרצת סריקות איכות; תשתית quality tooling |

**מקור נוסף:** `ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0` §6, §7 — Team 60 מוגדר כ־owner ל־Pre-Commit Gate, CI/CD Pipeline, quality tooling configs.

**תחום KB-017:** הוספת Black (Python) ו־Prettier (JS/CSS) לתשתית האיכות ואכיפה ב־pre-commit — בתחום Team 60.

---

## 2) Mandatory Identity Header

| Field | Value |
|-------|-------|
| bug_id | KB-2026-03-03-19 (KB-017) |
| scope_id | CLOUD_AGENT_SCAN |
| severity | MEDIUM |
| remediation_mode | BATCHED |
| validation_authority | Team 190 (חובה לפני סגירה) |

---

## 3) משימה נדרשת

### 3.1 שלב 1 — הוספת כלים

| קובץ | שינוי |
|------|--------|
| `api/requirements-quality-tools.txt` | הוסף: `black>=24.0.0` |
| `ui/package.json` | הוסף ב־devDependencies: `"prettier": "^3.0.0"` |

### 3.2 שלב 2 — קונפיגורציה

| קובץ | תוכן | הערה |
|------|------|------|
| `api/pyproject.toml` או `api/.black` | `[tool.black]` `target-version = ['py312']` `line-length = 100` | אופציונלי — ברירת מחדל מקובלת |
| `ui/.prettierrc` | `{"semi": true, "singleQuote": true}` | אופציונלי — התאמה ל־ESLint |

### 3.3 שלב 3 — Pre-commit hooks

הוסף ל־`.pre-commit-config.yaml` (בתוך `repos`):

```yaml
      - id: phoenix-black
        name: "Black [BLOCKING on Python changes]"
        entry: bash -c "source api/venv/bin/activate 2>/dev/null || true; black api/ --check"
        language: system
        pass_filenames: false
        types: [python]
        stages: [pre-commit]

      - id: phoenix-prettier
        name: "Prettier [BLOCKING on JS/CSS changes]"
        entry: bash -c "cd ui && npx prettier --check ."
        language: system
        pass_filenames: false
        files: '^(ui/.*\.(jsx?|css|html|json))$'
        stages: [pre-commit]
```

### 3.4 שלב 4 — הרצת format ראשונית

1. `python3 -m black api/`
2. `cd ui && npx prettier --write "src/**/*.{js,jsx,css,html,json}"`
3. `python3 -m pytest tests/unit/ -v --tb=short` — כל הבדיקות עוברות
4. `cd ui && npx vite build` — build מצליח

---

## 4) דליברבל נדרש — החזרה ל־Team 10

**נתיב:**  
`_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_KB_017_FORMATTER_COMPLETION_v1.0.0.md`

**תוכן חובה:**

| שדה | תוכן |
|-----|------|
| bug_id | KB-2026-03-03-19 |
| action_taken | רשימת הפעולות שבוצעו |
| checks_run | pip install, black --check, prettier --check, pytest, vite build |
| checks_result | PASS / FAIL לכל בדיקה |
| files_changed | רשימת קבצים (או קיצור: "api/*.py, ui/src/**/*.{js,jsx,css}") |
| verdict | PASS / BLOCK |

---

## 5) חובת ולידציה — Team 190

**סגירת KB-017 מותנית ב־PASS מ־Team 190.**

לאחר דליברבל Team 60 עם verdict PASS — Team 10 יעביר ל־Team 190 למנדט ולידציה (`TEAM_10_TO_TEAM_190_KB_017_VALIDATION_MANDATE_v1.0.0`). רק לאחר Team 190 PASS — Team 10 יעדכן את KNOWN_BUGS_REGISTER ל־CLOSED.

---

**log_entry | TEAM_10 | TO_TEAM_60 | KB_017_FORMATTER_MANDATE | ISSUED | 2026-03-13**
