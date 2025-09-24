/**
 * Event Service - Header System
 * שירות אירועים מרכזי למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class EventService {
  constructor() {
    this.listeners = new Map();
    this.globalListeners = new Map();
    this.eventQueue = [];
    this.isProcessing = false;
    this.config = HEADER_CONFIG.ERROR_HANDLING;
    
    // הגדרת לוגים
    this.setupLogging();
  }

  /**
   * הגדרת מערכת לוגים
   */
  setupLogging() {
    this.log = {
      debug: (...args) => {
        if (HEADER_CONFIG.LOGGING.LEVEL === 'debug' && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('🔍 [EventService]', ...args);
        }
      },
      info: (...args) => {
        if (['debug', 'info'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('ℹ️ [EventService]', ...args);
        }
      },
      warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.warn('⚠️ [EventService]', ...args);
        }
      },
      error: (...args) => {
        if (HEADER_CONFIG.LOGGING.CONSOLE) {
          console.error('❌ [EventService]', ...args);
        }
      }
    };
  }

  /**
   * רישום מאזין אירוע
   * @param {string} eventType - סוג האירוע
   * @param {Function} handler - פונקציית הטיפול
   * @param {Object} options - אפשרויות נוספות
   * @returns {string} - מזהה המאזין
   */
  on(eventType, handler, options = {}) {
    try {
      if (!eventType || typeof handler !== 'function') {
        this.log.warn('EventService.on: Invalid parameters');
        return null;
      }

      const listenerId = this.generateListenerId();
      const listener = {
        id: listenerId,
        eventType,
        handler,
        options: {
          once: false,
          priority: 0,
          context: null,
          ...options
        },
        addedAt: Date.now()
      };

      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, []);
      }

      this.listeners.get(eventType).push(listener);
      
      // מיון לפי עדיפות
      this.sortListenersByPriority(eventType);
      
      this.log.debug(`מאזין נוסף לאירוע ${eventType}:`, listenerId);
      return listenerId;
      
    } catch (error) {
      this.log.error('EventService.on error:', error);
      return null;
    }
  }

  /**
   * רישום מאזין חד-פעמי
   * @param {string} eventType - סוג האירוע
   * @param {Function} handler - פונקציית הטיפול
   * @param {Object} options - אפשרויות נוספות
   * @returns {string} - מזהה המאזין
   */
  once(eventType, handler, options = {}) {
    return this.on(eventType, handler, { ...options, once: true });
  }

  /**
   * ביטול רישום מאזין
   * @param {string} eventType - סוג האירוע
   * @param {string|Function} identifier - מזהה המאזין או הפונקציה
   */
  off(eventType, identifier) {
    try {
      if (!this.listeners.has(eventType)) return;

      const listeners = this.listeners.get(eventType);
      const index = listeners.findIndex(listener => {
        if (typeof identifier === 'string') {
          return listener.id === identifier;
        } else if (typeof identifier === 'function') {
          return listener.handler === identifier;
        }
        return false;
      });

      if (index > -1) {
        listeners.splice(index, 1);
        this.log.debug(`מאזין הוסר מאירוע ${eventType}`);
      }
      
    } catch (error) {
      this.log.error('EventService.off error:', error);
    }
  }

  /**
   * שליחת אירוע
   * @param {string} eventType - סוג האירוע
   * @param {*} data - נתוני האירוע
   * @param {Object} options - אפשרויות נוספות
   * @returns {boolean} - האם האירוע נשלח בהצלחה
   */
  emit(eventType, data = {}, options = {}) {
    try {
      if (!eventType) {
        this.log.warn('EventService.emit: Event type is required');
        return false;
      }

      const event = {
        type: eventType,
        data,
        timestamp: Date.now(),
        options: {
          bubbles: true,
          cancelable: true,
          ...options
        },
        defaultPrevented: false,
        propagationStopped: false
      };

      // הוספה לתור האירועים
      this.eventQueue.push(event);
      
      // עיבוד האירועים אם לא בתהליך
      if (!this.isProcessing) {
        this.processEventQueue();
      }

      return true;
      
    } catch (error) {
      this.log.error('EventService.emit error:', error);
      return false;
    }
  }

  /**
   * עיבוד תור האירועים
   */
  async processEventQueue() {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        await this.processEvent(event);
      }
    } catch (error) {
      this.log.error('EventService.processEventQueue error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * עיבוד אירוע יחיד
   * @param {Object} event - האירוע
   */
  async processEvent(event) {
    try {
      this.log.debug(`מעבד אירוע: ${event.type}`, event.data);

      // שליחה למאזינים מקומיים
      if (this.listeners.has(event.type)) {
        const listeners = [...this.listeners.get(event.type)]; // עותק כדי למנוע שינויים במהלך העיבוד
        
        for (const listener of listeners) {
          if (event.propagationStopped) break;
          
          try {
            // בדיקת תנאים
            if (this.shouldProcessListener(listener, event)) {
              await this.executeListener(listener, event);
              
              // הסרה אם חד-פעמי
              if (listener.options.once) {
                this.off(event.type, listener.id);
              }
            }
          } catch (listenerError) {
            this.log.error(`שגיאה במאזין ${listener.id}:`, listenerError);
            
            if (this.config.SHOW_ERRORS) {
              this.emit(HEADER_EVENTS.SYSTEM_ERROR, {
                error: listenerError,
                listener: listener,
                event: event
              });
            }
          }
        }
      }

      // שליחה למאזינים גלובליים
      if (this.globalListeners.has(event.type)) {
        const globalListeners = [...this.globalListeners.get(event.type)];
        
        for (const listener of globalListeners) {
          if (event.propagationStopped) break;
          
          try {
            if (this.shouldProcessListener(listener, event)) {
              await this.executeListener(listener, event);
              
              if (listener.options.once) {
                this.offGlobal(event.type, listener.id);
              }
            }
          } catch (listenerError) {
            this.log.error(`שגיאה במאזין גלובלי ${listener.id}:`, listenerError);
          }
        }
      }

      // שליחה לאירועים גלובליים של הדפדפן
      if (event.options.bubbles) {
        EventUtils.dispatchGlobalEvent(event.type, event.data, event.options);
      }
      
    } catch (error) {
      this.log.error('EventService.processEvent error:', error);
    }
  }

  /**
   * בדיקת תנאים לעיבוד מאזין
   * @param {Object} listener - המאזין
   * @param {Object} event - האירוע
   * @returns {boolean} - האם לעבד את המאזין
   */
  shouldProcessListener(listener, event) {
    try {
      // בדיקת הקשר
      if (listener.options.context && !listener.options.context.isActive) {
        return false;
      }

      // בדיקת תנאים נוספים
      if (listener.options.condition && !listener.options.condition(event)) {
        return false;
      }

      return true;
      
    } catch (error) {
      this.log.error('EventService.shouldProcessListener error:', error);
      return false;
    }
  }

  /**
   * ביצוע מאזין
   * @param {Object} listener - המאזין
   * @param {Object} event - האירוע
   */
  async executeListener(listener, event) {
    try {
      const context = listener.options.context || this;
      const result = await listener.handler.call(context, event);
      
      // בדיקת מניעת התנהגות ברירת מחדל
      if (result === false) {
        event.defaultPrevented = true;
      }
      
    } catch (error) {
      this.log.error('EventService.executeListener error:', error);
      throw error;
    }
  }

  /**
   * רישום מאזין גלובלי
   * @param {string} eventType - סוג האירוע
   * @param {Function} handler - פונקציית הטיפול
   * @param {Object} options - אפשרויות נוספות
   * @returns {string} - מזהה המאזין
   */
  onGlobal(eventType, handler, options = {}) {
    try {
      if (!eventType || typeof handler !== 'function') {
        this.log.warn('EventService.onGlobal: Invalid parameters');
        return null;
      }

      const listenerId = this.generateListenerId();
      const listener = {
        id: listenerId,
        eventType,
        handler,
        options: {
          once: false,
          priority: 0,
          context: null,
          ...options
        },
        addedAt: Date.now()
      };

      if (!this.globalListeners.has(eventType)) {
        this.globalListeners.set(eventType, []);
      }

      this.globalListeners.get(eventType).push(listener);
      this.sortGlobalListenersByPriority(eventType);
      
      this.log.debug(`מאזין גלובלי נוסף לאירוע ${eventType}:`, listenerId);
      return listenerId;
      
    } catch (error) {
      this.log.error('EventService.onGlobal error:', error);
      return null;
    }
  }

  /**
   * ביטול רישום מאזין גלובלי
   * @param {string} eventType - סוג האירוע
   * @param {string|Function} identifier - מזהה המאזין או הפונקציה
   */
  offGlobal(eventType, identifier) {
    try {
      if (!this.globalListeners.has(eventType)) return;

      const listeners = this.globalListeners.get(eventType);
      const index = listeners.findIndex(listener => {
        if (typeof identifier === 'string') {
          return listener.id === identifier;
        } else if (typeof identifier === 'function') {
          return listener.handler === identifier;
        }
        return false;
      });

      if (index > -1) {
        listeners.splice(index, 1);
        this.log.debug(`מאזין גלובלי הוסר מאירוע ${eventType}`);
      }
      
    } catch (error) {
      this.log.error('EventService.offGlobal error:', error);
    }
  }

  /**
   * מיון מאזינים לפי עדיפות
   * @param {string} eventType - סוג האירוע
   */
  sortListenersByPriority(eventType) {
    if (!this.listeners.has(eventType)) return;
    
    this.listeners.get(eventType).sort((a, b) => {
      return b.options.priority - a.options.priority;
    });
  }

  /**
   * מיון מאזינים גלובליים לפי עדיפות
   * @param {string} eventType - סוג האירוע
   */
  sortGlobalListenersByPriority(eventType) {
    if (!this.globalListeners.has(eventType)) return;
    
    this.globalListeners.get(eventType).sort((a, b) => {
      return b.options.priority - a.options.priority;
    });
  }

  /**
   * יצירת מזהה מאזין ייחודי
   * @returns {string} - מזהה ייחודי
   */
  generateListenerId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * קבלת מידע על מאזינים
   * @param {string} eventType - סוג האירוע (אופציונלי)
   * @returns {Object} - מידע על המאזינים
   */
  getListenersInfo(eventType = null) {
    try {
      const info = {
        total: 0,
        byEvent: {},
        global: {
          total: 0,
          byEvent: {}
        }
      };

      // מאזינים מקומיים
      if (eventType) {
        if (this.listeners.has(eventType)) {
          info.byEvent[eventType] = this.listeners.get(eventType).length;
          info.total += this.listeners.get(eventType).length;
        }
      } else {
        this.listeners.forEach((listeners, type) => {
          info.byEvent[type] = listeners.length;
          info.total += listeners.length;
        });
      }

      // מאזינים גלובליים
      if (eventType) {
        if (this.globalListeners.has(eventType)) {
          info.global.byEvent[eventType] = this.globalListeners.get(eventType).length;
          info.global.total += this.globalListeners.get(eventType).length;
        }
      } else {
        this.globalListeners.forEach((listeners, type) => {
          info.global.byEvent[type] = listeners.length;
          info.global.total += listeners.length;
        });
      }

      return info;
      
    } catch (error) {
      this.log.error('EventService.getListenersInfo error:', error);
      return { total: 0, byEvent: {}, global: { total: 0, byEvent: {} } };
    }
  }

  /**
   * ניקוי כל המאזינים
   * @param {string} eventType - סוג האירוע (אופציונלי)
   */
  clearListeners(eventType = null) {
    try {
      if (eventType) {
        this.listeners.delete(eventType);
        this.globalListeners.delete(eventType);
        this.log.debug(`מאזינים נוקו עבור אירוע: ${eventType}`);
      } else {
        this.listeners.clear();
        this.globalListeners.clear();
        this.log.debug('כל המאזינים נוקו');
      }
    } catch (error) {
      this.log.error('EventService.clearListeners error:', error);
    }
  }

  /**
   * הרס השירות
   */
  destroy() {
    try {
      this.log.info('משמיד EventService...');
      
      // ניקוי מאזינים
      this.clearListeners();
      
      // ניקוי תור אירועים
      this.eventQueue = [];
      this.isProcessing = false;
      
      this.log.info('EventService הושמד');
      
    } catch (error) {
      this.log.error('EventService.destroy error:', error);
    }
  }

  /**
   * קבלת מידע על השירות
   * @returns {Object} - מידע על השירות
   */
  getInfo() {
    return {
      listeners: this.getListenersInfo(),
      queueLength: this.eventQueue.length,
      isProcessing: this.isProcessing,
      config: this.config
    };
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventService;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.EventService = EventService;
}

console.log('✅ EventService נוצר ופועל');
