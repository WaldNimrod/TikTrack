/**
 * Global Notification Collector - TikTrack
 * =======================================
 * 
 * מערכת איסוף התראות גלובלית מכל העמודים
 * 
 * @version 1.0.0
 * @lastUpdated September 20, 2025
 * @author TikTrack Development Team
 */

// ===== GLOBAL NOTIFICATION COLLECTOR =====

/**
 * Global Notification Collector Class
 * אוסף התראות מכל העמודים במערכת
 */
class GlobalNotificationCollector {
  constructor() {
    this.pageName = this.getCurrentPageName();
    this.isInitialized = false;
    this.collectionInterval = null;
    this.lastCollectionTime = null;
    
    this.init();
  }

  /**
   * Get current page name from URL
   * קבלת שם העמוד הנוכחי מה-URL
   */
  getCurrentPageName() {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') return 'home';
    if (path.startsWith('/')) return path.substring(1);
    return path.replace('.html', '');
  }

  /**
   * Initialize the collector
   * אתחול האוסף
   */
  init() {
    console.log(`🔔 Global Notification Collector initialized for page: ${this.pageName}`);
    
    // Start collecting notifications
    this.startCollection();
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.startCollection();
      } else {
        this.stopCollection();
      }
    });

    // Listen for page unload to collect final notifications
    window.addEventListener('beforeunload', () => {
      this.collectNotifications(true); // Final collection
    });

    this.isInitialized = true;
  }

  /**
   * Start collecting notifications
   * התחלת איסוף התראות
   */
  startCollection() {
    if (this.collectionInterval) return; // Already running
    
    // Collect immediately
    this.collectNotifications();
    
    // Set up periodic collection every 10 seconds
    this.collectionInterval = setInterval(() => {
      this.collectNotifications();
    }, 10000);

    console.log(`✅ Started collecting notifications for ${this.pageName}`);
  }

  /**
   * Stop collecting notifications
   * עצירת איסוף התראות
   */
  stopCollection() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    console.log(`⏹️ Stopped collecting notifications for ${this.pageName}`);
  }

  /**
   * Collect notifications from the current page
   * איסוף התראות מהעמוד הנוכחי
   */
  async collectNotifications(isFinal = false) {
    try {
      const notifications = [];
      const currentTime = Date.now();

      // Collect from console logs (errors, warnings, info)
      notifications.push(...this.collectConsoleNotifications());

      // Collect from DOM elements that might contain notifications
      notifications.push(...this.collectDOMNotifications());

      // Collect from any notification containers on the page
      notifications.push(...this.collectNotificationContainerNotifications());

      // Collect from any alert/notification elements
      notifications.push(...this.collectAlertNotifications());

      // Filter out duplicate notifications
      const uniqueNotifications = this.filterDuplicateNotifications(notifications);

      // Save to global notification history
      if (uniqueNotifications.length > 0) {
        await this.saveNotificationsToGlobalHistory(uniqueNotifications);
        
        if (isFinal) {
          console.log(`🔔 Final collection for ${this.pageName}: ${uniqueNotifications.length} notifications`);
        }
      }

      this.lastCollectionTime = currentTime;

    } catch (error) {
      console.error(`❌ Error collecting notifications from ${this.pageName}:`, error);
    }
  }

  /**
   * Collect notifications from console logs
   * איסוף התראות מלוגים של הקונסול
   */
  collectConsoleNotifications() {
    const notifications = [];
    
    // This would require intercepting console methods
    // For now, we'll focus on other collection methods
    // In a full implementation, we'd override console.error, console.warn, etc.
    
    return notifications;
  }

  /**
   * Collect notifications from DOM elements
   * איסוף התראות מאלמנטים ב-DOM
   */
  collectDOMNotifications() {
    const notifications = [];
    
    // Look for error messages in forms
    const errorElements = document.querySelectorAll('.error, .alert-danger, .invalid-feedback, [class*="error"]');
    errorElements.forEach(element => {
      if (element.textContent.trim()) {
        notifications.push({
          type: 'error',
          title: 'שגיאה בעמוד',
          message: element.textContent.trim(),
          source: 'dom',
          page: this.pageName,
          timestamp: Date.now()
        });
      }
    });

    // Look for success messages
    const successElements = document.querySelectorAll('.success, .alert-success, .valid-feedback, [class*="success"]');
    successElements.forEach(element => {
      if (element.textContent.trim()) {
        notifications.push({
          type: 'success',
          title: 'הצלחה בעמוד',
          message: element.textContent.trim(),
          source: 'dom',
          page: this.pageName,
          timestamp: Date.now()
        });
      }
    });

    // Look for warning messages
    const warningElements = document.querySelectorAll('.warning, .alert-warning, [class*="warning"]');
    warningElements.forEach(element => {
      if (element.textContent.trim()) {
        notifications.push({
          type: 'warning',
          title: 'אזהרה בעמוד',
          message: element.textContent.trim(),
          source: 'dom',
          page: this.pageName,
          timestamp: Date.now()
        });
      }
    });

    return notifications;
  }

  /**
   * Collect notifications from notification containers
   * איסוף התראות מקונטיינרים של התראות
   */
  collectNotificationContainerNotifications() {
    const notifications = [];
    
    // Look for notification containers
    const containers = document.querySelectorAll('.notification-container, .alert-container, .toast-container');
    
    containers.forEach(container => {
      const notificationElements = container.querySelectorAll('.notification, .alert, .toast');
      
      notificationElements.forEach(element => {
        const type = this.getElementType(element);
        const title = this.getElementTitle(element);
        const message = this.getElementMessage(element);
        
        if (message) {
          notifications.push({
            type,
            title,
            message,
            source: 'notification_container',
            page: this.pageName,
            timestamp: Date.now()
          });
        }
      });
    });

    return notifications;
  }

  /**
   * Collect notifications from alert elements
   * איסוף התראות מאלמנטי התראות
   */
  collectAlertNotifications() {
    const notifications = [];
    
    // Look for alert elements
    const alertElements = document.querySelectorAll('.alert, [role="alert"], .notification');
    
    alertElements.forEach(element => {
      const type = this.getElementType(element);
      const title = this.getElementTitle(element);
      const message = this.getElementMessage(element);
      
      if (message) {
        notifications.push({
          type,
          title,
          message,
          source: 'alert',
          page: this.pageName,
          timestamp: Date.now()
        });
      }
    });

    return notifications;
  }

  /**
   * Get element type from class names
   * קבלת סוג האלמנט משמות הקלאסים
   */
  getElementType(element) {
    const className = element.className.toLowerCase();
    
    if (className.includes('error') || className.includes('danger')) return 'error';
    if (className.includes('success')) return 'success';
    if (className.includes('warning')) return 'warning';
    if (className.includes('info')) return 'info';
    
    return 'info'; // default
  }

  /**
   * Get element title
   * קבלת כותרת האלמנט
   */
  getElementTitle(element) {
    const titleElement = element.querySelector('.title, .notification-title, .alert-title, h1, h2, h3, h4, h5, h6');
    return titleElement ? titleElement.textContent.trim() : 'הודעה';
  }

  /**
   * Get element message
   * קבלת הודעת האלמנט
   */
  getElementMessage(element) {
    const messageElement = element.querySelector('.message, .notification-message, .alert-message, .content');
    
    if (messageElement) {
      return messageElement.textContent.trim();
    }
    
    // If no specific message element, use the entire element text
    return element.textContent.trim();
  }

  /**
   * Filter duplicate notifications
   * סינון התראות כפולות
   */
  filterDuplicateNotifications(notifications) {
    const seen = new Set();
    return notifications.filter(notification => {
      const key = `${notification.type}-${notification.message}-${notification.page}-${Math.floor(notification.timestamp / 10000)}`; // 10 second window
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Save notifications to global history
   * שמירת התראות להיסטוריה גלובלית
   */
  async saveNotificationsToGlobalHistory(notifications) {
    try {
      // Use the global notification system if available
      if (typeof window.saveNotificationToGlobalHistory === 'function') {
        notifications.forEach(notification => {
          window.saveNotificationToGlobalHistory(
            notification.type,
            notification.title,
            notification.message
          );
        });
      } else {
        // Fallback: save to localStorage directly
        this.saveToLocalStorage(notifications);
      }
    } catch (error) {
      console.error('❌ Error saving notifications to global history:', error);
    }
  }

  /**
   * Save notifications to localStorage (fallback)
   * שמירת התראות ל-localStorage (גיבוי)
   */
  saveToLocalStorage(notifications) {
    try {
      const existingHistory = JSON.parse(localStorage.getItem('tiktrack_global_notifications_history') || '[]');
      
      notifications.forEach(notification => {
        const globalNotification = {
          id: Date.now() + Math.random(),
          type: notification.type,
          title: notification.title,
          message: notification.message,
          time: new Date(),
          timestamp: Date.now(),
          page: notification.page,
          url: window.location.href
        };
        
        existingHistory.unshift(globalNotification);
      });

      // Keep only last 1000 notifications
      const trimmedHistory = existingHistory.slice(0, 1000);
      
      localStorage.setItem('tiktrack_global_notifications_history', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
  }

  /**
   * Get collection statistics
   * קבלת סטטיסטיקות איסוף
   */
  getStats() {
    return {
      pageName: this.pageName,
      isInitialized: this.isInitialized,
      isCollecting: !!this.collectionInterval,
      lastCollectionTime: this.lastCollectionTime,
      collectionInterval: this.collectionInterval ? 10000 : null
    };
  }
}

// ===== AUTO-INITIALIZATION =====

// Initialize the collector when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if not already initialized
  if (!window.globalNotificationCollector) {
    window.globalNotificationCollector = new GlobalNotificationCollector();
    console.log('🚀 Global Notification Collector auto-initialized');
  }
});

// Also initialize if DOMContentLoaded already fired
if (document.readyState === 'loading') {
  // DOM is still loading, wait for DOMContentLoaded
} else {
  // DOM already loaded, initialize immediately
  if (!window.globalNotificationCollector) {
    window.globalNotificationCollector = new GlobalNotificationCollector();
    console.log('🚀 Global Notification Collector auto-initialized (DOM already loaded)');
  }
}

// ===== GLOBAL FUNCTIONS =====

/**
 * Add a notification to the global notification system
 * הוספת התראה למערכת ההתראות הגלובלית
 * 
 * @param {string} type - Type of notification (error, success, warning, info)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 */
function addGlobalNotification(type, title, message, options = {}) {
  try {
    console.log(`🔔 Adding global notification: ${type} - ${title}`);
    
    // Create notification object
    const notification = {
      id: Date.now() + Math.random(),
      type: type || 'info',
      title: title || 'הודעה',
      message: message || '',
      timestamp: Date.now(),
      time: new Date(),
      page: window.location.pathname.replace('.html', '').replace('/', '') || 'home',
      url: window.location.href,
      ...options
    };
    
    // Add to global history
    const existingHistory = JSON.parse(localStorage.getItem('tiktrack_global_notifications_history') || '[]');
    existingHistory.unshift(notification);
    
    // Keep only last 1000 notifications
    const trimmedHistory = existingHistory.slice(0, 1000);
    localStorage.setItem('tiktrack_global_notifications_history', JSON.stringify(trimmedHistory));
    
    // Show notification if system is available
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, type, { title });
    }
    
    console.log(`✅ Global notification added: ${notification.id}`);
    return notification.id;
    
  } catch (error) {
    console.error('❌ Error adding global notification:', error);
    return null;
  }
}

/**
 * Get all global notifications
 * קבלת כל ההתראות הגלובליות
 * 
 * @param {Object} filters - Filter options
 * @returns {Array} Array of notifications
 */
function getGlobalNotifications(filters = {}) {
  try {
    console.log('🔍 Getting global notifications with filters:', filters);
    
    const existingHistory = JSON.parse(localStorage.getItem('tiktrack_global_notifications_history') || '[]');
    
    let filteredNotifications = [...existingHistory];
    
    // Apply filters
    if (filters.type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
    }
    
    if (filters.page) {
      filteredNotifications = filteredNotifications.filter(n => n.page === filters.page);
    }
    
    if (filters.since) {
      const sinceTime = new Date(filters.since).getTime();
      filteredNotifications = filteredNotifications.filter(n => n.timestamp >= sinceTime);
    }
    
    if (filters.limit) {
      filteredNotifications = filteredNotifications.slice(0, filters.limit);
    }
    
    console.log(`✅ Retrieved ${filteredNotifications.length} global notifications`);
    return filteredNotifications;
    
  } catch (error) {
    console.error('❌ Error getting global notifications:', error);
    return [];
  }
}

/**
 * Clear global notifications
 * ניקוי התראות גלובליות
 * 
 * @param {Object} filters - Clear options
 */
function clearGlobalNotifications(filters = {}) {
  try {
    console.log('🧹 Clearing global notifications with filters:', filters);
    
    if (filters.all) {
      // Clear all notifications
      localStorage.removeItem('tiktrack_global_notifications_history');
      console.log('✅ All global notifications cleared');
      return;
    }
    
    // Get existing notifications
    const existingHistory = JSON.parse(localStorage.getItem('tiktrack_global_notifications_history') || '[]');
    
    let filteredNotifications = [...existingHistory];
    
    // Apply filters for selective clearing
    if (filters.type) {
      filteredNotifications = filteredNotifications.filter(n => n.type !== filters.type);
    }
    
    if (filters.page) {
      filteredNotifications = filteredNotifications.filter(n => n.page !== filters.page);
    }
    
    if (filters.before) {
      const beforeTime = new Date(filters.before).getTime();
      filteredNotifications = filteredNotifications.filter(n => n.timestamp >= beforeTime);
    }
    
    if (filters.keepLast) {
      // Keep only the last N notifications
      filteredNotifications = filteredNotifications.slice(0, filters.keepLast);
    }
    
    // Save filtered notifications back
    localStorage.setItem('tiktrack_global_notifications_history', JSON.stringify(filteredNotifications));
    
    const clearedCount = existingHistory.length - filteredNotifications.length;
    console.log(`✅ Cleared ${clearedCount} global notifications`);
    
  } catch (error) {
    console.error('❌ Error clearing global notifications:', error);
  }
}

// ===== EXPORT =====

// Export for global access
window.GlobalNotificationCollector = GlobalNotificationCollector;
window.addGlobalNotification = addGlobalNotification;
window.getGlobalNotifications = getGlobalNotifications;
window.clearGlobalNotifications = clearGlobalNotifications;
