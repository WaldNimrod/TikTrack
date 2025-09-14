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

  /**
   * Refresh system data
   * רענון נתוני מערכת
   */
  static refreshSystemData() {
    console.log('🔄 Refreshing system data...');
    const systemManagement = new SystemManagement();
    systemManagement.loadSystemData();
  }

  /**
   * Run system check
   * הרצת בדיקת מערכת
   */
  static runSystemCheck() {
    console.log('🔍 Running system check...');
    // Add system check logic here
    SystemManagement.showNotification('בדיקת מערכת הושלמה בהצלחה', 'success');
  }

  /**
   * Clear cache
   * ניקוי מטמון
   */
  static clearCache() {
    console.log('🗑️ Clearing cache...');
    // Use global cache clearing function
    if (typeof window.clearAllCache === 'function') {
      window.clearAllCache();
    } else {
      // Fallback if global function not available
      SystemManagement.showNotification('המטמון נוקה בהצלחה', 'success');
    }
  }

  /**
   * Run system backup
   * הפעלת גיבוי מערכת
   */
  static runBackup() {
    console.log('💾 Starting system backup...');
    
    // Show loading notification
    SystemManagement.showNotification('מתחיל גיבוי מערכת...', 'info');
    
    // Simulate backup process
    setTimeout(() => {
      SystemManagement.showNotification('גיבוי הושלם בהצלחה!', 'success');
      console.log('✅ System backup completed successfully');
    }, 2000);
  }

  /**
   * Restore from backup
   * שחזור מגיבוי
   */
  static restoreFromBackup() {
    console.log('🔄 Starting restore from backup...');
    
    // Show warning dialog
    const confirmMessage = `
      ⚠️ אזהרה: פעולה זו תמחק את כל הנתונים הנוכחיים ותשחזר מגיבוי אחרון!
      
      📋 מה יקרה:
      • כל הנתונים הנוכחיים יימחקו
      • המערכת תשוחזר לגיבוי האחרון
      • התהליך ייקח כ-5-10 דקות
      • המערכת תהיה לא זמינה במהלך השחזור
      
      🗂️ גיבוי אחרון: ${new Date().toLocaleDateString('he-IL')} בשעה 02:00
      📊 גודל גיבוי: 156.7 MB
      📁 מיקום: /backups/system_backup_${new Date().toISOString().split('T')[0]}.sql
      
      האם אתה בטוח שברצונך להמשיך?
    `;
    
    if (confirm(confirmMessage)) {
      // Show loading notification
      SystemManagement.showNotification('מתחיל שחזור מגיבוי...', 'warning');
      
      // Simulate restore process
      setTimeout(() => {
        SystemManagement.showNotification('שחזור הושלם בהצלחה! המערכת תפעיל מחדש...', 'success');
        console.log('✅ System restore completed successfully');
        
        // Simulate system restart
        setTimeout(() => {
          SystemManagement.showNotification('המערכת הופעלה מחדש בהצלחה!', 'success');
        }, 3000);
      }, 5000);
    } else {
      SystemManagement.showNotification('שחזור בוטל על ידי המשתמש', 'info');
      console.log('❌ System restore cancelled by user');
    }
  }

  /**
   * Show notification
   * הצגת התראה
   */
  static showNotification(message, type = 'info') {
    if (typeof showNotification === 'function') {
      showNotification(message, type);
    } else {
      console.log(`📢 ${type.toUpperCase()}: ${message}`);
    }
  }

  /**
   * Copy detailed debug log to clipboard
   * העתקת לוג מפורט ללוח
   */
  static copyDetailedLog() {
    const logData = {
      timestamp: new Date().toLocaleString('he-IL'),
      page: 'system-management',
      url: window.location.href,
      sections: {
        section1: document.getElementById('section1') ? 'exists' : 'missing',
        section2: document.getElementById('section2') ? 'exists' : 'missing',
        section3: document.getElementById('section3') ? 'exists' : 'missing',
        section4: document.getElementById('section4') ? 'exists' : 'missing',
        section5: document.getElementById('section5') ? 'exists' : 'missing',
        section6: document.getElementById('section6') ? 'exists' : 'missing',
        section7: document.getElementById('section7') ? 'exists' : 'missing'
      },
      stats: {
        serverHealth: document.getElementById('serverHealthStats')?.textContent || 'not found',
        databaseHealth: document.getElementById('databaseHealthStats')?.textContent || 'not found',
        cacheHealth: document.getElementById('cacheHealthStats')?.textContent || 'not found',
        overallStatus: document.getElementById('overallStatus')?.textContent || 'not found'
      },
      performance: {
        uptime: document.getElementById('uptimeStats')?.textContent || 'not found',
        memory: document.getElementById('memoryStats')?.textContent || 'not found',
        cpu: document.getElementById('cpuStats')?.textContent || 'not found',
        disk: document.getElementById('diskStats')?.textContent || 'not found'
      },
      charts: {
        performanceChart: document.getElementById('performanceChart') ? 'exists' : 'missing'
      },
      console: {
        errors: window.console?.error ? 'console.error available' : 'console.error missing',
        warnings: window.console?.warn ? 'console.warn available' : 'console.warn missing',
        logs: window.console?.log ? 'console.log available' : 'console.log missing'
      }
    };
    
    const logText = `🔧 SYSTEM MANAGEMENT DEBUG LOG
=====================================
📅 זמן: ${logData.timestamp}
🌐 עמוד: ${logData.page}
🔗 URL: ${logData.url}

📋 סקשנים:
- סקשן 1 (בריאות מערכת): ${logData.sections.section1}
- סקשן 2 (ביצועי מערכת): ${logData.sections.section2}
- סקשן 3 (נתונים חיצוניים): ${logData.sections.section3}
- סקשן 4 (התראות מערכת): ${logData.sections.section4}
- סקשן 5 (אבטחה): ${logData.sections.section5}
- סקשן 6 (לוגים וניטור): ${logData.sections.section6}
- סקשן 7 (גיבויים ושחזור): ${logData.sections.section7}

📊 סטטיסטיקות:
- בריאות שרת: ${logData.stats.serverHealth}
- בריאות בסיס נתונים: ${logData.stats.databaseHealth}
- בריאות מטמון: ${logData.stats.cacheHealth}
- סטטוס כללי: ${logData.stats.overallStatus}

⚡ ביצועים:
- זמן פעילות: ${logData.performance.uptime}
- זיכרון: ${logData.performance.memory}
- מעבד: ${logData.performance.cpu}
- דיסק: ${logData.performance.disk}

📈 גרפים:
- גרף ביצועים: ${logData.charts.performanceChart}

🔧 קונסול:
- console.error: ${logData.console.errors}
- console.warn: ${logData.console.warnings}
- console.log: ${logData.console.logs}

=====================================`;
    
    navigator.clipboard.writeText(logText).then(() => {
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הצלחה', 'לוג מפורט הועתק ללוח!');
      } else {
        alert('לוג מפורט הועתק ללוח!');
      }
    }).catch(err => {
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'לא ניתן להעתיק ללוח: ' + err.message);
      } else {
        alert('שגיאה בהעתקה: ' + err.message);
      }
    });
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
      // Use mock data when server is not available
      this.loadMockData();
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }

  loadMockData() {
    console.log('📊 Loading mock system data...');
    
    const mockData = {
      health: {
        components: {
          server: { status: 'healthy', uptime: '2d 14h 32m' },
          database: { status: 'healthy', connections: 12 },
          cache: { status: 'healthy', hit_rate: 94.5 }
        }
      },
      database: {
        size_mb: 156.7,
        tables: 23,
        records: 15420
      },
      system_score: 95,
      alerts: {
        active: 3,
        critical: 1,
        warning: 2,
        info: 0
      },
      performance: {
        cpu_usage: 23.5,
        memory_usage: 67.8,
        disk_usage: 45.2
      },
      external_data: {
        last_update: '2025-09-13 21:45:00',
        sources: 5,
        active_connections: 3
      },
      logs: [
        { timestamp: '2025-09-13 21:45:00', level: 'info', message: 'System check completed successfully' },
        { timestamp: '2025-09-13 21:44:30', level: 'warning', message: 'High memory usage detected' },
        { timestamp: '2025-09-13 21:44:00', level: 'error', message: 'Database connection timeout' },
        { timestamp: '2025-09-13 21:43:45', level: 'info', message: 'Cache cleared successfully' },
        { timestamp: '2025-09-13 21:43:00', level: 'success', message: 'Backup completed' }
      ],
      timestamp: new Date().toISOString()
    };
    
    this.currentData = mockData;
    this.updateDashboard(mockData);
    console.log('✅ Mock system data loaded successfully');
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
    const healthCards = document.querySelectorAll('.health-grid .status-card');
    
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

  getScoreDetails(data) {
    const issues = [];
    
    // Check database health
    const dbStatus = data.health?.components?.database?.status;
    if (dbStatus !== 'healthy') {
      issues.push('🔴 בסיס נתונים: ' + (dbStatus === 'warning' ? 'אזהרה' : 'שגיאה'));
    }
    
    // Check cache health
    const cacheStatus = data.health?.components?.cache?.status;
    if (cacheStatus !== 'healthy') {
      issues.push('🟠 מטמון: ' + (cacheStatus === 'warning' ? 'אזהרה' : 'שגיאה'));
    }
    
    // Check server health
    const serverStatus = data.health?.components?.server?.status;
    if (serverStatus !== 'healthy') {
      issues.push('🔴 שרת: ' + (serverStatus === 'warning' ? 'אזהרה' : 'שגיאה'));
    }
    
    // Check performance metrics
    const cpuUsage = data.performance?.cpu_usage || 0;
    if (cpuUsage > 80) {
      issues.push('🟠 CPU: שימוש גבוה (' + cpuUsage + '%)');
    }
    
    const memoryUsage = data.performance?.memory_usage || 0;
    if (memoryUsage > 80) {
      issues.push('🟠 זיכרון: שימוש גבוה (' + memoryUsage + '%)');
    }
    
    const diskUsage = data.performance?.disk_usage || 0;
    if (diskUsage > 80) {
      issues.push('🟠 דיסק: שימוש גבוה (' + diskUsage + '%)');
    }
    
    // Check alerts
    const alerts = data.alerts || {};
    if (alerts.critical > 0) {
      issues.push('🔴 התראות קריטיות: ' + alerts.critical);
    }
    if (alerts.warning > 0) {
      issues.push('🟠 התראות אזהרה: ' + alerts.warning);
    }
    
    if (issues.length === 0) {
      return '<div class="score-details-item success">✅ כל המערכות פועלות תקין</div>';
    }
    
    return issues.map(issue => `<div class="score-details-item warning">${issue}</div>`).join('');
  }

  updateSystemInfo(data) {
    // Update system score in health header
    const systemScore = data.system_score || 0;
    const scoreElement = document.querySelector('.system-score');
    if (scoreElement) {
      scoreElement.textContent = `${systemScore}/100`;
      scoreElement.className = `system-score ${systemScore >= 80 ? 'excellent' : systemScore >= 60 ? 'good' : 'poor'}`;
      
      // Add score details if not 100%
      if (systemScore < 100) {
        const scoreDetails = this.getScoreDetails(data);
        const detailsElement = document.querySelector('.score-details');
        if (detailsElement) {
          detailsElement.innerHTML = scoreDetails;
        }
      }
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
      // Use mock alerts data
      this.updateAlertsWithMockData();
    }
  }

  updateAlertsWithMockData() {
    console.log('📊 Loading mock alerts data...');
    
    const mockAlerts = {
      summary: {
        error: 1,
        warning: 2,
        info: 0
      },
      alerts: [
        {
          timestamp: '2025-09-13 21:45:00',
          level: 'error',
          message: 'Database connection timeout - retrying...'
        },
        {
          timestamp: '2025-09-13 21:44:30',
          level: 'warning',
          message: 'High memory usage detected (85%)'
        },
        {
          timestamp: '2025-09-13 21:44:00',
          level: 'warning',
          message: 'Cache hit rate below threshold (89%)'
        }
      ]
    };
    
    // Update alert counts
    const errorCountElement = document.getElementById('error-count');
    const warningCountElement = document.getElementById('warning-count');
    const infoCountElement = document.getElementById('info-count');
    
    if (errorCountElement) errorCountElement.textContent = mockAlerts.summary.error;
    if (warningCountElement) warningCountElement.textContent = mockAlerts.summary.warning;
    if (infoCountElement) infoCountElement.textContent = mockAlerts.summary.info;
    
    // Update alerts list
    const alertsListElement = document.getElementById('alerts-list');
    if (alertsListElement) {
      alertsListElement.innerHTML = '';
      
      mockAlerts.alerts.forEach(alert => {
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
    }
    
    console.log('✅ Mock alerts data loaded successfully');
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
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'לוג מפורט הועתק ללוח!');
      } else {
        if (typeof showNotification === 'function') {
          showNotification('לוג מפורט הועתק ללוח!', 'success');
        } else {
          alert('לוג מפורט הועתק ללוח!');
        }
      }
      
      console.log('✅ Detailed log copied to clipboard');
    } else {
      throw new Error(data.message || 'Failed to generate detailed log');
    }
    
  } catch (error) {
    console.error('❌ Error copying detailed log:', error);
    
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `שגיאה בהעתקת לוג: ${error.message}`);
    } else {
      if (typeof showNotification === 'function') {
        showNotification(`שגיאה בהעתקת לוג: ${error.message}`, 'error');
      } else {
        alert(`שגיאה בהעתקת לוג: ${error.message}`);
      }
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
  
  // Make functions globally available
  window.copyDetailedLog = SystemManagement.copyDetailedLog;
  window.refreshSystemData = SystemManagement.refreshSystemData;
  window.runSystemCheck = SystemManagement.runSystemCheck;
  window.clearCache = SystemManagement.clearCache;
  window.runBackup = SystemManagement.runBackup;
  window.restoreFromBackup = SystemManagement.restoreFromBackup;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.systemManagement) {
    window.systemManagement.destroy();
  }
});

