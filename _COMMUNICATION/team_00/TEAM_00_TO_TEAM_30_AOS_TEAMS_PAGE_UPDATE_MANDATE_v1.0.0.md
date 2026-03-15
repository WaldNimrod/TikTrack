---
project_domain: AGENTS_OS
id: TEAM_00_TO_TEAM_30_AOS_TEAMS_PAGE_UPDATE_MANDATE_v1.0.0
from: Team 00 (Chief Architect)
to: Team 30 (Frontend Execution)
cc: Team 170
date: 2026-03-15
status: MANDATE_ACTIVE
priority: MEDIUM
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | GOVERNANCE |
| mandate_type | UI_UPDATE |
| trigger | ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0 + TEAM_ROSTER_LOCK_v2.0.0 |

---

## 1) Context

`PIPELINE_TEAMS.html` (+ `agents_os/ui/js/pipeline-teams.js`) היא עמוד הצוותות של AOS. הנתונים שמוצגים בה חייבים לשקף:
1. **הגדרות Team Roster v2.0.0** — Team 10 עם שלושת המצבים (Mode 1/2/3)
2. **עקרון Process-Functional Separation** — הבחנה בין functional teams לבין process orchestration
3. **Verdict format standard** — ציון ברור ש-Team 190/50/90 מנפיקים verdicts בלבד, ללא routing

---

## 2) Required Changes

### 2A — Team 10 Description

**Current (inferred from Roster v1.0.0):**
> Gateway | Execution lead, team activation, gate submissions, WSM updates | Owns GATE_3 and GATE_4

**Required (from Roster v2.0.0):**

```
Team 10 — Implementation Authority

Mode 1 (Legacy):  Process Coordinator + Implementation Authority
                  Routes all verdicts per canonical routing table.
                  Activates teams, manages WSM updates.

Mode 2 (Semi-Auto): Technical Implementation Authority
                    Executes GATE_3 (work plan) + GATE_4 (build oversight).
                    Pipeline engine handles all routing.

Mode 3 (Full-Auto): Technical Consultation Authority (on-demand)
                    Activated only for complex builds requiring human architectural judgment.
                    Pipeline engine handles all routing and activation.

Core permanent value: Technical depth for implementation decisions.
```

### 2B — Process-Functional Separation Banner

הוסף section חדש לדף ה-Teams (מתחת לרשימת הצוותות, מעל footer) שמסביר את מודל שכבות הניהול:

**Section title:** `⚙️ Process vs. Functional Architecture`

**Content:**

```
PROCESS LAYER — who routes, who decides next step
  Mode 1 (legacy):     Nimrod + Team 10 (explicit coordination)
  Mode 2 (semi-auto):  Pipeline engine (state.py + pipeline_run.sh + dashboard)
  Mode 3 (full-auto):  Pipeline engine — fully automated

FUNCTIONAL LAYER — who executes specific work at each gate
  Team 190:  Constitutional validation → outputs verdict + findings ONLY
  Team 50:   QA testing → outputs test results + verdict ONLY
  Team 90:   Human review → outputs review notes + verdict ONLY
  Team 10:   Implementation execution (GATE_3/GATE_4)
  Team 20/30: Backend / Frontend execution
  Team 170:  Document authoring (LLD400, specs, closure)

Validation/QA teams do not route between teams.
Process routing is the pipeline engine's responsibility (Mode 2+).
```

### 2C — Team 190 / Team 50 / Team 90 — Verdict badge

בכרטיס הצוות של Team 190, Team 50, Team 90 — הוסף badge קטן:

```
[📋 Verdict only — no routing]
```

HTML class מוצע: `team-verdict-badge`

עיצוב: גבול מקווקו, אפור-כחול, גופן קטן. לא דומיננטי — אינפורמטיבי.

---

## 3) Source of Truth

כל עדכון מסתמך על:
- `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v2.0.0.md` — הגדרות הצוותות הנכונות
- `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0.md` — עקרון ה-separation

אין להמציא הגדרות. אם יש שאלה על תוכן — לפנות ל-Team 170.

---

## 4) Acceptance Criteria

| AC | Criterion |
|---|---|
| AC-01 | Team 10 card shows Mode 1/2/3 description accurately |
| AC-02 | Process-Functional Separation section visible on teams page |
| AC-03 | `[📋 Verdict only — no routing]` badge on Team 190, Team 50, Team 90 |
| AC-04 | No contradictory text (e.g., "Team 190 routes to..." or "Team 10 manages process in Mode 2") |
| AC-05 | Changes visible in `PIPELINE_TEAMS.html` — static load (no new API calls) |

---

## 5) Delivery

Submit completion to `_COMMUNICATION/team_30/` with evidence screenshots (or snapshot diff).

---

*log_entry | TEAM_00 | TEAMS_PAGE_UPDATE_MANDATE | TEAM_30 | S002_P005_GOVERNANCE | ISSUED | 2026-03-15*
