---
id: TEAM_51_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE2_COMPLETION_v1.0.0
historical_record: true
from: Team 51 (AOS QA & Functional Acceptance)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 21, Team 100, Team 00, Team 61
date: 2026-03-28
type: REMEDIATION_COMPLETION — Phase 2 (2.1 + 2.2)
domain: agents_os
responds_to:
  - TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE2_QA_HANDOFF_v1.0.0.md
  - TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE2_TC_TRACEABILITY_MANDATE_v1.0.0.md---

# Team 51 → Team 11 | AOS v3 Remediation Phase 2 — completion

## Verdict: **PASS**

## Terminology (mandate IR)

כל הבדיקות בפרק זה הן **API integration** (FastAPI `TestClient` + Postgres כאשר נדרש). **אין** כאן **Browser E2E** — זה נשאר ל-**Phase 3** לפי תוכנית Team 100.

## סיכום מסירה

| חלק | תוכן | קבצים |
|-----|------|--------|
| **2.1** | `test_tc01_*` … `test_tc14_*` + טבלת מיפוי בראש המודול | [agents_os_v3/tests/test_tc01_14_module_map_integration.py](agents_os_v3/tests/test_tc01_14_module_map_integration.py) |
| **2.1** | Helpers משותפים (routing seed, feedback/advance/clear, AD-S7-01, sentinel, history seed) | [agents_os_v3/tests/tc_module_map_helpers.py](agents_os_v3/tests/tc_module_map_helpers.py) |
| **2.1** | רפקטור GATE_2: TC-07/TC-09 דרך אותם helpers | [agents_os_v3/tests/test_integration_gate2.py](agents_os_v3/tests/test_integration_gate2.py) |
| **2.2** | חוזים ל-override / `GET /api/teams/{id}` / `DELETE /api/routing-rules/{id}` / `PUT /api/policies/{id}` (Option B) | [agents_os_v3/tests/test_remediation_phase2_api_contracts.py](agents_os_v3/tests/test_remediation_phase2_api_contracts.py) |
| **IR-3** | `FILE_INDEX.json` | גרסה **1.1.10** |

## תיקון מוצר נלווה (resume / בדיקות TC-05)

ב-[agents_os_v3/modules/state/repository.py](agents_os_v3/modules/state/repository.py): `update_run_position` לא איפס עמודות `paused_at` / `paused_routing_snapshot_json` כשהועבר `None` (התנאים `is not None` דילגו על העדכון). זה שבר את `resume_run` מול `chk_runs_paused_consistency`. נוספו ברירות מחדל **sentinel** (`_PAUSE_FIELDS_UNSET`) כך ש-`None` מפורש **מנקה** את השדות ל-NULL.

## אימותים (בוצעו)

```bash
cd <repo-root>
PYTHONPATH=. python3 -m pytest agents_os_v3/tests/ -q
# 100 passed, 2 warnings (websockets/uvicorn deprecation in TC-21 path)

bash scripts/check_aos_v3_build_governance.sh
# PASS
```

**דורש:** `AOS_V3_DATABASE_URL` (למשל מ-[agents_os_v3/.env](agents_os_v3/.env)) — בלי זה בדיקות ה-DB מדולגות.

## מצב רפו בזמן האימות

- `git rev-parse HEAD` → `2eb45765d0f7293e76b2c7fd6428c28936e2d1a3` (אומת אחרי commit Phase 2 + הרצת pytest מלאה).

## מיפוי 2.2 → בדיקות

| נושא | פונקציות בדיקה (דוגמה) |
|------|-------------------------|
| Override | `test_phase2_override_force_pass_in_progress_advances_phase`, `force_pause_requires_snapshot`, `force_pause_with_valid_snapshot`, `force_resume_after_pause`, `terminal_complete_returns_409`, `force_fail_moves_to_correction` |
| GET team | `test_phase2_get_team_detail_includes_hierarchy_and_assignment_flag` |
| DELETE routing-rule | `test_phase2_delete_routing_rule_team00_removes_from_list` |
| PUT policy | `test_phase2_put_policy_team00_updates_listed_value` |

## הפניות SSOT ל-TC-01..TC-14

- [TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md](../team_100/TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md) §7  
- [TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md](../team_00/TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md) D.3  

טבלת המיפוי המלאה מוטמעת ב-docstring של `test_tc01_14_module_map_integration.py`.

---

**log_entry | TEAM_51 | AOS_V3 | REMEDIATION | PHASE2_COMPLETE_v1.0.0 | 2026-03-28**
