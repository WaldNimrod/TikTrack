/* pipeline-state.js — Team 61 AOUI LOD400 — state management + domain source (SPC-02) */

let pipelineState = null;
// G-04: support ?domain= query param for deep-linking; falls back to localStorage then "tiktrack"
const _qpDomain = new URLSearchParams(window.location.search).get("domain");
const _validDomains = ["tiktrack", "agents_os"];
let currentDomain = (_validDomains.includes(_qpDomain) ? _qpDomain : null)
  || localStorage.getItem("pipeline_domain")
  || "tiktrack";
if (_qpDomain && _validDomains.includes(_qpDomain)) {
  localStorage.setItem("pipeline_domain", _qpDomain);  // persist query-param selection
}
let stateFallbackMode = false;
/** CS-03: Set when primary domain state file fetch fails. NO fallback used. */
let primaryStateReadFailed = false;
let primaryStateReadFailedDetail = null;

// Apply theme on load
document.documentElement.classList.toggle("theme-tiktrack", currentDomain === "tiktrack");

/** Load domain-specific state. CS-03: On failure set PRIMARY_STATE_READ_FAILED; NO fallback. */
async function loadDomainState(domain) {
  primaryStateReadFailed = false;
  primaryStateReadFailedDetail = null;
  stateFallbackMode = false;
  const domainFile = DOMAIN_STATE_FILES[domain] || DOMAIN_STATE_FILES.tiktrack;
  try {
    const state = await fetchJSON(domainFile);
    pipelineState = state;
    window.pipelineState = state;
    return state;
  } catch (e) {
    primaryStateReadFailed = true;
    primaryStateReadFailedDetail = {
      domain,
      source_path: domainFile,
      error: String(e.message || e),
      timestamp: new Date().toISOString(),
    };
    pipelineState = null;
    window.pipelineState = null;
    throw e;
  }
}

/** Switch active domain and persist. Caller should call loadAll() after. */
function switchDomain(domain) {
  currentDomain = domain;
  localStorage.setItem("pipeline_domain", domain);
  document.documentElement.classList.toggle("theme-tiktrack", domain === "tiktrack");
}

function getDomainOwner(gateId) {
  const domainOwners = DOMAIN_GATE_OWNERS_JS[currentDomain] || {};
  return domainOwners[gateId] || (GATE_CONFIG[gateId] || {}).owner || "—";
}

function getDomainStateFile() {
  return DOMAIN_STATE_FILES[currentDomain] || DOMAIN_STATE_FILES.tiktrack;
}

function getDomainFlag() {
  // BUG-DOMAIN-02 fix (2026-03-19): Always include --domain flag explicitly.
  // Original logic returned "" for tiktrack (treating it as default), which caused
  // `./pipeline_run.sh pass` to fail when two domains are active — domain ambiguity.
  // Fix: always be explicit. Tiktrack is the CLI default but not the safety default.
  return `--domain ${currentDomain} `;
}

/** Inject the current domain flag into any ./pipeline_run.sh command string.
 *  BUG-DOMAIN-01: All dashboard command buttons must use this so that clicking
 *  "PASS" on agents_os domain does NOT advance the tiktrack pipeline.
 *  FIX-101-04: Also injects --wp / --gate / --phase when pipelineState is loaded (KB-84 strict).
 *  Usage: _dfCmd('./pipeline_run.sh pass') → './pipeline_run.sh --domain agents_os --wp … --gate … pass'
 */
function _dfCmd(cmd) {
  const df = getDomainFlag();
  if (!df) return cmd;
  let out = cmd.replace('./pipeline_run.sh ', `./pipeline_run.sh ${df}`);
  const st = typeof pipelineState !== "undefined" ? pipelineState : null;
  const wp = st && st.work_package_id;
  const gate = st && st.current_gate;
  const phase = st && st.current_phase && String(st.current_phase).trim();
  const needsIds =
    /\b(pass|fail|phase\d+|route)\s*$/.test(out.trim()) ||
    /\b(pass|fail|phase\d+|route)\s/.test(out);
  if (wp && gate && needsIds && !out.includes("--wp ") && !out.includes("--gate ")) {
    const kb = ` --wp ${wp} --gate ${gate}` + (phase ? ` --phase ${phase}` : "");
    out = out.replace(/(\.\/pipeline_run\.sh --domain \S+)/, `$1${kb}`);
  }
  return out;
}

/** KB-84: Precision pass — explicit WP + gate + phase validation flags.
 *  Full lock: WP ID + gate + phase must all match active state or the command is blocked.
 *  Usage: _precisionPassCmd('GATE_3', '3.3')
 *    → './pipeline_run.sh --domain tiktrack --wp S003-P013-WP001 --gate GATE_3 --phase 3.3 pass'
 *  WP is resolved from pipelineState at call time (always reflects current active WP).
 */
function _precisionPassCmd(gate, phase) {
  const df    = getDomainFlag();
  const wp    = (typeof pipelineState !== 'undefined' && pipelineState && pipelineState.work_package_id)
              ? pipelineState.work_package_id : null;
  const domainPart = df ? ` ${df}` : '';
  const wpPart     = wp    ? ` --wp ${wp}`      : '';
  const gatePart   = gate  ? ` --gate ${gate}`  : '';
  const phasePart  = phase ? ` --phase ${phase}` : '';
  return `./pipeline_run.sh${domainPart}${wpPart}${gatePart}${phasePart} pass`;
}

/** KB-84: Precision fail — WP + gate + phase + finding_type identifiers.
 *  Usage: _precisionFailCmd('GATE_5', '5.2', 'doc', 'CLOSURE-001: SSOT drift')
 *    → './pipeline_run.sh --domain tiktrack --wp S003-P013-WP001 --gate GATE_5 --phase 5.2 fail --finding_type doc "CLOSURE-001: ..."'
 */
function _precisionFailCmd(gate, phase, findingType, reason) {
  const df    = getDomainFlag();
  const wp    = (typeof pipelineState !== 'undefined' && pipelineState && pipelineState.work_package_id)
              ? pipelineState.work_package_id : null;
  const domainPart = df          ? ` ${df}`                      : '';
  const wpPart     = wp          ? ` --wp ${wp}`                 : '';
  const gatePart   = gate        ? ` --gate ${gate}`             : '';
  const phasePart  = phase       ? ` --phase ${phase}`           : '';
  const ftPart     = findingType ? ` --finding_type ${findingType}` : ' --finding_type doc';
  const safeReason = reason ? String(reason).replace(/"/g, "'") : 'reason';
  return `./pipeline_run.sh${domainPart}${wpPart}${gatePart}${phasePart} fail${ftPart} "${safeReason}"`;
}

/** KB-84: Precision route — WP + gate + phase + route type.
 *  Usage: _precisionRouteCmd('doc', 'GATE_5', '5.2')
 *    → './pipeline_run.sh --domain tiktrack --wp S003-P013-WP001 --gate GATE_5 --phase 5.2 route doc "notes"'
 */
function _precisionRouteCmd(type, gate, phase) {
  const df    = getDomainFlag();
  const wp    = (typeof pipelineState !== 'undefined' && pipelineState && pipelineState.work_package_id)
              ? pipelineState.work_package_id : null;
  const domainPart = df    ? ` ${df}`            : '';
  const wpPart     = wp    ? ` --wp ${wp}`       : '';
  const gatePart   = gate  ? ` --gate ${gate}`   : '';
  const phasePart  = phase ? ` --phase ${phase}` : '';
  const typePart   = type  ? ` ${type}`          : ' doc';
  return `./pipeline_run.sh${domainPart}${wpPart}${gatePart}${phasePart} route${typePart} "notes"`;
}

/** KB-84: Precision phase-N command — WP + gate + current-phase identifiers.
 *  Usage: _precisionPhaseNCmd(2, 'GATE_5', '5.1')
 *    → './pipeline_run.sh --domain tiktrack --wp S003-P013-WP001 --gate GATE_5 --phase 5.1 phase2'
 */
function _precisionPhaseNCmd(n, gate, phase) {
  const df    = getDomainFlag();
  const wp    = (typeof pipelineState !== 'undefined' && pipelineState && pipelineState.work_package_id)
              ? pipelineState.work_package_id : null;
  const domainPart = df    ? ` ${df}`            : '';
  const wpPart     = wp    ? ` --wp ${wp}`       : '';
  const gatePart   = gate  ? ` --gate ${gate}`   : '';
  const phasePart  = phase ? ` --phase ${phase}` : '';
  return `./pipeline_run.sh${domainPart}${wpPart}${gatePart}${phasePart} phase${n}`;
}

async function fetchJSON(path) {
  const r = await fetch(path + "?t=" + Date.now());
  if (!r.ok) throw new Error(r.status + " " + r.statusText);
  return r.json();
}

async function fetchText(path) {
  const r = await fetch(path + "?t=" + Date.now());
  return r.ok ? r.text() : null;
}

async function fileExists(path) {
  const r = await fetch(path + "?t=" + Date.now(), { method: "HEAD" }).catch(() => ({ ok: false }));
  return r.ok;
}
