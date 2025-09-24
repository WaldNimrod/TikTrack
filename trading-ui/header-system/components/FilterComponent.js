/**
 * Filter Component - Header System
 * רכיב פילטרים למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class FilterComponent {
  constructor(headerSystem) {
    this.headerSystem = headerSystem;
    this.eventService = null;
    this.stateComponent = null;
    this.translationComponent = null;
    this.uiService = null;
    this.isInitialized = false;
    this.filters = new Map();
    this.activeFilters = new Map();
    this.accounts = [];
    this.config = HEADER_CONFIG.FILTERS;
    
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
          console.log('🔍 [FilterComponent]', ...args);
        }
      },
      info: (...args) => {
        if (['debug', 'info'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('ℹ️ [FilterComponent]', ...args);
        }
      },
      warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.warn('⚠️ [FilterComponent]', ...args);
        }
      },
      error: (...args) => {
        if (HEADER_CONFIG.LOGGING.CONSOLE) {
          console.error('❌ [FilterComponent]', ...args);
        }
      }
    };
  }

  /**
   * אתחול הרכיב
   */
  async init() {
    try {
      this.log.info('מתחיל אתחול FilterComponent...');
      
      // קבלת שירותים ורכיבים
      this.eventService = this.headerSystem.getService('event');
      this.stateComponent = this.headerSystem.getComponent('state');
      this.translationComponent = this.headerSystem.getComponent('translation');
      this.uiService = this.headerSystem.getService('ui');
      
      if (!this.eventService) {
        throw new Error('EventService not available');
      }
      
      // יצירת פילטרים
      await this.createFilters();
      
      // טעינת חשבונות
      await this.loadAccounts();
      
      // הגדרת event listeners
      this.setupEventListeners();
      
      // הגדרת מאזיני מצב
      this.setupStateListeners();
      
      // אתחול פילטרים
      await this.initializeFilters();
      
      this.isInitialized = true;
      this.log.info('FilterComponent אותחל בהצלחה');
      
    } catch (error) {
      this.log.error('שגיאה באתחול FilterComponent:', error);
      throw error;
    }
  }

  /**
   * יצירת פילטרים
   */
  async createFilters() {
    try {
      // פילטרים ברירת מחדל
      const defaultFilters = {
        status: {
          id: 'status',
          type: 'select',
          label: 'filter.status',
          options: [
            { value: 'all', label: 'filter.all' },
            { value: 'open', label: 'filter.open' },
            { value: 'closed', label: 'filter.closed' },
            { value: 'cancelled', label: 'filter.cancelled' }
          ],
          defaultValue: 'all',
          visible: true
        },
        type: {
          id: 'type',
          type: 'select',
          label: 'filter.type',
          options: [
            { value: 'all', label: 'filter.all' },
            { value: 'investment', label: 'filter.investment' },
            { value: 'swing', label: 'filter.swing' },
            { value: 'passive', label: 'filter.passive' }
          ],
          defaultValue: 'all',
          visible: true
        },
        account: {
          id: 'account',
          type: 'select',
          label: 'filter.account',
          options: [
            { value: 'all', label: 'filter.all' }
          ],
          defaultValue: 'all',
          visible: true,
          dynamic: true
        },
        dateRange: {
          id: 'dateRange',
          type: 'select',
          label: 'filter.date',
          options: [
            { value: 'all', label: 'filter.all' },
            { value: 'today', label: 'filter.today' },
            { value: 'week', label: 'filter.week' },
            { value: 'month', label: 'filter.month' },
            { value: 'quarter', label: 'filter.quarter' },
            { value: 'year', label: 'filter.year' }
          ],
          defaultValue: 'all',
          visible: true
        },
        search: {
          id: 'search',
          type: 'text',
          label: 'filter.search',
          placeholder: 'filter.search',
          defaultValue: '',
          visible: true
        }
      };

      // יצירת פילטרים
      Object.entries(defaultFilters).forEach(([key, filter]) => {
        this.filters.set(key, filter);
        this.activeFilters.set(key, filter.defaultValue);
      });
      
      this.log.debug('פילטרים נוצרו');
      
    } catch (error) {
      this.log.error('FilterComponent.createFilters error:', error);
    }
  }

  /**
   * טעינת חשבונות
   */
  async loadAccounts() {
    try {
      // טעינת חשבונות מהשרת
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const accounts = await response.json();
        this.accounts = accounts;
        
        // עדכון פילטר חשבונות
        this.updateAccountFilter();
      } else {
        this.log.warn('לא ניתן לטעון חשבונות מהשרת');
      }
      
    } catch (error) {
      this.log.warn('שגיאה בטעינת חשבונות:', error);
      // המשך עם חשבונות ריקים
    }
  }

  /**
   * עדכון פילטר חשבונות
   */
  updateAccountFilter() {
    try {
      const accountFilter = this.filters.get('account');
      if (accountFilter) {
        // ניקוי אפשרויות קיימות
        accountFilter.options = [{ value: 'all', label: 'filter.all' }];
        
        // הוספת חשבונות
        this.accounts.forEach(account => {
          accountFilter.options.push({
            value: account.id,
            label: account.name
          });
        });
        
        this.log.debug('פילטר חשבונות עודכן');
      }
      
    } catch (error) {
      this.log.error('FilterComponent.updateAccountFilter error:', error);
    }
  }

  /**
   * הגדרת event listeners
   */
  setupEventListeners() {
    try {
      // מאזין לשינויי פילטרים
      this.eventService.on(HEADER_EVENTS.FILTER_CHANGED, (event) => {
        this.handleFilterChange(event);
      });

      // מאזין לאיפוס פילטרים
      this.eventService.on(HEADER_EVENTS.FILTERS_RESET, (event) => {
        this.handleFiltersReset(event);
      });

      // מאזין לניקוי פילטרים
      this.eventService.on(HEADER_EVENTS.FILTERS_CLEAR, (event) => {
        this.handleFiltersClear(event);
      });

      // מאזין לשינויי שפה
      this.eventService.on(HEADER_EVENTS.LANGUAGE_CHANGED, (event) => {
        this.handleLanguageChange(event);
      });

      this.log.debug('Event listeners הוגדרו');
      
    } catch (error) {
      this.log.error('FilterComponent.setupEventListeners error:', error);
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

      this.log.debug('מאזיני מצב הוגדרו');
      
    } catch (error) {
      this.log.error('FilterComponent.setupStateListeners error:', error);
    }
  }

  /**
   * אתחול פילטרים
   */
  async initializeFilters() {
    try {
      // טעינת מצב פילטרים
      if (this.stateComponent) {
        const filtersState = this.stateComponent.getFiltersState();
        if (filtersState && Object.keys(filtersState).length > 0) {
          Object.entries(filtersState).forEach(([key, value]) => {
            this.activeFilters.set(key, value);
          });
        }
      }

      // יצירת DOM
      await this.createFiltersDOM();

      // עדכון UI
      this.updateFiltersUI();
      
    } catch (error) {
      this.log.error('FilterComponent.initializeFilters error:', error);
    }
  }

  /**
   * יצירת DOM פילטרים
   */
  async createFiltersDOM() {
    try {
      // מציאת אלמנט פילטרים קיים
      let filtersElement = DOMUtils.select('#headerFiltersContent');
      
      if (!filtersElement) {
        // יצירת אלמנט פילטרים חדש
        filtersElement = DOMUtils.create('div', {
          id: 'headerFiltersContent',
          className: 'header-filters'
        });
        
        // הוספה לכותרת
        const filtersContainer = DOMUtils.select('#headerFilters');
        if (filtersContainer) {
          DOMUtils.append(filtersContainer, filtersElement);
        }
      }

      // ניקוי תוכן קיים
      DOMUtils.setHTML(filtersElement, '');

      // יצירת פילטרים
      this.filters.forEach((filter, key) => {
        if (filter.visible) {
          const filterElement = this.createFilterElement(filter);
          if (filterElement) {
            DOMUtils.append(filtersElement, filterElement);
          }
        }
      });

      // הוספת כפתורי פעולה
      const actionButtons = this.createActionButtons();
      if (actionButtons) {
        DOMUtils.append(filtersElement, actionButtons);
      }

      this.log.debug('DOM פילטרים נוצר');
      
    } catch (error) {
      this.log.error('FilterComponent.createFiltersDOM error:', error);
    }
  }

  /**
   * יצירת אלמנט פילטר
   * @param {Object} filter - נתוני הפילטר
   * @returns {HTMLElement} - אלמנט הפילטר
   */
  createFilterElement(filter) {
    try {
      const filterGroup = DOMUtils.create('div', {
        className: 'filter-group'
      });

      if (filter.type === 'select') {
        // פילטר בחירה
        const button = DOMUtils.create('button', {
          className: 'filter-toggle',
          id: `${filter.id}Filter`
        });

        const textSpan = DOMUtils.create('span', {
          className: 'filter-text'
        });
        
        // תרגום טקסט
        if (this.translationComponent) {
          const translatedText = this.translationComponent.translate(filter.label);
          DOMUtils.setText(textSpan, translatedText);
        } else {
          DOMUtils.setText(textSpan, filter.label);
        }
        
        DOMUtils.append(button, textSpan);

        const arrowSpan = DOMUtils.create('span', {
          className: 'filter-arrow',
          textContent: '▼'
        });
        DOMUtils.append(button, arrowSpan);

        const menu = DOMUtils.create('div', {
          className: 'filter-menu',
          id: `${filter.id}FilterMenu`
        });

        filter.options.forEach(option => {
          const optionElement = DOMUtils.create('div', {
            className: 'filter-option',
            'data-value': option.value,
            'data-filter': filter.id
          });
          
          // תרגום טקסט
          if (this.translationComponent) {
            const translatedText = this.translationComponent.translate(option.label);
            DOMUtils.setText(optionElement, translatedText);
          } else {
            DOMUtils.setText(optionElement, option.label);
          }
          
          DOMUtils.append(menu, optionElement);
        });

        DOMUtils.append(filterGroup, button);
        DOMUtils.append(filterGroup, menu);

        // הוספת event listeners
        EventUtils.addListener(button, 'click', (event) => {
          this.handleFilterToggle(event, filter);
        });

        EventUtils.addListener(menu, 'click', (event) => {
          this.handleFilterOptionClick(event, filter);
        });

      } else if (filter.type === 'text') {
        // פילטר טקסט
        const inputWrapper = DOMUtils.create('div', {
          className: 'search-input-wrapper'
        });

        const input = DOMUtils.create('input', {
          type: 'text',
          className: 'search-filter-input',
          id: `${filter.id}Filter`,
          placeholder: filter.placeholder || ''
        });
        
        // תרגום placeholder
        if (this.translationComponent && filter.placeholder) {
          const translatedPlaceholder = this.translationComponent.translate(filter.placeholder);
          input.placeholder = translatedPlaceholder;
        }

        const clearBtn = DOMUtils.create('button', {
          className: 'search-clear-btn',
          id: `${filter.id}ClearBtn`,
          textContent: '×'
        });

        DOMUtils.append(inputWrapper, input);
        DOMUtils.append(inputWrapper, clearBtn);
        DOMUtils.append(filterGroup, inputWrapper);

        // הוספת event listeners
        EventUtils.addListener(input, 'input', (event) => {
          this.handleFilterInput(event, filter);
        });

        EventUtils.addListener(clearBtn, 'click', (event) => {
          this.handleFilterClear(event, filter);
        });
      }

      return filterGroup;
      
    } catch (error) {
      this.log.error('FilterComponent.createFilterElement error:', error);
      return null;
    }
  }

  /**
   * יצירת כפתורי פעולה
   * @returns {HTMLElement} - אלמנט כפתורי הפעולה
   */
  createActionButtons() {
    try {
      const actionButtons = DOMUtils.create('div', {
        className: 'action-buttons'
      });

      const resetBtn = DOMUtils.create('button', {
        className: 'reset-btn',
        id: 'resetFiltersBtn'
      });
      
      // תרגום טקסט
      if (this.translationComponent) {
        const translatedText = this.translationComponent.translate('button.reset');
        DOMUtils.setText(resetBtn, translatedText);
      } else {
        DOMUtils.setText(resetBtn, 'איפוס');
      }

      const clearBtn = DOMUtils.create('button', {
        className: 'clear-btn',
        id: 'clearFiltersBtn'
      });
      
      // תרגום טקסט
      if (this.translationComponent) {
        const translatedText = this.translationComponent.translate('button.clear');
        DOMUtils.setText(clearBtn, translatedText);
      } else {
        DOMUtils.setText(clearBtn, 'ניקוי');
      }

      DOMUtils.append(actionButtons, resetBtn);
      DOMUtils.append(actionButtons, clearBtn);

      // הוספת event listeners
      EventUtils.addListener(resetBtn, 'click', (event) => {
        this.handleResetFilters(event);
      });

      EventUtils.addListener(clearBtn, 'click', (event) => {
        this.handleClearFilters(event);
      });

      return actionButtons;
      
    } catch (error) {
      this.log.error('FilterComponent.createActionButtons error:', error);
      return null;
    }
  }

  /**
   * טיפול בלחיצת פילטר
   * @param {Event} event - האירוע
   * @param {Object} filter - נתוני הפילטר
   */
  handleFilterToggle(event, filter) {
    try {
      const menu = DOMUtils.select(`#${filter.id}FilterMenu`);
      if (menu) {
        DOMUtils.toggleClass(menu, 'show');
      }
      
    } catch (error) {
      this.log.error('FilterComponent.handleFilterToggle error:', error);
    }
  }

  /**
   * טיפול בלחיצת אפשרות פילטר
   * @param {Event} event - האירוע
   * @param {Object} filter - נתוני הפילטר
   */
  handleFilterOptionClick(event, filter) {
    try {
      const option = event.target;
      const value = option.getAttribute('data-value');
      
      if (value) {
        // עדכון ערך פילטר
        this.setFilterValue(filter.id, value);
        
        // עדכון טקסט הכפתור
        this.updateFilterButtonText(filter.id, value);
        
        // סגירת התפריט
        const menu = DOMUtils.select(`#${filter.id}FilterMenu`);
        if (menu) {
          DOMUtils.removeClass(menu, 'show');
        }
      }
      
    } catch (error) {
      this.log.error('FilterComponent.handleFilterOptionClick error:', error);
    }
  }

  /**
   * טיפול בקלט פילטר
   * @param {Event} event - האירוע
   * @param {Object} filter - נתוני הפילטר
   */
  handleFilterInput(event, filter) {
    try {
      const value = event.target.value;
      this.setFilterValue(filter.id, value);
      
    } catch (error) {
      this.log.error('FilterComponent.handleFilterInput error:', error);
    }
  }

  /**
   * טיפול בניקוי פילטר
   * @param {Event} event - האירוע
   * @param {Object} filter - נתוני הפילטר
   */
  handleFilterClear(event, filter) {
    try {
      const input = DOMUtils.select(`#${filter.id}Filter`);
      if (input) {
        input.value = '';
        this.setFilterValue(filter.id, '');
      }
      
    } catch (error) {
      this.log.error('FilterComponent.handleFilterClear error:', error);
    }
  }

  /**
   * טיפול באיפוס פילטרים
   * @param {Event} event - האירוע
   */
  handleResetFilters(event) {
    try {
      this.resetFilters();
      
    } catch (error) {
      this.log.error('FilterComponent.handleResetFilters error:', error);
    }
  }

  /**
   * טיפול בניקוי פילטרים
   * @param {Event} event - האירוע
   */
  handleClearFilters(event) {
    try {
      this.clearFilters();
      
    } catch (error) {
      this.log.error('FilterComponent.handleClearFilters error:', error);
    }
  }

  /**
   * טיפול בשינוי פילטר
   * @param {Object} event - האירוע
   */
  handleFilterChange(event) {
    try {
      const { filterType, value } = event.data;
      
      // עדכון ערך פילטר
      this.setFilterValue(filterType, value);
      
    } catch (error) {
      this.log.error('FilterComponent.handleFilterChange error:', error);
    }
  }

  /**
   * טיפול באיפוס פילטרים
   * @param {Object} event - האירוע
   */
  handleFiltersReset(event) {
    try {
      this.resetFilters();
      
    } catch (error) {
      this.log.error('FilterComponent.handleFiltersReset error:', error);
    }
  }

  /**
   * טיפול בניקוי פילטרים
   * @param {Object} event - האירוע
   */
  handleFiltersClear(event) {
    try {
      this.clearFilters();
      
    } catch (error) {
      this.log.error('FilterComponent.handleFiltersClear error:', error);
    }
  }

  /**
   * טיפול בשינוי שפה
   * @param {Object} event - האירוע
   */
  handleLanguageChange(event) {
    try {
      // תרגום מחדש של כל הפילטרים
      this.translateFilters();
      
    } catch (error) {
      this.log.error('FilterComponent.handleLanguageChange error:', error);
    }
  }

  /**
   * טיפול בשינוי מצב פילטרים
   * @param {Object} filtersState - מצב הפילטרים
   */
  handleFiltersStateChange(filtersState) {
    try {
      // עדכון פילטרים פעילים
      Object.entries(filtersState).forEach(([key, value]) => {
        this.activeFilters.set(key, value);
      });
      
      // עדכון UI
      this.updateFiltersUI();
      
    } catch (error) {
      this.log.error('FilterComponent.handleFiltersStateChange error:', error);
    }
  }

  /**
   * הגדרת ערך פילטר
   * @param {string} filterId - מזהה הפילטר
   * @param {*} value - הערך
   */
  setFilterValue(filterId, value) {
    try {
      this.activeFilters.set(filterId, value);
      
      // עדכון מצב
      if (this.stateComponent) {
        const currentFilters = this.stateComponent.getFiltersState();
        this.stateComponent.updateFiltersState({
          ...currentFilters,
          [filterId]: value
        });
      }
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.FILTER_CHANGED, {
        filterType: filterId,
        value: value
      });
      
      this.log.debug(`ערך פילטר עודכן: ${filterId} = ${value}`);
      
    } catch (error) {
      this.log.error('FilterComponent.setFilterValue error:', error);
    }
  }

  /**
   * עדכון טקסט כפתור פילטר
   * @param {string} filterId - מזהה הפילטר
   * @param {*} value - הערך
   */
  updateFilterButtonText(filterId, value) {
    try {
      const button = DOMUtils.select(`#${filterId}Filter`);
      if (button) {
        const textSpan = button.querySelector('.filter-text');
        if (textSpan) {
          const filter = this.filters.get(filterId);
          if (filter) {
            const option = filter.options.find(opt => opt.value === value);
            if (option) {
              const translatedText = this.translationComponent ? 
                this.translationComponent.translate(option.label) : 
                option.label;
              DOMUtils.setText(textSpan, `${this.getFilterDisplayName(filterId)}: ${translatedText}`);
            }
          }
        }
      }
      
    } catch (error) {
      this.log.error('FilterComponent.updateFilterButtonText error:', error);
    }
  }

  /**
   * איפוס פילטרים
   */
  resetFilters() {
    try {
      // איפוס פילטרים פעילים
      this.filters.forEach((filter, key) => {
        this.activeFilters.set(key, filter.defaultValue);
      });
      
      // עדכון מצב
      if (this.stateComponent) {
        this.stateComponent.resetFiltersState();
      }
      
      // עדכון UI
      this.updateFiltersUI();
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.FILTERS_RESET, {
        filters: this.getAllActiveFilters()
      });
      
      this.log.debug('פילטרים אופסו');
      
    } catch (error) {
      this.log.error('FilterComponent.resetFilters error:', error);
    }
  }

  /**
   * ניקוי פילטרים
   */
  clearFilters() {
    try {
      // ניקוי פילטרים פעילים
      this.filters.forEach((filter, key) => {
        this.activeFilters.set(key, filter.type === 'text' ? '' : 'all');
      });
      
      // עדכון מצב
      if (this.stateComponent) {
        this.stateComponent.updateFiltersState({
          status: 'all',
          type: 'all',
          account: 'all',
          dateRange: 'all',
          search: ''
        });
      }
      
      // עדכון UI
      this.updateFiltersUI();
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.FILTERS_CLEAR, {
        filters: this.getAllActiveFilters()
      });
      
      this.log.debug('פילטרים נוקו');
      
    } catch (error) {
      this.log.error('FilterComponent.clearFilters error:', error);
    }
  }

  /**
   * תרגום פילטרים
   */
  translateFilters() {
    try {
      if (!this.translationComponent) return;

      // תרגום כפתורי פילטרים
      const filterButtons = DOMUtils.selectAll('.filter-toggle');
      filterButtons.forEach(button => {
        const textSpan = button.querySelector('.filter-text');
        if (textSpan) {
          const filterId = button.id.replace('Filter', '');
          const filter = this.filters.get(filterId);
          if (filter) {
            const translatedText = this.translationComponent.translate(filter.label);
            DOMUtils.setText(textSpan, translatedText);
          }
        }
      });

      // תרגום אפשרויות פילטרים
      const filterOptions = DOMUtils.selectAll('.filter-option');
      filterOptions.forEach(option => {
        const value = option.getAttribute('data-value');
        const filterId = option.getAttribute('data-filter');
        const filter = this.filters.get(filterId);
        
        if (filter) {
          const optionData = filter.options.find(opt => opt.value === value);
          if (optionData) {
            const translatedText = this.translationComponent.translate(optionData.label);
            DOMUtils.setText(option, translatedText);
          }
        }
      });

      // תרגום כפתורי פעולה
      const resetBtn = DOMUtils.select('#resetFiltersBtn');
      if (resetBtn) {
        const translatedText = this.translationComponent.translate('button.reset');
        DOMUtils.setText(resetBtn, translatedText);
      }

      const clearBtn = DOMUtils.select('#clearFiltersBtn');
      if (clearBtn) {
        const translatedText = this.translationComponent.translate('button.clear');
        DOMUtils.setText(clearBtn, translatedText);
      }
      
      this.log.debug('פילטרים תורגמו');
      
    } catch (error) {
      this.log.error('FilterComponent.translateFilters error:', error);
    }
  }

  /**
   * עדכון UI פילטרים
   */
  updateFiltersUI() {
    try {
      // עדכון טקסטי כפתורי פילטרים
      this.activeFilters.forEach((value, filterId) => {
        this.updateFilterButtonText(filterId, value);
      });

      // עדכון שדות טקסט
      const searchInput = DOMUtils.select('#searchFilter');
      if (searchInput) {
        searchInput.value = this.activeFilters.get('search') || '';
      }
      
    } catch (error) {
      this.log.error('FilterComponent.updateFiltersUI error:', error);
    }
  }

  /**
   * קבלת שם תצוגה לפילטר
   * @param {string} filterId - מזהה הפילטר
   * @returns {string} - שם התצוגה
   */
  getFilterDisplayName(filterId) {
    const names = {
      status: 'סטטוס',
      type: 'סוג',
      account: 'חשבון',
      dateRange: 'תאריך',
      search: 'חיפוש'
    };
    return names[filterId] || filterId;
  }

  /**
   * קבלת פילטר
   * @param {string} filterId - מזהה הפילטר
   * @returns {Object} - הפילטר
   */
  getFilter(filterId) {
    return this.filters.get(filterId);
  }

  /**
   * קבלת כל הפילטרים
   * @returns {Array} - רשימת הפילטרים
   */
  getAllFilters() {
    return Array.from(this.filters.values());
  }

  /**
   * קבלת ערך פילטר
   * @param {string} filterId - מזהה הפילטר
   * @returns {*} - ערך הפילטר
   */
  getFilterValue(filterId) {
    return this.activeFilters.get(filterId);
  }

  /**
   * קבלת כל הפילטרים הפעילים
   * @returns {Object} - הפילטרים הפעילים
   */
  getAllActiveFilters() {
    const result = {};
    this.activeFilters.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * הרס הרכיב
   */
  destroy() {
    try {
      this.log.info('משמיד FilterComponent...');
      
      // ניקוי פילטרים
      this.filters.clear();
      this.activeFilters.clear();
      
      // הסרת DOM
      const filtersElement = DOMUtils.select('#headerFiltersContent');
      if (filtersElement) {
        DOMUtils.remove(filtersElement);
      }
      
      this.isInitialized = false;
      this.log.info('FilterComponent הושמד');
      
    } catch (error) {
      this.log.error('FilterComponent.destroy error:', error);
    }
  }

  /**
   * קבלת מידע על הרכיב
   * @returns {Object} - מידע על הרכיב
   */
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      filtersCount: this.filters.size,
      activeFilters: this.getAllActiveFilters(),
      accountsCount: this.accounts.length,
      config: this.config
    };
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FilterComponent;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.FilterComponent = FilterComponent;
}

console.log('✅ FilterComponent נוצר ופועל');
