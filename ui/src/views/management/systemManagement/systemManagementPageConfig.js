/**
 * System Management Page Config - UAI Configuration
 * --------------------------------------------------------
 * Configuration for System Management page (Rate-Limit & Scaling)
 * TEAM_10_TO_TEAM_30_RATELIMIT_SCALING_SETTINGS_MANDATE
 */

window.UAI = window.UAI || {};

window.UAI.config = {
  pageType: 'systemManagement',
  requiresAuth: true,
  requiresHeader: true,
  metadata: {
    title: 'ניהול מערכת',
    description: 'הגדרות מערכת — Rate-Limit & Scaling',
    version: '1.0.0',
  },
};
