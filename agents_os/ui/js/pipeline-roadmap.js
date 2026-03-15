/* pipeline-roadmap.js — Team 61 AOUI LOD400 — Roadmap & Gate History */
/* Depends: pipeline-config.js, pipeline-state.js, pipeline-dom.js */
/* Globals from config: GATE_SEQUENCE, GATE_CONFIG, CANONICAL_FILES, AUTHORIZED_STAGE_EXCEPTIONS */
/* Globals from state: pipelineState, currentDomain, stateFallbackMode, loadDomainState, switchDomain, fetchJSON, fetchText, fileExists */
/* Globals from dom: escHtml, escAttr, gateStatus, statusPillClass, statusLabel */

// ── State ──────────────────────────────────────────────────────────────────
let allPrograms = [];
let allStages = [];
let refreshTimer = null;

// ── Markdown table parser ──────────────────────────────────────────────────
function extractTable(mdText, firstColName) {
  const rows = [];
  const lines = mdText.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) { i++; continue; }
    const cols = line.split('|').slice(1, -1).map(c => c.trim());
    if (!cols.includes(firstColName)) { i++; continue; }
    let sepIdx = i + 1;
    while (sepIdx < lines.length && !lines[sepIdx].trim()) sepIdx++;
    if (sepIdx >= lines.length) { i++; continue; }
    const sep = lines[sepIdx].trim();
    if (!sep.startsWith('|')) { i++; continue; }
    const sepCols = sep.split('|').slice(1, -1).map(c => c.trim());
    if (!sepCols.every(c => /^[-: ]+$/.test(c))) { i++; continue; }
    const headers = cols;
    i = sepIdx + 1;
    while (i < lines.length) {
      const dline = lines[i].trim();
      if (!dline) { i++; continue; }
      if (!dline.startsWith('|')) break;
      const dcols = dline.split('|').slice(1, -1).map(c => c.trim());
      if (dcols.every(c => /^[-: ]*$/.test(c))) break;
      const row = {};
      headers.forEach((h, j) => { row[h] = dcols[j] !== undefined ? dcols[j] : ''; });
      rows.push(row);
      i++;
    }
    break;
  }
  return rows;
}

// ── Roadmap status helpers ─────────────────────────────────────────────────
function rmStatusClass(status) {
  const s = (status || '').toUpperCase();
  if (s.includes('ACTIVE')) return 'rm-s-active';
  if (s.includes('COMPLET') || s.includes('CLOSED')) return 'rm-s-complete';
  if (s.includes('DEFER')) return 'rm-s-deferred';
  if (s.includes('HOLD') || s.includes('FROZEN')) return 'rm-s-hold';
  return 'rm-s-planned';
}
function rmStatusLabel(status) {
  const s = (status || '').toUpperCase();
  if (s.includes('ACTIVE')) return 'ACTIVE';
  if (s.includes('COMPLET')) return 'COMPLETE';
  if (s.includes('CLOSED')) return 'CLOSED';
  if (s.includes('DEFER')) return 'DEFERRED';
  if (s.includes('HOLD')) return 'HOLD';
  if (s.includes('FROZEN')) return 'FROZEN';
  if (s.includes('PLANNED')) return 'PLANNED';
  return (status || '?').slice(0, 14);
}

// ── Header: WP | Gate | Stage (updates from selected program in map) ───────
function updateHeaderFromSelection(pid) {
  const headerSub = document.getElementById('header-sub');
  if (!headerSub) return;
  const badge = typeof stateFallbackMode !== 'undefined' && stateFallbackMode
    ? ' <span class="legacy-fallback-badge">⚠ LEGACY_FALLBACK</span>'
    : '';
  if (!pid) {
    const s = pipelineState;
    headerSub.innerHTML = `WP: ${escHtml(s?.work_package_id || '—')}  |  Gate: ${escHtml(s?.current_gate || '—')}  |  Stage: ${escHtml(s?.stage_id || '—')}${badge}`;
    return;
  }
  const prog = allPrograms.find(p => p['program_id'] === pid);
  const vs = makeVirtualState(pid);
  const wp = vs ? (vs.work_package_id || pid) : pid;
  const gate = vs?.current_gate || prog?.current_gate_mirror || '—';
  const stage = prog?.['stage_id'] || '—';
  headerSub.innerHTML = `WP: ${escHtml(wp)}  |  Gate: ${escHtml(gate)}  |  Stage: ${escHtml(stage)}${badge}`;
}

// ── Load pipeline state (domain-aware) ──────────────────────────────────────
async function loadPipelineState() {
  try {
    const state = await loadDomainState(currentDomain);
    pipelineState = state;
    updateHeaderFromSelection(null);
    return state;
  } catch (e) {
    const headerSub = document.getElementById('header-sub');
    if (headerSub) headerSub.textContent = '⚠ Could not load pipeline state';
    return null;
  }
}

// ── Program selector (hidden, used programmatically) ─────────────────────
function buildProgramSelector(programs, state) {
  const sel = document.getElementById('prog-select');
  if (!sel) return;
  const byStage = {};
  for (const p of programs) {
    const sid = p['stage_id'] || 'UNKNOWN';
    if (!byStage[sid]) byStage[sid] = [];
    byStage[sid].push(p);
  }
  let html = '<option value="">— All programs (overview) —</option>';
  for (const sid of Object.keys(byStage).sort()) {
    html += `<optgroup label="${escHtml(sid)}">`;
    for (const p of byStage[sid]) {
      const pid = p['program_id'];
      const name = (p['program_name'] || '').replace(/\*\*/g, '');
      html += `<option value="${escHtml(pid)}">${escHtml(pid)} — ${escHtml(name)}</option>`;
    }
    html += '</optgroup>';
  }
  sel.innerHTML = html;

  if (state && state.work_package_id) {
    const activeProg = state.work_package_id.replace(/-WP\d+.*$/, '');
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === activeProg) { sel.selectedIndex = i; break; }
    }
  }
}

// ── Load program detail into sidebar ───────────────────────────────────────
function loadProgramDetail(programId) {
  const sidebarEl = document.getElementById('prog-detail-sidebar') || document.getElementById('prog-detail');
  const contentEl = document.getElementById('prog-detail-content') || sidebarEl;
  if (!sidebarEl || !contentEl) return;

  const prog = allPrograms.find(p => p['program_id'] === programId);
  if (!prog) {
    clearProgramDetail();
    return;
  }

  const name = (prog['program_name'] || '—').replace(/\*\*/g, '');
  const domain = prog['domain'] || '—';
  const status = rmStatusLabel(prog['status']);
  const mirror = (prog['current_gate_mirror'] || '—').replace(/\*\*/g, '');
  const domCls = domain.includes('AGENTS') ? 'domain-agentsos' : 'domain-tiktrack';
  const isActive = pipelineState && (pipelineState.work_package_id || '').startsWith(programId);

  contentEl.innerHTML = `
    <div class="prog-detail-panel">
      <h3>${escHtml(programId)} — ${escHtml(name)}</h3>
      <div class="prog-detail-row">
        <span class="prog-detail-lbl">Domain:</span>
        <span class="prog-detail-val"><span class="rm-prog-domain ${domCls}">${escHtml(domain.replace(/_/g, ''))}</span></span>
      </div>
      <div class="prog-detail-row">
        <span class="prog-detail-lbl">Stage:</span>
        <span class="prog-detail-val">${escHtml(prog['stage_id'] || '—')}</span>
      </div>
      <div class="prog-detail-row">
        <span class="prog-detail-lbl">Status:</span>
        <span class="prog-detail-val"><span class="rm-status ${rmStatusClass(prog['status'])}">${status}</span></span>
      </div>
      ${isActive ? `<div class="prog-detail-row"><span class="prog-detail-lbl">⚡ Pipeline:</span><span class="prog-detail-val" style="color:var(--accent)">ACTIVE — WP: ${escHtml(pipelineState.work_package_id)}</span></div>` : ''}
      <div class="prog-gate-mirror">Gate mirror: ${escHtml(mirror)}</div>
    </div>`;
  sidebarEl.style.display = 'block';

  highlightRoadmapProgram(programId);
  const vs = makeVirtualState(programId);
  renderGateSequence(vs, programId);
  renderGateHistory(vs, programId);
  updateHeaderFromSelection(programId);
}

// ── Clear program detail (hide sidebar) ────────────────────────────────────
function clearProgramDetail() {
  const sidebarEl = document.getElementById('prog-detail-sidebar') || document.getElementById('prog-detail');
  if (sidebarEl) sidebarEl.style.display = 'none';
  highlightRoadmapProgram(null);
  renderGateSequence(pipelineState, null);
  renderGateHistory(pipelineState, null);
  updateHeaderFromSelection(null);
}

// ── Program selection handler ──────────────────────────────────────────────
function onProgSelect(pid) {
  if (!pid) {
    clearProgramDetail();
    return;
  }
  loadProgramDetail(pid);
}

function highlightRoadmapProgram(pid) {
  document.querySelectorAll('.rm-program').forEach(el => {
    el.classList.remove('rm-program-selected');
    if (pid && el.dataset.pid === pid) {
      el.classList.add('rm-program-selected');
      const stageEl = el.closest('.rm-stage');
      if (stageEl) stageEl.classList.add('rm-open');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// ── Virtual state for non-active programs ─────────────────────────────────
function makeVirtualState(pid) {
  if (!pid) return pipelineState;
  const activeWp = pipelineState ? (pipelineState.work_package_id || '') : '';
  const activeProg = activeWp ? activeWp.replace(/-WP\d+.*$/, '') : '';
  if (pid === activeProg) return Object.assign({}, pipelineState, { _isLive: true });

  const prog = allPrograms.find(p => p['program_id'] === pid);
  if (!prog) return { _isVirtual: true, work_package_id: pid, current_gate: null, gates_completed: [], gates_failed: [] };

  const status = rmStatusLabel(prog['status']);
  const isDone = (status === 'COMPLETE' || status === 'CLOSED');
  return {
    _isVirtual: true,
    _progStatus: status,
    work_package_id: pid,
    current_gate: null,
    gates_completed: isDone ? GATE_SEQUENCE.slice() : [],
    gates_failed: [],
  };
}

// ── Domain stats (sidebar cards) ──────────────────────────────────────────
function renderDomainStats(programs, state) {
  function domainStats(keyword) {
    const ps = programs.filter(p => (p['domain'] || '').includes(keyword));
    return {
      total: ps.length,
      complete: ps.filter(p => ['COMPLETE', 'CLOSED'].includes(rmStatusLabel(p['status']))).length,
      active: ps.filter(p => rmStatusLabel(p['status']) === 'ACTIVE').length,
      planned: ps.filter(p => rmStatusLabel(p['status']) === 'PLANNED').length,
      deferred: ps.filter(p => ['DEFERRED', 'HOLD', 'FROZEN'].includes(rmStatusLabel(p['status']))).length,
    };
  }

  function statsHtml(s, numClass) {
    return `<div class="stat-row">
      <div class="stat-item"><div class="stat-num ${numClass}">${s.total}</div><div class="stat-lbl">Total</div></div>
      <div class="stat-item"><div class="stat-num num-done">${s.complete}</div><div class="stat-lbl">Done</div></div>
      <div class="stat-item"><div class="stat-num num-actv">${s.active}</div><div class="stat-lbl">Active</div></div>
      <div class="stat-item"><div class="stat-num num-plan">${s.planned}</div><div class="stat-lbl">Planned</div></div>
      ${s.deferred ? `<div class="stat-item"><div class="stat-num" style="color:var(--warning)">${s.deferred}</div><div class="stat-lbl">Deferred</div></div>` : ''}
    </div>`;
  }

  const tt = domainStats('TIKTRACK');
  const aos = domainStats('AGENTS');
  const tot = { total: programs.length, complete: tt.complete + aos.complete, active: tt.active + aos.active, planned: tt.planned + aos.planned, deferred: tt.deferred + aos.deferred };

  const elTt = document.getElementById('stat-tiktrack');
  const elAos = document.getElementById('stat-agentsos');
  const elTot = document.getElementById('stat-total');
  if (elTt) elTt.innerHTML = `<div class="stat-domain-title"><span class="stat-dot stat-dot-tt"></span>TikTrack</div>${statsHtml(tt, 'num-tt')}`;
  if (elAos) elAos.innerHTML = `<div class="stat-domain-title"><span class="stat-dot stat-dot-aos"></span>Agents_OS</div>${statsHtml(aos, 'num-aos')}`;
  if (elTot) elTot.innerHTML = `<div class="stat-domain-title"><span class="stat-dot stat-dot-tot"></span>Portfolio Total</div>${statsHtml(tot, 'num-tot')}`;
}

// ── 3-state stage conflict check ──────────────────────────────────────────
/** @returns {{ type: 'OK'|'AUTHORIZED_EXCEPTION'|'CONFLICT_BLOCKING', items: Array, ref?: object }} */
function checkStageConflict(stages, programs, state) {
  const conflictEl = document.getElementById('conflict-warnings');
  const valEl = document.getElementById('val-content');
  const valBadge = document.getElementById('val-badge');
  const hierarchyErrors = [];
  const conflictItems = [];

  // Hierarchy validation: duplicate IDs, orphan programs
  const stageIds = stages.map(s => s['stage_id']).filter(Boolean);
  const progIds = programs.map(p => p['program_id']).filter(Boolean);
  stageIds.filter((id, i) => stageIds.indexOf(id) !== i).forEach(id => hierarchyErrors.push(`Duplicate stage ID: ${id}`));
  progIds.filter((id, i) => progIds.indexOf(id) !== i).forEach(id => hierarchyErrors.push(`Duplicate program ID: ${id}`));
  programs.filter(p => p['stage_id'] && !stageIds.includes(p['stage_id'])).forEach(p => hierarchyErrors.push(`Orphan program (invalid stage_id): ${p['program_id']}`));
  programs.filter(p => !p['stage_id']).forEach(p => hierarchyErrors.push(`Program missing stage_id: ${p['program_id']}`));

  if (hierarchyErrors.length) {
    const result = { type: 'CONFLICT_BLOCKING', items: hierarchyErrors, ref: { stages, programs } };
    renderConflictResult(conflictEl, valEl, valBadge, stages, programs, result);
    return result;
  }

  // Stage closure check: pipeline_state.stage_id → CLOSED/COMPLETE stage
  if (state && state.stage_id) {
    const pipeStage = state.stage_id;
    const stageEntry = stages.find(s => s['stage_id'] === pipeStage);
    if (stageEntry) {
      const sl = rmStatusLabel(stageEntry['status']);
      if (sl === 'CLOSED' || sl === 'COMPLETE') {
        const exception = typeof AUTHORIZED_STAGE_EXCEPTIONS !== 'undefined' ? AUTHORIZED_STAGE_EXCEPTIONS[pipeStage] : null;
        const item = {
          msg: `Pipeline stage_id "${pipeStage}" is marked ${sl} in roadmap — active programs must belong to the current open stage.`,
          log: `pipeline_state.stage_id=${pipeStage} | Roadmap stage status=${sl} | Rule: Stage is a milestone — one-directional.`,
        };
        if (exception) {
          conflictItems.push({ ...item, type: 'AUTHORIZED_EXCEPTION', ref: exception });
        } else {
          conflictItems.push({ ...item, type: 'CONFLICT_BLOCKING' });
        }
      }
    }
    if (state.work_package_id) {
      const activeProg = state.work_package_id.replace(/-WP\d+.*$/, '');
      const progEntry = programs.find(p => p['program_id'] === activeProg);
      if (progEntry && progEntry['stage_id'] !== pipeStage) {
        conflictItems.push({
          type: 'CONFLICT_BLOCKING',
          msg: `Active WP program "${activeProg}" belongs to stage "${progEntry['stage_id']}" but pipeline_state.stage_id is "${pipeStage}".`,
          log: `program_id=${activeProg} | program.stage_id=${progEntry['stage_id']} | pipeline.stage_id=${pipeStage} | Sync required.`,
        });
      }
    }
  }

  const hasException = conflictItems.some(c => c.type === 'AUTHORIZED_EXCEPTION');
  const hasBlocking = conflictItems.some(c => c.type === 'CONFLICT_BLOCKING');
  const resultType = hasBlocking ? 'CONFLICT_BLOCKING' : hasException ? 'AUTHORIZED_EXCEPTION' : 'OK';
  const result = { type: resultType, items: conflictItems, ref: { stages, programs } };

  renderConflictResult(conflictEl, valEl, valBadge, stages, programs, result);
  return result;
}

function renderConflictResult(conflictEl, valEl, valBadge, stages, programs, result) {
  const { items } = result;
  const hierarchyErrors = items.filter(i => typeof i === 'string');
  const stageConflicts = items.filter(i => typeof i === 'object' && i.msg);

  if (valEl && valBadge) {
    if (!hierarchyErrors.length) {
      valEl.innerHTML = `<div class="rm-val-ok">✅ ${stages.length} stages · ${programs.length} programs · 0 errors</div>`;
      valBadge.textContent = `${stages.length}S / ${programs.length}P ✅`;
    } else {
      valEl.innerHTML = hierarchyErrors.map(e => `<div class="rm-val-err">❌ ${escHtml(e)}</div>`).join('');
      valBadge.textContent = `${stages.length}S / ${programs.length}P ⚠️ ${hierarchyErrors.length} err`;
    }
  }

  if (!conflictEl || !stageConflicts.length) {
    if (conflictEl) conflictEl.style.display = 'none';
    return;
  }

  conflictEl.style.display = '';
  conflictEl.innerHTML = stageConflicts.map(it => {
    const bannerClass = it.type === 'AUTHORIZED_EXCEPTION' ? 'conflict-banner state-exception' : 'conflict-banner state-blocking';
    const title = it.type === 'AUTHORIZED_EXCEPTION' ? '⚠️ Authorized Exception' : '⚠️ Stage/Program Conflict';
    return `<div class="${bannerClass}">
      <strong>${escHtml(title)}</strong>
      ${escHtml(it.msg)}
      ${it.log ? `<div class="log-line">${escHtml(it.log)}</div>` : ''}
    </div>`;
  }).join('');
}

// ── Roadmap tree ──────────────────────────────────────────────────────────
function renderRoadmapTree(stages, programs, state) {
  const treeEl = document.getElementById('roadmap-tree');
  if (!treeEl) return;

  const activeWp = state ? (state.work_package_id || '') : '';
  const activeProg = activeWp ? activeWp.replace(/-WP\d+.*$/, '') : '';

  let html = '';
  for (const stage of stages) {
    const sid = stage['stage_id'];
    if (!sid) continue;
    const progs = programs.filter(p => p['stage_id'] === sid);
    const isActiveStage = progs.some(p => p['program_id'] === activeProg);
    const ssc = rmStatusClass(stage['status']);
    const ssl = rmStatusLabel(stage['status']);
    const shouldOpen = isActiveStage || ssl === 'ACTIVE' || ssl === 'COMPLETE';

    html += `<div class="rm-stage${shouldOpen ? ' rm-stage-active rm-open' : ''}">
      <div class="rm-stage-header" onclick="this.parentElement.classList.toggle('rm-open')">
        <span class="rm-chevron">▶</span>
        <span class="rm-stage-id">${escHtml(sid)}</span>
        <span class="rm-stage-name">${escHtml((stage['stage_name'] || '').replace(/\*\*/g, ''))}</span>
        <span class="rm-status ${ssc}">${ssl}</span>
        <span style="font-size:10px;color:var(--text-muted);margin-left:4px">${progs.length}p</span>
      </div>
      <div class="rm-programs">`;

    if (!progs.length) {
      html += `<div style="font-size:11px;color:var(--text-muted);font-style:italic">No programs registered yet</div>`;
    } else {
      for (const prog of progs) {
        const pid = prog['program_id'];
        const isActive = pid === activeProg;
        const domain = (prog['domain'] || '').replace(/[^A-Z_]/g, '');
        const domCls = domain.includes('AGENTS') ? 'domain-agentsos' : 'domain-tiktrack';
        const domShort = domain.includes('AGENTS') ? 'AOS' : 'TT';
        const psc = rmStatusClass(prog['status']);
        const psl = rmStatusLabel(prog['status']);
        html += `<div class="rm-program${isActive ? ' rm-program-active' : ''}" data-pid="${escAttr(pid)}"
          onclick="document.getElementById('prog-select').value='${escAttr(pid)}';onProgSelect('${escAttr(pid)}')">
          <span style="font-size:9px;color:${isActive ? 'var(--accent)' : 'transparent'};width:10px">▶</span>
          <span class="rm-prog-id">${escHtml(pid)}</span>
          <span class="rm-prog-name">${escHtml((prog['program_name'] || '').replace(/\*\*/g, ''))}</span>
          <span class="rm-prog-domain ${domCls}">${domShort}</span>
          <span class="rm-status ${psc}">${psl}</span>
        </div>`;
      }
    }
    html += `</div></div>`;
  }

  const badge = document.getElementById('roadmap-badge');
  if (badge) badge.textContent = `${stages.length}S / ${programs.length}P`;
  treeEl.innerHTML = html;
}

// ── Gate full sequence table ───────────────────────────────────────────────
function renderGateSequence(state, forPid) {
  const el = document.getElementById('gate-seq-content');
  if (!el) return;
  const liveTag = (state && state._isLive) ? ' 🟢' : '';
  const virtTag = (state && state._isVirtual) ? ` · ${state._progStatus || 'virtual'}` : '';
  const seqBadge = document.getElementById('seq-badge');
  if (seqBadge) seqBadge.textContent = `${GATE_SEQUENCE.length} gates${forPid ? ' — ' + forPid : ''}${liveTag || virtTag}`;
  const current = state ? state.current_gate : null;

  let html = `<table class="gate-seq-table">
    <thead><tr><th>#</th><th>Gate</th><th>Owner</th><th>Engine</th><th>Status</th></tr></thead><tbody>`;

  GATE_SEQUENCE.forEach((g, i) => {
    const cfg = GATE_CONFIG[g] || {};
    const s = gateStatus(g, state);
    const isCur = g === current;
    const icon = s === 'pass' ? '✓' : s === 'fail' ? '✗' : s === 'current' ? '▶' : s === 'human' ? '⏸' : '○';
    const color = s === 'pass' ? 'var(--success)' : s === 'fail' ? 'var(--danger)' : s === 'current' ? 'var(--accent)' : s === 'human' ? 'var(--warning)' : 'var(--text-muted)';
    const decisionMark = cfg.twoPaths ? '<span class="decision-marker" title="Decision gate: PASS/FAIL">⬢</span>' : '';
    html += `<tr${isCur ? ' class="gate-current"' : ''}>
      <td style="color:var(--text-muted);font-size:10px">${i + 1}</td>
      <td class="gate-name-cell" style="color:${color}"><span style="margin-right:4px">${icon}</span>${escHtml(g)}${decisionMark}</td>
      <td style="font-size:10px;color:var(--text-muted)">${escHtml(cfg.owner || '—')}</td>
      <td style="font-size:10px;color:var(--text-muted)">${escHtml(cfg.engine || '—')}</td>
      <td><span class="status-pill ${statusPillClass(s)}">${statusLabel(s)}</span></td>
    </tr>`;
  });
  html += `</tbody></table>`;
  el.innerHTML = html;
}

// ── Gate history ───────────────────────────────────────────────────────────
function renderGateHistory(state, forPid) {
  const el = document.getElementById('history-content');
  if (!el) return;
  if (!state) {
    el.innerHTML = '<span class="loading">No state loaded</span>';
    return;
  }

  const completed = state.gates_completed || [];
  const failed = state.gates_failed || [];
  const failCounts = {};
  for (const g of failed) failCounts[g] = (failCounts[g] || 0) + 1;

  const historyBadge = document.getElementById('history-badge');
  if (historyBadge) historyBadge.textContent = `${completed.length} passed${Object.keys(failCounts).length ? ' · ' + Object.keys(failCounts).length + ' had fails' : ''}${forPid ? ' — ' + forPid : ''}`;

  if (!completed.length && !Object.keys(failCounts).length) {
    el.innerHTML = '<span class="loading">No gate history yet</span>';
    return;
  }

  const history = GATE_SEQUENCE
    .filter(g => completed.includes(g) || failed.includes(g))
    .map(g => ({ gate: g, passed: completed.includes(g), failCnt: failCounts[g] || 0 }));

  el.innerHTML = `<ul class="gate-history-list">` +
    history.map((h, i) => `<li class="history-item">
      <span style="font-size:10px;color:var(--text-muted);min-width:18px">${i + 1}</span>
      <span class="status-pill ${h.passed ? 'pill-pass' : 'pill-fail'}">${h.passed ? '✓ PASS' : '✗ FAIL'}</span>
      <span class="history-gate">${escHtml(h.gate)}</span>
      ${h.failCnt ? `<span class="fail-cycle-tag">▲${h.failCnt}× fail</span>` : ''}
    </li>`).join('') + `</ul>`;
}

// ── Canonical task files (sidebar) ────────────────────────────────────────
async function loadCanonicalFiles() {
  const el = document.getElementById('cf-content');
  const badge = document.getElementById('cf-badge');
  if (!el) return;

  const results = await Promise.all(CANONICAL_FILES.map(async f => ({ ...f, exists: await fileExists(f.path) })));
  const found = results.filter(r => r.exists).length;
  if (badge) badge.textContent = `${found}/${results.length}`;

  el.innerHTML = results.map(f => `<div class="cf-row">
    <span>${f.exists ? '🟢' : '🔴'}</span>
    <a href="#"
       onclick="openFileViewer(${escAttr(JSON.stringify(f.path))},${escAttr(JSON.stringify(f.label))});return false;"
       title="${escAttr(f.path)}">${escHtml(f.label)}</a>
  </div>`).join('');
}

// ── Main load ──────────────────────────────────────────────────────────────
async function loadAll() {
  const state = await loadPipelineState();

  let roadmapText = '';
  let registryText = '';
  try {
    const [r1, r2] = await Promise.all([
      fetch('../../documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md?t=' + Date.now()),
      fetch('../../documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md?t=' + Date.now()),
    ]);
    if (!r1.ok || !r2.ok) throw new Error('fetch');
    [roadmapText, registryText] = await Promise.all([r1.text(), r2.text()]);
  } catch (e) {
    const treeEl = document.getElementById('roadmap-tree');
    if (treeEl) treeEl.innerHTML = '<div class="error-msg">❌ Cannot load roadmap files — is the HTTP server running?<br><code style="font-size:10px">python3 -m http.server 8090</code></div>';
    renderGateSequence(state, null);
    renderGateHistory(state, null);
    await loadCanonicalFiles();
    return;
  }

  const stages = extractTable(roadmapText, 'stage_id');
  const programs = extractTable(registryText, 'program_id');
  allStages = stages;
  allPrograms = programs;

  renderDomainStats(programs, state);
  checkStageConflict(stages, programs, state);
  buildProgramSelector(programs, state);
  renderRoadmapTree(stages, programs, state);
  renderGateSequence(state, null);
  renderGateHistory(state, null);

  const selEl = document.getElementById('prog-select');
  if (selEl && selEl.value) onProgSelect(selEl.value);

  await loadCanonicalFiles();
}

// ── Inline file viewer ─────────────────────────────────────────────────────
async function openFileViewer(path, label) {
  const modal = document.getElementById('file-viewer-modal');
  const titleEl = document.getElementById('fv-title');
  const pathEl = document.getElementById('fv-path');
  const preEl = document.getElementById('fv-content');
  if (!modal || !titleEl || !pathEl || !preEl) return;
  titleEl.textContent = label;
  pathEl.textContent = path;
  preEl.textContent = 'Loading…';
  modal.style.display = 'block';
  const text = await fetchText(path);
  preEl.textContent = text || '❌ Could not load file.\nIs the HTTP server running?\n  python3 -m http.server 8090';
}

function closeFileViewer() {
  const modal = document.getElementById('file-viewer-modal');
  if (modal) modal.style.display = 'none';
}

/** Sync UI — Roadmap uses light mode + no domain selector (general-info page) */
function syncDomainUIRoadmap(domain) {
  document.documentElement.classList.add('theme-tiktrack');
}

function onDomainSwitchRoadmap(domain) {
  switchDomain(domain);
  syncDomainUIRoadmap(domain);
  loadAll();
}

// ── Init ───────────────────────────────────────────────────────────────────
(function init() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeFileViewer();
  });

  const autoRefresh = document.getElementById('auto-refresh');
  const refreshDot = document.getElementById('refresh-dot');
  if (autoRefresh) {
    autoRefresh.addEventListener('change', function () {
      if (this.checked) {
        if (refreshDot) refreshDot.style.display = 'inline-block';
        refreshTimer = setInterval(loadAll, 5000);
      } else {
        if (refreshDot) refreshDot.style.display = 'none';
        clearInterval(refreshTimer);
      }
    });
  }

  syncDomainUIRoadmap();
  loadAll();
})();
