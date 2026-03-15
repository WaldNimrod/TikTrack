---
project_domain: AGENTS_OS
id: TEAM_00_TO_TEAM_61_HELP_MODAL_UPGRADE_MANDATE_v1.0.0
from: Team 00 (Chief Architect)
to: Team 61 (AOS Local Cursor Implementation)
cc: Team 100
date: 2026-03-15
status: MANDATE_ACTIVE
priority: HIGH
exception_clause: UI improvement mandate — direct Team 00 issue (< 30 lines per section, pipeline tooling)
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | GOVERNANCE |
| mandate_type | UI_IMPLEMENTATION |
| goal | Upgrade help modal: tabs + context-aware banner + Three Modes + domain section + updated content |

---

## 1) Problem Statement

ממשק העזרה הנוכחי (modal ב-`PIPELINE_DASHBOARD.html` lines 37–244) פגום:
- תוכן מיושן (שמות צוותות וgate ישנים)
- מבנה שטוח — 200 שורות HTML ללא ניווט
- חסרים: Three Modes concept, domain system, GATE_1 two-phase, Current Step Banner
- פקודות חסרות: `--domain`, `phase2`

---

## 2) Files to Modify

| קובץ | פעולה |
|---|---|
| `agents_os/ui/PIPELINE_DASHBOARD.html` | החלפת תוכן modal (lines 37–244) |
| `agents_os/ui/js/pipeline-help.js` | הוספת tab switching + context-aware logic |
| `agents_os/ui/css/pipeline-dashboard.css` | הוספת tab styles (ראה §7) |

---

## 3) New Modal Structure — 4 Tabs

```
┌─────────────────────────────────────────────────────┐
│ ⚡ Pipeline Guide                    [🌐 EN] [✕]    │
│─────────────────────────────────────────────────────│
│ [🚀 Start] [🗺️ Gates] [📋 Commands] [❓ Help]       │
│─────────────────────────────────────────────────────│
│ 📍 You are at: GATE_1 — Phase 2 (Team 190/Codex)   │
│    Next: Paste ▼▼▼ block into Codex → run → pass   │
│─────────────────────────────────────────────────────│
│  [TAB CONTENT HERE]                                 │
└─────────────────────────────────────────────────────┘
```

ה-context banner (שורת "You are at") מוצגת **בכל הtabs** — תמיד גלויה.

---

## 4) Tab 1 — 🚀 Quick Start

### 4A — Three Modes Section (new)

```html
<div class="help-modes-box">
  <div class="help-mode-item">
    <span class="help-mode-badge mode-1">Mode 1</span>
    <span>Legacy — direct team work. Nimrod + Team 10 coordinate manually.
    No pipeline automation. For edge cases and special situations.</span>
  </div>
  <div class="help-mode-item">
    <span class="help-mode-badge mode-2">Mode 2</span>
    <span>Semi-automatic — AOS + dashboard (current). Pipeline manages routing.
    You run <code>pipeline_run.sh</code> commands; dashboard shows next step.</span>
  </div>
  <div class="help-mode-item">
    <span class="help-mode-badge mode-3">Mode 3</span>
    <span>Fully automatic (future). Pipeline engine orchestrates everything.
    Human involvement only at GATE_2 (intent) and GATE_7 (UX review).</span>
  </div>
</div>
```

### 4B — Domain Section (new)

```html
<h4>🌐 Domain System</h4>
<pre>
# Two separate pipelines — must specify domain when both are active:
./pipeline_run.sh --domain agents_os pass
./pipeline_run.sh --domain tiktrack  fail "reason"

# If you omit --domain and both are active:
# → 🔴 DOMAIN AMBIGUOUS error — add --domain to resolve

# Current domain shown in dashboard header badge
</pre>
```

### 4C — Quick Start (updated 3-step cycle)

```html
<pre>
# 1. Start the dashboard server (from repo root):
python3 -m http.server 8090
# → Open: http://localhost:8090/agents_os/ui/PIPELINE_DASHBOARD.html

# 2. Every gate follows the same 3-step cycle:
./pipeline_run.sh [--domain agents_os]   # generate prompt (▼▼▼ block)
# → See "Current Step Banner" above Gate Context — it tells you:
#   - which AI tool to use (Cursor / Gemini / Codex)
#   - which team is acting
#   - exact next 3 steps
# → Paste ▼▼▼ block into the AI tool shown
# → Run the AI, get result

./pipeline_run.sh [--domain agents_os] pass   # advance gate
</pre>
```

---

## 5) Tab 2 — 🗺️ Gates (updated content)

**החלף את כל הgate boxes.** תוכן מעודכן:

```html
<div class="step-box"><div class="step-title">GATE_0 — Team 190 (Codex/OpenAI)</div>
Validates scope: domain isolation, no active program conflicts, feasibility.</div>

<div class="step-box"><div class="step-title">GATE_1 — Team 170 (Gemini) + Team 190 (Codex) — TWO PHASES</div>
<strong>Phase 1:</strong> Team 170 authors LLD400 spec (Gemini). Dashboard shows Phase 1 banner.<br>
<strong>Phase 2:</strong> Team 190 validates LLD400 (Codex). Mandate tab auto-selects ▶ SEND NOW.<br>
<strong>On BLOCK:</strong> Pipeline auto-clears lld400_content → dashboard returns to Phase 1 correction cycle.
Dashboard shows correction banner (yellow). Team 170 revises and re-submits.
</div>

<div class="step-box"><div class="step-title">GATE_2 — Team 100 + Nimrod (human approval)</div>
Do we approve building this? → <code>./pipeline_run.sh approve</code></div>

<div class="step-box"><div class="step-title">GATE_3 / G3_PLAN — Team 10 (Cursor)</div>
Technical work plan: files, owners, API contract, QA criteria.</div>

<div class="step-box"><div class="step-title">G3_5 — Team 190 (Codex)</div>
Validate work plan: completeness, contracts, test criteria.</div>

<div class="step-box"><div class="step-title">G3_6_MANDATES — Orchestrator (auto)</div>
Generates per-team mandates deterministically.</div>

<div class="step-box"><div class="step-title">CURSOR_IMPLEMENTATION — Teams 20 + 30 (Cursor)</div>
Team 20 (backend) → Team 30 (frontend) → <code>./pipeline_run.sh pass</code> only when both done.</div>

<div class="step-box"><div class="step-title">GATE_4 — Team 50 (Cursor + MCP)</div>
QA: browser tests, 10-point checklist, binary PASS/FAIL report.</div>

<div class="step-box"><div class="step-title">GATE_5 — Team 190 (Codex)</div>
Dev validation: code vs spec. Outputs structured verdict only.</div>

<div class="step-box"><div class="step-title">GATE_6 — Team 100 + Nimrod (human)</div>
Reality vs intent: does what was built match what was approved?</div>

<div class="step-box"><div class="step-title">GATE_7 — Nimrod (browser)</div>
UX sign-off: scenario checklist, test flows → <code>./pipeline_run.sh approve</code></div>

<div class="step-box"><div class="step-title">GATE_8 — Team 170 → Team 190 (Codex)</div>
Phase 1: Team 170 writes AS_MADE_REPORT + archives WP files.
Phase 2: Team 190 validates → WP CLOSED.</div>
```

**Hebrew translation:** translate all above — same structure.

---

## 6) Tab 3 — 📋 Commands (updated)

```html
<pre>
./pipeline_run.sh [--domain D]                   # generate current gate prompt
./pipeline_run.sh [--domain D] pass              # advance PASS → show next gate
./pipeline_run.sh [--domain D] fail "reason"     # advance FAIL with reason
./pipeline_run.sh [--domain D] approve           # approve human gate (GATE_2/7)
./pipeline_run.sh [--domain D] status            # show current state only
./pipeline_run.sh [--domain D] gate GATE_NAME    # generate prompt for specific gate
./pipeline_run.sh [--domain D] store GATE file   # store AI output into state
./pipeline_run.sh [--domain D] revise "notes"    # G3_5 FAIL → revision prompt
./pipeline_run.sh [--domain D] phase2            # (GATE_1) switch to Phase 2 prompt

# --domain flag:
./pipeline_run.sh --domain agents_os pass
./pipeline_run.sh --domain tiktrack  fail "reason"
# Required when both domains have active pipelines (prevents DOMAIN AMBIGUOUS error)
</pre>
<div class="tip-box">
  💡 <strong>AC-10 auto-store:</strong> At GATE_1, pipeline auto-detects and stores the latest
  LLD400 file before generating prompts. Manual <code>store GATE_1 file</code> still works as override.
</div>
```

---

## 7) Tab 4 — ❓ Help (FAQ + Troubleshooting)

### 7A — FAQ (updated — remove old G3_5/Team 90 references, add new)

New FAQ entries to include:

```
Q: I got a DOMAIN AMBIGUOUS error. What to do?
A: You have two active pipelines. Add --domain to your command:
   ./pipeline_run.sh --domain agents_os pass
   ./pipeline_run.sh --domain tiktrack status

Q: I'm at GATE_1 and the dashboard shows Phase 2. What does that mean?
A: Team 170 has already submitted the LLD400. The mandate tab shows "▶ SEND NOW"
   for Team 190 (Codex). Paste that mandate into Codex and run.

Q: Team 190 returned BLOCK at GATE_1 Phase 2. What happens?
A: The pipeline auto-clears the LLD400 and resets to Phase 1 correction.
   Dashboard shows a yellow correction cycle banner.
   Team 170 needs to revise and re-submit the LLD400.

Q: I ran Team 20. What's the next trigger?
A: No CLI trigger. Check "Expected Output Files" → 🟢. If green, open new Cursor → paste Team 30 mandate.

Q: When do I press ./pipeline_run.sh pass?
A: Only when ALL sub-steps of the current gate are done.
   For CURSOR_IMPLEMENTATION: Team 20 🟢 + Team 30 🟢 + git commit exists.

Q: I forgot where I am in the pipeline.
A: The "Current Step Banner" (above Gate Context) always shows your current gate,
   actor, and next 3 steps. Or run: ./pipeline_run.sh status

Q: I got a BLOCK from Team 190 (not at GATE_1).
A: Read the findings in Team 190's output file. Fix the spec or escalate to Team 00.
   Do not proceed in the pipeline.
```

### 7B — Troubleshooting section

```html
<h4>🔧 Troubleshooting</h4>
<div class="help-trouble-item">
  <strong>Dashboard shows wrong gate after running command</strong>
  <p>Press ↺ Refresh. The dashboard reads pipeline_state.json; it updates after pipeline_run.sh runs.</p>
</div>
<div class="help-trouble-item">
  <strong>Phase 2 banner showing even after GATE_1 BLOCK</strong>
  <p>Run: <code>./pipeline_run.sh --domain agents_os fail "reason"</code> — this clears lld400_content.
  Dashboard will reset to Phase 1 correction cycle.</p>
</div>
<div class="help-trouble-item">
  <strong>store command fails with exit 1</strong>
  <p>Check: (1) file path exists, (2) GATE_ID is one of: GATE_1, G3_PLAN, CURSOR_IMPLEMENTATION</p>
</div>
```

---

## 8) Context-Aware Banner — Implementation Spec

**Location:** Rendered between the tab bar and the tab content — visible on ALL tabs.

**Data source:** `window.pipelineState` (already loaded by `loadPipelineState()` in pipeline-dashboard.js).

**Logic (add to `pipeline-help.js`):**

```javascript
function buildHelpContextBanner() {
  const state = window.pipelineState;
  if (!state || !state.current_gate || state.current_gate === 'NOT_STARTED') return '';

  const gate    = state.current_gate;
  const lld400  = (state.lld400_content || '').trim();
  const domain  = state.project_domain || '';

  let actorText = '';
  if (gate === 'GATE_1') {
    actorText = lld400
      ? 'Phase 2 — Paste Team 190 (Codex) mandate → run → <code>./pipeline_run.sh pass</code>'
      : 'Phase 1 — Paste Team 170 (Gemini) mandate → run → <code>./pipeline_run.sh pass</code>';
  } else {
    actorText = 'See "Current Step Banner" above Gate Context for exact next steps.';
  }

  const domainCmd = domain ? `--domain ${domain} ` : '';
  return `
    <div class="help-context-banner">
      📍 <strong>You are at: ${gate}</strong> (domain: ${domain || '—'})
      <div class="help-context-next">${actorText}</div>
      <div class="help-context-cmd">
        <code>./pipeline_run.sh ${domainCmd}pass</code>
        — to advance after AI completes
      </div>
    </div>`;
}
```

Call `buildHelpContextBanner()` and inject into `id="help-context-zone"` (a new div inside the modal, below the tab bar).

---

## 9) Tab Switching — Implementation Spec

Add to `pipeline-help.js`:

```javascript
function showHelpTab(name) {
  document.querySelectorAll('.help-tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.help-tab-btn').forEach(el => el.classList.remove('active'));
  const tab = document.getElementById('help-tab-' + name);
  const btn = document.querySelector(`.help-tab-btn[data-tab="${name}"]`);
  if (tab) tab.classList.add('active');
  if (btn) btn.classList.add('active');
  localStorage.setItem('help_active_tab', name);
}

// On open: restore last tab or default to 'start'
function toggleHelp() {
  const modal = document.getElementById("help-modal");
  if (!modal) return;
  modal.classList.toggle("open");
  if (modal.classList.contains("open")) {
    applyLang(localStorage.getItem("pipeline_dashboard_lang") || "en");
    const lastTab = localStorage.getItem('help_active_tab') || 'start';
    showHelpTab(lastTab);
    // Inject context banner
    const zone = document.getElementById('help-context-zone');
    if (zone) zone.innerHTML = buildHelpContextBanner();
  }
}
```

HTML structure for tabs in modal:

```html
<!-- Tab bar -->
<div class="help-tab-bar">
  <button class="help-tab-btn" data-tab="start" onclick="showHelpTab('start')">🚀 Start</button>
  <button class="help-tab-btn" data-tab="gates" onclick="showHelpTab('gates')">🗺️ Gates</button>
  <button class="help-tab-btn" data-tab="commands" onclick="showHelpTab('commands')">📋 Commands</button>
  <button class="help-tab-btn" data-tab="help" onclick="showHelpTab('help')">❓ Help</button>
</div>
<!-- Context banner -->
<div id="help-context-zone"></div>
<!-- Tab contents -->
<div id="help-tab-start"    class="help-tab-content active"> [§4 content] </div>
<div id="help-tab-gates"    class="help-tab-content"> [§5 content] </div>
<div id="help-tab-commands" class="help-tab-content"> [§6 content] </div>
<div id="help-tab-help"     class="help-tab-content"> [§7 content] </div>
```

---

## 10) CSS to Add (pipeline-dashboard.css)

```css
/* Help Modal — Tab System */
.help-tab-bar { display: flex; gap: 4px; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
.help-tab-btn { background: transparent; border: 1px solid var(--border); border-radius: 4px; padding: 4px 12px; font-size: 13px; cursor: pointer; color: var(--text-secondary); }
.help-tab-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.help-tab-btn:hover:not(.active) { background: var(--surface-hover); }

.help-tab-content { display: none; }
.help-tab-content.active { display: block; }

/* Context Banner */
.help-context-banner { background: var(--surface-elevated); border-left: 3px solid var(--accent); padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 13px; }
.help-context-next { margin-top: 4px; color: var(--text-primary); }
.help-context-cmd { margin-top: 4px; color: var(--text-secondary); font-size: 12px; }

/* Three Modes */
.help-modes-box { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.help-mode-item { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; }
.help-mode-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 3px; white-space: nowrap; }
.help-mode-badge.mode-1 { background: #555; color: #fff; }
.help-mode-badge.mode-2 { background: var(--accent); color: #fff; }
.help-mode-badge.mode-3 { background: var(--success); color: #fff; }

/* Troubleshooting */
.help-trouble-item { border: 1px solid var(--border); border-radius: 4px; padding: 8px 12px; margin-bottom: 8px; font-size: 13px; }
.help-trouble-item strong { display: block; margin-bottom: 4px; }
```

---

## 11) Hebrew Translations Required

כל section חדש (Modes, Domain, updated Gates, updated Commands, updated FAQ, Troubleshooting) חייב תרגום לעברית עם `dir="rtl"` וclass `lang-he`.

**פורמט:** בכל block HTML — עטוף בשני divs:
```html
<div class="lang-en">[English content]</div>
<div class="lang-he" dir="rtl" style="display:none">[Hebrew content]</div>
```

---

## 12) Remove / Archive

הסר מה-modal הקיים:
- Section "How Team Mandates Work (CURSOR_IMPLEMENTATION gate)" — מיושן, מיועד לWP ספציפי ולא כלל-המערכת
- Links to `pipeline_state.json` (legacy) — החלף ב-`pipeline_state_agentsos.json` and `pipeline_state_tiktrack.json`
- Reference to `TEAM_00_S001_P002_WP001_EXPERIMENT_EXECUTION_GUIDE_v1.0.0.md` — ספציפי מדי ל-WP
- Reference to `gate_8_mandates.md` — נתיב שכבר ישן

**Links section בTab 4 (Help):** שמור רק:
```
PIPELINE_ROADMAP.html
PIPELINE_TEAMS.html
pipeline_run.sh
pipeline.py (CLI source)
```

---

## 13) Acceptance Criteria

| AC | Criterion |
|---|---|
| AC-01 | 4 tabs מוצגים וניתנים לניווט; tab פעיל נשמר ב-localStorage |
| AC-02 | Context banner מוצג בכל tab עם gate + domain נוכחי + next action |
| AC-03 | Three Modes section קיים ב-tab Start עם badge mode-1/2/3 |
| AC-04 | Domain section קיים עם `--domain` example |
| AC-05 | Gate sequence: GATE_1 מוסבר עם Phase 1/2 + correction cycle |
| AC-06 | G3_5 = Team 190 (not Team 90), GATE_8 = Team 170 (not Team 70) |
| AC-07 | Commands tab: `phase2` + `--domain` מוצגים |
| AC-08 | FAQ: domain ambiguity + GATE_1 BLOCK + Phase 2 scenarios נכללים |
| AC-09 | Troubleshooting section קיים עם 3 scenarios |
| AC-10 | Hebrew translations קיימות לכל content חדש |
| AC-11 | Old modal content fully replaced — no `G3_6_MANDATES` references remain |
| AC-12 | פתיחת modal: context banner מתעדכן מ-pipelineState הנוכחי |

---

## 14) Future Work Package Note

**Option B** — `PIPELINE_HELP.html` כעמוד עצמאי עם information architecture מלאה — **מיועד ל-S003** כחבילת עבודה נפרדת. אין לממש כחלק מ-mandate זה.

---

## 15) Completion Deliverable

Submit to `_COMMUNICATION/team_61/` with:
1. Screenshot (or snapshot) of the new modal — all 4 tabs visible
2. Screenshot of context banner with real state data
3. No regressions in other dashboard functionality

---

*log_entry | TEAM_00 | HELP_MODAL_UPGRADE_MANDATE | TEAM_61 | S002_P005_GOVERNANCE | ISSUED | 2026-03-15*
