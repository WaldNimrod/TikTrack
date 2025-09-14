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
    
    console.log('🚀 ServerMonitor initialized');
    this.init();
  }

  // אתחול המערכת
  init() {
    console.log('🔧 ServerMonitor init - מתחיל אתחול');
    this.loadSettings();
    this.setupEventListeners();
    this.startMonitoring();
    this.loadSystemInfo();
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
    
    // הגדרת רענון אוטומטי
    if (this.settings.autoRefresh) {
      this.monitoringInterval = setInterval(() => {
        this.checkServerStatus();
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
        this.addLog('success', 'שרת פעיל', `זמן תגובה: ${data.response_time}ms`);
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
  copyDetailedLog() {
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
    try {
      console.log('🔧 ServerMonitor - מבצע אופטימיזציה של בסיס הנתונים');
      
      const response = await fetch('/api/optimize-database', {
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
