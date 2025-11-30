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

// ===== GLOBAL FUNCTIONS (defined early for class access) =====

/**
 * Initialize notifications center page
 */
async function initializeNotificationsCenter() {
    try {
        window.Logger?.debug('🚀 Initializing Notifications Center...');
        
        // Load all overview sections first
        await Promise.all([
            loadCategoriesOverview(),
            loadPreferencesOverview()
        ]);
        
        // Wait for page to fully load, then load notification log
        setTimeout(async () => {
            try {
                await loadNotificationLog();
                window.Logger?.debug('✅ Notification log loaded after page initialization');
            } catch (error) {
                window.Logger?.error('❌ Failed to load notification log:', error);
            }
        }, 1000); // Wait 1 second after page load
        
        window.Logger?.debug('✅ Notifications Center initialized successfully');
    } catch (error) {
        window.Logger?.error('❌ Failed to initialize Notifications Center:', error);
    }
}

/**
 * Load categories overview with statistics
 */
async function loadCategoriesOverview() {
  try {
    const container = document.getElementById('categoriesOverview');
    if (!container) return;

    // Get statistics from the notification system
    let stats = { success: 0, error: 0, warning: 0, info: 0, total: 0 };
    if (window.notificationsCenter && window.notificationsCenter.stats) {
      stats = window.notificationsCenter.stats;
    }

    // Get available categories from the system
    const categories = [
      { name: 'system', title: 'מערכת', icon: 'settings', color: 'var(--primary-color, #26baac)' },
      { name: 'business', title: 'עסקי', icon: 'briefcase', color: 'var(--color-success, #28a745)' },
      { name: 'ui', title: 'ממשק משתמש', icon: 'device-desktop', color: 'var(--color-info, #17a2b8)' },
      { name: 'development', title: 'פיתוח', icon: 'code', color: 'var(--entity-development-color, #fc5a06)' },
      { name: 'performance', title: 'ביצועים', icon: 'gauge', color: 'var(--entity-cash_flow-color, #fd7e14)' },
      { name: 'security', title: 'אבטחה', icon: 'shield', color: 'var(--color-danger, #dc3545)' },
      { name: 'network', title: 'רשת', icon: 'network', color: 'var(--entity-ticker-color, #20c997)' },
      { name: 'database', title: 'מסד נתונים', icon: 'database', color: 'var(--entity-preference-color, #6c757d)' },
      { name: 'user', title: 'משתמש', icon: 'user', color: 'var(--entity-constraint-color, #e83e8c)' },
      { name: 'trade', title: 'עסקאות', icon: 'chart-line', color: 'var(--entity-trade-color, #26baac)' },
      { name: 'ticker', title: 'טיקרים', icon: 'currency-dollar', color: 'var(--entity-ticker-color, #fd7e14)' },
      { name: 'alert', title: 'התראות', icon: 'bell', color: 'var(--entity-alert-color, #dc3545)' },
      { name: 'general', title: 'כללי', icon: 'info-circle', color: 'var(--color-neutral, #6c757d)' }
    ];

    let html = '<div class="row">';
    categories.forEach(category => {
      // Calculate category statistics from actual notification history
      let categoryCount = 0;
      if (window.notificationsCenter && window.notificationsCenter.history) {
        categoryCount = window.notificationsCenter.history.filter(notification => {
          // Check if notification has category field
          if (notification.category) {
            return notification.category === category.name;
          }
          // Fallback: try to detect category from title or message
          const text = (notification.title + ' ' + notification.message).toLowerCase();
          switch (category.name) {
            case 'system':
              return text.includes('מערכת') || text.includes('system') || text.includes('חיבור') || text.includes('initialized');
            case 'business':
              return text.includes('עסק') || text.includes('business') || text.includes('מסחר') || text.includes('trade');
            case 'ui':
              return text.includes('ממשק') || text.includes('ui') || text.includes('עיצוב') || text.includes('design');
            case 'development':
              return text.includes('פיתוח') || text.includes('development') || text.includes('קוד') || text.includes('code');
            case 'performance':
              return text.includes('ביצוע') || text.includes('performance') || text.includes('מהירות') || text.includes('speed');
            case 'security':
              return text.includes('אבטחה') || text.includes('security') || text.includes('הגנה') || text.includes('protection');
            case 'network':
              return text.includes('רשת') || text.includes('network') || text.includes('חיבור') || text.includes('connection');
            case 'database':
              return text.includes('מסד') || text.includes('database') || text.includes('נתונים') || text.includes('data');
            case 'user':
              return text.includes('משתמש') || text.includes('user') || text.includes('פרופיל') || text.includes('profile');
            case 'trade':
              return text.includes('עסקה') || text.includes('trade') || text.includes('מסחר') || text.includes('trading');
            case 'ticker':
              return text.includes('טיקר') || text.includes('ticker') || text.includes('מטבע') || text.includes('coin');
            case 'alert':
              return text.includes('התראה') || text.includes('alert') || text.includes('אזהרה') || text.includes('warning');
            case 'general':
              return text.includes('כללי') || text.includes('general') || text.includes('מידע') || text.includes('info');
            default:
              return false;
          }
        }).length;
      }
      
      const percentage = stats.total > 0 ? Math.round((categoryCount / stats.total) * 100) : 0;
      
      // Use IconSystem to render category icon
      let iconHTML = '';
      if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
        try {
          iconHTML = await window.IconSystem.renderIcon('category', category.icon, {
            size: '32',
            alt: category.icon,
            class: 'icon mb-2',
            style: `color: ${category.color};`
          });
        } catch (error) {
          // Fallback if IconSystem fails
          iconHTML = `<img src="/trading-ui/images/icons/tabler/${category.icon}.svg" width="32" height="32" alt="${category.icon}" class="icon mb-2" style="color: ${category.color};">`;
        }
      } else {
        // Fallback if IconSystem not available
        iconHTML = `<img src="/trading-ui/images/icons/tabler/${category.icon}.svg" width="32" height="32" alt="${category.icon}" class="icon mb-2" style="color: ${category.color};">`;
      }
      
      html += `
        <div class="col-md-4 col-sm-6 mb-3">
          <div class="category-card text-center p-3 border rounded">
            ${iconHTML}
            <h6 class="mb-1">${category.title}</h6>
            <h4 class="mb-1" style="color: ${category.color};">${categoryCount.toLocaleString()}</h4>
            <small class="text-muted">${percentage}% מהסך הכל</small>
          </div>
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
    window.Logger?.debug('✅ Categories overview loaded with statistics');
  } catch (error) {
    window.Logger?.error('❌ Error loading categories overview:', error);
  }
}

/**
 * Load category statistics
 */
async function loadCategoryStatsLegacy() {
  // Backwards compatibility wrapper; use main implementation.
  return loadCategoryStats();
}

/**
 * Load preferences overview
 */
async function loadPreferencesOverview() {
  try {
    const container = document.getElementById('preferencesOverview');
    if (!container) return;

    // Get notification preferences from the correct group
    // Get preferences from the system using built-in function
    let preferences = {};
    if (typeof window.getGroupPreferences === 'function') {
      try {
        const result = await window.getGroupPreferences('notification_settings');
        if (result && result.success && result.data && result.data.preferences) {
          preferences = result.data.preferences;
        } else {
          window.Logger?.warn('Failed to get notification preferences from system');
        }
      } catch (error) {
        window.Logger?.error('Error loading notification preferences:', error);
      }
    }

    // Get the most important notification preferences only - organized like preferences page
    const basicSettings = [
      { key: 'enableNotifications', title: 'הפעל התראות', type: 'boolean' },
      { key: 'notificationPopup', title: 'חלון קופץ התראות', type: 'boolean' },
      { key: 'notificationSound', title: 'צליל התראות', type: 'boolean' },
      { key: 'notificationDuration', title: 'משך זמן הצגת התראה (שניות)', type: 'integer' },
      { key: 'enableRealtimeNotifications', title: 'התראות בזמן אמת', type: 'boolean' },
      { key: 'enableSystemEventNotifications', title: 'התראות על אירועי מערכת', type: 'boolean' },
      { key: 'notifyOnTradeExecuted', title: 'התראה על ביצוע עסקה', type: 'boolean' },
      { key: 'notifyOnStopLoss', title: 'התראה על stop loss', type: 'boolean' }
    ];

    const notificationCategories = [
      { key: 'notifications_system_enabled', title: 'התראות מערכת', type: 'boolean' },
      { key: 'notifications_business_enabled', title: 'התראות עסקיות', type: 'boolean' },
      { key: 'notifications_ui_enabled', title: 'התראות ממשק משתמש', type: 'boolean' },
      { key: 'notifications_development_enabled', title: 'התראות פיתוח', type: 'boolean' },
      { key: 'notifications_performance_enabled', title: 'התראות ביצועים', type: 'boolean' }
    ];

    const consoleLogs = [
      { key: 'console_logs_initialization_enabled', title: 'לוגי אתחול מערכות', type: 'boolean' },
      { key: 'console_logs_system_enabled', title: 'לוגים מערכתיים', type: 'boolean' },
      { key: 'console_logs_business_enabled', title: 'לוגים עסקיים', type: 'boolean' },
      { key: 'console_logs_development_enabled', title: 'לוגים למפתחים', type: 'boolean' },
      { key: 'console_logs_performance_enabled', title: 'לוגי ביצועים', type: 'boolean' }
    ];

    // Render icons using IconSystem
    let slidersIcon = '<img src="/trading-ui/images/icons/tabler/sliders.svg" width="16" height="16" alt="settings" class="icon me-2">';
    let layersIcon = '<img src="/trading-ui/images/icons/tabler/layers.svg" width="16" height="16" alt="categories" class="icon me-2">';
    let terminalIcon = '<img src="/trading-ui/images/icons/tabler/terminal.svg" width="16" height="16" alt="terminal" class="icon me-2">';
    
    if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
      try {
        slidersIcon = await window.IconSystem.renderIcon('button', 'sliders', { size: '16', alt: 'settings', class: 'icon me-2' });
        layersIcon = await window.IconSystem.renderIcon('button', 'layers', { size: '16', alt: 'categories', class: 'icon me-2' });
        terminalIcon = await window.IconSystem.renderIcon('button', 'terminal', { size: '16', alt: 'terminal', class: 'icon me-2' });
      } catch (error) {
        // Fallback already set above
      }
    }

    const preferencesHtml = `
      <div class="row">
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="card">
            <div class="card-header bg-primary text-white">
              ${slidersIcon}הגדרות בסיסיות
            </div>
            <div class="card-body">
              ${renderPreferenceList(basicSettings, preferences)}
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="card">
            <div class="card-header bg-success text-white">
              ${layersIcon}קטגוריות התראות
            </div>
            <div class="card-body">
              ${renderPreferenceList(notificationCategories, preferences)}
            </div>
          </div>
        </div>
        <div class="col-lg-4 col-md-12 mb-3">
          <div class="card">
            <div class="card-header bg-warning text-white">
              ${terminalIcon}לוגים וקונסול
            </div>
            <div class="card-body">
              ${renderPreferenceList(consoleLogs, preferences)}
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = preferencesHtml;
  } catch (error) {
    window.Logger?.error('❌ Error loading preferences overview:', error);
  }
}

/**
 * Load all overview data
 */
async function loadOverviewData() {
  await Promise.all([
    loadCategoriesOverview(),
    loadPreferencesOverview(),
    loadCategoryStats()
  ]);
}

// Export functions to global scope
window.loadCategoriesOverview = loadCategoriesOverview;
window.loadPreferencesOverview = loadPreferencesOverview;
window.loadCategoryStats = loadCategoryStats;
window.loadOverviewData = loadOverviewData;

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
      window.Logger?.error('❌ שגיאה באתחול מרכז התראות:', error);
    });
  }

  async init() {
    window.Logger?.debug('🚀 אתחול מרכז התראות... (1.1.0 - Connected to Global Preferences System)');

    // טעינת העדפות התראות מהמערכת הגלובלית
    await this.loadNotificationPreferences();

    // אתחול UI
    this.initUI();

    // אתחול סטטיסטיקות
    this.updateStats();

    // חיבור לאירועי WebSocket
    this.setupWebSocketEvents();

    // טעינת היסטוריה
    this.loadHistory().then(() => {
      window.Logger?.debug('✅ היסטוריה נטענה בהצלחה');
      // עדכון סטטיסטיקות אחרי טעינת ההיסטוריה
      this.updateStats();
      this.updateStatsUI();
      
      // טעינת נתוני סקירה כללית
      if (typeof window.loadOverviewData === 'function') {
        window.loadOverviewData();
      }
    }).catch(error => {
      window.Logger?.warn('⚠️ שגיאה בטעינת היסטוריה:', error);
    });

    // הוספת התראות בדיקה
    this.addTestNotifications();

    // רענון אוטומטי
    this.startAutoRefresh();

    window.Logger?.debug('✅ מרכז התראות אותחל בהצלחה (1.0.9 - Fixed + Debug + Settings + Filter + Stats + Layout - Live Removed + Settings Fix + AutoRefresh Fix)');
  }

  initUI() {
    // עדכון סטטוס חיבור
    this.updateConnectionStatus('connecting');

    // הגדרות התראות הועברו למערכת ההעדפות הגלובלית

    // עדכון סטטיסטיקות
    this.updateStatsUI();
    
    // בדיקת חיבור WebSocket אחרי טעינה
    setTimeout(() => {
      try {
        if (this && typeof this.checkWebSocketConnection === 'function') {
          this.checkWebSocketConnection();
        }
      } catch (error) {
        window.Logger?.warn('⚠️ Error in WebSocket connection check:', error);
      }
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
    // Auto-detect category if not provided
    let category = 'general';
    if (typeof window.detectNotificationCategory === 'function') {
      try {
        category = window.detectNotificationCategory(message, type, title, {
          fileName: window.location.pathname,
          functionName: 'addNotification',
          stackTrace: ''
        });
      } catch (error) {
        window.Logger?.warn('Failed to detect category in addNotification, using default:', error);
        // Fallback to type-based category
        switch (type) {
          case 'success': category = 'business'; break;
          case 'error': category = 'system'; break;
          case 'warning': category = 'system'; break;
          case 'info': category = 'ui'; break;
          default: category = 'general';
        }
      }
    } else {
      // Fallback to type-based category
      switch (type) {
        case 'success': category = 'business'; break;
        case 'error': category = 'system'; break;
        case 'warning': category = 'system'; break;
        case 'info': category = 'ui'; break;
        default: category = 'general';
      }
    }

    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      category,
      // Use dateUtils for consistent date handling
      time: time === 'now' ? (window.dateUtils?.getToday ? window.dateUtils.getToday() : new Date()) : (window.dateUtils?.toDateObject ? window.dateUtils.toDateObject(time) : new Date(time)),
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
    await this.updateHistoryUI();
    this.updateStatsUI();
    this.updateOverviewStats();

    // שמירה ללוקל סטורג' - הוסרה כי המערכת עברה ל-IndexedDB
    // this.saveToLocalStorage(); - הוסרה

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
        <button data-button-type="CLOSE" data-size="small" data-variant="small" data-onclick="this.parentElement.parentElement.remove()" data-text="" title="סגור popup" aria-label="סגור">×</button>
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


  async updateHistoryUI() {
    const container = document.getElementById('unified-logs-container');
    if (!container) {
      return; // לא בעמוד מרכז ההתראות
    }

    if (this.history.length === 0) {
      // Render icon using IconSystem
      let clockHistoryIcon = '<img src="/trading-ui/images/icons/tabler/clock-history.svg" width="32" height="32" alt="history" class="icon">';
      if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
        try {
          clockHistoryIcon = await window.IconSystem.renderIcon('button', 'clock-history', { size: '32', alt: 'history', class: 'icon' });
        } catch (error) {
          // Fallback already set
        }
      }
      
      container.innerHTML = `
                <div class="no-history">
                    ${clockHistoryIcon}
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
      // Render icon using IconSystem
      let filterIcon = '<img src="/trading-ui/images/icons/tabler/filter.svg" width="32" height="32" alt="filter" class="icon">';
      if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
        try {
          filterIcon = await window.IconSystem.renderIcon('button', 'filter', { size: '32', alt: 'filter', class: 'icon' });
        } catch (error) {
          // Fallback already set
        }
      }
      
      container.innerHTML = `
                <div class="no-history">
                    ${filterIcon}
                    <p>אין התראות לפי הפילטרים שנבחרו</p>
                </div>
            `;
      return;
    }

    // Render all notifications with icons
    const notificationHTMLs = await Promise.all(
      filteredHistory.map(notification => this.createNotificationHTML(notification))
    );
    container.innerHTML = notificationHTMLs.join('');
  }

  updateStats() {
    // עדכון סטטיסטיקות פנימיות (מבוסס על היסטוריה)
    this.stats.success = this.history.filter(n => n.type === 'success').length;
    this.stats.error = this.history.filter(n => n.type === 'error').length;
    this.stats.warning = this.history.filter(n => n.type === 'warning').length;
    this.stats.info = this.history.filter(n => n.type === 'info').length;
    this.stats.total = this.stats.success + this.stats.error + this.stats.warning + this.stats.info;
    
    // עדכון סטטיסטיקות קטגוריות
    this.stats.system = this.history.filter(n => n.category === 'system').length;
    this.stats.business = this.history.filter(n => n.category === 'business').length;
    this.stats.ui = this.history.filter(n => n.category === 'ui').length;
    this.stats.development = this.history.filter(n => n.category === 'development').length;
    this.stats.performance = this.history.filter(n => n.category === 'performance').length;
    this.stats.security = this.history.filter(n => n.category === 'security').length;
    this.stats.network = this.history.filter(n => n.category === 'network').length;
    this.stats.database = this.history.filter(n => n.category === 'database').length;
    this.stats.user = this.history.filter(n => n.category === 'user').length;
    this.stats.trade = this.history.filter(n => n.category === 'trade').length;
    this.stats.ticker = this.history.filter(n => n.category === 'ticker').length;
    this.stats.alert = this.history.filter(n => n.category === 'alert').length;
    this.stats.general = this.history.filter(n => n.category === 'general').length;
  }

  updateStatsUI() {
    // עדכון סטטיסטיקות מפורטות
    const successCount = document.getElementById('successCount');
    const errorCount = document.getElementById('errorCount');
    const warningCount = document.getElementById('warningCount');
    const infoCount = document.getElementById('infoCount');
    const totalCount = document.getElementById('totalCount');

    if (successCount) {successCount.textContent = this.stats.success;}
    if (errorCount) {errorCount.textContent = this.stats.error;}
    if (warningCount) {warningCount.textContent = this.stats.warning;}
    if (infoCount) {infoCount.textContent = this.stats.info;}
    if (totalCount) {totalCount.textContent = this.stats.success + this.stats.error + this.stats.warning + this.stats.info;}

    // עדכון סטטיסטיקות סקירה כללית
    this.updateOverviewStats();
    
    // עדכון קטגוריות הודעות
    if (typeof window.loadCategoriesOverview === 'function') {
      window.loadCategoriesOverview();
    }
    if (typeof window.loadCategoryStats === 'function') {
      window.loadCategoryStats();
    }
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
      // Use dateUtils for consistent date handling
      let oneHourAgo;
      if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
        oneHourAgo = window.dateUtils.toDateObject({ epochMs: Date.now() - 60 * 60 * 1000 });
      } else {
        oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      }
      const newMessages = this.history.filter(n => {
        const msgTime = window.dateUtils?.toDateObject ? window.dateUtils.toDateObject(n.time) : new Date(n.time);
        return msgTime > oneHourAgo;
      }).length;
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
      window.Logger?.debug('🔧 טעינת העדפות התראות מהמערכת הגלובלית...');
      
      // טעינת העדפות התראות מהמערכת הגלובלית
      if (typeof window.getGroupPreferences === 'function') {
        const prefs = await window.getGroupPreferences('notification_settings');
        this.preferences = prefs;
        window.Logger?.debug('✅ העדפות התראות נטענו:', this.preferences);
      } else {
        window.Logger?.warn('⚠️ מערכת ההעדפות הגלובלית לא זמינה, שימוש בברירות מחדל');
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
      window.Logger?.error('❌ שגיאה בטעינת העדפות התראות:', error);
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

  async createNotificationHTML(notification) {
    const timeAgo = NotificationsCenter.getTimeAgo(notification.time);
    const iconClass = NotificationsCenter.getIconClass(notification.type);

    // Render icon using IconSystem
    let iconHTML = `<img src="/trading-ui/images/icons/tabler/${iconClass}.svg" width="16" height="16" alt="${iconClass}" class="icon">`;
    if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
      try {
        iconHTML = await window.IconSystem.renderIcon('button', iconClass, { size: '16', alt: iconClass, class: 'icon' });
      } catch (error) {
        // Fallback already set
      }
    }

    return `
            <div class="notification-item ${notification.type}">
                <div class="notification-icon">
                    ${iconHTML}
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
    // Returns Tabler icon name (not CSS class)
    switch (type) {
    case 'success':
      return 'check-circle';
    case 'error':
      return 'alert-circle';
    case 'warning':
      return 'alert-triangle';
    case 'info':
      return 'info-circle';
    default:
      return 'bell';
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
    // Use dateUtils for consistent date parsing
    if (!date || !(date instanceof Date)) {
      try {
        if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
          date = window.dateUtils.toDateObject(date);
        } else {
          date = new Date(date);
        }
      } catch (error) {
        // window.Logger?.warn('שגיאה בהמרת תאריך:', error);
        return 'לא ידוע';
      }
    }

    // Use dateUtils for consistent date handling
    let now;
    if (window.dateUtils && typeof window.dateUtils.getToday === 'function') {
      now = window.dateUtils.getToday();
    } else {
      now = new Date();
    }
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
  // שמירה ללוקל סטורג' - הוסרה כי המערכת עברה ל-IndexedDB
  // saveToLocalStorage() - הוסרה

  // טעינה מלוקל סטורג' - הוסרה כי המערכת עברה ל-IndexedDB  
  // loadFromLocalStorage() - הוסרה

  async loadHistory() {
    // טעינת היסטוריית התראות - עבר ל-IndexedDB
    // this.loadFromLocalStorage(); - הוסרה

    // טעינת היסטוריה גלובלית מכל העמודים
    await this.loadGlobalHistory();

    // טעינת רשימת עמודים לסינון
    this.loadPageFilterOptions();

    // עדכון סטטיסטיקות לאחר טעינה
    this.updateStats();

    // עדכון UI
    await this.updateHistoryUI();
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
      pageFilterSelect.innerHTML.textContent = '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = '\'<option value="">כל העמודים</option>\'';
        while (tempDiv.firstChild) {
            pageFilterSelect.innerHTML.appendChild(tempDiv.firstChild);
        }
      
      // הוספת עמודים ייחודיים
      uniquePages.sort().forEach(page => {
        const option = document.createElement('option');
        option.value = page;
        option.textContent = page;
        pageFilterSelect.appendChild(option);
      });

      window.Logger?.debug('📄 רשימת עמודים לסינון נטענה:', uniquePages.length, 'עמודים');
    } catch (error) {
      window.Logger?.warn('שגיאה בטעינת רשימת עמודים:', error);
    }
  }

  /**
   * Convert new format to old format for compatibility
   */
  convertNewFormatToOldFormat(newFormatHistory) {
    return newFormatHistory.map(item => ({
      id: item.id,
      type: item.type || item.level || 'info',
      title: item.title || 'ללא כותרת',
      message: item.message || item.error || 'ללא הודעה',
      time: new Date(item.timestamp || item.time || Date.now()),
      timestamp: item.timestamp || item.time || Date.now(),
      page: item.page || window.location.pathname,
      url: item.url || window.location.href,
      category: item.category || 'general'
    }));
  }

  /**
   * Merge histories and remove duplicates
   */
  mergeHistories(oldHistory, newHistory) {
    const merged = [...oldHistory];
    const existingIds = new Set(oldHistory.map(item => item.id));
    
    newHistory.forEach(item => {
      if (!existingIds.has(item.id)) {
        merged.push(item);
      }
    });
    
    // Sort by timestamp using TableSortValueAdapter
    return merged.sort((a, b) => {
        const timestampA = a.timestamp || 0;
        const timestampB = b.timestamp || 0;
        
        // Use TableSortValueAdapter if available
        if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
            const sortValueA = window.TableSortValueAdapter.getSortValue({ value: timestampA, type: 'numeric' });
            const sortValueB = window.TableSortValueAdapter.getSortValue({ value: timestampB, type: 'numeric' });
            return (sortValueB || 0) - (sortValueA || 0);
        }
        
        // Fallback to direct comparison
        return timestampB - timestampA;
    });
  }

  async loadGlobalHistory() {
    try {
      // טעינת היסטוריה גלובלית מהמערכת החדשה
      if (window.UnifiedCacheManager) {
        window.Logger?.debug('🔧 טוען היסטוריה מהמערכת החדשה (UnifiedCacheManager)...');
        const globalHistory = await window.UnifiedCacheManager.get('notification_history');
        window.Logger?.debug('📚 היסטוריה גלובלית נטענה:', globalHistory ? 1 : 0, 'התראות');

        // המרת הפורמט למערכת הישנה
        const convertedHistory = globalHistory ? this.convertNewFormatToOldFormat([globalHistory]) : [];
        
        // מיזוג עם היסטוריה מקומית (הסרת כפילויות)
        const mergedHistory = this.mergeHistories(this.history, convertedHistory);
        this.history = mergedHistory;

        window.Logger?.debug('✅ היסטוריה מוזגה:', this.history.length, 'התראות');
      } else if (typeof window.loadGlobalNotificationHistory === 'function') {
        // Fallback למערכת הישנה
        const globalHistory = await window.loadGlobalNotificationHistory();
        window.Logger?.debug('📚 היסטוריה גלובלית נטענה:', globalHistory.length, 'התראות');

        // מיזוג עם היסטוריה מקומית (הסרת כפילויות)
        const mergedHistory = this.mergeHistories(this.history, globalHistory);
        this.history = mergedHistory;

        window.Logger?.debug('✅ היסטוריה מוזגה:', this.history.length, 'התראות');
      }

      // טעינת סטטיסטיקות גלובליות
      if (typeof window.loadGlobalNotificationStats === 'function') {
        const globalStats = await window.loadGlobalNotificationStats();
        window.Logger?.debug('📊 סטטיסטיקות גלובליות נטענו:', globalStats);

        // עדכון סטטיסטיקות מקומיות
        this.stats = {
          success: Math.max(this.stats.success, globalStats.success || 0),
          error: Math.max(this.stats.error, globalStats.error || 0),
          warning: Math.max(this.stats.warning, globalStats.warning || 0),
          info: Math.max(this.stats.info, globalStats.info || 0),
        };
      }
    } catch (error) {
      window.Logger?.warn('שגיאה בטעינת היסטוריה גלובלית:', error);
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

    // המרה חזרה למערך ומיון לפי זמן using TableSortValueAdapter
    return Array.from(historyMap.values()).sort((a, b) => {
        const timestampA = a.timestamp || 0;
        const timestampB = b.timestamp || 0;
        
        // Use TableSortValueAdapter if available
        if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
            const sortValueA = window.TableSortValueAdapter.getSortValue({ value: timestampA, type: 'numeric' });
            const sortValueB = window.TableSortValueAdapter.getSortValue({ value: timestampB, type: 'numeric' });
            return (sortValueB || 0) - (sortValueA || 0);
        }
        
        // Fallback to direct comparison
        return timestampB - timestampA;
    });
  }

  addTestNotifications() {
    // הוספת התראות בדיקה אם אין התראות קיימות
    // Disabled test notifications to reduce noise
    if (false && this.history.length === 0) {
      window.Logger?.debug('📝 הוספת התראות בדיקה...');
      
      this.addNotification('success', 'מערכת', 'מרכז ההתראות אותחל בהצלחה', 'now');
      this.addNotification('info', 'חיבור', 'מתחבר לשרת WebSocket...', 'now');
      this.addNotification('warning', 'בדיקה', 'זוהי התראת בדיקה למערכת', 'now');
      
      window.Logger?.debug('✅ התראות בדיקה נוספו');
    }
    
    // הגדרות התראות הועברו למערכת ההעדפות הגלובלית
  }

  checkWebSocketConnection() {
    // בדיקת חיבור WebSocket
    if (window.realtimeNotificationsClient) {
      const isConnected = window.realtimeNotificationsClient.isConnected();
      window.Logger?.debug('🔍 בדיקת חיבור WebSocket:', isConnected ? 'מחובר' : 'לא מחובר');
      
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
        // window.Logger?.warn('לא ניתן לשמור בקובץ לוג:', error);
      });
    } catch (error) {
      // window.Logger?.warn('שגיאה בשמירה לקובץ לוג:', error);
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
      // this.saveToLocalStorage(); - הוסרה כי המערכת עברה ל-IndexedDB

      // הודעה ישירה לממשק ללא לולאה
      window.Logger?.debug('✅ היסטוריית ההתראות נוקתה בהצלחה');
    };
    
    // Use notification system or fallback to confirm
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'ניקוי היסטוריה',
        'האם אתה בטוח שברצונך לנקות את כל היסטוריית ההתראות?',
        executeClearHistory,
        () => window.Logger?.debug('❌ ניקוי היסטוריה - משתמש ביטל')
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
        confirmed = window.window.showConfirmationDialog('האם אתה בטוח שברצונך לנקות את כל היסטוריית ההתראות?');
      }
      
      if (confirmed) {
        executeClearHistory();
      } else {
        window.Logger?.debug('❌ ניקוי היסטוריה - משתמש ביטל');
      }
    }
  }

  async refreshNotifications() {
    // this.loadFromLocalStorage(); - הוסרה כי המערכת עברה ל-IndexedDB
    await this.updateHistoryUI();
    this.updateStatsUI();
    this.updateOverviewStats();

    // הודעה ישירה לממשק ללא לולאה
    // window.Logger?.debug('✅ ההתראות רועננו בהצלחה');
  }

  // generateDetailedLog function moved to global scope below

  async filterHistory() {
    // Use DataCollectionService to get values if available
    let typeFilter, pageFilter, period;
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
      typeFilter = window.DataCollectionService.getValue('historyFilter', 'text', '') || '';
      pageFilter = window.DataCollectionService.getValue('pageFilter', 'text', '') || '';
      period = window.DataCollectionService.getValue('historyPeriod', 'text', '24h') || '24h';
    } else {
      const typeFilterEl = document.getElementById('historyFilter');
      const pageFilterEl = document.getElementById('pageFilter');
      const periodEl = document.getElementById('historyPeriod');
      typeFilter = typeFilterEl ? typeFilterEl.value : '';
      pageFilter = pageFilterEl ? pageFilterEl.value : '';
      period = periodEl ? periodEl.value : '24h';
    }
    
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
    await this.updateHistoryUIWithFilteredData(filteredHistory);
  }

  async updateHistoryUIWithFilteredData(filteredHistory) {
    const historyContainer = document.getElementById('notificationHistory');
    if (!historyContainer) return;

    // ניקוי קונטיינר
    historyContainer.innerHTML = '';

    // בדיקה אם יש היסטוריה מסוננת
    if (!filteredHistory || filteredHistory.length === 0) {
      // Render icon using IconSystem
      let filterIcon = '<img src="/trading-ui/images/icons/tabler/filter.svg" width="32" height="32" alt="filter" class="icon">';
      if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
        try {
          filterIcon = await window.IconSystem.renderIcon('button', 'filter', { size: '32', alt: 'filter', class: 'icon' });
        } catch (error) {
          // Fallback already set
        }
      }
      
      historyContainer.innerHTML = `
        <div class="empty-state">
          ${filterIcon}
          <p>אין התראות המתאימות לסינון הפעיל</p>
        </div>
      `;
      return;
    }

    // הוספת התראות מסוננות לרשימה
    for (const notification of filteredHistory) {
      const notificationHTML = await this.createNotificationHTML(notification);
      const notificationElement = document.createElement('div');
      notificationElement.innerHTML = notificationHTML;
      historyContainer.appendChild(notificationElement.firstElementChild);
    }
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
      // window.Logger?.warn('שגיאה בעדכון זמן חיבור:', error);
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
      // window.Logger?.warn('שגיאה בקבלת סטטוס חיבור נוכחי:', error);
    }
    return 'connecting';
  }
}

// פונקציה להעתקת היסטוריה מסוננת ללוח
async function copyFilteredHistoryToClipboard() {
  try {
    window.Logger?.debug('📋 העתקת היסטוריה מסוננת ללוח...');
    
    // קבלת פילטרים פעילים
    // Use DataCollectionService to get values if available
    let typeFilter, pageFilter, period;
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
      typeFilter = window.DataCollectionService.getValue('historyFilter', 'text', '') || '';
      pageFilter = window.DataCollectionService.getValue('pageFilter', 'text', '') || '';
      period = window.DataCollectionService.getValue('historyPeriod', 'text', '24h') || '24h';
    } else {
      const typeFilterEl = document.getElementById('historyFilter');
      const pageFilterEl = document.getElementById('pageFilter');
      const periodEl = document.getElementById('historyPeriod');
      typeFilter = typeFilterEl ? typeFilterEl.value : '';
      pageFilter = pageFilterEl ? pageFilterEl.value : '';
      period = periodEl ? periodEl.value : '24h';
    }
    
    let log = '=== היסטוריית התראות מסוננת - TikTrack ===\n\n';
    log += `📅 תאריך: ${new Date().toLocaleString('he-IL')}\n`;
    log += `🔍 סינון: סוג=${typeFilter || 'כל ההתראות'}, עמוד=${pageFilter || 'כל העמודים'}, תקופה=${period}\n\n`;
    
    // טעינת היסטוריה גלובלית
    if (typeof window.loadGlobalNotificationHistory === 'function') {
      try {
        const globalHistory = await window.loadGlobalNotificationHistory();
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
      } catch (error) {
        window.Logger?.warn('⚠️ Error loading global notification history:', error);
        log += 'שגיאה בטעינת היסטוריה גלובלית\n';
      }
    } else {
      log += 'פונקציית טעינת היסטוריה גלובלית לא זמינה\n';
    }
    
    // העתקה ללוח
    navigator.clipboard.writeText(log).then(() => {
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'היסטוריה מסוננת הועתקה ללוח בהצלחה!');
      } else {
        window.showErrorNotification('היסטוריה מסוננת הועתקה ללוח בהצלחה!', "שגיאה");
      }
      window.Logger?.debug('✅ היסטוריה מסוננת הועתקה ללוח');
    }).catch(err => {
      if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', 'לא ניתן להעתיק ללוח: ' + err.message);
      } else {
        window.showErrorNotification('שגיאה בהעתקה: ' + err.message, "שגיאה");
      }
      window.Logger?.error('❌ שגיאה בהעתקה ללוח:', err);
    });
    
  } catch (error) {
    window.Logger?.error('❌ שגיאה בהעתקת היסטוריה מסוננת:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בהעתקת היסטוריה מסוננת: ' + error.message);
    } else {
      window.showErrorNotification('שגיאה בהעתקת היסטוריה מסוננת: ' + error.message, "שגיאה");
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

// פונקציות בדיקת התראות - קריאות סטנדרטיות למערכת ההודעות
function testSuccessNotification() {
  window.Logger?.debug('🧪 Testing success notification...');
  
  // קריאה סטנדרטית למערכת ההודעות כמו בכל עמוד אחר
  if (typeof window.showSuccessNotification === 'function') {
    window.showSuccessNotification('בדיקת הצלחה', 'זוהי הודעת הצלחה לבדיקה - הכל עובד תקין!', 4000);
  } else {
    window.Logger?.error('❌ showSuccessNotification לא זמין');
  }
}

function testErrorNotification() {
  window.Logger?.debug('🧪 Testing error notification...');
  
  // קריאה סטנדרטית למערכת ההודעות כמו בכל עמוד אחר
  if (typeof window.showErrorNotification === 'function') {
    window.showErrorNotification('בדיקת שגיאה', 'זוהי הודעת שגיאה לבדיקה - הכל עובד תקין!', 6000);
  } else {
    window.Logger?.error('❌ showErrorNotification לא זמין');
  }
}

function testWarningNotification() {
  window.Logger?.debug('🧪 Testing warning notification...');
  
  // קריאה סטנדרטית למערכת ההודעות כמו בכל עמוד אחר
  if (typeof window.showWarningNotification === 'function') {
    window.showWarningNotification('בדיקת אזהרה', 'זוהי הודעת אזהרה לבדיקה - הכל עובד תקין!', 5000);
  } else {
    window.Logger?.error('❌ showWarningNotification לא זמין');
  }
}

function testInfoNotification() {
  window.Logger?.debug('🧪 Testing info notification...');
  
  // קריאה סטנדרטית למערכת ההודעות כמו בכל עמוד אחר
  if (typeof window.showInfoNotification === 'function') {
    window.showInfoNotification('בדיקת מידע', 'זוהי הודעת מידע לבדיקה - הכל עובד תקין!', 4000);
  } else {
    window.Logger?.error('❌ showInfoNotification לא זמין');
  }
}

// בדיקת הודעות אישור
function testConfirmationDialog() {
  window.Logger?.debug('🧪 Testing confirmation dialog...');
  window.Logger?.debug('🔍 showConfirmationDialog type:', typeof window.showConfirmationDialog);
  window.Logger?.debug('🔍 showConfirmationDialog function:', window.showConfirmationDialog);
  
  if (typeof window.showConfirmationDialog === 'function') {
    window.Logger?.debug('✅ Calling showConfirmationDialog...');
    try {
      window.showConfirmationDialog(
        'בדיקת אישור',
        'האם אתה בטוח שברצונך לבצע את הפעולה הזו?',
        () => {
          window.Logger?.debug('✅ User confirmed');
          window.showSuccessNotification('אישור', 'המשתמש אישר את הפעולה', 3000, 'system');
        },
        () => {
          window.Logger?.debug('❌ User cancelled');
          window.showInfoNotification('ביטול', 'המשתמש ביטל את הפעולה', 3000, 'system');
        }
      );
      window.Logger?.debug('✅ showConfirmationDialog called successfully');
    } catch (error) {
      window.Logger?.error('❌ Error calling showConfirmationDialog:', error);
    }
  } else {
    window.Logger?.error('❌ showConfirmationDialog לא זמין');
  }
}

// בדיקת מודל פרטים
function testDetailsModal() {
  window.Logger?.debug('🧪 Testing details modal...');
  window.Logger?.debug('🔍 showDetailsModal type:', typeof window.showDetailsModal);
  window.Logger?.debug('🔍 showDetailsModal function:', window.showDetailsModal);
  
  if (typeof window.showDetailsModal === 'function') {
    window.Logger?.debug('✅ Calling showDetailsModal...');
    try {
      const detailsContent = `
        <div class="details-content">
          <h5>פרטי בדיקה</h5>
          <p><strong>זמן:</strong> ${new Date().toLocaleString('he-IL')}</p>
          <p><strong>דף:</strong> ${window.location.pathname}</p>
          <p><strong>משתמש:</strong> בדיקה</p>
          <p><strong>סטטוס:</strong> פעיל</p>
        </div>
      `;
      
      window.showDetailsModal('בדיקת מודל פרטים', detailsContent);
      window.Logger?.debug('✅ showDetailsModal called successfully');
    } catch (error) {
      window.Logger?.error('❌ Error calling showDetailsModal:', error);
    }
  } else {
    window.Logger?.error('❌ showDetailsModal לא זמין');
  }
}

async function copyDetailedLog() {
  try {
    const detailedLog = await generateDetailedLog();
    if (detailedLog) {
      await navigator.clipboard.writeText(detailedLog);
      window.showSuccessNotification('לוג מפורט הועתק ללוח');
    } else {
      window.showWarningNotification('אין לוג להעתקה');
    }
  } catch (err) {
    window.Logger?.error('שגיאה בהעתקה:', err);
    window.showErrorNotification('שגיאה בהעתקת הלוג');
  }
}

async function copyNotificationsToClipboard() {
  try {
    if (typeof window.getGlobalNotifications === 'function') {
      const notifications = await window.getGlobalNotifications();
      if (notifications && notifications.length > 0) {
        let logText = '=== היסטוריית התראות TikTrack ===\n';
        logText += `זמן יצירה: ${new Date().toLocaleString('he-IL')}\n`;
        logText += `סה"כ התראות: ${notifications.length}\n\n`;
        
        notifications.forEach((notification, index) => {
          logText += `${index + 1}. [${notification.type?.toUpperCase() || 'INFO'}] ${notification.title || 'ללא כותרת'}\n`;
          logText += `   הודעה: ${notification.message || 'ללא הודעה'}\n`;
          logText += `   זמן: ${new Date(notification.timestamp).toLocaleString('he-IL')}\n`;
          if (notification.category) {
            logText += `   קטגוריה: ${notification.category}\n`;
          }
          logText += '\n';
        });
        
        await navigator.clipboard.writeText(logText);
        window.showSuccessNotification('היסטוריית התראות הועתקה ללוח');
      } else {
        window.showInfoNotification('אין התראות להעתקה');
      }
    } else {
      window.showErrorNotification('פונקציית איסוף התראות לא זמינה');
    }
  } catch (error) {
    window.Logger?.error('שגיאה בהעתקת התראות:', error);
    window.showErrorNotification('שגיאה בהעתקת התראות');
  }
}

// toggleSection function removed - using global version from ui-utils.js
// Use window.toggleSection('top') instead

// ייצוא פונקציות ל-window scope
window.copyNotificationsToClipboard = copyNotificationsToClipboard;
window.copyFilteredHistoryToClipboard = copyFilteredHistoryToClipboard;
// window. export removed - using global version from system-management.js
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
    window.Logger?.warn('❌ מרכז התראות לא זמין להוספת התראה');
  }
};


// אתחול
// אתחול דרך מערכת האתחול המאוחדת
window.loadNotifications = async function() {
    try {
        window.Logger?.debug('📬 Loading Notifications Center...');
        
        // יצירת מופע מרכז התראות
        window.notificationsCenter = new NotificationsCenter();
        await window.notificationsCenter.init();
        window.Logger?.debug('✅ Notifications Center loaded successfully');
    } catch (error) {
        window.Logger?.error('❌ Error loading Notifications Center:', error);
        // המשך גם אם יש שגיאה
    }
};

// אתחול ישיר (גיבוי) - רק אם המערכת המאוחדת לא עובדת
// הוסר - המערכת המאוחדת מטפלת באתחול
// document.addEventListener('DOMContentLoaded', () => {
//   window.Logger?.debug('🚀 טעינת דף מרכז התראות... (1.0.9 - Fixed + Debug + Settings + Filter + Stats + Layout - Live Removed + Settings Fix + AutoRefresh Fix)');
//
//   // המתן למערכת המאוחדת
//   setTimeout(() => {
//     if (!window.notificationsCenter) {
//       window.Logger?.debug('⚠️ Unified system not available, using direct initialization');
//       window.loadNotifications();
//     }
//     
//     // טעינת נתוני סקירה כללית
//     if (typeof window.loadOverviewData === 'function') {
//       window.loadOverviewData();
//     }
//   }, 2000);

  // בדיקת זמינות פונקציות
  window.Logger?.debug('🔍 בדיקת זמינות פונקציות:');
  window.Logger?.debug('🔍 testSuccessNotification:', typeof testSuccessNotification);
  window.Logger?.debug('🔍 testErrorNotification:', typeof testErrorNotification);
  window.Logger?.debug('🔍 testWarningNotification:', typeof testWarningNotification);
  window.Logger?.debug('🔍 testInfoNotification:', typeof testInfoNotification);
  window.Logger?.debug('🔍 window.testSuccessNotification:', typeof window.testSuccessNotification);
  window.Logger?.debug('🔍 window.testErrorNotification:', typeof window.testErrorNotification);
  window.Logger?.debug('🔍 window.testWarningNotification:', typeof window.testWarningNotification);
  window.Logger?.debug('🔍 window.testInfoNotification:', typeof window.testInfoNotification);

  // Make functions globally available
  window.copyNotificationsToClipboard = copyNotificationsToClipboard;
  // window. = ; // REMOVED: Local function only
  window.testSuccessNotification = testSuccessNotification;
  window.testErrorNotification = testErrorNotification;
  window.testWarningNotification = testWarningNotification;
  window.testInfoNotification = testInfoNotification;
  // window.toggleSection removed - using global version from ui-utils.js
  // window.toggleAllSections export removed - using global version from ui-utils.js
  // window.toggleSection export removed - using global version from ui-utils.js

  window.Logger?.debug('✅ דף מרכז התראות נטען בהצלחה (1.0.9 - Fixed + Debug + Settings + Filter + Stats + Layout - Live Removed + Settings Fix + AutoRefresh Fix)');

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
    
    // סטטיסטיקות התראות אמיתיות מההיסטוריה
    log.push('--- סטטיסטיקות התראות ---');
    if (window.notificationsCenter && window.notificationsCenter.history) {
        const successCount = window.notificationsCenter.history.filter(n => n.type === 'success').length;
        const errorCount = window.notificationsCenter.history.filter(n => n.type === 'error').length;
        const warningCount = window.notificationsCenter.history.filter(n => n.type === 'warning').length;
        const infoCount = window.notificationsCenter.history.filter(n => n.type === 'info').length;
        
        log.push(`הודעות הצלחה: ${successCount}`);
        log.push(`שגיאות: ${errorCount}`);
        log.push(`אזהרות: ${warningCount}`);
        log.push(`הודעות מידע: ${infoCount}`);
    } else {
        log.push('היסטוריית התראות לא זמינה');
    }
    
    log.push('');
    
    // סטטוס חיבור
    log.push('--- סטטוס חיבור ---');
    log.push(`סטטוס מערכת: פעיל`);
    log.push(`WebSocket: מחובר`);
    log.push(`זמן חיבור: ${new Date().toLocaleString('he-IL')}`);
    
    // סקירה כללית
    log.push('--- סקירה כללית ---');
    if (window.notificationsCenter && window.notificationsCenter.history) {
        log.push(`התראות פעילות: ${window.notificationsCenter.history.filter(n => !n.dismissed).length}`);
        log.push(`הודעות חדשות: ${window.notificationsCenter.history.filter(n => !n.read).length}`);
    }
    log.push(`עדכון אחרון: ${new Date().toLocaleString('he-IL')}`);
    log.push(`סטטוס: פעיל`);

    // היסטוריית התראות
    log.push('--- היסטוריית התראות ---');
    if (window.notificationsCenter && window.notificationsCenter.history && window.notificationsCenter.history.length > 0) {
        window.notificationsCenter.history.slice(0, 10).forEach((notification, index) => {
            log.push(`${index + 1}. [${notification.type?.toUpperCase() || 'INFO'}] ${notification.title || 'ללא כותרת'} - ${new Date(notification.timestamp).toLocaleString('he-IL')}`);
        });
    } else {
        log.push('אין היסטוריית התראות');
    }
    
    // פילטרים פעילים
    log.push('--- פילטרים פעילים ---');
    // Use DataCollectionService to get values if available
    let typeFilterValue, pageFilterValue;
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
      typeFilterValue = window.DataCollectionService.getValue('historyFilter', 'text', '') || 'כל ההתראות';
      pageFilterValue = window.DataCollectionService.getValue('pageFilter', 'text', '') || 'כל העמודים';
    } else {
      const typeFilterEl = document.getElementById('historyFilter');
      const pageFilterEl = document.getElementById('pageFilter');
      typeFilterValue = typeFilterEl ? typeFilterEl.value : 'כל ההתראות';
      pageFilterValue = pageFilterEl ? pageFilterEl.value : 'כל העמודים';
    }
    log.push(`פילטר סוג: ${typeFilterValue}`);
    log.push(`פילטר עמוד: ${pageFilterValue}`);
    
    return log.join('\n');
}

/**
 * Copy detailed log to clipboard
 */

// ייצוא לגלובל scope
// window. export removed - using global version from system-management.js

// ===== UNIFIED LOG SYSTEM INTEGRATION =====

/**
 * Activate unified log system
 */
async function activateUnifiedLogSystem() {
    try {
        window.Logger?.debug('🚀 Activating Unified Log System...');
        
        // Show the unified logs section
        const unifiedLogsSection = document.querySelector('[data-section="unified-logs"]');
        if (unifiedLogsSection) {
            unifiedLogsSection.style.display = 'block';
            // Scroll to the section
            unifiedLogsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Initialize the API if not already initialized
        if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
            await window.UnifiedLogAPI.initialize();
        }
        
        // Show notification
        if (window.showNotification) {
            window.showNotification('מערכת הלוגים החדשה הופעלה!', 'success');
        }
        
        window.Logger?.debug('✅ Unified Log System activated successfully');
    } catch (error) {
        window.Logger?.error('❌ Failed to activate Unified Log System:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה בהפעלת מערכת הלוגים החדשה: ' + error.message, 'error');
        }
    }
}

/**
 * Show notification log in new system
 */
async function showNotificationLogNew() {
    try {
        window.Logger?.debug('📊 Showing notification log in new system...');
        
        await window.showNotificationLog('unified-logs-container', {
            displayConfig: 'default',
            autoRefresh: true,
            refreshInterval: 10000
        });
        
        if (window.showNotification) {
            window.showNotification('לוג התראות נטען במערכת החדשה', 'success');
        }
    } catch (error) {
        window.Logger?.error('❌ Failed to show notification log:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה בטעינת לוג התראות: ' + error.message, 'error');
        }
    }
}

/**
 * Show system logs in new system
 */
async function showSystemLogsNew() {
    try {
        window.Logger?.debug('📊 Showing system logs in new system...');
        
        await window.showSystemLogs('unified-logs-container', {
            displayConfig: 'default',
            autoRefresh: false
        });
        
        if (window.showNotification) {
            window.showNotification('לוגים מערכתיים נטענו במערכת החדשה', 'success');
        }
    } catch (error) {
        window.Logger?.error('❌ Failed to show system logs:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה בטעינת לוגים מערכתיים: ' + error.message, 'error');
        }
    }
}

/**
 * Show error reports in new system
 */
async function showErrorReportsNew() {
    try {
        window.Logger?.debug('📊 Showing error reports in new system...');
        
        await window.showErrorReports('unified-logs-container', {
            displayConfig: 'default',
            autoRefresh: false
        });
        
        if (window.showNotification) {
            window.showNotification('דוחות שגיאות נטענו במערכת החדשה', 'success');
        }
    } catch (error) {
        window.Logger?.error('❌ Failed to show error reports:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה בטעינת דוחות שגיאות: ' + error.message, 'error');
        }
    }
}

/**
 * Export all available logs
 */
async function exportAllLogs() {
    try {
        window.Logger?.debug('📊 Exporting all logs...');
        
        // Show export options modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">ייצוא כל הלוגים</h5>
                        <button data-button-type="CLOSE" data-size="large" data-variant="small" data-onclick="data-bs-dismiss='modal'" data-text="" title="סגור מודל" aria-label="סגור"></button>
                    </div>
                    <div class="modal-body">
                        <p>בחר פורמט ייצוא:</p>
                        <div class="d-grid gap-2">
                            <button data-button-type="EXPORT" data-format="csv" data-text="ייצוא CSV" title="ייצוא ל-CSV">
                            </button>
                            <button data-button-type="EXPORT" data-format="json" data-text="ייצוא JSON" title="ייצוא ל-JSON">
                            </button>
                            <button data-button-type="COPY" data-format="clipboard" data-text="העתקה ללוח" title="העתקה ללוח">
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button data-button-type="CANCEL" data-onclick="data-bs-dismiss='modal'" data-text="ביטול" title="ביטול"></button>
                    </div>
                </div>
            </div>
        `;
        
        modal.id = 'exportAllLogsModal';
        document.body.appendChild(modal);
        
        // Show modal via ModalManagerV2 (supports dynamic modals)
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
            try {
                await window.ModalManagerV2.showModal('exportAllLogsModal', 'view');
            } catch (error) {
                // Fallback to Bootstrap if ModalManagerV2 fails - עם backdrop: false וניקוי
                window.Logger?.warn('exportAllLogsModal not available in ModalManagerV2, using Bootstrap fallback', { page: 'notifications-center' });
                if (bootstrap?.Modal) {
                    // ניקוי backdrops לפני פתיחה
                    if (window.ModalManagerV2?._cleanupBootstrapBackdrops) {
                        window.ModalManagerV2._cleanupBootstrapBackdrops();
                    }
                    const bsModal = window.ModalManagerV2?.openModal(modal, { backdrop: false });
                    bsModal.show();
                    // ניקוי backdrops אחרי פתיחה
                    if (window.ModalManagerV2?._cleanupBootstrapBackdrops) {
                        setTimeout(() => {
                            window.ModalManagerV2._cleanupBootstrapBackdrops();
                        }, 50);
                    }
                    // עדכון z-index
                    if (window.ModalZIndexManager?.forceUpdate) {
                        setTimeout(() => {
                            window.ModalZIndexManager.forceUpdate(modal);
                        }, 50);
                    }
                }
            }
        } else {
            // Fallback to Bootstrap modal - עם backdrop: false וניקוי
            if (bootstrap?.Modal) {
                // ניקוי backdrops לפני פתיחה
                if (window.ModalManagerV2?._cleanupBootstrapBackdrops) {
                    window.ModalManagerV2._cleanupBootstrapBackdrops();
                }
                const bsModal = window.ModalManagerV2?.openModal(modal, { backdrop: false });
                bsModal.show();
                // ניקוי backdrops אחרי פתיחה
                if (window.ModalManagerV2?._cleanupBootstrapBackdrops) {
                    setTimeout(() => {
                        window.ModalManagerV2._cleanupBootstrapBackdrops();
                    }, 50);
                }
                // עדכון z-index
                if (window.ModalZIndexManager?.forceUpdate) {
                    setTimeout(() => {
                        window.ModalZIndexManager.forceUpdate(modal);
                    }, 50);
                }
            }
        }
        
        // Export buttons
        const exportBtns = modal.querySelectorAll('.export-btn');
        exportBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const format = btn.dataset.format;
                
                try {
                    // Export notification history as example
                    await window.exportLog('notificationHistory', format);
                    
                    if (window.showNotification) {
                        window.showNotification(`הנתונים יוצאו בהצלחה ב-${format.toUpperCase()}`, 'success');
                    }
                } catch (error) {
                    window.Logger?.error(`❌ Failed to export as ${format}:`, error);
                    if (window.showNotification) {
                        window.showNotification(`שגיאה בייצוא ${format}: ` + error.message, 'error');
                    }
                }
                
                bsModal.hide();
            });
        });
        
        // Cleanup on hide
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
        
    } catch (error) {
        window.Logger?.error('❌ Failed to export all logs:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה בייצוא הלוגים: ' + error.message, 'error');
        }
    }
}

/**
 * Load notification log automatically on page load
 */
async function loadNotificationLog() {
    try {
        window.Logger?.debug('📊 Loading notification log automatically...');
        
        await window.showNotificationLog('notification-log-container', {
            displayConfig: 'default',
            autoRefresh: true,
            refreshInterval: 10000
        });
        
        window.Logger?.debug('✅ Notification log loaded successfully');
    } catch (error) {
        window.Logger?.error('❌ Failed to load notification log:', error);
    }
}

/**
 * Test the new system with sample data
 */
async function testUnifiedLogSystem() {
    try {
        window.Logger?.debug('🧪 Testing Unified Log System...');
        
        // Generate some test notifications
        const testNotifications = [
            { type: 'success', title: 'בדיקה', message: 'התראה חדשה במערכת החדשה' },
            { type: 'info', title: 'מידע', message: 'זהו לוג מידע במערכת החדשה' },
            { type: 'warning', title: 'אזהרה', message: 'זהו לוג אזהרה במערכת החדשה' },
            { type: 'error', title: 'שגיאה', message: 'זהו לוג שגיאה במערכת החדשה' }
        ];
        
        // Show test notifications
        for (const notification of testNotifications) {
            if (window.showNotification) {
                window.showNotification(notification.message, notification.type, notification.title);
            }
            // Wait a bit between notifications
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Wait a moment then show the notification log
        setTimeout(async () => {
            await loadNotificationLog();
        }, 1000);
        
        if (window.showNotification) {
            window.showNotification('בדיקת המערכת החדשה הושלמה!', 'success');
        }
        
    } catch (error) {
        window.Logger?.error('❌ Failed to test Unified Log System:', error);
        if (window.showNotification) {
            window.showNotification('שגיאה בבדיקת המערכת: ' + error.message, 'error');
        }
    }
}

// Export functions to global scope
window.activateUnifiedLogSystem = activateUnifiedLogSystem;
window.showNotificationLogNew = showNotificationLogNew;
window.showSystemLogsNew = showSystemLogsNew;
window.showErrorReportsNew = showErrorReportsNew;
window.exportAllLogs = exportAllLogs;
window.testUnifiedLogSystem = testUnifiedLogSystem;
window.loadNotificationLog = loadNotificationLog;
window.initializeNotificationsCenter = initializeNotificationsCenter;


/**
 * Load category statistics
 */
async function loadCategoryStats() {
  try {
    const container = document.getElementById('categoryStats');
    if (!container) return;

    // Get statistics from the notification system
    let stats = { success: 0, error: 0, warning: 0, info: 0, total: 0 };
    
    if (window.notificationsCenter && window.notificationsCenter.stats) {
      stats = window.notificationsCenter.stats;
    }

    const categories = [
      { name: 'success', title: 'הצלחה', icon: 'check-circle', color: 'var(--color-success, #28a745)' },
      { name: 'error', title: 'שגיאה', icon: 'alert-circle', color: 'var(--color-danger, #dc3545)' },
      { name: 'warning', title: 'אזהרה', icon: 'alert-triangle', color: 'var(--color-warning, #ffc107)' },
      { name: 'info', title: 'מידע', icon: 'info-circle', color: 'var(--color-info, #17a2b8)' }
    ];

    let html = '<div class="row">';
    for (const category of categories) {
      const count = stats[category.name] || 0;
      const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
      
      // Render icon using IconSystem
      let categoryIconHTML = `<img src="/trading-ui/images/icons/tabler/${category.icon}.svg" width="32" height="32" alt="${category.icon}" class="icon mb-2" style="color: ${category.color};">`;
      if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
        try {
          categoryIconHTML = await window.IconSystem.renderIcon('button', category.icon, {
            size: '32',
            alt: category.icon,
            class: 'icon mb-2',
            style: `color: ${category.color};`
          });
        } catch (error) {
          // Fallback already set
        }
      }
      
      html += `
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="stat-card text-center p-3 border rounded">
            ${categoryIconHTML}
            <h4 class="mb-1" style="color: ${category.color};">${count.toLocaleString()}</h4>
            <p class="mb-1 text-muted">${category.title}</p>
            <small class="text-muted">${percentage}% מהסך הכל</small>
          </div>
        </div>
      `;
    }
    html += '</div>';

    container.innerHTML = html;
    window.Logger?.debug('✅ Categories overview loaded with statistics');
  } catch (error) {
    window.Logger?.error('❌ Error loading categories overview:', error);
  }
}

// Functions moved to top of file for early access

window.Logger?.debug('📊 Unified Log System integration loaded successfully');
