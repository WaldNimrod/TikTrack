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
    console.log('🚀 אתחול מרכז התראות...');

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

    // שמירה לקובץ לוג מבוטלת זמנית למניעת עומס
    // this.saveToLogFile(notification);

    // הצגת הודעה אם מופעל
    if (this.settings.enableRealtime) {
      this.showNotificationPopup(notification);
    }

    // צלילים מבוטלים זמנית למניעת שגיאות AudioContext
    // if (this.settings.enableSounds) {
    //   this.playNotificationSound(type);
    // }
  }

  showNotificationPopup(notification) {
    // הצגת התראה ישירה ללא לולאה
    const popup = document.createElement('div');
    popup.className = `notification-popup ${notification.type}`;
    popup.innerHTML = `
      <div class="popup-header">
        <span class="popup-title">${notification.title}</span>
        <button class="popup-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="popup-message">${notification.message}</div>
    `;

    document.body.appendChild(popup);

    // הסרה אוטומטית אחרי 5 שניות
    setTimeout(() => {
      if (popup.parentElement) {
        popup.remove();
      }
    }, 5000);
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
    // בדיקה אם האלמנטים קיימים (רק בעמוד מרכז ההתראות)
    const connectionStatusElement = document.getElementById('connectionStatus');
    if (!connectionStatusElement) {
      return; // לא בעמוד מרכז ההתראות
    }

    const statusDot = connectionStatusElement.querySelector('.status-dot');
    const statusText = connectionStatusElement.querySelector('.status-text');
    const websocketStatus = document.getElementById('websocketStatus');
    const connectionTimeElement = document.getElementById('connectionTime');
    const messagesSentElement = document.getElementById('messagesSent');

    // בדיקה שכל האלמנטים קיימים
    if (!statusDot || !statusText || !websocketStatus || !connectionTimeElement || !messagesSentElement) {
      return;
    }

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
    if (!container) {
      return; // לא בעמוד מרכז ההתראות
    }

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
    if (!container) {
      return; // לא בעמוד מרכז ההתראות
    }

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
    const filterElement = document.getElementById('historyFilter');
    const periodElement = document.getElementById('historyPeriod');

    if (!filterElement || !periodElement) {
      return; // אלמנטי פילטר לא קיימים
    }

    const filter = filterElement.value;
    const period = periodElement.value;

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
    // בדיקה אם האלמנטים קיימים (רק בעמוד מרכז ההתראות)
    const successCount = document.getElementById('successCount');
    const errorCount = document.getElementById('errorCount');
    const warningCount = document.getElementById('warningCount');
    const infoCount = document.getElementById('infoCount');

    if (successCount) {successCount.textContent = this.stats.success;}
    if (errorCount) {errorCount.textContent = this.stats.error;}
    if (warningCount) {warningCount.textContent = this.stats.warning;}
    if (infoCount) {infoCount.textContent = this.stats.info;}
  }

  updateSettingsUI() {
    // בדיקה אם האלמנטים קיימים (רק בעמוד מרכז ההתראות)
    const enableRealtime = document.getElementById('enableRealtime');
    const enableSounds = document.getElementById('enableSounds');
    const enableBackgroundTasks = document.getElementById('enableBackgroundTasks');
    const enableDataUpdates = document.getElementById('enableDataUpdates');
    const enableExternalData = document.getElementById('enableExternalData');
    const enableSystemEvents = document.getElementById('enableSystemEvents');

    if (enableRealtime) {enableRealtime.checked = this.settings.enableRealtime;}
    if (enableSounds) {enableSounds.checked = this.settings.enableSounds;}
    if (enableBackgroundTasks) {enableBackgroundTasks.checked = this.settings.enableBackgroundTasks;}
    if (enableDataUpdates) {enableDataUpdates.checked = this.settings.enableDataUpdates;}
    if (enableExternalData) {enableExternalData.checked = this.settings.enableExternalData;}
    if (enableSystemEvents) {enableSystemEvents.checked = this.settings.enableSystemEvents;}
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
    // בדיקה שהפרמטר הוא אובייקט Date תקין
    if (!date || !(date instanceof Date)) {
      try {
        date = new Date(date);
      } catch (error) {
        console.warn('שגיאה בהמרת תאריך:', error);
        return 'לא ידוע';
      }
    }

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

    // הודעה ישירה לממשק ללא לולאה
    console.log('✅ התראות פעילות נוקו בהצלחה');
  }

  clearHistory() {
    if (window.confirm('האם אתה בטוח שברצונך לנקות את כל היסטוריית ההתראות?')) {
      this.history = [];
      this.stats = { success: 0, error: 0, warning: 0, info: 0 };

      this.updateHistoryUI();
      this.updateStatsUI();
      this.saveToLocalStorage();

      // הודעה ישירה לממשק ללא לולאה
      console.log('✅ היסטוריית ההתראות נוקתה בהצלחה');
    }
  }

  refreshNotifications() {
    this.loadFromLocalStorage();
    this.updateNotificationsUI();
    this.updateHistoryUI();
    this.updateStatsUI();

    // הודעה ישירה לממשק ללא לולאה
    console.log('✅ ההתראות רועננו בהצלחה');
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
      if (!connectionTimeElement) {
        return; // לא בעמוד מרכז ההתראות
      }

      if (window.realtimeNotificationsClient) {
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
}

// פונקציה להעתקת התראות ללוח
function copyNotificationsToClipboard() {
  try {
    if (!window.notificationsCenter) {
      console.warn('מרכז התראות לא זמין');
      return;
    }

    const notifications = window.notificationsCenter.notifications;
    const history = window.notificationsCenter.history;
    const stats = window.notificationsCenter.stats;

    let log = '=== לוג התראות TikTrack ===\n\n';
    log += '📊 סטטיסטיקות:\n';
    log += `✅ הצלחה: ${stats.success}\n`;
    log += `❌ שגיאה: ${stats.error}\n`;
    log += `⚠️ אזהרה: ${stats.warning}\n`;
    log += `ℹ️ מידע: ${stats.info}\n\n`;

    log += `🔔 התראות פעילות (${notifications.length}):\n`;
    if (notifications.length > 0) {
      notifications.forEach((notification, index) => {
        log += `${index + 1}. [${notification.type.toUpperCase()}] ${notification.title}: ${notification.message}\n`;
        log += `   זמן: ${new Date(notification.time).toLocaleString('he-IL')}\n\n`;
      });
    } else {
      log += 'אין התראות פעילות\n\n';
    }

    log += `📚 היסטוריה (${history.length}):\n`;
    if (history.length > 0) {
      history.slice(-20).forEach((notification, index) => {
        log += `${index + 1}. [${notification.type.toUpperCase()}] ${notification.title}: ${notification.message}\n`;
        log += `   זמן: ${new Date(notification.time).toLocaleString('he-IL')}\n\n`;
      });
    } else {
      log += 'אין היסטוריית התראות\n\n';
    }

    log += '🔗 חיבור WebSocket:\n';
    log += `סטטוס: ${window.realtimeNotificationsClient?.socket?.connected ? 'מחובר' : 'לא מחובר'}\n`;
    log += `זמן חיבור: ${document.getElementById('connectionTime')?.textContent || 'לא ידוע'}\n`;
    log += '\n=== סוף לוג ===';

    // העתקה ללוח
    navigator.clipboard.writeText(log).then(() => {
      console.log('✅ לוג התראות הועתק ללוח בהצלחה');
    }).catch(err => {
      console.error('❌ שגיאה בהעתקה ללוח:', err);
      // גיבוי - הצגה בחלון
      // העתקה ללוח
      navigator.clipboard.writeText(log).then(() => {
        window.showSuccessNotification('לוג התראות הועתק ללוח בהצלחה');
      }).catch(() => {
      // Fallback - הצגת הלוג בחלון נפרד
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`<pre>${log}</pre>`);
      });
    });
  } catch (error) {
    console.error('❌ שגיאה ביצירת לוג התראות:', error);
  }
}

// פונקציות גלובליות
function saveNotificationSettings() {
  // בדיקה אם האלמנטים קיימים (רק בעמוד מרכז ההתראות)
  const enableRealtime = document.getElementById('enableRealtime');
  const enableSounds = document.getElementById('enableSounds');
  const enableBackgroundTasks = document.getElementById('enableBackgroundTasks');
  const enableDataUpdates = document.getElementById('enableDataUpdates');
  const enableExternalData = document.getElementById('enableExternalData');
  const enableSystemEvents = document.getElementById('enableSystemEvents');

  if (!enableRealtime || !enableSounds || !enableBackgroundTasks || !enableDataUpdates || !enableExternalData || !enableSystemEvents) {
    return; // לא בעמוד מרכז ההתראות
  }

  const settings = {
    enableRealtime: enableRealtime.checked,
    enableSounds: enableSounds.checked,
    enableBackgroundTasks: enableBackgroundTasks.checked,
    enableDataUpdates: enableDataUpdates.checked,
    enableExternalData: enableExternalData.checked,
    enableSystemEvents: enableSystemEvents.checked,
  };

  if (window.notificationsCenter) {
    window.notificationsCenter.settings = settings;
    window.notificationsCenter.saveSettings();
  }
}

function resetNotificationSettings() {
  if (window.confirm('האם אתה בטוח שברצונך לאפס את כל ההגדרות?')) {
    if (window.notificationsCenter) {
      window.notificationsCenter.settings = window.notificationsCenter.loadSettings();
      window.notificationsCenter.updateSettingsUI();
      window.notificationsCenter.saveSettings();
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
