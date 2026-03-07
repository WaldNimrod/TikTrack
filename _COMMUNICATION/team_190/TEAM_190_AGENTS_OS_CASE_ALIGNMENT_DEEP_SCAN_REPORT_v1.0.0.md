# TEAM_190_AGENTS_OS_CASE_ALIGNMENT_DEEP_SCAN_REPORT_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_190_AGENTS_OS_CASE_ALIGNMENT_DEEP_SCAN_REPORT  
**from:** Team 190 (Constitutional Architectural Validator)  
**to:** Nimrod (Chief Manager)  
**cc:** Team 00, Team 10, Team 60, Team 100, Team 170  
**date:** 2026-02-27  
**status:** SUBMITTED  
**scope:** Deep scan + detailed mapping for full alignment to `Agents_OS`

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 190 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Executive Summary

הסריקה מאשרת דריפט מבני מהותי בין `agents_os` (lowercase) לבין `Agents_OS` (uppercase), גם בנתיבי קבצים וגם ברפרנסים בקוד ובתיעוד.

נקודת סיכון מרכזית:
- ה-runtime (imports, pytest paths, root-detection) כתוב ברובו ל-`agents_os`.
- חלק מארטיפקטי execution הקריטיים tracked ב-`Agents_OS`.
- על Linux case-sensitive זה עלול לייצר כשלים לא דטרמיניסטיים.

---

## 2) Scan Method (Deterministic)

בוצעה סריקה case-sensitive בלבד (`rg -s`) על:
- `git ls-files` (מיפוי נתיבים tracked בפועל)
- תוכן קבצים בכל הרפו (למעט `.git`, `node_modules`, `archive`)
- רפרנסים runtime קריטיים: imports, pytest paths, root marker strings

ה-evidence הגולמי נשמר בקבצים ייעודיים (סעיף 5).

---

## 3) Key Findings (with Counts)

### 3.1 Tracked paths split (actual git index)

- tracked תחת `agents_os/`: **31**
- tracked תחת `Agents_OS/`: **20**

פירוק `agents_os/`:
- `validators`: 16
- `tests`: 8
- `orchestrator`: 2
- `llm_gate`: 2
- `runtime`: 1
- `docs-governance`: 1
- root `__init__.py`: 1

פירוק `Agents_OS/`:
- `docs-governance`: 12
- `validators/execution`: 3
- `tests/execution`: 3
- `README`: 1
- `AGENTS_OS_FOUNDATION`: 1

### 3.2 Content references split

- קבצים עם רפרנסים ל-`agents_os/`: **103**
- קבצים עם רפרנסים ל-`Agents_OS/`: **17**
- קבצים עם רפרנסי runtime lowercase (imports/pytest/root marker): **30**
- מופעי runtime lowercase עם file:line: **77**

### 3.3 Critical mismatch pattern

בפועל:
- imports ו-runtime tooling משתמשים ב-`agents_os`:
  - `agents_os/orchestrator/validation_runner.py`
  - `agents_os/validators/...`
  - `python3 -m pytest agents_os/tests/`
- במקביל, execution validators/tests tracked תחת:
  - `Agents_OS/validators/execution/...`
  - `Agents_OS/tests/execution/...`

זה מייצר coupling שביר מול מערכת קבצים case-sensitive.

---

## 4) Detailed Mapping for 100% Alignment to `Agents_OS`

### Layer A — Physical paths (must converge)

1. כל הנתיבים tracked תחת `agents_os/` (31 קבצים)  
   Evidence: `AGENTS_OS_CASE_ALIGNMENT_TRACKED_PATHS_LOWER_v1.0.0.txt`
2. כל הנתיבים tracked תחת `Agents_OS/` (20 קבצים)  
   Evidence: `AGENTS_OS_CASE_ALIGNMENT_TRACKED_PATHS_UPPER_v1.0.0.txt`

### Layer B — Runtime code references (must change together)

30 קבצים עם רפרנסי runtime lowercase (`from agents_os`, `pytest agents_os/tests`, `"agents_os"`):  
Evidence files:
- `AGENTS_OS_CASE_ALIGNMENT_RUNTIME_LOWER_REFERENCE_FILES_v1.0.0.txt`
- `AGENTS_OS_CASE_ALIGNMENT_RUNTIME_LOWER_REFERENCES_v1.0.0.txt` (עם line numbers)

### Layer C — Documentation/procedures/commands (must update to avoid operator drift)

103 קבצים עם `agents_os/` בתוכן, כולל מסמכי הפעלה, validation reports, activation prompts.  
Evidence: `AGENTS_OS_CASE_ALIGNMENT_REFERENCE_FILES_LOWER_PATH_v1.0.0.txt`

### Layer D — Existing uppercase references (keep/alignment anchor)

17 קבצים כבר מפנים ל-`Agents_OS/`.  
Evidence:
- `AGENTS_OS_CASE_ALIGNMENT_REFERENCE_FILES_UPPER_PATH_v1.0.0.txt`
- `AGENTS_OS_CASE_ALIGNMENT_UPPER_PATH_REFERENCES_WITH_LINES_v1.0.0.txt`

---

## 5) Evidence Package (paths)

- `_COMMUNICATION/team_190/evidence/AGENTS_OS_CASE_ALIGNMENT_TRACKED_PATHS_LOWER_v1.0.0.txt`
- `_COMMUNICATION/team_190/evidence/AGENTS_OS_CASE_ALIGNMENT_TRACKED_PATHS_UPPER_v1.0.0.txt`
- `_COMMUNICATION/team_190/evidence/AGENTS_OS_CASE_ALIGNMENT_REFERENCE_FILES_LOWER_PATH_v1.0.0.txt`
- `_COMMUNICATION/team_190/evidence/AGENTS_OS_CASE_ALIGNMENT_REFERENCE_FILES_UPPER_PATH_v1.0.0.txt`
- `_COMMUNICATION/team_190/evidence/AGENTS_OS_CASE_ALIGNMENT_RUNTIME_LOWER_REFERENCE_FILES_v1.0.0.txt`
- `_COMMUNICATION/team_190/evidence/AGENTS_OS_CASE_ALIGNMENT_RUNTIME_LOWER_REFERENCES_v1.0.0.txt`
- `_COMMUNICATION/team_190/evidence/AGENTS_OS_CASE_ALIGNMENT_UPPER_PATH_REFERENCES_WITH_LINES_v1.0.0.txt`

---

## 6) Team 190 Opinion / Recommendations / Impact

### Opinion
יישור מלא ל-`Agents_OS` אפשרי, אבל חייב להתבצע כמיגרציה אטומית אחת (paths + imports + tests + docs + CI guard), אחרת ייווצר מצב שבור בשערי הולידציה.

### Recommendations

1. להכריז canonical root יחיד: `Agents_OS/` (כפי שנדרש).
2. לבצע migration commit אחד קוהרנטי:
   - העברת כל `agents_os/*` ל-`Agents_OS/*`
   - החלפת imports/pytest/runtime strings ל-`Agents_OS`
   - סנכרון כל מסמכי ההפעלה והולידציה.
3. להוסיף guardrail CI קבוע:
   - fail אם קיים tracked path תחת `^agents_os/`
   - fail אם יש שימוש ב-`from agents_os` / `pytest agents_os/tests`.

### Impact

- קוד: שינוי רוחבי ב-package name (Python imports).
- תיעוד: שינוי רוחבי בפקודות ודוגמאות.
- CI: שינוי תנאי אכיפה כדי למנוע חזרה לדריפט.
- ללא rollout אטומי: סיכון גבוה לשבירה בלינוקס.

---

**log_entry | TEAM_190 | AGENTS_OS_CASE_ALIGNMENT_DEEP_SCAN | SUBMITTED_WITH_FULL_MAPPING | 2026-02-27**
