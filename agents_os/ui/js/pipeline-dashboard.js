/* pipeline-dashboard.js — Team 61 AOUI LOD400 — Dashboard page logic */
let mandateSections = {};
let activeTeam = null;
let currentPromptText = "";
let refreshTimer = null;


// ── Accordion ─────────────────────────────────────────────────────────────
function toggleAccordion(id) {
  document.getElementById(id).classList.toggle("open");
}
/** Sync UI (buttons, badges, title, theme) to domain — must stay consistent with currentDomain */
function syncDomainUIDashboard(domain) {
  const d = domain || currentDomain;
  const isTiktrack = d === "tiktrack";
  document.documentElement.classList.toggle("theme-tiktrack", isTiktrack);
  document.title = isTiktrack ? "TikTrack — Pipeline Dashboard" : "Agents OS — Pipeline Dashboard";
  const titleEl = document.getElementById("domain-badge-header");
  if (titleEl) {
    titleEl.textContent = isTiktrack ? "tiktrack" : "agents_os";
    titleEl.className = "domain-badge domain-" + (isTiktrack ? "tiktrack" : "agentsos");
  }
  const btnT = document.getElementById("domain-btn-tiktrack");
  const btnA = document.getElementById("domain-btn-agentsos");
  if (btnT) btnT.className = "domain-btn" + (isTiktrack ? " active-tiktrack" : "");
  if (btnA) btnA.className = "domain-btn" + (!isTiktrack ? " active-agentsos" : "");
  const badge = document.getElementById("domain-badge-pill");
  if (badge) {
    badge.textContent = isTiktrack ? "tiktrack" : "agents_os";
    badge.className = "domain-label-badge " + (isTiktrack ? "domain-label-tiktrack" : "domain-label-agentsos");
  }
}

function onDomainSwitch(domain) {
  switchDomain(domain);
  syncDomainUIDashboard(domain);
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

    const isComplete = (state.current_gate === 'COMPLETE' || state.current_gate === 'NONE' || !state.current_gate);
    const currentCfg = GATE_CONFIG[state.current_gate] || {};
    const st = isComplete ? 'pass' : gateStatus(state.current_gate, state);
    document.getElementById("s-gate-pill").innerHTML = isComplete
      ? `<span class="status-pill status-pass">✅ WP CLOSED</span>`
      : `<span class="status-pill ${statusPillClass(st)}">${state.current_gate}</span>`;
    // Domain-aware owner (GATE_2/6 differ by domain)
    document.getElementById("s-owner").textContent  = isComplete ? '—' : getDomainOwner(state.current_gate);
    document.getElementById("s-engine").textContent = isComplete ? '—' : (currentCfg.engine || "—");

    // Current Step Banner — rebuild only when loadPipelineState is called,
    // which only happens on genuine state changes (see loadAll change-detection).
    // Safety net: if a panel is open during a genuine state transition, preserve it.
    const stepBannerEl = document.getElementById('current-step-banner');
    if (stepBannerEl) {
      const _pasteOpen  = document.getElementById('csb-fd-paste-row')?.style.display !== 'none';
      const _pasteText  = document.getElementById('csb-fd-paste-input')?.value || '';
      const _manualOpen = document.getElementById('csb-fd-manual-row')?.style.display === 'flex';
      const _manualVal  = document.getElementById('csb-fd-path-input')?.value || '';
      stepBannerEl.innerHTML = buildCurrentStepBanner(state.current_gate, state);
      if (_pasteOpen)  { const e = document.getElementById('csb-fd-paste-row');  if (e) e.style.display = 'block'; }
      if (_pasteText)  { const e = document.getElementById('csb-fd-paste-input'); if (e) e.value = _pasteText; }
      if (_manualOpen) { const e = document.getElementById('csb-fd-manual-row');  if (e) e.style.display = 'flex'; }
      if (_manualVal)  { const e = document.getElementById('csb-fd-path-input');  if (e) e.value = _manualVal; }
    }

    // Layer A: Feedback Detection auto-scan — fires immediately after banner renders.
    // Independent of quick-action-bar; covers page load, domain switch, auto-refresh.
    if (!isComplete) initFeedbackDetection(state.current_gate);

    // S002-P005-WP002: PWA banner in sidebar when gate_state=PASS_WITH_ACTION
    const pwaContainer = document.getElementById('pwa-banner-sidebar');
    if (pwaContainer) {
      if (state.gate_state === 'PASS_WITH_ACTION') {
        const actions = state.pending_actions || [];
        const domainFlag = (state.project_domain || currentDomain) === 'agents_os' ? '--domain agents_os ' : '';
        const clearCmd = domainFlag + './pipeline_run.sh actions_clear';
        pwaContainer.dataset.domainFlag = domainFlag;
        pwaContainer.innerHTML = `<div class="pwa-banner">
          <div class="pwa-banner-title">⚡ PASS_WITH_ACTION</div>
          <div class="pwa-action-list">${actions.length ? actions.map(a => `<div class="pwa-action-item">${escHtml(a)}</div>`).join('') : '<div class="pwa-action-item" style="color:var(--text-muted)">No actions recorded</div>'}</div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
            <button class="btn pwa-btn-clear" onclick="copyCmd(${escAttr(JSON.stringify(clearCmd))}, this)">✅ Actions Resolved</button>
            <button class="btn pwa-btn-override" onclick="copyOverrideWithReason(document.getElementById('pwa-banner-sidebar')?.dataset?.domainFlag||'', this)">⚡ Override &amp; Advance</button>
          </div>
        </div>`;
        pwaContainer.style.display = 'block';
      } else {
        pwaContainer.innerHTML = '';
        pwaContainer.style.display = 'none';
      }
    }

    // Spec card
    document.getElementById("spec-text").textContent = state.spec_brief || "No spec loaded";
    document.getElementById("spec-wp").textContent   = "WP: " + (state.work_package_id || "—");

    // Gate timeline — when COMPLETE show all gates as done
    const gateList = document.getElementById("gate-list");
    gateList.innerHTML = GATE_SEQUENCE.map(g => {
      const s = isComplete ? 'pass' : gateStatus(g, state);
      const isCurr = !isComplete && g === state.current_gate;
      const statusIcon = s==="pass"?"✓":s==="fail"?"✗":s==="current"?"←":s==="skipped"?"↷":"";
      return `<li class="gate-item${isCurr?" is-current":""}${s==="skipped"?" is-skipped":""}">
        <span class="gate-dot ${statusDotClass(s)}"></span>
        <span class="gate-name">${g}</span>
        <span class="gate-status-text">${statusIcon}</span>
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
    buildCommands(isComplete ? null : state.current_gate);
    buildQuickActionBar(isComplete ? null : state.current_gate);

    return state;
  } catch(e) {
    document.getElementById("s-wp").textContent = "Error loading state";
    document.getElementById("s-wp").className = "error-msg";
    console.error("State load error:", e);
    // Still show Quick Commands and basic gate list when state fails
    buildCommands("GATE_0");
    const gateList = document.getElementById("gate-list");
    if (gateList) gateList.innerHTML = GATE_SEQUENCE.map(g =>
      `<li class="gate-item"><span class="gate-dot dot-pending"></span><span class="gate-name">${g}</span></li>`
    ).join("");
    return null;
  }
}

// buildCommands in pipeline-commands.js

// ── Domain-aware prompt path resolver ─────────────────────────────────────
// Transforms paths inside the prompts/ directory to include domain slug prefix
// so tiktrack and agents_os files never collide.
// e.g. "...prompts/implementation_mandates.md" → "...prompts/agentsos_implementation_mandates.md"
function resolvePromptPath(path) {
  const domainSlug = (pipelineState.project_domain || 'agents_os').toLowerCase().replace(/_/g, '').replace(/-/g, '');
  const marker = '/_COMMUNICATION/agents_os/prompts/';
  const idx = path.indexOf(marker);
  if (idx === -1) return path;
  const filename = path.slice(idx + marker.length);
  if (/^(agentsos|tiktrack)_/.test(filename)) return path; // already prefixed
  return path.slice(0, idx + marker.length) + domainSlug + '_' + filename;
}

// ── Load prompt ───────────────────────────────────────────────────────────
// Gate Context accordion: executive summary only. Full prompt is stored in
// currentPromptText for the Mandate fallback (non-mandate single-team gates).
async function loadPrompt(gate) {
  if (!gate) return;
  const domainSlug = (pipelineState.project_domain || 'agents_os').toLowerCase().replace(/_/g, '').replace(/-/g, '');
  const path = `../../_COMMUNICATION/agents_os/prompts/${domainSlug}_${gate}_prompt.md`;
  const def  = ALL_GATE_DEFS[gate] || {};
  const cfg  = GATE_CONFIG[gate]   || {};

  // Update accordion badge + meta
  document.getElementById("prompt-gate-badge").textContent = gate;
  document.getElementById("prompt-gate-name").textContent  = gate;
  document.getElementById("prompt-owner").textContent      = getDomainOwner(gate);
  document.getElementById("prompt-engine").textContent     = cfg.engine || "—";
  document.getElementById("prompt-file-path").textContent  = path;

  // Executive summary: desc + advice from gate definition
  const descEl   = document.getElementById("gate-summary-desc");
  const adviceEl = document.getElementById("gate-summary-advice");
  if (descEl)   descEl.textContent   = def.desc   || "—";
  if (adviceEl) adviceEl.textContent = def.advice  || "";

  // Still fetch & store the prompt text — used by loadMandates as fallback for single-team gates
  const text = await fetchText(path);
  currentPromptText = text || "";
}

// ── Mandate file routing — uses GATE_MANDATE_FILES from pipeline-config.js ──

// ── Load mandates (always shown — mandate gates use team tabs; others show prompt) ──
async function loadMandates() {
  const gate        = pipelineState?.current_gate || '';
  const mandateFile = getGateMandatePath(gate, currentDomain);  // domain-scoped path (Iron Rule)
  const def         = ALL_GATE_DEFS[gate] || {};

  // Mandate accordion is always visible (never hidden)
  const accMandates = document.getElementById('acc-mandates');
  if (accMandates) accMandates.style.display = '';

  if (mandateFile) {
    // ── Gate has a mandate file: load + parse team sections ─────────────
    let text = await fetchText(mandateFile);
    if (!text) {
      document.getElementById("mandates-badge").textContent = "not generated";
      document.getElementById("mandate-content").innerHTML =
        '<span class="error-msg">Not yet generated — run: ./pipeline_run.sh (to generate mandate file)</span>';
      _updateBoosterHint();
      return;
    }
    _parseMandateSections(text);

  } else {
    // ── Single-team gate: show the main gate prompt as the one mandate tab ─
    const ownerRaw   = getDomainOwner(gate) || (def.verdictTeam || def.owner || 'team');
    const ownerLabel = ownerRaw.replace(/^team_/, 'Team ').replace(/\b(\d)/g, ' $1').trim()
                       .replace(/\bteam\b/i, 'Team');
    const tabLabel   = ownerLabel.match(/^Team /) ? ownerLabel : 'Team ' + ownerLabel;

    const promptText = currentPromptText || '';
    if (!promptText) {
      document.getElementById("mandates-badge").textContent = "1 team";
      document.getElementById("mandate-content").innerHTML =
        '<span class="error-msg">Prompt not yet generated — run: ./pipeline_run.sh</span>';
      mandateSections = {};
      activeTeam      = tabLabel;
      mandateMeta     = { [tabLabel]: { phase: 1 } };
    } else {
      mandateSections = { [tabLabel]: promptText };
      mandateMeta     = { [tabLabel]: { phase: 1 } };
      activeTeam      = tabLabel;

      document.getElementById("mandates-badge").textContent = "1 team";

      // Build single tab
      const tabs = document.getElementById("team-tabs");
      if (tabs) {
        tabs.innerHTML = `<span class="team-tab next-phase active" onclick="selectTeam(this, ${escAttr(JSON.stringify(tabLabel))})">`
          + `${escHtml(tabLabel)}<span class="phase-badge">P1</span></span>`;
      }
      showMandate(tabLabel);
    }
    _updateBoosterHint();
  }
}

// Update booster team hint to match the currently active mandate tab
function _updateBoosterHint() {
  const team   = _getBoosterTeam();
  const hint   = team ? `(${team.label} — ${team.name})` : "";
  const hintEl = document.getElementById("booster-team-hint");
  if (hintEl) hintEl.textContent = hint;
  if (document.getElementById("booster-toggle")?.checked) updateBoosterPreview();
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

  // Determine which phase number is currently active
  // For two-phase gates: Phase 2 is active when lld400_content (or phase8_content) is stored
  const curGate      = pipelineState?.current_gate || '';
  const lld400Ready  = !!(pipelineState?.lld400_content || '').trim();
  const phase8Ready  = !!(pipelineState?.phase8_content || '').trim();
  const activePhase  = (isTwoPhaseGate(curGate) && (lld400Ready || phase8Ready)) ? 2 : 1;

  tabs.innerHTML = keys.map((k, i) => {
    const meta = mandateMeta[k] || { phase: i + 1, hasCorrection: false, hasPrereq: false };
    const isActive = meta.phase === activePhase;

    // Tab highlight: active phase tab gets next-phase (or correction-needed) styling
    let tabClass = "team-tab";
    if (isActive) {
      tabClass += meta.hasCorrection ? " correction-needed" : " next-phase";
    }

    // Phase badge
    const phaseBadge = `<span class="phase-badge">P${meta.phase}</span>`;

    // Correction badge: active phase when correction data is injected
    const corrBadge = (isActive && meta.hasCorrection)
      ? `<span class="correction-badge">⚠ CORRECTION</span>` : "";

    // "▶ ACTIVE" indicator for Phase 2+ so it's visually obvious
    const activeBadge = (isActive && meta.phase > 1)
      ? `<span class="phase-active-badge">▶ SEND NOW</span>` : "";

    return `<span class="${tabClass}" onclick="selectTeam(this, ${escAttr(JSON.stringify(k))})">`
         + `${escHtml(k)}${phaseBadge}${corrBadge}${activeBadge}</span>`;
  }).join("");

  // Auto-select the currently active phase tab
  const activePhaseKey = keys.find(k => (mandateMeta[k]?.phase || 1) === activePhase) || keys[0];
  if (activePhaseKey) {
    activeTeam = activePhaseKey;
    showMandate(activePhaseKey);
    // Mark selected tab in DOM (setTimeout so the innerHTML settles first)
    setTimeout(() => {
      const allTabs = document.querySelectorAll('.team-tab');
      allTabs.forEach(t => t.classList.remove('active'));
      const idx = keys.indexOf(activePhaseKey);
      if (idx >= 0 && allTabs[idx]) allTabs[idx].classList.add('active');
    }, 0);
  }
  // Update booster hint to reflect the active mandate tab's team
  _updateBoosterHint();
}

function selectTeam(el, key) {
  activeTeam = key;
  document.querySelectorAll(".team-tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  showMandate(key);
  // Update booster hint to reflect the newly selected tab's team
  _updateBoosterHint();
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
  let content = mandateSections[activeTeam] || "";
  const btn   = document.getElementById("copy-mandate-btn");
  const meta  = mandateMeta[activeTeam] || {};

  // Append governance booster if toggle is active
  const boosterOn = document.getElementById("booster-toggle")?.checked;
  if (boosterOn && typeof _getBoosterTeam === "function" && typeof buildBoosterText === "function" && typeof boosterType !== "undefined") {
    const team    = _getBoosterTeam();
    const booster = buildBoosterText(team, boosterType);
    if (booster) content = content + "\n\n---\n\n" + booster;
  }

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
    failAdvice:'./pipeline_run.sh revise "BLOCKER-1: ..." → (records G3_5 FAIL + generates revision prompt) → paste ▼▼▼ into Cursor → Team 10 fixes → ./pipeline_run.sh pass',
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
    // Iron Rule (locked 2026-03-15): Team 70 is SHARED — handles GATE_8 in ALL domains.
    owner:'team_70 → team_90', engine:'codex',
    desc:'Team 70 (shared — all domains) writes AS_MADE_REPORT + archives WP files → Team 90 validates → WP CLOSED',
    advice:'./pipeline_run.sh  →  scroll to Team Mandates → Phase 1 tab (Team 70)  →  run phase2  →  Phase 2 tab (Team 90)  →  ./pipeline_run.sh pass',
    failAdvice:'./pipeline_run.sh fail "CLOSURE-NNN: [issue]"  →  Team 70 corrects  →  re-run GATE_8',
    twoPaths:true,
    passCmd:'./pipeline_run.sh pass',
    failCmd:'./pipeline_run.sh fail "CLOSURE-001: [issue]"',
    passLabel:'✅ Closure Validated — WP CLOSED',
    failLabel:'❌ Closure Incomplete — Team 70 correct',
    verdictTeam:'team_90', verdictGate:'GATE_8',
    failRoutes:{
      doc:{ cmd:'./pipeline_run.sh route doc GATE_8', label:'📝 Correction → GATE_8', desc:'<strong>Closure issues</strong> — Team 70 corrects docs or archive → Team 90 re-validates' },
      full:{ cmd:'./pipeline_run.sh route full GATE_8', label:'🔄 Full Redo → GATE_8', desc:'<strong>Closure rejected</strong> — Team 70 full redo of AS_MADE_REPORT + archive' },
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
      // REVALIDATION first — correction-cycle superseding verdict takes priority over original
      `${t190}TEAM_190_${wpu}_GATE_0_REVALIDATION_v1.0.0.md`,
      `${t190}TEAM_190_${wpu}_GATE_0_VERDICT_v1.0.0.md`,
      `${t190}TEAM_190_${wpu}_GATE_0_VALIDATION_v1.0.0.md`,
      `${t190}TEAM_190_${wpu}_SCOPE_VALIDATION_v1.0.0.md`,
      `${t190}TEAM_190_${wp}_GATE_0_VERDICT_v1.0.0.md`,
    ],
    'GATE_1': [
      // REVALIDATION first — correction-cycle superseding verdict takes priority over original
      `${t190}TEAM_190_${wpu}_GATE_1_REVALIDATION_v1.0.0.md`,
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
      // Team 70 (shared — all domains) AS_MADE_REPORT + docs (Iron Rule, locked 2026-03-15)
      `${t70}TEAM_70_${wpu}_AS_MADE_REPORT_v1.0.0.md`,
      `${t70}TEAM_70_${wpu}_GATE_8_DOCS_v1.0.0.md`,
      // Fallback patterns (hyphen WP-id)
      `${t90}TEAM_90_${wp}_GATE_8_VERDICT_v1.0.0.md`,
      `${t70}TEAM_70_${wp}_AS_MADE_REPORT_v1.0.0.md`,
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
    const icon  = s==='pass'?'✓':s==='fail'?'✗':s==='current'?'▶':s==='human'?'⏸':s==='skipped'?'↷':'○';
    const color = s==='pass'?'var(--success)':s==='fail'?'var(--danger)':s==='current'?'var(--accent)':s==='human'?'var(--warning)':s==='skipped'?'var(--text-muted)':'var(--border)';
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

  // ── Two-phase gate: phase tracker + next-action banner ─────────────────
  if (isTwoPhaseGate(gate)) {
    const lld400 = (state.lld400_content || '').trim();
    const inCorrection = failed.includes(gate);
    html += buildPhaseTracker(gate, lld400);
    html += buildNextActionBanner(gate, lld400, inCorrection);
  }

  // ── G3_PLAN revision mode detection ────────────────────────────────────
  if (gate === 'G3_PLAN' && failed.includes('G3_5')) {
    html += `<div style="background:rgba(210,153,34,0.1);border:1px solid var(--warning);border-radius:6px;padding:10px 14px;margin-bottom:12px">
      <div style="font-weight:600;color:var(--warning);margin-bottom:6px">⚠️ REVISION MODE — G3_5 failed the previous work plan</div>
      <div style="font-size:12px;margin-bottom:8px">Team 90 rejected the work plan. Run revision command with specific blockers:</div>
      <div style="font-family:var(--mono);font-size:11px;background:#010409;padding:8px;border-radius:4px;margin-bottom:6px">${escHtml(_dfCmd('./pipeline_run.sh revise "BLOCKER-1: ... BLOCKER-2: ..."'))}</div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">Then: paste ▼▼▼ block into Cursor → Team 10 fixes → ${escHtml(_dfCmd('./pipeline_run.sh pass'))}</div>
      <button class="btn" onclick="copyCmd(${escAttr(JSON.stringify(_dfCmd('./pipeline_run.sh revise "BLOCKER-1: ..."')))} , this)">📋 Copy revise cmd</button>
    </div>`;
  }

  // ── Gate fail cycle detection (currently AT gate, has failed before) ──────
  if (def.twoPaths && failed.includes(gate)) {
    const failCount = failed.filter(g => g === gate).length;
    const defaultFailCmd = _dfCmd(def.failCmd || `./pipeline_run.sh fail "reason"`);
    const lld400 = (state.lld400_content || '').trim();

    if (isSelfLoopGate(gate)) {
      // Self-loop gates (GATE_1): show correction cycle panel instead of confusing route selector.
      // Route selector is hidden — the correction cycle is automatic (self-routing on fail).
      html += buildCorrectionCyclePanel(gate, lld400, failCount);

      // Still show the verdict file finder so the user can record the FAIL finding correctly
      if (getEffectiveVerdictTeam(gate)) {
        html += `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px 14px;margin-bottom:12px">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:4px">Optional — record FAIL findings from verdict file:</div>
          <div style="font-size:10px;margin-bottom:4px" id="pc-fc-status-${gate}">🔍 Searching for verdict file…</div>
          <textarea id="pc-fc-ta-${gate}" class="findings-textarea" style="min-height:50px" placeholder="${escAttr(defaultFailCmd.replace('./pipeline_run.sh fail "', '').replace('"', ''))}"
            oninput="pcUpdateFcCmd('${gate}')"></textarea>
          <div class="findings-cmd-row">
            <div class="findings-cmd-text" id="pc-fc-preview-${gate}">${escHtml(defaultFailCmd)}</div>
            <button class="findings-copy-btn" onclick="copyText(document.getElementById('pc-fc-preview-${gate}').textContent, this)">⎘ Copy → terminal</button>
          </div>
        </div>`;
      }
    } else {
      // Non-self-loop gates: show the original route selector (doc/full routing)
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
        const docCmd  = routes.doc  ? _dfCmd(routes.doc.cmd)  : '';
        const fullCmd = routes.full ? _dfCmd(routes.full.cmd) : '';
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
      const fileChecks = await Promise.all(step.files.map(resolvePromptPath).map(async f => ({path:f, exists:await fileExists(f)})));
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
      const passCmd = _dfCmd(def.passCmd || './pipeline_run.sh pass');
      const failCmd = _dfCmd(def.failCmd || './pipeline_run.sh fail "reason"');
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
      const _passCmd = _dfCmd('./pipeline_run.sh pass');
      html += `<div class="prog-done-banner">
        <span style="color:var(--success);font-weight:600">✅ All steps complete — gate ready to advance</span>
        <button class="btn" onclick="copyCmd(${escAttr(JSON.stringify(_passCmd))}, this)">📋 Copy</button>
      </div>
      <div style="margin-top:6px;font-family:var(--mono);font-size:12px;color:var(--text-muted)">${escHtml(_passCmd)}</div>`;
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
      const passCmd = _dfCmd(def.passCmd || './pipeline_run.sh pass');
      const failCmd = _dfCmd(def.failCmd || './pipeline_run.sh fail "reason"');
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
        const _reviseCmd = _dfCmd(def.reviseCmd);
        html += `<div style="background:rgba(210,153,34,0.08);border:1px solid var(--warning);border-radius:6px;padding:8px;margin-top:8px">
          <div style="color:var(--warning);font-weight:600;font-size:12px;margin-bottom:4px">↩️ After FAIL — generate revision prompt</div>
          <div style="font-family:var(--mono);font-size:11px;background:#010409;padding:5px 8px;border-radius:4px;margin-bottom:6px">${escHtml(_reviseCmd)}</div>
          <button class="btn" style="font-size:10px" onclick="copyCmd(${escAttr(JSON.stringify(_reviseCmd))}, this)">📋 Copy</button>
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
      const fileChecks = await Promise.all(def.files.map(resolvePromptPath).map(async f => ({path:f, exists:await fileExists(f)})));
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
      const _approveCmd = _dfCmd('./pipeline_run.sh approve');
      html += `<div class="tip-box" style="margin-top:10px;display:flex;align-items:center;justify-content:space-between">
        <span><strong>⏸ Human gate</strong> — after review:</span>
        <div style="display:flex;align-items:center;gap:8px">
          <code>${escHtml(_approveCmd)}</code>
          <button class="btn" onclick="copyCmd(${escAttr(JSON.stringify(_approveCmd))}, this)">📋 Copy</button>
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
        if (pre) pre.textContent = raw ? _dfCmd(`./pipeline_run.sh fail "${raw.replace(/"/g,"'")}"`) : failCmd;
      };
    }

    // Standard guidance builder (always shown for AI-verdict gates)
    await autoLoadVerdictFile(gate, `pc-status-${gate}`, `pc-ta-${gate}`, `pc-preview-${gate}`, false);
    const ta = document.getElementById(`pc-ta-${gate}`);
    if (ta) ta.oninput = () => {
      const raw = ta.value.trim();
      const pre = document.getElementById(`pc-preview-${gate}`);
      if (pre) pre.textContent = raw ? _dfCmd(`./pipeline_run.sh fail "${raw.replace(/"/g,"'")}"`) : failCmd;
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
  const failCmd = _dfCmd(def.failCmd || './pipeline_run.sh fail "reason"');
  pre.textContent = raw ? _dfCmd(`./pipeline_run.sh fail "${raw.replace(/"/g,"'")}"`) : failCmd;
}

// ── Unified pcUpdateCmd for modal findings builders ───────────────────────
function pcUpdateCmd(gate) {
  const ta  = document.getElementById(`pc-ta-${gate}`);
  const pre = document.getElementById(`pc-preview-${gate}`);
  if (!ta || !pre) return;
  const raw = ta.value.trim();
  const def = ALL_GATE_DEFS[gate] || {};
  const failCmd = _dfCmd(def.failCmd || './pipeline_run.sh fail "reason"');
  pre.textContent = raw ? _dfCmd(`./pipeline_run.sh fail "${raw.replace(/"/g,"'")}"`) : failCmd;
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
  // FIX-BF-FORMAT: handle both BF-01 (no G) and BF-G01, plus markdown bold **BF-01:** and list markers - **BF-01:**
  // Pattern handles: "- **BF-01:** desc", "BF-G01 — desc", "1. FINDING-03: desc"
  const pattern = /^[-*\s]*(?:\d+\.\s+)?\*{0,2}(BF-[\w\d._-]+|BLOCK(?:ER)?-[\w\d._-]+|FINDING-[\w\d._-]+|QA-FAIL-[\w\d._-]+|DOC-[\w\d._-]+|GAP-G\d-\w+|CONCERN-[\w\d._-]+|ISSUE-[\w\d._-]+)\*{0,2}\s*[—:–\-]+\*{0,2}\s*(.+)/im;
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

// ── Extract overall verdict status (PASS / BLOCK) from verdict file ────────
function extractVerdictStatus(text) {
  if (!text) return null;
  // 1. YAML/markdown header: **status:** BLOCK or **status:** PASS (top of file)
  const headerM = text.match(/\*{0,2}status\*{0,2}\s*:+\s*\*{0,2}(PASS|BLOCK|APPROVED|REJECTED)\*{0,2}/im);
  if (headerM) {
    const v = headerM[1].toUpperCase();
    return (v === 'PASS' || v === 'APPROVED') ? 'PASS' : 'BLOCK';
  }
  // 2. Fallback: look near "## Overall Verdict" section for standalone PASS/BLOCK
  const sectionIdx = text.search(/##\s+Overall\s+Verdict/i);
  if (sectionIdx >= 0) {
    const excerpt = text.slice(sectionIdx, sectionIdx + 400);
    const sectionM = excerpt.match(/\*{0,2}(PASS|BLOCK)\*{0,2}/im);
    if (sectionM) return sectionM[1].toUpperCase();
  }
  // 3. Structural inference: BF-* / BLOCKER-* findings present → infer BLOCK
  //    Teams often paste raw blocker lists without an explicit status header.
  const bfCount = (text.match(/\bBF-[\w\d._-]+[\s(:—]/g) || []).length;
  if (bfCount >= 1) return 'BLOCK';
  // 4. Explicit PASS phrase as last resort
  if (/\b(VERDICT|RESULT|DECISION)\s*[:\-—]+\s*PASS\b/i.test(text)) return 'PASS';
  return null;
}

// ── Apply verdict outcome to PASS/FAIL buttons and findings builder ────────
// Called after autoLoadVerdictFile detects PASS or BLOCK in a verdict file.
// Visually highlights the correct action button so the user never clicks the wrong one.
function applyVerdictToButtons(status) {
  if (!status) return;
  // Scope to current quick-action-bar and its findings-builder
  const passBtn = document.querySelector('.quick-action-bar .qa-btn-pass');
  const failBtn = document.querySelector('.quick-action-bar .qa-btn-fail');
  const builder = document.querySelector('.findings-builder');
  if (status === 'BLOCK') {
    if (passBtn) passBtn.classList.add('verdict-dimmed');
    if (failBtn) failBtn.classList.add('verdict-active');
    if (builder) builder.classList.add('verdict-block');
  } else if (status === 'PASS') {
    if (passBtn) passBtn.classList.add('verdict-pass-active');
    if (builder) builder.classList.add('verdict-pass');
  }
}

// ── Phase tracker helpers ───────────────────────────────────────────────────
/** True for gates that have an explicit two-phase Team A → Team B structure. */
function isTwoPhaseGate(gate) { return gate === 'GATE_1' || gate === 'GATE_8'; }
/** True for self-loop correction-cycle gates (auto-route back to themselves on fail). */
function isSelfLoopGate(gate) { return gate === 'GATE_1' || gate === 'GATE_0'; }

// ── 3-Layer Feedback Detection System ─────────────────────────────────────
/**
 * Iron Rule: universal behavior for all AI-verdict gate types.
 *
 * Layer A — initFeedbackDetection(gate)
 *   Auto-scan: fires on every page load and state refresh (called from
 *   loadPipelineState after banner renders). No user gesture required.
 *
 * Layer B — fdRescan()
 *   Guided rescan: scans all candidates in parallel, shows existence-checked
 *   list. User selects the file to load. Auto-loads if only one found.
 *
 * Layer C — fdLoadManual() / fdLoadPath(path)
 *   Manual bypass: operator pastes exact file path, system fetches and processes.
 *
 * All 3 layers funnel into _processFdVerdict(gate, text, path) which calls:
 *   extractVerdictStatus → applyVerdictToButtons → updateBannerForVerdict
 *   → populate findings builder (if BLOCK).
 */

/** Layer A — called from loadPipelineState() after banner renders. */
async function initFeedbackDetection(gate) {
  if (!pipelineState) return;
  const verdictTeam = getEffectiveVerdictTeam ? getEffectiveVerdictTeam(gate) : null;
  if (!verdictTeam) return; // Not an AI-verdict gate — no FD panel

  const statusEl = document.getElementById('csb-fd-status');
  if (!statusEl) return;

  statusEl.innerHTML = `<span style="color:var(--text-muted)">🔍 Scanning…</span>`;

  const wp = pipelineState.work_package_id || '';
  const candidates = getVerdictCandidates(gate, wp);
  if (!candidates.length) {
    statusEl.textContent = 'No candidates defined for this gate.';
    return;
  }

  let foundText = null, foundPath = '';
  for (const cand of candidates) {
    const t = await fetchText(cand);
    if (t) { foundText = t; foundPath = cand; break; }
  }

  _processFdVerdict(gate, foundText, foundPath);
}

/**
 * Shared verdict processing pipeline — called by all 3 layers.
 * Updates the FD status line, applies verdict to buttons and banner,
 * and populates the findings builder when BLOCK.
 */
function _processFdVerdict(gate, foundText, foundPath) {
  const statusEl = document.getElementById('csb-fd-status');

  if (!foundText) {
    if (statusEl) {
      statusEl.innerHTML =
        `<span style="color:var(--text-muted)">🔍 No verdict file found — team is still working</span>`;
    }
    return;
  }

  const verdictStatus = extractVerdictStatus(foundText);
  const fileName = foundPath ? foundPath.split('/').pop() : 'verdict file';
  const badge = verdictStatus === 'PASS'
    ? `<span style="color:var(--success);font-weight:700">✅ PASS</span>`
    : verdictStatus === 'BLOCK'
    ? `<span style="color:var(--danger);font-weight:700">⛔ BLOCK</span>`
    : `<span style="color:var(--text-muted)">${escHtml(verdictStatus || 'unknown')}</span>`;

  if (statusEl) {
    statusEl.innerHTML =
      `🟢 <span style="font-family:var(--mono);font-size:10px">${escHtml(fileName)}</span> — ${badge}`;
  }

  // Apply verdict to buttons and rewrite the Next Step banner
  applyVerdictToButtons(verdictStatus);
  updateBannerForVerdict(gate, verdictStatus, foundPath);

  // Propagate into the quick-action-bar findings builder if present
  const ta = document.getElementById('qbar-ta');
  if (ta) {
    const isReviseGate = (gate === 'G3_5');
    if (verdictStatus === 'BLOCK') {
      const findings = extractFindings(foundText);
      if (findings) {
        ta.value = findings;
        ta.style.borderColor = 'var(--danger)';
        updateFindingsCmd(gate, 'qbar-ta', 'qbar-preview', isReviseGate);
      }
    } else if (verdictStatus === 'PASS') {
      ta.value = '';
      ta.placeholder = '✅ PASS verdict detected — click the ✅ PASS button above.';
      ta.style.borderColor = 'var(--success)';
    }
  }
}

/** Layer B — Rescan all candidates; show list if multiple found. */
async function fdRescan() {
  const gate = pipelineState ? pipelineState.current_gate : null;
  if (!gate) return;

  const statusEl  = document.getElementById('csb-fd-status');
  const candEl    = document.getElementById('csb-fd-candidates');
  if (statusEl) statusEl.innerHTML = `<span style="color:var(--text-muted)">🔍 Scanning all candidates…</span>`;
  if (candEl)   { candEl.innerHTML = ''; candEl.style.display = 'none'; }

  const wp = (pipelineState && pipelineState.work_package_id) || '';
  const candidates = getVerdictCandidates(gate, wp);
  if (!candidates.length) {
    if (statusEl) statusEl.textContent = 'No candidates defined for this gate.';
    return;
  }

  // Parallel existence check (Layer B — shows all discoverable files)
  const results = await Promise.all(
    candidates.map(async path => {
      const t = await fetchText(path);
      return { path, text: t, exists: !!t };
    })
  );
  const found = results.filter(r => r.exists);

  if (found.length === 0) {
    if (statusEl) {
      const names = candidates.map(p => escHtml(p.split('/').pop())).join(', ');
      statusEl.innerHTML =
        `<span style="color:var(--text-muted)">🔍 Nothing found (${candidates.length} paths checked)</span>`;
    }
    return;
  }

  if (found.length === 1) {
    // Single match — auto-load (same as Layer A)
    _processFdVerdict(gate, found[0].text, found[0].path);
    return;
  }

  // Multiple matches — show selection list so operator can choose
  if (statusEl) {
    statusEl.innerHTML =
      `<span style="color:var(--warning)">⚠️ ${found.length} files found — select one to load:</span>`;
  }
  if (candEl) {
    candEl.style.display = 'flex';
    candEl.innerHTML = found.map((f, i) => {
      const fname  = f.path.split('/').pop();
      const status = extractVerdictStatus(f.text);
      const badge  = status === 'PASS' ? ' ✅' : status === 'BLOCK' ? ' ⛔' : '';
      const isPri  = i === 0; // first = highest-priority by candidate ordering
      return `<button class="csb-fd-cand-btn${isPri ? ' csb-fd-cand-primary' : ''}"
        onclick="fdLoadPath(${escAttr(JSON.stringify(f.path))})"
        title="${escAttr(f.path)}">
        ${isPri ? '★ ' : ''}${escHtml(fname)}${badge}
      </button>`;
    }).join('');
  }
}

/** Load a specific path — used by Layer B selection and Layer C manual input. */
async function fdLoadPath(path) {
  const gate = pipelineState ? pipelineState.current_gate : null;
  if (!gate || !path) return;

  const statusEl = document.getElementById('csb-fd-status');
  const candEl   = document.getElementById('csb-fd-candidates');
  if (statusEl) statusEl.innerHTML = `<span style="color:var(--text-muted)">🔍 Loading…</span>`;
  if (candEl)   { candEl.innerHTML = ''; candEl.style.display = 'none'; }

  const t = await fetchText(path);
  if (!t) {
    if (statusEl) {
      statusEl.innerHTML =
        `<span style="color:var(--danger)">❌ Could not load: ${escHtml(path.split('/').pop())}</span>`;
    }
    return;
  }
  _processFdVerdict(gate, t, path);
}

/** Toggle the Layer C manual path input row. */
function fdToggleManual() {
  const row = document.getElementById('csb-fd-manual-row');
  if (!row) return;
  const opening = row.style.display === 'none' || row.style.display === '';
  row.style.display = opening ? 'flex' : 'none';
  if (opening) {
    // Close paste row if open
    const pasteRow = document.getElementById('csb-fd-paste-row');
    if (pasteRow) pasteRow.style.display = 'none';
    const inp = document.getElementById('csb-fd-path-input');
    if (inp) { inp.focus(); inp.select(); }
  }
}

/** Layer D — Toggle the verdict-text paste row (no file needed). */
function fdTogglePaste() {
  const pasteRow = document.getElementById('csb-fd-paste-row');
  if (!pasteRow) return;
  const opening = pasteRow.style.display === 'none' || pasteRow.style.display === '';
  pasteRow.style.display = opening ? 'block' : 'none';
  if (opening) {
    // Close manual row if open
    const manualRow = document.getElementById('csb-fd-manual-row');
    if (manualRow) manualRow.style.display = 'none';
    const ta = document.getElementById('csb-fd-paste-input');
    if (ta) ta.focus();
  }
}

/** Layer D — process pasted verdict text directly (no file needed). */
function fdProcessPasted() {
  const gate = pipelineState ? pipelineState.current_gate : null;
  if (!gate) return;
  const ta = document.getElementById('csb-fd-paste-input');
  const statusEl = document.getElementById('csb-fd-status');
  const resultEl = document.getElementById('csb-fd-paste-result');
  if (!ta || !ta.value.trim()) {
    if (statusEl) statusEl.innerHTML = `<span style="color:var(--warning)">⚠️ Paste verdict text above first</span>`;
    return;
  }
  const text = ta.value.trim();
  _processFdVerdict(gate, text, null);
  // DON'T close panel — show result feedback so user sees what happened
  if (resultEl) {
    const verdictStatus = extractVerdictStatus(text);
    const findings = extractFindings(text);
    const findingCount = findings ? findings.split(';').filter(s => s.trim()).length : 0;
    if (verdictStatus === 'BLOCK') {
      resultEl.innerHTML = `
        <div style="color:var(--danger);font-weight:600;margin-bottom:4px">⛔ BLOCK — ${findingCount} finding${findingCount !== 1 ? 's' : ''} extracted</div>
        <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px">Findings pre-loaded into the Revision Builder below ↓</div>
        <div style="font-size:10px;background:rgba(248,81,73,0.08);border:1px solid var(--danger);border-radius:4px;padding:6px 8px">
          <strong>Next step:</strong> scroll down to the Revision Builder → copy the generated <code>revise "..."</code> command → paste into terminal.<br>
          This will record G3_5 FAIL + generate revised G3_PLAN mandate for Team 10.
        </div>`;
    } else if (verdictStatus === 'PASS') {
      resultEl.innerHTML = `
        <div style="color:var(--success);font-weight:600;margin-bottom:4px">✅ PASS detected</div>
        <div style="font-size:10px;color:var(--text-muted)">Click the ✅ PASS button above to advance the pipeline.</div>`;
    } else {
      resultEl.innerHTML = `
        <div style="color:var(--warning);font-weight:600;margin-bottom:4px">⚠️ Could not parse status</div>
        <div style="font-size:10px;color:var(--text-muted)">No status header, no BF-* findings found. Check the pasted text — ensure it contains "BF-XXXX:" blockers or a "status: BLOCK/PASS" header.</div>`;
    }
  }
}

/** Layer C — load the manually entered path. */
async function fdLoadManual() {
  const input = document.getElementById('csb-fd-path-input');
  if (!input) return;
  const path = input.value.trim();
  if (!path) return;
  await fdLoadPath(path);
  // Collapse manual row after load
  const row = document.getElementById('csb-fd-manual-row');
  if (row) row.style.display = 'none';
}

// ── Current Step Banner — universal, all gates ─────────────────────────────
/**
 * Build the always-visible "Current Step Banner" shown above Gate Context.
 * Explains: who is the active actor, what engine, current phase label, numbered next steps.
 * Works for ALL gate types. Dynamically driven by state (lld400_content, gate_state, etc).
 */
function buildCurrentStepBanner(gate, state) {
  if (!gate || !state) return '';

  // ── COMPLETE / NONE: WP closed or no active WP ────────────────────────────
  if (gate === 'COMPLETE' || gate === 'NONE' || !gate) {
    const isClosed  = gate === 'COMPLETE';
    const wp        = (state.work_package_id && state.work_package_id !== 'NONE')
                        ? state.work_package_id : null;
    const total     = (state.gates_completed || []).length;
    const title     = isClosed ? 'Work Package Closed' : 'No Active Work Package';
    const actorTxt  = isClosed ? `✅ ${wp || '—'}` : '— Idle —';
    const badgeTxt  = isClosed ? 'CLOSED' : 'NO ACTIVE WP';
    const phaseTxt  = isClosed ? `${total} gates completed` : 'Awaiting next WP activation';
    const eventTickerComplete = `<div class="csb-event-ticker" id="event-log-ticker" style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.07);font-size:11px">
      <span class="ticker-label" style="color:var(--text-muted)">Recent:</span> <span id="event-log-ticker-events" style="color:var(--text-muted)">—</span>
      <span class="ticker-count" style="margin-left:8px;color:var(--accent)">(<span id="event-log-ticker-count">0</span> events)</span>
    </div>`;
    return `<div class="current-step-banner csb-complete">
      <div class="csb-title">${escHtml(title)}</div>
      <div class="csb-header">
        <span class="csb-actor">${escHtml(actorTxt)}</span>
        <span class="csb-engine-badge">${escHtml(badgeTxt)}</span>
        <span class="csb-phase-label">${escHtml(phaseTxt)}</span>
      </div>
      <div class="csb-steps">
        <div class="csb-step">
          <span class="csb-step-num">1</span>
          <span class="csb-step-text">${isClosed
            ? 'This work package is fully closed. All gates passed and docs archived.'
            : 'No work package is currently active in this domain.'}</span>
        </div>
        <div class="csb-step">
          <span class="csb-step-num">2</span>
          <span class="csb-step-text">To start a new WP, update <code style="background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:3px">pipeline_state_${escHtml(state.project_domain || currentDomain)}.json</code> with the new WP details.</span>
        </div>
      </div>
      ${eventTickerComplete}
    </div>`;
  }

  const def       = ALL_GATE_DEFS[gate] || {};
  const cfg       = GATE_CONFIG[gate]   || {};
  const failed    = state.gates_failed  || [];
  const failCount = failed.filter(g => g === gate).length;
  const lld400    = (state.lld400_content || '').trim();
  const gateState = state.gate_state || null;
  const baseCmd   = _dfCmd('./pipeline_run.sh ').trimEnd();

  let actor, engineLabel, phaseLabel, steps, modCls;
  let cmdFlowBlock    = ''; // Populated for multi-phase gates (GATE_1, G3_PLAN)
  let artifactScanBlock = ''; // Populated for artifact-detection gates (G3_PLAN phase 1)

  if (gateState === 'PASS_WITH_ACTION') {
    actor = 'Gate held'; engineLabel = ''; phaseLabel = 'PASS_WITH_ACTION'; modCls = 'csb-pwa';
    steps = [
      'Review the pending action items in the PASS_WITH_ACTION banner below',
      'Responsible team resolves each listed action',
      'Click "✅ Actions Resolved" to advance, or "⚡ Override & Advance" to proceed with override logged',
    ];

  } else if (gate === 'GATE_1') {
    const _p1cmd = _dfCmd('./pipeline_run.sh phase1');
    const _p2cmd = _dfCmd('./pipeline_run.sh phase2');
    const _pscmd = _dfCmd('./pipeline_run.sh pass');
    // Command-flow box: shown in both phases so operator always sees the full sequence.
    // gcf-done = already run, gcf-next = run NOW, gcf-pending = run later.
    cmdFlowBlock = `<div class="gate1-cmd-flow">
  <div class="gcf-title">🔁 GATE_1 — Full Command Sequence</div>
  <div class="gcf-row gcf-done">
    <span class="gcf-num">1</span>
    <code class="gcf-cmd">${escHtml(_p1cmd)}</code>
    <span class="gcf-note">← send to Team 170 (LLD400)</span>
    <button class="gcf-copy" onclick="copyCmd(${escAttr(JSON.stringify(_p1cmd))}, this)">⎘</button>
  </div>
  <div class="gcf-row ${!lld400 ? 'gcf-next' : 'gcf-done'}">
    <span class="gcf-num">2</span>
    <code class="gcf-cmd">${escHtml(_p2cmd)}</code>
    <span class="gcf-note">← after Team 170 saves LLD400</span>
    <button class="gcf-copy" onclick="copyCmd(${escAttr(JSON.stringify(_p2cmd))}, this)">⎘</button>
  </div>
  <div class="gcf-row ${lld400 ? 'gcf-next' : 'gcf-pending'}">
    <span class="gcf-num">3</span>
    <code class="gcf-cmd">${escHtml(_pscmd)}</code>
    <span class="gcf-note">← after Team 190 verdict PASS</span>
    <button class="gcf-copy" onclick="copyCmd(${escAttr(JSON.stringify(_pscmd))}, this)">⎘</button>
  </div>
</div>`;
    if (!lld400) {
      actor = 'Team 170'; engineLabel = 'Gemini'; modCls = failCount > 0 ? 'csb-correction' : '';
      phaseLabel = failCount > 0 ? 'Phase 1 of 2 — correction cycle' : 'Phase 1 of 2 — LLD400 authoring';
      steps = [
        failCount > 0
          ? 'Team 170 saves the corrected LLD400 → _COMMUNICATION/team_170/TEAM_170_..._LLD400_vN.M.md'
          : 'Team 170 saves the LLD400 spec → _COMMUNICATION/team_170/TEAM_170_..._LLD400_v1.0.0.md',
        `Run in terminal: ${_p2cmd}  (auto-stores LLD400 + generates Team 190 mandate)`,
        'Paste the ▼▼▼ block into Codex (OpenAI) → Team 190 validates → click ✅ PASS or ❌ FAIL',
      ];
    } else {
      actor = 'Team 190'; engineLabel = 'Codex (OpenAI)'; phaseLabel = 'Phase 2 of 2 — LLD400 validation'; modCls = 'csb-phase2';
      steps = [
        'LLD400 stored ✅ — scroll to "Team Mandates" accordion below → click the "Team 190" tab',
        'Click "📋 Copy mandate" → paste into Codex (OpenAI) → Team 190 validates the LLD400',
        `Team 190 saves verdict → click ✅ PASS (run: ${_pscmd}) or ❌ FAIL (return to Team 170 correction)`,
      ];
    }

  } else if (gate === 'G3_PLAN') {
    const workPlan  = (state.work_plan || '').trim();
    const _gp1cmd   = _dfCmd('./pipeline_run.sh phase1');
    const _gp2cmd   = _dfCmd('./pipeline_run.sh phase2');
    const _gpcmd    = _dfCmd('./pipeline_run.sh pass');
    // Command-flow box for G3_PLAN (all 3 steps always visible).
    cmdFlowBlock = `<div class="gate1-cmd-flow">
  <div class="gcf-title">🔁 G3_PLAN — Full Command Sequence</div>
  <div class="gcf-row gcf-done">
    <span class="gcf-num">1</span>
    <code class="gcf-cmd">${escHtml(_gp1cmd)}</code>
    <span class="gcf-note">← generate Team 10 work plan mandate</span>
    <button class="gcf-copy" onclick="copyCmd(${escAttr(JSON.stringify(_gp1cmd))}, this)">⎘</button>
  </div>
  <div class="gcf-row ${!workPlan ? 'gcf-next' : 'gcf-done'}">
    <span class="gcf-num">2</span>
    <code class="gcf-cmd">${escHtml(_gp2cmd)}</code>
    <span class="gcf-note">← after Team 10 saves work plan (auto-store)</span>
    <button class="gcf-copy" onclick="copyCmd(${escAttr(JSON.stringify(_gp2cmd))}, this)">⎘</button>
  </div>
  <div class="gcf-row ${workPlan ? 'gcf-next' : 'gcf-pending'}">
    <span class="gcf-num">3</span>
    <code class="gcf-cmd">${escHtml(_gpcmd)}</code>
    <span class="gcf-note">← advance G3_PLAN → G3_5 (Team 90)</span>
    <button class="gcf-copy" onclick="copyCmd(${escAttr(JSON.stringify(_gpcmd))}, this)">⎘</button>
  </div>
</div>`;
    // Artifact scan panel (Phase 1 only): let operator scan/rescan for Team 10 work plan file
    if (!workPlan) {
      const wp = (state.work_package_id || '').replace(/-/g, '_');
      artifactScanBlock = `<div class="artifact-scan-panel" id="g3plan-artifact-scan">
  <div class="asp-title">📂 Work Plan Detection — Team 10 Output</div>
  <div class="asp-status" id="asp-status">🔍 Checking <code>_COMMUNICATION/team_10/TEAM_10_${escHtml(wp)}_G3_PLAN_WORK_PLAN_v*.md</code>…</div>
  <div class="asp-actions">
    <button class="asp-btn" onclick="g3planRescan()">↩️ Rescan</button>
    <button class="asp-btn" onclick="g3planToggleManual()">✏️ Paste path</button>
  </div>
  <div class="asp-manual-row" id="asp-manual-row" style="display:none">
    <input id="asp-path-input" class="asp-input" placeholder="_COMMUNICATION/team_10/TEAM_10_…_G3_PLAN_WORK_PLAN_v1.0.0.md"
      onkeydown="if(event.key==='Enter')g3planStoreManual()">
    <button class="asp-btn" onclick="g3planStoreManual()">Store ↵</button>
  </div>
</div>`;
    }
    if (!workPlan) {
      actor = 'Team 10'; engineLabel = 'Cursor'; modCls = failCount > 0 ? 'csb-correction' : '';
      phaseLabel = failCount > 0 ? 'Phase 1 of 2 — revision cycle' : 'Phase 1 of 2 — work plan authoring';
      steps = [
        failCount > 0
          ? 'Team 10 saves revised work plan → _COMMUNICATION/team_10/TEAM_10_..._G3_PLAN_WORK_PLAN_vN.M.md'
          : 'Team 10 saves work plan → _COMMUNICATION/team_10/TEAM_10_..._G3_PLAN_WORK_PLAN_v1.0.0.md',
        `Run in terminal: ${_gp2cmd}  (auto-stores plan + confirms readiness)`,
        `Plan confirmed stored → run: ${_gpcmd}  (advances to G3_5 for Team 90 validation)`,
      ];
    } else {
      actor = 'Nimrod'; engineLabel = 'Terminal'; phaseLabel = 'Phase 2 of 2 — plan stored, advance ready'; modCls = 'csb-phase2';
      steps = [
        `Work plan stored ✅ (${String(workPlan.length).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} chars) — Team 10 output confirmed`,
        `Run: ${_gpcmd}  (advances G3_PLAN → G3_5 where Team 90 validates the work plan)`,
        'At G3_5: scroll to "Team Mandates" → copy Team 90 mandate → paste into Codex',
      ];
    }

  } else if (gate === 'GATE_8') {
    const phase8done = !!(state.phase8_content || '').trim();
    // Iron Rule (locked 2026-03-15): Team 70 is SHARED — handles GATE_8 in ALL domains.
    if (!phase8done) {
      actor = 'Team 70'; engineLabel = 'Cursor'; phaseLabel = 'Phase 1 of 2 — AS_MADE_REPORT'; modCls = '';
      steps = [
        'Team 70 writes AS_MADE_REPORT + archives WP files → _COMMUNICATION/team_70/',
        `Run in terminal: ${baseCmd} phase2  (generates Team 90 validation mandate)`,
        'Scroll to "Team Mandates" → "Team 90" tab → copy mandate → paste into Codex → click ✅ PASS',
      ];
    } else {
      actor = 'Team 90'; engineLabel = 'Codex'; phaseLabel = 'Phase 2 of 2 — closure validation'; modCls = 'csb-phase2';
      steps = [
        'Scroll to "Team Mandates" → click "Team 90" tab → copy mandate → paste into Codex',
        'Team 90 validates AS_MADE_REPORT completeness',
        `PASS → WP closes. Run: ${baseCmd} pass`,
      ];
    }

  } else if (def.engine === 'human') {
    actor = 'You (Nimrod)'; engineLabel = 'Browser'; phaseLabel = 'Human approval required'; modCls = 'csb-human';
    steps = [
      'Review the spec / output in the "Current Gate Prompt" section above',
      `Click ✅ PASS to approve and advance, or ❌ FAIL to reject`,
    ];

  } else if (def.engine === 'cursor') {
    const ownerName = (def.owner || cfg.owner || 'team').replace('team_', 'Team ');
    actor = ownerName; engineLabel = 'Cursor'; modCls = failCount > 0 ? 'csb-correction' : '';
    phaseLabel = failCount > 0 ? 'Correction cycle' : 'Implementation';
    steps = [
      'Open the "Team Mandates" accordion below → select the active team tab',
      'Copy the mandate → paste into Cursor Composer → Cursor implements',
      failCount > 0
        ? `After corrections are done + git committed: run ${baseCmd} pass`
        : `After all teams complete + git commit exists: run ${baseCmd} pass`,
    ];

  } else {
    // Standard AI validation gate (codex, codex+human, etc.)
    const ownerKey  = def.verdictTeam || def.owner || cfg.owner || 'team';
    const ownerName = ownerKey.replace('team_', 'Team ');
    const engRaw    = def.engine || cfg.engine || 'codex';
    const engShow   = engRaw === 'codex' ? 'Codex (OpenAI)' : engRaw === 'cursor' ? 'Cursor' : engRaw;
    actor = ownerName; engineLabel = engShow; modCls = failCount > 0 ? 'csb-correction' : '';
    phaseLabel = failCount > 0 ? 'Correction cycle' : 'Validation';
    steps = [
      `Run in terminal: ${baseCmd}  (generates the mandate prompt)`,
      `Paste the ▼▼▼ block into ${engShow}`,
      `${ownerName} processes → click ✅ PASS or ❌ FAIL based on their verdict`,
    ];
  }

  const engineBadge = engineLabel
    ? `<span class="csb-engine-badge">${escHtml(engineLabel)}</span>`
    : '';

  const stepsHtml = steps.map((s, i) =>
    `<div class="csb-step">
      <span class="csb-step-num">${i + 1}</span>
      <span class="csb-step-text">${escHtml(s)}</span>
    </div>`
  ).join('');

  // 3-Layer Feedback Detection Panel — shown for all AI-verdict gates.
  // Layer A fires on page load; Layer B on user-triggered Rescan; Layer C on manual path input.
  // Iron Rule: every gate with a verdictTeam gets this panel.
  const hasFeedbackDetection = !!(getEffectiveVerdictTeam && getEffectiveVerdictTeam(gate));
  const footerHtml = hasFeedbackDetection
    ? `<div class="csb-fd" id="csb-fd">
        <div class="csb-fd-row">
          <span id="csb-fd-status" class="csb-fd-status">🔍 Scanning for verdict…</span>
          <button class="csb-fd-btn" onclick="fdRescan()" title="Rescan all candidate paths for new verdict file">↩️ Rescan</button>
          <button class="csb-fd-btn" onclick="fdToggleManual()" title="Enter verdict file path manually (Layer C bypass)">✏️ Manual</button>
          <button class="csb-fd-btn" onclick="fdTogglePaste()" title="Paste verdict text directly — use when team didn't save a file (Layer D)">📋 Paste</button>
        </div>
        <div class="csb-fd-manual-row" id="csb-fd-manual-row" style="display:none">
          <input id="csb-fd-path-input" class="csb-fd-input"
            placeholder="../../_COMMUNICATION/team_190/TEAM_190_…_v1.0.0.md"
            onkeydown="if(event.key==='Enter')fdLoadManual()">
          <button class="csb-fd-btn" onclick="fdLoadManual()">Load ↵</button>
        </div>
        <div class="csb-fd-paste-row" id="csb-fd-paste-row" style="display:none">
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px">Paste full verdict text from team output (Layer D — no file required):</div>
          <textarea id="csb-fd-paste-input" class="csb-fd-paste-textarea"
            placeholder="Paste Team 90 / Team 190 / Team 100 verdict text here…" rows="5"></textarea>
          <button class="csb-fd-btn" onclick="fdProcessPasted()" style="margin-top:4px;width:100%">⚡ Process verdict ↵</button>
          <div id="csb-fd-paste-result" style="margin-top:6px;font-size:11px;"></div>
        </div>
        <div class="csb-fd-candidates" id="csb-fd-candidates"></div>
      </div>`
    : `<div class="csb-last-action" style="font-style:italic;font-size:11px;color:var(--text-muted);margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.07);min-height:14px"></div>`;
  const eventTickerHtml = `<div class="csb-event-ticker" id="event-log-ticker" style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.07);font-size:11px">
    <span class="ticker-label" style="color:var(--text-muted)">Recent:</span> <span id="event-log-ticker-events" style="color:var(--text-muted)">—</span>
    <span class="ticker-count" style="margin-left:8px;color:var(--accent)">(<span id="event-log-ticker-count">0</span> events)</span>
  </div>`;

  // ── Universal bypass panel — shown at ALL non-complete gates ──────────
  // Requirement (2026-03-16): every gate must have a manual bypass path + logging.
  const bypassCmd = _dfCmd(`./pipeline_run.sh override "reason"`);
  const bypassHtml = `<div class="bypass-panel" id="bypass-panel-${escHtml(gate)}">
    <button class="bypass-toggle" onclick="bypassToggle(${escAttr(JSON.stringify(gate))})">
      ⚡ Emergency Bypass
    </button>
    <div class="bypass-body" id="bypass-body-${escHtml(gate)}" style="display:none">
      <div class="bypass-warning">⚠️ Bypass is logged. Every override is recorded in the pipeline event log for audit and optimization.</div>
      <div class="bypass-row">
        <textarea id="bypass-reason-${escHtml(gate)}" class="bypass-textarea"
          placeholder="Required: reason for bypassing this gate (e.g. 'Team 90 unreachable — continuing with known good plan')"
          oninput="bypassUpdateCmd(${escAttr(JSON.stringify(gate))})"></textarea>
      </div>
      <div class="bypass-cmd-row">
        <code class="bypass-cmd" id="bypass-cmd-${escHtml(gate)}">${escHtml(bypassCmd)}</code>
        <button class="bypass-copy-btn" onclick="bypassCopy(${escAttr(JSON.stringify(gate))}, this)">⎘ Copy → terminal</button>
      </div>
    </div>
  </div>`;

  return `<div class="current-step-banner${modCls ? ' ' + modCls : ''}">
    <div class="csb-title">Next Step — What to do now?</div>
    <div class="csb-header">
      <span class="csb-actor">${escHtml(actor)}</span>
      ${engineBadge}
      <span class="csb-phase-label">${escHtml(phaseLabel)}</span>
    </div>
    <div class="csb-steps">${stepsHtml}</div>
    ${cmdFlowBlock}
    ${artifactScanBlock}
    ${footerHtml}
    ${eventTickerHtml}
    ${bypassHtml}
  </div>`;
}

/**
 * Build phase tracker HTML. lld400Content: pipelineState.lld400_content (empty = Phase 1 active).
 */
function buildPhaseTracker(gate, lld400Content) {
  const def = ALL_GATE_DEFS[gate] || {};
  const phase1Done = !!lld400Content;
  const owners = (def.owner || '').split('+');
  const p1Label = owners[0] ? owners[0] : 'Phase 1';
  const p2Label = owners[1] ? owners[1] : 'Phase 2';
  const p1Class = phase1Done ? 'phase-done' : 'phase-active';
  const p2Class = phase1Done ? 'phase-active' : 'phase-pending';
  const p1Icon  = phase1Done ? '✅' : '📝';
  const p2Icon  = phase1Done ? '🔍' : '⏳';
  return `<div class="phase-tracker">
    <div class="phase-step ${p1Class}">${p1Icon} ${escHtml(p1Label)}</div>
    <div class="phase-arrow">→</div>
    <div class="phase-step ${p2Class}">${p2Icon} ${escHtml(p2Label)}</div>
  </div>`;
}

/**
 * Build "Next action" call-to-action banner with exact terminal command.
 * inCorrectionCycle: gate has been failed at least once.
 */
function buildNextActionBanner(gate, lld400Content, inCorrectionCycle) {
  const baseCmd   = _dfCmd('./pipeline_run.sh ').trimEnd();
  const phase2Cmd = _dfCmd('./pipeline_run.sh phase2');
  let title, note, activeCmd;
  if (!lld400Content && inCorrectionCycle) {
    title     = '📝 Correction cycle — waiting for Team 170 revised LLD400';
    note      = 'Run the command below after Team 170 saves the corrected LLD400. It auto-detects the latest version, stores it, and generates the Team 190 (Codex) validation mandate. No manual store step required.';
    activeCmd = phase2Cmd;
  } else if (!lld400Content) {
    title     = '📝 Phase 1 active — Team 170 (Gemini) writing LLD400';
    note      = 'Run after Team 170 saves their LLD400. The command auto-stores it and generates the Team 190 (Codex/OpenAI) validation mandate.';
    activeCmd = phase2Cmd;
  } else {
    title     = '✅ LLD400 stored — Team 190 (Codex/OpenAI) validation active';
    note      = 'Scroll to "Team Mandates" ↓ → click "Team 190" tab → copy mandate → paste into Codex (OpenAI) → await verdict → click ✅ PASS (advance to GATE_2) or ❌ FAIL (correction cycle).';
    activeCmd = _dfCmd('./pipeline_run.sh pass');
  }
  return `<div class="next-action-banner">
    <div class="next-action-title">⮕ ${escHtml(title)}</div>
    <div class="next-action-cmd">${escHtml(activeCmd)}</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <button class="findings-copy-btn" style="font-size:10px" onclick="copyCmd(${escAttr(JSON.stringify(activeCmd))}, this)">⎘ Copy → terminal</button>
    </div>
    <div class="next-action-note">${escHtml(note)}</div>
  </div>`;
}

/**
 * Build correction cycle panel for self-loop gates (replaces the confusing route selector).
 */
function buildCorrectionCyclePanel(gate, lld400Content, failCount) {
  const baseCmd = _dfCmd('./pipeline_run.sh ').trimEnd();

  if (gate === 'GATE_0') {
    // GATE_0 correction cycle: Team 100 (architect) must fix the LOD200 scope brief
    return `<div class="correction-cycle-panel">
      <div class="correction-cycle-title" style="color:var(--danger)">🔄 GATE_0 Correction cycle — Team 190 BLOCKED ${failCount}× — Team 100 action required</div>
      <div class="correction-cycle-step" data-n="1">
        <strong>Review Team 190 rejection findings</strong> in the Gate Context prompt above
        (⚠ CORRECTION CYCLE section shows blocking findings BF-NN)
      </div>
      <div class="correction-cycle-step" data-n="2">
        <strong>Fix the LOD200</strong> scope brief per the blocking findings:
        <span style="font-family:var(--mono);font-size:10px">_COMMUNICATION/team_100/TEAM_100_..._LOD200_v1.0.0.md</span>
      </div>
      <div class="correction-cycle-step" data-n="3">
        Re-run in terminal to regenerate the corrected Team 190 validation prompt:
        <div style="font-family:var(--mono);font-size:10px;background:#010409;padding:5px 8px;border-radius:4px;margin:4px 0">${escHtml(baseCmd)}</div>
        <button class="btn" style="font-size:10px;margin-top:2px" onclick="copyCmd(${escAttr(JSON.stringify(baseCmd))}, this)">⎘ Copy</button>
      </div>
      <div class="correction-cycle-step" data-n="4">Paste the ▼▼▼ block into Codex → Team 190 re-validates → click <strong>✅ PASS</strong> (advances to GATE_1) or <strong>❌ FAIL</strong> (another correction cycle)</div>
    </div>`;
  }

  // GATE_1 (and future self-loop gates): LLD400 correction cycle
  const lld400Badge = lld400Content
    ? `<span style="color:var(--success);font-size:10px">✅ LLD400 stored — Team 190 (Codex) mandate active</span>`
    : `<span style="color:var(--warning);font-size:10px">⏳ Awaiting Team 170 corrected LLD400</span>`;
  return `<div class="correction-cycle-panel">
    <div class="correction-cycle-title">🔄 Correction cycle — failed ${failCount}× &nbsp;${lld400Badge}</div>
    <div class="correction-cycle-step" data-n="1">Team 170 saves corrected LLD400 → <span style="font-family:var(--mono);font-size:10px">_COMMUNICATION/team_170/TEAM_170_..._LLD400_vN.M.md</span></div>
    <div class="correction-cycle-step" data-n="2">
      Run in terminal (auto-stores LLD400 + generates Team 190 prompt):
      <div style="font-family:var(--mono);font-size:10px;background:#010409;padding:5px 8px;border-radius:4px;margin:4px 0">${escHtml(baseCmd)}</div>
      <button class="btn" style="font-size:10px;margin-top:2px" onclick="copyCmd(${escAttr(JSON.stringify(baseCmd))}, this)">⎘ Copy</button>
    </div>
    <div class="correction-cycle-step" data-n="3">Paste the Team 190 ▼▼▼ block into Codex (OpenAI) → await LLD400 validation verdict → click <strong>✅ PASS</strong> (GATE_2) or <strong>❌ FAIL</strong> (another correction cycle)</div>
  </div>`;
}

// ── Universal Bypass Panel helpers ────────────────────────────────────────
// Requirement (2026-03-16): every gate must offer a manual bypass path.
// All bypasses must be logged (override command emits OVERRIDE event to event log).

function bypassToggle(gate) {
  const body = document.getElementById(`bypass-body-${gate}`);
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
}

function bypassUpdateCmd(gate) {
  const ta  = document.getElementById(`bypass-reason-${gate}`);
  const pre = document.getElementById(`bypass-cmd-${gate}`);
  if (!ta || !pre) return;
  const reason = (ta.value || '').trim() || 'reason';
  pre.textContent = _dfCmd(`./pipeline_run.sh override "${reason.replace(/"/g, "'")}"`);
}

function bypassCopy(gate, btn) {
  const pre = document.getElementById(`bypass-cmd-${gate}`);
  if (!pre) return;
  const cmd = pre.textContent.trim();
  if (!cmd) return;
  copyCmd(cmd, btn);
}

// ── G3_PLAN Artifact Scan helpers (AC-11 UI layer) ────────────────────────
// Allows operator to rescan for Team 10 work plan + store via paste path.

async function g3planRescan() {
  const statusEl = document.getElementById('asp-status');
  if (statusEl) statusEl.textContent = '🔍 Rescanning…';
  if (!pipelineState) { if (statusEl) statusEl.textContent = '⚠️ No pipeline state loaded'; return; }
  const wp  = (pipelineState.work_package_id || '').replace(/-/g, '_');
  const candidates = [
    `../../_COMMUNICATION/team_10/TEAM_10_${wp}_G3_PLAN_WORK_PLAN_v1.0.0.md`,
    `../../_COMMUNICATION/team_10/TEAM_10_${wp}_G3_PLAN_WORK_PLAN_v1.1.0.md`,
    `../../_COMMUNICATION/team_10/TEAM_10_${wp}_G3_PLAN_WORK_PLAN_v2.0.0.md`,
  ];
  let found = null;
  for (const p of candidates) {
    try {
      const r = await fetch(p + '?t=' + Date.now());
      if (r.ok) { found = p; break; }
    } catch (_) {}
  }
  if (found) {
    if (statusEl) statusEl.innerHTML = `✅ Found: <code>${found.split('/').pop()}</code> — run <code>${_dfCmd('./pipeline_run.sh phase2')}</code> to auto-store`;
  } else {
    if (statusEl) statusEl.innerHTML = `⚠️ Not found in <code>_COMMUNICATION/team_10/</code> — Team 10 must save the work plan file first`;
  }
}

function g3planToggleManual() {
  const row = document.getElementById('asp-manual-row');
  if (row) row.style.display = row.style.display === 'none' ? 'flex' : 'none';
}

async function g3planStoreManual() {
  const input = document.getElementById('asp-path-input');
  const statusEl = document.getElementById('asp-status');
  if (!input || !input.value.trim()) return;
  const path = input.value.trim();
  if (statusEl) statusEl.innerHTML = `🔄 Checking <code>${path.split('/').pop()}</code>…`;
  try {
    const r = await fetch(`../../${path}?t=` + Date.now());
    if (r.ok) {
      if (statusEl) statusEl.innerHTML = `✅ File found — run <code>${_dfCmd(`./pipeline_run.sh --store-artifact G3_PLAN ${path}`)}</code> to store`;
    } else {
      if (statusEl) statusEl.innerHTML = `❌ File not found at path: <code>${path}</code> — check the path and try again`;
    }
  } catch (e) {
    if (statusEl) statusEl.innerHTML = `❌ Fetch error: ${e.message}`;
  }
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

  // Extract verdict status BEFORE building status HTML so badge can be inline
  const verdictStatus = extractVerdictStatus(foundText);
  const verdictBadge = verdictStatus === 'BLOCK'
    ? ` &nbsp;<span style="color:var(--danger);font-weight:700;background:rgba(248,81,73,0.12);padding:2px 7px;border-radius:4px;font-size:10px">⛔ BLOCK</span>`
    : verdictStatus === 'PASS'
    ? ` &nbsp;<span style="color:var(--success);font-weight:700;background:rgba(63,185,80,0.12);padding:2px 7px;border-radius:4px;font-size:10px">✅ PASS</span>`
    : '';

  if (isCanonical) {
    statusEl.innerHTML = `<span class="findings-status" style="color:var(--success)">🟢 Auto-loaded: ${escHtml(foundPath)}</span>${verdictBadge}`;
  } else {
    statusEl.innerHTML = `<span class="findings-status" style="color:var(--success)">🟢 Loaded: ${escHtml(foundPath)}</span>
      <span class="findings-status" style="color:var(--warning)"> ⚠️ Path drift — expected: ${escHtml(canonical)}</span>${verdictBadge}`;
    logVerdictDrift(gate, 'PATH_B_NON_CANONICAL', { found: foundPath, expected: canonical });
  }

  // Apply verdict state to PASS/FAIL buttons AND update the Next Step banner
  applyVerdictToButtons(verdictStatus);
  updateBannerForVerdict(gate, verdictStatus, foundPath);

  const ta = document.getElementById(taId);
  if (verdictStatus === 'PASS') {
    // PASS verdict: no fail findings to populate; clear builder and signal to use PASS button
    if (ta) {
      ta.value = '';
      ta.placeholder = '✅ PASS verdict detected — no fail findings. Click the ✅ PASS button above.';
      ta.style.borderColor = 'var(--success)';
    }
    return;
  }

  // BLOCK or unknown status: populate findings textarea as before
  const findings = extractFindings(foundText);
  if (ta && findings) {
    ta.value = findings;
    ta.style.borderColor = verdictStatus === 'BLOCK' ? 'var(--danger)' : 'var(--success)';
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
      ? _dfCmd(`./pipeline_run.sh revise "BLOCKER-1: [paste findings]"`)
      : _dfCmd(def.failCmd || `./pipeline_run.sh fail "reason"`);
  } else {
    // Replace " with ' and backticks with ' to prevent bash subcommand substitution.
    const safe = raw.replace(/"/g, "'").replace(/`/g, "'");
    cmd = isRevise
      ? _dfCmd(`./pipeline_run.sh revise "${safe}"`)
      : _dfCmd(`./pipeline_run.sh fail "${safe}"`);
  }

  preview.textContent = cmd;
  _qbarCopyMap[previewId] = cmd;
}

// ── Copy findings command ─────────────────────────────────────────────────
function copyFindingsCmd(previewId, btn) {
  const cmd = _qbarCopyMap[previewId] || document.getElementById(previewId)?.textContent || '';
  copyText(cmd, btn);
}

/**
 * Update the "Next Step" banner when a verdict file is detected.
 * Called from autoLoadVerdictFile after verdict status is extracted.
 * Ensures the operator immediately sees the correct next action without
 * having to scroll or interpret the verdict file manually.
 *
 * Also writes the "last detected action" line at the bottom of the banner
 * in a distinct italic/muted style, giving the operator context about what
 * the system just identified.
 */
function updateBannerForVerdict(gate, verdictStatus, foundPath) {
  const bannerEl = document.getElementById('current-step-banner');
  if (!bannerEl || !verdictStatus) return;

  const baseCmd    = _dfCmd('./pipeline_run.sh ').trimEnd();
  const fileName   = foundPath ? foundPath.split('/').pop() : (gate + ' verdict');
  const teamLabel  = getEffectiveVerdictTeam ? getEffectiveVerdictTeam(gate) : 'verdict team';

  // ── Last-action line (always updated, regardless of PASS/BLOCK) ─────────
  const lastActionEl = bannerEl.querySelector('.csb-last-action');
  if (lastActionEl) {
    const badge = verdictStatus === 'PASS'
      ? '<span style="color:var(--success);font-weight:600">✅ PASS</span>'
      : '<span style="color:var(--danger);font-weight:600">⛔ BLOCK</span>';
    lastActionEl.innerHTML = `Last detected: ${escHtml(fileName)} — decision: ${badge}`;
  }

  const titleEl = bannerEl.querySelector('.csb-title');
  const stepsEl = bannerEl.querySelector('.csb-steps');

  if (verdictStatus === 'PASS') {
    // ── PASS: highlight next action clearly ─────────────────────────────
    if (titleEl) titleEl.innerHTML =
      `✅ ${escHtml(gate)} — PASS — <span style="font-weight:400;font-size:13px">Run <code style="background:rgba(0,0,0,0.25);padding:1px 6px;border-radius:3px">${escHtml(baseCmd)} pass</code> to advance</span>`;
    if (stepsEl) stepsEl.innerHTML = `
      <div class="csb-step">
        <span class="csb-step-num">1</span>
        <span class="csb-step-text"><strong>PASS</strong> verdict received from ${escHtml(teamLabel)} — ${escHtml(fileName)}</span>
      </div>
      <div class="csb-step">
        <span class="csb-step-num">2</span>
        <span class="csb-step-text">Click ✅ PASS button above  <em style="color:var(--text-muted)">or</em>  run in terminal: <code style="background:rgba(0,0,0,0.25);padding:1px 6px;border-radius:3px">${escHtml(baseCmd)} pass</code></span>
      </div>`;
    bannerEl.classList.remove('csb-correction', 'csb-block-detected');
    bannerEl.classList.add('csb-pass-detected');

  } else if (verdictStatus === 'BLOCK') {
    // ── BLOCK: show correction workflow clearly ─────────────────────────
    if (titleEl) titleEl.innerHTML =
      `⛔ ${escHtml(gate)} — BLOCK — <span style="font-weight:400;font-size:13px">Fix required before re-submission</span>`;
    if (stepsEl) stepsEl.innerHTML = `
      <div class="csb-step">
        <span class="csb-step-num">1</span>
        <span class="csb-step-text"><strong>BLOCK</strong> verdict from ${escHtml(teamLabel)} — review findings in the panel below</span>
      </div>
      <div class="csb-step">
        <span class="csb-step-num">2</span>
        <span class="csb-step-text">Fix the blocking issues in your spec/LOD200, then re-run: <code style="background:rgba(0,0,0,0.25);padding:1px 6px;border-radius:3px">${escHtml(baseCmd)}</code> to regenerate the mandate prompt</span>
      </div>
      <div class="csb-step">
        <span class="csb-step-num">3</span>
        <span class="csb-step-text">Re-submit to ${escHtml(teamLabel)}. When they BLOCK again, click ❌ FAIL to record it in pipeline state</span>
      </div>`;
    bannerEl.classList.remove('csb-pass-detected');
    bannerEl.classList.add('csb-correction', 'csb-block-detected');
  }
}

// ── Build Quick Action Bar (decision gates only) ───────────────────────────
async function buildQuickActionBar(gate) {
  _qbarGate = gate;
  const bar = document.getElementById('quick-action-bar');
  if (!bar) return;

  // ── null gate (WP COMPLETE): clear bar ────────────────────────────────────
  if (!gate) { bar.innerHTML = ''; return; }

  // ── G3_PLAN Phase 1: show work plan ready builder instead of PASS/FAIL ──
  // When work_plan is empty, Team 10 hasn't yet saved their plan.
  // Show a completion builder: operator runs phase2 to auto-store.
  if (gate === 'G3_PLAN') {
    const workPlan = !!(pipelineState && (pipelineState.work_plan || '').trim());
    if (!workPlan) {
      const phase2Cmd = _dfCmd('./pipeline_run.sh phase2');
      _qbarCopyMap['g3plan-phase2-preview'] = phase2Cmd;
      bar.innerHTML = `<div class="completion-builder">
        <div class="completion-builder-title">
          📋 Phase 1 — Confirm Team 10 Work Plan Ready &amp; Auto-Store
          <span style="font-size:10px;font-weight:400;color:var(--text-muted)">Team 10 (Cursor)</span>
        </div>
        <div class="completion-builder-desc">
          When Team 10 saves <code>TEAM_10_*_G3_PLAN_WORK_PLAN_v*.md</code>, run <code>phase2</code> to auto-store it.<br>
          <em>Optional: add notes below (not included in command).</em>
        </div>
        <textarea id="g3plan-phase2-ta" class="findings-textarea"
          placeholder="Work plan saved to _COMMUNICATION/team_10/ ✓  |  §2 files present ✓  |  §3 execution order present ✓  …"
        ></textarea>
        <div class="findings-cmd-row">
          <div class="findings-cmd-text" id="g3plan-phase2-preview">${escHtml(phase2Cmd)}</div>
          <button class="findings-copy-btn" onclick="copyFindingsCmd('g3plan-phase2-preview', this)">⎘ Copy → terminal</button>
        </div>
      </div>`;
      return;
    }
    // Phase 2 active (work_plan stored): fall through to normal PASS/FAIL display
  }

  // ── GATE_8 Phase 1: show "Task Completed" builder instead of PASS/FAIL ───
  // When phase8_content is empty, Team 70 hasn't yet confirmed Phase 1 done (all domains).
  // Show a completion builder (mirrors the findings builder, green theme) that
  // generates ./pipeline_run.sh phase2 — activates the Team 90 validation mandate.
  if (gate === 'GATE_8') {
    const phase8done = !!(pipelineState && (pipelineState.phase8_content || '').trim());
    if (!phase8done) {
      const phase2Cmd = _dfCmd('./pipeline_run.sh phase2');
      _qbarCopyMap['phase1-ctx-preview'] = phase2Cmd;
      bar.innerHTML = `<div class="completion-builder">
        <div class="completion-builder-title">
          📋 Phase 1 — Confirm Task Complete &amp; Generate Validation Mandate
          <span style="font-size:10px;font-weight:400;color:var(--text-muted)">Team 70 (shared — all domains)</span>
        </div>
        <div class="completion-builder-desc">
          When the AS_MADE_REPORT and archive are ready, run <code>phase2</code> to generate the Team 90 validation mandate.<br>
          Optional: add completion notes below for your reference (not included in the command).
        </div>
        <textarea id="phase1-ctx-ta" class="findings-textarea"
          placeholder="AS_MADE_REPORT.md ✓  |  Archive manifest complete ✓  |  Cleanup report ✓  |  Path: _COMMUNICATION/team_70/ …"
        ></textarea>
        <div class="findings-cmd-row">
          <div class="findings-cmd-text" id="phase1-ctx-preview">${escHtml(phase2Cmd)}</div>
          <button class="findings-copy-btn" onclick="copyFindingsCmd('phase1-ctx-preview', this)">⎘ Copy → terminal</button>
        </div>
      </div>`;
      return;
    }
    // Phase 2 active (phase8_content set): fall through to normal PASS/FAIL display
  }

  const def = ALL_GATE_DEFS[gate] || {};
  if (!def.twoPaths) { bar.innerHTML = ''; return; }

  const passCmd      = _dfCmd(def.passCmd || './pipeline_run.sh pass');
  const isHuman      = (def.engine === 'human');
  const isRevise     = (gate === 'G3_5');
  const needsBuilder = !!getEffectiveVerdictTeam(gate) || isRevise;
  const passLabel    = def.passLabel || '✅ PASS';
  const failLabel    = def.failLabel || '❌ FAIL';

  // Check if gate has already failed (pipeline is stuck here)
  const failed      = pipelineState ? (pipelineState.gates_failed || []) : [];
  const failCount   = failed.filter(g => g === gate).length;
  const gateStuck   = failCount > 0 && def.failRoutes;

  // ── PWA banner (PASS_WITH_ACTION state — WP002) ───────────────────────────
  const gateState      = pipelineState ? (pipelineState.gate_state || null) : null;
  const pendingActions = pipelineState ? (pipelineState.pending_actions || []) : [];
  let pwaBanner = '';
  if (gateState === 'PASS_WITH_ACTION') {
    const clearCmd    = _dfCmd('./pipeline_run.sh actions_clear');
    const overrideCmd = _dfCmd('./pipeline_run.sh override "reason"');
    const actionItems = pendingActions.length
      ? pendingActions.map(a => `<div class="pwa-action-item">• ${escHtml(a)}</div>`).join('')
      : `<div class="pwa-action-item" style="color:var(--text-muted)">No action items recorded</div>`;
    pwaBanner = `<div class="pwa-banner">
      <div class="pwa-banner-title">⚡ PASS_WITH_ACTION — gate held pending resolution</div>
      ${actionItems}
      <div style="display:flex;gap:6px;margin-top:8px">
        <button class="qa-btn pwa-btn-clear" onclick="copyCmd(${escAttr(JSON.stringify(clearCmd))}, this)">
          ✅ Actions Resolved &nbsp;<span class="terminal-hint">⎘ copy → terminal</span>
        </button>
        <button class="qa-btn pwa-btn-override" onclick="copyCmd(${escAttr(JSON.stringify(overrideCmd))}, this)">
          ⚡ Override &amp; Advance &nbsp;<span class="terminal-hint">⎘ copy → terminal</span>
        </button>
      </div>
    </div>`;
  }

  let html = '';

  // ── Mode A: gate has failed before ───────────────────────────────────────
  if (gateStuck) {
    if (isSelfLoopGate(gate)) {
      // Self-loop gates: no route selector — correction cycle panel shows the flow
      const lld400Content = pipelineState ? (pipelineState.lld400_content || '') : '';
      html += buildCorrectionCyclePanel(gate, lld400Content, failCount);
    } else {
      // Non-self-loop gates: route selector
      const routes = def.failRoutes;
      const docCmd  = _dfCmd(routes.doc.cmd);
      const fullCmd = _dfCmd(routes.full.cmd);

      html += `<div class="route-selector">
        <div class="route-selector-title">
          ⚠️ ${escHtml(gate)} FAIL (${failCount}×) — Select Status
        </div>
        <div class="route-selector-cycle">3-status model: PASS | FAIL — Correction | FAIL — Rejection</div>
        <div class="route-btns">
          <button class="qa-btn-route-doc" onclick="copyCmd(${escAttr(JSON.stringify(docCmd))}, this)" title="${escAttr(docCmd)}">
            ⚠️ FAIL — Correction <span class="terminal-hint">⎘</span>
          </button>
          <button class="qa-btn-route-full" onclick="copyCmd(${escAttr(JSON.stringify(fullCmd))}, this)" title="${escAttr(fullCmd)}">
            ❌ FAIL — Rejection <span class="terminal-hint">⎘</span>
          </button>
        </div>
        <div class="route-desc-row">
          <div class="route-desc">${routes.doc.desc || ''}</div>
          <div class="route-desc">${routes.full.desc || ''}</div>
        </div>
      </div>`;
    }

    // Always show the PASS button below (in case corrections are already done)
    html += `<div class="quick-action-bar" style="margin-top:8px">
      <button class="qa-btn qa-btn-pass" onclick="copyCmd(${escAttr(JSON.stringify(passCmd))}, this)">
        ${escHtml(passLabel)} &nbsp;<span class="terminal-hint">⎘ copy → terminal</span>
      </button>
    </div>`;

  } else {
    // ── Mode B: normal (gate not yet failed) — PASS + PWA + FAIL buttons ────
    const pwaCmd = _dfCmd('./pipeline_run.sh pass_with_actions "ACTION-1: [describe]|ACTION-2: [describe]"');
    html += `<div class="quick-action-bar">
      <button class="qa-btn qa-btn-pass" onclick="copyCmd(${escAttr(JSON.stringify(passCmd))}, this)">
        ${escHtml(passLabel)} &nbsp;<span class="terminal-hint">⎘ copy → terminal</span>
      </button>
      <button class="qa-btn qa-btn-pwa" onclick="copyCmd(${escAttr(JSON.stringify(pwaCmd))}, this)" title="Pass with follow-up actions required (WP002)">
        ⚡ Pass w/ Action &nbsp;<span class="pwa-badge">WP002</span><span class="terminal-hint">⎘ copy</span>
      </button>`;

    if (needsBuilder) {
      html += `<button class="qa-btn qa-btn-fail" disabled style="opacity:0.45;cursor:default">
        ${escHtml(failLabel)} &nbsp;<span style="font-size:10px;font-weight:400">↓ use builder</span>
      </button>`;
    } else {
      const failCmdDef = _dfCmd(def.failCmd || './pipeline_run.sh fail "reason"');
      html += `<button class="qa-btn qa-btn-fail" onclick="copyCmd(${escAttr(JSON.stringify(failCmdDef))}, this)">
        ${escHtml(failLabel)} &nbsp;<span class="terminal-hint">⎘ copy → terminal</span>
      </button>`;
    }

    html += `</div>`;
  }

  // ── Findings builder for AI-verdict gates (always shown when verdictTeam set) ──
  if (needsBuilder) {
    const defaultCmd = isRevise
      ? _dfCmd(`./pipeline_run.sh revise "BLOCKER-1: [paste findings]"`)
      : _dfCmd(def.failCmd || `./pipeline_run.sh fail "reason"`);

    const builderTitle = isRevise
      ? `↩️ Revision Builder — records G3_5 FAIL + generates revision prompt`
      : gateStuck
      ? `✏️ FAIL Command Builder (record findings before routing)`
      : `✏️ FAIL Command Builder`;

    const builderDesc = isRevise
      ? `Paste Team 90 blockers below. The <code style="font-size:10px">revise</code> command automatically records G3_5 FAIL then generates the G3_PLAN revision prompt in one step:`
      : `Paste blocking findings from verdict file (auto-detect tries first):`;

    html += `<div class="findings-builder">
      <div class="findings-builder-title">
        ${builderTitle}
        <span id="qbar-status"></span>
      </div>
      <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px">
        ${builderDesc}
      </div>
      <textarea id="qbar-ta" class="findings-textarea"
        placeholder="${isRevise ? 'BF-G3_5-001: missing contract; BF-G3_5-002: no test criteria…' : 'BF-G5-001: missing validation; BF-G5-002: wrong endpoint…'}"
        oninput="updateFindingsCmd(${escAttr(JSON.stringify(gate))}, 'qbar-ta', 'qbar-preview', ${isRevise})"
      ></textarea>
      ${isRevise ? `<input id="qbar-filepath" class="findings-filepath" placeholder="Optional: path to Team 10 revised work plan file (passes to revise as $3)" oninput="updateFindingsCmd(${escAttr(JSON.stringify(gate))}, 'qbar-ta', 'qbar-preview', true)">` : ''}
      <div class="findings-cmd-row">
        <div class="findings-cmd-text" id="qbar-preview">${escHtml(defaultCmd)}</div>
        <button class="findings-copy-btn" onclick="copyFindingsCmd('qbar-preview', this)">⎘ Copy → terminal</button>
      </div>
    </div>`;

    setTimeout(() => autoLoadVerdictFile(gate, 'qbar-status', 'qbar-ta', 'qbar-preview', isRevise), 50);
  }

  // ── Revise hint for G3_5 — removed: revise now records FAIL automatically ──
  if (false && isRevise && def.reviseCmd) {
    html += `<div style="margin-top:6px;padding:8px 12px;background:rgba(210,153,34,0.08);border:1px solid var(--warning);border-radius:6px;font-size:11px">
      <span style="color:var(--warning);font-weight:600">↩️ After FAIL</span> — generate revision prompt:
      <span style="font-family:var(--mono);font-size:10px"> ./pipeline_run.sh revise "..."</span>
      <button class="btn" style="font-size:10px;margin-left:8px" onclick="copyCmd(${escAttr(JSON.stringify(def.reviseCmd))}, this)">⎘</button>
    </div>`;
  }

  bar.innerHTML = pwaBanner + html;

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
    // Checks AUTHORIZED_STAGE_EXCEPTIONS before flagging — authorized parallel activations are INFO not WARNING.
    if (pipelineState && gov.active_stage) {
      const pipeStage = pipelineState.stage_id || '';
      const wsmStage  = gov.active_stage;
      if (pipeStage && pipeStage !== wsmStage) {
        const exc = (typeof AUTHORIZED_STAGE_EXCEPTIONS !== 'undefined' && AUTHORIZED_STAGE_EXCEPTIONS)
          ? AUTHORIZED_STAGE_EXCEPTIONS[pipeStage] : null;
        if (exc) {
          warnings.push({ sev:'info',
            msg:`Stage "${pipeStage}" ≠ WSM active stage "${wsmStage}" — AUTHORIZED EXCEPTION: ${exc.description}`,
            log:`AD-V2-05 | AUTHORIZED_EXCEPTION | authority: ${exc.authority_ref}` });
        } else {
          warnings.push({ sev:'warning',
            msg:`Stage mismatch: pipeline_state says "${pipeStage}" but WSM active_stage_id is "${wsmStage}"`,
            log:`AD-V2-05 | pipeline_state.stage_id=${pipeStage} vs WSM active_stage_id=${wsmStage} | Update pipeline_state.json or sync WSM` });
        }
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

// ── Background refresh — change-detection key ─────────────────────────────
// Render key captures every field that would cause a visible DOM change.
// If the key hasn't changed since last render, the banner is NOT touched.
let _lastRenderKey = null;

function _stateRenderKey(s) {
  if (!s) return '';
  return [
    s.current_gate,
    s.gate_state,
    s.last_updated,
    s.work_package_id,
    (s.work_plan         || '').length,
    (s.lld400_content    || '').length,
    (s.revision_notes    || '').length,
    (s.gates_completed   || []).join(','),
    (s.gates_failed      || []).join(','),
  ].join('|');
}

// ── Main load ─────────────────────────────────────────────────────────────
// Phase 1: pre-fetch state silently in background (zero DOM writes).
// Phase 2a (state changed): full re-render — pipeline advanced, new data available.
// Phase 2b (no change): passive update only — timestamp + event log. Banner untouched.
async function loadAll() {
  // ── Phase 1: background fetch ──────────────────────────────────────────
  let freshState;
  try {
    freshState = await loadDomainState(currentDomain);
  } catch(e) {
    console.error('[loadAll] background fetch failed:', e);
    return;
  }
  if (!freshState) return;

  const newKey = _stateRenderKey(freshState);
  const stateChanged = (newKey !== _lastRenderKey);

  if (stateChanged) {
    // ── Phase 2a: full render — state actually changed ─────────────────
    _lastRenderKey = newKey;
    const state = await loadPipelineState();   // fetches again + renders all DOM
    if (state) await loadPrompt(state.current_gate);
    await Promise.all([loadMandates(), checkExpectedFiles(), loadHealthWarnings()]);
  } else {
    // ── Phase 2b: passive update — only timestamp (safe, non-interactive) ─
    const lastEl = document.getElementById('last-updated');
    if (lastEl) {
      const base = '[' + (freshState.project_domain || currentDomain) + '] Last updated: ' +
        (freshState.last_updated ? new Date(freshState.last_updated).toLocaleTimeString() : 'unknown');
      lastEl.innerHTML = base +
        (stateFallbackMode ? ' <span class="legacy-fallback-badge">⚠ LEGACY_FALLBACK</span>' : '');
    }
  }

  // Event log always refreshes — it's append-only and never conflicts with user input
  if (typeof window.eventLogRefresh === 'function') window.eventLogRefresh();
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
    if (typeof closeCmdHelp === "function") closeCmdHelp();
  }
  if (e.key === "?" && !e.target.matches("input,textarea")) toggleHelp();
  if (e.key === "p" && !e.target.matches("input,textarea")) runProgressCheck();
});

// ── Init ──────────────────────────────────────────────────────────────────
// Always sync theme + UI to saved domain on load — prevents desync (AOS data + TikTrack skin)
syncDomainUIDashboard();

// Show Terminal Commands immediately (don't wait for async state load)
buildCommands(typeof pipelineState?.current_gate === "string" ? pipelineState.current_gate : "GATE_0");

loadAll();

// Auto-refresh ON by default — checkbox is pre-checked in HTML; start timer here.
(function() {
  const dot = document.getElementById("refresh-dot");
  if (dot) dot.style.display = "inline-block";
  refreshTimer = setInterval(loadAll, 5000);
})();