---
id: TEAM_11_TO_TEAM_21_AOS_V3_GATE_3_ACTIVATION_MANDATE_v1.0.0
historical_record: true
from: Team 11 (AOS Gateway / Execution Lead)
to: Team 21 (AOS Backend Implementation)
cc: Team 00 (Principal), Team 51 (AOS QA), Team 100 (Chief Architect), Team 190 (Constitutional Validator)
date: 2026-03-28
type: GATE_3_ACTIVATION_MANDATE — FIP / SSE / state (GO — Team 190 PASS + Team 100 APPROVED)
domain: agents_os
branch: aos-v3
execution_gate: SATISFIED
execution_release_evidence: TEAM_100_AOS_V3_POST_GATE_2_PACKAGE_AND_GATE_3_APPROVAL_v1.0.0.md
authority_basis:
  - TEAM_100_AOS_V3_POST_GATE_2_PACKAGE_AND_GATE_3_APPROVAL_v1.0.0.md
  - ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0.md
  - TEAM_100_AOS_V3_AUTHORITY_MODEL_AMENDMENT_REPORT_v1.0.0.md
  - TEAM_100_AOS_V3_GATE_2_ARCHITECTURAL_VERDICT_v1.0.0.md
  - TEAM_100_TO_TEAM_11_AOS_V3_POST_GATE_2_REACTIVATION_PROMPT_v1.0.0.md
  - TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.3.md
parent_activation: TEAM_11_TO_TEAM_21_AOS_V3_BUILD_ACTIVATION_v1.0.1.md---

# Team 11 → Team 21 | GATE_3 — מנדט הפעלה (FIP + SSE + הרחבות state)

## תנאי ביצוע (חובה)

**מצב נוכחי (2026-03-28): GO — `execution_gate: SATISFIED`.**

1. **PASS** מ-Team 190 (revalidation) — `_COMMUNICATION/team_190/TEAM_190_AOS_V3_POST_GATE_2_UPDATE_PACKAGE_REVIEW_v1.0.1.md`.
2. **אישור ארכיטקטורי** מ-Team 100 על חבילת פוסט-GATE_2 + **מנדט זה** — `_COMMUNICATION/team_100/TEAM_100_AOS_V3_POST_GATE_2_PACKAGE_AND_GATE_3_APPROVAL_v1.0.0.md` (**APPROVED — GO for GATE_3 execution**).

**היסטוריה:** לפני מועד האישור היה אסור מימוש קוד עד קיום שני התנאים למעלה. אם המנדט יתוקן מחדש — לעצור ולאמת מול Team 11 / Team 100.

### תהליך תיקון

| מצב | פעולה |
|-----|--------|
| **Team 190 — הערות חוסמות** | Team 11 מתקן מסמכי חבילת פוסט-GATE_2 / מנדט; מגיש מחזור עוקב; **אין** GO ל-21 עד PASS. |
| **Team 100 — שינוי סקופ** | Team 11 מפרסם גרסה חדשה של מנדט GATE_3 (או דלתא מאושרת); 21 מממש **רק** מול המסמך המאושר האחרון. |
| **מימוש חריג מה-AC** | עצירה; העלאה ל-Team 100 דרך Team 11. |

---

## Layer 1 — Identity

| Field | Value |
|------|--------|
| Team ID | `team_21` |
| Scope | `agents_os_v3/` — מודולים ונתיבים לפי הטבלה להלן |
| Submission target | Team 11 → **Team 190** לוולידציית GATE_3 (אחרי מימוש + ראיות 51) |

---

## Layer 2 — Iron Rules

| ID | Rule |
|----|------|
| **IR-AUTHORITY** | **אסור** `NOT_PRINCIPAL` בקוד חדש או במסמכים; השתמש ב-**`INSUFFICIENT_AUTHORITY`** בלבד (Directive §8). |
| **IR-3** | עדכן `FILE_INDEX.json` לכל נתיב חדש/שונה תחת `agents_os_v3/`. |
| **IR-9** | `GET /api/events/stream` + `audit/sse.py` — **מימוש מלא** עד סוף GATE_3. |
| **IR-SPEC-VER** | הפניות ל-spec **רק** לגרסאות הפעילות בטבלה §SSOT (לא v1.0.2 / v1.1.0 ישנים). |

**השלמה עם:** `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_21_AOS_V3_BUILD_ACTIVATION_v1.0.1.md` §GATE_3 — אם יש פער ניסוח, **מנדט זה** גובר לשער זה.

---

## Layer 3 — SSOT (גרסאות פעילות)

| Spec | Version | Path |
|------|---------|------|
| UI Spec Amendment (8B) | **v1.1.1** | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md` |
| Event Observability | **v1.0.3** | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.3.md` |
| Module Map Integration | **v1.0.2** | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.2.md` |
| Use Case Catalog | **v1.0.4** | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.4.md` |
| State Machine | v1.0.2 | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md` |

**Build order:** `_COMMUNICATION/team_00/TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md` **§10**.

---

## Layer 4 — Task (GATE_3 checklist)

| # | Deliverable | Spec / note |
|---|-------------|-------------|
| 1 | `modules/audit/ingestion.py` — FeedbackIngestor (IL-1 / IL-2 / IL-3) | UI Spec 8B §12.1–§12.3 |
| 2 | `modules/audit/sse.py` — SSEBroadcaster — **ארבעה** סוגי אירועים (מלא) | Event Obs v1.0.3 + IR-9 |
| 3 | `use_cases.py` — UC-15 `ingest_feedback` | UI Spec 8B §12.4 |
| 4 | `POST /api/runs/{run_id}/feedback` | UI Spec 8B §10.1 |
| 5 | `POST /api/runs/{run_id}/feedback/clear` | UI Spec 8B §10.2 |
| 6 | `GET /api/state` — `previous_event`, `pending_feedback`, `next_action` (**שבעה** סוגים + `cli_command`) | UI Spec 8B §10.4 |
| 7 | `GET /api/history?run_id=` | UI Spec 8B §10.5 |
| 8 | `GET /api/events/stream` — SSE מלא | UI Spec 8B §10.6 |
| 9 | **TC-15..TC-18** ירוקים (Team 51) | WP D.4 |
| 10 | `FILE_INDEX.json` מעודכן | IR-3 |

---

## תיאום

- **Team 51:** TC-15..TC-18 + אינטגרציה — מקביל למימוש כשהממשק יציב.
- **ספק פערים:** Team 100.

---

**log_entry | TEAM_11 | AOS_V3_BUILD | GATE_3_MANDATE_T21 | GO_T190_PASS_T100_APPROVED | 2026-03-28**
