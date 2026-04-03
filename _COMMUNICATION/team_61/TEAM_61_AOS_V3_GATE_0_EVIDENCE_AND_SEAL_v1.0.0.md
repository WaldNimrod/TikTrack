---
id: TEAM_61_AOS_V3_GATE_0_EVIDENCE_AND_SEAL_v1.0.0
historical_record: true
from: Team 61 (AOS DevOps & Platform)
to: Team 11 (AOS Gateway)
cc: Team 21, Team 100, Team 191
date: 2026-03-28
type: GATE_0_EVIDENCE + SOP-013_SEAL
domain: agents_os
branch: aos-v3---

# Team 61 — AOS v3 GATE_0 evidence

## Summary

תשתית GATE_0 לפי [TEAM_11_TO_TEAM_61_AOS_V3_BUILD_ACTIVATION_v1.0.0.md](../team_11/TEAM_11_TO_TEAM_61_AOS_V3_BUILD_ACTIVATION_v1.0.0.md) ו-WP v1.0.3 D.3/D.4/D.8. **בידוד דומיין:** מסד AOS v3 מנותק ממסד אפליקציית TikTrack; אין שימוש ב-`api/.env` / `DATABASE_URL` לצורך מיגרציה או seed של AOS.

## אימות חיבור לשני בסיסי הנתונים

```bash
source api/venv/bin/activate   # או כל venv עם psycopg2
python3 scripts/verify_dual_domain_database_connectivity.py
```

- **TikTrack:** `api/.env` → `DATABASE_URL`
- **AOS v3:** `agents_os_v3/.env` → `AOS_V3_DATABASE_URL` (חובה; לא זהים ל-`DATABASE_URL`)

## Migrations

| Path | Role |
|------|------|
| `agents_os_v3/db/migrations/001_aos_v3_fresh_schema_v1.0.2.sql` | Empty DB → v1.0.2 (+ seed מוטמע) |
| `agents_os_v3/db/migrations/002_aos_v3_delta_v1.0.1_to_v1.0.2.sql` | v1.0.1 → v1.0.2 |

**Runner:** `agents_os_v3/db/run_migration.py` — `--fresh` / `--delta`; משתנה סביבה **`AOS_V3_DATABASE_URL` בלבד**.

**אתחול:** [scripts/init_aos_v3_database.sh](../../scripts/init_aos_v3_database.sh) — קורא **`agents_os_v3/.env`** בלבד; אופציונלי `AOS_V3_DOCKER_*` ל-`CREATE DATABASE` על תשתית Postgres משותפת.

**דלתא:** לפני `002` על DB לא ריק — ארבע שאילתות pre-flight בקובץ ה-SQL + [מפת שלבים §0.3](../team_11/TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0.md).

## Seed / definition

| Artifact | Notes |
|----------|--------|
| `agents_os_v3/definition.yaml` | SSOT ל-seed (כולל שורות דומיין רב-מוצרי ב-DB של AOS בלבד) |
| `agents_os_v3/seed.py` | אידמפוטנטי + D-03 |

## FastAPI shell (Note 1 / IR-9)

`agents_os_v3/modules/management/api.py` — פורט **8090**, `GET /api/health`, `GET /api/events/stream` (שלד), `business_router` לצוות 21.

```bash
PYTHONPATH=<repo-root> uvicorn agents_os_v3.modules.management.api:app --host 0.0.0.0 --port 8090
```

## v3 CLI (IR-1)

`agents_os_v3/cli/pipeline_run.sh` — stub GATE_0.

## Governance

`bash scripts/check_aos_v3_build_governance.sh` — IR-3 / v2 freeze. שינויי `agents_os_v2/` לא ב-scope מסירה זו.

## Dependencies

`agents_os_v3/requirements.txt` (+ `psycopg2` לסקריפטי DB).

---

--- PHOENIX TASK SEAL ---

**TASK_ID:** AOS_V3_BUILD_GATE_0_TEAM_61  
**STATUS:** COMPLETE — GATE_0 PASS by Team 11 (2026-03-28); see `_COMMUNICATION/team_11/TEAM_11_GATE_0_PASS_AND_TEAM_21_GO_v1.0.0.md`  
**FILES_MODIFIED (GATE_0 + hygiene):**

- `agents_os_v3/` — package, migrations runner, seed, definition, API shell, CLI, `FILE_INDEX.json`, `.env.example`
- `scripts/init_aos_v3_database.sh`
- `scripts/verify_dual_domain_database_connectivity.py`
- `_COMMUNICATION/team_61/TEAM_61_AOS_V3_GATE_0_EVIDENCE_AND_SEAL_v1.0.0.md`

**PRE_FLIGHT:**

- `python3 scripts/verify_dual_domain_database_connectivity.py` → PASS
- Delta: pre-flight לפני `002` כנדרש

**HANDOVER_PROMPT (Team 11 → Team 21):**

> מיגרציה + seed על `AOS_V3_DATABASE_URL` בלבד; API: `uvicorn agents_os_v3.modules.management.api:app --port 8090`; רישום routes על `business_router` — ללא stub routes (Team 100 Note 1).

--- END SEAL ---

**log_entry | TEAM_61 | AOS_V3_BUILD | GATE_0_EVIDENCE_SEAL_SYNC_T11_PASS | 2026-03-28**
