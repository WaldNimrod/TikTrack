/**
 * Navigation Component - Header System
 * רכיב ניווט למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class NavigationComponent {
  constructor(headerSystem) {
    this.headerSystem = headerSystem;
    this.eventService = null;
    this.stateComponent = null;
    this.translationComponent = null;
    this.uiService = null;
    this.isInitialized = false;
    this.navigationHistory = [];
    this.currentIndex = -1;
    this.maxHistorySize = 50;
    this.config = HEADER_CONFIG.NAVIGATION;
    
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
          console.log('🔍 [NavigationComponent]', ...args);
        }
      },
      info: (...args) => {
        if (['debug', 'info'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('ℹ️ [NavigationComponent]', ...args);
        }
      },
      warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.warn('⚠️ [NavigationComponent]', ...args);
        }
      },
      error: (...args) => {
        if (HEADER_CONFIG.LOGGING.CONSOLE) {
          console.error('❌ [NavigationComponent]', ...args);
        }
      }
    };
  }

  /**
   * אתחול הרכיב
   */
  async init() {
    try {
      this.log.info('מתחיל אתחול NavigationComponent...');
      
      // קבלת שירותים ורכיבים
      this.eventService = this.headerSystem.getService('event');
      this.stateComponent = this.headerSystem.getComponent('state');
      this.translationComponent = this.headerSystem.getComponent('translation');
      this.uiService = this.headerSystem.getService('ui');
      
      if (!this.eventService) {
        throw new Error('EventService not available');
      }
      
      // הגדרת event listeners
      this.setupEventListeners();
      
      // הגדרת מאזיני מצב
      this.setupStateListeners();
      
      // אתחול ניווט
      await this.initializeNavigation();
      
      this.isInitialized = true;
      this.log.info('NavigationComponent אותחל בהצלחה');
      
    } catch (error) {
      this.log.error('שגיאה באתחול NavigationComponent:', error);
      throw error;
    }
  }

  /**
   * הגדרת event listeners
   */
  setupEventListeners() {
    try {
      // מאזין ללחיצות ניווט
      this.eventService.on(HEADER_EVENTS.NAVIGATION_CLICKED, (event) => {
        this.handleNavigationClick(event);
      });

      // מאזין לשינויי דף
      this.eventService.on(HEADER_EVENTS.PAGE_CHANGED, (event) => {
        this.handlePageChange(event);
      });

      // מאזין לניווט אחורה
      this.eventService.on(HEADER_EVENTS.NAVIGATION_BACK, (event) => {
        this.handleNavigationBack(event);
      });

      // מאזין לניווט קדימה
      this.eventService.on(HEADER_EVENTS.NAVIGATION_FORWARD, (event) => {
        this.handleNavigationForward(event);
      });

      // מאזין לרענון
      this.eventService.on(HEADER_EVENTS.NAVIGATION_REFRESH, (event) => {
        this.handleNavigationRefresh(event);
      });

      // מאזין לניווט לבית
      this.eventService.on(HEADER_EVENTS.NAVIGATION_HOME, (event) => {
        this.handleNavigationHome(event);
      });

      // מאזין לשינויי שפה
      this.eventService.on(HEADER_EVENTS.LANGUAGE_CHANGED, (event) => {
        this.handleLanguageChange(event);
      });

      this.log.debug('Event listeners הוגדרו');
      
    } catch (error) {
      this.log.error('NavigationComponent.setupEventListeners error:', error);
    }
  }

  /**
   * הגדרת מאזיני מצב
   */
  setupStateListeners() {
    try {
      if (!this.stateComponent) return;

      // מאזין למצב UI
      this.stateComponent.stateService.addListener('ui', (newValue) => {
        this.handleUIStateChange(newValue);
      });

      this.log.debug('מאזיני מצב הוגדרו');
      
    } catch (error) {
      this.log.error('NavigationComponent.setupStateListeners error:', error);
    }
  }

  /**
   * אתחול ניווט
   */
  async initializeNavigation() {
    try {
      // יצירת DOM
      await this.createNavigationDOM();

      // הוספת דף נוכחי להיסטוריה
      this.addToHistory(window.location.href, document.title);

      // עדכון UI
      this.updateNavigationUI();
      
    } catch (error) {
      this.log.error('NavigationComponent.initializeNavigation error:', error);
    }
  }

  /**
   * יצירת DOM ניווט
   */
  async createNavigationDOM() {
    try {
      // מציאת אלמנט ניווט קיים
      let navigationElement = DOMUtils.select('#headerNavigation');
      
      if (!navigationElement) {
        // יצירת אלמנט ניווט חדש
        navigationElement = DOMUtils.create('div', {
          id: 'headerNavigation',
          className: 'navigation-container'
        });
        
        // הוספה לכותרת
        const headerTop = DOMUtils.select('.header-top');
        if (headerTop) {
          DOMUtils.append(headerTop, navigationElement);
        }
      }

      // ניקוי תוכן קיים
      DOMUtils.setHTML(navigationElement, '');

      // יצירת כפתורי ניווט
      const backBtn = this.createNavigationButton('back', 'nav.back', '←', 'חזור');
      const forwardBtn = this.createNavigationButton('forward', 'nav.forward', '→', 'קדימה');
      const refreshBtn = this.createNavigationButton('refresh', 'nav.refresh', '↻', 'רענון');
      const homeBtn = this.createNavigationButton('home', 'nav.home', '🏠', 'בית');

      DOMUtils.append(navigationElement, backBtn);
      DOMUtils.append(navigationElement, forwardBtn);
      DOMUtils.append(navigationElement, refreshBtn);
      DOMUtils.append(navigationElement, homeBtn);

      this.log.debug('DOM ניווט נוצר');
      
    } catch (error) {
      this.log.error('NavigationComponent.createNavigationDOM error:', error);
    }
  }

  /**
   * יצירת כפתור ניווט
   * @param {string} id - מזהה הכפתור
   * @param {string} textKey - מפתח טקסט
   * @param {string} icon - אייקון
   * @param {string} fallbackText - טקסט חלופי
   * @returns {HTMLElement} - אלמנט הכפתור
   */
  createNavigationButton(id, textKey, icon, fallbackText) {
    try {
      const button = DOMUtils.create('button', {
        className: 'nav-btn',
        id: `${id}Btn`,
        title: fallbackText
      });

      const iconSpan = DOMUtils.create('span', {
        className: 'nav-icon',
        textContent: icon
      });

      const textSpan = DOMUtils.create('span', {
        className: 'nav-text'
      });
      
      // תרגום טקסט
      if (this.translationComponent) {
        const translatedText = this.translationComponent.translate(textKey);
        DOMUtils.setText(textSpan, translatedText);
      } else {
        DOMUtils.setText(textSpan, fallbackText);
      }

      DOMUtils.append(button, iconSpan);
      DOMUtils.append(button, textSpan);

      // הוספת event listener
      EventUtils.addListener(button, 'click', (event) => {
        this.handleNavigationButtonClick(event, id);
      });

      return button;
      
    } catch (error) {
      this.log.error('NavigationComponent.createNavigationButton error:', error);
      return null;
    }
  }

  /**
   * טיפול בלחיצת כפתור ניווט
   * @param {Event} event - האירוע
   * @param {string} buttonId - מזהה הכפתור
   */
  handleNavigationButtonClick(event, buttonId) {
    try {
      event.preventDefault();
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.NAVIGATION_CLICKED, {
        buttonId: buttonId,
        event: event
      });
      
      // ביצוע פעולה לפי כפתור
      switch (buttonId) {
        case 'back':
          this.goBack();
          break;
        case 'forward':
          this.goForward();
          break;
        case 'refresh':
          this.refresh();
          break;
        case 'home':
          this.goHome();
          break;
      }
      
      this.log.debug(`לחיצת כפתור ניווט: ${buttonId}`);
      
    } catch (error) {
      this.log.error('NavigationComponent.handleNavigationButtonClick error:', error);
    }
  }

  /**
   * טיפול בלחיצת ניווט
   * @param {Object} event - האירוע
   */
  handleNavigationClick(event) {
    try {
      const { buttonId } = event.data;
      
      // עדכון מצב UI
      if (this.stateComponent) {
        const uiState = this.stateComponent.getUIState();
        this.stateComponent.updateUIState({
          ...uiState,
          lastNavigationAction: buttonId
        });
      }
      
    } catch (error) {
      this.log.error('NavigationComponent.handleNavigationClick error:', error);
    }
  }

  /**
   * טיפול בשינוי דף
   * @param {Object} event - האירוע
   */
  handlePageChange(event) {
    try {
      const { url, title } = event.data;
      
      // הוספה להיסטוריה
      this.addToHistory(url, title);
      
      // עדכון UI
      this.updateNavigationUI();
      
    } catch (error) {
      this.log.error('NavigationComponent.handlePageChange error:', error);
    }
  }

  /**
   * טיפול בניווט אחורה
   * @param {Object} event - האירוע
   */
  handleNavigationBack(event) {
    try {
      this.goBack();
      
    } catch (error) {
      this.log.error('NavigationComponent.handleNavigationBack error:', error);
    }
  }

  /**
   * טיפול בניווט קדימה
   * @param {Object} event - האירוע
   */
  handleNavigationForward(event) {
    try {
      this.goForward();
      
    } catch (error) {
      this.log.error('NavigationComponent.handleNavigationForward error:', error);
    }
  }

  /**
   * טיפול ברענון
   * @param {Object} event - האירוע
   */
  handleNavigationRefresh(event) {
    try {
      this.refresh();
      
    } catch (error) {
      this.log.error('NavigationComponent.handleNavigationRefresh error:', error);
    }
  }

  /**
   * טיפול בניווט לבית
   * @param {Object} event - האירוע
   */
  handleNavigationHome(event) {
    try {
      this.goHome();
      
    } catch (error) {
      this.log.error('NavigationComponent.handleNavigationHome error:', error);
    }
  }

  /**
   * טיפול בשינוי שפה
   * @param {Object} event - האירוע
   */
  handleLanguageChange(event) {
    try {
      // תרגום מחדש של כל כפתורי הניווט
      this.translateNavigationButtons();
      
    } catch (error) {
      this.log.error('NavigationComponent.handleLanguageChange error:', error);
    }
  }

  /**
   * טיפול בשינוי מצב UI
   * @param {Object} uiState - מצב UI
   */
  handleUIStateChange(uiState) {
    try {
      // עדכון UI לפי מצב
      if (uiState.theme) {
        this.updateNavigationTheme(uiState.theme);
      }
      
    } catch (error) {
      this.log.error('NavigationComponent.handleUIStateChange error:', error);
    }
  }

  /**
   * ניווט אחורה
   */
  goBack() {
    try {
      if (this.canGoBack()) {
        this.currentIndex--;
        const historyItem = this.navigationHistory[this.currentIndex];
        
        if (historyItem) {
          window.location.href = historyItem.url;
        }
      } else {
        // שימוש ב-history API של הדפדפן
        window.history.back();
      }
      
      this.log.debug('ניווט אחורה');
      
    } catch (error) {
      this.log.error('NavigationComponent.goBack error:', error);
    }
  }

  /**
   * ניווט קדימה
   */
  goForward() {
    try {
      if (this.canGoForward()) {
        this.currentIndex++;
        const historyItem = this.navigationHistory[this.currentIndex];
        
        if (historyItem) {
          window.location.href = historyItem.url;
        }
      } else {
        // שימוש ב-history API של הדפדפן
        window.history.forward();
      }
      
      this.log.debug('ניווט קדימה');
      
    } catch (error) {
      this.log.error('NavigationComponent.goForward error:', error);
    }
  }

  /**
   * רענון דף
   */
  refresh() {
    try {
      window.location.reload();
      
      this.log.debug('רענון דף');
      
    } catch (error) {
      this.log.error('NavigationComponent.refresh error:', error);
    }
  }

  /**
   * ניווט לבית
   */
  goHome() {
    try {
      window.location.href = '/';
      
      this.log.debug('ניווט לבית');
      
    } catch (error) {
      this.log.error('NavigationComponent.goHome error:', error);
    }
  }

  /**
   * הוספה להיסטוריה
   * @param {string} url - כתובת הדף
   * @param {string} title - כותרת הדף
   */
  addToHistory(url, title) {
    try {
      // הסרת פריטים אחרי המיקום הנוכחי
      if (this.currentIndex < this.navigationHistory.length - 1) {
        this.navigationHistory = this.navigationHistory.slice(0, this.currentIndex + 1);
      }

      // הוספת פריט חדש
      this.navigationHistory.push({
        url: url,
        title: title,
        timestamp: Date.now()
      });

      // עדכון אינדקס
      this.currentIndex = this.navigationHistory.length - 1;

      // הגבלת גודל היסטוריה
      if (this.navigationHistory.length > this.maxHistorySize) {
        this.navigationHistory.shift();
        this.currentIndex--;
      }

      this.log.debug(`הוספה להיסטוריה: ${title}`);
      
    } catch (error) {
      this.log.error('NavigationComponent.addToHistory error:', error);
    }
  }

  /**
   * בדיקת אפשרות ניווט אחורה
   * @returns {boolean} - האם ניתן לניווט אחורה
   */
  canGoBack() {
    return this.currentIndex > 0;
  }

  /**
   * בדיקת אפשרות ניווט קדימה
   * @returns {boolean} - האם ניתן לניווט קדימה
   */
  canGoForward() {
    return this.currentIndex < this.navigationHistory.length - 1;
  }

  /**
   * קבלת היסטוריית ניווט
   * @returns {Array} - היסטוריית הניווט
   */
  getNavigationHistory() {
    return [...this.navigationHistory];
  }

  /**
   * קבלת פריט נוכחי בהיסטוריה
   * @returns {Object} - הפריט הנוכחי
   */
  getCurrentHistoryItem() {
    return this.navigationHistory[this.currentIndex] || null;
  }

  /**
   * תרגום כפתורי ניווט
   */
  translateNavigationButtons() {
    try {
      if (!this.translationComponent) return;

      const buttonTexts = [
        { id: 'backBtn', key: 'nav.back' },
        { id: 'forwardBtn', key: 'nav.forward' },
        { id: 'refreshBtn', key: 'nav.refresh' },
        { id: 'homeBtn', key: 'nav.home' }
      ];

      buttonTexts.forEach(({ id, key }) => {
        const button = DOMUtils.select(`#${id}`);
        if (button) {
          const textSpan = button.querySelector('.nav-text');
          if (textSpan) {
            const translatedText = this.translationComponent.translate(key);
            DOMUtils.setText(textSpan, translatedText);
          }
        }
      });
      
      this.log.debug('כפתורי ניווט תורגמו');
      
    } catch (error) {
      this.log.error('NavigationComponent.translateNavigationButtons error:', error);
    }
  }

  /**
   * עדכון נושא ניווט
   * @param {string} theme - הנושא
   */
  updateNavigationTheme(theme) {
    try {
      const navigationElement = DOMUtils.select('#headerNavigation');
      if (navigationElement) {
        // הסרת מחלקות נושא קיימות
        DOMUtils.removeClass(navigationElement, 'theme-light');
        DOMUtils.removeClass(navigationElement, 'theme-dark');
        
        // הוספת מחלקת נושא חדשה
        DOMUtils.addClass(navigationElement, `theme-${theme}`);
      }
      
    } catch (error) {
      this.log.error('NavigationComponent.updateNavigationTheme error:', error);
    }
  }

  /**
   * עדכון UI ניווט
   */
  updateNavigationUI() {
    try {
      // עדכון מצב כפתורים
      const backBtn = DOMUtils.select('#backBtn');
      const forwardBtn = DOMUtils.select('#forwardBtn');
      
      if (backBtn) {
        backBtn.disabled = !this.canGoBack();
        DOMUtils.toggleClass(backBtn, 'disabled', !this.canGoBack());
      }
      
      if (forwardBtn) {
        forwardBtn.disabled = !this.canGoForward();
        DOMUtils.toggleClass(forwardBtn, 'disabled', !this.canGoForward());
      }
      
    } catch (error) {
      this.log.error('NavigationComponent.updateNavigationUI error:', error);
    }
  }

  /**
   * ניווט לכתובת
   * @param {string} url - כתובת היעד
   * @param {string} title - כותרת הדף
   */
  navigateTo(url, title = '') {
    try {
      // הוספה להיסטוריה
      this.addToHistory(url, title);
      
      // ניווט
      window.location.href = url;
      
      this.log.debug(`ניווט לכתובת: ${url}`);
      
    } catch (error) {
      this.log.error('NavigationComponent.navigateTo error:', error);
    }
  }

  /**
   * ניווט לכתובת עם החלפת היסטוריה
   * @param {string} url - כתובת היעד
   * @param {string} title - כותרת הדף
   */
  navigateToReplace(url, title = '') {
    try {
      // החלפת פריט נוכחי בהיסטוריה
      if (this.currentIndex >= 0) {
        this.navigationHistory[this.currentIndex] = {
          url: url,
          title: title,
          timestamp: Date.now()
        };
      }
      
      // ניווט
      window.location.replace(url);
      
      this.log.debug(`ניווט עם החלפה לכתובת: ${url}`);
      
    } catch (error) {
      this.log.error('NavigationComponent.navigateToReplace error:', error);
    }
  }

  /**
   * איפוס היסטוריית ניווט
   */
  resetNavigationHistory() {
    try {
      this.navigationHistory = [];
      this.currentIndex = -1;
      
      // הוספת דף נוכחי
      this.addToHistory(window.location.href, document.title);
      
      this.log.debug('היסטוריית ניווט אופסה');
      
    } catch (error) {
      this.log.error('NavigationComponent.resetNavigationHistory error:', error);
    }
  }

  /**
   * הרס הרכיב
   */
  destroy() {
    try {
      this.log.info('משמיד NavigationComponent...');
      
      // ניקוי היסטוריה
      this.navigationHistory = [];
      this.currentIndex = -1;
      
      // הסרת DOM
      const navigationElement = DOMUtils.select('#headerNavigation');
      if (navigationElement) {
        DOMUtils.remove(navigationElement);
      }
      
      this.isInitialized = false;
      this.log.info('NavigationComponent הושמד');
      
    } catch (error) {
      this.log.error('NavigationComponent.destroy error:', error);
    }
  }

  /**
   * קבלת מידע על הרכיב
   * @returns {Object} - מידע על הרכיב
   */
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      historySize: this.navigationHistory.length,
      currentIndex: this.currentIndex,
      canGoBack: this.canGoBack(),
      canGoForward: this.canGoForward(),
      currentItem: this.getCurrentHistoryItem(),
      config: this.config
    };
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationComponent;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.NavigationComponent = NavigationComponent;
}

console.log('✅ NavigationComponent נוצר ופועל');
