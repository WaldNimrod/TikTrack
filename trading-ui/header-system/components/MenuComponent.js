/**
 * Menu Component - Header System
 * רכיב תפריט למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

class MenuComponent {
  constructor(headerSystem) {
    this.headerSystem = headerSystem;
    this.eventService = null;
    this.stateComponent = null;
    this.translationComponent = null;
    this.uiService = null;
    this.isInitialized = false;
    this.menuItems = new Map();
    this.activeItem = null;
    this.isOpen = false;
    this.config = HEADER_CONFIG.MENU;
    
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
          console.log('🔍 [MenuComponent]', ...args);
        }
      },
      info: (...args) => {
        if (['debug', 'info'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.log('ℹ️ [MenuComponent]', ...args);
        }
      },
      warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(HEADER_CONFIG.LOGGING.LEVEL) && HEADER_CONFIG.LOGGING.CONSOLE) {
          console.warn('⚠️ [MenuComponent]', ...args);
        }
      },
      error: (...args) => {
        if (HEADER_CONFIG.LOGGING.CONSOLE) {
          console.error('❌ [MenuComponent]', ...args);
        }
      }
    };
  }

  /**
   * אתחול הרכיב
   */
  async init() {
    try {
      this.log.info('מתחיל אתחול MenuComponent...');
      
      // קבלת שירותים ורכיבים
      this.eventService = this.headerSystem.getService('event');
      this.stateComponent = this.headerSystem.getComponent('state');
      this.translationComponent = this.headerSystem.getComponent('translation');
      this.uiService = this.headerSystem.getService('ui');
      
      if (!this.eventService) {
        throw new Error('EventService not available');
      }
      
      // יצירת פריטי תפריט
      await this.createMenuItems();
      
      // הגדרת event listeners
      this.setupEventListeners();
      
      // הגדרת מאזיני מצב
      this.setupStateListeners();
      
      // אתחול תפריט
      await this.initializeMenu();
      
      this.isInitialized = true;
      this.log.info('MenuComponent אותחל בהצלחה');
      
    } catch (error) {
      this.log.error('שגיאה באתחול MenuComponent:', error);
      throw error;
    }
  }

  /**
   * יצירת פריטי תפריט
   */
  async createMenuItems() {
    try {
      // פריטי תפריט ברירת מחדל
      const defaultMenuItems = [
        {
          id: 'dashboard',
          text: 'menu.dashboard',
          href: '/dashboard',
          icon: '📊',
          order: 1,
          visible: true,
          submenu: []
        },
        {
          id: 'trades',
          text: 'menu.trades',
          href: '/trades',
          icon: '💼',
          order: 2,
          visible: true,
          submenu: []
        },
        {
          id: 'trade-plans',
          text: 'menu.trade-plans',
          href: '/trade-plans',
          icon: '📋',
          order: 3,
          visible: true,
          submenu: []
        },
        {
          id: 'tickers',
          text: 'menu.tickers',
          href: '/tickers',
          icon: '📈',
          order: 4,
          visible: true,
          submenu: []
        },
        {
          id: 'accounts',
          text: 'menu.accounts',
          href: '/accounts',
          icon: '🏦',
          order: 5,
          visible: true,
          submenu: []
        },
        {
          id: 'cash-flows',
          text: 'menu.cash-flows',
          href: '/cash-flows',
          icon: '💰',
          order: 6,
          visible: true,
          submenu: []
        },
        {
          id: 'notes',
          text: 'menu.notes',
          href: '/notes',
          icon: '📝',
          order: 7,
          visible: true,
          submenu: []
        },
        {
          id: 'development',
          text: 'menu.development',
          href: '/development',
          icon: '🛠️',
          order: 8,
          visible: true,
          submenu: [
            {
              id: 'development-tools',
              text: 'menu.development-tools',
              href: '/development/tools',
              icon: '🔧',
              order: 1
            },
            {
              id: 'development-settings',
              text: 'menu.development-settings',
              href: '/development/settings',
              icon: '⚙️',
              order: 2
            }
          ]
        }
      ];

      // יצירת פריטי תפריט
      defaultMenuItems.forEach(item => {
        this.menuItems.set(item.id, item);
      });
      
      this.log.debug('פריטי תפריט נוצרו');
      
    } catch (error) {
      this.log.error('MenuComponent.createMenuItems error:', error);
    }
  }

  /**
   * הגדרת event listeners
   */
  setupEventListeners() {
    try {
      // מאזין ללחיצות תפריט
      this.eventService.on(HEADER_EVENTS.MENU_ITEM_CLICKED, (event) => {
        this.handleMenuItemClick(event);
      });

      // מאזין לשינויי תפריט
      this.eventService.on(HEADER_EVENTS.MENU_CHANGED, (event) => {
        this.handleMenuChange(event);
      });

      // מאזין לפתיחה/סגירה של תפריט
      this.eventService.on(HEADER_EVENTS.MENU_TOGGLE, (event) => {
        this.handleMenuToggle(event);
      });

      // מאזין לשינויי שפה
      this.eventService.on(HEADER_EVENTS.LANGUAGE_CHANGED, (event) => {
        this.handleLanguageChange(event);
      });

      this.log.debug('Event listeners הוגדרו');
      
    } catch (error) {
      this.log.error('MenuComponent.setupEventListeners error:', error);
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
        this.handleMenuStateChange(newValue);
      });

      this.log.debug('מאזיני מצב הוגדרו');
      
    } catch (error) {
      this.log.error('MenuComponent.setupStateListeners error:', error);
    }
  }

  /**
   * אתחול תפריט
   */
  async initializeMenu() {
    try {
      // טעינת מצב תפריט
      if (this.stateComponent) {
        const menuState = this.stateComponent.getMenuState();
        this.isOpen = menuState.isOpen || false;
        this.activeItem = menuState.activeItem || null;
      }

      // יצירת DOM
      await this.createMenuDOM();

      // עדכון UI
      this.updateMenuUI();
      
    } catch (error) {
      this.log.error('MenuComponent.initializeMenu error:', error);
    }
  }

  /**
   * יצירת DOM תפריט
   */
  async createMenuDOM() {
    try {
      // מציאת אלמנט תפריט קיים
      let menuElement = DOMUtils.select('#mainMenu');
      
      if (!menuElement) {
        // יצירת אלמנט תפריט חדש
        menuElement = DOMUtils.create('ul', {
          id: 'mainMenu',
          className: 'tiktrack-nav-list'
        });
        
        // הוספה לכותרת
        const headerNav = DOMUtils.select('.header-nav .main-nav');
        if (headerNav) {
          DOMUtils.append(headerNav, menuElement);
        }
      }

      // ניקוי תוכן קיים
      DOMUtils.setHTML(menuElement, '');

      // יצירת פריטי תפריט
      const sortedItems = Array.from(this.menuItems.values())
        .filter(item => item.visible)
        .sort((a, b) => a.order - b.order);

      sortedItems.forEach(item => {
        const menuItemElement = this.createMenuItemElement(item);
        if (menuItemElement) {
          DOMUtils.append(menuElement, menuItemElement);
        }
      });

      this.log.debug('DOM תפריט נוצר');
      
    } catch (error) {
      this.log.error('MenuComponent.createMenuDOM error:', error);
    }
  }

  /**
   * יצירת אלמנט פריט תפריט
   * @param {Object} item - נתוני הפריט
   * @returns {HTMLElement} - אלמנט הפריט
   */
  createMenuItemElement(item) {
    try {
      const li = DOMUtils.create('li', {
        className: 'tiktrack-nav-item',
        'data-menu-id': item.id
      });

      const link = DOMUtils.create('a', {
        href: item.href,
        className: 'tiktrack-nav-link',
        'data-menu-item': item.id
      });

      // הוספת אייקון
      if (item.icon) {
        const iconSpan = DOMUtils.create('span', {
          className: 'menu-icon',
          textContent: item.icon
        });
        DOMUtils.append(link, iconSpan);
      }

      // הוספת טקסט
      const textSpan = DOMUtils.create('span', {
        className: 'menu-text',
        'data-translate': item.text
      });
      
      // תרגום טקסט
      if (this.translationComponent) {
        const translatedText = this.translationComponent.translate(item.text);
        DOMUtils.setText(textSpan, translatedText);
      } else {
        DOMUtils.setText(textSpan, item.text);
      }
      
      DOMUtils.append(link, textSpan);

      // הוספת submenu אם קיים
      if (item.submenu && item.submenu.length > 0) {
        const arrowSpan = DOMUtils.create('span', {
          className: 'tiktrack-dropdown-arrow',
          textContent: '▼'
        });
        DOMUtils.append(link, arrowSpan);

        const submenu = this.createSubmenuElement(item.submenu, item.id);
        if (submenu) {
          DOMUtils.append(li, submenu);
        }
      }

      DOMUtils.append(li, link);

      // הוספת event listener
      EventUtils.addListener(link, 'click', (event) => {
        this.handleMenuItemClick(event, item);
      });

      return li;
      
    } catch (error) {
      this.log.error('MenuComponent.createMenuItemElement error:', error);
      return null;
    }
  }

  /**
   * יצירת אלמנט submenu
   * @param {Array} submenuItems - פריטי ה-submenu
   * @param {string} parentId - מזהה הפריט האב
   * @returns {HTMLElement} - אלמנט ה-submenu
   */
  createSubmenuElement(submenuItems, parentId) {
    try {
      const submenu = DOMUtils.create('ul', {
        className: 'tiktrack-dropdown-menu',
        'data-parent-id': parentId
      });

      const sortedSubmenuItems = submenuItems
        .sort((a, b) => a.order - b.order);

      sortedSubmenuItems.forEach(subItem => {
        const submenuItem = DOMUtils.create('li', {
          className: 'tiktrack-dropdown-item'
        });

        const submenuLink = DOMUtils.create('a', {
          href: subItem.href,
          className: 'tiktrack-dropdown-link',
          'data-submenu-item': subItem.id
        });

        // הוספת אייקון
        if (subItem.icon) {
          const iconSpan = DOMUtils.create('span', {
            className: 'submenu-icon',
            textContent: subItem.icon
          });
          DOMUtils.append(submenuLink, iconSpan);
        }

        // הוספת טקסט
        const textSpan = DOMUtils.create('span', {
          className: 'submenu-text',
          'data-translate': subItem.text
        });
        
        // תרגום טקסט
        if (this.translationComponent) {
          const translatedText = this.translationComponent.translate(subItem.text);
          DOMUtils.setText(textSpan, translatedText);
        } else {
          DOMUtils.setText(textSpan, subItem.text);
        }
        
        DOMUtils.append(submenuLink, textSpan);
        DOMUtils.append(submenuItem, submenuLink);
        DOMUtils.append(submenu, submenuItem);

        // הוספת event listener
        EventUtils.addListener(submenuLink, 'click', (event) => {
          this.handleSubmenuItemClick(event, subItem, parentId);
        });
      });

      return submenu;
      
    } catch (error) {
      this.log.error('MenuComponent.createSubmenuElement error:', error);
      return null;
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
      
      // עדכון פריט פעיל
      this.setActiveItem(item.id);
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.MENU_ITEM_CLICKED, {
        item: item,
        event: event
      });
      
      this.log.debug('לחיצת פריט תפריט:', item);
      
    } catch (error) {
      this.log.error('MenuComponent.handleMenuItemClick error:', error);
    }
  }

  /**
   * טיפול בלחיצת פריט submenu
   * @param {Event} event - האירוע
   * @param {Object} subItem - נתוני הפריט
   * @param {string} parentId - מזהה הפריט האב
   */
  handleSubmenuItemClick(event, subItem, parentId) {
    try {
      event.preventDefault();
      
      // עדכון פריט פעיל
      this.setActiveItem(subItem.id);
      
      // שליחת אירוע
      this.eventService.emit(HEADER_EVENTS.MENU_ITEM_CLICKED, {
        item: subItem,
        parentId: parentId,
        event: event
      });
      
      this.log.debug('לחיצת פריט submenu:', subItem);
      
    } catch (error) {
      this.log.error('MenuComponent.handleSubmenuItemClick error:', error);
    }
  }

  /**
   * טיפול בשינוי תפריט
   * @param {Object} event - האירוע
   */
  handleMenuChange(event) {
    try {
      const { action, data } = event.data;
      
      switch (action) {
        case 'add':
          this.addMenuItem(data);
          break;
        case 'remove':
          this.removeMenuItem(data.id);
          break;
        case 'update':
          this.updateMenuItem(data);
          break;
        case 'toggle':
          this.toggleMenu();
          break;
      }
      
    } catch (error) {
      this.log.error('MenuComponent.handleMenuChange error:', error);
    }
  }

  /**
   * טיפול בפתיחה/סגירה של תפריט
   * @param {Object} event - האירוע
   */
  handleMenuToggle(event) {
    try {
      this.toggleMenu();
      
    } catch (error) {
      this.log.error('MenuComponent.handleMenuToggle error:', error);
    }
  }

  /**
   * טיפול בשינוי שפה
   * @param {Object} event - האירוע
   */
  handleLanguageChange(event) {
    try {
      // תרגום מחדש של כל פריטי התפריט
      this.translateMenuItems();
      
    } catch (error) {
      this.log.error('MenuComponent.handleLanguageChange error:', error);
    }
  }

  /**
   * טיפול בשינוי מצב תפריט
   * @param {Object} menuState - מצב התפריט
   */
  handleMenuStateChange(menuState) {
    try {
      this.isOpen = menuState.isOpen || false;
      this.activeItem = menuState.activeItem || null;
      
      // עדכון UI
      this.updateMenuUI();
      
    } catch (error) {
      this.log.error('MenuComponent.handleMenuStateChange error:', error);
    }
  }

  /**
   * הגדרת פריט פעיל
   * @param {string} itemId - מזהה הפריט
   */
  setActiveItem(itemId) {
    try {
      this.activeItem = itemId;
      
      // עדכון מצב
      if (this.stateComponent) {
        this.stateComponent.updateMenuState({
          activeItem: itemId,
          isOpen: this.isOpen
        });
      }
      
      // עדכון UI
      this.updateActiveItemUI();
      
      this.log.debug(`פריט פעיל הוגדר: ${itemId}`);
      
    } catch (error) {
      this.log.error('MenuComponent.setActiveItem error:', error);
    }
  }

  /**
   * החלפת מצב תפריט
   */
  toggleMenu() {
    try {
      this.isOpen = !this.isOpen;
      
      // עדכון מצב
      if (this.stateComponent) {
        this.stateComponent.updateMenuState({
          activeItem: this.activeItem,
          isOpen: this.isOpen
        });
      }
      
      // עדכון UI
      this.updateMenuVisibility();
      
      this.log.debug(`תפריט ${this.isOpen ? 'נפתח' : 'נסגר'}`);
      
    } catch (error) {
      this.log.error('MenuComponent.toggleMenu error:', error);
    }
  }

  /**
   * הוספת פריט תפריט
   * @param {Object} item - נתוני הפריט
   */
  addMenuItem(item) {
    try {
      this.menuItems.set(item.id, item);
      
      // עדכון DOM
      this.createMenuDOM();
      
      this.log.debug(`פריט תפריט נוסף: ${item.id}`);
      
    } catch (error) {
      this.log.error('MenuComponent.addMenuItem error:', error);
    }
  }

  /**
   * הסרת פריט תפריט
   * @param {string} itemId - מזהה הפריט
   */
  removeMenuItem(itemId) {
    try {
      this.menuItems.delete(itemId);
      
      // עדכון DOM
      this.createMenuDOM();
      
      this.log.debug(`פריט תפריט הוסר: ${itemId}`);
      
    } catch (error) {
      this.log.error('MenuComponent.removeMenuItem error:', error);
    }
  }

  /**
   * עדכון פריט תפריט
   * @param {Object} item - נתוני הפריט החדשים
   */
  updateMenuItem(item) {
    try {
      if (this.menuItems.has(item.id)) {
        this.menuItems.set(item.id, { ...this.menuItems.get(item.id), ...item });
        
        // עדכון DOM
        this.createMenuDOM();
        
        this.log.debug(`פריט תפריט עודכן: ${item.id}`);
      }
      
    } catch (error) {
      this.log.error('MenuComponent.updateMenuItem error:', error);
    }
  }

  /**
   * תרגום פריטי תפריט
   */
  translateMenuItems() {
    try {
      if (!this.translationComponent) return;

      // תרגום פריטי תפריט ראשיים
      const menuTexts = DOMUtils.selectAll('.menu-text[data-translate]');
      menuTexts.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translatedText = this.translationComponent.translate(key);
        DOMUtils.setText(element, translatedText);
      });

      // תרגום פריטי submenu
      const submenuTexts = DOMUtils.selectAll('.submenu-text[data-translate]');
      submenuTexts.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translatedText = this.translationComponent.translate(key);
        DOMUtils.setText(element, translatedText);
      });
      
      this.log.debug('פריטי תפריט תורגמו');
      
    } catch (error) {
      this.log.error('MenuComponent.translateMenuItems error:', error);
    }
  }

  /**
   * עדכון UI תפריט
   */
  updateMenuUI() {
    try {
      this.updateMenuVisibility();
      this.updateActiveItemUI();
      
    } catch (error) {
      this.log.error('MenuComponent.updateMenuUI error:', error);
    }
  }

  /**
   * עדכון נראות תפריט
   */
  updateMenuVisibility() {
    try {
      const menuElement = DOMUtils.select('#mainMenu');
      if (menuElement) {
        DOMUtils.toggleClass(menuElement, 'menu-open', this.isOpen);
      }
      
    } catch (error) {
      this.log.error('MenuComponent.updateMenuVisibility error:', error);
    }
  }

  /**
   * עדכון פריט פעיל UI
   */
  updateActiveItemUI() {
    try {
      // הסרת מחלקת active מכל הפריטים
      const allItems = DOMUtils.selectAll('.tiktrack-nav-item');
      allItems.forEach(item => {
        DOMUtils.removeClass(item, 'active');
      });

      // הוספת מחלקת active לפריט הפעיל
      if (this.activeItem) {
        const activeItemElement = DOMUtils.select(`[data-menu-id="${this.activeItem}"]`);
        if (activeItemElement) {
          DOMUtils.addClass(activeItemElement, 'active');
        }
      }
      
    } catch (error) {
      this.log.error('MenuComponent.updateActiveItemUI error:', error);
    }
  }

  /**
   * קבלת פריט תפריט
   * @param {string} itemId - מזהה הפריט
   * @returns {Object} - פריט התפריט
   */
  getMenuItem(itemId) {
    return this.menuItems.get(itemId);
  }

  /**
   * קבלת כל פריטי התפריט
   * @returns {Array} - רשימת פריטי התפריט
   */
  getAllMenuItems() {
    return Array.from(this.menuItems.values());
  }

  /**
   * קבלת פריט פעיל
   * @returns {string} - מזהה הפריט הפעיל
   */
  getActiveItem() {
    return this.activeItem;
  }

  /**
   * בדיקת מצב תפריט
   * @returns {boolean} - האם התפריט פתוח
   */
  isMenuOpen() {
    return this.isOpen;
  }

  /**
   * הרס הרכיב
   */
  destroy() {
    try {
      this.log.info('משמיד MenuComponent...');
      
      // ניקוי פריטי תפריט
      this.menuItems.clear();
      
      // הסרת DOM
      const menuElement = DOMUtils.select('#mainMenu');
      if (menuElement) {
        DOMUtils.remove(menuElement);
      }
      
      this.isInitialized = false;
      this.log.info('MenuComponent הושמד');
      
    } catch (error) {
      this.log.error('MenuComponent.destroy error:', error);
    }
  }

  /**
   * קבלת מידע על הרכיב
   * @returns {Object} - מידע על הרכיב
   */
  getInfo() {
    return {
      isInitialized: this.isInitialized,
      menuItemsCount: this.menuItems.size,
      activeItem: this.activeItem,
      isOpen: this.isOpen,
      config: this.config
    };
  }
}

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MenuComponent;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.MenuComponent = MenuComponent;
}

console.log('✅ MenuComponent נוצר ופועל');
