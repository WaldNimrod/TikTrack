/*
 * pipeline-monitor-core.js
 * Canonical shared runtime for AOS monitor surfaces.
 *
 * Canonical refs:
 * - S003-P011-WP002 LOD200 §2.3, §2.9, §2.10, §10
 * - PIPELINE_MONITOR_ARCHITECTURE_v1.1.0
 *
 * This file is intentionally read-only in behavior:
 * - no state mutations
 * - no pipeline command execution
 * - render-only from canonical files
 */

const MONITOR_DOMAINS = ["tiktrack", "agents_os"];
const MONITOR_EVENT_LOG_PATH = "../../_COMMUNICATION/agents_os/logs/pipeline_events.jsonl";
const MONITOR_PROGRAM_REGISTRY_PATH = "../../documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md";
const MONITOR_TRACKS = ["TRACK_FULL", "TRACK_FOCUSED"];

let monitorAutoTimer = null;
let monitorLastPayload = null;
let monitorTrackView = (localStorage.getItem("monitor_track_view") || "AUTO").toUpperCase();
let monitorPageMode = "live";
if (!["AUTO", "TRACK_FULL", "TRACK_FOCUSED"].includes(monitorTrackView)) {
  monitorTrackView = "AUTO";
}

function normalizeMonitorMode(mode) {
  const m = String(mode || "").toLowerCase();
  if (m === "constitution") return "constitution";
  return "live";
}

function setMonitorPageMode(mode) {
  monitorPageMode = normalizeMonitorMode(mode);
}

const TRACK_DOMAIN_HINT = {
  TRACK_FULL: "tiktrack",
  TRACK_FOCUSED: "agents_os",
};

function applyMonitorThemeFromDomain() {
  const domain = (localStorage.getItem("pipeline_domain") || "tiktrack").toLowerCase();
  const isTikTrack = domain === "tiktrack";
  document.documentElement.classList.toggle("theme-tiktrack", isTikTrack);
}

function toggleMonitorAccordion(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("open");
}

const PHASE_DEFINITIONS = [
  {
    gate: "GATE_0",
    phase: "0",
    label: "Scope validation — Team 190 (constitutional)",
    owners: { TRACK_FOCUSED: ["team_190"], TRACK_FULL: ["team_190"] },
    outputs: {
      BOTH: [{ sender: "team_190", recipient: "team_00", type: "VERDICT", includePhase: false }],
    },
  },
  {
    gate: "GATE_1",
    phase: "1.1",
    label: "LOD200 Intake",
    owners: { TRACK_FOCUSED: ["team_100"], TRACK_FULL: ["team_100"] },
    outputs: {
      BOTH: [{ sender: "team_100", recipient: "team_00", type: "REPORT" }],
    },
  },
  {
    gate: "GATE_1",
    phase: "1.2",
    label: "Program Registration",
    owners: { TRACK_FOCUSED: ["team_00"], TRACK_FULL: ["team_00"] },
    outputs: {
      BOTH: [{ sender: "team_00", type: "DECISIONS" }],
    },
  },
  {
    gate: "GATE_2",
    phase: "2.1",
    label: "LLD400 Authoring",
    owners: { TRACK_FOCUSED: ["team_170"], TRACK_FULL: ["team_170"] },
    outputs: {
      BOTH: [{ sender: "team_170", recipient: "team_190", type: "LLD400" }],
    },
  },
  {
    gate: "GATE_2",
    phase: "2.1v",
    label: "Constitutional Validation",
    owners: { TRACK_FOCUSED: ["team_190"], TRACK_FULL: ["team_190"] },
    outputs: {
      BOTH: [{ sender: "team_190", recipient: "team_170", type: "VERDICT" }],
    },
  },
  {
    gate: "GATE_2",
    phase: "2.2",
    label: "Work Plan Authoring",
    owners: { TRACK_FOCUSED: ["team_11"], TRACK_FULL: ["team_10"] },
    outputs: {
      TRACK_FOCUSED: [{ sender: "team_11", recipient: "team_90", type: "WORKPLAN" }],
      TRACK_FULL: [{ sender: "team_10", recipient: "team_90", type: "WORKPLAN" }],
    },
  },
  {
    gate: "GATE_2",
    phase: "2.2v",
    label: "Work Plan Review",
    owners: { TRACK_FOCUSED: ["team_90"], TRACK_FULL: ["team_90"] },
    outputs: {
      BOTH: [{ sender: "team_90", recipient: "lod200_author_team", type: "VERDICT" }],
    },
  },
  {
    gate: "GATE_2",
    phase: "2.3",
    label: "Architect Sign-off",
    owners: { TRACK_FOCUSED: ["lod200_author_team"], TRACK_FULL: ["lod200_author_team"] },
    outputs: {
      TRACK_FOCUSED: [{ sender: "lod200_author_team", recipient: "team_11", type: "REVIEW" }],
      TRACK_FULL: [{ sender: "lod200_author_team", recipient: "team_10", type: "REVIEW" }],
    },
  },
  {
    gate: "GATE_3",
    phase: "3.1",
    label: "Team Mandates",
    owners: { TRACK_FOCUSED: ["team_11"], TRACK_FULL: ["team_10"] },
    outputs: {
      TRACK_FOCUSED: [{ sender: "team_11", recipient: "team_61", type: "MANDATE" }],
      TRACK_FULL: [
        { sender: "team_10", recipient: "team_20", type: "MANDATE" },
        { sender: "team_10", recipient: "team_30", type: "MANDATE" },
        { sender: "team_10", recipient: "team_40", type: "MANDATE" },
      ],
    },
  },
  {
    gate: "GATE_3",
    phase: "3.2",
    label: "Implementation",
    owners: { TRACK_FOCUSED: ["team_61"], TRACK_FULL: ["team_20", "team_30", "team_40"] },
    outputs: {
      TRACK_FOCUSED: [{ sender: "team_61", recipient: "team_51", type: "REPORT" }],
      TRACK_FULL: [
        { sender: "team_20", recipient: "team_50", type: "REPORT" },
        { sender: "team_30", recipient: "team_50", type: "REPORT" },
        { sender: "team_40", recipient: "team_50", type: "REPORT" },
      ],
    },
  },
  {
    gate: "GATE_3",
    phase: "3.3",
    label: "QA Validation",
    owners: { TRACK_FOCUSED: ["team_51"], TRACK_FULL: ["team_50"] },
    outputs: {
      TRACK_FOCUSED: [{ sender: "team_51", recipient: "team_90", type: "VERDICT" }],
      TRACK_FULL: [{ sender: "team_50", recipient: "team_90", type: "VERDICT" }],
    },
  },
  {
    gate: "GATE_4",
    phase: "4.1",
    label: "Dev Validation",
    owners: { TRACK_FOCUSED: ["team_90"], TRACK_FULL: ["team_90"] },
    outputs: {
      BOTH: [{ sender: "team_90", recipient: "lod200_author_team", type: "VERDICT" }],
    },
  },
  {
    gate: "GATE_4",
    phase: "4.2",
    label: "Architectural Review",
    owners: { TRACK_FOCUSED: ["lod200_author_team"], TRACK_FULL: ["lod200_author_team"] },
    outputs: {
      BOTH: [{ sender: "lod200_author_team", recipient: "team_00", type: "REVIEW" }],
    },
  },
  {
    gate: "GATE_4",
    phase: "4.3",
    label: "Human Approval",
    owners: { TRACK_FOCUSED: ["team_00"], TRACK_FULL: ["team_00"] },
    outputs: {
      TRACK_FOCUSED: [{ sender: "team_00", recipient: "team_170", type: "DECISIONS" }],
      TRACK_FULL: [{ sender: "team_00", recipient: "team_70", type: "DECISIONS" }],
    },
  },
  {
    gate: "GATE_5",
    phase: "5.1",
    label: "AS_MADE / Closure",
    owners: { TRACK_FOCUSED: ["team_170"], TRACK_FULL: ["team_70"] },
    outputs: {
      TRACK_FOCUSED: [{ sender: "team_170", recipient: "team_90", type: "CLOSURE", includePhase: false }],
      TRACK_FULL: [{ sender: "team_70", recipient: "team_90", type: "CLOSURE", includePhase: false }],
    },
  },
  {
    gate: "GATE_5",
    phase: "5.2",
    label: "Lock Validation",
    owners: { TRACK_FOCUSED: ["team_90"], TRACK_FULL: ["team_90"] },
    outputs: {
      BOTH: [{ sender: "team_90", type: "VERDICT" }],
    },
  },
];

function monitorFmtTs(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString();
}

function monitorEsc(v) {
  return (typeof escHtml === "function") ? escHtml(v) : String(v || "");
}

function normalizeTrack(track) {
  const t = String(track || "").toUpperCase();
  if (t === "TRACK_FULL" || t === "TRACK_FOCUSED") return t;
  return "";
}

function inferTrack(domain, processVariant) {
  const explicit = normalizeTrack(processVariant);
  if (explicit) return explicit;
  const d = String(domain || "").toLowerCase();
  if (d.includes("agents")) return "TRACK_FOCUSED";
  if (d.includes("tiktrack")) return "TRACK_FULL";
  return "TRACK_FOCUSED";
}

function teamNumber(teamId) {
  const m = String(teamId || "").match(/team_(\d{1,3})/i);
  return m ? m[1] : "";
}

function teamLabel(teamId) {
  if (!teamId) return "—";
  if (teamId === "lod200_author_team") return "LOD200 Author Team";
  const n = teamNumber(teamId);
  return n ? `Team ${n}` : String(teamId);
}

function normalizeWpToken(workPackageId) {
  const wp = String(workPackageId || "").trim();
  if (/^S\d{3}-P\d{3}-WP\d{3}$/i.test(wp)) {
    return wp.toUpperCase().replace(/-/g, "_");
  }
  return "SXXX_PXXX_WPXXX";
}

function buildCanonicalFilename(spec) {
  const senderNum = teamNumber(spec.sender) || "XXX";
  const recipientNum = teamNumber(spec.recipient);
  const wpToken = spec.wpToken || "SXXX_PXXX_WPXXX";
  const gate = spec.gate || "GATE_X";
  const includePhase = spec.includePhase !== false;
  const phaseChunk = includePhase && spec.phase ? `_PHASE_${spec.phase}` : "";
  const recChunk = recipientNum ? `_TO_TEAM_${recipientNum}` : "";
  const type = spec.type || "REPORT";
  const version = spec.version || "v1.0.0";
  const ext = spec.ext || "md";
  return `TEAM_${senderNum}${recChunk}_${wpToken}_${gate}${phaseChunk}_${type}_${version}.${ext}`;
}

function resolveTeamRef(teamRef, ctx) {
  if (teamRef === "lod200_author_team") {
    return ctx?.lod200AuthorTeam || "team_100";
  }
  return teamRef;
}

function resolveOwnerList(phaseDef, track, ctx) {
  const list = (phaseDef.owners && phaseDef.owners[track]) || [];
  return list.map((t) => resolveTeamRef(t, ctx));
}

/** CON-004: GATE_2 / 2.2 TRACK_FOCUSED — TikTrack uses team_10 (compound key), AOS uses team_11; mirrors pipeline.py + phase_routing.json. */
function formatPhaseMapFocusedOwnersAuto(phaseDef, ctxFocused) {
  if (
    typeof getExpectedTeamForPhase === "function" &&
    phaseDef.gate === "GATE_2" &&
    phaseDef.phase === "2.2"
  ) {
    const tt = getExpectedTeamForPhase("GATE_2", "2.2", "TRACK_FOCUSED", "tiktrack");
    const aos = getExpectedTeamForPhase("GATE_2", "2.2", "TRACK_FOCUSED", "agents_os");
    return `${teamLabel(tt)} (TikTrack) · ${teamLabel(aos)} (Agents_OS)`;
  }
  return resolveOwnerList(phaseDef, "TRACK_FOCUSED", ctxFocused).map(teamLabel).join(", ");
}

function resolveOutputDefs(phaseDef, track) {
  const out = phaseDef.outputs || {};
  const defs = [];
  if (Array.isArray(out.BOTH)) defs.push(...out.BOTH);
  if (Array.isArray(out[track])) defs.push(...out[track]);
  return defs;
}

function trackContextFromSnapshots(snapshots, track) {
  const domainHint = TRACK_DOMAIN_HINT[track];
  const snap = snapshots.find((s) => s.domain === domainHint && s.ok);
  const st = snap?.state || {};

  const fallbackWp = track === "TRACK_FOCUSED" ? "S003-P011-WP002" : "S002-P002-WP001";
  const wpId = st.work_package_id && st.work_package_id !== "NONE" ? st.work_package_id : fallbackWp;

  return {
    track,
    domain: domainHint,
    wpId,
    wpToken: normalizeWpToken(wpId),
    lod200AuthorTeam: st.lod200_author_team || "team_100",
  };
}

function isProgramLiveStatus(status) {
  const s = String(status || "").toUpperCase();
  return ["ACTIVE", "PIPELINE", "HOLD", "FROZEN"].includes(s);
}

function parseMarkdownTableRows(text, requiredHeaders) {
  const lines = String(text || "").split(/\r?\n/);
  let header = null;
  const rows = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith("|")) continue;

    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());

    if (!header) {
      const lower = cells.map((c) => c.toLowerCase());
      const found = requiredHeaders.every((h) => lower.includes(h.toLowerCase()));
      if (found) header = cells;
      continue;
    }

    if (cells.every((c) => /^:?-{3,}:?$/.test(c))) continue;
    if (cells.length !== header.length) continue;

    const row = {};
    header.forEach((h, idx) => {
      const k = h.toLowerCase().replace(/\s+/g, "_");
      row[k] = cells[idx] || "";
    });
    rows.push(row);
  }

  return rows;
}

function applyTrackViewUi() {
  const badge = document.getElementById("track-view-badge");
  if (badge) badge.textContent = monitorTrackView;

  const buttons = document.querySelectorAll("#track-view-toolbar .track-view-btn");
  buttons.forEach((btn) => {
    const view = String(btn.getAttribute("data-track-view") || "").toUpperCase();
    btn.classList.toggle("active", view === monitorTrackView);
  });
}

function setMonitorTrackView(view) {
  const v = String(view || "").toUpperCase();
  if (!["AUTO", "TRACK_FULL", "TRACK_FOCUSED"].includes(v)) return;
  monitorTrackView = v;
  localStorage.setItem("monitor_track_view", monitorTrackView);
  applyTrackViewUi();

  if (monitorLastPayload) {
    renderAll(monitorLastPayload);
  }
}

async function loadDomainSnapshot(domain) {
  const path = DOMAIN_STATE_FILES[domain] || "";
  try {
    const state = await fetchJSON(path);
    const rawGate = state?.current_gate || "—";
    const canonicalGate = resolveCanonicalGate(rawGate);
    return {
      domain,
      path,
      ok: true,
      state,
      rawGate,
      canonicalGate,
      hasLegacyGate: rawGate !== canonicalGate,
    };
  } catch (e) {
    return {
      domain,
      path,
      ok: false,
      error: String(e?.message || e),
    };
  }
}

async function loadEventStream() {
  try {
    const txt = await fetchText(MONITOR_EVENT_LOG_PATH);
    if (!txt) {
      return { ok: false, path: MONITOR_EVENT_LOG_PATH, error: "empty or unreadable event stream", events: [], parseErrors: 0 };
    }

    const events = [];
    let parseErrors = 0;
    txt.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        events.push(JSON.parse(trimmed));
      } catch {
        parseErrors += 1;
      }
    });

    events.sort((a, b) => {
      const ta = new Date(a.timestamp || 0).getTime();
      const tb = new Date(b.timestamp || 0).getTime();
      return tb - ta;
    });

    return { ok: true, path: MONITOR_EVENT_LOG_PATH, events, parseErrors };
  } catch (e) {
    return {
      ok: false,
      path: MONITOR_EVENT_LOG_PATH,
      error: String(e?.message || e),
      events: [],
      parseErrors: 0,
    };
  }
}

async function loadProgramRegistry() {
  try {
    const text = await fetchText(MONITOR_PROGRAM_REGISTRY_PATH);
    if (!text) {
      return {
        ok: false,
        path: MONITOR_PROGRAM_REGISTRY_PATH,
        error: "empty or unreadable program registry",
        rows: [],
      };
    }

    const rows = parseMarkdownTableRows(text, [
      "stage_id",
      "program_id",
      "program_name",
      "domain",
      "status",
      "current_gate_mirror",
    ]);

    return {
      ok: true,
      path: MONITOR_PROGRAM_REGISTRY_PATH,
      rows,
    };
  } catch (e) {
    return {
      ok: false,
      path: MONITOR_PROGRAM_REGISTRY_PATH,
      error: String(e?.message || e),
      rows: [],
    };
  }
}

function renderSources(snapshots, eventStream, registry) {
  const el = document.getElementById("monitor-sources-content");
  const badge = document.getElementById("monitor-sources-badge");
  if (!el) return;

  let okCount = 0;
  const rows = [];

  snapshots.forEach((s) => {
    if (s.ok) {
      okCount += 1;
      rows.push(
        `<div class="monitor-source-row monitor-source-ok">🟢 ${monitorEsc(s.domain)} state<br><code>${monitorEsc(s.path)}</code></div>`
      );
    } else {
      rows.push(
        `<div class="monitor-source-row monitor-source-fail">🔴 ${monitorEsc(s.domain)} state read failed<br><code>${monitorEsc(s.path)}</code><br><code>${monitorEsc(s.error)}</code></div>`
      );
    }
  });

  if (eventStream.ok) {
    okCount += 1;
    const parseNote = eventStream.parseErrors
      ? ` · parse_errors=${eventStream.parseErrors}`
      : "";
    rows.push(
      `<div class="monitor-source-row monitor-source-ok">🟢 events stream (${eventStream.events.length})${parseNote}<br><code>${monitorEsc(eventStream.path)}</code></div>`
    );
  } else {
    rows.push(
      `<div class="monitor-source-row monitor-source-fail">🔴 events stream read failed<br><code>${monitorEsc(eventStream.path)}</code><br><code>${monitorEsc(eventStream.error)}</code></div>`
    );
  }

  if (registry.ok) {
    okCount += 1;
    rows.push(
      `<div class="monitor-source-row monitor-source-ok">🟢 program registry (${registry.rows.length} rows)<br><code>${monitorEsc(registry.path)}</code></div>`
    );
  } else {
    rows.push(
      `<div class="monitor-source-row monitor-source-fail">🔴 program registry read failed<br><code>${monitorEsc(registry.path)}</code><br><code>${monitorEsc(registry.error)}</code></div>`
    );
  }

  el.innerHTML = rows.join("");
  if (badge) badge.textContent = `${okCount}/4`;

  const prov = document.getElementById("monitor-provenance-badge");
  if (prov) {
    prov.textContent = `[live files: ${okCount}/4]`;
    prov.title = `${MONITOR_DOMAINS.length} states + events + registry`;
  }
}

function computeDomainStatus(gate, state) {
  if (!state) return "pending";
  if (state.current_gate === "COMPLETE") return "pass";
  return gateStatus(gate, state);
}

function renderRuntimeCards(snapshots) {
  const rtBadge = document.getElementById("monitor-runtime-badge");
  let okDomains = 0;

  snapshots.forEach((snap) => {
    const el = document.getElementById(`monitor-domain-${snap.domain}`);
    if (!el) return;

    if (!snap.ok) {
      el.innerHTML = `<div class="monitor-domain-title">${monitorEsc(snap.domain)}</div>
        <div class="monitor-source-fail">PRIMARY STATE READ FAILED</div>
        <div class="monitor-domain-subtle"><code>${monitorEsc(snap.path)}</code></div>
        <div class="monitor-domain-subtle"><code>${monitorEsc(snap.error)}</code></div>`;
      return;
    }

    okDomains += 1;
    const st = snap.state || {};
    const expectedTeam = getExpectedTeamForPhase(
      snap.canonicalGate,
      st.current_phase,
      st.process_variant || "",
      st.project_domain || snap.domain
    );
    const rawGateView = snap.hasLegacyGate
      ? `${monitorEsc(snap.rawGate)} <span class="monitor-legacy-pill">legacy→${monitorEsc(snap.canonicalGate)}</span>`
      : monitorEsc(snap.canonicalGate);
    const resolvedTrack = inferTrack(snap.domain, st.process_variant || "");

    el.innerHTML = `<div class="monitor-domain-title">${monitorEsc(snap.domain)}</div>
      <div class="monitor-domain-kv">
        <div class="k">Work Package</div><div class="v">${monitorEsc(st.work_package_id || "—")}</div>
        <div class="k">Current Gate</div><div class="v">${rawGateView}</div>
        <div class="k">Current Phase</div><div class="v">${monitorEsc(st.current_phase || "—")}</div>
        <div class="k">Gate State</div><div class="v">${monitorEsc(st.gate_state || "—")}</div>
        <div class="k">Process Variant</div><div class="v">${monitorEsc(st.process_variant || "—")}</div>
        <div class="k">Resolved Track</div><div class="v">${monitorEsc(resolvedTrack)}</div>
        <div class="k">Expected Team</div><div class="v">${monitorEsc(expectedTeam || "—")}</div>
        <div class="k">Remediation Cycles</div><div class="v">${monitorEsc(st.remediation_cycle_count ?? 0)}</div>
        <div class="k">Last Updated</div><div class="v">${monitorEsc(monitorFmtTs(st.last_updated))}</div>
      </div>
      <div class="monitor-domain-subtle">Source: <code>${monitorEsc(snap.path)}</code></div>`;
  });

  if (rtBadge) rtBadge.textContent = `${okDomains}/${MONITOR_DOMAINS.length} domains live`;
}

function renderGateMatrix(snapshots) {
  const el = document.getElementById("monitor-gate-matrix");
  const badge = document.getElementById("monitor-matrix-badge");
  if (!el) return;

  const byDomain = {};
  snapshots.forEach((s) => { byDomain[s.domain] = s; });

  let rows = "";
  GATE_SEQUENCE.forEach((gate) => {
    const tt = byDomain.tiktrack;
    const aos = byDomain.agents_os;
    const ttStatus = tt?.ok ? computeDomainStatus(gate, tt.state) : "pending";
    const aosStatus = aos?.ok ? computeDomainStatus(gate, aos.state) : "pending";
    const ttPill = tt?.ok
      ? `<span class="status-pill ${statusPillClass(ttStatus)}">${monitorEsc(statusLabel(ttStatus))}</span>`
      : `<span class="status-pill pill-fail">READ_FAIL</span>`;
    const aosPill = aos?.ok
      ? `<span class="status-pill ${statusPillClass(aosStatus)}">${monitorEsc(statusLabel(aosStatus))}</span>`
      : `<span class="status-pill pill-fail">READ_FAIL</span>`;

    rows += `<tr>
      <td><code>${monitorEsc(gate)}</code></td>
      <td>${ttPill}</td>
      <td>${aosPill}</td>
    </tr>`;
  });

  el.innerHTML = `<table class="monitor-table">
    <thead>
      <tr>
        <th>Gate</th>
        <th>TikTrack</th>
        <th>Agents_OS</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;

  if (badge) badge.textContent = `${GATE_SEQUENCE.length} gates`;
}

function renderPhaseMap(snapshots) {
  const el = document.getElementById("monitor-phase-map");
  if (!el) return;

  const ctxFocused = trackContextFromSnapshots(snapshots, "TRACK_FOCUSED");
  const ctxFull = trackContextFromSnapshots(snapshots, "TRACK_FULL");

  if (monitorTrackView === "AUTO") {
    const rows = PHASE_DEFINITIONS.map((p) => {
      const focusedOwners = formatPhaseMapFocusedOwnersAuto(p, ctxFocused);
      const fullOwners = resolveOwnerList(p, "TRACK_FULL", ctxFull).map(teamLabel).join(", ");
      return `<tr>
        <td><code>${monitorEsc(p.gate)}</code></td>
        <td><code>${monitorEsc(p.phase)}</code></td>
        <td>${monitorEsc(p.label)}</td>
        <td>${monitorEsc(focusedOwners)}</td>
        <td>${monitorEsc(fullOwners)}</td>
      </tr>`;
    }).join("");

    el.innerHTML = `<table class="monitor-table">
      <thead>
        <tr>
          <th>Gate</th>
          <th>Phase</th>
          <th>Step</th>
          <th>TRACK_FOCUSED Owner</th>
          <th>TRACK_FULL Owner</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
    return;
  }

  const ctx = monitorTrackView === "TRACK_FULL" ? ctxFull : ctxFocused;
  const rows = PHASE_DEFINITIONS.map((p) => {
    let owners;
    if (
      p.gate === "GATE_2" &&
      p.phase === "2.2" &&
      monitorTrackView === "TRACK_FOCUSED" &&
      typeof getExpectedTeamForPhase === "function"
    ) {
      const dom = (typeof localStorage !== "undefined" && localStorage.getItem("pipeline_domain")) || "tiktrack";
      const d = String(dom).toLowerCase().includes("tiktrack") ? "tiktrack" : "agents_os";
      owners = teamLabel(getExpectedTeamForPhase("GATE_2", "2.2", "TRACK_FOCUSED", d));
    } else {
      owners = resolveOwnerList(p, monitorTrackView, ctx).map(teamLabel).join(", ");
    }
    return `<tr>
      <td><code>${monitorEsc(p.gate)}</code></td>
      <td><code>${monitorEsc(p.phase)}</code></td>
      <td>${monitorEsc(p.label)}</td>
      <td>${monitorEsc(owners)}</td>
    </tr>`;
  }).join("");

  el.innerHTML = `<table class="monitor-table">
    <thead>
      <tr>
        <th>Gate</th>
        <th>Phase</th>
        <th>Step</th>
        <th>${monitorEsc(monitorTrackView)} Owner</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function buildOutputLinesForPhase(phaseDef, track, ctx) {
  const defs = resolveOutputDefs(phaseDef, track);
  return defs.map((def) => {
    const sender = resolveTeamRef(def.sender, ctx);
    const recipient = resolveTeamRef(def.recipient, ctx);
    const file = buildCanonicalFilename({
      sender,
      recipient,
      wpToken: ctx.wpToken,
      gate: phaseDef.gate,
      phase: phaseDef.phase,
      includePhase: def.includePhase !== false,
      type: def.type,
      version: def.version || "v1.0.0",
      ext: def.ext || "md",
    });
    const senderLabel = teamLabel(sender);
    const recipientLabel = recipient ? ` → ${teamLabel(recipient)}` : "";
    return {
      file,
      meta: `${senderLabel}${recipientLabel} · ${def.type}`,
    };
  });
}

function renderOutputCell(lines) {
  if (!lines.length) return '<div class="monitor-output-cell">—</div>';
  return lines.map((l) => `<div class="monitor-output-cell"><strong>${monitorEsc(l.meta)}</strong><br>${monitorEsc(l.file)}</div>`).join("");
}

function renderExpectedOutputs(snapshots) {
  const tableEl = document.getElementById("monitor-expected-outputs");
  const badge = document.getElementById("monitor-outputs-badge");
  const overallEl = document.getElementById("monitor-overall-output");
  if (!tableEl || !overallEl) return;

  const ctxFocused = trackContextFromSnapshots(snapshots, "TRACK_FOCUSED");
  const ctxFull = trackContextFromSnapshots(snapshots, "TRACK_FULL");

  if (monitorTrackView === "AUTO") {
    const rows = PHASE_DEFINITIONS.map((p) => {
      const outFocused = buildOutputLinesForPhase(p, "TRACK_FOCUSED", ctxFocused);
      const outFull = buildOutputLinesForPhase(p, "TRACK_FULL", ctxFull);
      return `<tr>
        <td><code>${monitorEsc(p.gate)}</code></td>
        <td><code>${monitorEsc(p.phase)}</code></td>
        <td>${renderOutputCell(outFocused)}</td>
        <td>${renderOutputCell(outFull)}</td>
      </tr>`;
    }).join("");

    tableEl.innerHTML = `<table class="monitor-table">
      <thead>
        <tr>
          <th>Gate</th>
          <th>Phase</th>
          <th>TRACK_FOCUSED Expected Outputs</th>
          <th>TRACK_FULL Expected Outputs</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

    const focusedAll = PHASE_DEFINITIONS.flatMap((p) => buildOutputLinesForPhase(p, "TRACK_FOCUSED", ctxFocused).map((x) => x.file));
    const fullAll = PHASE_DEFINITIONS.flatMap((p) => buildOutputLinesForPhase(p, "TRACK_FULL", ctxFull).map((x) => x.file));

    overallEl.innerHTML = `<div class="line"><strong>Overall Process Output Bundle — TRACK_FOCUSED (${focusedAll.length} files, ${monitorEsc(ctxFocused.wpToken)})</strong></div>
      ${focusedAll.map((f) => `<div class="line">${monitorEsc(f)}</div>`).join("")}
      <div class="line" style="margin-top:8px"><strong>Overall Process Output Bundle — TRACK_FULL (${fullAll.length} files, ${monitorEsc(ctxFull.wpToken)})</strong></div>
      ${fullAll.map((f) => `<div class="line">${monitorEsc(f)}</div>`).join("")}`;

    if (badge) badge.textContent = `${PHASE_DEFINITIONS.length} phases · dual track`;
    return;
  }

  const activeTrack = monitorTrackView;
  const ctx = activeTrack === "TRACK_FULL" ? ctxFull : ctxFocused;
  const rows = PHASE_DEFINITIONS.map((p) => {
    const lines = buildOutputLinesForPhase(p, activeTrack, ctx);
    return `<tr>
      <td><code>${monitorEsc(p.gate)}</code></td>
      <td><code>${monitorEsc(p.phase)}</code></td>
      <td>${renderOutputCell(lines)}</td>
    </tr>`;
  }).join("");

  tableEl.innerHTML = `<table class="monitor-table">
    <thead>
      <tr>
        <th>Gate</th>
        <th>Phase</th>
        <th>${monitorEsc(activeTrack)} Expected Outputs</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;

  const all = PHASE_DEFINITIONS.flatMap((p) => buildOutputLinesForPhase(p, activeTrack, ctx).map((x) => x.file));
  overallEl.innerHTML = `<div class="line"><strong>Overall Process Output Bundle — ${monitorEsc(activeTrack)} (${all.length} files, ${monitorEsc(ctx.wpToken)})</strong></div>
    ${all.map((f) => `<div class="line">${monitorEsc(f)}</div>`).join("")}`;

  if (badge) badge.textContent = `${PHASE_DEFINITIONS.length} phases · ${activeTrack}`;
}

function extractProgramWp(text) {
  const m = String(text || "").match(/active_work_package_id\s*=\s*([A-Za-z0-9\-]+)/i);
  if (!m) return "—";
  return m[1];
}

function normalizeProgramDomainKey(rawDomain) {
  const domainRaw = String(rawDomain || "").toLowerCase();
  if (domainRaw.includes("agents")) return "agents_os";
  if (domainRaw.includes("tiktrack")) return "tiktrack";
  return domainRaw;
}

function buildActiveProgramRows(registry, snapshots) {
  if (!registry?.ok) return [];
  const byDomain = {};
  snapshots.forEach((s) => {
    if (!s.ok) return;
    byDomain[s.domain] = s;
  });

  let rows = registry.rows
    .filter((r) => isProgramLiveStatus(r.status))
    .map((r) => {
      const domain = normalizeProgramDomainKey(r.domain);
      const snap = byDomain[domain];
      const variant = snap?.state?.process_variant || "";
      const track = inferTrack(domain, variant);
      const activeWp = extractProgramWp(r.current_gate_mirror || "");
      const runtimeWp = snap?.state?.work_package_id || "";
      const runtimeBound = Boolean(
        snap &&
        runtimeWp &&
        activeWp &&
        activeWp !== "—" &&
        runtimeWp === activeWp
      );
      const architectOwner = snap?.state?.lod200_author_team || "team_100";

      return {
        stage_id: r.stage_id || "—",
        program_id: r.program_id || "—",
        program_name: r.program_name || "—",
        domain: r.domain || "—",
        domain_key: domain,
        status: r.status || "—",
        current_gate_mirror: r.current_gate_mirror || "—",
        track,
        active_wp: activeWp,
        architect_owner: architectOwner,
        runtime_bound: runtimeBound,
        runtime_gate: runtimeBound ? (snap?.canonicalGate || "—") : "—",
        runtime_phase: runtimeBound ? (snap?.state?.current_phase || "—") : "—",
      };
    });

  if (monitorTrackView !== "AUTO") {
    rows = rows.filter((r) => r.track === monitorTrackView);
  }

  return rows;
}

function renderActivePrograms(registry, snapshots) {
  const el = document.getElementById("monitor-active-programs");
  if (!el) return;

  if (!registry.ok) {
    el.innerHTML = `<div class="monitor-source-fail">Program registry unavailable<br><code>${monitorEsc(registry.path)}</code><br><code>${monitorEsc(registry.error)}</code></div>`;
    return;
  }

  const rows = buildActiveProgramRows(registry, snapshots);

  if (!rows.length) {
    el.innerHTML = `<span class="loading">No active programs in view (${monitorEsc(monitorTrackView)})</span>`;
    return;
  }

  const body = rows.map((r) => `<tr>
    <td><code>${monitorEsc(r.stage_id)}</code></td>
    <td><code>${monitorEsc(r.program_id)}</code></td>
    <td>${monitorEsc(r.program_name)}</td>
    <td>${monitorEsc(r.domain)}</td>
    <td>${monitorEsc(r.status)}</td>
    <td><code>${monitorEsc(r.track)}</code></td>
    <td><code>${monitorEsc(teamLabel(r.architect_owner))}</code></td>
    <td><code>${monitorEsc(r.active_wp)}</code></td>
  </tr>`).join("");

  el.innerHTML = `<table class="monitor-table monitor-programs-table">
    <thead>
      <tr>
        <th>Stage</th>
        <th>Program</th>
        <th>Name</th>
        <th>Domain</th>
        <th>Status</th>
        <th>Track</th>
        <th>Architect Owner</th>
        <th>Active WP</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`;
}

function findPhase(gate, phase) {
  return PHASE_DEFINITIONS.find((p) => p.gate === gate && p.phase === phase);
}

function phaseOwnersByTrack(gate, phase, track, ctx) {
  const def = findPhase(gate, phase);
  if (!def) return [];
  return resolveOwnerList(def, track, ctx);
}

function renderResponsibilitySummary(snapshots) {
  const el = document.getElementById("monitor-responsibility-summary");
  if (!el) return;

  const ctxFocused = trackContextFromSnapshots(snapshots, "TRACK_FOCUSED");
  const ctxFull = trackContextFromSnapshots(snapshots, "TRACK_FULL");

  const gatewayFocused = phaseOwnersByTrack("GATE_2", "2.2", "TRACK_FOCUSED", ctxFocused).map(teamLabel).join(", ");
  const gatewayFull = phaseOwnersByTrack("GATE_2", "2.2", "TRACK_FULL", ctxFull).map(teamLabel).join(", ");
  const implFocused = phaseOwnersByTrack("GATE_3", "3.2", "TRACK_FOCUSED", ctxFocused).map(teamLabel).join(", ");
  const implFull = phaseOwnersByTrack("GATE_3", "3.2", "TRACK_FULL", ctxFull).map(teamLabel).join(", ");
  const qaFocused = phaseOwnersByTrack("GATE_3", "3.3", "TRACK_FOCUSED", ctxFocused).map(teamLabel).join(", ");
  const qaFull = phaseOwnersByTrack("GATE_3", "3.3", "TRACK_FULL", ctxFull).map(teamLabel).join(", ");
  const closureFocused = phaseOwnersByTrack("GATE_5", "5.1", "TRACK_FOCUSED", ctxFocused).map(teamLabel).join(", ");
  const closureFull = phaseOwnersByTrack("GATE_5", "5.1", "TRACK_FULL", ctxFull).map(teamLabel).join(", ");

  const rows = [
    {
      rule: "Architectural Authority",
      focused: `Team 100 (authority), Gate 4.2 reviewer: ${teamLabel(ctxFocused.lod200AuthorTeam)}`,
      full: `Team 100 (authority), Gate 4.2 reviewer: ${teamLabel(ctxFull.lod200AuthorTeam)}`,
    },
    {
      rule: "Gateway / Work Planning",
      focused: gatewayFocused,
      full: gatewayFull,
    },
    {
      rule: "Implementation Core",
      focused: implFocused,
      full: implFull,
    },
    {
      rule: "QA Ownership",
      focused: qaFocused,
      full: qaFull,
    },
    {
      rule: "Closure Ownership",
      focused: closureFocused,
      full: closureFull,
    },
    {
      rule: "Cross-Domain Invariants",
      focused: "Team 190 (constitutional), Team 90 (validation), Team 00 (human gate)",
      full: "Team 190 (constitutional), Team 90 (validation), Team 00 (human gate)",
    },
  ];

  const body = rows.map((r) => `<tr>
    <td>${monitorEsc(r.rule)}</td>
    <td>${monitorEsc(r.focused)}</td>
    <td>${monitorEsc(r.full)}</td>
  </tr>`).join("");

  el.innerHTML = `<table class="monitor-table">
    <thead>
      <tr>
        <th>Rule</th>
        <th>TRACK_FOCUSED</th>
        <th>TRACK_FULL</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`;
}

function renderProgramChains(registry, snapshots) {
  const el = document.getElementById("monitor-program-chains");
  if (!el) return;

  if (!registry.ok) {
    el.innerHTML = `<div class="monitor-source-fail">Program registry unavailable<br><code>${monitorEsc(registry.path)}</code><br><code>${monitorEsc(registry.error)}</code></div>`;
    return;
  }

  const rows = buildActiveProgramRows(registry, snapshots);
  if (!rows.length) {
    el.innerHTML = `<span class="loading">No active programs in view (${monitorEsc(monitorTrackView)})</span>`;
    return;
  }

  const items = rows.map((program) => {
    const ctx = {
      track: program.track,
      domain: program.domain_key,
      wpId: program.active_wp !== "—" ? program.active_wp : (program.runtime_bound ? program.active_wp : "UNKNOWN"),
      wpToken: normalizeWpToken(program.active_wp !== "—" ? program.active_wp : "SXXX-PXXX-WPXXX"),
      lod200AuthorTeam: program.architect_owner,
    };

    const impactedTeams = Array.from(new Set(
      PHASE_DEFINITIONS.flatMap((p) => resolveOwnerList(p, program.track, ctx))
    )).map(teamLabel);

    const chainRows = PHASE_DEFINITIONS.map((p) => {
      const owners = resolveOwnerList(p, program.track, ctx).map(teamLabel).join(", ");
      const outputs = resolveOutputDefs(p, program.track).map((o) => o.type).join(", ");
      const isCurrent = program.runtime_bound && program.runtime_gate === p.gate && program.runtime_phase === p.phase;
      const rowClass = isCurrent ? "monitor-chain-row-current" : "";
      const pointer = isCurrent ? "▶" : "";
      return `<tr class="${rowClass}">
        <td><code>${monitorEsc(p.gate)}</code></td>
        <td><code>${monitorEsc(p.phase)}</code></td>
        <td>${monitorEsc(owners)}</td>
        <td>${monitorEsc(outputs || "—")}</td>
        <td>${monitorEsc(pointer)}</td>
      </tr>`;
    }).join("");

    const runtimeNote = program.runtime_bound
      ? `Runtime pointer: ${program.runtime_gate}/${program.runtime_phase}`
      : "Runtime pointer: not bound to current domain state";

    return `<details class="monitor-chain-item">
      <summary>
        <strong>${monitorEsc(program.program_id)}</strong>
        · ${monitorEsc(program.program_name)}
        · <code>${monitorEsc(program.track)}</code>
        · Architect: ${monitorEsc(teamLabel(program.architect_owner))}
      </summary>
      <div class="monitor-chain-meta">${monitorEsc(runtimeNote)}</div>
      <div class="monitor-chain-meta">Impacted teams: ${monitorEsc(impactedTeams.join(", "))}</div>
      <table class="monitor-table monitor-chain-table">
        <thead>
          <tr>
            <th>Gate</th>
            <th>Phase</th>
            <th>Owner(s)</th>
            <th>Output Type(s)</th>
            <th>Now</th>
          </tr>
        </thead>
        <tbody>${chainRows}</tbody>
      </table>
    </details>`;
  }).join("");

  el.innerHTML = items;
}

function renderEventList(targetId, events, domain) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const filtered = events
    .filter((e) => e.domain === domain || e.domain === "global")
    .slice(0, 12);

  if (!filtered.length) {
    el.innerHTML = '<span class="loading">No events</span>';
    return;
  }

  el.innerHTML = filtered.map((e) => {
    const sev = monitorEsc(e.severity || "INFO");
    const gate = monitorEsc(e.gate || "—");
    const wp = monitorEsc(e.work_package_id || "—");
    return `<div class="monitor-event-row">
      <div class="monitor-event-meta">${monitorEsc(monitorFmtTs(e.timestamp))} · ${sev} · ${gate} · ${wp}</div>
      <div class="monitor-event-desc">${monitorEsc(e.event_type || "EVENT")} — ${monitorEsc(e.description || "")}</div>
    </div>`;
  }).join("");
}

function renderEvents(eventStream) {
  const badge = document.getElementById("monitor-events-badge");

  if (!eventStream.ok) {
    const errHtml = `<div class="monitor-source-fail">Event stream read failed<br><code>${monitorEsc(eventStream.path)}</code><br><code>${monitorEsc(eventStream.error)}</code></div>`;
    const a = document.getElementById("monitor-events-tiktrack");
    const b = document.getElementById("monitor-events-agents_os");
    if (a) a.innerHTML = errHtml;
    if (b) b.innerHTML = errHtml;
    if (badge) badge.textContent = "read failed";
    return;
  }

  renderEventList("monitor-events-tiktrack", eventStream.events, "tiktrack");
  renderEventList("monitor-events-agents_os", eventStream.events, "agents_os");
  if (badge) badge.textContent = `${eventStream.events.length} entries`;
}

function renderAlerts(snapshots, eventStream, registry) {
  const el = document.getElementById("monitor-alerts-content");
  const badge = document.getElementById("monitor-alerts-badge");
  if (!el) return;

  const alerts = [];

  snapshots.forEach((s) => {
    if (!s.ok) {
      alerts.push({ level: "warn", text: `${s.domain}: PRIMARY_STATE_READ_FAILED (${s.path})` });
      return;
    }
    if (s.hasLegacyGate) {
      alerts.push({ level: "warn", text: `${s.domain}: legacy gate id in state (${s.rawGate} → ${s.canonicalGate})` });
    }
  });

  const loaded = snapshots.filter((s) => s.ok);
  if (loaded.length === 2) {
    const [a, b] = loaded;
    const wpA = a.state?.work_package_id || "";
    const wpB = b.state?.work_package_id || "";
    if (wpA && wpB && wpA === wpB && wpA !== "NONE") {
      alerts.push({ level: "info", text: `Both domains point to same WP (${wpA}). Validate intentional shared execution.` });
    }
  }

  if (eventStream.ok) {
    const drift = eventStream.events
      .filter((e) => e.event_type === "DRIFT_DETECTED")
      .slice(0, 3);
    drift.forEach((d) => {
      const field = d.metadata?.field ? ` field=${d.metadata.field}` : "";
      alerts.push({
        level: "warn",
        text: `Drift detected (${d.domain}) at ${monitorFmtTs(d.timestamp)}${field}`,
      });
    });

    if (eventStream.parseErrors > 0) {
      alerts.push({ level: "info", text: `Event stream had ${eventStream.parseErrors} malformed lines.` });
    }
  } else {
    alerts.push({ level: "warn", text: `Event stream unavailable (${eventStream.path})` });
  }

  if (!registry.ok) {
    alerts.push({ level: "warn", text: `Program registry unavailable (${registry.path})` });
  }

  if (!alerts.length) {
    el.innerHTML = '<div class="monitor-alert-row monitor-source-ok">🟢 No active monitor alerts</div>';
    if (badge) badge.textContent = "0";
    return;
  }

  el.innerHTML = alerts.map((a) => {
    const cls = a.level === "warn" ? "monitor-alert-warn" : "monitor-alert-info";
    const icon = a.level === "warn" ? "⚠" : "ℹ";
    return `<div class="monitor-alert-row ${cls}">${icon} ${monitorEsc(a.text)}</div>`;
  }).join("");
  if (badge) badge.textContent = String(alerts.length);
}

function renderDomainDrilldown(snapshots) {
  const el = document.getElementById("monitor-phase-detail");
  const badge = document.getElementById("monitor-phase-detail-badge");
  if (!el) return;

  let cards = "";
  let activeDomains = 0;

  snapshots.forEach((snap) => {
    if (!snap.ok) {
      cards += `<div class="monitor-domain-card" style="margin-bottom:10px">
        <div class="monitor-domain-title">${monitorEsc(snap.domain)}</div>
        <div class="monitor-source-fail">State read failed: ${monitorEsc(snap.error)}</div>
      </div>`;
      return;
    }

    activeDomains++;
    const st = snap.state || {};
    const gate = snap.canonicalGate;
    const phase = st.current_phase || "";
    const track = inferTrack(snap.domain, st.process_variant || "");
    const ctx = {
      track,
      domain: snap.domain,
      wpId: st.work_package_id || "",
      wpToken: normalizeWpToken(st.work_package_id || ""),
      lod200AuthorTeam: st.lod200_author_team || "team_100",
    };

    const phaseDef = findPhase(gate, phase);
    const phaseLabel = phaseDef ? phaseDef.label : (phase ? "(phase not in map)" : "—");
    const owners = phaseDef ? resolveOwnerList(phaseDef, track, ctx).map(teamLabel).join(", ") : "—";
    const outputs = phaseDef ? buildOutputLinesForPhase(phaseDef, track, ctx) : [];

    const currentIdx = phaseDef ? PHASE_DEFINITIONS.indexOf(phaseDef) : -1;
    const nextDef = currentIdx >= 0 && currentIdx < PHASE_DEFINITIONS.length - 1
      ? PHASE_DEFINITIONS[currentIdx + 1] : null;
    const nextLabel = nextDef
      ? `${nextDef.gate} / ${nextDef.phase} — ${nextDef.label} (${resolveOwnerList(nextDef, track, ctx).map(teamLabel).join(", ")})`
      : "—";

    const outputHtml = outputs.length
      ? outputs.map((o) => `<div class="monitor-output-cell"><strong>${monitorEsc(o.meta)}</strong><br>${monitorEsc(o.file)}</div>`).join("")
      : '<div class="monitor-output-cell" style="color:var(--text-muted)">—</div>';

    // Cross-engine validation pair — show actor → validator (next phase) with engine compliance
    let xvalHtml = "";
    if (phaseDef && nextDef && typeof buildXvalPairHtml === "function") {
      const actorTeam = resolveOwnerList(phaseDef, track, ctx)[0] || "—";
      const validatorTeam = resolveOwnerList(nextDef, track, ctx)[0] || "—";
      // Resolve lod200 sentinel for engine lookup
      const resolvedActor = actorTeam === "lod200_author_team" ? (ctx.lod200AuthorTeam || "team_100") : actorTeam;
      const resolvedValidator = validatorTeam === "lod200_author_team" ? (ctx.lod200AuthorTeam || "team_100") : validatorTeam;
      xvalHtml = buildXvalPairHtml(
        resolvedActor,
        `${phaseDef.phase} ${phaseDef.label}`,
        resolvedValidator,
        `${nextDef.phase} ${nextDef.label}`
      );
    }

    const domCls = snap.domain === "tiktrack" ? "tiktrack" : "agentsos";
    cards += `<div class="monitor-domain-card ${domCls}" style="margin-bottom:12px">
      <div class="monitor-domain-title">${monitorEsc(snap.domain)}</div>
      <div class="monitor-domain-kv">
        <div class="k">Gate</div><div class="v">${monitorEsc(gate || "—")}</div>
        <div class="k">Phase</div><div class="v">${monitorEsc(phase || "—")}</div>
        <div class="k">Step</div><div class="v">${monitorEsc(phaseLabel)}</div>
        <div class="k">Track</div><div class="v">${monitorEsc(track)}</div>
        <div class="k">Owner(s)</div><div class="v">${monitorEsc(owners)}</div>
        <div class="k">Gate State</div><div class="v">${monitorEsc(st.gate_state || "OPEN")}</div>
        <div class="k">Next Phase</div><div class="v">${monitorEsc(nextLabel)}</div>
      </div>
      ${xvalHtml}
      <div class="monitor-domain-subtle" style="margin-top:6px;font-weight:600">Expected Outputs:</div>
      ${outputHtml}
    </div>`;
  });

  el.innerHTML = cards || '<span class="loading">No domain data</span>';
  if (badge) badge.textContent = `${activeDomains} domains`;
}

function renderFullDomainState(snapshots) {
  const el = document.getElementById("monitor-state-raw");
  if (!el) return;

  let cards = "";

  snapshots.forEach((snap) => {
    const domCls = snap.domain === "tiktrack" ? "tiktrack" : "agentsos";
    if (!snap.ok) {
      cards += `<div class="monitor-domain-card ${domCls}" style="margin-bottom:12px">
        <div class="monitor-domain-title">${monitorEsc(snap.domain)}</div>
        <div class="monitor-source-fail">State read failed: ${monitorEsc(snap.error)}</div>
      </div>`;
      return;
    }

    const st = snap.state || {};
    const fields = [
      ["pipe_run_id",           st.pipe_run_id],
      ["work_package_id",       st.work_package_id],
      ["stage_id",              st.stage_id],
      ["current_gate",          snap.canonicalGate + (snap.hasLegacyGate ? ` ⚠ raw: ${snap.rawGate}` : "")],
      ["current_phase",         st.current_phase],
      ["gate_state",            st.gate_state],
      ["process_variant",       st.process_variant],
      ["spec_path",             st.spec_path],
      ["lod200_author_team",    st.lod200_author_team],
      ["remediation_cycle_count", st.remediation_cycle_count ?? 0],
      ["last_updated",          monitorFmtTs(st.last_updated)],
      ["source_file",           snap.path],
    ];

    const kvRows = fields.map(([k, v]) => {
      if (v === undefined || v === null) return "";
      return `<div class="k">${monitorEsc(k)}</div><div class="v">${monitorEsc(String(v))}</div>`;
    }).join("");

    cards += `<div class="monitor-domain-card ${domCls}" style="margin-bottom:12px">
      <div class="monitor-domain-title">${monitorEsc(snap.domain)}</div>
      <div class="monitor-domain-kv">${kvRows}</div>
    </div>`;
  });

  el.innerHTML = cards || '<span class="loading">No state data</span>';
}

function renderAll(payload) {
  renderSources(payload.snapshots, payload.eventStream, payload.registry);
  renderAlerts(payload.snapshots, payload.eventStream, payload.registry);

  if (monitorPageMode === "live") {
    renderRuntimeCards(payload.snapshots);
    renderGateMatrix(payload.snapshots);
    renderActivePrograms(payload.registry, payload.snapshots);
    renderEvents(payload.eventStream);
    renderDomainDrilldown(payload.snapshots);
    renderFullDomainState(payload.snapshots);
    renderProgramChains(payload.registry, payload.snapshots);
    const chainsBadge = document.getElementById("monitor-chains-badge");
    if (chainsBadge) {
      const chainRows = buildActiveProgramRows(payload.registry, payload.snapshots);
      chainsBadge.textContent = `${chainRows.length} programs`;
    }
    return;
  }

  renderResponsibilitySummary(payload.snapshots);
  renderProgramChains(payload.registry, payload.snapshots);
  renderPhaseMap(payload.snapshots);
  renderExpectedOutputs(payload.snapshots);
}

async function loadMonitor() {
  const refreshBtn = document.getElementById("monitor-refresh-btn");
  const refreshLabel = document.getElementById("monitor-last-refresh");

  applyMonitorThemeFromDomain();

  if (refreshBtn) refreshBtn.disabled = true;
  try {
    const [snapshots, eventStream, registry] = await Promise.all([
      Promise.all(MONITOR_DOMAINS.map(loadDomainSnapshot)),
      loadEventStream(),
      loadProgramRegistry(),
    ]);

    const payload = { snapshots, eventStream, registry };
    monitorLastPayload = payload;
    renderAll(payload);

    if (refreshLabel) refreshLabel.textContent = `Last refresh: ${new Date().toLocaleTimeString()}`;
  } finally {
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

const MONITOR_DEFAULT_INTERVAL_S = 10;

function _monitorReadIntervalSec() {
  const input = document.getElementById("monitor-interval-input");
  const raw = parseInt(input?.value || "10", 10);
  return Math.max(3, Math.min(300, isNaN(raw) ? MONITOR_DEFAULT_INTERVAL_S : raw));
}

function monitorStartAutoRefresh() {
  if (monitorAutoTimer) {
    clearInterval(monitorAutoTimer);
    monitorAutoTimer = null;
  }
  const cb = document.getElementById("monitor-auto-refresh");
  if (cb && cb.checked) {
    const ms = _monitorReadIntervalSec() * 1000;
    monitorAutoTimer = setInterval(loadMonitor, ms);
  }
}

window.loadMonitor = loadMonitor;
window.setMonitorTrackView = setMonitorTrackView;
window.toggleMonitorAccordion = toggleMonitorAccordion;
window.setMonitorPageMode = setMonitorPageMode;
window.renderDomainDrilldown = renderDomainDrilldown;
window.renderFullDomainState = renderFullDomainState;

document.addEventListener("DOMContentLoaded", () => {
  const modeFromBody = document.body?.dataset?.monitorMode || "";
  setMonitorPageMode(modeFromBody || monitorPageMode);
  applyMonitorThemeFromDomain();
  applyTrackViewUi();

  // Restore saved interval
  const intervalInput = document.getElementById("monitor-interval-input");
  if (intervalInput) {
    const saved = parseInt(localStorage.getItem("monitor_refresh_interval") || "", 10);
    if (!isNaN(saved) && saved >= 3) intervalInput.value = String(saved);
    intervalInput.addEventListener("change", () => {
      const val = _monitorReadIntervalSec();
      intervalInput.value = String(val);
      localStorage.setItem("monitor_refresh_interval", String(val));
      monitorStartAutoRefresh();
    });
  }

  const cb = document.getElementById("monitor-auto-refresh");
  if (cb) cb.addEventListener("change", monitorStartAutoRefresh);
  window.addEventListener("storage", (ev) => {
    if (ev.key === "pipeline_domain") applyMonitorThemeFromDomain();
  });
  monitorStartAutoRefresh();
  loadMonitor();
});
