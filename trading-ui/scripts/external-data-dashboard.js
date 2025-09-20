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


// ===== EXTERNAL DATA DASHBOARD CLASS =====

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

    // console.log('🚀 External Data Dashboard - Initializing...');

    // Initialize dashboard
    this.initializeDashboard();

    // Load initial data
    this.loadSystemStatus();
    this.loadProviders();
    this.loadCacheStats();
    this.loadLogs();
    this.loadGroupRefreshHistory();

    // Setup auto-refresh
    this.setupAutoRefresh();

    // Setup event listeners
    this.setupEventListeners();

    this.isInitialized = true;
    // console.log('✅ External Data Dashboard - Initialized successfully');
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
      // console.log('📊 Loading system status...');

      const response = await fetch('/api/external-data/status/');
      if (response.ok) {
        const data = await response.json();

        // Update all status components with the unified data
        this.updateYahooFinanceStatus(data);
        this.updateCacheStatus(data);
        this.updateDatabaseStatus(data);
        this.updateAPIStatus(data);
        this.updateInfoSummary(data);

      } else {
        // console.error('❌ Error loading system status:', response.status);
      }
    } catch (_error) {
      // Error loading system status
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
      // Find Yahoo Finance provider from the providers list
      const yahooProvider = data.providers?.details?.find(p => p.name === 'yahoo_finance');

      if (yahooProvider && yahooProvider.is_active && yahooProvider.is_healthy) {
        statusElement.textContent = 'פעיל';
        statusElement.className = 'status-indicator active';

        detailsElement.innerHTML = `
          <div class="status-detail">📊 ספק: ${yahooProvider.display_name}</div>
          <div class="status-detail">⚡ בקשות נותרות: ${yahooProvider.rate_limit_remaining || 0}</div>
          <div class="status-detail">📈 אחוז הצלחה: ${yahooProvider.recent_success_rate || 0}%</div>
        `;
      } else if (yahooProvider && yahooProvider.is_active && !yahooProvider.is_healthy) {
        statusElement.textContent = 'בעיה';
        statusElement.className = 'status-indicator error';
        detailsElement.innerHTML = `
          <div class="status-detail error">❌ הספק פעיל אבל לא בריא</div>
        `;
      } else if (yahooProvider && !yahooProvider.is_active) {
        statusElement.textContent = 'לא פעיל';
        statusElement.className = 'status-indicator inactive';
        detailsElement.innerHTML = `
          <div class="status-detail">⚠️ הספק לא פעיל</div>
        `;
      } else {
        statusElement.textContent = 'לא ידוע';
        statusElement.className = 'status-indicator inactive';
        detailsElement.innerHTML = `
          <div class="status-detail">❓ לא ניתן לקבוע סטטוס</div>
        `;
      }
    }
  }

  updateCacheStatus(data) {
    const statusElement = document.getElementById('cache-status-indicator');
    const detailsElement = document.getElementById('cache-details');

    if (statusElement && detailsElement) {
      // Check if cache data exists and is healthy
      if (data.cache && data.cache.cache_hit_rate >= 0) {
        statusElement.textContent = 'בריא';
        statusElement.className = 'status-indicator active';
        detailsElement.innerHTML = `
          <div class="status-detail">💾 אחוז פגיעות: ${data.cache.cache_hit_rate || 0}%</div>
          <div class="status-detail">📊 נתונים פגי תוקף: ${data.cache.stale_data || 0}</div>
          <div class="status-detail">🗑️ סלוטים תוך-יומיים: ${data.cache.total_intraday_slots || 0}</div>
        `;
      } else {
        statusElement.textContent = 'בעיה';
        statusElement.className = 'status-indicator error';
        detailsElement.innerHTML = `
          <div class="status-detail error">❌ לא ניתן לקבוע סטטוס מטמון</div>
        `;
      }
    }
  }

  updateDatabaseStatus(data) {
    const statusElement = document.getElementById('db-status');
    const detailsElement = document.getElementById('db-details');

    if (statusElement && detailsElement) {
      // Check if providers data exists
      if (data.providers && data.providers.total >= 0) {
        statusElement.textContent = 'מחובר';
        statusElement.className = 'status-indicator active';
        detailsElement.innerHTML = `
          <div class="status-detail">🗄️ ספקים: ${data.providers.total || 0}</div>
          <div class="status-detail">📊 פעילים: ${data.providers.active || 0}</div>
          <div class="status-detail">✅ בריאים: ${data.providers.healthy || 0}</div>
        `;
      } else {
        statusElement.textContent = 'לא מחובר';
        statusElement.className = 'status-indicator error';
        detailsElement.innerHTML = `
          <div class="status-detail error">❌ לא ניתן לקבוע סטטוס בסיס נתונים</div>
        `;
      }
    }
  }

  updateAPIStatus(data) {
    const statusElement = document.getElementById('api-status-indicator');
    const detailsElement = document.getElementById('api-details');

    if (statusElement && detailsElement) {
      // Check if API is working by checking if we got data
      if (data.success === true) {
        statusElement.textContent = 'פעיל';
        statusElement.className = 'status-indicator active';
        detailsElement.innerHTML = `
          <div class="status-detail">🔌 סטטוס: API פעיל וזמין</div>
          <div class="status-detail">📊 בריאות כללית: ${data.overall_health ? 'טובה' : 'מושפלת'}</div>
          <div class="status-detail">⚡ זמינות: 100%</div>
        `;
      } else {
        statusElement.textContent = 'לא פעיל';
        statusElement.className = 'status-indicator error';
        detailsElement.innerHTML = `
          <div class="status-detail error">❌ לא ניתן לקבוע סטטוס API</div>
        `;
      }
    }
  }

  async loadProviders() {
    try {
      // console.log('📊 Loading providers...');

      const response = await fetch('/api/external-data/status/providers');
      if (response.ok) {
        const data = await response.json();
        this.providers = data.providers || [];
        this.renderProviders();
      } else {
        // console.error('❌ Error loading providers');
      }
    } catch (error) {
      // console.error('❌ Error loading providers:', error);
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
      // console.log('💾 Loading cache stats...');

      // Use the main status endpoint to get cache stats
      const response = await fetch('/api/external-data/status/');
      if (response.ok) {
        const data = await response.json();
        this.cacheStats = data.cache || {};
        this.renderCacheStats();

        // Also update the current settings display
        this.updateCurrentSettings(data);
      } else {
        // console.error('❌ Error loading cache stats:', response.status);
      }
    } catch (error) {
      // console.error('❌ Error loading cache stats:', error);
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

  updateCurrentSettings(data) {
    try {
      // Update cache TTL settings
      const hotCacheElement = document.getElementById('current-hot-cache');
      const warmCacheElement = document.getElementById('current-warm-cache');
      const maxRequestsElement = document.getElementById('current-max-requests');

      if (hotCacheElement) {
        // Get cache TTL from user preferences or use default
        const cacheTTL = data.cache?.cache_ttl_minutes || 5;
        hotCacheElement.textContent = `${cacheTTL} דקות`;
      }

      if (warmCacheElement) {
        // Warm cache is typically 2x hot cache
        const cacheTTL = data.cache?.cache_ttl_minutes || 5;
        warmCacheElement.textContent = `${cacheTTL * 2} דקות`;
      }

      if (maxRequestsElement) {
        // Get max requests from user preferences or use default
        const maxRequests = data.cache?.max_requests_per_hour || 900;
        maxRequestsElement.textContent = `${maxRequests} לשעה`;
      }

      // console.log('✅ Current settings updated');
    } catch (error) {
      // console.error('❌ Error updating current settings:', error);
    }
  }

  async loadLogs() {
    try {
      // console.log('📋 Loading logs...');

      const response = await fetch('/api/external-data/status/logs');
      if (response.ok) {
        const data = await response.json();
        this.renderLogs(data.logs || []);
      } else {
        // console.error('❌ Error loading logs:', response.status);
        this.renderLogs([]);
      }
    } catch (error) {
      // console.error('❌ Error loading logs:', error);
      this.renderLogs([]);
    }
  }

  renderLogs(logs) {
    const logContent = document.getElementById('log-content');
    if (!logContent) {return;}

    if (logs.length === 0) {
      const currentTime = new Date().toLocaleString('he-IL');
      logContent.innerHTML = `
        <div class="no-logs">
          <div class="no-logs-icon">📋</div>
          <div class="no-logs-title">אין לוגים להצגה</div>
          <div class="no-logs-subtitle">המערכת פועלת ללא שגיאות</div>
          <div class="no-logs-time">נבדק לאחרונה: ${currentTime}</div>
          <div class="no-logs-info">
            <p>• לוגים יופיעו כאן כאשר יש פעילות במערכת</p>
            <p>• רענן את הדף כדי לבדוק עדכונים חדשים</p>
          </div>
        </div>
      `;
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
    // console.log('🔍 Filtering logs:', { level: levelFilter, search: searchTerm });
  }

  // Public methods for buttons
  async refreshProviders() {
    // console.log('🔄 Refreshing providers...');
    await this.loadProviders();
  }


  async saveSettings() {
    try {
      // console.log('💾 Saving settings...');

      const settings = {
        hot_cache_ttl: document.getElementById('hot-cache-ttl')?.value || 1,
        warm_cache_ttl: document.getElementById('warm-cache-ttl')?.value || 5,
        max_requests_hour: document.getElementById('max-requests-hour')?.value || 900,
      };

      const response = await fetch('/api/external-data/status/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const result = await response.json();
        // console.log('✅ Settings saved successfully:', result.message);
        // console.log('📋 Updated settings:', result.settings);
      } else {
        // console.error('❌ Error saving settings:', response.status);
      }
    } catch (error) {
      // console.error('❌ Error saving settings:', error);
    }
  }

  async resetSettings() {
    // console.log('🔄 Resetting settings...');

    document.getElementById('hot-cache-ttl').value = 1;
    document.getElementById('warm-cache-ttl').value = 5;
    document.getElementById('max-requests-hour').value = 900;

    await this.saveSettings();
  }

  async refreshLogs() {
    // console.log('🔄 Refreshing logs...');
    await this.loadLogs();
  }

  async clearLogs() {
    try {
      // console.log('🗑️ Clearing logs...');

      const response = await fetch('/api/external-data/status/logs/clear', { method: 'POST' });
      if (response.ok) {
        // console.log('✅ Logs cleared successfully');
        await this.loadLogs();
      } else {
        // console.error('❌ Error clearing logs:', response.status);
      }
    } catch (error) {
      // console.error('❌ Error clearing logs:', error);
    }
  }

  async clearCache() {
    try {
      // console.log('🗑️ Clearing cache...');

      const response = await fetch('/api/external-data/status/cache/clear', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        // console.log('✅ Cache cleared successfully:', result.message);
        await this.loadCacheStats();
      } else {
        // console.error('❌ Error clearing cache:', response.status);
      }
    } catch (error) {
      // console.error('❌ Error clearing cache:', error);
    }
  }

  async optimizeCache() {
    try {
      // console.log('⚡ Optimizing cache...');

      const response = await fetch('/api/external-data/status/cache/optimize', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        // console.log('✅ Cache optimized successfully:', result.message);
        await this.loadCacheStats();
      } else {
        // console.error('❌ Error optimizing cache:', response.status);
      }
    } catch (error) {
      // console.error('❌ Error optimizing cache:', error);
    }
  }

  async testAllProviders() {
    try {
      // console.log('🧪 Testing all providers...');

      const response = await fetch('/api/external-data/status/providers/test-all', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        // console.log('✅ All providers tested:', result.message);
        // console.log('📊 Test results:', result.test_results);
        await this.loadProviders();
      } else {
        // console.error('❌ Error testing providers:', response.status);
      }
    } catch (error) {
      // console.error('❌ Error testing providers:', error);
    }
  }

  async exportData() {
    try {
      // console.log('📤 Exporting data...');

      // For now, export the current system status as JSON
      const response = await fetch('/api/external-data/status/');
      if (response.ok) {
        const data = await response.json();

        // Create and download JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `external-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        // console.log('✅ Data exported successfully');
      } else {
        // console.error('❌ Error exporting data:', response.status);
      }
    } catch (error) {
      // console.error('❌ Error exporting data:', error);
    }
  }

  async analyzeData() {
    try {
      // console.log('📊 Analyzing data...');

      // For now, just show current system metrics
      const response = await fetch('/api/external-data/status/');
      if (response.ok) {
        const data = await response.json();

        // Create analysis summary
        const analysis = {
          total_providers: data.providers?.total || 0,
          active_providers: data.providers?.active || 0,
          healthy_providers: data.providers?.healthy || 0,
          cache_hit_rate: data.cache?.cache_hit_rate || 0,
          overall_health: data.overall_health ? 'טובה' : 'מושפלת',
          system_status: data.status || 'לא ידוע',
        };

        // console.log('📊 Data Analysis:', analysis);

        // Show analysis in UI (you can implement this later)
        if (window.showInfoNotification) {
          window.showInfoNotification(`ניתוח נתונים:\nספקים: ${analysis.total_providers}\nפעילים: ${analysis.active_providers}\nבריאים: ${analysis.healthy_providers}\nבריאות כללית: ${analysis.overall_health}`, 'ניתוח נתונים');
        }

      } else {
        // console.error('❌ Error analyzing data:', response.status);
      }
    } catch (error) {
      // console.error('❌ Error analyzing data:', error);
    }
  }

  async backupData() {
    try {
      // console.log('💾 Backing up data...');

      // For now, just export current data as backup
      await this.exportData();
      // console.log('✅ Data backup completed');

    } catch (error) {
      // console.error('❌ Error backing up data:', error);
    }
  }

  async loadGroupRefreshHistory() {
    try {
      console.log('📊 Loading group refresh history...');
      
      const limit = document.getElementById('group-limit')?.value || 20;
      const response = await fetch(`/api/external-data/status/group-refresh-history?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.group_refresh_history) {
        this.renderGroupRefreshHistory(data.group_refresh_history);
        console.log(`✅ Loaded ${data.group_refresh_history.length} group refresh entries`);
      } else {
        console.warn('⚠️ No group refresh history data received');
        this.renderGroupRefreshHistory([]);
      }
      
    } catch (error) {
      console.error('❌ Error loading group refresh history:', error);
      this.renderGroupRefreshHistory([]);
    }
  }

  renderGroupRefreshHistory(history) {
    const container = document.getElementById('group-refresh-content');
    if (!container) return;

    if (!history || history.length === 0) {
      container.innerHTML = '<div class="text-center text-muted p-4">אין היסטוריית עדכונים קבוצתיים</div>';
      return;
    }

    const html = history.map(entry => {
      const categoryLabel = this.getCategoryLabel(entry.category);
      const statusClass = entry.status;
      const statusLabel = this.getStatusLabel(entry.status);
      
      const startTime = entry.started_at ? new Date(entry.started_at).toLocaleString('he-IL') : 'לא ידוע';
      const endTime = entry.completed_at ? new Date(entry.completed_at).toLocaleString('he-IL') : 'בתהליך';
      
      const details = entry.successful_count !== null && entry.failed_count !== null 
        ? `${entry.successful_count} הצליחו, ${entry.failed_count} נכשלו`
        : entry.message || 'אין פרטים נוספים';

      return `
        <div class="group-refresh-item">
          <div class="group-refresh-info">
            <div class="group-refresh-category">${categoryLabel} - ${entry.time_period}</div>
            <div class="group-refresh-details">${details}</div>
            <div class="group-refresh-time">
              התחיל: ${startTime} | הסתיים: ${endTime}
            </div>
          </div>
          <div class="group-refresh-status ${statusClass}">${statusLabel}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  getCategoryLabel(category) {
    const labels = {
      'active_trades': 'טיקרים עם טרייד פעיל',
      'no_active_trades': 'טיקרים ללא טרייד פעיל',
      'closed': 'טיקרים סגורים/מבוטלים',
      'unknown': 'לא ידוע'
    };
    return labels[category] || category;
  }

  getStatusLabel(status) {
    const labels = {
      'completed': 'הושלם',
      'failed': 'נכשל',
      'started': 'התחיל'
    };
    return labels[status] || status;
  }

  async exportGroupHistory() {
    try {
      console.log('📥 Exporting group refresh history...');
      
      const limit = document.getElementById('group-limit')?.value || 20;
      const response = await fetch(`/api/external-data/status/group-refresh-history?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.group_refresh_history) {
        // Create CSV content
        const csvContent = this.createGroupHistoryCSV(data.group_refresh_history);
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `group_refresh_history_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Group refresh history exported successfully');
      } else {
        console.warn('⚠️ No data to export');
      }
      
    } catch (error) {
      console.error('❌ Error exporting group refresh history:', error);
    }
  }

  createGroupHistoryCSV(history) {
    const headers = [
      'ID',
      'קטגוריה',
      'תקופה',
      'מספר טיקרים',
      'סטטוס',
      'התחיל',
      'הסתיים',
      'הצליחו',
      'נכשלו',
      'הודעה'
    ];

    const rows = history.map(entry => [
      entry.id,
      this.getCategoryLabel(entry.category),
      entry.time_period,
      entry.ticker_count,
      this.getStatusLabel(entry.status),
      entry.started_at || '',
      entry.completed_at || '',
      entry.successful_count || '',
      entry.failed_count || '',
      entry.message || ''
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.isInitialized = false;
  }

  /**
   * Copy detailed logs to clipboard
   * This function collects all relevant information and copies it to clipboard
   */
  static copyDetailedLog() {
    try {
      // console.log('📋 Collecting detailed logs...');

      // Collect system information
      const systemInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        pageUrl: window.location.href,
        pageTitle: document.title,
      };

      // Collect dashboard status
      const dashboardStatus = {
        isInitialized: window.externalDataDashboard?.isInitialized || false,
        providers: window.externalDataDashboard?.providers || [],
        cacheStats: window.externalDataDashboard?.cacheStats || null,
      };

      // Collect console logs (if available)
      const consoleLogs = [];
      if (window.console && window.console.log) {
        // Try to get recent console logs
        consoleLogs.push('Console logs collected at: ' + new Date().toISOString());
      }

      // Collect API status
      const apiStatus = {
        yahooFinance: document.getElementById('yahoo-status')?.textContent || 'Unknown',
        cache: document.getElementById('cache-status-indicator')?.textContent || 'Unknown',
        database: document.getElementById('db-status')?.textContent || 'Unknown',
        api: document.getElementById('api-status-indicator')?.textContent || 'Unknown',
      };

      // Collect error information
      const errors = [];
      if (window.lastErrors) {
        errors.push(...window.lastErrors);
      }

      // Build detailed log
      const detailedLog = {
        systemInfo,
        dashboardStatus,
        apiStatus,
        errors,
        consoleLogs,
        timestamp: new Date().toISOString(),
      };

      // Convert to formatted string
      const logText = `=== TikTrack External Data Dashboard - Detailed Log ===
Timestamp: ${detailedLog.timestamp}
Page: ${detailedLog.systemInfo.pageTitle}
URL: ${detailedLog.systemInfo.pageUrl}

=== System Information ===
User Agent: ${detailedLog.systemInfo.userAgent}

=== Dashboard Status ===
Initialized: ${detailedLog.dashboardStatus.isInitialized}
Providers Count: ${detailedLog.dashboardStatus.providers.length}
Cache Stats Available: ${detailedLog.dashboardStatus.cacheStats ? 'Yes' : 'No'}

=== API Status ===
Yahoo Finance: ${detailedLog.apiStatus.yahooFinance}
Cache: ${detailedLog.apiStatus.cache}
Database: ${detailedLog.apiStatus.database}
API: ${detailedLog.apiStatus.api}

=== Errors ===
${detailedLog.errors.length > 0 ? detailedLog.errors.join('\n') : 'No errors recorded'}

=== Console Logs ===
${detailedLog.consoleLogs.join('\n')}

=== End of Log ===`;

      // Copy to clipboard
      navigator.clipboard.writeText(logText).then(() => {
        // console.log('✅ Detailed log copied to clipboard');

        // Show success notification
        if (window.showNotification) {
          window.showNotification('לוג מפורט הועתק ללוח', 'success');
        } else {
          if (window.showSuccessNotification) {
            window.showSuccessNotification('לוג מפורט הועתק ללוח!');
          }
        }

        // Also log to console for easy access
        // console.log('📋 DETAILED LOG COPIED TO CLIPBOARD:');
        // console.log(logText);

      }).catch(_err => {
        // Failed to copy to clipboard

        // Fallback: show in alert
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה בהעתקה ללוח. הלוג מוצג בקונסול.');
        }
        // DETAILED LOG (copy manually):
        // logText
      });

    } catch (_error) {
      // Error collecting detailed logs
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה באיסוף הלוגים. בדוק את הקונסול.');
      }
    }
  }
}

// Global functions for button onclick handlers
window.toggleTopSection = function() {
  if (typeof window.toggleTopSectionGlobal === 'function') {
    window.toggleTopSectionGlobal();
  } else {
    console.warn('פונקציית toggleTopSectionGlobal לא נמצאה ב-main.js');
  }
};

window.testProvider = function(providerId) {
  // console.log('🧪 Testing provider:', providerId);
  // Implementation for testing specific provider
};

window.toggleProvider = function(providerId) {
  // console.log('🔄 Toggling provider:', providerId);
  // Implementation for toggling provider status
};

// Additional global functions for button onclick handlers
window.refreshLogs = function() {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.refreshLogs();
  }
};

window.saveSettings = function() {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.saveSettings();
  }
};

window.clearLogs = function() {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.clearLogs();
  }
};

window.analyzeData = function() {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.analyzeData();
  }
};

window.backupData = function() {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.backupData();
  }
};

// Removed duplicate clearCache function - using global clearAllCache instead

window.optimizeCache = function() {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.optimizeCache();
  }
};

window.refreshProviders = function() {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.loadProviders();
  }
};

window.testAllProviders = function() {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.testAllProviders();
  }
};

window.exportData = function() {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.exportData();
  }
};

window.resetSettings = function() {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.resetSettings();
  }
};

// Group refresh history functions
window.refreshGroupHistory = function() {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.loadGroupRefreshHistory();
  }
};

window.exportGroupHistory = function() {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.exportGroupHistory();
  }
};

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.externalDataDashboard = new ExternalDataDashboard();
  window.externalDataDashboard.init();
  
  // Make functions globally available
  window.copyDetailedLog = ExternalDataDashboard.copyDetailedLog;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.externalDataDashboard) {
    window.externalDataDashboard.destroy();
  }
});

