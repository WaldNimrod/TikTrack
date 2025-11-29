/**
 * Page Initialization Configs - Comprehensive Function Index
 * ==========================================
 *
 * This file contains page initialization configurations for TikTrack.
 * Defines which scripts and packages are loaded for each page.
 *
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/PAGE_INITIALIZATION_SYSTEM.md
 *
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

/**
 * Page Initialization Configurations - TikTrack
 * =============================================
 *
 * קונפיגורציות אתחול ספציפיות לעמודים שונים
 * מאפשר גמישות מקסימלית עם תחזוקה קלה
 *
 * ⚠️ IMPORTANT FOR DEVELOPERS:
 * ============================
 *
 * This file defines PAGE CONFIGURATIONS for the monitoring system.
 * When you add new scripts to pages, you MUST update the page configuration here.
 *
 * 🔧 COMPLETE WORKFLOW FOR ADDING NEW SCRIPTS:
 * ============================================
 *
 * STEP 1: Create the Script
 * -------------------------
 * // scripts/my-new-script.js
 * (function() {
 *     'use strict';
 *
 *     function myNewFunction() {
 *         window.Logger.info('New script loaded!', { page: "page-initialization-configs" });
 *     }
 *
 *     // IMPORTANT: Create Global for identification
 *     window.MyNewScript = {
 *         init: myNewFunction,
 *         version: '1.0.0'
 *     };
 *
 *     window.Logger.info('✅ MyNewScript loaded successfully', { page: "page-initialization-configs" });
 * })();
 *
 * STEP 2: Update Package Manifest
 * -------------------------------
 * // scripts/init-system/package-manifest.js
 * 'my-package': {
 *     scripts: [
 *         {
 *             file: 'my-new-script.js',
 *             globalCheck: 'window.MyNewScript', // IMPORTANT: Global for identification
 *             description: 'My new script',
 *             required: true
 *         }
 *     ]
 * }
 *
 * STEP 3: Update This File (Page Configuration)
 * ---------------------------------------------
 * 'my-page': {
 *     name: 'My Page',
 *     packages: ['base', 'my-package'], // Add the new package
 *     requiredGlobals: [
 *         'NotificationSystem',
        'window.IconSystem',
 *         'MyNewScript' // Add the new Global
 *     ],
 *     description: 'Page with new script',
 *     lastModified: '2025-01-20'
 * }
 *
 * STEP 4: Update HTML Page
 * ------------------------
 * <!-- my-page.html -->
 * <script src="scripts/my-new-script.js?v=1.0.0"></script>
 * <script src="scripts/init-system/package-manifest.js?v=1.0.0"></script>
 * <script src="scripts/page-initialization-configs.js?v=1.0.0"></script>
 * <script src="scripts/unified-app-initializer.js?v=1.0.0"></script>
 *
 * ADDITIONAL WORKFLOWS:
 * =====================
 *
 * Adding Existing Script to New Page:
 * 1. Update Page Config - add package to 'packages'
 * 2. Update HTML - add required scripts
 * 3. Test and validate
 *
 * Removing Script from Page:
 * 1. Remove from HTML - delete <script> tag
 * 2. Update Page Config - remove package from 'packages'
 * 3. Remove Globals - remove from 'requiredGlobals'
 * 4. Test and validate
 *
 * Removing Script from System Completely:
 * 1. Remove from all pages - delete from all HTML files
 * 2. Update Package Manifest - remove script from package
 * 3. Update Page Configs - remove package from all pages
 * 4. Delete the file - remove scripts/my-script.js
 * 5. Test and validate
 *
 * ⚠️ IMPORTANT RULES:
 * ==================
 *
 * 1. LOADING ORDER:
 *    - Always load package-manifest.js before page-initialization-configs.js
 *    - Always load unified-app-initializer.js last
 *    - Always load new scripts before monitoring system
 *
 * 2. GLOBAL CHECK:
 *    - Must create Global in window for identification
 *    - Must use same Global in globalCheck
 *    - Must add to requiredGlobals
 *
 * 3. VERSIONING:
 *    - Add ?v=1.0.0 to every new script
 *    - Update version when changing script
 *
 * 📖 DETAILED DOCUMENTATION:
 * ==========================
 * - Developer Guide: documentation/frontend/init-system/DEVELOPER_GUIDE.md
 * - Management Interface: /init-system-management
 *
 * 🔍 MONITORING SYSTEM ROLE:
 * ==========================
 * This file is used by the monitoring system to:
 * - Compare documented page requirements vs actually loaded scripts
 * - Validate that required globals are available
 * - Report mismatches between documentation and reality
 *
 * The monitoring system does NOT load scripts automatically.
 * It only compares and reports differences.
 *
 * 📦 PACKAGE USAGE GUIDE:
 * ======================
 *
 * 🔹 BASE PACKAGE (חובה לכל עמוד):
 *    - notification-system.js
 *    - button-system-init.js
 *    - ui-utils.js
 *    - translation-utils.js
 *
 * 🔹 CRUD PACKAGE (לעמודי נתונים):
 *    - tables.js
 *    - data-utils.js
 *    - date-utils.js ← formatDate function
 *    - actions-menu-system.js
 *
 * 🔹 CHARTS PACKAGE (לעמודי גרפים):
 *    - chart-utils.js
 *    - chart-renderer.js
 *
 * ⚠️ CRITICAL RULES:
 * =================
 * 1. BASE is MANDATORY - always include 'base' in packages array
 * 2. CRUD includes date-utils.js - use for pages needing formatDate
 * 3. CHARTS is optional - only for pages with charts
 * 4. Each package is INDEPENDENT - no automatic inclusion
 * 5. Pages must explicitly request ALL packages they need
 *
 * 💡 EXAMPLES:
 * ============
 * - Simple page: packages: ['base']
 * - Data page: packages: ['base', 'crud']
 * - Chart page: packages: ['base', 'charts']
 * - Full page: packages: ['base', 'crud', 'charts']
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== PAGE CONFIGURATIONS =====

if (typeof window.PAGE_CONFIGS === 'undefined' || window.PAGE_CONFIGS.__SOURCE === 'core-systems') {
  const PAGE_CONFIGS = {
    // Main Pages
    index: {
      name: 'Dashboard',

      // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
      // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
      // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
      // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
      // - 'crud': מערכות CRUD ו-entity-details
      // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
      // - 'entity-details': מערכות פרטי ישויות
      // - 'info-summary': מערכת סיכום נתונים מאוחדת
      // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
      packages: [
        'base',
        'services',
        'ui-advanced',
        'crud',
        'preferences',
        'entity-services',
        'entity-details',
        'info-summary',
        'dashboard-widgets',
        'init-system',
      ],

      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'NotificationSystem',
        'DataUtils',
        'window.Logger',
        'window.CacheSyncManager',
        'window.IconSystem',
        'window.DashboardData',
        'window.loadDashboardData',
        'window.RecentTradesWidget',
        'window.PendingExecutionsHighlights',
        'window.PendingExecutionTradeCreation',
        'window.TagWidget',
      ],

      // ← NEW: מטאדאטה
      description: 'דשבורד ראשי - כולל גרפים, סטטיסטיקות ונתונים כלליים',
      lastModified: '2025-10-19',
      pageType: 'dashboard',

      // ← NEW: אופטימיזציה
      preloadAssets: ['dashboard-data'],
      cacheStrategy: 'aggressive',

      // קיים
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        // Dashboard-specific initialization
        async pageConfig => {
          // window.Logger.info('📊 Initializing Dashboard...', { page: "page-initialization-configs" });

          // Load trading accounts data if needed for portfolio
          const loadAccounts =
            typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function'
              ? window.loadTradingAccountsDataForTradingAccountsPage
              : window.loadAccountsData;
          if (typeof loadAccounts === 'function') {
            try {
              if (window.CacheTTLGuard?.ensure) {
                await window.CacheTTLGuard.ensure('accounts-data', loadAccounts);
              } else {
                await loadAccounts();
              }
            } catch (error) {
              window.Logger?.warn('⚠️ Error loading accounts data:', error, {
                page: 'page-initialization-configs',
              });
            }
          }

          // Use the new unified initialization function
          if (typeof window.initializeIndexPage === 'function') {
            await window.initializeIndexPage();
          } else {
            // Fallback to old method
            // Initialize charts if available
            if (typeof window.initializeCharts === 'function') {
              await window.initializeCharts();
            }

            // Load dashboard data
          if (typeof window.loadDashboardData === 'function') {
            await window.loadDashboardData();
          }
          }

          // Initialize positions & portfolio system
          if (typeof window.initPositionsPortfolio === 'function') {
            try {
              await window.initPositionsPortfolio(false); // Don't auto-select account on home page
            } catch (error) {
              window.Logger?.warn('⚠️ Error initializing positions portfolio:', error, {
                page: 'page-initialization-configs',
              });
            }
          }

          // Initialize unified tag widget
          if (typeof window.TagWidget !== 'undefined' && typeof window.TagWidget.init === 'function') {
            try {
              window.Logger?.info?.('🏷️ Initializing TagWidget...', { page: 'page-initialization-configs' });
              // Initialize with default configuration: min 1 row, max 3 rows
              window.TagWidget.init('tagWidgetContainer', {
                minRows: 1,
                maxRows: 3,
                rowHeight: 20
              });
              window.Logger?.info?.('✅ TagWidget initialization called', { page: 'page-initialization-configs' });
            } catch (error) {
              window.Logger?.warn('⚠️ Error initializing TagWidget:', error, {
                page: 'page-initialization-configs',
              });
            }
          } else {
            window.Logger?.warn('⚠️ TagWidget not available', {
              TagWidgetExists: typeof window.TagWidget !== 'undefined',
              hasInit: typeof window.TagWidget?.init === 'function',
              page: 'page-initialization-configs',
            });
          }
        },
      ],
    },

    'tag-management': {
      name: 'Tag Management',
      packages: [
        'base',
        'services',
        'modules',
        'ui-advanced',
        'crud',
        'tag-management',
        'preferences',
        'validation',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.Logger',
        'window.ModalManagerV2',
        'window.TagService',
        'window.TagUIManager',
        'window.TagManagementPage',
      ],
      description: 'ניהול תגיות וקטגוריות - כולל אנליטיקה, סינון והצעות',
      lastModified: '2025-11-13',
      pageType: 'settings',
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async () => {
          if (window.TagManagementPage && typeof window.TagManagementPage.init === 'function') {
            await window.TagManagementPage.init();
          }
        },
      ],
    },

    preferences: {
      name: 'Preferences',

      // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
      // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
      // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
      // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
      // - 'crud': מערכות CRUD ו-entity-details
      // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
      // - 'validation': מערכת ולידציה (validation-utils.js)
      // - 'info-summary': מערכת סיכום נתונים מאוחדת
      // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
      // NOTE: constraint-manager.js נטען בנפרד כקובץ page-specific (לא דרך חבילת system-management)
      packages: [
        'base',
        'services',
        'ui-advanced',
        'crud',
        'preferences',
        'validation',
        'entity-details',
        'info-summary',
        'init-system',
      ],

      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.Logger',
        'window.CacheSyncManager',
        'window.PreferencesUIV4',
      ],

      // ← NEW: מטאדאטה
      description: 'עמוד העדפות משתמש - הגדרות מערכת וצבעים',
      lastModified: '2025-10-19',
      pageType: 'settings',

      // ← NEW: אופטימיזציה
      preloadAssets: ['preferences-data'],
      cacheStrategy: 'persistent',

      // ← NEW: Accordion mode - only one section open at a time
      accordionMode: true,

      // ← NEW: Default state for sections (when no cache exists)
      sectionsDefaultState: 'closed', // 'closed' | 'open'

      // קיים
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: false,
      customInitializers: [
        // Preferences-specific initialization
        async pageConfig => {
          window.Logger.info('⚙️ Initializing Preferences...', {
            page: 'page-initialization-configs',
          });

          // Load trading accounts for default account preference
          if (typeof window.loadAccountsForPreferences === 'function') {
            await window.loadAccountsForPreferences();
          }

          // Initialize Preferences UI V4 (this loads user/profile data and displays it)
          // Note: PreferencesCore.initializeWithLazyLoading() is called by core-systems.js
          // but PreferencesUIV4.initialize() is page-specific and must be called here
          if (window.PreferencesUIV4 && typeof window.PreferencesUIV4.initialize === 'function') {
            window.Logger.info('🎨 Initializing Preferences UI V4...', {
              page: 'page-initialization-configs',
            });
            await window.PreferencesUIV4.initialize();
          } else if (window.PreferencesUI && typeof window.PreferencesUI.initialize === 'function') {
            // Fallback to PreferencesUI if PreferencesUIV4 is not available
            window.Logger.info('🎨 Initializing Preferences UI (fallback)...', {
              page: 'page-initialization-configs',
            });
            await window.PreferencesUI.initialize();
          } else {
            window.Logger.warn('⚠️ PreferencesUIV4 or PreferencesUI not available', {
              page: 'page-initialization-configs',
            });
          }

          // Load default colors if not set
          if (typeof window.loadDefaultColors === 'function') {
            window.loadDefaultColors();
          }

          // Render preference types audit table
          if (typeof window.renderPreferenceTypesAuditTable === 'function') {
            await window.renderPreferenceTypesAuditTable();
          }

          // Setup preference change handlers (function not implemented yet)
          // if (typeof window.setupPreferenceHandlers === 'function') {
          //     window.setupPreferenceHandlers();
          // }
        },
      ],
    },

    'user-profile': {
      name: 'User Profile',
      packages: [
        'base',
        'services',
        'validation',
        'modules',
        'ui-advanced',
        'preferences',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.Logger',
        'window.TikTrackAuth',
        'window.UserProfilePage',
      ],
      description: 'ניהול פרופיל משתמש - עדכון פרטים ושינוי סיסמה',
      lastModified: '2025-01-28',
      pageType: 'settings',
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: false,
      customInitializers: [
        async () => {
          if (window.UserProfilePage && typeof window.UserProfilePage.init === 'function') {
            await window.UserProfilePage.init();
          }
        },
      ],
    },

    // Trading Pages
    trades: {
      name: 'Trades',

      // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
      // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
      // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
      // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
      // - 'modules': מודולים כלליים (modal-manager-v2)
      // - 'crud': מערכות CRUD ו-entity-details
      // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
      // - 'validation': מערכת ולידציה מאוחדת
      // - 'info-summary': מערכת סיכום נתונים מאוחדת
      // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
      packages: [
        'base',
        'services',
        'modules',
        'ui-advanced',
        'crud',
        'preferences',
        'validation',
        'conditions',
        'entity-details',
        'entity-services',
        'info-summary',
        'init-system',
      ],

      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.Logger',
        'window.CacheSyncManager',
        'window.TradesData',
        'window.ModalManagerV2',
        'window.tradesModalConfig',
        'window.InvestmentCalculationService',
        'window.loadTradesData',
        'window.checkLinkedItemsBeforeAction',
        'window.RichTextEditorService',
        'window.Quill',
        'window.DOMPurify',
        'window.conditionsCRUDManager',
        'window.conditionsFormGenerator',
        'window.ConditionsUIManager',
        'window.ConditionsModalController',
        'window.conditionsModalConfig',
      ],

      // ← NEW: מטאדאטה
      description: 'עמוד מעקב טריידים - כולל טבלאות, פילטרים, התראות ותנאים',
      lastModified: '2025-10-19',
      pageType: 'crud',

      // ← NEW: אופטימיזציה
      preloadAssets: ['trades-data'],
      cacheStrategy: 'aggressive',

      // קיים
      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('📈 Initializing Trades...', { page: 'page-initialization-configs' });

          // Use the new unified initialization function
          if (typeof window.initializeTradesPage === 'function') {
            await window.initializeTradesPage();
          } else {
            // Fallback to old method
            if (typeof window.loadTradesData === 'function') {
              if (window.CacheTTLGuard?.ensure) {
                await window.CacheTTLGuard.ensure('trade-data', window.loadTradesData);
              } else {
                await window.loadTradesData();
              }
            }
          }
        },
        async pageConfig => {
          // Use centralized conditions initializer
          if (window.conditionsInitializer && typeof window.conditionsInitializer.initialize === 'function') {
            await window.conditionsInitializer.initialize();
            if (window.conditionsCRUDManager) {
              window.conditionsCRUDManager.setContext({ entityType: 'trade' });
            }
          }
        },
      ],
    },

    executions: {
      name: 'Executions',

      // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
      // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
      // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
      // - 'modules': מודולים כלליים (core-systems, ui-advanced עם loadUserPreferences)
      // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
      // - 'crud': מערכות CRUD ו-entity-details
      // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
      // - 'entity-services': שירותי ישויות (טיקרים, חשבונות)
      // - 'info-summary': מערכת סיכום נתונים מאוחדת
      // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
      packages: [
        'base',
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'validation',
        'conditions',
        'entity-services',
        'entity-details',
        'info-summary',
        'init-system',
      ],

      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.Logger',
        'window.CacheSyncManager',
        'window.loadExecutionsData',
        'window.executionsModalConfig',
        'window.SelectPopulatorService',
        'window.tickerService',
        'window.loadUserPreferences',
        'window.RichTextEditorService',
        'window.Quill',
        'window.DOMPurify',
        'window.PendingExecutionTradeCreation',
      ],

      // ← NEW: מטאדאטה
      description: 'מעקב ביצועי עסקאות - היסטוריית ביצועים שבוצעו',
      lastModified: '2025-11-24',
      pageType: 'crud',

      // ← NEW: אופטימיזציה
      preloadAssets: ['executions-data'],
      cacheStrategy: 'aggressive',

      // ← NEW: Section default states
      // Main section loads open, trade-creation and suggestions load closed (lazy loading)
      sectionsDefaultState: 'open', // Default for all sections
      sectionDefaultStates: {
        'trade-creation': 'closed', // Lazy loading - closed by default
        'suggestions': 'closed',    // Lazy loading - closed by default
      },

      // קיים
      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('⚡ Initializing Executions...', {
            page: 'page-initialization-configs',
          });

          // Preferences are already loaded by core-systems.js via initializePreferencesForPage
          // No need to call loadUserPreferences here - it causes duplicate API calls and 429 errors

          window.Logger.info('🔍 Checking loadExecutionsData...', {
            exists: typeof window.loadExecutionsData !== 'undefined',
            type: typeof window.loadExecutionsData,
            isFunction: typeof window.loadExecutionsData === 'function',
            page: 'page-initialization-configs',
          });
          
          if (typeof window.loadExecutionsData === 'function') {
            window.Logger.info('📥 Calling loadExecutionsData...', {
              page: 'page-initialization-configs',
            });
            try {
              await window.loadExecutionsData();
              window.Logger.info('✅ loadExecutionsData completed', {
                page: 'page-initialization-configs',
              });
            } catch (error) {
              window.Logger.error('❌ loadExecutionsData failed', {
                error: error?.message,
                stack: error?.stack,
                page: 'page-initialization-configs',
              });
            }
          } else {
            window.Logger.warn('⚠️ window.loadExecutionsData is not a function', {
              type: typeof window.loadExecutionsData,
              value: window.loadExecutionsData,
              page: 'page-initialization-configs',
            });
          }

          // Initialize import modal
          if (typeof window.initializeImportUserDataModal === 'function') {
            window.Logger.info('📥 Initializing Import User Data Modal...', {
              page: 'page-initialization-configs',
            });
            window.initializeImportUserDataModal();
          }
          
          // Replace icons with IconSystem
          if (typeof window.replaceIconsInContext === 'function') {
            await window.replaceIconsInContext();
          }
        },
      ],
    },

    data_import: {
      name: 'Data Import',

      // 📦 Required packages for the Data Import dashboard
      packages: [
        'base',
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'validation',
        'conditions',
        'entity-services',
        'entity-details',
        'info-summary',
        'init-system',
      ],

      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.Logger',
        'window.ModalManagerV2',
        'window.initializeDataImportPage',
        'window.refreshDataImportHistory',
        'window.showImportUserDataNotification',
      ],

      description: 'דף מרכזי לניהול תהליכי ייבוא נתונים ושיגור המודול המאוחד',
      lastModified: '2025-11-18',
      pageType: 'crud',

      // Page-specific scripts (not part of packages)
      pageSpecificScripts: [
        'scripts/data_import.js',
        'scripts/services/data-import-data.js',
        'scripts/debug-currency-exchange-import.js',
        'scripts/debug-import-filtering.js',
        'scripts/monitor-import-execution.js',
        'scripts/debug-active-session.js',
      ],

      requiresFilters: false,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async () => {
          if (typeof window.initializeDataImportPage === 'function') {
            await window.initializeDataImportPage();
          }
        },
      ],
    },

    trade_plans: {
      name: 'Trade Plans',

      // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
      // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
      // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
      // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
      // - 'crud': מערכות CRUD ו-entity-details
      // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
      // - 'modules': מודולים כלליים (כולל ModalManagerV2)
      // - 'validation': מערכת ולידציה מאוחדת
      // - 'entity-services': שירותי ישויות (LinkedItemsService, ticker-service, etc.)
      // - 'entity-details': מערכות פרטי ישויות
      // - 'info-summary': מערכת סיכום נתונים מאוחדת
      // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
      packages: [
        'base',
        'services',
        'modules',
        'ui-advanced',
        'crud',
        'preferences',
        'validation',
        'conditions',
        'entity-services',
        'entity-details',
        'info-summary',
        'init-system',
      ],

      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.loadTradePlansData',
        'window.ModalManagerV2',
        'window.tradePlansModalConfig',
        'window.alertsModalConfig',  // Required for editing alerts from linked items
        'window.notesModalConfig',   // Required for editing notes from linked items
        'window.InvestmentCalculationService',
        'window.UnifiedCRUDService',
        'window.RichTextEditorService',
        'window.Quill',
        'window.DOMPurify',
        'window.conditionsCRUDManager',
        'window.conditionsFormGenerator',
        'window.ConditionsUIManager',
        'window.ConditionsModalController',
        'window.conditionsModalConfig',
      ],

      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('📋 Initializing Trade Plans...', {
            page: 'page-initialization-configs',
          });

          // Load trade plans data directly
          if (typeof window.loadTradePlansData === 'function') {
            if (window.CacheTTLGuard?.ensure) {
              await window.CacheTTLGuard.ensure('trade-plans-data', window.loadTradePlansData);
            } else {
              await window.loadTradePlansData();
            }
          } else {
            window.Logger.warn('⚠️ loadTradePlansData function not available', {
              page: 'page-initialization-configs',
            });
          }
        },
        async pageConfig => {
          // Use centralized conditions initializer
          if (window.conditionsInitializer && typeof window.conditionsInitializer.initialize === 'function') {
            await window.conditionsInitializer.initialize();
            if (window.conditionsCRUDManager) {
              window.conditionsCRUDManager.setContext({ entityType: 'plan' });
            }
          }
        },
      ],
    },

    alerts: {
      name: 'Alerts',

      // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
      // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
      // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
      // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
      // - 'crud': מערכות CRUD ו-entity-details
      // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
      // - 'info-summary': מערכת סיכום נתונים מאוחדת
      // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
      packages: [
        'base',
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'validation',
        'conditions',
        'entity-services',
        'entity-details',
        'info-summary',
        'init-system',
      ],

      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.loadAlertsData',
        'window.ModalManagerV2',
        'window.alertsModalConfig',
        'window.RichTextEditorService',
        'window.Quill',
        'window.DOMPurify',
        'window.conditionsCRUDManager',
        'window.conditionsFormGenerator',
        'window.ConditionsUIManager',
        'window.ConditionsModalController',
        'window.conditionsModalConfig',
      ],

      // ← NEW: מטאדאטה
      description: 'מערכת התראות עסקיות - ניהול תנאי שוק והתראות',
      lastModified: '2025-11-13',
      pageType: 'crud',

      // ← NEW: אופטימיזציה
      preloadAssets: ['alerts-data'],
      cacheStrategy: 'aggressive',

      // קיים
      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🔔 Initializing Alerts...', { page: 'page-initialization-configs' });

          if (typeof window.loadAlertsData === 'function') {
            if (window.CacheTTLGuard?.ensure) {
              await window.CacheTTLGuard.ensure('alerts-data', window.loadAlertsData);
            } else {
              await window.loadAlertsData();
            }
          }

          // Setup alert-specific handlers (function not implemented yet)
          // if (typeof window.setupAlertHandlers === 'function') {
          //     window.setupAlertHandlers();
          // }
        },
        async pageConfig => {
          window.Logger.info('🔧 Initializing Alerts Conditions Integration...', {
            page: 'page-initialization-configs',
          });

          // Initialize conditions integration for alerts
          if (typeof window.initializeAlertModalTabs === 'function') {
            window.initializeAlertModalTabs();
          } else {
            window.Logger.warn('⚠️ Alert modal tabs system not available', {
              page: 'page-initialization-configs',
            });
          }
        },
      ],
    },

    // Account Management
    trading_accounts: {
      name: 'Trading Accounts',

      // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
      // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
      // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
      // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
      // - 'modules': מודולים (modal-manager-v2, modal-navigation-manager, tag-ui-manager)
      // - 'crud': מערכות CRUD ו-entity-details
      // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
      // - 'info-summary': מערכת סיכום נתונים מאוחדת
      // - 'entity-services': שירותי ישויות (כולל LinkedItemsService לפריטים מקושרים)
      // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
      packages: [
        'base',
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'validation',
        'entity-details',
        'entity-services',
        'info-summary',
        'init-system',
      ],

      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.loadTradingAccountsDataForTradingAccountsPage',
        'window.ModalManagerV2',
        'window.tradingAccountsModalConfig',
        'window.TagUIManager',
        'window.RichTextEditorService',
        'window.Quill',
        'window.DOMPurify',
      ],

      // ← NEW: מטאדאטה
      description: 'ניהול חשבונות מסחר - הוספה, עריכה ומעקב חשבונות',
      lastModified: '2025-10-19',
      pageType: 'crud',

      // ← NEW: אופטימיזציה
      preloadAssets: ['accounts-data'],
      cacheStrategy: 'aggressive',

      // קיים
      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          // Function availability is tracked internally
          window.Logger.info('🏦 Initializing Trading Accounts...', {
            page: 'page-initialization-configs',
          });
          window.Logger.info('🔍 Checking function availability:', {
            page: 'page-initialization-configs',
          });
          window.Logger.info(
            '  - loadTradingAccountsDataForTradingAccountsPage:',
            typeof window.loadTradingAccountsDataForTradingAccountsPage,
            { page: 'page-initialization-configs' }
          );
          window.Logger.info('  - loadAccountsData:', typeof window.loadAccountsData, {
            page: 'page-initialization-configs',
          });

          const loadTradingAccounts =
            typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function'
              ? window.loadTradingAccountsDataForTradingAccountsPage
              : window.loadAccountsData;
          if (typeof loadTradingAccounts === 'function') {
            // Removed debug log - service calls are tracked internally
            window.Logger.info('📡 Calling trading accounts loader via service...', {
              page: 'page-initialization-configs',
            });
            await loadTradingAccounts();
          } else {
            console.warn('⚠️ No suitable function found for loading trading accounts data');
            window.Logger.info('⚠️ No suitable function found for loading trading accounts data', {
              page: 'page-initialization-configs',
            });
          }

          // Wait for trading accounts data to be available
          let waitCount = 0;
          while (!window.trading_accountsData || !Array.isArray(window.trading_accountsData) || window.trading_accountsData.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
            waitCount++;
            if (waitCount > 50) { // 5 seconds timeout
              window.Logger.warn('⚠️ Trading accounts data not available after timeout', {
                page: 'page-initialization-configs',
              });
              break;
            }
          }

          // Wait for critical preferences to be loaded (for default account selection)
          if (!window.__preferencesCriticalLoaded) {
            window.Logger.info('⏳ Waiting for critical preferences to load...', {
              page: 'page-initialization-configs',
            });
            await new Promise((resolve) => {
              // Check if already loaded
              if (window.__preferencesCriticalLoaded) {
                resolve();
                return;
              }
              
              // Wait for event
              const eventHandler = () => {
                resolve();
              };
              window.addEventListener('preferences:critical-loaded', eventHandler, { once: true });
              
              // Timeout fallback
              setTimeout(() => {
                window.removeEventListener('preferences:critical-loaded', eventHandler);
                window.Logger.warn('⚠️ Preferences timeout - continuing without waiting', {
                  page: 'page-initialization-configs',
                });
                resolve();
              }, 3000);
            });
          }

          // Wait for filter system to be initialized (for date range)
          let filterWaitCount = 0;
          while (!window.selectedDateRangeForFilter && filterWaitCount < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            filterWaitCount++;
          }
          
          if (!window.selectedDateRangeForFilter) {
            // Set default if not available
            window.selectedDateRangeForFilter = 'כל זמן';
            window.Logger.info('ℹ️ Using default date range: כל זמן', {
              page: 'page-initialization-configs',
            });
          }

          window.Logger.info('✅ All required data available - initializing tables', {
            page: 'page-initialization-configs',
            hasAccounts: !!(window.trading_accountsData && window.trading_accountsData.length > 0),
            hasPreferences: !!window.__preferencesCriticalLoaded,
            dateRange: window.selectedDateRangeForFilter,
          });

          // Initialize account activity system (now with all data available)
          if (typeof window.initAccountActivity === 'function') {
            window.Logger.info('🔄 Initializing account activity system...', {
              page: 'page-initialization-configs',
            });
            await window.initAccountActivity(true); // Auto-select default account
          } else {
            window.Logger.warn('⚠️ initAccountActivity not available', {
              page: 'page-initialization-configs',
            });
          }

          // Initialize positions & portfolio system (now with all data available)
          if (typeof window.initPositionsPortfolio === 'function') {
            window.Logger.info('🔄 Initializing positions & portfolio system...', {
              page: 'page-initialization-configs',
            });
            await window.initPositionsPortfolio(true); // Auto-select default account
          } else {
            window.Logger.warn('⚠️ initPositionsPortfolio not available', {
              page: 'page-initialization-configs',
            });
          }

          console.log('✅ Trading Accounts initialization completed');
        },
      ],
    },

    cash_flows: {
      name: 'Cash Flows',
      // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
      // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
      // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
      // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
      // - 'crud': מערכות CRUD ו-entity-details
      // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
      // - 'validation': מערכות ולידציה
      // - 'modules': מודולים (modal-manager-v2, modal-navigation-manager)
      // - 'entity-details': מערכות פרטי ישויות
      // - 'info-summary': מערכת סיכום נתונים מאוחדת
      // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
      packages: [
        'base',
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'validation',
        'entity-services',
        'entity-details',
        'info-summary',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem', // from base package
        'DataUtils', // from services package
        'window.loadCashFlowsData',
        'window.ModalManagerV2',
        'window.cashFlowModalConfig',
        'window.RichTextEditorService',
        'window.Quill',
        'window.DOMPurify',
      ],
      description: 'ניהול תזרימי מזומנים - הכנסות והוצאות',
      lastModified: '2025-11-13',
      pageType: 'crud',
      preloadAssets: ['cash-flows-data'],
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('💰 Initializing Cash Flows...', {
            page: 'page-initialization-configs',
          });

          // Preferences are already loaded by core-systems.js via initializePreferencesForPage
          // No need to call PreferencesSystem.initialize() here - it causes duplicate API calls and 429 errors

          if (typeof window.loadCashFlowsData === 'function') {
            await window.loadCashFlowsData();
          }
        },
      ],
    },

    // Data Management
    tickers: {
      name: 'Tickers',

      // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
      // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
      // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
      // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
      // - 'crud': מערכות CRUD ו-entity-details
      // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
      // - 'info-summary': מערכת סיכום נתונים מאוחדת
      // - 'modules': מודולים כלליים (core-systems, modal-manager-v2)
      // - 'external-data': שירות נתונים חיצוניים (Yahoo Finance, etc.)
      // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
      packages: [
        'base',
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'validation',
        'external-data',
        'entity-services',
        'entity-details',
        'info-summary',
        'init-system',
      ],

      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'ExternalDataService',
        'window.loadTickersData',
        'window.ModalManagerV2',
        'window.tickersModalConfig',
      ],

      // ← NEW: מטאדאטה
      description: 'ניהול טיקרים - מעקב מחירים ונתונים פיננסיים',
      lastModified: '2025-11-13',
      pageType: 'crud',

      // ← NEW: אופטימיזציה
      preloadAssets: ['tickers-data'],
      cacheStrategy: 'aggressive',

      // קיים
      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('📊 Initializing Tickers...', { page: 'page-initialization-configs' });

          if (typeof window.loadTickersData === 'function') {
            if (window.CacheTTLGuard?.ensure) {
              await window.CacheTTLGuard.ensure('tickers-data', window.loadTickersData);
            } else {
              await window.loadTickersData();
            }
          }
        },
      ],
    },

    notes: {
      name: 'Notes',

      // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
      // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
      // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
      // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
      // - 'modules': מודולים כלליים (modal-manager-v2, business-module, etc.)
      // - 'crud': מערכות CRUD ו-entity-details
      // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
      // - 'validation': מערכות ולידציה
      // - 'entity-services': שירותי ישויות (account-service, ticker-service, etc.)
      // - 'entity-details': מערכות פרטי ישות
      // - 'info-summary': מערכת סיכום נתונים מאוחדת
      // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
      packages: [
        'base',
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'validation',
        'entity-services',
        'entity-details',
        'info-summary',
        'init-system',
      ],

      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.NotesData',
        'window.loadNotesData',
        'window.ModalManagerV2',
        'window.notesModalConfig',
        'window.RichTextEditorService',
        'window.Quill',
        'window.DOMPurify',
      ],

      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          console.log('📝 [page-initialization-configs] Notes customInitializer started');

          // Use general system getPageDataFunctions() instead of local code
          if (typeof window.getPageDataFunctions === 'function') {
            console.log('✅ [page-initialization-configs] getPageDataFunctions found');
            const { loadData } = window.getPageDataFunctions();
            console.log('🔍 [page-initialization-configs] loadData type:', typeof loadData);

            if (loadData && typeof loadData === 'function') {
              console.log(
                '📝 [page-initialization-configs] Initializing Notes via general system...'
              );
              try {
                await loadData();
                console.log('✅ [page-initialization-configs] Notes data loaded successfully');
              } catch (error) {
                console.error('❌ [page-initialization-configs] Error loading notes data:', error);
              }
            } else {
              console.warn(
                '⚠️ [page-initialization-configs] loadData is not a function, trying fallback...'
              );
              // Fallback to direct function call if general system doesn't have it
              if (typeof window.loadNotesData === 'function') {
                console.log(
                  '📝 [page-initialization-configs] Initializing Notes (fallback to loadNotesData via TTL guard)...'
                );
                try {
                  if (window.CacheTTLGuard?.ensure) {
                    await window.CacheTTLGuard.ensure('notes-data', window.loadNotesData);
                  } else {
                    await window.loadNotesData();
                  }
                  console.log(
                    '✅ [page-initialization-configs] Notes data loaded successfully (fallback)'
                  );
                } catch (error) {
                  console.error('❌ [page-initialization-configs] Error in loadNotesData:', error);
                }
              } else {
                console.error(
                  '❌ [page-initialization-configs] loadNotesData function not available'
                );
              }
            }
          } else {
            console.warn(
              '⚠️ [page-initialization-configs] getPageDataFunctions not found, trying direct loadNotesData...'
            );
            // Fallback if getPageDataFunctions doesn't exist
            if (typeof window.loadNotesData === 'function') {
              console.log(
                '📝 [page-initialization-configs] Initializing Notes (direct loadNotesData via TTL guard)...'
              );
              try {
                if (window.CacheTTLGuard?.ensure) {
                  await window.CacheTTLGuard.ensure('notes-data', window.loadNotesData);
                } else {
                  await window.loadNotesData();
                }
                console.log(
                  '✅ [page-initialization-configs] Notes data loaded successfully (direct)'
                );
              } catch (error) {
                console.error('❌ [page-initialization-configs] Error in loadNotesData:', error);
              }
            } else {
              console.error(
                '❌ [page-initialization-configs] loadNotesData function not available'
              );
            }
          }
        },
      ],
    },

    // Development Tools
    'system-management': {
      name: 'System Management',

      // החבילות הדרושות למערכת הניהול המשולבת
      packages: [
        'base',
        'external-data',
        'logs',
        'cache',
        'system-management',
        'management',
        'init-system',
      ],

      requiredGlobals: ['NotificationSystem',
        'window.IconSystem', 'window.systemManagement'],

      // ← NEW: מטאדאטה
      description: 'כלי ניהול מערכת - מעקב ביצועים, לוגים וסטטיסטיקות',
      lastModified: '2025-11-13',
      pageType: 'admin',

      // ← NEW: אופטימיזציה
      preloadAssets: ['system-info'],
      cacheStrategy: 'minimal',

      // קיים
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🔧 Initializing System Management...', {
            page: 'page-initialization-configs',
          });

          if (typeof window.loadSystemInfo === 'function') {
            await window.loadSystemInfo();
          }

          // Initialize Unified Log System
          if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
            try {
              await window.UnifiedLogAPI.initialize();
              window.Logger.info('✅ Unified Log System initialized for System Management', {
                page: 'page-initialization-configs',
              });
            } catch (error) {
              window.Logger.warn('⚠️ Failed to initialize Unified Log System:', error, {
                page: 'page-initialization-configs',
              });
            }
          }
        },
      ],
    },

    'server-monitor': {
      name: 'Server Monitor',

      packages: ['base', 'management', 'init-system'],

      requiredGlobals: ['NotificationSystem',
        'window.IconSystem', 'window.serverMonitor'],

      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🔧 Initializing Server Monitor...', {
            page: 'page-initialization-configs',
          });

          // Initialize server monitor if available
          if (window.serverMonitor) {
            window.Logger.info('✅ Server Monitor already initialized', {
              page: 'page-initialization-configs',
            });
          } else {
            window.Logger.info('⚠️ Server Monitor not available', {
              page: 'page-initialization-configs',
            });
          }

          window.Logger.info('✅ Server Monitor initialization completed', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },

    'external-data-dashboard': {
      name: 'External Data',

      packages: ['base', 'external-data', 'charts', 'logs', 'info-summary', 'init-system'],

      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.ExternalDataDashboard',
        'window.ExternalDataDashboardActions',
        'window.YahooFinanceService',
      ],

      // ← NEW: מטאדאטה
      description: 'דשבורד נתונים חיצוניים - Yahoo Finance וספקי נתונים אחרים',
      lastModified: '2025-10-19',
      pageType: 'dashboard',

      // ← NEW: אופטימיזציה
      preloadAssets: ['external-data'],
      cacheStrategy: 'aggressive',

      // קיים
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async () => {
          window.Logger.info('🌐 Initializing External Data...', {
            page: 'page-initialization-configs',
          });

          if (!window.externalDataDashboard && typeof window.ExternalDataDashboard === 'function') {
            window.externalDataDashboard = new window.ExternalDataDashboard();
          }

          if (window.externalDataDashboard && !window.externalDataDashboard.isInitialized) {
            await window.externalDataDashboard.init();
          }

          if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
            try {
              await window.UnifiedLogAPI.initialize();
              window.Logger.info('✅ Unified Log System initialized for External Data Dashboard', {
                page: 'page-initialization-configs',
              });
            } catch (error) {
              window.Logger.warn('⚠️ Failed to initialize Unified Log System:', error, {
                page: 'page-initialization-configs',
              });
            }
          }

          if (!window.ExternalDataDashboardActions) {
            window.Logger.warn('⚠️ ExternalDataDashboardActions not available', {
              page: 'page-initialization-configs',
            });
          }
        },
      ],
    },

    'notifications-center': {
      name: 'Notifications Center',
      packages: ['base', 'crud', 'logs', 'info-summary', 'init-system'],
      requiredGlobals: ['NotificationSystem',
        'window.IconSystem', 'window.initializeNotificationsCenter'],
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async () => {
          window.Logger.info('📬 Initializing Notifications Center...', {
            page: 'page-initialization-configs',
          });

          if (typeof window.initializeNotificationsCenter === 'function') {
            await window.initializeNotificationsCenter();
          } else if (typeof window.loadNotifications === 'function') {
            await window.loadNotifications();
          } else {
            window.Logger.warn('⚠️ Notifications Center initializer not found', {
              page: 'page-initialization-configs',
            });
          }
        },
      ],
    },
    'notifications-center.html': {
      name: 'Notifications Center HTML',
      packages: ['base', 'crud', 'logs', 'init-system'],
      requiredGlobals: ['NotificationSystem',
        'window.IconSystem', 'window.initializeNotificationsCenter'],
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async () => {
          window.Logger.info('📬 Initializing Notifications Center (HTML)...', {
            page: 'page-initialization-configs',
          });

          if (typeof window.initializeNotificationsCenter === 'function') {
            await window.initializeNotificationsCenter();
          } else if (typeof window.loadNotifications === 'function') {
            await window.loadNotifications();
          } else {
            window.Logger.warn('⚠️ Notifications Center initializer not found', {
              page: 'page-initialization-configs',
            });
          }
        },
      ],
    },

    'unified-logs-demo.html': {
      name: 'Unified Logs Demo',
      packages: ['base', 'logs', 'init-system'],
      requiredGlobals: ['NotificationSystem',
        'window.IconSystem', 'window.UnifiedLogAPI'],
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('📊 Initializing Unified Logs Demo...', {
            page: 'page-initialization-configs',
          });

          // Initialize Unified Log System
          if (window.UnifiedLogAPI) {
            try {
              await window.UnifiedLogAPI.initialize();
              window.Logger.info('✅ Unified Log System initialized for demo', {
                page: 'page-initialization-configs',
              });
            } catch (error) {
              window.Logger.warn('⚠️ Failed to initialize Unified Log System for demo:', error, {
                page: 'page-initialization-configs',
              });
            }
          }
        },
      ],
    },

    db_display: {
      name: 'Database Display',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'info-summary', 'init-system'],
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.loadDatabaseInfo',
        'window.loadUserPreferences',
        'window.initSystemCheck',
      ],
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🗄️ Initializing Database Display...', {
            page: 'page-initialization-configs',
          });

          if (typeof window.loadDatabaseInfo === 'function') {
            await window.loadDatabaseInfo();
          }
        },
      ],
    },

    research: {
      name: 'Research',
      description: 'עמוד מחקר שוק - כלים, ניתוחים ונתונים מהירים',
      lastModified: '2025-11-13',
      pageType: 'research',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'init-system'],
      requiredGlobals: ['NotificationSystem',
        'window.IconSystem', 'DataUtils', 'window.initializeResearchPage'],
      preloadAssets: ['research-data'],
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🔬 Initializing Research...', {
            page: 'page-initialization-configs',
          });

          if (typeof window.initializeResearchPage === 'function') {
            await window.initializeResearchPage();
          } else if (typeof window.initializeResearchTools === 'function') {
            await window.initializeResearchTools();
          } else {
            window.Logger.warn('⚠️ Research initializer not available', {
              page: 'page-initialization-configs',
            });
          }
        },
      ],
    },

    'background-tasks': {
      name: 'Background Tasks',
      packages: ['base', 'crud', 'logs', 'info-summary', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.startScheduler',
        'window.refreshBackgroundTasksLog',
      ],
      description: 'ניהול משימות רקע',
      lastModified: '2025-10-19',
      pageType: 'system',
      preloadAssets: ['background-tasks'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('⚙️ Initializing Background Tasks...', {
            page: 'page-initialization-configs',
          });
          if (typeof window.initializeBackgroundTasksLog === 'function') {
            window.initializeBackgroundTasksLog();
          }
        },
      ],
    },

    'test-header-only': {
      name: 'Header System Test',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'init-system'],
      requiredGlobals: ['NotificationSystem'],
      description: 'עמוד בדיקות לרכיבי ההדר המאוחדים',
      lastModified: '2025-11-14',
      pageType: 'development',
      preloadAssets: ['header-demo'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        () => {
          window.Logger.info('🧪 Initializing Header-only test page...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },

    'init-system-management': {
      name: 'Init System Management',
      packages: ['base', 'dev-tools', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'PackageManifest',
        'RuntimeValidator',
        'ScriptAnalyzer',
        'PageTemplateGenerator',
      ],
      description: 'ניהול מערכת האתחול - חבילות, ולידציה, כלי פיתוח',
      lastModified: '2025-10-19',
      pageType: 'development',
      preloadAssets: ['package-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        function () {
          window.Logger.info('🚀 Initializing Init System Management...', {
            page: 'page-initialization-configs',
          });
          // Init system management specific initialization
        },
      ],
    },

    // Cache Management
    'cache-management': {
      name: 'Cache Management',
      packages: ['base', 'logs', 'cache', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.cacheManagementPage',
        'window.refreshCacheStats',
      ],
      pageSpecificScripts: ['scripts/cache-management.js'],
      description: 'ניהול מטמון מערכת - ניקוי, אופטימיזציה וניטור',
      lastModified: '2025-10-19',
      pageType: 'system',
      preloadAssets: ['cache-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🗄️ Initializing Cache Management...', {
            page: 'page-initialization-configs',
          });
          if (typeof window.refreshCacheStats === 'function') {
            await window.refreshCacheStats();
          }
        },
      ],
    },

    // Conditions Test
    'conditions-test': {
      name: 'Conditions Test',
      packages: ['base', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.loadConditionsTest',
        'window.ConditionsTestManager',
      ],
      description: 'בדיקת תנאי מערכת - ולידציה ובדיקות',
      lastModified: '2025-10-19',
      pageType: 'testing',
      preloadAssets: ['conditions-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🧪 Initializing Conditions Test...', {
            page: 'page-initialization-configs',
          });
          if (typeof window.loadConditionsTest === 'function') {
            await window.loadConditionsTest();
          }
        },
      ],
    },

    // CRUD Testing Dashboard
    'crud-testing-dashboard': {
      name: 'CRUD Testing Dashboard',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'CRUDEnhancedTester',
        'window.runCRUDTests',
        'window.runAPITests',
        'window.runUITests',
      ],
      pageSpecificScripts: ['scripts/crud-testing-enhanced.js'],
      description: 'דשבורד בדיקות CRUD - בדיקות API ו-UI אוטומטיות',
      lastModified: '2025-10-26',
      pageType: 'development',
      preloadAssets: ['crud-test-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🧪 Initializing CRUD Testing Dashboard...', {
            page: 'page-initialization-configs',
          });

          // Initialize CRUD Enhanced Tester
          if (typeof window.CRUDEnhancedTester !== 'undefined') {
            window.crudTester = new window.CRUDEnhancedTester();
            window.Logger.info('✅ CRUD Enhanced Tester initialized', {
              page: 'page-initialization-configs',
            });
          }

          // Define global functions for CRUD testing
          window.runCRUDTests = function () {
            if (window.crudTester) {
              window.crudTester.runAllTests();
            }
          };

          window.runAPITests = function () {
            if (window.crudTester) {
              window.crudTester.runAPITests();
            }
          };

          window.runUITests = function () {
            if (window.crudTester) {
              window.crudTester.runUITests();
            }
          };

          window.Logger.info('✅ CRUD Testing Dashboard initialized successfully', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },

    // TradingView Lightweight Charts Test Page
    tradingview_test_page: {
      name: 'TradingView Lightweight Charts Test Page',
      packages: [
        'base',
        'system-management',
        'preferences',
        'charts',
        'tradingview-charts',
        'init-system',
      ],
      requiredGlobals: [        'window.IconSystem',

        'window.Logger',
        'window.TradingViewTheme',
        'window.TradingViewChartAdapter',
        'window.LightweightCharts',
        'window.PreferencesData',
        'window.PreferencesCore',
      ],
      description: 'דף בדיקה עבור אינטגרציית TradingView Lightweight Charts',
      lastModified: '2025-11-22',
      pageType: 'test',
      cacheStrategy: 'no-cache',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('📊 Initializing TradingView Test Page...', {
            page: 'page-initialization-configs',
          });

          // Initialize preferences with lazy loading (as per documentation)
          if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
            window.Logger.info('📄 Initializing preferences with lazy loading...', {
              page: 'page-initialization-configs',
            });
            
            try {
              await window.PreferencesCore.initializeWithLazyLoading();
              window.Logger.info('✅ Preferences initialized successfully', {
                page: 'page-initialization-configs',
              });
            } catch (error) {
              window.Logger.warn('⚠️ Preferences initialization failed (non-critical)', {
                page: 'page-initialization-configs',
                error: error?.message || error,
              });
            }
          } else {
            window.Logger.warn('⚠️ PreferencesCore.initializeWithLazyLoading not available', {
              page: 'page-initialization-configs',
            });
          }

          // Wait a bit for preferences to load
          await new Promise(resolve => setTimeout(resolve, 500));

          // Reload TradingView theme preferences after preferences are loaded
          if (window.TradingViewTheme && typeof window.TradingViewTheme.loadPreferences === 'function') {
            try {
              await window.TradingViewTheme.loadPreferences();
              window.Logger.info('✅ TradingView theme preferences reloaded', {
                page: 'page-initialization-configs',
              });
            } catch (error) {
              window.Logger.warn('⚠️ Failed to reload TradingView theme preferences', {
                page: 'page-initialization-configs',
                error: error?.message || error,
              });
            }
          }
        },
      ],
    },
  };

  // ===== CONFIGURATION HELPER FUNCTIONS =====

  /**
   * Get page configuration by page name
   * @param {string} pageName - Page name
   * @returns {Object} Page configuration
   */
  window.getPageConfig = function (pageName) {
    return (
      PAGE_CONFIGS[pageName] || {
        name: pageName,
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [],
      }
    );
  };

  /**
   * Get all available page configurations
   * @returns {Object} All page configurations
   */
  window.getAllPageConfigs = function () {
    return PAGE_CONFIGS;
  };

  /**
   * Check if page requires specific system
   * @param {string} pageName - Page name
   * @param {string} system - System name (filters, validation, tables)
   * @returns {boolean} Whether page requires the system
   */
  window.pageRequiresSystem = function (pageName, system) {
    const config = window.getPageConfig(pageName);

    switch (system) {
      case 'filters':
        return config.requiresFilters;
      case 'validation':
        return config.requiresValidation;
      case 'tables':
        return config.requiresTables;
      default:
        return false;
    }
  };

  /**
   * Get page initialization summary
   * @param {string} pageName - Page name
   * @returns {Object} Initialization summary
   */
  window.getPageInitSummary = function (pageName) {
    const config = window.getPageConfig(pageName);

    return {
      name: config.name,
      systems: {
        filters: config.requiresFilters,
        validation: config.requiresValidation,
        tables: config.requiresTables,
      },
      customInitializers: config.customInitializers.length,
      totalSystems:
        (config.requiresFilters ? 1 : 0) +
        (config.requiresValidation ? 1 : 0) +
        (config.requiresTables ? 1 : 0) +
        config.customInitializers.length,
    };
  };

  // ===== ADDITIONAL PAGE CONFIGS =====

  const ADDITIONAL_PAGE_CONFIGS = {
    'code-quality-dashboard': {
      name: 'Code Quality Dashboard',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.codeQualityDashboard',
        'window.LintStatusService',
      ],
      pageSpecificScripts: ['scripts/linter-realtime-monitor.js'],
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async () => {
          window.Logger.info('📊 Initializing Code Quality Dashboard...', {
            page: 'page-initialization-configs',
          });

          if (window.codeQualityDashboard && !window.codeQualityDashboard.isInitialized) {
            window.codeQualityDashboard.init();
          }

          if (typeof window.initializeLintMonitor === 'function') {
            await window.initializeLintMonitor();
          }
        },
      ],
    },
    // Test page for monitoring system
    'test-monitoring': {
      name: 'Test Monitoring Page',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataCollectionService',
        'UnifiedCacheManager',
        'Logger',
      ],
      description: 'עמוד בדיקה למערכת הניטור וכלי יצירת קוד טעינה',
      lastModified: '2025-01-31',
      pageType: 'test',
      preloadAssets: [],
      cacheStrategy: 'none',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [],
    },

    // Missing pages from documentation
    db_extradata: {
      name: 'Database Extra Data',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.initDatabaseExtraData',
        'window.loadExtraData',
        'window.loadUserPreferences',
        'window.initSystemCheck',
      ],
      description: 'תצוגת נתונים נוספים במסד הנתונים',
      lastModified: '2025-11-13',
      pageType: 'database',
      preloadAssets: ['extra-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🗄️ Initializing Database Extra Data...', {
            page: 'page-initialization-configs',
          });
          if (typeof window.loadExtraData === 'function') {
            await window.loadExtraData();
          }
        },
      ],
    },

    constraints: {
      name: 'System Constraints',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'init-system'],
      requiredGlobals: ['NotificationSystem',
        'window.IconSystem', 'window.loadConstraints', 'window.ConstraintManager', 'window.createActionsMenu'],
      description: 'ניהול אילוצי מערכת',
      lastModified: '2025-10-19',
      pageType: 'system',
      preloadAssets: ['constraints-data'],
      cacheStrategy: 'persistent',
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🔒 Initializing System Constraints...', {
            page: 'page-initialization-configs',
          });
          if (typeof window.loadConstraints === 'function') {
            await window.loadConstraints();
          }
        },
      ],
    },

    'css-management': {
      name: 'CSS Management',
      packages: ['base', 'init-system'],
      requiredGlobals: ['NotificationSystem',
        'window.IconSystem', 'window.loadCSSManagement', 'window.CSSManager'],
      description: 'ניהול CSS במערכת',
      lastModified: '2025-10-19',
      pageType: 'development',
      preloadAssets: ['css-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🎨 Initializing CSS Management...', {
            page: 'page-initialization-configs',
          });
          if (typeof window.loadCSSManagement === 'function') {
            await window.loadCSSManagement();
          }
        },
      ],
    },

    'dynamic-colors-display': {
      name: 'Dynamic Colors Display',
      packages: ['base', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.loadColorDisplay',
        'window.ColorSchemeSystem',
      ],
      description: 'תצוגת צבעים דינמיים',
      lastModified: '2025-10-19',
      pageType: 'utility',
      preloadAssets: ['color-schemes'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🌈 Initializing Dynamic Colors Display...', {
            page: 'page-initialization-configs',
          });
          if (typeof window.loadColorDisplay === 'function') {
            await window.loadColorDisplay();
          }
        },
      ],
    },

    designs: {
      name: 'Design Gallery',
      packages: ['base', 'init-system'],
      requiredGlobals: ['NotificationSystem',
        'window.IconSystem', 'window.loadDesigns', 'window.DesignGallery'],
      pageSpecificScripts: ['scripts/button-system-demo-core.js'],
      description: 'גלריית עיצובים',
      lastModified: '2025-10-19',
      pageType: 'utility',
      preloadAssets: ['designs-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🎭 Initializing Design Gallery...', {
            page: 'page-initialization-configs',
          });
          if (typeof window.loadDesigns === 'function') {
            await window.loadDesigns();
          }
        },
      ],
    },

    'chart-management': {
      name: 'Chart Management',
      packages: ['base', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.loadChartManagement',
        'window.ChartManagement',
      ],
      description: 'ניהול גרפים במערכת',
      lastModified: '2025-10-19',
      pageType: 'development',
      preloadAssets: ['chart-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('📈 Initializing Chart Management...', {
            page: 'page-initialization-configs',
          });
          if (typeof window.loadChartManagement === 'function') {
            await window.loadChartManagement();
          }
        },
      ],
    },

    // Init System Management
    'init-system-management': {
      name: 'Init System Management',
      packages: ['base', 'dev-tools', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'PackageManifest',
        'RuntimeValidator',
        'ScriptAnalyzer',
        'PageTemplateGenerator',
      ],
      description: 'ניהול מערכת האתחול - חבילות, ולידציה, כלי פיתוח',
      lastModified: '2025-10-19',
      pageType: 'development',
      preloadAssets: ['package-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        function () {
          window.Logger.info('🚀 Initializing Init System Management...', {
            page: 'page-initialization-configs',
          });
          // Init system management specific initialization
        },
      ],
    },

    // Cache Management
    'cache-management': {
      name: 'Cache Management',
      packages: ['base', 'logs', 'cache', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.cacheManagementPage',
        'window.refreshCacheStats',
      ],
      pageSpecificScripts: ['scripts/cache-management.js'],
      description: 'ניהול מטמון מערכת - ניקוי, אופטימיזציה וניטור',
      lastModified: '2025-10-19',
      pageType: 'system',
      preloadAssets: ['cache-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🗄️ Initializing Cache Management...', {
            page: 'page-initialization-configs',
          });
          if (typeof window.refreshCacheStats === 'function') {
            await window.refreshCacheStats();
          }
        },
      ],
    },

    // Conditions Test
    'conditions-test': {
      name: 'Conditions Test',
      packages: ['base', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.loadConditionsTest',
        'window.ConditionsTestManager',
      ],
      description: 'בדיקת תנאי מערכת - ולידציה ובדיקות',
      lastModified: '2025-10-19',
      pageType: 'testing',
      preloadAssets: ['conditions-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🧪 Initializing Conditions Test...', {
            page: 'page-initialization-configs',
          });
          if (typeof window.loadConditionsTest === 'function') {
            await window.loadConditionsTest();
          }
        },
      ],
    },

    // CRUD Testing Dashboard
    'crud-testing-dashboard': {
      name: 'CRUD Testing Dashboard',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'CRUDEnhancedTester',
        'window.runCRUDTests',
        'window.runAPITests',
        'window.runUITests',
      ],
      description: 'דשבורד בדיקות CRUD - בדיקות API ו-UI אוטומטיות',
      lastModified: '2025-10-26',
      pageType: 'development',
      preloadAssets: ['crud-test-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🧪 Initializing CRUD Testing Dashboard...', {
            page: 'page-initialization-configs',
          });

          // Initialize CRUD Enhanced Tester
          if (typeof window.CRUDEnhancedTester !== 'undefined') {
            window.crudTester = new window.CRUDEnhancedTester();
            window.Logger.info('✅ CRUD Enhanced Tester initialized', {
              page: 'page-initialization-configs',
            });
          }

          // Define global functions for CRUD testing
          window.runCRUDTests = function () {
            if (window.crudTester) {
              window.crudTester.runAllTests();
            }
          };

          window.runAPITests = function () {
            if (window.crudTester) {
              window.crudTester.runAPITests();
            }
          };

          window.runUITests = function () {
            if (window.crudTester) {
              window.crudTester.runUITests();
            }
          };

          window.Logger.info('✅ CRUD Testing Dashboard initialized successfully', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },

    // Trade History Page (Mockup)
    'trade-history-page': {
      name: 'Trade History Page',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'crud',
        'preferences',
        'entity-services',
        'tradingview-charts',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'TradingViewChartAdapter',
        'TradingViewTheme',
        'window.LightweightCharts',
        'window.tradeHistoryPage',
        'window.UnifiedCacheManager',
        'window.UnifiedAppInitializer',
      ],
      pageSpecificScripts: ['scripts/trade-history-page.js'],
      description: 'עמוד היסטוריית טרייד - מוקאפ עם גרפים TradingView',
      lastModified: '2025-01-29',
      pageType: 'mockup',
      preloadAssets: ['trades-data', 'executions-data'],
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('📊 Initializing Trade History Page via UnifiedAppInitializer...', {
            page: 'page-initialization-configs',
          });

          // Wait for tradeHistoryPage to be available
          if (!window.tradeHistoryPage || typeof window.tradeHistoryPage.initializePage !== 'function') {
            window.Logger.warn('⚠️ tradeHistoryPage.initializePage not available yet, waiting...', {
              page: 'page-initialization-configs',
            });
            
            // Wait up to 5 seconds for the script to load
            let retries = 0;
            while (!window.tradeHistoryPage || typeof window.tradeHistoryPage.initializePage !== 'function') {
              if (retries >= 50) {
                window.Logger.error('❌ tradeHistoryPage.initializePage not available after wait', {
                  page: 'page-initialization-configs',
                });
                return;
              }
              await new Promise(resolve => setTimeout(resolve, 100));
              retries++;
            }
          }

          // Call initializePage from trade-history-page.js
          try {
            await window.tradeHistoryPage.initializePage();
            window.Logger.info('✅ Trade History Page initialized via UnifiedAppInitializer', {
              page: 'page-initialization-configs',
            });
          } catch (error) {
            window.Logger.error('❌ Error initializing Trade History Page', {
              page: 'page-initialization-configs',
              error,
            });
            throw error;
          }
        },
      ],
    },

    'tradingview-widgets-showcase': {
      name: 'TradingView Widgets Showcase',
      packages: ['base', 'preferences', 'tradingview-widgets', 'init-system'],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'TradingViewWidgetsManager',
        'TradingViewWidgetsColors',
      ],
      description: 'תצוגת כל הווידג\'טים הרשמיים של TradingView (iFrame Widgets) עם תיאור הפרמטרים',
      lastModified: '2025-11-24',
      pageType: 'development',
      preloadAssets: [],
      cacheStrategy: 'none',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('🎯 Initializing TradingView Widgets Showcase...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },

    // Price History Page (Mockup)
    'price-history-page': {
      name: 'Price History Page',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'crud',
        'preferences',
        'entity-services',
        'tradingview-charts',
        'tradingview-widgets',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'TradingViewChartAdapter',
        'TradingViewTheme',
        'window.LightweightCharts',
        'TradingViewWidgetsManager',
        'TradingViewWidgetsColors',
        'window.priceHistoryPage',
      ],
      pageSpecificScripts: ['scripts/price-history-page.js'],
      description: 'עמוד היסטוריית מחירים - מוקאפ עם גרפים TradingView Lightweight Charts ו-TradingView Widgets',
      lastModified: '2025-11-24',
      pageType: 'mockup',
      preloadAssets: ['trades-data', 'executions-data'],
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('📊 Initializing Price History Page...', {
            page: 'page-initialization-configs',
          });

          // Wait for TradingView to be available
          if (typeof window.lightweightCharts === 'undefined') {
            window.Logger.warn('⚠️ TradingView Lightweight Charts not loaded yet', {
              page: 'page-initialization-configs',
            });
          }

          // Wait for TradingView Widgets Manager
          if (window.TradingViewWidgetsManager) {
            await window.TradingViewWidgetsManager.init();
          }
        },
      ],
    },

    // Portfolio State Page (Mockup)
    'portfolio-state-page': {
      name: 'Portfolio State Page',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'crud',
        'preferences',
        'entity-services',
        'tradingview-charts',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'TradingViewChartAdapter',
        'TradingViewTheme',
        'window.LightweightCharts',
        'window.portfolioStatePage',
      ],
      pageSpecificScripts: ['scripts/portfolio-state-page.js'],
      description: 'עמוד מצב תיק - מוקאפ עם גרפים TradingView Lightweight Charts',
      lastModified: '2025-11-24',
      pageType: 'mockup',
      preloadAssets: ['portfolio-data'],
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing Portfolio State Page...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },

    // Comparative Analysis Page (Mockup)
    'comparative-analysis-page': {
      name: 'Comparative Analysis Page',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'crud',
        'preferences',
        'entity-services',
        'tradingview-charts',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'TradingViewChartAdapter',
        'TradingViewTheme',
        'window.LightweightCharts',
        'window.comparativeAnalysisPage',
      ],
      pageSpecificScripts: ['scripts/comparative-analysis-page.js'],
      description: 'עמוד ניתוח השוואתי - מוקאפ עם גרפים TradingView Lightweight Charts',
      lastModified: '2025-11-24',
      pageType: 'mockup',
      preloadAssets: ['trades-data'],
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing Comparative Analysis Page...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },

    // Trading Journal Page (Mockup)
    'trading-journal-page': {
      name: 'Trading Journal Page',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'crud',
        'preferences',
        'entity-services',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.tradingJournalPage',
      ],
      pageSpecificScripts: ['scripts/trading-journal-page.js'],
      description: 'עמוד יומן מסחר - מוקאפ',
      lastModified: '2025-11-24',
      pageType: 'mockup',
      preloadAssets: ['journal-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing Trading Journal Page...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },

    // Strategy Analysis Page (Mockup)
    'strategy-analysis-page': {
      name: 'Strategy Analysis Page',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'crud',
        'preferences',
        'entity-services',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.strategyAnalysisPage',
      ],
      pageSpecificScripts: ['scripts/strategy-analysis-page.js'],
      description: 'עמוד ניתוח אסטרטגיות - מוקאפ',
      lastModified: '2025-11-24',
      pageType: 'mockup',
      preloadAssets: ['strategies-data'],
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing Strategy Analysis Page...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },

    // Economic Calendar Page (Mockup)
    'economic-calendar-page': {
      name: 'Economic Calendar Page',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'crud',
        'preferences',
        'entity-services',
        'tradingview-widgets',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'TradingViewWidgetsManager',
        'TradingViewWidgetsColors',
        'window.economicCalendarPage',
      ],
      pageSpecificScripts: ['scripts/economic-calendar-page.js'],
      description: 'עמוד לוח אירועים כלכליים - מוקאפ עם TradingView Widgets',
      lastModified: '2025-11-24',
      pageType: 'mockup',
      preloadAssets: ['calendar-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing Economic Calendar Page...', {
            page: 'page-initialization-configs',
          });
          
          // Wait for TradingViewWidgetsManager
          if (window.TradingViewWidgetsManager) {
            if (!window.TradingViewWidgetsManager._initialized) {
              await window.TradingViewWidgetsManager.init();
            }
          }
          
          // Wait for cache system
          if (window.cacheSystemReady !== undefined) {
            let waitCount = 0;
            while (!window.cacheSystemReady && waitCount < 50) {
              await new Promise(resolve => setTimeout(resolve, 100));
              waitCount++;
            }
          }
          
          // Wait for preferences
          let prefWaitCount = 0;
          while (!window.currentPreferences && !window.userPreferences && prefWaitCount < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            prefWaitCount++;
          }
          
          // Initialize widget if economicCalendarPage is available
          if (window.economicCalendarPage && typeof window.economicCalendarPage.initializeEconomicCalendarWidget === 'function') {
            await window.economicCalendarPage.initializeEconomicCalendarWidget();
          }
        },
      ],
    },

    // History Widget (Mockup)
    'history-widget': {
      name: 'History Widget',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'preferences',
        'tradingview-charts',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.historyWidget',
        'window.TradingViewChartAdapter',
        'window.TradingViewTheme',
        'window.FieldRendererService',
      ],
      pageSpecificScripts: ['scripts/history-widget.js'],
      description: 'ווידג\'ט היסטוריה - מוקאפ',
      lastModified: '2025-01-27',
      pageType: 'mockup',
      preloadAssets: [],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing History Widget...', {
            page: 'page-initialization-configs',
          });
          
          // Initialize widgets after systems are ready
          if (typeof window.historyWidget !== 'undefined' && typeof window.historyWidget.initializeWidgets === 'function') {
            try {
              await window.historyWidget.initializeWidgets();
            } catch (error) {
              window.Logger?.warn('Error initializing history widget widgets', {
                page: 'page-initialization-configs',
                error
              });
            }
          }
        },
      ],
    },

    // Emotional Tracking Widget (Mockup)
    'emotional-tracking-widget': {
      name: 'Emotional Tracking Widget',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'preferences',
        'tradingview-charts',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.emotionalTrackingWidget',
        'TradingViewChartAdapter',
        'TradingViewTheme',
        'window.LightweightCharts',
        'FieldRendererService',
      ],
      pageSpecificScripts: ['scripts/emotional-tracking-widget.js'],
      description: 'ווידג\'ט תיעוד רגשי - מוקאפ',
      lastModified: '2025-01-29',
      pageType: 'mockup',
      preloadAssets: [],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing Emotional Tracking Widget...', {
            page: 'page-initialization-configs',
          });

          // Wait for TradingView to be available
          if (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined') {
            window.Logger?.warn('⚠️ TradingView Lightweight Charts not loaded yet', {
              page: 'page-initialization-configs',
            });
          }

          // Initialize widgets after a short delay to ensure all systems are loaded
          if (window.emotionalTrackingWidget && typeof window.emotionalTrackingWidget.initializeWidgets === 'function') {
            setTimeout(() => {
              window.emotionalTrackingWidget.initializeWidgets();
            }, 500);
          }
        },
      ],
    },

    // Date Comparison Modal (Mockup)
    'date-comparison-modal': {
      name: 'Date Comparison Modal',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'preferences',
        'init-system',
        'charts',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.dateComparisonModal',
        'TradingViewChartAdapter',
        'UnifiedCacheManager',
        'FieldRendererService',
        'InfoSummarySystem',
        'PreferencesCore',
      ],
      pageSpecificScripts: ['scripts/date-comparison-modal.js'],
      description: 'מודל השוואת תאריכים - מוקאפ',
      lastModified: '2025-01-29',
      pageType: 'mockup',
      preloadAssets: [],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing Date Comparison Modal...', {
            page: 'page-initialization-configs',
          });
          
          // Wait for all required systems
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Initialize date comparison modal if available
          if (window.dateComparisonModal && typeof window.dateComparisonModal.initializePage === 'function') {
            await window.dateComparisonModal.initializePage();
          }
        },
      ],
    },

    // TradingView Test Page (Mockup)
    'tradingview-test-page': {
      name: 'TradingView Test Page',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'preferences',
        'tradingview-charts',
        'tradingview-widgets',
        'init-system',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'TradingViewChartAdapter',
        'TradingViewTheme',
        'window.LightweightCharts',
        'TradingViewWidgetsManager',
        'TradingViewWidgetsColors',
        'window.tradingviewTestPage',
      ],
      pageSpecificScripts: ['scripts/tradingview-test-page.js'],
      description: 'עמוד בדיקת TradingView - מוקאפ עם גרפים ו-ווידג\'טים',
      lastModified: '2025-11-24',
      pageType: 'mockup',
      preloadAssets: [],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing TradingView Test Page...', {
            page: 'page-initialization-configs',
          });
          if (window.TradingViewWidgetsManager) {
            await window.TradingViewWidgetsManager.init();
          }
        },
      ],
    },

    // Watch Lists Pages
    'watch-lists-page': {
      name: 'Watch Lists Page',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'crud',
        'entity-services',
        'watch-lists'
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.WatchListsDataService',
        'window.WatchListsUIService',
        'window.WatchListsPage',
        'window.HeaderSystem',
        'window.UnifiedTableSystem'
      ],
      pageSpecificScripts: ['scripts/watch-lists-page.js'],
      description: 'עמוד ניהול רשימות צפייה - מוקאפ',
      lastModified: '2025-11-26',
      pageType: 'mockup',
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      sectionsDefaultState: 'open',
      sectionDefaultStates: {
        'top': 'open',
        'watch-lists': 'open',
        'active-list': 'open',
        'flagged': 'closed'
      },
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing Watch Lists Page...', {
            page: 'page-initialization-configs',
          });

          // Wait for WatchListsPage to be available
          if (window.WatchListsPage && typeof window.WatchListsPage.init === 'function') {
            await window.WatchListsPage.init();
          }
        },
      ],
    },

    'watch-list-modal': {
      name: 'Watch List Modal',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'watch-lists'
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.ModalManagerV2',
        'window.WatchListModal',
        'window.DefaultValueSetter'
      ],
      pageSpecificScripts: ['scripts/watch-list-modal.js'],
      description: 'מודל Add/Edit Watch List - מוקאפ',
      lastModified: '2025-11-26',
      pageType: 'mockup',
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing Watch List Modal...', {
            page: 'page-initialization-configs',
          });

          if (window.WatchListModal && typeof window.WatchListModal.init === 'function') {
            window.WatchListModal.init();
          }
        },
      ],
    },

    'add-ticker-modal': {
      name: 'Add Ticker Modal',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'watch-lists'
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.ModalManagerV2',
        'window.AddTickerModal',
        'window.SelectPopulatorService'
      ],
      pageSpecificScripts: ['scripts/add-ticker-modal.js'],
      description: 'מודל הוספת טיקר - מוקאפ',
      lastModified: '2025-11-26',
      pageType: 'mockup',
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing Add Ticker Modal...', {
            page: 'page-initialization-configs',
          });

          if (window.AddTickerModal && typeof window.AddTickerModal.init === 'function') {
            window.AddTickerModal.init();
          }
        },
      ],
    },

    'flag-quick-action': {
      name: 'Flag Quick Action',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'watch-lists'
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.FlagQuickAction',
        'window.WatchListsUIService'
      ],
      pageSpecificScripts: ['scripts/flag-quick-action.js'],
      description: 'Quick Action - פלטת דגלים - מוקאפ',
      lastModified: '2025-11-26',
      pageType: 'mockup',
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing Flag Quick Action...', {
            page: 'page-initialization-configs',
          });

          if (window.FlagQuickAction && typeof window.FlagQuickAction.init === 'function') {
            window.FlagQuickAction.init();
          }
        },
      ],
    },

    'ai-analysis': {
      name: 'AI Analysis',
      packages: [
        'base',
        'services',
        'ui-advanced',
        'modules',
        'preferences',
        'entity-services',
        'ai-analysis',
        'init-system'
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.Logger',
        'window.AIAnalysisData',
        'window.AIAnalysisManager',
        'window.AITemplateSelector',
        'window.AIResultRenderer',
        'window.AINotesIntegration',
        'window.AIExportService',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.FieldRendererService',
        'window.NotesData',
        'window.ModalManagerV2',
        'window.CRUDResponseHandler'
      ],
      description: 'ניתוח AI - יצירת ניתוחים באמצעות מנועי LLM',
      lastModified: '2025-01-28',
      pageType: 'feature',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('🤖 Initializing AI Analysis Page...', {
            page: 'page-initialization-configs',
          });

          // Wait a bit for all scripts to be fully loaded
          await new Promise(resolve => setTimeout(resolve, 300));

          // Initialize initSystemCheck if available (for monitoring button)
          if (window.initSystemCheck && typeof window.initSystemCheck.init === 'function') {
            if (!window.initSystemCheck.isInitialized) {
              window.initSystemCheck.init();
              window.Logger?.info('✅ InitSystemCheck initialized', {
                page: 'page-initialization-configs',
              });
            }
          }

          // AIAnalysisManager will auto-initialize
          if (window.AIAnalysisManager && typeof window.AIAnalysisManager.init === 'function') {
            if (!window.AIAnalysisManager.initialized) {
              await window.AIAnalysisManager.init();
            } else {
              window.Logger?.info('✅ AIAnalysisManager already initialized', {
                page: 'page-initialization-configs',
              });
            }
          } else {
            window.Logger?.warn('⚠️ AIAnalysisManager not available', {
              page: 'page-initialization-configs',
            });
          }
        },
      ],
    },
  };

  // ===== GLOBAL EXPORT =====

  // Merge additional configs
  Object.assign(PAGE_CONFIGS, ADDITIONAL_PAGE_CONFIGS);

  const CACHE_CONTROL_GLOBAL = 'window.CacheControlMenu';
  Object.values(PAGE_CONFIGS).forEach(config => {
    if (Array.isArray(config.requiredGlobals)) {
      if (!config.requiredGlobals.includes(CACHE_CONTROL_GLOBAL)) {
        config.requiredGlobals.push(CACHE_CONTROL_GLOBAL);
      }
    } else {
      config.requiredGlobals = [CACHE_CONTROL_GLOBAL];
    }
  });

  window.PAGE_CONFIGS = PAGE_CONFIGS;
  window.PAGE_CONFIGS.__SOURCE = 'page-initialization-configs';
  window.pageInitializationConfigs = PAGE_CONFIGS;
  // Also set PAGE_INITIALIZATION_CONFIGS for backward compatibility (used by check-pages-loading.js and package-manifest.js)
  window.PAGE_INITIALIZATION_CONFIGS = PAGE_CONFIGS;
  console.log('✅ PAGE_CONFIGS loaded, trading_accounts exists:', !!PAGE_CONFIGS.trading_accounts);
} else {
  // אם PAGE_CONFIGS כבר הוגדר, נמזג רק את הקונפיגים החדשים
  if (typeof PAGE_CONFIGS !== 'undefined') {
    Object.assign(window.PAGE_CONFIGS, PAGE_CONFIGS);
  }
}
