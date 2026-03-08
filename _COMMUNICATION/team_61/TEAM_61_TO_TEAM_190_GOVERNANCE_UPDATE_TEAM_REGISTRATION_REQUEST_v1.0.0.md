# TEAM_61_TO_TEAM_190_GOVERNANCE_UPDATE_TEAM_REGISTRATION_REQUEST_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** TEAM_61_TO_TEAM_190_TEAM_REGISTRATION_v1.0.0
**from:** Team 61 (Cloud Agent / DevOps Automation)
**to:** Team 190 (Constitutional Architectural Validator)
**cc:** Team 00 (Chief Architect), Team 100 (Development Architecture Authority)
**date:** 2026-03-04
**status:** ACTION_REQUIRED
**gate_id:** N/A
**work_package_id:** N/A

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | N/A |
| phase_owner | Team 61 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

בקשה להוספת Team 61 (Cloud Agent / DevOps Automation) למבנה הארגוני הרשמי של הפרויקט. Team 61 הוקם ע"י Team 00 (Chief Architect) בסשן עבודה ב-2026-03-03. נדרש עדכון תיעוד משילות להוספת הצוות בצורה תקינה ומלאה.

## 2) Context / Inputs

1. `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` — SSOT למיפוי צוותים
2. `.cursorrules` (repo root) — רשימת Squad IDs בסעיף NEW TEAM ONBOARDING
3. `documentation/docs-governance/01-FOUNDATIONS/03_IRON_RULES_AND_GOVERNANCE_CONSTITUTION.md`
4. `00_MASTER_INDEX.md`
5. סמכות הקמה: Team 00 (Chief Architect), session 2026-03-03

### הגדרת Team 61 המלאה

| Field | Value |
|---|---|
| **Team ID** | 61 |
| **Name** | Cloud Agent / DevOps Automation |
| **Platform** | Cursor Cloud Agent — סביבת VM מבודדת עם Docker, PostgreSQL, Git, Python, Node.js. פועל ברקע, ללא ממשק UI של Cursor IDE. גישה ל-Git push/pull, הרצת טסטים, build, וסריקות אבטחה. |
| **Role** | אוטומציה של תהליכי פיתוח: CI/CD pipelines, סריקות איכות קוד (bandit, mypy, ESLint, pip-audit), תשתית Agents_OS V2 (Orchestrator שמאטמט זרימת שערים), יצירת unit tests, ודוחות Known Bugs. |
| **Reports to** | Team 10 (Gateway) לתזמור משימות; Team 00 (Architect) לכיוון אסטרטגי |
| **Scope** | `agents_os_v2/` (Orchestrator code), `.github/workflows/` (CI/CD), `tests/unit/` (unit test infrastructure), quality tooling configs (`ui/.eslintrc.cjs`, `api/mypy.ini`), quality scan reports |
| **Authority** | ✔ יצירה ותחזוקת CI/CD pipelines; ✔ הרצת סריקות איכות (bandit, pip-audit, mypy, ESLint, npm audit); ✔ יצירת unit tests; ✔ בנייה ותחזוקת Agents_OS V2 Orchestrator; ✔ הפקת דוחות סריקה ו-Known Bugs |
| **Non-authority** | ✘ לא משנה production code (api/, ui/) ללא mandate מ-Team 10; ✘ לא כותב ל-documentation/ (Knowledge Promotion דרך Team 10/70); ✘ לא מאשר שערים (מייצר data, לא מחליט PASS/FAIL); ✘ לא מחליף סמכות Team 90 (validation) או Team 50 (QA) |
| **Communication folder** | `_COMMUNICATION/team_61/` |
| **Current Engine** | Cursor Cloud Agent (subscription) |

### הגדרת גבולות מול צוותים קיימים

| גבול | Team 60 (DevOps & Platform) | Team 61 (Cloud Agent / DevOps Automation) |
|---|---|---|
| **תחום** | Infrastructure ידנית — server scripts, Docker, migrations, Makefile | אוטומציה — CI/CD pipelines, quality scans, Agents_OS V2 |
| **סביבה** | Cursor Composer (IDE) | Cursor Cloud Agent (VM) |
| **דוגמאות** | `scripts/start-backend.sh`, `scripts/init-full-env.sh`, Makefile targets | `.github/workflows/ci.yml`, `agents_os_v2/`, `tests/unit/` |
| **מתי פועל** | כשמנדט מ-Team 10 דורש שינוי תשתית | אוטומטי (CI) + כש-Team 10/00 מבקש סריקה/בנייה |

| גבול | Team 90 (The Spy) | Team 61 (Cloud Agent / DevOps Automation) |
|---|---|---|
| **תחום** | Validation authority — מחליט PASS/FAIL | מייצר validation data — טסטים, סריקות, דוחות |
| **סמכות** | Gate owner (GATE_5, 6, 7, 8) | לא gate owner — מספק כלים ותשומות ל-Team 90 |
| **דוגמאות** | VALIDATION_RESPONSE, BLOCKING_REPORT | Unit test results, bandit output, mypy findings |

### עבודה שכבר בוצעה ע"י Team 61

| # | תוצר | נתיב (ב-branch `cursor/development-environment-setup-6742`) |
|---|---|---|
| 1 | CI/CD pipeline | `.github/workflows/ci.yml` |
| 2 | ESLint config | `ui/.eslintrc.cjs` |
| 3 | mypy config | `api/mypy.ini` |
| 4 | 30 unit tests | `tests/unit/test_auth_service.py`, `test_trading_accounts_service.py`, `test_cash_flows_service.py` |
| 5 | POC-1 Observer | `agents_os/observers/state_reader.py`, `agents_os_v2/observers/state_reader.py` |
| 6 | Agents_OS V2 (59 files) | `agents_os_v2/` — Orchestrator, engines, context, validators, conversations |
| 7 | Quality scan report | `_COMMUNICATION/team_00/CLOUD_AGENT_QUALITY_SCAN_REPORT_2026-03-03.md` |
| 8 | 21 Known Bugs | KB-001 through KB-021 in quality scan report |
| 9 | V2 Master Plan | `_COMMUNICATION/team_00/AGENTS_OS_V2_MASTER_PLAN_LOCKED_2026-03-03.md` |
| 10 | AGENTS.md | `AGENTS.md` (repo root) — Cloud development instructions |

## 3) Required actions

1. **הוספת Team 61 ל-TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md** — הוספת שורה לטבלת הצוותים בדיוק לפי ההגדרה בסעיף 2. הקפדה על כל השדות: ID, Name, Role, Scope, Authority, Non-authority, Reports to.

2. **עדכון .cursorrules** — הוספת Team 61 לרשימת Squad IDs בסעיף `§ NEW TEAM ONBOARDING (MANDATORY)`:
   ```
   - Team 61: Cloud Agent / DevOps Automation (Agents_OS V2, CI/CD, quality scans; Cursor Cloud Agent platform)
   ```

3. **הוספת `_COMMUNICATION/team_61/` ל-00_MASTER_INDEX.md** — אם נדרש לפי מבנה האינדקס.

4. **עדכון Iron Rules Constitution** — אם רלוונטי, הוספת Team 61 לסעיפים שמפרטים רשימת צוותים (כמו סעיף Knowledge Promotion Protocol שמפרט: "Teams 20, 30, 40, 50, 51, 60").

5. **ולידציה קנונית** — וידוא שהוספת Team 61 אינה:
   - יוצרת חפיפת scope עם צוות אחר (ראה גבולות בסעיף 2)
   - שוברת domain isolation
   - סותרת Iron Rules או Gate Protocol

## 4) Deliverables and paths

1. `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` — עדכון עם Team 61
2. `.cursorrules` — עדכון עם Team 61 ב-Squad ID list
3. `00_MASTER_INDEX.md` — עדכון אם נדרש
4. `_COMMUNICATION/team_190/TEAM_190_TEAM_61_REGISTRATION_VALIDATION_RESULT.md` — תוצאת ולידציה

## 5) Validation criteria (PASS/FAIL)

1. Team 61 מוגדר ב-TEAM_DEVELOPMENT_ROLE_MAPPING עם כל השדות (ID, Name, Role, Scope, Authority, Non-authority, Reports to)
2. אין חפיפת scope עם Team 60 או Team 90 (גבולות ברורים מוגדרים)
3. Team 61 מופיע ב-.cursorrules Squad ID list
4. `_COMMUNICATION/team_61/` מאונדקס
5. כל העדכונים בפורמט קנוני
6. אין שבירת Iron Rules או Gate Protocol

## 6) Response required

- Decision: PASS / CONDITIONAL_PASS / BLOCK
- רשימת מסמכים שעודכנו (paths מלאים)
- Blocking findings (אם יש, עם evidence-by-path)
- אישור שTeam 61 רשום קנונית בכל המסמכים הנדרשים

log_entry | TEAM_61 | TEAM_REGISTRATION_REQUEST | ACTION_REQUIRED | 2026-03-04
