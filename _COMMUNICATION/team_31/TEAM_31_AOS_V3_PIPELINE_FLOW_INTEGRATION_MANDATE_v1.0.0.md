---
id: TEAM_31_AOS_V3_PIPELINE_FLOW_INTEGRATION_MANDATE_v1.0.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: Team 31 (AOS Frontend / Mockup)
cc: Team 11 (AOS Gateway), Team 111 (AOS Domain Architect)
date: 2026-03-28
type: UI_INTEGRATION_MANDATE — Pipeline Flow page integration into AOS v3 dashboard
gate: GATE_4 (execute after GATE_3 PASS)
authority: TEAM_00_CONSTITUTION_v1.0.0.md — Principal direct mandate
design_spec: agents_os_v3/ui/pipeline_flow.html (Team 111 — v1.1.0)
prior_work: TEAM_31_AOS_V3_UI_MOCKUPS_EVIDENCE_v2.1.0.md---

# Team 00 → Team 31 | Pipeline Flow — Dashboard Integration Mandate

## Rationale (why this matters)

המערכת שלנו מורכבת — 6 שערים, 12 transitions, 8 use cases, FIP, routing 2-שלבי, authority model.
**כל אחד מהאיגנטים** (team_21, team_51, team_61, team_100, team_190 וכו') נדרש להבין את אותה תמונה.
**Nimrod כמפעיל** נדרש להחליט בזמן אמת על pause / override / approve.

תרשים Pipeline Flow הוא **מסמך הבנה קנוני** — לא רק תיעוד. הוא חלק ממנשק ההפעלה.

**Iron Rule:**  כל הכפתורים, actions, ואופציות משתמש קיימים נשמרים ללא שינוי. שינוי זה הוא תוספת בלבד.

---

## Context — Current Dashboard Structure

```
agents_os_v3/ui/
├── index.html         ← Pipeline View (active page)
├── history.html       ← History tab
├── config.html        ← Configuration tab
├── teams.html         ← Teams tab
├── portfolio.html     ← Portfolio tab
├── pipeline_flow.html ← DESIGN SPEC (Team 111 artifact, exists)
├── app.js             ← Main JS
├── style.css          ← Dashboard styles
└── theme-init.js      ← Theme (dark/light)
```

**Existing nav pattern (from index.html line 34–43):**
```html
<nav class="pipeline-nav">
  <a class="nav-link active" href="index.html">Pipeline</a>
  <span class="nav-sep"></span>
  <a class="nav-link" href="history.html">History</a>
  <span class="nav-sep"></span>
  <a class="nav-link" href="config.html">Configuration</a>
  <span class="nav-sep"></span>
  <a class="nav-link" href="teams.html">Teams</a>
  <span class="nav-sep"></span>
  <a class="nav-link" href="portfolio.html">Portfolio</a>
</nav>
```

---

## Task — 3 Deliverables

### Deliverable 1 — Add "System Map" tab to all pages

**Target:** Add to `pipeline-nav` in **all 5 existing pages** (index.html, history.html, config.html, teams.html, portfolio.html).

```html
<!-- הוסף אחרי portfolio link -->
<span class="nav-sep"></span>
<a class="nav-link" href="flow.html">System Map</a>
```

**Naming:** Tab label = `System Map` (English — consistent with existing tabs).

---

### Deliverable 2 — Create `flow.html` (Pipeline Flow integrated page)

צור קובץ חדש `agents_os_v3/ui/flow.html` המשלב את תרשימי Pipeline Flow עם Chrome של הדשבורד.

**Required structure:**

```html
<!DOCTYPE html>
<!-- Standard AOS v3 header comment block -->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Agents OS v3 — System Map</title>

  <!-- Existing dashboard CSS (same as all pages) -->
  <link rel="stylesheet" href="../../agents_os/ui/css/pipeline-shared.css" />
  <link rel="stylesheet" href="style.css" />
  <script src="theme-init.js"></script>

  <!-- Mermaid.js — for pipeline flow diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>

  <!-- Local overrides for diagram page -->
  <style>
    /* diagram container — adapts to dark/light theme */
    .flow-section { ... }           /* per spec below */
    .flow-diagram-wrap { ... }      /* per spec below */
    .mermaid { text-align: center; }
  </style>
</head>
<body data-aosv3-page="flow">

<!-- Standard agents-header (identical to all pages) -->
<header class="agents-header">
  <div class="agents-header-left">
    <h1 class="agents-header-title">Agents OS v3 — <span>System Map</span></h1>
    <span class="agents-refresh-label">Pipeline Flow Reference — v1.1.0</span>
  </div>
  <div class="agents-header-right">
    <!-- Theme indicator, same as other pages -->
  </div>
</header>

<!-- Standard pipeline-nav (identical to all pages, "System Map" active) -->
<nav class="pipeline-nav">
  <a class="nav-link" href="index.html">Pipeline</a>
  ...
  <a class="nav-link active" href="flow.html">System Map</a>
</nav>

<!-- Page content: 8 diagram sections -->
<main class="flow-main">
  <!-- Section 1: Gate Sequence (macro) -->
  <!-- Section 2: State Machine -->
  <!-- Section 3: Initialization -->
  <!-- Section 4: Gate Loop -->
  <!-- Section 5: Correction -->
  <!-- Section 6: Pause/Resume -->
  <!-- Section 7: Override -->
  <!-- Section 8: FIP -->
</main>

<script>
  mermaid.initialize({
    startOnLoad: true,
    theme: document.body.dataset.theme === 'dark' ? 'dark' : 'default',
    flowchart: { htmlLabels: true, curve: 'basis', padding: 20 },
    securityLevel: 'loose',
    fontSize: 14
  });
</script>
```

#### 2a — Diagram Content Source

**העתק את תוכן 8 הדיאגרמות מ-`pipeline_flow.html` (קיים כבר ב-repo).**
הקובץ הוא design spec מלא של Team 111 — כל ה-Mermaid code, labels, legends, ו-info-cards.
**אין לשנות את תוכן הדיאגרמות** — שינויי תוכן דורשים אישור Team 111.

#### 2b — Theme Adaptation (חובה)

הדשבורד תומך ב-dark/light theme. הדיאגרמות חייבות להסתגל:

```javascript
// בזמן אתחול mermaid:
const isDark = document.documentElement.dataset.theme === 'dark'
               || localStorage.getItem('pipeline_domain') === 'agents_os';

mermaid.initialize({
  startOnLoad: true,
  theme: isDark ? 'dark' : 'default',
  // ...
});
```

```css
/* בסגנון flow.html: */
[data-theme="dark"] .flow-diagram-wrap {
  background: #1a2332;
  border-color: #2c3e50;
}
[data-theme="dark"] .flow-info-card {
  background: #263447;
  color: #bcd6ed;
}
```

#### 2c — In-page Navigation (חובה)

הוסף sticky sub-nav בתוך `flow.html` לניווט מהיר בין 8 הסקשנים:

```html
<nav class="flow-subnav">
  <a href="#gates">Gate Sequence</a>
  <a href="#sm">State Machine</a>
  <a href="#init">Initialization</a>
  <a href="#loop">Gate Loop</a>
  <a href="#correction">Correction</a>
  <a href="#pause">Pause/Resume</a>
  <a href="#override">Override</a>
  <a href="#fip">FIP</a>
</nav>
```

סגנון: עקבי עם `pipeline-nav` אך secondary — גובה נמוך יותר, צבע שונה.

#### 2d — Section Structure per Diagram

כל סקשן:
```html
<section class="flow-section" id="gates">
  <div class="flow-section-header">
    <span class="flow-num">1</span>
    <h2>Gate Sequence — מבט מאקרו (GATE_0 → GATE_5)</h2>
  </div>

  <!-- info-cards (copy from pipeline_flow.html) -->
  <div class="flow-info-row"> ... </div>

  <!-- diagram -->
  <div class="flow-diagram-wrap">
    <div class="mermaid">
      flowchart LR
      ... <!-- exact content from pipeline_flow.html -->
    </div>
  </div>

  <!-- legend -->
  <div class="flow-legend"> ... </div>
</section>
```

---

### Deliverable 3 — Update FILE_INDEX.json

רשום את הקובץ החדש ב-`agents_os_v3/FILE_INDEX.json`:

```json
{
  "path": "agents_os_v3/ui/flow.html",
  "type": "ui_page",
  "gate": "GATE_4",
  "description": "System Map — Pipeline Flow Diagrams integrated into AOS v3 dashboard",
  "status": "GATE_4_DELIVERABLE",
  "version": "1.0.0",
  "created_at": "<date>",
  "owner": "team_31",
  "ssot_ref": "TEAM_111_AOS_V3_PIPELINE_FLOW_DIAGRAM_v1.1.0.md"
}
```

---

## Design Specifications

### CSS Classes (new, in `flow.html` only)

| Class | Purpose |
|-------|---------|
| `.flow-main` | Page container — max-width 1600px, padding, margin auto |
| `.flow-subnav` | Secondary sticky nav — below `pipeline-nav` |
| `.flow-section` | Each of the 8 diagram sections — white card, border-radius, shadow |
| `.flow-section-header` | Title row — numbered circle + h2 |
| `.flow-num` | Blue numbered circle (32px) — match dashboard accent color |
| `.flow-info-row` | Flex row of info cards |
| `.flow-info-card` | Individual info card — adapt to dark/light |
| `.flow-diagram-wrap` | Diagram container — overflow-x auto, background, border |
| `.flow-legend` | Legend row below diagram — small text, gray |

**Color references (from existing `style.css`):**
- Accent blue: `#3498db` (same as dashboard)
- Dark bg: `#1a2332`
- Card bg dark: `#263447`
- Text dark mode: `#ecf0f1`

### Layout

```
┌─────────────────────────────────────────────┐
│  agents-header (standard chrome)             │
├─────────────────────────────────────────────┤
│  pipeline-nav (Pipeline | History | ... | ✅ System Map) │
├─────────────────────────────────────────────┤
│  flow-subnav (Gate Seq | State Machine | ...) │
├─────────────────────────────────────────────┤
│                                             │
│  flow-section #gates                        │
│  ┌─────────────────────────────────────┐   │
│  │ 1  Gate Sequence — מבט מאקרו        │   │
│  │ [info-cards row]                    │   │
│  │ [mermaid diagram — scrollable]      │   │
│  │ [legend]                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  flow-section #sm                           │
│  ... (× 8 sections total)                   │
└─────────────────────────────────────────────┘
```

---

## Acceptance Criteria

| # | Check | Expected |
|---|-------|----------|
| AC-01 | "System Map" tab visible | Present in pipeline-nav on ALL 6 pages (5 existing + flow.html) |
| AC-02 | All 8 diagrams render | No "Syntax error" bomb icons — all SVGs present |
| AC-03 | Dark theme | Diagrams adapt to dark theme (Mermaid dark + CSS) |
| AC-04 | Light theme | Diagrams render cleanly in light theme |
| AC-05 | Sub-navigation | Clicking section links scrolls correctly |
| AC-06 | Mobile / narrow | Diagrams scroll horizontally without breaking layout |
| AC-07 | No regression | All 5 existing pages fully functional — no changes to their behavior |
| AC-08 | FILE_INDEX.json | flow.html registered with correct metadata |
| AC-09 | Header/Nav chrome | flow.html uses identical `agents-header` + `pipeline-nav` as all pages |
| AC-10 | Content parity | All 8 diagram contents identical to `pipeline_flow.html` design spec |
| AC-11 | Version footer | Footer shows: "System Map v1.0.0 — Team 111 DDL v1.0.2 — 2026-03-28" |

---

## What does NOT change

| Item | Status |
|------|--------|
| All 5 existing pages (index, history, config, teams, portfolio) | ✅ Zero content changes |
| All action buttons (Start Run, Advance, Fail, Approve, Pause, Resume, Override) | ✅ Unchanged |
| app.js — all existing logic | ✅ Zero changes |
| style.css — no modifications | ✅ Add new classes only in flow.html `<style>` block |
| theme-init.js | ✅ Unchanged — reused as-is |
| pipeline_flow.html | ✅ Unchanged — serves as design spec / standalone reference |

---

## Source Reference for Diagram Content

All 8 diagrams must be copied **exactly** from:
```
agents_os_v3/ui/pipeline_flow.html
```

**Do NOT author new Mermaid code.** Copy verbatim from the design spec.
Any diagram corrections require mandate from Team 111 or Team 100.

SSOT documents (for agent reference):
```
_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md
_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.4.md
_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md
_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.1.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0.md
_COMMUNICATION/team_111/TEAM_111_AOS_V3_PIPELINE_FLOW_DIAGRAM_v1.1.0.md
```

---

## Handoff

**Deliver to:** `_COMMUNICATION/team_31/TEAM_31_AOS_V3_PIPELINE_FLOW_INTEGRATION_EVIDENCE_v1.0.0.md`

Evidence must include:
- [ ] Screenshot of all 6 pages showing "System Map" tab
- [ ] Screenshot of flow.html — Gate Sequence diagram rendered
- [ ] Screenshot of flow.html — State Machine diagram rendered
- [ ] Screenshot — dark theme (pipeline_domain=agents_os)
- [ ] Screenshot — light theme (pipeline_domain=tiktrack)
- [ ] FILE_INDEX.json entry confirmed

**Notify:** Team 11 upon completion — GATE_4 deliverable check item.

---

**log_entry | TEAM_00 | MANDATE | TEAM_31 | PIPELINE_FLOW_DASHBOARD_INTEGRATION | GATE_4 | 2026-03-28**
