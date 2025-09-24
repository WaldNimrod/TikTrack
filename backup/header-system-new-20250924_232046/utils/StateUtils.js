/**
 * State Utilities - Header System
 * כלי עזר לעבודה עם מצב המערכת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class StateUtils {
  /**
   * שמירת מצב ב-localStorage
   * @param {string} key - מפתח השמירה
   * @param {*} value - הערך לשמירה
   * @param {boolean} stringify - האם להמיר ל-JSON
   */
  static saveToLocalStorage(key, value, stringify = true) {
    try {
      if (!key) {
        console.warn('⚠️ StateUtils.saveToLocalStorage: Key is required');
        return false;
      }

      const storageValue = stringify ? JSON.stringify(value) : value;
      localStorage.setItem(key, storageValue);
      return true;
      
    } catch (error) {
      console.error('❌ StateUtils.saveToLocalStorage error:', error);
      return false;
    }
  }

  /**
   * טעינת מצב מ-localStorage
   * @param {string} key - מפתח השמירה
   * @param {*} defaultValue - ערך ברירת מחדל
   * @param {boolean} parse - האם לפרסר JSON
   * @returns {*} - הערך שנטען או ערך ברירת מחדל
   */
  static loadFromLocalStorage(key, defaultValue = null, parse = true) {
    try {
      if (!key) {
        console.warn('⚠️ StateUtils.loadFromLocalStorage: Key is required');
        return defaultValue;
      }

      const storedValue = localStorage.getItem(key);
      
      if (storedValue === null) {
        return defaultValue;
      }

      if (parse) {
        try {
          return JSON.parse(storedValue);
        } catch (parseError) {
          console.warn('⚠️ StateUtils.loadFromLocalStorage: Failed to parse JSON, returning raw value');
          return storedValue;
        }
      }

      return storedValue;
      
    } catch (error) {
      console.error('❌ StateUtils.loadFromLocalStorage error:', error);
      return defaultValue;
    }
  }

  /**
   * הסרת מצב מ-localStorage
   * @param {string} key - מפתח השמירה
   */
  static removeFromLocalStorage(key) {
    try {
      if (!key) return false;
      
      localStorage.removeItem(key);
      return true;
      
    } catch (error) {
      console.error('❌ StateUtils.removeFromLocalStorage error:', error);
      return false;
    }
  }

  /**
   * ניקוי כל ה-localStorage
   */
  static clearLocalStorage() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('❌ StateUtils.clearLocalStorage error:', error);
      return false;
    }
  }

  /**
   * שמירת מצב ב-sessionStorage
   * @param {string} key - מפתח השמירה
   * @param {*} value - הערך לשמירה
   * @param {boolean} stringify - האם להמיר ל-JSON
   */
  static saveToSessionStorage(key, value, stringify = true) {
    try {
      if (!key) {
        console.warn('⚠️ StateUtils.saveToSessionStorage: Key is required');
        return false;
      }

      const storageValue = stringify ? JSON.stringify(value) : value;
      sessionStorage.setItem(key, storageValue);
      return true;
      
    } catch (error) {
      console.error('❌ StateUtils.saveToSessionStorage error:', error);
      return false;
    }
  }

  /**
   * טעינת מצב מ-sessionStorage
   * @param {string} key - מפתח השמירה
   * @param {*} defaultValue - ערך ברירת מחדל
   * @param {boolean} parse - האם לפרסר JSON
   * @returns {*} - הערך שנטען או ערך ברירת מחדל
   */
  static loadFromSessionStorage(key, defaultValue = null, parse = true) {
    try {
      if (!key) {
        console.warn('⚠️ StateUtils.loadFromSessionStorage: Key is required');
        return defaultValue;
      }

      const storedValue = sessionStorage.getItem(key);
      
      if (storedValue === null) {
        return defaultValue;
      }

      if (parse) {
        try {
          return JSON.parse(storedValue);
        } catch (parseError) {
          console.warn('⚠️ StateUtils.loadFromSessionStorage: Failed to parse JSON, returning raw value');
          return storedValue;
        }
      }

      return storedValue;
      
    } catch (error) {
      console.error('❌ StateUtils.loadFromSessionStorage error:', error);
      return defaultValue;
    }
  }

  /**
   * הסרת מצב מ-sessionStorage
   * @param {string} key - מפתח השמירה
   */
  static removeFromSessionStorage(key) {
    try {
      if (!key) return false;
      
      sessionStorage.removeItem(key);
      return true;
      
    } catch (error) {
      console.error('❌ StateUtils.removeFromSessionStorage error:', error);
      return false;
    }
  }

  /**
   * ניקוי כל ה-sessionStorage
   */
  static clearSessionStorage() {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('❌ StateUtils.clearSessionStorage error:', error);
      return false;
    }
  }

  /**
   * שמירת מצב ב-UnifiedIndexedDB
   * @param {string} key - מפתח השמירה
   * @param {*} value - הערך לשמירה
   * @returns {Promise<boolean>} - האם השמירה הצליחה
   */
  static async saveToIndexedDB(key, value) {
    try {
      if (!key) {
        console.warn('⚠️ StateUtils.saveToIndexedDB: Key is required');
        return false;
      }

      if (!window.UnifiedIndexedDB) {
        console.warn('⚠️ StateUtils.saveToIndexedDB: UnifiedIndexedDB not available');
        return false;
      }

      await window.UnifiedIndexedDB.setItem(key, value);
      return true;
      
    } catch (error) {
      console.error('❌ StateUtils.saveToIndexedDB error:', error);
      return false;
    }
  }

  /**
   * טעינת מצב מ-UnifiedIndexedDB
   * @param {string} key - מפתח השמירה
   * @param {*} defaultValue - ערך ברירת מחדל
   * @returns {Promise<*>} - הערך שנטען או ערך ברירת מחדל
   */
  static async loadFromIndexedDB(key, defaultValue = null) {
    try {
      if (!key) {
        console.warn('⚠️ StateUtils.loadFromIndexedDB: Key is required');
        return defaultValue;
      }

      if (!window.UnifiedIndexedDB) {
        console.warn('⚠️ StateUtils.loadFromIndexedDB: UnifiedIndexedDB not available');
        return defaultValue;
      }

      const value = await window.UnifiedIndexedDB.getItem(key);
      return value !== null ? value : defaultValue;
      
    } catch (error) {
      console.error('❌ StateUtils.loadFromIndexedDB error:', error);
      return defaultValue;
    }
  }

  /**
   * הסרת מצב מ-UnifiedIndexedDB
   * @param {string} key - מפתח השמירה
   * @returns {Promise<boolean>} - האם ההסרה הצליחה
   */
  static async removeFromIndexedDB(key) {
    try {
      if (!key) return false;

      if (!window.UnifiedIndexedDB) {
        console.warn('⚠️ StateUtils.removeFromIndexedDB: UnifiedIndexedDB not available');
        return false;
      }

      await window.UnifiedIndexedDB.removeItem(key);
      return true;
      
    } catch (error) {
      console.error('❌ StateUtils.removeFromIndexedDB error:', error);
      return false;
    }
  }

  /**
   * ניקוי כל ה-UnifiedIndexedDB
   * @returns {Promise<boolean>} - האם הניקוי הצליח
   */
  static async clearIndexedDB() {
    try {
      if (!window.UnifiedIndexedDB) {
        console.warn('⚠️ StateUtils.clearIndexedDB: UnifiedIndexedDB not available');
        return false;
      }

      await window.UnifiedIndexedDB.clear();
      return true;
      
    } catch (error) {
      console.error('❌ StateUtils.clearIndexedDB error:', error);
      return false;
    }
  }

  /**
   * שמירת מצב במספר מקומות
   * @param {string} key - מפתח השמירה
   * @param {*} value - הערך לשמירה
   * @param {Object} options - אפשרויות שמירה
   */
  static async saveState(key, value, options = {}) {
    try {
      const {
        localStorage = true,
        sessionStorage = false,
        indexedDB = false,
        stringify = true
      } = options;

      const results = {};

      if (localStorage) {
        results.localStorage = this.saveToLocalStorage(key, value, stringify);
      }

      if (sessionStorage) {
        results.sessionStorage = this.saveToSessionStorage(key, value, stringify);
      }

      if (indexedDB) {
        results.indexedDB = await this.saveToIndexedDB(key, value);
      }

      return results;
      
    } catch (error) {
      console.error('❌ StateUtils.saveState error:', error);
      return {};
    }
  }

  /**
   * טעינת מצב ממספר מקומות
   * @param {string} key - מפתח השמירה
   * @param {*} defaultValue - ערך ברירת מחדל
   * @param {Object} options - אפשרויות טעינה
   */
  static async loadState(key, defaultValue = null, options = {}) {
    try {
      const {
        localStorage = true,
        sessionStorage = false,
        indexedDB = false,
        parse = true,
        priority = ['localStorage', 'sessionStorage', 'indexedDB']
      } = options;

      // ניסיון טעינה לפי סדר עדיפות
      for (const source of priority) {
        let value = null;

        switch (source) {
          case 'localStorage':
            if (localStorage) {
              value = this.loadFromLocalStorage(key, null, parse);
            }
            break;
          case 'sessionStorage':
            if (sessionStorage) {
              value = this.loadFromSessionStorage(key, null, parse);
            }
            break;
          case 'indexedDB':
            if (indexedDB) {
              value = await this.loadFromIndexedDB(key, null);
            }
            break;
        }

        if (value !== null) {
          return value;
        }
      }

      return defaultValue;
      
    } catch (error) {
      console.error('❌ StateUtils.loadState error:', error);
      return defaultValue;
    }
  }

  /**
   * הסרת מצב ממספר מקומות
   * @param {string} key - מפתח השמירה
   * @param {Object} options - אפשרויות הסרה
   */
  static async removeState(key, options = {}) {
    try {
      const {
        localStorage = true,
        sessionStorage = false,
        indexedDB = false
      } = options;

      const results = {};

      if (localStorage) {
        results.localStorage = this.removeFromLocalStorage(key);
      }

      if (sessionStorage) {
        results.sessionStorage = this.removeFromSessionStorage(key);
      }

      if (indexedDB) {
        results.indexedDB = await this.removeFromIndexedDB(key);
      }

      return results;
      
    } catch (error) {
      console.error('❌ StateUtils.removeState error:', error);
      return {};
    }
  }

  /**
   * ניהול מצב מערכת
   */
  static SystemState = class {
    constructor() {
      this.state = new Map();
      this.listeners = new Map();
    }

    /**
     * הגדרת מצב
     * @param {string} key - מפתח המצב
     * @param {*} value - ערך המצב
     * @param {boolean} notify - האם להודיע למאזינים
     */
    set(key, value, notify = true) {
      try {
        const oldValue = this.state.get(key);
        this.state.set(key, value);

        if (notify && this.listeners.has(key)) {
          const listeners = this.listeners.get(key);
          listeners.forEach(listener => {
            try {
              listener(value, oldValue, key);
            } catch (error) {
              console.error('❌ StateUtils.SystemState.set listener error:', error);
            }
          });
        }
      } catch (error) {
        console.error('❌ StateUtils.SystemState.set error:', error);
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
        console.error('❌ StateUtils.SystemState.get error:', error);
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
     */
    delete(key) {
      try {
        this.state.delete(key);
        this.listeners.delete(key);
      } catch (error) {
        console.error('❌ StateUtils.SystemState.delete error:', error);
      }
    }

    /**
     * ניקוי כל המצב
     */
    clear() {
      try {
        this.state.clear();
        this.listeners.clear();
      } catch (error) {
        console.error('❌ StateUtils.SystemState.clear error:', error);
      }
    }

    /**
     * הוספת מאזין לשינוי מצב
     * @param {string} key - מפתח המצב
     * @param {Function} listener - פונקציית המאזין
     */
    addListener(key, listener) {
      try {
        if (!this.listeners.has(key)) {
          this.listeners.set(key, []);
        }
        this.listeners.get(key).push(listener);
      } catch (error) {
        console.error('❌ StateUtils.SystemState.addListener error:', error);
      }
    }

    /**
     * הסרת מאזין
     * @param {string} key - מפתח המצב
     * @param {Function} listener - פונקציית המאזין
     */
    removeListener(key, listener) {
      try {
        if (this.listeners.has(key)) {
          const listeners = this.listeners.get(key);
          const index = listeners.indexOf(listener);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      } catch (error) {
        console.error('❌ StateUtils.SystemState.removeListener error:', error);
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
        console.error('❌ StateUtils.SystemState.getAll error:', error);
        return {};
      }
    }

    /**
     * הגדרת מצב מרובה
     * @param {Object} state - המצב החדש
     * @param {boolean} notify - האם להודיע למאזינים
     */
    setAll(state, notify = true) {
      try {
        Object.entries(state).forEach(([key, value]) => {
          this.set(key, value, notify);
        });
      } catch (error) {
        console.error('❌ StateUtils.SystemState.setAll error:', error);
      }
    }
  };

  /**
   * יצירת מופע מצב מערכת גלובלי
   */
  static systemState = new StateUtils.SystemState();

  /**
   * סינכרון מצב בין מקומות שונים
   * @param {string} key - מפתח המצב
   * @param {Object} options - אפשרויות סינכרון
   */
  static async syncState(key, options = {}) {
    try {
      const {
        localStorage = true,
        sessionStorage = false,
        indexedDB = false,
        stringify = true
      } = options;

      // טעינת המצב הנוכחי
      const currentState = this.systemState.get(key);
      
      // שמירה בכל המקומות
      await this.saveState(key, currentState, {
        localStorage,
        sessionStorage,
        indexedDB,
        stringify
      });

      return true;
      
    } catch (error) {
      console.error('❌ StateUtils.syncState error:', error);
      return false;
    }
  }

  /**
   * טעינת מצב מסונכרן
   * @param {string} key - מפתח המצב
   * @param {*} defaultValue - ערך ברירת מחדל
   * @param {Object} options - אפשרויות טעינה
   */
  static async loadSyncedState(key, defaultValue = null, options = {}) {
    try {
      // טעינה מהמקומות השונים
      const value = await this.loadState(key, defaultValue, options);
      
      // עדכון מצב המערכת
      this.systemState.set(key, value, false);
      
      return value;
      
    } catch (error) {
      console.error('❌ StateUtils.loadSyncedState error:', error);
      return defaultValue;
    }
  }

  /**
   * בדיקת תמיכה באחסון
   * @returns {Object} - מידע על תמיכה באחסון
   */
  static checkStorageSupport() {
    try {
      return {
        localStorage: typeof Storage !== 'undefined' && localStorage !== null,
        sessionStorage: typeof Storage !== 'undefined' && sessionStorage !== null,
        indexedDB: typeof window !== 'undefined' && 'indexedDB' in window,
        unifiedIndexedDB: typeof window !== 'undefined' && window.UnifiedIndexedDB !== undefined
      };
    } catch (error) {
      console.error('❌ StateUtils.checkStorageSupport error:', error);
      return {
        localStorage: false,
        sessionStorage: false,
        indexedDB: false,
        unifiedIndexedDB: false
      };
    }
  }

  /**
   * קבלת מידע על אחסון
   * @returns {Object} - מידע על האחסון
   */
  static getStorageInfo() {
    try {
      const info = {
        localStorage: { used: 0, available: 0 },
        sessionStorage: { used: 0, available: 0 }
      };

      // חישוב שימוש ב-localStorage
      if (typeof Storage !== 'undefined' && localStorage !== null) {
        let localStorageUsed = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            localStorageUsed += localStorage[key].length + key.length;
          }
        }
        info.localStorage.used = localStorageUsed;
        info.localStorage.available = 5 * 1024 * 1024 - localStorageUsed; // 5MB - used
      }

      // חישוב שימוש ב-sessionStorage
      if (typeof Storage !== 'undefined' && sessionStorage !== null) {
        let sessionStorageUsed = 0;
        for (let key in sessionStorage) {
          if (sessionStorage.hasOwnProperty(key)) {
            sessionStorageUsed += sessionStorage[key].length + key.length;
          }
        }
        info.sessionStorage.used = sessionStorageUsed;
        info.sessionStorage.available = 5 * 1024 * 1024 - sessionStorageUsed; // 5MB - used
      }

      return info;
      
    } catch (error) {
      console.error('❌ StateUtils.getStorageInfo error:', error);
      return {
        localStorage: { used: 0, available: 0 },
        sessionStorage: { used: 0, available: 0 }
      };
    }
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateUtils;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.StateUtils = StateUtils;
}

console.log('✅ StateUtils נוצר ופועל');
