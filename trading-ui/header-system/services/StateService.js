/**
 * State Service - Header System
 * שירות מצב מרכזי למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class StateService {
  constructor() {
    this.state = new Map();
    this.listeners = new Map();
    this.history = [];
    this.maxHistorySize = 50;
    this.config = HEADER_CONFIG.STATE;
    this.autoSaveTimer = null;
    this.isInitialized = false;
    
    // הגדרת לוגים
    this.setupLogging();
    
    // אתחול
    this.init();
  }

  /**
   * הגדרת מערכת לוגים
   */
  setupLogging() {
    this.log = {
      debug: (...args) => {
        if (HEADER_CONFIG.LOGGING.LEVEL === 'debug' && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('🔍 [StateService]', ...args);
        }
      },
      info: (...args) => {
        if (['debug', 'info'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('ℹ️ [StateService]', ...args);
        }
      },
      warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.warn('⚠️ [StateService]', ...args);
        }
      },
      error: (...args) => {
        if (HEADER_CONFIG.LOGGING.CONSOLE) {
          console.error('❌ [StateService]', ...args);
        }
      }
    };
  }

  /**
   * אתחול השירות
   */
  async init() {
    try {
      this.log.info('מתחיל אתחול StateService...');
      
      // טעינת מצב שמור
      await this.loadState();
      
      // הגדרת שמירה אוטומטית
      if (this.config.AUTO_SAVE) {
        this.setupAutoSave();
      }
      
      this.isInitialized = true;
      this.log.info('StateService אותחל בהצלחה');
      
    } catch (error) {
      this.log.error('שגיאה באתחול StateService:', error);
      throw error;
    }
  }

  /**
   * הגדרת שמירה אוטומטית
   */
  setupAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(() => {
      this.saveState();
    }, this.config.SAVE_INTERVAL);
    
    this.log.debug('שמירה אוטומטית הוגדרה');
  }

  /**
   * הגדרת מצב
   * @param {string} key - מפתח המצב
   * @param {*} value - ערך המצב
   * @param {Object} options - אפשרויות נוספות
   */
  set(key, value, options = {}) {
    try {
      if (!key) {
        this.log.warn('StateService.set: Key is required');
        return false;
      }

      const oldValue = this.state.get(key);
      const stateChange = {
        key,
        oldValue,
        newValue: value,
        timestamp: Date.now(),
        options
      };

      // שמירה בהיסטוריה
      this.addToHistory(stateChange);

      // עדכון המצב
      this.state.set(key, value);

      // הודעת מאזינים
      this.notifyListeners(key, value, oldValue, options);

      this.log.debug(`מצב עודכן: ${key}`, { oldValue, newValue: value });
      return true;
      
    } catch (error) {
      this.log.error('StateService.set error:', error);
      return false;
    }
  }

  /**
   * קבלת מצב
   * @param {string} key - מפתח המצב
   * @param {*} defaultValue - ערך ברירת מחדל
   * @returns {*} - ערך המצב
   */
  get(key, defaultValue = null) {
    try {
      return this.state.has(key) ? this.state.get(key) : defaultValue;
    } catch (error) {
      this.log.error('StateService.get error:', error);
      return defaultValue;
    }
  }

  /**
   * בדיקת קיום מצב
   * @param {string} key - מפתח המצב
   * @returns {boolean} - האם המצב קיים
   */
  has(key) {
    return this.state.has(key);
  }

  /**
   * הסרת מצב
   * @param {string} key - מפתח המצב
   * @returns {boolean} - האם ההסרה הצליחה
   */
  delete(key) {
    try {
      if (!this.state.has(key)) return false;

      const oldValue = this.state.get(key);
      this.state.delete(key);

      // הודעת מאזינים
      this.notifyListeners(key, null, oldValue, { action: 'delete' });

      this.log.debug(`מצב הוסר: ${key}`);
      return true;
      
    } catch (error) {
      this.log.error('StateService.delete error:', error);
      return false;
    }
  }

  /**
   * קבלת כל המצב
   * @returns {Object} - כל המצב
   */
  getAll() {
    try {
      const result = {};
      this.state.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    } catch (error) {
      this.log.error('StateService.getAll error:', error);
      return {};
    }
  }

  /**
   * הגדרת מצב מרובה
   * @param {Object} state - המצב החדש
   * @param {Object} options - אפשרויות נוספות
   */
  setAll(state, options = {}) {
    try {
      Object.entries(state).forEach(([key, value]) => {
        this.set(key, value, options);
      });
      
      this.log.debug('מצב מרובה עודכן', state);
    } catch (error) {
      this.log.error('StateService.setAll error:', error);
    }
  }

  /**
   * הוספת מאזין לשינוי מצב
   * @param {string} key - מפתח המצב
   * @param {Function} listener - פונקציית המאזין
   * @param {Object} options - אפשרויות נוספות
   * @returns {string} - מזהה המאזין
   */
  addListener(key, listener, options = {}) {
    try {
      if (!key || typeof listener !== 'function') {
        this.log.warn('StateService.addListener: Invalid parameters');
        return null;
      }

      const listenerId = this.generateListenerId();
      const listenerObj = {
        id: listenerId,
        key,
        listener,
        options: {
          immediate: false,
          once: false,
          ...options
        },
        addedAt: Date.now()
      };

      if (!this.listeners.has(key)) {
        this.listeners.set(key, []);
      }

      this.listeners.get(key).push(listenerObj);

      // קריאה מיידית אם מוגדר
      if (listenerObj.options.immediate) {
        const currentValue = this.get(key);
        listener(currentValue, null, key);
      }

      this.log.debug(`מאזין נוסף למצב ${key}:`, listenerId);
      return listenerId;
      
    } catch (error) {
      this.log.error('StateService.addListener error:', error);
      return null;
    }
  }

  /**
   * הסרת מאזין
   * @param {string} key - מפתח המצב
   * @param {string|Function} identifier - מזהה המאזין או הפונקציה
   */
  removeListener(key, identifier) {
    try {
      if (!this.listeners.has(key)) return;

      const listeners = this.listeners.get(key);
      const index = listeners.findIndex(listener => {
        if (typeof identifier === 'string') {
          return listener.id === identifier;
        } else if (typeof identifier === 'function') {
          return listener.listener === identifier;
        }
        return false;
      });

      if (index > -1) {
        listeners.splice(index, 1);
        this.log.debug(`מאזין הוסר ממצב ${key}`);
      }
      
    } catch (error) {
      this.log.error('StateService.removeListener error:', error);
    }
  }

  /**
   * הודעת מאזינים
   * @param {string} key - מפתח המצב
   * @param {*} newValue - הערך החדש
   * @param {*} oldValue - הערך הישן
   * @param {Object} options - אפשרויות נוספות
   */
  notifyListeners(key, newValue, oldValue, options = {}) {
    try {
      if (!this.listeners.has(key)) return;

      const listeners = [...this.listeners.get(key)]; // עותק כדי למנוע שינויים במהלך העיבוד
      
      for (const listenerObj of listeners) {
        try {
          listenerObj.listener(newValue, oldValue, key, options);
          
          // הסרה אם חד-פעמי
          if (listenerObj.options.once) {
            this.removeListener(key, listenerObj.id);
          }
        } catch (listenerError) {
          this.log.error(`שגיאה במאזין ${listenerObj.id}:`, listenerError);
        }
      }
      
    } catch (error) {
      this.log.error('StateService.notifyListeners error:', error);
    }
  }

  /**
   * שמירת מצב
   * @param {Object} options - אפשרויות שמירה
   */
  async saveState(options = {}) {
    try {
      if (!this.config.AUTO_SAVE && !options.force) return;

      this.log.debug('שומר מצב...');
      
      const currentState = this.getAll();
      const result = await StateUtils.saveState('headerSystemState', currentState, {
        localStorage: this.config.STORAGE_TYPE === 'localStorage',
        sessionStorage: this.config.STORAGE_TYPE === 'sessionStorage',
        indexedDB: this.config.STORAGE_TYPE === 'indexedDB'
      });

      this.log.debug('מצב נשמר', result);
      return result;
      
    } catch (error) {
      this.log.error('שגיאה בשמירת מצב:', error);
      return false;
    }
  }

  /**
   * טעינת מצב
   * @param {Object} options - אפשרויות טעינה
   */
  async loadState(options = {}) {
    try {
      this.log.debug('טוען מצב...');
      
      const savedState = await StateUtils.loadState('headerSystemState', {}, {
        localStorage: this.config.STORAGE_TYPE === 'localStorage',
        sessionStorage: this.config.STORAGE_TYPE === 'sessionStorage',
        indexedDB: this.config.STORAGE_TYPE === 'indexedDB'
      });

      if (savedState && Object.keys(savedState).length > 0) {
        this.setAll(savedState, { silent: true });
        this.log.debug('מצב נטען', savedState);
      }
      
      return savedState;
      
    } catch (error) {
      this.log.error('שגיאה בטעינת מצב:', error);
      return {};
    }
  }

  /**
   * איפוס מצב
   * @param {Array} keys - מפתחות לאיפוס (אופציונלי)
   */
  resetState(keys = null) {
    try {
      if (keys) {
        // איפוס מפתחות ספציפיים
        keys.forEach(key => {
          this.delete(key);
        });
        this.log.debug(`מצב אופס עבור מפתחות: ${keys.join(', ')}`);
      } else {
        // איפוס כל המצב
        this.state.clear();
        this.log.debug('כל המצב אופס');
      }
      
    } catch (error) {
      this.log.error('StateService.resetState error:', error);
    }
  }

  /**
   * הוספה להיסטוריה
   * @param {Object} stateChange - שינוי מצב
   */
  addToHistory(stateChange) {
    try {
      this.history.push(stateChange);
      
      // הגבלת גודל ההיסטוריה
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      }
      
    } catch (error) {
      this.log.error('StateService.addToHistory error:', error);
    }
  }

  /**
   * קבלת היסטוריה
   * @param {string} key - מפתח המצב (אופציונלי)
   * @param {number} limit - הגבלת מספר רשומות
   * @returns {Array} - היסטוריית שינויים
   */
  getHistory(key = null, limit = null) {
    try {
      let history = [...this.history];
      
      // סינון לפי מפתח
      if (key) {
        history = history.filter(change => change.key === key);
      }
      
      // הגבלת מספר רשומות
      if (limit && limit > 0) {
        history = history.slice(-limit);
      }
      
      return history;
      
    } catch (error) {
      this.log.error('StateService.getHistory error:', error);
      return [];
    }
  }

  /**
   * ביטול שינוי אחרון
   * @param {string} key - מפתח המצב (אופציונלי)
   * @returns {boolean} - האם הביטול הצליח
   */
  undo(key = null) {
    try {
      let history = this.getHistory(key, 1);
      
      if (history.length === 0) {
        this.log.warn('אין היסטוריה לביטול');
        return false;
      }
      
      const lastChange = history[0];
      
      // החזרת הערך הקודם
      if (lastChange.oldValue === undefined) {
        this.delete(lastChange.key);
      } else {
        this.set(lastChange.key, lastChange.oldValue, { silent: true });
      }
      
      // הסרה מההיסטוריה
      this.history = this.history.filter(change => change !== lastChange);
      
      this.log.debug(`ביטול שינוי: ${lastChange.key}`);
      return true;
      
    } catch (error) {
      this.log.error('StateService.undo error:', error);
      return false;
    }
  }

  /**
   * יצירת מזהה מאזין ייחודי
   * @returns {string} - מזהה ייחודי
   */
  generateListenerId() {
    return `state_listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * בדיקת גודל המצב
   * @returns {Object} - מידע על גודל המצב
   */
  getStateSize() {
    try {
      const stateString = JSON.stringify(this.getAll());
      const sizeInBytes = new Blob([stateString]).size;
      
      return {
        keys: this.state.size,
        sizeInBytes,
        sizeInKB: Math.round(sizeInBytes / 1024 * 100) / 100,
        sizeInMB: Math.round(sizeInBytes / (1024 * 1024) * 100) / 100,
        isOverLimit: sizeInBytes > this.config.MAX_STATE_SIZE
      };
      
    } catch (error) {
      this.log.error('StateService.getStateSize error:', error);
      return { keys: 0, sizeInBytes: 0, sizeInKB: 0, sizeInMB: 0, isOverLimit: false };
    }
  }

  /**
   * ניקוי מצב ישן
   * @param {number} maxAge - גיל מקסימלי במילישניות
   */
  cleanupOldState(maxAge = 24 * 60 * 60 * 1000) { // 24 שעות
    try {
      const now = Date.now();
      const keysToDelete = [];
      
      this.state.forEach((value, key) => {
        if (value && value.timestamp && (now - value.timestamp) > maxAge) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => {
        this.delete(key);
      });
      
      if (keysToDelete.length > 0) {
        this.log.debug(`נוקו ${keysToDelete.length} מפתחות ישנים`);
      }
      
    } catch (error) {
      this.log.error('StateService.cleanupOldState error:', error);
    }
  }

  /**
   * הרס השירות
   */
  destroy() {
    try {
      this.log.info('משמיד StateService...');
      
      // שמירה אחרונה
      this.saveState({ force: true });
      
      // ניקוי טיימר
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
        this.autoSaveTimer = null;
      }
      
      // ניקוי מצב
      this.state.clear();
      this.listeners.clear();
      this.history = [];
      
      this.isInitialized = false;
      this.log.info('StateService הושמד');
      
    } catch (error) {
      this.log.error('StateService.destroy error:', error);
    }
  }

  /**
   * קבלת מידע על השירות
   * @returns {Object} - מידע על השירות
   */
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      stateSize: this.getStateSize(),
      listenersCount: Array.from(this.listeners.values()).reduce((total, listeners) => total + listeners.length, 0),
      historySize: this.history.length,
      config: this.config
    };
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateService;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.StateService = StateService;
}

console.log('✅ StateService נוצר ופועל');
