---
id: TEAM_11_TO_TEAM_61_AOS_V3_GOVERNANCE_CHECK_RUNTIME_EXCLUDE_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 61 (AOS DevOps & Platform)
cc: Team 21 (AOS Backend), Team 51 (AOS QA), Team 191 (Git Governance)
date: 2026-03-28
type: MANDATE — governance script alignment עם .gitignore (runtime)
domain: agents_os
branch: aos-v3
authority: TEAM_51_TO_TEAM_11_AOS_V3_GATE_1_QA_EVIDENCE_v1.0.0.md + IR-3 (FILE_INDEX) + check_aos_v3_build_governance.sh---

# Team 11 → Team 61 | מנדט — `check_aos_v3_build_governance.sh` ו־`pipeline_state.json`

## הקשר

`_COMMUNICATION/team_51/TEAM_51_TO_TEAM_11_AOS_V3_GATE_1_QA_EVIDENCE_v1.0.0.md` מדווח:  
`bash scripts/check_aos_v3_build_governance.sh` נכשל עם  
`FAIL [FILE_INDEX]: files on disk not listed in FILE_INDEX.json: agents_os_v3/pipeline_state.json`.

ב־`.gitignore` (שורה רלוונטית): `agents_os_v3/pipeline_state.json` — **קובץ projection מקומי / runtime**, לא ארטיפקט קומיט.

## החלטת Gateway — אחריות

**צוות 61** יעדכן את `scripts/check_aos_v3_build_governance.sh` (או מנגנון בדיקה שקול) כך שקבצים המופיעים ב־`.gitignore` תחת `agents_os_v3/` — לפחות `agents_os_v3/pipeline_state.json` — **לא** ייחשבו כחובת רישום ב־`FILE_INDEX.json` (אותה לוגיקה כמו החרגת `.env` הקיימת בסקריפט).

## AC

1. עם קובץ `agents_os_v3/pipeline_state.json` קיים מקומית (כפי שייווצר מריצת API) — הסקריפט **אינו** נכשל על FILE_INDEX בגלל קובץ זה בלבד.
2. **אין** להוסיף `pipeline_state.json` ל־`FILE_INDEX.json` כנתיב קומיט (נשאר gitignored).
3. ראיות קצרות תחת `_COMMUNICATION/team_61/` (אופציונלי) או ציון ב-PR/commit — פקודה + תוצאה PASS.

## ניווט

רשומה מרכזית: `_COMMUNICATION/team_11/TEAM_11_GATE_1_BLOCK_NAVIGATION_RECORD_v1.0.0.md`

---

**log_entry | TEAM_11 | AOS_V3_BUILD | MANDATE_T61_GOVERNANCE_RUNTIME_EXCLUDE | 2026-03-28**
