/**
 * Alerts Page Config — D34 (MB3A)
 * --------------------------------------------------------
 * UAI Configuration for Alerts page
 * מקור: TEAM_20_TO_TEAM_30_MB3A_ALERTS_API_IMPLEMENTATION_COMPLETE
 */
window.UAI = window.UAI || {};
window.UAI.config = {
  pageType: 'alerts',
  requiresAuth: true,
  requiresHeader: true,
  dataLoader: '/src/views/data/alerts/alertsDataLoader.js',
  components: ['table', 'summary', 'pagination', 'actions'],
  tables: [{ id: 'alertsTable', type: 'alerts', pageSize: 25 }],
  summary: { enabled: true, toggleEnabled: true },
  metadata: { title: 'התראות', description: 'עמוד התראות', version: '1.0.0' },
};
