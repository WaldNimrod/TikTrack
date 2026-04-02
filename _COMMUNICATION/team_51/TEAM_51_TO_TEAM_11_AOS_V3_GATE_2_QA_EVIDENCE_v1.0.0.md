---
id: TEAM_51_TO_TEAM_11_AOS_V3_GATE_2_QA_EVIDENCE_v1.0.0
historical_record: true
from: Team 51 (AOS QA & Functional Acceptance)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 21 (AOS Backend), Team 100 (Chief Architect)
date: 2026-03-27
type: QA_EVIDENCE — GATE_2
domain: agents_os
branch: aos-v3
authority:
  - TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md §6
  - TEAM_11_TO_TEAM_51_AOS_V3_GATE_2_QA_HANDOFF_v1.0.0.md
  - TEAM_21_TO_TEAM_11_AOS_V3_GATE_2_COMPLETION_REPORT_v1.0.0.md---

# Team 51 → Team 11 | AOS v3 GATE_2 — QA Evidence

## Verdict: **PASS**

כל סעיפי §6 (Layer 2 unit + ארבע אינטגרציות) מכוסים בבדיקות אוטומטיות; מינימום ה-handoff של Team 11 (pytest + governance + מטריצת HTTP) בוצעו בהצלחה על **הרצה מלאה** עם `AOS_V3_DATABASE_URL` פעיל ו-Postgres עם סכימה + seed תואמים.

**תנאי קדם להרצה מלאה (חובה ל-PASS קפדני):**

- `agents_os_v3/.env` עם `AOS_V3_DATABASE_URL` (או משתנה סביבה מקביל), DB זמין, מיגרציה + `seed.py` כמתועד לפרויקט.
- ללא DB: בדיקות שמסומנות `@requires_aos_db` / fixture `aos_db_conn` יידלגו — **אין** להצהיר PASS על סביבה כזו.

**Git (נקודת בדיקה):**

- `git rev-parse HEAD` → `c869e36b0179f5153b5d3e5025f304da7b9536e5`

---

## 1) פקודות שהורצו (Team 11 handoff)

```bash
cd <repo-root>
pip install -r agents_os_v3/requirements.txt
PYTHONPATH=. python3 -m pytest agents_os_v3/ -v --tb=short
bash scripts/check_aos_v3_build_governance.sh
```

**תוצאות (הרצה מאומתת):**

| Check | Result |
|--------|--------|
| `pytest agents_os_v3/` | **43 passed**, 0 failed, 0 skipped (עם DB + `.env` טעון ב-`conftest`) |
| `check_aos_v3_build_governance.sh` | **PASS** |

---

## 2) Traceability — Process Map §6 (Layer 2 unit)

| §6 row | אימות | קובץ / בדיקה | תוצאה |
|--------|--------|----------------|--------|
| `routing/resolver.py` — PAUSED/COMPLETE לא פותרים; חוק + assignment; sentinel `resolve_from_state_key` | יחידה | `test_layer2_routing_resolver.py` | PASS |
| `prompting/templates.py` — `get_active_template` | יחידה | `test_layer2_prompting_templates.py` | PASS |
| `prompting/cache.py` — get/set/clear; AD-S6-01 (אין מפתחות L1/L3 עצמאיים במודול) | יחידה | `test_layer2_prompting_cache.py` | PASS |
| `prompting/builder.py` — PAUSED/TEMPLATE_NOT_FOUND/ROUTING_UNRESOLVED; AD-S6-07 `token_budget_warning`; cache hit | יחידה | `test_layer2_prompting_builder.py` | PASS |
| `state/machine.py` — NOT_FOUND; INSUFFICIENT_AUTHORITY; INVALID_ACTION | יחידה | `test_layer2_state_machine.py` | PASS |

**הערת יישום:** המפרט מזכיר מחלקות `InsufficientAuthorityError` / `MaxCyclesReachedError`; בקוד GATE_2 המימוש הוא `StateMachineError` עם קודים (`INSUFFICIENT_AUTHORITY`, `INVALID_STATE`, וכו'). הבדיקות מאמתות **התנהגות** (קוד + non-swallow) בהתאם לקוד בפועל.

---

## 3) Traceability — Process Map §6 (ארבע אינטגרציות)

| בדיקה §6 | מודולים | בדיקה | תוצאה |
|-----------|---------|--------|--------|
| Routing → Builder | routing + prompting + policy + governance L2 | `test_gate2_crossmodule_routing_to_builder_pipeline` | PASS |
| Machine atomic TX (AD-S7-01) | `machine` + `ledger` | `test_gate2_crossmodule_machine_ledger_atomic_rollback` | PASS |
| Machine exception signals | `machine` | `test_gate2_crossmodule_machine_exception_signals_authority` (pause ע״י non-Principal) | PASS |
| Sentinel bypass | `resolver` + צורת run | `test_gate2_crossmodule_sentinel_bypass_definitions_shaped_run` | PASS |

**עזרי DB:** `gate2_db_helpers.py` — work package זמני בדומיין `01JK8AOSV3DOMAIN00000002` (אינטגרציית מכונה) כדי לא להתנגש ב-`idx_assignments_active_wp_role` על ה-seed WP.

---

## 4) Traceability — Team 11 handoff (HTTP / אינטגרציה ממוקדת)

| דרישה handoff | בדיקה | תוצאה |
|----------------|--------|--------|
| `X-Actor-Team-Id` חסר → `400` / `MISSING_ACTOR_HEADER` | `test_http_missing_actor_header_post_runs` | PASS |
| Portfolio 8A — `GET /api/teams` | `test_http_get_teams_portfolio_8a` | PASS |
| Routing (read) — `GET /api/routing-rules` | `test_http_get_routing_rules` | PASS |
| Policies — `GET /api/policies` | `test_http_get_policies` | PASS |
| Admin templates — `PUT /api/templates/{id}` + כותרת | `test_http_put_template_with_actor_header` (שורת template זמנית) | PASS |
| Prompting — `GET /api/runs/{id}/prompt` | `test_http_get_prompt_when_run_exists` (template זמני + `initiate_run`) | PASS |
| Ideas authority — `PUT` עם `status` ללא הרשאה → `403` / `INSUFFICIENT_AUTHORITY` | `test_http_put_idea_status_forbidden_without_authority` | PASS |
| Health | `test_http_health_no_db` | PASS |

**מימוש בדיקות HTTP:** `test_api_gate2_http.py` — `TestClient` עם **חיבור DB חדש לכל בקשה** (`dependency_overrides[_db_conn]`) כדי למנוע שימוש לא-בטוח ב-`psycopg2` מחיבור משותף עם `TestClient`.

---

## 5) שינויים תומכים (לא דריסת GATE_1 evidence)

| נתיב | סיבה |
|------|------|
| `agents_os_v3/tests/*` (חדש/הרחבה) | כיסוי §6 + handoff |
| `agents_os_v3/modules/management/authority.py` | `Optional[str]` במקום `str \| None` לתאימות Python 3.9 עם FastAPI/Pydantic |
| `agents_os_v3/requirements.txt` | `eval_type_backport`, `httpx` (TestClient / טעינת אפליקציה ב-3.9) |
| `agents_os_v3/FILE_INDEX.json` | v1.1.1 — רישום קבצי בדיקה + עמידה ב-`check_aos_v3_build_governance.sh` |

---

## 6) הפניות

- דוח מסירת 21: `_COMMUNICATION/team_21/TEAM_21_TO_TEAM_11_AOS_V3_GATE_2_COMPLETION_REPORT_v1.0.0.md`
- Router: `_COMMUNICATION/team_11/TEAM_11_AOS_V3_GATE_2_SUBMISSION_ROUTER_v1.0.0.md`
- ראיות GATE_1 נשמרות בנפרד (לא נדרסו).

---

**log_entry | TEAM_51 | AOS_V3_BUILD | GATE_2_QA_EVIDENCE | PASS | 2026-03-27**
