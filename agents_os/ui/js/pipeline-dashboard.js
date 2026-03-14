/* pipeline-dashboard.js — Team 61 AOUI LOD400 — Dashboard page logic */
let mandateSections = {};
let activeTeam = null;
let currentPromptText = "";
let refreshTimer = null;


// ── Accordion ─────────────────────────────────────────────────────────────
function toggleAccordion(id) {
  document.getElementById(id).classList.toggle("open");
}
function onDomainSwitch(domain) {
  switchDomain(domain);
  const isTiktrack = domain === "tiktrack";
  const titleEl = document.getElementById("domain-title");
  if (titleEl) titleEl.textContent = isTiktrack ? "🔷 TikTrack" : "⚡ Agents OS";
  document.title = isTiktrack ? "TikTrack — Pipeline Dashboard" : "Agents OS — Pipeline Dashboard";
  const btnT = document.getElementById("domain-btn-tiktrack");
  const btnA = document.getElementById("domain-btn-agentsos");
  if (btnT) btnT.className = "domain-btn" + (isTiktrack ? " active-tiktrack" : "");
  if (btnA) btnA.className = "domain-btn" + (!isTiktrack ? " active-agentsos" : "");
  const badge = document.getElementById("domain-badge-pill");
  if (badge) {
    badge.textContent = isTiktrack ? "tiktrack" : "agents_os";
    badge.className = "domain-label-badge " + (isTiktrack ? "domain-label-tiktrack" : "domain-label-agentsos");
  }
  loadAll();
}



// ── Load pipeline state ───────────────────────────────────────────────────
async function loadPipelineState() {
  try {
    let state = await loadDomainState(currentDomain);
    if (!state) throw new Error("No state");

    // Header + LEGACY_FALLBACK badge (SPC-02)
    const lastEl = document.getElementById("last-updated");
    const base = "[" + (state.project_domain || currentDomain) + "] " +
      "Last updated: " + (state.last_updated ? new Date(state.last_updated).toLocaleTimeString() : "unknown");
    lastEl.textContent = base;
    lastEl.innerHTML = base + (stateFallbackMode ? ' <span class="legacy-fallback-badge">⚠ LEGACY_FALLBACK</span>' : '');

    // Sidebar status
    document.getElementById("s-wp").textContent    = state.work_package_id || "—";
    document.getElementById("s-stage").textContent = state.stage_id || "—";

    const currentCfg = GATE_CONFIG[state.current_gate] || {};
    const st = gateStatus(state.current_gate, state);
    document.getElementById("s-gate-pill").innerHTML =
      `<span class="status-pill ${statusPillClass(st)}">${state.current_gate}</span>`;
    // Domain-aware owner (GATE_2/6 differ by domain)
    document.getElementById("s-owner").textContent  = getDomainOwner(state.current_gate);
    document.getElementById("s-engine").textContent = currentCfg.engine || "—";

    // Spec card
    document.getElementById("spec-text").textContent = state.spec_brief || "No spec loaded";
    document.getElementById("spec-wp").textContent   = "WP: " + (state.work_package_id || "—");

    // Gate timeline
    const gateList = document.getElementById("gate-list");
    gateList.innerHTML = GATE_SEQUENCE.map(g => {
      const s = gateStatus(g, state);
      const isCurr = g === state.current_gate;
      return `<li class="gate-item${isCurr?" is-current":""}">
        <span class="gate-dot ${statusDotClass(s)}"></span>
        <span class="gate-name">${g}</span>
        <span class="gate-status-text">${s==="pass"?"✓":s==="fail"?"✗":s==="current"?"←":""}</span>
      </li>`;
    }).join("");

    // History (optional elements — may be in roadmap page)
    const completed = state.gates_completed || [];
    const failed    = state.gates_failed    || [];
    const allHistory = [
      ...completed.map(g => ({gate:g, status:"pass"})),
      ...failed.map(g => ({gate:g, status:"fail"})),
    ];
    const hBadge = document.getElementById("history-badge");
    const hList  = document.getElementById("history-list");
    if (hBadge) hBadge.textContent =
      completed.length + " pass" + (failed.length ? " · " + failed.length + " fail" : "");
    if (hList) hList.innerHTML = allHistory.length
      ? allHistory.map(h =>
        `<li class="history-item">
          <span class="status-pill ${statusPillClass(h.status)}">${statusLabel(h.status)}</span>
          <span class="history-gate">${h.gate}</span>
        </li>`).join("")
      : "<li class='loading'>No completed gates yet</li>";

    // Quick commands (sidebar) + Quick action bar (main)
    buildCommands(state.current_gate);
    buildQuickActionBar(state.current_gate);

    return state;
  } catch(e) {
    document.getElementById("s-wp").textContent = "Error loading state";
    document.getElementById("s-wp").className = "error-msg";
    console.error("State load error:", e);
    return null;
  }
}

// buildCommands in pipeline-commands.js

// ── Load prompt ───────────────────────────────────────────────────────────
async function loadPrompt(gate) {
  if (!gate) return;
  const path = `../../_COMMUNICATION/agents_os/prompts/${gate}_prompt.md`;
  document.getElementById("prompt-gate-badge").textContent = gate;
  document.getElementById("prompt-gate-name").textContent  = gate;
  const cfg = GATE_CONFIG[gate] || {};
  document.getElementById("prompt-owner").textContent  = getDomainOwner(gate);
  document.getElementById("prompt-engine").textContent = cfg.engine || "—";
  document.getElementById("prompt-file-path").textContent = path;

  const text = await fetchText(path);
  if (text) {
    currentPromptText = text;
    document.getElementById("prompt-content").textContent = text;
  } else {
    currentPromptText = "";
    document.getElementById("prompt-content").innerHTML =
      `<span class="error-msg">Prompt not generated yet — run ./pipeline_run.sh to generate</span>`;
  }
  // Update booster hint with new gate's team, refresh preview if open
  const team = _getBoosterTeam();
  const hint = team ? `(${team.label} — ${team.name})` : "";
  const hintEl = document.getElementById("booster-team-hint");
  if (hintEl) hintEl.textContent = hint;
  if (document.getElementById("booster-toggle")?.checked) updateBoosterPreview();

  // ── Mandate gate: INFO mode on prompt section + auto-open mandates accordion ─
  const isMandateGate = gate in GATE_MANDATE_FILES;
  const copyBtn    = document.getElementById("copy-prompt-btn");
  const banner     = document.getElementById("mandate-redirect-banner");
  const promptHdr  = document.getElementById("acc-prompt-header");
  const promptIcon = document.getElementById("acc-prompt-icon");
  const promptTitle= document.getElementById("acc-prompt-title");
  if (isMandateGate) {
    // Copy button: fully disabled — copy from Mandate Tabs ↓ (below)
    if (copyBtn) {
      copyBtn.textContent = "📄 Gate Context";
      copyBtn.title       = "Per-team mandates are in the Mandate Tabs below ↓";
      copyBtn.disabled    = true;
      copyBtn.style.opacity = "0.35";
      copyBtn.style.cursor  = "not-allowed";
    }
    if (banner) banner.classList.add("visible");
    // Prompt accordion header: muted INFO style
    if (promptIcon)  promptIcon.textContent = "📄";
    if (promptTitle) promptTitle.textContent = "Gate Context — Info Only";
    if (promptHdr)   promptHdr.style.background = "var(--surface2)";
    // Auto-expand mandates accordion so Phase tabs are immediately visible
    const acc = document.getElementById("acc-mandates");
    if (acc && !acc.classList.contains("open")) acc.classList.add("open");
  } else {
    // Single-team gate: restore normal prompt section
    if (copyBtn) {
      copyBtn.textContent   = "📋 Copy Prompt";
      copyBtn.title         = "";
      copyBtn.disabled      = false;
      copyBtn.style.opacity = "";
      copyBtn.style.cursor  = "";
    }
    if (banner) banner.classList.remove("visible");
    if (promptIcon)  promptIcon.textContent = "📋";
    if (promptTitle) promptTitle.textContent = "Current Gate Prompt";
    if (promptHdr)   promptHdr.style.background = "";
  }
}

// ── Mandate file routing — mirrors GATE_MANDATE_FILES in pipeline.py ──────
// Gate → which prompts/ file holds the per-team mandate tabs
// GATE_1 and GATE_8 have dedicated mandate files. Others share implementation_mandates.md.
const GATE_MANDATE_FILES = {
  'GATE_1':                '../../_COMMUNICATION/agents_os/prompts/GATE_1_mandates.md',
  'G3_6_MANDATES':         '../../_COMMUNICATION/agents_os/prompts/implementation_mandates.md',
  'CURSOR_IMPLEMENTATION': '../../_COMMUNICATION/agents_os/prompts/implementation_mandates.md',
  'GATE_4':                '../../_COMMUNICATION/agents_os/prompts/implementation_mandates.md',
  'GATE_8':                '../../_COMMUNICATION/agents_os/prompts/gate_8_mandates.md',
};

// ── Load mandates (gate-aware — hidden for non-mandate gates) ─────────────
async function loadMandates() {
  const gate        = pipelineState?.current_gate || '';
  const mandateFile = GATE_MANDATE_FILES[gate];   // undefined if gate has no mandates
  const accMandates = document.getElementById('acc-mandates');

  // Gates with no mandate file → hide the entire mandate accordion
  if (!mandateFile) {
    if (accMandates) accMandates.style.display = 'none';
    return;
  }

  // Gate has mandates → show the accordion
  if (accMandates) accMandates.style.display = '';

  let text = await fetchText(mandateFile);

  if (!text) {
    document.getElementById("mandates-badge").textContent = "not generated";
    document.getElementById("mandate-content").innerHTML =
      '<span class="error-msg">Not yet generated — run: ./pipeline_run.sh (to generate mandate file)</span>';
    return;
  }

  _parseMandateSections(text);
}

// Per-section metadata: phase number + flags (populated by _parseMandateSections)
let mandateMeta = {};   // key → { phase, hasCorrection, hasPrereq }

function _parseMandateSections(text) {
  const sections = {};
  mandateMeta    = {};

  // Detect team sections: ## Team N ... (Phase N) — or any ## Team N ... ( form
  const hasSections = /^## Team \d+/m.test(text);
  if (!hasSections) {
    sections["Full"] = text;
  } else {
    const teamMatches = [...text.matchAll(/^## (Team \d+[^\n]*)/mg)];
    teamMatches.forEach((m, i) => {
      const key     = m[1].trim().split("(")[0].trim();   // "Team 20 — API Verification"
      const start   = m.index;
      const end     = i + 1 < teamMatches.length ? teamMatches[i + 1].index : text.length;
      const content = text.slice(start, end);
      sections[key] = content;

      // Extract phase number from "(Phase N)" in header
      const phaseMatch = m[1].match(/\(Phase (\d+)\)/);
      const phase = phaseMatch ? parseInt(phaseMatch[1]) : (i + 1);

      mandateMeta[key] = {
        phase,
        hasCorrection: content.includes("✅  Auto-loaded:"),
        hasPrereq:     content.includes("⚠️  PREREQUISITE:"),
        prereqMissing: content.includes("File not yet available"),
      };
    });
  }

  if (Object.keys(sections).length === 0) sections["All"] = text;

  mandateSections = sections;
  const keys = Object.keys(sections);
  document.getElementById("mandates-badge").textContent = keys.length + " team" + (keys.length !== 1 ? "s" : "");

  // ── Build tabs with phase badges ────────────────────────────────────────
  const tabs = document.getElementById("team-tabs");
  tabs.innerHTML = keys.map((k, i) => {
    const meta  = mandateMeta[k] || { phase: i + 1, hasCorrection: false, hasPrereq: false };

    // Tab class: first tab = next-phase (or correction-needed if correction data present)
    let tabClass = "team-tab";
    if (i === 0) {
      tabClass += meta.hasCorrection ? " correction-needed" : " next-phase";
    }

    // Phase badge
    const phaseBadge = `<span class="phase-badge">P${meta.phase}</span>`;

    // Correction badge on Phase 1 when blockers are injected
    const corrBadge = (i === 0 && meta.hasCorrection)
      ? `<span class="correction-badge">⚠ CORRECTION</span>` : "";

    return `<span class="${tabClass}" onclick="selectTeam(this, ${escAttr(JSON.stringify(k))})">`
         + `${escHtml(k)}${phaseBadge}${corrBadge}</span>`;
  }).join("");

  if (keys.length > 0) { activeTeam = keys[0]; showMandate(keys[0]); }
}

function selectTeam(el, key) {
  activeTeam = key;
  document.querySelectorAll(".team-tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  showMandate(key);
}

function showMandate(key) {
  const content   = mandateSections[key] || "(empty)";
  const meta      = mandateMeta[key] || {};
  const contentEl = document.getElementById("mandate-content");

  // Build prereq warning prefix (non-first phases that haven't had their prereq met)
  let prefixHtml = "";
  if (meta.hasPrereq) {
    const m    = content.match(/⚠️  PREREQUISITE: \*\*([^*]+)\*\*/);
    const who  = m ? m[1] : "the prior phase";
    const ph   = meta.phase || 2;
    const cmd  = `./pipeline_run.sh phase${ph}`;
    prefixHtml = `<div class="prereq-warning">`
               + `⏳ <strong>Wait for ${escHtml(who)}</strong> — Phase ${ph - 1} must be COMPLETE first. `
               + `When they're done, run in terminal: `
               + `<code style="background:rgba(0,0,0,0.3);padding:1px 6px;border-radius:3px;font-size:11px">${escHtml(cmd)}</code>`
               + ` — injects their output and refreshes this prompt.</div>`;
  }
  if (meta.prereqMissing && meta.hasPrereq) {
    const ph  = meta.phase || 2;
    const cmd = `./pipeline_run.sh phase${ph}`;
    // Prereq file not found yet — strong CTA with exact command
    prefixHtml += `<div class="prereq-warning" style="border-color:rgba(210,153,34,0.3);color:var(--warning);background:rgba(210,153,34,0.05)">`
                + `📄 <strong>Prior team's output not yet available.</strong> `
                + `Once Phase ${ph - 1} is complete, run: `
                + `<code style="background:rgba(0,0,0,0.2);padding:1px 6px;border-radius:3px;font-size:11px">${escHtml(cmd)}</code>`
                + ` — injects their output into this section.</div>`;
  }

  contentEl.innerHTML = prefixHtml;
  contentEl.appendChild(document.createTextNode(content));
}

function copyCurrentMandate() {
  const content = mandateSections[activeTeam] || "";
  const btn     = document.getElementById("copy-mandate-btn");
  const meta    = mandateMeta[activeTeam] || {};

  // Warn if copying a locked phase (prereq file missing) — but still copy
  if (meta.hasPrereq && meta.prereqMissing) {
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = "⚠️ Copied (prereq missing)";
      btn.style.background = "var(--warning)";
      setTimeout(() => { btn.textContent = orig; btn.style.background = ""; }, 2500);
    }
  }
  copyText(content, btn);
}

// ── Comprehensive gate definitions — all 14 gates ─────────────────────────
const ALL_GATE_DEFS = {
  'GATE_0': {
    owner:'team_190', engine:'codex',
    desc:'Team 190 validates scope: domain isolation, no active program conflicts, feasibility',
    advice:'./pipeline_run.sh → paste prompt to Codex → Team 190 validates → PASS: ./pipeline_run.sh pass',
    failAdvice:'./pipeline_run.sh fail "BLOCK-G0-NNN: ..." → fix spec → re-run GATE_0',
    twoPaths:true,
    passCmd:'./pipeline_run.sh pass',
    failCmd:'./pipeline_run.sh fail "BLOCK-G0-NNN: ..."',
    passLabel:'✅ Scope Valid — Team 190 PASS',
    failLabel:'❌ Scope Blocked — Team 190 FAIL',
    verdictTeam:'team_190', verdictGate:'GATE_0',
    failRoutes:{
      doc:{ cmd:'./pipeline_run.sh route doc GATE_0', label:'📝 Doc Fix → retry GATE_0', desc:'Fix scope wording/doc issues → re-validate' },
      full:{ cmd:'./pipeline_run.sh route full GATE_0', label:'🔄 Full Revision → retry GATE_0', desc:'Scope fundamentally rejected → rewrite brief' },
    },
  },
  'GATE_1': {
    owner:'team_170+190', engine:'codex',
    desc:'Team 170 produces LLD400 spec → Team 190 validates structure and completeness',
    advice:'./pipeline_run.sh → paste to Codex → Team 170 writes spec + Team 190 validates → ./pipeline_run.sh pass',
    failAdvice:'./pipeline_run.sh fail "BLOCK-G1-NNN: ..." → Team 170 revises spec → re-run GATE_1',
    twoPaths:true,
    passCmd:'./pipeline_run.sh pass',
    failCmd:'./pipeline_run.sh fail "BLOCK-G1-NNN: ..."',
    passLabel:'✅ LLD400 Validated — Team 190 PASS',
    failLabel:'❌ LLD400 Rejected — Team 190 FAIL',
    verdictTeam:'team_190', verdictGate:'GATE_1',
    failRoutes:{
      doc:{ cmd:'./pipeline_run.sh route doc GATE_1', label:'📝 Doc Fix → retry GATE_1', desc:'LLD400 header/format issues → Team 170 fixes' },
      full:{ cmd:'./pipeline_run.sh route full GATE_1', label:'🔄 Full Rewrite → retry GATE_1', desc:'LLD400 rejected — Team 170 rewrites spec' },
    },
  },
  'GATE_2': {
    owner:'team_100', engine:'codex+human',
    desc:'Team 100 reviews spec, recommends approval → Nimrod decides (WAITING_GATE2_APPROVAL)',
    advice:'./pipeline_run.sh → paste to Codex → Team 100 outputs recommendation → ./pipeline_run.sh pass → human approval step follows',
    failAdvice:'./pipeline_run.sh fail "CONCERN-G2-NNN: ..." → route to Team 00 before approving',
    twoPaths:true,
    passCmd:'./pipeline_run.sh pass',
    failCmd:'./pipeline_run.sh fail "CONCERN-G2-NNN: ..."',
    passLabel:'✅ Team 100 PASS → human approval',
    failLabel:'❌ Team 100 FAIL — blockers found',
    verdictTeam:'team_100', verdictGate:'GATE_2',
    failRoutes:{
      doc:{ cmd:'./pipeline_run.sh route doc GATE_2', label:'📝 Doc Fix → GATE_1', desc:'Spec doc gaps → Team 170 revises' },
      full:{ cmd:'./pipeline_run.sh route full GATE_2', label:'🔄 Major Revision → GATE_1', desc:'Spec rejected — complete rewrite needed' },
    },
  },
  'WAITING_GATE2_APPROVAL': {
    owner:'team_00', engine:'human',
    desc:'Nimrod final approval for GATE_2 — "do we approve building this?"',
    advice:'Review Team 100 recommendation → ./pipeline_run.sh approve',
    failAdvice:'If rejected: ./pipeline_run.sh fail "reason" → route back to spec revision',
    twoPaths:true,
    passCmd:'./pipeline_run.sh approve',
    failCmd:'./pipeline_run.sh fail "reason"',
    passLabel:'✅ Approved — proceed to implementation',
    failLabel:'❌ Rejected — back to spec',
    failRoutes:{
      doc:{ cmd:'./pipeline_run.sh route doc WAITING_GATE2_APPROVAL', label:'📝 Minor Issue → GATE_1', desc:'Nimrod: minor doc issue → Team 170 revises' },
      full:{ cmd:'./pipeline_run.sh route full WAITING_GATE2_APPROVAL', label:'🔄 Rejected → GATE_1', desc:'Nimrod: spec fundamentally rejected → full revision' },
    },
  },
  'G3_PLAN': {
    owner:'team_10', engine:'cursor',
    desc:'Team 10 produces implementation work plan in Cursor Composer',
    advice:'./pipeline_run.sh → paste to Cursor → Team 10 writes work plan → ./pipeline_run.sh store G3_PLAN <file> → ./pipeline_run.sh pass',
    failAdvice:'G3_5 rejected this plan. Run: ./pipeline_run.sh revise "BLOCKER-1: ..." → paste revised prompt into Cursor → Team 10 fixes → ./pipeline_run.sh pass',
    revisionGate:'G3_5',
  },
  'G3_5': {
    owner:'team_90', engine:'codex',
    desc:'Team 90 validates work plan: completeness, API contracts, test criteria, no spec gaps',
    advice:'./pipeline_run.sh → paste to Codex → Team 90 reviews → Team 90 produces verdict',
    failAdvice:'./pipeline_run.sh fail "BLOCKER-1: ..." → ./pipeline_run.sh revise "BLOCKER-1: ..." → paste revised G3_PLAN prompt into Cursor → Team 10 fixes → ./pipeline_run.sh pass',
    twoPaths:true,
    passCmd:'./pipeline_run.sh pass',
    failCmd:'./pipeline_run.sh fail "BLOCKER-1: ..."',
    reviseCmd:'./pipeline_run.sh revise "BLOCKER-1: ..."',
    passLabel:'✅ Work Plan Valid — Team 90 PASS',
    failLabel:'❌ Work Plan Rejected — Team 90 FAIL',
    verdictTeam:'team_90', verdictGate:'G3_5',
    failRoutes:{
      doc:{ cmd:'./pipeline_run.sh route doc G3_5', label:'📝 Plan Fix → G3_PLAN', desc:'Plan format/governance → Team 10 revises and resubmits' },
      full:{ cmd:'./pipeline_run.sh route full G3_5', label:'🔄 Full Rewrite → G3_PLAN', desc:'Plan rejected — Team 10 writes new plan from scratch' },
    },
  },
  'G3_6_MANDATES': {
    owner:'orchestrator', engine:'auto',
    desc:'Auto-generates per-team mandates deterministically from work plan',
    advice:'Mandates are auto-generated → ./pipeline_run.sh pass to advance',
    failAdvice:'Should not fail. Check pipeline.py error output for issues.',
    files:['../../_COMMUNICATION/agents_os/prompts/implementation_mandates.md'],
  },
  'CURSOR_IMPLEMENTATION': {
    owner:'teams_20+30', engine:'cursor',
    desc:'Teams 20+30 implement in Cursor Composer — 2 sequential sub-steps',
    advice:'Step A: Team 20 API verify → Step B: Team 30 widget → git commit → ./pipeline_run.sh pass',
    failAdvice:'./pipeline_run.sh fail "reason" → identify which sub-step failed → fix → re-run',
    substeps:[
      {
        label:'Step A — Team 20 (API Verify)',
        files:['../../_COMMUNICATION/team_20/TEAM_20_S001_P002_WP001_API_VERIFY_v1.0.0.md'],
        doneMsg:'✅ API verification done — proceed to Step B (Team 30)',
        pendingMsg:'⏳ Open Cursor Composer → paste Team 20 mandate from implementation_mandates.md',
      },
      {
        label:'Step B — Team 30 (Widget Implementation)',
        requiresPrev:true,
        files:['../../ui/src/components/AlertsSummaryWidget.jsx','../../ui/src/components/HomePage.jsx'],
        doneMsg:'✅ Widget files created — run git commit then ./pipeline_run.sh pass',
        pendingMsg:'⏳ Open new Cursor Composer → paste Team 30 mandate from implementation_mandates.md',
      },
    ],
  },
  'GATE_4': {
    owner:'team_50', engine:'cursor+mcp',
    desc:'Team 50 QA: browser automation tests, 10-point checklist, binary PASS/FAIL',
    advice:'./pipeline_run.sh → paste to Cursor → Team 50 runs tests → review report → ./pipeline_run.sh pass OR fail',
    failAdvice:'./pipeline_run.sh fail "QA-FAIL-NNN: ..." → route to Team 10 for code fixes → re-run CURSOR_IMPLEMENTATION → GATE_4',
    twoPaths:true,
    passCmd:'./pipeline_run.sh pass',
    failCmd:'./pipeline_run.sh fail "QA-FAIL-NNN: ..."',
    passLabel:'✅ QA Passed — Team 50 PASS',
    failLabel:'❌ QA Failed — Team 50 FAIL',
    verdictTeam:'team_50', verdictGate:'GATE_4',
    failRoutes:{
      doc:{ cmd:'./pipeline_run.sh route doc GATE_4', label:'📝 Doc Fix → CURSOR_IMPL', desc:'QA: doc/governance issues only — Team 10 fixes files, re-commit, re-QA' },
      full:{ cmd:'./pipeline_run.sh route full GATE_4', label:'🔄 New Mandates → G3_6', desc:'QA: code failures — new mandates, re-implement, re-QA' },
    },
    substeps:[
      {
        label:'Team 50 — QA Report',
        files:['../../_COMMUNICATION/team_50/TEAM_50_S001_P002_WP001_QA_REPORT_v1.0.0.md'],
        doneMsg:'✅ QA report exists — review findings then use PASS/FAIL builder above',
        pendingMsg:'⏳ Open Cursor Composer → paste Team 50 mandate from implementation_mandates.md',
      },
    ],
  },
  'GATE_5': {
    owner:'team_90', engine:'codex',
    desc:'Team 90 dev validation: code compliance vs spec, no regressions, no spec gaps',
    advice:'./pipeline_run.sh → paste to Codex → Team 90 reviews code → Team 90 produces verdict',
    failAdvice:'./pipeline_run.sh fail "BF-G5-NNN: ..." → choose routing: doc fix OR full cycle',
    twoPaths:true,
    passCmd:'./pipeline_run.sh pass',
    failCmd:'./pipeline_run.sh fail "BF-G5-NNN: ..."',
    passLabel:'✅ Code Valid — Team 90 PASS',
    failLabel:'❌ Code Rejected — Team 90 FAIL',
    verdictTeam:'team_90', verdictGate:'GATE_5',
    failRoutes:{
      doc:{
        cmd:'./pipeline_run.sh route doc GATE_5',
        label:'📝 Doc Fix → CURSOR_IMPL',
        desc:'<strong>Governance/docs only</strong> — Team 10 fixes specific files → re-commit → GATE_4 → GATE_5',
      },
      full:{
        cmd:'./pipeline_run.sh route full GATE_5',
        label:'🔄 Full Cycle → G3_PLAN',
        desc:'<strong>Code/design issues</strong> — re-plan → mandates → implementation → QA → GATE_5',
      },
    },
  },
  'GATE_6': {
    owner:'team_100', engine:'codex+human',
    desc:'Team 100 reality vs intent: does what was built match what was approved?',
    advice:'./pipeline_run.sh → paste to Codex → Team 100 reviews → ./pipeline_run.sh pass → human approval step follows',
    failAdvice:'./pipeline_run.sh fail "GAP-G6-NNN: ..." → choose routing: minor code fix OR full re-implementation',
    twoPaths:true,
    passCmd:'./pipeline_run.sh pass',
    failCmd:'./pipeline_run.sh fail "GAP-G6-NNN: ..."',
    passLabel:'✅ Reality Match — Team 100 PASS',
    failLabel:'❌ Intent Gap — Team 100 FAIL',
    verdictTeam:'team_100', verdictGate:'GATE_6',
    failRoutes:{
      doc:{ cmd:'./pipeline_run.sh route doc GATE_6', label:'📝 Minor Fix → CURSOR_IMPL', desc:'<strong>Minor gaps</strong> — Team 10 adjusts code → re-validate' },
      full:{ cmd:'./pipeline_run.sh route full GATE_6', label:'🔄 Major Gap → G3_PLAN', desc:'<strong>Major intent gap</strong> — full re-implementation required' },
    },
  },
  'WAITING_GATE6_APPROVAL': {
    owner:'team_00', engine:'human',
    desc:'Nimrod approves GATE_6 — "does the built product match what we approved?"',
    advice:'Review GATE_6 findings → ./pipeline_run.sh approve',
    failAdvice:'If rejected: ./pipeline_run.sh fail "reason" → choose routing',
    twoPaths:true,
    passCmd:'./pipeline_run.sh approve',
    failCmd:'./pipeline_run.sh fail "reason"',
    passLabel:'✅ Approved — proceed to UX review',
    failLabel:'❌ Rejected — choose routing',
    failRoutes:{
      doc:{ cmd:'./pipeline_run.sh route doc WAITING_GATE6_APPROVAL', label:'📝 Minor Fix → CURSOR_IMPL', desc:'<strong>Minor issues</strong> — Team 10 fixes → re-validate' },
      full:{ cmd:'./pipeline_run.sh route full WAITING_GATE6_APPROVAL', label:'🔄 Rejected → G3_PLAN', desc:'<strong>Major issues</strong> — full re-implementation cycle' },
    },
  },
  'GATE_7': {
    owner:'team_90', engine:'human',
    desc:'Team 90 orchestrates UX review package → Nimrod browser sign-off (scenario checklist + active links)',
    advice:'./pipeline_run.sh  →  paste prompt  →  open links  →  work through checklist  →  ./pipeline_run.sh pass',
    failAdvice:'Document specific UX issues → ./pipeline_run.sh fail "UX-001: [issue]" → choose routing',
    twoPaths:true,
    passCmd:'./pipeline_run.sh pass',
    failCmd:'./pipeline_run.sh fail "UX-001: [issue description]"',
    passLabel:'✅ UX Approved — Nimrod sign-off',
    failLabel:'❌ UX Issues — document findings',
    failRoutes:{
      doc:{ cmd:'./pipeline_run.sh route doc GATE_7', label:'📝 UI Fix → CURSOR_IMPL', desc:'<strong>UI/wording issues</strong> — Team 10/30 fixes → re-review' },
      full:{ cmd:'./pipeline_run.sh route full GATE_7', label:'🔄 Redesign → G3_PLAN', desc:'<strong>Major UX redesign</strong> — full re-plan and implementation' },
    },
  },
  'GATE_8': {
    owner:'team_70 → team_90', engine:'codex',
    desc:'Team 70 produces AS_MADE_REPORT + archives WP files → Team 90 validates → WP CLOSED',
    advice:'./pipeline_run.sh  →  paste Phase 1 tab to Team 70/170  →  paste Phase 2 tab to Team 90  →  ./pipeline_run.sh pass',
    failAdvice:'./pipeline_run.sh fail "CLOSURE-NNN: [issue]"  →  Team 70 corrects  →  re-run GATE_8',
    twoPaths:true,
    passCmd:'./pipeline_run.sh pass',
    failCmd:'./pipeline_run.sh fail "CLOSURE-001: [issue]"',
    passLabel:'✅ Closure Validated — WP CLOSED',
    failLabel:'❌ Closure Incomplete — Team 70/170 correct',
    verdictTeam:'team_90', verdictGate:'GATE_8',
    files:['../../_COMMUNICATION/agents_os/prompts/gate_8_mandates.md'],
    failRoutes:{
      doc:{ cmd:'./pipeline_run.sh route doc GATE_8', label:'📝 Correction → GATE_8', desc:'<strong>Closure issues</strong> — Team 70/170 corrects docs or archive → Team 90 re-validates' },
      full:{ cmd:'./pipeline_run.sh route full GATE_8', label:'🔄 Full Redo → GATE_8', desc:'<strong>Closure rejected</strong> — Team 70/170 full redo of AS_MADE_REPORT + archive' },
    },
  },
};

// ── Verdict file candidates per gate (for auto-detection) ─────────────────
// Domain-aware: GATE_2 + GATE_6 include both team_00 and team_100 folders
// (different domains route to different teams; we check both to be safe)
function getVerdictCandidates(gate, wp) {
  const d = '../../_COMMUNICATION/';
  const t00  = `${d}team_00/`;
  const t90  = `${d}team_90/`;
  const t190 = `${d}team_190/`;
  const t100 = `${d}team_100/`;
  const t50  = `${d}team_50/`;
  const t70  = `${d}team_70/`;
  // File naming uses underscores; WP IDs use hyphens — normalise for file lookups.
  const wpu = wp.replace(/-/g, '_');
  const v = {
    'GATE_0': [
      `${t190}TEAM_190_${wpu}_GATE_0_VERDICT_v1.0.0.md`,
      `${t190}TEAM_190_${wpu}_GATE_0_VALIDATION_v1.0.0.md`,
      `${t190}TEAM_190_${wpu}_SCOPE_VALIDATION_v1.0.0.md`,
      `${t190}TEAM_190_${wp}_GATE_0_VERDICT_v1.0.0.md`,
    ],
    'GATE_1': [
      `${t190}TEAM_190_${wpu}_GATE_1_VERDICT_v1.0.0.md`,
      `${t190}TEAM_190_${wpu}_GATE_1_VALIDATION_v1.0.0.md`,
      `${t190}TEAM_190_${wpu}_LLD400_VALIDATION_v1.0.0.md`,
      `${t190}TEAM_190_${wp}_GATE_1_VERDICT_v1.0.0.md`,
    ],
    // GATE_2 — domain-aware: TikTrack → team_00, AgentsOS → team_100 (check both)
    'GATE_2': [
      `${t100}TEAM_100_${wpu}_GATE_2_VERDICT_v1.0.0.md`,
      `${t100}TEAM_100_${wpu}_GATE_2_SPEC_REVIEW_v1.0.0.md`,
      `${t100}TEAM_100_${wp}_GATE_2_VERDICT_v1.0.0.md`,
      `${t00}TEAM_00_${wpu}_GATE_2_VERDICT_v1.0.0.md`,
      `${t00}TEAM_00_${wp}_GATE_2_VERDICT_v1.0.0.md`,
    ],
    'G3_5': [
      `${t90}TEAM_90_${wpu}_G3_5_VERDICT_v1.0.0.md`,
      `${t90}TEAM_90_${wpu}_G3_5_VALIDATION_v1.0.0.md`,
      `${t90}TEAM_90_${wpu}_WORK_PLAN_VALIDATION_v1.0.0.md`,
      `${t90}TEAM_90_TO_TEAM_10_${wpu}_VALIDATION_RESPONSE.md`,
      `${t90}TEAM_90_${wp}_G3_5_VERDICT_v1.0.0.md`,
    ],
    'GATE_4': [
      `${t50}TEAM_50_${wpu}_QA_REPORT_v1.0.0.md`,
      `${t50}TEAM_50_${wpu}_GATE_4_REPORT_v1.0.0.md`,
      `${t50}TEAM_50_${wp}_QA_REPORT_v1.0.0.md`,
    ],
    'GATE_5': [
      `${t90}TEAM_90_${wpu}_GATE_5_VALIDATION_v1.0.0.md`,
      `${t90}TEAM_90_${wpu}_GATE5_VALIDATION_v1.0.0.md`,
      `${t90}TEAM_90_${wpu}_GATE_5_VERDICT_v1.0.0.md`,
      `${t90}TEAM_90_${wpu}_G5_VALIDATION_v1.0.0.md`,
      `${t90}TEAM_90_${wpu}_GATE_5_REVIEW_v1.0.0.md`,
      `${t90}TEAM_90_TO_TEAM_10_${wpu}_GATE_5_VALIDATION_v1.0.0.md`,
      `${t90}TEAM_90_TO_TEAM_10_${wpu}_BLOCKING_REPORT.md`,
      `${t90}TEAM_90_${wp}_GATE_5_VALIDATION_v1.0.0.md`,
    ],
    // GATE_6 — domain-aware: TikTrack → team_00, AgentsOS → team_100 (check both)
    'GATE_6': [
      `${t100}TEAM_100_${wpu}_GATE_6_VERDICT_v1.0.0.md`,
      `${t100}TEAM_100_${wpu}_GATE_6_REVIEW_v1.0.0.md`,
      `${t100}TEAM_100_${wpu}_REALITY_VS_INTENT_v1.0.0.md`,
      `${t100}TEAM_100_${wp}_GATE_6_VERDICT_v1.0.0.md`,
      `${t00}TEAM_00_${wpu}_GATE_6_VERDICT_v1.0.0.md`,
      `${t00}TEAM_00_${wpu}_GATE_6_REVIEW_v1.0.0.md`,
      `${t00}TEAM_00_${wp}_GATE_6_VERDICT_v1.0.0.md`,
    ],
    'GATE_8': [
      // Team 90 closure validation verdict (canonical)
      `${t90}TEAM_90_${wpu}_GATE_8_VERDICT_v1.0.0.md`,
      `${t90}TEAM_90_${wpu}_GATE_8_CLOSURE_VALIDATION_v1.0.0.md`,
      // Team 70 (TikTrack) AS_MADE_REPORT + docs
      `${t70}TEAM_70_${wpu}_AS_MADE_REPORT_v1.0.0.md`,
      `${t70}TEAM_70_${wpu}_GATE_8_DOCS_v1.0.0.md`,
      // Team 170 (AgentsOS) equivalents
      `${d}team_170/TEAM_170_${wpu}_AS_MADE_REPORT_v1.0.0.md`,
      `${d}team_170/TEAM_170_${wpu}_GATE_8_DOCS_v1.0.0.md`,
      // Fallback patterns (hyphen WP-id)
      `${t90}TEAM_90_${wp}_GATE_8_VERDICT_v1.0.0.md`,
    ],
  };
  return v[gate] || [];
}

/** Domain-aware verdictTeam for a gate (used in quick-action bar rendering) */
function getEffectiveVerdictTeam(gate) {
  if (gate === 'GATE_2' || gate === 'GATE_6') {
    return getDomainOwner(gate);
  }
  return (ALL_GATE_DEFS[gate] || {}).verdictTeam || null;
}

// ── Progress Check ─────────────────────────────────────────────────────────
async function runProgressCheck() {
  document.getElementById("progress-modal").classList.add("open");
  const content = document.getElementById("progress-content");
  content.innerHTML = '<span class="loading">Scanning pipeline state and artifacts…</span>';

  let state = null;
  try {
    // Try domain-specific file, then legacy fallback
    let r = await fetch(getDomainStateFile() + '?t=' + Date.now());
    if (!r.ok) r = await fetch(LEGACY_STATE_FILE + '?t=' + Date.now());
    if (!r.ok) throw new Error("state file not found");
    state = await r.json();
  } catch(e) {
    content.innerHTML = '<div class="alert-box">❌ Cannot read pipeline state — is the HTTP server running?<br><code>python3 -m http.server 8090</code></div>';
    return;
  }

  const gate      = state.current_gate;
  const completed = state.gates_completed || [];
  const failed    = state.gates_failed    || [];
  const cfg       = GATE_CONFIG[gate] || {};
  const def       = ALL_GATE_DEFS[gate] || {};

  // ── Full Pipeline Overview ──────────────────────────────────────────────
  let html = `<div style="margin-bottom:16px">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:8px">Full Pipeline Overview — All Gates</div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr>
        <th style="text-align:left;padding:3px 6px;color:var(--text-muted);border-bottom:1px solid var(--border);font-size:10px;text-transform:uppercase">Gate</th>
        <th style="text-align:left;padding:3px 6px;color:var(--text-muted);border-bottom:1px solid var(--border);font-size:10px;text-transform:uppercase">Owner</th>
        <th style="text-align:left;padding:3px 6px;color:var(--text-muted);border-bottom:1px solid var(--border);font-size:10px;text-transform:uppercase">Status</th>
      </tr></thead><tbody>`;
  GATE_SEQUENCE.forEach(g => {
    const s    = gateStatus(g, state);
    const gcfg = GATE_CONFIG[g] || {};
    const isCur = g === gate;
    const icon  = s==='pass'?'✓':s==='fail'?'✗':s==='current'?'▶':s==='human'?'⏸':'○';
    const color = s==='pass'?'var(--success)':s==='fail'?'var(--danger)':s==='current'?'var(--accent)':s==='human'?'var(--warning)':'var(--border)';
    html += `<tr style="${isCur?'background:rgba(31,111,235,0.08);':''}">
      <td style="padding:3px 6px;font-family:var(--mono);font-size:10px;color:${color}">${icon} ${escHtml(g)}</td>
      <td style="padding:3px 6px;color:var(--text-muted);font-size:10px">${escHtml(getDomainOwner(g))}</td>
      <td style="padding:3px 6px"><span class="status-pill ${statusPillClass(s)}" style="font-size:10px">${statusLabel(s)}</span></td>
    </tr>`;
  });
  html += `</tbody></table></div>`;

  // ── Current Gate Summary ────────────────────────────────────────────────
  html += `<div style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:10px 14px;margin-bottom:12px">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:8px">Current Gate Analysis</div>
    <div class="info-row"><span class="info-key">Gate:</span><span class="info-val" style="font-family:var(--mono)">${escHtml(gate)}</span></div>
    <div class="info-row"><span class="info-key">WP:</span><span class="info-val" style="font-family:var(--mono)">${escHtml(state.work_package_id||'—')}</span></div>
    <div class="info-row"><span class="info-key">Owner:</span><span class="info-val">${escHtml(def.owner||cfg.owner||'—')}</span></div>
    <div class="info-row"><span class="info-key">Engine:</span><span class="info-val">${escHtml(def.engine||cfg.engine||'—')}</span></div>
    <div class="info-row" style="align-items:flex-start"><span class="info-key">Scope:</span><span style="font-size:11px;color:var(--text);text-align:right;max-width:65%">${escHtml(def.desc||cfg.desc||'—')}</span></div>
    ${failed.length ? `<div class="info-row"><span class="info-key">FAIL cycles:</span><span style="color:var(--warning);font-size:11px;font-family:var(--mono)">${failed.map(g=>escHtml(g)).join(', ')}</span></div>` : ''}
  </div>`;

  // ── G3_PLAN revision mode detection ────────────────────────────────────
  if (gate === 'G3_PLAN' && failed.includes('G3_5')) {
    html += `<div style="background:rgba(210,153,34,0.1);border:1px solid var(--warning);border-radius:6px;padding:10px 14px;margin-bottom:12px">
      <div style="font-weight:600;color:var(--warning);margin-bottom:6px">⚠️ REVISION MODE — G3_5 failed the previous work plan</div>
      <div style="font-size:12px;margin-bottom:8px">Team 90 rejected the work plan. Run revision command with specific blockers:</div>
      <div style="font-family:var(--mono);font-size:11px;background:#010409;padding:8px;border-radius:4px;margin-bottom:6px">./pipeline_run.sh revise "BLOCKER-1: ... BLOCKER-2: ..."</div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">Then: paste ▼▼▼ block into Cursor → Team 10 fixes → ./pipeline_run.sh pass</div>
      <button class="btn" onclick="copyCmd('./pipeline_run.sh revise \\'BLOCKER-1: ...\\'', this)">📋 Copy revise cmd</button>
    </div>`;
  }

  // ── Gate fail cycle detection (currently AT gate, has failed before) ──────
  if (def.twoPaths && failed.includes(gate)) {
    const failCount = failed.filter(g => g === gate).length;
    const defaultFailCmd = def.failCmd || `./pipeline_run.sh fail "reason"`;
    const routes = def.failRoutes || null;

    html += `<div style="background:rgba(248,81,73,0.08);border:2px solid var(--danger);border-radius:8px;padding:12px 14px;margin-bottom:12px">
      <div style="font-weight:700;color:var(--danger);margin-bottom:8px">🔄 ${escHtml(gate)} FAIL CYCLE — ${failCount}× failed</div>
      <div style="font-size:12px;margin-bottom:10px">This gate has been rejected <strong>${failCount} time${failCount>1?'s':''}</strong>.</div>`;

    if (getEffectiveVerdictTeam(gate)) {
      html += `
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:4px">Step 1 — Build FAIL command from verdict file:</div>
      <div style="font-size:10px;margin-bottom:4px" id="pc-fc-status-${gate}">🔍 Searching for verdict file…</div>
      <textarea id="pc-fc-ta-${gate}" class="findings-textarea" style="min-height:60px" placeholder="${escAttr(defaultFailCmd.replace('./pipeline_run.sh fail "', '').replace('"', ''))}"
        oninput="pcUpdateFcCmd('${gate}')"></textarea>
      <div class="findings-cmd-row">
        <div class="findings-cmd-text" id="pc-fc-preview-${gate}">${escHtml(defaultFailCmd)}</div>
        <button class="findings-copy-btn" onclick="copyText(document.getElementById('pc-fc-preview-${gate}').textContent, this)">⎘ Copy → terminal</button>
      </div>`;
    }

    if (routes) {
      const docCmd  = routes.doc  ? routes.doc.cmd  : '';
      const fullCmd = routes.full ? routes.full.cmd : '';
      html += `
      <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-top:12px;margin-bottom:6px">Step 2 — Route pipeline forward:</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px">`;

      if (docCmd) {
        html += `<div style="background:rgba(210,153,34,0.1);border:1px solid var(--warning);border-radius:6px;padding:8px">
          <div style="color:var(--warning);font-size:11px;font-weight:700;margin-bottom:4px">${escHtml(routes.doc.label)}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px">${routes.doc.desc || ''}</div>
          <div style="font-family:var(--mono);font-size:10px;background:#010409;padding:4px 6px;border-radius:4px;margin-bottom:5px">${escHtml(docCmd)}</div>
          <button class="btn" style="font-size:10px" onclick="copyCmd(${escAttr(JSON.stringify(docCmd))}, this)">📋 Copy</button>
        </div>`;
      }
      if (fullCmd) {
        html += `<div style="background:rgba(248,81,73,0.08);border:1px solid var(--danger);border-radius:6px;padding:8px">
          <div style="color:var(--danger);font-size:11px;font-weight:700;margin-bottom:4px">${escHtml(routes.full.label)}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px">${routes.full.desc || ''}</div>
          <div style="font-family:var(--mono);font-size:10px;background:#010409;padding:4px 6px;border-radius:4px;margin-bottom:5px">${escHtml(fullCmd)}</div>
          <button class="btn" style="font-size:10px" onclick="copyCmd(${escAttr(JSON.stringify(fullCmd))}, this)">📋 Copy</button>
        </div>`;
      }
      html += `</div>`;
    } else {
      html += `<div style="font-size:11px;color:var(--text-muted);margin-top:8px">After recording FAIL → fix issues → re-run the gate.</div>`;
    }

    html += `</div>`;
  }

  // ── GATE_5 re-implementation banner (currently at CURSOR_IMPLEMENTATION after GATE_5 fail) ─
  if (gate === 'CURSOR_IMPLEMENTATION' && failed.includes('GATE_5')) {
    const g5Count = failed.filter(g => g === 'GATE_5').length;
    html += `<div style="background:rgba(248,81,73,0.06);border:1px solid var(--danger);border-radius:6px;padding:10px 14px;margin-bottom:12px">
      <div style="font-weight:600;color:var(--danger);margin-bottom:4px">🔄 Re-implementation — GATE_5 rejected code (${g5Count}× total)</div>
      <div style="font-size:12px">Team 90 found code issues. Fix code → commit → ./pipeline_run.sh pass → GATE_4 → GATE_5.</div>
    </div>`;
  }

  // ── Sub-step analysis (gates with substeps defined) ─────────────────────
  const substeps = def.substeps;
  if (substeps) {
    html += `<div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:8px">Sub-step Analysis</div>`;
    let prevDone = true;
    let allDone  = true;
    let firstPendingMsg = '';

    for (const step of substeps) {
      const blocked    = step.requiresPrev && !prevDone;
      const fileChecks = await Promise.all(step.files.map(async f => ({path:f, exists:await fileExists(f)})));
      const stepDone   = !blocked && fileChecks.every(f => f.exists);
      const borderColor = stepDone ? 'var(--success)' : blocked ? 'var(--border)' : 'var(--warning)';
      const icon        = stepDone ? '✅' : blocked ? '⏸️' : '⏳';

      html += `<div class="prog-substep" style="border-left:3px solid ${borderColor}">
        <div style="color:${borderColor};font-weight:500;margin-bottom:4px">${icon} ${escHtml(step.label)}</div>`;
      fileChecks.forEach(f => {
        html += `<div class="prog-file-item" style="color:${f.exists?'var(--success)':'var(--danger)'}">
          ${f.exists?'🟢':'🔴'} ${escHtml(f.path)}</div>`;
      });
      if (blocked) {
        html += `<div class="prog-msg" style="color:var(--text-muted)">⏸️ Blocked — complete previous step first</div>`;
      } else if (stepDone) {
        html += `<div class="prog-msg" style="color:var(--success)">${escHtml(step.doneMsg)}</div>`;
      } else {
        html += `<div class="prog-msg" style="color:var(--warning)">${escHtml(step.pendingMsg)}</div>`;
        if (!firstPendingMsg) firstPendingMsg = step.pendingMsg;
        allDone = false;
      }
      html += `</div>`;
      prevDone = stepDone;
      if (!stepDone) allDone = false;
    }

    // For gates with BOTH substeps AND twoPaths (e.g. GATE_4), show the PASS/FAIL section too
    if (def.twoPaths) {
      const passCmd = def.passCmd || './pipeline_run.sh pass';
      const failCmd = def.failCmd || './pipeline_run.sh fail "reason"';
      html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
        <div style="background:rgba(63,185,80,0.08);border:1px solid var(--success);border-radius:6px;padding:8px">
          <div style="color:var(--success);font-weight:600;font-size:12px;margin-bottom:4px">${escHtml(def.passLabel||'✅ PASS')}</div>
          <div style="font-family:var(--mono);font-size:10px;background:#010409;padding:4px 6px;border-radius:4px;margin-bottom:6px">${escHtml(passCmd)}</div>
          <button class="btn" style="font-size:10px" onclick="copyCmd(${escAttr(JSON.stringify(passCmd))}, this)">📋 Copy</button>
        </div>
        <div style="background:rgba(248,81,73,0.08);border:1px solid var(--danger);border-radius:6px;padding:8px">
          <div style="color:var(--danger);font-weight:600;font-size:12px;margin-bottom:4px">${escHtml(def.failLabel||'❌ FAIL')}</div>
          <div style="font-family:var(--mono);font-size:10px;background:#010409;padding:4px 6px;border-radius:4px;margin-bottom:6px">${escHtml(failCmd)}</div>
          <button class="btn" style="font-size:10px" onclick="copyCmd(${escAttr(JSON.stringify(failCmd))}, this)">📋 Copy</button>
        </div>
      </div>`;
    } else if (allDone) {
      html += `<div class="prog-done-banner">
        <span style="color:var(--success);font-weight:600">✅ All steps complete — gate ready to advance</span>
        <button class="btn" onclick="copyCmd('./pipeline_run.sh pass', this)">📋 Copy</button>
      </div>
      <div style="margin-top:6px;font-family:var(--mono);font-size:12px;color:var(--text-muted)">./pipeline_run.sh pass</div>`;
    } else if (firstPendingMsg) {
      html += `<div class="prog-next-banner"><strong>⏭️ Next action:</strong> ${escHtml(firstPendingMsg)}</div>`;
    }

  } else {
    // ── Standard gate guidance (no substeps) ─────────────────────────────
    html += `<div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:8px">Gate Guidance</div>`;

    if (def.twoPaths) {
      // Decision gate — full PASS/FAIL display
      if (def.advice) {
        html += `<div style="font-size:12px;margin-bottom:10px;color:var(--text-muted)">${escHtml(def.advice)}</div>`;
      }
      const passCmd = def.passCmd || './pipeline_run.sh pass';
      const failCmd = def.failCmd || './pipeline_run.sh fail "reason"';
      const passLabel = def.passLabel || '✅ PASS';
      const failLabel = def.failLabel || '❌ FAIL';
      const needsBuilder = !!getEffectiveVerdictTeam(gate);

      html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div style="background:rgba(63,185,80,0.08);border:1px solid var(--success);border-radius:6px;padding:8px">
          <div style="color:var(--success);font-weight:600;font-size:12px;margin-bottom:6px">${escHtml(passLabel)}</div>
          <div style="font-family:var(--mono);font-size:11px;background:#010409;padding:5px 8px;border-radius:4px;margin-bottom:6px">${escHtml(passCmd)}</div>
          <button class="btn" style="font-size:10px" onclick="copyCmd(${escAttr(JSON.stringify(passCmd))}, this)">📋 Copy</button>
        </div>
        <div style="background:rgba(248,81,73,0.08);border:1px solid var(--danger);border-radius:6px;padding:8px">
          <div style="color:var(--danger);font-weight:600;font-size:12px;margin-bottom:6px">${escHtml(failLabel)}</div>
          <div style="font-family:var(--mono);font-size:11px;background:#010409;padding:5px 8px;border-radius:4px;margin-bottom:6px">${escHtml(failCmd)}</div>
          <button class="btn" style="font-size:10px" onclick="copyCmd(${escAttr(JSON.stringify(failCmd))}, this)">📋 Copy</button>
        </div>
      </div>`;

      // Findings builder for AI-verdict gates (in progress-check modal)
      if (needsBuilder) {
        html += `<div class="findings-builder" style="margin-top:0">
          <div class="findings-builder-title">✏️ FAIL Command Builder <span id="pc-status-${gate}" class="findings-status"></span></div>
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:5px">Paste blocking findings or auto-detect from verdict file:</div>
          <textarea id="pc-ta-${gate}" class="findings-textarea"
            placeholder="${escAttr(failCmd)}"
            oninput="pcUpdateCmd('${escAttr(gate)}')"></textarea>
          <div class="findings-cmd-row">
            <div class="findings-cmd-text" id="pc-preview-${gate}">${escHtml(failCmd)}</div>
            <button class="findings-copy-btn" onclick="copyText(document.getElementById('pc-preview-${gate}').textContent, this)">⎘ Copy</button>
          </div>
        </div>`;
      }

      if (def.reviseCmd) {
        html += `<div style="background:rgba(210,153,34,0.08);border:1px solid var(--warning);border-radius:6px;padding:8px;margin-top:8px">
          <div style="color:var(--warning);font-weight:600;font-size:12px;margin-bottom:4px">↩️ After FAIL — generate revision prompt</div>
          <div style="font-family:var(--mono);font-size:11px;background:#010409;padding:5px 8px;border-radius:4px;margin-bottom:6px">${escHtml(def.reviseCmd)}</div>
          <button class="btn" style="font-size:10px" onclick="copyCmd(${escAttr(JSON.stringify(def.reviseCmd))}, this)">📋 Copy</button>
        </div>`;
      } else if (def.failAdvice) {
        html += `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">${escHtml(def.failAdvice)}</div>`;
      }

    } else {
      // Standard linear gate (no PASS/FAIL choice)
      if (def.advice) {
        html += `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px 14px;margin-bottom:8px">
          <div style="font-size:11px;font-weight:600;margin-bottom:4px">ℹ️ Next action:</div>
          <div style="font-size:12px">${escHtml(def.advice)}</div>
        </div>`;
      }
      if (def.failAdvice) {
        html += `<div style="background:rgba(248,81,73,0.05);border:1px solid var(--border);border-radius:6px;padding:8px 12px;margin-bottom:8px">
          <div style="font-size:11px;font-weight:600;color:var(--warning);margin-bottom:3px">⚠️ If FAIL:</div>
          <div style="font-size:11px">${escHtml(def.failAdvice)}</div>
        </div>`;
      }
    }

    // Gate-specific expected files
    if (def.files && def.files.length > 0) {
      const fileChecks = await Promise.all(def.files.map(async f => ({path:f, exists:await fileExists(f)})));
      html += `<div style="margin-top:8px">`;
      fileChecks.forEach(f => {
        html += `<div class="prog-file-item" style="color:${f.exists?'var(--success)':'var(--danger)'}">
          ${f.exists?'🟢':'🔴'} ${escHtml(f.path)}</div>`;
      });
      html += `</div>`;
    }

    // Human gate: highlight approve command
    const isHumanGate = cfg.engine && cfg.engine.includes('human');
    if (isHumanGate && !def.twoPaths) {
      html += `<div class="tip-box" style="margin-top:10px;display:flex;align-items:center;justify-content:space-between">
        <span><strong>⏸ Human gate</strong> — after review:</span>
        <div style="display:flex;align-items:center;gap:8px">
          <code>./pipeline_run.sh approve</code>
          <button class="btn" onclick="copyCmd('./pipeline_run.sh approve', this)">📋 Copy</button>
        </div>
      </div>`;
    }
  }

  // ── Completed gate chain ─────────────────────────────────────────────────
  if (completed.length > 0) {
    html += `<div style="margin-top:14px;padding-top:10px;border-top:1px solid var(--border);font-size:11px;color:var(--text-muted)">
      ✓ Completed: ${completed.map(g=>`<span style="color:var(--success);font-family:var(--mono)">${escHtml(g)}</span>`).join(' → ')}
    </div>`;
    if (failed.length) {
      html += `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">
        ✗ Failed (all): ${failed.map(g=>`<span style="color:var(--danger);font-family:var(--mono)">${escHtml(g)}</span>`).join(', ')}
      </div>`;
    }
  }

  content.innerHTML = html;

  // ── Post-render: init async auto-loaders for PC findings builders ─────────
  if (def.twoPaths && getEffectiveVerdictTeam(gate)) {
    const _saved = _qbarGate;
    _qbarGate = gate;
    const failCmd = def.failCmd || './pipeline_run.sh fail "reason"';

    // Fail-cycle builder (shown when gate is stuck in a fail loop)
    if (failed.includes(gate)) {
      await autoLoadVerdictFile(gate, `pc-fc-status-${gate}`, `pc-fc-ta-${gate}`, `pc-fc-preview-${gate}`, false);
      const fcTa = document.getElementById(`pc-fc-ta-${gate}`);
      if (fcTa) fcTa.oninput = () => {
        const raw = fcTa.value.trim();
        const pre = document.getElementById(`pc-fc-preview-${gate}`);
        if (pre) pre.textContent = raw ? `./pipeline_run.sh fail "${raw.replace(/"/g,"'")}"` : failCmd;
      };
    }

    // Standard guidance builder (always shown for AI-verdict gates)
    await autoLoadVerdictFile(gate, `pc-status-${gate}`, `pc-ta-${gate}`, `pc-preview-${gate}`, false);
    const ta = document.getElementById(`pc-ta-${gate}`);
    if (ta) ta.oninput = () => {
      const raw = ta.value.trim();
      const pre = document.getElementById(`pc-preview-${gate}`);
      if (pre) pre.textContent = raw ? `./pipeline_run.sh fail "${raw.replace(/"/g,"'")}"` : failCmd;
    };

    _qbarGate = _saved;
  }
}

// ── Fail-cycle findings builder update (pc-fc-* elements) ────────────────
function pcUpdateFcCmd(gate) {
  const ta  = document.getElementById(`pc-fc-ta-${gate}`);
  const pre = document.getElementById(`pc-fc-preview-${gate}`);
  if (!ta || !pre) return;
  const raw = ta.value.trim();
  const def = ALL_GATE_DEFS[gate] || {};
  const failCmd = def.failCmd || './pipeline_run.sh fail "reason"';
  pre.textContent = raw ? `./pipeline_run.sh fail "${raw.replace(/"/g,"'")}"` : failCmd;
}

// ── Unified pcUpdateCmd for modal findings builders ───────────────────────
function pcUpdateCmd(gate) {
  const ta  = document.getElementById(`pc-ta-${gate}`);
  const pre = document.getElementById(`pc-preview-${gate}`);
  if (!ta || !pre) return;
  const raw = ta.value.trim();
  const def = ALL_GATE_DEFS[gate] || {};
  const failCmd = def.failCmd || './pipeline_run.sh fail "reason"';
  pre.textContent = raw ? `./pipeline_run.sh fail "${raw.replace(/"/g,"'")}"` : failCmd;
}

function closeProgress() {
  document.getElementById("progress-modal").classList.remove("open");
}

// ── Check expected files ──────────────────────────────────────────────────
async function checkExpectedFiles() {
  const list = document.getElementById("file-list");
  list.innerHTML = '<span class="loading">Checking…</span>';

  const results = await Promise.all(EXPECTED_FILES.map(async f => {
    const exists = await fileExists(f.path);
    return {...f, exists};
  }));

  const found = results.filter(r => r.exists).length;
  document.getElementById("files-badge").textContent = `${found}/${results.length} found`;

  list.innerHTML = results.map(r =>
    `<div class="file-row">
      <span class="file-icon">${r.exists ? "🟢" : "🔴"}</span>
      <span class="file-path">${r.path}</span>
      <span style="font-size:11px;color:${r.exists?"var(--success)":"var(--danger)"}">${r.label}</span>
    </div>`
  ).join("");
}

// ── Helpers ───────────────────────────────────────────────────────────────
// escHtml, escAttr in pipeline-dom.js

// ── Governance drift log (Path B/C events for system learning) ────────────
function logVerdictDrift(gate, event, detail) {
  try {
    const key = 'pipeline_verdict_drift';
    const log = JSON.parse(localStorage.getItem(key) || '[]');
    log.push({ ts: new Date().toISOString(), gate, event, detail });
    localStorage.setItem(key, JSON.stringify(log.slice(-100)));
  } catch(e) { /* storage not available */ }
}

// ── Extract findings from verdict file text ────────────────────────────────
function extractFindings(text) {
  if (!text) return '';
  const findings = [];
  const pattern = /^(?:\d+\.\s+)?(BF-G[\w\d._-]+|BLOCK(?:ER)?-[\w\d._-]+|FINDING-[\w\d._-]+|QA-FAIL-[\w\d._-]+|DOC-[\w\d._-]+|GAP-G\d-\w+|CONCERN-[\w\d._-]+|ISSUE-[\w\d._-]+)\s*[—:–\-]+\s*(.+)/im;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(pattern);
    if (!m) continue;
    let desc = m[2].trim();
    // Truncate at file paths or Hebrew source labels
    const cutPoints = [desc.indexOf('/Users'), desc.indexOf('מקור'), desc.search(/\/[A-Za-z_]/)];
    const cut = cutPoints.filter(i => i > 5).sort((a,b)=>a-b)[0];
    if (cut !== undefined) desc = desc.substring(0, cut).trim();
    desc = desc.replace(/[.,;:\s—–]+$/, '').trim();
    if (desc.length > 120) desc = desc.substring(0, 120).trim() + '…';
    if (desc) findings.push(`${m[1]}: ${desc}`);
  }
  return findings.join('; ');
}

// ── Quick Action Bar state ─────────────────────────────────────────────────
let _qbarGate = null;
let _qbarCopyMap = {};

// ── Auto-detect verdict file for a gate ───────────────────────────────────
async function autoLoadVerdictFile(gate, statusId, taId, previewId, isRevise) {
  if (!pipelineState) return;
  const wp = pipelineState.work_package_id || '';
  const candidates = getVerdictCandidates(gate, wp);
  if (!candidates.length) return;

  const statusEl = document.getElementById(statusId);
  if (!statusEl) return;
  statusEl.innerHTML = `<span class="findings-status" style="color:var(--text-muted)">🔍 Searching…</span>`;

  let foundText = null, foundPath = '';
  for (const path of candidates) {
    if (_qbarGate !== gate) return; // stale guard
    const t = await fetchText(path);
    if (t) { foundText = t; foundPath = path; break; }
  }

  if (!foundText) {
    statusEl.innerHTML = `<span class="findings-status" style="color:var(--danger)">🔴 File not found — paste findings manually below</span>`;
    logVerdictDrift(gate, 'PATH_C_NOT_FOUND', { candidates });
    return;
  }

  const canonical = candidates[0];
  const isCanonical = (foundPath === canonical);

  if (isCanonical) {
    statusEl.innerHTML = `<span class="findings-status" style="color:var(--success)">🟢 Auto-loaded: ${escHtml(foundPath)}</span>`;
  } else {
    statusEl.innerHTML = `<span class="findings-status" style="color:var(--success)">🟢 Loaded: ${escHtml(foundPath)}</span>
      <span class="findings-status" style="color:var(--warning)"> ⚠️ Path drift — expected: ${escHtml(canonical)}</span>`;
    logVerdictDrift(gate, 'PATH_B_NON_CANONICAL', { found: foundPath, expected: canonical });
  }

  const findings = extractFindings(foundText);
  const ta = document.getElementById(taId);
  if (ta && findings) {
    ta.value = findings;
    ta.style.borderColor = 'var(--success)';
    updateFindingsCmd(gate, taId, previewId, isRevise);
  }
}

// ── Update the findings command preview ───────────────────────────────────
function updateFindingsCmd(gate, taId, previewId, isRevise) {
  const ta = document.getElementById(taId);
  const preview = document.getElementById(previewId);
  if (!ta || !preview) return;

  const raw = ta.value.trim();
  const def = ALL_GATE_DEFS[gate] || {};

  let cmd;
  if (!raw) {
    cmd = isRevise
      ? `./pipeline_run.sh revise "BLOCKER-1: [paste findings]"`
      : (def.failCmd || `./pipeline_run.sh fail "reason"`);
  } else {
    const safe = raw.replace(/"/g, "'");
    cmd = isRevise
      ? `./pipeline_run.sh revise "${safe}"`
      : `./pipeline_run.sh fail "${safe}"`;
  }

  preview.textContent = cmd;
  _qbarCopyMap[previewId] = cmd;
}

// ── Copy findings command ─────────────────────────────────────────────────
function copyFindingsCmd(previewId, btn) {
  const cmd = _qbarCopyMap[previewId] || document.getElementById(previewId)?.textContent || '';
  copyText(cmd, btn);
}

// ── Build Quick Action Bar (decision gates only) ───────────────────────────
async function buildQuickActionBar(gate) {
  _qbarGate = gate;
  const bar = document.getElementById('quick-action-bar');
  if (!bar) return;

  const def = ALL_GATE_DEFS[gate] || {};
  if (!def.twoPaths) { bar.innerHTML = ''; return; }

  const passCmd      = def.passCmd || './pipeline_run.sh pass';
  const isHuman      = (def.engine === 'human');
  const isRevise     = (gate === 'G3_5');
  const needsBuilder = !!getEffectiveVerdictTeam(gate) || isRevise;
  const passLabel    = def.passLabel || '✅ PASS';
  const failLabel    = def.failLabel || '❌ FAIL';

  // Check if gate has already failed (pipeline is stuck here)
  const failed      = pipelineState ? (pipelineState.gates_failed || []) : [];
  const failCount   = failed.filter(g => g === gate).length;
  const gateStuck   = failCount > 0 && def.failRoutes;

  let html = '';

  // ── Mode A: gate has failed before — show routing selector ───────────────
  if (gateStuck) {
    const routes = def.failRoutes;
    const docCmd  = routes.doc.cmd;
    const fullCmd = routes.full.cmd;

    html += `<div class="route-selector">
      <div class="route-selector-title">
        ⚠️ ${escHtml(gate)} — failed ${failCount}× — choose routing path
      </div>
      <div class="route-selector-cycle">current_gate stays at ${escHtml(gate)} until you route it forward</div>
      <div class="route-btns">
        <button class="qa-btn-route-doc" onclick="copyCmd(${escAttr(JSON.stringify(docCmd))}, this)" title="${escAttr(docCmd)}">
          ${escHtml(routes.doc.label)} <span class="terminal-hint">⎘</span>
        </button>
        <button class="qa-btn-route-full" onclick="copyCmd(${escAttr(JSON.stringify(fullCmd))}, this)" title="${escAttr(fullCmd)}">
          ${escHtml(routes.full.label)} <span class="terminal-hint">⎘</span>
        </button>
      </div>
      <div class="route-desc-row">
        <div class="route-desc">${routes.doc.desc || ''}</div>
        <div class="route-desc">${routes.full.desc || ''}</div>
      </div>
    </div>`;

    // Also show the PASS button (in case issues are already fixed)
    html += `<div class="quick-action-bar" style="margin-top:8px">
      <button class="qa-btn qa-btn-pass" onclick="copyCmd(${escAttr(JSON.stringify(passCmd))}, this)">
        ${escHtml(passLabel)} &nbsp;<span class="terminal-hint">⎘ copy → terminal</span>
      </button>
    </div>`;

  } else {
    // ── Mode B: normal (gate not yet failed) — PASS + FAIL buttons ──────────
    html += `<div class="quick-action-bar">
      <button class="qa-btn qa-btn-pass" onclick="copyCmd(${escAttr(JSON.stringify(passCmd))}, this)">
        ${escHtml(passLabel)} &nbsp;<span class="terminal-hint">⎘ copy → terminal</span>
      </button>`;

    if (needsBuilder) {
      html += `<button class="qa-btn qa-btn-fail" disabled style="opacity:0.45;cursor:default">
        ${escHtml(failLabel)} &nbsp;<span style="font-size:10px;font-weight:400">↓ use builder</span>
      </button>`;
    } else {
      const failCmdDef = def.failCmd || './pipeline_run.sh fail "reason"';
      html += `<button class="qa-btn qa-btn-fail" onclick="copyCmd(${escAttr(JSON.stringify(failCmdDef))}, this)">
        ${escHtml(failLabel)} &nbsp;<span class="terminal-hint">⎘ copy → terminal</span>
      </button>`;
    }

    html += `</div>`;
  }

  // ── Findings builder for AI-verdict gates (always shown when verdictTeam set) ──
  if (needsBuilder) {
    const defaultCmd = isRevise
      ? `./pipeline_run.sh revise "BLOCKER-1: [paste findings]"`
      : (def.failCmd || `./pipeline_run.sh fail "reason"`);

    const builderTitle = gateStuck
      ? `✏️ FAIL Command Builder (record findings before routing)`
      : `✏️ FAIL Command Builder`;

    html += `<div class="findings-builder">
      <div class="findings-builder-title">
        ${builderTitle}
        <span id="qbar-status"></span>
      </div>
      <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px">
        Paste blocking findings from verdict file (auto-detect tries first):
      </div>
      <textarea id="qbar-ta" class="findings-textarea"
        placeholder="BF-G5-001: missing validation; BF-G5-002: wrong endpoint…"
        oninput="updateFindingsCmd(${escAttr(JSON.stringify(gate))}, 'qbar-ta', 'qbar-preview', ${isRevise})"
      ></textarea>
      ${isRevise ? `<input id="qbar-filepath" class="findings-filepath" placeholder="Path to Team 10 revised work plan (for revise command)" oninput="updateFindingsCmd(${escAttr(JSON.stringify(gate))}, 'qbar-ta', 'qbar-preview', true)">` : ''}
      <div class="findings-cmd-row">
        <div class="findings-cmd-text" id="qbar-preview">${escHtml(defaultCmd)}</div>
        <button class="findings-copy-btn" onclick="copyFindingsCmd('qbar-preview', this)">⎘ Copy → terminal</button>
      </div>
    </div>`;

    setTimeout(() => autoLoadVerdictFile(gate, 'qbar-status', 'qbar-ta', 'qbar-preview', isRevise), 50);
  }

  // ── Revise hint for G3_5 ────────────────────────────────────────────────
  if (isRevise && def.reviseCmd) {
    html += `<div style="margin-top:6px;padding:8px 12px;background:rgba(210,153,34,0.08);border:1px solid var(--warning);border-radius:6px;font-size:11px">
      <span style="color:var(--warning);font-weight:600">↩️ After FAIL</span> — generate revision prompt:
      <span style="font-family:var(--mono);font-size:10px"> ./pipeline_run.sh revise "..."</span>
      <button class="btn" style="font-size:10px;margin-left:8px" onclick="copyCmd(${escAttr(JSON.stringify(def.reviseCmd))}, this)">⎘</button>
    </div>`;
  }

  bar.innerHTML = html;

  if (needsBuilder) {
    await autoLoadVerdictFile(gate, 'qbar-status', 'qbar-ta', 'qbar-preview', isRevise);
  }
}

// ── Health warnings (reads STATE_SNAPSHOT.json, shows issues with severity + copyable log) ──
async function loadHealthWarnings() {
  const panel   = document.getElementById('health-warnings-panel');
  const content = document.getElementById('health-warnings-content');
  if (!panel || !content) return;

  const warnings = [];

  try {
    const domainPath = currentDomain === 'agents_os'
      ? '../../_COMMUNICATION/agents_os/STATE_SNAPSHOT.json'
      : '../../_COMMUNICATION/agents_os/STATE_SNAPSHOT.json';
    const snapshot = await fetchJSON(domainPath);
    const gov = snapshot.governance || {};

    // AD-V2-01: active_stage missing from STATE_SNAPSHOT
    if (!gov.active_stage) {
      warnings.push({ sev:'error',
        msg:'Active stage unknown — STATE_SNAPSHOT missing active_stage field',
        log:'AD-V2-01 | state_reader.py was searching for "current_stage_id" but WSM field is "active_stage_id" | Fix: re-run python3 -m agents_os_v2.observers.state_reader' });
    }

    // Check for active_program field (added by new parser)
    if (!gov.active_program && gov.active_stage) {
      warnings.push({ sev:'warning',
        msg:'Active program unknown — active_program_id field not found in WSM',
        log:'state_reader.py | WSM may not have active_program_id field set | Check: documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md' });
    }

    // AD-V2-05: pipeline state stage vs WSM active stage mismatch
    if (pipelineState && gov.active_stage) {
      const pipeStage = pipelineState.stage_id || '';
      const wsmStage  = gov.active_stage;
      if (pipeStage && pipeStage !== wsmStage) {
        warnings.push({ sev:'warning',
          msg:`Stage mismatch: pipeline_state says "${pipeStage}" but WSM active_stage_id is "${wsmStage}"`,
          log:`AD-V2-05 | pipeline_state.stage_id=${pipeStage} vs WSM active_stage_id=${wsmStage} | Update pipeline_state.json or sync WSM` });
      }
    }
  } catch(e) {
    warnings.push({ sev:'warning',
      msg:'STATE_SNAPSHOT.json not found — system health unknown',
      log:`Run: python3 -m agents_os_v2.observers.state_reader  |  Error: ${String(e)}` });
  }

  if (warnings.length === 0) {
    panel.style.display = 'none';
    return;
  }

  panel.style.display = '';
  const sevIcon = { error:'🔴', warning:'🟡', info:'🟢' };
  content.innerHTML = warnings.map(w => `
    <div class="health-warn-item hw-${escHtml(w.sev)}">
      <span class="hw-icon">${sevIcon[w.sev] || '⚪'}</span>
      <div class="hw-body">
        <div class="hw-msg">${escHtml(w.msg)}</div>
        <div class="hw-log-row">
          <code class="hw-log">${escHtml(w.log)}</code>
          <button class="btn hw-copy-btn" onclick="copyText(${escAttr(JSON.stringify(w.log))}, this)" title="Copy log details">⎘</button>
        </div>
      </div>
    </div>`).join('');
}

// ── Main load ─────────────────────────────────────────────────────────────
async function loadAll() {
  const state = await loadPipelineState();
  if (state) await loadPrompt(state.current_gate);
  await Promise.all([loadMandates(), checkExpectedFiles(), loadHealthWarnings()]);
}

// ── Auto-refresh ──────────────────────────────────────────────────────────
document.getElementById("auto-refresh-toggle").addEventListener("change", function() {
  const dot = document.getElementById("refresh-dot");
  if (this.checked) {
    dot.style.display = "inline-block";
    refreshTimer = setInterval(loadAll, 5000);
  } else {
    dot.style.display = "none";
    clearInterval(refreshTimer);
  }
});

// toggleLang, applyLang, toggleHelp, closeHelpOutside in pipeline-help.js
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.getElementById("help-modal").classList.remove("open");
    document.getElementById("progress-modal").classList.remove("open");
  }
  if (e.key === "?" && !e.target.matches("input,textarea")) toggleHelp();
  if (e.key === "p" && !e.target.matches("input,textarea")) runProgressCheck();
});

// ── Init ──────────────────────────────────────────────────────────────────
// Restore domain + theme from localStorage on page load
const _savedDomain = localStorage.getItem("pipeline_domain") || "tiktrack";
if (_savedDomain !== currentDomain) onDomainSwitch(_savedDomain);

loadAll();