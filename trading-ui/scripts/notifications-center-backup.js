/**
 * Notifications Center - TikTrack
 * ===============================
 *
 * מרכז התראות מרכזי עם ניהול היסטוריה והגדרות
 *
 * Features:
 * - ניהול התראות בזמן אמת
 * - היסטוריית התראות עם פילטרים
 * - הגדרות התראות אישיות
 * - סטטיסטיקות התראות
 * - קובץ לוג להיסטוריה
 *
 * Dependencies:
 * - notification-system.js
 * - realtime-notifications-client.js
 *
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated September 2, 2025
 */

class NotificationsCenter {
  constructor() {
    this.notifications = [];
    this.history = [];
    this.settings = this.loadSettings();
    this.stats = {
      success: 0,
      error: 0,
      warning: 0,
      info: 0,
    };

    this.init();
  }

  init() {
    // 🚀 אתחול מרכז התראות...
    if (typeof window.showNotification === 'function') {
      window.showNotification('אתחול מרכז התראות...', 'info');
    }

    // אתחול UI
    this.initUI();

    // אתחול סטטיסטיקות
    this.updateStats();

    // חיבור לאירועי WebSocket
    this.setupWebSocketEvents();

    // טעינת היסטוריה
    this.loadHistory();

    // רענון אוטומטי
    this.startAutoRefresh();

    console.log('✅ מרכז התראות אותחל בהצלחה');
  }

  initUI() {
    // עדכון סטטוס חיבור
    this.updateConnectionStatus('connecting');

    // עדכון הגדרות
    this.updateSettingsUI();

    // עדכון סטטיסטיקות
    this.updateStatsUI();
  }

  setupWebSocketEvents() {
    if (window.realtimeNotificationsClient) {
      // אירועי חיבור
      window.realtimeNotificationsClient.on('connect', () => {
        this.updateConnectionStatus('connected');
        this.addNotification('info', 'מרכז התראות', 'חובר לשרת בהצלחה', 'now');
      });

      window.realtimeNotificationsClient.on('disconnect', () => {
        this.updateConnectionStatus('disconnected');
        this.addNotification('warning', 'מרכז התראות', 'נותק מהשרת', 'now');
      });

      // אירועי התראות
      window.realtimeNotificationsClient.on('background_task_started', data => {
        if (this.settings.enableBackgroundTasks) {
          this.addNotification('info', 'משימה ברקע', `התחילה: ${data.task_name}`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('background_task_completed', data => {
        if (this.settings.enableBackgroundTasks) {
          this.addNotification('success', 'משימה הושלמה', `${data.task_name} הושלמה בהצלחה`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('background_task_failed', data => {
        if (this.settings.enableBackgroundTasks) {
          this.addNotification('error', 'שגיאה במשימה', `${data.task_name} נכשלה: ${data.error}`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('data_updated', data => {
        if (this.settings.enableDataUpdates) {
          this.addNotification('info', 'נתונים עודכנו', `${data.table} עודכן בהצלחה`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('data_error', data => {
        if (this.settings.enableDataUpdates) {
          this.addNotification('error', 'שגיאת נתונים', `שגיאה ב-${data.table}: ${data.error}`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('external_data_update', data => {
        if (this.settings.enableExternalData) {
          this.addNotification('success', 'נתונים חיצוניים', `${data.provider} עודכן: ${data.ticker_count} טיקרים`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('external_data_error', data => {
        if (this.settings.enableExternalData) {
          this.addNotification('error', 'שגיאת נתונים חיצוניים', `${data.provider}: ${data.error}`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('system_event', data => {
        if (this.settings.enableSystemEvents) {
          this.addNotification('info', 'אירוע מערכת', data.message, 'now');
        }
      });
    }
  }

  addNotification(type, title, message, time = 'now') {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      time: time === 'now' ? new Date() : new Date(time),
      timestamp: Date.now(),
    };

    // הוספה להתראות פעילות
    this.notifications.unshift(notification);
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // הוספה להיסטוריה
    this.history.unshift(notification);
    if (this.history.length > 1000) {
      this.history = this.history.slice(0, 1000);
    }

    // עדכון סטטיסטיקות
    this.stats[type]++;
    this.updateStats();

    // עדכון UI
    this.updateNotificationsUI();
    this.updateHistoryUI();
    this.updateStatsUI();

    // שמירה ללוקל סטורג'
    this.saveToLocalStorage();

    // שמירה לקובץ לוג (אם זמין)
    this.saveToLogFile(notification);

    // הצגת הודעה אם מופעל
    if (this.settings.enableRealtime) {
      this.showNotificationPopup(notification);
    }

    // הפעלת צליל אם מופעל
    if (this.settings.enableSounds) {
      this.playNotificationSound(type);
    }
  }

  showNotificationPopup(notification) {
    switch (notification.type) {
    case 'success':
      window.showSuccessNotification(notification.title, notification.message);
      break;
    case 'error':
      window.showErrorNotification(notification.title, notification.message);
      break;
    case 'warning':
      window.showWarningNotification(notification.title, notification.message);
      break;
    case 'info':
      window.showInfoNotification(notification.title, notification.message);
      break;
    }
  }

  playNotificationSound(type) {
    // יצירת צליל התראה פשוט
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // הגדרת תדירות לפי סוג התראה
    let frequency = 800;
    switch (type) {
    case 'success':
      frequency = 1000;
      break;
    case 'error':
      frequency = 400;
      break;
    case 'warning':
      frequency = 600;
      break;
    case 'info':
      frequency = 800;
      break;
    }

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  updateConnectionStatus(status = 'connecting') {
    const statusDot = document.getElementById('connectionStatus').querySelector('.status-dot');
    const statusText = document.getElementById('connectionStatus').querySelector('.status-text');
    const websocketStatus = document.getElementById('websocketStatus');
    const connectionTimeElement = document.getElementById('connectionTime');
    const messagesSentElement = document.getElementById('messagesSent');

    // הסרת כל הקלאסים הקיימים
    statusDot.className = 'status-dot';

    switch (status) {
    case 'connected':
      statusDot.classList.add('connected');
      statusText.textContent = 'מחובר';
      websocketStatus.textContent = 'פעיל';
      break;
    case 'disconnected':
      statusDot.classList.add('disconnected');
      statusText.textContent = 'מנותק';
      websocketStatus.textContent = 'לא פעיל';
      connectionTimeElement.textContent = '-';
      messagesSentElement.textContent = '0';
      break;
    case 'connecting':
      statusDot.classList.add('connecting');
      statusText.textContent = 'מתחבר...';
      websocketStatus.textContent = 'מתחבר...';
      connectionTimeElement.textContent = '-';
      messagesSentElement.textContent = '0';
      break;
    }

    // עדכון זמן חיבור והודעות
    if (status === 'connected' && window.realtimeNotificationsClient) {
      try {
        const stats = window.realtimeNotificationsClient.getConnectionStats();

        if (stats && stats.connectedAt) {
          const connectionTime = new Date(stats.connectedAt);
          const now = new Date();
          const diff = Math.floor((now - connectionTime) / 1000);
          connectionTimeElement.textContent = this.formatDuration(diff);
        } else {
          connectionTimeElement.textContent = 'עכשיו';
        }

        messagesSentElement.textContent = stats && stats.totalMessages ? stats.totalMessages : 0;
      } catch (error) {
        console.warn('שגיאה בעדכון סטטיסטיקות חיבור:', error);
        connectionTimeElement.textContent = 'עכשיו';
        messagesSentElement.textContent = '0';
      }
    }
  }

  updateNotificationsUI() {
    const container = document.getElementById('liveNotifications');

    if (this.notifications.length === 0) {
      container.innerHTML = `
                <div class="no-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>אין התראות פעילות כרגע</p>
                </div>
            `;
      return;
    }

    container.innerHTML = this.notifications.map(notification => this.createNotificationHTML(notification)).join('');
  }

  updateHistoryUI() {
    const container = document.getElementById('notificationHistory');

    if (this.history.length === 0) {
      container.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-history"></i>
                    <p>אין היסטוריית התראות</p>
                </div>
            `;
      return;
    }

    // פילטור לפי בחירת המשתמש
    const filter = document.getElementById('historyFilter').value;
    const period = document.getElementById('historyPeriod').value;

    let filteredHistory = this.history;

    // פילטר לפי סוג
    if (filter) {
      filteredHistory = filteredHistory.filter(n => n.type === filter);
    }

    // פילטר לפי זמן
    const now = Date.now();
    const periodMs = this.getPeriodInMs(period);
    filteredHistory = filteredHistory.filter(n => now - n.timestamp <= periodMs);

    if (filteredHistory.length === 0) {
      container.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-filter"></i>
                    <p>אין התראות לפי הפילטרים שנבחרו</p>
                </div>
            `;
      return;
    }

    container.innerHTML = filteredHistory.map(notification => this.createNotificationHTML(notification)).join('');
  }

  updateStats() {
    // עדכון סטטיסטיקות פנימיות
    this.stats.success = this.notifications.filter(n => n.type === 'success').length;
    this.stats.error = this.notifications.filter(n => n.type === 'error').length;
    this.stats.warning = this.notifications.filter(n => n.type === 'warning').length;
    this.stats.info = this.notifications.filter(n => n.type === 'info').length;
  }

  updateStatsUI() {
    document.getElementById('successCount').textContent = this.stats.success;
    document.getElementById('errorCount').textContent = this.stats.error;
    document.getElementById('warningCount').textContent = this.stats.warning;
    document.getElementById('infoCount').textContent = this.stats.info;
  }

  updateSettingsUI() {
    document.getElementById('enableRealtime').checked = this.settings.enableRealtime;
    document.getElementById('enableSounds').checked = this.settings.enableSounds;
    document.getElementById('enableBackgroundTasks').checked = this.settings.enableBackgroundTasks;
    document.getElementById('enableDataUpdates').checked = this.settings.enableDataUpdates;
    document.getElementById('enableExternalData').checked = this.settings.enableExternalData;
    document.getElementById('enableSystemEvents').checked = this.settings.enableSystemEvents;
  }

  createNotificationHTML(notification) {
    const timeAgo = this.getTimeAgo(notification.time);
    const iconClass = this.getIconClass(notification.type);

    return `
            <div class="notification-item ${notification.type}">
                <div class="notification-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                <div class="notification-actions">
                    <button class="btn btn-sm btn-outline-secondary" onclick="window.notificationsCenter?.removeNotification(${notification.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
  }

  getIconClass(type) {
    switch (type) {
    case 'success':
      return 'fas fa-check-circle';
    case 'error':
      return 'fas fa-exclamation-circle';
    case 'warning':
      return 'fas fa-exclamation-triangle';
    case 'info':
      return 'fas fa-info-circle';
    default:
      return 'fas fa-bell';
    }
  }

  getTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) {return 'עכשיו';}
    if (diff < 3600) {return `לפני ${Math.floor(diff / 60)} דקות`;}
    if (diff < 86400) {return `לפני ${Math.floor(diff / 3600)} שעות`;}
    if (diff < 2592000) {return `לפני ${Math.floor(diff / 86400)} ימים`;}

    return date.toLocaleDateString('he-IL');
  }

  getPeriodInMs(period) {
    switch (period) {
    case '1h': return 3600000;
    case '24h': return 86400000;
    case '7d': return 604800000;
    case '30d': return 2592000000;
    default: return 86400000;
    }
  }

  formatDuration(seconds) {
    if (seconds < 60) {return `${seconds} שניות`;}
    if (seconds < 3600) {return `${Math.floor(seconds / 60)} דקות`;}
    if (seconds < 86400) {return `${Math.floor(seconds / 3600)} שעות`;}
    return `${Math.floor(seconds / 86400)} ימים`;
  }

  // הגדרות
  loadSettings() {
    const defaultSettings = {
      enableRealtime: true,
      enableSounds: true,
      enableBackgroundTasks: true,
      enableDataUpdates: true,
      enableExternalData: true,
      enableSystemEvents: true,
    };

    try {
      const saved = localStorage.getItem('tiktrack_notification_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (error) {
      console.error('שגיאה בטעינת הגדרות:', error);
      return defaultSettings;
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('tiktrack_notification_settings', JSON.stringify(this.settings));
      console.log('✅ הגדרות נשמרו בהצלחה');
    } catch (error) {
      console.error('שגיאה בשמירת הגדרות:', error);
    }
  }

  // שמירה ללוקל סטורג'
  saveToLocalStorage() {
    try {
      localStorage.setItem('tiktrack_notifications_history', JSON.stringify(this.history.slice(0, 100)));
      localStorage.setItem('tiktrack_notifications_stats', JSON.stringify(this.stats));
    } catch (error) {
      console.error('שגיאה בשמירה ללוקל סטורג:', error);
    }
  }

  // טעינה מלוקל סטורג'
  loadFromLocalStorage() {
    try {
      const savedHistory = localStorage.getItem('tiktrack_notifications_history');
      const savedStats = localStorage.getItem('tiktrack_notifications_stats');

      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }

      if (savedStats) {
        this.stats = JSON.parse(savedStats);
      }
    } catch (error) {
      console.error('שגיאה בטעינה מלוקל סטורג:', error);
    }
  }

  loadHistory() {
    // טעינת היסטוריית התראות מלוקל סטורג'
    this.loadFromLocalStorage();

    // עדכון סטטיסטיקות לאחר טעינה
    this.updateStats();

    // עדכון UI
    this.updateHistoryUI();
    this.updateStatsUI();
  }

  // שמירה לקובץ לוג
  saveToLogFile(notification) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // שליחה לשרת לשמירה בקובץ לוג
      fetch('/api/v1/logs/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      }).catch(error => {
        console.warn('לא ניתן לשמור בקובץ לוג:', error);
      });
    } catch (error) {
      console.warn('שגיאה בשמירה לקובץ לוג:', error);
    }
  }

  // פונקציות ציבוריות
  removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.history = this.history.filter(n => n.id !== id);

    this.updateStats();
    this.updateNotificationsUI();
    this.updateHistoryUI();
    this.updateStatsUI();
    this.saveToLocalStorage();
  }

  clearLiveNotifications() {
    this.notifications = [];
    this.updateStats();
    this.updateNotificationsUI();
    this.updateStatsUI();
    this.saveToLocalStorage();

    window.showSuccessNotification('מרכז התראות', 'התראות פעילות נוקו בהצלחה');
  }

  clearHistory() {
    // Function to execute history clearing
    const executeClearHistory = () => {
      this.history = [];
      this.stats = { success: 0, error: 0, warning: 0, info: 0 };

      this.updateHistoryUI();
      this.updateStatsUI();
      this.saveToLocalStorage();

      window.showSuccessNotification('מרכז התראות', 'היסטוריית ההתראות נוקתה בהצלחה');
    };
    
    // Use notification system or fallback to confirm
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'ניקוי היסטוריה',
        'האם אתה בטוח שברצונך לנקות את כל היסטוריית ההתראות?',
        executeClearHistory,
        () => console.log('❌ ניקוי היסטוריה - משתמש ביטל')
      );
    } else {
      if ((typeof window.showConfirmationDialog === 'function' ? await new Promise(resolve => window.showConfirmationDialog('אישור', `האם אתה בטוח שברצונך לנקות את כל היסטוריית ההתראות?`, () => resolve(true), () => resolve(false))) : confirm(`האם אתה בטוח שברצונך לנקות את כל היסטוריית ההתראות?`))) {
        executeClearHistory();
      } else {
        console.log('❌ ניקוי היסטוריה - משתמש ביטל');
      }
    }
  }

  refreshNotifications() {
    this.loadFromLocalStorage();
    this.updateNotificationsUI();
    this.updateHistoryUI();
    this.updateStatsUI();

    window.showInfoNotification('מרכז התראות', 'ההתראות רועננו בהצלחה');
  }

  filterHistory() {
    this.updateHistoryUI();
  }

  startAutoRefresh() {
    // רענון אוטומטי כל 30 שניות
    setInterval(() => {
      // עדכון סטטוס חיבור רק אם יש שינוי
      if (window.realtimeNotificationsClient) {
        const isConnected = window.realtimeNotificationsClient.isConnected();
        const currentStatus = this.getCurrentConnectionStatus();

        if (isConnected && currentStatus !== 'connected') {
          this.updateConnectionStatus('connected');
        } else if (!isConnected && currentStatus !== 'disconnected') {
          this.updateConnectionStatus('disconnected');
        }
      }

      this.updateNotificationsUI();
    }, 30000);

    // עדכון זמן חיבור כל שנייה כאשר מחובר
    setInterval(() => {
      if (window.realtimeNotificationsClient && window.realtimeNotificationsClient.isConnected()) {
        this.updateConnectionTime();
      }
    }, 1000);
  }

  updateConnectionTime() {
    try {
      const connectionTimeElement = document.getElementById('connectionTime');
      if (connectionTimeElement && window.realtimeNotificationsClient) {
        const stats = window.realtimeNotificationsClient.getConnectionStats();
        if (stats && stats.connectedAt) {
          const connectionTime = new Date(stats.connectedAt);
          const now = new Date();
          const diff = Math.floor((now - connectionTime) / 1000);
          connectionTimeElement.textContent = this.formatDuration(diff);
        }
      }
    } catch (error) {
      console.warn('שגיאה בעדכון זמן חיבור:', error);
    }
  }

  getCurrentConnectionStatus() {
    try {
      const statusDot = document.getElementById('connectionStatus');
      if (!statusDot) {
        return 'connecting'; // לא בעמוד מרכז ההתראות
      }

      if (statusDot.querySelector('.connected')) {return 'connected';}
      if (statusDot.querySelector('.disconnected')) {return 'disconnected';}
      if (statusDot.querySelector('.connecting')) {return 'connecting';}
    } catch (error) {
      console.warn('שגיאה בקבלת סטטוס חיבור נוכחי:', error);
    }
    return 'connecting';
  }

  checkConnectionStatus() {
    const currentStatus = this.getCurrentConnectionStatus();
    const isConnected = window.realtimeNotificationsClient ? window.realtimeNotificationsClient.isConnected() : false;

    if (isConnected && currentStatus !== 'connected') {
      this.updateConnectionStatus('connected');
    } else if (!isConnected && currentStatus !== 'disconnected') {
      this.updateConnectionStatus('disconnected');
    }
  }
}

// פונקציות גלובליות
function saveNotificationSettings() {
  const settings = {
    enableRealtime: document.getElementById('enableRealtime').checked,
    enableSounds: document.getElementById('enableSounds').checked,
    enableBackgroundTasks: document.getElementById('enableBackgroundTasks').checked,
    enableDataUpdates: document.getElementById('enableDataUpdates').checked,
    enableExternalData: document.getElementById('enableExternalData').checked,
    enableSystemEvents: document.getElementById('enableSystemEvents').checked,
  };

  if (window.notificationsCenter) {
    window.notificationsCenter.settings = settings;
    window.notificationsCenter.saveSettings();
  }

  window.showSuccessNotification('מרכז התראות', 'הגדרות נשמרו בהצלחה');
}

function resetNotificationSettings() {
  // Function to execute settings reset
  const executeReset = () => {
    if (window.notificationsCenter) {
      window.notificationsCenter.settings = window.notificationsCenter.loadSettings();
      window.notificationsCenter.updateSettingsUI();
      window.notificationsCenter.saveSettings();
    }

    window.showSuccessNotification('מרכז התראות', 'הגדרות אופסו בהצלחה');
  };
  
  // Use notification system or fallback to confirm
  if (typeof window.showConfirmationDialog === 'function') {
    window.showConfirmationDialog(
      'איפוס הגדרות',
      'האם אתה בטוח שברצונך לאפס את כל ההגדרות?',
      executeReset,
      () => console.log('❌ איפוס הגדרות - משתמש ביטל')
    );
  } else {
    if ((typeof window.showConfirmationDialog === 'function' ? await new Promise(resolve => window.showConfirmationDialog('אישור', `האם אתה בטוח שברצונך לאפס את כל ההגדרות?`, () => resolve(true), () => resolve(false))) : confirm(`האם אתה בטוח שברצונך לאפס את כל ההגדרות?`))) {
      executeReset();
    } else {
      console.log('❌ איפוס הגדרות - משתמש ביטל');
    }
  }
}

function clearLiveNotifications() {
  if (window.notificationsCenter) {
    window.notificationsCenter.clearLiveNotifications();
  }
}

function clearHistory() {
  if (window.notificationsCenter) {
    window.notificationsCenter.clearHistory();
  }
}

function refreshNotifications() {
  if (window.notificationsCenter) {
    window.notificationsCenter.refreshNotifications();
  }
}

function filterHistory() {
  if (window.notificationsCenter) {
    window.notificationsCenter.filterHistory();
  }
}

// אתחול
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 טעינת דף מרכז התראות...');

  // אתחול HeaderSystem
  if (window.headerSystem && !window.headerSystem.isInitialized) {
    console.log('✅ אתחול HeaderSystem...');
    window.headerSystem.init();
  }

  // יצירת מופע מרכז התראות
  window.notificationsCenter = new NotificationsCenter();

  console.log('✅ דף מרכז התראות נטען בהצלחה');
});
