---
id: TEAM_170_TO_TEAM_00_AOS_V3_D6_ALIGNMENT_COMPLETION_v1.0.0
from: Team 170 (Spec & Governance)
to: Team 00 (Principal)
cc: Team 11 (AOS Gateway), Team 100 (Chief Architect)
date: 2026-03-29
in_response_to: TEAM_00_TO_TEAM_170_AOS_V3_D6_DOCUMENTATION_MANDATE_v1.0.0.md
status: COMPLETE
correction_cycle: 0
---

# השלמת מנדט D.6 — יישור תיעוד API (documentation/)

## קובץ שעודכן

| Path | סיכום |
|------|--------|
| [documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_API_REFERENCE.md](documentation/docs-agents-os/02-ARCHITECTURE/AGENTS_OS_V3_API_REFERENCE.md) | יישור טבלאות ה-endpoints ל־Phase 1+2 בפועל |

## שינויים (רמת diff)

| # | אזור במסמך | שינוי |
|---|------------|--------|
| 1 | כותרת / Traceability | הוספת הפניה למנדט D.6 + סימון תיקון Team 170 |
| 2 | אחרי Base path | פסקה **Option B**: אין `/api/admin/*`; כל הנתיבים תחת `/api/...` + הפניות ל־Team 100 decision + `test_remediation_phase2_api_contracts.py` |
| 3 | §1 Actor header | הרחבה: Principal-only ל־`DELETE /api/routing-rules/{rule_id}`, `PUT /api/policies/{policy_id}`; `ACTOR_MISMATCH` ל־override; רשימת handlers ללא header כולל `GET /api/teams/{team_id}` |
| 4 | §3 Runs | שורה **`POST /api/runs/{run_id}/override`** (UC-12, `PrincipalOverrideBody`, snapshot / terminal / קודי שגיאה עיקריים) |
| 5 | §5 Teams | שורה **`GET /api/teams/{team_id}`** + שדות תשובה עיקריים |
| 6 | §8 Routing rules | שורה **`DELETE /api/routing-rules/{rule_id}`** (team_00, 404) |
| 7 | §10 Policies | שורה **`PUT /api/policies/{policy_id}`** (team_00, `PolicyUpdateBody`) |
| 8 | §11 Errors | הרחבה: `INSUFFICIENT_AUTHORITY`, `ACTOR_MISMATCH`, `SNAPSHOT_REQUIRED`, `TERMINAL_STATE` |
| 9 | log_entry | `TEAM_170 | AOS_V3 | D6_DOC_MANDATE | API_REFERENCE_PHASE2_PATHS | 2026-03-28` |

**לא בוצעו** שינויי קוד; לא עודכן `_COMMUNICATION/team_00/...WORK_PACKAGE...` (מחוץ ל־`documentation/` לפי המנדט).

## FILE_INDEX

- **`agents_os_v3/FILE_INDEX.json`** — גרסה שנרשמה בעת הסגירה (2026-03-29): **`1.1.15`** (`last_updated` בקובץ: 2026-03-28).

## אימות מול SSOT קוד

- `agents_os_v3/modules/management/api.py` — routes: `post_run_override`, `get_team`, `delete_routing_rule`, `put_policy`
- `agents_os_v3/tests/test_remediation_phase2_api_contracts.py` — חוזי HTTP לנתיבים לעיל

---

**log_entry | TEAM_170 | TO_TEAM_00 | AOS_V3_D6_DOC_MANDATE | COMPLETE | 2026-03-29**

historical_record: true
