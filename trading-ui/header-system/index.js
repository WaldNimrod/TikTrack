/**
 * Header System - Main Entry Point
 * נקודת כניסה ראשית למערכת הכותרת
 * 
 * @version 2.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

// טעינת כלי עזר
import './utils/DOMUtils.js';
import './utils/EventUtils.js';
import './utils/StateUtils.js';

// טעינת קבועים
import './constants/Events.js';
import './constants/Selectors.js';
import './constants/Config.js';

// טעינת שירותים
import './services/EventService.js';
import './services/StateService.js';
import './services/UIService.js';

// טעינת רכיבים
import './components/StateComponent.js';
import './components/UIComponent.js';
import './components/TranslationComponent.js';
import './components/PreferencesComponent.js';
import './components/MenuComponent.js';
import './components/FilterComponent.js';
import './components/NavigationComponent.js';
import './components/HeaderComponent.js';

/**
 * Header System Main Class
 * מחלקה ראשית למערכת הכותרת
 */
class HeaderSystem {
  constructor(options = {}) {
    this.config = { ...HEADER_CONFIG, ...options };
    this.isInitialized = false;
    this.components = new Map();
    this.services = new Map();
    this.state = StateUtils.systemState;
    
    // הגדרת לוגים
    this.setupLogging();
    
    // אתחול אוטומטי אם מוגדר
    if (this.config.SYSTEM.AUTO_INIT) {
      this.init();
    }
  }

  /**
   * הגדרת מערכת לוגים
   */
  setupLogging() {
    if (!this.config.LOGGING.ENABLED) return;
    
    this.log = {
      debug: (...args) => {
        if (this.config.LOGGING.LEVEL === 'debug' && this.config.LOGGING.CONSOLE) {
          console.log('🔍 [HeaderSystem]', ...args);
        }
      },
      info: (...args) => {
        if (['debug', 'info'].includes(this.config.LOGGING.LEVEL) && this.config.LOGGING.CONSOLE) {
          console.log('ℹ️ [HeaderSystem]', ...args);
        }
      },
      warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(this.config.LOGGING.LEVEL) && this.config.LOGGING.CONSOLE) {
          console.warn('⚠️ [HeaderSystem]', ...args);
        }
      },
      error: (...args) => {
        if (this.config.LOGGING.CONSOLE) {
          console.error('❌ [HeaderSystem]', ...args);
        }
      }
    };
  }

  /**
   * אתחול המערכת
   */
  async init() {
    try {
      this.log.info('מתחיל אתחול מערכת הכותרת...');
      
      if (this.isInitialized) {
        this.log.warn('המערכת כבר מאותחלת');
        return;
      }

      // המתן לעיכוב אתחול אם מוגדר
      if (this.config.SYSTEM.INIT_DELAY > 0) {
        await this.delay(this.config.SYSTEM.INIT_DELAY);
      }

      // בדיקת תמיכה באחסון
      this.checkStorageSupport();
      
      // טעינת מצב שמור
      await this.loadSavedState();
      
      // יצירת רכיבים
      await this.createComponents();
      
      // יצירת שירותים
      await this.createServices();
      
      // אתחול רכיב כותרת ראשי
      await this.initializeHeaderComponent();
      
      // הגדרת event listeners
      this.setupEventListeners();
      
      // סימון כאתחול
      this.isInitialized = true;
      
      // שליחת אירוע אתחול
      EventUtils.dispatchGlobalEvent(HEADER_EVENTS.SYSTEM_READY, {
        system: this,
        config: this.config
      });
      
      this.log.info('מערכת הכותרת אותחלה בהצלחה');
      
    } catch (error) {
      this.log.error('שגיאה באתחול מערכת הכותרת:', error);
      
      // שליחת אירוע שגיאה
      EventUtils.dispatchGlobalEvent(HEADER_EVENTS.SYSTEM_ERROR, {
        error: error,
        system: this
      });
      
      throw error;
    }
  }

  /**
   * בדיקת תמיכה באחסון
   */
  checkStorageSupport() {
    const support = StateUtils.checkStorageSupport();
    this.log.info('תמיכה באחסון:', support);
    
    if (!support.localStorage && this.config.STATE.STORAGE_TYPE === 'localStorage') {
      this.log.warn('localStorage לא נתמך, עובר ל-sessionStorage');
      this.config.STATE.STORAGE_TYPE = 'sessionStorage';
    }
  }

  /**
   * טעינת מצב שמור
   */
  async loadSavedState() {
    try {
      if (!this.config.STATE.LOAD_STATE) return;
      
      this.log.debug('טוען מצב שמור...');
      
      const savedState = await StateUtils.loadState('headerSystemState', {}, {
        localStorage: this.config.STATE.STORAGE_TYPE === 'localStorage',
        sessionStorage: this.config.STATE.STORAGE_TYPE === 'sessionStorage',
        indexedDB: this.config.STATE.STORAGE_TYPE === 'indexedDB'
      });
      
      if (savedState && Object.keys(savedState).length > 0) {
        this.state.setAll(savedState, false);
        this.log.debug('מצב שמור נטען:', savedState);
      }
      
    } catch (error) {
      this.log.error('שגיאה בטעינת מצב שמור:', error);
    }
  }

  /**
   * יצירת רכיבים
   */
  async createComponents() {
    this.log.debug('יוצר רכיבים...');
    
    // יצירת רכיבים בסיסיים
    this.components.set('state', new StateComponent(this));
    this.components.set('ui', new UIComponent(this));
    this.components.set('translation', new TranslationComponent(this));
    this.components.set('preferences', new PreferencesComponent(this));
    
    // יצירת רכיבים פונקציונליים
    this.components.set('menu', new MenuComponent(this));
    this.components.set('filter', new FilterComponent(this));
    this.components.set('navigation', new NavigationComponent(this));
    
    // יצירת רכיב כותרת ראשי
    this.components.set('header', new HeaderComponent(this));
    
    this.log.debug('רכיבים נוצרו');
  }

  /**
   * יצירת שירותים
   */
  async createServices() {
    this.log.debug('יוצר שירותים...');
    
    // יצירת שירותים
    this.services.set('event', new EventService());
    this.services.set('state', new StateService());
    this.services.set('ui', new UIService());
    
    this.log.debug('שירותים נוצרו');
  }

  /**
   * אתחול רכיב כותרת ראשי
   */
  async initializeHeaderComponent() {
    try {
      this.log.debug('מאתחל רכיב כותרת ראשי...');
      
      const headerComponent = this.components.get('header');
      if (headerComponent) {
        await headerComponent.init();
        this.log.debug('רכיב כותרת ראשי אותחל');
      } else {
        this.log.warn('רכיב כותרת ראשי לא נמצא');
      }
      
    } catch (error) {
      this.log.error('שגיאה באתחול רכיב כותרת ראשי:', error);
      throw error;
    }
  }

  /**
   * קבלת מידע על המערכת
   */
  getInfo() {
    return {
      components: Array.from(this.components.keys()),
      services: Array.from(this.services.keys()),
      isInitialized: this.isInitialized,
      version: '6.0.0'
    };
  }

  /**
   * הגדרת event listeners
   */
  setupEventListeners() {
    this.log.debug('מגדיר event listeners...');
    
    // שמירת מצב אוטומטית
    if (this.config.STATE.AUTO_SAVE) {
      EventUtils.addListener(window, 'beforeunload', () => {
        this.saveState();
      });
    }
    
    // ניקוי בטעינה מחדש
    if (this.config.SYSTEM.DESTROY_ON_UNLOAD) {
      EventUtils.addListener(window, 'unload', () => {
        this.destroy();
      });
    }
    
    this.log.debug('event listeners הוגדרו');
  }

  /**
   * שמירת מצב
   */
  async saveState() {
    try {
      if (!this.config.STATE.AUTO_SAVE) return;
      
      this.log.debug('שומר מצב...');
      
      const currentState = this.state.getAll();
      await StateUtils.saveState('headerSystemState', currentState, {
        localStorage: this.config.STATE.STORAGE_TYPE === 'localStorage',
        sessionStorage: this.config.STATE.STORAGE_TYPE === 'sessionStorage',
        indexedDB: this.config.STATE.STORAGE_TYPE === 'indexedDB'
      });
      
      this.log.debug('מצב נשמר');
      
    } catch (error) {
      this.log.error('שגיאה בשמירת מצב:', error);
    }
  }

  /**
   * קבלת רכיב
   * @param {string} name - שם הרכיב
   * @returns {Object|null} - הרכיב או null
   */
  getComponent(name) {
    return this.components.get(name) || null;
  }

  /**
   * קבלת שירות
   * @param {string} name - שם השירות
   * @returns {Object|null} - השירות או null
   */
  getService(name) {
    return this.services.get(name) || null;
  }

  /**
   * קבלת מצב
   * @param {string} key - מפתח המצב
   * @param {*} defaultValue - ערך ברירת מחדל
   * @returns {*} - ערך המצב
   */
  getState(key, defaultValue = null) {
    return this.state.get(key, defaultValue);
  }

  /**
   * הגדרת מצב
   * @param {string} key - מפתח המצב
   * @param {*} value - ערך המצב
   */
  setState(key, value) {
    this.state.set(key, value);
  }

  /**
   * הרס המערכת
   */
  destroy() {
    try {
      this.log.info('משמיד מערכת הכותרת...');
      
      // הסרת event listeners
      EventUtils.removeAllListeners(window);
      
      // הרס רכיבים
      this.components.forEach(component => {
        if (component.destroy) {
          component.destroy();
        }
      });
      this.components.clear();
      
      // הרס שירותים
      this.services.forEach(service => {
        if (service.destroy) {
          service.destroy();
        }
      });
      this.services.clear();
      
      // ניקוי מצב
      this.state.clear();
      
      // סימון כמושמד
      this.isInitialized = false;
      
      // שליחת אירוע הרס
      EventUtils.dispatchGlobalEvent(HEADER_EVENTS.SYSTEM_DESTROY, {
        system: this
      });
      
      this.log.info('מערכת הכותרת הושמדה');
      
    } catch (error) {
      this.log.error('שגיאה בהרס מערכת הכותרת:', error);
    }
  }

  /**
   * עיכוב
   * @param {number} ms - זמן עיכוב במילישניות
   * @returns {Promise} - Promise שמתממש אחרי העיכוב
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * קבלת שירות
   * @param {string} name - שם השירות
   * @returns {Object} - השירות
   */
  getService(name) {
    return this.services.get(name);
  }

  /**
   * קבלת רכיב
   * @param {string} name - שם הרכיב
   * @returns {Object} - הרכיב
   */
  getComponent(name) {
    return this.components.get(name);
  }

  /**
   * קבלת מידע על המערכת
   * @returns {Object} - מידע על המערכת
   */
  getInfo() {
    return {
      version: this.config.SYSTEM.VERSION,
      name: this.config.SYSTEM.NAME,
      initialized: this.isInitialized,
      components: Array.from(this.components.keys()),
      services: Array.from(this.services.keys()),
      state: this.state.getAll(),
      config: this.config
    };
  }
}

// יצירת מופע גלובלי
let globalHeaderSystem = null;

/**
 * קבלת מופע המערכת הגלובלי
 * @param {Object} options - אפשרויות
 * @returns {HeaderSystem} - מופע המערכת
 */
function getHeaderSystem(options = {}) {
  if (!globalHeaderSystem) {
    globalHeaderSystem = new HeaderSystem(options);
  }
  return globalHeaderSystem;
}

/**
 * יצירת מופע חדש של המערכת
 * @param {Object} options - אפשרויות
 * @returns {HeaderSystem} - מופע חדש של המערכת
 */
function createHeaderSystem(options = {}) {
  return new HeaderSystem(options);
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HeaderSystem,
    getHeaderSystem,
    createHeaderSystem
  };
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.HeaderSystem = HeaderSystem;
  window.getHeaderSystem = getHeaderSystem;
  window.createHeaderSystem = createHeaderSystem;
  
  // יצירת מופע גלובלי אוטומטי
  if (HEADER_CONFIG.SYSTEM.AUTO_INIT) {
    window.addEventListener('DOMContentLoaded', () => {
      globalHeaderSystem = new HeaderSystem();
    });
  }
}

console.log('✅ HeaderSystem נוצר ופועל');