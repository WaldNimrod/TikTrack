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
  const cfg = GATE_CONFIG[gate];
  if (cfg && cfg.engine === "human") return "human";
  return "pending";
}

function statusDotClass(s) {
  return { current: "dot-current", pass: "dot-pass", fail: "dot-fail", pending: "dot-pending", human: "dot-human" }[s] || "dot-pending";
}

function statusPillClass(s) {
  return { current: "pill-current", pass: "pill-pass", fail: "pill-fail", pending: "pill-pending", human: "pill-human" }[s] || "pill-pending";
}

function statusLabel(s) {
  return { current: "▶ ACTIVE", pass: "✓ PASS", fail: "✗ FAIL", pending: "pending", human: "⏸ HUMAN" }[s] || (s || "");
}
