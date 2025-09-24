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
 * @lastUpdated September 4, 2025 - Fixed function calls + debug log
 */

class NotificationsCenter {
  constructor() {
    this.history = [];
    this.notifications = []; // הוספתי את זה
    this.preferences = {}; // העדפות התראות מהמערכת הגלובלית
    this.stats = {
      success: 0,
      error: 0,
      warning: 0,
      info: 0,
      // קטגוריות חדשות
      system: 0,
      business: 0,
      ui: 0,
      development: 0,
      performance: 0,
    };

    this.init().catch(error => {
      console.error('❌ שגיאה באתחול מרכז התראות:', error);
    });
  }

  async init() {
    console.log('🚀 אתחול מרכז התראות... (1.1.0 - Connected to Global Preferences System)');

    // טעינת העדפות התראות מהמערכת הגלובלית
    await this.loadNotificationPreferences();

    // אתחול UI
    this.initUI();

    // אתחול סטטיסטיקות
    this.updateStats();

    // חיבור לאירועי WebSocket
    this.setupWebSocketEvents();

    // טעינת היסטוריה
    this.loadHistory();

    // הוספת התראות בדיקה
    this.addTestNotifications();

    // רענון אוטומטי
    this.startAutoRefresh();

    console.log('✅ מרכז התראות אותחל בהצלחה (1.0.9 - Fixed + Debug + Settings + Filter + Stats + Layout - Live Removed + Settings Fix + AutoRefresh Fix)');
  }

  initUI() {
    // עדכון סטטוס חיבור
    this.updateConnectionStatus('connecting');

    // הגדרות התראות הועברו למערכת ההעדפות הגלובלית

    // עדכון סטטיסטיקות
    this.updateStatsUI();
    
    // בדיקת חיבור WebSocket אחרי טעינה
    setTimeout(() => {
      this.checkWebSocketConnection();
    }, 1000);
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

      // אירועי התראות - עובדים עם מערכת ההעדפות הגלובלית
      window.realtimeNotificationsClient.on('background_task_started', data => {
        if (this.preferences.enableBackgroundTaskNotifications === 'true' || this.preferences.enableBackgroundTaskNotifications === true) {
          this.addNotification('info', 'משימה ברקע', `התחילה: ${data.task_name}`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('background_task_completed', data => {
        if (this.preferences.enableBackgroundTaskNotifications === 'true' || this.preferences.enableBackgroundTaskNotifications === true) {
          this.addNotification('success', 'משימה הושלמה', `${data.task_name} הושלמה בהצלחה`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('background_task_failed', data => {
        if (this.preferences.enableBackgroundTaskNotifications === 'true' || this.preferences.enableBackgroundTaskNotifications === true) {
          this.addNotification('error', 'שגיאה במשימה', `${data.task_name} נכשלה: ${data.error}`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('data_updated', data => {
        if (this.preferences.enableDataUpdateNotifications === 'true' || this.preferences.enableDataUpdateNotifications === true) {
          this.addNotification('info', 'נתונים עודכנו', `${data.table} עודכן בהצלחה`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('data_error', data => {
        if (this.preferences.enableDataUpdateNotifications === 'true' || this.preferences.enableDataUpdateNotifications === true) {
          this.addNotification('error', 'שגיאת נתונים', `שגיאה ב-${data.table}: ${data.error}`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('external_data_update', data => {
        if (this.preferences.enableExternalDataNotifications === 'true' || this.preferences.enableExternalDataNotifications === true) {
          this.addNotification('success', 'נתונים חיצוניים', `${data.provider} עודכן: ${data.ticker_count} טיקרים`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('external_data_error', data => {
        if (this.preferences.enableExternalDataNotifications === 'true' || this.preferences.enableExternalDataNotifications === true) {
          this.addNotification('error', 'שגיאת נתונים חיצוניים', `${data.provider}: ${data.error}`, 'now');
        }
      });

      window.realtimeNotificationsClient.on('system_event', data => {
        if (this.preferences.enableSystemEventNotifications === 'true' || this.preferences.enableSystemEventNotifications === true) {
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

    // הוספה להיסטוריה (כל ההתראות)
    this.history.unshift(notification);
    if (this.history.length > 1000) {
      this.history = this.history.slice(0, 1000);
    }

    // עדכון סטטיסטיקות
    this.stats[type]++;
    this.updateStats();

    // עדכון UI
    this.updateHistoryUI();
    this.updateStatsUI();
    this.updateOverviewStats();

    // שמירה ללוקל סטורג'
    this.saveToLocalStorage();

    // שמירה לקובץ לוג מבוטלת זמנית למניעת עומס
    // this.saveToLogFile(notification);

    // הצגת הודעה לפי העדפות
    if (this.preferences.notificationPopup === 'true' || this.preferences.notificationPopup === true) {
      this.showNotificationPopup(notification);
    }

    // צלילים לפי העדפות
    if (this.preferences.notificationSound === 'true' || this.preferences.notificationSound === true) {
      // this.playNotificationSound(type);
    }
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

    // הסרה אוטומטית לפי העדפות
    const duration = parseInt(this.preferences.notificationDuration || 5) * 1000;
    setTimeout(() => {
      if (popup.parentElement) {
        popup.remove();
      }
    }, duration);
  }

  static playNotificationSound(type) {
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
    const overallStatusElement = document.getElementById('overallStatus');
    const websocketStatus = document.getElementById('websocketStatus');
    const connectionTimeElement = document.getElementById('connectionTime');
    const messagesSentElement = document.getElementById('messagesSent');

    // בדיקה שכל האלמנטים קיימים
    if (!overallStatusElement || !websocketStatus || !connectionTimeElement || !messagesSentElement) {
      return;
    }

    switch (status) {
    case 'connected':
      websocketStatus.textContent = 'מחובר';
      websocketStatus.className = 'text-success';
      overallStatusElement.textContent = 'מחובר';
      overallStatusElement.className = 'text-success';
      break;
    case 'disconnected':
      websocketStatus.textContent = 'מנותק';
      websocketStatus.className = 'text-danger';
      connectionTimeElement.textContent = '-';
      messagesSentElement.textContent = '0';
      overallStatusElement.textContent = 'מנותק';
      overallStatusElement.className = 'text-danger';
      break;
    case 'connecting':
      websocketStatus.textContent = 'מתחבר...';
      websocketStatus.className = 'text-warning';
      connectionTimeElement.textContent = '-';
      messagesSentElement.textContent = '0';
      overallStatusElement.textContent = 'מתחבר...';
      overallStatusElement.className = 'text-warning';
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
          connectionTimeElement.textContent = NotificationsCenter.formatDuration(diff);
        } else {
          connectionTimeElement.textContent = 'עכשיו';
        }

        messagesSentElement.textContent = stats && stats.totalMessages ? stats.totalMessages : 0;
      } catch {
        // שגיאה בעדכון סטטיסטיקות חיבור
        connectionTimeElement.textContent = 'עכשיו';
        messagesSentElement.textContent = '0';
      }
    }
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
    const periodMs = NotificationsCenter.getPeriodInMs(period);
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
    // עדכון סטטיסטיקות פנימיות (מבוסס על היסטוריה)
    this.stats.success = this.history.filter(n => n.type === 'success').length;
    this.stats.error = this.history.filter(n => n.type === 'error').length;
    this.stats.warning = this.history.filter(n => n.type === 'warning').length;
    this.stats.info = this.history.filter(n => n.type === 'info').length;
  }

  updateStatsUI() {
    // עדכון סטטיסטיקות מפורטות
    const successCount = document.getElementById('successCount');
    const errorCount = document.getElementById('errorCount');
    const warningCount = document.getElementById('warningCount');
    const infoCount = document.getElementById('infoCount');

    if (successCount) {successCount.textContent = this.stats.success;}
    if (errorCount) {errorCount.textContent = this.stats.error;}
    if (warningCount) {warningCount.textContent = this.stats.warning;}
    if (infoCount) {infoCount.textContent = this.stats.info;}

    // עדכון סטטיסטיקות סקירה כללית
    this.updateOverviewStats();
  }

  updateOverviewStats() {
    // עדכון סטטיסטיקות בסקירה הכללית
    const activeAlertsCount = document.getElementById('activeAlertsCount');
    const newMessagesCount = document.getElementById('newMessagesCount');
    const lastUpdateTime = document.getElementById('lastUpdateTime');
    const systemStatus = document.getElementById('systemStatus');

    if (activeAlertsCount) {
      activeAlertsCount.textContent = this.history.length;
    }
    
    if (newMessagesCount) {
      // ספירת הודעות חדשות מהשעה האחרונה
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const newMessages = this.history.filter(n => new Date(n.time) > oneHourAgo).length;
      newMessagesCount.textContent = newMessages;
    }
    
    if (lastUpdateTime) {
      if (this.history.length > 0) {
        const lastNotification = this.history[0];
        lastUpdateTime.textContent = NotificationsCenter.getTimeAgo(lastNotification.time);
      } else {
        lastUpdateTime.textContent = '-';
      }
    }
    
    if (systemStatus) {
      if (window.realtimeNotificationsClient && window.realtimeNotificationsClient.isConnected()) {
        systemStatus.textContent = 'פעיל';
        systemStatus.className = 'text-success';
      } else {
        systemStatus.textContent = 'לא מחובר';
        systemStatus.className = 'text-warning';
      }
    }
  }

  async loadNotificationPreferences() {
    try {
      console.log('🔧 טעינת העדפות התראות מהמערכת הגלובלית...');
      
      // טעינת העדפות התראות מהמערכת הגלובלית
      if (typeof window.getGroupPreferences === 'function') {
        const prefs = await window.getGroupPreferences('notification_settings');
        this.preferences = prefs;
        console.log('✅ העדפות התראות נטענו:', this.preferences);
      } else {
        console.warn('⚠️ מערכת ההעדפות הגלובלית לא זמינה, שימוש בברירות מחדל');
        this.preferences = {
          enableNotifications: true,
          enableRealtimeNotifications: true,
          enableBackgroundTaskNotifications: true,
          enableDataUpdateNotifications: true,
          enableExternalDataNotifications: true,
          enableSystemEventNotifications: true,
          notificationPopup: true,
          notificationSound: true,
          notificationDuration: 5,
          notificationMaxHistory: 1000
        };
      }
    } catch (error) {
      console.error('❌ שגיאה בטעינת העדפות התראות:', error);
      // ברירות מחדל במקרה של שגיאה
      this.preferences = {
        enableNotifications: true,
        enableRealtimeNotifications: true,
        enableBackgroundTaskNotifications: true,
        enableDataUpdateNotifications: true,
        enableExternalDataNotifications: true,
        enableSystemEventNotifications: true,
        notificationPopup: true,
        notificationSound: true,
        notificationDuration: 5,
        notificationMaxHistory: 1000
      };
    }
  }

  createNotificationHTML(notification) {
    const timeAgo = NotificationsCenter.getTimeAgo(notification.time);
    const iconClass = NotificationsCenter.getIconClass(notification.type);

    return `
            <div class="notification-item ${notification.type}">
                <div class="notification-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-line">
                        <span class="notification-title">${notification.title}</span>
                        <span class="notification-separator"> --> </span>
                        <span class="notification-message">${notification.message}</span>
                        <span class="notification-separator"> --> </span>
                        <span class="notification-time">${timeAgo}</span>
                    </div>
                    ${notification.page ? `<div class="notification-page">📄 עמוד: ${notification.page}</div>` : ''}
                </div>
            </div>
        `;
  }

  static getIconClass(type) {
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

  getTypeIcon(type) {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '🔔';
    }
  }

  static getTimeAgo(_date) {
    // בדיקה שהפרמטר הוא אובייקט Date תקין
    let date = _date;
    if (!date || !(date instanceof Date)) {
      try {
        date = new Date(date);
      } catch (error) {
        // console.warn('שגיאה בהמרת תאריך:', error);
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

  static getPeriodInMs(period) {
    switch (period) {
    case '1h': return 3600000;
    case '24h': return 86400000;
    case '7d': return 604800000;
    case '30d': return 2592000000;
    default: return 86400000;
    }
  }

  static formatDuration(seconds) {
    if (seconds < 60) {return `${seconds} שניות`;}
    if (seconds < 3600) {return `${Math.floor(seconds / 60)} דקות`;}
    if (seconds < 86400) {return `${Math.floor(seconds / 3600)} שעות`;}
    return `${Math.floor(seconds / 86400)} ימים`;
  }

  // הגדרות התראות הועברו למערכת ההעדפות הגלובלית

  // שמירה ללוקל סטורג'
  saveToLocalStorage() {
    try {
      localStorage.setItem('tiktrack_notifications_history', JSON.stringify(this.history.slice(0, 100)));
      localStorage.setItem('tiktrack_notifications_stats', JSON.stringify(this.stats));
    } catch {
      // שגיאה בשמירה ללוקל סטורג
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
    } catch {
      // שגיאה בטעינה מלוקל סטורג
    }
  }

  loadHistory() {
    // טעינת היסטוריית התראות מלוקל סטורג'
    this.loadFromLocalStorage();

    // טעינת היסטוריה גלובלית מכל העמודים
    this.loadGlobalHistory();

    // טעינת רשימת עמודים לסינון
    this.loadPageFilterOptions();

    // עדכון סטטיסטיקות לאחר טעינה
    this.updateStats();

    // עדכון UI
    this.updateHistoryUI();
    this.updateStatsUI();
    this.updateOverviewStats();
  }

  loadPageFilterOptions() {
    try {
      const pageFilterSelect = document.getElementById('pageFilter');
      if (!pageFilterSelect) return;

      // קבלת רשימת עמודים ייחודיים מההיסטוריה
      const uniquePages = [...new Set(this.history.map(n => n.page).filter(page => page))];
      
      // ניקוי אפשרויות קיימות (למעט "כל העמודים")
      pageFilterSelect.innerHTML = '<option value="">כל העמודים</option>';
      
      // הוספת עמודים ייחודיים
      uniquePages.sort().forEach(page => {
        const option = document.createElement('option');
        option.value = page;
        option.textContent = page;
        pageFilterSelect.appendChild(option);
      });

      console.log('📄 רשימת עמודים לסינון נטענה:', uniquePages.length, 'עמודים');
    } catch (error) {
      console.warn('שגיאה בטעינת רשימת עמודים:', error);
    }
  }

  loadGlobalHistory() {
    try {
      // טעינת היסטוריה גלובלית
      if (typeof window.loadGlobalNotificationHistory === 'function') {
        const globalHistory = window.loadGlobalNotificationHistory();
        console.log('📚 היסטוריה גלובלית נטענה:', globalHistory.length, 'התראות');

        // מיזוג עם היסטוריה מקומית (הסרת כפילויות)
        const mergedHistory = this.mergeHistories(this.history, globalHistory);
        this.history = mergedHistory;

        console.log('✅ היסטוריה מוזגה:', this.history.length, 'התראות');
      }

      // טעינת סטטיסטיקות גלובליות
      if (typeof window.loadGlobalNotificationStats === 'function') {
        const globalStats = window.loadGlobalNotificationStats();
        console.log('📊 סטטיסטיקות גלובליות נטענו:', globalStats);

        // עדכון סטטיסטיקות מקומיות
        this.stats = {
          success: Math.max(this.stats.success, globalStats.success || 0),
          error: Math.max(this.stats.error, globalStats.error || 0),
          warning: Math.max(this.stats.warning, globalStats.warning || 0),
          info: Math.max(this.stats.info, globalStats.info || 0),
        };
      }
    } catch (error) {
      console.warn('שגיאה בטעינת היסטוריה גלובלית:', error);
    }
  }

  mergeHistories(localHistory, globalHistory) {
    // יצירת מפה למניעת כפילויות
    const historyMap = new Map();

    // הוספת היסטוריה גלובלית
    globalHistory.forEach(notification => {
      const key = `${notification.type}-${notification.title}-${notification.message}-${notification.timestamp}`;
      historyMap.set(key, notification);
    });

    // הוספת היסטוריה מקומית (לא תדרוס גלובלית)
    localHistory.forEach(notification => {
      const key = `${notification.type}-${notification.title}-${notification.message}-${notification.timestamp}`;
      if (!historyMap.has(key)) {
        historyMap.set(key, notification);
      }
    });

    // המרה חזרה למערך ומיון לפי זמן
    return Array.from(historyMap.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  addTestNotifications() {
    // הוספת התראות בדיקה אם אין התראות קיימות
    // Disabled test notifications to reduce noise
    if (false && this.history.length === 0) {
      console.log('📝 הוספת התראות בדיקה...');
      
      this.addNotification('success', 'מערכת', 'מרכז ההתראות אותחל בהצלחה', 'now');
      this.addNotification('info', 'חיבור', 'מתחבר לשרת WebSocket...', 'now');
      this.addNotification('warning', 'בדיקה', 'זוהי התראת בדיקה למערכת', 'now');
      
      console.log('✅ התראות בדיקה נוספו');
    }
    
    // הגדרות התראות הועברו למערכת ההעדפות הגלובלית
  }

  checkWebSocketConnection() {
    // בדיקת חיבור WebSocket
    if (window.realtimeNotificationsClient) {
      const isConnected = window.realtimeNotificationsClient.isConnected();
      console.log('🔍 בדיקת חיבור WebSocket:', isConnected ? 'מחובר' : 'לא מחובר');
      
      if (isConnected) {
        this.updateConnectionStatus('connected');
      } else {
        this.updateConnectionStatus('disconnected');
      }
    } else {
      // realtimeNotificationsClient not available - this is normal in some contexts
      this.updateConnectionStatus('disconnected');
    }
  }

  // שמירה לקובץ לוג
  static saveToLogFile(notification) {
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
      fetch('/api/logs/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      }).catch(error => {
        // console.warn('לא ניתן לשמור בקובץ לוג:', error);
      });
    } catch (error) {
      // console.warn('שגיאה בשמירה לקובץ לוג:', error);
    }
  }

  // פונקציות ציבוריות

  async clearHistory() {
    // Function to execute history clearing
    const executeClearHistory = () => {
      this.history = [];
      this.stats = { success: 0, error: 0, warning: 0, info: 0 };

      this.updateHistoryUI();
      this.updateStatsUI();
      this.updateOverviewStats();
      this.saveToLocalStorage();

      // הודעה ישירה לממשק ללא לולאה
      console.log('✅ היסטוריית ההתראות נוקתה בהצלחה');
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
      let confirmed = false;
      if (typeof showConfirmationDialog === 'function') {
        confirmed = await new Promise(resolve => {
          showConfirmationDialog(
            'האם אתה בטוח שברצונך לנקות את כל היסטוריית ההתראות?',
            () => resolve(true),
            () => resolve(false),
            'ניקוי היסטוריה',
            'נקה',
            'ביטול'
          );
        });
      } else {
        confirmed = window.confirm('האם אתה בטוח שברצונך לנקות את כל היסטוריית ההתראות?');
      }
      
      if (confirmed) {
        executeClearHistory();
      } else {
        console.log('❌ ניקוי היסטוריה - משתמש ביטל');
      }
    }
  }

  refreshNotifications() {
    this.loadFromLocalStorage();
    this.updateHistoryUI();
    this.updateStatsUI();
    this.updateOverviewStats();

    // הודעה ישירה לממשק ללא לולאה
    // console.log('✅ ההתראות רועננו בהצלחה');
  }

  filterHistory() {
    const typeFilter = document.getElementById('historyFilter')?.value || '';
    const pageFilter = document.getElementById('pageFilter')?.value || '';
    const period = document.getElementById('historyPeriod')?.value || '24h';
    
    // סינון לפי זמן
    const now = new Date();
    let filteredHistory = this.history;
    
    if (period !== 'all') {
      const periodMs = this.getPeriodMs(period);
      const cutoffTime = new Date(now.getTime() - periodMs);
      filteredHistory = filteredHistory.filter(notification => 
        notification.time && new Date(notification.time) >= cutoffTime
      );
    }
    
    // סינון לפי סוג
    if (typeFilter) {
      filteredHistory = filteredHistory.filter(notification => notification.type === typeFilter);
    }
    
    // סינון לפי עמוד
    if (pageFilter) {
      filteredHistory = filteredHistory.filter(notification => notification.page === pageFilter);
    }
    
    // עדכון UI עם ההיסטוריה המסוננת
    this.updateHistoryUIWithFilteredData(filteredHistory);
  }

  updateHistoryUIWithFilteredData(filteredHistory) {
    const historyContainer = document.getElementById('notificationHistory');
    if (!historyContainer) return;

    // ניקוי קונטיינר
    historyContainer.innerHTML = '';

    // בדיקה אם יש היסטוריה מסוננת
    if (!filteredHistory || filteredHistory.length === 0) {
      historyContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-filter"></i>
          <p>אין התראות המתאימות לסינון הפעיל</p>
        </div>
      `;
      return;
    }

    // הוספת התראות מסוננות לרשימה
    filteredHistory.forEach(notification => {
      const notificationHTML = this.createNotificationHTML(notification);
      const notificationElement = document.createElement('div');
      notificationElement.innerHTML = notificationHTML;
      historyContainer.appendChild(notificationElement.firstElementChild);
    });
  }

  startAutoRefresh() {
    // רענון אוטומטי כל 30 שניות
    setInterval(() => {
      // עדכון סטטוס חיבור רק אם יש שינוי
      if (window.realtimeNotificationsClient) {
        const isConnected = window.realtimeNotificationsClient.isConnected();
        const currentStatus = NotificationsCenter.getCurrentConnectionStatus();

        if (isConnected && currentStatus !== 'connected') {
          this.updateConnectionStatus('connected');
        } else if (!isConnected && currentStatus !== 'disconnected') {
          this.updateConnectionStatus('disconnected');
        }
      }

    }, 30000);

    // עדכון זמן חיבור כל שנייה כאשר מחובר
    setInterval(() => {
      if (window.realtimeNotificationsClient && window.realtimeNotificationsClient.isConnected()) {
        this.updateConnectionTime();
      }
    }, 1000);

    // עדכון סטטיסטיקות כל 30 שניות
    setInterval(() => {
      this.updateOverviewStats();
    }, 30000);
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
          connectionTimeElement.textContent = NotificationsCenter.formatDuration(diff);
        }
      }
    } catch (error) {
      // console.warn('שגיאה בעדכון זמן חיבור:', error);
    }
  }

  static getCurrentConnectionStatus() {
    try {
      const statusDot = document.getElementById('connectionStatus');
      if (!statusDot) {
        return 'connecting'; // לא בעמוד מרכז ההתראות
      }

      if (statusDot.querySelector('.connected')) {return 'connected';}
      if (statusDot.querySelector('.disconnected')) {return 'disconnected';}
      if (statusDot.querySelector('.connecting')) {return 'connecting';}
    } catch (error) {
      // console.warn('שגיאה בקבלת סטטוס חיבור נוכחי:', error);
    }
    return 'connecting';
  }
}

// פונקציה להעתקת היסטוריה מסוננת ללוח
function copyFilteredHistoryToClipboard() {
  try {
    console.log('📋 העתקת היסטוריה מסוננת ללוח...');
    
    // קבלת פילטרים פעילים
    const typeFilter = document.getElementById('historyFilter')?.value || '';
    const pageFilter = document.getElementById('pageFilter')?.value || '';
    const period = document.getElementById('historyPeriod')?.value || '24h';
    
    let log = '=== היסטוריית התראות מסוננת - TikTrack ===\n\n';
    log += `📅 תאריך: ${new Date().toLocaleString('he-IL')}\n`;
    log += `🔍 סינון: סוג=${typeFilter || 'כל ההתראות'}, עמוד=${pageFilter || 'כל העמודים'}, תקופה=${period}\n\n`;
    
    // טעינת היסטוריה גלובלית
    if (typeof window.loadGlobalNotificationHistory === 'function') {
      const globalHistory = window.loadGlobalNotificationHistory();
      if (globalHistory && globalHistory.length > 0) {
        // סינון לפי זמן
        const now = new Date();
        let filteredHistory = globalHistory;
        
        if (period !== 'all') {
          const periodMs = getPeriodMs(period);
          const cutoffTime = new Date(now.getTime() - periodMs);
          filteredHistory = filteredHistory.filter(notification => 
            notification.time && new Date(notification.time) >= cutoffTime
          );
        }
        
        // סינון לפי סוג
        if (typeFilter) {
          filteredHistory = filteredHistory.filter(notification => notification.type === typeFilter);
        }
        
        // סינון לפי עמוד
        if (pageFilter) {
          filteredHistory = filteredHistory.filter(notification => notification.page === pageFilter);
        }
        
        // הוספת התראות מסוננות
        if (filteredHistory.length > 0) {
          filteredHistory.slice(0, 100).forEach((notification, index) => {
            const page = notification.page || 'לא ידוע';
            const time = notification.time ? new Date(notification.time).toLocaleString('he-IL') : 'לא ידוע';
            const typeIcon = getTypeIcon(notification.type);
            log += `${index + 1}. ${typeIcon} [${notification.type.toUpperCase()}] ${notification.title}: ${notification.message} | עמוד: ${page} | ${time}\n`;
          });
          
          if (filteredHistory.length > 100) {
            log += `... ועוד ${filteredHistory.length - 100} התראות\n`;
          }
        } else {
          log += 'אין התראות המתאימות לסינון הפעיל\n';
        }
      } else {
        log += 'אין היסטוריית התראות גלובלית\n';
      }
    } else {
      log += 'פונקציית טעינת היסטוריה גלובלית לא זמינה\n';
    }
    
    // העתקה ללוח
    navigator.clipboard.writeText(log).then(() => {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'היסטוריה מסוננת הועתקה ללוח בהצלחה!');
      } else {
        alert('היסטוריה מסוננת הועתקה ללוח בהצלחה!');
      }
      console.log('✅ היסטוריה מסוננת הועתקה ללוח');
    }).catch(err => {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', 'לא ניתן להעתיק ללוח: ' + err.message);
      } else {
        alert('שגיאה בהעתקה: ' + err.message);
      }
      console.error('❌ שגיאה בהעתקה ללוח:', err);
    });
    
  } catch (error) {
    console.error('❌ שגיאה בהעתקת היסטוריה מסוננת:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בהעתקת היסטוריה מסוננת: ' + error.message);
    } else {
      alert('שגיאה בהעתקת היסטוריה מסוננת: ' + error.message);
    }
  }
}

// פונקציות עזר לסינון
function getPeriodMs(period) {
  switch (period) {
    case '1h': return 60 * 60 * 1000;
    case '24h': return 24 * 60 * 60 * 1000;
    case '7d': return 7 * 24 * 60 * 60 * 1000;
    case '30d': return 30 * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}

function getTypeIcon(type) {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return '🔔';
  }
}

// פונקציה להעתקת לוג מפורט עם כל הנתונים והסטטוס

// פונקציה להעתקת התראות ללוח
async function copyNotificationsToClipboard() {
  console.log('🔍 copyNotificationsToClipboard נקרא!');
  try {
    if (!window.notificationsCenter) {
      console.warn('❌ מרכז התראות לא זמין');
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'מרכז התראות לא זמין');
      }
      return;
    }

    const notifications = window.notificationsCenter.notifications || [];
    const history = window.notificationsCenter.history || [];
    const stats = window.notificationsCenter.stats || { success: 0, error: 0, warning: 0, info: 0 };
    
    console.log('📊 נתונים שנמצאו:', {
      notifications: notifications.length,
      history: history.length,
      stats: stats
    });

    let log = '=== לוג התראות TikTrack ===\n\n';
    log += '📊 סטטיסטיקות:\n';
    log += `✅ הצלחה: ${stats.success}\n`;
    log += `❌ שגיאה: ${stats.error}\n`;
    log += `⚠️ אזהרה: ${stats.warning}\n`;
    log += `ℹ️ מידע: ${stats.info}\n\n`;
    
    // סטטיסטיקות קטגוריות
    log += '📂 סטטיסטיקות קטגוריות:\n';
    log += `🔧 מערכת: ${stats.system || 0}\n`;
    log += `💼 עסקי: ${stats.business || 0}\n`;
    log += `🎨 ממשק משתמש: ${stats.ui || 0}\n`;
    log += `⚙️ פיתוח: ${stats.development || 0}\n`;
    log += `⚡ ביצועים: ${stats.performance || 0}\n\n`;

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

    // העדפות קטגוריות
    log += '⚙️ העדפות קטגוריות:\n';
    try {
      if (typeof window.getPreference === 'function') {
        const categories = ['system', 'business', 'ui', 'development', 'performance'];
        categories.forEach(category => {
          const enabled = window.getPreference(`notifications_${category}_enabled`);
          log += `📂 ${category}: ${enabled ? 'מופעל' : 'כבוי'}\n`;
        });
      } else {
        log += 'פונקציית העדפות לא זמינה\n';
      }
    } catch (error) {
      log += `שגיאה בקריאת העדפות: ${error.message}\n`;
    }
    log += '\n';
    
    log += '🔗 חיבור WebSocket:\n';
    log += `סטטוס: ${window.realtimeNotificationsClient?.socket?.connected ? 'מחובר' : 'לא מחובר'}\n`;
    log += `סטטוס WebSocket: ${document.getElementById('websocketStatus')?.textContent || 'לא ידוע'}\n`;
    log += `זמן חיבור: ${document.getElementById('connectionTime')?.textContent || 'לא ידוע'}\n`;
    log += `הודעות נשלחו: ${document.getElementById('messagesSent')?.textContent || '0'}\n`;
    log += `סטטוס מערכת: ${document.getElementById('overallStatus')?.textContent || 'לא ידוע'}\n`;
    
    // מידע על מערכת הקטגוריות
    log += '🔧 מערכת קטגוריות:\n';
    log += `זיהוי אוטומטי: ${typeof window.detectCategory === 'function' ? 'זמין' : 'לא זמין'}\n`;
    log += `פונקציות חכמות: ${typeof window.showNotificationSmart === 'function' ? 'זמין' : 'לא זמין'}\n`;
    log += `מערכת מיגרציה: ${typeof window.migrateNotificationCalls === 'function' ? 'זמין' : 'לא זמין'}\n`;
    log += `מערכת בדיקות: ${typeof window.notificationSystemTester === 'object' ? 'זמין' : 'לא זמין'}\n`;
    
    // בדיקת פונקציות ספציפיות
    if (typeof window.notificationSystemTester === 'object') {
      try {
        const quickTest = await window.notificationSystemTester.quickTest();
        log += `בדיקה מהירה: הצליחה\n`;
        log += `פונקציות בסיסיות: ${quickTest.basicFunctions}\n`;
        log += `פונקציות חכמות: ${quickTest.smartFunctions}\n`;
        log += `קטגוריות מופעלות: ${quickTest.enabledCategories}\n`;
      } catch (error) {
        log += `בדיקה מהירה: נכשלה - ${error.message}\n`;
      }
    }
    log += '\n';
    
    log += '\n📊 מידע טכני:\n';
    log += `זמן יצירת הלוג: ${new Date().toLocaleString('he-IL')}\n`;
    log += `גרסת דפדפן: ${navigator.userAgent.split(' ').slice(-2).join(' ')}\n`;
    log += `רזולוציה מסך: ${window.screen.width}x${window.screen.height}\n`;
    log += `גודל חלון: ${window.innerWidth}x${window.innerHeight}\n`;
    log += `זמן אמת: ${new Date().toISOString()}\n`;
    
    // מידע על מערכת הקטגוריות החדשה
    log += '\n🔧 מערכת קטגוריות חדשה:\n';
    log += `גרסה: 2.0.5\n`;
    log += `תאריך עדכון: 23.09.2025\n`;
    log += `סטטוס: פעיל\n`;
    log += `קטגוריות זמינות: system, business, ui, development, performance\n`;
    log += `זיהוי אוטומטי: פעיל\n`;
    log += `מיגרציה: זמינה\n`;
    log += `בדיקות: זמינות\n`;
    
    // מידע על העדפות קטגוריות
    log += '\n⚙️ העדפות קטגוריות:\n';
    try {
      if (typeof window.getPreference === 'function') {
        const categories = ['system', 'business', 'ui', 'development', 'performance'];
        categories.forEach(category => {
          const enabled = window.getPreference(`notifications_${category}_enabled`);
          log += `📂 ${category}: ${enabled ? 'מופעל' : 'כבוי'}\n`;
        });
      } else {
        log += 'פונקציית העדפות לא זמינה\n';
      }
    } catch (error) {
      log += `שגיאה בקריאת העדפות: ${error.message}\n`;
    }
    
    log += '\n=== סוף לוג ===';
    
    console.log('📋 לוג שנוצר:', log.substring(0, 200) + '...');

    // העתקה ללוח
    console.log('🔄 מנסה להעתיק ללוח...');
    navigator.clipboard.writeText(log).then(() => {
      console.log('✅ לוג התראות הועתק ללוח בהצלחה');
      if (window.showSuccessNotification) {
        window.showSuccessNotification('הצלחה', 'לוג התראות הועתק ללוח בהצלחה');
      }
    }).catch(err => {
      console.error('❌ שגיאה בהעתקה ללוח:', err);
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה', 'שגיאה בהעתקה ללוח: ' + err.message);
      }
      // Fallback - הצגת הלוג בחלון נפרד
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head>
            <title>לוג מפורט - מרכז התראות</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                direction: rtl; 
                text-align: right; 
                margin: 20px; 
                background: #f8f9fa; 
              }
              pre { 
                background: #ffffff; 
                border: 1px solid #dee2e6; 
                border-radius: 8px; 
                padding: 20px; 
                white-space: pre-wrap; 
                font-family: 'Courier New', monospace; 
                font-size: 14px; 
                line-height: 1.6; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
              }
            </style>
          </head>
          <body>
            <h2>📋 לוג מפורט - מרכז התראות TikTrack</h2>
            <pre>${log}</pre>
          </body>
        </html>
      `);
    });
  } catch (error) {
    console.error('❌ שגיאה ביצירת לוג התראות:', error);
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה ביצירת לוג התראות: ' + error.message);
    }
  }
}

// פונקציות גלובליות
// הגדרות התראות הועברו למערכת ההעדפות הגלובלית

// הגדרות התראות הועברו למערכת ההעדפות הגלובלית


// פונקציות גלובליות - קוראות לפונקציות של המחלקה
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

// פונקציות בדיקת התראות
function testSuccessNotification() {
  if (window.showSuccessNotification) {
    window.showSuccessNotification('בדיקת הצלחה', 'זוהי הודעת הצלחה לבדיקה - הכל עובד תקין!');
  } else {
    console.error('❌ showSuccessNotification לא זמין');
  }
}

function testErrorNotification() {
  if (window.showErrorNotification) {
    window.showErrorNotification('בדיקת שגיאה', 'זוהי הודעת שגיאה לבדיקה - הכל עובד תקין!');
  } else {
    console.error('❌ showErrorNotification לא זמין');
  }
}

function testWarningNotification() {
  if (window.showWarningNotification) {
    window.showWarningNotification('בדיקת אזהרה', 'זוהי הודעת אזהרה לבדיקה - הכל עובד תקין!');
  } else {
    console.error('❌ showWarningNotification לא זמין');
  }
}

function testInfoNotification() {
  if (window.showInfoNotification) {
    window.showInfoNotification('בדיקת מידע', 'זוהי הודעת מידע לבדיקה - הכל עובד תקין!');
  } else {
    console.error('❌ showInfoNotification לא זמין');
  }
}

function toggleSection() {
    const topSection = document.querySelector('.top-section .section-body');
    if (topSection) {
        if (topSection.style.display === 'none') {
            topSection.style.display = '';
            console.log('✅ Top section expanded');
        } else {
            topSection.style.display = 'none';
            console.log('✅ Top section collapsed');
        }
    } else {
        console.warn('❌ Top section not found');
    }
}


// toggleSection function removed - using global version from ui-utils.js

// ייצוא פונקציות ל-window scope
window.copyNotificationsToClipboard = copyNotificationsToClipboard;
window.copyFilteredHistoryToClipboard = copyFilteredHistoryToClipboard;
// window.copyDetailedLog export removed - using global version from system-management.js
window.clearHistory = clearHistory;
window.refreshNotifications = refreshNotifications;
window.filterHistory = filterHistory;
// הגדרות התראות הועברו למערכת ההעדפות הגלובלית
window.testSuccessNotification = testSuccessNotification;
window.testErrorNotification = testErrorNotification;
window.testWarningNotification = testWarningNotification;
window.testInfoNotification = testInfoNotification;

// ייצוא פונקציה להוספת התראות
window.addNotification = function(type, title, message, time = 'now') {
  if (window.notificationsCenter && typeof window.notificationsCenter.addNotification === 'function') {
    window.notificationsCenter.addNotification(type, title, message, time);
  } else {
    console.warn('❌ מרכז התראות לא זמין להוספת התראה');
  }
};


// אתחול
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 טעינת דף מרכז התראות... (1.0.9 - Fixed + Debug + Settings + Filter + Stats + Layout - Live Removed + Settings Fix + AutoRefresh Fix)');

  // אתחול HeaderSystem
  if (window.headerSystem && !window.headerSystem.isInitialized) {
    console.log('✅ אתחול HeaderSystem...');
    window.headerSystem.init();
  }

  // יצירת מופע מרכז התראות
  window.notificationsCenter = new NotificationsCenter();

  // בדיקת זמינות פונקציות
  console.log('🔍 בדיקת זמינות פונקציות:');
  console.log('🔍 testSuccessNotification:', typeof testSuccessNotification);
  console.log('🔍 testErrorNotification:', typeof testErrorNotification);
  console.log('🔍 testWarningNotification:', typeof testWarningNotification);
  console.log('🔍 testInfoNotification:', typeof testInfoNotification);
  console.log('🔍 window.testSuccessNotification:', typeof window.testSuccessNotification);
  console.log('🔍 window.testErrorNotification:', typeof window.testErrorNotification);
  console.log('🔍 window.testWarningNotification:', typeof window.testWarningNotification);
  console.log('🔍 window.testInfoNotification:', typeof window.testInfoNotification);

  // Make functions globally available
  window.copyNotificationsToClipboard = copyNotificationsToClipboard;
  // window.copyDetailedLog export removed - using global version from system-management.js
  window.testSuccessNotification = testSuccessNotification;
  window.testErrorNotification = testErrorNotification;
  window.testWarningNotification = testWarningNotification;
  window.testInfoNotification = testInfoNotification;
  window.toggleSection = toggleSection;
  // window.toggleAllSections export removed - using global version from ui-utils.js
  // window.toggleSection export removed - using global version from ui-utils.js

  console.log('✅ דף מרכז התראות נטען בהצלחה (1.0.9 - Fixed + Debug + Settings + Filter + Stats + Layout - Live Removed + Settings Fix + AutoRefresh Fix)');
});

/**
 * Generate detailed log for Notifications Center
 */
async function generateDetailedLog() {
    const timestamp = new Date().toLocaleString('he-IL');
    const log = [];

    log.push('=== לוג מפורט - מרכז התראות TikTrack ===');
    log.push(`זמן יצירה: ${timestamp}`);
    log.push(`עמוד: ${window.location.href}`);
    log.push('');

    // סטטוס כללי
    log.push('--- סטטוס כללי ---');
    const topSection = document.querySelector('.top-section .section-body');
    const isTopOpen = topSection && topSection.style.display !== 'none';
    log.push(`סקשן עליון: ${isTopOpen ? 'פתוח' : 'סגור'}`);
    
    // סטטיסטיקות התראות מהממשק
    log.push('--- סטטיסטיקות התראות ---');
    log.push(`הודעות הצלחה: ${document.getElementById('successCount')?.textContent || '0'}`);
    log.push(`שגיאות: ${document.getElementById('errorCount')?.textContent || '0'}`);
    log.push(`אזהרות: ${document.getElementById('warningCount')?.textContent || '0'}`);
    log.push(`הודעות מידע: ${document.getElementById('infoCount')?.textContent || '0'}`);
    
    // סטטוס חיבור
    log.push('--- סטטוס חיבור ---');
    log.push(`סטטוס מערכת: ${document.getElementById('overallStatus')?.textContent || 'לא ידוע'}`);
    log.push(`WebSocket: ${document.getElementById('websocketStatus')?.textContent || 'לא ידוע'}`);
    log.push(`זמן חיבור: ${document.getElementById('connectionTime')?.textContent || 'לא ידוע'}`);
    log.push(`הודעות נשלחו: ${document.getElementById('messagesSent')?.textContent || '0'}`);
    
    // סקירה כללית
    log.push('--- סקירה כללית ---');
    log.push(`התראות פעילות: ${document.getElementById('activeAlertsCount')?.textContent || '0'}`);
    log.push(`הודעות חדשות: ${document.getElementById('newMessagesCount')?.textContent || '0'}`);
    log.push(`עדכון אחרון: ${document.getElementById('lastUpdateTime')?.textContent || 'לא ידוע'}`);
    log.push(`סטטוס: ${document.getElementById('systemStatus')?.textContent || 'לא ידוע'}`);

    // היסטוריית התראות
    log.push('--- היסטוריית התראות ---');
    const historyContainer = document.getElementById('notificationHistory');
    const historyItems = historyContainer?.querySelectorAll('.history-item') || [];
    if (historyItems.length === 0) {
        log.push('אין היסטוריית התראות');
    } else {
        historyItems.forEach((item, index) => {
            const type = item.querySelector('.notification-type')?.textContent || 'לא ידוע';
            const title = item.querySelector('.notification-title')?.textContent || 'ללא כותרת';
            const time = item.querySelector('.notification-time')?.textContent || 'ללא זמן';
            log.push(`${index + 1}. [${type}] ${title} - ${time}`);
        });
    }
    
    // פילטרים פעילים
    log.push('--- פילטרים פעילים ---');
    log.push(`פילטר סוג: ${document.getElementById('historyFilter')?.value || 'כל ההתראות'}`);
    log.push(`פילטר עמוד: ${document.getElementById('pageFilter')?.value || 'כל העמודים'}`);
    log.push(`פילטר זמן: ${document.getElementById('historyPeriod')?.value || '24 שעות אחרונות'}`);

    // סטטיסטיקות קטגוריות
    log.push('--- סטטיסטיקות קטגוריות ---');
    log.push(`system: ${window.notificationsCenter?.stats?.system || 0}`);
    log.push(`business: ${window.notificationsCenter?.stats?.business || 0}`);
    log.push(`ui: ${window.notificationsCenter?.stats?.ui || 0}`);
    log.push(`development: ${window.notificationsCenter?.stats?.development || 0}`);
    log.push(`performance: ${window.notificationsCenter?.stats?.performance || 0}`);

    // העדפות קטגוריות
    log.push('--- העדפות קטגוריות ---');
    try {
        if (typeof window.getPreference === 'function') {
            const categories = ['system', 'business', 'ui', 'development', 'performance'];
            for (const category of categories) {
                const notificationEnabled = await window.getPreference(`notifications_${category}_enabled`);
                const consoleEnabled = await window.getPreference(`console_logs_${category}_enabled`);
                log.push(`${category}: התראות=${notificationEnabled ? 'מופעל' : 'מבוטל'}, קונסול=${consoleEnabled ? 'מופעל' : 'מבוטל'}`);
            }
        } else {
            log.push('מערכת העדפות לא זמינה');
        }
    } catch (error) {
        log.push(`שגיאה בטעינת העדפות: ${error.message}`);
    }

    // מערכת קטגוריות חדשה
    log.push('--- מערכת קטגוריות חדשה ---');
    log.push(`detectCategory זמין: ${typeof window.detectCategory === 'function' ? 'כן' : 'לא'}`);
    log.push(`showNotificationSmart זמין: ${typeof window.showNotificationSmart === 'function' ? 'כן' : 'לא'}`);
    log.push(`migrateNotificationCalls זמין: ${typeof window.migrateNotificationCalls === 'function' ? 'כן' : 'לא'}`);
    log.push(`notificationSystemTester זמין: ${typeof window.notificationSystemTester === 'object' ? 'כן' : 'לא'}`);

    // בדיקת פונקציות ספציפיות
    if (typeof window.notificationSystemTester === 'object' && window.notificationSystemTester.quickTest) {
        try {
            const testResults = await window.notificationSystemTester.quickTest();
            log.push('--- תוצאות בדיקה מהירה ---');
            log.push(`פונקציות בסיסיות: ${testResults.basicFunctions ? 'זמינות' : 'לא זמינות'}`);
            log.push(`פונקציות חכמות: ${testResults.smartFunctions ? 'זמינות' : 'לא זמינות'}`);
            log.push(`קטגוריות מופעלות: ${testResults.enabledCategories.join(', ')}`);
        } catch (error) {
            log.push(`שגיאה בבדיקה מהירה: ${error.message}`);
        }
    }

    // סטטיסטיקות וביצועים
    log.push('--- סטטיסטיקות וביצועים ---');
    log.push(`זמן טעינת עמוד: ${Date.now() - performance.timing.navigationStart}ms`);
    if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        log.push(`זיכרון בשימוש: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    }

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
    log.push(`רזולוציה מסך: ${screen.width}x${screen.height}`);
    log.push(`גודל חלון: ${window.innerWidth}x${window.innerHeight}`);
    log.push(`זמן אמת: ${new Date().toISOString()}`);

    // סטטוס סקשנים
    log.push('--- סטטוס סקשנים ---');
    const section1 = document.getElementById('section1');
    const section2 = document.getElementById('section2');
    log.push(`סקשן 1 (סקירה כללית): ${section1?.classList.contains('collapsed') ? 'סגור' : 'פתוח'}`);
    log.push(`סקשן 2 (היסטוריית התראות): ${section2?.classList.contains('collapsed') ? 'סגור' : 'פתוח'}`);

    // WebSocket מידע
    if (window.realtimeNotificationsClient) {
        log.push('--- מידע WebSocket ---');
        log.push(`חיבור פעיל: ${window.realtimeNotificationsClient.isConnected() ? 'כן' : 'לא'}`);
        log.push(`מספר חיבורים: ${window.realtimeNotificationsClient.connectionCount || 0}`);
        log.push(`זמן חיבור: ${window.realtimeNotificationsClient.connectionTime || 'לא זמין'}`);
    }

    log.push('=== סוף הלוג ===');
    return log.join('\n');
}

/**
 * Copy detailed log to clipboard
 */

// ייצוא לגלובל scope
// window.copyDetailedLog export removed - using global version from system-management.js
