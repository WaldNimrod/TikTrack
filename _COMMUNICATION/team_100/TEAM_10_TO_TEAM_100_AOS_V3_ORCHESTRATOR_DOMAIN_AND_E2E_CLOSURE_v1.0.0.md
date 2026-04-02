---
id: TEAM_10_TO_TEAM_100_AOS_V3_ORCHESTRATOR_DOMAIN_AND_E2E_CLOSURE_v1.0.0
historical_record: true
from: Team 10 (Execution Gateway — closure package)
to: Team 100 (Chief System Architect / Chief R&D)
date: 2026-03-27
domain: agents_os_v3
type: COMPLETION_REPORT
status: CLOSED_FOR_ARCHITECTURAL_AWARENESS---

# AOS v3 — סגירת מעגל: Orchestrator לפי דומיין + יישור בדיקות + בהרת E2E

## תקציר מנהלים

נסגר פער ארכיטקטוני־תפעולי שבו **הקצאת ORCHESTRATOR ב־`RUN_INITIATED`** לדומיין `agents_os` נרשמה ב־DB כ־`team_10` בעוד הקנון וה־UI מצפים ל־**`team_11`** (AOS Gateway). התוצאה הייתה **403 WRONG_ACTOR** על `POST /api/runs/{id}/advance` עם `X-Actor-Team-Id: team_11`, ועקיפה בבדיקות (קריאת `meta.actor_team_id` מ־`/prompt`).

**תיקון שורש:** `_team_for_role` במכונת המצבים מחזיר `team_11` כאשר `domain_id == DOMAIN_ULID_AGENTS_OS`, אחרת `team_10` (TikTrack).

**יישור בדיקות:** עודכנו ברירות מחדל וקריאות מפורשות ב־pytest כך שסוויטת ה־API/DB תואמת את ההקצאה החדשה; דומיין אקראי ב־Phase 5 canary נשאר עם orchestrator `team_10` (התנהגות הקוד).

**תיעוד E2E:** הובהר ב־`agents_os_v3/tests/e2e/README.md` ש־**~42 skipped** ב־`pytest agents_os_v3/tests/` הם **רק** בדיקות Selenium (opt-in ב־`AOS_V3_E2E_RUN`), לא כשל חבוי ב־API; נוספה פקודה לסוויטה מלאה ללא דילוגי E2E ואזהרת **restart לשרת 8090** אחרי שינוי צד־שרת (drift מול HTTP חי).

---

## עקרונות ארכיטקטוניים (לאינדקס / מעקב SSOT)

| נושא | החלטה |
|------|--------|
| Gateway לפי דומיין | ORCHESTRATOR ב־agents_os → `team_11`; ב־TikTrack → `team_10` |
| מקור אמת להקצאה | יצירת שורת `assignments` ב־`initiate_run` עם `_team_for_role(role_id, domain_id)` |
| E2E מול HTTP | חייב תהליך uvicorn שמותאם ל־HEAD אחרי שינויי machine/API |

---

## קבצים שנגעו (עיקריים)

| נתיב | תיאור |
|------|--------|
| `agents_os_v3/modules/definitions/constants.py` | `AOS_GATEWAY_TEAM_ID`, ULID דומיינים |
| `agents_os_v3/modules/state/machine.py` | `_team_for_role` + שימוש ב־`domain_id` ב־`initiate_run` |
| `agents_os_v3/tests/e2e/test_canary_full_pipeline.py` | הסרת workaround; `AOS_ACTOR_HDR`; אימות `meta.actor_team_id` |
| `agents_os_v3/tests/tc_module_map_helpers.py` | ברירת מחדל orchestrator ל־`AOS_GATEWAY_TEAM_ID`; seed אירועים לפי דומיין |
| `agents_os_v3/tests/test_tc01_14_module_map_integration.py` | `team_11` לפעולות orchestrator; TC-14 — actor שגוי = `team_10` |
| `agents_os_v3/tests/test_gate3_tc15_21_api.py` | `_hdr` default `team_11` לריצות agents_os |
| `agents_os_v3/tests/test_gate4_tc19_26_api.py` | כנ״ל |
| `agents_os_v3/tests/test_remediation_phase2_api_contracts.py` | snapshot PAUSE עם `team_11` בדומיין agents_os |
| `agents_os_v3/tests/test_remediation_phase5_canary_simulation.py` | `actor="team_10"` מפורש לדומיין ULID אקראי |
| `agents_os_v3/tests/e2e/README.md` | הסבר skips + הרצה מלאה + drift |

---

## הוכחות הרצה (Pre-flight)

| תרחיש | תוצאה |
|--------|--------|
| `pytest agents_os_v3/tests/` (ללא `AOS_V3_E2E_RUN`) | 119 passed, 42 skipped — הדילוגים = E2E בלבד |
| `AOS_V3_E2E_RUN=1` + `AOS_V3_E2E_UI_MOCK=0` + DB + stack, אחרי restart ל־8090 | **161 passed, 0 skipped** |
| מחלקת `TestCanaryFullPipelineAgentsOS` בודדת אחרי restart | 10 passed |

---

## המלצות המשך (לא חוסמות)

1. **Team 51:** לעדכן או לגרסה חדשה של `TEAM_51_AOS_V3_CANARY_DUAL_DOMAIN_QA_REPORT_*.md` אם עדיין מתאר את ה־workaround הישן כ־CRITICAL.
2. **Team 10:** לשקול פרסום קצר ל־Team 70 רק אם נדרש עדכון אינדקס חיצוני (לא בוצע כאן).

---

## SOP-013 — הודעת Seal

```
--- PHOENIX TASK SEAL ---
TASK_ID: AOS-V3-ORCHESTRATOR-DOMAIN-AND-E2E-DOC-2026-03-27
STATUS: COMPLETE
FILES_MODIFIED:
  agents_os_v3/modules/definitions/constants.py
  agents_os_v3/modules/state/machine.py
  agents_os_v3/tests/e2e/test_canary_full_pipeline.py
  agents_os_v3/tests/tc_module_map_helpers.py
  agents_os_v3/tests/test_tc01_14_module_map_integration.py
  agents_os_v3/tests/test_gate3_tc15_21_api.py
  agents_os_v3/tests/test_gate4_tc19_26_api.py
  agents_os_v3/tests/test_remediation_phase2_api_contracts.py
  agents_os_v3/tests/test_remediation_phase5_canary_simulation.py
  agents_os_v3/tests/e2e/README.md
  _COMMUNICATION/team_100/TEAM_10_TO_TEAM_100_AOS_V3_ORCHESTRATOR_DOMAIN_AND_E2E_CLOSURE_v1.0.0.md
PRE_FLIGHT:
  - pytest agents_os_v3/tests/: 119 passed / 42 skipped (E2E opt-in) with DB URL set
  - Full suite with AOS_V3_E2E_RUN=1 + server restart: 161 passed / 0 skipped
HANDOVER_PROMPT:
  Team 100: Index this closure under AOS v3 execution fidelity; confirm no spec drift vs
  MODULE_MAP / Authority model on domain-scoped gateway teams. Team 51: refresh canary QA
  report if it still documents team_10-vs-team_11 as unfixed. Operators: always restart
  aos-v3 server on 8090 after machine.py changes before live E2E.
--- END SEAL ---
```

**log_entry | TEAM_10 | AOS_V3_ORCH_DOMAIN_CLOSURE | TEAM_100_HANDOFF | 2026-03-27**
