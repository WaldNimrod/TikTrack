/*
 * DEPRECATED COMPATIBILITY SHIM
 *
 * This file remains only for backward compatibility with old references.
 * Canonical implementation moved to:
 * - js/pipeline-monitor-core.js
 * - js/pipeline-monitor-live.js
 * - js/pipeline-monitor-constitution.js
 */

if (typeof window.setMonitorPageMode === "function") {
  window.setMonitorPageMode("live");
}
