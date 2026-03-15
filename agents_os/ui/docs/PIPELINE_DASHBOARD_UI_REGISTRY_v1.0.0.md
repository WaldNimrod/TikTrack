# Pipeline Dashboard UI Component Registry
## agents_os/ui/docs/PIPELINE_DASHBOARD_UI_REGISTRY_v1.0.0.md

**project_domain:** AGENTS_OS  
**owner:** Team 170  
**date:** 2026-03-15  
**source:** TEAM_00_TO_TEAM_170_S002_P005_WP001_DOCS_UPDATE_MANDATE_v1.0.0  
**status:** ACTIVE  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP001 |
| mandate_type | DOCS_UPDATE |
| doc_version | 1.0.0 |

---

## DOC-04 — buildCurrentStepBanner

### Component
**Source:** `agents_os/ui/js/pipeline-dashboard.js` — `buildCurrentStepBanner(gate, state)` (line ~1186)

### Behavior
**Added/Changed:** 2026-03-15

Unified banner shown above the Gate Context accordion on all pipeline gates. Renders into `#current-step-banner`.

**Structure:**
```
[Actor] — [Engine badge] — [Phase label]
Step 1: [action]
Step 2: [action]
Step 3: [action]
```

**Render trigger:** `loadPipelineState()` → `buildCurrentStepBanner(state.current_gate, state)`

### All 6 States (Modes)

| Gate/State | Class | Description |
|------------|-------|-------------|
| GATE_1 Phase 1 (no lld400) | `current-step-banner` (blue) | Team 170 / Gemini / LLD400 authoring |
| GATE_1 Phase 1 correction | `csb-correction` (yellow) | Team 170 / Gemini / correction cycle (failCount > 0) |
| GATE_1 Phase 2 (lld400 stored) | `csb-phase2` (green) | Team 190 / Codex / validation |
| `gate_state = PASS_WITH_ACTION` | `csb-pwa` (amber) | WP002 — actions pending |
| Human gate (GATE_2, GATE_6, GATE_7) | `csb-human` | Nimrod / browser review |
| GATE_8 | standard (blue) | Team 70 / Team 90 / closure |
| Standard codex gate | standard (blue) | Appropriate team per GATE_CONFIG |

### Usage Example
Banner is built automatically when `loadPipelineState()` completes. No manual call required.

---

## DOC-05 — Mandate Tab Phase Auto-Selection

### Component
**Source:** `agents_os/ui/js/pipeline-dashboard.js` — `_parseMandateSections()` (line ~226)

### Behavior
**Added/Changed:** 2026-03-15

When the gate is two-phase (e.g. GATE_1, GATE_8) and `lld400_content` (or `phase8_content`) is stored → Phase 2 tab is auto-selected.

**Active phase formula:**
```javascript
activePhase = (isTwoPhaseGate(curGate) && (lld400Ready || phase8Ready)) ? 2 : 1;
```

Where:
- `lld400Ready` = `!!(pipelineState.lld400_content || '').trim()`
- `phase8Ready` = `!!(pipelineState.phase8_content || '').trim()`

**Tab behavior:**
- Active tab shows badge: `▶ SEND NOW` (green)
- When `lld400_content` empty → Phase 1 tab auto-selected
- Auto-select runs after `_parseMandateSections()` builds tabs; `activePhaseKey` drives `showMandate()` and DOM `.active` class

### Purpose
User always sees the correct mandate without manual guessing.

---

## DOC-06 — PWA Button/Banner Scaffold (WP002 Pending)

### Component
**Source:** `agents_os/ui/js/pipeline-dashboard.js` — `buildQuickActionBar()`, `buildCurrentStepBanner()`, PWA banner block (line ~1488)

### Behavior
**Added/Changed:** 2026-03-15

**⚠️ WP002 (PASS_WITH_ACTION governance) is NOT yet active.** The following are scaffold/copy templates only. Commands `pass_with_actions`, `actions_clear`, `override` do not exist in `pipeline_run.sh` as real commands — they will be activated in S002-P005-WP002.

### 1. Pass w/ Action Button
**Location:** Quick Action Bar (every gate)

**Template copied:** `./pipeline_run.sh pass_with_actions "ACTION-1: [describe]|ACTION-2: [describe]"`

### 2. PWA Banner
**Shown when:** `gate_state === "PASS_WITH_ACTION"`

**Content:**
- List of `pending_actions`
- Button `✅ Actions Resolved` → copies `./pipeline_run.sh actions_clear`
- Button `⚡ Override & Advance` → copies `./pipeline_run.sh override "reason"`

### CSS Classes (pipeline-dashboard.css)
- `.pwa-banner` — PWA state banner container
- `.pwa-btn-clear` — Actions Resolved button
- `.pwa-btn-override` — Override & Advance button

### Note
WP002 (PASS_WITH_ACTION governance) will activate these commands in `pipeline_run.sh`. Until then, buttons are copy templates only — no backend implementation.

---

**log_entry | TEAM_170 | PIPELINE_DASHBOARD_UI_REGISTRY | DOC_04_05_06 | 2026-03-15**
