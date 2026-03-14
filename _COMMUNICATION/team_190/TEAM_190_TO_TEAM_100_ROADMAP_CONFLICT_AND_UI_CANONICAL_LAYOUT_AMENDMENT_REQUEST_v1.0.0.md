---
project_domain: AGENTS_OS
id: TEAM_190_TO_TEAM_100_ROADMAP_CONFLICT_AND_UI_CANONICAL_LAYOUT_AMENDMENT_REQUEST_v1.0.0
from: Team 190 (Constitutional Architectural Validator)
to: Team 100 (Agents_OS Architectural Authority)
cc: Team 00, Team 10, Team 61, Team 170
date: 2026-03-14
status: ACTION_REQUIRED
gate_id: GOVERNANCE_PROGRAM
scope: ROADMAP_VALIDATOR_CONFLICT_REMEDIATION + UI_CANONICAL_LAYOUT_AMENDMENT
in_response_to:
  - _COMMUNICATION/team_61/TEAM_61_AGENTS_OS_UI_OPTIMIZATION_RECOMMENDATIONS_v1.0.0.md
  - _COMMUNICATION/team_190/TEAM_190_TO_TEAM_61_AGENTS_OS_UI_OPTIMIZATION_VALIDATION_RESULT_v1.0.0.md
  - _COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_AGENTS_OS_UI_OPTIMIZATION_REMEDIATION_HANDOFF_v1.0.0.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION_v1.0.0.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_ROADMAP_VALIDATOR_MANDATE_v1.0.0.md
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | N/A |
| task_id | ROADMAP_VALIDATOR_AND_UI_LAYOUT_ALIGNMENT |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Executive Summary

Team 190 זיהה פער ולידציה במפת הדרכים של Agents_OS: רכיב Stage/Program Conflict ב-`PIPELINE_ROADMAP.html` מייצר התרעת conflict גם במצב שבו קיימת הרשאת חריג אדריכלית מפורשת (Deferred Parallel Activation).

בנוסף, זוהה פער עקביות UX מבני בין עמודי ה-UI (Roadmap מול Dashboard) שמעלה סיכון ל-drift תפעולי ולבלבול מפעיל.

נדרש מ-Team 100 להכניס את הסעיפים המפורטים במסמך זה כחלק מהחבילה שהוא מכין כרגע ל-Team 61, כ-Amendment רשמי ומחייב.

## 2) Findings (Canonical)

| finding_id | severity | status | description | evidence_by_path | route_recommendation |
|---|---|---|---|---|---|
| SPC-01 | HIGH | OPEN | Rule קשיח בעמוד Roadmap מסמן conflict כאשר `pipeline_state.stage_id` שייך לשלב שסגור, ללא בדיקת חריג אדריכלי מאושר. | `agents_os/ui/PIPELINE_ROADMAP.html:581`, `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION_v1.0.0.md:47`, `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION_v1.0.0.md:54` | להוסיף שכבת Authorization Check: אם יש activation authority תקף, להציג `AUTHORIZED_PARALLEL_ACTIVATION` במקום `Stage/Program Conflict`. |
| SPC-02 | MEDIUM | OPEN | Roadmap UI קורא state כללי `pipeline_state.json` במקום state דומייני מובחן — מגביר ambiguity בין domains. | `agents_os/ui/PIPELINE_ROADMAP.html:400`, `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json`, `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` | מעבר לטעינת state דומייני (`pipeline_state_tiktrack.json` / `pipeline_state_agentsos.json`) עם fallback מסומן בלבד. |
| SPC-03 | MEDIUM | OPEN | קיימת דרישה ארכיטקטונית לזיהוי mismatch מול WSM עם בדיקת directive, אך המימוש החזותי עדיין לא סוגר את הלופ עד הסוף. | `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_ROADMAP_VALIDATOR_MANDATE_v1.0.0.md:67` | לכלול את M3 במימוש הקרוב של Team 61 כחלק מה-validator logic. |
| UI-01 | HIGH | OPEN | אי-עקביות פריסת sidebar בין Dashboard ל-Roadmap (צד/יישור/רוחב). | השוואת runtime UX בין `agents_os/ui/PIPELINE_DASHBOARD.html` ל-`agents_os/ui/PIPELINE_ROADMAP.html` | לנעול Layout Contract אחיד לכל העמודים, עם Sidebar במיקום זהה, רוחב זהה, ויישור זהה. |
| UI-02 | HIGH | OPEN | עמוד Roadmap איבד חלוקת שתי עמודות נדרשת (מפה + פרטי תוכנית). | דרישת הפעלה נוכחית; behavior נצפה בעמוד map | להחזיר מבנה דו-עמודי קבוע: Column A = Roadmap navigator; Column B = Program details panels. |
| UI-03 | MEDIUM | OPEN | כפתור Refresh/כותרת לא מנוהלים בתבנית קבועה ואחידה בכל עמודי המערכת. | `agents_os/ui/PIPELINE_ROADMAP.html:180` (Refresh), שונות מבנית בין עמודים | להגדיר Header Contract אחיד לכל עמודי UI + מיקום קבוע ל-Refresh בכותרת. |

## 3) Root Cause Analysis

1. Validator בעמוד Roadmap נשען על כלל חד-ערכי: "stage סגור => conflict", ללא שכבת exception-authority.
2. ייצוג state בעמוד Roadmap עדיין מבוסס על alias legacy במקום source דומייני מובהק.
3. חבילת האופטימיזציה הנוכחית מתמקדת בפיצול CSS/JS, אך לא כוללת מספיק דרישות מחייבות ל-layout canon אחיד בין כל המסכים.

## 4) Mandatory Amendment Request to Team 100 (for current Team 61 package)

Team 190 מבקש להוסיף לחבילת Team 61 (הנמצאת כעת בהכנה לאישור אדריכלי) סעיף Amendment מחייב הכולל:

### A) Roadmap Validator Logic Hardening

1. להוסיף מודל תוצאה תלת-מצבי ל-stage check:
   - `CONFLICT_BLOCKING`
   - `AUTHORIZED_EXCEPTION`
   - `OK`
2. לקשור `AUTHORIZED_EXCEPTION` ל-reference מפורש (`activation_authority_ref`) ולא לטקסט חופשי.
3. להוסיף rule: mismatch stage מול WSM לא ייחשב blocker אם קיים directive מאושר ומתועד.

### B) Domain-State Source Lock

1. Roadmap page יטען state לפי domain נבחר (`tiktrack` / `agents_os`) מקבצים ייעודיים.
2. `pipeline_state.json` ישמש fallback בלבד, עם badge "LEGACY_FALLBACK".

### C) Canonical UI Layout Contract (new required section)

1. **Sidebar consistency**: Sidebar באותו צד, אותו רוחב, אותו alignment כמו Dashboard — בכל העמודים.
2. **Two-column roadmap structure**: עמודת מפה קבועה + עמודת פרטי תוכנית קבועה.
3. **Unified header + refresh placement**: כותרת מערכת אחידה ומיקום refresh קבוע בכל העמודים.

## 5) Acceptance Criteria (Team 100 lock)

| AC | Criterion | Required Evidence |
|---|---|---|
| AC-01 | אין false conflict כאשר יש activation directive מאושר | screenshot/log + code path reference |
| AC-02 | בחירת domain משנה source state לקובץ ייעודי | network/log evidence |
| AC-03 | Sidebar אחיד בין Dashboard/Roadmap/Teams | visual diff + CSS contract reference |
| AC-04 | Roadmap מציג שתי עמודות קבועות | runtime screenshot + DOM structure note |
| AC-05 | Header + Refresh אחידים בכל העמודים | screenshot bundle + selector contract |

## 6) Priority and Sequencing Recommendation

1. Priority P1: SPC-01 + SPC-02 (validator correctness) — לפני/ביחד עם תחילת מימוש UI refactor.
2. Priority P1: UI-01 + UI-02 + UI-03 — להיכנס כ-requirements קשיחים באותה חבילה (לא כ-nice-to-have).
3. AOUI-F02 (תיעוד CSS index) נשאר action פתוח ל-Team 10/170 לאחר merge.

## 7) Requested Decision from Team 100

נא להחזיר אחת משלוש:
1. `AMENDMENT_APPROVED_AND_INTEGRATED`
2. `APPROVED_WITH_MODIFICATIONS`
3. `BLOCK_FOR_FIX`

בכל מקרה שאינו (1), נדרש טבלת ממצאים קאנונית עם route_recommendation.

---

log_entry | TEAM_190 | TO_TEAM_100 | ROADMAP_CONFLICT_AND_UI_LAYOUT_AMENDMENT_REQUEST | ACTION_REQUIRED | 2026-03-14
