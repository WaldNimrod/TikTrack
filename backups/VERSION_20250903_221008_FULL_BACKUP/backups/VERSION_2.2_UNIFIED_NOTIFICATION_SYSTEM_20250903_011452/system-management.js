/**
 * System Management - TikTrack
 * ============================
 *
 * System management dashboard for monitoring and administration
 *
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated September 2, 2025
 */

class SystemManagement {
  constructor() {
    this.isInitialized = false;
    this.refreshInterval = null;
  }

  init() {
    if (this.isInitialized) {
      return;
    }

    // System Management - Initializing...

    // Initialize dashboard
    SystemManagement.initializeDashboard();

    // Setup auto-refresh
    this.setupAutoRefresh();

    // Setup event listeners
    SystemManagement.setupEventListeners();

    this.isInitialized = true;
    // System Management - Initialized successfully
  }

  static initializeDashboard() {
    // Initialize header system
    if (window.headerSystem) {
      window.headerSystem.init();
    }

    // Set page title
    document.title = 'מנהל מערכת - TikTrack';
  }

  setupAutoRefresh() {
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      SystemManagement.refreshSystemHealth();
    }, 30000);
  }

  static setupEventListeners() {
    // Log level filter
    const logLevelFilter = document.getElementById('log-level-filter');
    if (logLevelFilter) {
      logLevelFilter.addEventListener('change', () => {
        SystemManagement.filterLogs();
      });
    }

    // Log search
    const logSearch = document.getElementById('log-search');
    if (logSearch) {
      logSearch.addEventListener('input', () => {
        SystemManagement.filterLogs();
      });
    }
  }

  static filterLogs() {
    // Filtering logs with level and search term
    // Implementation will be added when log filtering functionality is needed
  }

  static refreshSystemHealth() {
    // Refreshing system health...
    // Implementation for refreshing system health
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.isInitialized = false;
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.systemManagement = new SystemManagement();
  window.systemManagement.init();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.systemManagement) {
    window.systemManagement.destroy();
  }
});

