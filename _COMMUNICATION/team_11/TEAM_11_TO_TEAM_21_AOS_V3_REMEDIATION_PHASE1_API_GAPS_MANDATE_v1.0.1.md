---
id: TEAM_11_TO_TEAM_21_AOS_V3_REMEDIATION_PHASE1_API_GAPS_MANDATE_v1.0.1
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 21 (AOS Backend Implementation)
cc: Team 00 (Principal), Team 51 (AOS QA), Team 100 (Chief Architect), Team 31 (AOS Frontend)
date: 2026-03-28
type: REMEDIATION_MANDATE — Phase 1 (missing API vs contract)
domain: agents_os
branch: aos-v3
supersedes: TEAM_11_TO_TEAM_21_AOS_V3_REMEDIATION_PHASE1_API_GAPS_MANDATE_v1.0.0.md
authority:
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_REMEDIATION_ADMIN_PREFIX_DECISION_v1.0.0.md
  - _COMMUNICATION/team_100/TEAM_100_AOS_V3_REMEDIATION_PLAN_REVIEW_AND_FEEDBACK_v1.0.0.md
  - _COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md
  - _COMMUNICATION/team_11/TEAM_11_AOS_V3_REMEDIATION_PHASE0_DECISION_RECORD_v1.0.1.md
responds_to_team_100_correction: C-01 (TEAM_100_AOS_V3_REMEDIATION_PLAN_REVIEW_AND_FEEDBACK_v1.0.0.md)
gateway_status: GO — Phase 1 authorized; אין חסימת prefix---

# Team 11 → Team 21 | AOS v3 Remediation — Phase 1 (API gaps) — **v1.0.1 GO**

## מטרה

לסגור **פער F-03 / F-07** בדוח Team 100: השלמת **ארבעת** ה-handlers החסרים מול ה-contract התפעולי (נתיבים כפי שקיימים בקוד ובפסיקת 100), כולל **UC-12 Principal Override**, בלי להמציא שדות או נתיבים שלא ב־GIN / specs.

## החלטת Phase 0 (סגורה)

**Option B — Align WP to code** — פורסמה ב־[`TEAM_100_AOS_V3_REMEDIATION_ADMIN_PREFIX_DECISION_v1.0.0.md`](../team_100/TEAM_100_AOS_V3_REMEDIATION_ADMIN_PREFIX_DECISION_v1.0.0.md).

- אין מיגרציית מסה ל־`/api/admin/*`.
- Endpoints חדשים ל־routing-rules / policies נרשמים **ללא** segment `/admin/`, בהתאם לטבלה בפסיקת 100 ולשורות למטה.

**אין תלות חוסמת** — **GO** להתחלת מימוש מיד.

## Layer 1 — Identity

| Field | Value |
|------|--------|
| Team ID | `team_21` |
| writes_to | `agents_os_v3/` (API, use cases, DB layer לפי דפוס קיים) |
| Submission | `TEAM_21_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE1_COMPLETION_v1.0.0.md` |

## Layer 2 — Iron Rules

| ID | Rule |
|----|------|
| IR-3 | עדכן `agents_os_v3/FILE_INDEX.json` לכל קובץ חדש/שינוי מהותי. |
| IR-AUTHORITY | ללא `NOT_PRINCIPAL`; `INSUFFICIENT_AUTHORITY` לפי דירקטיב authority. |
| v2 FREEZE | **אין** שינוי תחת `agents_os_v2/`. |

## Layer 3 — Deliverables (checklist)

| # | Endpoint / שינוי | WP / הערה |
|---|------------------|-----------|
| 1 | `POST /api/runs/{run_id}/override` | UC-12 — Principal Override (Use Case Catalog + D.6) |
| 2 | `GET /api/teams/{team_id}` | פירוט צוות בודד; D.6 |
| 3 | `DELETE /api/routing-rules/{rule_id}` | מחיקת כלל routing — **נתיב בפועל לפי Option B** (לא `/api/admin/...`) |
| 4 | `PUT /api/policies/{policy_id}` | עדכון מדיניות — **נתיב בפועל לפי Option B** (לא `/api/admin/...`) |
| 5 | קונבנציית `/api/admin/*` | **N/A** — נדחה לפי פסיקת Team 100; עדכון D.6 קנוני הוא אחריות תיעוד (**170**/**70**), לא חוסם Phase 1 |

## Layer 4 — אימותים (לפני מסירה)

- `PYTHONPATH=. python3 -m pytest agents_os_v3/tests/ -q` — ירוק.
- `bash scripts/check_aos_v3_build_governance.sh` — PASS.
- בדיקות ייעודיות ל-endpoints החדשים יגיעו ב־**Phase 2** (Team 51); מומלץ smoke מקומי.

## תיאום

- **Team 51:** Phase 2 יוסיף בדיקות מפורשות אחרי מסירה זו; נתיבי בדיקה **ללא** `/admin/` ל־routing-rules / policies.
- **Team 31:** אם נתיבי API או JSON משתנים — עדכון `api-client.js` / UI בהתאם (מנדט נפרד או תיאום).

---

**log_entry | TEAM_11 | AOS_V3 | REMEDIATION | PHASE1_MANDATE_T21_v1.0.1_GO_C01 | 2026-03-28**
