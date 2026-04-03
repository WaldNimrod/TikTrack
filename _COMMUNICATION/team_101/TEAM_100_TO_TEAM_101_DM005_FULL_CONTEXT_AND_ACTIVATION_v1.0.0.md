---
id: TEAM_100_TO_TEAM_101_DM005_FULL_CONTEXT_AND_ACTIVATION_v1.0.0
historical_record: true
from: Team 100 (Gateway / Chief Architect)
to: Team 101 (AOS Domain Architect)
date: 2026-03-24
status: ACTIVE — FULL ACTIVATION PACKAGE
classification: ARCHITECTURAL_BRIEFING + EXECUTION_ORDER
authority: DM-005 v1.2.0 + Gateway Decision D1–D6
supersedes_activation: TEAM_100_TO_TEAM_101_DM005_ITEM2_ACTIVATION_v1.0.0.md---

# הפעלת Team 101 — DM-005 ITEM-1 + ITEM-2
## מסמך מלא — קונטקסט + החלטות + ביצוע + דרישות מסכנות

---

> **לאדריכל, לא רק למבצע.**
>
> Team 101 הוא **AOS Domain Architect** — הוא אחראי לא רק על ביצוע ה-ITEM-1/ITEM-2 אלא על **הפקת מסקנות ארכיטקטוניות מדויקות** מהריצה. SC Completion Report שיוגש חייב לשקף הבנה אנליטית מלאה, לא רק תוצאות pass/fail. מסמך זה מספק **את כל ההקשר הנדרש**.

---

## חלק A — מי אנחנו ואיפה אנחנו

### A.1 — מבנה הצוותים (רשימה קנונית)

| צוות | תפקיד | מנוע | domain |
|---|---|---|---|
| **Team 00** | System Designer (Principal — האדם היחיד במערכת) | Human | TikTrack + AOS |
| **Team 100** | Chief Architect / Gateway | Claude Code | TikTrack + AOS |
| **Team 101** | AOS Domain Architect / Stabilization Lead | OpenAI / Codex API | AOS |
| Team 61 | AOS Execution | Cursor Composer | AOS |
| Team 51 | QA / Validation | Gemini | AOS |
| Team 170 | Documentation / Registry | Cursor Composer | AOS + TT |
| Team 191 | GitHub & Backup | Cursor Composer | שניהם |
| Team 10/20/30/50 | TikTrack execution chain | Cursor Composer | TikTrack |

**עיקרון CROSS-ENGINE VALIDATION (Iron Rule):** כל פלט LLM מאומת ע"י agent שונה — מנוע שונה + סביבה שונה. לכן: Team 61 (Cursor) מבצע → Team 51 (Gemini) מאמת → Team 100 (Claude) בודק → Team 00 מאשר.

### A.2 — מבנה הפרויקט הכולל

```
Roadmap → Stage (S003 פעיל) → Program → Work Package → Gate (GATE_0..GATE_5)
```

**שני domains מקבילים:**
- **TIKTRACK** — אפליקציית TikTrack (FastAPI port 8082, Frontend port 8080)
- **AGENTS_OS** — מנוע ה-pipeline עצמו (agents_os_v2/)

**מסלולי ביצוע:**
- `TRACK_FULL` = TikTrack standard (Team 10 gateway + Teams 20/30/40/60 + Team 50 QA)
- `TRACK_FOCUSED` = AOS standard (Team 11 gateway + Team 61 + Team 51 QA) ← **נוגע לך**

---

## חלק B — היסטוריה רלוונטית (מה קרה + למה)

### B.1 — S003-P012: AOS Pipeline Operator Reliability (COMPLETE)

5 WPs רצו ב-S003-P012 (WP001–WP005) לייצוב מנוע ה-pipeline:
- WP001: Process Model v2.0 — TRACK_FOCUSED, Gate sequence canon
- WP002: JSON enforcer, remediation mandate generator
- WP003: State view, date governance
- WP004: Layer 2 tests (dashboard e2e), ssot_check
- WP005: Dashboard hardening (FIX-1..4) + test isolation

**תוצאה:** 208 pytest PASS, Layer 1 PASS, L2-SMOKE PASS, L2-PHASE-A PASS. Program COMPLETE 2026-03-21.

### B.2 — WP099 / WSM drift — שורש הבעיה (RESOLVED)

**מה קרה:**
WP099 הוא **מזהה סימולציה** שהופיע ב-`pipeline_state_agentsos.json` במהלך E2E simulation run. הבעיה: `run_e2e_simulation.sh` הריץ `./pipeline_run.sh pass` על ה-repo הראשי **בלי** בידוד, בזמן שה-state הכיל WP099. כל `pass/fail` כותב ל-WSM דרך `write_wsm_state()` — ולכן WP099 נצבע שוב ושוב ב-CURRENT_OPERATIONAL_STATE.

**לא** מגיע מ: pytest, mocks, verify_layer1, Selenium, generate_mocks.

**מה שנבנה לפתרון (Team 100, 2026-03-24):**

```
1. write_wsm_idle_reset()   — agents_os_v2/orchestrator/wsm_writer.py
   כותב N/A לכל 7 שדות COS כשאין WP פעיל

2. ./pipeline_run.sh wsm-reset
   פקודה חדשה — קוראת לwrite_wsm_idle_reset() + ssot_check

3. COMPLETE guard (pass + fail)
   אם gate=COMPLETE ומנסים pass/fail → ⛔ BLOCKED
   "Cannot pass gate COMPLETE — no WP to advance"

4. Extended ssot_check
   מגלה ghost fields (in_progress_work_package_id, active_program_id)
   כשgate=COMPLETE + מטפל נכון ב-N/A (לא false drift)
```

**מצב נוכחי (2026-03-24):**
- `pipeline_state_agentsos.json`: S003-P012-WP005 COMPLETE ✅
- `pipeline_state_tiktrack.json`: S003-P013-WP001 COMPLETE ✅
- `ssot_check tiktrack`: CONSISTENT ✅
- `ssot_check agents_os`: CONSISTENT ✅
- `pytest 208/208`: PASS ✅

### B.3 — S003-P013: TikTrack Canary Run (COMPLETE)

`S003-P013-WP001` — D33 display_name canary run ב-TikTrack. הוכיחה שמנוע ה-pipeline עובד end-to-end על TikTrack domain. COMPLETE 2026-03-23. pipeline_state_tiktrack.json = COMPLETE.

### B.4 — S003-P014: TikTrack E2E Operator Simulation (COMPLETE)

`S003-P014-WP001` — simulation ידנית ע"י Team 101 לאימות operator flow. ה-simulation הזו הייתה המקור לזיהום ה-WSM (ראה B.2). CLOSED 2026-03-23.

---

## חלק C — החלטות Gateway D1–D6 (עם נימוקים ארכיטקטוניים)

מסמך מלא: `TEAM_100_GATEWAY_DECISION_D1_D6_TEST_ISOLATION_v1.0.0.md`

### C.1 — D1: `run_canary_safe.sh` כפקודה קנונית (אושר ✅)

**הנימוק:** Layer 1 canary צריכה להיות safe-by-default — לא לדרוש isolation protocol מהמבצע. `run_canary_safe.sh` מממש זאת: מריץ generate_mocks + verify_layer1 + ssot_check **בלי** לגעת ב-pipeline_run. אין כתיבה ל-WSM.

```bash
bash scripts/canary_simulation/run_canary_safe.sh
# output צפוי: "OK — No pipeline_run.sh was executed"
```

**`CANARY_SKIP_SSOT=1`:** מותר רק כשיש drift ידוע מראש שאינו קשור לריצה (לדוגמה: הורצה `pipeline_run` ידנית לפני). אסור ב-CI. אחרי שימוש — חובה `wsm-reset` + re-run בלי skip לפני merge.

### C.2 — D2: ssot_check policy (strict ✅)

**הנימוק:** SSOT consistency הוא Iron Rule. drift = בעיה אמיתית שחייבת להיות מטופלת, לא ל"דלג" עליה. מדיניות:
- CI: strict (drift = block)
- ידנית עם drift ידוע: `CANARY_SKIP_SSOT=1` + ticket + חובה לתקן לפני merge

### C.3 — D3: L2-PHASE-A (CLOSED ✅)

**הנימוק:** השורש היה בטסט, לא במוצר. `checkExpectedFiles()` מחזירה badge=N/A כשgate=COMPLETE (זה נכון). הטסט ציפה ל-n/m (שגוי). התיקון: state-aware assertion שקוראת `gateText` ומסתעפת — COMPLETE/NONE → מצפה ל-N/A badge + "not applicable"; Active gate → מצפה ל-n/m + file rows.

קוד תוקן ב: `tests/pipeline-dashboard-phase-a.e2e.test.js`
תוצאה: L2-SMOKE PASS ✓ L2-PHASE-A PASS ✓

### C.4 — D4: E2E scripts = operator-only (אושר + implemented ✅)

**הנימוק:** כל סקריפט שמריץ `pipeline_run pass/fail` כותב ל-WSM — זו אסימטריה בין "בדיקה" לבין "שינוי state". בדיקות CI מותרות רק על layer שלא משנה state. סקריפטי E2E שמשנים state = operator-only עם isolation protocol מחייב.

**checklist בידוד — לפני כל E2E simulation:**
```bash
# 1. גיבוי state
git stash -- \
  _COMMUNICATION/agents_os/pipeline_state_tiktrack.json \
  _COMMUNICATION/agents_os/pipeline_state_agentsos.json \
  documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md

# 2. אמת: אין מזהה סימולציה ב-agentsos state
python3 -c "
import json; d=json.loads(open('_COMMUNICATION/agents_os/pipeline_state_agentsos.json').read())
wp = d.get('work_package_id','')
assert 'WP099' not in wp and wp != '', f'BAD: {wp}'
print('OK:', wp)
"

# 3. הרץ simulation...

# 4. שחזור אחרי
./pipeline_run.sh wsm-reset
git checkout HEAD -- \
  _COMMUNICATION/agents_os/pipeline_state_tiktrack.json \
  _COMMUNICATION/agents_os/pipeline_state_agentsos.json \
  documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md
python3 -m agents_os_v2.tools.ssot_check && python3 -m agents_os_v2.tools.ssot_check --domain agents_os
```

### C.5 — D5: pipeline_run guards (חלקי ✅, simulation token → S004)

**מה deployed:**
- COMPLETE guard ב-`pass`: חוסם כשgate=COMPLETE
- COMPLETE guard ב-`fail`: חוסם כשgate=COMPLETE
- `wsm-reset` command: שחזור מלא ב-5 שניות

**מה נדחה ל-S004:** `--i-know-this-is-sim` simulation token — מאפשר לעקוף guard לצורך simulation מפורשת. לא blocking.

**נימוק לדחייה:** COMPLETE guard מספק הגנה מספקת לפי principle "make the dangerous thing hard". simulation token הוא optimization, לא safety.

### C.6 — D6: WP099 → sandbox registry (נדחה ל-S004 ✅)

**נימוק:** WP099 הוא historical artifact. ניקוי registry בעוד AOS בשימוש פעיל → risk מיותר. Team 170 יסמן EXCLUDED/SIMULATION_ONLY ב-S004 cleanup. עד אז: WP099 אסור ב-pipeline_state חי.

---

## חלק D — מצב SC criteria (עדכני)

| SC | תיאור | מצב |
|---|---|---|
| SC-AOS-01 | WP099 cleared; ssot_check exit 0 | ✅ MET |
| **SC-AOS-02** | WP002 formal deferral document | ⏳ **ITEM-1** |
| **SC-AOS-03** | G0→G5 verification run COMPLETE | ⏳ **ITEM-2** |
| SC-AOS-04 | GATE_2 five-phase canary level | ✅ MET |
| SC-AOS-05 | ssot_check agents_os exit 0 | ✅ MET |
| SC-TT-01 | pipeline_state_tiktrack COMPLETE | ✅ MET |
| SC-TT-02 | ssot_check tiktrack exit 0 | ✅ MET |
| **SC-TT-03** | pipeline_run.sh verified end-to-end | ⏳ **ITEM-2** |
| SC-TEST-01 | pytest 208+ PASS | ✅ MET (208) |
| SC-TEST-02 | Layer 1 canary PASS | ✅ MET |
| SC-TEST-03 | Layer 2 Selenium PASS | ✅ MET |
| **SC-UI-01** | Dashboard visual review (Principal) | ⏳ נפרד |
| **SC-UI-02** | Dashboard zero 404 + zero SEVERE בריצה | ⏳ **ITEM-3** |
| SC-UI-03 | Dashboard build zero SEVERE (pre-run) | ✅ MET (ITEM-0 CLOSED) |
| SC-UI-04 | Refresh + last-updated | ✅ MET |
| SC-UI-05 | DM badge accurate | ✅ MET |

---

## חלק E — ביצוע ITEM-1 (SC-AOS-02)

### E.1 — מה נדרש

**צור:**
```
_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_FORMAL_DEFERRAL_v1.0.0.md
```

### E.2 — תוכן מינימלי

```markdown
---
id: TEAM_101_S003_P011_WP002_FORMAL_DEFERRAL_v1.0.0
date: 2026-03-24
authority: DM-005 v1.2.0
scope_target: S004
---

## הצהרה

S003-P011-WP002 (AOS Pipeline Stabilization — extended hardening scope)
מועבר ל-**DEFERRED_TO_S004**.

## נימוק

ייצוב AOS הושג: 208 pytest PASS, Layer 1+2 PASS, ssot_check CONSISTENT,
dashboard zero-404. מוכן לפתיחת TikTrack Phase 2.
מקור: TEAM_101_TO_TEAM_00_S003_PIPELINE_STABILITY_ASSESSMENT_v1.0.0.md

## Scope lock — S004

KB-26..KB-39 (כל הפריטים שלא מומשו ב-WP002):
[פרט כאן כל KB ב-status OPEN/DEFERRED]

## WSM effect

WP002 אינו active ולא יופיע ב-pipeline_state.
Last real completed AOS WP: S003-P012-WP005.
```

**SC-AOS-02 → MET ✅ לאחר קיום המסמך.**

---

## חלק F — ביצוע ITEM-2: G0→G5 Verification Run

### F.1 — WP ייעודי

**רשום ב-Program Registry לפני שמתחילים:**

הוסף לקובץ `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`:
```
| S003 | S003-P015 | AOS Pipeline Verification Run | AGENTS_OS | PLANNED | — DM-005 ITEM-2 verification run (documentation-only scope) |
```

**authority:** DM-005 cascade authorization — Team 101 מורשה לרשום.

**הכן `pipeline_state_agentsos.json`:**
```json
{
  "work_package_id": "S003-P015-WP001",
  "stage_id": "S003",
  "project_domain": "agents_os",
  "spec_brief": "DM-005 ITEM-2 — AOS pipeline verification run (documentation-only)",
  "current_gate": "NOT_STARTED",
  "gates_completed": [],
  "gates_failed": [],
  "process_variant": "TRACK_FOCUSED",
  "lld400_content": "",
  "work_plan": ""
}
```

> **⚠️ חובה:** לפני שכותבים קובץ זה — בצע git stash לשלושת קבצי ה-state (ראה D4 checklist לעיל).

### F.2 — ריצת G0→G5 (TRACK_FOCUSED)

**TRACK_FOCUSED = Team 11 (gateway) + Team 61 (execution) + Team 51 (QA)**

#### GATE_0 (Team 11)
```bash
./pipeline_run.sh --domain agents_os        # generate GATE_0 prompt → paste to Team 11
./pipeline_run.sh --domain agents_os pass   # after Team 11 PASS
python3 -m agents_os_v2.tools.ssot_check --domain agents_os  # MUST: CONSISTENT
```

#### GATE_1 (Team 61)
```bash
./pipeline_run.sh --domain agents_os        # GATE_1 prompt → Team 61
# Team 61 writes LLD400
./pipeline_run.sh --domain agents_os store GATE_1 <LLD400_PATH>
./pipeline_run.sh --domain agents_os pass
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
```

#### GATE_2 (Team 90 validation — five phases)
```bash
# Phase 2.1
./pipeline_run.sh --domain agents_os --wp S003-P015-WP001 --gate GATE_2 --phase 2.1 pass
# Phase 2.1v
./pipeline_run.sh --domain agents_os --wp S003-P015-WP001 --gate GATE_2 --phase 2.1v pass
# Phase 2.2
./pipeline_run.sh --domain agents_os --wp S003-P015-WP001 --gate GATE_2 --phase 2.2 pass
# Phase 2.2v
./pipeline_run.sh --domain agents_os --wp S003-P015-WP001 --gate GATE_2 --phase 2.2v pass
# Phase 2.3 → full GATE_2 close
./pipeline_run.sh --domain agents_os --wp S003-P015-WP001 --gate GATE_2 --phase 2.3 pass
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
python3 -m pytest agents_os_v2/tests/ -q
```

#### GATE_3 (Team 61 implementation)
```bash
./pipeline_run.sh --domain agents_os        # GATE_3 prompt
# Team 61 implements (documentation-only scope — כתיבת markdown)
./pipeline_run.sh --domain agents_os pass
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
```

#### GATE_4 (Team 51 QA)
```bash
./pipeline_run.sh --domain agents_os        # GATE_4 prompt → Team 51
# Team 51 validates: 208+ tests PASS
./pipeline_run.sh --domain agents_os pass
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
python3 -m pytest agents_os_v2/tests/ -q
```

#### GATE_5 (Team 90 final — COMPLETE)
```bash
./pipeline_run.sh --domain agents_os        # GATE_5 prompt → Team 90
# Team 90 validates
./pipeline_run.sh --domain agents_os pass   # → gate becomes COMPLETE

# MANDATORY IMMEDIATELY AFTER COMPLETE:
./pipeline_run.sh --domain agents_os wsm-reset
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
# MUST: CONSISTENT — if not, stop and report to Team 100
```

### F.3 — Blocking error protocol

אם `pipeline_run.sh` מחזיר שגיאה בכל gate:
```
1. עצור
2. תעד: exact error message + gate + command
3. הפעל Team 61 לתיקון
4. Team 51 QA regression (208+ tests)
5. חזור לGATE_0 — restart מהתחלה
6. חזרה שנייה על אותה שגיאה → escalate לTeam 100
```

### F.4 — ITEM-3: Dashboard sweep במהלך ITEM-2

בכל gate — תעד:
```
□ screenshot Dashboard + console DevTools
□ WHO ברור (איזה צוות עובד עכשיו)
□ WHAT NOW ברור (מה הפעולה הנדרשת)
□ Mandate content זמין וניתן לנווט אליו
□ ZERO 404 בconsole
□ ZERO SEVERE logs (מ-Dashboard JS — לא מbrowser עצמו)
□ No blocking error visible to operator
```

---

## חלק G — גבולות ואיסורים

| איסור | הסבר |
|---|---|
| `pipeline_run.sh pass/fail` ללא `--domain agents_os` | ברירת מחדל = tiktrack; TikTrack state שייך ל-Team 00 בלבד |
| שינוי `pipeline_state_tiktrack.json` | **אסור** — TikTrack domain sealed |
| הפעלת Team 10/20/30/40/50 | TikTrack Phase 2 — לאחר DM-005 CLOSED |
| `pipeline_run.sh pass/fail` כשgate=COMPLETE | חסום אוטומטית ⛔ — זה הכוונה |
| עריכה ידנית של WSM | השתמש ב-`wsm-reset` בלבד |
| הרצת `run_e2e_simulation.sh` ללא isolation protocol | operator-only + D4 checklist |

---

## חלק H — תוצרים נדרשים + SC Completion Report

### H.1 — קבצים לייצור

| תוצר | נתיב |
|---|---|
| WP002 deferral | `_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_FORMAL_DEFERRAL_v1.0.0.md` |
| Errata note | `_COMMUNICATION/team_101/TEAM_101_S003_STABILITY_SCOPE_ERRATA_v1.0.0.md` |
| **SC Completion Report** | `_COMMUNICATION/team_101/TEAM_101_DM_005_SC_COMPLETION_REPORT_v1.0.0.md` |

### H.2 — SC Completion Report — מה לכלול

זהו מסמך ארכיטקטוני — **לא טבלת ✓/✗ בלבד**. נדרש:

#### §1 — SC Table

```
SC-AOS-01: MET ✅ — evidence: ssot_check exit 0 post wsm-reset
SC-AOS-02: MET ✅ — evidence: FORMAL_DEFERRAL_v1.0.0 path + KB-26..39 list
SC-AOS-03: MET_VERIFIED ✅ — evidence: screenshot every gate + ssot_check per gate
SC-AOS-04: MET ✅ — carried from S003-P012 validation
SC-AOS-05: MET ✅ — evidence: ssot_check agents_os exit 0 (current session)
SC-TT-01/02: MET ✅ — pipeline_state_tiktrack COMPLETE; ssot_check tiktrack exit 0
SC-TT-03: MET_VERIFIED ✅ — evidence: pipeline_run.sh worked GATE_0→GATE_5 without errors
SC-TEST-01: MET ✅ — evidence: pytest X/208 PASS [post-run count]
SC-TEST-02: MET ✅ — evidence: run_canary_safe.sh output
SC-TEST-03: MET ✅ — evidence: L2-SMOKE PASS + L2-PHASE-A PASS
SC-UI-02: MET_VERIFIED ✅ — evidence: per-gate console screenshots
SC-UI-03/04/05: MET ✅ — carried from ITEM-0 closure
```

#### §2 — מסקנות ארכיטקטוניות (חובה)

**Team 101 נדרש להפיק עמדה ארכיטקטונית על כל אחד:**

**מסקנה A — בשלות מנוע ה-pipeline:**
האם לדעת Team 101, לאחר ריצת G0→G5, מנוע ה-pipeline מוכן ל-production use ב-TikTrack S003-P004? מה נצפה בריצה שתומך/מסייג?

**מסקנה B — נקודות שבירות שנצפו:**
האם היו נקודות בריצה שנדרשה התערבות שאינה documented? אם כן — פרט exact gate + הסיבה + האם צריך תיעוד.

**מסקנה C — test coverage assessment:**
208 tests — האם coverage מספיקה ל-TikTrack S003-P004 scope? ממה בפרט חסר coverage?

**מסקנה D — isolation protocol adequacy:**
האם checklist D4 (גיבוי + שחזור) מספיק להגנה על state בריצות עתידיות? מה לשפר?

**מסקנה E — WSM structural fix assessment:**
COMPLETE guard + wsm-reset — האם פתרו את הבעיה מהשורש? האם נדרש עוד משהו?

#### §3 — הצהרות חובה

```
□ "Pipeline מוכן לפתיחת Phase 2 — TikTrack S003-P004" — כן/לא (עם נימוק)
□ "Dashboard — ZERO console 404 errors, ZERO SEVERE logs לאורך כל הריצה" — כן/לא
□ "ssot_check CONSISTENT בשני domains לאורך כל הריצה" — כן/לא
□ "pytest 208+ PASS לאחר כל שינוי קוד בריצה" — כן/לא
```

#### §4 — פערים שנותרו (OPEN items)

כל דבר שנצפה ולא כוסה ב-DM-005 scope → ציין עם:
- תיאור ממצא
- חומרה (blocking / non-blocking / nice-to-have)
- המלצה: S004 / immediate / ignore

---

## חלק I — תרשים return path

```
Team 101
  → ITEM-1 done (WP002 deferral) ─────────────────────────────┐
  → ITEM-2+3 done (G0→G5 + screenshots) ──────────────────────┤
  → TEAM_101_DM_005_SC_COMPLETION_REPORT_v1.0.0.md ────────────┘
        ↓
Team 100 architectural review (AC-00..09)
        ↓
  PASS → DM-005 CLOSED → Team 00 פותח S003-P004
  FAIL → Team 100 מציין exact blocking item → Team 101 מתקן
```

---

## חלק J — מידע סביבה

| פריט | ערך |
|---|---|
| repo root | `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/` |
| backend | FastAPI, port 8082, `/api/v1/` |
| frontend | port 8080 |
| AOS pipeline state | `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` |
| TikTrack pipeline state | `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` |
| WSM | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` |
| Dashboard UI | `agents_os/ui/` (serve via `start_ui_server.sh`) |
| pytest | `python3 -m pytest agents_os_v2/tests/ -q` |
| ssot_check | `python3 -m agents_os_v2.tools.ssot_check [--domain agents_os\|tiktrack]` |
| wsm-reset | `./pipeline_run.sh --domain agents_os wsm-reset` |
| canary safe | `bash scripts/canary_simulation/run_canary_safe.sh` |

---

**log_entry | TEAM_100 | DM_005_FULL_CONTEXT_ACTIVATION | TEAM_101_ARCHITECTURAL_BRIEFING | ITEM1_ITEM2_AUTHORIZED | 2026-03-24**
