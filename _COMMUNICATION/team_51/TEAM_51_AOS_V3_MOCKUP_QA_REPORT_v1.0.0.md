---
id: TEAM_51_AOS_V3_MOCKUP_QA_REPORT_v1.0.0
historical_record: true
from: Team 51 (AOS QA & Functional Acceptance)
to: Team 100 (Chief System Architect), Team 00 (Principal), Team 31 (AOS Frontend)
date: 2026-03-27
type: QA_REPORT
domain: agents_os
mandate_ref: TEAM_100_TO_TEAM_51_AOS_V3_MOCKUP_QA_ACTIVATION_v1.0.0
mockup_url: http://127.0.0.1:8766/agents_os_v3/ui/
status: COMPLETE---

# Team 51 — AOS v3 Mockup QA Report v1.0.0

**Date:** 2026-03-27  
**Tester:** Team 51  
**Mockup URL:** http://127.0.0.1:8766/agents_os_v3/ui/

## Verdict: **FAIL**

Multiple **MAJOR** (build-blocking) gaps vs `TEAM_100_TO_TEAM_51_AOS_V3_MOCKUP_QA_ACTIVATION_v1.0.0.md` and embedded AD checks (AD-S8A-02, AD-S8-04). Team 31 should correct and Team 51 should re-run the full plan before Team 00 UX review.

## Summary

| Metric | Count |
|--------|------:|
| Total checks (planned) | 159 |
| PASS | 128 |
| FAIL (MAJOR) | 23 |
| FAIL (MINOR) | 8 |

**Pre-flight:** `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8766/agents_os_v3/ui/index.html` → **200**.

**Method:** Fresh run — browser MCP navigation/snapshot on `index.html`, `history.html`, `portfolio.html`; repository review of `agents_os_v3/ui/app.js`, HTML, and `style.css` for DOM strings, mock data, and styling not fully visible in a11y snapshot.

---

## MAJOR Findings (BUILD BLOCKERS)

| ID | Check | Found | Expected | Spec / Ref |
|----|--------|--------|----------|------------|
| MJ-01 | M02-12 | Token badge text is `247 tokens` (numeric + `tokens` only) | Label includes `token count: NNN tokens` | Activation § TC-M02 / TC-M24 |
| MJ-02 | M03-3–M03-6 | Form labels use API-style keys: `work_package_id`, `domain_id`, `process_variant`, `execution_mode` | Human labels: Work Package ID, Domain, Process Variant, Execution Mode | Activation § TC-M03 / TC-M24 |
| MJ-03 | M05-6 | ACTIONS shows only ADVANCE, FAIL, APPROVE, PAUSE, RESUME, OVERRIDE — **no RESUBMIT** | RESUBMIT or ADVANCE visible in CORRECTION + escalated scenario | Activation § TC-M05 |
| MJ-04 | M09-2 | History `event_type` filter includes **TEAM_ASSIGNMENT_CHANGED**; **GATE_PASSED** absent | Exactly the 15 types listed; includes **GATE_PASSED**, not `TEAM_ASSIGNMENT_CHANGED` | Activation § TC-M09; `app.js` `EVENT_TYPES` |
| MJ-05 | M09-5 | `GATE_FAILED_BLOCKING` rows use default `.aosv3-event-badge` (accent styling) | Distinct **red / danger** treatment vs advisory | AD-S8-04; `style.css` (only advisory row overridden) |
| MJ-06 | AD-S8A-02 / M14 | `Copy Full Context` copies markdown starting with `## Layer 1` blocks | Markdown lead: `# [Team Label] — Session Context` | Activation § Key ADs; `app.js` `fullMd` (~1137–1146) |
| MJ-07 | M14-8 | Clicking **Copy Full Context** performs clipboard write only | Toast / notification feedback | Activation § TC-M14 |
| MJ-08 | M15-2 | Layer 4 `<pre>` shows `Task: (mock) Execute assigned gate work per program spec.` (non-actor teams) | Exact text **`Not current actor.`** in Layer 4 | Activation § TC-M15 |
| MJ-09 | M15-3 | Non-actor Layer 4 still shows a full task preview string | **No** prompt / task preview in Layer 4 | Activation § TC-M15 |
| MJ-10 | M16-1 | Group filter **AOS** uses `t.group === "x1_aos"` only | Roster = **AOS + cross_domain** teams | Activation § TC-M16 |
| MJ-11 | M17-8 | Active Runs action button text **`Override`** (snapshot + `app.js` line ~1277) | **`Override (team_00)`** | Activation § TC-M17 |
| MJ-12 | M19-4 | No **View Run** on ACTIVE WP rows | ACTIVE rows have View Run | Activation § TC-M19 |
| MJ-13 | M19-5 | No **Start Run** enabled on PLANNED row (all `Start Run` disabled) | PLANNED rows show actionable Start Run per mock rules | Activation § TC-M19 |
| MJ-14 | M19-6 | No **View History** on COMPLETE WP row | COMPLETE rows have View History | Activation § TC-M19 |
| MJ-15 | M19-7 | Start Run appears for all WP rows (disabled), not only PLANNED | Start Run **only** on PLANNED | Activation § TC-M19; `renderWp` |
| MJ-16 | M20-2 | Table includes **`target_program_id`** column | Columns: IDEA_ID, TITLE, STATUS, PRIORITY, SUBMITTED BY, SUBMITTED, ACTIONS | Activation § TC-M20; `portfolio.html` |
| MJ-17 | M20-4 | Only four ideas; statuses include NEW, EVALUATING, APPROVED, DEFERRED — **no REJECTED** row | ≥4 rows and **all five** status badges including REJECTED | Activation § TC-M20; `MOCK_IDEAS_SEED` |
| MJ-18 | M20-6 | Approve / Defer / Reject buttons **all disabled** on every row | Action buttons enabled on appropriate rows | Activation § TC-M20; `renderIdeas` |
| MJ-19 | M21-3 | Modal label reads **`title *`** (lowercase) | Field label **`Title`** (exact) | Activation § TC-M21 / TC-M24 |
| MJ-20 | M25-3 | Mock run IDs are **22** characters (e.g. `01JQXYZ123456789ABCDEF`) | Realistic ULID: **26** chars, canonical test note `01J…` | Activation § TC-M25 |

---

## MINOR Findings (Non-blockers)

| ID | Check | Found | Expected |
|----|--------|--------|----------|
| MN-01 | M13-3 | Checkbox label **Show current actor only** | **Current actor only** (exact wording) |
| MN-02 | M09-6 | Filter labels lowercase (`domain_id`, `gate_id`, …) | Table in mandate uses uppercase field names (cosmetic) |
| MN-03 | Pipeline / Portfolio headers | Section titles **Run status**, **Current actor** (sentence case) | Checklist sometimes says RUN STATUS (cosmetic) |
| MN-04 | M17-1 / tables | `<th>` uses `run_id`, `domain_id`, … | Mandate uses RUN_ID, DOMAIN (display naming) |
| MN-05 | M20-4 / M20-5 | NEW uses `aosv3-status--idle`; REJECTED maps to `aosv3-status--correction` | Mandate calls for NEW (accent), REJECTED (danger) — palette drift |
| MN-06 | M12 policies table | Fourth column + **Edit** buttons | Mandate M12-1 lists three logical columns (acceptable if treated as actions column) |
| MN-07 | M22-6 | Primary action labeled **Save Changes** | Mandate allows Save/Update — wording differs |
| MN-08 | M16-2 | TikTrack group filter: mock roster has no `domain_scope === "tiktrack"` teams | Filter works but often empty — document mock limitation |

---

## Full Checklist (by test case)

Legend: **P** = PASS, **F** = FAIL (M = MAJOR, m = MINOR per tables above).

### TC-M01 — Navigation Bar
| Check | Result |
|-------|--------|
| M01-1–M01-5 | **P** — All five pages: Pipeline · History · Configuration · Teams · Portfolio (verified `index.html`, `history.html`, `config.html`, `teams.html`, `portfolio.html`). |
| M01-6 | **P** — `active` class on current `nav-link`. |
| M01-7 | **P** — Theme/domain controls present (sidebar on pipeline; Dark/Light on other pages). |

### TC-M02 — Pipeline IN_PROGRESS
| Check | Result |
|-------|--------|
| M02-1–M02-11, M02-13–M02-16 | **P** — Badge, gate/phase/cc/exec/started/updated, actor, sentinel inactive, assembled prompt visible with L1–L4 markers, copy/regenerate, actions, no Start Run in main. |
| M02-12 | **F** — MJ-01 |

### TC-M03 — Pipeline IDLE
| Check | Result |
|-------|--------|
| M03-1, M03-2, M03-7–M03-9 | **P** |
| M03-3–M03-6 | **F** — MJ-02 |

### TC-M04 — Pipeline PAUSED
| Check | Result |
|-------|--------|
| M04-1–M04-6 | **P** — PAUSED badge, `paused_at`, actor `—`, AD-S5-02 note, prompt hidden, RESUME visible. |

### TC-M05 — CORRECTION + Escalated
| Check | Result |
|-------|--------|
| M05-1–M05-5 | **P** — Banner, CORRECTION badge, cc ≥ 1, prompt visible. |
| M05-6 | **F** — MJ-03 |

### TC-M06 — Human Gate
| Check | Result |
|-------|--------|
| M06-1–M06-5 | **P** |

### TC-M07 — Sentinel Active
| Check | Result |
|-------|--------|
| M07-1–M07-4 | **P** — Sentinel string `active · override: team_30`, DASHBOARD, actor team_30, prompt visible. |

### TC-M08 — COMPLETE
| Check | Result |
|-------|--------|
| M08-1–M08-5 | **P** — Prompt hidden; pause/resume hidden; OVERRIDE still shown (disabled). |

### TC-M09 — History
| Check | Result |
|-------|--------|
| M09-1, M09-3, M09-4, M09-7–M09-9 | **P** — 15 options; advisory row + amber badge; total + pagination + theme. |
| M09-2 | **F** — MJ-04 |
| M09-5 | **F** — MJ-05 |
| M09-6 | **P** *(with m: MN-02)* |

### TC-M10 — Config Routing
| Check | Result |
|-------|--------|
| M10-1–M10-4 | **P** |

### TC-M11 — Config Templates
| Check | Result |
|-------|--------|
| M11-1–M11-5 | **P** |

### TC-M12 — Config Policies
| Check | Result |
|-------|--------|
| M12-2–M12-4 | **P** |
| M12-1 | **P** *(MN-06: extra actions column)* |

### TC-M13 — Teams Structure
| Check | Result |
|-------|--------|
| M13-1, M13-2, M13-4–M13-6 | **P** |
| M13-3 | **P** *(m: MN-01)* |

### TC-M14 — Teams Current Actor
| Check | Result |
|-------|--------|
| M14-1–M14-7 | **P** — Layers + copy buttons + primary Copy Full Context (content format fails AD — see MJ-06). |
| M14-8 | **F** — MJ-07 |

### TC-M15 — Teams Non-Current Actor
| Check | Result |
|-------|--------|
| M15-1, M15-4 | **P** |
| M15-2, M15-3 | **F** — MJ-08, MJ-09 |

### TC-M16 — Group Filter
| Check | Result |
|-------|--------|
| M16-1 | **F** — MJ-10 |
| M16-2 | **P** *(m: MN-08)* |
| M16-3, M16-4 | **P** |

### TC-M17 — Portfolio Active Runs
| Check | Result |
|-------|--------|
| M17-1–M17-7 | **P** — Last-8 run id in first column with `title` ULID; 2 rows; badges; View/Pause disabled but present. |
| M17-8 | **F** — MJ-11 |

### TC-M18 — Portfolio Completed
| Check | Result |
|-------|--------|
| M18-1–M18-6 | **P** |

### TC-M19 — Work Packages
| Check | Result |
|-------|--------|
| M19-1–M19-3 | **P** |
| M19-4–M19-7 | **F** — MJ-12–MJ-15 |

### TC-M20 — Ideas Pipeline
| Check | Result |
|-------|--------|
| M20-1, M20-3, M20-5 | **P** *(M20-5 with m: MN-05)* |
| M20-2 | **F** — MJ-16 |
| M20-4 | **F** — MJ-17 |
| M20-6 | **F** — MJ-18 |

### TC-M21 — New Idea Modal
| Check | Result |
|-------|--------|
| M21-1, M21-2, M21-4–M21-8 | **P** — 3 fields, no notes; Submit Idea; Cancel. |
| M21-3 | **F** — MJ-19 |

### TC-M22 — Edit Idea Modal
| Check | Result |
|-------|--------|
| M22-1–M22-5 | **P** |
| M22-6 | **P** *(m: MN-07)* |

### TC-M23 — Theme
| Check | Result |
|-------|--------|
| M23-1–M23-4 | **P** — Toggle present; no breakage observed at default viewport in snapshots. |

### TC-M24 — Label Accuracy
| Check | Result |
|-------|--------|
| Aligned with MJ-01, MJ-02, MJ-11, MJ-19; other strings (**Start Run →**, **Copy to clipboard**, **Regenerate**, **Copy Full Context**, **Copy L1–L4**, **CURRENT ACTOR ★**, **+ New Idea**, **Submit Idea**, **View History**) **P** where tested. |

### TC-M25 — Mock Data Consistency
| Check | Result |
|-------|--------|
| M25-1, M25-2, M25-4 | **P** — Actor team_61 aligns Teams ★ and Portfolio active run. |
| M25-3 | **F** — MJ-20 |
| M25-5 | **P** — Not exhaustively pixel-checked; layout acceptable at default width in review. |

---

## Escalation

- **MJ-04 / MJ-05:** If product canon prefers `TEAM_ASSIGNMENT_CHANGED` over `GATE_PASSED`, or red styling for blocking only on payload not badge, **Team 100** should confirm spec vs activation checklist to avoid duplicate churn.
- **MJ-06:** Direct conflict between QA activation (markdown `# [Team Label] — Session Context`) and current `app.js` implementation — architect clarification if mandate text is normative.

---

## Submission / Next Steps

1. **Team 31:** Address MAJOR table; re-submit for re-QA.  
2. **Team 100 / Team 00:** Notified via this report path; **FAIL** blocks Team 00 UX review until re-verification **PASS** or **CONDITIONAL_PASS**.  
3. **Team 51:** Stand by for re-run after Team 31 closure artifact.

---

**log_entry | TEAM_51 | AOS_V3_MOCKUP_QA | FAIL | v1.0.0 | 2026-03-27**
