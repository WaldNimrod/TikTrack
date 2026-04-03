---
id: TEAM_11_TO_TEAM_21_AOS_V3_GATE_1_QA_BLOCK_REMEDIATION_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 21 (AOS Backend Implementation)
cc: Team 51 (AOS QA), Team 61 (AOS DevOps), Team 100 (Chief Architect)
date: 2026-03-28
type: MANDATE — GATE_1 שלב 6 BLOCK remediation (pytest Layer 0+1)
domain: agents_os
branch: aos-v3
authority: TEAM_51_TO_TEAM_11_AOS_V3_GATE_1_QA_EVIDENCE_v1.0.0.md + TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md §5 + §6 + §11 + TEAM_11_TO_TEAM_21_AOS_V3_BUILD_ACTIVATION_v1.0.1.md
trigger: QA BLOCK — `collected 0 items` תחת `agents_os_v3/`---

# Team 11 → Team 21 | מנדט — תיקון BLOCK QA (GATE_1)

## הקשר (חובה לקרוא)

1. `_COMMUNICATION/team_51/TEAM_51_TO_TEAM_11_AOS_V3_GATE_1_QA_EVIDENCE_v1.0.0.md` — **BLOCK**: אין בדיקות pytest תחת `agents_os_v3/`.
2. `_COMMUNICATION/team_00/TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md` — **§5** (Unit Testing Layer 0+1), **§11** (אין שער בלי דוח pytest), **§6** (אין התחלת Layer 2 בלי Layer 1 unit PASS).
3. ניווט Gateway: `_COMMUNICATION/team_11/TEAM_11_GATE_1_BLOCK_NAVIGATION_RECORD_v1.0.0.md`

## החלטת Gateway — אחריות

**צוות 21** אחראי לספק **מימוש סוויטת pytest** (קבצי בדיקה + תלויות אם נדרש) כך ש־`python3 -m pytest` על תחום `agents_os_v3/` יאסוף **לפחות מבחן אחד** ויעבור **PASS** בסביבת CI מקומית סטנדרטית, עם כיסוי **Layer 0 + Layer 1** בהתאם לטבלאות §5 ובהתאם למודולים **שמומשו בפועל** במסירת GATE_1 (למשל `modules/definitions/`, `modules/state/repository.py`, `modules/state/machine.py` — טרנזקציות/גארדים לפי יכולת בדיקה יחידה, `modules/governance/artifact_index.py`, וכו’). אין להעביר אחריות מימוש בדיקות ל-51 בלי קבצים בריפו — **הבעיה היא היעדר סוויטה**, ולכן המימוש חוזר ל-21 (בשיתוף פעולה עם 51 לביקורת תוצאה אם נדרש).

## דרישות מסירה (AC)

1. **נתיב בדיקות:** תחת `agents_os_v3/tests/` (או נתיב אחר **אחד** שמוסכם בכתב במסמך סגירה ל-11) — קבצי `test_*.py` או מבנה pytest תקני.
2. **איסוף:**  
   `cd <repo-root> && PYTHONPATH=. python3 -m pytest agents_os_v3/ -q`  
   — **exit code 0**, **לא** `collected 0 items`.
3. **IR-3:** כל נתיב חדש תחת `agents_os_v3/` — רישום ב־`agents_os_v3/FILE_INDEX.json` (גרסה מעודכנת).
4. **IR-2:** אין שינוי תחת `agents_os_v2/`.
5. **ראיות ל-11:** עדכון או מסמך חדש תחת `_COMMUNICATION/team_21/` — לדוגמה הרחבת `TEAM_21_AOS_V3_GATE_1_EVIDENCE_AND_HANDOFF_v1.0.0.md` **או** `TEAM_21_TO_TEAM_11_AOS_V3_GATE_1_PYTEST_REMEDIATION_REPORT_v1.0.0.md` עם פקודות, תקציר pytest, ו-commit.

## לאחר מסירה

- **Team 51** מריץ מחדש שלב 6 ומפרסם `_COMMUNICATION/team_51/TEAM_51_TO_TEAM_11_AOS_V3_GATE_1_QA_EVIDENCE_v1.0.1.md` (או גרסה עוקבת) — **PASS** נדרש לסגירת GATE_1 מלאה.
- **Team 11** מעדכן מפת שלבים / GO רק על בסיס ראיות PASS.

---

**log_entry | TEAM_11 | AOS_V3_BUILD | MANDATE_T21_GATE1_PYTEST_REMEDIATION | 2026-03-28**
