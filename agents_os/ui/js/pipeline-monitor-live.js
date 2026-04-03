/*
 * pipeline-monitor-live.js
 * Canonical mode selector for Live Runtime page.
 *
 * Canonical refs:
 * - S003-P011-WP002 LOD200 §2.9, §2.10 (monitoring and gate visibility)
 * - PIPELINE_MONITOR_ARCHITECTURE_v1.1.0 (split UI contract)
 */

if (typeof window.setMonitorPageMode === "function") {
  window.setMonitorPageMode("live");
}
