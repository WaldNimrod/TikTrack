/**
 * Event Utilities - Header System
 * כלי עזר לעבודה עם אירועים
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class EventUtils {
  /**
   * הוספת מאזין אירוע
   * @param {Element} element - האלמנט
   * @param {string} eventType - סוג האירוע
   * @param {Function} handler - פונקציית הטיפול
   * @param {Object} options - אפשרויות נוספות
   */
  static addListener(element, eventType, handler, options = {}) {
    try {
      if (!element || !eventType || typeof handler !== 'function') {
        console.warn('⚠️ EventUtils.addListener: Invalid parameters');
        return;
      }

      element.addEventListener(eventType, handler, options);
      
      // שמירת המאזין למטרות הסרה
      if (!element._eventListeners) {
        element._eventListeners = new Map();
      }
      
      if (!element._eventListeners.has(eventType)) {
        element._eventListeners.set(eventType, []);
      }
      
      element._eventListeners.get(eventType).push({ handler, options });
      
    } catch (error) {
      console.error('❌ EventUtils.addListener error:', error);
    }
  }

  /**
   * הסרת מאזין אירוע
   * @param {Element} element - האלמנט
   * @param {string} eventType - סוג האירוע
   * @param {Function} handler - פונקציית הטיפול
   */
  static removeListener(element, eventType, handler) {
    try {
      if (!element || !eventType) return;

      element.removeEventListener(eventType, handler);
      
      // הסרה מהרשימה הפנימית
      if (element._eventListeners && element._eventListeners.has(eventType)) {
        const listeners = element._eventListeners.get(eventType);
        const index = listeners.findIndex(listener => listener.handler === handler);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
      
    } catch (error) {
      console.error('❌ EventUtils.removeListener error:', error);
    }
  }

  /**
   * הסרת כל המאזינים מאלמנט
   * @param {Element} element - האלמנט
   * @param {string} eventType - סוג האירוע (אופציונלי)
   */
  static removeAllListeners(element, eventType = null) {
    try {
      if (!element || !element._eventListeners) return;

      if (eventType) {
        // הסרת מאזינים מסוג מסוים
        if (element._eventListeners.has(eventType)) {
          const listeners = element._eventListeners.get(eventType);
          listeners.forEach(({ handler, options }) => {
            element.removeEventListener(eventType, handler, options);
          });
          element._eventListeners.delete(eventType);
        }
      } else {
        // הסרת כל המאזינים
        element._eventListeners.forEach((listeners, type) => {
          listeners.forEach(({ handler, options }) => {
            element.removeEventListener(type, handler, options);
          });
        });
        element._eventListeners.clear();
      }
      
    } catch (error) {
      console.error('❌ EventUtils.removeAllListeners error:', error);
    }
  }

  /**
   * יצירת אירוע מותאם אישית
   * @param {string} eventType - סוג האירוע
   * @param {Object} detail - פרטים נוספים
   * @param {Object} options - אפשרויות האירוע
   * @returns {CustomEvent} - האירוע המותאם
   */
  static createCustomEvent(eventType, detail = {}, options = {}) {
    try {
      const defaultOptions = {
        bubbles: true,
        cancelable: true,
        detail: detail
      };
      
      const eventOptions = { ...defaultOptions, ...options };
      return new CustomEvent(eventType, eventOptions);
      
    } catch (error) {
      console.error('❌ EventUtils.createCustomEvent error:', error);
      return null;
    }
  }

  /**
   * שליחת אירוע מותאם אישית
   * @param {Element} element - האלמנט
   * @param {string} eventType - סוג האירוע
   * @param {Object} detail - פרטים נוספים
   * @param {Object} options - אפשרויות האירוע
   * @returns {boolean} - האם האירוע נשלח בהצלחה
   */
  static dispatchCustomEvent(element, eventType, detail = {}, options = {}) {
    try {
      if (!element) return false;

      const event = this.createCustomEvent(eventType, detail, options);
      if (!event) return false;

      return element.dispatchEvent(event);
      
    } catch (error) {
      console.error('❌ EventUtils.dispatchCustomEvent error:', error);
      return false;
    }
  }

  /**
   * שליחת אירוע גלובלי
   * @param {string} eventType - סוג האירוע
   * @param {Object} detail - פרטים נוספים
   * @param {Object} options - אפשרויות האירוע
   * @returns {boolean} - האם האירוע נשלח בהצלחה
   */
  static dispatchGlobalEvent(eventType, detail = {}, options = {}) {
    try {
      return this.dispatchCustomEvent(window, eventType, detail, options);
    } catch (error) {
      console.error('❌ EventUtils.dispatchGlobalEvent error:', error);
      return false;
    }
  }

  /**
   * הוספת מאזין חד-פעמי
   * @param {Element} element - האלמנט
   * @param {string} eventType - סוג האירוע
   * @param {Function} handler - פונקציית הטיפול
   * @param {Object} options - אפשרויות נוספות
   */
  static addOnceListener(element, eventType, handler, options = {}) {
    try {
      if (!element || !eventType || typeof handler !== 'function') return;

      const onceHandler = (event) => {
        handler(event);
        this.removeListener(element, eventType, onceHandler);
      };

      this.addListener(element, eventType, onceHandler, options);
      
    } catch (error) {
      console.error('❌ EventUtils.addOnceListener error:', error);
    }
  }

  /**
   * הוספת מאזין עם debounce
   * @param {Element} element - האלמנט
   * @param {string} eventType - סוג האירוע
   * @param {Function} handler - פונקציית הטיפול
   * @param {number} delay - עיכוב במילישניות
   * @param {Object} options - אפשרויות נוספות
   */
  static addDebouncedListener(element, eventType, handler, delay = 300, options = {}) {
    try {
      if (!element || !eventType || typeof handler !== 'function') return;

      let timeoutId = null;
      
      const debouncedHandler = (event) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handler(event);
        }, delay);
      };

      this.addListener(element, eventType, debouncedHandler, options);
      
    } catch (error) {
      console.error('❌ EventUtils.addDebouncedListener error:', error);
    }
  }

  /**
   * הוספת מאזין עם throttle
   * @param {Element} element - האלמנט
   * @param {string} eventType - סוג האירוע
   * @param {Function} handler - פונקציית הטיפול
   * @param {number} delay - עיכוב במילישניות
   * @param {Object} options - אפשרויות נוספות
   */
  static addThrottledListener(element, eventType, handler, delay = 300, options = {}) {
    try {
      if (!element || !eventType || typeof handler !== 'function') return;

      let lastCall = 0;
      
      const throttledHandler = (event) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          handler(event);
        }
      };

      this.addListener(element, eventType, throttledHandler, options);
      
    } catch (error) {
      console.error('❌ EventUtils.addThrottledListener error:', error);
    }
  }

  /**
   * ניהול טיימרים
   */
  static Timer = class {
    constructor() {
      this.timers = new Map();
    }

    /**
     * יצירת טיימר
     * @param {string} id - מזהה הטיימר
     * @param {Function} callback - פונקציית הקריאה
     * @param {number} delay - עיכוב במילישניות
     * @param {boolean} repeat - האם לחזור על הטיימר
     * @returns {string} - מזהה הטיימר
     */
    set(id, callback, delay, repeat = false) {
      try {
        this.clear(id);
        
        const timerId = repeat 
          ? setInterval(callback, delay)
          : setTimeout(callback, delay);
        
        this.timers.set(id, { timerId, repeat, callback, delay });
        return id;
        
      } catch (error) {
        console.error('❌ EventUtils.Timer.set error:', error);
        return null;
      }
    }

    /**
     * ביטול טיימר
     * @param {string} id - מזהה הטיימר
     */
    clear(id) {
      try {
        if (this.timers.has(id)) {
          const { timerId, repeat } = this.timers.get(id);
          
          if (repeat) {
            clearInterval(timerId);
          } else {
            clearTimeout(timerId);
          }
          
          this.timers.delete(id);
        }
      } catch (error) {
        console.error('❌ EventUtils.Timer.clear error:', error);
      }
    }

    /**
     * ביטול כל הטיימרים
     */
    clearAll() {
      try {
        this.timers.forEach(({ timerId, repeat }) => {
          if (repeat) {
            clearInterval(timerId);
          } else {
            clearTimeout(timerId);
          }
        });
        this.timers.clear();
      } catch (error) {
        console.error('❌ EventUtils.Timer.clearAll error:', error);
      }
    }

    /**
     * בדיקת קיום טיימר
     * @param {string} id - מזהה הטיימר
     * @returns {boolean} - האם הטיימר קיים
     */
    exists(id) {
      return this.timers.has(id);
    }

    /**
     * קבלת מידע על טיימר
     * @param {string} id - מזהה הטיימר
     * @returns {Object|null} - מידע על הטיימר
     */
    getInfo(id) {
      return this.timers.get(id) || null;
    }
  };

  /**
   * יצירת מופע טיימר גלובלי
   */
  static timer = new EventUtils.Timer();

  /**
   * הוספת מאזין לחיצה מחוץ לאלמנט
   * @param {Element} element - האלמנט
   * @param {Function} handler - פונקציית הטיפול
   * @param {Object} options - אפשרויות נוספות
   */
  static addOutsideClickListener(element, handler, options = {}) {
    try {
      if (!element || typeof handler !== 'function') return;

      const outsideHandler = (event) => {
        if (!element.contains(event.target)) {
          handler(event);
        }
      };

      this.addListener(document, 'click', outsideHandler, options);
      
    } catch (error) {
      console.error('❌ EventUtils.addOutsideClickListener error:', error);
    }
  }

  /**
   * הוספת מאזין לחיצה על מקש
   * @param {Element} element - האלמנט
   * @param {string|Array} keys - מקש או רשימת מקשים
   * @param {Function} handler - פונקציית הטיפול
   * @param {Object} options - אפשרויות נוספות
   */
  static addKeyListener(element, keys, handler, options = {}) {
    try {
      if (!element || !keys || typeof handler !== 'function') return;

      const keyArray = Array.isArray(keys) ? keys : [keys];
      
      const keyHandler = (event) => {
        if (keyArray.includes(event.key) || keyArray.includes(event.code)) {
          handler(event);
        }
      };

      this.addListener(element, 'keydown', keyHandler, options);
      
    } catch (error) {
      console.error('❌ EventUtils.addKeyListener error:', error);
    }
  }

  /**
   * הוספת מאזין לגלילה
   * @param {Element} element - האלמנט
   * @param {Function} handler - פונקציית הטיפול
   * @param {Object} options - אפשרויות נוספות
   */
  static addScrollListener(element, handler, options = {}) {
    try {
      if (!element || typeof handler !== 'function') return;

      this.addListener(element, 'scroll', handler, options);
      
    } catch (error) {
      console.error('❌ EventUtils.addScrollListener error:', error);
    }
  }

  /**
   * הוספת מאזין לשינוי גודל
   * @param {Element} element - האלמנט
   * @param {Function} handler - פונקציית הטיפול
   * @param {Object} options - אפשרויות נוספות
   */
  static addResizeListener(element, handler, options = {}) {
    try {
      if (!element || typeof handler !== 'function') return;

      this.addListener(element, 'resize', handler, options);
      
    } catch (error) {
      console.error('❌ EventUtils.addResizeListener error:', error);
    }
  }

  /**
   * הוספת מאזין לטעינה
   * @param {Function} handler - פונקציית הטיפול
   * @param {Object} options - אפשרויות נוספות
   */
  static addLoadListener(handler, options = {}) {
    try {
      if (typeof handler !== 'function') return;

      this.addListener(window, 'load', handler, options);
      
    } catch (error) {
      console.error('❌ EventUtils.addLoadListener error:', error);
    }
  }

  /**
   * הוספת מאזין למוכנות DOM
   * @param {Function} handler - פונקציית הטיפול
   * @param {Object} options - אפשרויות נוספות
   */
  static addDOMReadyListener(handler, options = {}) {
    try {
      if (typeof handler !== 'function') return;

      if (document.readyState === 'loading') {
        this.addListener(document, 'DOMContentLoaded', handler, options);
      } else {
        handler();
      }
      
    } catch (error) {
      console.error('❌ EventUtils.addDOMReadyListener error:', error);
    }
  }

  /**
   * בדיקת תמיכה באירוע
   * @param {string} eventType - סוג האירוע
   * @returns {boolean} - האם האירוע נתמך
   */
  static isEventSupported(eventType) {
    try {
      const element = document.createElement('div');
      const eventName = 'on' + eventType;
      return eventName in element;
    } catch (error) {
      console.error('❌ EventUtils.isEventSupported error:', error);
      return false;
    }
  }

  /**
   * קבלת מידע על אירוע
   * @param {Event} event - האירוע
   * @returns {Object} - מידע על האירוע
   */
  static getEventInfo(event) {
    try {
      return {
        type: event.type,
        target: event.target,
        currentTarget: event.currentTarget,
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        defaultPrevented: event.defaultPrevented,
        timeStamp: event.timeStamp,
        isTrusted: event.isTrusted
      };
    } catch (error) {
      console.error('❌ EventUtils.getEventInfo error:', error);
      return {};
    }
  }

  /**
   * מניעת התנהגות ברירת מחדל
   * @param {Event} event - האירוע
   */
  static preventDefault(event) {
    try {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
    } catch (error) {
      console.error('❌ EventUtils.preventDefault error:', error);
    }
  }

  /**
   * עצירת התפשטות האירוע
   * @param {Event} event - האירוע
   */
  static stopPropagation(event) {
    try {
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
    } catch (error) {
      console.error('❌ EventUtils.stopPropagation error:', error);
    }
  }

  /**
   * עצירה מלאה של האירוע
   * @param {Event} event - האירוע
   */
  static stopEvent(event) {
    try {
      this.preventDefault(event);
      this.stopPropagation(event);
    } catch (error) {
      console.error('❌ EventUtils.stopEvent error:', error);
    }
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventUtils;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.EventUtils = EventUtils;
}

console.log('✅ EventUtils נוצר ופועל');
