/**
 * Header System - TikTrack Frontend - v6.0.0 - New Architecture with Old Interface
 * ==================================
 *
 * Header System JS loading...
 *
 * Unified header element with menu, logo, and smart filtering system
 *
 * Features:
 * - Logo and title display
 * - Navigation menu
 * - Unified filter system that adapts to each table
 * - Consistent design across all pages
 * - Dynamic filter text updates
 * - Responsive design and mobile support
 *
 * Architecture:
 * - New modular architecture with old interface
 * - Event-driven communication with pages
 * - Modular filter system
 *
 * ⚠️ IMPORTANT: This file contains ONLY filter-related toggle functions!
 * - toggleHeaderFilters() - Main filter panel toggle
 * - toggleStatusFilterMenu() - Status filter dropdown
 * - toggleTypeFilterMenu() - Type filter dropdown
 * - toggleAccountFilterMenu() - Trading account filter dropdown
 * - toggleDateRangeFilterMenu() - Date range filter dropdown
 *
 * General section toggle functions are handled by ui-utils.js
 *
 * Dependencies:
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 * - CSS: header-system.css
 *
 * @author TikTrack Development Team
 * @version 6.0.0
 * @lastUpdated January 15, 2025
 */

// Removed debug log - file loading is tracked internally
if (window.Logger) {
  window.Logger.info('🚀 Loading Header System v6.0.0...', { page: 'header-system' });
}

/**
 * מערכת ראש דף מאוחדת עם פילטרים
 * כוללת את כל הפונקציונליות של הפילטרים
 */
// ===== Initialization State Tracking =====
let __initializationState = {
  headerCreated: false,
  filterSystemCreated: false,
  accountsLoaded: false,
  eventListenersSetup: false,
  hoverBehaviorSetup: false,
  initialized: false,
  startTime: null,
  endTime: null,
  stages: {},
};

// Expose for debugging
window.__headerInitializationState = __initializationState;

class HeaderSystem {
  constructor() {
    this.isInitialized = false;
    // Reset initialization state for new instance
    __initializationState = {
      headerCreated: false,
      filterSystemCreated: false,
      accountsLoaded: false,
      eventListenersSetup: false,
      hoverBehaviorSetup: false,
      initialized: false,
      startTime: null,
      endTime: null,
      stages: {},
    };
  }

  /**
   * Cleanup method - removes all event listeners, portals, and timeouts
   * Should be called before re-initialization to prevent duplicates
   */
  static cleanup() {
    window.Logger?.info?.('🧹 HeaderSystem.cleanup() - START', {
      page: 'header-system',
      timestamp: new Date().toISOString(),
    });

    try {
      // Cleanup all portals
      if (typeof __headerFilterPortals !== 'undefined' && __headerFilterPortals instanceof Map) {
        let portalsCleaned = 0;
        __headerFilterPortals.forEach((portal, menuId) => {
          try {
            // Remove scroll and resize listeners
            if (portal.__repositionHandler) {
              window.removeEventListener('scroll', portal.__repositionHandler, true);
              window.removeEventListener('resize', portal.__repositionHandler);
            }
            
            // Remove portal from DOM
            if (portal && portal.parentNode) {
              portal.remove();
            }
            
            portalsCleaned++;
            window.Logger?.debug?.(`🧹 Cleaned up portal for ${menuId}`, {
              page: 'header-system',
            });
          } catch (error) {
            window.Logger?.warn?.(`⚠️ Error cleaning up portal for ${menuId}:`, error.message, {
              page: 'header-system',
            });
          }
        });
        
        __headerFilterPortals.clear();
        window.Logger?.info?.(`✅ Cleaned up ${portalsCleaned} portals`, {
          page: 'header-system',
        });
      }

      // Cleanup all hover timeouts
      if (typeof hoverTimeouts !== 'undefined' && hoverTimeouts instanceof Map) {
        let timeoutsCleaned = 0;
        hoverTimeouts.forEach((timeoutId, buttonId) => {
          try {
            clearTimeout(timeoutId);
            timeoutsCleaned++;
          } catch (error) {
            window.Logger?.warn?.(`⚠️ Error clearing timeout for ${buttonId}:`, error.message, {
              page: 'header-system',
            });
          }
        });
        
        hoverTimeouts.clear();
        window.Logger?.info?.(`✅ Cleaned up ${timeoutsCleaned} hover timeouts`, {
          page: 'header-system',
        });
      }

      // Cleanup event listeners from filter buttons
      const filterButtons = [
        { buttonId: 'statusFilterToggle', menuId: 'statusFilterMenu' },
        { buttonId: 'typeFilterToggle', menuId: 'typeFilterMenu' },
        { buttonId: 'accountFilterToggle', menuId: 'accountFilterMenu' },
        { buttonId: 'dateRangeFilterToggle', menuId: 'dateRangeFilterMenu' },
      ];

      let listenersCleaned = 0;
      filterButtons.forEach(({ buttonId, menuId }) => {
        const button = document.getElementById(buttonId);
        const menu = document.getElementById(menuId);

        if (button) {
          // Remove stored handlers
          if (button.__hoverHandlers) {
            try {
              if (button.__hoverHandlers.mouseenter) {
                button.removeEventListener('mouseenter', button.__hoverHandlers.mouseenter);
                listenersCleaned++;
              }
              if (button.__hoverHandlers.mouseleave) {
                button.removeEventListener('mouseleave', button.__hoverHandlers.mouseleave);
                listenersCleaned++;
              }
              if (button.__hoverHandlers.click) {
                button.removeEventListener('click', button.__hoverHandlers.click, true);
                listenersCleaned++;
              }
              
              // Clear the handlers reference
              delete button.__hoverHandlers;
              
              window.Logger?.debug?.(`🧹 Cleaned up event listeners for ${buttonId}`, {
                page: 'header-system',
              });
            } catch (error) {
              window.Logger?.warn?.(`⚠️ Error cleaning up listeners for ${buttonId}:`, error.message, {
                page: 'header-system',
              });
            }
          }
        }

        // Cleanup menu event listeners
        if (menu) {
          // Clone the menu to remove all event listeners
          // (Note: This is a workaround - ideally we'd track all listeners)
          const menuClone = menu.cloneNode(true);
          if (menu.parentNode) {
            menu.parentNode.replaceChild(menuClone, menu);
            menuClone.id = menuId;
            // Restore the menu element reference
            if (window.Logger) {
              window.Logger.debug(`🧹 Cleaned up menu event listeners for ${menuId}`, {
                page: 'header-system',
              });
            }
          }
        }
      });

      // Reset setup flag
      if (typeof __setupHoverBehaviorCalled !== 'undefined') {
        __setupHoverBehaviorCalled = false;
      }

      // Close all open menus
      filterButtons.forEach(({ menuId }) => {
        const menu = document.getElementById(menuId);
        if (menu && menu.classList.contains('show')) {
          menu.classList.remove('show');
        }
      });

      window.Logger?.info?.(`✅ HeaderSystem.cleanup() - COMPLETE`, {
        page: 'header-system',
        listenersCleaned,
        portalsCleaned: typeof __headerFilterPortals !== 'undefined' ? __headerFilterPortals.size : 0,
        timeoutsCleaned: typeof hoverTimeouts !== 'undefined' ? hoverTimeouts.size : 0,
      });

      return {
        success: true,
        listenersCleaned,
        portalsCleaned: typeof __headerFilterPortals !== 'undefined' ? __headerFilterPortals.size : 0,
        timeoutsCleaned: typeof hoverTimeouts !== 'undefined' ? hoverTimeouts.size : 0,
      };
    } catch (error) {
      window.Logger?.error?.(`❌ HeaderSystem.cleanup() - ERROR:`, error.message, {
        page: 'header-system',
        stack: error.stack,
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  init() {
    window.Logger.info('🔧 HeaderSystem.init() called', {
      page: 'header-system',
      isInitialized: this.isInitialized,
      bodyExists: !!document.body,
      readyState: document.readyState,
      stackTrace: new Error().stack?.split('\n').slice(1, 5).join('\n'),
    });

    // Cleanup before initialization to prevent duplicates
    HeaderSystem.cleanup();

    if (this.isInitialized) {
      window.Logger.info('⚠️ HeaderSystem.init() - Already initialized, resetting state', {
        page: 'header-system',
      });
      this.isInitialized = false; // Reset to allow re-initialization after cleanup
    }

    // Track initialization start
    __initializationState.startTime = Date.now();
    window.Logger.info('📝 HeaderSystem.init() - About to call createHeader()', {
      page: 'header-system',
      startTime: new Date(__initializationState.startTime).toISOString(),
    });

    // Stage 1: Create header HTML
    const stage1Start = Date.now();
    try {
      HeaderSystem.createHeader();
      __initializationState.headerCreated = true;
      __initializationState.stages.createHeader = {
        success: true,
        duration: Date.now() - stage1Start,
        timestamp: new Date(stage1Start).toISOString(),
      };
      window.Logger.info('✅ Stage 1 complete: Header created', {
        page: 'header-system',
        duration: `${Date.now() - stage1Start}ms`,
      });
    } catch (error) {
      __initializationState.stages.createHeader = {
        success: false,
        error: error.message,
        duration: Date.now() - stage1Start,
        timestamp: new Date(stage1Start).toISOString(),
      };
      window.Logger.error('❌ Stage 1 failed: Header creation', {
        page: 'header-system',
        error: error.message,
      });
      throw error; // Don't continue if header creation fails
    }

    // Stage 2: Create filter system
    const stage2Start = Date.now();
    if (typeof HeaderSystem.createFilterSystem === 'function') {
      // קריאה async בתוך setTimeout כדי לא לעצור את האתחול
      setTimeout(async () => {
        try {
          await HeaderSystem.createFilterSystem();
          __initializationState.filterSystemCreated = true;
          __initializationState.stages.createFilterSystem = {
            success: true,
            duration: Date.now() - stage2Start,
            timestamp: new Date(stage2Start).toISOString(),
          };
          window.Logger.info('✅ Stage 2 complete: Filter system created', {
            page: 'header-system',
            duration: `${Date.now() - stage2Start}ms`,
          });
        } catch (error) {
          __initializationState.stages.createFilterSystem = {
            success: false,
            error: error.message,
            duration: Date.now() - stage2Start,
            timestamp: new Date(stage2Start).toISOString(),
          };
          window.Logger.error('❌ Stage 2 failed: Filter system creation', {
            page: 'header-system',
            error: error.message,
          });
        }
      }, 0);
    }

    // טעינת חשבונות לפילטר - ממתין להעדפות לפני טעינה
    // Wait for critical preferences to be loaded before loading accounts
    const waitForPreferences = async () => {
      const environment = window.API_ENV || 'development';
      const timeoutMs = environment === 'production' ? 5000 : 3000;
      
      return new Promise((resolve) => {
        // Check if preferences are already loaded (check both currentPreferences and global flag)
        if (window.currentPreferences && Object.keys(window.currentPreferences).length > 0) {
          resolve();
          return;
        }
        
        // Check if event already fired (race condition fix)
        if (window.__preferencesCriticalLoaded) {
          window.Logger?.debug?.('✅ Preferences already loaded (flag check)', {
            page: 'header-system',
          });
          resolve();
          return;
        }
        
        // Wait for preferences:critical-loaded event
        const eventHandler = () => {
          resolve();
        };
        
        window.addEventListener('preferences:critical-loaded', eventHandler, { once: true });
        
        // Fallback timeout - continue even if event doesn't fire (backward compatibility)
        setTimeout(() => {
          window.removeEventListener('preferences:critical-loaded', eventHandler);
          // Check flag one more time before timeout
          if (window.__preferencesCriticalLoaded) {
            window.Logger?.debug?.('✅ Preferences loaded during timeout check', {
              page: 'header-system',
            });
          } else {
            window.Logger?.warn?.('⚠️ Preferences event timeout - continuing without preferences', {
              page: 'header-system',
              timeout: `${timeoutMs}ms`,
            });
          }
          resolve();
        }, timeoutMs);
      });
    };
    
    // Stage 3: Load accounts for filter
    const stage3Start = Date.now();
    setTimeout(async () => {
      try {
        await waitForPreferences();
        await HeaderSystem.loadAccountsForFilter();
        __initializationState.accountsLoaded = true;
        __initializationState.stages.loadAccountsForFilter = {
          success: true,
          duration: Date.now() - stage3Start,
          timestamp: new Date(stage3Start).toISOString(),
        };
        window.Logger.info('✅ Stage 3 complete: Accounts loaded for filter', {
          page: 'header-system',
          duration: `${Date.now() - stage3Start}ms`,
        });
      } catch (error) {
        __initializationState.stages.loadAccountsForFilter = {
          success: false,
          error: error.message,
          duration: Date.now() - stage3Start,
          timestamp: new Date(stage3Start).toISOString(),
        };
        window.Logger.error('❌ Stage 3 failed: Loading accounts for filter', {
          page: 'header-system',
          error: error.message,
        });
        // Don't throw - initialization can continue
      }
    }, 100);

    // Stage 4: Setup event listeners
    const stage4Start = Date.now();
    window.Logger.info('🔧 HeaderSystem.init() - Setting up event listeners', {
      page: 'header-system',
    });
    try {
      HeaderSystem.setupEventListeners();
      __initializationState.eventListenersSetup = true;
      __initializationState.stages.setupEventListeners = {
        success: true,
        duration: Date.now() - stage4Start,
        timestamp: new Date(stage4Start).toISOString(),
      };
      window.Logger.info('✅ Stage 4 complete: Event listeners setup', {
        page: 'header-system',
        duration: `${Date.now() - stage4Start}ms`,
      });
    } catch (error) {
      __initializationState.stages.setupEventListeners = {
        success: false,
        error: error.message,
        duration: Date.now() - stage4Start,
        timestamp: new Date(stage4Start).toISOString(),
      };
      window.Logger.error('❌ Stage 4 failed: Event listeners setup', {
        page: 'header-system',
        error: error.message,
      });
      // Don't throw - continue with hover behavior
    }

    // טעינת מצב שמור - יקרא אחרי שמערכת הפילטרים תהיה מוכנה
    // HeaderSystem.loadSavedState();

    // Stage 5: Setup hover behavior for filter menus (called once after all initialization is complete)
    const stage5Start = Date.now();
    window.Logger.info('🔧 HeaderSystem.init() - Setting up hover behavior', {
      page: 'header-system',
      headerElementExists: !!document.getElementById('unified-header'),
    });
    try {
      setupHoverBehavior();
      __initializationState.hoverBehaviorSetup = true;
      __initializationState.stages.setupHoverBehavior = {
        success: true,
        duration: Date.now() - stage5Start,
        timestamp: new Date(stage5Start).toISOString(),
      };
      window.Logger.info('✅ Stage 5 complete: Hover behavior setup', {
        page: 'header-system',
        duration: `${Date.now() - stage5Start}ms`,
      });
    } catch (error) {
      __initializationState.stages.setupHoverBehavior = {
        success: false,
        error: error.message,
        duration: Date.now() - stage5Start,
        timestamp: new Date(stage5Start).toISOString(),
      };
      window.Logger.error('❌ Stage 5 failed: Hover behavior setup', {
        page: 'header-system',
        error: error.message,
      });
      // Don't throw - initialization can continue
    }

    this.isInitialized = true;
    __initializationState.initialized = true;
    __initializationState.endTime = Date.now();

    // בדיקה סופית אחרי כל האתחול
    const finalHeaderElement = document.getElementById('unified-header');
    const finalCheck = {
      headerElementExists: !!finalHeaderElement,
      headerElementInDOM: finalHeaderElement ? document.body.contains(finalHeaderElement) : false,
      headerElementVisible: finalHeaderElement ? window.getComputedStyle(finalHeaderElement).display !== 'none' : false,
      headerElementHeight: finalHeaderElement?.offsetHeight || 0,
      headerContentExists: !!document.querySelector('#unified-header .header-content'),
      headerNavExists: !!document.querySelector('#unified-header .header-nav'),
      navItemsCount: document.querySelectorAll('#unified-header .tiktrack-nav-item').length,
    };

    const totalDuration = __initializationState.endTime - __initializationState.startTime;
    window.Logger.info('✅ HeaderSystem.init() - COMPLETE', {
      page: 'header-system',
      isInitialized: this.isInitialized,
      finalCheck: finalCheck,
      totalDuration: `${totalDuration}ms`,
      stages: __initializationState.stages,
      allStagesComplete: Object.keys(__initializationState.stages).every(
        stage => __initializationState.stages[stage]?.success === true
      ),
      timestamp: new Date().toISOString(),
    });
  }

  static createHeader() {
    window.Logger.info('🏗️ HeaderSystem.createHeader() - START', {
      page: 'header-system',
      bodyExists: !!document.body,
      readyState: document.readyState,
      existingElement: !!document.getElementById('unified-header'),
    });

    try {
      // מציאת או יצירת אלמנט הכותרת
      let headerElement = document.getElementById('unified-header');
      
      if (!headerElement) {
        window.Logger.info('📦 HeaderSystem.createHeader() - Creating new header element', {
          page: 'header-system',
          bodyExists: !!document.body,
        });

        if (!document.body) {
          window.Logger.error('❌ HeaderSystem.createHeader() - document.body does not exist!', {
            page: 'header-system',
            readyState: document.readyState,
          });
          throw new Error('document.body does not exist when trying to create header element');
        }

        headerElement = document.createElement('div');
        headerElement.id = 'unified-header';
        document.body.insertBefore(headerElement, document.body.firstChild);
        
        window.Logger.info('✅ HeaderSystem.createHeader() - Header element created and inserted', {
          page: 'header-system',
          elementId: headerElement.id,
          parentElement: headerElement.parentElement?.tagName,
          isInDOM: document.body.contains(headerElement),
        });
      } else {
        window.Logger.info('♻️ HeaderSystem.createHeader() - Reusing existing header element', {
          page: 'header-system',
          elementId: headerElement.id,
          isInDOM: document.body.contains(headerElement),
        });
      }

      // הוספת התוכן לאלמנט
      window.Logger.info('📝 HeaderSystem.createHeader() - Getting header HTML', {
        page: 'header-system',
      });
      const headerHTML = HeaderSystem.getHeaderHTML();
      
      window.Logger.info('📝 HeaderSystem.createHeader() - Setting innerHTML', {
        page: 'header-system',
        htmlLength: headerHTML.length,
      });
      headerElement.textContent = '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(headerHTML, 'text/html');
      doc.body.childNodes.forEach(node => {
          headerElement.appendChild(node.cloneNode(true));
      });

      // בדיקות אחרי יצירה
      const createdElements = {
        headerElement: !!document.getElementById('unified-header'),
        headerContent: !!document.querySelector('#unified-header .header-content'),
        headerTop: !!document.querySelector('#unified-header .header-top'),
        headerNav: !!document.querySelector('#unified-header .header-nav'),
        logoSection: !!document.querySelector('#unified-header .logo-section'),
        navList: !!document.querySelector('#unified-header .tiktrack-nav-list'),
        navItems: document.querySelectorAll('#unified-header .tiktrack-nav-item').length,
      };

      // בדיקת סגנונות
      const computedStyle = window.getComputedStyle(headerElement);
      const styleInfo = {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        position: computedStyle.position,
        zIndex: computedStyle.zIndex,
        width: computedStyle.width,
        height: computedStyle.height,
        backgroundColor: computedStyle.backgroundColor,
        opacity: computedStyle.opacity,
      };

      // בדיקת טעינת header-styles.css
      const styleSheets = Array.from(document.styleSheets);
      const headerCssLoaded = styleSheets.some(sheet => {
        try {
          return sheet.href && sheet.href.includes('header-styles.css');
        } catch (e) {
          return false;
        }
      });

      window.Logger.info('✅ HeaderSystem.createHeader() - COMPLETE', {
        page: 'header-system',
        elementsCreated: createdElements,
        headerElementVisible: computedStyle.display !== 'none',
        headerElementHeight: headerElement.offsetHeight,
        headerElementWidth: headerElement.offsetWidth,
        computedStyle: styleInfo,
        headerCssLoaded: headerCssLoaded,
        allStyleSheets: styleSheets.map(s => {
          try {
            return s.href ? s.href.split('/').pop() : 'inline';
          } catch {
            return 'unknown';
          }
        }),
      });

    } catch (error) {
      window.Logger.error('❌ HeaderSystem.createHeader() - ERROR', {
        page: 'header-system',
        error: error.message,
        stack: error.stack,
        bodyExists: !!document.body,
        readyState: document.readyState,
      });
      throw error; // Re-throw to allow init() to handle
    }

    // בדיקה אם הפונקציות מוגדרות
    // window.Logger.info('🔧 Checking if filter functions are defined:', { page: "header-system" });
    window.Logger.info('selectStatusOption:', typeof window.selectStatusOption, {
      page: 'header-system',
    });
    window.Logger.info('updateStatusFilterText:', typeof window.updateStatusFilterText, {
      page: 'header-system',
    });
    window.Logger.info('applyStatusFilter:', typeof window.applyStatusFilter, {
      page: 'header-system',
    });
  }

  static getHeaderHTML() {
    // Detect if we're in a mockup page and adjust image paths accordingly
    // Check both pathname and href to handle different server configurations
    const pathname = window.location.pathname || '';
    const href = window.location.href || '';
    const isMockupPage = pathname.includes('/mockups/') || href.includes('/mockups/');
    const imagePathPrefix = isMockupPage ? '../../' : '';
    
    // Debug log for troubleshooting
    if (isMockupPage && window.Logger) {
      window.Logger.debug('🔍 Mockup page detected, using image path prefix', {
        page: 'header-system',
        pathname: pathname,
        href: href,
        imagePathPrefix: imagePathPrefix
      });
    }
    
    return `
        <div class="header-content">
          <!-- אזור לוגו ותפריט -->
          <div class="header-top">
            <div class="header-container">
              <!-- תפריט ניווט -->
              <div class="header-nav">
                <nav class="main-nav">
                  <ul class="tiktrack-nav-list">
                    <li class="tiktrack-nav-item">
                      <a href="/" class="tiktrack-nav-link" data-page="home">
                        <img src="${imagePathPrefix}images/icons/home.svg" alt="בית" width="36" height="36" class="nav-icon home-icon-only">
                      </a>
                    </li>

                    <li class="tiktrack-nav-item">
                      <a href="/trade_plans" class="tiktrack-nav-link" data-page="trade_plans">
                        <span class="nav-text">תכנון</span>
                      </a>
                    </li>

                    <li class="tiktrack-nav-item">
                      <a href="/trades" class="tiktrack-nav-link" data-page="trades">
                        <span class="nav-text">מעקב</span>
                      </a>
                    </li>

                    <li class="tiktrack-nav-item">
                      <a href="/research" class="tiktrack-nav-link" data-page="research">
                        <span class="nav-text">מחקר</span>
                      </a>
                    </li>

                    <li class="tiktrack-nav-item dropdown">
                      <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="data">
                        <span class="nav-text">נתונים</span>
                        <span class="tiktrack-dropdown-arrow">▼</span>
                      </a>
                      <ul class="tiktrack-dropdown-menu">
                        <li><a class="tiktrack-dropdown-item" href="/alerts">התראות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/notes">הערות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/trading_accounts">חשבונות מסחר</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/tickers">טיקרים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/executions">ביצועים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/cash_flows">תזרימי מזומנים</a></li>
                      </ul>
                    </li>

                    <li class="tiktrack-nav-item dropdown">
                      <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="settings">
                        <span class="nav-text">הגדרות</span>
                        <span class="tiktrack-dropdown-arrow">▼</span>
                      </a>
                      <ul class="tiktrack-dropdown-menu">
                        <li><a class="tiktrack-dropdown-item" href="/data_import">ייבוא נתונים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/tag-management">ניהול תגיות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/preferences">העדפות</a></li>
                        <li class="separator"></li>
                        <li><a class="tiktrack-dropdown-item" href="/db_display">בסיס נתונים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/db_extradata">טבלאות עזר</a></li>
                      </ul>
                    </li>

                    <li class="tiktrack-nav-item dropdown">
                      <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="development-tools">
                        <span class="nav-text">פיתוח</span>
                        <span class="tiktrack-dropdown-arrow">▼</span>
                      </a>
                      <ul class="tiktrack-dropdown-menu">
                        <li><a class="tiktrack-dropdown-item" href="/system-management">🔧 ניהול מערכת</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/server-monitor">🖥️ ניטור שרת</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/background-tasks">⚙️ ניהול משימות רקע</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/notifications-center">🔔 מרכז התראות</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/external-data-dashboard">📊 דשבורד נתונים חיצוניים</a></li>

                        <li class="separator"></li>

                        <li><a class="tiktrack-dropdown-item" href="/code-quality-dashboard">📊 איכות קוד ולינטר</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/cache-management">💾 ניהול מטמון</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/init-system-management">🚀 ניהול מערכת אתחול</a></li>

                        <li class="separator"></li>

                        <li><a class="tiktrack-dropdown-item" href="/cache-test">💾 בדיקת Cache (עמוד בדיקות מטמון)</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/crud-testing-dashboard">🧪 דשבורד בדיקות CRUD</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/conditions-test">🧩 בדיקות תנאים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/constraints">🔒 מוניטור אילוצים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/test-header-only">🧪 בדיקת ראש הדף</a></li>

                        <li class="separator"></li>

                        <li><a class="tiktrack-dropdown-item" href="/css-management">🎨 מנהל CSS</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/mockups/daily-snapshots/tradingview-test-page.html">📈 גראפים TV</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/chart-management">📊 ניהול גרפים</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/dynamic-colors-display">🌈 תצוגת צבעים דינמית</a></li>
                        <li><a class="tiktrack-dropdown-item" href="/designs">🎭 עיצובים</a></li>
                      </ul>
                    </li>

                    <li class="tiktrack-nav-item">
                      <a href="#" class="tiktrack-nav-link" data-onclick="CacheControlMenu.triggerAction('full', event)" 
                         title="ניקוי מטמון לפיתוח">
                        <span class="nav-text" style="color: #ff0000; font-size: 1.2rem;">🧹</span>
                      </a>
                      <ul class="submenu" style="display: none; position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-width: 240px; z-index: 1000; padding: 0; margin: 0; list-style: none;">
                        <li><a href="#" data-cache-action="memory"
                               data-onclick="CacheControlMenu.triggerAction('memory', event)"
                               style="display: block; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px; border-bottom: 1px solid #eee; font-weight: 500;"
                               title="ניקוי שכבת הזיכרון בלבד (Memory)">🧠 ניקוי שכבת זיכרון</a></li>
                        <li><a href="#" data-cache-action="local-storage"
                               data-onclick="CacheControlMenu.triggerAction('local-storage', event)"
                               style="display: block; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px; border-bottom: 1px solid #eee;"
                               title="ניקוי מטמון localStorage (כולל העדפות פרופיל)">💽 ניקוי localStorage</a></li>
                        <li><a href="#" data-cache-action="indexeddb"
                               data-onclick="CacheControlMenu.triggerAction('indexeddb', event)"
                               style="display: block; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px; border-bottom: 1px solid #eee;"
                               title="ניקוי המטמון המאוחסן ב-IndexedDB">🗃️ ניקוי IndexedDB</a></li>
                        <li><a href="#" data-cache-action="full"
                               data-onclick="CacheControlMenu.triggerAction('full', event)"
                               style="display: block; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px; font-weight: bold;"
                               title="ניקוי כל שכבות המטמון + רענון אוטומטי">🌀 ניקוי מלא + רענון</a></li>
                      </ul>
                    </li>

                    <li class="tiktrack-nav-item">
                      <a href="#" class="tiktrack-nav-link" onclick="runQuickQualityCheck(event)" 
                         title="בדיקת איכות מהירה">
                        <span class="nav-text" style="color: #26baac; font-size: 1.2rem;">⚡</span>
                      </a>
                    </li>

                    <li class="tiktrack-nav-item">
                      <a href="#" class="tiktrack-nav-link" id="initSystemCheckBtn" 
                         title="ניטור מערכת איתחול"
                         data-onclick="initSystemCheck?.runPageCheck(event)">
                        <span class="nav-text" style="color: #26baac; font-size: 1.2rem;">🔍</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>

              <div class="logo-section">
                <div class="logo">
                  <img src="${imagePathPrefix}images/logo.svg" alt="TikTrack Logo" class="logo-image">
                  <span class="logo-text">פשוט לנהל תיק</span>
                </div>
              </div>
              
              <!-- כפתור פתיחה/סגירה של הפילטר - בתוך התפריט הראשי -->
              <div class="filter-toggle-section filter-toggle-main">
                <button class="header-filter-toggle-btn" id="headerFilterToggleBtnMain" title="הצג/הסתר פילטרים" 
                        data-onclick="toggleHeaderFilters()">
                  <span class="header-filter-arrow">▲</span>
                </button>
              </div>

            </div>
          </div>

        <!-- אזור פילטרים -->
        <div class="header-filters" id="headerFilters" data-section="filters">
          <div class="filters-container">
            <!-- פילטר סטטוס -->
            <div class="filter-group status-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle status-filter-toggle" id="statusFilterToggle">
                  <span class="selected-value selected-status-text" id="selectedStatus">כל סטטוס</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="statusFilterMenu">
                  <div class="status-filter-item" data-value="הכול" onclick="selectStatusOption('הכול')">
                    <span class="option-text">הכול</span>
                  </div>
                  <div class="status-filter-item" data-value="פתוח" onclick="selectStatusOption('פתוח')">
                    <span class="option-text">פתוח</span>
                  </div>
                  <div class="status-filter-item" data-value="סגור" onclick="selectStatusOption('סגור')">
                    <span class="option-text">סגור</span>
                  </div>
                  <div class="status-filter-item" data-value="מבוטל" onclick="selectStatusOption('מבוטל')">
                    <span class="option-text">מבוטל</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר סוג השקעה -->
            <div class="filter-group type-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle type-filter-toggle" id="typeFilterToggle">
                                          <span class="selected-value selected-type-text" id="selectedType">כל סוג השקעה</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="typeFilterMenu">
                  <div class="type-filter-item" data-value="הכול" onclick="selectTypeOption('הכול')">
                    <span class="option-text">הכול</span>
                  </div>
                  <!-- סוגי השקעות -->
                  <div class="type-filter-item" data-value="סווינג" onclick="selectTypeOption('סווינג')">
                    <span class="option-text">סווינג</span>
                  </div>
                  <div class="type-filter-item" data-value="השקעה" onclick="selectTypeOption('השקעה')">
                    <span class="option-text">השקעה</span>
                  </div>
                  <div class="type-filter-item" data-value="פאסיבי" onclick="selectTypeOption('פאסיבי')">
                    <span class="option-text">פאסיבי</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר חשבון מסחר -->
            <div class="filter-group account-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle account-filter-toggle" id="accountFilterToggle">
                  <span class="selected-value selected-account-text" id="selectedAccount">כל חשבון מסחר</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="accountFilterMenu">
                  <div class="account-filter-item" data-value="הכול" onclick="selectAccountOption('הכול')">
                    <span class="option-text">הכול</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר תאריכים -->
            <div class="filter-group date-range-filter">
              <div class="filter-dropdown">
                <button class="filter-toggle date-range-filter-toggle" id="dateRangeFilterToggle">
                  <span class="selected-value selected-date-text" id="selectedDateRange">כל זמן</span>
                  <span class="dropdown-arrow">▼</span>
                </button>
                <div class="filter-menu" id="dateRangeFilterMenu">
                  <div class="date-range-filter-item" data-value="כל זמן" onclick="selectDateRangeOption('כל זמן')">
                    <span class="option-text">כל זמן</span>
                  </div>
                  <div class="date-range-filter-item" data-value="היום" onclick="selectDateRangeOption('היום')">
                    <span class="option-text">היום</span>
                  </div>
                  <div class="date-range-filter-item" data-value="אתמול" onclick="selectDateRangeOption('אתמול')">
                    <span class="option-text">אתמול</span>
                  </div>
                  <div class="date-range-filter-item" data-value="השבוע" onclick="selectDateRangeOption('השבוע')">
                    <span class="option-text">השבוע</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שבוע" onclick="selectDateRangeOption('שבוע')">
                    <span class="option-text">שבוע (7 ימים)</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שבוע קודם" onclick="selectDateRangeOption('שבוע קודם')">
                    <span class="option-text">שבוע שעבר</span>
                  </div>
                  <div class="date-range-filter-item" data-value="החודש" onclick="selectDateRangeOption('החודש')">
                    <span class="option-text">החודש</span>
                  </div>
                  <div class="date-range-filter-item" data-value="חודש" onclick="selectDateRangeOption('חודש')">
                    <span class="option-text">חודש (30 יום)</span>
                  </div>
                  <div class="date-range-filter-item" data-value="חודש קודם" onclick="selectDateRangeOption('חודש קודם')">
                    <span class="option-text">חודש קודם</span>
                  </div>
                  <div class="date-range-filter-item" data-value="השנה" onclick="selectDateRangeOption('השנה')">
                    <span class="option-text">השנה</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שנה" onclick="selectDateRangeOption('שנה')">
                    <span class="option-text">שנה (365 ימים)</span>
                  </div>
                  <div class="date-range-filter-item" data-value="שנה קודמת" onclick="selectDateRangeOption('שנה קודמת')">
                    <span class="option-text">שנה שעברה</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- פילטר חיפוש -->
            <div class="filter-group search-filter">
              <div class="search-input-wrapper">
                <input type="text" class="search-filter-input" id="searchFilterInput" 
                       placeholder="חיפוש..." onkeyup="handleSearchInput(event)">
                <button class="search-clear-btn" onclick="clearSearchFilter()" title="נקה חיפוש">×</button>
              </div>
            </div>

            <!-- כפתורי פעולה -->
            <div class="filter-actions">
              <button class="reset-btn" onclick="resetAllFilters()" title="איפוס פילטרים">
                <span class="btn-text">↻</span>
              </button>
              <button class="clear-btn" onclick="clearAllFilters()" title="נקה כל הפילטרים">
                <span class="btn-text">×</span>
              </button>
            </div>
            
            <!-- כפתור פתיחה/סגירה של הפילטר - בתוך הפילטר -->
            <div class="filter-toggle-section filter-toggle-secondary">
              <button class="header-filter-toggle-btn" id="headerFilterToggleBtnSecondary" title="הצג/הסתר פילטרים" 
                      data-onclick="toggleHeaderFilters()">
                <span class="header-filter-arrow">▼</span>
              </button>
            </div>
          </div>
        </div>
        
        </div>
    `;
  }

  static setupEventListeners() {
    window.Logger?.info?.(`🔧 setupEventListeners() - START`, {
      page: 'header-system',
      timestamp: new Date().toISOString(),
    });

    // Validation: Ensure header element exists
    const headerElement = document.getElementById('unified-header');
    if (!headerElement || !document.body.contains(headerElement)) {
      window.Logger?.error?.(`❌ Header element not found or not in DOM`, {
        page: 'header-system',
        headerExists: !!headerElement,
        inDOM: headerElement ? document.body.contains(headerElement) : false,
      });
      return; // Don't continue if header doesn't exist
    }

    // Cleanup existing event listeners before adding new ones
    try {
      // Store references to existing listeners for cleanup
      const elementsWithListeners = [
        { selector: '.filter-toggle[data-onclick]', type: 'filter-toggle' },
        { selector: '.tiktrack-nav-item:has(.submenu)', type: 'nav-item-with-submenu' },
      ];

      elementsWithListeners.forEach(({ selector, type }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          // Clone element to remove all event listeners
          try {
            const clone = element.cloneNode(true);
            if (element.parentNode) {
              // Preserve attributes
              Array.from(element.attributes).forEach(attr => {
                clone.setAttribute(attr.name, attr.value);
              });
              element.parentNode.replaceChild(clone, element);
              window.Logger?.debug?.(`🧹 Cleaned up event listeners for ${type}`, {
                page: 'header-system',
                element: selector,
              });
            }
          } catch (error) {
            window.Logger?.warn?.(`⚠️ Error cleaning up ${type}:`, error.message, {
              page: 'header-system',
            });
          }
        });
      });
    } catch (error) {
      window.Logger?.warn?.(`⚠️ Error in setupEventListeners cleanup:`, error.message, {
        page: 'header-system',
      });
      // Continue anyway - cleanup is best effort
    }

    // הגדרת מצב הכפתורים בהתאם למצב הפילטר
    try {
      if (typeof window.updateToggleButtons === 'function') {
        window.updateToggleButtons();
      } else {
        window.Logger?.warn?.(`⚠️ updateToggleButtons function not available`, {
          page: 'header-system',
        });
      }
    } catch (error) {
      window.Logger?.error?.(`❌ Error calling updateToggleButtons:`, error.message, {
        page: 'header-system',
      });
    }

    // הוספת סגנונות CSS
    HeaderSystem.addStyles();

    // עדכון מצב הכפתורים בטעינה הראשונית
    setTimeout(() => {
      window.updateToggleButtons();
    }, 100);

    // עדכון נוסף לאחר טעינה מלאה
    setTimeout(() => {
      window.updateToggleButtons();
    }, 500);

    // אין מאזיני click כפולים כאן. הטיפול מתבצע דרך data-onclick ע"י EventHandlerManager.

    // בדיקת מעבר עכבר לכפתורי פילטר
    setTimeout(() => {
      const filterButtons = document.querySelectorAll('.filter-toggle[data-onclick]');
      filterButtons.forEach((btn, index) => {
        // בדיקת מעבר עכבר
        btn.addEventListener('mouseenter', () => {
          // Mouse enter event tracked
        });

        btn.addEventListener('click', e => {
          // Click event tracked
        });
      });
    }, 1000);

    // הוספת event listeners לתפריט משנה של ניקוי
    setTimeout(() => {
      const cleanupItem = document.querySelector('.tiktrack-nav-item:has(.submenu)');
      if (cleanupItem) {
        cleanupItem.addEventListener('mouseenter', () => {
          const submenu = cleanupItem.querySelector('.submenu');
          if (submenu) {
            submenu.style.display = 'block';
          }
        });

        cleanupItem.addEventListener('mouseleave', () => {
          const submenu = cleanupItem.querySelector('.submenu');
          if (submenu) {
            submenu.style.display = 'none';
          }
        });
      }
    }, 100);

    // ===== ניטור ובדיקה לתפריטי משנה - פתיחה כפולה =====
    setTimeout(() => {
      console.log('🔍 [HeaderSystem] Starting dropdown menu monitoring...');
      
      const dropdownItems = document.querySelectorAll('.tiktrack-nav-item.dropdown');
      console.log(`🔍 [HeaderSystem] Found ${dropdownItems.length} dropdown menu items`);
      
      dropdownItems.forEach((item, index) => {
        const menu = item.querySelector('.tiktrack-dropdown-menu');
        if (!menu) {
          console.warn(`⚠️ [HeaderSystem] Dropdown item ${index} has no menu`);
          return;
        }
        
        const menuId = menu.id || `menu-${index}`;
        console.log(`🔍 [HeaderSystem] Monitoring dropdown ${index}:`, {
          itemClass: item.className,
          menuId: menuId,
          menuVisible: menu.offsetParent !== null,
          menuOpacity: window.getComputedStyle(menu).opacity,
          menuVisibility: window.getComputedStyle(menu).visibility,
          menuDisplay: window.getComputedStyle(menu).display,
        });
        
        // ניטור mouseenter
        item.addEventListener('mouseenter', (e) => {
          const computedStyle = window.getComputedStyle(menu);
          console.log(`🖱️ [HeaderSystem] MOUSEENTER on dropdown ${index}:`, {
            menuId: menuId,
            timestamp: new Date().toISOString(),
            opacity: computedStyle.opacity,
            visibility: computedStyle.visibility,
            display: computedStyle.display,
            transform: computedStyle.transform,
            zIndex: computedStyle.zIndex,
            eventTarget: e.target.tagName,
            eventCurrentTarget: e.currentTarget.tagName,
          });
          
          // בדיקה אם התפריט כבר פתוח
          setTimeout(() => {
            const afterStyle = window.getComputedStyle(menu);
            const visibleMenus = document.querySelectorAll('.tiktrack-dropdown-menu[style*="opacity: 1"], .tiktrack-dropdown-menu[style*="visibility: visible"]');
            const allMenus = document.querySelectorAll('.tiktrack-dropdown-menu');
            
            console.log(`📊 [HeaderSystem] After mouseenter (${index}):`, {
              menuId: menuId,
              opacity: afterStyle.opacity,
              visibility: afterStyle.visibility,
              display: afterStyle.display,
              visibleMenusCount: visibleMenus.length,
              totalMenusCount: allMenus.length,
              allVisibleMenus: Array.from(visibleMenus).map(m => m.id || 'no-id'),
            });
            
            // בדיקה אם יש תפריטים כפולים
            if (visibleMenus.length > 1) {
              console.warn(`⚠️ [HeaderSystem] Multiple menus visible! Count: ${visibleMenus.length}`);
              visibleMenus.forEach((m, i) => {
                console.warn(`  Menu ${i}:`, {
                  id: m.id || 'no-id',
                  parent: m.parentElement?.className || 'no-parent',
                  opacity: window.getComputedStyle(m).opacity,
                  visibility: window.getComputedStyle(m).visibility,
                });
              });
            }
          }, 50);
        }, { capture: true });
        
        // ניטור mouseleave - סגירת תפריט כשיש יציאה מהפריט הראשי
        let closeTimeout;
        item.addEventListener('mouseleave', (e) => {
          const computedStyle = window.getComputedStyle(menu);
          console.log(`🖱️ [HeaderSystem] MOUSELEAVE on dropdown ${index}:`, {
            menuId: menuId,
            timestamp: new Date().toISOString(),
            opacity: computedStyle.opacity,
            visibility: computedStyle.visibility,
            display: computedStyle.display,
          });
          
          // בדיקה אם העכבר עבר לתפריט המשנה
          const relatedTarget = e.relatedTarget;
          const isMovingToMenu = relatedTarget && (
            menu.contains(relatedTarget) || 
            relatedTarget.closest('.tiktrack-dropdown-menu') === menu
          );
          
          if (!isMovingToMenu) {
            // סגירת התפריט אחרי עיכוב קצר
            clearTimeout(closeTimeout);
            closeTimeout = setTimeout(() => {
              // בדיקה נוספת - אם העכבר עדיין לא בתפריט
              const itemHovered = item.matches(':hover');
              const menuHovered = menu.matches(':hover');
              
              if (!itemHovered && !menuHovered) {
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(-10px)';
                console.log(`✅ [HeaderSystem] Closed dropdown ${index} on mouseleave`);
              }
            }, 100);
          }
        }, { capture: true });
        
        // שמירת התפריט פתוח כשיש hover עליו
        menu.addEventListener('mouseenter', () => {
          clearTimeout(closeTimeout);
        });
        
        // סגירת התפריט כשיש יציאה מהתפריט עצמו
        menu.addEventListener('mouseleave', (e) => {
          const relatedTarget = e.relatedTarget;
          const isMovingToItem = relatedTarget && (
            item.contains(relatedTarget) || 
            relatedTarget.closest('.tiktrack-nav-item.dropdown') === item
          );
          
          if (!isMovingToItem) {
            clearTimeout(closeTimeout);
            closeTimeout = setTimeout(() => {
              const itemHovered = item.matches(':hover');
              const menuHovered = menu.matches(':hover');
              
              if (!itemHovered && !menuHovered) {
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(-10px)';
                console.log(`✅ [HeaderSystem] Closed dropdown ${index} on menu mouseleave`);
              }
            }, 100);
          }
        });
        
        // ניטור שינויים ב-CSS
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              const computedStyle = window.getComputedStyle(menu);
              console.log(`🔄 [HeaderSystem] Style changed for dropdown ${index}:`, {
                menuId: menuId,
                opacity: computedStyle.opacity,
                visibility: computedStyle.visibility,
                display: computedStyle.display,
                transform: computedStyle.transform,
                newStyle: menu.getAttribute('style'),
              });
            }
          });
        });
        
        observer.observe(menu, {
          attributes: true,
          attributeFilter: ['style', 'class'],
        });
      });
      
      // בדיקת CSS rules שמשפיעים על התפריטים
      console.log('🔍 [HeaderSystem] Checking CSS rules...');
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach((sheet, sheetIndex) => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          rules.forEach((rule, ruleIndex) => {
            if (rule.selectorText && (
              rule.selectorText.includes('tiktrack-dropdown-menu') ||
              rule.selectorText.includes('tiktrack-nav-item')
            )) {
              console.log(`📝 [HeaderSystem] CSS Rule found:`, {
                sheetIndex: sheetIndex,
                ruleIndex: ruleIndex,
                selector: rule.selectorText,
                href: sheet.href || 'inline',
                cssText: rule.cssText.substring(0, 100),
              });
            }
          });
        } catch (e) {
          // Cross-origin stylesheets may throw errors
        }
      });
      
      console.log('✅ [HeaderSystem] Dropdown menu monitoring initialized');
      
      // Display tracking info
      console.log('\n📊 ===== MENU OPENING TRACKING ACTIVE =====');
      console.log('💡 All menu open/close events are being tracked');
      console.log('💡 Use window.printMenuTrackingSummary() to see summary');
      console.log('💡 Use window.printMenuTrackingSummary("statusFilterMenu") for specific menu');
      console.log('💡 Use window.getMenuTrackingSummary() for full data object');
      console.log('==========================================\n');
    }, 500);
  }

  static addStyles() {
    const style = document.createElement('style');
    style.textContent = HeaderSystem.getHeaderStyles();
    document.head.appendChild(style);
  }

  static getHeaderStyles() {
    return `
      /* Reset */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      /* Header Styles - Basic styles only, main styles in header-styles.css */
      .header-content {
        position: relative;
        width: 100%;
        margin: 0 auto;
        z-index: 960;
        display: flex;
        flex-direction: column;
      }

      .header-top {
        padding: 15px 0;
        width: 100%;
        margin: 0;
      }

      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        overflow: visible;
      }

      /* Ensure dropdown menus render above all header elements */
      #unified-header .filter-menu {
        z-index: 2000;
        pointer-events: auto;
      }
      #unified-header .filter-menu.show {
        display: block;
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        z-index: 2000;
      }
      /* Header wrapper above main content just in case */
      #unified-header .header-content { z-index: 1990; }

      /* דריסת CSS חיצוני */
      #unified-header .header-top .logo-section {
        order: 2 !important;
        margin-right: 0 !important;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      #unified-header .header-top .header-nav {
        order: 1 !important;
        margin-left: 0 !important;
        flex: 1;
        display: flex;
        justify-content: flex-start;
      }

      .main-nav {
        display: flex;
      }

      .tiktrack-nav-list {
        display: flex;
        list-style: none;
        gap: 30px;
        align-items: center;
      }

      .tiktrack-nav-item {
        position: relative;
      }

      .tiktrack-nav-link {
        text-decoration: none;
        padding: 10px 15px;
        border-radius: 5px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .tiktrack-nav-link:hover {
        background: rgba(255,255,255,0.1);
        transform: translateY(-2px);
      }

      .nav-icon {
        width: 24px;
        height: 24px;
      }

      .nav-text {
        font-weight: 500;
      }

      .tiktrack-dropdown-arrow {
        font-size: 12px;
        transition: transform 0.3s ease;
      }

      .tiktrack-nav-item.dropdown:hover .tiktrack-dropdown-arrow {
        transform: rotate(180deg);
      }

      .tiktrack-dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 954;
      }

      .tiktrack-nav-item.dropdown:hover .tiktrack-dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .tiktrack-dropdown-item {
        color: #333;
        text-decoration: none;
        padding: 12px 20px;
        display: block;
        border-bottom: 1px solid #f0f0f0;
        transition: all 0.3s ease;
      }

      .tiktrack-dropdown-item:hover {
        background: #f8f9fa;
        color: #667eea;
      }

      .tiktrack-dropdown-item:last-child {
        border-bottom: none;
      }

      .separator {
        height: 1px;
        background: #e0e0e0;
        margin: 5px 0;
      }


      .logo {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .logo-image {
        width: 40px;
        height: 40px;
      }

      .logo-text {
        font-size: 18px;
        font-weight: bold;
        color: white;
      }

      /* Filter Toggle Button */
            .filter-toggle-section {
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%);
        display: none;
        visibility: visible;
        opacity: 1;
      }
      
      /* כפתור ראשי - בתוך התפריט הראשי, מתחת לתפריטי המשנה */
      .filter-toggle-main {
        bottom: -10px;
        z-index: 951;
      }
      
      /* כפתור משני - בתוך הפילטר, מתחת לתפריטי המשנה */
      .filter-toggle-secondary {
        z-index: 951;
      }

      .header-filter-toggle-btn {
        background: rgba(255,255,255,0.9);
        border: 1px solid #fb5a05;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        min-width: 20px;
        min-height: 20px;
        max-width: 20px;
        max-height: 20px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        display: flex !important;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative;
        z-index: 952;
      }

      .header-filter-toggle-btn:hover {
        background: white;
        transform: scale(1.1);
        border-color: #fb5a05;
      }

      .header-filter-arrow {
        font-size: 10px;
        color: #fb5a05;
        transition: transform 0.3s ease;
      }

      .header-filter-toggle-btn.collapsed .header-filter-arrow {
        transform: rotate(-90deg);
      }

      /* Filter Styles */
      .header-filters {
        background: rgba(255,255,255,0.95);
        padding: 0;
        margin: 0;
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        display: block; /* פתוח כברירת מחדל */
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }

      /* Legacy filters-container styles moved to CSS */

      .filter-group {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        white-space: nowrap;
      }

      .filter-toggle {
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 4px 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 120px;
        justify-content: space-between;
        font-size: 0.9em;
      }

      .filter-toggle:hover {
        border-color: #667eea;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
      }

      .filter-toggle.active {
        border-color: #667eea;
        background: #f8f9ff;
      }

      .selected-value {
        color: #333;
        font-weight: 500;
      }

      .dropdown-arrow {
        color: #667eea;
        font-size: 12px;
        transition: transform 0.3s ease;
      }

      .filter-toggle.active .dropdown-arrow {
        transform: rotate(180deg);
      }

      .filter-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        min-width: 150px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 953;
        max-height: 200px;
        overflow-y: auto;
      }

      .filter-toggle.active .filter-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .status-filter-item,
      .type-filter-item,
      .account-filter-item,
      .date-range-filter-item {
        padding: 6px 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-bottom: 1px solid #f0f0f0;
      }

      .status-filter-item:hover,
      .type-filter-item:hover,
      .account-filter-item:hover,
      .date-range-filter-item:hover {
        background: #f8f9ff;
        color: #667eea;
      }

      .status-filter-item:last-child,
      .type-filter-item:last-child,
      .account-filter-item:last-child,
      .date-range-filter-item:last-child {
        border-bottom: none;
      }

      .status-filter-item.selected,
      .type-filter-item.selected,
      .account-filter-item.selected,
      .date-range-filter-item.selected {
        background: rgba(102, 126, 234, 0.3);
        color: #667eea;
        font-weight: 600;
      }

      .option-text {
        font-weight: 500;
      }

      .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-filter-input {
        padding: 5px 40px 5px 15px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        min-width: 200px;
        transition: all 0.3s ease;
      }

      .search-filter-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .search-clear-btn {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        font-size: 16px;
        width: 16px;
        height: 16px;
        min-width: 16px;
        min-height: 16px;
        max-width: 16px;
        max-height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.3s ease;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        z-index: 10;
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }

      .search-input-wrapper:hover .search-clear-btn,
      .search-filter-input:focus + .search-clear-btn {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }

      .search-clear-btn:hover {
        color: #667eea;
        background: none;
        transform: translateY(-50%);
      }

      .filter-actions {
        display: flex;
        gap: 10px;
      }

      .filter-action-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .reset-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        min-width: 28px;
        min-height: 28px;
        background: white;
        border: 1px solid #26baac;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        font-weight: normal;
        color: #26baac;
      }

      .clear-btn {
        display: flex !important;
        align-items: center;
        justify-content: center;
        width: 28px !important;
        height: 28px !important;
        min-width: 28px !important;
        min-height: 28px !important;
        max-width: 28px !important;
        max-height: 28px !important;
        background: white;
        border: 1px solid #fb5a05;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 14px;
        font-weight: normal;
        color: #fb5a05;
        padding: 0 !important;
        margin: 0;
        flex-shrink: 0 !important;
        box-sizing: border-box;
      }

      .reset-btn:hover {
        background: #26baac;
        color: white;
      }

      .clear-btn:hover {
        background: #fb5a05;
        color: white;
      }

      .cache-btn {
        background: #ffc107;
        color: #212529;
      }

      .cache-btn:hover {
        background: #e0a800;
        transform: translateY(-2px);
      }

      .btn-text {
        font-weight: 500;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .header-container {
          flex-direction: column;
          gap: 20px;
        }

        .tiktrack-nav-list {
          flex-wrap: wrap;
          gap: 15px;
        }

        .filters-container {
          flex-direction: column;
          align-items: stretch;
          padding: 0 15px;
          gap: 15px;
          margin-top: 15px;
        }

        .filter-group {
          justify-content: center;
        }

        .filter-toggle {
          min-width: 200px;
        }

        .search-filter-input {
          min-width: 250px;
        }
      }

    `;
  }

  static async loadAccountsForFilter() {
    window.Logger?.info?.('🔧 loadAccountsForFilter() - START', {
      page: 'header-system',
      timestamp: new Date().toISOString(),
    });

    // Full cleanup of existing account items before adding new ones
    try {
      const accountMenu = document.getElementById('accountFilterMenu');
      if (!accountMenu) {
        window.Logger?.warn?.(`⚠️ accountFilterMenu not found - skipping cleanup`, {
          page: 'header-system',
        });
        return;
      }

      // Validation: Ensure menu exists in DOM
      if (!document.body.contains(accountMenu)) {
        window.Logger?.warn?.(`⚠️ accountFilterMenu not in DOM - skipping`, {
          page: 'header-system',
        });
        return;
      }

      // Remove ALL existing account items (except "הכול" if it exists)
      const existingItems = accountMenu.querySelectorAll(
        '.account-filter-item:not([data-value="הכול"])'
      );
      
      const itemsToRemove = Array.from(existingItems);
      let removedCount = 0;
      
      itemsToRemove.forEach(item => {
        try {
          item.remove();
          removedCount++;
        } catch (error) {
          window.Logger?.warn?.(`⚠️ Error removing account item:`, error.message, {
            page: 'header-system',
          });
        }
      });

      window.Logger?.info?.(`🧹 Cleaned up ${removedCount} existing account items`, {
        page: 'header-system',
        removedCount,
        remainingItems: accountMenu.querySelectorAll('.account-filter-item').length,
      });
    } catch (error) {
      window.Logger?.error?.(`❌ Error in loadAccountsForFilter cleanup:`, error.message, {
        page: 'header-system',
        stack: error.stack,
      });
      return; // Don't continue if cleanup failed
    }

    // window.Logger.info('🔧 loadAccountsForFilter - מתחיל טעינת חשבונות מסחר', { page: "header-system" });

    try {
      // שימוש בפונקציה מקובץ השירותים
      let accounts = [];

      // Priority 1: Use DataImportData service with caching (if available)
      if (window.DataImportData?.loadTradingAccountsForImport) {
        try {
          accounts = await window.DataImportData.loadTradingAccountsForImport();
        } catch (error) {
          window.Logger?.warn?.('⚠️ Failed to load accounts via DataImportData, trying fallback', {
            page: 'header-system',
            error: error?.message
          });
          // Fall through to next option
        }
      }

      // Priority 2: Use legacy function (if available and accounts not loaded)
      if ((!accounts || accounts.length === 0) && typeof window.loadTradingAccountsFromServer === 'function') {
        await window.loadTradingAccountsFromServer();
        accounts = window.trading_accountsData || [];
      }

      // Priority 3: Direct API call (only if no other method worked)
      if (!accounts || accounts.length === 0) {
        // fallback לטעינה ישירה
        const response = await fetch('/api/trading-accounts/');
        const data = await response.json();
        accounts = data.data || data;
      }

      const openAccounts = accounts.filter(account => account.status === 'open');

      // window.Logger.info('🔧 נמצאו חשבונות:', openAccounts.length, openAccounts.map(a => a.name, { page: "header-system" }));

      // עדכון תפריט החשבונות
      const accountMenu = document.getElementById('accountFilterMenu');
      // window.Logger.info('🔧 accountMenu element:', accountMenu, { page: "header-system" });

      if (accountMenu) {
        // Validation: Ensure menu still exists in DOM (cleanup may have been done earlier)
        if (!document.body.contains(accountMenu)) {
          window.Logger?.warn?.(`⚠️ accountFilterMenu no longer in DOM after cleanup`, {
            page: 'header-system',
          });
          return;
        }

        // Note: Cleanup of existing items was already done at the start of this function
        // No need to remove again - just add new items

        // הוספת חשבונות פתוחים
        openAccounts.forEach(account => {
          const accountItem = document.createElement('div');
          accountItem.className = 'account-filter-item';
          // שימוש ב-ID במקום שם - כפי ששמור בהעדפות (default_trading_account)
          accountItem.setAttribute('data-value', account.id);
          accountItem.onclick = () => selectAccountOption(account.id);
          const span = document.createElement('span');
          span.className = 'option-text';
          span.textContent = account.name;
          accountItem.appendChild(span);
          accountMenu.appendChild(accountItem);
          // window.Logger.info('🔧 הוספתי חשבון מסחר:', account.name, { page: "header-system" });
        });

        // window.Logger.info(`✅ Loaded ${openAccounts.length} open trading accounts for filter`, { page: "header-system" });
        // window.Logger.info('🔧 סה"כ פריטים בתפריט:', accountMenu.children.length, { page: "header-system" });
      } else {
        // window.Logger.error('❌ accountFilterMenu לא נמצא!', { page: "header-system" });
      }
    } catch (error) {
      // window.Logger.info('⚠️ Error loading trading accounts for filter:', error, { page: "header-system" });
    }
  }

  static loadSavedState() {
    // window.Logger.info('🔧 Loading saved filter state...', { page: "header-system" });

    // המתן שהמערכת תהיה מוכנה
    setTimeout(() => {
      if (window.filterSystem && window.filterSystem.currentFilters) {
        // window.Logger.info('🔧 Current filters from system:', window.filterSystem.currentFilters, { page: "header-system" });

        // עדכון UI של פילטר הסטטוס
        if (
          window.filterSystem.currentFilters.status &&
          window.filterSystem.currentFilters.status.length > 0
        ) {
          // window.Logger.info('🔧 Updating status filter UI with:', window.filterSystem.currentFilters.status, { page: "header-system" });
          HeaderSystem.updateFilterUI('status', window.filterSystem.currentFilters.status);
        }

        // עדכון UI של פילטר הסוג
        if (
          window.filterSystem.currentFilters.type &&
          window.filterSystem.currentFilters.type.length > 0
        ) {
          // window.Logger.info('🔧 Updating type filter UI with:', window.filterSystem.currentFilters.type, { page: "header-system" });
          HeaderSystem.updateFilterUI('type', window.filterSystem.currentFilters.type);
        }

        // עדכון UI של פילטר החשבון מסחר
        if (
          window.filterSystem.currentFilters.account &&
          window.filterSystem.currentFilters.account.length > 0
        ) {
          // window.Logger.info('🔧 Updating account filter UI with:', window.filterSystem.currentFilters.account, { page: "header-system" });
          HeaderSystem.updateFilterUI('account', window.filterSystem.currentFilters.account);
        }

        // עדכון UI של פילטר התאריכים
        if (window.filterSystem.currentFilters.dateRange) {
          // window.Logger.info('🔧 Updating date range filter UI with:', window.filterSystem.currentFilters.dateRange, { page: "header-system" });
          HeaderSystem.updateFilterUI('dateRange', window.filterSystem.currentFilters.dateRange);
        }
      }
    }, 500); // המתן 500ms שהמערכת תהיה מוכנה
  }

  static updateFilterUI(filterType, selectedValues) {
    // window.Logger.info(`🔧 Updating ${filterType} filter UI with:`, selectedValues, { page: "header-system" });

    if (filterType === 'status') {
      // ביטול כל הבחירות
      const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
      statusItems.forEach(item => item.classList.remove('selected'));

      // בחירת הערכים השמורים
      selectedValues.forEach(value => {
        const item = document.querySelector(
          `#statusFilterMenu .status-filter-item[data-value="${value}"]`
        );
        if (item) {
          item.classList.add('selected');
          window.Logger.info(`🔧 Selected status item: ${value}`, { page: 'header-system' });
        }
      });

      // עדכון הטקסט
      if (typeof window.updateStatusFilterText === 'function') {
        window.updateStatusFilterText();
      }
    }

    if (filterType === 'type') {
      // ביטול כל הבחירות
      const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
      typeItems.forEach(item => item.classList.remove('selected'));

      // בחירת הערכים השמורים
      selectedValues.forEach(value => {
        const item = document.querySelector(
          `#typeFilterMenu .type-filter-item[data-value="${value}"]`
        );
        if (item) {
          item.classList.add('selected');
          window.Logger.info(`🔧 Selected type item: ${value}`, { page: 'header-system' });
        }
      });

      // עדכון הטקסט
      if (typeof window.updateTypeFilterText === 'function') {
        window.updateTypeFilterText();
      }
    }

    if (filterType === 'account') {
      // ביטול כל הבחירות
      const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
      accountItems.forEach(item => item.classList.remove('selected'));

      // בחירת הערכים השמורים
      selectedValues.forEach(value => {
        const item = document.querySelector(
          `#accountFilterMenu .account-filter-item[data-value="${value}"]`
        );
        if (item) {
          item.classList.add('selected');
          window.Logger.info(`🔧 Selected account item: ${value}`, { page: 'header-system' });
        }
      });

      // עדכון הטקסט
      if (typeof window.updateAccountFilterText === 'function') {
        window.updateAccountFilterText();
      }
    }

    if (filterType === 'dateRange') {
      // ביטול כל הבחירות
      const dateItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
      dateItems.forEach(item => item.classList.remove('selected'));

      // בחירת הערך השמור
      const item = document.querySelector(
        `#dateRangeFilterMenu .date-range-filter-item[data-value="${selectedValues}"]`
      );
      if (item) {
        item.classList.add('selected');
        // window.Logger.info(`🔧 Selected date range item: ${selectedValues}`, { page: "header-system" });
      }

      // עדכון הטקסט
      if (typeof window.updateDateRangeFilterText === 'function') {
        window.updateDateRangeFilterText();
      }
    }
  }

  // ===== SIMPLE FILTER SYSTEM =====

  // מערכת פילטרים פשוטה ויעילה
  static async createFilterSystem() {
    if (!window.filterSystem) {
      window.filterSystem = {
        currentFilters: {
          search: '',
          dateRange: 'כל זמן',
          status: [],
          type: [],
          account: [],
          custom: {},
        },

        // שמירת פילטרים
        async saveFilters() {
          // שמירה דרך PageStateManager אם זמין
          if (window.PageStateManager && window.PageStateManager.initialized) {
            const pageName =
              typeof window.getCurrentPageName === 'function'
                ? window.getCurrentPageName()
                : 'default';
            try {
              await window.PageStateManager.saveFilters(pageName, this.currentFilters);
              if (window.Logger) {
                window.Logger.debug('🔧 Saved filters via PageStateManager', {
                  page: 'header-system',
                });
              }
            } catch (err) {
              if (window.Logger) {
                window.Logger.warn(
                  '⚠️ Failed to save filters via PageStateManager, using localStorage fallback',
                  err,
                  { page: 'header-system' }
                );
              }
              // Fallback ל-localStorage
              localStorage.setItem('headerFilters', JSON.stringify(this.currentFilters));
            }
          } else {
            // Fallback ל-localStorage רק אם PageStateManager לא זמין
            if (window.Logger) {
              window.Logger.debug(
                '⚠️ PageStateManager not available, using localStorage fallback',
                { page: 'header-system' }
              );
            }
            localStorage.setItem('headerFilters', JSON.stringify(this.currentFilters));
          }
        },

        // טעינת פילטרים
        async loadFilters() {
          // טעינה דרך PageStateManager אם זמין
          if (window.PageStateManager && window.PageStateManager.initialized) {
            const pageName =
              typeof window.getCurrentPageName === 'function'
                ? window.getCurrentPageName()
                : 'default';
            try {
              const savedFilters = await window.PageStateManager.loadFilters(pageName);
              if (savedFilters) {
                this.currentFilters = { ...this.currentFilters, ...savedFilters };
                if (window.Logger) {
                  window.Logger.info(
                    '🔧 Loaded saved filters via PageStateManager:',
                    this.currentFilters,
                    { page: 'header-system' }
                  );
                }
                return;
              }
            } catch (err) {
              if (window.Logger) {
                window.Logger.warn(
                  '⚠️ Failed to load filters via PageStateManager, trying localStorage fallback',
                  err,
                  { page: 'header-system' }
                );
              }
            }
          }

          // Fallback ל-localStorage רק אם PageStateManager לא זמין או אין מצב שמור
          const saved = localStorage.getItem('headerFilters');
          if (saved) {
            try {
              this.currentFilters = { ...this.currentFilters, ...JSON.parse(saved) };
              if (window.Logger) {
                window.Logger.info(
                  '🔧 Loaded saved filters from localStorage:',
                  this.currentFilters,
                  { page: 'header-system' }
                );
              }
            } catch (e) {
              if (window.Logger) {
                window.Logger.info('⚠️ Error loading saved filters:', e, { page: 'header-system' });
              }
            }
          }
        },

        // הפעלת פילטרים על כל הטבלאות
        async applyAllFilters() {
          const context = this.buildFilterContext();
          const targets = this._resolveTargetTables();
          const processed = [];

          for (const target of targets) {
            try {
              const filteredData = await this.applyFiltersToTable(
                target.tableId,
                context,
                target.tableType
              );
              processed.push({
                tableId: target.tableId,
                tableType: target.tableType,
                filteredCount: Array.isArray(filteredData) ? filteredData.length : 0,
              });
            } catch (error) {
              if (window.Logger) {
                window.Logger.warn('⚠️ applyAllFilters: failed to process table', {
                  tableId: target.tableId,
                  error: error?.message || error,
                  page: 'header-system',
                });
              } else {
                console.warn('applyAllFilters: failed to process table', target.tableId, error);
              }
            }
          }

          if (window.Logger) {
            window.Logger.info('✅ applyAllFilters summary', {
              processedCount: processed.length,
              processed,
              page: 'header-system',
            });
          }

          return processed;
        },

        // הפעלת פילטרים על טבלה ספציפית
        async applyFiltersToTable(tableId, filterContext = null, resolvedTableType = null) {
          if (!tableId || !window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {
            return null;
          }

          const tableElement = document.getElementById(tableId);
          const tableType =
            resolvedTableType ||
            window.TableDataRegistry?.resolveTableType?.(tableId) ||
            tableElement?.getAttribute?.('data-table-type') ||
            tableElement?.dataset?.tableType ||
            null;

          if (!tableType) {
            if (window.Logger) {
              window.Logger.debug(
                `⚠️ applyFiltersToTable: unable to resolve table type for ${tableId}`,
                { page: 'header-system' }
              );
            }
            return null;
          }

          const config = window.UnifiedTableSystem.registry.getConfig(tableType);
          if (!config || typeof config.updateFunction !== 'function') {
            if (window.Logger) {
              window.Logger.debug(`⚠️ applyFiltersToTable: no updateFunction for ${tableType}`, {
                page: 'header-system',
              });
            }
            return null;
          }

          const context = filterContext || this.buildFilterContext();
          const filteredData = window.UnifiedTableSystem.filter.apply(tableType, context);

          const renderCallback = async pageData => {
            try {
              await Promise.resolve(config.updateFunction(pageData));
            } catch (renderError) {
              if (window.Logger) {
                window.Logger.warn('⚠️ applyFiltersToTable: updateFunction failed', {
                  tableType,
                  tableId,
                  error: renderError?.message || renderError,
                  page: 'header-system',
                });
              } else {
                console.warn('applyFiltersToTable: updateFunction failed', tableType, renderError);
              }
            }
          };

          if (typeof window.updateTableWithPagination === 'function') {
            await window.updateTableWithPagination({
              tableId,
              tableType,
              data: filteredData,
              render: async pageData => renderCallback(pageData),
              skipRegistry: true,
            });
          } else {
            await renderCallback(filteredData);
          }

          return filteredData;
        },

        buildFilterContext() {
          const cloneArray = value => (Array.isArray(value) ? [...value] : value ? [value] : []);
          return {
            status: cloneArray(this.currentFilters.status),
            type: cloneArray(this.currentFilters.type),
            account: cloneArray(this.currentFilters.account),
            dateRange: this.currentFilters.dateRange ?? null,
            search:
              typeof this.currentFilters.search === 'string' ? this.currentFilters.search : '',
            custom:
              this.currentFilters.custom && typeof this.currentFilters.custom === 'object'
                ? { ...this.currentFilters.custom }
                : {},
          };
        },

        _resolveTargetTables() {
          const targets = [];
          const seen = new Set();

          const tableElements = document.querySelectorAll('table[data-table-type]');
          tableElements.forEach(table => {
            const tableId = table.id || this._inferTableIdFromContainer(table);
            if (!tableId || seen.has(tableId)) {
              return;
            }
            const tableType =
              table.getAttribute('data-table-type') ||
              window.TableDataRegistry?.resolveTableType?.(tableId) ||
              null;
            targets.push({ tableId, tableType });
            seen.add(tableId);
          });

          if (targets.length === 0) {
            const fallbackContainers = [
              'tradesContainer',
              'trade_plansContainer',
              'tickersContainer',
              'alertsContainer',
              'executionsContainer',
              'accountsContainer',
              'accountActivityContainer',
              'cashFlowsContainer',
              'notesContainer',
            ];

            fallbackContainers.forEach(containerId => {
              const container = document.getElementById(containerId);
              const table = container?.querySelector('table');
              if (!table) {
                return;
              }
              const tableId = table.id || containerId.replace('Container', 'Table');
              if (seen.has(tableId)) {
                return;
              }
              const tableType =
                table.getAttribute('data-table-type') ||
                window.TableDataRegistry?.resolveTableType?.(tableId) ||
                null;
              targets.push({ tableId, tableType });
              seen.add(tableId);
            });
          }

          return targets;
        },

        _inferTableIdFromContainer(table) {
          if (!table) {
            return null;
          }
          const container = table.closest('[id$="Container"]');
          if (!container) {
            return table.id || null;
          }
          return table.id || container.id.replace('Container', 'Table');
        },

        // פונקציה לבדיקת תאריך בטווח
        isDateInRange(dateString, dateRange) {
          if (!dateString || !dateRange || dateRange === 'כל זמן') {
            return true;
          }

          // Use dateUtils for consistent date parsing
          let date;
          if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
            date = window.dateUtils.toDateObject(dateString);
          } else {
            date = new Date(dateString);
          }
          let today;
          if (window.dateUtils && typeof window.dateUtils.getToday === 'function') {
            today = window.dateUtils.getToday();
          } else {
            today = new Date();
          }
          today.setHours(0, 0, 0, 0);

          switch (dateRange) {
            case 'היום':
              return date.toDateString() === today.toDateString();

            case 'אתמול':
              // Use dateUtils for consistent date handling
              let yesterday;
              if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                const yesterdayEpoch = today.getTime() - (24 * 60 * 60 * 1000);
                yesterday = window.dateUtils.toDateObject({ epochMs: yesterdayEpoch });
              } else {
                yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
              }
              return date.toDateString() === yesterday.toDateString();

            // השבוע = מתחילת השבוע הקלנדארי (יום ראשון) עד היום
            case 'השבוע': {
              // Use dateUtils for consistent date handling
              let startOfWeek;
              if (window.dateUtils && typeof window.dateUtils.toDateObject === 'function') {
                const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
                const daysToSubtract = dayOfWeek;
                const startOfWeekEpoch = today.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000);
                startOfWeek = window.dateUtils.toDateObject({ epochMs: startOfWeekEpoch });
              } else {
                startOfWeek = new Date(today);
                const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
                startOfWeek.setDate(today.getDate() - dayOfWeek);
              }
              startOfWeek.setHours(0, 0, 0, 0);
              date.setHours(0, 0, 0, 0);
              return date >= startOfWeek && date <= today;
            }

            // שבוע = 7 ימים אחורה מהיום
            case 'שבוע':
            case '7 ימים': {
              const weekAgo = new Date(today);
              weekAgo.setDate(today.getDate() - 7);
              weekAgo.setHours(0, 0, 0, 0);
              date.setHours(0, 0, 0, 0);
              return date >= weekAgo && date <= today;
            }

            // שבוע קודם = השבוע הקלנדארי הקודם (יום ראשון עד שבת של השבוע הקודם)
            case 'שבוע קודם':
            case 'שבוע שעבר': {
              const dayOfWeek = today.getDay();
              const lastWeekEnd = new Date(today);
              lastWeekEnd.setDate(today.getDate() - dayOfWeek - 1); // Last Saturday
              lastWeekEnd.setHours(23, 59, 59, 999);
              const lastWeekStart = new Date(lastWeekEnd);
              lastWeekStart.setDate(lastWeekEnd.getDate() - 6); // Previous Sunday
              lastWeekStart.setHours(0, 0, 0, 0);
              date.setHours(0, 0, 0, 0);
              return date >= lastWeekStart && date <= lastWeekEnd;
            }

            // החודש = מתחילת החודש הקלנדארי (יום 1) עד היום
            case 'החודש': {
              const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
              startOfMonth.setHours(0, 0, 0, 0);
              date.setHours(0, 0, 0, 0);
              return date >= startOfMonth && date <= today;
            }

            // חודש = 30 ימים אחורה מהיום
            case 'חודש':
            case '30 ימים': {
              const monthAgo = new Date(today);
              monthAgo.setDate(today.getDate() - 30);
              monthAgo.setHours(0, 0, 0, 0);
              date.setHours(0, 0, 0, 0);
              return date >= monthAgo && date <= today;
            }

            // חודש קודם = החודש הקלנדארי הקודם (יום 1 עד היום האחרון של החודש הקודם)
            case 'חודש קודם': {
              const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
              lastMonthStart.setHours(0, 0, 0, 0);
              const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
              lastMonthEnd.setHours(23, 59, 59, 999);
              date.setHours(0, 0, 0, 0);
              return date >= lastMonthStart && date <= lastMonthEnd;
            }

            // השנה = מתחילת השנה הקלנדארית (1 בינואר) עד היום
            case 'השנה': {
              const startOfYear = new Date(today.getFullYear(), 0, 1);
              startOfYear.setHours(0, 0, 0, 0);
              date.setHours(0, 0, 0, 0);
              return date >= startOfYear && date <= today;
            }

            // שנה = 365 ימים אחורה מהיום
            case 'שנה':
            case '365 ימים': {
              const yearAgo = new Date(today);
              yearAgo.setDate(today.getDate() - 365);
              yearAgo.setHours(0, 0, 0, 0);
              date.setHours(0, 0, 0, 0);
              return date >= yearAgo && date <= today;
            }

            // שנה קודמת = השנה הקלנדארית הקודמת (1 בינואר עד 31 בדצמבר של השנה הקודמת)
            case 'שנה קודמת':
            case 'שנה שעברה': {
              const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
              lastYearStart.setHours(0, 0, 0, 0);
              const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
              lastYearEnd.setHours(23, 59, 59, 999);
              date.setHours(0, 0, 0, 0);
              return date >= lastYearStart && date <= lastYearEnd;
            }

            default:
              return true;
          }
        },
        triggerFilterUpdate(reason) {
          try {
            const maybePromise = this.applyAllFilters();
            if (maybePromise && typeof maybePromise.catch === 'function') {
              maybePromise.catch(error => {
                if (window.Logger) {
                  window.Logger.warn('⚠️ triggerFilterUpdate failed', {
                    reason,
                    error: error?.message || error,
                    page: 'header-system',
                  });
                } else {
                  console.warn('triggerFilterUpdate failed', reason, error);
                }
              });
            }
          } catch (error) {
            if (window.Logger) {
              window.Logger.warn('⚠️ triggerFilterUpdate threw synchronously', {
                reason,
                error: error?.message || error,
                page: 'header-system',
              });
            } else {
              console.warn('triggerFilterUpdate threw synchronously', reason, error);
            }
          }
        },
      };

      await window.filterSystem.loadFilters();
    }
    return window.filterSystem;
  }
}

// ===== FILTER SYSTEM TOGGLE FUNCTIONS =====
// פונקציות פתיחה וסגירה של מערכת הפילטרים בלבד
// ==========================================

// פונקציה לפתיחה וסגירה של הפילטר הראשי
window.toggleHeaderFilters = function () {
  window.Logger.info('🔧 toggleHeaderFilters called - Header filter system only', {
    page: 'header-system',
  });
  const section = document.getElementById('headerFilters');
  if (section) {
    const isVisible = section.style.display !== 'none';
    section.style.display = isVisible ? 'none' : 'block';

    const toggleBtn = document.getElementById('headerFilterToggleBtn');
    const arrow = toggleBtn ? toggleBtn.querySelector('.header-filter-arrow') : null;

    if (toggleBtn && arrow) {
      if (isVisible) {
        arrow.textContent = '▼';
        toggleBtn.classList.add('collapsed');
      } else {
        arrow.textContent = '▲';
        toggleBtn.classList.remove('collapsed');
      }
    }

    window.Logger.info(`✅ Header filters ${isVisible ? 'hidden' : 'shown'}`, {
      page: 'header-system',
    });

    // עדכון מצב הכפתורים
    window.updateToggleButtons();
  }
};

window.toggleStatusFilterMenu = function () {
  console.log('🚀 toggleStatusFilterMenu CALLED! (legacy click handler)', {
    timestamp: new Date().toISOString(),
  });
  window.Logger.info('🔧 toggleStatusFilterMenu called (legacy)', { page: 'header-system' });
  const menu = document.getElementById('statusFilterMenu');
  const btn = document.getElementById('statusFilterToggle');

  if (menu && btn) {
    const isCurrentlyOpen = menu.classList.contains('show');

    if (isCurrentlyOpen) {
      // If currently open, close it
      menu.classList.remove('show');
      closeFilterMenuPortal(menu);
      if (window.Logger) {
        window.Logger.info('🔧 Status filter menu closed (legacy)', { page: 'header-system' });
      }
      console.log('[header] toggleStatusFilterMenu -> closed (legacy)');
    } else {
      // If closed, close all other menus first, then open this one
      closeAllFilterMenus();
      menu.classList.add('show');
      openFilterMenuPortal(menu, btn, 'status');
      if (window.Logger) {
        window.Logger.info('🔧 Status filter menu opened (legacy)', { page: 'header-system' });
      }
      console.log('[header] toggleStatusFilterMenu -> open (legacy)');
      logFilterMenuDiagnostics('statusFilterMenu');
    }
  } else {
    console.error('❌ statusFilterMenu element not found!');
  }
};

window.toggleTypeFilterMenu = function () {
  window.Logger.info('🔧 toggleTypeFilterMenu called', { page: 'header-system' });
  const menu = document.getElementById('typeFilterMenu');
  if (menu) {
    const isCurrentlyOpen = menu.classList.contains('show');

    if (isCurrentlyOpen) {
      // If currently open, close it
      menu.classList.remove('show');
      closeFilterMenuPortal(menu);
      if (window.Logger) {
        window.Logger.info('🔧 Type filter menu closed', { page: 'header-system' });
      }
      console.log('[header] toggleTypeFilterMenu -> closed');
    } else {
      // If closed, close all other menus first, then open this one
      closeAllFilterMenus();
      menu.classList.add('show');
      const btn = document.getElementById('typeFilterToggle');
      if (btn) {
        openFilterMenuPortal(menu, btn, 'type');
      }
      if (window.Logger) {
        window.Logger.info('🔧 Type filter menu opened', { page: 'header-system' });
      }
      console.log('[header] toggleTypeFilterMenu -> open');
      logFilterMenuDiagnostics('typeFilterMenu');
    }
  }
};

window.toggleAccountFilterMenu = function () {
  window.Logger.info('🔧 toggleAccountFilterMenu called', { page: 'header-system' });
  const menu = document.getElementById('accountFilterMenu');
  if (menu) {
    const isCurrentlyOpen = menu.classList.contains('show');

    if (isCurrentlyOpen) {
      // If currently open, close it
      menu.classList.remove('show');
      closeFilterMenuPortal(menu);
      if (window.Logger) {
        window.Logger.info('🔧 Trading account filter menu closed', { page: 'header-system' });
      }
      console.log('[header] toggleAccountFilterMenu -> closed');
    } else {
      // If closed, close all other menus first, then open this one
      closeAllFilterMenus();
      menu.classList.add('show');
      const btn = document.getElementById('accountFilterToggle');
      if (btn) {
        openFilterMenuPortal(menu, btn, 'account');
      }
      if (window.Logger) {
        window.Logger.info('🔧 Trading account filter menu opened', { page: 'header-system' });
      }
      console.log('[header] toggleAccountFilterMenu -> open');
      logFilterMenuDiagnostics('accountFilterMenu');
    }
  }
};

window.toggleDateRangeFilterMenu = function () {
  window.Logger.info('🔧 toggleDateRangeFilterMenu called', { page: 'header-system' });
  const menu = document.getElementById('dateRangeFilterMenu');
  if (menu) {
    const isCurrentlyOpen = menu.classList.contains('show');

    if (isCurrentlyOpen) {
      // If currently open, close it
      menu.classList.remove('show');
      closeFilterMenuPortal(menu);
      if (window.Logger) {
        window.Logger.info('🔧 Date range filter menu closed', { page: 'header-system' });
      }
      console.log('[header] toggleDateRangeFilterMenu -> closed');
    } else {
      // If closed, close all other menus first, then open this one
      closeAllFilterMenus();
      menu.classList.add('show');
      const btn = document.getElementById('dateRangeFilterToggle');
      if (btn) {
        openFilterMenuPortal(menu, btn, 'date');
      }
      if (window.Logger) {
        window.Logger.info('🔧 Date range filter menu opened', { page: 'header-system' });
      }
      console.log('[header] toggleDateRangeFilterMenu -> open');
      logFilterMenuDiagnostics('dateRangeFilterMenu');
    }
  }
};

// ===== Diagnostics for filter menus visibility/z-index =====
function logFilterMenuDiagnostics(menuId) {
  try {
    const el = document.getElementById(menuId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + Math.min(10, rect.height / 2);
    const topEl = document.elementFromPoint(centerX, centerY);
    const stackInfo = {
      position: cs.position,
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      zIndex: cs.zIndex,
      transform: cs.transform,
      pointerEvents: cs.pointerEvents,
    };
    const parent = el.parentElement;
    const parentCS = parent ? window.getComputedStyle(parent) : null;
    const parentInfo = parent
      ? {
          tag: parent.tagName,
          class: parent.className,
          id: parent.id,
          position: parentCS.position,
          zIndex: parentCS.zIndex,
          overflow: parentCS.overflow,
        }
      : null;
    window.Logger &&
      window.Logger.info('🔎 FilterMenu diagnostics', {
        menuId,
        rect: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
        computed: stackInfo,
        parent: parentInfo,
        topElement: topEl ? { tag: topEl.tagName, class: topEl.className, id: topEl.id } : null,
        page: 'header-system',
      });
  } catch (e) {
    console.error('Diagnostics error:', e);
  }
}

// ===== Portal helpers for filter menus =====
let __headerFilterPortals = new Map();

// ===== ניטור מפורט לפתיחה כפולה =====
let __menuOpenTracking = {
  calls: new Map(), // Track all function calls
  timestamps: new Map(), // Track timestamps
  callCounts: new Map(), // Track call counts
};

function trackMenuOpen(functionName, menuId, details = {}) {
  const timestamp = Date.now();
  const callId = `${functionName}_${menuId}_${timestamp}`;
  
  // Get stack trace
  const stack = new Error().stack;
  const stackLines = stack ? stack.split('\n').slice(2, 8).map(line => line.trim()) : [];
  
  // Track call
  const callInfo = {
    functionName,
    menuId,
    timestamp,
    callId,
    stack: stackLines,
    details,
    previousCall: __menuOpenTracking.timestamps.get(`${functionName}_${menuId}`),
  };
  
  __menuOpenTracking.calls.set(callId, callInfo);
  __menuOpenTracking.timestamps.set(`${functionName}_${menuId}`, timestamp);
  
  const count = (__menuOpenTracking.callCounts.get(`${functionName}_${menuId}`) || 0) + 1;
  __menuOpenTracking.callCounts.set(`${functionName}_${menuId}`, count);
  
  // Calculate time since previous call
  const timeSincePrevious = callInfo.previousCall 
    ? timestamp - callInfo.previousCall 
    : null;
  
  console.log(`📊 [TRACK] ${functionName} called for ${menuId}:`, {
    callNumber: count,
    timestamp: new Date(timestamp).toISOString(),
    timeSincePrevious: timeSincePrevious ? `${timeSincePrevious}ms` : 'first call',
    details,
    stack: stackLines.slice(0, 3), // First 3 stack lines
  });
  
  // Check for rapid duplicate calls
  if (timeSincePrevious !== null && timeSincePrevious < 100) {
    console.warn(`⚠️ [TRACK] RAPID DUPLICATE CALL detected! ${functionName} for ${menuId} called ${timeSincePrevious}ms after previous call`);
    console.warn(`   Previous call:`, __menuOpenTracking.calls.get(`${functionName}_${menuId}_${callInfo.previousCall}`));
    console.warn(`   Current call:`, callInfo);
  }
  
  return callInfo;
}

// Expose tracking for debugging
window.__menuOpenTracking = __menuOpenTracking;
window.trackMenuOpen = trackMenuOpen;

// Function to get tracking summary
window.getMenuTrackingSummary = function(menuId = null) {
  const calls = Array.from(__menuOpenTracking.calls.values());
  const filtered = menuId ? calls.filter(c => c.menuId === menuId) : calls;
  
  const summary = {
    totalCalls: filtered.length,
    byFunction: {},
    byMenu: {},
    rapidDuplicates: [],
    timeline: filtered.sort((a, b) => a.timestamp - b.timestamp),
  };
  
  filtered.forEach(call => {
    // By function
    if (!summary.byFunction[call.functionName]) {
      summary.byFunction[call.functionName] = [];
    }
    summary.byFunction[call.functionName].push(call);
    
    // By menu
    if (!summary.byMenu[call.menuId]) {
      summary.byMenu[call.menuId] = [];
    }
    summary.byMenu[call.menuId].push(call);
    
    // Check for rapid duplicates
    if (call.previousCall) {
      const timeDiff = call.timestamp - call.previousCall;
      if (timeDiff < 100) {
        summary.rapidDuplicates.push({
          functionName: call.functionName,
          menuId: call.menuId,
          timeDiff,
          call1: call,
          call2: __menuOpenTracking.calls.get(`${call.functionName}_${call.menuId}_${call.previousCall}`),
        });
      }
    }
  });
  
  return summary;
};

// Function to print tracking summary
window.printMenuTrackingSummary = function(menuId = null) {
  const summary = window.getMenuTrackingSummary(menuId);
  
  console.log('📊 ===== MENU TRACKING SUMMARY =====');
  console.log(`Total calls tracked: ${summary.totalCalls}`);
  if (menuId) {
    console.log(`Filtered by menu: ${menuId}`);
  }
  
  console.log('\n📈 By Function:');
  Object.keys(summary.byFunction).forEach(funcName => {
    console.log(`  ${funcName}: ${summary.byFunction[funcName].length} calls`);
  });
  
  console.log('\n📋 By Menu:');
  Object.keys(summary.byMenu).forEach(menu => {
    console.log(`  ${menu}: ${summary.byMenu[menu].length} calls`);
  });
  
  if (summary.rapidDuplicates.length > 0) {
    console.log('\n⚠️ RAPID DUPLICATES DETECTED:');
    summary.rapidDuplicates.forEach(dup => {
      console.log(`  ${dup.functionName} for ${dup.menuId}: ${dup.timeDiff}ms apart`);
    });
  }
  
  console.log('\n⏱️ Timeline (first 10):');
  summary.timeline.slice(0, 10).forEach(call => {
    const time = new Date(call.timestamp).toISOString();
    console.log(`  [${time}] ${call.functionName} - ${call.menuId}`);
  });
  
  console.log('\n💡 Use window.getMenuTrackingSummary() for full data');
  console.log('💡 Use window.getMenuTrackingSummary("statusFilterMenu") for specific menu');
  
  return summary;
};

function openFilterMenuPortal(originalMenuEl, anchorBtn, kind) {
  trackMenuOpen('openFilterMenuPortal', originalMenuEl.id, {
    kind,
    buttonId: anchorBtn?.id,
    alreadyHasPortal: __headerFilterPortals.has(originalMenuEl.id),
    menuHasShowClass: originalMenuEl.classList.contains('show'),
  });
  
  try {
    // If already portaled, just ensure position and return
    if (__headerFilterPortals.has(originalMenuEl.id)) {
      console.log(`🔄 [TRACK] Portal already exists for ${originalMenuEl.id}, repositioning only`);
      positionPortal(__headerFilterPortals.get(originalMenuEl.id), anchorBtn);
      return;
    }

    // IMPORTANT: Hide the original menu to prevent duplicate display
    // The portal will be the visible menu
    // Remove 'show' class and hide with inline styles
    originalMenuEl.classList.remove('show');
    originalMenuEl.style.display = 'none';
    originalMenuEl.style.visibility = 'hidden';
    originalMenuEl.style.opacity = '0';
    
    window.Logger?.debug?.(`🔧 Hidden original menu ${originalMenuEl.id} to prevent duplicate display`, {
      page: 'header-system',
      hadShowClass: originalMenuEl.classList.contains('show'),
    });

    // Create portal container
    const portal = originalMenuEl.cloneNode(true);
    portal.id = originalMenuEl.id + '_portal';
    portal.classList.add('show');
    Object.assign(portal.style, {
      position: 'fixed',
      display: 'block',
      visibility: 'visible',
      opacity: '1', // Start visible (fade in handled by CSS transition)
      pointerEvents: 'auto',
      zIndex: '2000',
      transition: 'opacity 0.2s ease-in-out',
    });

    // append first so measurements (offsetWidth/Height) are valid
    document.body.appendChild(portal);
    // lock width to original (or fallback to 200px)
    const originalWidth = originalMenuEl.offsetWidth || 200;
    portal.style.width = originalWidth + 'px';
    portal.style.minWidth = originalWidth + 'px';
    portal.style.maxWidth = originalWidth + 'px';

    positionPortal(portal, anchorBtn);

    // Remember and wire cleanup
    __headerFilterPortals.set(originalMenuEl.id, portal);
    const reposition = () => positionPortal(portal, anchorBtn);
    portal.__repositionHandler = reposition;

    // Update portal selections to match original
    updatePortalSelections();

    // Remove onclick attributes from portal items (prevent duplicate events)
    portal.querySelectorAll('[onclick]').forEach(item => item.removeAttribute('onclick'));

    // Add event listeners to portal items
    addPortalEventListeners(portal, originalMenuEl);

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    // Fade in effect
    requestAnimationFrame(() => {
      portal.style.opacity = '1';
    });

    console.log(`🧩 Portal opened for ${kind} menu`, {
      id: originalMenuEl.id,
      portalId: portal.id,
    });
    
    trackMenuOpen('openFilterMenuPortal_COMPLETE', originalMenuEl.id, {
      kind,
      portalId: portal.id,
      portalCreated: true,
    });
  } catch (e) {
    console.warn('⚠️ Failed to open portal menu:', e?.message);
  }
}

function closeFilterMenuPortal(originalMenuEl) {
  trackMenuOpen('closeFilterMenuPortal', originalMenuEl.id, {
    hasPortal: __headerFilterPortals.has(originalMenuEl.id),
    menuHasShowClass: originalMenuEl.classList.contains('show'),
  });
  
  try {
    const portal = __headerFilterPortals.get(originalMenuEl.id);
    if (!portal) {
      console.log(`⏭️ [TRACK] No portal to close for ${originalMenuEl.id}`);
      // Restore original menu visibility if portal doesn't exist
      originalMenuEl.style.display = '';
      originalMenuEl.style.visibility = '';
      originalMenuEl.style.opacity = '';
      return;
    }

    // Fade out effect
    portal.style.opacity = '0';
    setTimeout(() => {
      window.removeEventListener('scroll', portal.__repositionHandler, true);
      window.removeEventListener('resize', portal.__repositionHandler);
      portal.remove();
      __headerFilterPortals.delete(originalMenuEl.id);
      
      // Restore original menu visibility after portal is removed
      // Only restore if menu should be visible (has 'show' class)
      if (originalMenuEl.classList.contains('show')) {
        originalMenuEl.style.display = '';
        originalMenuEl.style.visibility = '';
        originalMenuEl.style.opacity = '';
      } else {
        // Menu should be hidden, keep it hidden
        originalMenuEl.style.display = 'none';
        originalMenuEl.style.visibility = 'hidden';
        originalMenuEl.style.opacity = '0';
      }
      
      window.Logger?.debug?.(`🔧 Restored original menu ${originalMenuEl.id} visibility`, {
        page: 'header-system',
        hasShowClass: originalMenuEl.classList.contains('show'),
      });
      
      console.log('🧩 Portal removed for menu', originalMenuEl.id);
      
      trackMenuOpen('closeFilterMenuPortal_COMPLETE', originalMenuEl.id, {
        portalRemoved: true,
      });
    }, 200); // Match transition duration
  } catch (e) {
    console.warn('⚠️ Failed to close portal menu:', e?.message);
    // Restore original menu visibility on error
    try {
      originalMenuEl.style.display = '';
      originalMenuEl.style.visibility = '';
      originalMenuEl.style.opacity = '';
    } catch (restoreError) {
      window.Logger?.warn?.(`⚠️ Failed to restore original menu visibility:`, restoreError.message, {
        page: 'header-system',
      });
    }
  }
}

function positionPortal(portalEl, anchorBtn) {
  const rect = anchorBtn.getBoundingClientRect();
  const margin = 4;
  const isRTL = (document.documentElement.getAttribute('dir') || 'rtl').toLowerCase() === 'rtl';
  const top = Math.min(rect.bottom + margin, window.innerHeight - portalEl.offsetHeight - 8);
  if (isRTL) {
    const rightPx = Math.max(8, Math.min(window.innerWidth - rect.right, window.innerWidth - 8));
    portalEl.style.right = rightPx + 'px';
    portalEl.style.left = 'auto';
  } else {
    const leftPx = Math.max(8, Math.min(rect.left, window.innerWidth - portalEl.offsetWidth - 8));
    portalEl.style.left = leftPx + 'px';
    portalEl.style.right = 'auto';
  }
  portalEl.style.top = top + 'px';
}

// ===== Auto-close other filter menus when opening one =====
function closeAllFilterMenus() {
  trackMenuOpen('closeAllFilterMenus', 'ALL', {
    activePortals: Array.from(__headerFilterPortals.keys()),
  });
  
  const menuIds = [
    'statusFilterMenu',
    'typeFilterMenu',
    'accountFilterMenu',
    'dateRangeFilterMenu',
  ];
  
  const closedMenus = [];
  menuIds.forEach(id => {
    const menu = document.getElementById(id);
    if (menu && menu.classList.contains('show')) {
      closedMenus.push(id);
      menu.classList.remove('show');
      closeFilterMenuPortal(menu);
    }
  });
  
  if (closedMenus.length > 0) {
    console.log(`🔄 [TRACK] closeAllFilterMenus closed ${closedMenus.length} menus:`, closedMenus);
  }

  // Also close any existing portals
  if (__headerFilterPortals) {
    __headerFilterPortals.forEach((portal, menuId) => {
      try {
        portal.style.opacity = '0';
        setTimeout(() => {
          window.removeEventListener('scroll', portal.__repositionHandler, true);
          window.removeEventListener('resize', portal.__repositionHandler);
          portal.remove();
          __headerFilterPortals.delete(menuId);
          console.log('🧩 Portal removed for menu', menuId);
        }, 200);
      } catch (e) {
        console.warn('⚠️ Failed to close portal menu:', e?.message);
      }
    });
  }
}

// ===== Hover behavior for filter menus =====
let hoverTimeouts = new Map();

// ===== Update filter selections in UI =====
function updateFilterSelections(filters) {
  console.log('🔄 Updating filter selections:', filters);

  // Map backend preference values (English keys) to UI values (Hebrew labels)
  const mapToUi = {
    // generic
    all: 'הכל',
    // status values
    open: 'פתוח',
    closed: 'סגור',
    cancelled: 'מבוטל',
    canceled: 'מבוטל',
    // type values (case insensitive)
    swing: 'סווינג',
    Swing: 'סווינג',
    investment: 'השקעה',
    Investment: 'השקעה',
    passive: 'פאסיבי',
    Passive: 'פאסיבי',
    // date ranges
    all_time: 'כל הזמן',
    any: 'כל הזמן',
    everything: 'כל הזמן',
    today: 'היום',
    yesterday: 'אתמול',
    this_week: 'השבוע',
    last_week: 'השבוע שעבר',
    this_month: 'החודש',
    last_month: 'החודש שעבר',
    this_year: 'השנה',
    last_year: 'השנה שעברה',
    last_7_days: '7 ימים אחרונים',
    last_30_days: '30 ימים אחרונים',
    last_90_days: '90 ימים אחרונים',
    custom: 'מותאם אישית',
  };

  const normalizeMulti = val => {
    if (!val || (Array.isArray(val) && val.length === 0)) return [];
    if (Array.isArray(val)) {
      const mapped = val.map(v => mapToUi[v] || v).filter(Boolean);
      // אם יש רק 'הכול' - החזר מערך ריק (זה אומר "כל")
      if (mapped.length === 1 && mapped[0] === 'הכול') return [];
      // אחרת, סנן את 'הכול' אם יש ערכים אחרים
      return mapped.filter(v => v !== 'הכול');
    }
    // single value
    if (String(val).toLowerCase() === 'all') return [];
    const mapped = mapToUi[val] || val;
    return mapped === 'הכול' ? [] : [mapped];
  };

  const normalizeDate = val => {
    if (!val) return 'כל זמן';
    const mapped = mapToUi[val] || val;
    // אם הערך עדיין באנגלית/לא קיים בתפריט – ננעל ל"כל זמן"
    const uiValues = new Set(
      Array.from(document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item')).map(
        el => el.getAttribute('data-value')
      )
    );
    return uiValues.has(mapped) ? mapped : 'כל זמן';
  };

  const uiFilters = {
    status: normalizeMulti(filters.status),
    type: normalizeMulti(filters.type),
    account: normalizeMulti(filters.account),
    dateRange: normalizeDate(filters.dateRange),
  };

  console.log(
    '🔍 מיפוי ערכים - original status:',
    filters.status,
    'mapped status:',
    uiFilters.status
  );
  console.log('🔍 מיפוי ערכים - original type:', filters.type, 'mapped type:', uiFilters.type);
  console.log(
    '🔍 מיפוי ערכים - original account:',
    filters.account,
    'mapped account:',
    uiFilters.account
  );
  console.log(
    '🔍 מיפוי ערכים - original dateRange:',
    filters.dateRange,
    'mapped dateRange:',
    uiFilters.dateRange
  );

  // עדכון סטטוס
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  statusItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (uiFilters.status && uiFilters.status.length > 0 && uiFilters.status.includes(value)) {
      item.classList.add('selected');
    } else if (!uiFilters.status || uiFilters.status.length === 0) {
      if (value === 'הכול') item.classList.add('selected');
    }
  });

  // עדכון סוג
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  typeItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (uiFilters.type && uiFilters.type.length > 0 && uiFilters.type.includes(value)) {
      item.classList.add('selected');
    } else if (!uiFilters.type || uiFilters.type.length === 0) {
      if (value === 'הכול') item.classList.add('selected');
    }
  });

  // עדכון חשבון
  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
  accountItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (uiFilters.account && uiFilters.account.includes(value)) {
      item.classList.add('selected');
    } else if (!uiFilters.account || uiFilters.account.length === 0) {
      if (value === 'הכול') item.classList.add('selected');
    }
  });

  // עדכון טווח תאריכים
  const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
  dateRangeItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (value === uiFilters.dateRange) {
      item.classList.add('selected');
    }
  });

  // Update main buttons data-selected for Button System and fire a unified event
  try {
    const statusBtn = document.getElementById('statusFilterToggle');
    const typeBtn = document.getElementById('typeFilterToggle');
    const accountBtn = document.getElementById('accountFilterToggle');
    const dateBtn = document.getElementById('dateRangeFilterToggle');

    if (statusBtn) statusBtn.setAttribute('data-selected', (uiFilters.status || []).join(','));
    if (typeBtn) typeBtn.setAttribute('data-selected', (uiFilters.type || []).join(','));
    if (accountBtn) accountBtn.setAttribute('data-selected', (uiFilters.account || []).join(','));
    if (dateBtn) dateBtn.setAttribute('data-selected', uiFilters.dateRange || 'כל זמן');

    // Update visible texts
    if (typeof window.updateStatusFilterText === 'function') window.updateStatusFilterText();
    if (typeof window.updateTypeFilterText === 'function') window.updateTypeFilterText();
    if (typeof window.updateAccountFilterText === 'function') window.updateAccountFilterText();
    if (typeof window.updateDateRangeFilterText === 'function') window.updateDateRangeFilterText();

    // Notify systems listening for filter updates
    const evt = new CustomEvent('tiktrack:filters-updated', {
      detail: { filters: uiFilters, source: 'header-system' },
    });
    document.dispatchEvent(evt);
  } catch (e) {
    console.warn('Failed updating main button state:', e?.message);
  }
}

// ===== Add event listeners to portal items =====
function addPortalEventListeners(portal, originalMenu) {
  const menuId = originalMenu.id;

  // Add click listeners to portal items
  const portalItems = portal.querySelectorAll('[data-value]');
  portalItems.forEach(portalItem => {
    const value = portalItem.getAttribute('data-value');

    portalItem.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      console.log(`🖱️ Portal item clicked:`, { value, menuId });

      // Call the appropriate selection function based on menu type
      if (menuId === 'statusFilterMenu') {
        window.selectStatusOption(value);
      } else if (menuId === 'typeFilterMenu') {
        window.selectTypeOption(value);
      } else if (menuId === 'accountFilterMenu') {
        window.selectAccountOption(value);
      } else if (menuId === 'dateRangeFilterMenu') {
        window.selectDateRangeOption(value);
      }
    });
  });

  // Add hover listeners to portal to prevent premature closing
  portal.addEventListener('mouseenter', () => {
    // Clear any existing timeout for this menu
    if (hoverTimeouts.has(menuId)) {
      clearTimeout(hoverTimeouts.get(menuId));
      hoverTimeouts.delete(menuId);
    }
  });

  portal.addEventListener('mouseleave', (e) => {
    if (hoverTimeouts.has(menuId)) {
      clearTimeout(hoverTimeouts.get(menuId));
      hoverTimeouts.delete(menuId);
    }

    // Deep debugging - log all relevant information
    const relatedTarget = e?.relatedTarget;
    const button = document.getElementById(menuId.replace('Menu', 'Toggle'));
    const mouseX = e?.clientX || 0;
    const mouseY = e?.clientY || 0;
    
    // Check if mouse is moving to button or away from portal
    const isMovingToButton = relatedTarget && button && button.contains(relatedTarget);
    const isMovingToMenu = relatedTarget && originalMenu.contains(relatedTarget);
    
    // Immediate check: is mouse below portal? If yes, close immediately
    const portalRect = portal.getBoundingClientRect();
    const buttonRect = button ? button.getBoundingClientRect() : null;
    const isMouseBelowPortal = mouseY > portalRect.bottom + 3;
    const isMouseAwayFromButton = buttonRect ? (
      mouseX < buttonRect.left - 5 || 
      mouseX > buttonRect.right + 5 ||
      mouseY < buttonRect.top - 5
    ) : true;
    
    // If mouse is clearly below portal and away from button, close immediately
    if (isMouseBelowPortal && isMouseAwayFromButton && !isMovingToButton && !isMovingToMenu) {
      console.log(`✅ [IMMEDIATE CLOSE] Portal ${menuId} - mouse below portal, closing immediately`, {
        mouseY,
        portalBottom: portalRect.bottom,
        isMouseBelowPortal,
        isMouseAwayFromButton
      });
      originalMenu.classList.remove('show');
      closeFilterMenuPortal(originalMenu);
      return; // Exit early, don't set timeout
    }
    
    console.log(`🔍 [DEEP DEBUG] Portal mouseleave for ${menuId}:`, {
      relatedTarget: relatedTarget ? {
        tagName: relatedTarget.tagName,
        id: relatedTarget.id,
        className: relatedTarget.className,
        isButton: button && button.contains(relatedTarget),
        isMenu: originalMenu.contains(relatedTarget)
      } : null,
      mousePosition: { x: mouseX, y: mouseY },
      isMovingToButton,
      isMovingToMenu,
      buttonExists: !!button,
      isMouseBelowPortal,
      isMouseAwayFromButton
    });

    // Defer close with delay; only close if nothing is hovered
    hoverTimeouts.set(
      menuId,
      setTimeout(() => {
        // Get current mouse position (may have changed since event)
        const currentMouseX = mouseX; // Use event position as fallback
        const currentMouseY = mouseY;
        
        // Try to get actual current mouse position from last known position
        let actualMouseX = currentMouseX;
        let actualMouseY = currentMouseY;
        if (window.__headerSystemLastMouseX !== undefined) {
          actualMouseX = window.__headerSystemLastMouseX;
          actualMouseY = window.__headerSystemLastMouseY;
        }
        
        const buttonHovered = button ? button.matches(':hover') : false;
        const portalHovered = portal.matches(':hover');
        const originalMenuHovered = originalMenu.matches(':hover');
        
        // Additional check: get element under current mouse position
        const elementUnderMouse = document.elementFromPoint(actualMouseX, actualMouseY);
        const isElementUnderMouseButton = elementUnderMouse && button && button.contains(elementUnderMouse);
        const isElementUnderMouseMenu = elementUnderMouse && originalMenu.contains(elementUnderMouse);
        const isElementUnderMousePortal = elementUnderMouse && portal.contains(elementUnderMouse);
        
        // Additional check: is mouse below portal?
        const portalRect = portal.getBoundingClientRect();
        const buttonRect = button ? button.getBoundingClientRect() : null;
        const isMouseBelowPortal = actualMouseY > portalRect.bottom + 3; // 3px buffer
        const isMouseAwayFromButton = buttonRect ? (
          actualMouseX < buttonRect.left - 5 || 
          actualMouseX > buttonRect.right + 5 ||
          actualMouseY < buttonRect.top - 5
        ) : true;
        
        // Check if mouse is moving downward (negative delta means moving down in RTL)
        const isMovingDownward = actualMouseY > portalRect.bottom;
        
        console.log(`🔍 [DEEP DEBUG] Portal timeout check for ${menuId}:`, {
          buttonHovered,
          portalHovered,
          originalMenuHovered,
          isMovingToButton,
          isMovingToMenu,
          mousePosition: { x: actualMouseX, y: actualMouseY },
          eventPosition: { x: mouseX, y: mouseY },
          portalRect: {
            top: portalRect.top,
            bottom: portalRect.bottom,
            left: portalRect.left,
            right: portalRect.right
          },
          buttonRect: buttonRect ? {
            top: buttonRect.top,
            bottom: buttonRect.bottom,
            left: buttonRect.left,
            right: buttonRect.right
          } : null,
          isMouseBelowPortal,
          isMouseAwayFromButton,
          isMovingDownward,
          elementUnderMouse: elementUnderMouse ? {
            tagName: elementUnderMouse.tagName,
            id: elementUnderMouse.id,
            className: elementUnderMouse.className
          } : null,
          isElementUnderMouseButton,
          isElementUnderMouseMenu,
          isElementUnderMousePortal,
          menuHasShowClass: originalMenu.classList.contains('show'),
          shouldClose: (
            !buttonHovered &&
            !portalHovered &&
            !originalMenuHovered &&
            !isMovingToButton &&
            !isMovingToMenu &&
            !isElementUnderMouseButton &&
            !isElementUnderMouseMenu &&
            !isElementUnderMousePortal &&
            (isMouseBelowPortal || isMovingDownward) &&
            isMouseAwayFromButton &&
            originalMenu.classList.contains('show')
          )
        });

        if (
          !buttonHovered &&
          !portalHovered &&
          !originalMenuHovered &&
          !isMovingToButton &&
          !isMovingToMenu &&
          !isElementUnderMouseButton &&
          !isElementUnderMouseMenu &&
          !isElementUnderMousePortal &&
          (isMouseBelowPortal || isMovingDownward) &&
          isMouseAwayFromButton &&
          originalMenu.classList.contains('show')
        ) {
          originalMenu.classList.remove('show');
          closeFilterMenuPortal(originalMenu);
          console.log(`🖱️ Portal hover closed ${menuId} - mouse below portal`);
        } else {
          console.log(`⏭️ [TRACK] Portal ${menuId} not closed - still hovered`, {
            buttonHovered,
            portalHovered,
            originalMenuHovered,
            isMovingToButton,
            isMovingToMenu,
            isElementUnderMouseButton,
            isElementUnderMouseMenu,
            isElementUnderMousePortal,
            isMouseBelowPortal,
            isMouseAwayFromButton,
            isMovingDownward,
            menuHasShowClass: originalMenu.classList.contains('show')
          });
        }
      }, 300)
    ); // Longer delay for portal
  });
}

// ===== Update portal selections =====
function updatePortalSelections() {
  if (__headerFilterPortals) {
    __headerFilterPortals.forEach((portal, menuId) => {
      const originalMenu = document.getElementById(menuId);
      if (originalMenu) {
        // Copy selected state from original to portal
        const originalItems = originalMenu.querySelectorAll('[data-value]');
        const portalItems = portal.querySelectorAll('[data-value]');

        console.log(`🔄 Updating portal selections for ${menuId}:`, {
          originalItems: originalItems.length,
          portalItems: portalItems.length,
          selected: Array.from(originalItems)
            .filter(item => item.classList.contains('selected'))
            .map(item => item.getAttribute('data-value')),
        });

        originalItems.forEach((originalItem, index) => {
          const portalItem = portalItems[index];
          if (portalItem) {
            if (originalItem.classList.contains('selected')) {
              portalItem.classList.add('selected');
              console.log(
                `✅ Added selected to portal item:`,
                portalItem.getAttribute('data-value')
              );
            } else {
              portalItem.classList.remove('selected');
            }
          }
        });
      }
    });
  }
}

// Track if setupHoverBehavior has been called to prevent duplicates
let __setupHoverBehaviorCalled = false;

function setupHoverBehavior() {
  window.Logger?.info?.('🔧 setupHoverBehavior() - START', {
    page: 'header-system',
    alreadyCalled: __setupHoverBehaviorCalled,
    timestamp: new Date().toISOString(),
  });

  // Cleanup existing hover behavior before setting up new one
  const filterButtons = [
    { buttonId: 'statusFilterToggle', menuId: 'statusFilterMenu', type: 'status' },
    { buttonId: 'typeFilterToggle', menuId: 'typeFilterMenu', type: 'type' },
    { buttonId: 'accountFilterToggle', menuId: 'accountFilterMenu', type: 'account' },
    { buttonId: 'dateRangeFilterToggle', menuId: 'dateRangeFilterMenu', type: 'date' },
  ];

  // Full cleanup of existing event listeners before adding new ones
  filterButtons.forEach(({ buttonId, menuId }) => {
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);

    if (button) {
      // Cleanup existing handlers
      if (button.__hoverHandlers) {
        window.Logger?.debug?.(`🧹 Cleaning up existing handlers for ${buttonId}`, {
          page: 'header-system',
        });
        
        try {
          if (button.__hoverHandlers.mouseenter) {
            button.removeEventListener('mouseenter', button.__hoverHandlers.mouseenter);
          }
          if (button.__hoverHandlers.mouseleave) {
            button.removeEventListener('mouseleave', button.__hoverHandlers.mouseleave);
          }
          if (button.__hoverHandlers.click) {
            button.removeEventListener('click', button.__hoverHandlers.click, true);
          }
        } catch (error) {
          window.Logger?.warn?.(`⚠️ Error removing handlers for ${buttonId}:`, error.message, {
            page: 'header-system',
          });
        }
      }

      // Clear any existing timeouts for this button
      if (hoverTimeouts.has(buttonId)) {
        clearTimeout(hoverTimeouts.get(buttonId));
        hoverTimeouts.delete(buttonId);
      }

      // Remove onclick attribute
      button.removeAttribute('data-onclick');

      // Reset handlers storage
      button.__hoverHandlers = {
        mouseenter: null,
        mouseleave: null,
        click: null,
      };
    }

    // Cleanup menu event listeners by cloning
    if (menu && menu.parentNode) {
      try {
        const menuClone = menu.cloneNode(true);
        menu.parentNode.replaceChild(menuClone, menu);
        menuClone.id = menuId;
        window.Logger?.debug?.(`🧹 Cleaned up menu event listeners for ${menuId}`, {
          page: 'header-system',
        });
      } catch (error) {
        window.Logger?.warn?.(`⚠️ Error cleaning menu ${menuId}:`, error.message, {
          page: 'header-system',
        });
      }
    }
  });

  // Reset flag after cleanup
  __setupHoverBehaviorCalled = false;
  
  // Add global mouse move listener to track mouse position and detect when leaving portal area
  // This helps catch cases where mouse leaves portal downward
  if (!window.__headerSystemMouseMoveHandler) {
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseMoveTimeout;
    
    window.__headerSystemMouseMoveHandler = (e) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      // Store globally for use in other handlers
      window.__headerSystemLastMouseX = e.clientX;
      window.__headerSystemLastMouseY = e.clientY;
      
      // Clear existing timeout
      if (mouseMoveTimeout) {
        clearTimeout(mouseMoveTimeout);
      }
      
      // Check if mouse is outside all portals and buttons after a delay
      mouseMoveTimeout = setTimeout(() => {
        const elementUnderMouse = document.elementFromPoint(lastMouseX, lastMouseY);
        
        // Check all active portals
        if (__headerFilterPortals && __headerFilterPortals.size > 0) {
          __headerFilterPortals.forEach((portal, menuId) => {
            const button = document.getElementById(menuId.replace('Menu', 'Toggle'));
            const originalMenu = document.getElementById(menuId);
            
            if (!originalMenu || !originalMenu.classList.contains('show')) {
              return; // Menu not open, skip
            }
            
            const isMouseOverButton = button && button.contains(elementUnderMouse);
            const isMouseOverPortal = portal && portal.contains(elementUnderMouse);
            const isMouseOverMenu = originalMenu && originalMenu.contains(elementUnderMouse);
            
            // Check if mouse is below portal (moved down and away)
            const portalRect = portal.getBoundingClientRect();
            const buttonRect = button ? button.getBoundingClientRect() : null;
            const isMouseBelowPortal = lastMouseY > portalRect.bottom + 3; // 3px buffer
            const isMouseAwayFromButton = buttonRect ? (
              lastMouseX < buttonRect.left - 5 || 
              lastMouseX > buttonRect.right + 5 ||
              lastMouseY < buttonRect.top - 5
            ) : true;
            
            // Additional check: is mouse moving downward through portal?
            const isMovingDownward = lastMouseY > portalRect.bottom;
            
            console.log(`🔍 [GLOBAL MOUSE] Checking portal ${menuId}:`, {
              mouseY: lastMouseY,
              portalBottom: portalRect.bottom,
              buttonRect: buttonRect,
              isMouseBelowPortal,
              isMouseAwayFromButton,
              isMovingDownward,
              isMouseOverButton,
              isMouseOverPortal,
              isMouseOverMenu,
              elementUnderMouse: elementUnderMouse ? {
                tagName: elementUnderMouse.tagName,
                id: elementUnderMouse.id,
                className: elementUnderMouse.className
              } : null,
              shouldClose: (
                !isMouseOverButton &&
                !isMouseOverPortal &&
                !isMouseOverMenu &&
                (isMouseBelowPortal || isMovingDownward) &&
                isMouseAwayFromButton &&
                originalMenu.classList.contains('show')
              )
            });
            
            // If mouse is below portal and away from button, close menu
            if (
              !isMouseOverButton &&
              !isMouseOverPortal &&
              !isMouseOverMenu &&
              (isMouseBelowPortal || isMovingDownward) &&
              isMouseAwayFromButton &&
              originalMenu.classList.contains('show')
            ) {
              console.log(`✅ [GLOBAL MOUSE] Closing menu ${menuId} - mouse below portal`, {
                mouseY: lastMouseY,
                portalBottom: portalRect.bottom,
                isMouseBelowPortal,
                isMovingDownward
              });
              
              originalMenu.classList.remove('show');
              closeFilterMenuPortal(originalMenu);
            }
          });
        }
      }, 100); // Check after 100ms of no movement (reduced from 150ms for faster response)
    };
    
    document.addEventListener('mousemove', window.__headerSystemMouseMoveHandler, { passive: true });
    console.log('✅ [GLOBAL MOUSE] Added global mouse move listener for portal detection');
  }
  
  // Now mark as called and proceed with setup
  __setupHoverBehaviorCalled = true;
  
  trackMenuOpen('setupHoverBehavior', 'SYSTEM', {
    timestamp: Date.now(),
  });
  
  window.Logger?.info?.(`🔧 [TRACK] setupHoverBehavior - Setup after cleanup`, {
    page: 'header-system',
  });
  
  filterButtons.forEach(({ buttonId, menuId, type }) => {
    const button = document.getElementById(buttonId);
    const menu = document.getElementById(menuId);

    if (button && menu) {
      // Validation: Ensure elements exist
      if (!document.body.contains(button) || !document.body.contains(menu)) {
        window.Logger?.warn?.(`⚠️ Button or menu not in DOM: ${buttonId} / ${menuId}`, {
          page: 'header-system',
        });
        return;
      }

      // Check for existing event listeners BEFORE adding new ones
      // Note: getEventListeners is only available in Chrome DevTools console
      const existingListeners = (typeof getEventListeners !== 'undefined') ? getEventListeners(button) : null;
      if (existingListeners) {
        window.Logger?.debug?.(`🔍 [TRACK] Button ${buttonId} existing listeners:`, {
          page: 'header-system',
          mouseenter: existingListeners?.mouseenter?.length || 0,
          mouseleave: existingListeners?.mouseleave?.length || 0,
          click: existingListeners?.click?.length || 0,
        });
      }
      
      // Initialize handlers storage (should be clean after cleanup above)
      if (!button.__hoverHandlers) {
        button.__hoverHandlers = {
          mouseenter: null,
          mouseleave: null,
          click: null,
        };
      }

      // Prevent click events from triggering toggle actions
      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log(`🚫 Click prevented on ${buttonId}`);
        return false;
      };
      button.__hoverHandlers.click = clickHandler;
      button.addEventListener('click', clickHandler, true); // Use capture phase to catch before other handlers

      // Add hover events
      const mouseenterHandler = (e) => {
        // Prevent event bubbling
        if (e) {
          e.stopPropagation();
        }
        
        trackMenuOpen('mouseenter_HOVER', menuId, {
          buttonId,
          type,
          menuHasShowClass: menu.classList.contains('show'),
          hasExistingTimeout: hoverTimeouts.has(buttonId),
          eventTarget: e?.target?.tagName,
          eventCurrentTarget: e?.currentTarget?.tagName,
        });
        
        // Clear any existing timeout
        if (hoverTimeouts.has(buttonId)) {
          const existingTimeout = hoverTimeouts.get(buttonId);
          clearTimeout(existingTimeout);
          hoverTimeouts.delete(buttonId);
          console.log(`🔄 [TRACK] Cleared existing hover timeout for ${buttonId}`);
        }

        // Open menu after short delay
        const timeoutId = setTimeout(() => {
          trackMenuOpen('hoverTimeout_EXECUTE', menuId, {
            buttonId,
            type,
            menuHasShowClass: menu.classList.contains('show'),
            delay: 150,
          });
          
          if (!menu.classList.contains('show')) {
            trackMenuOpen('hoverTimeout_OPENING', menuId, {
              buttonId,
              type,
              action: 'opening menu',
            });
            
            closeAllFilterMenus();
            menu.classList.add('show');
            // openFilterMenuPortal will hide the original menu and show the portal
            openFilterMenuPortal(menu, button, type);
            console.log(`🖱️ Hover opened ${menuId}`);
          } else {
            console.log(`⏭️ [TRACK] Menu ${menuId} already has 'show' class, skipping open`);
          }
        }, 150); // 150ms delay
        
        hoverTimeouts.set(buttonId, timeoutId);
        console.log(`⏰ [TRACK] Set hover timeout for ${buttonId}, will execute in 150ms`);
      };
      button.__hoverHandlers.mouseenter = mouseenterHandler;
      button.addEventListener('mouseenter', mouseenterHandler);

      const mouseleaveHandler = (e) => {
        // Prevent event bubbling
        if (e) {
          e.stopPropagation();
        }
        
        // Deep debugging - log all relevant information
        const relatedTarget = e?.relatedTarget;
        const portal = __headerFilterPortals && __headerFilterPortals.get(menuId);
        const mouseX = e?.clientX || 0;
        const mouseY = e?.clientY || 0;
        
        // Check if mouse is moving to menu/portal or away from button
        const isMovingToMenu = relatedTarget && (
          menu.contains(relatedTarget) || 
          relatedTarget.closest('.filter-menu') === menu
        );
        const isMovingToPortal = relatedTarget && portal && (
          portal.contains(relatedTarget) ||
          relatedTarget.closest(`#${menuId}_portal`) === portal ||
          relatedTarget.id === `${menuId}_portal`
        );
        const isMovingToButton = relatedTarget && button.contains(relatedTarget);
        
        // Check portal position to see if mouse is moving towards it
        let isMovingTowardsPortal = false;
        if (portal && portal.offsetParent !== null) {
          const portalRect = portal.getBoundingClientRect();
          const isMouseBelowButton = mouseY > button.getBoundingClientRect().bottom;
          const isMouseInPortalXRange = mouseX >= portalRect.left && mouseX <= portalRect.right;
          const isMouseInPortalYRange = mouseY >= portalRect.top && mouseY <= portalRect.bottom;
          isMovingTowardsPortal = isMouseBelowButton && isMouseInPortalXRange && isMouseInPortalYRange;
        }
        
        console.log(`🔍 [DEEP DEBUG] Button mouseleave for ${buttonId}:`, {
          menuId,
          relatedTarget: relatedTarget ? {
            tagName: relatedTarget.tagName,
            id: relatedTarget.id,
            className: relatedTarget.className,
            isMenu: menu.contains(relatedTarget),
            isPortal: portal && portal.contains(relatedTarget),
            isButton: button.contains(relatedTarget)
          } : null,
          mousePosition: { x: mouseX, y: mouseY },
          isMovingToMenu,
          isMovingToPortal,
          isMovingToButton,
          isMovingTowardsPortal,
          portalExists: !!portal,
          portalVisible: portal ? portal.offsetParent !== null : false,
          portalRect: portal ? portal.getBoundingClientRect() : null,
          buttonRect: button.getBoundingClientRect()
        });
        
        trackMenuOpen('mouseleave_HOVER', menuId, {
          buttonId,
          type,
          menuHasShowClass: menu.classList.contains('show'),
          hasExistingTimeout: hoverTimeouts.has(buttonId),
          eventTarget: e?.target?.tagName,
          eventCurrentTarget: e?.currentTarget?.tagName,
          relatedTargetInfo: relatedTarget ? {
            tagName: relatedTarget.tagName,
            id: relatedTarget.id,
            className: relatedTarget.className
          } : null,
          mousePosition: { x: mouseX, y: mouseY },
          isMovingToMenu,
          isMovingToPortal,
          isMovingToButton,
          isMovingTowardsPortal
        });
        
        // Clear open timeout
        if (hoverTimeouts.has(buttonId)) {
          const existingTimeout = hoverTimeouts.get(buttonId);
          clearTimeout(existingTimeout);
          hoverTimeouts.delete(buttonId);
          console.log(`🔄 [TRACK] Cleared hover timeout on mouseleave for ${buttonId}`);
        }

        // Defer close; only close if neither button nor portal is hovered
        const timeoutId = setTimeout(() => {
          const buttonHovered = button.matches(':hover');
          const portalHovered = portal ? portal.matches(':hover') : false;
          const menuHovered = menu.matches(':hover');
          
          // Additional check: get element under current mouse position
          const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
          const isElementUnderMousePortal = elementUnderMouse && portal && (
            portal.contains(elementUnderMouse) ||
            elementUnderMouse.closest(`#${menuId}_portal`) === portal ||
            elementUnderMouse.id === `${menuId}_portal`
          );
          const isElementUnderMouseButton = elementUnderMouse && button.contains(elementUnderMouse);
          const isElementUnderMouseMenu = elementUnderMouse && menu.contains(elementUnderMouse);
          
          console.log(`🔍 [DEEP DEBUG] Timeout check for ${buttonId}:`, {
            buttonHovered,
            portalHovered,
            menuHovered,
            isMovingToMenu,
            isMovingToPortal,
            isMovingToButton,
            isMovingTowardsPortal,
            elementUnderMouse: elementUnderMouse ? {
              tagName: elementUnderMouse.tagName,
              id: elementUnderMouse.id,
              className: elementUnderMouse.className
            } : null,
            isElementUnderMousePortal,
            isElementUnderMouseButton,
            isElementUnderMouseMenu,
            menuHasShowClass: menu.classList.contains('show')
          });
          
          trackMenuOpen('mouseleaveTimeout_CHECK', menuId, {
            buttonId,
            type,
            buttonHovered,
            portalHovered,
            menuHovered,
            menuHasShowClass: menu.classList.contains('show'),
            hasPortal: !!portal,
            isMovingToMenu,
            isMovingToPortal,
            isMovingToButton,
            isMovingTowardsPortal,
            elementUnderMouseInfo: elementUnderMouse ? {
              tagName: elementUnderMouse.tagName,
              id: elementUnderMouse.id,
              className: elementUnderMouse.className
            } : null,
            isElementUnderMousePortal,
            isElementUnderMouseButton,
            isElementUnderMouseMenu
          });
          
          if (
            !buttonHovered &&
            !portalHovered &&
            !menuHovered &&
            !isMovingToMenu &&
            !isMovingToPortal &&
            !isMovingToButton &&
            !isMovingTowardsPortal &&
            !isElementUnderMousePortal &&
            !isElementUnderMouseButton &&
            !isElementUnderMouseMenu &&
            menu.classList.contains('show')
          ) {
            trackMenuOpen('mouseleaveTimeout_CLOSING', menuId, {
              buttonId,
              type,
              action: 'closing menu',
            });
            
            menu.classList.remove('show');
            closeFilterMenuPortal(menu);
            console.log(`🖱️ Hover closed ${menuId}`);
          } else {
            console.log(`⏭️ [TRACK] Menu ${menuId} not closed - still hovered or not showing`, {
              buttonHovered,
              portalHovered,
              menuHovered,
              isMovingToMenu,
              isMovingToPortal,
              isMovingToButton,
              isMovingTowardsPortal,
              isElementUnderMousePortal,
              isElementUnderMouseButton,
              isElementUnderMouseMenu
            });
          }
        }, 220); // short defer to allow cursor to enter portal
        
        hoverTimeouts.set(buttonId, timeoutId);
        console.log(`⏰ [TRACK] Set close timeout for ${buttonId}, will check in 220ms`);
      };
      button.__hoverHandlers.mouseleave = mouseleaveHandler;
      button.addEventListener('mouseleave', mouseleaveHandler);

      // Also handle menu hover to keep it open
      menu.addEventListener('mouseenter', () => {
        if (hoverTimeouts.has(buttonId)) {
          clearTimeout(hoverTimeouts.get(buttonId));
          hoverTimeouts.delete(buttonId);
        }
      });

      menu.addEventListener('mouseleave', (e) => {
        if (hoverTimeouts.has(buttonId)) {
          clearTimeout(hoverTimeouts.get(buttonId));
          hoverTimeouts.delete(buttonId);
        }

        // Deep debugging - log all relevant information
        const relatedTarget = e?.relatedTarget;
        const portal = __headerFilterPortals && __headerFilterPortals.get(menuId);
        const mouseX = e?.clientX || 0;
        const mouseY = e?.clientY || 0;
        
        // Check if mouse is moving to button or away from menu
        const isMovingToButton = relatedTarget && button.contains(relatedTarget);
        const isMovingToPortal = relatedTarget && portal && (
          portal.contains(relatedTarget) ||
          relatedTarget.closest(`#${menuId}_portal`) === portal ||
          relatedTarget.id === `${menuId}_portal`
        );
        
        // Check portal position to see if mouse is moving towards it
        let isMovingTowardsPortal = false;
        if (portal && portal.offsetParent !== null) {
          const portalRect = portal.getBoundingClientRect();
          const isMouseInPortalXRange = mouseX >= portalRect.left && mouseX <= portalRect.right;
          const isMouseInPortalYRange = mouseY >= portalRect.top && mouseY <= portalRect.bottom;
          isMovingTowardsPortal = isMouseInPortalXRange && isMouseInPortalYRange;
        }
        
        console.log(`🔍 [DEEP DEBUG] Menu mouseleave for ${menuId}:`, {
          buttonId,
          relatedTarget: relatedTarget ? {
            tagName: relatedTarget.tagName,
            id: relatedTarget.id,
            className: relatedTarget.className,
            isButton: button.contains(relatedTarget),
            isPortal: portal && portal.contains(relatedTarget)
          } : null,
          mousePosition: { x: mouseX, y: mouseY },
          isMovingToButton,
          isMovingToPortal,
          isMovingTowardsPortal,
          portalExists: !!portal,
          portalVisible: portal ? portal.offsetParent !== null : false
        });

        // Defer close; only close if neither menu/portal nor button is hovered
        hoverTimeouts.set(
          buttonId,
          setTimeout(() => {
            const buttonHovered = button.matches(':hover');
            const portalHovered = portal ? portal.matches(':hover') : false;
            const menuHovered = menu.matches(':hover');
            
            // Additional check: get element under current mouse position
            const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
            const isElementUnderMousePortal = elementUnderMouse && portal && (
              portal.contains(elementUnderMouse) ||
              elementUnderMouse.closest(`#${menuId}_portal`) === portal ||
              elementUnderMouse.id === `${menuId}_portal`
            );
            const isElementUnderMouseButton = elementUnderMouse && button.contains(elementUnderMouse);
            
            console.log(`🔍 [DEEP DEBUG] Menu timeout check for ${menuId}:`, {
              buttonHovered,
              portalHovered,
              menuHovered,
              isMovingToButton,
              isMovingToPortal,
              isMovingTowardsPortal,
              elementUnderMouse: elementUnderMouse ? {
                tagName: elementUnderMouse.tagName,
                id: elementUnderMouse.id,
                className: elementUnderMouse.className
              } : null,
              isElementUnderMousePortal,
              isElementUnderMouseButton,
              menuHasShowClass: menu.classList.contains('show')
            });
            
            if (
              !buttonHovered &&
              !portalHovered &&
              !menuHovered &&
              !isMovingToButton &&
              !isMovingToPortal &&
              !isMovingTowardsPortal &&
              !isElementUnderMousePortal &&
              !isElementUnderMouseButton &&
              menu.classList.contains('show')
            ) {
              menu.classList.remove('show');
              closeFilterMenuPortal(menu);
              console.log(`🖱️ Menu hover closed ${menuId}`);
            } else {
              console.log(`⏭️ [TRACK] Menu ${menuId} not closed - still hovered`, {
                buttonHovered,
                portalHovered,
                menuHovered,
                isMovingToButton,
                isMovingToPortal,
                isMovingTowardsPortal,
                isElementUnderMousePortal,
                isElementUnderMouseButton
              });
            }
          }, 220)
        );
      });
    }
  });
}

// ===== GLOBAL FILTER FUNCTIONS =====

// פונקציות בחירת פילטרים (מולטיסלקט)
window.selectStatusOption = function (status) {
  window.Logger.info('🔧 selectStatusOption called with:', status, { page: 'header-system' });
  console.log('🔧 selectStatusOption called with:', status);

  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  console.log('🔧 Found statusItems:', statusItems.length);
  const clickedItem = Array.from(statusItems).find(
    item => item.getAttribute('data-value') === status
  );
  console.log('🔧 clickedItem found:', clickedItem ? 'YES' : 'NO');

  if (clickedItem) {
    if (status === 'הכול') {
      statusItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      const allItem = Array.from(statusItems).find(
        item => item.getAttribute('data-value') === 'הכול'
      );
      if (allItem) {
        allItem.classList.remove('selected');
      }
      clickedItem.classList.toggle('selected');
      const selectedItems = document.querySelectorAll(
        '#statusFilterMenu .status-filter-item.selected'
      );
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
      }
    }
  }

  updateStatusFilterText();
  updatePortalSelections();

  console.log('🔧 window.filterSystem:', window.filterSystem ? 'exists' : 'NOT FOUND');
  if (window.filterSystem) {
    const selectedItems = document.querySelectorAll(
      '#statusFilterMenu .status-filter-item.selected'
    );
    const selectedStatuses = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
    window.filterSystem.currentFilters.status = selectedStatuses;
    window.filterSystem.saveFilters();
    console.log('🔧 Triggering filter pipeline for status change...');
    window.filterSystem.triggerFilterUpdate('status-change');
  }

  const statusMenu = document.getElementById('statusFilterMenu');
  if (statusMenu) {
    statusMenu.classList.remove('show');
  }
};

window.selectTypeOption = function (type) {
  window.Logger.info('🔧 selectTypeOption called with:', type, { page: 'header-system' });
  console.log('🔧 selectTypeOption called with:', type);

  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  console.log('🔧 Found typeItems:', typeItems.length);
  const clickedItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === type);
  console.log('🔧 clickedItem found:', clickedItem ? 'YES' : 'NO');

  if (clickedItem) {
    if (type === 'הכול') {
      typeItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
    } else {
      const allItem = Array.from(typeItems).find(
        item => item.getAttribute('data-value') === 'הכול'
      );
      if (allItem) {
        allItem.classList.remove('selected');
      }
      clickedItem.classList.toggle('selected');
      const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
      }
    }
  }

  updateTypeFilterText();
  updatePortalSelections();

  if (window.filterSystem) {
    const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
    const selectedTypes = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
    window.filterSystem.currentFilters.type = selectedTypes;
    window.filterSystem.saveFilters();
    console.log('🔧 Triggering filter pipeline for type change...');
    window.filterSystem.triggerFilterUpdate('type-change');
  }

  const typeMenu = document.getElementById('typeFilterMenu');
  if (typeMenu) {
    typeMenu.classList.remove('show');
  }
};

window.selectAccountOption = function (account) {
  window.Logger.info('🔧 selectAccountOption called with:', account, { page: 'header-system' });

  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
  const clickedItem = Array.from(accountItems).find(
    item => item.getAttribute('data-value') === account
  );

  console.log('🔧 Account selection debug:', {
    account,
    accountItems: accountItems.length,
    clickedItem: clickedItem ? clickedItem.getAttribute('data-value') : 'not found',
  });

  if (clickedItem) {
    if (account === 'הכול') {
      accountItems.forEach(item => item.classList.remove('selected'));
      clickedItem.classList.add('selected');
      console.log('✅ Selected "הכול" - removed all others');
    } else {
      const allItem = Array.from(accountItems).find(
        item => item.getAttribute('data-value') === 'הכול'
      );
      if (allItem) {
        allItem.classList.remove('selected');
      }
      clickedItem.classList.toggle('selected');

      const selectedItems = document.querySelectorAll(
        '#accountFilterMenu .account-filter-item.selected'
      );
      if (selectedItems.length === 0 && allItem) {
        allItem.classList.add('selected');
      }

      console.log('✅ Toggled account selection:', {
        account,
        isSelected: clickedItem.classList.contains('selected'),
        totalSelected: selectedItems.length,
      });
    }
  }

  updateAccountFilterText();
  updatePortalSelections();

  if (window.filterSystem) {
    const selectedItems = document.querySelectorAll(
      '#accountFilterMenu .account-filter-item.selected'
    );
    const selectedAccounts = Array.from(selectedItems).map(item => item.getAttribute('data-value'));
    window.filterSystem.currentFilters.account = selectedAccounts;
    window.filterSystem.saveFilters();
    console.log('🔧 Triggering filter pipeline for account change...');
    window.filterSystem.triggerFilterUpdate('account-change');
  }

  const accountMenu = document.getElementById('accountFilterMenu');
  if (accountMenu) {
    accountMenu.classList.remove('show');
  }
};

window.selectDateRangeOption = function (dateRange) {
  window.Logger.info('🔧 selectDateRangeOption called with:', dateRange, { page: 'header-system' });

  const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');

  dateRangeItems.forEach(item => item.classList.remove('selected'));

  const clickedItem = Array.from(dateRangeItems).find(
    item => item.getAttribute('data-value') === dateRange
  );
  if (clickedItem) {
    clickedItem.classList.add('selected');
  }

  updateDateRangeFilterText();
  updatePortalSelections();

  if (window.filterSystem) {
    window.filterSystem.currentFilters.dateRange = dateRange;
    window.filterSystem.saveFilters();
    console.log('🔧 Triggering filter pipeline for date range change...');
    window.filterSystem.triggerFilterUpdate('date-range-change');
  }

  const dateMenu = document.getElementById('dateRangeFilterMenu');
  if (dateMenu) {
    dateMenu.classList.remove('show');
  }
};

// פונקציות עדכון טקסט פילטרים (מולטיסלקט)
window.updateStatusFilterText = function () {
  const selectedItems = document.querySelectorAll('#statusFilterMenu .status-filter-item.selected');
  const statusElement = document.getElementById('selectedStatus');

  console.log('🔄 updateStatusFilterText - selectedItems:', selectedItems.length);

  if (statusElement) {
    if (
      selectedItems.length === 0 ||
      (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')
    ) {
      statusElement.textContent = 'כל סטטוס';
      console.log('✅ עדכנתי ל-"כל סטטוס"');
    } else if (selectedItems.length === 1) {
      statusElement.textContent = selectedItems[0].getAttribute('data-value');
      console.log('✅ עדכנתי ל:', selectedItems[0].getAttribute('data-value'));
    } else {
      statusElement.textContent = `${selectedItems.length} סטטוסים`;
      console.log('✅ עדכנתי ל:', `${selectedItems.length} סטטוסים`);
    }
  } else {
    console.error('❌ selectedStatus לא נמצא');
  }
};

window.updateTypeFilterText = function () {
  const selectedItems = document.querySelectorAll('#typeFilterMenu .type-filter-item.selected');
  const typeElement = document.getElementById('selectedType');

  console.log('🔄 updateTypeFilterText - selectedItems:', selectedItems.length);
  Array.from(selectedItems).forEach((item, idx) => {
    console.log(
      `  [${idx}] data-value: ${item.getAttribute('data-value')}, text: ${item.textContent.trim()}`
    );
  });

  if (typeElement) {
    if (
      selectedItems.length === 0 ||
      (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')
    ) {
      typeElement.textContent = 'כל סוג השקעה';
      console.log('✅ עדכנתי ל-"כל סוג השקעה"');
    } else if (selectedItems.length === 1) {
      typeElement.textContent = selectedItems[0].getAttribute('data-value');
      console.log('✅ עדכנתי ל:', selectedItems[0].getAttribute('data-value'));
    } else {
      typeElement.textContent = `${selectedItems.length} סוגים`;
      console.log('✅ עדכנתי ל:', `${selectedItems.length} סוגים`);
    }
  } else {
    console.error('❌ selectedType לא נמצא');
  }
};

window.updateAccountFilterText = function () {
  const selectedItems = document.querySelectorAll(
    '#accountFilterMenu .account-filter-item.selected'
  );
  const accountElement = document.getElementById('selectedAccount');

  console.log('🔄 updateAccountFilterText - selectedItems:', selectedItems.length);
  Array.from(selectedItems).forEach((item, idx) => {
    console.log(
      `  [${idx}] data-value: ${item.getAttribute('data-value')}, text: ${item.textContent.trim()}`
    );
  });

  if (accountElement) {
    if (
      selectedItems.length === 0 ||
      (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')
    ) {
      accountElement.textContent = 'כל חשבון מסחר';
      console.log('✅ עדכנתי ל-"כל חשבון מסחר"');
    } else if (selectedItems.length === 1) {
      // שימוש בטקסט האמיתי של הפריט (שם החשבון) במקום data-value (ID)
      const optionText = selectedItems[0].querySelector('.option-text');
      const displayText = optionText
        ? optionText.textContent.trim()
        : selectedItems[0].getAttribute('data-value');
      accountElement.textContent = displayText;
      console.log('✅ עדכנתי ל:', displayText);
    } else {
      accountElement.textContent = `${selectedItems.length} חשבונות`;
      console.log('✅ עדכנתי ל:', `${selectedItems.length} חשבונות`);
    }
  } else {
    console.error('❌ selectedAccount לא נמצא');
  }
};

window.updateDateRangeFilterText = function () {
  const selectedItems = document.querySelectorAll(
    '#dateRangeFilterMenu .date-range-filter-item.selected'
  );
  const dateRangeElement = document.getElementById('selectedDateRange');

  console.log('🔄 updateDateRangeFilterText - selectedItems:', selectedItems.length);
  Array.from(selectedItems).forEach((item, idx) => {
    console.log(
      `  [${idx}] data-value: ${item.getAttribute('data-value')}, text: ${item.textContent.trim()}`
    );
  });

  if (dateRangeElement) {
    if (selectedItems.length === 0) {
      dateRangeElement.textContent = 'כל זמן';
      console.log('✅ עדכנתי ל-"כל זמן"');
    } else if (selectedItems.length === 1) {
      const item = selectedItems[0];
      const value = item.getAttribute('data-value');
      dateRangeElement.textContent = value;
      console.log('✅ עדכנתי ל:', value);
    } else {
      // בחירה יחידה - לא אמור לקרות
      dateRangeElement.textContent = 'כל זמן';
      console.log('✅ עדכנתי ל-"כל זמן" (multiple selection - unexpected)');
    }
  } else {
    console.error('❌ selectedDateRange לא נמצא');
  }
};

// פונקציות הפעלת פילטרים - פשוטות ויעילות
window.applyStatusFilter = function () {
  if (window.filterSystem) {
    window.filterSystem.triggerFilterUpdate('status-apply');
  }
};

window.applyTypeFilter = function () {
  if (window.filterSystem) {
    window.filterSystem.triggerFilterUpdate('type-apply');
  }
};

window.applyAccountFilter = function () {
  if (window.filterSystem) {
    window.filterSystem.triggerFilterUpdate('account-apply');
  }
};

window.applyDateRangeFilter = function (dateRange) {
  if (window.filterSystem) {
    window.filterSystem.triggerFilterUpdate('date-range-apply');
  }
};

// פונקציות כלליות - פשוטות ויעילות
window.clearAllFilters = function () {
  console.log('🧹 clearAllFilters - מוחק את כל הפילטרים');
  window.Logger.info('🧹 clearAllFilters - מוחק את כל הפילטרים', { page: 'header-system' });
  if (window.filterSystem) {
    window.filterSystem.currentFilters = {
      search: '',
      dateRange: 'כל זמן',
      status: [],
      type: [],
      account: [],
      custom: {},
    };
    window.filterSystem.saveFilters();
    window.filterSystem.triggerFilterUpdate('clear-all');

    // איפוס UI
    const searchInput = document.getElementById('searchFilterInput');
    if (searchInput) {
      // Use DataCollectionService to clear field if available
      if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
        window.DataCollectionService.setValue('searchFilterInput', '', 'text');
      } else {
        searchInput.value = '';
      }
    }

    // איפוס בחירות בפילטרים
    const allFilterItems = document.querySelectorAll(
      '.status-filter-item, .type-filter-item, .account-filter-item, .date-range-filter-item'
    );
    allFilterItems.forEach(item => item.classList.remove('selected'));

    // בחירת "הכול" בכל הפילטרים
    const allStatusItem = document.querySelector(
      '#statusFilterMenu .status-filter-item[data-value="הכול"]'
    );
    if (allStatusItem) allStatusItem.classList.add('selected');

    const allTypeItem = document.querySelector(
      '#typeFilterMenu .type-filter-item[data-value="הכול"]'
    );
    if (allTypeItem) allTypeItem.classList.add('selected');

    const allAccountItem = document.querySelector(
      '#accountFilterMenu .account-filter-item[data-value="הכול"]'
    );
    if (allAccountItem) allAccountItem.classList.add('selected');

    const allDateItem = document.querySelector(
      '#dateRangeFilterMenu .date-range-filter-item[data-value="כל זמן"]'
    );
    if (allDateItem) allDateItem.classList.add('selected');

    // עדכון פורטלים
    updatePortalSelections();

    // עדכון בחירות בתפריטים
    updateFilterSelections({
      search: '',
      dateRange: 'כל זמן',
      status: [],
      type: [],
      account: [],
    });

    // עדכון טקסטים
    if (typeof window.updateStatusFilterText === 'function') window.updateStatusFilterText();
    if (typeof window.updateTypeFilterText === 'function') window.updateTypeFilterText();
    if (typeof window.updateAccountFilterText === 'function') window.updateAccountFilterText();
    if (typeof window.updateDateRangeFilterText === 'function') window.updateDateRangeFilterText();

    window.Logger.info('✅ כל הפילטרים נמחקו', { page: 'header-system' });

    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('כל הפילטרים נמחקו בהצלחה', 'success', 'הצלחה', 2000, 'system');
    } else {
      window.Logger.info('🔔 הודעת הצלחה: כל הפילטרים נמחקו בהצלחה', { page: 'header-system' });
    }
  }
};

// פונקציה לעדכון UI של הפילטרים
window.updateFilterUI = function (filters) {
  window.Logger.info('🎨 עדכון UI של הפילטרים:', filters, { page: 'header-system' });

  // עדכון שדה החיפוש
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) {
    // Use DataCollectionService to set value if available
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
      window.DataCollectionService.setValue('searchFilterInput', filters.search || '', 'text');
    } else {
      searchInput.value = filters.search || '';
    }
  }

  // עדכון פילטר סטטוס
  const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
  statusItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (filters.status.length === 0 && value === 'הכול') {
      item.classList.add('selected');
    } else if (filters.status.includes(value)) {
      item.classList.add('selected');
    }
  });

  // עדכון פילטר סוג
  const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
  typeItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (filters.type.length === 0 && value === 'הכול') {
      item.classList.add('selected');
    } else if (filters.type.includes(value)) {
      item.classList.add('selected');
    }
  });

  // עדכון פילטר חשבון מסחר
  const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
  accountItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (filters.account.length === 0 && value === 'הכול') {
      item.classList.add('selected');
    } else if (filters.account.includes(value)) {
      item.classList.add('selected');
    }
  });

  // עדכון פילטר תאריכים
  const dateItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
  dateItems.forEach(item => {
    item.classList.remove('selected');
    const value = item.getAttribute('data-value');
    if (value === filters.dateRange) {
      item.classList.add('selected');
    }
  });

  // עדכון טקסטים של הפילטרים
  if (typeof window.updateStatusFilterText === 'function') window.updateStatusFilterText();
  if (typeof window.updateTypeFilterText === 'function') window.updateTypeFilterText();
  if (typeof window.updateAccountFilterText === 'function') window.updateAccountFilterText();
  if (typeof window.updateDateRangeFilterText === 'function') window.updateDateRangeFilterText();
};

// ===== Header System Initialization =====
// NOTE: Header system initialization is primarily handled by the unified initialization system
// (unified-app-initializer.js). However, we have a safety bootstrap that ensures the header
// is created even if the unified system doesn't call it (prevents header not appearing issue).
// The bootstrap only runs if the header hasn't been initialized within 1.5 seconds of DOMContentLoaded.

(function() {
  'use strict';
  
  // Safety bootstrap: Ensure header is created even if unified system doesn't initialize it
  const ensureHeaderInitialization = () => {
    // Check if header already initialized
    if (window.headerSystemReady || (window.headerSystem && window.headerSystem.isInitialized)) {
      window.Logger?.debug?.('✅ Header already initialized, skipping safety bootstrap', {
        page: 'header-system',
      });
      return;
    }

    // Check if HeaderSystem is available
    if (typeof window.HeaderSystem === 'undefined' || typeof window.HeaderSystem.initialize !== 'function') {
      window.Logger?.warn?.('⚠️ HeaderSystem not available for safety bootstrap', {
        page: 'header-system',
      });
      return;
    }

    // Check if header element already exists
    const existingHeader = document.getElementById('unified-header');
    if (existingHeader && existingHeader.innerHTML.trim().length > 0) {
      window.Logger?.debug?.('✅ Header element already exists with content, skipping safety bootstrap', {
        page: 'header-system',
      });
      return;
    }

    // Safety bootstrap: Initialize header if not already done
    window.Logger.info('🔧 Safety bootstrap: Initializing header system', {
      page: 'header-system',
      readyState: document.readyState,
      bodyExists: !!document.body,
      timestamp: new Date().toISOString(),
    });

    try {
      window.HeaderSystem.initialize();
    } catch (error) {
      window.Logger?.error?.('❌ Safety bootstrap failed', {
        page: 'header-system',
        error: error.message,
        stack: error.stack,
      });
    }
  };

  // Run safety bootstrap after DOMContentLoaded + delay (in case unified system doesn't run)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(ensureHeaderInitialization, 1500); // 1.5 seconds after DOMContentLoaded
    });
  } else {
    // DOM already loaded, run immediately with delay
    setTimeout(ensureHeaderInitialization, 1500);
  }
})();

window.resetAllFilters = async function () {
  console.log('↻ resetAllFilters - מחזיר לערכי ברירת מחדל מהעדפות');
  window.Logger.info('↻ resetAllFilters - מחזיר לערכי ברירת מחדל מהעדפות', {
    page: 'header-system',
  });
  window.Logger.info('↻ resetAllFilters - פונקציה נקראת!', { page: 'header-system' });

  try {
    // Clear preference cache to ensure fresh values from database
    const filterPrefNames = [
      'defaultSearchFilter',
      'defaultDateRangeFilter',
      'defaultStatusFilter',
      'defaultTypeFilter',
      'default_trading_account',
    ];
    for (const prefName of filterPrefNames) {
      const cacheKey = window.PreferencesCore?.buildPreferenceCacheKey
        ? window.PreferencesCore.buildPreferenceCacheKey(prefName, 0)
        : window.UnifiedCacheManager?.buildPreferenceCacheKey
          ? window.UnifiedCacheManager.buildPreferenceCacheKey(prefName, 0)
          : `preference_${prefName}__profile_0`;
      const legacyKey = `preference_${prefName}_1_0`;
      if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
        await window.UnifiedCacheManager.remove(cacheKey, { layer: 'localStorage' });
        if (legacyKey !== cacheKey) {
          await window.UnifiedCacheManager.remove(legacyKey, { layer: 'localStorage' });
        }
        console.log(`🗑️ Cleared cache for ${prefName}`);
      }
    }

    // Wait for critical preferences to be loaded before using them
    const environment = window.API_ENV || 'development';
    const timeoutMs = environment === 'production' ? 5000 : 3000;
    const waitStartTime = performance.now();
    
    // Wait for preferences:critical-loaded event with timeout fallback
    await new Promise((resolve) => {
      // Check if preferences are already loaded (check both currentPreferences and global flag)
      if (window.currentPreferences && Object.keys(window.currentPreferences).length > 0) {
        const waitTime = performance.now() - waitStartTime;
        window.Logger?.debug?.('✅ Preferences already available', {
          page: 'header-system',
          waitTime: `${waitTime.toFixed(2)}ms`,
        });
        resolve();
        return;
      }
      
      // Check if event already fired (race condition fix)
      if (window.__preferencesCriticalLoaded) {
        const waitTime = performance.now() - waitStartTime;
        window.Logger?.debug?.('✅ Preferences already loaded (flag check)', {
          page: 'header-system',
          waitTime: `${waitTime.toFixed(2)}ms`,
        });
        resolve();
        return;
      }
      
      // Wait for preferences:critical-loaded event
      const eventHandler = () => {
        const waitTime = performance.now() - waitStartTime;
        window.Logger?.debug?.('✅ Preferences loaded via event', {
          page: 'header-system',
          waitTime: `${waitTime.toFixed(2)}ms`,
        });
        resolve();
      };
      
      window.addEventListener('preferences:critical-loaded', eventHandler, { once: true });
      
      // Fallback timeout - continue even if event doesn't fire (backward compatibility)
      setTimeout(() => {
        window.removeEventListener('preferences:critical-loaded', eventHandler);
        const waitTime = performance.now() - waitStartTime;
        // Check flag one more time before timeout
        if (window.__preferencesCriticalLoaded) {
          window.Logger?.debug?.('✅ Preferences loaded during timeout check', {
            page: 'header-system',
            waitTime: `${waitTime.toFixed(2)}ms`,
          });
        } else {
          window.Logger?.warn?.('⚠️ Preferences event timeout - continuing without waiting', {
            page: 'header-system',
            timeout: `${timeoutMs}ms`,
            waitTime: `${waitTime.toFixed(2)}ms`,
          });
        }
        resolve();
      }, timeoutMs);
    });
    
    // טעינת הגדרות ברירת מחדל מהעדפות באמצעות מערכת ההעדפות הקיימת
    console.log('↻ בודק אם getPreference קיימת:', typeof window.getPreference);
    window.Logger.info('↻ בודק אם getPreference קיימת:', typeof window.getPreference, {
      page: 'header-system',
    });

    if (typeof window.getPreference !== 'function') {
      console.log('❌ getPreference לא קיימת - לא מתבצע איפוס, מציג הודעה למשתמש');
      const msg = 'לא ניתן לאפס פילטרים: מערכת העדפות לא זמינה. נסה לרענן או לבדוק התחברות.';
      if (typeof window.showNotification === 'function') {
        window.showNotification(msg, 'error', 'שגיאה', 4000, 'system');
      } else if (window.Logger && window.Logger.error) {
        window.Logger.error(msg, { page: 'header-system' });
      } else {
        alert(msg);
      }
      return; // אל תבצע ניקוי או ברירת מחדל
    }

    // טעינת העדפות ברירת מחדל
    const defaultSearch = (await window.getPreference('defaultSearchFilter')) || '';
    const defaultDateRange = (await window.getPreference('defaultDateRangeFilter')) || 'כל זמן';
    const defaultStatus = (await window.getPreference('defaultStatusFilter')) || [];
    const defaultType = (await window.getPreference('defaultTypeFilter')) || [];
    const defaultAccount = (await window.getPreference('default_trading_account')) || [];

    console.log('↻ העדפות ברירת מחדל:', {
      search: defaultSearch,
      dateRange: defaultDateRange,
      status: defaultStatus,
      type: defaultType,
      account: defaultAccount,
    });

    // הגדרות ברירת מחדל מהעדפות
    const defaultFilters = {
      search: defaultSearch,
      dateRange: defaultDateRange,
      status: Array.isArray(defaultStatus)
        ? defaultStatus
        : defaultStatus === 'הכל'
          ? []
          : [defaultStatus],
      type: Array.isArray(defaultType) ? defaultType : defaultType === 'הכל' ? [] : [defaultType],
      account: Array.isArray(defaultAccount)
        ? defaultAccount
        : defaultAccount === 'כל החשבונות'
          ? []
          : [defaultAccount],
      custom: {},
    };

    window.Logger.info('↻ טוען הגדרות ברירת מחדל:', defaultFilters, { page: 'header-system' });

    // יצירת filterSystem אם לא קיים
    if (!window.filterSystem && typeof window.HeaderSystemClass !== 'undefined') {
      console.log('⚠️ filterSystem לא קיים - יוצר עכשיו');
      window.HeaderSystemClass.createFilterSystem();
    }

    // עדכון הפילטרים הנוכחיים
    if (window.filterSystem) {
      console.log('✅ filterSystem קיים, מעדכן פילטרים');
      window.filterSystem.currentFilters = defaultFilters;
      window.filterSystem.saveFilters();
      window.filterSystem.triggerFilterUpdate('reset-defaults');

      // עדכון UI ישיר
      console.log('↻ מעדכן UI עם העדפות:', defaultFilters);

      // עדכון שדה החיפוש
      const searchInput = document.getElementById('searchFilterInput');
      if (searchInput) {
        // Use DataCollectionService to set value if available
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
          window.DataCollectionService.setValue('searchFilterInput', defaultFilters.search || '', 'text');
        } else {
          searchInput.value = defaultFilters.search || '';
        }
      }

      // עדכון בחירות בתפריטים
      console.log('🔄 קורא ל-updateFilterSelections עם:', defaultFilters);
      updateFilterSelections(defaultFilters);

      // updateFilterSelections כבר מעדכנת את הטקסטים, אין צורך לקרוא שוב
    } else {
      console.error('❌ filterSystem לא קיים אחרי ניסיון יצירה');
    }

    window.Logger.info('✅ פילטרים אופסו לערכי ברירת מחדל', { page: 'header-system' });

    // עדכון פורטלים
    updatePortalSelections();

    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('פילטרים אופסו לערכי ברירת מחדל', 'success', 'הצלחה', 2000, 'system');
    } else {
      window.Logger.info('🔔 הודעת הצלחה: פילטרים אופסו לערכי ברירת מחדל', {
        page: 'header-system',
      });
    }
  } catch (error) {
    console.log('❌ שגיאה בטעינת העדפות:', error.message);
    window.Logger &&
      window.Logger.error('❌ שגיאה בטעינת העדפות:', error, { page: 'header-system' });
    window.Logger &&
      window.Logger.error('❌ פרטי השגיאה:', error.message, error.stack, { page: 'header-system' });
    const msg = 'לא ניתן לאפס פילטרים: שגיאה בקריאת העדפות. נסה שוב מאוחר יותר.';
    if (typeof window.showNotification === 'function') {
      window.showNotification(msg, 'error', 'שגיאה', 4000, 'system');
    }
    return; // ללא fallback ניקוי
  }
};

window.handleSearchInput = function (event) {
  const searchTerm = event.target.value;
  if (window.filterSystem) {
    window.filterSystem.currentFilters.search = searchTerm;
    window.filterSystem.saveFilters();
    window.filterSystem.triggerFilterUpdate('search-change');
  }
};

window.clearSearchFilter = function () {
  const searchInput = document.getElementById('searchFilterInput');
  if (searchInput) {
    searchInput.value = '';
    if (window.filterSystem) {
      window.filterSystem.currentFilters.search = '';
      window.filterSystem.saveFilters();
      window.filterSystem.triggerFilterUpdate('search-clear');
    }
    window.Logger.info('✅ חיפוש נוקה', { page: 'header-system' });

    // הצגת הודעת הצלחה
    if (typeof window.showNotification === 'function') {
      window.showNotification('חיפוש נוקה בהצלחה', 'success', 'הצלחה', 1500, 'system');
    } else {
      window.Logger.info('🔔 הודעת הצלחה: חיפוש נוקה בהצלחה', { page: 'header-system' });
    }
  }
};

// Make HeaderSystem class available globally
window.HeaderSystemClass = HeaderSystem;

// Create global HeaderSystem object for compatibility with unified initialization
window.HeaderSystem = {
  initialize: function () {
    window.Logger.info('🚀 HeaderSystem.initialize() - START', {
      page: 'header-system',
      timestamp: new Date().toISOString(),
      readyState: document.readyState,
      bodyExists: !!document.body,
      HeaderSystemClassExists: typeof window.HeaderSystemClass === 'function',
      existingInstance: !!window.headerSystem,
      stackTrace: new Error().stack?.split('\n').slice(1, 6).join('\n'),
    });

    try {
      // Check if HeaderSystem class exists
      if (typeof window.HeaderSystemClass === 'function') {
        // Reuse existing instance if available, otherwise create new one
        if (!window.headerSystem) {
          window.Logger.info('🆕 HeaderSystem.initialize() - Creating new instance', {
            page: 'header-system',
          });
          window.headerSystem = new window.HeaderSystemClass();
        } else {
          window.Logger.info('♻️ HeaderSystem.initialize() - Reusing existing instance', {
            page: 'header-system',
            isInitialized: window.headerSystem.isInitialized,
          });
        }
        
        // Initialize the header system (init() handles duplicate prevention internally)
        if (typeof window.headerSystem.init === 'function') {
          window.Logger.info('🔄 HeaderSystem.initialize() - Calling init()', {
            page: 'header-system',
          });
          window.headerSystem.init();
          
          // בדיקה אחרי init
          const headerElement = document.getElementById('unified-header');
          window.Logger.info('✅ HeaderSystem.initialize() - init() completed', {
            page: 'header-system',
            headerElementExists: !!headerElement,
            headerElementVisible: headerElement ? window.getComputedStyle(headerElement).display !== 'none' : false,
            headerElementHeight: headerElement?.offsetHeight || 0,
            isInitialized: window.headerSystem.isInitialized,
          });
        } else {
          window.Logger.error('❌ HeaderSystem.initialize() - init() method not found', {
            page: 'header-system',
          });
        }
        
        // Mark as ready for compatibility
        window.headerSystemReady = true;
        
        window.Logger.info('✅ HeaderSystem.initialize() - COMPLETE', {
          page: 'header-system',
          headerSystemReady: window.headerSystemReady,
        });
        
        return true;
      } else {
        window.Logger.error('❌ HeaderSystem.initialize() - HeaderSystemClass not available', {
          page: 'header-system',
          HeaderSystemClassType: typeof window.HeaderSystemClass,
        });
        return false;
      }
    } catch (error) {
      window.Logger.error('❌ HeaderSystem.initialize() - ERROR', {
        page: 'header-system',
        error: error.message,
        stack: error.stack,
      });
      return false;
    }
  },
  createFilterSystem: function () {
    try {
      if (
        typeof window.HeaderSystemClass === 'function' &&
        typeof window.HeaderSystemClass.createFilterSystem === 'function'
      ) {
        return window.HeaderSystemClass.createFilterSystem();
      }
      return false;
    } catch (error) {
      window.Logger.info('⚠️ HeaderSystem.createFilterSystem error:', error.message, {
        page: 'header-system',
      });
      return false;
    }
  },
  init: function () {
    return this.initialize();
  },
};

// Create initializeHeaderSystem wrapper for compatibility with core-systems.js
// This is needed because core-systems.js calls window.initializeHeaderSystem()
window.initializeHeaderSystem = function() {
  window.Logger?.info?.('🔧 initializeHeaderSystem() wrapper called', {
    page: 'header-system',
    HeaderSystemExists: typeof window.HeaderSystem !== 'undefined',
  });
  
  if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
    return window.HeaderSystem.initialize();
  } else {
    window.Logger?.error?.('❌ HeaderSystem.initialize not available', {
      page: 'header-system',
    });
    return false;
  }
};

// הוסר - המערכת המאוחדת מטפלת באתחול
// Initialize the header system
// document.addEventListener('DOMContentLoaded', function() {
//   // window.Logger.info('🔧 DOMContentLoaded - checking filter functions:', { page: "header-system" });
//   window.Logger.info('selectStatusOption:', typeof window.selectStatusOption, { page: "header-system" });
//   window.Logger.info('updateStatusFilterText:', typeof window.updateStatusFilterText, { page: "header-system" });
//   window.Logger.info('applyStatusFilter:', typeof window.applyStatusFilter, { page: "header-system" });
//
//   if (typeof window.HeaderSystemClass === 'function') {
//     window.headerSystem = new window.HeaderSystemClass();
//     if (typeof window.headerSystem.init === 'function') {
//       window.headerSystem.init();
//     }
//
//     // יצירת מערכת הפילטרים
//     if (typeof window.HeaderSystemClass.createFilterSystem === 'function') {
//       window.HeaderSystemClass.createFilterSystem();
//
//       // טעינת מצב שמור אחרי שמערכת הפילטרים נוצרה
//       setTimeout(() => {
//         if (typeof window.HeaderSystemClass.loadSavedState === 'function') {
//           window.HeaderSystemClass.loadSavedState();
//         }
//       }, 200);
//     }
//
//     // בדיקה נוספת אחרי האתחול
//     setTimeout(() => {
//       // window.Logger.info('🔧 After init - checking filter functions again:', { page: "header-system" });
//       window.Logger.info('selectStatusOption:', typeof window.selectStatusOption, { page: "header-system" });
//       window.Logger.info('updateStatusFilterText:', typeof window.updateStatusFilterText, { page: "header-system" });
//       window.Logger.info('applyStatusFilter:', typeof window.applyStatusFilter, { page: "header-system" });
//     }, 100);
//   } else {
//     window.Logger.error('❌ HeaderSystem class not found', { page: "header-system" });
//   }
// });

// Update Toggle Buttons Function - עדכון מצב הכפתורים
window.updateToggleButtons = function () {
  const headerFilters = document.querySelector('.header-filters');
  const mainBtn = document.querySelector('.filter-toggle-main');
  const secondaryBtn = document.querySelector('.filter-toggle-secondary');

  // window.Logger.info('🔧 updateToggleButtons called', { page: "header-system" });
  // window.Logger.info('headerFilters:', headerFilters, { page: "header-system" });
  // window.Logger.info('mainBtn:', mainBtn, { page: "header-system" });
  // window.Logger.info('secondaryBtn:', secondaryBtn, { page: "header-system" });

  if (!headerFilters || !mainBtn || !secondaryBtn) {
    // window.Logger.info('❌ Missing elements', { page: "header-system" });
    return;
  }

  const isOpen = headerFilters.style.display !== 'none';
  // window.Logger.info('isOpen:', isOpen, { page: "header-system" });

  if (isOpen) {
    // פילטר פתוח - הצג כפתור משני (בתוך הפילטר)
    // window.Logger.info('📤 Hiding main button, showing secondary button', { page: "header-system" });
    mainBtn.style.display = 'none';
    secondaryBtn.style.display = 'block';
  } else {
    // פילטר סגור - הצג כפתור ראשי (בתוך התפריט הראשי)
    // window.Logger.info('📥 Showing main button, hiding secondary button', { page: "header-system" });
    mainBtn.style.display = 'block';
    secondaryBtn.style.display = 'none';
  }
};

// Z-Index Debug Function - בדיקת מצב z-index בפועל
window.debugZIndexStatus = function () {
  window.Logger.info('🔍 בדיקת מצב Z-Index במערכת ראש הדף', { page: 'header-system' });
  window.Logger.info('=====================================', { page: 'header-system' });

  // בדיקת אלמנטים רלוונטיים
  const elements = [
    { selector: '#unified-header', name: 'Header Container' },
    { selector: '.header-top', name: 'Header Top' },
    { selector: '.tiktrack-dropdown-menu', name: 'Dropdown Menus' },
    { selector: '.filter-toggle-section', name: 'Filter Toggle Button' },
    { selector: '.header-filter-toggle-btn', name: 'Filter Button' },
    { selector: '.header-filters', name: 'Header Filters' },
    { selector: '.filter-menu', name: 'Filter Menu' },
  ];

  elements.forEach(element => {
    const el = document.querySelector(element.selector);
    if (el) {
      const computedStyle = window.getComputedStyle(el);
      const zIndex = computedStyle.zIndex;
      const position = computedStyle.position;
      const display = computedStyle.display;
      const visibility = computedStyle.visibility;

      window.Logger.info(`📍 ${element.name}:`, { page: 'header-system' });
      window.Logger.info(`   Selector: ${element.selector}`, { page: 'header-system' });
      window.Logger.info(`   Z-Index: ${zIndex}`, { page: 'header-system' });
      window.Logger.info(`   Position: ${position}`, { page: 'header-system' });
      window.Logger.info(`   Display: ${display}`, { page: 'header-system' });
      window.Logger.info(`   Visibility: ${visibility}`, { page: 'header-system' });
      window.Logger.info(`   Visible: ${el.offsetParent !== null}`, { page: 'header-system' });
      window.Logger.info('---', { page: 'header-system' });
    } else {
      window.Logger.info(
        `❌ ${element.name} (${element.selector}, { page: "header-system" }): לא נמצא`
      );
    }
  });

  // בדיקת כל התפריטים הפתוחים
  window.Logger.info('🎯 בדיקת תפריטים פתוחים:', { page: 'header-system' });
  const openMenus = document.querySelectorAll(
    '.tiktrack-dropdown-menu:not([style*="display: none"])'
  );
  window.Logger.info(`תפריטים פתוחים: ${openMenus.length}`, { page: 'header-system' });

  openMenus.forEach((menu, index) => {
    const computedStyle = window.getComputedStyle(menu);
    window.Logger.info(`תפריט ${index + 1}: z-index = ${computedStyle.zIndex}`, {
      page: 'header-system',
    });
  });

  // בדיקת כפתור הפילטר
  window.Logger.info('🔘 בדיקת כפתור פילטר:', { page: 'header-system' });
  const filterBtn = document.querySelector('.header-filter-toggle-btn');
  if (filterBtn) {
    const computedStyle = window.getComputedStyle(filterBtn);
    window.Logger.info(`כפתור פילטר: z-index = ${computedStyle.zIndex}`, { page: 'header-system' });
    window.Logger.info(`כפתור פילטר: position = ${computedStyle.position}`, {
      page: 'header-system',
    });
    window.Logger.info(`כפתור פילטר: visible = ${filterBtn.offsetParent !== null}`, {
      page: 'header-system',
    });
  }

  // בדיקת תפריטי פילטר
  window.Logger.info('🔍 בדיקת תפריטי פילטר:', { page: 'header-system' });
  const filterMenus = document.querySelectorAll('.filter-menu');
  filterMenus.forEach((menu, index) => {
    const computedStyle = window.getComputedStyle(menu);
    window.Logger.info(`תפריט פילטר ${index + 1}: z-index = ${computedStyle.zIndex}`, {
      page: 'header-system',
    });
  });

  window.Logger.info('=====================================', { page: 'header-system' });
  window.Logger.info('✅ בדיקת Z-Index הושלמה', { page: 'header-system' });
};

// ===== CACHE CLEARING FUNCTIONS MOVED TO UNIFIED CACHE MANAGER =====
// All cache clearing functions are now part of the UnifiedCacheManager system
// and are available as global functions: clearCacheQuick, clearCacheLayer,
// clearAllCacheAdvanced, clearCacheFull

// ===== DEBUG FUNCTION FOR CACHE CLEARING =====

/**
 * פונקציה לבדיקה שהפונקציות עובדות
 */
window.testCacheClearingFunctions = function () {
  window.Logger.info('🧪 בדיקת פונקציות ניקוי מטמון...', { page: 'header-system' });

  const functions = [
    'clearCacheQuick',
    'clearCacheLayer',
    'clearAllCacheAdvanced',
    'clearCacheFull',
    'clearCacheBeforeCRUD',
  ];

  functions.forEach(funcName => {
    const exists = typeof window[funcName] === 'function';
    window.Logger.info(`${funcName}: ${exists ? '✅ זמינה' : '❌ לא זמינה'}`, {
      page: 'header-system',
    });
  });

  // בדיקת מערכת המטמון המאוחדת
  const unifiedCacheExists = window.UnifiedCacheManager !== undefined;
  window.Logger.info(`UnifiedCacheManager: ${unifiedCacheExists ? '✅ זמין' : '❌ לא זמין'}`, {
    page: 'header-system',
  });

  // בדיקת מערכת ההתראות
  const notificationExists = typeof window.showSuccessNotification === 'function';
  window.Logger.info(`showSuccessNotification: ${notificationExists ? '✅ זמין' : '❌ לא זמין'}`, {
    page: 'header-system',
  });

  window.Logger.info('🧪 בדיקת פונקציות ניקוי מטמון הושלמה', { page: 'header-system' });
};

// בדיקה שה-Logger זמין לפני השימוש
if (window.Logger && window.Logger.info) {
  window.Logger.info('✅ Header System v6.0.0 loaded successfully!', { page: 'header-system' });
} else {
}
