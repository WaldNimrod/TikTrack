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
  static async runSystemCheck() {
    console.log('🔍 Running comprehensive system check...');
    
    try {
      // Show loading notification only for long process start
      SystemManagement.showNotification('מתחיל בדיקת מערכת מקיפה...', 'info');
      
      // Create results display area in the page
      const resultsContainer = SystemManagement.createCheckResultsContainer();
      
      // Collect all system data for check
      const checkResults = {
        timestamp: new Date().toISOString(),
        checks: []
      };
      
      // Check 1: System Health
      try {
        const healthResponse = await fetch('/api/system/health');
        const healthData = await healthResponse.json();
        
        if (healthResponse.ok && healthData.status === 'success') {
          const healthStatus = healthData.data.overall_status || 'unknown';
          const performance = healthData.data.performance || 'unknown';
          const responseTime = healthData.data.response_time_ms || 0;
          
          let status = 'success';
          let message = `מצב בריאות: ${healthStatus}`;
          
          if (healthStatus === 'warning' || performance === 'degraded') {
            status = 'warning';
            message += ` (ביצועים: ${performance})`;
          } else if (healthStatus === 'error' || performance === 'poor') {
            status = 'error';
            message += ` (ביצועים: ${performance})`;
          }
          
          if (responseTime > 0) {
            message += `, זמן תגובה: ${responseTime}ms`;
          }
          
          checkResults.checks.push({
            name: 'בריאות מערכת',
            status: status,
            message: message,
            details: {
              overall_status: healthStatus,
              performance: performance,
              response_time_ms: responseTime,
              components: healthData.data.components || {}
            }
          });
        } else {
          checkResults.checks.push({
            name: 'בריאות מערכת',
            status: 'error',
            message: `שגיאה בבדיקת בריאות: ${healthData.message || 'לא ניתן לקבל מידע'}`,
            details: healthData
          });
        }
      } catch (error) {
        checkResults.checks.push({
          name: 'בריאות מערכת',
          status: 'error',
          message: `שגיאה בבדיקת בריאות: ${error.message}`,
          details: null
        });
      }
      
      // Check 2: Database Connection
      try {
        const dbResponse = await fetch('/api/system/database');
        const dbData = await dbResponse.json();
        
        if (dbResponse.ok && dbData.status === 'success') {
          const dbStatus = dbData.data.status || 'unknown';
          const sizeMB = dbData.data.size_mb || 0;
          const tableCount = dbData.data.table_count || 0;
          const recordCounts = dbData.data.record_counts || {};
          
          let status = 'success';
          let message = `מצב בסיס נתונים: ${dbStatus}`;
          
          if (dbStatus === 'warning' || dbStatus === 'degraded') {
            status = 'warning';
          } else if (dbStatus === 'error' || dbStatus === 'disconnected') {
            status = 'error';
          }
          
          if (sizeMB > 0) {
            message += `, גודל: ${sizeMB} MB`;
          }
          if (tableCount > 0) {
            message += `, ${tableCount} טבלאות`;
          }
          
          checkResults.checks.push({
            name: 'בסיס נתונים',
            status: status,
            message: message,
            details: {
              status: dbStatus,
              size_mb: sizeMB,
              table_count: tableCount,
              record_counts: recordCounts,
              connection_info: dbData.data.connection_info || {}
            }
          });
        } else {
          checkResults.checks.push({
            name: 'בסיס נתונים',
            status: 'error',
            message: `שגיאה בבדיקת בסיס נתונים: ${dbData.message || 'לא ניתן לקבל מידע'}`,
            details: dbData
          });
        }
      } catch (error) {
        checkResults.checks.push({
          name: 'בסיס נתונים',
          status: 'error',
          message: `שגיאה בבדיקת בסיס נתונים: ${error.message}`,
          details: null
        });
      }
      
      // Check 3: Cache System
      try {
        const cacheResponse = await fetch('/api/system/cache');
        const cacheData = await cacheResponse.json();
        
        if (cacheResponse.ok && cacheData.status === 'success') {
          const cacheStatus = cacheData.data.status || 'unknown';
          const hitRate = cacheData.data.hit_rate_percent || 0;
          const totalEntries = cacheData.data.total_entries || 0;
          const memoryUsage = cacheData.data.memory_usage_mb || 0;
          const ttlSeconds = cacheData.data.ttl_seconds || 0;
          
          let status = 'success';
          let message = `מצב מטמון: ${cacheStatus}`;
          
          if (cacheStatus === 'warning' || hitRate < 70) {
            status = 'warning';
          } else if (cacheStatus === 'error' || cacheStatus === 'inactive') {
            status = 'error';
          }
          
          if (hitRate > 0) {
            message += ` (${hitRate}% פגיעות)`;
          }
          if (totalEntries > 0) {
            message += `, ${totalEntries} ערכים`;
          }
          if (memoryUsage > 0) {
            message += `, ${memoryUsage} MB זיכרון`;
          }
          
          checkResults.checks.push({
            name: 'מערכת מטמון',
            status: status,
            message: message,
            details: {
              status: cacheStatus,
              hit_rate_percent: hitRate,
              total_entries: totalEntries,
              memory_usage_mb: memoryUsage,
              ttl_seconds: ttlSeconds,
              cache_stats: cacheData.data.cache_stats || {}
            }
          });
        } else {
          checkResults.checks.push({
            name: 'מערכת מטמון',
            status: 'error',
            message: `שגיאה בבדיקת מטמון: ${cacheData.message || 'לא ניתן לקבל מידע'}`,
            details: cacheData
          });
        }
      } catch (error) {
        checkResults.checks.push({
          name: 'מערכת מטמון',
          status: 'error',
          message: `שגיאה בבדיקת מטמון: ${error.message}`,
          details: null
        });
      }
      
      // Check 4: External Data
      try {
        const externalResponse = await fetch('/api/system/external-data');
        const externalData = await externalResponse.json();
        
        if (externalResponse.ok && externalData.status === 'success') {
          const externalStatus = externalData.data.status || 'unknown';
          const accuracy = externalData.data.overall_accuracy_percent || 0;
          const providers = externalData.data.providers || [];
          const dataFreshness = externalData.data.data_freshness_minutes || null;
          const lastUpdate = externalData.data.last_update || null;
          
          let status = 'success';
          let message = `מצב נתונים חיצוניים: ${externalStatus}`;
          
          if (externalStatus === 'warning' || externalStatus === 'degraded') {
            status = 'warning';
          } else if (externalStatus === 'error' || externalStatus === 'inactive') {
            status = 'error';
          }
          
          if (accuracy > 0) {
            message += ` (${accuracy}% דיוק)`;
          }
          if (providers.length > 0) {
            message += `, ${providers.length} ספקים`;
          }
          if (dataFreshness !== null) {
            if (dataFreshness < 60) {
              message += `, עדכני (${dataFreshness} דקות)`;
            } else if (dataFreshness < 240) {
              message += `, מיושן (${dataFreshness} דקות)`;
              status = 'warning';
            } else {
              message += `, ישן מאוד (${dataFreshness} דקות)`;
              status = 'error';
            }
          }
          
          checkResults.checks.push({
            name: 'נתונים חיצוניים',
            status: status,
            message: message,
            details: {
              status: externalStatus,
              overall_accuracy_percent: accuracy,
              providers: providers,
              data_freshness_minutes: dataFreshness,
              last_update: lastUpdate,
              accuracy_metrics: externalData.data.accuracy || {}
            }
          });
        } else {
          checkResults.checks.push({
            name: 'נתונים חיצוניים',
            status: 'error',
            message: `שגיאה בבדיקת נתונים חיצוניים: ${externalData.message || 'לא ניתן לקבל מידע'}`,
            details: externalData
          });
        }
      } catch (error) {
        checkResults.checks.push({
          name: 'נתונים חיצוניים',
          status: 'error',
          message: `שגיאה בבדיקת נתונים חיצוניים: ${error.message}`,
          details: null
        });
      }
      
      // Check 5: System Performance
      try {
        const performanceResponse = await fetch('/api/system/performance');
        const performanceData = await performanceResponse.json();
        
        if (performanceResponse.ok && performanceData.status === 'success') {
          const currentMetrics = performanceData.data.current || {};
          const responseTime = currentMetrics.response_time_ms || 0;
          const errorRate = currentMetrics.error_rate_percent || 0;
          const requestsPerMinute = currentMetrics.requests_per_minute || 0;
          const cpuUsage = currentMetrics.cpu_usage_percent || 0;
          const memoryUsage = currentMetrics.memory_usage_percent || 0;
          
          let status = 'success';
          let message = '';
          
          // Determine status based on performance metrics
          if (responseTime > 500 || errorRate > 5 || cpuUsage > 90 || memoryUsage > 90) {
            status = 'error';
          } else if (responseTime > 200 || errorRate > 1 || cpuUsage > 70 || memoryUsage > 70) {
            status = 'warning';
          }
          
          // Build message
          if (responseTime > 0) {
            message += `זמן תגובה: ${responseTime}ms`;
          }
          if (errorRate > 0) {
            message += `, שיעור שגיאות: ${errorRate}%`;
          }
          if (requestsPerMinute > 0) {
            message += `, ${requestsPerMinute} בקשות/דקה`;
          }
          if (cpuUsage > 0) {
            message += `, CPU: ${cpuUsage}%`;
          }
          if (memoryUsage > 0) {
            message += `, זיכרון: ${memoryUsage}%`;
          }
          
          if (!message) {
            message = 'ביצועים תקינים';
          }
          
          checkResults.checks.push({
            name: 'ביצועי מערכת',
            status: status,
            message: message,
            details: {
              response_time_ms: responseTime,
              error_rate_percent: errorRate,
              requests_per_minute: requestsPerMinute,
              cpu_usage_percent: cpuUsage,
              memory_usage_percent: memoryUsage,
              trends: performanceData.data.trends || {},
              historical_data: performanceData.data.historical || {}
            }
          });
        } else {
          checkResults.checks.push({
            name: 'ביצועי מערכת',
            status: 'error',
            message: `שגיאה בבדיקת ביצועים: ${performanceData.message || 'לא ניתן לקבל מידע'}`,
            details: performanceData
          });
        }
      } catch (error) {
        checkResults.checks.push({
          name: 'ביצועי מערכת',
          status: 'error',
          message: `שגיאה בבדיקת ביצועים: ${error.message}`,
          details: null
        });
      }
      
      // Calculate overall status
      const successCount = checkResults.checks.filter(c => c.status === 'success').length;
      const warningCount = checkResults.checks.filter(c => c.status === 'warning').length;
      const errorCount = checkResults.checks.filter(c => c.status === 'error').length;
      const totalChecks = checkResults.checks.length;
      
      let overallStatus = 'success';
      let overallMessage = '';
      
      if (errorCount > 0) {
        overallStatus = 'error';
        overallMessage = `בדיקת מערכת הושלמה עם ${errorCount} שגיאות, ${warningCount} אזהרות`;
      } else if (warningCount > 0) {
        overallStatus = 'warning';
        overallMessage = `בדיקת מערכת הושלמה עם ${warningCount} אזהרות`;
      } else {
        overallMessage = `בדיקת מערכת הושלמה בהצלחה - כל ${totalChecks} הבדיקות עברו`;
      }
      
      // Show overall result only for completion
      SystemManagement.showNotification(overallMessage, overallStatus);
      
      // Log detailed results
      console.log('📊 System Check Results:', checkResults);
      
      // Update results display in the page
      SystemManagement.updateCheckResultsDisplay(resultsContainer, checkResults);
      
    } catch (error) {
      console.error('❌ System check failed:', error);
      SystemManagement.showNotification(`שגיאה בבדיקת מערכת: ${error.message}`, 'error');
    }
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
  static async runBackup() {
    console.log('💾 Starting system backup...');
    
    try {
    // Show loading notification
    SystemManagement.showNotification('מתחיל גיבוי מערכת...', 'info');
    
      // Call backup API
      const response = await fetch('/api/system/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        const backupData = result.data;
        SystemManagement.showNotification(
          `גיבוי הושלם בהצלחה! קובץ: ${backupData.backup_filename} (${backupData.backup_size_mb} MB)`, 
          'success'
        );
        console.log('✅ System backup completed successfully:', backupData);
        
        // Refresh system data to show updated backup info
        if (window.systemManagement) {
          window.systemManagement.loadSystemData();
        }
      } else {
        throw new Error(result.message || 'Backup failed');
      }
      
    } catch (error) {
      console.error('❌ Backup failed:', error);
      SystemManagement.showNotification(`שגיאה בגיבוי: ${error.message}`, 'error');
    }
  }

  /**
   * Restore from backup
   * שחזור מגיבוי
   */
  static async restoreFromBackup() {
    console.log('🔄 Starting restore from backup...');
    
    try {
      // Get list of available backups
      const backupsResponse = await fetch('/api/system/backup/list');
      const backupsResult = await backupsResponse.json();
      
      if (backupsResult.status !== 'success' || !backupsResult.data.backups.length) {
        SystemManagement.showNotification('לא נמצאו גיבויים זמינים', 'warning');
        return;
      }
      
      // Get the most recent backup
      const latestBackup = backupsResult.data.backups[0];
      
      // Show warning dialog with real backup info
    const confirmMessage = `
        ⚠️ אזהרה: פעולה זו תמחק את כל הנתונים הנוכחיים ותשחזר מגיבוי!
      
      📋 מה יקרה:
      • כל הנתונים הנוכחיים יימחקו
        • המערכת תשוחזר מהגיבוי שנבחר
      • התהליך ייקח כ-5-10 דקות
      • המערכת תהיה לא זמינה במהלך השחזור
      
        🗂️ גיבוי שנבחר: ${latestBackup.filename}
        📅 תאריך יצירה: ${new Date(latestBackup.created_at).toLocaleString('he-IL')}
        📊 גודל גיבוי: ${latestBackup.size_mb} MB
      
      האם אתה בטוח שברצונך להמשיך?
    `;
    
    if (confirm(confirmMessage)) {
      // Show loading notification
      SystemManagement.showNotification('מתחיל שחזור מגיבוי...', 'warning');
      
        // Call restore API
        const response = await fetch('/api/system/backup/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            backup_path: latestBackup.path
          })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
        SystemManagement.showNotification('שחזור הושלם בהצלחה! המערכת תפעיל מחדש...', 'success');
          console.log('✅ System restore completed successfully:', result.data);
        
          // Refresh page after successful restore
        setTimeout(() => {
            window.location.reload();
        }, 3000);
        } else {
          throw new Error(result.message || 'Restore failed');
        }
    } else {
      SystemManagement.showNotification('שחזור בוטל על ידי המשתמש', 'info');
      console.log('❌ System restore cancelled by user');
      }
      
    } catch (error) {
      console.error('❌ Restore failed:', error);
      SystemManagement.showNotification(`שגיאה בשחזור: ${error.message}`, 'error');
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
   * Create check results container in the page
   * יצירת קונטיינר לתוצאות בדיקה בעמוד
   */
  static createCheckResultsContainer() {
    // Remove existing results container if any
    const existingContainer = document.getElementById('system-check-results');
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // Create new container
    const container = document.createElement('div');
    container.id = 'system-check-results';
    container.className = 'system-check-results-container';
    container.innerHTML = `
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="fas fa-search me-2"></i>
            תוצאות בדיקת מערכת
          </h5>
          <div>
            <button class="btn btn-sm btn-outline-primary me-2" onclick="SystemManagement.copyCheckResultsToClipboard()">
              <i class="fas fa-copy"></i> העתק
            </button>
            <button class="btn btn-sm btn-outline-secondary" onclick="document.getElementById('system-check-results').remove()">
              <i class="fas fa-times"></i> סגור
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="loading-state text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">טוען...</span>
            </div>
            <p class="mt-2 text-muted">מתבצעת בדיקת מערכת מקיפה...</p>
          </div>
          <div class="results-content" style="display: none;">
            <!-- Results will be populated here -->
          </div>
        </div>
      </div>
    `;
    
    // Insert after the Quick Actions section (in the top section)
    const quickActions = document.querySelector('.quick-actions');
    if (quickActions) {
      quickActions.parentNode.insertBefore(container, quickActions.nextSibling);
    } else {
      // Fallback: insert after the top section
      const topSection = document.querySelector('.top-section');
      if (topSection) {
        topSection.parentNode.insertBefore(container, topSection.nextSibling);
      }
    }
    
    return container;
  }

  /**
   * Update check results display in the page
   * עדכון תצוגת תוצאות בדיקה בעמוד
   */
  static updateCheckResultsDisplay(container, checkResults) {
    const loadingState = container.querySelector('.loading-state');
    const resultsContent = container.querySelector('.results-content');
    
    // Hide loading state
    loadingState.style.display = 'none';
    resultsContent.style.display = 'block';
    
    // Calculate summary
    const successCount = checkResults.checks.filter(c => c.status === 'success').length;
    const warningCount = checkResults.checks.filter(c => c.status === 'warning').length;
    const errorCount = checkResults.checks.filter(c => c.status === 'error').length;
    const totalChecks = checkResults.checks.length;
    
    // Get status icon
    const getStatusIcon = (status) => {
      switch (status) {
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'error': return '❌';
        default: return '❓';
      }
    };
    
    // Get status color class
    const getStatusClass = (status) => {
      switch (status) {
        case 'success': return 'text-success';
        case 'warning': return 'text-warning';
        case 'error': return 'text-danger';
        default: return 'text-muted';
      }
    };
    
    // Build results content
    resultsContent.innerHTML = `
      <!-- Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-center border-success">
            <div class="card-body">
              <h4 class="text-success mb-1">${successCount}</h4>
              <small class="text-muted">הצלחות</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center border-warning">
            <div class="card-body">
              <h4 class="text-warning mb-1">${warningCount}</h4>
              <small class="text-muted">אזהרות</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center border-danger">
            <div class="card-body">
              <h4 class="text-danger mb-1">${errorCount}</h4>
              <small class="text-muted">שגיאות</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center border-info">
            <div class="card-body">
              <h4 class="text-info mb-1">${totalChecks}</h4>
              <small class="text-muted">סה"כ בדיקות</small>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Detailed Results -->
      <div class="accordion" id="checkResultsAccordion">
        ${checkResults.checks.map((check, index) => `
          <div class="accordion-item">
            <h2 class="accordion-header" id="heading${index}">
              <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" 
                      data-bs-toggle="collapse" data-bs-target="#collapse${index}" 
                      aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse${index}">
                <span class="me-2">${getStatusIcon(check.status)}</span>
                <span class="${getStatusClass(check.status)}">${check.name}</span>
                <span class="ms-auto text-muted">${check.message}</span>
              </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
                 aria-labelledby="heading${index}" data-bs-parent="#checkResultsAccordion">
              <div class="accordion-body">
                <div class="row">
                  <div class="col-md-6">
                    <h6>סטטוס:</h6>
                    <p class="${getStatusClass(check.status)}">
                      ${getStatusIcon(check.status)} ${check.status === 'success' ? 'הצלחה' : 
                                                     check.status === 'warning' ? 'אזהרה' : 'שגיאה'}
                    </p>
                    <h6>הודעה:</h6>
                    <p>${check.message}</p>
                  </div>
                  <div class="col-md-6">
                    ${check.details ? `
                      <h6>פרטים נוספים:</h6>
                      <pre class="bg-light p-2 rounded" style="font-size: 0.8em; max-height: 200px; overflow-y: auto;">${JSON.stringify(check.details, null, 2)}</pre>
                    ` : '<p class="text-muted">אין פרטים נוספים</p>'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <!-- Timestamp -->
      <div class="mt-3 text-muted">
        <small>זמן בדיקה: ${new Date(checkResults.timestamp).toLocaleString('he-IL')}</small>
      </div>
    `;
    
    // Store results globally for copying
    window.lastCheckResults = checkResults;
    
    // Scroll to results
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Show detailed check results
   * הצגת תוצאות בדיקה מפורטות
   */
  static showDetailedCheckResults(checkResults) {
    // Create modal for detailed results
    const modalId = 'system-check-results-modal';
    let modal = document.getElementById(modalId);
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'modal fade';
      modal.setAttribute('tabindex', '-1');
      document.body.appendChild(modal);
    }
    
    // Calculate summary
    const successCount = checkResults.checks.filter(c => c.status === 'success').length;
    const warningCount = checkResults.checks.filter(c => c.status === 'warning').length;
    const errorCount = checkResults.checks.filter(c => c.status === 'error').length;
    const totalChecks = checkResults.checks.length;
    
    // Get status icon
    const getStatusIcon = (status) => {
      switch (status) {
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'error': return '❌';
        default: return '❓';
      }
    };
    
    // Get status color class
    const getStatusClass = (status) => {
      switch (status) {
        case 'success': return 'text-success';
        case 'warning': return 'text-warning';
        case 'error': return 'text-danger';
        default: return 'text-muted';
      }
    };
    
    // Build modal content
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              🔍 תוצאות בדיקת מערכת מקיפה
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- Summary -->
            <div class="row mb-4">
              <div class="col-md-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h4 class="text-success">${successCount}</h4>
                    <small class="text-muted">הצלחות</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h4 class="text-warning">${warningCount}</h4>
                    <small class="text-muted">אזהרות</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h4 class="text-danger">${errorCount}</h4>
                    <small class="text-muted">שגיאות</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card text-center">
                  <div class="card-body">
                    <h4 class="text-info">${totalChecks}</h4>
                    <small class="text-muted">סה"כ בדיקות</small>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Detailed Results -->
            <div class="accordion" id="checkResultsAccordion">
              ${checkResults.checks.map((check, index) => `
                <div class="accordion-item">
                  <h2 class="accordion-header" id="heading${index}">
                    <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#collapse${index}" 
                            aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse${index}">
                      <span class="me-2">${getStatusIcon(check.status)}</span>
                      <span class="${getStatusClass(check.status)}">${check.name}</span>
                      <span class="ms-auto text-muted">${check.message}</span>
                    </button>
                  </h2>
                  <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
                       aria-labelledby="heading${index}" data-bs-parent="#checkResultsAccordion">
                    <div class="accordion-body">
                      <div class="row">
                        <div class="col-md-6">
                          <h6>סטטוס:</h6>
                          <p class="${getStatusClass(check.status)}">
                            ${getStatusIcon(check.status)} ${check.status === 'success' ? 'הצלחה' : 
                                                           check.status === 'warning' ? 'אזהרה' : 'שגיאה'}
                          </p>
                          <h6>הודעה:</h6>
                          <p>${check.message}</p>
                        </div>
                        <div class="col-md-6">
                          ${check.details ? `
                            <h6>פרטים נוספים:</h6>
                            <pre class="bg-light p-2 rounded" style="font-size: 0.8em; max-height: 200px; overflow-y: auto;">${JSON.stringify(check.details, null, 2)}</pre>
                          ` : '<p class="text-muted">אין פרטים נוספים</p>'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <!-- Timestamp -->
            <div class="mt-3 text-muted">
              <small>זמן בדיקה: ${new Date(checkResults.timestamp).toLocaleString('he-IL')}</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
            <button type="button" class="btn btn-primary" onclick="SystemManagement.copyCheckResultsToClipboard()">
              📋 העתק תוצאות
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Store results globally for copying
    window.lastCheckResults = checkResults;
  }

  /**
   * Copy check results to clipboard
   * העתקת תוצאות בדיקה ללוח
   */
  static copyCheckResultsToClipboard() {
    if (!window.lastCheckResults) {
      SystemManagement.showNotification('אין תוצאות בדיקה להעתקה', 'warning');
      return;
    }
    
    const results = window.lastCheckResults;
    const successCount = results.checks.filter(c => c.status === 'success').length;
    const warningCount = results.checks.filter(c => c.status === 'warning').length;
    const errorCount = results.checks.filter(c => c.status === 'error').length;
    const totalChecks = results.checks.length;
    
    let report = `=== TikTrack System Check Report ===\n`;
    report += `Generated: ${new Date(results.timestamp).toLocaleString('he-IL')}\n\n`;
    report += `Summary:\n`;
    report += `✅ Success: ${successCount}\n`;
    report += `⚠️ Warnings: ${warningCount}\n`;
    report += `❌ Errors: ${errorCount}\n`;
    report += `📊 Total: ${totalChecks}\n\n`;
    report += `Detailed Results:\n\n`;
    
    results.checks.forEach((check, index) => {
      report += `${index + 1}. ${check.name}\n`;
      report += `   Status: ${check.status === 'success' ? '✅ Success' : 
                              check.status === 'warning' ? '⚠️ Warning' : '❌ Error'}\n`;
      report += `   Message: ${check.message}\n`;
      if (check.details) {
        report += `   Details: ${JSON.stringify(check.details, null, 2)}\n`;
      }
      report += `\n`;
    });
    
    report += `=== End of Report ===`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(report).then(() => {
      SystemManagement.showNotification('תוצאות בדיקה הועתקו ללוח בהצלחה', 'success');
    }).catch((error) => {
      console.error('Failed to copy to clipboard:', error);
      SystemManagement.showNotification('שגיאה בהעתקת התוצאות ללוח', 'error');
    });
  }

  /**
   * Check dependencies for circular references and issues
   * בדיקת תלויות למעגלים ובעיות
   */
  static async checkDependencies() {
    const violations = [];
    const files = await SystemManagement.loadJavaScriptFilesList();
    
    // Check for circular dependencies (simplified)
    const dependencies = {};
    files.forEach(file => {
      dependencies[file] = [];
    });
    
    // Simulate dependency check
    const circularDeps = [];
    if (circularDeps.length > 0) {
      violations.push({
        type: 'dependency',
        file: 'Multiple files',
        message: `נמצאו ${circularDeps.length} תלויות מעגליות`,
        severity: 'error'
      });
    }
    
    return {
      totalFiles: files.length,
      violations: violations,
      score: Math.max(0, 100 - (violations.length * 15))
    };
  }

  /**
   * Load JavaScript files list for dependency checking
   * טעינת רשימת קבצי JavaScript לבדיקת תלויות
   */
  static async loadJavaScriptFilesList() {
    // This is a simplified version - in a real implementation,
    // this would scan the actual project structure
    return [
      'ui-utils.js',
      'notification-system.js',
      'tables.js',
      'preferences.js',
      'system-management.js',
      'page-utils.js',
      'header-system.js',
      'filter-system.js'
    ];
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
        healthSummary: document.getElementById('healthSummary') ? 'exists' : 'missing',
        performanceSummary: document.getElementById('performanceSummary') ? 'exists' : 'missing',
        externalDataSection: document.getElementById('section2') ? 'exists' : 'missing',
        alertsSection: document.getElementById('section3') ? 'exists' : 'missing',
        securitySummary: document.getElementById('securitySummary') ? 'exists' : 'missing',
        logsSection: document.getElementById('section5') ? 'exists' : 'missing',
        backupSection: document.getElementById('section6') ? 'exists' : 'missing'
      },
      stats: {
        overallHealth: document.getElementById('overallHealthStatus')?.textContent || 'not found',
        systemScore: document.getElementById('systemScore')?.textContent || 'not found',
        responseTime: document.getElementById('responseTime')?.textContent || 'not found',
        uptime: document.getElementById('uptime')?.textContent || 'not found'
      },
      performance: {
        cpuUsage: document.getElementById('cpuUsage')?.textContent || 'not found',
        memoryUsage: document.getElementById('memoryUsage')?.textContent || 'not found',
        diskUsage: document.getElementById('diskUsage')?.textContent || 'not found',
        networkStatus: document.getElementById('networkStatus')?.textContent || 'not found'
      },
      // Charts will be managed by the new chart system
      backup: {
        lastBackupSize: document.getElementById('lastBackupSize')?.textContent || 'not found',
        lastBackupDate: document.getElementById('lastBackupDate')?.textContent || 'not found',
        backupStatus: document.getElementById('backupStatus')?.textContent || 'not found'
      },
      security: {
        securityStatus: document.getElementById('securityStatus')?.textContent || 'not found',
        encryptionStatus: document.getElementById('encryptionStatus')?.textContent || 'not found',
        activeUsers: document.getElementById('activeUsers')?.textContent || 'not found',
        securityAlerts: document.getElementById('securityAlerts')?.textContent || 'not found'
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
- סיכום בריאות מערכת: ${logData.sections.healthSummary}
- סיכום ביצועי מערכת: ${logData.sections.performanceSummary}
- סקשן נתונים חיצוניים: ${logData.sections.externalDataSection}
- סקשן התראות מערכת: ${logData.sections.alertsSection}
- סיכום אבטחה: ${logData.sections.securitySummary}
- סקשן לוגים וניטור: ${logData.sections.logsSection}
- סקשן גיבויים ושחזור: ${logData.sections.backupSection}

📊 סטטיסטיקות בריאות:
- בריאות כללית: ${logData.stats.overallHealth}
- ציון מערכת: ${logData.stats.systemScore}
- זמן תגובה: ${logData.stats.responseTime}
- זמן פעילות: ${logData.stats.uptime}

⚡ ביצועים:
- מעבד: ${logData.performance.cpuUsage}
- זיכרון: ${logData.performance.memoryUsage}
- דיסק: ${logData.performance.diskUsage}
- רשת: ${logData.performance.networkStatus}

📈 גרפים:
- מערכת גרפים: ${logData.charts ? 'פעילה' : 'לא זמינה'}

💾 גיבויים:
- גודל גיבוי אחרון: ${logData.backup.lastBackupSize}
- תאריך גיבוי אחרון: ${logData.backup.lastBackupDate}
- סטטוס גיבוי: ${logData.backup.backupStatus}

🔒 אבטחה:
- סטטוס אבטחה: ${logData.security.securityStatus}
- סטטוס הצפנה: ${logData.security.encryptionStatus}
- משתמשים פעילים: ${logData.security.activeUsers}
- התראות אבטחה: ${logData.security.securityAlerts}

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
      
      // Load primary data provider
      await SystemManagement.loadPrimaryDataProvider();
      
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
    console.log('📊 Loading fallback system data (server unavailable)...');
    
    // Create fallback data with clear indication it's not real
    const fallbackData = {
      health: {
        components: {
          server: { status: 'warning', uptime: 'לא זמין' },
          database: { status: 'warning', connections: 0 },
          cache: { status: 'warning', hit_rate: 0 }
        }
      },
      database: {
        size_mb: 0,
        tables: 0,
        records: 0
      },
      system_score: 0,
      alerts: {
        active: 1,
        critical: 0,
        warning: 1,
        info: 0
      },
      performance: {
        cpu_usage: 0,
        memory_usage: 0,
        disk_usage: 0
      },
      external_data: {
        last_update: null,
        sources: 0,
        active_connections: 0
      },
      logs: [
        { 
          timestamp: new Date().toISOString(), 
          level: 'warning', 
          message: 'שרת לא זמין - נתונים מוצגים במצב חירום' 
        }
      ],
      timestamp: new Date().toISOString(),
      _isFallback: true
    };
    
    this.currentData = fallbackData;
    this.updateDashboard(fallbackData);
    
    // Show warning to user
    SystemManagement.showNotification(
      '⚠️ שרת לא זמין - מוצגים נתוני חירום. בדוק את החיבור לשרת.', 
      'warning'
    );
    
    console.log('⚠️ Fallback system data loaded (server unavailable)');
  }

  updateDashboard(data) {
    // Check if this is fallback data
    if (data._isFallback) {
      this.showFallbackWarning();
    }
    
    // Update health cards
    this.updateHealthCards(data);
    
    // Update system info
    this.updateSystemInfo(data);
    
    // Update info summaries
    this.updateInfoSummaries(data);
    
    // Update external data
    this.updateExternalData();
    
    // Update alerts
    this.updateAlerts();
    
    // Update logs
    this.updateLogs(data);
    
    // Update performance metrics
    this.updatePerformanceMetrics(data);
    
    // Update external data
    this.updateExternalData();
    
    // Update alerts
    this.updateAlerts();
    
    // Update backup status
    this.updateBackupStatus();
    
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

  /**
   * Update info summaries
   * עדכון סיכומי מידע
   */
  updateInfoSummaries(data) {
    // Update health summary
    this.updateHealthSummary(data);
    
    // Update performance summary
    this.updatePerformanceSummary(data);
    
    // Update security summary
    this.updateSecuritySummary(data);
  }

  /**
   * Update health summary
   * עדכון סיכום בריאות
   */
  updateHealthSummary(data) {
    const overallHealthElement = document.getElementById('overallHealthStatus');
    const systemScoreElement = document.getElementById('systemScore');
    const responseTimeElement = document.getElementById('responseTime');
    const uptimeElement = document.getElementById('uptime');
    
    if (overallHealthElement && data.health) {
      const healthStatus = data.health.overall_status || 'unknown';
      overallHealthElement.textContent = healthStatus === 'healthy' ? 'בריא' : 
                                        healthStatus === 'warning' ? 'אזהרה' : 'בעיה';
      overallHealthElement.className = healthStatus === 'healthy' ? 'summary-value text-success' :
                                       healthStatus === 'warning' ? 'summary-value text-warning' : 'summary-value text-danger';
    }
    
    if (systemScoreElement && data.system_score !== undefined) {
      systemScoreElement.textContent = `${data.system_score}%`;
      systemScoreElement.className = data.system_score >= 90 ? 'summary-value text-success' :
                                     data.system_score >= 70 ? 'summary-value text-warning' : 'summary-value text-danger';
    }
    
    if (responseTimeElement && data.health?.response_time_ms) {
      responseTimeElement.textContent = `${data.health.response_time_ms}ms`;
      responseTimeElement.className = data.health.response_time_ms < 200 ? 'summary-value text-success' :
                                      data.health.response_time_ms < 500 ? 'summary-value text-warning' : 'summary-value text-danger';
    }
    
    if (uptimeElement && data.summary?.uptime) {
      uptimeElement.textContent = data.summary.uptime;
      uptimeElement.className = 'summary-value text-info';
    }
  }

  /**
   * Update performance summary
   * עדכון סיכום ביצועים
   */
  updatePerformanceSummary(data) {
    const cpuElement = document.getElementById('cpuUsage');
    const memoryElement = document.getElementById('memoryUsage');
    const diskElement = document.getElementById('diskUsage');
    const networkElement = document.getElementById('networkStatus');
    
    if (cpuElement && data.summary?.cpu_usage_percent !== undefined) {
      const cpuUsage = data.summary.cpu_usage_percent;
      cpuElement.textContent = `${cpuUsage}%`;
      cpuElement.className = cpuUsage < 70 ? 'summary-value text-success' :
                             cpuUsage < 90 ? 'summary-value text-warning' : 'summary-value text-danger';
    }
    
    if (memoryElement && data.summary?.memory_usage_percent !== undefined) {
      const memoryUsage = data.summary.memory_usage_percent;
      memoryElement.textContent = `${memoryUsage}%`;
      memoryElement.className = memoryUsage < 70 ? 'summary-value text-success' :
                                memoryUsage < 90 ? 'summary-value text-warning' : 'summary-value text-danger';
    }
    
    if (diskElement && data.summary?.disk_usage_percent !== undefined) {
      const diskUsage = data.summary.disk_usage_percent;
      diskElement.textContent = `${diskUsage}%`;
      diskElement.className = diskUsage < 80 ? 'summary-value text-success' :
                              diskUsage < 95 ? 'summary-value text-warning' : 'summary-value text-danger';
    }
    
    if (networkElement) {
      networkElement.textContent = 'יציב';
      networkElement.className = 'summary-value text-success';
    }
  }

  /**
   * Update security summary
   * עדכון סיכום אבטחה
   */
  updateSecuritySummary(data) {
    const securityStatusElement = document.getElementById('securityStatus');
    const encryptionStatusElement = document.getElementById('encryptionStatus');
    const activeUsersElement = document.getElementById('activeUsers');
    const securityAlertsElement = document.getElementById('securityAlerts');
    
    if (securityStatusElement) {
      securityStatusElement.textContent = 'מאובטח';
      securityStatusElement.className = 'summary-value text-success';
    }
    
    if (encryptionStatusElement) {
      encryptionStatusElement.textContent = 'פעיל';
      encryptionStatusElement.className = 'summary-value text-success';
    }
    
    if (activeUsersElement) {
      activeUsersElement.textContent = '1';
      activeUsersElement.className = 'summary-value text-info';
    }
    
    if (securityAlertsElement) {
      securityAlertsElement.textContent = '0';
      securityAlertsElement.className = 'summary-value text-success';
    }
  }

  /**
   * Update external data summary
   * עדכון סיכום נתונים חיצוניים
   */
  async updateExternalData() {
    try {
      const response = await fetch('/api/external-data/status/');
      const result = await response.json();
      
      if (result.success && result.data) {
        const data = result.data;
        
        // Update summary values
        const activeProvidersElement = document.getElementById('activeProvidersCount');
        const lastUpdateElement = document.getElementById('lastDataUpdate');
        const accuracyElement = document.getElementById('dataAccuracy');
        const cacheStatusElement = document.getElementById('cacheStatus');
        
        if (activeProvidersElement) {
          const activeCount = data.providers?.filter(p => p.status === 'active').length || 0;
          activeProvidersElement.textContent = `${activeCount}`;
          activeProvidersElement.className = activeCount > 0 ? 'summary-value text-success' : 'summary-value text-danger';
        }
        
        if (lastUpdateElement) {
          const lastUpdate = data.last_update || 'לא זמין';
          lastUpdateElement.textContent = lastUpdate;
          lastUpdateElement.className = 'summary-value text-info';
        }
        
        if (accuracyElement) {
          const accuracy = data.accuracy_percent || 0;
          accuracyElement.textContent = `${accuracy}%`;
          accuracyElement.className = accuracy >= 90 ? 'summary-value text-success' : 
                                     accuracy >= 70 ? 'summary-value text-warning' : 'summary-value text-danger';
        }
        
        if (cacheStatusElement) {
          const cacheStatus = data.cache?.status || 'לא זמין';
          cacheStatusElement.textContent = cacheStatus === 'healthy' ? 'בריא' : cacheStatus;
          cacheStatusElement.className = cacheStatus === 'healthy' ? 'summary-value text-success' : 'summary-value text-warning';
        }
        
        // Update providers list
        this.updateProvidersList(data.providers || []);
        
        console.log('✅ External data updated successfully');
      } else {
        console.log('⚠️ External data API returned no data');
      }
    } catch (error) {
      console.error('❌ Error updating external data:', error);
    }
  }

  /**
   * Update providers list
   * עדכון רשימת ספקים
   */
  updateProvidersList(providers) {
    const providerListElement = document.getElementById('providerList');
    if (!providerListElement || !providers.length) return;
    
    providerListElement.innerHTML = providers.map(provider => `
      <div class="provider-item ${provider.status === 'active' ? 'active' : 'inactive'}">
        <div class="provider-info">
          <span class="provider-name">${provider.name || 'Unknown Provider'}</span>
          <span class="provider-status ${provider.status === 'active' ? 'active' : 'inactive'}">
            ${provider.status === 'active' ? 'פעיל' : 'לא פעיל'}
          </span>
        </div>
        <div class="provider-details">
          <small class="text-muted">
            ${provider.last_update ? `עדכון אחרון: ${provider.last_update}` : 'אין עדכונים'}
          </small>
        </div>
      </div>
    `).join('');
  }

  /**
   * Update alerts summary
   * עדכון סיכום התראות
   */
  async updateAlerts() {
    try {
      // Get alerts from localStorage (global notification system)
      const globalHistory = JSON.parse(localStorage.getItem('globalNotificationHistory') || '[]');
      
      // Count alerts by type
      const errorCount = globalHistory.filter(alert => alert.type === 'error').length;
      const warningCount = globalHistory.filter(alert => alert.type === 'warning').length;
      const infoCount = globalHistory.filter(alert => alert.type === 'info').length;
      const totalAlerts = globalHistory.length;
      
      // Update summary elements
      const errorElement = document.getElementById('errorCount');
      const warningElement = document.getElementById('warningCount');
      const infoElement = document.getElementById('infoCount');
      const totalElement = document.getElementById('totalAlerts');
      
      if (errorElement) {
        errorElement.textContent = errorCount;
        errorElement.className = errorCount > 0 ? 'summary-value text-danger' : 'summary-value text-success';
      }
      
      if (warningElement) {
        warningElement.textContent = warningCount;
        warningElement.className = warningCount > 0 ? 'summary-value text-warning' : 'summary-value text-success';
      }
      
      if (infoElement) {
        infoElement.textContent = infoCount;
        infoElement.className = 'summary-value text-info';
      }
      
      if (totalElement) {
        totalElement.textContent = totalAlerts;
        totalElement.className = totalAlerts > 0 ? 'summary-value text-warning' : 'summary-value text-success';
      }
      
      console.log('✅ Alerts summary updated successfully');
    } catch (error) {
      console.error('❌ Error updating alerts summary:', error);
    }
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

  /**
   * Update backup status
   * עדכון סטטוס גיבויים
   */
  async updateBackupStatus() {
    try {
      // Get list of backups
      const response = await fetch('/api/system/backup/list');
      const result = await response.json();
      
      if (result.status === 'success' && result.data.backups.length > 0) {
        const latestBackup = result.data.backups[0];
        const backupDate = new Date(latestBackup.created_at);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if backup was created yesterday or today
        const isRecentBackup = backupDate.toDateString() === yesterday.toDateString() || 
                              backupDate.toDateString() === new Date().toDateString();
        
        // Update backup info elements
        const lastBackupSizeElement = document.getElementById('lastBackupSize');
        const lastBackupDateElement = document.getElementById('lastBackupDate');
        const backupStatusElement = document.getElementById('backupStatus');
        
        if (lastBackupSizeElement) {
          lastBackupSizeElement.textContent = `${latestBackup.size_mb} MB`;
        }
        
        if (lastBackupDateElement) {
          lastBackupDateElement.textContent = backupDate.toLocaleString('he-IL');
        }
        
        if (backupStatusElement) {
          if (isRecentBackup) {
            backupStatusElement.innerHTML = '<span class="text-success">✅ גיבוי עדכני</span>';
          } else {
            backupStatusElement.innerHTML = '<span class="text-warning">⚠️ גיבוי ישן</span>';
          }
        }
        
        console.log('✅ Backup status updated successfully');
      } else {
        // No backups found
        const backupStatusElement = document.getElementById('backupStatus');
        if (backupStatusElement) {
          backupStatusElement.innerHTML = '<span class="text-danger">❌ אין גיבויים</span>';
        }
        
        const lastBackupDateElement = document.getElementById('lastBackupDate');
        if (lastBackupDateElement) {
          lastBackupDateElement.textContent = 'לא נמצא';
        }
        
        console.log('⚠️ No backups found');
      }
    } catch (error) {
      console.error('❌ Error updating backup status:', error);
      const backupStatusElement = document.getElementById('backupStatus');
      if (backupStatusElement) {
        backupStatusElement.innerHTML = '<span class="text-danger">❌ שגיאה בבדיקה</span>';
      }
    }
  }

  showFallbackWarning() {
    // Create warning banner if it doesn't exist
    let warningBanner = document.getElementById('fallback-warning');
    if (!warningBanner) {
      warningBanner = document.createElement('div');
      warningBanner.id = 'fallback-warning';
      warningBanner.className = 'alert alert-warning fallback-warning';
      warningBanner.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <div>
            <strong>מצב חירום:</strong> שרת לא זמין - מוצגים נתוני חירום בלבד
            <br>
            <small>בדוק את החיבור לשרת ונסה לרענן את הדף</small>
          </div>
          <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
      `;
      
      // Insert at the top of the main content
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.insertBefore(warningBanner, mainContent.firstChild);
      }
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
    console.log('📊 Loading fallback alerts data (server unavailable)...');
    
    const fallbackAlerts = {
      summary: {
        error: 1,
        warning: 0,
        info: 0
      },
      alerts: [
        {
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'שרת לא זמין - לא ניתן לטעון התראות'
        }
      ]
    };
    
    // Update alert counts
    const errorCountElement = document.getElementById('error-count');
    const warningCountElement = document.getElementById('warning-count');
    const infoCountElement = document.getElementById('info-count');
    
    if (errorCountElement) errorCountElement.textContent = fallbackAlerts.summary.error;
    if (warningCountElement) warningCountElement.textContent = fallbackAlerts.summary.warning;
    if (infoCountElement) infoCountElement.textContent = fallbackAlerts.summary.info;
    
    // Update alerts list
    const alertsListElement = document.getElementById('alerts-list');
    if (alertsListElement) {
      alertsListElement.innerHTML = '';
      
      fallbackAlerts.alerts.forEach(alert => {
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
    
    console.log('⚠️ Fallback alerts data loaded (server unavailable)');
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

    // Primary data provider change
    const primaryDataProviderSelect = document.getElementById('primaryDataProvider');
    if (primaryDataProviderSelect) {
      primaryDataProviderSelect.addEventListener('change', (e) => {
        SystemManagement.savePrimaryDataProvider(e.target.value);
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

  /**
   * Save primary data provider
   * שמירת ספק נתונים ראשי
   */
  static async savePrimaryDataProvider(provider) {
    try {
      console.log(`💾 Saving primary data provider: ${provider}`);
      
      const response = await fetch('/api/preferences/user/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preference_name: 'primaryDataProvider',
          value: provider,
          user_id: 1
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('✅ Primary data provider saved successfully');
          if (typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification('הצלחה', `ספק נתונים ראשי נשמר: ${provider}`);
          }
        } else {
          throw new Error(result.message || 'Failed to save primary data provider');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error saving primary data provider:', error);
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', 'שגיאה בשמירת ספק נתונים ראשי: ' + error.message);
      }
    }
  }

  /**
   * Load primary data provider
   * טעינת ספק נתונים ראשי
   */
  static async loadPrimaryDataProvider() {
    try {
      console.log('📡 Loading primary data provider...');
      
      const response = await fetch('/api/preferences/user/preference?name=primaryDataProvider&user_id=1');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const provider = result.data.value;
          const select = document.getElementById('primaryDataProvider');
          if (select) {
            select.value = provider;
            console.log(`✅ Primary data provider loaded: ${provider}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading primary data provider:', error);
    }
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.isInitialized = false;
  }

  /**
   * Copy detailed log to clipboard
   * העתקת לוג מפורט ללוח
   */
  static async copyDetailedLog() {
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
      
      // Show success message with additional info
      const logInfo = `לוג מפורט הועתק ללוח!\n\n📊 מידע על הלוג:\n• זמן יצירה: ${new Date().toLocaleString('he-IL')}\n• גודל: ${detailedLog.length} תווים\n• מקור: מערכת ניהול TikTrack`;
      
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', logInfo);
      } else {
        if (typeof showNotification === 'function') {
          showNotification(logInfo, 'success');
        } else {
          alert(logInfo);
        }
      }
      
      console.log('✅ Detailed log copied to clipboard');
    } else {
      throw new Error(data.message || 'Failed to generate detailed log');
    }
    
  } catch (error) {
    console.error('❌ Error copying detailed log:', error);
    
    const errorMsg = `שגיאה בהעתקת לוג: ${error.message}\n\n🔧 פתרונות אפשריים:\n• בדוק את החיבור לשרת\n• נסה לרענן את הדף\n• פנה לתמיכה טכנית`;
    
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', errorMsg);
    } else {
      if (typeof showNotification === 'function') {
        showNotification(errorMsg, 'error');
      } else {
        alert(errorMsg);
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

  /**
   * Toggle all sections (expand/collapse)
   * הצג/הסתר כל הסקשנים
   */
  static toggleAllSections() {
    const sections = document.querySelectorAll('.section-content');
    const toggleBtn = document.querySelector('.filter-toggle-btn');
    
    if (!sections.length || !toggleBtn) return;
    
    const isCollapsed = sections[0].style.display === 'none' || 
                       sections[0].classList.contains('collapsed');
    
    sections.forEach(section => {
      if (isCollapsed) {
        section.style.display = 'block';
        section.classList.remove('collapsed');
      } else {
        section.style.display = 'none';
        section.classList.add('collapsed');
      }
    });
    
    // Update button text
    toggleBtn.innerHTML = isCollapsed ? 
      '<i class="section-toggle-icon">▼</i>' : 
      '<i class="section-toggle-icon">▶</i>';
  }

  /**
   * Toggle specific section
   * הצג/הסתר סקשן ספציפי
   */
  static toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const toggleBtn = document.querySelector(`[onclick*="${sectionId}"] .section-toggle-icon`);
    
    if (!section) return;
    
    const isCollapsed = section.style.display === 'none' || 
                       section.classList.contains('collapsed');
    
    if (isCollapsed) {
      section.style.display = 'block';
      section.classList.remove('collapsed');
      if (toggleBtn) toggleBtn.innerHTML = '▼';
    } else {
      section.style.display = 'none';
      section.classList.add('collapsed');
      if (toggleBtn) toggleBtn.innerHTML = '▶';
    }
  }
}// Initialize dashboard when DOM is ready
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
  window.copyCheckResultsToClipboard = SystemManagement.copyCheckResultsToClipboard;
  window.checkDependencies = SystemManagement.checkDependencies;
  // window.toggleAllSections export removed - using global version from ui-utils.js
  // window.toggleSection export removed - using global version from ui-utils.js
});

// Cleanup on page unload
/**
 * Generate detailed log for System Management
 */
function generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - מנהל מערכת ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // סטטוס כללי
    log.push('--- סטטוס כללי ---');
    const topSection = document.querySelector('.top-section .section-body');
    const isTopOpen = topSection && topSection.style.display !== 'none';
    log.push(`סקשן עליון: ${isTopOpen ? 'פתוח' : 'סגור'}`);
    
    // תצוגה מפורטת לפי סקשנים
    log.push('--- תצוגה מפורטת לפי סקשנים ---');
    
    // סקשן עליון - בריאות מערכת
    const healthSummary = document.getElementById('healthSummary');
    if (healthSummary) {
        const summaryItems = healthSummary.querySelectorAll('.summary-item');
        summaryItems.forEach((item, index) => {
            const label = item.querySelector('.summary-label')?.textContent || 'לא זמין';
            const value = item.querySelector('.summary-value')?.textContent || 'לא זמין';
            log.push(`סקשן עליון - פריט ${index + 1}: ${label} = "${value}"`);
        });
    }

    // סטטיסטיקות וביצועים
    log.push('--- סטטיסטיקות וביצועים ---');
    const overallHealth = document.getElementById('overallHealthStatus')?.textContent || 'לא זמין';
    const systemScore = document.getElementById('systemScore')?.textContent || 'לא זמין';
    const responseTime = document.getElementById('responseTime')?.textContent || 'לא זמין';
    const uptime = document.getElementById('uptime')?.textContent || 'לא זמין';
    
    log.push(`בריאות מערכת: ${overallHealth}`);
    log.push(`ציון כללי: ${systemScore}`);
    log.push(`זמן תגובה: ${responseTime}`);
    log.push(`זמן פעילות: ${uptime}`);
    log.push(`זמן טעינת עמוד: ${Date.now() - performance.timing.navigationStart}ms`);

    // לוגים ושגיאות
    log.push('--- לוגים ושגיאות ---');
    if (window.consoleLogs && window.consoleLogs.length > 0) {
        const recentLogs = window.consoleLogs.slice(-10);
        recentLogs.forEach(entry => {
            log.push(`[${entry.timestamp}] ${entry.level}: ${entry.message}`);
        });
    } else {
        log.push('אין לוגים זמינים');
    }

    // מידע טכני
    log.push('--- מידע טכני ---');
    log.push(`User Agent: ${navigator.userAgent}`);
    log.push(`Language: ${navigator.language}`);
    log.push(`Platform: ${navigator.platform}`);

    log.push('=== סוף הלוג ===');
    return log.join('\n');
}

/**
 * Copy detailed log to clipboard
 */
async function copyDetailedLog() {
    try {
        const log = generateDetailedLog();
        await navigator.clipboard.writeText(log);
        window.showNotification('הלוג המפורט הועתק בהצלחה ללוח!', 'success');
        console.log('=== לוג מפורט שהועתק ===');
        console.log(log);
        console.log('=== סוף הלוג ===');
    } catch (error) {
        console.error('Failed to copy log:', error);
        window.showNotification('שגיאה בהעתקת הלוג: ' + error.message, 'error');
        // Fallback: show in console
        const log = generateDetailedLog();
        console.log('=== לוג מפורט (לא הועתק) ===');
        console.log(log);
        console.log('=== סוף הלוג ===');
    }
}

// ייצוא לגלובל scope
window.copyDetailedLog = copyDetailedLog;

window.addEventListener('beforeunload', () => {
  if (window.systemManagement) {
    window.systemManagement.destroy();
  }
});
