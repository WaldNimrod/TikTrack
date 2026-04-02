---
id: TEAM_21_TO_TEAM_11_AOS_V3_GATE_1_PYTEST_REMEDIATION_REPORT_v1.0.0
historical_record: true
from: Team 21 (AOS Backend Implementation)
to: Team 11 (AOS Gateway)
cc: Team 51 (AOS QA), Team 61 (AOS DevOps)
date: 2026-03-28
type: REMEDIATION_REPORT — GATE_1 QA BLOCK (pytest)
domain: agents_os
branch: aos-v3
authority: TEAM_11_TO_TEAM_21_AOS_V3_GATE_1_QA_BLOCK_REMEDIATION_MANDATE_v1.0.0.md---

# Team 21 → Team 11 | תיקון BLOCK QA — pytest תחת `agents_os_v3/`

## תקציר

נוספה סוויטת **pytest** תחת [`agents_os_v3/tests/`](agents_os_v3/tests/) המכסה **Layer 0** (מודלים, קבועים, סכמת pause snapshot) ו-**Layer 1** (`repository.event_hash_blob`, `governance.artifact_index` עם mock, `StateMachineError`). הבדיקות **אינן דורשות PostgreSQL** — מתאימות ל-CI סטנדרטי עם `PYTHONPATH=.` בלבד.

## פקודת קבלה (AC מנדט)

```bash
cd <repo-root>
pip install -r agents_os_v3/requirements.txt
PYTHONPATH=. python3 -m pytest agents_os_v3/ -q
```

**תוצאה צפויה:** exit code **0**, **לא** `collected 0 items` (נכון ל-2026-03-28: **11 passed**).

## IR

| כלל | עמידה |
|-----|--------|
| IR-2 | ללא שינוי תחת `agents_os_v2/` |
| IR-3 | `FILE_INDEX.json` **1.0.9** — רישום כל קבצי `tests/` + עדכון `requirements.txt` (pytest) |

## קבצים חדשים / מעודכנים

| נתיב |
|------|
| `agents_os_v3/tests/__init__.py` |
| `agents_os_v3/tests/test_layer0_definitions.py` |
| `agents_os_v3/tests/test_layer1_repository.py` |
| `agents_os_v3/tests/test_layer1_governance.py` |
| `agents_os_v3/tests/test_layer1_state_errors.py` |
| `agents_os_v3/requirements.txt` — `pytest>=7.4.0` |
| `agents_os_v3/FILE_INDEX.json` — v1.0.9 |

## המשך (Team 51 / Team 11)

- **Team 51:** להריץ שלב 6 מחדש ולפרסם `TEAM_51_TO_TEAM_11_AOS_V3_GATE_1_QA_EVIDENCE_v1.0.1.md` (או עוקב) עם **PASS**.
- **Team 11:** עדכון מפת שלבים / GO לפי ראיות PASS.

---

**log_entry | TEAM_21 | AOS_V3_BUILD | GATE_1_PYTEST_REMEDIATION | 2026-03-28**
