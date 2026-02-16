/**
 * Alerts Page Config — D34 (MB3A)
 * --------------------------------------------------------
 * UAI Configuration for Alerts page
 * Scope Lock: No API yet — placeholder. Coordinate with API documentation when defined.
 */
window.UAI = window.UAI || {};
window.UAI.config = {
  pageType: 'alerts',
  requiresAuth: true,
  requiresHeader: true,
  components: ['table', 'summary', 'pagination', 'actions'],
  tables: [{ id: 'alertsTable', type: 'alerts', pageSize: 25 }],
  summary: { enabled: true, toggleEnabled: true },
  metadata: { title: 'התראות', description: 'עמוד התראות', version: '1.0.0' }
};
