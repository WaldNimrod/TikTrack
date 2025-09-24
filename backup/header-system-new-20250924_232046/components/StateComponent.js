/**
 * State Component - Header System
 * רכיב ניהול מצב למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class StateComponent {
  constructor(headerSystem) {
    this.headerSystem = headerSystem;
    this.stateService = null;
    this.eventService = null;
    this.isInitialized = false;
    this.stateListeners = new Map();
    this.config = HEADER_CONFIG.STATE;
    
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
          console.log('🔍 [StateComponent]', ...args);
        }
      },
      info: (...args) => {
        if (['debug', 'info'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('ℹ️ [StateComponent]', ...args);
        }
      },
      warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.warn('⚠️ [StateComponent]', ...args);
        }
      },
      error: (...args) => {
        if (HEADER_CONFIG.LOGGING.CONSOLE) {
          console.error('❌ [StateComponent]', ...args);
        }
      }
    };
  }

  /**
   * אתחול הרכיב
   */
  async init() {
    try {
      this.log.info('מתחיל אתחול StateComponent...');
      
      // קבלת שירותים
      this.stateService = this.headerSystem.getService('state');
      this.eventService = this.headerSystem.getService('event');
      
      if (!this.stateService || !this.eventService) {
        throw new Error('Required services not available');
      }
      
      // הגדרת מאזינים
      this.setupStateListeners();
      
      // טעינת מצב ראשוני
      await this.loadInitialState();
      
      // הגדרת event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      this.log.info('StateComponent אותחל בהצלחה');
      
    } catch (error) {
      this.log.error('שגיאה באתחול StateComponent:', error);
      throw error;
    }
  }

  /**
   * הגדרת מאזיני מצב
   */
  setupStateListeners() {
    try {
      // מאזין למצב פילטרים
      this.stateService.addListener('filters', (newValue, oldValue) => {
        this.handleFiltersChange(newValue, oldValue);
      });

      // מאזין למצב תפריט
      this.stateService.addListener('menu', (newValue, oldValue) => {
        this.handleMenuChange(newValue, oldValue);
      });

      // מאזין למצב UI
      this.stateService.addListener('ui', (newValue, oldValue) => {
        this.handleUIChange(newValue, oldValue);
      });

      // מאזין למצב העדפות
      this.stateService.addListener('preferences', (newValue, oldValue) => {
        this.handlePreferencesChange(newValue, oldValue);
      });

      this.log.debug('מאזיני מצב הוגדרו');
      
    } catch (error) {
      this.log.error('StateComponent.setupStateListeners error:', error);
    }
  }

  /**
   * טעינת מצב ראשוני
   */
  async loadInitialState() {
    try {
      // מצב ברירת מחדל
      const defaultState = {
        filters: {
          status: 'all',
          type: 'all',
          account: 'all',
          dateRange: 'all',
          search: ''
        },
        menu: {
          isOpen: false,
          activeItem: null,
          submenuOpen: null
        },
        ui: {
          theme: 'light',
          language: 'he',
          sidebarCollapsed: false,
          notificationsEnabled: true
        },
        preferences: {
          autoSave: true,
          animations: true,
          soundEnabled: false,
          compactMode: false
        }
      };

      // הגדרת מצב ברירת מחדל אם לא קיים
      Object.entries(defaultState).forEach(([key, value]) => {
        if (!this.stateService.has(key)) {
          this.stateService.set(key, value, { silent: true });
        }
      });

      this.log.debug('מצב ראשוני נטען');
      
    } catch (error) {
      this.log.error('StateComponent.loadInitialState error:', error);
    }
  }

  /**
   * הגדרת event listeners
   */
  setupEventListeners() {
    try {
      // מאזין לשינויי פילטרים
      this.eventService.on(HEADER_EVENTS.FILTER_CHANGED, (event) => {
        this.handleFilterEvent(event);
      });

      // מאזין לשינויי תפריט
      this.eventService.on(HEADER_EVENTS.MENU_CHANGED, (event) => {
        this.handleMenuEvent(event);
      });

      // מאזין לשינויי UI
      this.eventService.on(HEADER_EVENTS.UI_CHANGED, (event) => {
        this.handleUIEvent(event);
      });

      // מאזין לשינויי העדפות
      this.eventService.on(HEADER_EVENTS.PREFERENCES_CHANGED, (event) => {
        this.handlePreferencesEvent(event);
      });

      this.log.debug('Event listeners הוגדרו');
      
    } catch (error) {
      this.log.error('StateComponent.setupEventListeners error:', error);
    }
  }

  /**
   * טיפול בשינוי פילטרים
   * @param {*} newValue - הערך החדש
   * @param {*} oldValue - הערך הישן
   */
  handleFiltersChange(newValue, oldValue) {
    try {
      this.log.debug('שינוי פילטרים:', { newValue, oldValue });
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.FILTER_STATE_CHANGED, {
        filters: newValue,
        previousFilters: oldValue
      });
      
    } catch (error) {
      this.log.error('StateComponent.handleFiltersChange error:', error);
    }
  }

  /**
   * טיפול בשינוי תפריט
   * @param {*} newValue - הערך החדש
   * @param {*} oldValue - הערך הישן
   */
  handleMenuChange(newValue, oldValue) {
    try {
      this.log.debug('שינוי תפריט:', { newValue, oldValue });
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.MENU_STATE_CHANGED, {
        menu: newValue,
        previousMenu: oldValue
      });
      
    } catch (error) {
      this.log.error('StateComponent.handleMenuChange error:', error);
    }
  }

  /**
   * טיפול בשינוי UI
   * @param {*} newValue - הערך החדש
   * @param {*} oldValue - הערך הישן
   */
  handleUIChange(newValue, oldValue) {
    try {
      this.log.debug('שינוי UI:', { newValue, oldValue });
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.UI_STATE_CHANGED, {
        ui: newValue,
        previousUI: oldValue
      });
      
    } catch (error) {
      this.log.error('StateComponent.handleUIChange error:', error);
    }
  }

  /**
   * טיפול בשינוי העדפות
   * @param {*} newValue - הערך החדש
   * @param {*} oldValue - הערך הישן
   */
  handlePreferencesChange(newValue, oldValue) {
    try {
      this.log.debug('שינוי העדפות:', { newValue, oldValue });
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.PREFERENCES_STATE_CHANGED, {
        preferences: newValue,
        previousPreferences: oldValue
      });
      
    } catch (error) {
      this.log.error('StateComponent.handlePreferencesChange error:', error);
    }
  }

  /**
   * טיפול באירוע פילטר
   * @param {Object} event - האירוע
   */
  handleFilterEvent(event) {
    try {
      const { filterType, value } = event.data;
      
      // עדכון מצב הפילטרים
      const currentFilters = this.stateService.get('filters', {});
      const newFilters = {
        ...currentFilters,
        [filterType]: value
      };
      
      this.stateService.set('filters', newFilters);
      
    } catch (error) {
      this.log.error('StateComponent.handleFilterEvent error:', error);
    }
  }

  /**
   * טיפול באירוע תפריט
   * @param {Object} event - האירוע
   */
  handleMenuEvent(event) {
    try {
      const { action, data } = event.data;
      
      // עדכון מצב התפריט
      const currentMenu = this.stateService.get('menu', {});
      let newMenu = { ...currentMenu };
      
      switch (action) {
        case 'toggle':
          newMenu.isOpen = !newMenu.isOpen;
          break;
        case 'setActive':
          newMenu.activeItem = data.item;
          break;
        case 'setSubmenu':
          newMenu.submenuOpen = data.submenu;
          break;
        case 'close':
          newMenu.isOpen = false;
          newMenu.submenuOpen = null;
          break;
      }
      
      this.stateService.set('menu', newMenu);
      
    } catch (error) {
      this.log.error('StateComponent.handleMenuEvent error:', error);
    }
  }

  /**
   * טיפול באירוע UI
   * @param {Object} event - האירוע
   */
  handleUIEvent(event) {
    try {
      const { property, value } = event.data;
      
      // עדכון מצב UI
      const currentUI = this.stateService.get('ui', {});
      const newUI = {
        ...currentUI,
        [property]: value
      };
      
      this.stateService.set('ui', newUI);
      
    } catch (error) {
      this.log.error('StateComponent.handleUIEvent error:', error);
    }
  }

  /**
   * טיפול באירוע העדפות
   * @param {Object} event - האירוע
   */
  handlePreferencesEvent(event) {
    try {
      const { property, value } = event.data;
      
      // עדכון מצב העדפות
      const currentPreferences = this.stateService.get('preferences', {});
      const newPreferences = {
        ...currentPreferences,
        [property]: value
      };
      
      this.stateService.set('preferences', newPreferences);
      
    } catch (error) {
      this.log.error('StateComponent.handlePreferencesEvent error:', error);
    }
  }

  /**
   * קבלת מצב פילטרים
   * @returns {Object} - מצב הפילטרים
   */
  getFiltersState() {
    return this.stateService.get('filters', {});
  }

  /**
   * קבלת מצב תפריט
   * @returns {Object} - מצב התפריט
   */
  getMenuState() {
    return this.stateService.get('menu', {});
  }

  /**
   * קבלת מצב UI
   * @returns {Object} - מצב UI
   */
  getUIState() {
    return this.stateService.get('ui', {});
  }

  /**
   * קבלת מצב העדפות
   * @returns {Object} - מצב העדפות
   */
  getPreferencesState() {
    return this.stateService.get('preferences', {});
  }

  /**
   * עדכון מצב פילטרים
   * @param {Object} filters - הפילטרים החדשים
   */
  updateFiltersState(filters) {
    try {
      this.stateService.set('filters', filters);
      this.log.debug('מצב פילטרים עודכן:', filters);
    } catch (error) {
      this.log.error('StateComponent.updateFiltersState error:', error);
    }
  }

  /**
   * עדכון מצב תפריט
   * @param {Object} menu - מצב התפריט החדש
   */
  updateMenuState(menu) {
    try {
      this.stateService.set('menu', menu);
      this.log.debug('מצב תפריט עודכן:', menu);
    } catch (error) {
      this.log.error('StateComponent.updateMenuState error:', error);
    }
  }

  /**
   * עדכון מצב UI
   * @param {Object} ui - מצב UI החדש
   */
  updateUIState(ui) {
    try {
      this.stateService.set('ui', ui);
      this.log.debug('מצב UI עודכן:', ui);
    } catch (error) {
      this.log.error('StateComponent.updateUIState error:', error);
    }
  }

  /**
   * עדכון מצב העדפות
   * @param {Object} preferences - מצב העדפות החדש
   */
  updatePreferencesState(preferences) {
    try {
      this.stateService.set('preferences', preferences);
      this.log.debug('מצב העדפות עודכן:', preferences);
    } catch (error) {
      this.log.error('StateComponent.updatePreferencesState error:', error);
    }
  }

  /**
   * איפוס מצב פילטרים
   */
  resetFiltersState() {
    try {
      const defaultFilters = {
        status: 'all',
        type: 'all',
        account: 'all',
        dateRange: 'all',
        search: ''
      };
      
      this.updateFiltersState(defaultFilters);
      this.log.debug('מצב פילטרים אופס');
    } catch (error) {
      this.log.error('StateComponent.resetFiltersState error:', error);
    }
  }

  /**
   * איפוס מצב תפריט
   */
  resetMenuState() {
    try {
      const defaultMenu = {
        isOpen: false,
        activeItem: null,
        submenuOpen: null
      };
      
      this.updateMenuState(defaultMenu);
      this.log.debug('מצב תפריט אופס');
    } catch (error) {
      this.log.error('StateComponent.resetMenuState error:', error);
    }
  }

  /**
   * איפוס כל המצב
   */
  resetAllState() {
    try {
      this.resetFiltersState();
      this.resetMenuState();
      
      // איפוס מצב UI והעדפות למצב ברירת מחדל
      const defaultUI = {
        theme: 'light',
        language: 'he',
        sidebarCollapsed: false,
        notificationsEnabled: true
      };
      
      const defaultPreferences = {
        autoSave: true,
        animations: true,
        soundEnabled: false,
        compactMode: false
      };
      
      this.updateUIState(defaultUI);
      this.updatePreferencesState(defaultPreferences);
      
      this.log.debug('כל המצב אופס');
    } catch (error) {
      this.log.error('StateComponent.resetAllState error:', error);
    }
  }

  /**
   * שמירת מצב
   */
  async saveState() {
    try {
      await this.stateService.saveState({ force: true });
      this.log.debug('מצב נשמר');
    } catch (error) {
      this.log.error('StateComponent.saveState error:', error);
    }
  }

  /**
   * טעינת מצב
   */
  async loadState() {
    try {
      await this.stateService.loadState();
      this.log.debug('מצב נטען');
    } catch (error) {
      this.log.error('StateComponent.loadState error:', error);
    }
  }

  /**
   * הרס הרכיב
   */
  destroy() {
    try {
      this.log.info('משמיד StateComponent...');
      
      // ניקוי מאזינים
      this.stateListeners.forEach((listenerId, key) => {
        this.stateService.removeListener(key, listenerId);
      });
      this.stateListeners.clear();
      
      this.isInitialized = false;
      this.log.info('StateComponent הושמד');
      
    } catch (error) {
      this.log.error('StateComponent.destroy error:', error);
    }
  }

  /**
   * קבלת מידע על הרכיב
   * @returns {Object} - מידע על הרכיב
   */
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      stateListenersCount: this.stateListeners.size,
      filtersState: this.getFiltersState(),
      menuState: this.getMenuState(),
      uiState: this.getUIState(),
      preferencesState: this.getPreferencesState()
    };
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateComponent;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.StateComponent = StateComponent;
}

console.log('✅ StateComponent נוצר ופועל');
