# Team 10 → Team 190 | KB-017 Formatter — מנדט ולידציה

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_TO_TEAM_190_KB_017_VALIDATION_MANDATE_v1.0.0  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 190 (Constitutional Validation)  
**cc:** Team 60, Team 170  
**date:** 2026-03-13  
**status:** ACTIVE  
**scope:** KB-017 — ולידציה חוקתית לפני סגירת רג'יסטר  
**trigger:** לאחר דליברבל Team 60 עם verdict PASS

---

## 1) הגדרת משילות — תפקיד Team 190

**מקור:** `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`

| Field | Value |
|-------|-------|
| Team ID | 190 |
| Role | Constitutional Validation |
| Responsibility | GATE_0–GATE_2 constitutional integrity and validation authority — cross-domain |
| Authority | ולידציה חוקתית; אישור סגירת באגים ב־KNOWN_BUGS_REGISTER |

**תחום:** Team 190 הוא ה־validation intake authority לרג'יסטר Known Bugs. סגירת KB-017 מותנית ב־PASS מ־Team 190.

---

## 2) Mandatory Identity Header

| Field | Value |
|-------|-------|
| bug_id | KB-2026-03-03-19 (KB-017) |
| validation_type | POST-IMPLEMENTATION |
| input_deliverable | `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_KB_017_FORMATTER_COMPLETION_v1.0.0.md` |

---

## 3) קריטריוני ולידציה

| # | קריטריון | אופן בדיקה |
|---|-----------|-------------|
| 1 | Black מוכל ב־requirements-quality-tools | `grep black api/requirements-quality-tools.txt` |
| 2 | Prettier מוכל ב־ui/package.json | `grep prettier ui/package.json` |
| 3 | Pre-commit hooks ל־Black ו־Prettier | `grep -E "phoenix-black|phoenix-prettier" .pre-commit-config.yaml` |
| 4 | Black עובר על api/ | `black api/ --check` |
| 5 | Prettier עובר על ui/ | `cd ui && npx prettier --check .` |
| 6 | Unit tests עוברים | `pytest tests/unit/ -v` |
| 7 | Frontend build מצליח | `cd ui && npx vite build` |

---

## 4) פלט נדרש מ־Team 190

**נתיב:**  
`_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_KB_017_VALIDATION_RESULT_v1.0.0.md`

**תוכן חובה:**

| שדה | תוכן |
|-----|------|
| verdict | PASS / FAIL |
| checks_verified | רשימת הקריטריונים וסטטוס |
| remaining_issues | אם FAIL — רשימת בעיות |
| recommendation | CLOSE / BLOCK |

---

## 5) Closure path

- **PASS** → Team 10 מעדכן KNOWN_BUGS_REGISTER ל־CLOSED עבור KB-017
- **FAIL** → Team 10 מעביר ל־Team 60 ל remediation

---

**log_entry | TEAM_10 | TO_TEAM_190 | KB_017_VALIDATION_MANDATE | ISSUED | 2026-03-13**
