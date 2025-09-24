/**
 * Translation Component - Header System
 * רכיב תרגום למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class TranslationComponent {
  constructor(headerSystem) {
    this.headerSystem = headerSystem;
    this.eventService = null;
    this.stateComponent = null;
    this.isInitialized = false;
    this.currentLanguage = 'he';
    this.translations = new Map();
    this.config = HEADER_CONFIG.TRANSLATION;
    
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
          console.log('🔍 [TranslationComponent]', ...args);
        }
      },
      info: (...args) => {
        if (['debug', 'info'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('ℹ️ [TranslationComponent]', ...args);
        }
      },
      warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.warn('⚠️ [TranslationComponent]', ...args);
        }
      },
      error: (...args) => {
        if (HEADER_CONFIG.LOGGING.CONSOLE) {
          console.error('❌ [TranslationComponent]', ...args);
        }
      }
    };
  }

  /**
   * אתחול הרכיב
   */
  async init() {
    try {
      this.log.info('מתחיל אתחול TranslationComponent...');
      
      // קבלת שירותים ורכיבים
      this.eventService = this.headerSystem.getService('event');
      this.stateComponent = this.headerSystem.getComponent('state');
      
      if (!this.eventService) {
        throw new Error('EventService not available');
      }
      
      // טעינת תרגומים
      await this.loadTranslations();
      
      // הגדרת event listeners
      this.setupEventListeners();
      
      // הגדרת מאזיני מצב
      this.setupStateListeners();
      
      // אתחול שפה
      await this.initializeLanguage();
      
      this.isInitialized = true;
      this.log.info('TranslationComponent אותחל בהצלחה');
      
    } catch (error) {
      this.log.error('שגיאה באתחול TranslationComponent:', error);
      throw error;
    }
  }

  /**
   * טעינת תרגומים
   */
  async loadTranslations() {
    try {
      // תרגומים לעברית
      const hebrewTranslations = {
        // תפריט
        'menu.dashboard': 'לוח בקרה',
        'menu.trades': 'עסקאות',
        'menu.trade-plans': 'תוכניות מסחר',
        'menu.tickers': 'מניות',
        'menu.accounts': 'חשבונות',
        'menu.cash-flows': 'תזרים מזומנים',
        'menu.notes': 'הערות',
        'menu.development': 'כלי פיתוח',
        
        // פילטרים
        'filter.status': 'סטטוס',
        'filter.type': 'סוג',
        'filter.account': 'חשבון',
        'filter.date': 'תאריך',
        'filter.search': 'חיפוש',
        'filter.all': 'הכל',
        'filter.open': 'פתוח',
        'filter.closed': 'סגור',
        'filter.cancelled': 'מבוטל',
        'filter.investment': 'השקעה',
        'filter.swing': 'ספין',
        'filter.passive': 'פסיבי',
        'filter.today': 'היום',
        'filter.week': 'השבוע',
        'filter.month': 'החודש',
        'filter.quarter': 'הרבעון',
        'filter.year': 'השנה',
        
        // כפתורים
        'button.reset': 'איפוס',
        'button.clear': 'ניקוי',
        'button.save': 'שמירה',
        'button.cancel': 'ביטול',
        'button.close': 'סגירה',
        'button.back': 'חזור',
        'button.forward': 'קדימה',
        'button.refresh': 'רענון',
        'button.home': 'בית',
        
        // הודעות
        'message.loading': 'טוען...',
        'message.saving': 'שומר...',
        'message.saved': 'נשמר בהצלחה',
        'message.error': 'שגיאה',
        'message.success': 'הצלחה',
        'message.warning': 'אזהרה',
        'message.info': 'מידע',
        
        // ניווט
        'nav.back': 'חזור',
        'nav.forward': 'קדימה',
        'nav.refresh': 'רענון',
        'nav.home': 'בית',
        
        // העדפות
        'preferences.theme': 'נושא',
        'preferences.language': 'שפה',
        'preferences.animations': 'אנימציות',
        'preferences.sound': 'צליל',
        'preferences.auto-save': 'שמירה אוטומטית',
        'preferences.compact-mode': 'מצב קומפקטי',
        
        // נושאים
        'theme.light': 'בהיר',
        'theme.dark': 'כהה',
        'theme.auto': 'אוטומטי',
        
        // שפות
        'language.he': 'עברית',
        'language.en': 'English'
      };

      // תרגומים לאנגלית
      const englishTranslations = {
        // תפריט
        'menu.dashboard': 'Dashboard',
        'menu.trades': 'Trades',
        'menu.trade-plans': 'Trade Plans',
        'menu.tickers': 'Tickers',
        'menu.accounts': 'Accounts',
        'menu.cash-flows': 'Cash Flows',
        'menu.notes': 'Notes',
        'menu.development': 'Development Tools',
        
        // פילטרים
        'filter.status': 'Status',
        'filter.type': 'Type',
        'filter.account': 'Account',
        'filter.date': 'Date',
        'filter.search': 'Search',
        'filter.all': 'All',
        'filter.open': 'Open',
        'filter.closed': 'Closed',
        'filter.cancelled': 'Cancelled',
        'filter.investment': 'Investment',
        'filter.swing': 'Swing',
        'filter.passive': 'Passive',
        'filter.today': 'Today',
        'filter.week': 'This Week',
        'filter.month': 'This Month',
        'filter.quarter': 'This Quarter',
        'filter.year': 'This Year',
        
        // כפתורים
        'button.reset': 'Reset',
        'button.clear': 'Clear',
        'button.save': 'Save',
        'button.cancel': 'Cancel',
        'button.close': 'Close',
        'button.back': 'Back',
        'button.forward': 'Forward',
        'button.refresh': 'Refresh',
        'button.home': 'Home',
        
        // הודעות
        'message.loading': 'Loading...',
        'message.saving': 'Saving...',
        'message.saved': 'Saved successfully',
        'message.error': 'Error',
        'message.success': 'Success',
        'message.warning': 'Warning',
        'message.info': 'Information',
        
        // ניווט
        'nav.back': 'Back',
        'nav.forward': 'Forward',
        'nav.refresh': 'Refresh',
        'nav.home': 'Home',
        
        // העדפות
        'preferences.theme': 'Theme',
        'preferences.language': 'Language',
        'preferences.animations': 'Animations',
        'preferences.sound': 'Sound',
        'preferences.auto-save': 'Auto Save',
        'preferences.compact-mode': 'Compact Mode',
        
        // נושאים
        'theme.light': 'Light',
        'theme.dark': 'Dark',
        'theme.auto': 'Auto',
        
        // שפות
        'language.he': 'עברית',
        'language.en': 'English'
      };

      // שמירת תרגומים
      this.translations.set('he', hebrewTranslations);
      this.translations.set('en', englishTranslations);
      
      this.log.debug('תרגומים נטענו');
      
    } catch (error) {
      this.log.error('TranslationComponent.loadTranslations error:', error);
    }
  }

  /**
   * הגדרת event listeners
   */
  setupEventListeners() {
    try {
      // מאזין לשינוי שפה
      this.eventService.on(HEADER_EVENTS.LANGUAGE_CHANGED, (event) => {
        this.handleLanguageChange(event);
      });

      // מאזין לבקשת תרגום
      this.eventService.on(HEADER_EVENTS.TRANSLATION_REQUESTED, (event) => {
        this.handleTranslationRequest(event);
      });

      // מאזין לעדכון תרגומים
      this.eventService.on(HEADER_EVENTS.TRANSLATIONS_UPDATED, (event) => {
        this.handleTranslationsUpdate(event);
      });

      this.log.debug('Event listeners הוגדרו');
      
    } catch (error) {
      this.log.error('TranslationComponent.setupEventListeners error:', error);
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
        if (newValue.language && newValue.language !== this.currentLanguage) {
          this.setLanguage(newValue.language);
        }
      });

      this.log.debug('מאזיני מצב הוגדרו');
      
    } catch (error) {
      this.log.error('TranslationComponent.setupStateListeners error:', error);
    }
  }

  /**
   * אתחול שפה
   */
  async initializeLanguage() {
    try {
      // קבלת שפה מהמצב
      let language = 'he'; // ברירת מחדל
      
      if (this.stateComponent) {
        const uiState = this.stateComponent.getUIState();
        language = uiState.language || 'he';
      }
      
      // הגדרת שפה
      await this.setLanguage(language);
      
    } catch (error) {
      this.log.error('TranslationComponent.initializeLanguage error:', error);
    }
  }

  /**
   * הגדרת שפה
   * @param {string} language - השפה החדשה
   */
  async setLanguage(language) {
    try {
      if (!this.translations.has(language)) {
        this.log.warn(`שפה לא נתמכת: ${language}`);
        return;
      }

      const oldLanguage = this.currentLanguage;
      this.currentLanguage = language;

      // עדכון מצב UI
      if (this.stateComponent) {
        const uiState = this.stateComponent.getUIState();
        this.stateComponent.updateUIState({
          ...uiState,
          language: language
        });
      }

      // עדכון HTML
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';

      // תרגום אלמנטים קיימים
      await this.translateExistingElements();

      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.LANGUAGE_CHANGED, {
        language: language,
        previousLanguage: oldLanguage
      });

      this.log.debug(`שפה הוגדרה ל: ${language}`);
      
    } catch (error) {
      this.log.error('TranslationComponent.setLanguage error:', error);
    }
  }

  /**
   * תרגום אלמנטים קיימים
   */
  async translateExistingElements() {
    try {
      // תרגום אלמנטים עם data-translate
      const elementsToTranslate = DOMUtils.selectAll('[data-translate]');
      
      elementsToTranslate.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translatedText = this.translate(key);
        
        if (translatedText) {
          if (element.tagName === 'INPUT' && element.type === 'text') {
            element.placeholder = translatedText;
          } else {
            DOMUtils.setText(element, translatedText);
          }
        }
      });

      // תרגום אלמנטים עם data-translate-attr
      const elementsWithAttr = DOMUtils.selectAll('[data-translate-attr]');
      
      elementsWithAttr.forEach(element => {
        const attrData = element.getAttribute('data-translate-attr');
        const [attr, key] = attrData.split(':');
        
        if (attr && key) {
          const translatedText = this.translate(key);
          if (translatedText) {
            DOMUtils.setAttribute(element, attr, translatedText);
          }
        }
      });

      this.log.debug('אלמנטים קיימים תורגמו');
      
    } catch (error) {
      this.log.error('TranslationComponent.translateExistingElements error:', error);
    }
  }

  /**
   * תרגום מפתח
   * @param {string} key - מפתח התרגום
   * @param {Object} params - פרמטרים להחלפה
   * @returns {string} - הטקסט המתורגם
   */
  translate(key, params = {}) {
    try {
      const languageTranslations = this.translations.get(this.currentLanguage);
      
      if (!languageTranslations) {
        this.log.warn(`תרגומים לא זמינים עבור שפה: ${this.currentLanguage}`);
        return key;
      }

      let translatedText = languageTranslations[key];
      
      if (!translatedText) {
        this.log.warn(`תרגום לא נמצא עבור מפתח: ${key}`);
        return key;
      }

      // החלפת פרמטרים
      if (Object.keys(params).length > 0) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          const placeholder = `{${paramKey}}`;
          translatedText = translatedText.replace(new RegExp(placeholder, 'g'), paramValue);
        });
      }

      return translatedText;
      
    } catch (error) {
      this.log.error('TranslationComponent.translate error:', error);
      return key;
    }
  }

  /**
   * תרגום אלמנט
   * @param {HTMLElement} element - האלמנט
   * @param {string} key - מפתח התרגום
   * @param {Object} params - פרמטרים להחלפה
   */
  translateElement(element, key, params = {}) {
    try {
      const translatedText = this.translate(key, params);
      
      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = translatedText;
      } else {
        DOMUtils.setText(element, translatedText);
      }
      
    } catch (error) {
      this.log.error('TranslationComponent.translateElement error:', error);
    }
  }

  /**
   * תרגום אלמנט עם תכונה
   * @param {HTMLElement} element - האלמנט
   * @param {string} attribute - התכונה
   * @param {string} key - מפתח התרגום
   * @param {Object} params - פרמטרים להחלפה
   */
  translateElementAttribute(element, attribute, key, params = {}) {
    try {
      const translatedText = this.translate(key, params);
      DOMUtils.setAttribute(element, attribute, translatedText);
      
    } catch (error) {
      this.log.error('TranslationComponent.translateElementAttribute error:', error);
    }
  }

  /**
   * הוספת תרגום
   * @param {string} language - השפה
   * @param {string} key - מפתח התרגום
   * @param {string} value - הערך המתורגם
   */
  addTranslation(language, key, value) {
    try {
      if (!this.translations.has(language)) {
        this.translations.set(language, {});
      }

      const languageTranslations = this.translations.get(language);
      languageTranslations[key] = value;
      
      this.log.debug(`תרגום נוסף: ${language}.${key} = ${value}`);
      
    } catch (error) {
      this.log.error('TranslationComponent.addTranslation error:', error);
    }
  }

  /**
   * הוספת תרגומים מרובים
   * @param {string} language - השפה
   * @param {Object} translations - התרגומים
   */
  addTranslations(language, translations) {
    try {
      if (!this.translations.has(language)) {
        this.translations.set(language, {});
      }

      const languageTranslations = this.translations.get(language);
      Object.assign(languageTranslations, translations);
      
      this.log.debug(`תרגומים נוספו עבור שפה: ${language}`);
      
    } catch (error) {
      this.log.error('TranslationComponent.addTranslations error:', error);
    }
  }

  /**
   * קבלת תרגום
   * @param {string} language - השפה
   * @param {string} key - מפתח התרגום
   * @returns {string} - הערך המתורגם
   */
  getTranslation(language, key) {
    try {
      const languageTranslations = this.translations.get(language);
      return languageTranslations?.[key] || key;
      
    } catch (error) {
      this.log.error('TranslationComponent.getTranslation error:', error);
      return key;
    }
  }

  /**
   * קבלת כל התרגומים לשפה
   * @param {string} language - השפה
   * @returns {Object} - התרגומים
   */
  getTranslations(language) {
    try {
      return this.translations.get(language) || {};
      
    } catch (error) {
      this.log.error('TranslationComponent.getTranslations error:', error);
      return {};
    }
  }

  /**
   * קבלת שפה נוכחית
   * @returns {string} - השפה הנוכחית
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * קבלת שפות זמינות
   * @returns {Array} - רשימת שפות
   */
  getAvailableLanguages() {
    return Array.from(this.translations.keys());
  }

  /**
   * בדיקת תמיכה בשפה
   * @param {string} language - השפה
   * @returns {boolean} - האם השפה נתמכת
   */
  isLanguageSupported(language) {
    return this.translations.has(language);
  }

  /**
   * טיפול בשינוי שפה
   * @param {Object} event - האירוע
   */
  handleLanguageChange(event) {
    try {
      const { language } = event.data;
      
      // עדכון מצב UI
      if (this.stateComponent) {
        const uiState = this.stateComponent.getUIState();
        this.stateComponent.updateUIState({
          ...uiState,
          language: language
        });
      }
      
    } catch (error) {
      this.log.error('TranslationComponent.handleLanguageChange error:', error);
    }
  }

  /**
   * טיפול בבקשת תרגום
   * @param {Object} event - האירוע
   */
  handleTranslationRequest(event) {
    try {
      const { key, params, callback } = event.data;
      
      const translatedText = this.translate(key, params);
      
      if (callback && typeof callback === 'function') {
        callback(translatedText);
      }
      
    } catch (error) {
      this.log.error('TranslationComponent.handleTranslationRequest error:', error);
    }
  }

  /**
   * טיפול בעדכון תרגומים
   * @param {Object} event - האירוע
   */
  handleTranslationsUpdate(event) {
    try {
      const { language, translations } = event.data;
      
      this.addTranslations(language, translations);
      
    } catch (error) {
      this.log.error('TranslationComponent.handleTranslationsUpdate error:', error);
    }
  }

  /**
   * יצירת אלמנט מתורגם
   * @param {string} tagName - שם התג
   * @param {string} key - מפתח התרגום
   * @param {Object} options - אפשרויות נוספות
   * @returns {HTMLElement} - האלמנט
   */
  createTranslatedElement(tagName, key, options = {}) {
    try {
      const element = DOMUtils.create(tagName, options);
      this.translateElement(element, key);
      return element;
      
    } catch (error) {
      this.log.error('TranslationComponent.createTranslatedElement error:', error);
      return null;
    }
  }

  /**
   * יצירת כפתור מתורגם
   * @param {string} key - מפתח התרגום
   * @param {Object} options - אפשרויות נוספות
   * @returns {HTMLElement} - הכפתור
   */
  createTranslatedButton(key, options = {}) {
    try {
      return this.createTranslatedElement('button', key, {
        type: 'button',
        ...options
      });
      
    } catch (error) {
      this.log.error('TranslationComponent.createTranslatedButton error:', error);
      return null;
    }
  }

  /**
   * יצירת תווית מתורגמת
   * @param {string} key - מפתח התרגום
   * @param {Object} options - אפשרויות נוספות
   * @returns {HTMLElement} - התווית
   */
  createTranslatedLabel(key, options = {}) {
    try {
      return this.createTranslatedElement('label', key, options);
      
    } catch (error) {
      this.log.error('TranslationComponent.createTranslatedLabel error:', error);
      return null;
    }
  }

  /**
   * הרס הרכיב
   */
  destroy() {
    try {
      this.log.info('משמיד TranslationComponent...');
      
      // ניקוי תרגומים
      this.translations.clear();
      
      this.isInitialized = false;
      this.log.info('TranslationComponent הושמד');
      
    } catch (error) {
      this.log.error('TranslationComponent.destroy error:', error);
    }
  }

  /**
   * קבלת מידע על הרכיב
   * @returns {Object} - מידע על הרכיב
   */
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      currentLanguage: this.currentLanguage,
      availableLanguages: this.getAvailableLanguages(),
      translationsCount: Array.from(this.translations.values()).reduce((total, lang) => total + Object.keys(lang).length, 0),
      config: this.config
    };
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TranslationComponent;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.TranslationComponent = TranslationComponent;
}

console.log('✅ TranslationComponent נוצר ופועל');
