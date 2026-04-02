---
id: TEAM_00_AOS_V3_BUILD_PREREQUISITES_ANALYSIS_v1.0.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: Team 100 (Chief Architect), Team 11 (AOS Gateway)
cc: All AOS v3 teams
date: 2026-03-27
type: BUILD_GATE_READINESS_ANALYSIS
domain: agents_os---

# Team 00 — AOS v3 Build Prerequisites Analysis

## מצב כולל

| שלב | סטטוס |
|---|---|
| Spec (Stages 1–8A) | ✅ CLOSED |
| Spec Stage 8B (`v1.1.0`) | ✅ CLOSED |
| Mockup mandate v2.0.0 | ✅ COMPLETE |
| Team 51 QA | ✅ PASS v2.0.1 |
| Team 90 validation | ⏳ CONDITIONAL → F-01 closing |
| Team 00 UX sign-off (GATE_4 / Phase 4.3) | ✅ **APPROVED 2026-03-27** |
| Team 191 branch work mode | ✅ **APPROVED 2026-03-27** |
| **BUILD** | 🔒 **LOCKED — prerequisites below** |

---

## Prerequisites לפני BUILD — ordered checklist

### שלב א׳ — סגירת ממשל פתוחה (ימים הקרובים)

| # | משימה | אחראי | תלות |
|---|---|---|---|
| A-1 | **Team 90 F-01 closure** — Team 31 מבקש re-validation קצר; Team 90 מעביר ל-GREEN | Team 31 → Team 90 | `ARCHITECT_DIRECTIVE_AC30_WAIVER_13_PRESETS_v1.0.0` פורסם ✓ |
| A-2 | **`aos-v3` branch creation** — git commands (ראו approval Team 191) | Team 191 / Nimrod | Team 191 PASS ✓ |
| A-3 | **AGENTS.md update** — שורת branch פעיל AOS v3 | Team 191 | A-2 |
| A-4 | **Team 191 internal log** — log_entry ב-WORK_PROCEDURE | Team 191 | A-2 |

### שלב ב׳ — הכנת DDL (מקביל לשלב א׳)

| # | משימה | אחראי | תלות |
|---|---|---|---|
| B-1 | **מנדט DDL v1.0.2 לצוות 111** | Team 00 → Team 111 | Stage 8B gate CLOSED ✓ |

**תוכן DDL v1.0.2 (scope מוגדר מהאפיון):**
- DDL-ERRATA-01 (תיקונים מצטברים שהוגדרו בשלבים קודמים)
- טבלת `ideas` (Portfolio / Stage 8 spec)
- טבלת `work_packages` (Portfolio / Stage 8 spec)
- טבלת `pending_feedbacks` (Stage 8B — FeedbackRecord store)
- שדות חדשים: `teams.engine` (editable, Stage 8B §7)

### שלב ג׳ — הכנת activation packages (אחרי שלב א׳ + ב׳)

| # | משימה | אחראי | תלות |
|---|---|---|---|
| C-1 | **Activation prompt לצוות 11** (AOS Gateway) — 4-layer context מלא לBUILD | Team 100 | A-1 (GREEN) |
| C-2 | **Activation prompt לצוות 21** (AOS Backend) | Team 100 | C-1 (ייכלל כחלק מ-Gateway package) |
| C-3 | **Activation prompt לצוות 61** (AOS DevOps) | Team 100 | C-1 |
| C-4 | **Activation prompt לצוות 31** (AOS Frontend) | Team 100 | C-1 |
| C-5 | **WSM update** — active_stage/program לBUILD | Team 100 / Team 170 | C-1 |

### שלב ד׳ — BUILD מתחיל

| # | גורם | תיאור |
|---|---|---|
| D-1 | **Team 11 activation** | Gateway מקבל activation package, פותח run ראשון |
| D-2 | **Team 61** | Infrastructure + DB migrations (DDL v1.0.2) |
| D-3 | **Team 21** | Backend — FastAPI endpoints (§4 כולל FIP, SSE, §4.9/10/19-22) |
| D-4 | **Team 31** | Frontend — AOS v3 UI implementation |
| D-5 | **Team 51** | QA בשערים הרלוונטיים |
| D-6 | **Team 90** | Gate validation בשערים |

---

## Critical Path

```
A-1 (Team 90 GREEN)  ─┐
A-2/3/4 (Branch)     ─┼─→ B-1 (DDL mandate) ─→ C-1..C-5 (Activations) ─→ D-1 BUILD OPEN
                       │
                       └─ [parallel] B-1 יכול לרוץ במקביל ל-A-1
```

**חוסם יחיד לפני C-1:** A-1 (Team 90 GREEN). כל שאר המשימות יכולות לרוץ במקביל.

---

## מה Team 00 צריך לבצע עצמו (מנדטים לפתוח)

| מנדט | לאיזה צוות | תוכן |
|---|---|---|
| **DDL v1.0.2 mandate** | Team 111 | 5 scope items כנ"ל (B-1) |
| **BUILD activation package** | Team 100 | Activation prompts לצוותים 11/21/61/31 (C-1..C-4) |

**המלצה לסדר:** פתח מנדט DDL לצוות 111 היום (מקביל). פתח BUILD activation package לצוות 100 אחרי שצוות 90 מחזיר GREEN (A-1).

---

## הערות ארכיטקטוניות חשובות ל-BUILD

### אין בגרסה 2 — חייב לבנות מאפס
- SSE stream (`GET /api/events/stream`) — לא קיים בv2; חדש לחלוטין
- FeedbackRecord + pending_feedbacks — חדש
- `next_action` server computation — חדש
- `previous_event` בstate response — חדש
- Teams engine edit endpoint — חדש

### מה קיים בv2 ויש להרחיב
- `json_enforcer.py` (IL-1/IL-2/IL-3 logic) — קיים; להרחיב ל-FIP stages
- `pipeline_state_{domain}.json` + atomic writes — קיים; להוסיף שדות
- `_verdict_candidates()` path scanning — קיים; להרחיב ל-Mode A canonical paths
- GET /api/history — קיים; להוסיף `run_id` filter param

### UC-15 — decision required לפני BUILD
מהאפיון Stage 8B §15: "UC-15 decision required" — האם הממשק הישן (AOS v2) ממשיך לרוץ במקביל ל-AOS v3 בתקופת הפיתוח, או מוקפא. **נדרשת החלטה מ-Nimrod לפני D-1.**

---

## תוצר: מה BUILD ייצר

בסיום BUILD מוצלח:
- AOS v3 dashboard פעיל עם 5 עמודים (Pipeline, History, Config, Teams, Portfolio)
- FeedbackRecord pipeline עובד (modes A/B/C/D)
- SSE stream live
- History analytics עם run_id filter
- Teams engine edit
- DDL v1.0.2 מועלה לפרודקשן
- כל 8 integration tests (IT-15..IT-22) ירוקים

---

**log_entry | TEAM_00 | BUILD_PREREQUISITES | AOS_V3_READINESS_ANALYSIS | 2026-03-27**
