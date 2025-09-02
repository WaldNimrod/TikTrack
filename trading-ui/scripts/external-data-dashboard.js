/**
 * External Data Dashboard - TikTrack
 * ===================================
 *
 * Dashboard for managing external data integration system
 *
 * Features:
 * - System status monitoring
 * - Provider management
 * - Cache management
 * - Data management
 * - System settings
 * - Logs and monitoring
 *
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated September 2, 2025
 */

class ExternalDataDashboard {
  constructor() {
    this.isInitialized = false;
    this.refreshInterval = null;
    this.providers = [];
    this.cacheStats = null;
  }

  init() {
    if (this.isInitialized) {
      return;
    }

    console.log('🚀 External Data Dashboard - Initializing...');

    // Initialize dashboard
    this.initializeDashboard();

    // Load initial data
    this.loadSystemStatus();
    this.loadProviders();
    this.loadCacheStats();
    this.loadLogs();

    // Setup auto-refresh
    this.setupAutoRefresh();

    // Setup event listeners
    this.setupEventListeners();

    this.isInitialized = true;
    console.log('✅ External Data Dashboard - Initialized successfully');
  }

  initializeDashboard() {
    // Initialize header system
    if (window.headerSystem) {
      window.headerSystem.init();
    }

    // Set page title
    document.title = 'דשבורד נתונים חיצוניים - TikTrack';
  }

  async loadSystemStatus() {
    try {
      console.log('📊 Loading system status...');

      // Load Yahoo Finance status
      await this.loadYahooFinanceStatus();

      // Load cache status
      await this.loadCacheStatus();

      // Load database status
      await this.loadDatabaseStatus();

      // Load API status
      await this.loadAPIStatus();

    } catch (error) {
      console.error('❌ Error loading system status:', error);
    }
  }

  async loadYahooFinanceStatus() {
    try {
      const response = await fetch('/api/external-data/status/yahoo-finance');
      if (response.ok) {
        const data = await response.json();
        this.updateYahooFinanceStatus(data);
      } else {
        this.updateYahooFinanceStatus({ status: 'error', message: 'שגיאה בטעינת סטטוס' });
      }
    } catch (error) {
      this.updateYahooFinanceStatus({ status: 'error', message: 'שגיאת תקשורת' });
    }
  }

  async loadCacheStatus() {
    try {
      const response = await fetch('/api/external-data/status/cache');
      if (response.ok) {
        const data = await response.json();
        this.updateCacheStatus(data);
      } else {
        this.updateCacheStatus({ status: 'error', message: 'שגיאה בטעינת סטטוס מטמון' });
      }
    } catch (error) {
      this.updateCacheStatus({ status: 'error', message: 'שגיאת תקשורת' });
    }
  }

  async loadDatabaseStatus() {
    try {
      const response = await fetch('/api/external-data/status/database');
      if (response.ok) {
        const data = await response.json();
        this.updateDatabaseStatus(data);
      } else {
        this.updateDatabaseStatus({ status: 'error', message: 'שגיאה בטעינת סטטוס בסיס נתונים' });
      }
    } catch (error) {
      this.updateDatabaseStatus({ status: 'error', message: 'שגיאת תקשורת' });
    }
  }

  async loadAPIStatus() {
    try {
      const response = await fetch('/api/external-data/status/api');
      if (response.ok) {
        const data = await response.json();
        this.updateAPIStatus(data);
      } else {
        this.updateAPIStatus({ status: 'error', message: 'שגיאה בטעינת סטטוס API' });
      }
    } catch (error) {
      this.updateAPIStatus({ status: 'error', message: 'שגיאת תקשורת' });
    }
  }

  updateYahooFinanceStatus(data) {
    const statusElement = document.getElementById('yahoo-status');
    const detailsElement = document.getElementById('yahoo-details');

    if (statusElement && detailsElement) {
      if (data.status === 'active') {
        statusElement.textContent = 'פעיל';
        statusElement.className = 'status-indicator active';
        detailsElement.innerHTML = `
                    <div class="status-detail">🕐 עדכון אחרון: ${data.last_update || 'לא ידוע'}</div>
                    <div class="status-detail">📊 בקשות היום: ${data.requests_today || 0}</div>
                    <div class="status-detail">⚡ זמן תגובה: ${data.response_time || 'לא ידוע'}</div>
                `;
      } else if (data.status === 'error') {
        statusElement.textContent = 'שגיאה';
        statusElement.className = 'status-indicator error';
        detailsElement.innerHTML = `
                    <div class="status-detail error">❌ ${data.message}</div>
                `;
      } else {
        statusElement.textContent = 'לא פעיל';
        statusElement.className = 'status-indicator inactive';
        detailsElement.innerHTML = `
                    <div class="status-detail">⚠️ ${data.message || 'הספק לא פעיל'}</div>
                `;
      }
    }
  }

  updateCacheStatus(data) {
    const statusElement = document.getElementById('cache-status-indicator');
    const detailsElement = document.getElementById('cache-details');

    if (statusElement && detailsElement) {
      if (data.status === 'healthy') {
        statusElement.textContent = 'בריא';
        statusElement.className = 'status-indicator active';
        detailsElement.innerHTML = `
                    <div class="status-detail">💾 גודל מטמון: ${data.cache_size || 'לא ידוע'}</div>
                    <div class="status-detail">📊 אחוז פגיעות: ${data.hit_rate || 'לא ידוע'}%</div>
                    <div class="status-detail">🗑️ נתונים פגי תוקף: ${data.stale_data || 0}</div>
                `;
      } else {
        statusElement.textContent = 'בעיה';
        statusElement.className = 'status-indicator error';
        detailsElement.innerHTML = `
                    <div class="status-detail error">❌ ${data.message || 'בעיה במטמון'}</div>
                `;
      }
    }
  }

  updateDatabaseStatus(data) {
    const statusElement = document.getElementById('db-status');
    const detailsElement = document.getElementById('db-details');

    if (statusElement && detailsElement) {
      if (data.status === 'connected') {
        statusElement.textContent = 'מחובר';
        statusElement.className = 'status-indicator active';
        detailsElement.innerHTML = `
                    <div class="status-detail">🗄️ גודל בסיס: ${data.database_size || 'לא ידוע'}</div>
                    <div class="status-detail">📊 מספר רשומות: ${data.total_records || 0}</div>
                    <div class="status-detail">⚡ זמן תגובה: ${data.response_time || 'לא ידוע'}</div>
                `;
      } else {
        statusElement.textContent = 'לא מחובר';
        statusElement.className = 'status-indicator error';
        detailsElement.innerHTML = `
                    <div class="status-detail error">❌ ${data.message || 'בעיה בחיבור'}</div>
                `;
      }
    }
  }

  updateAPIStatus(data) {
    const statusElement = document.getElementById('api-status-indicator');
    const detailsElement = document.getElementById('api-details');

    if (statusElement && detailsElement) {
      if (data.status === 'active') {
        statusElement.textContent = 'פעיל';
        statusElement.className = 'status-indicator active';
        detailsElement.innerHTML = `
                    <div class="status-detail">🔌 endpoints פעילים: ${data.active_endpoints || 0}</div>
                    <div class="status-detail">📊 בקשות היום: ${data.requests_today || 0}</div>
                    <div class="status-detail">⚡ זמן תגובה ממוצע: ${data.avg_response_time || 'לא ידוע'}</div>
                `;
      } else {
        statusElement.textContent = 'לא פעיל';
        statusElement.className = 'status-indicator error';
        detailsElement.innerHTML = `
                    <div class="status-detail error">❌ ${data.message || 'API לא פעיל'}</div>
                `;
      }
    }
  }

  async loadProviders() {
    try {
      console.log('📊 Loading providers...');

      const response = await fetch('/api/external-data/providers');
      if (response.ok) {
        this.providers = await response.json();
        this.renderProviders();
      } else {
        console.error('❌ Error loading providers');
      }
    } catch (error) {
      console.error('❌ Error loading providers:', error);
    }
  }

  renderProviders() {
    const providersGrid = document.getElementById('providers-grid');
    if (!providersGrid) {return;}

    providersGrid.innerHTML = this.providers.map(provider => `
            <div class="provider-card ${provider.is_active ? 'active' : 'inactive'}">
                <div class="provider-header">
                    <h4>${provider.display_name}</h4>
                    <span class="provider-status ${provider.is_active ? 'active' : 'inactive'}">
                        ${provider.is_active ? 'פעיל' : 'לא פעיל'}
                    </span>
                </div>
                <div class="provider-details">
                    <div class="provider-info">
                        <span class="info-label">שם:</span>
                        <span class="info-value">${provider.name}</span>
                    </div>
                    <div class="provider-info">
                        <span class="info-label">URL:</span>
                        <span class="info-value">${provider.base_url || 'לא מוגדר'}</span>
                    </div>
                    <div class="provider-info">
                        <span class="info-label">סטטוס:</span>
                        <span class="info-value">${provider.is_healthy ? 'בריא' : 'בעיה'}</span>
                    </div>
                    <div class="provider-info">
                        <span class="info-label">עדכון אחרון:</span>
                        <span class="info-value">${provider.last_successful_request || 'לא ידוע'}</span>
                    </div>
                </div>
                <div class="provider-actions">
                    <button class="btn btn-sm btn-primary" onclick="testProvider('${provider.id}')">
                        🧪 בדוק
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="toggleProvider('${provider.id}')">
                        ${provider.is_active ? '⏸️ השבת' : '▶️ הפעל'}
                    </button>
                </div>
            </div>
        `).join('');
  }

  async loadCacheStats() {
    try {
      console.log('💾 Loading cache stats...');

      const response = await fetch('/api/external-data/cache/stats');
      if (response.ok) {
        this.cacheStats = await response.json();
        this.renderCacheStats();
      } else {
        console.error('❌ Error loading cache stats');
      }
    } catch (error) {
      console.error('❌ Error loading cache stats:', error);
    }
  }

  renderCacheStats() {
    const cacheStatsElement = document.getElementById('cache-stats');
    if (!cacheStatsElement || !this.cacheStats) {return;}

    cacheStatsElement.innerHTML = `
            <div class="cache-stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${this.cacheStats.total_quotes || 0}</div>
                    <div class="stat-label">ציטוטים במטמון</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.cacheStats.total_intraday_slots || 0}</div>
                    <div class="stat-label">נתוני תוך יום</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${(this.cacheStats.cache_hit_rate || 0).toFixed(1)}%</div>
                    <div class="stat-label">אחוז פגיעות</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${(this.cacheStats.avg_quote_age_minutes || 0).toFixed(1)}</div>
                    <div class="stat-label">גיל ממוצע (דקות)</div>
                </div>
            </div>
        `;
  }

  async loadLogs() {
    try {
      console.log('📋 Loading logs...');

      const response = await fetch('/api/external-data/logs');
      if (response.ok) {
        const logs = await response.json();
        this.renderLogs(logs);
      } else {
        console.error('❌ Error loading logs');
      }
    } catch (error) {
      console.error('❌ Error loading logs:', error);
    }
  }

  renderLogs(logs) {
    const logContent = document.getElementById('log-content');
    if (!logContent) {return;}

    if (logs.length === 0) {
      logContent.innerHTML = '<div class="no-logs">אין לוגים להצגה</div>';
      return;
    }

    logContent.innerHTML = logs.map(log => `
            <div class="log-entry log-${log.level}">
                <div class="log-timestamp">${log.timestamp}</div>
                <div class="log-level">${log.level}</div>
                <div class="log-message">${log.message}</div>
            </div>
        `).join('');
  }

  setupAutoRefresh() {
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadSystemStatus();
      this.loadCacheStats();
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

    // Implementation for log filtering
    console.log('🔍 Filtering logs:', { level: levelFilter, search: searchTerm });
  }

  // Public methods for buttons
  async refreshProviders() {
    console.log('🔄 Refreshing providers...');
    await this.loadProviders();
  }

  async testAllProviders() {
    console.log('🧪 Testing all providers...');
    // Implementation for testing all providers
  }

  async clearCache() {
    try {
      console.log('🗑️ Clearing cache...');

      const response = await fetch('/api/external-data/cache/clear', { method: 'POST' });
      if (response.ok) {
        console.log('✅ Cache cleared successfully');
        await this.loadCacheStats();
      } else {
        console.error('❌ Error clearing cache');
      }
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  async optimizeCache() {
    try {
      console.log('⚡ Optimizing cache...');

      const response = await fetch('/api/external-data/cache/optimize', { method: 'POST' });
      if (response.ok) {
        console.log('✅ Cache optimized successfully');
        await this.loadCacheStats();
      } else {
        console.error('❌ Error optimizing cache');
      }
    } catch (error) {
      console.error('❌ Error optimizing cache:', error);
    }
  }

  async exportData() {
    console.log('📤 Exporting data...');
    // Implementation for data export
  }

  async analyzeData() {
    console.log('📊 Analyzing data...');
    // Implementation for data analysis
  }

  async backupData() {
    console.log('💾 Backing up data...');
    // Implementation for data backup
  }

  async saveSettings() {
    try {
      console.log('💾 Saving settings...');

      const settings = {
        hot_cache_ttl: document.getElementById('hot-cache-ttl')?.value || 1,
        warm_cache_ttl: document.getElementById('warm-cache-ttl')?.value || 5,
        max_requests_hour: document.getElementById('max-requests-hour')?.value || 900,
      };

      const response = await fetch('/api/external-data/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        console.log('✅ Settings saved successfully');
      } else {
        console.error('❌ Error saving settings');
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error);
    }
  }

  async resetSettings() {
    console.log('🔄 Resetting settings...');

    document.getElementById('hot-cache-ttl').value = 1;
    document.getElementById('warm-cache-ttl').value = 5;
    document.getElementById('max-requests-hour').value = 900;

    await this.saveSettings();
  }

  async refreshLogs() {
    console.log('🔄 Refreshing logs...');
    await this.loadLogs();
  }

  async clearLogs() {
    try {
      console.log('🗑️ Clearing logs...');

      const response = await fetch('/api/external-data/logs/clear', { method: 'POST' });
      if (response.ok) {
        console.log('✅ Logs cleared successfully');
        await this.loadLogs();
      } else {
        console.error('❌ Error clearing logs');
      }
    } catch (error) {
      console.error('❌ Error clearing logs:', error);
    }
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.isInitialized = false;
  }
}

// Global functions for button onclick handlers
window.testProvider = function(providerId) {
  console.log('🧪 Testing provider:', providerId);
  // Implementation for testing specific provider
};

window.toggleProvider = function(providerId) {
  console.log('🔄 Toggling provider:', providerId);
  // Implementation for toggling provider status
};

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.externalDataDashboard = new ExternalDataDashboard();
  window.externalDataDashboard.init();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.destroy();
  }
});

