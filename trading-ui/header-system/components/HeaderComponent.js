/**
 * Header Component - Header System
 * רכיב כותרת ראשי למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class HeaderComponent {
  constructor(headerSystem) {
    this.headerSystem = headerSystem;
    this.eventService = null;
    this.stateComponent = null;
    this.uiComponent = null;
    this.translationComponent = null;
    this.preferencesComponent = null;
    this.menuComponent = null;
    this.filterComponent = null;
    this.navigationComponent = null;
    this.isInitialized = false;
    this.headerElement = null;
    this.config = HEADER_CONFIG.HEADER;
    
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
          console.log('🔍 [HeaderComponent]', ...args);
        }
      },
      info: (...args) => {
        if (['debug', 'info'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('ℹ️ [HeaderComponent]', ...args);
        }
      },
      warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.warn('⚠️ [HeaderComponent]', ...args);
        }
      },
      error: (...args) => {
        if (HEADER_CONFIG.LOGGING.CONSOLE) {
          console.error('❌ [HeaderComponent]', ...args);
        }
      }
    };
  }

  /**
   * אתחול הרכיב
   */
  async init() {
    try {
      this.log.info('מתחיל אתחול HeaderComponent...');
      
      // קבלת כל הרכיבים
      this.eventService = this.headerSystem.getService('event');
      this.stateComponent = this.headerSystem.getComponent('state');
      this.uiComponent = this.headerSystem.getComponent('ui');
      this.translationComponent = this.headerSystem.getComponent('translation');
      this.preferencesComponent = this.headerSystem.getComponent('preferences');
      this.menuComponent = this.headerSystem.getComponent('menu');
      this.filterComponent = this.headerSystem.getComponent('filter');
      this.navigationComponent = this.headerSystem.getComponent('navigation');
      
      if (!this.eventService) {
        throw new Error('EventService not available');
      }
      
      // אתחול כל הרכיבים
      await this.initializeComponents();
      
      // יצירת הכותרת
      await this.createHeader();
      
      // הגדרת event listeners
      this.setupEventListeners();
      
      // הגדרת מאזיני מצב
      this.setupStateListeners();
      
      // אתחול הכותרת
      await this.initializeHeader();
      
      this.isInitialized = true;
      this.log.info('HeaderComponent אותחל בהצלחה');
      
    } catch (error) {
      this.log.error('שגיאה באתחול HeaderComponent:', error);
      throw error;
    }
  }

  /**
   * אתחול כל הרכיבים
   */
  async initializeComponents() {
    try {
      this.log.debug('מאתחל רכיבים...');
      
      // אתחול רכיבים בסיסיים
      if (this.stateComponent) {
        await this.stateComponent.init();
      }
      
      if (this.translationComponent) {
        await this.translationComponent.init();
      }
      
      if (this.preferencesComponent) {
        await this.preferencesComponent.init();
      }
      
      // אתחול רכיבים פונקציונליים
      if (this.menuComponent) {
        await this.menuComponent.init();
      }
      
      if (this.filterComponent) {
        await this.filterComponent.init();
      }
      
      if (this.navigationComponent) {
        await this.navigationComponent.init();
      }
      
      // אתחול רכיב UI
      if (this.uiComponent) {
        await this.uiComponent.init();
      }
      
      this.log.debug('כל הרכיבים אותחלו');
      
    } catch (error) {
      this.log.error('HeaderComponent.initializeComponents error:', error);
    }
  }

  /**
   * יצירת הכותרת
   */
  async createHeader() {
    try {
      this.log.debug('יוצר כותרת...');
      
      // הסרת כותרת קיימת
      const existingHeader = DOMUtils.select('#unified-header');
      if (existingHeader) {
        DOMUtils.remove(existingHeader);
      }
      
      // יצירת אלמנט כותרת ראשי
      this.headerElement = DOMUtils.create('div', {
        id: 'unified-header',
        className: 'header-container'
      });
      
      // יצירת מבנה הכותרת
      this.headerElement.innerHTML = this.getHeaderHTML();
      
      // הוספה לדף
      DOMUtils.append(document.body, this.headerElement);
      
      this.log.debug('כותרת נוצרה');
      
    } catch (error) {
      this.log.error('HeaderComponent.createHeader error:', error);
    }
  }

  /**
   * קבלת HTML הכותרת
   * @returns {string} - HTML הכותרת
   */
  getHeaderHTML() {
    return `
      <div class="header-top">
        <div class="logo-section">
          <div class="logo">
            <img src="/trading-ui/assets/logo.png" alt="TikTrack" class="logo-image">
            <span class="logo-text">TikTrack</span>
          </div>
        </div>
        <div class="header-nav">
          <nav class="main-nav" id="mainNavigation"></nav>
        </div>
        <div class="header-actions">
          <button class="cache-clear-btn" id="cacheClearBtn" title="ניקוי מטמון">
            <span class="cache-icon">🗑️</span>
          </button>
          <button class="menu-filter-toggle-section" id="filterToggleBtn" title="הצג/הסתר פילטרים">
            <span class="filter-icon">🔍</span>
          </button>
        </div>
      </div>
      <div class="filters-container" id="headerFilters">
        <div class="header-filters" id="headerFiltersContent"></div>
      </div>
    `;
  }

  /**
   * הגדרת event listeners
   */
  setupEventListeners() {
    try {
      // מאזין לשינויי כותרת
      this.eventService.on(HEADER_EVENTS.HEADER_CHANGED, (event) => {
        this.handleHeaderChange(event);
      });

      // מאזין לשינויי מצב
      this.eventService.on(HEADER_EVENTS.STATE_CHANGED, (event) => {
        this.handleStateChange(event);
      });

      // מאזין לשינויי UI
      this.eventService.on(HEADER_EVENTS.UI_CHANGED, (event) => {
        this.handleUIChange(event);
      });

      // מאזין לשינויי העדפות
      this.eventService.on(HEADER_EVENTS.PREFERENCES_CHANGED, (event) => {
        this.handlePreferencesChange(event);
      });

      // מאזין לשינויי שפה
      this.eventService.on(HEADER_EVENTS.LANGUAGE_CHANGED, (event) => {
        this.handleLanguageChange(event);
      });

      // מאזין ללחיצות כפתורים
      this.eventService.on(HEADER_EVENTS.BUTTON_CLICKED, (event) => {
        this.handleButtonClick(event);
      });

      this.log.debug('Event listeners הוגדרו');
      
    } catch (error) {
      this.log.error('HeaderComponent.setupEventListeners error:', error);
    }
  }

  /**
   * הגדרת מאזיני מצב
   */
  setupStateListeners() {
    try {
      if (!this.stateComponent) return;

      // מאזין למצב פילטרים
      this.stateComponent.stateService.addListener('filters', (newValue) => {
        this.handleFiltersStateChange(newValue);
      });

      // מאזין למצב תפריט
      this.stateComponent.stateService.addListener('menu', (newValue) => {
        this.handleMenuStateChange(newValue);
      });

      // מאזין למצב UI
      this.stateComponent.stateService.addListener('ui', (newValue) => {
        this.handleUIStateChange(newValue);
      });

      // מאזין למצב העדפות
      this.stateComponent.stateService.addListener('preferences', (newValue) => {
        this.handlePreferencesStateChange(newValue);
      });

      this.log.debug('מאזיני מצב הוגדרו');
      
    } catch (error) {
      this.log.error('HeaderComponent.setupStateListeners error:', error);
    }
  }

  /**
   * אתחול הכותרת
   */
  async initializeHeader() {
    try {
      // הגדרת event listeners לכפתורים
      this.setupButtonEventListeners();
      
      // עדכון UI ראשוני
      this.updateHeaderUI();
      
      // יישום העדפות
      this.applyPreferences();
      
      this.log.debug('כותרת אותחלה');
      
    } catch (error) {
      this.log.error('HeaderComponent.initializeHeader error:', error);
    }
  }

  /**
   * הגדרת event listeners לכפתורים
   */
  setupButtonEventListeners() {
    try {
      // כפתור ניקוי מטמון
      const cacheClearBtn = DOMUtils.select('#cacheClearBtn');
      if (cacheClearBtn) {
        EventUtils.addListener(cacheClearBtn, 'click', (event) => {
          this.handleCacheClear(event);
        });
      }

      // כפתור הצג/הסתר פילטרים
      const filterToggleBtn = DOMUtils.select('#filterToggleBtn');
      if (filterToggleBtn) {
        EventUtils.addListener(filterToggleBtn, 'click', (event) => {
          this.handleFilterToggle(event);
        });
      }

      this.log.debug('Event listeners לכפתורים הוגדרו');
      
    } catch (error) {
      this.log.error('HeaderComponent.setupButtonEventListeners error:', error);
    }
  }

  /**
   * עדכון UI הכותרת
   */
  updateHeaderUI() {
    try {
      // עדכון נושא
      if (this.preferencesComponent) {
        const theme = this.preferencesComponent.getPreference('theme', 'light');
        this.updateHeaderTheme(theme);
      }

      // עדכון שפה
      if (this.translationComponent) {
        const language = this.translationComponent.getCurrentLanguage();
        this.updateHeaderLanguage(language);
      }

      // עדכון מצב פילטרים
      this.updateFiltersVisibility();

      this.log.debug('UI הכותרת עודכן');
      
    } catch (error) {
      this.log.error('HeaderComponent.updateHeaderUI error:', error);
    }
  }

  /**
   * יישום העדפות
   */
  applyPreferences() {
    try {
      if (!this.preferencesComponent) return;

      // יישום נושא
      const theme = this.preferencesComponent.getPreference('theme', 'light');
      this.updateHeaderTheme(theme);

      // יישום שפה
      const language = this.preferencesComponent.getPreference('language', 'he');
      this.updateHeaderLanguage(language);

      // יישום אנימציות
      const animations = this.preferencesComponent.getPreference('animations', true);
      this.updateHeaderAnimations(animations);

      // יישום מצב קומפקטי
      const compactMode = this.preferencesComponent.getPreference('compactMode', false);
      this.updateHeaderCompactMode(compactMode);

      this.log.debug('העדפות יושמו');
      
    } catch (error) {
      this.log.error('HeaderComponent.applyPreferences error:', error);
    }
  }

  /**
   * עדכון נושא הכותרת
   * @param {string} theme - הנושא
   */
  updateHeaderTheme(theme) {
    try {
      if (this.headerElement) {
        // הסרת מחלקות נושא קיימות
        DOMUtils.removeClass(this.headerElement, 'theme-light');
        DOMUtils.removeClass(this.headerElement, 'theme-dark');
        
        // הוספת מחלקת נושא חדשה
        DOMUtils.addClass(this.headerElement, `theme-${theme}`);
      }
      
    } catch (error) {
      this.log.error('HeaderComponent.updateHeaderTheme error:', error);
    }
  }

  /**
   * עדכון שפת הכותרת
   * @param {string} language - השפה
   */
  updateHeaderLanguage(language) {
    try {
      if (this.headerElement) {
        this.headerElement.lang = language;
        this.headerElement.dir = language === 'he' ? 'rtl' : 'ltr';
      }
      
    } catch (error) {
      this.log.error('HeaderComponent.updateHeaderLanguage error:', error);
    }
  }

  /**
   * עדכון אנימציות הכותרת
   * @param {boolean} animations - האם להציג אנימציות
   */
  updateHeaderAnimations(animations) {
    try {
      if (this.headerElement) {
        DOMUtils.toggleClass(this.headerElement, 'no-animations', !animations);
      }
      
    } catch (error) {
      this.log.error('HeaderComponent.updateHeaderAnimations error:', error);
    }
  }

  /**
   * עדכון מצב קומפקטי
   * @param {boolean} compactMode - האם במצב קומפקטי
   */
  updateHeaderCompactMode(compactMode) {
    try {
      if (this.headerElement) {
        DOMUtils.toggleClass(this.headerElement, 'compact-mode', compactMode);
      }
      
    } catch (error) {
      this.log.error('HeaderComponent.updateHeaderCompactMode error:', error);
    }
  }

  /**
   * עדכון נראות פילטרים
   */
  updateFiltersVisibility() {
    try {
      const filtersContainer = DOMUtils.select('#headerFilters');
      if (filtersContainer) {
        // קבלת מצב פילטרים מהמצב
        let filtersVisible = true;
        
        if (this.stateComponent) {
          const uiState = this.stateComponent.getUIState();
          filtersVisible = uiState.filtersVisible !== false;
        }
        
        DOMUtils.toggleClass(filtersContainer, 'filters-visible', filtersVisible);
      }
      
    } catch (error) {
      this.log.error('HeaderComponent.updateFiltersVisibility error:', error);
    }
  }

  /**
   * טיפול בשינוי כותרת
   * @param {Object} event - האירוע
   */
  handleHeaderChange(event) {
    try {
      const { action, data } = event.data;
      
      switch (action) {
        case 'update':
          this.updateHeader(data);
          break;
        case 'refresh':
          this.refreshHeader();
          break;
        case 'destroy':
          this.destroyHeader();
          break;
      }
      
    } catch (error) {
      this.log.error('HeaderComponent.handleHeaderChange error:', error);
    }
  }

  /**
   * טיפול בשינוי מצב
   * @param {Object} event - האירוע
   */
  handleStateChange(event) {
    try {
      const { stateType, newValue } = event.data;
      
      switch (stateType) {
        case 'filters':
          this.updateFiltersVisibility();
          break;
        case 'menu':
          this.updateMenuVisibility();
          break;
        case 'ui':
          this.updateHeaderUI();
          break;
      }
      
    } catch (error) {
      this.log.error('HeaderComponent.handleStateChange error:', error);
    }
  }

  /**
   * טיפול בשינוי UI
   * @param {Object} event - האירוע
   */
  handleUIChange(event) {
    try {
      const { property, value } = event.data;
      
      switch (property) {
        case 'theme':
          this.updateHeaderTheme(value);
          break;
        case 'language':
          this.updateHeaderLanguage(value);
          break;
        case 'animations':
          this.updateHeaderAnimations(value);
          break;
        case 'compactMode':
          this.updateHeaderCompactMode(value);
          break;
      }
      
    } catch (error) {
      this.log.error('HeaderComponent.handleUIChange error:', error);
    }
  }

  /**
   * טיפול בשינוי העדפות
   * @param {Object} event - האירוע
   */
  handlePreferencesChange(event) {
    try {
      const { key, value } = event.data;
      
      switch (key) {
        case 'theme':
          this.updateHeaderTheme(value);
          break;
        case 'language':
          this.updateHeaderLanguage(value);
          break;
        case 'animations':
          this.updateHeaderAnimations(value);
          break;
        case 'compactMode':
          this.updateHeaderCompactMode(value);
          break;
      }
      
    } catch (error) {
      this.log.error('HeaderComponent.handlePreferencesChange error:', error);
    }
  }

  /**
   * טיפול בשינוי שפה
   * @param {Object} event - האירוע
   */
  handleLanguageChange(event) {
    try {
      const { language } = event.data;
      this.updateHeaderLanguage(language);
      
    } catch (error) {
      this.log.error('HeaderComponent.handleLanguageChange error:', error);
    }
  }

  /**
   * טיפול בלחיצת כפתור
   * @param {Object} event - האירוע
   */
  handleButtonClick(event) {
    try {
      const { buttonId, data } = event.data;
      
      switch (buttonId) {
        case 'cacheClearBtn':
          this.handleCacheClear(event);
          break;
        case 'filterToggleBtn':
          this.handleFilterToggle(event);
          break;
      }
      
    } catch (error) {
      this.log.error('HeaderComponent.handleButtonClick error:', error);
    }
  }

  /**
   * טיפול בניקוי מטמון
   * @param {Event} event - האירוע
   */
  handleCacheClear(event) {
    try {
      event.preventDefault();
      
      // ניקוי מטמון
      if (this.stateComponent) {
        this.stateComponent.stateService.clearState();
      }
      
      // ניקוי localStorage
      localStorage.clear();
      
      // ניקוי sessionStorage
      sessionStorage.clear();
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.CACHE_CLEARED, {
        timestamp: Date.now()
      });
      
      this.log.debug('מטמון נוקה');
      
    } catch (error) {
      this.log.error('HeaderComponent.handleCacheClear error:', error);
    }
  }

  /**
   * טיפול בהצג/הסתר פילטרים
   * @param {Event} event - האירוע
   */
  handleFilterToggle(event) {
    try {
      event.preventDefault();
      
      const filtersContainer = DOMUtils.select('#headerFilters');
      if (filtersContainer) {
        const isVisible = DOMUtils.hasClass(filtersContainer, 'filters-visible');
        
        // החלפת מצב
        DOMUtils.toggleClass(filtersContainer, 'filters-visible', !isVisible);
        
        // עדכון מצב
        if (this.stateComponent) {
          const uiState = this.stateComponent.getUIState();
          this.stateComponent.updateUIState({
            ...uiState,
            filtersVisible: !isVisible
          });
        }
        
        // שליחת אירוע
        this.eventService.emit(HEADER_EVENTS.FILTERS_TOGGLED, {
          visible: !isVisible
        });
      }
      
      this.log.debug('פילטרים הוחלפו');
      
    } catch (error) {
      this.log.error('HeaderComponent.handleFilterToggle error:', error);
    }
  }

  /**
   * טיפול בשינוי מצב פילטרים
   * @param {Object} filtersState - מצב הפילטרים
   */
  handleFiltersStateChange(filtersState) {
    try {
      this.updateFiltersVisibility();
      
    } catch (error) {
      this.log.error('HeaderComponent.handleFiltersStateChange error:', error);
    }
  }

  /**
   * טיפול בשינוי מצב תפריט
   * @param {Object} menuState - מצב התפריט
   */
  handleMenuStateChange(menuState) {
    try {
      this.updateMenuVisibility();
      
    } catch (error) {
      this.log.error('HeaderComponent.handleMenuStateChange error:', error);
    }
  }

  /**
   * טיפול בשינוי מצב UI
   * @param {Object} uiState - מצב UI
   */
  handleUIStateChange(uiState) {
    try {
      this.updateHeaderUI();
      
    } catch (error) {
      this.log.error('HeaderComponent.handleUIStateChange error:', error);
    }
  }

  /**
   * טיפול בשינוי מצב העדפות
   * @param {Object} preferencesState - מצב ההעדפות
   */
  handlePreferencesStateChange(preferencesState) {
    try {
      this.applyPreferences();
      
    } catch (error) {
      this.log.error('HeaderComponent.handlePreferencesStateChange error:', error);
    }
  }

  /**
   * עדכון נראות תפריט
   */
  updateMenuVisibility() {
    try {
      const menuElement = DOMUtils.select('#mainNavigation');
      if (menuElement) {
        // קבלת מצב תפריט מהמצב
        let menuVisible = true;
        
        if (this.stateComponent) {
          const uiState = this.stateComponent.getUIState();
          menuVisible = uiState.menuVisible !== false;
        }
        
        DOMUtils.toggleClass(menuElement, 'menu-visible', menuVisible);
      }
      
    } catch (error) {
      this.log.error('HeaderComponent.updateMenuVisibility error:', error);
    }
  }

  /**
   * עדכון הכותרת
   * @param {Object} data - נתוני העדכון
   */
  updateHeader(data) {
    try {
      if (data.theme) {
        this.updateHeaderTheme(data.theme);
      }
      
      if (data.language) {
        this.updateHeaderLanguage(data.language);
      }
      
      if (data.animations !== undefined) {
        this.updateHeaderAnimations(data.animations);
      }
      
      if (data.compactMode !== undefined) {
        this.updateHeaderCompactMode(data.compactMode);
      }
      
      this.log.debug('כותרת עודכנה');
      
    } catch (error) {
      this.log.error('HeaderComponent.updateHeader error:', error);
    }
  }

  /**
   * רענון הכותרת
   */
  refreshHeader() {
    try {
      // יצירה מחדש של הכותרת
      this.createHeader();
      
      // אתחול מחדש
      this.initializeHeader();
      
      this.log.debug('כותרת רועננה');
      
    } catch (error) {
      this.log.error('HeaderComponent.refreshHeader error:', error);
    }
  }

  /**
   * הרס הכותרת
   */
  destroyHeader() {
    try {
      if (this.headerElement) {
        DOMUtils.remove(this.headerElement);
        this.headerElement = null;
      }
      
      this.log.debug('כותרת הושמדה');
      
    } catch (error) {
      this.log.error('HeaderComponent.destroyHeader error:', error);
    }
  }

  /**
   * הרס הרכיב
   */
  destroy() {
    try {
      this.log.info('משמיד HeaderComponent...');
      
      // הרס הכותרת
      this.destroyHeader();
      
      this.isInitialized = false;
      this.log.info('HeaderComponent הושמד');
      
    } catch (error) {
      this.log.error('HeaderComponent.destroy error:', error);
    }
  }

  /**
   * קבלת מידע על הרכיב
   * @returns {Object} - מידע על הרכיב
   */
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      headerElement: this.headerElement ? 'exists' : 'null',
      components: {
        state: this.stateComponent ? 'initialized' : 'not available',
        ui: this.uiComponent ? 'initialized' : 'not available',
        translation: this.translationComponent ? 'initialized' : 'not available',
        preferences: this.preferencesComponent ? 'initialized' : 'not available',
        menu: this.menuComponent ? 'initialized' : 'not available',
        filter: this.filterComponent ? 'initialized' : 'not available',
        navigation: this.navigationComponent ? 'initialized' : 'not available'
      },
      config: this.config
    };
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeaderComponent;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.HeaderComponent = HeaderComponent;
}

console.log('✅ HeaderComponent נוצר ופועל');
