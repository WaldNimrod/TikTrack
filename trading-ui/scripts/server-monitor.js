/**
 * Server Monitor - ניטור שרת
 * גרסה 2.0 - תיקון שגיאות JavaScript
 */

class ServerMonitor {
  constructor() {
    this.logs = [];
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.settings = {
      autoRefresh: true,
      refreshInterval: 15000, // 15 שניות במקום 5 - פחות עומס על השרת
      maxLogs: 100
    };

    // Rate limiting protection
    this.lastActionTime = {
      checkHealth: 0,
      restart: 0,
      clearCache: 0,
      optimize: 0,
      emergencyStop: 0
    };
    this.actionCooldown = 3000; // 3 seconds cooldown - מונע 429 errors

    // console.log('🚀 ServerMonitor initialized'); // לוג מופחת
    this.init();
  }

  // בדיקת rate limiting
  canPerformAction(actionName) {
    const now = Date.now();
    const timeSinceLastAction = now - this.lastActionTime[actionName];

    if (timeSinceLastAction < this.actionCooldown) {
      const remainingTime = Math.ceil((this.actionCooldown - timeSinceLastAction) / 1000);
      console.warn(`⏳ ${actionName} ב-cooldown. נסה שוב בעוד ${remainingTime} שניות`);
      return false;
    }

    this.lastActionTime[actionName] = now;
    return true;
  }

  // אתחול המערכת
  init() {
    // console.log('🔧 ServerMonitor init - מתחיל אתחול'); // לוג מופחת
    this.loadSettings();
    this.setupEventListeners();
    this.startMonitoring();
    this.loadSystemInfo();
    this.loadHealthData();
  }

  // טעינת הגדרות
  loadSettings() {
    try {
      const saved = localStorage.getItem('serverMonitorSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('❌ שגיאה בטעינת הגדרות:', error);
    }
  }

  // שמירת הגדרות
  saveSettings() {
    try {
      localStorage.setItem('serverMonitorSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('❌ שגיאה בשמירת הגדרות:', error);
    }
  }

  // הגדרת מאזינים לאירועים
  setupEventListeners() {
    // מאזין לשינויים בהגדרות
    const autoRefreshToggle = document.getElementById('autoRefresh');
    if (autoRefreshToggle) {
      autoRefreshToggle.addEventListener('change', (e) => {
        this.settings.autoRefresh = e.target.checked;
        this.saveSettings();
        if (this.settings.autoRefresh) {
          this.startMonitoring();
        } else {
          this.stopMonitoring();
        }
      });
    }

    // Cursor Tasks Event Listeners
    this.setupCursorTasksListeners();

    // מאזין לשינויים בתדירות רענון
    const refreshInterval = document.getElementById('refreshInterval');
    if (refreshInterval) {
      refreshInterval.addEventListener('change', (e) => {
        this.settings.refreshInterval = parseInt(e.target.value);
        this.saveSettings();
        if (this.isMonitoring) {
          this.stopMonitoring();
          this.startMonitoring();
        }
      });
    }
  }

  // התחלת ניטור
  startMonitoring() {
    if (this.isMonitoring) return;

    // console.log('🔄 ServerMonitor - מתחיל ניטור'); // לוג מופחת
    this.isMonitoring = true;
    this.updateStatus('מתחיל ניטור...');

    // בדיקה ראשונית
    this.checkServerStatus();
    this.loadHealthData();

    // הגדרת רענון אוטומטי
    if (this.settings.autoRefresh) {
      this.monitoringInterval = setInterval(() => {
        this.checkServerStatus();
        this.loadHealthData();
      }, this.settings.refreshInterval);
    }
  }

  // עצירת ניטור
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    console.log('⏹️ ServerMonitor - עוצר ניטור');
    this.isMonitoring = false;
    this.updateStatus('ניטור מושהה');
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // בדיקת סטטוס שרת
  async checkServerStatus() {
    try {
      // console.log('🔍 ServerMonitor - בודק סטטוס שרת'); // לוג מופחת
      
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (response.ok) {
        this.updateServerStatus('online', data);
        const responseTime = data.response_time_ms || 'לא זמין';
        // this.addLog('success', 'שרת פעיל', `זמן תגובה: ${responseTime}ms`); // לוג מופחת
      } else {
        this.updateServerStatus('offline', data);
        this.addLog('error', 'שרת לא זמין', data.message || 'שגיאה לא ידועה');
      }
    } catch (error) {
      console.error('❌ שגיאה בבדיקת סטטוס שרת:', error);
      this.updateServerStatus('offline', { error: error.message });
      this.addLog('error', 'שגיאת חיבור', error.message);
    }
  }

  // עדכון סטטוס שרת
  updateServerStatus(status, data) {
    const statusElement = document.getElementById('serverStatus');
    const statusText = document.getElementById('statusText');
    const lastCheck = document.getElementById('lastCheck');
    
    if (statusElement) {
      statusElement.className = `status-indicator ${status}`;
      statusElement.textContent = status === 'online' ? '🟢' : '🔴';
    }
    
    if (statusText) {
      statusText.textContent = status === 'online' ? 'מחובר' : 'מנותק';
    }
    
    if (lastCheck) {
      lastCheck.textContent = new Date().toLocaleTimeString('he-IL');
    }

    // עדכון סטטיסטיקות סיכום
    this.updateSummaryStats(status, data);
  }

  // עדכון סטטיסטיקות סיכום - Enhanced with Traffic Light
  updateSummaryStats(status, data) {
    const serverStatusStats = document.getElementById('serverStatusStats');
    const databaseStatusStats = document.getElementById('databaseStatusStats');
    const cacheStatusStats = document.getElementById('cacheStatusStats');
    const overallStatus = document.getElementById('overallStatus');
    
    // Update traffic lights
    const serverLight = document.getElementById('serverLight');
    const databaseLight = document.getElementById('databaseLight');
    const cacheLight = document.getElementById('cacheLight');
    const overallLight = document.getElementById('overallLight');

    // Server status
    if (serverStatusStats) {
      serverStatusStats.textContent = status === 'online' ? 'מחובר' : 'מנותק';
    }
    if (serverLight) {
      serverLight.className = 'light ' + (status === 'online' ? 'green' : 'red');
    }
    
    // Database status
    if (data && data.components) {
      if (databaseStatusStats) {
        const dbStatus = data.components.database?.status === 'healthy' ? 'פעיל' : 'לא פעיל';
        databaseStatusStats.textContent = dbStatus;
      }
      if (databaseLight) {
        const dbHealthy = data.components.database?.status === 'healthy';
        databaseLight.className = 'light ' + (dbHealthy ? 'green' : 'red');
      }
      
      if (cacheStatusStats) {
        const cacheStatus = data.components.cache?.status === 'healthy' ? 'פעיל' : 'לא פעיל';
        cacheStatusStats.textContent = cacheStatus;
      }
      if (cacheLight) {
        const cacheHealthy = data.components.cache?.status === 'healthy';
        cacheLight.className = 'light ' + (cacheHealthy ? 'green' : 'red');
      }
    } else {
      if (databaseStatusStats) databaseStatusStats.textContent = 'לא ידוע';
      if (cacheStatusStats) cacheStatusStats.textContent = 'לא ידוע';
      if (databaseLight) databaseLight.className = 'light gray';
      if (cacheLight) cacheLight.className = 'light gray';
    }
    
    // Overall status
    if (overallStatus) {
      overallStatus.textContent = status === 'online' ? 'פעיל' : 'לא פעיל';
    }
    if (overallLight) {
      overallLight.className = 'light ' + (status === 'online' ? 'green' : 'red');
    }
  }

  // עדכון סטטוס כללי - Enhanced
  updateStatus(message) {
    const statusElement = document.getElementById('statusText');
    const detailsElement = document.getElementById('monitoringDetails');
    const circleElement = document.getElementById('monitoringStatusCircle');
    const iconElement = document.getElementById('monitoringIcon');
    
    if (statusElement) {
      statusElement.textContent = message;
    }
    
    if (detailsElement) {
      detailsElement.textContent = this.getStatusDetails(message);
    }
    
    if (circleElement && iconElement) {
      this.updateStatusCircle(message, circleElement, iconElement);
    }
  }
  
  // קבלת פרטי סטטוס
  getStatusDetails(status) {
    const details = {
      'מאתחל...': 'מתחבר לשרת...',
      'מתחיל ניטור...': 'בודק חיבורים...',
      'ניטור פעיל': 'בודק כל 15 שניות',
      'ניטור מושהה': 'ניטור הושהה זמנית',
      'ניטור עצור': 'ניטור הופסק',
      'שרת מחובר': 'כל המערכות פעילות',
      'שרת מנותק': 'בעיית חיבור לשרת'
    };
    return details[status] || 'בדיקת סטטוס...';
  }
  
  // עדכון עיגול הסטטוס
  updateStatusCircle(status, circleElement, iconElement) {
    // הסר כל הקלאסים הקודמים
    circleElement.className = 'status-circle';
    
    if (status.includes('מאתחל') || status.includes('מתחיל')) {
      circleElement.classList.add('initializing');
      iconElement.className = 'fas fa-spinner';
    } else if (status.includes('פעיל') || status.includes('מחובר')) {
      circleElement.classList.add('active');
      iconElement.className = 'fas fa-play';
    } else if (status.includes('מושהה')) {
      circleElement.classList.add('paused');
      iconElement.className = 'fas fa-pause';
    } else if (status.includes('עצור') || status.includes('מנותק')) {
      circleElement.classList.add('stopped');
      iconElement.className = 'fas fa-stop';
    } else {
      circleElement.classList.add('initializing');
      iconElement.className = 'fas fa-question';
    }
  }

  // הוספת לוג
  addLog(type, title, message) {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date(),
      type: type,
      title: title,
      message: message
    };
    
    this.logs.unshift(logEntry);
    
    // הגבלת מספר הלוגים
    if (this.logs.length > this.settings.maxLogs) {
      this.logs = this.logs.slice(0, this.settings.maxLogs);
    }
    
    this.displayLogs();
    console.log(`📝 ServerMonitor - לוג נוסף: ${type} - ${title}`);
  }

  // הצגת לוגים
  displayLogs() {
    const logsContainer = document.getElementById('logsContainer');
    if (!logsContainer) return;
    
    logsContainer.innerHTML = '';
    
    this.logs.forEach(log => {
      const logElement = this.createLogElement(log);
      logsContainer.appendChild(logElement);
    });
  }

  // יצירת אלמנט לוג
  createLogElement(log) {
    const logElement = document.createElement('div');
    logElement.className = `log-entry ${log.type}`;
    
    const timeAgo = this.getTimeAgo(log.timestamp);
    const iconClass = this.getLogIcon(log.type);
    
    logElement.innerHTML = `
      <div class="log-icon">
        <i class="${iconClass}"></i>
      </div>
      <div class="log-content">
        <div class="log-title">${log.title}</div>
        <div class="log-message">${log.message}</div>
        <div class="log-time">${timeAgo}</div>
      </div>
    `;
    
    return logElement;
  }

  // קבלת אייקון לוג
  getLogIcon(type) {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type] || 'fas fa-circle';
  }

  // חישוב זמן שעבר
  getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return `לפני ${seconds} שניות`;
    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    return timestamp.toLocaleDateString('he-IL');
  }

  // העתקת לוג מפורט
   {
    try {
      console.log('📋 ServerMonitor - מעתיק לוג מפורט');
      
      let logText = '=== לוג מפורט - ניטור שרת ===\n';
      logText += `תאריך: ${new Date().toLocaleString('he-IL')}\n`;
      logText += `סטטוס: ${this.isMonitoring ? 'פעיל' : 'מושהה'}\n`;
      logText += `מספר לוגים: ${this.logs.length}\n\n`;
      
      logText += '=== לוגים ===\n';
      this.logs.forEach((log, index) => {
        logText += `${index + 1}. [${log.type.toUpperCase()}] ${log.title}\n`;
        logText += `   הודעה: ${log.message}\n`;
        logText += `   זמן: ${log.timestamp.toLocaleString('he-IL')}\n\n`;
      });
      
      // העתקה ללוח
      navigator.clipboard.writeText(logText).then(() => {
        console.log('✅ לוג הועתק בהצלחה');
        if (window.showSuccessNotification) {
          window.showSuccessNotification('ניטור שרת', 'לוג מפורט הועתק ללוח');
        }
      }).catch(error => {
        console.error('❌ שגיאה בהעתקה:', error);
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה', 'לא ניתן להעתיק ללוח');
        }
      });
      
    } catch (error) {
      console.error('❌ שגיאה בהעתקת לוג:', error);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'שגיאה בהעתקת לוג');
      }
    }
  }

  // ניקוי לוגים
  async clearLogs() {
    try {
      console.log('🧹 ServerMonitor - מנקה לוגים');
      
      // בדיקה עם מערכת התראות
      let confirmed = false;
      
      // נסה להשתמש במערכת התראות לאישור
      if (typeof window.showConfirmationDialog === 'function') {
        confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'ניקוי לוגים',
            'האם אתה בטוח שברצונך לנקות את כל הלוגים?',
            () => resolve(true),
            () => resolve(false),
            'warning' // צבע כתום לאישור
          );
        });
      } else if (typeof window.globalConfirm === 'function') {
        confirmed = await new Promise(resolve => {
          window.globalConfirm(
            'האם אתה בטוח שברצונך לנקות את כל הלוגים?',
            () => resolve(true),
            () => resolve(false),
            'ניקוי לוגים',
            'warning'
          );
        });
      } else {
        // fallback ל-confirm רגיל
        confirmed = confirm('האם אתה בטוח שברצונך לנקות את כל הלוגים?');
      }
      
      if (confirmed) {
        this.logs = [];
        this.displayLogs();
        console.log('✅ לוגים נוקו');
        
        // הודעת הצלחה
        if (typeof window.showNotification === 'function') {
          window.showNotification('לוגים נוקו בהצלחה', 'success');
        } else if (typeof window.showSuccessNotification === 'function') {
          window.showSuccessNotification('לוגים נוקו בהצלחה');
        } else {
          console.log('✅ לוגים נוקו בהצלחה');
        }
      } else {
        // הודעת ביטול
        if (typeof window.showNotification === 'function') {
          window.showNotification('ניקוי לוגים בוטל', 'info');
        } else if (typeof window.showInfoNotification === 'function') {
          window.showInfoNotification('ניקוי לוגים בוטל');
        } else {
          console.log('ℹ️ ניקוי לוגים בוטל');
        }
      }
      
    } catch (error) {
      console.error('❌ שגיאה בניקוי לוגים:', error);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'שגיאה בניקוי לוגים');
      }
    }
  }

  // אופטימיזציה של בסיס הנתונים
  async optimizeDatabase() {
    if (!this.canPerformAction('optimize')) {
      return;
    }

    try {
      console.log('🔧 ServerMonitor - מבצע אופטימיזציה של בסיס הנתונים');

      const response = await fetch('/api/database/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ אופטימיזציה הושלמה:', result);
        if (window.showSuccessNotification) {
          window.showSuccessNotification('ניטור שרת', 'אופטימיזציה הושלמה');
        }
      } else {
        throw new Error('שגיאה באופטימיזציה');
      }
      
    } catch (error) {
      console.error('❌ שגיאה באופטימיזציה:', error);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'שגיאה באופטימיזציה');
      }
    }
  }

  // ייצוא לוגים
  async exportLogs() {
    try {
      console.log('📤 ServerMonitor - מייצא לוגים');
      
      const logData = {
        timestamp: new Date().toISOString(),
        settings: this.settings,
        logs: this.logs
      };
      
      const blob = new Blob([JSON.stringify(logData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `server-monitor-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ לוגים יוצאו');
      if (window.showSuccessNotification) {
        window.showSuccessNotification('ניטור שרת', 'לוגים יוצאו');
      }
      
    } catch (error) {
      console.error('❌ שגיאה בייצוא לוגים:', error);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'שגיאה בייצוא לוגים');
      }
    }
  }

  // טעינת מידע מערכת
  async loadSystemInfo() {
    try {
      // console.log('🔧 ServerMonitor - טוען מידע מערכת'); // לוג מופחת

      const response = await fetch('/api/system-info');
      if (response.ok) {
        const data = await response.json();
        this.updateSystemInfo(data);
      }
      
      // בדיקת IndexedDB
      this.checkIndexedDB();
      
      
      // בדיקת API Performance
      this.checkApiPerformance();
      
      // יצירת רשימת endpoints
      if (typeof window.populateEndpointsList === 'function') {
        window.populateEndpointsList();
      }
    } catch (error) {
      console.error('❌ שגיאה בטעינת מידע מערכת:', error);
    }
  }

  // בדיקת IndexedDB
  async checkIndexedDB() {
    try {
      // console.log('🗄️ ServerMonitor - בודק IndexedDB'); // לוג מופחת
      
      if ('indexedDB' in window) {
        // בדיקה פשוטה של IndexedDB
        const request = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]);
        const databases = await request;
        
        // console.log('📊 IndexedDB databases found:', databases.length); // לוג מופחת
        
        // עדכון הממשק
        const dbSizeEl = document.getElementById('databaseSize');
        if (dbSizeEl) {
          dbSizeEl.textContent = `${databases.length} databases`;
        }
        
        // עדכון סטטוס
        const dbStatusEl = document.getElementById('databaseStatus');
        if (dbStatusEl) {
          dbStatusEl.textContent = 'פעיל';
          dbStatusEl.className = 'badge bg-success';
        }
        
        // this.addLog('success', 'IndexedDB', `נמצאו ${databases.length} databases`); // לוג מופחת
      } else {
        console.log('❌ IndexedDB לא נתמך');
        this.addLog('warning', 'IndexedDB', 'לא נתמך בדפדפן זה');
      }
    } catch (error) {
      console.error('❌ שגיאה בבדיקת IndexedDB:', error);
      this.addLog('error', 'IndexedDB', error.message);
    }
  }



  // בדיקת API Performance
  async checkApiPerformance() {
    try {
      // console.log('📊 ServerMonitor - בודק API Performance'); // לוג מופחת
      
      // עדכון API Status
      const apiHealthEl = document.getElementById('apiHealth');
      if (apiHealthEl) {
        apiHealthEl.textContent = 'פעיל';
        apiHealthEl.className = 'badge bg-success';
      }
      
      const apiResponseTimeEl = document.getElementById('apiResponseTime');
      if (apiResponseTimeEl) {
        apiResponseTimeEl.textContent = '< 100ms';
      }
      
      const lastApiCheckEl = document.getElementById('lastApiCheck');
      if (lastApiCheckEl) {
        const now = new Date().toLocaleTimeString('he-IL');
        lastApiCheckEl.textContent = now;
      }
      
      // מידע על ביצועי API (mock data - במציאות זה יבוא מה-API)
      const performanceData = {
        totalRequests: Math.floor(Math.random() * 1000) + 500,
        avgResponseTime: (Math.random() * 200 + 50).toFixed(0),
        errorRate: (Math.random() * 5).toFixed(1),
        uptime: '2h 15m'
      };
      
      // עדכון הממשק
      const totalRequestsEl = document.getElementById('totalRequests');
      if (totalRequestsEl) {
        totalRequestsEl.textContent = performanceData.totalRequests;
      }
      
      const avgResponseTimeEl = document.getElementById('avgResponseTime');
      if (avgResponseTimeEl) {
        avgResponseTimeEl.textContent = `${performanceData.avgResponseTime}ms`;
      }
      
      const errorRateEl = document.getElementById('errorRate');
      if (errorRateEl) {
        const errorRate = parseFloat(performanceData.errorRate);
        errorRateEl.textContent = `${performanceData.errorRate}%`;
        errorRateEl.className = errorRate > 2 ? 'text-danger' : 'text-success';
      }
      
      const uptimeEl = document.getElementById('uptime');
      if (uptimeEl) {
        uptimeEl.textContent = performanceData.uptime;
      }
      
      // this.addLog('success', 'API Performance', `בקשות: ${performanceData.totalRequests}, זמן תגובה: ${performanceData.avgResponseTime}ms`); // לוג מופחת
    } catch (error) {
      console.error('❌ שגיאה בבדיקת API Performance:', error);
      this.addLog('error', 'API Performance', error.message);
    }
  }

  // בדיקת בריאות מפורטת
  async performDetailedHealthCheck() {
    const healthChecks = [
      { name: 'Health Check', url: '/api/health', method: 'GET' },
      { name: 'Detailed Health', url: '/api/health/detailed', method: 'GET' },
      { name: 'System Info', url: '/api/system-info', method: 'GET' },
      { name: 'Server Status', url: '/api/server/status', method: 'GET' },
      { name: 'Cache Status', url: '/api/cache/status', method: 'GET' },
      { name: 'Database Analyze', url: '/api/database/analyze', method: 'GET' },
      { name: 'Tasks Status', url: '/api/tasks/status', method: 'GET' },
      { name: 'Rate Limits Stats', url: '/api/rate-limits/stats', method: 'GET' }
    ];

    const results = {
      passed: 0,
      failed: 0,
      total: healthChecks.length,
      passedTests: [],
      failedTests: [],
      avgResponseTime: 0,
      successRate: 0,
      overallStatus: 'unknown'
    };

    let totalResponseTime = 0;
    let successfulChecks = 0;

    for (let i = 0; i < healthChecks.length; i++) {
      const check = healthChecks[i];
      
      try {
        const startTime = Date.now();
        const response = await fetch(check.url, { 
          method: check.method,
          timeout: 10000 // הגדלת timeout ל-10 שניות
        });
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          results.passed++;
          results.passedTests.push({
            name: check.name,
            url: check.url,
            responseTime: responseTime,
            statusCode: response.status
          });
          totalResponseTime += responseTime;
          successfulChecks++;
        } else if (response.status === 429) {
          // טיפול מיוחד ב-Rate Limiting
          results.failed++;
          results.failedTests.push({
            name: check.name,
            url: check.url,
            error: `HTTP 429 (Rate Limited) - נסה שוב מאוחר יותר`,
            responseTime: responseTime
          });
        } else {
          results.failed++;
          results.failedTests.push({
            name: check.name,
            url: check.url,
            error: `HTTP ${response.status}`,
            responseTime: responseTime
          });
        }
      } catch (error) {
        results.failed++;
        results.failedTests.push({
          name: check.name,
          url: check.url,
          error: error.message,
          responseTime: 0
        });
      }
      
      // המתנה בין בדיקות כדי למנוע Rate Limiting
      // המתנה ארוכה יותר לבדיקות כבדות כמו Database Analyze
      if (check.name === 'Database Analyze') {
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 שניות
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 שנייה
      }
      
      // עדכון התקדמות אם יש ממשק
      if (typeof window.showNotification === 'function' && i < healthChecks.length - 1) {
        window.showNotification(`בודק ${check.name}... (${i + 1}/${healthChecks.length})`, 'info');
      }
    }

    // חישוב סטטיסטיקות
    results.avgResponseTime = successfulChecks > 0 ? Math.round(totalResponseTime / successfulChecks) : 0;
    results.successRate = Math.round((results.passed / results.total) * 100);
    results.overallStatus = results.successRate >= 80 ? 'healthy' : 
                           results.successRate >= 50 ? 'degraded' : 'unhealthy';

    return results;
  }

  // טעינת נתוני בריאות שרת
  async loadHealthData() {
    try {
      // console.log('🔍 ServerMonitor - טוען נתוני בריאות'); // לוג מופחת

      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        this.updateHealthData(data);
      }
    } catch (error) {
      console.error('❌ שגיאה בטעינת נתוני בריאות:', error);
    }
  }

  // עדכון נתוני בריאות בממשק
  updateHealthData(data) {
    if (!data || !data.components) return;

    // עדכון סטטוס שרת
    const serverStatusEl = document.getElementById('serverStatus');
    if (serverStatusEl) {
      serverStatusEl.textContent = data.status === 'healthy' ? 'פעיל' : 'לא פעיל';
      serverStatusEl.className = `status-value ${data.status === 'healthy' ? 'success' : 'error'}`;
    }

    // עדכון זמן פעילות (אם זמין)
    const uptimeEl = document.getElementById('uptime');
    if (uptimeEl && data.components.system?.details?.uptime) {
      uptimeEl.textContent = data.components.system.details.uptime;
    }

    // עדכון סטטוס בסיס נתונים
    const databaseStatusEl = document.getElementById('databaseStatus');
    if (databaseStatusEl && data.components.database) {
      const dbStatus = data.components.database.status === 'healthy' ? 'פעיל' : 'לא פעיל';
      databaseStatusEl.textContent = dbStatus;
      databaseStatusEl.className = `status-value ${data.components.database.status === 'healthy' ? 'success' : 'error'}`;
    }

    // עדכון גודל בסיס נתונים
    const dbSizeEl = document.getElementById('dbSize');
    if (dbSizeEl && data.components.database?.details?.database_size_mb) {
      dbSizeEl.textContent = `${data.components.database.details.database_size_mb} MB`;
    }

    // עדכון מספר טיקרים
    const tickerCountEl = document.getElementById('tickerCount');
    if (tickerCountEl && data.components.database?.details?.ticker_count) {
      tickerCountEl.textContent = data.components.database.details.ticker_count;
    }

    // עדכון סטטוס מטמון
    const cacheStatusEl = document.getElementById('cacheStatus');
    if (cacheStatusEl && data.components.cache) {
      const cacheStatus = data.components.cache.status === 'healthy' ? 'פעיל' : 'לא פעיל';
      cacheStatusEl.textContent = cacheStatus;
      cacheStatusEl.className = `status-value ${data.components.cache.status === 'healthy' ? 'success' : 'error'}`;
    }

    // עדכון ערכי מטמון
    const cacheEntriesEl = document.getElementById('cacheEntries');
    if (cacheEntriesEl && data.components.cache?.details?.total_entries) {
      cacheEntriesEl.textContent = data.components.cache.details.total_entries;
    }

    // עדכון זיכרון מטמון
    const cacheMemoryEl = document.getElementById('cacheMemory');
    if (cacheMemoryEl && data.components.system?.details?.memory_usage_bytes) {
      const memoryMB = Math.round(data.components.system.details.memory_usage_bytes / (1024 * 1024));
      cacheMemoryEl.textContent = `${memoryMB} MB`;
    }

    // עדכון סטטוס מערכת
    const systemStatusEl = document.getElementById('systemStatus');
    if (systemStatusEl && data.components.system) {
      const sysStatus = data.components.system.status === 'healthy' ? 'תקין' : 'לא תקין';
      systemStatusEl.textContent = sysStatus;
      systemStatusEl.className = `status-value ${data.components.system.status === 'healthy' ? 'success' : 'error'}`;
    }

    // עדכון שימוש CPU
    const cpuUsageEl = document.getElementById('cpuUsage');
    if (cpuUsageEl && data.components.system?.details?.cpu_percent) {
      cpuUsageEl.textContent = `${data.components.system.details.cpu_percent}%`;
    }

    // עדכון שימוש זיכרון
    const memoryUsageEl = document.getElementById('memoryUsage');
    if (memoryUsageEl && data.components.system?.details?.memory_percent) {
      memoryUsageEl.textContent = `${data.components.system.details.memory_percent}%`;
    }

        // console.log('✅ נתוני בריאות עודכנו בהצלחה'); // לוג מופחת
  }

  // בדיקת בריאות שרת
  async checkServerHealth() {
    if (!this.canPerformAction('checkHealth')) {
      return;
    }

    try {
      console.log('🔍 ServerMonitor - בודק בריאות שרת');

      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ בריאות שרת:', data);
        this.addLog('success', 'בדיקת בריאות', `סטטוס: ${data.status}`);
        if (window.showSuccessNotification) {
          window.showSuccessNotification('ניטור שרת', 'בדיקת בריאות הושלמה בהצלחה');
        }
      } else {
        throw new Error('שגיאה בבדיקת בריאות');
      }
    } catch (error) {
      console.error('❌ שגיאה בבדיקת בריאות שרת:', error);
      this.addLog('error', 'שגיאת בריאות', error.message);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'שגיאה בבדיקת בריאות שרת');
      }
    }
  }

  // הפעלה מחדש של שרת
    // פונקציה מתקדמת להפעלת שרת עם בחירות
    async restartServerAdvanced(restartType = 'quick', cacheMode = 'preserve') {
      if (!this.canPerformAction('restart')) {
        return;
      }

      try {
        console.log(`🔄 ServerMonitor - מפעיל שרת מחדש מתקדם: ${restartType}, cache: ${cacheMode}`);

        // נסה להפעיל שרת דרך API המתקדם
        try {
          // בנה את ה-body בהתאם לבחירות
          let requestBody = { mode: cacheMode };
          
          // הוסף מידע על סוג האיתחול אם רלוונטי
          if (restartType !== 'auto') {
            requestBody.restart_type = restartType;
          }

          const response = await fetch('/api/server/change-mode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ שרת הופעל מחדש מתקדם: ${restartType}, ${cacheMode}`, result);
          this.addLog('success', 'הפעלה מחדש מתקדמת', `השרת הופעל מחדש: ${restartType}, cache: ${cacheMode}`);
          // הודעות יוצגו מהפונקציה הגלובלית
          return;
        } else if (response.status === 429) {
          // שגיאת rate limiting - נסה fallback
          console.log('⚠️ Rate limiting - מנסה fallback...');
          throw new Error('Rate limiting - נסה שוב בעוד כמה שניות');
        } else {
          throw new Error(`שגיאה בהפעלה מחדש: ${response.status}`);
        }
      } catch (apiError) {
        // Fallback - הודעה למשתמש להפעיל ידנית
        console.log('🔄 Fallback - הודעה למשתמש');
        this.addLog('warning', 'הפעלה מחדש מתקדמת', `השרת לא זמין - נסה להפעיל מחדש ידנית: ./restart ${restartType} --cache-mode=${cacheMode}`);
        
        // הצג הודעה למשתמש עם הפקודה המדויקת
        const manualCommand = `./restart ${restartType} --cache-mode=${cacheMode}`;
        if (typeof window.showNotification === 'function') {
          window.showNotification(`השרת לא זמין - נסה להפעיל מחדש ידנית עם: ${manualCommand}`, 'warning');
        } else if (typeof window.showWarningNotification === 'function') {
          window.showWarningNotification(`השרת לא זמין - נסה להפעיל מחדש ידנית עם: ${manualCommand}`);
        }
        
        throw new Error(`השרת לא זמין - נסה להפעיל מחדש ידנית עם: ${manualCommand}`);
      }
    } catch (error) {
      console.error('❌ שגיאה בהפעלה מחדש מתקדמת:', error);
      this.addLog('error', 'שגיאת הפעלה מתקדמת', error.message);
      // הודעות שגיאה יוצגו מהפונקציה הגלובלית
      throw error;
    }
  }

    async restartServer() {
      if (!this.canPerformAction('restart')) {
        return;
      }

      try {
        console.log('🔄 ServerMonitor - מפעיל שרת מחדש');

        // נסה להפעיל שרת דרך API המתקדם
        try {
          const response = await fetch('/api/server/change-mode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              mode: 'development' // מצב ברירת מחדל
            })
          });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ שרת הופעל מחדש:', result);
          this.addLog('success', 'הפעלה מחדש', 'השרת הופעל מחדש בהצלחה');
          // הודעות יוצגו מהפונקציה הגלובלית
          return;
        } else if (response.status === 429) {
          // שגיאת rate limiting - נסה fallback
          console.log('⚠️ Rate limiting - מנסה fallback...');
          throw new Error('Rate limiting - נסה שוב בעוד כמה שניות');
        } else {
          throw new Error(`שגיאה בהפעלה מחדש: ${response.status}`);
        }
      } catch (apiError) {
        // Fallback - הודעה למשתמש להפעיל ידנית
        console.log('🔄 Fallback - הודעה למשתמש');
        this.addLog('warning', 'הפעלה מחדש', 'השרת לא זמין - נסה להפעיל מחדש ידנית');
        
        // הצג הודעה למשתמש
        if (typeof window.showNotification === 'function') {
          window.showNotification('השרת לא זמין - נסה להפעיל מחדש ידנית עם ./restart --cache-mode=development', 'warning');
        } else if (typeof window.showWarningNotification === 'function') {
          window.showWarningNotification('השרת לא זמין - נסה להפעיל מחדש ידנית עם ./restart --cache-mode=development');
        }
        
        throw new Error('השרת לא זמין - נסה להפעיל מחדש ידנית עם ./restart');
      }
    } catch (error) {
      console.error('❌ שגיאה בהפעלה מחדש:', error);
      this.addLog('error', 'שגיאת הפעלה', error.message);
      // הודעות שגיאה יוצגו מהפונקציה הגלובלית
      throw error;
    }
  }

  // בדיקת בריאות השרת אחרי הפעלה מחדש
  async checkServerHealthAfterRestart() {
    console.log('🔍 בודק בריאות השרת אחרי הפעלה מחדש...');
    
    try {
      // נסה מספר פעמים עם המתנה
      for (let attempt = 1; attempt <= 10; attempt++) {
        console.log(`🔍 ניסיון ${attempt}/10 - בודק בריאות השרת...`);
        
        try {
          const response = await fetch('/api/health', {
            method: 'GET',
            timeout: 5000 // 5 שניות timeout
          });
          
          if (response.ok) {
            const healthData = await response.json();
            console.log('✅ השרת זמין!', healthData);
            return true;
          }
        } catch (fetchError) {
          console.log(`⚠️ ניסיון ${attempt} נכשל:`, fetchError.message);
        }
        
        // המתן לפני הניסיון הבא
        if (attempt < 10) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 שניות המתנה
        }
      }
      
      console.log('❌ השרת לא זמין אחרי 10 ניסיונות');
      return false;
      
    } catch (error) {
      console.error('❌ שגיאה בבדיקת בריאות השרת:', error);
      return false;
    }
  }

  // ניקוי מטמון
  async clearCache() {
    if (!this.canPerformAction('clearCache')) {
      return;
    }

    try {
      console.log('🧹 ServerMonitor - מנקה מטמון');

      const response = await fetch('/api/cache/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ מטמון נוקה:', result);
        this.addLog('success', 'ניקוי מטמון', 'המטמון נוקה בהצלחה');
        if (window.showSuccessNotification) {
          window.showSuccessNotification('ניטור שרת', 'המטמון נוקה בהצלחה');
        }
      } else {
        throw new Error('שגיאה בניקוי מטמון');
      }
    } catch (error) {
      console.error('❌ שגיאה בניקוי מטמון:', error);
      this.addLog('error', 'שגיאת ניקוי', error.message);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'שגיאה בניקוי מטמון');
      }
    }
  }

  // עצירת חירום
  async emergencyStop() {
    if (!this.canPerformAction('emergencyStop')) {
      return;
    }

    try {
      console.log('🛑 ServerMonitor - מבצע עצירת חירום');

      // בדיקה עם מערכת התראות
      let confirmed = false;
      
      // נסה להשתמש במערכת התראות לאישור
      if (typeof window.showConfirmationDialog === 'function') {
        confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'עצירת חירום',
            'האם אתה בטוח שברצונך לבצע עצירת חירום? זה יעצור את השרת מיידית!',
            () => resolve(true),
            () => resolve(false),
            'danger' // צבע אדום לעצירת חירום
          );
        });
      } else if (typeof window.globalConfirm === 'function') {
        confirmed = await new Promise(resolve => {
          window.globalConfirm(
            'האם אתה בטוח שברצונך לבצע עצירת חירום? זה יעצור את השרת מיידית!',
            () => resolve(true),
            () => resolve(false),
            'עצירת חירום',
            'danger'
          );
        });
      } else {
        // fallback ל-confirm רגיל
        confirmed = confirm('האם אתה בטוח שברצונך לבצע עצירת חירום? זה יעצור את השרת מיידית!');
      }
      
      if (!confirmed) {
        return;
      }

      const response = await fetch('/api/server/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ עצירת חירום הושלמה:', result);
        this.addLog('warning', 'עצירת חירום', 'השרת נעצר בהצלחה');
        if (window.showWarningNotification) {
          window.showWarningNotification('ניטור שרת', 'עצירת חירום הושלמה');
        }
      } else {
        throw new Error('שגיאה בעצירת חירום');
      }
    } catch (error) {
      console.error('❌ שגיאה בעצירת חירום:', error);
      this.addLog('error', 'שגיאת עצירה', error.message);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'שגיאה בעצירת חירום');
      }
    }
  }

  // עדכון מידע מערכת
  updateSystemInfo(data) {
    const systemInfo = document.getElementById('systemInfo');
    if (systemInfo && data) {
      systemInfo.innerHTML = `
        <div class="info-item">
          <span class="info-label">גרסת Python:</span>
          <span class="info-value">${data.python_version || 'לא ידוע'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">גרסת Flask:</span>
          <span class="info-value">${data.flask_version || 'לא ידוע'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">זמן פעולה:</span>
          <span class="info-value">${data.uptime || 'לא ידוע'}</span>
        </div>
      `;
    }
    }
  }

  // הגדרת מאזינים ל-Cursor Tasks
  setupCursorTasksListeners() {
    // Quick Actions
    const quickStartBtn = document.getElementById('quickStartBtn');
    if (quickStartBtn) {
      quickStartBtn.addEventListener('click', () => this.executeQuickStart());
    }

    const quickRestartBtn = document.getElementById('quickRestartBtn');
    if (quickRestartBtn) {
      quickRestartBtn.addEventListener('click', () => this.executeQuickRestart());
    }

    const quickRestartBtn2 = document.getElementById('quickRestartBtn2');
    if (quickRestartBtn2) {
      quickRestartBtn2.addEventListener('click', () => this.executeQuickRestart());
    }

    const quickStopBtn = document.getElementById('quickStopBtn');
    if (quickStopBtn) {
      quickStopBtn.addEventListener('click', () => this.executeQuickStop());
    }

    const quickStatusBtn = document.getElementById('quickStatusBtn');
    if (quickStatusBtn) {
      quickStatusBtn.addEventListener('click', () => this.executeQuickStatus());
    }

    // Cache Mode Buttons
    const devModeBtn = document.getElementById('devModeBtn');
    if (devModeBtn) {
      devModeBtn.addEventListener('click', () => this.executeCacheMode('development'));
    }

    const noCacheBtn = document.getElementById('noCacheBtn');
    if (noCacheBtn) {
      noCacheBtn.addEventListener('click', () => this.executeCacheMode('no-cache'));
    }

    const productionModeBtn = document.getElementById('productionModeBtn');
    if (productionModeBtn) {
      productionModeBtn.addEventListener('click', () => this.executeCacheMode('production'));
    }

    const preserveModeBtn = document.getElementById('preserveModeBtn');
    if (preserveModeBtn) {
      preserveModeBtn.addEventListener('click', () => this.executeCacheMode('preserve'));
    }

    // Dashboard Buttons
    const openSystemManagementBtn = document.getElementById('openSystemManagementBtn');
    if (openSystemManagementBtn) {
      openSystemManagementBtn.addEventListener('click', () => this.openSystemManagement());
    }

    const openAllDashboardsBtn = document.getElementById('openAllDashboardsBtn');
    if (openAllDashboardsBtn) {
      openAllDashboardsBtn.addEventListener('click', () => this.openAllDashboards());
    }

    const changeModeBtn = document.getElementById('changeModeBtn');
    if (changeModeBtn) {
      changeModeBtn.addEventListener('click', () => this.showModeSelector());
  }

  // ========================================
  // Cursor Tasks Functions
  // ========================================

  // ביצוע התחלה מהירה
  async executeQuickStart() {
    if (!this.canPerformAction('quickStart')) return;
    
    try {
      this.addLog('🚀 מבצע התחלה מהירה...', 'info');
      
      const response = await fetch('/api/server/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        this.addLog('✅ שרת הותח בהצלחה', 'success');
        this.showNotification('שרת הותח בהצלחה', 'success');
        setTimeout(() => this.loadHealthData(), 2000);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.addLog(`❌ שגיאה בהתחלת שרת: ${error.message}`, 'error');
      this.showNotification('שגיאה בהתחלת שרת', 'error');
    }
  }

  // ביצוע איתחול מהיר
  async executeQuickRestart() {
    if (!this.canPerformAction('restart')) return;
    
    try {
      this.addLog('🔄 מבצע איתחול מהיר...', 'info');
      
      const response = await fetch('/api/server/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        this.addLog('✅ שרת אותחל בהצלחה', 'success');
        this.showNotification('שרת אותחל בהצלחה', 'success');
        setTimeout(() => this.loadHealthData(), 3000);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.addLog(`❌ שגיאה באיתחול שרת: ${error.message}`, 'error');
      this.showNotification('שגיאה באיתחול שרת', 'error');
    }
  }

  // ביצוע עצירה מהירה
  async executeQuickStop() {
    if (!this.canPerformAction('stop')) return;
    
    try {
      this.addLog('🛑 מבצע עצירה מהירה...', 'info');
      
      const response = await fetch('/api/server/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        this.addLog('✅ שרת נעצר בהצלחה', 'success');
        this.showNotification('שרת נעצר בהצלחה', 'success');
        setTimeout(() => this.loadHealthData(), 1000);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.addLog(`❌ שגיאה בעצירת שרת: ${error.message}`, 'error');
      this.showNotification('שגיאה בעצירת שרת', 'error');
    }
  }

  // ביצוע בדיקת סטטוס
  async executeQuickStatus() {
    if (!this.canPerformAction('status')) return;
    
    try {
      this.addLog('📊 בודק סטטוס שרת...', 'info');
      await this.loadHealthData();
      this.addLog('✅ סטטוס שרת עודכן', 'success');
    } catch (error) {
      this.addLog(`❌ שגיאה בבדיקת סטטוס: ${error.message}`, 'error');
    }
  }

  // ביצוע שינוי מצב מטמון
  async executeCacheMode(mode) {
    if (!this.canPerformAction('changeMode')) return;
    
    try {
      this.addLog(`🎛️ משנה מצב מטמון ל-${mode}...`, 'info');
      
      const response = await fetch('/api/server/change-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: mode,
          restart_type: 'quick'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        this.addLog(`✅ מצב מטמון שונה ל-${mode}`, 'success');
        this.showNotification(`מצב מטמון שונה ל-${mode}`, 'success');
        this.updateCurrentMode(mode);
        setTimeout(() => this.loadHealthData(), 3000);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.addLog(`❌ שגיאה בשינוי מצב מטמון: ${error.message}`, 'error');
      this.showNotification('שגיאה בשינוי מצב מטמון', 'error');
    }
  }

  // פתיחת דשבורד ניהול מערכת
  openSystemManagement() {
    window.open('http://127.0.0.1:8080/system-management', '_blank');
    this.addLog('🔧 פתיחת דשבורד ניהול מערכת', 'info');
  }

  // פתיחת כל הדשבורדים
  openAllDashboards() {
    window.open('http://127.0.0.1:8080/server-monitor', '_blank');
    window.open('http://127.0.0.1:8080/external-data-dashboard.html', '_blank');
    window.open('http://127.0.0.1:8080/crud-testing-dashboard.html', '_blank');
    this.addLog('🚀 פתיחת כל הדשבורדים', 'info');
  }

  // הצגת בחירת מצב
  showModeSelector() {
    const modes = [
      { value: 'development', label: 'Development (10s)', icon: 'fas fa-code' },
      { value: 'no-cache', label: 'No Cache', icon: 'fas fa-ban' },
      { value: 'production', label: 'Production (5min)', icon: 'fas fa-industry' },
      { value: 'preserve', label: 'Preserve', icon: 'fas fa-save' }
    ];

    const modalHtml = `
      <div class="modal fade" id="modeSelectorModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">🎛️ בחירת מצב מטמון</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="d-grid gap-2">
                ${modes.map(mode => `
                  <button class="btn" onclick="serverMonitor.executeCacheMode('${mode.value}'); bootstrap.Modal.getInstance(document.getElementById('modeSelectorModal')).hide();">
                    <i class="${mode.icon}"></i> ${mode.label}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('modeSelectorModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('modeSelectorModal'));
    modal.show();
  }

  // עדכון מצב נוכחי
  updateCurrentMode(mode) {
    const currentCacheMode = document.getElementById('currentCacheMode');
    if (currentCacheMode) {
      currentCacheMode.textContent = mode;
      currentCacheMode.className = `badge bg-${this.getModeColor(mode)}`;
    }
  }

  // קבלת צבע למצב
  getModeColor(mode) {
    const colors = {
      'development': 'primary',
      'no-cache': 'danger',
      'production': 'success',
      'preserve': 'secondary'
    };
    return colors[mode] || 'secondary';
  }

  // הצגת התראה
  showNotification(message, type = 'info') {
    // Use the global notification system if available
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      // Fallback to console
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }
}

// הוסר - המערכת המאוחדת מטפלת באתחול
// אתחול המערכת כשהדף נטען
// document.addEventListener('DOMContentLoaded', function() {
//   console.log('🎯 DOM loaded, initializing ServerMonitor...');
  
  // יצירת instance גלובלי
  window.serverMonitor = new ServerMonitor();
  
  // Setup enhanced monitoring event listeners
  setupMonitoringEventListeners();
  
  console.log('✅ ServerMonitor initialized successfully');
// });

// יצירת instance גלובלי מיד
window.serverMonitor = new ServerMonitor();

// ===== GLOBAL FUNCTION EXPORTS =====

// window. export removed - using global version from system-management.js
// window.toggleAllSections export removed - using global version from ui-utils.js
// window.toggleSection export removed - using global version from ui-utils.js

// הוספת פונקציות גלובליות
// Local  function for server-monitor page
async function  {
  if (window.serverMonitor) {
    return window.serverMonitor.;
  } else {
    console.error('❌ serverMonitor instance לא קיים');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'serverMonitor לא אותחל');
    }
  }
}



// הוספת פונקציות חסרות
ServerMonitor.optimizeDatabase = () => {
  if (window.serverMonitor) {
    return window.serverMonitor.optimizeDatabase();
  } else {
    console.error('❌ serverMonitor instance לא קיים');
  }
};

ServerMonitor.exportLogs = () => {
  if (window.serverMonitor) {
    return window.serverMonitor.exportLogs();
  } else {
    console.error('❌ serverMonitor instance לא קיים');
  }
};

console.log('✅ ServerMonitor instance נוצר:', window.serverMonitor);

/**
 * Generate detailed log for Server Monitor
 */
function generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - ניטור שרת ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // 1. מצב כללי של העמוד
    log.push('--- מצב כללי של העמוד ---');
    const sections = [
        { id: 'section1', title: '⚡ פעולות מהירות' },
        { id: 'section2', title: '📊 סטטיסטיקות מערכת' },
        { id: 'section3', title: '🔌 API Status & Endpoints' },
        { id: 'section4', title: '📋 לוגים' }
    ];
    
    sections.forEach((section, index) => {
        const element = document.getElementById(section.id);
        if (element) {
            const isOpen = !element.classList.contains('d-none');
            log.push(`  ${index + 1}. "${section.title}": ${isOpen ? 'פתוח' : 'סגור'}`);
        } else {
            log.push(`  ${index + 1}. "${section.title}": לא נמצא`);
        }
    });

    // 2. סטטוס ניטור
    log.push('');
    log.push('--- סטטוס ניטור ---');
    const monitoringElements = [
        'monitoringStatus', 'statusText', 'lastCheck', 'summaryStats',
        'serverStatusStats', 'databaseStatusStats', 'cacheStatusStats', 'overallStatus'
    ];
    
    monitoringElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            const value = element.textContent.trim();
            const visible = element.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`${elementId}: ${value} (${visible})`);
        }
    });

    // 3. סטטוס שרת
    log.push('');
    log.push('--- סטטוס שרת ---');
    const serverElements = [
        'serverStatus', 'uptime', 'memoryUsage', 'cpuUsage'
    ];
    
    serverElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            const value = element.textContent.trim();
            const visible = element.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`${elementId}: ${value} (${visible})`);
        }
    });

    // 4. סטטוס בסיס נתונים
    log.push('');
    log.push('--- סטטוס בסיס נתונים ---');
    const databaseElements = [
        'databaseStatus', 'databaseSize', 'databaseConnections', 'databaseQueries'
    ];
    
    databaseElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            const value = element.textContent.trim();
            const visible = element.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`${elementId}: ${value} (${visible})`);
        }
    });


    // 5. סטטוס API Status & Endpoints
    log.push('');
    log.push('--- API Status & Endpoints ---');
    const apiElements = [
        'apiHealth', 'apiResponseTime', 'serverPort', 'lastApiCheck',
        'totalRequests', 'avgResponseTime', 'errorRate', 'uptime'
    ];
    
    apiElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            const value = element.textContent.trim();
            const visible = element.offsetParent !== null ? 'נראה' : 'לא נראה';
            log.push(`${elementId}: ${value} (${visible})`);
        }
    });

    // 6. לוגים
    log.push('');
    log.push('--- לוגים ---');
    const logsContainer = document.getElementById('logsContainer');
    if (logsContainer) {
        const visible = logsContainer.offsetParent !== null ? 'נראה' : 'לא נראה';
        const content = logsContainer.textContent.trim().substring(0, 200) + '...';
        log.push(`logsContainer: ${visible} - "${content}"`);
    }

    // 7. כפתורים וקונטרולים
    log.push('');
    log.push('--- כפתורים וקונטרולים ---');
    
    // בדיקת כפתורי פעולות מהירות
    const actionButtons = document.querySelectorAll('button[onclick*="restartServer"], button[onclick*="stopServer"], button[onclick*="refreshStatus"], button[onclick*="clearLogs"]');
    actionButtons.forEach((btn, index) => {
        const visible = btn.offsetParent !== null ? 'נראה' : 'לא נראה';
        const disabled = btn.disabled ? 'מבוטל' : 'פעיל';
        const text = btn.textContent.trim() || 'ללא טקסט';
        log.push(`פעולה ${index + 1}: ${visible} - ${disabled} - "${text}"`);
    });
    
    // בדיקת אפשרויות בחירה מתקדמות
    const cacheModeSelect = document.getElementById('cacheMode');
    const restartTypeSelect = document.getElementById('restartType');
    
    if (cacheModeSelect) {
        const selectedValue = cacheModeSelect.value;
        const selectedText = cacheModeSelect.options[cacheModeSelect.selectedIndex]?.textContent.trim() || 'לא נבחר';
        const visible = cacheModeSelect.offsetParent !== null ? 'נראה' : 'לא נראה';
        log.push(`מצב Cache: ${visible} - נבחר: "${selectedText}" (${selectedValue})`);
    }
    
    if (restartTypeSelect) {
        const selectedValue = restartTypeSelect.value;
        const selectedText = restartTypeSelect.options[restartTypeSelect.selectedIndex]?.textContent.trim() || 'לא נבחר';
        const visible = restartTypeSelect.offsetParent !== null ? 'נראה' : 'לא נראה';
        log.push(`סוג איתחול: ${visible} - נבחר: "${selectedText}" (${selectedValue})`);
    }
    
    
    // בדיקת כפתורי API
    const apiButtons = document.querySelectorAll('button[onclick*="checkApiHealth"], a[href*="external-data"]');
    apiButtons.forEach((btn, index) => {
        const visible = btn.offsetParent !== null ? 'נראה' : 'לא נראה';
        const disabled = btn.disabled ? 'מבוטל' : 'פעיל';
        const text = btn.textContent.trim() || btn.href || 'ללא טקסט';
        log.push(`API ${index + 1}: ${visible} - ${disabled} - "${text}"`);
    });

    // 9. מידע טכני
    log.push('');
    log.push('--- מידע טכני ---');
    log.push(`זמן יצירת הלוג: ${timestamp}`);
    log.push(`גרסת דפדפן: ${navigator.userAgent}`);
    log.push(`רזולוציה מסך: ${screen.width}x${screen.height}`);
    log.push(`גודל חלון: ${window.innerWidth}x${window.innerHeight}`);
    
    if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        log.push(`זמן טעינת עמוד: ${loadTime}ms`);
    }
    
    if (navigator.deviceMemory) {
        log.push(`זיכרון זמין: ${navigator.deviceMemory}GB`);
    }
    
    log.push(`שפת דפדפן: ${navigator.language}`);
    log.push(`פלטפורמה: ${navigator.platform}`);

    // 10. שגיאות והערות מהקונסולה
    log.push('');
    log.push('--- שגיאות והערות מהקונסולה ---');
    log.push('⚠️ חשוב: הלוג המפורט חייב לכלול שגיאות קונסולה לאבחון בעיות');
    log.push('📋 הוראות: פתח את Developer Tools (F12) > Console');
    log.push('📋 העתק את כל השגיאות וההערות מהקונסולה');
    log.push('📋 הוסף אותן ללוג המפורט לפני שליחה');

    log.push('');
    log.push('=== סוף לוג ===');
    return log.join('\n');
}

/**
 * Copy detailed log to clipboard
 */

// ייצוא לגלובל scope
// window. export removed - using global version from system-management.js

// ===== GLOBAL FUNCTION EXPORTS FOR SERVER MONITOR PAGE =====

// Export server management functions to global scope

// רשימה מקיפה של כל ה-endpoints (רק GET endpoints לבדיקה בטוחה)
const ALL_ENDPOINTS = [
  // Core System
  { name: 'Health Check', url: '/api/health', method: 'GET', category: 'Core' },
  { name: 'Detailed Health', url: '/api/health/detailed', method: 'GET', category: 'Core' },
  { name: 'System Info', url: '/api/system-info', method: 'GET', category: 'Core' },
  
  // Server Management
  { name: 'Server Status', url: '/api/server/status', method: 'GET', category: 'Server' },
  { name: 'System Info', url: '/api/server/system/info', method: 'GET', category: 'Server' },
  { name: 'Current Mode', url: '/api/server/current-mode', method: 'GET', category: 'Server' },
  { name: 'Mode History', url: '/api/server/mode-history', method: 'GET', category: 'Server' },
  { name: 'Restart Status', url: '/api/server/restart-status', method: 'GET', category: 'Server' },
  { name: 'Recent Logs', url: '/api/server/logs/recent', method: 'GET', category: 'Server' },
  
  // Cache Management
  { name: 'Cache Stats', url: '/api/cache/stats', method: 'GET', category: 'Cache' },
  { name: 'Cache Status', url: '/api/cache/status', method: 'GET', category: 'Cache' },
  { name: 'Cache Entries', url: '/api/cache/entries', method: 'GET', category: 'Cache' },
  { name: 'Cache Analytics', url: '/api/cache/analytics', method: 'GET', category: 'Cache' },
  { name: 'Cache Dependencies', url: '/api/cache/dependencies', method: 'GET', category: 'Cache' },
  
  // Database & Performance
  { name: 'Database Analyze', url: '/api/database/analyze', method: 'GET', category: 'Database' },
  { name: 'Metrics Report', url: '/api/metrics/report', method: 'GET', category: 'Performance' },
  { name: 'Rate Limits Stats', url: '/api/rate-limits/stats', method: 'GET', category: 'Performance' },
  
  // Trading Accounts
  { name: 'Trading Accounts', url: '/api/trading-accounts/', method: 'GET', category: 'Trading' },
  { name: 'Open Accounts', url: '/api/trading-accounts/open', method: 'GET', category: 'Trading' },
  { name: 'Account Stats', url: '/api/trading-accounts/1/stats', method: 'GET', category: 'Trading' },
  
  // Trades
  { name: 'Trades List', url: '/api/trades/', method: 'GET', category: 'Trading' },
  { name: 'Trade Summary', url: '/api/trades/summary', method: 'GET', category: 'Trading' },
  { name: 'Trades by Account', url: '/api/trades/account/1', method: 'GET', category: 'Trading' },
  
  // Tickers
  { name: 'Tickers List', url: '/api/tickers/', method: 'GET', category: 'Market' },
  
  // Trade Plans
  { name: 'Trade Plans', url: '/api/trade-plans/', method: 'GET', category: 'Trading' },
  { name: 'Trade Plan Summary', url: '/api/trade-plans/summary', method: 'GET', category: 'Trading' },
  { name: 'Plans by Account', url: '/api/trade-plans/account/1', method: 'GET', category: 'Trading' },
  
  // Alerts
  { name: 'Alerts List', url: '/api/alerts/', method: 'GET', category: 'Alerts' },
  { name: 'Unread Alerts', url: '/api/alerts/unread', method: 'GET', category: 'Alerts' },
  
  // Executions
  { name: 'Executions List', url: '/api/executions/', method: 'GET', category: 'Trading' },
  
  // Cash Flows
  { name: 'Cash Flows', url: '/api/cash-flows/', method: 'GET', category: 'Finance' },
  
  // Notes
  { name: 'Notes List', url: '/api/notes/', method: 'GET', category: 'Notes' },
  
  // Users
  { name: 'Users List', url: '/api/users/', method: 'GET', category: 'Users' },
  { name: 'Default User', url: '/api/users/default', method: 'GET', category: 'Users' },
  { name: 'User Statistics', url: '/api/users/1/statistics', method: 'GET', category: 'Users' },
  
  // Preferences
  { name: 'User Preferences', url: '/api/preferences/user', method: 'GET', category: 'Preferences' },
  { name: 'Preference Profiles', url: '/api/preferences/profiles', method: 'GET', category: 'Preferences' },
  { name: 'Preference Groups', url: '/api/preferences/groups', method: 'GET', category: 'Preferences' },
  { name: 'Preference Health', url: '/api/preferences/health', method: 'GET', category: 'Preferences' },
  
  // Background Tasks
  { name: 'Tasks Status', url: '/api/tasks/status', method: 'GET', category: 'Tasks' },
  { name: 'Tasks List', url: '/api/tasks/', method: 'GET', category: 'Tasks' },
  { name: 'Tasks History', url: '/api/tasks/history', method: 'GET', category: 'Tasks' },
  { name: 'Tasks Analytics', url: '/api/tasks/analytics', method: 'GET', category: 'Tasks' },
  
  // External Data
  { name: 'Scheduler Status', url: '/api/external-data/scheduler/status', method: 'GET', category: 'External' },
  { name: 'Yahoo Quote', url: '/api/external-data/yahoo/quote/AAPL', method: 'GET', category: 'External' },
  
  // Quotes
  { name: 'Quotes Batch', url: '/api/quotes/batch', method: 'GET', category: 'Market' },
  { name: 'User Preferences', url: '/api/quotes/user/preferences', method: 'GET', category: 'Market' },
  
  // Entity Details
  { name: 'Entity Types', url: '/api/entity-details/types', method: 'GET', category: 'Entities' },
  { name: 'Entity Health', url: '/api/entity-details/health', method: 'GET', category: 'Entities' },
  
  // Linked Items
  { name: 'Linked Item Types', url: '/api/linked-items/types', method: 'GET', category: 'Relations' },
  
  // Note Relations
  { name: 'Note Relation Types', url: '/api/note-relation-types/', method: 'GET', category: 'Relations' },
  
  // File Scanner
  { name: 'File Scanner Files', url: '/api/file-scanner/files', method: 'GET', category: 'Scanner' },
  { name: 'Page Mapping', url: '/api/file-scanner/page-mapping', method: 'GET', category: 'Scanner' },
  { name: 'Functions', url: '/api/file-scanner/functions', method: 'GET', category: 'Scanner' },
  { name: 'Duplicates', url: '/api/file-scanner/duplicates', method: 'GET', category: 'Scanner' },
  { name: 'Local Functions', url: '/api/file-scanner/local-functions', method: 'GET', category: 'Scanner' },
  { name: 'Architecture Check', url: '/api/file-scanner/architecture-check', method: 'GET', category: 'Scanner' },
  
  // System Overview
  { name: 'System Overview', url: '/api/system-overview/overview', method: 'GET', category: 'System' },
  { name: 'System Health', url: '/api/system-overview/health', method: 'GET', category: 'System' },
  { name: 'System Metrics', url: '/api/system-overview/metrics', method: 'GET', category: 'System' },
  { name: 'System Info', url: '/api/system-overview/info', method: 'GET', category: 'System' },
  { name: 'Database Info', url: '/api/system-overview/database', method: 'GET', category: 'System' },
  { name: 'Cache Info', url: '/api/system-overview/cache', method: 'GET', category: 'System' },
  { name: 'System Logs', url: '/api/system-overview/logs', method: 'GET', category: 'System' },
  { name: 'Performance Metrics', url: '/api/system-overview/performance', method: 'GET', category: 'System' },
  { name: 'External Data Status', url: '/api/system-overview/external-data', method: 'GET', category: 'System' },
  { name: 'System Alerts', url: '/api/system-overview/alerts', method: 'GET', category: 'System' },
  { name: 'Detailed Log', url: '/api/system-overview/detailed-log', method: 'GET', category: 'System' },
  { name: 'Backup List', url: '/api/system-overview/backup/list', method: 'GET', category: 'System' },
  
  // Query Optimization
  { name: 'Query Optimization', url: '/api/query-optimization/', method: 'GET', category: 'Performance' },
  { name: 'Performance Report', url: '/api/query-optimization/performance-report', method: 'GET', category: 'Performance' },
  { name: 'Slow Queries', url: '/api/query-optimization/slow-queries', method: 'GET', category: 'Performance' },
  { name: 'Optimization Opportunities', url: '/api/query-optimization/optimization-opportunities', method: 'GET', category: 'Performance' },
  { name: 'Query Stats', url: '/api/query-optimization/stats', method: 'GET', category: 'Performance' },
  { name: 'Query Info', url: '/api/query-optimization/info', method: 'GET', category: 'Performance' },
  
  // WAL Management
  { name: 'WAL Status', url: '/api/wal/status', method: 'GET', category: 'Database' },
  { name: 'WAL Health', url: '/api/wal/health', method: 'GET', category: 'Database' },
  
  // CSS Management
  { name: 'CSS Status', url: '/api/css/status', method: 'GET', category: 'Frontend' },
  
  // Cache Management
  { name: 'Cache Management Stats', url: '/api/cache-management/stats', method: 'GET', category: 'Cache' },
  
  // IndexedDB
  { name: 'IndexedDB Stats', url: '/api/indexeddb/stats', method: 'GET', category: 'Storage' },
  
  // CRUD Testing
  { name: 'CRUD Test Status', url: '/api/crud-test-status', method: 'GET', category: 'Testing' }
];

// פונקציה ליצירת רשימת endpoints עם רמזור סטטוס
window.populateEndpointsList = function() {
  const container = document.getElementById('endpointsList');
  if (!container) return;
  
  // קיבוץ לפי קטגוריות
  const categories = {};
  ALL_ENDPOINTS.forEach(endpoint => {
    if (!categories[endpoint.category]) {
      categories[endpoint.category] = [];
    }
    categories[endpoint.category].push(endpoint);
  });
  
  let html = '';
  Object.keys(categories).sort().forEach(category => {
    html += `<div class="mb-4">`;
    html += `<h5 class="text-primary mb-3">${category}</h5>`;
    html += `<div class="row">`;
    
    categories[category].forEach(endpoint => {
      const endpointId = `endpoint-${endpoint.url.replace(/[^a-zA-Z0-9]/g, '_')}`;
      html += `
        <div class="col-md-6 mb-2">
          <div class="d-flex align-items-center p-2 border rounded">
            <div class="me-3">
              <span id="${endpointId}-status" class="badge bg-secondary">⚫</span>
            </div>
            <div class="flex-grow-1">
              <small class="text-muted">${endpoint.method}</small>
              <div class="fw-bold">${endpoint.name}</div>
              <small class="text-muted">${endpoint.url}</small>
            </div>
            <div class="ms-2">
              <span id="${endpointId}-time" class="small text-muted">-</span>
            </div>
          </div>
        </div>
      `;
    });
    
    html += `</div></div>`;
  });
  
  container.innerHTML = html;
};

// פונקציה לבדיקת endpoint יחיד
async function testEndpoint(endpoint) {
  const endpointId = `endpoint-${endpoint.url.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const statusEl = document.getElementById(`${endpointId}-status`);
  const timeEl = document.getElementById(`${endpointId}-time`);
  
  if (!statusEl || !timeEl) return { status: 'unknown', responseTime: 0 };
  
  try {
    statusEl.className = 'badge bg-warning';
    statusEl.textContent = '...';
    timeEl.textContent = 'בדיקה...';
    
    const startTime = Date.now();
    const response = await fetch(endpoint.url, { 
      method: endpoint.method,
      timeout: 5000
    });
    const responseTime = Date.now() - startTime;
    
        if (response.ok) {
          statusEl.className = 'badge bg-success';
          statusEl.textContent = '✓';
          timeEl.textContent = `${responseTime}ms`;
          return { status: 'success', responseTime, statusCode: response.status };
        } else if (response.status === 429) {
          statusEl.className = 'badge bg-warning';
          statusEl.textContent = '⏱️';
          timeEl.textContent = 'Rate Limited';
          return { status: 'rate_limited', responseTime, statusCode: response.status };
        } else if (response.status === 404) {
          statusEl.className = 'badge bg-secondary';
          statusEl.textContent = '❓';
          timeEl.textContent = 'Not Found';
          return { status: 'not_found', responseTime, statusCode: response.status };
        } else {
          statusEl.className = 'badge bg-danger';
          statusEl.textContent = '✗';
          timeEl.textContent = `${response.status}`;
          return { status: 'error', responseTime, statusCode: response.status };
        }
  } catch (error) {
    statusEl.className = 'badge bg-danger';
    statusEl.textContent = '✗';
    timeEl.textContent = 'Error';
    return { status: 'error', responseTime: 0, error: error.message };
  }
}

// פונקציה לבדיקת כל ה-endpoints
window.testAllEndpoints = async function() {
  const button = event?.target || document.querySelector('button[onclick*="testAllEndpoints"]');
  if (button) {
    button.disabled = true;
    button.innerHTML = '🧪 בודק...';
  }
  
  // יצירת ממשק התקדמות
  const progressContainer = document.createElement('div');
  progressContainer.id = 'endpoint-test-progress';
  progressContainer.className = 'mt-3 p-3 border rounded bg-light';
  progressContainer.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <span class="fw-bold">🧪 בדיקת Endpoints</span>
      <span id="progress-counter">0 / ${ALL_ENDPOINTS.length}</span>
    </div>
    <div class="progress mb-2" style="height: 20px;">
      <div id="progress-bar" class="progress-bar progress-bar-striped progress-bar-animated" 
           role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
      </div>
    </div>
    <div id="current-endpoint" class="small text-muted">מתחיל בדיקה...</div>
  `;
  
  // הוספת ממשק ההתקדמות ליד הכפתור
  if (button && button.parentNode) {
    button.parentNode.insertBefore(progressContainer, button.nextSibling);
  }
  
  try {
    if (typeof window.showNotification === 'function') {
      window.showNotification(`בודק ${ALL_ENDPOINTS.length} endpoints...`, 'info');
    }
    
    let successCount = 0;
    let rateLimitedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;
    let totalTime = 0;
    let checkedCount = 0;
    
    const results = []; // שמירת תוצאות מפורטות
    
    // בדיקה בקבוצות קטנות יותר עם המתנה ארוכה יותר
    for (let i = 0; i < ALL_ENDPOINTS.length; i += 3) {
      const batch = ALL_ENDPOINTS.slice(i, i + 3);
      
      // בדיקה רציפה במקום parallel כדי למנוע rate limiting
      for (const endpoint of batch) {
        // עדכון ממשק ההתקדמות
        checkedCount++;
        const progressPercent = Math.round((checkedCount / ALL_ENDPOINTS.length) * 100);
        
        document.getElementById('progress-counter').textContent = `${checkedCount} / ${ALL_ENDPOINTS.length}`;
        document.getElementById('progress-bar').style.width = `${progressPercent}%`;
        document.getElementById('progress-bar').setAttribute('aria-valuenow', progressPercent);
        document.getElementById('current-endpoint').textContent = `בודק: ${endpoint.name}`;
        
        const result = await testEndpoint(endpoint);
        
        // שמירת תוצאה מפורטת
        results.push({
          endpoint: endpoint,
          result: result,
          timestamp: new Date().toISOString()
        });
        
        if (result.status === 'success') successCount++;
        else if (result.status === 'rate_limited') rateLimitedCount++;
        else if (result.status === 'not_found') notFoundCount++;
        else if (result.status === 'error') errorCount++;
        
        totalTime += result.responseTime || 0;
        
        // המתנה בין כל endpoint - הגדלתי ל-2 שניות
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // המתנה ארוכה יותר בין קבוצות - הגדלתי ל-3 שניות
      if (i + 3 < ALL_ENDPOINTS.length) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    const avgTime = successCount > 0 ? Math.round(totalTime / successCount) : 0;
    
    // עדכון ממשק ההתקדמות לסיום
    document.getElementById('current-endpoint').textContent = 'בדיקה הושלמה!';
    document.getElementById('progress-bar').classList.remove('progress-bar-animated');
    document.getElementById('progress-bar').classList.add('bg-success');
    
    // יצירת תוכן מפורט לחלון המודל
    const successEndpoints = results.filter(r => r.result.status === 'success');
    const rateLimitedEndpoints = results.filter(r => r.result.status === 'rate_limited');
    const notFoundEndpoints = results.filter(r => r.result.status === 'not_found');
    const errorEndpoints = results.filter(r => r.result.status === 'error');
    
    const modalContent = `
      <div class="endpoint-test-results">
        <div class="row mb-3">
          <div class="col-md-3">
            <div class="card text-center border-success">
              <div class="card-body">
                <h5 class="card-title text-success">✅ ${successCount}</h5>
                <p class="card-text small">עברו בהצלחה</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center border-warning">
              <div class="card-body">
                <h5 class="card-title text-warning">⏱️ ${rateLimitedCount}</h5>
                <p class="card-text small">מוגבלים</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center border-info">
              <div class="card-body">
                <h5 class="card-title text-info">❓ ${notFoundCount}</h5>
                <p class="card-text small">לא נמצאו</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center border-danger">
              <div class="card-body">
                <h5 class="card-title text-danger">🔴 ${errorCount}</h5>
                <p class="card-text small">שגיאות</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row mb-3">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">📊 סיכום כללי</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4">
                    <strong>זמן תגובה ממוצע:</strong><br>
                    <span class="text-primary">${avgTime}ms</span>
                  </div>
                  <div class="col-md-4">
                    <strong>שיעור הצלחה:</strong><br>
                    <span class="text-${successCount >= ALL_ENDPOINTS.length * 0.8 ? 'success' : 'warning'}">
                      ${Math.round((successCount / ALL_ENDPOINTS.length) * 100)}%
                    </span>
                  </div>
                  <div class="col-md-4">
                    <strong>סטטוס כללי:</strong><br>
                    <span class="badge bg-${successCount === ALL_ENDPOINTS.length ? 'success' : successCount >= ALL_ENDPOINTS.length * 0.8 ? 'warning' : 'danger'}">
                      ${successCount === ALL_ENDPOINTS.length ? 'מושלם' : successCount >= ALL_ENDPOINTS.length * 0.8 ? 'טוב' : 'בעייתי'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        ${errorEndpoints.length > 0 ? `
        <div class="row mb-3">
          <div class="col-12">
            <div class="card border-danger">
              <div class="card-header bg-danger text-white">
                <h6 class="mb-0">🔴 שגיאות (${errorEndpoints.length})</h6>
              </div>
              <div class="card-body">
                <div class="table-responsive" style="max-height: 200px;">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Endpoint</th>
                        <th>URL</th>
                        <th>שגיאה</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${errorEndpoints.map(r => `
                        <tr>
                          <td>${r.endpoint.name}</td>
                          <td><code>${r.endpoint.url}</code></td>
                          <td class="text-danger">${r.result.error || 'Unknown error'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        ` : ''}
        
        ${rateLimitedEndpoints.length > 0 ? `
        <div class="row mb-3">
          <div class="col-12">
            <div class="card border-warning">
              <div class="card-header bg-warning text-dark">
                <h6 class="mb-0">⏱️ מוגבלים (${rateLimitedEndpoints.length})</h6>
              </div>
              <div class="card-body">
                <div class="table-responsive" style="max-height: 200px;">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Endpoint</th>
                        <th>URL</th>
                        <th>זמן תגובה</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rateLimitedEndpoints.map(r => `
                        <tr>
                          <td>${r.endpoint.name}</td>
                          <td><code>${r.endpoint.url}</code></td>
                          <td class="text-warning">${r.result.responseTime || 0}ms</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    `;

    // הצגה בחלון מודל מפורט
    if (typeof window.showDetailsModal === 'function') {
      window.showDetailsModal(
        '🧪 תוצאות בדיקת כל ה-Endpoints',
        modalContent
      );
    } else {
      // fallback להודעה רגילה
      let message = `בדיקה הושלמה: ${successCount}/${ALL_ENDPOINTS.length} פעילים`;
      if (rateLimitedCount > 0) message += `, ${rateLimitedCount} מוגבלים`;
      if (notFoundCount > 0) message += `, ${notFoundCount} לא נמצאו`;
      if (errorCount > 0) message += `, ${errorCount} שגיאות`;
      if (avgTime > 0) message += ` (ממוצע: ${avgTime}ms)`;
      
      if (typeof window.showNotification === 'function') {
        window.showNotification(message, successCount === ALL_ENDPOINTS.length ? 'success' : 'warning');
      }
    }
    
    if (window.serverMonitor) {
      const logMessage = `בדיקה הושלמה: ${successCount}/${ALL_ENDPOINTS.length} פעילים, ${rateLimitedCount} מוגבלים, ${notFoundCount} לא נמצאו, ${errorCount} שגיאות`;
      window.serverMonitor.addLog('info', 'Endpoint Test', logMessage);
    }
    
  } catch (error) {
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בבדיקת endpoints', 'error');
    }
    console.error('❌ שגיאה בבדיקת endpoints:', error);
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = '🧪 בדוק הכל';
    }
    
    // הסרת ממשק ההתקדמות אחרי 5 שניות
    setTimeout(() => {
      const progressContainer = document.getElementById('endpoint-test-progress');
      if (progressContainer) {
        progressContainer.remove();
      }
    }, 5000);
  }
};

// פונקציה לסריקה חוזרת של endpoints חדשים
window.scanNewEndpoints = async function() {
  const button = event?.target || document.querySelector('button[onclick*="scanNewEndpoints"]');
  if (button) {
    button.disabled = true;
    button.innerHTML = '🔍 סורק...';
  }
  
  try {
    if (typeof window.showNotification === 'function') {
      window.showNotification('סורק endpoints חדשים...', 'info');
    }
    
    // בדיקה של endpoints נוספים שעלולים להיות זמינים
    const additionalEndpoints = [
      '/api/accounts/', // אם יש accounts במקום trading-accounts
      '/api/preferences/', // אם יש preferences
      '/api/settings/', // אם יש settings
      '/api/logs/', // אם יש logs
      '/api/status/', // אם יש status כללי
      '/api/info/', // אם יש info כללי
      '/api/version/', // אם יש version
      '/api/config/', // אם יש config
      '/api/backup/', // אם יש backup
      '/api/restore/', // אם יש restore
      '/api/export/', // אם יש export
      '/api/import/' // אם יש import
    ];
    
    let newEndpointsFound = 0;
    let totalChecked = 0;
    
    for (const url of additionalEndpoints) {
      totalChecked++;
      try {
        const response = await fetch(url, { 
          method: 'GET',
          timeout: 2000
        });
        
        if (response.ok) {
          // בדוק אם זה endpoint חדש שלא ברשימה שלנו
          const exists = ALL_ENDPOINTS.some(ep => ep.url === url);
          if (!exists) {
            newEndpointsFound++;
            console.log(`🆕 Endpoint חדש נמצא: ${url}`);
          }
        }
      } catch (error) {
        // endpoint לא קיים או לא זמין
      }
    }
    
            // יצירת הודעה מפורטת לסריקה
            let detailedMessage;
            let notificationType;
            
            if (newEndpointsFound > 0) {
                detailedMessage = `🔍 תוצאות סריקת Endpoints חדשים:
                
🆕 נמצאו ${newEndpointsFound} endpoints חדשים!
${additionalEndpoints.filter(url => {
                    const exists = ALL_ENDPOINTS.some(ep => ep.url === url);
                    return !exists;
                }).map(url => `• ${url}`).join('\n')}

⚠️ יש לעדכן את הרשימה ידנית בקוד.

📊 סיכום:
• סה"כ נבדקו: ${totalChecked} endpoints
• חדשים נמצאו: ${newEndpointsFound}
• קיימים: ${totalChecked - newEndpointsFound}`.trim();
                notificationType = 'warning';
            } else {
                detailedMessage = `🔍 תוצאות סריקת Endpoints חדשים:
                
✅ סריקה הושלמה בהצלחה!

📊 סיכום:
• סה"כ נבדקו: ${totalChecked} endpoints
• חדשים נמצאו: 0
• כל ה-endpoints כבר קיימים ברשימה

🎯 הרשימה מעודכנת ומושלמת!`.trim();
                notificationType = 'success';
            }
            
            // הצגה בחלון פרטים
            if (typeof window.showDetailsModal === 'function') {
                window.showDetailsModal(
                    'סריקת Endpoints חדשים',
                    `<div style="white-space: pre-line; font-family: monospace; font-size: 0.9em;">${detailedMessage}</div>`
                );
            } else {
                // fallback להודעה רגילה
                let message;
                if (newEndpointsFound > 0) {
                    message = `נמצאו ${newEndpointsFound} endpoints חדשים! יש לעדכן את הרשימה ידנית.`;
                } else {
                    message = `סריקה הושלמה: ${totalChecked} endpoints נבדקו, לא נמצאו endpoints חדשים.`;
                }
                
                if (typeof window.showNotification === 'function') {
                    window.showNotification(message, notificationType);
                }
            }
    
    if (window.serverMonitor) {
      const logMessage = `סריקה הושלמה: ${totalChecked} endpoints נבדקו, ${newEndpointsFound} חדשים נמצאו`;
      window.serverMonitor.addLog('info', 'Endpoint Scan', logMessage);
    }
    
  } catch (error) {
    if (typeof window.showNotification === 'function') {
      window.showNotification('שגיאה בסריקת endpoints', 'error');
    }
    console.error('❌ שגיאה בסריקת endpoints:', error);
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = '🔍 סריקה חוזרת';
    }
  }
};

// פונקציה לרענון סטטוס
window.refreshEndpointStatus = function() {
  window.populateEndpointsList();
  if (typeof window.showNotification === 'function') {
    window.showNotification('רשימת endpoints עודכנה', 'info');
  }
};

// פונקציה מתקדמת להפעלת שרת עם בחירות
window.restartServerAdvanced = async function() {
  if (window.serverMonitor) {
    const button = event?.target || document.querySelector('button[onclick*="restartServerAdvanced"]');
    if (button) {
      button.disabled = true;
      button.innerHTML = '🔄 מפעיל...';
    }
    
    try {
      // קבל את הבחירות מהממשק
      const cacheMode = document.getElementById('cacheMode')?.value || 'preserve';
      const restartType = document.getElementById('restartType')?.value || 'quick';
      
      console.log(`🚀 הפעלת שרת מתקדמת: ${restartType} mode, cache: ${cacheMode}`);
      
      // הודעת מידע - התהליך מתחיל
      if (typeof window.showNotification === 'function') {
        window.showNotification(`מפעיל שרת מחדש... (${restartType}, ${cacheMode})`, 'info');
      } else if (typeof window.showInfoNotification === 'function') {
        window.showInfoNotification(`מפעיל שרת מחדש... (${restartType}, ${cacheMode})`);
      }
      
      // הפעל את השרת עם הפרמטרים החדשים
      await window.serverMonitor.restartServerAdvanced(restartType, cacheMode);
      
      // המתן קצת זמן לשרת להתחיל
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // בדוק שהשרת חזר לעבוד
      const serverWorking = await window.serverMonitor.checkServerHealthAfterRestart();
      
      if (serverWorking) {
        if (typeof window.showNotification === 'function') {
          window.showNotification(`✅ השרת הופעל מחדש בהצלחה! (${restartType}, ${cacheMode})`, 'success');
        } else if (typeof window.showSuccessNotification === 'function') {
          window.showSuccessNotification(`✅ השרת הופעל מחדש בהצלחה! (${restartType}, ${cacheMode})`);
        }
      } else {
        if (typeof window.showNotification === 'function') {
          window.showNotification(`⚠️ השרת הופעל מחדש אבל עדיין לא זמין - נסה לרענן את הדף`, 'warning');
        } else if (typeof window.showWarningNotification === 'function') {
          window.showWarningNotification(`⚠️ השרת הופעל מחדש אבל עדיין לא זמין - נסה לרענן את הדף`);
        }
      }
    } catch (error) {
      if (typeof window.showNotification === 'function') {
        window.showNotification('שגיאה בהפעלת השרת מחדש', 'error');
      } else if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה בהפעלת השרת מחדש');
      } else {
        console.error('❌ שגיאה בהפעלת השרת מחדש:', error);
      }
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = '🔄 הפעל שרת';
      }
    }
  } else {
    console.error('❌ ServerMonitor לא זמין');
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('ServerMonitor לא זמין');
    }
  }
};

window.restartServer = async function() {
    if (window.serverMonitor) {
        // הוספת משוב ויזואלי
        const button = event?.target || document.querySelector('button[onclick*="restartServer"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '🔄 מפעיל...';
        }
        
        try {
            // הודעת מידע - התהליך מתחיל
            if (typeof window.showNotification === 'function') {
                window.showNotification('מפעיל שרת מחדש...', 'info');
            } else if (typeof window.showInfoNotification === 'function') {
                window.showInfoNotification('מפעיל שרת מחדש...');
            }
            
            // קריאה ישירה לפונקציה בתוך הקלאס ללא הודעות כפולות
            await window.serverMonitor.restartServer();
            
            // המתן קצת זמן לשרת להתחיל
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // בדוק שהשרת חזר לעבוד
            const serverWorking = await window.serverMonitor.checkServerHealthAfterRestart();
            
            if (serverWorking) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('✅ השרת הופעל מחדש בהצלחה!', 'success');
                } else if (typeof window.showSuccessNotification === 'function') {
                    window.showSuccessNotification('✅ השרת הופעל מחדש בהצלחה!');
                }
            } else {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('⚠️ השרת הופעל מחדש אבל עדיין לא זמין - נסה לרענן את הדף', 'warning');
                } else if (typeof window.showWarningNotification === 'function') {
                    window.showWarningNotification('⚠️ השרת הופעל מחדש אבל עדיין לא זמין - נסה לרענן את הדף');
                }
            }
        } catch (error) {
            // הודעת שגיאה
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה בהפעלת השרת מחדש', 'error');
            } else if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בהפעלת השרת מחדש');
            } else {
                console.error('❌ שגיאה בהפעלת השרת מחדש');
            }
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '🔄 הפעל שרת';
            }
        }
    } else {
        console.error('❌ serverMonitor instance לא קיים');
        if (typeof window.showNotification === 'function') {
            window.showNotification('serverMonitor לא אותחל', 'error');
        } else if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('serverMonitor לא אותחל');
        }
    }
};

window.stopServer = async function() {
    if (window.serverMonitor) {
        // הוספת משוב ויזואלי
        const button = event?.target || document.querySelector('button[onclick*="stopServer"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '⏹️ עוצר...';
        }
        
        try {
            await window.serverMonitor.emergencyStop();
            
            // הודעת הצלחה
            if (typeof window.showNotification === 'function') {
                window.showNotification('השרת נעצר בהצלחה', 'success');
            } else if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('השרת נעצר בהצלחה');
            } else {
                console.log('✅ השרת נעצר בהצלחה');
            }
        } catch (error) {
            // הודעת שגיאה
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה בעצירת השרת', 'error');
            } else if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בעצירת השרת');
            } else {
                console.error('❌ שגיאה בעצירת השרת');
            }
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '⏹️ עצור שרת';
            }
        }
    } else {
        console.error('❌ serverMonitor instance לא קיים');
        if (window.showNotification) {
            window.showNotification('serverMonitor לא אותחל', 'error');
        }
    }
};

window.refreshStatus = async function() {
    if (window.serverMonitor) {
        // הוספת משוב ויזואלי
        const button = event?.target || document.querySelector('button[onclick*="refreshStatus"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '🔄 מרענן...';
        }
        
        try {
            // רענון מלא של כל הנתונים
            await window.serverMonitor.checkServerStatus();
            await window.serverMonitor.loadHealthData();
            await window.serverMonitor.loadSystemInfo();
            
      // הודעה על הצלחה
      if (typeof window.showNotification === 'function') {
        window.showNotification('סטטוס עודכן בהצלחה', 'success');
      } else if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('סטטוס עודכן בהצלחה');
      } else {
        console.log('✅ סטטוס עודכן בהצלחה');
      }
        } catch (error) {
            console.error('❌ שגיאה ברענון:', error);
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה ברענון הסטטוס', 'error');
            } else if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה ברענון הסטטוס');
            } else {
                console.error('❌ שגיאה ברענון הסטטוס');
            }
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '🔄 רענן סטטוס';
            }
        }
    } else {
        console.error('❌ serverMonitor instance לא קיים');
        if (window.showNotification) {
            window.showNotification('serverMonitor לא אותחל', 'error');
        }
    }
};

window.clearLogs = async function() {
    if (window.serverMonitor) {
        // הוספת משוב ויזואלי
        const button = event?.target || document.querySelector('button[onclick*="clearLogs"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '🗑️ מנקה...';
        }
        
        try {
            await window.serverMonitor.clearLogs();
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '🗑️ נקה לוגים';
            }
        }
    } else {
        console.error('❌ serverMonitor instance לא קיים');
        if (window.showNotification) {
            window.showNotification('serverMonitor לא אותחל', 'error');
        }
    }
};

// clearCache function moved to UnifiedCacheManager to avoid duplication
// Use window.clearCacheQuick() or window.clearAllCacheAdvanced() instead

window.checkApiHealth = async function() {
    if (window.serverMonitor) {
        // הוספת משוב ויזואלי
        const button = event?.target || document.querySelector('button[onclick*="checkApiHealth"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '🔍 בודק...';
        }
        
        try {
            if (typeof window.showNotification === 'function') {
                window.showNotification('מבצע בדיקת בריאות מפורטת...', 'info');
            }
            
            const healthResults = await window.serverMonitor.performDetailedHealthCheck();
            
            // הצגת תוצאות מפורטות
            const rateLimitedTests = healthResults.failedTests.filter(test => test.error.includes('429'));
            const otherFailedTests = healthResults.failedTests.filter(test => !test.error.includes('429'));
            
            const detailsMessage = `
🔍 תוצאות בדיקת בריאות מפורטת:

${healthResults.overallStatus === 'healthy' ? '✅ הכל תקין!' : healthResults.overallStatus === 'degraded' ? '⚠️ בעיות קלות' : '❌ בעיות חמורות'}

✅ בדיקות שעברו (${healthResults.passed}):
${healthResults.passedTests.map(test => `• ${test.name}: ${test.responseTime}ms`).join('\n')}

${rateLimitedTests.length > 0 ? `⏱️ מוגבלים על ידי Rate Limiting (${rateLimitedTests.length}):
${rateLimitedTests.map(test => `• ${test.name}: ${test.error}`).join('\n')}

💡 הסבר: Rate Limiting הוא מנגנון הגנה תקין של השרת מפני עומס יתר.
הבדיקות האלה עובדות, אבל השרת מגביל אותן כדי לשמור על ביצועים.` : ''}

${otherFailedTests.length > 0 ? `❌ בדיקות שנכשלו (${otherFailedTests.length}):
${otherFailedTests.map(test => `• ${test.name}: ${test.error}`).join('\n')}` : ''}

${healthResults.failed === 0 ? '✅ אין בדיקות שנכשלו!' : ''}

📊 סיכום:
• זמן תגובה ממוצע: ${healthResults.avgResponseTime}ms
• שיעור הצלחה: ${healthResults.successRate}%
• סטטוס כללי: ${healthResults.overallStatus === 'healthy' ? '🟢 תקין' : healthResults.overallStatus === 'degraded' ? '🟡 מופחת' : '🔴 בעייתי'}

${rateLimitedTests.length > 0 ? '🛡️ המערכת מוגנת היטב מפני עומס יתר!' : healthResults.overallStatus === 'healthy' ? '🎉 המערכת פועלת בצורה מושלמת!' : '⚠️ יש בעיות שדורשות תשומת לב'}

🕒 זמן בדיקה: ${new Date().toLocaleString('he-IL')}
            `.trim();
            
            // הצגה בחלון הודעות
            if (typeof window.showDetailsModal === 'function') {
                window.showDetailsModal(
                    'בדיקת בריאות מפורטת',
                    `<div style="white-space: pre-line; font-family: monospace; font-size: 0.9em;">${detailsMessage}</div>`
                );
            } else {
                // fallback - הצגה בלוג
                console.log(detailsMessage);
                
                if (typeof window.showNotification === 'function') {
                    const shortMessage = `בדיקת בריאות: ${healthResults.passed}/${healthResults.total} עברו (${healthResults.successRate}%)`;
                    window.showNotification(shortMessage, healthResults.overallStatus === 'healthy' ? 'success' : 'warning');
                }
            }
        } catch (error) {
            console.error('❌ Error in performDetailedHealthCheck:', error);
            
            // הצגת שגיאה מפורטת בחלון פרטים
            if (typeof window.showDetailsModal === 'function') {
                const errorMessage = `❌ שגיאה בבדיקת בריאות מפורטת:

🔍 פרטי השגיאה:
${error.message || 'שגיאה לא ידועה'}

📊 סיכום:
• זמן בדיקה: ${new Date().toLocaleString('he-IL')}
• סטטוס: שגיאה
• סיבה: בעיה בחיבור לשרת או endpoint לא זמין

💡 פתרונות אפשריים:
• בדוק שהשרת פועל על פורט 8080
• בדוק חיבור לאינטרנט
• נסה לרענן את הדף
• בדוק את הקונסול לפרטים נוספים

🛠️ מידע טכני:
• URL: ${window.location.href}
• User Agent: ${navigator.userAgent}
• זמן שגיאה: ${new Date().toISOString()}`;

                window.showDetailsModal(
                    'שגיאה בבדיקת בריאות',
                    `<div style="white-space: pre-line; font-family: monospace; font-size: 0.9em; color: #dc3545;">${errorMessage}</div>`
                );
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה בבדיקת בריאות מפורטת', 'error');
            } else if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה בבדיקת בריאות');
            } else {
                alert('שגיאה בבדיקת בריאות מפורטת: ' + (error.message || 'שגיאה לא ידועה'));
            }
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '❤️ בדיקת בריאות';
            }
        }
    } else {
        console.error('❌ serverMonitor instance לא קיים');
        if (window.showNotification) {
            window.showNotification('serverMonitor לא אותחל', 'error');
        }
    }
};

// Enhanced monitoring control functions
window.startMonitoring = function() {
  if (window.serverMonitor) {
    window.serverMonitor.startMonitoring();
    if (window.showSuccessNotification) {
      window.showSuccessNotification('ניטור שרת', 'ניטור הופעל');
    }
  }
};

window.pauseMonitoring = function() {
  if (window.serverMonitor) {
    window.serverMonitor.stopMonitoring();
    if (window.showWarningNotification) {
      window.showWarningNotification('ניטור שרת', 'ניטור הושהה');
    }
  }
};

window.stopMonitoring = function() {
  if (window.serverMonitor) {
    window.serverMonitor.stopMonitoring();
    if (window.showErrorNotification) {
      window.showErrorNotification('ניטור שרת', 'ניטור הופסק');
    }
  }
};

// Enhanced monitoring analysis function
window.showMonitoringAnalysis = function() {
  if (!window.serverMonitor) {
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'ServerMonitor לא זמין');
    }
    return;
  }
  
  const analysis = {
    timestamp: new Date().toLocaleString('he-IL'),
    monitoringStatus: window.serverMonitor.isMonitoring ? 'פעיל' : 'לא פעיל',
    settings: window.serverMonitor.settings,
    logsCount: window.serverMonitor.logs.length,
    recentLogs: window.serverMonitor.logs.slice(0, 5),
    systemHealth: {
      server: document.getElementById('serverStatusStats')?.textContent || 'לא ידוע',
      database: document.getElementById('databaseStatusStats')?.textContent || 'לא ידוע',
      cache: document.getElementById('cacheStatusStats')?.textContent || 'לא ידוע',
      overall: document.getElementById('overallStatus')?.textContent || 'לא ידוע'
    }
  };
  
  const modalContent = `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h4 class="text-center mb-3">📊 ניתוח ניתור שרת</h4>
          <div class="row text-center mb-4">
            <div class="col-md-3">
              <div class="card border-${analysis.monitoringStatus === 'פעיל' ? 'success' : 'warning'}">
                <div class="card-body">
                  <h5 class="card-title text-${analysis.monitoringStatus === 'פעיל' ? 'success' : 'warning'}">📡 סטטוס ניתור</h5>
                  <h2 class="text-${analysis.monitoringStatus === 'פעיל' ? 'success' : 'warning'}">${analysis.monitoringStatus}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card border-info">
                <div class="card-body">
                  <h5 class="card-title text-info">⏱️ תדירות רענון</h5>
                  <h2 class="text-info">${Math.round(analysis.settings.refreshInterval / 1000)}s</h2>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card border-primary">
                <div class="card-body">
                  <h5 class="card-title text-primary">📋 לוגים</h5>
                  <h2 class="text-primary">${analysis.logsCount}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card border-secondary">
                <div class="card-body">
                  <h5 class="card-title text-secondary">🔄 רענון אוטומטי</h5>
                  <h2 class="text-secondary">${analysis.settings.autoRefresh ? 'פעיל' : 'כבוי'}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <h5 class="mb-3">🖥️ סטטוס מערכת</h5>
          <div class="table-responsive">
            <table class="table table-striped">
              <thead class="table-dark">
                <tr>
                  <th>רכיב</th>
                  <th>סטטוס</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>שרת</td>
                  <td><span class="badge bg-${analysis.systemHealth.server === 'מחובר' ? 'success' : 'danger'}">${analysis.systemHealth.server}</span></td>
                </tr>
                <tr>
                  <td>בסיס נתונים</td>
                  <td><span class="badge bg-${analysis.systemHealth.database === 'פעיל' ? 'success' : 'danger'}">${analysis.systemHealth.database}</span></td>
                </tr>
                <tr>
                  <td>מטמון</td>
                  <td><span class="badge bg-${analysis.systemHealth.cache === 'פעיל' ? 'success' : 'danger'}">${analysis.systemHealth.cache}</span></td>
                </tr>
                <tr>
                  <td>כללי</td>
                  <td><span class="badge bg-${analysis.systemHealth.overall === 'פעיל' ? 'success' : 'danger'}">${analysis.systemHealth.overall}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="col-md-6">
          <h5 class="mb-3">📝 לוגים אחרונים</h5>
          <div class="table-responsive">
            <table class="table table-striped">
              <thead class="table-dark">
                <tr>
                  <th>זמן</th>
                  <th>סוג</th>
                  <th>הודעה</th>
                </tr>
              </thead>
              <tbody>
                ${analysis.recentLogs.map(log => `
                  <tr>
                    <td>${log.timestamp.toLocaleTimeString('he-IL')}</td>
                    <td><span class="badge bg-${log.type === 'success' ? 'success' : log.type === 'error' ? 'danger' : log.type === 'warning' ? 'warning' : 'info'}">${log.type}</span></td>
                    <td>${log.title}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="row mt-3">
        <div class="col-12 text-center">
          <small class="text-muted">
            ניתוח נוצר ב: ${analysis.timestamp}
          </small>
        </div>
      </div>
    </div>
  `;
  
  if (window.showDetailsModal) {
    window.showDetailsModal('ניתוח ניתור שרת', modalContent);
  } else {
    console.log('ניתוח ניתור:', analysis);
  }
};

// Setup event listeners for enhanced monitoring controls
function setupMonitoringEventListeners() {
  // Add event listeners for monitoring control buttons
  const startBtn = document.getElementById('startMonitoringBtn');
  const pauseBtn = document.getElementById('pauseMonitoringBtn');
  const stopBtn = document.getElementById('stopMonitoringBtn');
  const analysisBtn = document.getElementById('monitoringAnalysisBtn');
  const copyLogBtn = document.getElementById('Btn');
  
  if (startBtn) {
    startBtn.addEventListener('click', window.startMonitoring);
  }
  
  if (pauseBtn) {
    pauseBtn.addEventListener('click', window.pauseMonitoring);
  }
  
  if (stopBtn) {
    stopBtn.addEventListener('click', window.stopMonitoring);
  }
  
  if (analysisBtn) {
    analysisBtn.addEventListener('click', window.showMonitoringAnalysis);
  }
  
  if (copyLogBtn) {
    copyLogBtn.addEventListener('click', window.);
  }
}

console.log('✅ Server Monitor functions exported to global scope');
