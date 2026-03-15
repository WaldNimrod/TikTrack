/* pipeline-state.js — Team 61 AOUI LOD400 — state management + domain source (SPC-02) */

let pipelineState = null;
let currentDomain = localStorage.getItem("pipeline_domain") || "tiktrack";
let stateFallbackMode = false;

// Apply theme on load
document.documentElement.classList.toggle("theme-tiktrack", currentDomain === "tiktrack");

/** Try domain-specific file first; fallback to legacy, set stateFallbackMode = true */
async function loadDomainState(domain) {
  const domainFile = DOMAIN_STATE_FILES[domain] || LEGACY_STATE_FILE;
  try {
    const state = await fetchJSON(domainFile);
    stateFallbackMode = false;
    pipelineState = state;
    window.pipelineState = state;
    return state;
  } catch (e) {
    try {
      const state = await fetchJSON(LEGACY_STATE_FILE);
      stateFallbackMode = true;
      pipelineState = state;
      window.pipelineState = state;
      return state;
    } catch (e2) {
      stateFallbackMode = true;
      pipelineState = null;
      window.pipelineState = null;
      throw e2;
    }
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
  return DOMAIN_STATE_FILES[currentDomain] || LEGACY_STATE_FILE;
}

function getDomainFlag() {
  return currentDomain !== "tiktrack" ? `--domain ${currentDomain} ` : "";
}

/** Inject the current domain flag into any ./pipeline_run.sh command string.
 *  BUG-DOMAIN-01: All dashboard command buttons must use this so that clicking
 *  "PASS" on agents_os domain does NOT advance the tiktrack pipeline.
 *  Usage: _dfCmd('./pipeline_run.sh pass') → './pipeline_run.sh --domain agents_os pass'
 */
function _dfCmd(cmd) {
  const df = getDomainFlag();
  if (!df) return cmd;
  return cmd.replace('./pipeline_run.sh ', `./pipeline_run.sh ${df}`);
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
