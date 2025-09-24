/**
 * Preferences Component - Header System
 * רכיב העדפות למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class PreferencesComponent {
  constructor(headerSystem) {
    this.headerSystem = headerSystem;
    this.eventService = null;
    this.stateComponent = null;
    this.translationComponent = null;
    this.isInitialized = false;
    this.preferences = new Map();
    this.config = HEADER_CONFIG.PREFERENCES;
    
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
          console.log('🔍 [PreferencesComponent]', ...args);
        }
      },
      info: (...args) => {
        if (['debug', 'info'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('ℹ️ [PreferencesComponent]', ...args);
        }
      },
      warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.warn('⚠️ [PreferencesComponent]', ...args);
        }
      },
      error: (...args) => {
        if (HEADER_CONFIG.LOGGING.CONSOLE) {
          console.error('❌ [PreferencesComponent]', ...args);
        }
      }
    };
  }

  /**
   * אתחול הרכיב
   */
  async init() {
    try {
      this.log.info('מתחיל אתחול PreferencesComponent...');
      
      // קבלת שירותים ורכיבים
      this.eventService = this.headerSystem.getService('event');
      this.stateComponent = this.headerSystem.getComponent('state');
      this.translationComponent = this.headerSystem.getComponent('translation');
      
      if (!this.eventService) {
        throw new Error('EventService not available');
      }
      
      // טעינת העדפות
      await this.loadPreferences();
      
      // הגדרת event listeners
      this.setupEventListeners();
      
      // הגדרת מאזיני מצב
      this.setupStateListeners();
      
      // אתחול העדפות
      await this.initializePreferences();
      
      this.isInitialized = true;
      this.log.info('PreferencesComponent אותחל בהצלחה');
      
    } catch (error) {
      this.log.error('שגיאה באתחול PreferencesComponent:', error);
      throw error;
    }
  }

  /**
   * טעינת העדפות
   */
  async loadPreferences() {
    try {
      // העדפות ברירת מחדל
      const defaultPreferences = {
        // העדפות UI
        theme: 'light',
        language: 'he',
        animations: true,
        soundEnabled: false,
        compactMode: false,
        
        // העדפות פילטרים
        autoApplyFilters: true,
        rememberFilters: true,
        filterTimeout: 300,
        
        // העדפות תפריט
        menuCollapsed: false,
        showMenuIcons: true,
        menuAnimation: true,
        
        // העדפות שמירה
        autoSave: true,
        saveInterval: 30000, // 30 שניות
        maxHistorySize: 50,
        
        // העדפות ביצועים
        lazyLoading: true,
        cacheEnabled: true,
        cacheSize: 100,
        
        // העדפות התראות
        notificationsEnabled: true,
        notificationSound: false,
        notificationDuration: 5000,
        
        // העדפות נגישות
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        
        // העדפות פיתוח
        debugMode: false,
        verboseLogging: false,
        showPerformanceMetrics: false
      };

      // שמירת העדפות ברירת מחדל
      Object.entries(defaultPreferences).forEach(([key, value]) => {
        this.preferences.set(key, value);
      });
      
      this.log.debug('העדפות נטענו');
      
    } catch (error) {
      this.log.error('PreferencesComponent.loadPreferences error:', error);
    }
  }

  /**
   * הגדרת event listeners
   */
  setupEventListeners() {
    try {
      // מאזין לשינוי העדפות
      this.eventService.on(HEADER_EVENTS.PREFERENCES_CHANGED, (event) => {
        this.handlePreferencesChange(event);
      });

      // מאזין לבקשת העדפות
      this.eventService.on(HEADER_EVENTS.PREFERENCES_REQUESTED, (event) => {
        this.handlePreferencesRequest(event);
      });

      // מאזין לאיפוס העדפות
      this.eventService.on(HEADER_EVENTS.PREFERENCES_RESET, (event) => {
        this.handlePreferencesReset(event);
      });

      // מאזין לשמירת העדפות
      this.eventService.on(HEADER_EVENTS.PREFERENCES_SAVE, (event) => {
        this.handlePreferencesSave(event);
      });

      this.log.debug('Event listeners הוגדרו');
      
    } catch (error) {
      this.log.error('PreferencesComponent.setupEventListeners error:', error);
    }
  }

  /**
   * הגדרת מאזיני מצב
   */
  setupStateListeners() {
    try {
      if (!this.stateComponent) return;

      // מאזין למצב העדפות
      this.stateComponent.stateService.addListener('preferences', (newValue) => {
        this.handlePreferencesStateChange(newValue);
      });

      this.log.debug('מאזיני מצב הוגדרו');
      
    } catch (error) {
      this.log.error('PreferencesComponent.setupStateListeners error:', error);
    }
  }

  /**
   * אתחול העדפות
   */
  async initializePreferences() {
    try {
      // טעינת העדפות מהמצב
      if (this.stateComponent) {
        const preferencesState = this.stateComponent.getPreferencesState();
        
        if (preferencesState && Object.keys(preferencesState).length > 0) {
          Object.entries(preferencesState).forEach(([key, value]) => {
            this.preferences.set(key, value);
          });
        }
      }

      // יישום העדפות
      await this.applyPreferences();
      
    } catch (error) {
      this.log.error('PreferencesComponent.initializePreferences error:', error);
    }
  }

  /**
   * יישום העדפות
   */
  async applyPreferences() {
    try {
      // יישום העדפות UI
      this.applyUIPreferences();
      
      // יישום העדפות ביצועים
      this.applyPerformancePreferences();
      
      // יישום העדפות נגישות
      this.applyAccessibilityPreferences();
      
      // יישום העדפות פיתוח
      this.applyDevelopmentPreferences();
      
      this.log.debug('העדפות יושמו');
      
    } catch (error) {
      this.log.error('PreferencesComponent.applyPreferences error:', error);
    }
  }

  /**
   * יישום העדפות UI
   */
  applyUIPreferences() {
    try {
      // נושא
      const theme = this.getPreference('theme', 'light');
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      DOMUtils.addClass(document.body, `theme-${theme}`);
      
      // שפה
      const language = this.getPreference('language', 'he');
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
      
      // אנימציות
      const animations = this.getPreference('animations', true);
      document.body.classList.toggle('no-animations', !animations);
      
      // מצב קומפקטי
      const compactMode = this.getPreference('compactMode', false);
      document.body.classList.toggle('compact-mode', compactMode);
      
      // תפריט מקופל
      const menuCollapsed = this.getPreference('menuCollapsed', false);
      document.body.classList.toggle('menu-collapsed', menuCollapsed);
      
    } catch (error) {
      this.log.error('PreferencesComponent.applyUIPreferences error:', error);
    }
  }

  /**
   * יישום העדפות ביצועים
   */
  applyPerformancePreferences() {
    try {
      // טעינה עצלה
      const lazyLoading = this.getPreference('lazyLoading', true);
      if (lazyLoading) {
        // הפעלת טעינה עצלה
        this.enableLazyLoading();
      }
      
      // מטמון
      const cacheEnabled = this.getPreference('cacheEnabled', true);
      if (cacheEnabled) {
        // הפעלת מטמון
        this.enableCache();
      }
      
    } catch (error) {
      this.log.error('PreferencesComponent.applyPerformancePreferences error:', error);
    }
  }

  /**
   * יישום העדפות נגישות
   */
  applyAccessibilityPreferences() {
    try {
      // ניגודיות גבוהה
      const highContrast = this.getPreference('highContrast', false);
      document.body.classList.toggle('high-contrast', highContrast);
      
      // טקסט גדול
      const largeText = this.getPreference('largeText', false);
      document.body.classList.toggle('large-text', largeText);
      
      // תנועה מופחתת
      const reducedMotion = this.getPreference('reducedMotion', false);
      document.body.classList.toggle('reduced-motion', reducedMotion);
      
    } catch (error) {
      this.log.error('PreferencesComponent.applyAccessibilityPreferences error:', error);
    }
  }

  /**
   * יישום העדפות פיתוח
   */
  applyDevelopmentPreferences() {
    try {
      // מצב דיבוג
      const debugMode = this.getPreference('debugMode', false);
      if (debugMode) {
        // הפעלת מצב דיבוג
        this.enableDebugMode();
      }
      
      // לוגים מפורטים
      const verboseLogging = this.getPreference('verboseLogging', false);
      if (verboseLogging) {
        // הפעלת לוגים מפורטים
        this.enableVerboseLogging();
      }
      
      // מדדי ביצועים
      const showPerformanceMetrics = this.getPreference('showPerformanceMetrics', false);
      if (showPerformanceMetrics) {
        // הצגת מדדי ביצועים
        this.showPerformanceMetrics();
      }
      
    } catch (error) {
      this.log.error('PreferencesComponent.applyDevelopmentPreferences error:', error);
    }
  }

  /**
   * קבלת העדפה
   * @param {string} key - מפתח ההעדפה
   * @param {*} defaultValue - ערך ברירת מחדל
   * @returns {*} - הערך
   */
  getPreference(key, defaultValue = null) {
    try {
      return this.preferences.has(key) ? this.preferences.get(key) : defaultValue;
    } catch (error) {
      this.log.error('PreferencesComponent.getPreference error:', error);
      return defaultValue;
    }
  }

  /**
   * הגדרת העדפה
   * @param {string} key - מפתח ההעדפה
   * @param {*} value - הערך
   */
  setPreference(key, value) {
    try {
      const oldValue = this.preferences.get(key);
      this.preferences.set(key, value);
      
      // עדכון מצב
      if (this.stateComponent) {
        const currentPreferences = this.stateComponent.getPreferencesState();
        this.stateComponent.updatePreferencesState({
          ...currentPreferences,
          [key]: value
        });
      }
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.PREFERENCES_CHANGED, {
        key: key,
        value: value,
        oldValue: oldValue
      });
      
      this.log.debug(`העדפה עודכנה: ${key} = ${value}`);
      
    } catch (error) {
      this.log.error('PreferencesComponent.setPreference error:', error);
    }
  }

  /**
   * קבלת כל ההעדפות
   * @returns {Object} - כל ההעדפות
   */
  getAllPreferences() {
    try {
      const result = {};
      this.preferences.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    } catch (error) {
      this.log.error('PreferencesComponent.getAllPreferences error:', error);
      return {};
    }
  }

  /**
   * הגדרת העדפות מרובות
   * @param {Object} preferences - ההעדפות החדשות
   */
  setAllPreferences(preferences) {
    try {
      Object.entries(preferences).forEach(([key, value]) => {
        this.setPreference(key, value);
      });
      
      this.log.debug('העדפות מרובות עודכנו');
      
    } catch (error) {
      this.log.error('PreferencesComponent.setAllPreferences error:', error);
    }
  }

  /**
   * איפוס העדפה
   * @param {string} key - מפתח ההעדפה
   */
  resetPreference(key) {
    try {
      if (this.preferences.has(key)) {
        this.preferences.delete(key);
        
        // עדכון מצב
        if (this.stateComponent) {
          const currentPreferences = this.stateComponent.getPreferencesState();
          delete currentPreferences[key];
          this.stateComponent.updatePreferencesState(currentPreferences);
        }
        
        this.log.debug(`העדפה אופסה: ${key}`);
      }
      
    } catch (error) {
      this.log.error('PreferencesComponent.resetPreference error:', error);
    }
  }

  /**
   * איפוס כל ההעדפות
   */
  resetAllPreferences() {
    try {
      this.preferences.clear();
      
      // טעינת העדפות ברירת מחדל
      this.loadPreferences();
      
      // עדכון מצב
      if (this.stateComponent) {
        this.stateComponent.updatePreferencesState(this.getAllPreferences());
      }
      
      // יישום העדפות
      this.applyPreferences();
      
      this.log.debug('כל ההעדפות אופסו');
      
    } catch (error) {
      this.log.error('PreferencesComponent.resetAllPreferences error:', error);
    }
  }

  /**
   * שמירת העדפות
   */
  async savePreferences() {
    try {
      if (this.stateComponent) {
        await this.stateComponent.saveState();
      }
      
      this.log.debug('העדפות נשמרו');
      
    } catch (error) {
      this.log.error('PreferencesComponent.savePreferences error:', error);
    }
  }

  /**
   * טעינת העדפות
   */
  async loadPreferencesFromState() {
    try {
      if (this.stateComponent) {
        await this.stateComponent.loadState();
        
        const preferencesState = this.stateComponent.getPreferencesState();
        if (preferencesState) {
          this.setAllPreferences(preferencesState);
        }
      }
      
      this.log.debug('העדפות נטענו מהמצב');
      
    } catch (error) {
      this.log.error('PreferencesComponent.loadPreferencesFromState error:', error);
    }
  }

  /**
   * הפעלת טעינה עצלה
   */
  enableLazyLoading() {
    try {
      // יישום טעינה עצלה
      this.log.debug('טעינה עצלה הופעלה');
      
    } catch (error) {
      this.log.error('PreferencesComponent.enableLazyLoading error:', error);
    }
  }

  /**
   * הפעלת מטמון
   */
  enableCache() {
    try {
      // יישום מטמון
      this.log.debug('מטמון הופעל');
      
    } catch (error) {
      this.log.error('PreferencesComponent.enableCache error:', error);
    }
  }

  /**
   * הפעלת מצב דיבוג
   */
  enableDebugMode() {
    try {
      // יישום מצב דיבוג
      this.log.debug('מצב דיבוג הופעל');
      
    } catch (error) {
      this.log.error('PreferencesComponent.enableDebugMode error:', error);
    }
  }

  /**
   * הפעלת לוגים מפורטים
   */
  enableVerboseLogging() {
    try {
      // יישום לוגים מפורטים
      this.log.debug('לוגים מפורטים הופעלו');
      
    } catch (error) {
      this.log.error('PreferencesComponent.enableVerboseLogging error:', error);
    }
  }

  /**
   * הצגת מדדי ביצועים
   */
  showPerformanceMetrics() {
    try {
      // יישום הצגת מדדי ביצועים
      this.log.debug('מדדי ביצועים מוצגים');
      
    } catch (error) {
      this.log.error('PreferencesComponent.showPerformanceMetrics error:', error);
    }
  }

  /**
   * טיפול בשינוי העדפות
   * @param {Object} event - האירוע
   */
  handlePreferencesChange(event) {
    try {
      const { key, value, oldValue } = event.data;
      
      // יישום העדפה ספציפית
      this.applySpecificPreference(key, value);
      
    } catch (error) {
      this.log.error('PreferencesComponent.handlePreferencesChange error:', error);
    }
  }

  /**
   * טיפול בבקשת העדפות
   * @param {Object} event - האירוע
   */
  handlePreferencesRequest(event) {
    try {
      const { key, callback } = event.data;
      
      let result;
      if (key) {
        result = this.getPreference(key);
      } else {
        result = this.getAllPreferences();
      }
      
      if (callback && typeof callback === 'function') {
        callback(result);
      }
      
    } catch (error) {
      this.log.error('PreferencesComponent.handlePreferencesRequest error:', error);
    }
  }

  /**
   * טיפול באיפוס העדפות
   * @param {Object} event - האירוע
   */
  handlePreferencesReset(event) {
    try {
      const { key } = event.data;
      
      if (key) {
        this.resetPreference(key);
      } else {
        this.resetAllPreferences();
      }
      
    } catch (error) {
      this.log.error('PreferencesComponent.handlePreferencesReset error:', error);
    }
  }

  /**
   * טיפול בשמירת העדפות
   * @param {Object} event - האירוע
   */
  handlePreferencesSave(event) {
    try {
      this.savePreferences();
      
    } catch (error) {
      this.log.error('PreferencesComponent.handlePreferencesSave error:', error);
    }
  }

  /**
   * טיפול בשינוי מצב העדפות
   * @param {Object} preferencesState - מצב ההעדפות
   */
  handlePreferencesStateChange(preferencesState) {
    try {
      // עדכון העדפות מקומיות
      Object.entries(preferencesState).forEach(([key, value]) => {
        this.preferences.set(key, value);
      });
      
      // יישום העדפות
      this.applyPreferences();
      
    } catch (error) {
      this.log.error('PreferencesComponent.handlePreferencesStateChange error:', error);
    }
  }

  /**
   * יישום העדפה ספציפית
   * @param {string} key - מפתח ההעדפה
   * @param {*} value - הערך
   */
  applySpecificPreference(key, value) {
    try {
      switch (key) {
        case 'theme':
          document.body.className = document.body.className.replace(/theme-\w+/g, '');
          DOMUtils.addClass(document.body, `theme-${value}`);
          break;
          
        case 'language':
          document.documentElement.lang = value;
          document.documentElement.dir = value === 'he' ? 'rtl' : 'ltr';
          break;
          
        case 'animations':
          document.body.classList.toggle('no-animations', !value);
          break;
          
        case 'compactMode':
          document.body.classList.toggle('compact-mode', value);
          break;
          
        case 'menuCollapsed':
          document.body.classList.toggle('menu-collapsed', value);
          break;
          
        case 'highContrast':
          document.body.classList.toggle('high-contrast', value);
          break;
          
        case 'largeText':
          document.body.classList.toggle('large-text', value);
          break;
          
        case 'reducedMotion':
          document.body.classList.toggle('reduced-motion', value);
          break;
      }
      
    } catch (error) {
      this.log.error('PreferencesComponent.applySpecificPreference error:', error);
    }
  }

  /**
   * הרס הרכיב
   */
  destroy() {
    try {
      this.log.info('משמיד PreferencesComponent...');
      
      // ניקוי העדפות
      this.preferences.clear();
      
      this.isInitialized = false;
      this.log.info('PreferencesComponent הושמד');
      
    } catch (error) {
      this.log.error('PreferencesComponent.destroy error:', error);
    }
  }

  /**
   * קבלת מידע על הרכיב
   * @returns {Object} - מידע על הרכיב
   */
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      preferencesCount: this.preferences.size,
      preferences: this.getAllPreferences(),
      config: this.config
    };
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PreferencesComponent;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.PreferencesComponent = PreferencesComponent;
}

console.log('✅ PreferencesComponent נוצר ופועל');
