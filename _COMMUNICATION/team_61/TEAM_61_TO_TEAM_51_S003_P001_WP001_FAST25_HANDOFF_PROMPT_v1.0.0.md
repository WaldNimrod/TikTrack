---
**project_domain:** AGENTS_OS
**id:** TEAM_61_TO_TEAM_51_S003_P001_WP001_FAST25_HANDOFF_PROMPT_v1.0.0
**from:** Team 61 (FAST_2 Executor)
**to:** Team 51 (FAST_2.5 QA — Agents_OS QA Agent)
**cc:** Team 00, Team 100
**date:** 2026-03-11
**status:** HANDOFF — EXECUTE FAST_2.5
**work_package_id:** S003-P001-WP001
**handoff_type:** FAST_2 → FAST_2.5 (מסלול מהיר)
---

# Handoff Prompt: S003-P001 WP001 — FAST_2.5 QA Execution

**Team 51, הנה הפרומט המפורט לביצוע FAST_2.5 QA.**

---

## §1 מי מעביר ומי מקבל

| מ | אל | שלב שהושלם | שלב להפעלה |
|---|---|---|---|
| Team 61 | Team 51 | FAST_2 (execution) | FAST_2.5 (QA) |

---

## §2 קונטקסט — S003-P001 Data Model Validator

**מה נבנה:**
- `agents_os_v2/validators/data_model.py` — DM-S-01..DM-S-08 (spec) + DM-E-01..DM-E-03 (migration)
- `agents_os_v2/tests/test_data_model_validator.py` — 25 tests
- שילוב ב-`gate_router.py` + `pipeline.py` — GATE_0, GATE_1, GATE_5

**תיקים שנגעו בהם:**
- `agents_os_v2/validators/data_model.py` (חדש)
- `agents_os_v2/tests/test_data_model_validator.py` (חדש)
- `agents_os_v2/orchestrator/gate_router.py` (שינוי)
- `agents_os_v2/validators/__init__.py` (שינוי)
- `agents_os_v2/orchestrator/pipeline.py` (שינוי)

---

## §3 רשימת בדיקות — FAST_2.5

### 3.1 pytest
```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
python3 -m pytest agents_os_v2/tests/ -v
```
**תוצאה נדרשת:** 87+ passed (כולל 25 tests ב-test_data_model_validator.py). 4 skipped מותר (API keys).

### 3.2 mypy
```bash
source api/venv/bin/activate
python3 -m mypy agents_os_v2/validators/data_model.py --ignore-missing-imports
```
**תוצאה נדרשת:** Success — 0 errors.

### 3.3 Domain isolation (V-30..V-33)
וודא ש-`data_model.py` **לא** מייבא מ:
- `api/`
- `ui/`
- `orchestrator/`
- `conversations/`

מותר: stdlib + `agents_os_v2.config` (REPO_ROOT בלבד).

### 3.4 Bandit
```bash
bandit -r agents_os_v2/validators/data_model.py -ll
```
**תוצאה נדרשת:** אין HIGH findings.

---

## §4 תוצר נדרש

**קובץ:** `_COMMUNICATION/team_51/TEAM_51_S003_P001_WP001_FAST25_QA_RESULT_v1.0.0.md`

**מבנה מוצע:**
```markdown
---
**project_domain:** AGENTS_OS
**id:** TEAM_51_S003_P001_WP001_FAST25_QA_RESULT_v1.0.0
**from:** Team 51
**to:** Team 00, Team 61, Team 100
**date:** [תאריך]
**status:** FAST_2.5_PASS / BLOCK_FOR_FIX
---

## תוצאות

| בדיקה | תוצאה |
|-------|--------|
| pytest | X passed, Y skipped |
| mypy | 0 errors |
| Domain isolation | PASS |
| Bandit | No HIGH |

## החלטה

FAST_2.5 PASS → Team 00 מודע ל-FAST_3 (Nimrod CLI demo).
BLOCK_FOR_FIX → [רשימת תיקונים]
```

---

## §5 מקורות

| מקור | path |
|------|------|
| FAST_2 Closeout | `_COMMUNICATION/team_61/TEAM_61_S003_P001_WP001_FAST2_EXECUTION_CLOSEOUT_v1.0.0.md` |
| Activation prompt | `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_61_S003_P001_WP001_FAST2_ACTIVATION_PROMPT_v1.0.0.md` |
| LOD400 | `_COMMUNICATION/team_00/TEAM_00_S003_P001_DATA_MODEL_VALIDATOR_LOD400_v1.0.0.md` |
| Addendum | `_COMMUNICATION/team_00/TEAM_00_S003_P001_DATA_MODEL_VALIDATOR_LOD400_ADDENDUM_v1.0.0.md` |
| Fast Track Protocol | `documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md` §6.2 |

---

## §6 לאחר FAST_2.5 PASS

Team 51 מודיע ל-Team 00. Nimrod מריץ FAST_3 (5-check CLI demo).
לאחר FAST_3 PASS → Team 170 מריץ FAST_4.

---

**log_entry | TEAM_61 | S003_P001_FAST25_HANDOFF | ISSUED | 2026-03-11**
