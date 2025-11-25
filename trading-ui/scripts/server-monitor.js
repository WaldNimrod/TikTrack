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
      refreshInterval: 5000,
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
    this.actionCooldown = 2000; // 2 seconds cooldown


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
    console.log('🔧 ServerMonitor init - מתחיל אתחול');
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

    console.log('🔄 ServerMonitor - מתחיל ניטור');
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
      console.log('🔍 ServerMonitor - בודק סטטוס שרת');
      
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (response.ok) {
        this.updateServerStatus('online', data);
        const responseTime = data.response_time_ms || 'לא זמין';
        this.addLog('success', 'שרת פעיל', `זמן תגובה: ${responseTime}ms`);
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
      // Use FieldRendererService or dateUtils for consistent date formatting
      const now = window.dateUtils?.now ? window.dateUtils.now() : new Date();
      if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
        lastCheck.textContent = window.FieldRendererService.renderDate(now, true);
      } else if (window.dateUtils && typeof window.dateUtils.formatTime === 'function') {
        lastCheck.textContent = window.dateUtils.formatTime(now);
      } else {
        lastCheck.textContent = now.toLocaleTimeString('he-IL');
      }
    }

    // עדכון סטטיסטיקות סיכום
    this.updateSummaryStats(status, data);
  }

  // עדכון סטטיסטיקות סיכום
  updateSummaryStats(status, data) {
    const serverStatusStats = document.getElementById('serverStatusStats');
    const databaseStatusStats = document.getElementById('databaseStatusStats');
    const cacheStatusStats = document.getElementById('cacheStatusStats');
    const overallStatus = document.getElementById('overallStatus');

    if (serverStatusStats) {
      serverStatusStats.textContent = status === 'online' ? 'מחובר' : 'מנותק';
    }
    if (data && data.components) {
      if (databaseStatusStats) {
        const dbStatus = data.components.database?.status === 'healthy' ? 'פעיל' : 'לא פעיל';
        databaseStatusStats.textContent = dbStatus;
      }
      if (cacheStatusStats) {
        const cacheStatus = data.components.cache?.status === 'healthy' ? 'פעיל' : 'לא פעיל';
        cacheStatusStats.textContent = cacheStatus;
      }
    } else {
      if (databaseStatusStats) databaseStatusStats.textContent = 'לא ידוע';
      if (cacheStatusStats) cacheStatusStats.textContent = 'לא ידוע';
    }
    if (overallStatus) {
      overallStatus.textContent = status === 'online' ? 'פעיל' : 'לא פעיל';
    }
  }

  // עדכון סטטוס כללי
  updateStatus(message) {
    const statusElement = document.getElementById('monitoringStatus');
    if (statusElement) {
      statusElement.textContent = message;
    }
  }

  // הוספת לוג
  addLog(type, title, message) {
    // Use dateUtils for consistent date handling (if available)
    const timestamp = window.dateUtils?.now ? window.dateUtils.now() : new Date();
    const logEntry = {
      id: window.dateUtils?.getEpochMilliseconds ? window.dateUtils.getEpochMilliseconds(timestamp) : Date.now(),
      timestamp: timestamp,
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
    // Use dateUtils for consistent date handling (if available)
    const now = window.dateUtils?.now ? window.dateUtils.now() : new Date();
    const timestampDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diff = now - timestampDate;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return `לפני ${seconds} שניות`;
    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    
    // Use FieldRendererService or dateUtils for date formatting
    if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
      return window.FieldRendererService.renderDate(timestampDate, false);
    } else if (window.dateUtils && typeof window.dateUtils.formatDate === 'function') {
      return window.dateUtils.formatDate(timestampDate, { includeTime: false });
    }
    return timestampDate.toLocaleDateString('he-IL');
  }

  // העתקת לוג מפורט
  copyDetailedLog() {
    try {
      console.log('📋 ServerMonitor - מעתיק לוג מפורט');
      
      // Use dateUtils for consistent date handling (if available)
      const now = window.dateUtils?.now ? window.dateUtils.now() : new Date();
      let nowDisplay;
      if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
        nowDisplay = window.FieldRendererService.renderDate(now, true);
      } else if (window.dateUtils && typeof window.dateUtils.formatDateTime === 'function') {
        nowDisplay = window.dateUtils.formatDateTime(now);
      } else {
        nowDisplay = now.toLocaleString('he-IL');
      }
      
      let logText = '=== לוג מפורט - ניטור שרת ===\n';
      logText += `תאריך: ${nowDisplay}\n`;
      logText += `סטטוס: ${this.isMonitoring ? 'פעיל' : 'מושהה'}\n`;
      logText += `מספר לוגים: ${this.logs.length}\n\n`;
      
      logText += '=== לוגים ===\n';
      this.logs.forEach((log, index) => {
        let timestampDisplay;
        if (window.FieldRendererService && typeof window.FieldRendererService.renderDate === 'function') {
          timestampDisplay = window.FieldRendererService.renderDate(log.timestamp, true);
        } else if (window.dateUtils && typeof window.dateUtils.formatDateTime === 'function') {
          timestampDisplay = window.dateUtils.formatDateTime(log.timestamp);
        } else {
          timestampDisplay = log.timestamp.toLocaleString('he-IL');
        }
        
        logText += `${index + 1}. [${log.type.toUpperCase()}] ${log.title}\n`;
        logText += `   הודעה: ${log.message}\n`;
        logText += `   זמן: ${timestampDisplay}\n\n`;
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
      
      // בדיקת אישור
      let confirmed = false;
      if (typeof window.showConfirmationDialog === 'function') {
        confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'ניקוי לוגים',
            'האם אתה בטוח שברצונך לנקות את כל הלוגים?',
            () => resolve(true),
            () => resolve(false)
          );
        });
      } else {
        confirmed = window.confirm('האם אתה בטוח שברצונך לנקות את כל הלוגים?');
      }
      
      if (confirmed) {
        this.logs = [];
        this.displayLogs();
        console.log('✅ לוגים נוקו');
        if (window.showSuccessNotification) {
          window.showSuccessNotification('ניטור שרת', 'לוגים נוקו');
        }
      } else {
        console.log('❌ ניקוי לוגים בוטל');
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
      console.log('🔧 ServerMonitor - טוען מידע מערכת');

      const response = await fetch('/api/system-info');
      if (response.ok) {
        const data = await response.json();
        this.updateSystemInfo(data);
      }
    } catch (error) {
      console.error('❌ שגיאה בטעינת מידע מערכת:', error);
    }
  }

  // טעינת נתוני בריאות שרת
  async loadHealthData() {
    try {
      console.log('🔍 ServerMonitor - טוען נתוני בריאות');

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

    console.log('✅ נתוני בריאות עודכנו בהצלחה');
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
  async restartServer() {
    if (!this.canPerformAction('restart')) {
      return;
    }

    try {
      console.log('🔄 ServerMonitor - מפעיל שרת מחדש');

      const response = await fetch('/api/server/restart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ שרת הופעל מחדש:', result);
        this.addLog('success', 'הפעלה מחדש', 'השרת הופעל מחדש בהצלחה');
        if (window.showSuccessNotification) {
          window.showSuccessNotification('ניטור שרת', 'השרת הופעל מחדש בהצלחה');
        }
      } else {
        throw new Error('שגיאה בהפעלה מחדש');
      }
    } catch (error) {
      console.error('❌ שגיאה בהפעלה מחדש:', error);
      this.addLog('error', 'שגיאת הפעלה', error.message);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'שגיאה בהפעלה מחדש של השרת');
      }
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

      let confirmed = false;
      if (typeof window.showConfirmationDialog === 'function') {
        confirmed = await new Promise(resolve => {
          window.showConfirmationDialog(
            'עצירת חירום',
            'האם אתה בטוח שברצונך לבצע עצירת חירום? זה יעצור את השרת מיידית!',
            () => resolve(true),
            () => resolve(false),
            'danger'
          );
        });
      } else {
        // Fallback למקרה שמערכת התראות לא זמינה
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

// אתחול המערכת כשהדף נטען
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 DOM loaded, initializing ServerMonitor...');
  
  // יצירת instance גלובלי
  window.serverMonitor = new ServerMonitor();
  
  console.log('✅ ServerMonitor initialized successfully');
});

// יצירת instance גלובלי מיד
window.serverMonitor = new ServerMonitor();

// הוספת פונקציות גלובליות
window.copyDetailedLog = () => {
  if (window.serverMonitor) {
    return window.serverMonitor.copyDetailedLog();
  } else {
    console.error('❌ serverMonitor instance לא קיים');
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'serverMonitor לא אותחל');
    }
  }
};

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
