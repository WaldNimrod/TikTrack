/**
 * System Management External Data Section - TikTrack
 * ==============================================
 * 
 * External data section for external data providers management
 * Shows provider status, data accuracy, and refresh information
 * 
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 * @author TikTrack Development Team
 */

class SMExternalDataSection extends SMBaseSection {
  constructor(sectionId, config) {
    super(sectionId, config);
    this.apiEndpoints = {
      status: '/api/external-data/status',
      providers: '/api/external-data/providers',
      logs: '/api/external-data/logs'
    };
  }

  /**
   * Load external data from APIs
   * טעינת נתוני נתונים חיצוניים מה-APIs
   */
  async loadData() {
    try {
      this.isLoading = true;
      console.log(`🌐 Loading external data from multiple endpoints`);

      // Load data from multiple endpoints in parallel
      const [statusData, providersData, logsData] = await Promise.allSettled([
        this.fetchExternalDataStatus(),
        this.fetchExternalDataProviders(),
        this.fetchExternalDataLogs()
      ]);

      // Combine data from all sources
      const combinedData = {
        status: statusData.status === 'fulfilled' ? statusData.value : null,
        providers: providersData.status === 'fulfilled' ? providersData.value : null,
        logs: logsData.status === 'fulfilled' ? logsData.value : null,
        timestamp: new Date().toISOString()
      };

      this.lastData = combinedData;
      this.render(combinedData);
      this.retryCount = 0; // Reset retry count on success

    } catch (error) {
      console.error('❌ Failed to load external data:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch external data status
   * קבלת סטטוס נתונים חיצוניים
   */
  async fetchExternalDataStatus() {
    try {
      const response = await fetch(this.apiEndpoints.status, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.warn('⚠️ Failed to fetch external data status:', error);
      return null;
    }
  }

  /**
   * Fetch external data providers
   * קבלת ספקי נתונים חיצוניים
   */
  async fetchExternalDataProviders() {
    try {
      const response = await fetch(this.apiEndpoints.providers, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.warn('⚠️ Failed to fetch external data providers:', error);
      return null;
    }
  }

  /**
   * Fetch external data logs
   * קבלת לוגי נתונים חיצוניים
   */
  async fetchExternalDataLogs() {
    try {
      const response = await fetch(this.apiEndpoints.logs, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.status === 'success' ? result.data : null;
    } catch (error) {
      console.warn('⚠️ Failed to fetch external data logs:', error);
      return null;
    }
  }

  /**
   * Render external data
   * הצגת נתוני נתונים חיצוניים
   */
  render(data) {
    if (!data || (!data.status && !data.providers && !data.logs)) {
      this.showEmptyState('אין נתוני נתונים חיצוניים זמינים');
      return;
    }

    try {
      const externalDataHtml = this.createExternalDataHTML(data);
      this.container.innerHTML = externalDataHtml;
      
      console.log('✅ External data section rendered successfully');
      
    } catch (error) {
      console.error('❌ Failed to render external data section:', error);
      this.handleError(error, {
        section: this.sectionId,
        action: 'render',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create external data HTML
   * יצירת HTML של נתונים חיצוניים
   */
  createExternalDataHTML(data) {
    const { status, providers, logs } = data;

    return `
      <div class="external-data-overview">
        <!-- External Data Overview Cards -->
        <div class="row mb-4">
          <div class="col-md-4">
            ${this.createOverallStatusCard(status, providers)}
          </div>
          <div class="col-md-4">
            ${this.createDataAccuracyCard(status, providers)}
          </div>
          <div class="col-md-4">
            ${this.createRefreshStatusCard(status, providers)}
          </div>
        </div>

        <!-- Providers Status -->
        <div class="row mb-4">
          <div class="col-12">
            ${this.createProvidersStatusCard(providers)}
          </div>
        </div>

        <!-- Data Logs -->
        <div class="row">
          <div class="col-12">
            ${this.createDataLogsCard(logs)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create overall status card
   * יצירת כרטיס סטטוס כולל
   */
  createOverallStatusCard(status, providers) {
    const overallStatus = this.getOverallStatus(status, providers);
    const statusColor = this.getOverallStatusColor(overallStatus);
    const statusText = this.getOverallStatusText(overallStatus);

    return `
      <div class="card external-data-status-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-globe"></i> סטטוס כולל</h5>
          
          <div class="status-indicator">
            <div class="status-icon status-${statusColor}">
              <i class="fas fa-${this.getStatusIcon(overallStatus)}"></i>
            </div>
            <div class="status-text">${statusText}</div>
          </div>
          
          <div class="status-details">
            <div class="detail-item">
              <span class="detail-label">ספקים פעילים:</span>
              <span class="detail-value">${this.getActiveProvidersCount(providers)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">ספקים כולל:</span>
              <span class="detail-value">${this.getTotalProvidersCount(providers)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create data accuracy card
   * יצירת כרטיס דיוק נתונים
   */
  createDataAccuracyCard(status, providers) {
    const accuracy = this.getDataAccuracy(status, providers);
    const accuracyColor = this.getAccuracyColor(accuracy);

    return `
      <div class="card external-data-accuracy-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-bullseye"></i> דיוק נתונים</h5>
          
          <div class="accuracy-metric">
            <div class="metric-value" style="color: ${accuracyColor}">
              ${accuracy.toFixed(1)}%
            </div>
            <div class="metric-label">דיוק כולל</div>
          </div>
          
          <div class="accuracy-details">
            <div class="detail-item">
              <span class="detail-label">נתונים מדויקים:</span>
              <span class="detail-value">${this.getAccurateDataCount(status, providers)}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">נתונים לא מדויקים:</span>
              <span class="detail-value">${this.getInaccurateDataCount(status, providers)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create refresh status card
   * יצירת כרטיס סטטוס רענון
   */
  createRefreshStatusCard(status, providers) {
    const lastRefresh = this.getLastRefreshTime(status, providers);
    const refreshStatus = this.getRefreshStatus(status, providers);

    return `
      <div class="card external-data-refresh-card">
        <div class="card-body text-center">
          <h5><i class="fas fa-sync-alt"></i> סטטוס רענון</h5>
          
          <div class="refresh-metric">
            <div class="metric-value text-primary">
              ${lastRefresh}
            </div>
            <div class="metric-label">רענון אחרון</div>
          </div>
          
          <div class="refresh-status">
            <span class="badge bg-${this.getRefreshStatusColor(refreshStatus)}">
              ${refreshStatus}
            </span>
          </div>
          
          <div class="refresh-actions mt-3">
            <button class="btn btn-primary btn-sm" onclick="SMExternalDataSection.refreshAllData()">
              <i class="fas fa-sync-alt"></i> רענן הכל
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create providers status card
   * יצירת כרטיס סטטוס ספקים
   */
  createProvidersStatusCard(providers) {
    if (!providers || !Array.isArray(providers)) {
      return `
        <div class="card">
          <div class="card-header">
            <h5><i class="fas fa-server"></i> סטטוס ספקים</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle"></i>
              אין נתוני ספקים זמינים
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-server"></i> סטטוס ספקים</h5>
        </div>
        <div class="card-body">
          <div class="row">
            ${providers.map(provider => `
              <div class="col-md-6 mb-3">
                <div class="provider-card">
                  <div class="provider-header">
                    <div class="provider-icon">
                      <i class="fas ${this.getProviderIcon(provider.name)}"></i>
                    </div>
                    <div class="provider-info">
                      <h6>${provider.name}</h6>
                      <span class="badge bg-${this.getProviderStatusColor(provider.status)}">
                        ${this.getProviderStatusText(provider.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div class="provider-details">
                    <div class="detail-item">
                      <span class="detail-label">URL:</span>
                      <span class="detail-value">${provider.url || 'לא זמין'}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">זמן תגובה:</span>
                      <span class="detail-value">${provider.response_time || 'לא זמין'}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">רענון אחרון:</span>
                      <span class="detail-value">${provider.last_refresh || 'לא זמין'}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">סטטוס:</span>
                      <span class="detail-value">${provider.status_message || 'לא זמין'}</span>
                    </div>
                  </div>
                  
                  <div class="provider-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="SMExternalDataSection.refreshProvider('${provider.name}')">
                      <i class="fas fa-sync-alt"></i> רענן
                    </button>
                    <button class="btn btn-outline-info btn-sm" onclick="SMExternalDataSection.testProvider('${provider.name}')">
                      <i class="fas fa-vial"></i> בדוק
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create data logs card
   * יצירת כרטיס לוגי נתונים
   */
  createDataLogsCard(logs) {
    if (!logs || !Array.isArray(logs)) {
      return `
        <div class="card">
          <div class="card-header">
            <h5><i class="fas fa-list-alt"></i> לוגי נתונים</h5>
          </div>
          <div class="card-body">
            <div class="alert alert-info">
              <i class="fas fa-info-circle"></i>
              אין לוגי נתונים זמינים
            </div>
          </div>
        </div>
      `;
    }

    // Show only last 10 logs
    const recentLogs = logs.slice(0, 10);

    return `
      <div class="card">
        <div class="card-header">
          <h5><i class="fas fa-list-alt"></i> לוגי נתונים (10 האחרונים)</h5>
        </div>
        <div class="card-body">
          <div class="data-logs">
            ${recentLogs.map(log => `
              <div class="log-entry log-${log.level}">
                <div class="log-header">
                  <span class="log-time">${log.timestamp || 'לא זמין'}</span>
                  <span class="log-level badge bg-${this.getLogLevelColor(log.level)}">
                    ${log.level || 'INFO'}
                  </span>
                </div>
                <div class="log-message">
                  ${log.message || 'אין הודעה'}
                </div>
                ${log.provider ? `
                  <div class="log-provider">
                    <small class="text-muted">ספק: ${log.provider}</small>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
          
          ${logs.length > 10 ? `
            <div class="text-center mt-3">
              <button class="btn btn-outline-primary btn-sm" onclick="SMExternalDataSection.showAllLogs()">
                <i class="fas fa-list"></i> הצג כל הלוגים
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Get overall status
   * קבלת סטטוס כולל
   */
  getOverallStatus(status, providers) {
    if (!providers || !Array.isArray(providers)) {
      return 'unknown';
    }

    const activeProviders = providers.filter(p => p.status === 'active' || p.status === 'healthy');
    const totalProviders = providers.length;

    if (activeProviders.length === totalProviders) return 'healthy';
    if (activeProviders.length > totalProviders / 2) return 'warning';
    return 'error';
  }

  /**
   * Get overall status color
   * קבלת צבע סטטוס כולל
   */
  getOverallStatusColor(status) {
    const colors = {
      'healthy': 'success',
      'warning': 'warning',
      'error': 'danger',
      'unknown': 'secondary'
    };
    return colors[status] || 'secondary';
  }

  /**
   * Get overall status text
   * קבלת טקסט סטטוס כולל
   */
  getOverallStatusText(status) {
    const texts = {
      'healthy': 'בריא',
      'warning': 'אזהרה',
      'error': 'שגיאה',
      'unknown': 'לא ידוע'
    };
    return texts[status] || 'לא ידוע';
  }

  /**
   * Get status icon
   * קבלת אייקון סטטוס
   */
  getStatusIcon(status) {
    const icons = {
      'healthy': 'check-circle',
      'warning': 'exclamation-triangle',
      'error': 'times-circle',
      'unknown': 'question-circle'
    };
    return icons[status] || 'question-circle';
  }

  /**
   * Get active providers count
   * קבלת מספר ספקים פעילים
   */
  getActiveProvidersCount(providers) {
    if (!providers || !Array.isArray(providers)) return 0;
    return providers.filter(p => p.status === 'active' || p.status === 'healthy').length;
  }

  /**
   * Get total providers count
   * קבלת מספר ספקים כולל
   */
  getTotalProvidersCount(providers) {
    if (!providers || !Array.isArray(providers)) return 0;
    return providers.length;
  }

  /**
   * Get data accuracy
   * קבלת דיוק נתונים
   */
  getDataAccuracy(status, providers) {
    if (!providers || !Array.isArray(providers)) return 0;
    
    const accurateProviders = providers.filter(p => p.accuracy && p.accuracy > 80);
    return (accurateProviders.length / providers.length) * 100;
  }

  /**
   * Get accuracy color
   * קבלת צבע דיוק
   */
  getAccuracyColor(accuracy) {
    if (accuracy >= 90) return '#28a745'; // Green
    if (accuracy >= 70) return '#ffc107'; // Yellow
    if (accuracy >= 50) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  }

  /**
   * Get accurate data count
   * קבלת מספר נתונים מדויקים
   */
  getAccurateDataCount(status, providers) {
    if (!providers || !Array.isArray(providers)) return 0;
    return providers.filter(p => p.accuracy && p.accuracy > 80).length;
  }

  /**
   * Get inaccurate data count
   * קבלת מספר נתונים לא מדויקים
   */
  getInaccurateDataCount(status, providers) {
    if (!providers || !Array.isArray(providers)) return 0;
    return providers.filter(p => !p.accuracy || p.accuracy <= 80).length;
  }

  /**
   * Get last refresh time
   * קבלת זמן רענון אחרון
   */
  getLastRefreshTime(status, providers) {
    if (!providers || !Array.isArray(providers)) return 'לא זמין';
    
    const refreshTimes = providers
      .map(p => p.last_refresh)
      .filter(time => time)
      .sort()
      .reverse();
    
    return refreshTimes[0] || 'לא זמין';
  }

  /**
   * Get refresh status
   * קבלת סטטוס רענון
   */
  getRefreshStatus(status, providers) {
    if (!providers || !Array.isArray(providers)) return 'לא ידוע';
    
    const recentRefresh = providers.filter(p => {
      if (!p.last_refresh) return false;
      const refreshTime = new Date(p.last_refresh);
      const now = new Date();
      return (now - refreshTime) < 300000; // 5 minutes
    });
    
    if (recentRefresh.length === providers.length) return 'עדכני';
    if (recentRefresh.length > providers.length / 2) return 'חלקי';
    return 'מיושן';
  }

  /**
   * Get refresh status color
   * קבלת צבע סטטוס רענון
   */
  getRefreshStatusColor(status) {
    const colors = {
      'עדכני': 'success',
      'חלקי': 'warning',
      'מיושן': 'danger',
      'לא ידוע': 'secondary'
    };
    return colors[status] || 'secondary';
  }

  /**
   * Get provider icon
   * קבלת אייקון ספק
   */
  getProviderIcon(providerName) {
    const icons = {
      'Yahoo Finance': 'fa-chart-line',
      'Alpha Vantage': 'fa-chart-bar',
      'IEX Cloud': 'fa-cloud',
      'default': 'fa-server'
    };
    return icons[providerName] || icons.default;
  }

  /**
   * Get provider status color
   * קבלת צבע סטטוס ספק
   */
  getProviderStatusColor(status) {
    const colors = {
      'active': 'success',
      'healthy': 'success',
      'warning': 'warning',
      'error': 'danger',
      'inactive': 'secondary',
      'unknown': 'secondary'
    };
    return colors[status] || 'secondary';
  }

  /**
   * Get provider status text
   * קבלת טקסט סטטוס ספק
   */
  getProviderStatusText(status) {
    const texts = {
      'active': 'פעיל',
      'healthy': 'בריא',
      'warning': 'אזהרה',
      'error': 'שגיאה',
      'inactive': 'לא פעיל',
      'unknown': 'לא ידוע'
    };
    return texts[status] || 'לא ידוע';
  }

  /**
   * Get log level color
   * קבלת צבע רמת לוג
   */
  getLogLevelColor(level) {
    const colors = {
      'ERROR': 'danger',
      'WARNING': 'warning',
      'INFO': 'info',
      'DEBUG': 'secondary',
      'default': 'secondary'
    };
    return colors[level] || colors.default;
  }

  /**
   * Refresh all external data (static method for global access)
   * רענון כל הנתונים החיצוניים (מתודה סטטית לגישה גלובלית)
   */
  static async refreshAllData() {
    try {
      console.log('🔄 Refreshing all external data...');
      
      const response = await fetch('/api/external-data/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification(result.message || 'נתונים חיצוניים רועננו בהצלחה', 'success');
        }
        
        // Refresh external data section
        const externalDataSection = document.getElementById('sm-external-data');
        if (externalDataSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-external-data');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to refresh external data');
      }
      
    } catch (error) {
      console.error('❌ Failed to refresh external data:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה ברענון נתונים חיצוניים: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Refresh specific provider (static method for global access)
   * רענון ספק ספציפי (מתודה סטטית לגישה גלובלית)
   */
  static async refreshProvider(providerName) {
    try {
      console.log(`🔄 Refreshing provider: ${providerName}`);
      
      const response = await fetch(`/api/external-data/refresh/${providerName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification(`ספק ${providerName} רוענן בהצלחה`, 'success');
        }
        
        // Refresh external data section
        const externalDataSection = document.getElementById('sm-external-data');
        if (externalDataSection) {
          const sectionInstance = window.systemManagementMain?.sections?.get('sm-external-data');
          if (sectionInstance) {
            await sectionInstance.refresh();
          }
        }
      } else {
        throw new Error(result.message || 'Failed to refresh provider');
      }
      
    } catch (error) {
      console.error('❌ Failed to refresh provider:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה ברענון ספק ${providerName}: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Test specific provider (static method for global access)
   * בדיקת ספק ספציפי (מתודה סטטית לגישה גלובלית)
   */
  static async testProvider(providerName) {
    try {
      console.log(`🧪 Testing provider: ${providerName}`);
      
      const response = await fetch(`/api/external-data/test/${providerName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        if (window.showNotification) {
          window.showNotification(`בדיקת ספק ${providerName} הושלמה בהצלחה`, 'success');
        }
      } else {
        throw new Error(result.message || 'Provider test failed');
      }
      
    } catch (error) {
      console.error('❌ Failed to test provider:', error);
      if (window.showNotification) {
        window.showNotification(`שגיאה בבדיקת ספק ${providerName}: ${error.message}`, 'error');
      }
    }
  }

  /**
   * Show all logs (static method for global access)
   * הצגת כל הלוגים (מתודה סטטית לגישה גלובלית)
   */
  static showAllLogs() {
    // This could open a modal or navigate to a logs page
    console.log('📋 Showing all external data logs');
    alert('פתיחת כל הלוגים של נתונים חיצוניים');
  }
}

// Export for use in other modules
window.SMExternalDataSection = SMExternalDataSection;
