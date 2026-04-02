/* pipeline-fcp.js — S003-P011-WP001 BF-03 — FCP Panel (Finding Classification Prompt)
 * Visible when finding_type === "unclear". Lets operator select correct finding_type
 * and copy the fail command for terminal execution. */

const FCP_FINDING_TYPE_ENUM = [
  "PWA", "doc", "wording", "canonical_deviation",
  "code_fix_single", "code_fix_multi", "architectural",
  "scope_change", "unclear"
];

/** Build FCP panel HTML. Shown only when finding_type === "unclear". */
function buildFCPPanel(state) {
  const ft = (state.finding_type || "").trim();
  if (ft !== "unclear") return "";
  const df = (typeof getDomainFlag === "function" ? getDomainFlag() : "--domain agents_os ");
  const baseCmd = ("./pipeline_run.sh " + df).trim();
  const options = FCP_FINDING_TYPE_ENUM.map(v =>
    `<option value="${v}"${v === "unclear" ? " selected" : ""}>${v}</option>`
  ).join("");
  return `<div class="fcp-panel" id="fcp-panel" data-testid="fcp-panel">
    <div class="fcp-title">⚠️ FCP — Finding Classification Required</div>
    <div class="fcp-desc">finding_type is "unclear". Select the correct classification and run the fail command in your terminal.</div>
    <div class="fcp-row">
      <label for="fcp-finding-type-select">Finding type:</label>
      <select id="fcp-finding-type-select" class="fcp-finding-type-select">
        ${options}
      </select>
    </div>
    <div class="fcp-row">
      <code class="fcp-cmd-preview" id="fcp-cmd-preview">${baseCmd} fail --finding_type PWA "reason"</code>
      <button class="fcp-confirm btn btn-primary" id="fcp-confirm" onclick="fcpCopyCommand()">⎘ Copy command → terminal</button>
    </div>
  </div>`;
}

/** Update FCP command preview when select changes. */
function fcpUpdatePreview() {
  const sel = document.getElementById("fcp-finding-type-select");
  const prev = document.getElementById("fcp-cmd-preview");
  if (!sel || !prev) return;
  const ft = sel.value;
  const df = (typeof getDomainFlag === "function" ? getDomainFlag() : "--domain agents_os ");
  const baseCmd = ("./pipeline_run.sh " + df).trim();
  prev.textContent = `${baseCmd} fail --finding_type ${ft} "reason"`;
}

/** Copy the fail command to clipboard with selected finding_type. */
function fcpCopyCommand() {
  const sel = document.getElementById("fcp-finding-type-select");
  if (!sel) return;
  const ft = sel.value;
  const df = (typeof getDomainFlag === "function" ? getDomainFlag() : "--domain agents_os ");
  const baseCmd = ("./pipeline_run.sh " + df).trim();
  const cmd = `${baseCmd} fail --finding_type ${ft} "reason"`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cmd).then(() => {
      const btn = document.getElementById("fcp-confirm");
      if (btn) { btn.textContent = "✓ Copied"; setTimeout(() => { btn.textContent = "⎘ Copy command → terminal"; }, 1500); }
    });
  }
}
