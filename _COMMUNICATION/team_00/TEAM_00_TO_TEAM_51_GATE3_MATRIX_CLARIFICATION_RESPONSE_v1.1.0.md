---
id: TEAM_00_TO_TEAM_51_GATE3_MATRIX_CLARIFICATION_RESPONSE_v1.1.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: Team 51 (AOS QA)
cc: Team 100 (Chief Architect), Team 31 (AOS Frontend), Team 11 (AOS Gateway)
date: 2026-03-27
type: CLARIFICATION_RESPONSE — canonical
domain: agents_os
in_response_to: TEAM_51_TO_TEAM_100_GATE3_VISUAL_MATRIX_CLARIFICATION_REQUEST_v1.0.0
supersedes: TEAM_00_TO_TEAM_51_GATE3_MATRIX_CLARIFICATION_RESPONSE_v1.0.0
basis_spec: TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0---

# Team 00 → Team 51 — Gate 3 Visual Matrix: תגובה קנונית לשאלות הבהרה

## תוצאת ביניים

| שאלה | סטטוס | מקור סמכות |
|---|---|---|
| Q1 — assembled prompt ↔ phase | **ANSWERED FROM SPEC** | spec v1.1.0 §6.1 |
| Q2 — CONFIRM_ADVANCE = תא GATE_3? | **ANSWERED FROM SPEC + TEAM_00 DECISION** | spec v1.1.0 §6.1.D, §10.7 |
| Q3 — escalated / human_gate ← G2 override | **TEAM_00 DECISION** | ראו §3 הלן |

---

## Q1 — האם assembled prompt חייב לשקף `current_phase_id`?

### תשובה

**כן — ב-BUILD/prod: assembled prompt חייב לשקף את `current_phase_id` הנוכחי.**
**לצורך מטריצת הצילומים: גוף ה-placeholder text הסטטי תקין; ה-gate/phase line חייב להשתנות.**

### בסיס אפיון

spec v1.1.0 §6.1 ("Assembled Prompt Block"), שורת הדוגמה המפורשת:

```
gate/phase:   GATE_3 / phase_3_1
```

שדה `gate/phase` הוא **חלק ממבנה הפרומפט המורכב** — לא metadata בסרגל צד בלבד. הפרומפט הוא חבילת ההקשר המועתקת ל-IDE. ה-phase קובע את:
- היקף המשימה הנוכחית לסוכן
- ה-deliverables והקריטריונים לקבלה
- השלב בתוך השער הנוכחי

ב-BUILD: השרת מרכיב את הפרומפט עם `current_phase_id` כפי שנקרא מ-`GET /api/state` — `current_phase_id` הוא שדה ב-response (spec v1.1.0 §10.7, שורה 725). זהו **Iron Rule** (AD-S8B-01: dashboard renders, never computes — server is SSOT).

### הנחיה לצילומים

עבור כל preset שיש לו `run_id` (= מצב with active run):
- `applyGate3PhaseOverride(state, "phase_3_1")` ← צילום ראשון
- `applyGate3PhaseOverride(state, "phase_3_2")` ← צילום שני

הפונקציה (app.js שורה 1836–1870) מעדכנת:
- `state.current_phase_id`
- `state.next_action.label` (החלפת phase_3_1 ↔ phase_3_2)
- `state.next_action.cli_command` (החלפת phase string)
- `state.next_action.target_phase`
- `state.previous_event.phase_id`
- `state.correction_blocking.phase_id`

**ה-gate/phase line בבלוק המורכב חייבת להשתנות בין שני הצילומים.** ודאו שזה מתרחש לפני הגשת המטריצה.

---

## Q2 — האם `CONFIRM_ADVANCE` (target_gate=GATE_4) הוא תא GATE_3?

### תשובה: **כן — CONFIRM_ADVANCE עם target_gate=GATE_4 הוא תא GATE_3 מלא. כללו אותו במטריצה.**

### בסיס אפיון

spec v1.1.0 §6.1.D ("Operator Handoff — NEXT sub-section"), שורה 204:

> **CONFIRM_ADVANCE state** (feedback ingested, verdict=PASS)

הגדרת ה-state מפורשת: הרץ נמצא עדיין בשער הנוכחי, ממתין לאישור המשתמש להתקדמות. `target_gate` ב-`next_action` מציין **לאן יעבור הרץ אחרי שהמשתמש יאשר** — לא את מיקומו הנוכחי.

spec v1.1.0 §10.7 (טבלת `next_action` computation, שורות 811-821):

| Run Status | has_pending | verdict | next_action.type |
|---|---|---|---|
| IN_PROGRESS | true | PASS | **CONFIRM_ADVANCE** |
| CORRECTION | true | PASS | **CONFIRM_ADVANCE** |

`current_gate_id` = GATE_3 בשני המקרים. ה-run לא הוסר מ-GATE_3 עד שהאופרטור מפעיל `POST /api/runs/{run_id}/advance`.

### הבחנה חשובה לצילומים

| תא | current_gate_id | next_action.type | target_gate | חלק ממטריצת G3? |
|---|---|---|---|---|
| PASS — pending confirmation | GATE_3 | CONFIRM_ADVANCE | GATE_4 | **✓ כן** |
| אחרי ביצוע advance | GATE_4 | AWAIT_FEEDBACK | — | **✗ לא — תא G4** |

**תווית תא מומלצת:** `G3 / PASS — pending advance confirmation`

---

## Q3 — Presets `escalated` + `human_gate` (seeded on GATE_2)

### תשובה: **TEAM_00 DECISION — כללו אותם במטריצת GATE_3 עם gate override. אין מטריצת GATE_2 נפרדת מבקשה זו.**

### נימוק

1. **שני המצבים יכולים להתרחש בכל שער**, לא רק ב-GATE_2. ה-seed ב-GATE_2 הוא מקרי — נוצר לצורך מגוון ה-mock data בלבד.
   - `escalated` = CORRECTION cycle active (יכול להתחיל בכל שער שנכשל)
   - `human_gate` = HITL gate (יכול להיות מוגדר לכל שער עם `is_human_gate=1`)

2. **מטרת ה-principal:** "כל המצבים האפשריים בשלב לדוגמה (GATE_3)" — כלומר מפה ויזואלית מלאה של כל next_action.type אפשרי. שני ה-presets מוסיפים:
   - `escalated` → CONFIRM_FAIL עם correction context
   - `human_gate` → HUMAN_APPROVE (מצב ייחודי — כפתור אישור הפרינציפל)

3. **`applyGate3PhaseOverride` בנוי לזה בדיוק** — מעדכן gate/phase ב-state, ב-next_action, ב-previous_event וב-correction_blocking.

### תנאי הכללה

ודאו ש-`state.run_id` קיים בשני ה-presets לפני הפעלת override — הפונקציה בודקת `if (!state || !state.run_id) return`. בדקו ב-app.js ש-`MOCK_STATE_ESCALATED` ו-`MOCK_STATE_HUMAN_GATE` מכילים `run_id`.

---

## 4. מטריצת הצילומים המלאה — GATE_3

### 4.1 presets עם gate context — 12 × 2 פאזות = 24 תאים

| # | Preset key | next_action.type | תיאור | phase_3_1 | phase_3_2 |
|---|---|---|---|---|---|
| 1 | `active` | AWAIT_FEEDBACK | In-progress, ממתין לסיום סוכן | ✓ | ✓ |
| 2 | `await_feedback` | AWAIT_FEEDBACK (mode buttons) | 3 כפתורי Detection Mode גלויים | ✓ | ✓ |
| 3 | `feedback_fallback` | AWAIT_FEEDBACK (fallback) | לאחר כשל Mode B — fallback required | ✓ | ✓ |
| 4 | `feedback_pass` | CONFIRM_ADVANCE | PASS verdict ingested (HIGH/MEDIUM confidence) | ✓ | ✓ |
| 5 | `feedback_fail` | CONFIRM_FAIL | FAIL verdict + blocking findings list | ✓ | ✓ |
| 6 | `feedback_low` | MANUAL_REVIEW | IL-3 low confidence — raw display | ✓ | ✓ |
| 7 | `correction_blocking` | CONFIRM_FAIL | CORRECTION cycle — BF section expanded | ✓ | ✓ |
| 8 | `paused` | RESUME | Run מושהה | ✓ | ✓ |
| 9 | `escalated` | CONFIRM_FAIL (correction) | CORRECTION_ESCALATED banner | ✓ | ✓ |
| 10 | `human_gate` | HUMAN_APPROVE | HITL gate — כפתור אישור הפרינציפל | ✓ | ✓ |
| 11 | `sentinel` | AWAIT_FEEDBACK | Sentinel validation active | ✓ | ✓ |
| 12 | `sse_connected` | AWAIT_FEEDBACK | כנ"ל + SSE header indicator = connected | ✓ | ✓ |

**סה"כ:** 12 × 2 = **24 תאים**

> **הערה:** `sse_connected` הוא overlay (SSE indicator בלבד) — לא preset pipeline נפרד לצורך ספירת ה-13. הוא מיוצג כתא נפרד במטריצה כי הוא מציג מצב UI שונה (SSE connected vs. polling fallback).

### 4.2 presets ללא gate context — תא יחיד ללא override

| # | Preset key | מצב | הערה |
|---|---|---|---|
| 13 | `idle` | IDLE | אין רץ פעיל — IDLE form גלוי |
| 14 | `complete` | COMPLETE | הרץ הסתיים — סיכום גלוי |

**סה"כ:** 2 תאים

### 4.3 סה"כ מטריצה: **26 צילומים**

---

## 5. URL parameters — טבלה מלאה

פורמט בסיס: `http://127.0.0.1:8766/agents_os_v3/ui/index.html?aosv3_preset={key}&aosv3_phase={phase}`

### תאים עם שתי פאזות

| תא | URL (phase_3_1) | URL (phase_3_2) |
|---|---|---|
| active/p1 | `?aosv3_preset=active&aosv3_phase=phase_3_1` | `?aosv3_preset=active&aosv3_phase=phase_3_2` |
| await_feedback/p1 | `?aosv3_preset=await_feedback&aosv3_phase=phase_3_1` | `?aosv3_preset=await_feedback&aosv3_phase=phase_3_2` |
| feedback_fallback | `?aosv3_preset=feedback_fallback&aosv3_phase=phase_3_1` | `?aosv3_preset=feedback_fallback&aosv3_phase=phase_3_2` |
| feedback_pass | `?aosv3_preset=feedback_pass&aosv3_phase=phase_3_1` | `?aosv3_preset=feedback_pass&aosv3_phase=phase_3_2` |
| feedback_fail | `?aosv3_preset=feedback_fail&aosv3_phase=phase_3_1` | `?aosv3_preset=feedback_fail&aosv3_phase=phase_3_2` |
| feedback_low | `?aosv3_preset=feedback_low&aosv3_phase=phase_3_1` | `?aosv3_preset=feedback_low&aosv3_phase=phase_3_2` |
| correction_blocking | `?aosv3_preset=correction_blocking&aosv3_phase=phase_3_1` | `?aosv3_preset=correction_blocking&aosv3_phase=phase_3_2` |
| paused | `?aosv3_preset=paused&aosv3_phase=phase_3_1` | `?aosv3_preset=paused&aosv3_phase=phase_3_2` |
| escalated | `?aosv3_preset=escalated&aosv3_phase=phase_3_1` | `?aosv3_preset=escalated&aosv3_phase=phase_3_2` |
| human_gate | `?aosv3_preset=human_gate&aosv3_phase=phase_3_1` | `?aosv3_preset=human_gate&aosv3_phase=phase_3_2` |
| sentinel | `?aosv3_preset=sentinel&aosv3_phase=phase_3_1` | `?aosv3_preset=sentinel&aosv3_phase=phase_3_2` |
| sse_connected | `?aosv3_preset=sse_connected&aosv3_phase=phase_3_1` | `?aosv3_preset=sse_connected&aosv3_phase=phase_3_2` |

### תאים ללא override

| תא | URL |
|---|---|
| idle | `?aosv3_preset=idle` |
| complete | `?aosv3_preset=complete` |

---

## 6. הנחיות לסקריפט `capture_gate3_matrix.mjs`

1. **ודאו gate/phase line:** עבור כל preset עם phase, ה-gate/phase line בבלוק המורכב חייבת להציג `GATE_3 / phase_3_1` או `GATE_3 / phase_3_2` בהתאם. אם לא — override לא פועל על אותו preset; דווחו.

2. **`escalated` + `human_gate` override:** ודאו ש-`MOCK_STATE_ESCALATED` ו-`MOCK_STATE_HUMAN_GATE` מכילים `run_id` (תנאי הפעלת `applyGate3PhaseOverride`). אם `run_id` חסר — דווחו לצוות 31 לפני הצילום.

3. **`sse_connected`:** preset זה מציג SSE indicator כ-connected. ודאו שה-SSE status chip בheader גלוי ומציג "connected" (ולא "polling").

4. **`idle` + `complete`:** לא להפעיל phase override — screenshot ללא `aosv3_phase` param.

5. **פורמט קובץ מומלץ:** `gate3_{preset}_{phase}.png`
   - דוגמה: `gate3_feedback_pass_phase_3_1.png`
   - IDLE/COMPLETE: `gate3_idle.png` / `gate3_complete.png`

6. **רזולוציה:** לפחות 1440px רוחב (desktop breakpoint — לפי spec §6 grid: `agents-page-layout` = `1fr 300px`).

7. **הגשה:** כל 26 קבצים + index table (`gate3_matrix_index.md`) עם שם קובץ, preset, phase, ו-next_action.type לכל תא.

---

## 7. לאחר השלמת הצילומים

לאחר הגשת המטריצה, היא תועבר ל-**Team 00 (Nimrod) לאישור UX**. זהו שלב "Phase 4.3" — הפרינציפל בוחן ישירות את הממשק (spec GATE_4 authority). אין צורך ב-QA נוסף מצוות 51 לאחר הגשת הצילומים — הם הולכים ישירות לפרינציפל.

**ציר זמן:**
```
Team 51 מגיש מטריצת 26 צילומים
        ↓
Team 00 בוחן UX — מזהה פערים / מאשר
        ↓
אם פערים: הנחיה ספציפית לצוות 31 לתיקונים
אם אישור: BUILD מורשה
```

---

**log_entry | TEAM_00 | GATE3_MATRIX | CLARIFICATION_RESPONSE_CANONICAL_TO_TEAM_51_v1.1.0 | 2026-03-27**
