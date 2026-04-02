---
id: TEAM_100_TO_TEAM_101_DM005_ITEM2_ACTIVATION_v1.0.0
historical_record: true
from: Team 100 (Chief Architect)
to: Team 101 (AOS Domain Architect / Stabilization Lead)
date: 2026-03-24
status: ACTIVE — ACTIVATION ORDER
priority: HIGH
subject: DM-005 — ITEM-0 CLOSED, WSM structural fix deployed. Activate ITEM-1 + ITEM-2 immediately.
mandate_ref: TEAM_00_TO_TEAM_101_DM_005_PIPELINE_STABILIZATION_MANDATE_v1.2.0.md---

# TEAM 101 ACTIVATION — DM-005 ITEM-1 + ITEM-2

---

## §1 — מצב עדכני (קרא לפני הכל)

### מה הושלם לפני ההפעלה שלך

| פריט | סטטוס | ביצע |
|---|---|---|
| **ITEM-0** — Dashboard hardening (zero 404 + zero SEVERE) | ✅ **CLOSED** | Team 61 + Team 51 QA + Team 100 review |
| **WSM structural fix** — COMPLETE guard + `wsm-reset` | ✅ **DEPLOYED** | Team 100 (2026-03-24) |
| **WSM cleanup** — כל 7 שדות WP099 ניקו | ✅ **DONE** | Team 100 (2026-03-24) |
| **ssot_check** — CONSISTENT both domains | ✅ **VERIFIED** | 2026-03-24 |
| **Pipeline test suite** | ✅ **208/208 PASS** | 2026-03-24 |

### WSM structural fix — חובה לדעת

**שני שינויים קריטיים נפרסו ב-pipeline_run.sh:**

**1. COMPLETE guard (pass + fail):**
```
./pipeline_run.sh --domain agents_os pass    → ⛔ BLOCKED אם gate=COMPLETE
./pipeline_run.sh --domain agents_os fail    → ⛔ BLOCKED אם gate=COMPLETE
```
אם תנסה להריץ pass/fail כאשר אין WP פעיל — הפקודה תיחסם אוטומטית ותציג:
```
⛔ NO ACTIVE WORK PACKAGE — pipeline is in COMPLETE state
```
**זה הכוונה.** אל תעקוף את ה-guard.

**2. wsm-reset command (חדש):**
```bash
./pipeline_run.sh --domain agents_os wsm-reset
```
משתמשים בפקודה זו רק אחרי GATE_5 PASS (COMPLETE) כדי לסנכרן WSM לmצב idle נכון.
**אל תקרא לה תוך כדי ריצה פעילה.**

---

## §2 — מה עליך לבצע עכשיו (ITEM-1 + ITEM-2)

### §2.1 — ITEM-1: WP002 Formal Deferral (SC-AOS-02) — עשה ראשון (~15 דקות)

**צור קובץ:**
```
_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_FORMAL_DEFERRAL_v1.0.0.md
```

**תוכן חובה:**
```markdown
---
id: TEAM_101_S003_P011_WP002_FORMAL_DEFERRAL_v1.0.0
date: 2026-03-24
authority: DM-005
---

## הצהרה

S003-P011-WP002 (AOS Pipeline Stabilization — extended scope) מועבר ל-DEFERRED_TO_S004.

## סיבה

ייצוב AOS מספיק לביצוע TikTrack S003-P004. מאושר ב-TEAM_101_TO_TEAM_00_S003_PIPELINE_STABILITY_ASSESSMENT_v1.0.0.md.

## Scope lock — S004

KB-26..KB-39 — כל הפריטים שלא מומשו → S004.
Specific: [פרט כל KB ש-open]

## WSM effect

WP002 אינו active ולא יופיע ב-pipeline_state.
active_work_package_id: S003-P012-WP005 (AOS last completed).
```

לאחר מסמך זה: **SC-AOS-02 = MET ✅**

---

### §2.2 — ITEM-2: G0→G5 Verification Run (SC-AOS-03 + SC-TT-03)

**סדר פעולות מדויק:**

#### שלב A — הכן WP ייעודי

צור `pipeline_state_agentsos.json` עם WP חדש:
```json
{
  "work_package_id": "S003-P015-WP001",
  "stage_id": "S003",
  "project_domain": "agents_os",
  "spec_brief": "AOS Pipeline Verification Run — DM-005 ITEM-2 (documentation-only)",
  "current_gate": "NOT_STARTED",
  "gates_completed": [],
  "gates_failed": [],
  "process_variant": "TRACK_FOCUSED"
}
```

> **⚠️ CRITICAL:** S003-P015 חייב להיות רשום ב-Program Registry לפני שתתחיל. צור row:
> `| S003 | S003-P015 | AOS Pipeline Verification Run | AGENTS_OS | PLANNED | — DM-005 ITEM-2 verification run |`
> בקובץ `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
> **authority: DM-005 cascade authorization.**

#### שלב B — ריצת G0→G5 (TRACK_FOCUSED)

**TRACK_FOCUSED = Team 11 gateway + Team 61 + Team 51 QA**

הרץ בסדר:
```bash
./pipeline_run.sh --domain agents_os             # Generate GATE_0 prompt
./pipeline_run.sh --domain agents_os pass        # After GATE_0 done
./pipeline_run.sh --domain agents_os             # GATE_1 prompt
./pipeline_run.sh --domain agents_os pass        # After GATE_1 done
# ... continue for GATE_2 (five-phase), GATE_3, GATE_4, GATE_5
```

**GATE_2 five-phase — זכור:**
```bash
# Phase 2.1 → 2.1v → 2.2 → 2.2v → 2.3 → GATE_2 close
./pipeline_run.sh --domain agents_os pass  # advances 2.1→2.1v
./pipeline_run.sh --domain agents_os pass  # advances 2.1v→2.2
./pipeline_run.sh --domain agents_os pass  # advances 2.2→2.2v
./pipeline_run.sh --domain agents_os pass  # advances 2.2v→2.3
./pipeline_run.sh --domain agents_os pass  # closes GATE_2→GATE_3
```

**Precision pass — מומלץ מ-GATE_2:**
```bash
./pipeline_run.sh --domain agents_os --wp S003-P015-WP001 --gate GATE_2 --phase 2.1 pass
```

#### שלב C — בכל gate: ssot_check

```bash
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
# חייב להיות: SSOT CHECK: ✓ CONSISTENT
```

#### שלב D — לאחר GATE_5 PASS (COMPLETE)

```bash
./pipeline_run.sh --domain agents_os wsm-reset
python3 -m agents_os_v2.tools.ssot_check --domain agents_os
# חייב להיות: SSOT CHECK: ✓ CONSISTENT
```

#### שלב E — pytest לאחר כל gate

```bash
python3 -m pytest agents_os_v2/tests/ -x -q
# חייב: כל tests PASS (אפס failures)
```

---

### §2.3 — ITEM-3: Dashboard Sweep במהלך ITEM-2

בכל gate: צלם screenshot של Dashboard + console DevTools:
- WHO ברור
- WHAT NOW ברור
- ZERO 404 בconsole
- ZERO SEVERE logs
- Mandate content זמין

---

## §3 — גבולות — מה לא לגעת

| אסור | סיבה |
|---|---|
| `pipeline_state_tiktrack.json` | TikTrack בשליטת Team 00 בלבד |
| `./pipeline_run.sh pass/fail` (ללא --domain agents_os) | ברירת מחדל = tiktrack = בלוק בלי WP פעיל |
| Team 10/20/30 activation | TikTrack scope — Phase 2 בלבד |
| WSM manual edit | משתמשים ב-wsm-reset בלבד |

---

## §4 — Blocking error protocol

אם pipeline מחזיר error בכל gate:

```
1. עצור
2. תעד: exact error message + gate + command שהורץ
3. הפעל Team 61 לתיקון
4. Team 51 QA regression (206+ tests)
5. חזור לתחילת ITEM-2 (restart from GATE_0)
6. אם חוזר שוב → escalate לTeam 100
```

---

## §5 — תוצרים נדרשים

| תוצר | נתיב |
|---|---|
| WP002 Deferral doc | `_COMMUNICATION/team_101/TEAM_101_S003_P011_WP002_FORMAL_DEFERRAL_v1.0.0.md` |
| Errata note | `_COMMUNICATION/team_101/TEAM_101_S003_STABILITY_SCOPE_ERRATA_v1.0.0.md` |
| SC Completion Report | `_COMMUNICATION/team_101/TEAM_101_DM_005_SC_COMPLETION_REPORT_v1.0.0.md` |

**SC Completion Report חייב לכלול:**
```
- כל SC: MET / MET_VERIFIED / DEFERRED
- ssot_check output per gate
- pytest results
- Dashboard screenshots per gate
- הצהרה מפורשת: "Pipeline מוכן לפתיחת Phase 2 — TikTrack S003-P004"
- הצהרה מפורשת: "Dashboard — ZERO console 404 errors, ZERO SEVERE logs"
```

Return path: `_COMMUNICATION/team_100/` — לסקירה ארכיטקטונית של Team 100 לפני Team 00.

---

## §6 — ריכוז SC שנותר לSC Completion Report

| SC | מה נותר |
|---|---|
| SC-AOS-02 | WP002 deferral doc (ITEM-1) |
| SC-AOS-03 | G0→G5 run COMPLETE (ITEM-2) |
| SC-TT-03 | pipeline_run.sh ריצה מלאה verified |
| SC-UI-01 | Dashboard sweep screenshots (ITEM-3) |
| SC-UI-02 | ZERO 404 + ZERO SEVERE לאורך הריצה |

כל שאר SC כבר MET — אל תגע בהם.

---

**log_entry | TEAM_100 | DM_005_ITEM2_ACTIVATION | TEAM_101_ACTIVATED | ITEM0_CLOSED WSM_GUARD_DEPLOYED | 2026-03-24**
