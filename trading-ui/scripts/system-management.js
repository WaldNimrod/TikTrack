/**
 * System Management - TikTrack
 * ============================
 *
 * System management dashboard for monitoring and administration
 *
 * @author TikTrack Development Team
 * @version 2.0.0
 * @lastUpdated September 4, 2025
 */

class SystemManagement {
  constructor() {
    this.isInitialized = false;
    this.refreshInterval = null;
    this.currentData = null;
    this.isLoading = false;
  }

  init() {
    if (this.isInitialized) {
      return;
    }

    console.log('🚀 System Management - Initializing...');

    // Initialize dashboard
    SystemManagement.initializeDashboard();

    // Load initial data
    this.loadSystemData();

    // Setup auto-refresh
    this.setupAutoRefresh();

    // Setup event listeners
    SystemManagement.setupEventListeners();

    this.isInitialized = true;
    console.log('✅ System Management - Initialized successfully');
  }

  static initializeDashboard() {
    // Initialize header system
    if (window.headerSystem) {
      window.headerSystem.init();
    }

    // Set page title
    document.title = 'מנהל מערכת - TikTrack';
  }

  async loadSystemData() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoadingState();

    try {
      console.log('📊 Loading system data...');
      
      // Load system overview
      const overviewResponse = await fetch('/api/system/overview');
      const overviewData = await overviewResponse.json();
      
      if (overviewData.status === 'success') {
        this.currentData = overviewData.data;
        this.updateDashboard(overviewData.data);
        console.log('✅ System data loaded successfully');
      } else {
        throw new Error(overviewData.message || 'Failed to load system data');
      }
      
    } catch (error) {
      console.error('❌ Error loading system data:', error);
      this.showErrorState(error.message);
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }

  updateDashboard(data) {
    // Update health cards
    this.updateHealthCards(data);
    
    // Update system info
    this.updateSystemInfo(data);
    
    // Update logs
    this.updateLogs(data);
    
    // Update performance metrics
    this.updatePerformanceMetrics(data);
    
    // Update external data
    this.updateExternalData();
    
    // Update alerts
    this.updateAlerts();
    
    // Update timestamp
    this.updateTimestamp(data.timestamp);
  }

  updateHealthCards(data) {
    const healthCards = document.querySelectorAll('.health-card');
    
    // Server status
    const serverCard = healthCards[0];
    if (serverCard) {
      const statusElement = serverCard.querySelector('.health-status');
      const detailsElement = serverCard.querySelector('.health-details');
      
      if (statusElement && detailsElement) {
        const serverStatus = data.health?.components?.system?.status || 'unknown';
        const uptime = data.summary?.uptime || 'Unknown';
        
        statusElement.textContent = serverStatus === 'healthy' ? 'פעיל' : 'לא פעיל';
        statusElement.className = `health-status ${serverStatus === 'healthy' ? 'active' : 'inactive'}`;
        detailsElement.textContent = `זמן פעילות: ${uptime}`;
      }
    }
    
    // Database status
    const dbCard = healthCards[1];
    if (dbCard) {
      const statusElement = dbCard.querySelector('.health-status');
      const detailsElement = dbCard.querySelector('.health-details');
      
      if (statusElement && detailsElement) {
        const dbStatus = data.health?.components?.database?.status || 'unknown';
        const dbSize = data.database?.size_mb || 0;
        
        statusElement.textContent = dbStatus === 'healthy' ? 'מחובר' : 'לא מחובר';
        statusElement.className = `health-status ${dbStatus === 'healthy' ? 'active' : 'inactive'}`;
        detailsElement.textContent = `גודל: ${dbSize} MB`;
      }
    }
    
    // Cache status
    const cacheCard = healthCards[2];
    if (cacheCard) {
      const statusElement = cacheCard.querySelector('.health-status');
      const detailsElement = cacheCard.querySelector('.health-details');
      
      if (statusElement && detailsElement) {
        const cacheStatus = data.health?.components?.cache?.status || 'unknown';
        const hitRate = data.cache?.hit_rate_percent || 0;
        
        statusElement.textContent = cacheStatus === 'healthy' ? 'בריא' : 'לא בריא';
        statusElement.className = `health-status ${cacheStatus === 'healthy' ? 'active' : 'inactive'}`;
        detailsElement.textContent = `אחוז פגיעות: ${hitRate}%`;
      }
    }
    
    // Network status
    const networkCard = healthCards[3];
    if (networkCard) {
      const statusElement = networkCard.querySelector('.health-status');
      const detailsElement = networkCard.querySelector('.health-details');
      
      if (statusElement && detailsElement) {
        const apiStatus = data.health?.components?.api?.status || 'unknown';
        const responseTime = data.response_time_ms || 0;
        
        statusElement.textContent = apiStatus === 'healthy' ? 'יציב' : 'לא יציב';
        statusElement.className = `health-status ${apiStatus === 'healthy' ? 'active' : 'inactive'}`;
        detailsElement.textContent = `עיכוב: ${responseTime}ms`;
      }
    }
  }

  updateSystemInfo(data) {
    // Update system score in health header
    const systemScore = data.system_score || 0;
    const scoreElement = document.querySelector('.system-score');
    if (scoreElement) {
      scoreElement.textContent = `${systemScore}/100`;
      scoreElement.className = `system-score ${systemScore >= 80 ? 'excellent' : systemScore >= 60 ? 'good' : 'poor'}`;
    }
    
    // Update performance metrics
    const metrics = data.metrics?.performance?.system || {};
    const cpuElement = document.querySelector('.cpu-usage');
    const memoryElement = document.querySelector('.memory-usage');
    const diskElement = document.querySelector('.disk-usage');
    
    if (cpuElement) cpuElement.textContent = `${metrics.cpu_percent || 0}%`;
    if (memoryElement) memoryElement.textContent = `${metrics.memory_percent || 0}%`;
    if (diskElement) diskElement.textContent = `${metrics.disk_percent || 0}%`;
  }

  updateLogs(data) {
    const logContent = document.getElementById('log-content');
    if (!logContent) return;
    
    // Clear existing logs
    logContent.innerHTML = '';
    
    // Add system status log
    const statusLog = document.createElement('div');
    statusLog.className = 'log-entry log-info';
    statusLog.innerHTML = `
      <div class="log-timestamp">${new Date().toLocaleTimeString('he-IL')}</div>
      <div class="log-level">INFO</div>
      <div class="log-message">מערכת ניהול מערכת נטענה בהצלחה - ציון מערכת: ${data.system_score || 0}/100</div>
    `;
    logContent.appendChild(statusLog);
    
    // Add health status logs
    const healthComponents = data.health?.components || {};
    Object.entries(healthComponents).forEach(([component, status]) => {
      const logEntry = document.createElement('div');
      const logLevel = status.status === 'healthy' ? 'log-info' : status.status === 'warning' ? 'log-warning' : 'log-error';
      const levelText = status.status === 'healthy' ? 'INFO' : status.status === 'warning' ? 'WARNING' : 'ERROR';
      
      logEntry.className = `log-entry ${logLevel}`;
      logEntry.innerHTML = `
        <div class="log-timestamp">${new Date().toLocaleTimeString('he-IL')}</div>
        <div class="log-level">${levelText}</div>
        <div class="log-message">${component}: ${status.status} - ביצועים: ${status.performance || 'unknown'}</div>
      `;
      logContent.appendChild(logEntry);
    });
  }

  updatePerformanceMetrics(data) {
    // Update performance indicators
    const performanceIndicators = document.querySelectorAll('.performance-indicator');
    performanceIndicators.forEach(indicator => {
      const type = indicator.dataset.type;
      let value = 0;
      
      switch (type) {
        case 'cpu':
          value = data.metrics?.performance?.system?.cpu_percent || 0;
          break;
        case 'memory':
          value = data.metrics?.performance?.system?.memory_percent || 0;
          break;
        case 'disk':
          value = data.metrics?.performance?.system?.disk_percent || 0;
          break;
        case 'cache':
          value = data.cache?.hit_rate_percent || 0;
          break;
      }
      
      const progressBar = indicator.querySelector('.progress-bar');
      if (progressBar) {
        progressBar.style.width = `${Math.min(value, 100)}%`;
        progressBar.textContent = `${value}%`;
      }
    });
  }

  updateTimestamp(timestamp) {
    const timestampElement = document.querySelector('.last-updated');
    if (timestampElement) {
      const date = new Date(timestamp);
      timestampElement.textContent = `עודכן לאחרונה: ${date.toLocaleString('he-IL')}`;
    }
  }

  async updateExternalData() {
    try {
      const response = await fetch('/api/system/external-data');
      const data = await response.json();
      
      if (data.status === 'success') {
        const externalData = data.data;
        
        // Update last update time
        const lastUpdateElement = document.getElementById('external-last-update');
        if (lastUpdateElement && externalData.last_update) {
          const lastUpdate = new Date(externalData.last_update);
          lastUpdateElement.textContent = lastUpdate.toLocaleString('he-IL');
        }
        
        // Update accuracy
        const accuracyElement = document.getElementById('external-accuracy');
        if (accuracyElement) {
          accuracyElement.textContent = `${externalData.overall_accuracy_percent || 0}%`;
        }
        
        // Update freshness
        const freshnessElement = document.getElementById('external-freshness');
        if (freshnessElement) {
          freshnessElement.textContent = `${externalData.data_freshness_minutes || 0} דקות`;
        }
        
        // Update providers
        const providersElement = document.getElementById('external-providers');
        if (providersElement) {
          providersElement.textContent = externalData.providers?.length || 0;
        }
        
        // Update success rate
        const successRateElement = document.getElementById('external-success-rate');
        if (successRateElement && externalData.accuracy?.overall) {
          successRateElement.textContent = `${externalData.accuracy.overall.success_rate_percent || 0}%`;
        }
        
        // Update overall status
        const overallStatusElement = document.getElementById('external-overall-status');
        if (overallStatusElement) {
          overallStatusElement.textContent = externalData.status === 'active' ? 'פעיל' : 'לא פעיל';
        }
      }
    } catch (error) {
      console.error('Error updating external data:', error);
    }
  }

  async updateAlerts() {
    try {
      const response = await fetch('/api/system/alerts');
      const data = await response.json();
      
      if (data.status === 'success') {
        const alerts = data.data;
        
        // Update alert counts
        const errorCountElement = document.getElementById('error-count');
        const warningCountElement = document.getElementById('warning-count');
        const infoCountElement = document.getElementById('info-count');
        
        if (errorCountElement) errorCountElement.textContent = alerts.summary?.error || 0;
        if (warningCountElement) warningCountElement.textContent = alerts.summary?.warning || 0;
        if (infoCountElement) infoCountElement.textContent = alerts.summary?.info || 0;
        
        // Update alerts list
        const alertsListElement = document.getElementById('alerts-list');
        if (alertsListElement) {
          alertsListElement.innerHTML = '';
          
          if (alerts.alerts && alerts.alerts.length > 0) {
            alerts.alerts.forEach(alert => {
              const alertItem = document.createElement('div');
              alertItem.className = `alert-item ${alert.level}`;
              
              const timestamp = new Date(alert.timestamp).toLocaleTimeString('he-IL');
              
              alertItem.innerHTML = `
                <div class="alert-timestamp">${timestamp}</div>
                <div class="alert-level">${alert.level.toUpperCase()}</div>
                <div class="alert-message">${alert.message}</div>
              `;
              
              alertsListElement.appendChild(alertItem);
            });
          } else {
            const noAlertsItem = document.createElement('div');
            noAlertsItem.className = 'alert-item info';
            noAlertsItem.innerHTML = `
              <div class="alert-timestamp">${new Date().toLocaleTimeString('he-IL')}</div>
              <div class="alert-level">INFO</div>
              <div class="alert-message">אין התראות פעילות</div>
            `;
            alertsListElement.appendChild(noAlertsItem);
          }
        }
      }
    } catch (error) {
      console.error('Error updating alerts:', error);
    }
  }

  showLoadingState() {
    const loadingElement = document.querySelector('.loading-state');
    if (loadingElement) {
      loadingElement.style.display = 'block';
    }
  }

  hideLoadingState() {
    const loadingElement = document.querySelector('.loading-state');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  showErrorState(message) {
    const errorElement = document.querySelector('.error-state');
    if (errorElement) {
      errorElement.textContent = `שגיאה בטעינת נתונים: ${message}`;
      errorElement.style.display = 'block';
    }
  }

  setupAutoRefresh() {
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadSystemData();
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

    // Refresh button
    const refreshButton = document.querySelector('.refresh-btn');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        if (window.systemManagement) {
          window.systemManagement.loadSystemData();
        }
      });
    }
  }

  static filterLogs() {
    const logLevelFilter = document.getElementById('log-level-filter');
    const logSearch = document.getElementById('log-search');
    const logEntries = document.querySelectorAll('.log-entry');
    
    const selectedLevel = logLevelFilter?.value || 'all';
    const searchTerm = logSearch?.value.toLowerCase() || '';
    
    logEntries.forEach(entry => {
      const level = entry.classList.contains('log-info') ? 'info' : 
                   entry.classList.contains('log-warning') ? 'warning' : 'error';
      const message = entry.querySelector('.log-message')?.textContent.toLowerCase() || '';
      
      const levelMatch = selectedLevel === 'all' || level === selectedLevel;
      const searchMatch = searchTerm === '' || message.includes(searchTerm);
      
      entry.style.display = levelMatch && searchMatch ? 'block' : 'none';
    });
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.isInitialized = false;
  }
}

// Global function for copying detailed log
async function copyDetailedLog() {
  try {
    console.log('📋 Generating detailed log...');
    
    // Show loading state
    const copyBtn = document.querySelector('.copy-log-btn');
    if (copyBtn) {
      copyBtn.textContent = '🔄 מייצר לוג...';
      copyBtn.disabled = true;
    }
    
    // Get detailed log from API
    const response = await fetch('/api/system/detailed-log');
    const data = await response.json();
    
    if (data.status === 'success') {
      const detailedLog = data.data.log;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(detailedLog);
      
      // Show success message
      if (window.notificationSystem) {
        window.notificationSystem.showSuccess('לוג מפורט הועתק ללוח!');
      } else {
        alert('לוג מפורט הועתק ללוח!');
      }
      
      console.log('✅ Detailed log copied to clipboard');
    } else {
      throw new Error(data.message || 'Failed to generate detailed log');
    }
    
  } catch (error) {
    console.error('❌ Error copying detailed log:', error);
    
    if (window.notificationSystem) {
      window.notificationSystem.showError(`שגיאה בהעתקת לוג: ${error.message}`);
    } else {
      alert(`שגיאה בהעתקת לוג: ${error.message}`);
    }
  } finally {
    // Reset button
    const copyBtn = document.querySelector('.copy-log-btn');
    if (copyBtn) {
      copyBtn.textContent = '📋 העתק לוג מפורט';
      copyBtn.disabled = false;
    }
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

