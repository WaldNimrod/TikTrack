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

    console.log('⚙️ System Management - Initializing...');

    // Initialize dashboard
    this.initializeDashboard();

    // Setup auto-refresh
    this.setupAutoRefresh();

    // Setup event listeners
    this.setupEventListeners();

    this.isInitialized = true;
    console.log('✅ System Management - Initialized successfully');
  }

  initializeDashboard() {
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
      this.refreshSystemHealth();
    }, 30000);
  }

  setupEventListeners() {
    // Log level filter
    const logLevelFilter = document.getElementById('log-level-filter');
    if (logLevelFilter) {
      logLevelFilter.addEventListener('change', () => {
        this.filterLogs();
      });
    }

    // Log search
    const logSearch = document.getElementById('log-search');
    if (logSearch) {
      logSearch.addEventListener('input', () => {
        this.filterLogs();
      });
    }
  }

  filterLogs() {
    const levelFilter = document.getElementById('log-level-filter')?.value || 'all';
    const searchTerm = document.getElementById('log-search')?.value || '';

    console.log('🔍 Filtering logs:', { level: levelFilter, search: searchTerm });
  }

  refreshSystemHealth() {
    console.log('🔄 Refreshing system health...');
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

