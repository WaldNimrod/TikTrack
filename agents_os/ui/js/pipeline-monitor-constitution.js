/*
 * pipeline-monitor-constitution.js
 * Canonical mode selector for Constitution/Process map page.
 *
 * Canonical refs:
 * - S003-P011-WP002 LOD200 §2.3, §2.9, §10
 * - PIPELINE_MONITOR_ARCHITECTURE_v1.1.0 (split UI contract)
 */

if (typeof window.setMonitorPageMode === "function") {
  window.setMonitorPageMode("constitution");
}
