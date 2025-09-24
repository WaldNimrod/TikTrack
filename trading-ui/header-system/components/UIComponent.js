/**
 * UI Component - Header System
 * רכיב ממשק משתמש למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class UIComponent {
  constructor(headerSystem) {
    this.headerSystem = headerSystem;
    this.uiService = null;
    this.eventService = null;
    this.stateComponent = null;
    this.isInitialized = false;
    this.elements = new Map();
    this.animations = new Map();
    this.config = HEADER_CONFIG.UI;
    
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
          console.log('🔍 [UIComponent]', ...args);
        }
      },
      info: (...args) => {
        if (['debug', 'info'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('ℹ️ [UIComponent]', ...args);
        }
      },
      warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.warn('⚠️ [UIComponent]', ...args);
        }
      },
      error: (...args) => {
        if (HEADER_CONFIG.LOGGING.CONSOLE) {
          console.error('❌ [UIComponent]', ...args);
        }
      }
    };
  }

  /**
   * אתחול הרכיב
   */
  async init() {
    try {
      this.log.info('מתחיל אתחול UIComponent...');
      
      // קבלת שירותים ורכיבים
      this.uiService = this.headerSystem.getService('ui');
      this.eventService = this.headerSystem.getService('event');
      this.stateComponent = this.headerSystem.getComponent('state');
      
      if (!this.uiService || !this.eventService) {
        throw new Error('Required services not available');
      }
      
      // יצירת אלמנטים
      await this.createElements();
      
      // הגדרת event listeners
      this.setupEventListeners();
      
      // הגדרת מאזיני מצב
      this.setupStateListeners();
      
      // אתחול UI
      await this.initializeUI();
      
      this.isInitialized = true;
      this.log.info('UIComponent אותחל בהצלחה');
      
    } catch (error) {
      this.log.error('שגיאה באתחול UIComponent:', error);
      throw error;
    }
  }

  /**
   * יצירת אלמנטים
   */
  async createElements() {
    try {
      // יצירת אלמנט כותרת ראשי
      const headerElement = this.createHeaderElement();
      this.elements.set('header', headerElement);
      
      // יצירת אלמנט תפריט
      const menuElement = this.createMenuElement();
      this.elements.set('menu', menuElement);
      
      // יצירת אלמנט פילטרים
      const filtersElement = this.createFiltersElement();
      this.elements.set('filters', filtersElement);
      
      // יצירת אלמנט ניווט
      const navigationElement = this.createNavigationElement();
      this.elements.set('navigation', navigationElement);
      
      this.log.debug('אלמנטים נוצרו');
      
    } catch (error) {
      this.log.error('UIComponent.createElements error:', error);
    }
  }

  /**
   * יצירת אלמנט כותרת ראשי
   * @returns {HTMLElement} - אלמנט הכותרת
   */
  createHeaderElement() {
    try {
      const header = DOMUtils.create('div', {
        id: 'unified-header',
        className: 'header-container'
      });
      
      // הוספת תוכן הכותרת
      header.innerHTML = `
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
        </div>
        <div class="filters-container" id="headerFilters">
          <div class="header-filters" id="headerFiltersContent"></div>
        </div>
      `;
      
      return header;
      
    } catch (error) {
      this.log.error('UIComponent.createHeaderElement error:', error);
      return null;
    }
  }

  /**
   * יצירת אלמנט תפריט
   * @returns {HTMLElement} - אלמנט התפריט
   */
  createMenuElement() {
    try {
      const menu = DOMUtils.create('ul', {
        className: 'tiktrack-nav-list',
        id: 'mainMenu'
      });
      
      // הוספת פריטי תפריט
      const menuItems = [
        { id: 'dashboard', text: 'לוח בקרה', href: '/dashboard' },
        { id: 'trades', text: 'עסקאות', href: '/trades' },
        { id: 'trade-plans', text: 'תוכניות מסחר', href: '/trade-plans' },
        { id: 'tickers', text: 'מניות', href: '/tickers' },
        { id: 'accounts', text: 'חשבונות', href: '/accounts' },
        { id: 'cash-flows', text: 'תזרים מזומנים', href: '/cash-flows' },
        { id: 'notes', text: 'הערות', href: '/notes' },
        { id: 'development', text: 'כלי פיתוח', href: '/development' }
      ];
      
      menuItems.forEach(item => {
        const menuItem = this.createMenuItem(item);
        DOMUtils.append(menu, menuItem);
      });
      
      return menu;
      
    } catch (error) {
      this.log.error('UIComponent.createMenuElement error:', error);
      return null;
    }
  }

  /**
   * יצירת פריט תפריט
   * @param {Object} item - נתוני הפריט
   * @returns {HTMLElement} - אלמנט הפריט
   */
  createMenuItem(item) {
    try {
      const li = DOMUtils.create('li', {
        className: 'tiktrack-nav-item',
        'data-menu-id': item.id
      });
      
      const link = DOMUtils.create('a', {
        href: item.href,
        className: 'tiktrack-nav-link',
        textContent: item.text
      });
      
      DOMUtils.append(li, link);
      
      // הוספת event listener
      EventUtils.addListener(link, 'click', (event) => {
        this.handleMenuItemClick(event, item);
      });
      
      return li;
      
    } catch (error) {
      this.log.error('UIComponent.createMenuItem error:', error);
      return null;
    }
  }

  /**
   * יצירת אלמנט פילטרים
   * @returns {HTMLElement} - אלמנט הפילטרים
   */
  createFiltersElement() {
    try {
      const filters = DOMUtils.create('div', {
        className: 'header-filters',
        id: 'headerFiltersContent'
      });
      
      // הוספת פילטרים
      filters.innerHTML = `
        <div class="filter-group">
          <button class="filter-toggle" id="statusFilter">
            <span class="filter-text">סטטוס: הכל</span>
            <span class="filter-arrow">▼</span>
          </button>
          <div class="filter-menu" id="statusFilterMenu">
            <div class="filter-option status-filter-item" data-value="all">הכל</div>
            <div class="filter-option status-filter-item" data-value="open">פתוח</div>
            <div class="filter-option status-filter-item" data-value="closed">סגור</div>
            <div class="filter-option status-filter-item" data-value="cancelled">מבוטל</div>
          </div>
        </div>
        
        <div class="filter-group">
          <button class="filter-toggle" id="typeFilter">
            <span class="filter-text">סוג: הכל</span>
            <span class="filter-arrow">▼</span>
          </button>
          <div class="filter-menu" id="typeFilterMenu">
            <div class="filter-option type-filter-item" data-value="all">הכל</div>
            <div class="filter-option type-filter-item" data-value="investment">השקעה</div>
            <div class="filter-option type-filter-item" data-value="swing">ספין</div>
            <div class="filter-option type-filter-item" data-value="passive">פסיבי</div>
          </div>
        </div>
        
        <div class="filter-group">
          <button class="filter-toggle" id="accountFilter">
            <span class="filter-text">חשבון: הכל</span>
            <span class="filter-arrow">▼</span>
          </button>
          <div class="filter-menu" id="accountFilterMenu">
            <div class="filter-option account-filter-item" data-value="all">הכל</div>
          </div>
        </div>
        
        <div class="filter-group">
          <button class="filter-toggle" id="dateFilter">
            <span class="filter-text">תאריך: הכל</span>
            <span class="filter-arrow">▼</span>
          </button>
          <div class="filter-menu" id="dateFilterMenu">
            <div class="filter-option date-range-filter-item" data-value="all">הכל</div>
            <div class="filter-option date-range-filter-item" data-value="today">היום</div>
            <div class="filter-option date-range-filter-item" data-value="week">השבוע</div>
            <div class="filter-option date-range-filter-item" data-value="month">החודש</div>
            <div class="filter-option date-range-filter-item" data-value="quarter">הרבעון</div>
            <div class="filter-option date-range-filter-item" data-value="year">השנה</div>
          </div>
        </div>
        
        <div class="search-input-wrapper">
          <input type="text" class="search-filter-input" id="searchFilter" placeholder="חיפוש...">
          <button class="search-clear-btn" id="searchClearBtn">×</button>
        </div>
        
        <div class="action-buttons">
          <button class="reset-btn" id="resetFiltersBtn">איפוס</button>
          <button class="clear-btn" id="clearFiltersBtn">ניקוי</button>
        </div>
      `;
      
      return filters;
      
    } catch (error) {
      this.log.error('UIComponent.createFiltersElement error:', error);
      return null;
    }
  }

  /**
   * יצירת אלמנט ניווט
   * @returns {HTMLElement} - אלמנט הניווט
   */
  createNavigationElement() {
    try {
      const navigation = DOMUtils.create('div', {
        className: 'navigation-container',
        id: 'headerNavigation'
      });
      
      // הוספת כפתורי ניווט
      navigation.innerHTML = `
        <button class="nav-btn" id="backBtn" title="חזור">
          <span>←</span>
        </button>
        <button class="nav-btn" id="forwardBtn" title="קדימה">
          <span>→</span>
        </button>
        <button class="nav-btn" id="refreshBtn" title="רענון">
          <span>↻</span>
        </button>
        <button class="nav-btn" id="homeBtn" title="בית">
          <span>🏠</span>
        </button>
      `;
      
      return navigation;
      
    } catch (error) {
      this.log.error('UIComponent.createNavigationElement error:', error);
      return null;
    }
  }

  /**
   * הגדרת event listeners
   */
  setupEventListeners() {
    try {
      // מאזין ללחיצות תפריט
      this.eventService.on(HEADER_EVENTS.MENU_ITEM_CLICKED, (event) => {
        this.handleMenuClick(event);
      });

      // מאזין לשינויי פילטרים
      this.eventService.on(HEADER_EVENTS.FILTER_CHANGED, (event) => {
        this.handleFilterChange(event);
      });

      // מאזין לשינויי UI
      this.eventService.on(HEADER_EVENTS.UI_CHANGED, (event) => {
        this.handleUIChange(event);
      });

      // מאזין לשינויי נושא
      this.eventService.on(HEADER_EVENTS.THEME_CHANGED, (event) => {
        this.handleThemeChange(event);
      });

      this.log.debug('Event listeners הוגדרו');
      
    } catch (error) {
      this.log.error('UIComponent.setupEventListeners error:', error);
    }
  }

  /**
   * הגדרת מאזיני מצב
   */
  setupStateListeners() {
    try {
      if (!this.stateComponent) return;

      // מאזין למצב תפריט
      this.stateComponent.stateService.addListener('menu', (newValue) => {
        this.updateMenuUI(newValue);
      });

      // מאזין למצב פילטרים
      this.stateComponent.stateService.addListener('filters', (newValue) => {
        this.updateFiltersUI(newValue);
      });

      // מאזין למצב UI
      this.stateComponent.stateService.addListener('ui', (newValue) => {
        this.updateUIState(newValue);
      });

      this.log.debug('מאזיני מצב הוגדרו');
      
    } catch (error) {
      this.log.error('UIComponent.setupStateListeners error:', error);
    }
  }

  /**
   * אתחול UI
   */
  async initializeUI() {
    try {
      // הוספת אלמנטים לדף
      const headerElement = this.elements.get('header');
      if (headerElement) {
        const mainNav = headerElement.querySelector('#mainNavigation');
        if (mainNav) {
          const menuElement = this.elements.get('menu');
          if (menuElement) {
            DOMUtils.append(mainNav, menuElement);
          }
        }
        
        const filtersContainer = headerElement.querySelector('#headerFiltersContent');
        if (filtersContainer) {
          const filtersElement = this.elements.get('filters');
          if (filtersElement) {
            DOMUtils.append(filtersContainer, filtersElement);
          }
        }
      }

      // הוספת הכותרת לדף
      const existingHeader = DOMUtils.select('#unified-header');
      if (existingHeader) {
        DOMUtils.remove(existingHeader);
      }
      
      if (headerElement) {
        DOMUtils.append(document.body, headerElement);
      }

      // הגדרת event listeners לאלמנטים
      this.setupElementEventListeners();

      this.log.debug('UI אותחל');
      
    } catch (error) {
      this.log.error('UIComponent.initializeUI error:', error);
    }
  }

  /**
   * הגדרת event listeners לאלמנטים
   */
  setupElementEventListeners() {
    try {
      // כפתורי פילטרים
      const filterButtons = DOMUtils.selectAll('.filter-toggle');
      filterButtons.forEach(button => {
        EventUtils.addListener(button, 'click', (event) => {
          this.handleFilterToggle(event);
        });
      });

      // אפשרויות פילטרים
      const filterOptions = DOMUtils.selectAll('.filter-option');
      filterOptions.forEach(option => {
        EventUtils.addListener(option, 'click', (event) => {
          this.handleFilterOptionClick(event);
        });
      });

      // שדה חיפוש
      const searchInput = DOMUtils.select('#searchFilter');
      if (searchInput) {
        EventUtils.addListener(searchInput, 'input', (event) => {
          this.handleSearchInput(event);
        });
      }

      // כפתור ניקוי חיפוש
      const searchClearBtn = DOMUtils.select('#searchClearBtn');
      if (searchClearBtn) {
        EventUtils.addListener(searchClearBtn, 'click', (event) => {
          this.handleSearchClear(event);
        });
      }

      // כפתורי פעולה
      const resetBtn = DOMUtils.select('#resetFiltersBtn');
      if (resetBtn) {
        EventUtils.addListener(resetBtn, 'click', (event) => {
          this.handleResetFilters(event);
        });
      }

      const clearBtn = DOMUtils.select('#clearFiltersBtn');
      if (clearBtn) {
        EventUtils.addListener(clearBtn, 'click', (event) => {
          this.handleClearFilters(event);
        });
      }

      this.log.debug('Event listeners לאלמנטים הוגדרו');
      
    } catch (error) {
      this.log.error('UIComponent.setupElementEventListeners error:', error);
    }
  }

  /**
   * טיפול בלחיצת פריט תפריט
   * @param {Event} event - האירוע
   * @param {Object} item - נתוני הפריט
   */
  handleMenuItemClick(event, item) {
    try {
      event.preventDefault();
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.MENU_ITEM_CLICKED, {
        item: item,
        event: event
      });
      
      this.log.debug('לחיצת פריט תפריט:', item);
      
    } catch (error) {
      this.log.error('UIComponent.handleMenuItemClick error:', error);
    }
  }

  /**
   * טיפול בלחיצת תפריט
   * @param {Object} event - האירוע
   */
  handleMenuClick(event) {
    try {
      const { item } = event.data;
      
      // עדכון מצב התפריט
      if (this.stateComponent) {
        this.stateComponent.updateMenuState({
          activeItem: item.id,
          isOpen: false
        });
      }
      
      // ניווט לדף
      if (item.href) {
        window.location.href = item.href;
      }
      
    } catch (error) {
      this.log.error('UIComponent.handleMenuClick error:', error);
    }
  }

  /**
   * טיפול בלחיצת פילטר
   * @param {Event} event - האירוע
   */
  handleFilterToggle(event) {
    try {
      const button = event.currentTarget;
      const filterType = button.id.replace('Filter', '');
      const menu = DOMUtils.select(`#${filterType}FilterMenu`);
      
      if (menu) {
        DOMUtils.toggleClass(menu, 'show');
      }
      
    } catch (error) {
      this.log.error('UIComponent.handleFilterToggle error:', error);
    }
  }

  /**
   * טיפול בלחיצת אפשרות פילטר
   * @param {Event} event - האירוע
   */
  handleFilterOptionClick(event) {
    try {
      const option = event.currentTarget;
      const value = option.getAttribute('data-value');
      const filterType = option.classList.contains('status-filter-item') ? 'status' :
                        option.classList.contains('type-filter-item') ? 'type' :
                        option.classList.contains('account-filter-item') ? 'account' :
                        option.classList.contains('date-range-filter-item') ? 'dateRange' : 'unknown';
      
      // עדכון טקסט הכפתור
      const button = DOMUtils.select(`#${filterType}Filter`);
      if (button) {
        const textSpan = button.querySelector('.filter-text');
        if (textSpan) {
          textSpan.textContent = `${this.getFilterDisplayName(filterType)}: ${this.getFilterValueDisplayName(filterType, value)}`;
        }
      }
      
      // סגירת התפריט
      const menu = DOMUtils.select(`#${filterType}FilterMenu`);
      if (menu) {
        DOMUtils.removeClass(menu, 'show');
      }
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.FILTER_CHANGED, {
        filterType: filterType,
        value: value
      });
      
    } catch (error) {
      this.log.error('UIComponent.handleFilterOptionClick error:', error);
    }
  }

  /**
   * טיפול בקלט חיפוש
   * @param {Event} event - האירוע
   */
  handleSearchInput(event) {
    try {
      const value = event.target.value;
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.FILTER_CHANGED, {
        filterType: 'search',
        value: value
      });
      
    } catch (error) {
      this.log.error('UIComponent.handleSearchInput error:', error);
    }
  }

  /**
   * טיפול בניקוי חיפוש
   * @param {Event} event - האירוע
   */
  handleSearchClear(event) {
    try {
      const searchInput = DOMUtils.select('#searchFilter');
      if (searchInput) {
        searchInput.value = '';
        
        // שליחת אירוע
        this.eventService.emit(HEADER_EVENTS.FILTER_CHANGED, {
          filterType: 'search',
          value: ''
        });
      }
      
    } catch (error) {
      this.log.error('UIComponent.handleSearchClear error:', error);
    }
  }

  /**
   * טיפול באיפוס פילטרים
   * @param {Event} event - האירוע
   */
  handleResetFilters(event) {
    try {
      // איפוס מצב הפילטרים
      if (this.stateComponent) {
        this.stateComponent.resetFiltersState();
      }
      
      // איפוס UI
      this.resetFiltersUI();
      
    } catch (error) {
      this.log.error('UIComponent.handleResetFilters error:', error);
    }
  }

  /**
   * טיפול בניקוי פילטרים
   * @param {Event} event - האירוע
   */
  handleClearFilters(event) {
    try {
      // ניקוי מצב הפילטרים
      if (this.stateComponent) {
        this.stateComponent.updateFiltersState({
          status: 'all',
          type: 'all',
          account: 'all',
          dateRange: 'all',
          search: ''
        });
      }
      
      // ניקוי UI
      this.clearFiltersUI();
      
    } catch (error) {
      this.log.error('UIComponent.handleClearFilters error:', error);
    }
  }

  /**
   * עדכון UI תפריט
   * @param {Object} menuState - מצב התפריט
   */
  updateMenuUI(menuState) {
    try {
      // עדכון פריט פעיל
      if (menuState.activeItem) {
        const activeItem = DOMUtils.select(`[data-menu-id="${menuState.activeItem}"]`);
        if (activeItem) {
          DOMUtils.addClass(activeItem, 'active');
        }
      }
      
    } catch (error) {
      this.log.error('UIComponent.updateMenuUI error:', error);
    }
  }

  /**
   * עדכון UI פילטרים
   * @param {Object} filtersState - מצב הפילטרים
   */
  updateFiltersUI(filtersState) {
    try {
      // עדכון טקסטי הפילטרים
      Object.entries(filtersState).forEach(([filterType, value]) => {
        const button = DOMUtils.select(`#${filterType}Filter`);
        if (button) {
          const textSpan = button.querySelector('.filter-text');
          if (textSpan) {
            textSpan.textContent = `${this.getFilterDisplayName(filterType)}: ${this.getFilterValueDisplayName(filterType, value)}`;
          }
        }
      });
      
    } catch (error) {
      this.log.error('UIComponent.updateFiltersUI error:', error);
    }
  }

  /**
   * עדכון מצב UI
   * @param {Object} uiState - מצב UI
   */
  updateUIState(uiState) {
    try {
      // עדכון נושא
      if (uiState.theme) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        DOMUtils.addClass(document.body, `theme-${uiState.theme}`);
      }
      
      // עדכון שפה
      if (uiState.language) {
        document.documentElement.lang = uiState.language;
        document.documentElement.dir = uiState.language === 'he' ? 'rtl' : 'ltr';
      }
      
    } catch (error) {
      this.log.error('UIComponent.updateUIState error:', error);
    }
  }

  /**
   * טיפול בשינוי פילטר
   * @param {Object} event - האירוע
   */
  handleFilterChange(event) {
    try {
      const { filterType, value } = event.data;
      
      // עדכון UI
      const button = DOMUtils.select(`#${filterType}Filter`);
      if (button) {
        const textSpan = button.querySelector('.filter-text');
        if (textSpan) {
          textSpan.textContent = `${this.getFilterDisplayName(filterType)}: ${this.getFilterValueDisplayName(filterType, value)}`;
        }
      }
      
    } catch (error) {
      this.log.error('UIComponent.handleFilterChange error:', error);
    }
  }

  /**
   * טיפול בשינוי UI
   * @param {Object} event - האירוע
   */
  handleUIChange(event) {
    try {
      const { property, value } = event.data;
      
      // עדכון UI לפי המאפיין
      switch (property) {
        case 'theme':
          this.updateTheme(value);
          break;
        case 'language':
          this.updateLanguage(value);
          break;
        case 'sidebarCollapsed':
          this.updateSidebarCollapsed(value);
          break;
      }
      
    } catch (error) {
      this.log.error('UIComponent.handleUIChange error:', error);
    }
  }

  /**
   * טיפול בשינוי נושא
   * @param {Object} event - האירוע
   */
  handleThemeChange(event) {
    try {
      const { theme } = event.data;
      this.updateTheme(theme);
      
    } catch (error) {
      this.log.error('UIComponent.handleThemeChange error:', error);
    }
  }

  /**
   * עדכון נושא
   * @param {string} theme - הנושא החדש
   */
  updateTheme(theme) {
    try {
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      DOMUtils.addClass(document.body, `theme-${theme}`);
      
    } catch (error) {
      this.log.error('UIComponent.updateTheme error:', error);
    }
  }

  /**
   * עדכון שפה
   * @param {string} language - השפה החדשה
   */
  updateLanguage(language) {
    try {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
      
    } catch (error) {
      this.log.error('UIComponent.updateLanguage error:', error);
    }
  }

  /**
   * עדכון מצב סרגל צד
   * @param {boolean} collapsed - האם מקופל
   */
  updateSidebarCollapsed(collapsed) {
    try {
      document.body.classList.toggle('sidebar-collapsed', collapsed);
      
    } catch (error) {
      this.log.error('UIComponent.updateSidebarCollapsed error:', error);
    }
  }

  /**
   * קבלת שם תצוגה לפילטר
   * @param {string} filterType - סוג הפילטר
   * @returns {string} - שם התצוגה
   */
  getFilterDisplayName(filterType) {
    const names = {
      status: 'סטטוס',
      type: 'סוג',
      account: 'חשבון',
      dateRange: 'תאריך',
      search: 'חיפוש'
    };
    return names[filterType] || filterType;
  }

  /**
   * קבלת שם תצוגה לערך פילטר
   * @param {string} filterType - סוג הפילטר
   * @param {string} value - הערך
   * @returns {string} - שם התצוגה
   */
  getFilterValueDisplayName(filterType, value) {
    if (value === 'all') return 'הכל';
    
    const names = {
      status: {
        open: 'פתוח',
        closed: 'סגור',
        cancelled: 'מבוטל'
      },
      type: {
        investment: 'השקעה',
        swing: 'ספין',
        passive: 'פסיבי'
      },
      dateRange: {
        today: 'היום',
        week: 'השבוע',
        month: 'החודש',
        quarter: 'הרבעון',
        year: 'השנה'
      }
    };
    
    return names[filterType]?.[value] || value;
  }

  /**
   * איפוס UI פילטרים
   */
  resetFiltersUI() {
    try {
      const filterTypes = ['status', 'type', 'account', 'dateRange'];
      
      filterTypes.forEach(filterType => {
        const button = DOMUtils.select(`#${filterType}Filter`);
        if (button) {
          const textSpan = button.querySelector('.filter-text');
          if (textSpan) {
            textSpan.textContent = `${this.getFilterDisplayName(filterType)}: הכל`;
          }
        }
      });
      
      const searchInput = DOMUtils.select('#searchFilter');
      if (searchInput) {
        searchInput.value = '';
      }
      
    } catch (error) {
      this.log.error('UIComponent.resetFiltersUI error:', error);
    }
  }

  /**
   * ניקוי UI פילטרים
   */
  clearFiltersUI() {
    try {
      this.resetFiltersUI();
      
    } catch (error) {
      this.log.error('UIComponent.clearFiltersUI error:', error);
    }
  }

  /**
   * הרס הרכיב
   */
  destroy() {
    try {
      this.log.info('משמיד UIComponent...');
      
      // ניקוי אנימציות
      this.animations.forEach((animationId) => {
        this.uiService.cancelAnimation(animationId);
      });
      this.animations.clear();
      
      // הסרת אלמנטים
      this.elements.forEach((element) => {
        if (element && element.parentNode) {
          DOMUtils.remove(element);
        }
      });
      this.elements.clear();
      
      this.isInitialized = false;
      this.log.info('UIComponent הושמד');
      
    } catch (error) {
      this.log.error('UIComponent.destroy error:', error);
    }
  }

  /**
   * קבלת מידע על הרכיב
   * @returns {Object} - מידע על הרכיב
   */
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      elementsCount: this.elements.size,
      animationsCount: this.animations.size,
      config: this.config
    };
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIComponent;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.UIComponent = UIComponent;
}

console.log('✅ UIComponent נוצר ופועל');
