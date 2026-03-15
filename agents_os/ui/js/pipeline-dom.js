/* pipeline-dom.js — Team 61 AOUI LOD400 — rendering utilities (shared between Dashboard and Roadmap) */

function escHtml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escAttr(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function gateStatus(gate, state) {
  if (!state) return "pending";
  if (state.current_gate === gate) return "current";
  if ((state.gates_completed || []).includes(gate)) return "pass";
  if ((state.gates_failed || []).includes(gate)) return "fail";

  // Auto-infer "skipped" — gate was legitimately bypassed if the active/completed
  // gate is later in the sequence. Handles intermediate pseudo-gates like
  // WAITING_GATE2_APPROVAL, G3_PLAN, G3_5, G3_6_MANDATES, CURSOR_IMPLEMENTATION,
  // G5_DOC_FIX, WAITING_GATE6_APPROVAL when they are not explicitly recorded.
  const gateIdx = GATE_SEQUENCE.indexOf(gate);
  if (gateIdx >= 0) {
    const currIdx = GATE_SEQUENCE.indexOf(state.current_gate || '');
    if (currIdx > gateIdx) return "skipped";
    const laterDone = (state.gates_completed || []).some(
      g => GATE_SEQUENCE.indexOf(g) > gateIdx
    );
    if (laterDone) return "skipped";
  }

  const cfg = GATE_CONFIG[gate];
  if (cfg && cfg.engine === "human") return "human";
  return "pending";
}

function statusDotClass(s) {
  return { current: "dot-current", pass: "dot-pass", fail: "dot-fail", pending: "dot-pending", human: "dot-human", skipped: "dot-skipped" }[s] || "dot-pending";
}

function statusPillClass(s) {
  return { current: "pill-current", pass: "pill-pass", fail: "pill-fail", pending: "pill-pending", human: "pill-human", skipped: "pill-skipped" }[s] || "pill-pending";
}

function statusLabel(s) {
  return { current: "▶ ACTIVE", pass: "✓ PASS", fail: "✗ FAIL", pending: "pending", human: "⏸ HUMAN", skipped: "↷ skipped" }[s] || (s || "");
}
