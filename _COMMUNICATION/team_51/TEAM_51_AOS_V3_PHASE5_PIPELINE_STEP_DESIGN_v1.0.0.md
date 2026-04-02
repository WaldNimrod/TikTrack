---
id: TEAM_51_AOS_V3_PHASE5_PIPELINE_STEP_DESIGN_v1.0.0
historical_record: true
from: Team 51 (AOS QA & Functional Acceptance)
to: Team 11, Team 61, Team 100
date: 2026-03-28
type: DESIGN — Remediation Phase 5 (M1 / F-05)
domain: agents_os
responds_to: TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE5_CANARY_SIM_MANDATE_v1.0.0.md---

# Phase 5 — מהו "צעד pipeline" ב־AOS v3

## הגדרה

**צעד pipeline (pipeline step)** ב־v3 הוא **מעבר מצב אטומי אחד** על רשומת `runs` (ו על ה־event ledger) שנגרם על ידי **קריאת HTTP מזוהה (authenticated actor)** ל־Management API, ושניתן **לאמת** מיד לאחר מכן באמצעות:

- `GET /api/runs/{run_id}` או `GET /api/state?run_id=…` — לשדות כגון `status`, `current_gate_id`, `current_phase_id`, `next_action`; או  
- שאילתת DB על `runs` / `events` כאשר הבדיקה דורשת עומק אימות.

כל צעד כזה מממש כלל אחד מהמכונה (state machine) — לדוגמה: יצירת ריצה, הזנת feedback + advance, pause, resume, approve, fail, וכו'.

## מה זה *לא*

- **לא** ספירת קבצי HTML או אינדקס `FILE_INDEX` (אלה חלק מ־Block B ב־[`agents_os_v3/tests/canary_gate4.sh`](../../agents_os_v3/tests/canary_gate4.sh)).
- **לא** רק הרצת [`test_gate4_tc19_26_api.py`](../../agents_os_v3/tests/test_gate4_tc19_26_api.py) בבידוד (Block C) — אלה בדיקות נקודתיות; סימולציית canary דורשת **רצף** של צעדים על אותה ריצה עם DB.

## מיפוי endpoints (תמצית)

| פעולה | שיטה / נתיב (דוגמה) | הערה |
|--------|----------------------|------|
| התחלת ריצה | `POST /api/runs` | יוצר run + מצב התחלתי |
| Feedback | `POST /api/runs/{id}/feedback` | לפני advance במצבי GATE_3 |
| Advance | `POST /api/runs/{id}/advance` | מעבר gate/phase |
| ניקוי pending | `POST /api/runs/{id}/feedback/clear` | בין מחזורים (Mode B/C/D) |
| Pause / Resume | `POST .../pause`, `POST .../resume` | `PAUSED` ↔ `IN_PROGRESS` |
| HITL | `POST .../approve` (Principal) | לפי מצב המכונה |

שדות גוף וקודי תגובה — לפי ה־OpenAPI / יישום קיים; אין להמציא שמות שדות.

## קנרי Phase 5

הסוויטה [`test_remediation_phase5_canary_simulation.py`](../../agents_os_v3/tests/test_remediation_phase5_canary_simulation.py) מריצה **לפחות חמישה** צעדים רצופים על ריצה אחת (יצירה → התקדמות → pause → resume → התקדמות נוספת), עם **PASS/FAIL** דרך pytest והרצה מפורשת דרך [`scripts/run_aos_v3_phase5_canary_sim.sh`](../../scripts/run_aos_v3_phase5_canary_sim.sh).

---

**log_entry | TEAM_51 | AOS_V3 | REMEDIATION | PHASE5_M1_PIPELINE_STEP_DESIGN | 2026-03-28**
