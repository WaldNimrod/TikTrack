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

console.log('[PAGE-INIT] page-initialization-configs.js loaded');

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
 * - Management Interface: /init_system_management
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

const pageInitializationConfigs = {
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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'helper', // Required for LinkedItemsService
        'ui-advanced',
        'modules', // Core UI modules (no modal dependencies per Option 1)
        'crud',
        'preferences',
        // 'entity-services', // Temporarily removed to fix script loading issues
        'entity-details',
        'info-summary',
        'watch-lists', // Required for dashboard-widgets
        'dashboard-widgets', // Dashboard widgets including WatchListsWidget
        'tradingview-widgets', // Required for TickerChartWidget mini charts
        'conditions', // Conditions System
        'init-system',
      ],
      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        'NotificationSystem',
        'DataUtils',
        'window.Logger',
        'window.CacheSyncManager',
        'window.IconSystem',
        'window.DashboardData',
        'window.loadDashboardData',
        'window.RecentItemsWidget',
        'window.UnifiedPendingActionsWidget',
        'window.TagWidget',
        'window.TickerListWidget', // Ticker List Widget
        'window.TickerChartWidget', // Ticker Chart Widget
        'window.TradingViewWidgetsFactory', // TradingView Widgets Factory (required for TickerChartWidget)
        'window.WatchListsWidget', // Watch Lists Widget
        'window.conditionsInitializer', // Conditions System
        'window.ConditionsUIManager', // Conditions System
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        'window.CRUDResponseHandler', // CRUD Response Handler
        'window.LinkedItemsService', // Linked Items System
        'window.loadLinkedItemsData', // Linked Items System
        'window.UnifiedTableSystem', // Unified Table System
        'window.PaginationSystem', // Pagination System
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
          window.Logger?.info?.('🔵🔵🔵 CUSTOM INITIALIZER STARTED for index page', {
            page: 'page-initialization-configs'
          });

          // ===== AUTH GUARD WITH RETRY LOGIC (Fix Pack 5 Phase 3) =====
          await ensureAuthenticatedForPage('index');

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

          // Initialize ticker widgets
          if (window.TickerListWidget) {
            try {
              window.TickerListWidget.init('tickerListWidgetContainer', {
                maxItems: 5,
                defaultTab: 'active'
              });
            } catch (error) {
              window.Logger?.error?.('❌ Error initializing TickerListWidget', { error: error.message, stack: error.stack, page: 'page-initialization-configs' });
            }
          }
          
          if (window.TickerChartWidget) {
            try {
              window.TickerChartWidget.init('tickerChartWidgetContainer', {
                maxItems: 3
              });
            } catch (error) {
              window.Logger?.error?.('❌ Error initializing TickerChartWidget', { error: error.message, stack: error.stack, page: 'page-initialization-configs' });
            }
          } else {
            window.Logger?.warn?.('⚠️ TickerChartWidget not available', { page: 'page-initialization-configs' });
          }

          // Initialize watch lists widget
          if (window.WatchListsWidget) {
            try {
              await window.WatchListsWidget.init('watchListsWidgetContainer', {
                maxItems: 10
              });
            } catch (error) {
              window.Logger?.error?.('❌ Error initializing WatchListsWidget', { error: error.message, stack: error.stack, page: 'page-initialization-configs' });
            }
          } else {
            window.Logger?.warn?.('⚠️ WatchListsWidget not available', { page: 'page-initialization-configs' });
          }

          // Initialize positions & portfolio system
          window.Logger?.info?.('🔵 About to initialize positions portfolio...', { page: 'page-initialization-configs' });
          if (typeof window.initPositionsPortfolio === 'function') {
            try {
              await window.initPositionsPortfolio(false); // Don't auto-select account on home page
              window.Logger?.info?.('🔵 Positions portfolio initialized', { page: 'page-initialization-configs' });
            } catch (error) {
              window.Logger?.warn('⚠️ Error initializing positions portfolio:', error, {
                page: 'page-initialization-configs',
              });
            }
          }

          // Initialize unified tag widget
          if (typeof window.TagWidget !== 'undefined' && typeof window.TagWidget.init === 'function') {
            try {
              // Initialize with default configuration: min 1 row, max 3 rows
              window.TagWidget.init('tagWidgetContainer', {
                minRows: 1,
                maxRows: 3,
                rowHeight: 20
              });
            } catch (error) {
              window.Logger?.warn('⚠️ Error initializing TagWidget:', error, {
                page: 'page-initialization-configs',
              });
            }
          }

          // Initialize unified recent items widget
          if (typeof window.RecentItemsWidget !== 'undefined' && typeof window.RecentItemsWidget.init === 'function') {
            try {
              window.RecentItemsWidget.init('recentItemsWidgetContainer', {
                defaultTab: 'trades',
                maxItems: 4 // Maximum number of items to display per tab (limited to 4 for consistent height)
              });
            } catch (error) {
              window.Logger?.warn('⚠️ Error initializing RecentItemsWidget:', error, {
                page: 'page-initialization-configs',
              });
            }
          }

          // Initialize unified pending actions widget
          try {
            if (typeof window.UnifiedPendingActionsWidget !== 'undefined' && typeof window.UnifiedPendingActionsWidget.init === 'function') {
              await window.UnifiedPendingActionsWidget.init('unifiedPendingActionsWidgetContainer', {
                defaultItemsLimit: 4,
                defaultAction: 'assign',
                defaultEntity: 'plans'
              });
            } else {
              window.Logger?.error?.('🔴🔴🔴 UnifiedPendingActionsWidget not available!', {
                WidgetExists: typeof window.UnifiedPendingActionsWidget !== 'undefined',
                hasInit: typeof window.UnifiedPendingActionsWidget?.init === 'function',
                UnifiedPendingActionsWidgetType: typeof window.UnifiedPendingActionsWidget,
                page: 'page-initialization-configs',
              });
            }
          } catch (error) {
            window.Logger?.error?.('🔴🔴🔴 ERROR initializing UnifiedPendingActionsWidget:', {
              error: error.message,
              errorStack: error.stack,
              page: 'page-initialization-configs',
            });
          }
          
          // Equalize widget heights after all widgets are initialized
          // Wait a bit for widgets to render their content
          setTimeout(() => {
            if (typeof window.equalizeWidgetHeights === 'function') {
              window.equalizeWidgetHeights();
            }
          }, 1500);
        },
      ],
    },

    'tag_management': {
      name: 'Tag Management',
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
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
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.Logger',
        'window.TagService',
        'window.TagUIManager',
        'window.TagManagementPage'
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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'crud',
        'preferences',
        'validation',
        // REMOVED: 'entity-details' - Not needed for preferences page
        'info-summary', // Required for Info Summary tests (has config in INFO_SUMMARY_CONFIGS)
        // REMOVED: 'dashboard-widgets' - Not needed for preferences page
        // REMOVED: 'conditions' - Not needed for preferences page
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
        'window.InfoSummarySystem', // Required for Info Summary tests (has config in INFO_SUMMARY_CONFIGS)
        // REMOVED: 'window.conditionsInitializer' - Not needed for preferences page
        // REMOVED: 'window.ConditionsUIManager' - Not needed for preferences page
        'window.LinkedItemsService', // Linked Items Service
        'window.CRUDResponseHandler', // CRUD Response Handler
        'window.createActionsMenu', // Actions Menu Toolkit
        'window.PaginationSystem', // Pagination System
        // REMOVED: 'window.showEntityDetails' - Not needed for preferences page
        // REMOVED: 'window.PendingTradePlanWidget' - Not needed for preferences page
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        // REMOVED: 'window.ConditionsSummaryRenderer' - Not needed for preferences page
      // ← NEW: מטאדאטה
      ],
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

      customInitializers: [
        async pageConfig => {
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('preferences');

          // Preferences page initialization is handled by core-systems.js
          // No additional initialization needed here
        },
      ],
    },

    'user-profile': {
      name: 'User Profile',
      description: 'ניהול פרופיל משתמש - הגדרות אישיות, SMTP, AI Analysis',
      lastModified: '2025-02-02',
      pageType: 'management',
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'entity-details',
        'info-summary',
        'dashboard-widgets',
        'conditions',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.Logger',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.TableSortValueAdapter',
        'window.LinkedItemsService',
        'window.CRUDResponseHandler',
        'window.createActionsMenu',
        'window.InfoSummarySystem',
        'window.PaginationSystem',
        'window.showEntityDetails',
        'window.conditionsInitializer',
        'window.ConditionsUIManager',
        'window.PendingTradePlanWidget',
        'window.TikTrackAuth',
        'window.UserProfilePage',
        'window.AIAnalysisManager'
      ],
      pageSpecificScripts: [
        'scripts/user-profile.js',
        'scripts/user-profile-ai-analysis.js',
      ],
      preloadAssets: ['user-profile-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          console.log('[page-init] User Profile customInitializer STARTED');
          // region agent log - customInitializers entry
          fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              location: 'trading-ui/scripts/page-initialization-configs.js:customInitializers:user-profile',
              message: 'User Profile customInitializers started',
              data: {
                hasAuthToken: !!window.authToken,
                hasCurrentUser: !!window.currentUser,
                currentUserId: window.currentUser?.id,
                documentReadyState: document.readyState,
                timestamp: Date.now()
              },
              sessionId: 'bootstrap_auth_debug',
              runId: 'user_profile_redirect_fix',
              hypothesisId: 'customInitializers_timing'
            })
          }).catch(() => {});
          // endregion

          window.Logger?.info('👤 Initializing User Profile Page...', { page: 'page-initialization-configs' });

          // ===== AUTH GUARD WITH RETRY LOGIC (Option 1 compliance) =====
          await ensureAuthenticatedForPage('user-profile');

          // region agent log - after auth guard
          fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:user-profile-customInitializer:after-auth',message:'auth guard passed, continuing initialization',data:{page:'user-profile',hasAuthToken:!!window.authToken,hasCurrentUser:!!window.currentUser},sessionId:'debug-session',runId:'user_profile_loop_fix',hypothesisId:'H1_multiple_calls',timestamp:Date.now()})}).catch(()=>{});
          // endregion

          // Initialize User Profile Page
          if (window.UserProfilePage && typeof window.UserProfilePage.init === 'function') {
            await window.UserProfilePage.init();
          }
          
          // Initialize AI Analysis Manager (from user-profile-ai-analysis.js)
          if (window.AIAnalysisManager && typeof window.AIAnalysisManager.init === 'function') {
            if (!window.AIAnalysisManager.initialized) {
              await window.AIAnalysisManager.init();
            }
          }
        },
      ],
    },

    'user-management': {
      name: 'User Management',
      description: 'ניהול משתמשים - CRUD, סטטיסטיקות וטבלת משתמשים',
      lastModified: '2025-12-28',
      pageType: 'management',
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'entity-details',
        'info-summary',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.Logger',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.TableSortValueAdapter',
        'window.LinkedItemsService',
        'window.CRUDResponseHandler',
        'window.createActionsMenu',
        'window.InfoSummarySystem',
        'window.PaginationSystem',
        'window.showEntityDetails',
        'window.TikTrackAuth',
        'window.UserManagementPage'
      ],
      pageSpecificScripts: [
        'scripts/user-management.js',
      ],
      preloadAssets: ['user-management-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('👥 Initializing User Management Page...', { page: 'page-initialization-configs' });


          // Initialize User Management Page - wait if not loaded yet
          if (window.UserManagementPage && typeof window.UserManagementPage.init === 'function') {
            await window.UserManagementPage.init();
          } else {
            // Wait for UserManagementPage to load
            for (let i = 0; i < 50; i++) {
              await new Promise(resolve => setTimeout(resolve, 100));
              if (window.UserManagementPage && typeof window.UserManagementPage.init === 'function') {
                await window.UserManagementPage.init();
                break;
              }
            }
          }
        },
      ],
    },

    // Legacy entry (kept for compatibility)
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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
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
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        'window.CRUDResponseHandler', // CRUD Response Handler
        'window.LinkedItemsService', // Linked Items System
        'window.loadLinkedItemsData', // Linked Items System
        'window.UnifiedTableSystem', // Unified Table System
        'window.PaginationSystem', // Pagination System
      // ← NEW: מטאדאטה
      ],
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
          // ===== AUTH GUARD WITH RETRY LOGIC (Fix Pack 5 Phase 3) =====
          await ensureAuthenticatedForPage('trades');

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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
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
        'window.ExecutionsData',
        'window.executionsModalConfig',
        'window.SelectPopulatorService',
        'window.tickerService',
        'window.loadUserPreferences',
        'window.RichTextEditorService',
        'window.Quill',
        'window.DOMPurify',
      // ← NEW: מטאדאטה
      ],
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

          // Use window.loadExecutionsData wrapper which updates allExecutions and renders table
          if (typeof window.loadExecutionsData === 'function') {
            window.Logger.info('📥 Calling window.loadExecutionsData...', {
              page: 'page-initialization-configs',
            });
            try {
              await window.loadExecutionsData();
              window.Logger.info('✅ window.loadExecutionsData completed', {
                page: 'page-initialization-configs',
              });
            } catch (error) {
              window.Logger.error('❌ window.loadExecutionsData failed', {
                error: error?.message,
                stack: error?.stack,
                page: 'page-initialization-configs',
              });
            }
          } else {
            window.Logger.warn('⚠️ window.loadExecutionsData is not available', {
              loadExecutionsDataExists: typeof window.loadExecutionsData,
              ExecutionsDataExists: !!window.ExecutionsData,
              page: 'page-initialization-configs',
            });
          }

          // Initialize executions page (sets up preloading and lazy loading systems)
          if (typeof window.initializeExecutionsPage === 'function') {
            window.Logger.info('📥 Calling window.initializeExecutionsPage...', {
              page: 'page-initialization-configs',
            });
            try {
              await window.initializeExecutionsPage();
              window.Logger.info('✅ window.initializeExecutionsPage completed', {
                page: 'page-initialization-configs',
              });
            } catch (error) {
              window.Logger.error('❌ window.initializeExecutionsPage failed', {
                error: error?.message,
                stack: error?.stack,
                page: 'page-initialization-configs',
              });
            }
          } else {
            window.Logger.warn('⚠️ window.initializeExecutionsPage is not available', {
              initializeExecutionsPageExists: typeof window.initializeExecutionsPage,
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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
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
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.Logger',
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
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('data_import');

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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
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
        'window.TradePlansData',  // Required for trade-plan-service.js
        'window.loadTradePlansData',
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

          // Wait for trade_plans.js to load and override window.loadTradePlansData
          // Retry a few times if page script hasn't loaded yet
          let retries = 5;
          while (retries > 0 && typeof window.loadTradePlansDataPage !== 'function') {
            await new Promise(resolve => setTimeout(resolve, 200));
            retries--;
          }

          // Use page-specific loadTradePlansData if available (updates table)
          // Otherwise fallback to service version
          if (typeof window.loadTradePlansDataPage === 'function') {
            // Page-specific version handles everything including table update
            await window.loadTradePlansDataPage();
          } else if (typeof window.loadTradePlansData === 'function') {
            // Fallback to service version with cache guard
            if (window.CacheTTLGuard?.ensure) {
              await window.CacheTTLGuard.ensure('trade-plans-data', window.loadTradePlansData);
            } else {
              await window.loadTradePlansData();
            }
            // After loading, try to update table if trade_plans.js loaded
            if (typeof window.updateTradePlansTable === 'function' && window.tradePlansData) {
              window.updateTradePlansTable(window.tradePlansData);
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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
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
        'window.alertsModalConfig',
        'window.RichTextEditorService',
        'window.Quill',
        'window.DOMPurify',
        'window.conditionsCRUDManager',
        'window.conditionsFormGenerator',
        'window.ConditionsUIManager',
        'window.ConditionsModalController',
        'window.conditionsModalConfig',
      // ← NEW: מטאדאטה
      ],
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
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('alerts');

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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'validation',
        'entity-details',
        'entity-services',
        'info-summary',
        'conditions', // Conditions System
        'init-system',
      ],
      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.loadTradingAccountsDataForTradingAccountsPage',
        'window.tradingAccountsModalConfig',
        'window.TagUIManager',
        'window.RichTextEditorService',
        'window.Quill',
        'window.DOMPurify',
        'window.conditionsInitializer', // Conditions System
        'window.ConditionsUIManager', // Conditions System
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
      // ← NEW: מטאדאטה
      ],
      description: 'ניהול חשבונות מסחר - הוספה, עריכה ומעקב חשבונות',
      lastModified: '2025-10-19',
      pageType: 'crud',

      // ← NEW: אופטימיזציה
      // Use the correct cache key: 'trading-accounts-data' (primary) with fallback to 'accounts-data' (legacy)
      preloadAssets: ['trading-accounts-data', 'accounts-data'],
      cacheStrategy: 'aggressive',

      // ← NEW: Section default states
      // Top section and main table load open, other sections load closed (lazy loading)
      sectionsDefaultState: 'open', // Default for all sections
      sectionDefaultStates: {
        'top': 'open',                          // Always open
        'main': 'open',                         // Always open
        'account-activity-summary': 'closed',   // Closed, parallel loading
        'account-activity-table': 'closed',     // Closed, parallel loading
        'positions-portfolio': 'closed'         // Closed, parallel loading
      },

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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'validation',
        'entity-services',
        'entity-details',
        'info-summary',
        'conditions', // Conditions System
        'init-system',
      ],
      requiredGlobals: [

        'NotificationSystem',
        'window.IconSystem', // from base package
        'DataUtils', // from services package
        'window.loadCashFlowsData',
        'window.cashFlowModalConfig',
        'window.RichTextEditorService',
        'window.Quill',
        'window.DOMPurify',
        'window.SelectPopulatorService', // Data Collection Service
        'window.DataCollectionService', // Data Collection Service
        'window.DefaultValueSetter', // Data Collection Service
        'window.TableSortValueAdapter', // Data Collection Service
        'window.conditionsInitializer', // Conditions System
        'window.ConditionsUIManager', // Conditions System
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
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
        'conditions', // Conditions System
        'init-system',
      ],
      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'ExternalDataService',
        'window.loadTickersData',
        'window.tickersModalConfig',
        'window.conditionsInitializer', // Conditions System
        'window.ConditionsUIManager', // Conditions System
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
      // ← NEW: מטאדאטה
      ],
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

    'ticker-dashboard': {
      name: 'Ticker Dashboard',

      // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'external-data',
        'entity-services',
        'entity-details',
        'info-summary',
        'tradingview-charts', // Required for price chart
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'ExternalDataService',
        'window.TickerDashboardData',
        'window.tickerDashboard',
        'window.TradingViewChartAdapter',
        'window.FieldRendererService',
        'window.LinkedItemsService',
      ],
      description: 'דשבורד טיקר מורחב - גרפים, KPI, מדדים טכניים ופעילות משתמש',
      lastModified: '2025-01-28',
      pageType: 'dashboard',

      preloadAssets: ['ticker-dashboard-data'],
      cacheStrategy: 'aggressive',

      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('ticker-dashboard');

          window.Logger.info('📊 Initializing Ticker Dashboard...', { page: 'page-initialization-configs' });

          // Note: HeaderSystem is already initialized by core-systems.js in manualInitialization
          // No need to initialize it again here to avoid duplicate initialization warnings

          // Initialize Ticker Dashboard
          if (typeof window.tickerDashboard?.init === 'function') {
            window.Logger.info('📊 Calling window.tickerDashboard.init()...', { page: 'page-initialization-configs' });
            await window.tickerDashboard.init();
            window.Logger.info('✅ window.tickerDashboard.init() completed', { page: 'page-initialization-configs' });
          } else {
            window.Logger.error('❌ window.tickerDashboard.init is not a function', { 
              tickerDashboardExists: !!window.tickerDashboard,
              page: 'page-initialization-configs' 
            });
          }
        },
      ],
    },
    // Alias for ticker_dashboard.html (underscore instead of hyphen)
    // 'ticker_dashboard': pageInitializationConfigs['ticker-dashboard'], // Moved to after pageInitializationConfigs is defined

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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'validation',
        'entity-services',
        'entity-details',
        'info-summary',
        'helper', // Required for notes.js (loadNotesData)
        'init-system',
      ],
      // ← NEW: בדיקות תקינות
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.NotesData',
        'window.loadNotesData',
        'window.notesModalConfig',
        'window.RichTextEditorService',
        'window.Quill',
        'window.DOMPurify',
        'window.ConditionsSummaryRenderer', // Conditions Summary Renderer
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        'window.CRUDResponseHandler', // CRUD Response Handler
        'window.LinkedItemsService', // Linked Items System
        'window.loadLinkedItemsData', // Linked Items System
        'window.UnifiedTableSystem', // Unified Table System
        'window.PaginationSystem', // Pagination System
      ],
      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          console.log('📝 [page-initialization-configs] Notes customInitializer started');

          // Wait for loadNotesData to be available (for bundle support)
          // Improved wait logic: faster polling at start, then slower
          let waitCount = 0;
          const maxWait = 100; // 10 seconds max (100 * 100ms) - increased from 5 seconds
          const fastPollInterval = 50; // 50ms for first 20 checks (1 second)
          const slowPollInterval = 100; // 100ms for remaining checks
          
          while (typeof window.loadNotesData !== 'function' && waitCount < maxWait) {
            const interval = waitCount < 20 ? fastPollInterval : slowPollInterval;
            await new Promise(resolve => setTimeout(resolve, interval));
            waitCount++;
          }

          // Use direct function call for notes page
          if (typeof window.loadNotesData === 'function') {
            window.Logger.info('📝 [page-initialization-configs] Initializing Notes via loadNotesData...', { page: 'page-initialization-configs' });
            try {
              await window.loadNotesData();
              window.Logger.info('✅ [page-initialization-configs] Notes data loaded successfully', { page: 'page-initialization-configs' });
            } catch (error) {
              window.Logger.warn('⚠️ [page-initialization-configs] Error in loadNotesData (will continue without notes)', { error: error?.message, stack: error?.stack, page: 'page-initialization-configs' });
            }
          } else {
            // Fallback: try to use NotesData service if available
            if (typeof window.NotesData?.loadNotesData === 'function') {
              window.Logger.info('📝 [page-initialization-configs] Using NotesData service as fallback...', { page: 'page-initialization-configs' });
              try {
                await window.NotesData.loadNotesData();
                window.Logger.info('✅ [page-initialization-configs] Notes data loaded via service', { page: 'page-initialization-configs' });
              } catch (error) {
                window.Logger.warn('⚠️ [page-initialization-configs] Error loading notes via service (will continue without notes)', { error: error?.message, page: 'page-initialization-configs' });
              }
            } else {
              window.Logger.warn('⚠️ [page-initialization-configs] loadNotesData function not available (may load later or page may work without it)', { 
                loadNotesDataType: typeof window.loadNotesData,
                notesDataType: typeof window.NotesData,
                waitTime: waitCount * 100,
                page: 'page-initialization-configs' 
              });
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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'conditions',
        'dashboard-widgets',
        'info-summary',
        'external-data',
        'logs',
        'cache',
        'system-management',
        'management',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.systemManagement',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.LinkedItemsService',
        'window.CRUDResponseHandler',
        'window.conditionsInitializer',
        'window.ConditionsUIManager',
        'window.PendingTradePlanWidget',
        'window.InfoSummarySystem',
        'window.PaginationSystem',
      // ← NEW: מטאדאטה
      ],
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
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('system-management');

          window.Logger.info('🔧 Initializing System Management...', {
            page: 'page-initialization-configs',
          });

          // Initialize SystemManagement class if available
          if (typeof window.SystemManagement !== 'undefined') {
            try {
              // Wait a bit for DOM to be fully ready
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Check if instance already exists (from DOMContentLoaded)
              if (!window.systemManagement) {
                window.systemManagement = new window.SystemManagement();
              }
              
              // Initialize if not already initialized
              if (window.systemManagement && !window.systemManagement.isInitialized) {
                window.systemManagement.init();
                window.Logger.info('✅ SystemManagement initialized successfully', {
                  page: 'page-initialization-configs',
                });
              } else if (window.systemManagement && window.systemManagement.isInitialized) {
                window.Logger.info('✅ SystemManagement already initialized', {
                  page: 'page-initialization-configs',
                });
              }
            } catch (error) {
              window.Logger.error('❌ Failed to initialize SystemManagement:', error, {
                page: 'page-initialization-configs',
              });
            }
          } else {
            window.Logger.warn('⚠️ SystemManagement class not found', {
              page: 'page-initialization-configs',
            });
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

      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'conditions',
        'dashboard-widgets',
        'info-summary',
        'management',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.serverMonitor',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.LinkedItemsService',
        'window.CRUDResponseHandler',
        'window.conditionsInitializer',
        'window.ConditionsUIManager',
        'window.PendingTradePlanWidget',
        'window.InfoSummarySystem',
        'window.PaginationSystem',
      ],
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('server-monitor');

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

      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'conditions',
        'dashboard-widgets',
        'external-data',
        'charts',
        'logs',
        'info-summary',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.ExternalDataDashboard',
        'window.ExternalDataDashboardActions',
        'window.YahooFinanceService',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.CRUDResponseHandler',
        'window.conditionsInitializer',
        'window.ConditionsUIManager',
        'window.PaginationSystem',
      // ← NEW: מטאדאטה
      ],
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
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'conditions',
        'dashboard-widgets',
        'logs',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.LinkedItemsService',
        'window.CRUDResponseHandler',
        'window.conditionsInitializer',
        'window.ConditionsUIManager',
        'window.PendingTradePlanWidget',
        'window.PaginationSystem',
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.initializeNotificationsCenter'
      ],
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async () => {
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('notifications-center');

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
    'notifications_center.html': {
      name: 'Notifications Center HTML',
      packages: ['base', 'crud', 'logs', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        'NotificationSystem',
        'window.IconSystem',
        'window.initializeNotificationsCenter'
      ],
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

    trades_formatted: {
      name: 'Trades Formatted',
      packages: ['base', 'auth', 'services', 'ui-advanced', 'modules', 'crud', 'preferences', 'entity-services', 'entity-details', 'info-summary', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        'NotificationSystem',
        'window.IconSystem',
        'window.UnifiedTableSystem',
        'window.FieldRendererService',
        'window.TradesData',
        'window.ModalManagerV2'
      ],
      description: 'טריידים בפורמט',
      pageType: 'main',
      requiresFilters: true,
      requiresValidation: true,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger.info('📈 Initializing Trades Formatted...', { page: 'page-initialization-configs' });
          // Throttle trade-plans to avoid 429 when page loads
          if (window.RateLimitTracker?.setDelay) {
            window.RateLimitTracker.setDelay(1500); // 1.5s between requests on this page
          }
          if (typeof window.loadTradesData === 'function') {
            if (window.CacheTTLGuard?.ensure) {
              await window.CacheTTLGuard.ensure('trade-data', window.loadTradesData);
            } else {
              await window.loadTradesData();
            }
          }
          // Optionally prefetch limited trade plans with small page size to reduce hits
          if (typeof window.TradePlansData?.loadTradePlans === 'function') {
            try {
              await window.TradePlansData.loadTradePlans({ limit: 20 }); // small batch to avoid bursts
            } catch (e) {
              window.Logger?.warn?.('⚠️ Prefetch trade plans failed (non-blocking)', { page: 'trades_formatted', error: e?.message });
            }
          }
        },
      ],
    },

    db_display: {
      name: 'Database Display',
      packages: [],
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
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('db_display');

          window.Logger.info('🗄️ Initializing Database Display...', {
            page: 'page-initialization-configs',
          });

          if (typeof window.loadDatabaseInfo === 'function') {
            await window.loadDatabaseInfo();
          }
        },
      ],
    },

    system_management: {
      name: 'System Management',
      packages: [],
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
      ],
      customInitializers: [
        async pageConfig => {
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('system_management');

          window.Logger.info('⚙️ Initializing System Management...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },

    research: {
      name: 'Research',
      description: 'עמוד מחקר שוק - כלים, ניתוחים ונתונים מהירים',
      lastModified: '2025-11-13',
      pageType: 'research',
      packages: ['base', 'services', 'ui-advanced', 'modules', 'crud', 'preferences', 'conditions', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem',
        'window.IconSystem', 'DataUtils', 'window.initializeResearchPage',
        'window.conditionsInitializer', // Conditions System
        'window.ConditionsUIManager', // Conditions System
      ],
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
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'conditions',
        'dashboard-widgets',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.startScheduler',
        'window.refreshBackgroundTasksLog',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.LinkedItemsService',
        'window.CRUDResponseHandler',
        'window.conditionsInitializer',
        'window.ConditionsUIManager',
        'window.PendingTradePlanWidget',
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
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('background-tasks');

          window.Logger.info('⚙️ Initializing Background Tasks...', {
            page: 'page-initialization-configs',
          });
          if (typeof window.initializeBackgroundTasksLog === 'function') {
            window.initializeBackgroundTasksLog();
          }
        },
      ],
    },

    'init-system-management': {
      name: 'Init System Management',
      packages: ['base', 'dev-tools', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

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
        async function () {
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('init-system-management');

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
      packages: ['base', 'logs', 'cache', 'modules', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

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
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('cache-management');

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
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

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
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('conditions-test');

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
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'CRUDEnhancedTester',
        'window.runCRUDTests',
        'window.runAPITests',
        'window.runUITests',

        'DefaultsTestingSystem',

        // Individual entity defaults testing functions
        'window.runExecutionsDefaultsTest',
        'window.runTradesDefaultsTest',
        'window.runAlertsDefaultsTest',
        'window.runTradePlansDefaultsTest',
        'window.runTickersDefaultsTest',
        'window.runTradingAccountsDefaultsTest',
        'window.runNotesDefaultsTest',
        'window.runCashFlowsDefaultsTest',
        'window.runTradeHistoryDefaultsTest',
        'window.runTradingJournalDefaultsTest',
        'window.runWatchListsDefaultsTest',
        'window.runTagManagementDefaultsTest',
      ],
      pageSpecificScripts: ['scripts/crud-testing-enhanced.js', 'scripts/crud-automated-test-runner.js'],
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

          // UI Tests handled by crud_testing_dashboard.js

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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'info-summary',
        'conditions',
        'system-management',
        'preferences',
        'charts',
        'tradingview-charts',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.Logger',
        'window.FieldRendererService',
        'window.CRUDResponseHandler',
        'window.InfoSummarySystem',
        'window.LinkedItemsService',
        'window.loadLinkedItemsData',
        'window.PageStateManager',
        'window.DataCollectionService',
        'window.SelectPopulatorService',
        'window.ConditionsSummaryRenderer',
        'window.UnifiedTableSystem',
        'window.PaginationSystem',
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

    'watch-lists': {
      name: 'Watch Lists',
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'crud',
        'entity-services',
        'watch-lists',
        'tradingview-widgets', // Required for mini charts in cards view
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer',
        'window.pageInitializationConfigs',
        'window.PACKAGE_MANIFEST',
        'NotificationSystem',
        'window.IconSystem',
        'window.Logger',
        'window.WatchListsDataService',
        'window.WatchListsUIService',
        'window.WatchListsPage',
        'window.FieldRendererService',
        'window.CRUDResponseHandler',
        'window.UnifiedTableSystem',
        'window.PageStateManager',
        'window.TradingViewWidgetsFactory', // Required for mini charts
        'window.TradingViewWidgetsColors', // Required for theme support
      ],
      description: 'ניהול רשימות צפייה - יצירה, עריכה, מחיקה וניהול טיקרים',
      lastModified: '2025-12-06',
      pageType: 'main',
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info?.('📋 Initializing Watch Lists Page...', {
            page: 'page-initialization-configs',
          });

          // Initialize page
          if (typeof window.WatchListsPage?.initializeWatchListsPage === 'function') {
            try {
              await window.WatchListsPage.initializeWatchListsPage();
              window.Logger?.info?.('✅ Watch Lists Page initialized successfully', {
                page: 'page-initialization-configs',
              });
            } catch (error) {
              window.Logger?.error?.('❌ Error initializing Watch Lists Page', {
                page: 'page-initialization-configs',
                error: error?.message || error,
              });
            }
          } else {
            window.Logger?.warn?.('⚠️ WatchListsPage.initializeWatchListsPage not available', {
              page: 'page-initialization-configs',
            });
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
      pageInitializationConfigs[pageName] || {
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
    return pageInitializationConfigs;
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

  const additionalPageInitializationConfigs = {
    'code-quality-dashboard': {
      name: 'Code Quality Dashboard',
      packages: ['base', 'services', 'ui-advanced', 'modules', 'crud', 'preferences', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.codeQualityDashboard',
        'window.LintStatusService',
      ],
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async () => {
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('code-quality-dashboard');

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
    // Missing pages from documentation
    db_extradata: {
      name: 'Database Extra Data',
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'crud',
        'preferences',
        'dashboard-widgets',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'DataUtils',
        'window.initDatabaseExtraData',
        'window.loadExtraData',
        'window.loadUserPreferences',
        'window.initSystemCheck',
        'window.PendingTradePlanWidget',
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
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences', // Required for ColorSchemeSystem
        'conditions',
        'dashboard-widgets',
        'info-summary',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.loadConstraints',
        'window.ConstraintManager',
        'window.createActionsMenu',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.TableSortValueAdapter',
        'window.LinkedItemsService',
        'window.CRUDResponseHandler',
        'window.conditionsInitializer',
        'window.ConditionsUIManager',
        'window.PendingTradePlanWidget',
        'window.InfoSummarySystem',
        'window.PaginationSystem',
        'window.ColorSchemeSystem', // Color Scheme System
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.IconSystem',
        'window.loadConstraints',
        'window.ConstraintManager',
        'window.createActionsMenu'
      ],
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
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'conditions',
        'dashboard-widgets',
        'info-summary',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.loadCSSManagement',
        'window.CSSManager',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.LinkedItemsService',
        'window.CRUDResponseHandler',
        'window.conditionsInitializer',
        'window.ConditionsUIManager',
        'window.PendingTradePlanWidget',
        'window.InfoSummarySystem',
        'window.PaginationSystem',
      ],
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
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('css-management');

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
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'conditions',
        'dashboard-widgets',
        'info-summary',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.LinkedItemsService',
        'window.CRUDResponseHandler',
        'window.conditionsInitializer',
        'window.ConditionsUIManager',
        'window.PendingTradePlanWidget',
        'window.InfoSummarySystem',
        'window.PaginationSystem',
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
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('dynamic-colors-display');

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
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'conditions',
        'dashboard-widgets',
        'info-summary',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.loadDesigns',
        'window.DesignGallery',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.LinkedItemsService',
        'window.CRUDResponseHandler',
        'window.conditionsInitializer',
        'window.ConditionsUIManager',
        'window.PendingTradePlanWidget',
        'window.InfoSummarySystem',
        'window.PaginationSystem',
      ],
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
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'conditions',
        'dashboard-widgets',
        'info-summary',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.loadChartManagement',
        'window.ChartManagement',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.LinkedItemsService',
        'window.CRUDResponseHandler',
        'window.conditionsInitializer',
        'window.ConditionsUIManager',
        'window.PendingTradePlanWidget',
        'window.InfoSummarySystem',
        'window.PaginationSystem',
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

    'tradingview-widgets-showcase': {
      name: 'TradingView Widgets Showcase',
      packages: ['base', 'modules', 'preferences', 'tradingview-widgets', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

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

    // Authentication Pages
    login: {
      name: 'Login',
      packages: ['base', 'services', 'ui-advanced', 'modules', 'crud', 'info-summary', 'conditions', 'preferences', 'validation', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.CRUDResponseHandler',
        'window.ColorSchemeSystem',
        'window.InfoSummarySystem',
        'window.LinkedItemsService',
        'window.loadLinkedItemsData',
        'window.ConditionsSummaryRenderer',
        'window.UnifiedTableSystem',
        'window.PaginationSystem',
      ],
      description: 'כניסה למערכת',
      pageType: 'auth',
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: false,
      customInitializers: [
        async (pageConfig) => {
          // Create login interface
          if (typeof window.TikTrackAuth !== 'undefined' && typeof window.TikTrackAuth.createLoginInterface === 'function') {
            window.TikTrackAuth.createLoginInterface('loginContainer');
            // Load saved credentials if available
            if (typeof window.TikTrackAuth.loadSavedCredentials === 'function') {
              window.TikTrackAuth.loadSavedCredentials();
            }
          } else if (typeof window.createLoginInterface === 'function') {
            window.createLoginInterface('loginContainer');
            if (typeof window.loadSavedCredentials === 'function') {
              window.loadSavedCredentials();
            }
          } else {
            window.Logger?.warn('⚠️ createLoginInterface not available', { page: 'login' });
          }
        },
      ],
    },

    register: {
      name: 'Register',
      packages: ['base', 'services', 'ui-advanced', 'modules', 'crud', 'info-summary', 'conditions', 'preferences', 'validation', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.CRUDResponseHandler',
        'window.ColorSchemeSystem',
        'window.InfoSummarySystem',
        'window.LinkedItemsService',
        'window.loadLinkedItemsData',
        'window.ConditionsSummaryRenderer',
        'window.UnifiedTableSystem',
        'window.PaginationSystem',
      ],
      description: 'הרשמה למערכת',
      pageType: 'auth',
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: false,
    },

    'forgot-password': {
      name: 'Forgot Password',
      packages: ['base', 'services', 'ui-advanced', 'validation', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        'NotificationSystem',
        'window.IconSystem'
      ],
      description: 'שחזור סיסמה',
      pageType: 'auth',
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: false,
    },

    'reset-password': {
      name: 'Reset Password',
      packages: ['base', 'services', 'ui-advanced', 'validation', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        'NotificationSystem',
        'window.IconSystem'
      ],
      description: 'איפוס סיסמה',
      pageType: 'auth',
      requiresFilters: false,
      requiresValidation: true,
      requiresTables: false,
    },

    // Development Tools Pages
    'button-color-mapping': {
      name: 'Button Color Mapping',
      packages: ['base', 'services', 'ui-advanced', 'modules', 'preferences', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        'NotificationSystem',
        'window.IconSystem',
        'window.ColorManager'
      ],
      description: 'מיפוי צבעי כפתורים',
      pageType: 'dev-tools',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    'button-color-mapping-simple': {
      name: 'Button Color Mapping Simple',
      packages: ['base', 'services', 'ui-advanced', 'preferences', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem', 'window.ColorManager',
      ],
      description: 'מיפוי צבעי כפתורים - פשוט',
      pageType: 'dev-tools',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    'conditions-modals': {
      name: 'Conditions Modals',
      packages: ['base', 'services', 'ui-advanced', 'conditions', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem', 'window.AlertConditionRenderer',
      ],
      description: 'מודלים של תנאים',
      pageType: 'dev-tools',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info?.('🔵🔵🔵 CUSTOM INITIALIZER STARTED for conditions-modals page', {
            page: 'page-initialization-configs'
          });

          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('conditions-modals');

          window.Logger.info('🎯 Initializing Conditions Modals Page...', {
            page: 'page-initialization-configs',
          });

          // Initialize conditions management interface
          if (typeof window.initializeConditionsManagement === 'function') {
            try {
              await window.initializeConditionsManagement();
              window.Logger.info('✅ Conditions Management initialized successfully', {
                page: 'page-initialization-configs',
              });
            } catch (error) {
              window.Logger.error('❌ Failed to initialize Conditions Management:', error, {
                page: 'page-initialization-configs',
              });
            }
          } else {
            window.Logger.warn('⚠️ initializeConditionsManagement function not found', {
              page: 'page-initialization-configs',
            });
          }

          // Load conditions data if available
          if (typeof window.loadConditionsData === 'function') {
            try {
              await window.loadConditionsData();
              window.Logger.info('✅ Conditions data loaded successfully', {
                page: 'page-initialization-configs',
              });
            } catch (error) {
              window.Logger.error('❌ Failed to load conditions data:', error, {
                page: 'page-initialization-configs',
              });
            }
          }
        },
      ],
    },


    'preferences-groups-management': {
      name: 'Preferences Groups Management',
      packages: ['base', 'services', 'ui-advanced', 'modules', 'preferences', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem', 'window.PreferencesCore',
      ],
      description: 'ניהול קבוצות העדפות',
      pageType: 'dev-tools',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    // Daily Snapshots Mockup Pages
    'daily-snapshots-comparative-analysis-page': {
      name: 'Comparative Analysis',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-services', 'tradingview-charts', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem',
      ],
      description: 'ניתוח השוואתי - מוקאפ',
      pageType: 'mockup',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    'daily-snapshots-date-comparison-modal': {
      name: 'Date Comparison Modal',
      packages: ['base', 'services', 'ui-advanced', 'preferences', 'init-system', 'charts'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem',
      ],
      description: 'השוואת תאריכים - מוקאפ',
      pageType: 'mockup',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    'daily-snapshots-economic-calendar-page': {
      name: 'Economic Calendar',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-services', 'tradingview-widgets', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem',
      ],
      description: 'לוח שנה כלכלי - מוקאפ',
      pageType: 'mockup',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    'daily-snapshots-emotional-tracking-widget': {
      name: 'Emotional Tracking Widget',
      packages: ['base', 'services', 'ui-advanced', 'preferences', 'tradingview-charts', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem',
      ],
      description: 'ווידג\'ט מעקב רגשי - מוקאפ',
      pageType: 'mockup',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    'daily-snapshots-heatmap-visual-example': {
      name: 'Heatmap Visual Example',
      packages: ['base', 'services', 'ui-advanced', 'preferences', 'tradingview-charts', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem',
      ],
      description: 'דוגמת מפת חום - מוקאפ',
      pageType: 'mockup',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    'daily-snapshots-history-widget': {
      name: 'History Widget',
      packages: ['base', 'services', 'ui-advanced', 'preferences', 'tradingview-charts', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem',
      ],
      description: 'ווידג\'ט היסטוריה - מוקאפ',
      pageType: 'mockup',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    'daily-snapshots-portfolio-state-page': {
      name: 'Portfolio State Page',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-services', 'tradingview-charts', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem',
      ],
      description: 'מצב תיק השקעות - מוקאפ',
      pageType: 'mockup',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    'daily-snapshots-price-history-page': {
      name: 'Price History Page',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-services', 'tradingview-charts', 'tradingview-widgets', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem',
      ],
      description: 'היסטוריית מחירים - מוקאפ',
      pageType: 'mockup',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    'daily-snapshots-strategy-analysis-page': {
      name: 'Strategy Analysis Page',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-services', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem',
      ],
      description: 'ניתוח אסטרטגיה - מוקאפ',
      pageType: 'mockup',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    'daily-snapshots-trade-history-page': {
      name: 'Trade History Page',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-services', 'tradingview-charts', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem',
      ],
      description: 'היסטוריית טריידים - מוקאפ',
      pageType: 'mockup',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    'daily-snapshots-trading-journal-page': {
      name: 'Trading Journal Page',
      packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-services', 'init-system'],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
'NotificationSystem', 'window.IconSystem',
      ],
      description: 'יומן מסחר - מוקאפ',
      pageType: 'mockup',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
    },

    // Watch Lists Pages
    'watch-list': {
      name: 'Watch List Page',
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'validation', // Required for form validation - must load before modules/ui-advanced
        'modules', // Required for ModalManagerV2 and watch-lists-config.js
        'ui-advanced',
        'crud',
        'entity-services',
        'entity-details', // Required for enriching ticker data with market prices, positions, etc.
        'watch-lists',
        'init-system'
      ],
      requiredGlobals: [
        'UnifiedCacheManager',
        'Logger',
        'NotificationSystem',
        'window.IconSystem',
        'window.WatchListsDataService',
        'window.WatchListsUIService',
        'window.WatchListsPage',
        'window.HeaderSystem',
        'window.UnifiedTableSystem',
        'window.createActionsMenu', // Actions Menu System - required for actions menu
        'window.validateTextField', // Validation functions
        'window.tickersModalConfig', // Required for nested ticker addition modal
        'window.AddTickerModal', // Required for add ticker modal
        'window.addTickerToList', // Required for add ticker modal save function
        'window.entityDetailsAPI' // Required for enriching ticker data with market prices, positions, etc.
      ],
      pageSpecificScripts: [
        'scripts/watch_lists.js',
        'scripts/add-ticker-modal.js' // Add ticker modal
      ],
      description: 'עמוד ניהול רשימות צפייה - production',
      lastModified: '2025-12-06',
      pageType: 'main',
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: true, // Changed to true - validation is required for modals
      requiresTables: true,
      sectionsDefaultState: 'open',
      sectionDefaultStates: {
        'top': 'open',
        'active-list': 'open',
        'flagged': 'closed'
      },
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing Watch List Page...', {
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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'watch-lists'
      ],
      requiredGlobals: [
        'NotificationSystem',
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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'validation',
        'modules', // Required for tickersModalConfig and ModalManagerV2
        'ui-advanced',
        'watch-lists'
      ],
      requiredGlobals: [
        'NotificationSystem',
        'window.AddTickerModal',
        'window.SelectPopulatorService',
        'window.tickersModalConfig' // Required for nested ticker addition modal
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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
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
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'preferences',
        'entity-services',
        'info-summary',
        'ai-analysis',
        'init-system'
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

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
        'window.CRUDResponseHandler',
        'window.InfoSummarySystem', // Required for Info Summary tests
        'window.notesModalConfig' // Required for Save as Note feature
        // Note: window.NotesData is optional - ai-notes-integration.js has fallback
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


    'tradingview-test-page': {
      name: 'TradingView Test Page',
      description: 'בדיקת TradingView Lightweight Charts',
      lastModified: '2025-02-02',
      pageType: 'development',
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'conditions',
        'dashboard-widgets',
        'info-summary',
        'entity-details',
        'tradingview-charts',
        'init-system',
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        'NotificationSystem',
        'window.IconSystem',
        'window.SelectPopulatorService',
        'window.DataCollectionService',
        'window.DefaultValueSetter',
        'window.TableSortValueAdapter',
        'window.LinkedItemsService',
        'window.CRUDResponseHandler',
        'window.createActionsMenu',
        'window.conditionsInitializer',
        'window.ConditionsUIManager',
        'window.PendingTradePlanWidget',
        'window.InfoSummarySystem',
        'window.PaginationSystem',
        'window.showEntityDetails',
      ],
      preloadAssets: ['tradingview-test'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          // ===== AUTH GUARD - Option1 compliance =====
          await ensureAuthenticatedForPage('tradingview-test-page');

          window.Logger?.info('📊 Initializing TradingView Test Page...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },    'portfolio-state': {
      name: 'מצב תיק היסטורי',
      description: 'עמוד מצב תיק היסטורי - ניתוח וצפייה במצב תיק בנקודות זמן שונות',
      lastModified: '2025-01-12',
      pageType: 'main',
      packages: [
        // Standard loading order (see STANDARD_LOADING_ORDER.md)
        "base",
        "services",
        "ui-advanced",
        "crud",
        "preferences",
        "entity-services",
        "info-summary",
        "charts",
        "tradingview-charts",
        "modules",
        "init-system"
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        'window.TikTrackAuth',
        'window.AuthGuard',
        "NotificationSystem",
        "window.IconSystem",
        "window.FieldRendererService",
        "window.UnifiedTableSystem",
        "window.InfoSummarySystem",
        "window.UnifiedProgressManager",
        "window.ButtonSystem",
        "window.ModalManagerV2",
        "window.LinkedItemsService",
        "window.SelectPopulatorService",
        "window.DataCollectionService",
        "window.CRUDResponseHandler",
        "window.PortfolioStateData" // Portfolio State Data Service
      ],
      preloadAssets: ['portfolio-state-page-data'],
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📄 Initializing portfolio-state...', {
            page: 'page-initialization-configs',
          });
          
          // Ensure authentication is established before loading page data
          if (window.AuthGuard?.init) {
            try {
              await window.AuthGuard.init();
              window.Logger?.info('✅ AuthGuard initialized for portfolio-state', { page: 'page-initialization-configs' });
            } catch (e) {
              window.Logger?.error('❌ AuthGuard init failed for portfolio-state', { page: 'page-initialization-configs', error: e });
            }
          }
          
          // Wait for portfolioStatePage to be available
          if (!window.portfolioStatePage) {
            window.Logger?.warn('⚠️ portfolioStatePage not available yet, waiting...', {
              page: 'page-initialization-configs',
            });
            
            // Wait up to 5 seconds for the script to load
            let retries = 0;
            while (!window.portfolioStatePage) {
              if (retries >= 50) {
                window.Logger?.error('❌ portfolioStatePage not available after wait', {
                  page: 'page-initialization-configs',
                });
                return;
              }
              await new Promise(resolve => setTimeout(resolve, 100));
              retries++;
            }
          }

          // Call initializePage if available, otherwise page will initialize via DOMContentLoaded
          if (typeof window.portfolioStatePage.initializePage === 'function') {
            try {
              await window.portfolioStatePage.initializePage();
              window.Logger?.info('✅ Portfolio State initialized via UnifiedAppInitializer', {
                page: 'page-initialization-configs',
              });
            } catch (error) {
              window.Logger?.error('❌ Error initializing Portfolio State', {
                page: 'page-initialization-configs',
                error,
              });
            }
          } else {
            window.Logger?.info('ℹ️ Portfolio State will initialize via DOMContentLoaded', {
              page: 'page-initialization-configs',
            });
          }
        },
      ],
    },    'trade-history': {
      name: 'היסטוריית טרייד',
      description: 'עמוד היסטוריית טרייד - ניתוח וצפייה בהיסטוריית טריידים',
      lastModified: '2025-01-12',
      pageType: 'main',
      packages: [
        "base",
        "services",
        "ui-advanced",
        "modules",
        "crud",
        "preferences",
        "entity-services",
        "entity-details",
        "info-summary",
        "charts",
        "tradingview-charts", // Required for TradingView charts in trade history
        "external-data", // Required for loading external historical data
        "init-system"
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        "NotificationSystem",
        "window.IconSystem",
        "window.FieldRendererService",
        "window.ModalManagerV2",
        "window.LinkedItemsService",
        "window.UnifiedTableSystem",
        "window.InfoSummarySystem",
        "window.SelectPopulatorService",
        "window.DataCollectionService",
        "window.CRUDResponseHandler",
        "window.ExternalDataService", // Required for loading external historical data
        "window.TradeHistoryData", // Trade History Data Service
        "window.tradeHistoryPage" // Trade History Page Script
      ],
      preloadAssets: ['trade-history-page-data'],
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📄 Initializing trade-history...', {
            page: 'page-initialization-configs',
          });
          
          // Wait for tradeHistoryPage to be available
          if (!window.tradeHistoryPage || typeof window.tradeHistoryPage.initializePage !== 'function') {
            window.Logger?.warn('⚠️ tradeHistoryPage.initializePage not available yet, waiting...', {
              page: 'page-initialization-configs',
            });
            
            // Wait up to 5 seconds for the script to load
            let retries = 0;
            while (!window.tradeHistoryPage || typeof window.tradeHistoryPage.initializePage !== 'function') {
              if (retries >= 50) {
                window.Logger?.error('❌ tradeHistoryPage.initializePage not available after wait', {
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
            window.Logger?.info('✅ Trade History Page initialized via UnifiedAppInitializer', {
              page: 'page-initialization-configs',
            });
          } catch (error) {
            window.Logger?.error('❌ Error initializing Trade History Page', {
              page: 'page-initialization-configs',
              error,
            });
            throw error;
          }
        },
      ],
    },    'price-history-page': {
      name: 'Price History Page',
      description: 'עמוד מוקאפ - price-history-page',
      lastModified: '2025-02-02',
      pageType: 'mockup',
      packages: [
        "base",
        "services",
        "ui-advanced",
        "modules",
        "crud",
        "conditions",
        "dashboard-widgets",
        "init-system",
        "info-summary"
],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        "NotificationSystem",
        "window.IconSystem",
        "window.SelectPopulatorService",
        "window.DataCollectionService",
        "window.DefaultValueSetter",
        "window.TableSortValueAdapter",
        "window.LinkedItemsService",
        "window.CRUDResponseHandler",
        "window.createActionsMenu",
        "window.ModalNavigationManager",
        "window.ModalManagerV2",
        "window.conditionsInitializer",
        "window.ConditionsUIManager",
        "window.PendingTradePlanWidget",
        "window.PaginationSystem",
        "window.InfoSummarySystem"
,
      ],
      preloadAssets: ['price-history-page-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📄 Initializing price-history-page...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },    'comparative-analysis-page': {
      name: 'Comparative Analysis Page',
      description: 'עמוד מוקאפ - comparative-analysis-page',
      lastModified: '2025-02-02',
      pageType: 'mockup',
      packages: [
        "base",
        "services",
        "ui-advanced",
        "modules",
        "crud",
        "conditions",
        "dashboard-widgets",
        "init-system",
        "info-summary"
],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        "NotificationSystem",
        "window.IconSystem",
        "window.SelectPopulatorService",
        "window.DataCollectionService",
        "window.DefaultValueSetter",
        "window.TableSortValueAdapter",
        "window.LinkedItemsService",
        "window.CRUDResponseHandler",
        "window.createActionsMenu",
        "window.ModalNavigationManager",
        "window.ModalManagerV2",
        "window.conditionsInitializer",
        "window.ConditionsUIManager",
        "window.PendingTradePlanWidget",
        "window.PaginationSystem",
        "window.InfoSummarySystem"
,
      ],
      preloadAssets: ['comparative-analysis-page-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📄 Initializing comparative-analysis-page...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },
    'trading_journal': {
      name: 'יומן מסחר',
      description: 'עמוד יומן מסחר - ניהול ותצוגת יומן מסחר עם לוח שנה',
      lastModified: '2025-01-12',
      pageType: 'main',
      packages: [
        'base',
        'auth', // Authentication loaded FIRST to provide dependencies
        'header', // Header system loaded after auth
        'core-ui', // Core UI systems loaded after header
        'services',
        'ui-advanced',
        'modules',
        'crud',
        'preferences',
        'validation',
        'tradingview-charts', // Required for TradingView activity chart
        'entity-services',
        'entity-details',
        'info-summary',
        'init-system'
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System
        "NotificationSystem",
        "window.IconSystem",
        "window.FieldRendererService",
        "window.ModalManagerV2",
        "window.LinkedItemsService",
        "window.InfoSummarySystem",
        "window.SelectPopulatorService",
        "window.DataCollectionService",
        "window.CRUDResponseHandler",
        "window.TradingJournalData", // Trading Journal Data Service
        "window.handleAddEntry", // Trading Journal Page - handleAddEntry function
        "window.tradingJournalPage", // Trading Journal Page object
        "window.TradingViewChartAdapter", // TradingView chart adapter for activity chart
        "window.LightweightCharts" // TradingView Lightweight Charts library
      ],
      preloadAssets: ['trading-journal-page-data'],
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📄 Initializing trading-journal-page...', {
            page: 'page-initialization-configs',
          });
          
          // Wait for TradingViewChartAdapter to be available
          if (!window.TradingViewChartAdapter) {
            window.Logger?.warn('⚠️ TradingViewChartAdapter not available yet, waiting...', {
              page: 'page-initialization-configs',
            });
            
            let retries = 0;
            while (!window.TradingViewChartAdapter && retries < 50) {
              await new Promise(resolve => setTimeout(resolve, 100));
              retries++;
            }
            
            if (!window.TradingViewChartAdapter) {
              window.Logger?.error('❌ TradingViewChartAdapter not available after wait', {
                page: 'page-initialization-configs',
              });
            } else {
              window.Logger?.info('✅ TradingViewChartAdapter loaded', {
                page: 'page-initialization-configs',
              });
            }
          }
          
          // Wait for tradingJournalPage to be available
          if (!window.tradingJournalPage) {
            window.Logger?.warn('⚠️ tradingJournalPage not available yet, waiting...', {
              page: 'page-initialization-configs',
            });
            
            // Wait up to 5 seconds for the script to load
            let retries = 0;
            while (!window.tradingJournalPage) {
              if (retries >= 50) {
                window.Logger?.error('❌ tradingJournalPage not available after wait', {
                  page: 'page-initialization-configs',
                });
                return;
              }
              await new Promise(resolve => setTimeout(resolve, 100));
              retries++;
            }
          }

          // Trading Journal Page initializes via DOMContentLoaded listener
          // Just verify it's loaded
          window.Logger?.info('✅ Trading Journal Page script loaded', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },    'strategy-analysis-page': {
      name: 'Strategy Analysis Page',
      description: 'עמוד מוקאפ - strategy-analysis-page',
      lastModified: '2025-02-02',
      pageType: 'mockup',
      packages: [
        "base",
        "services",
        "ui-advanced",
        "modules",
        "crud",
        "conditions",
        "dashboard-widgets",
        "init-system",
        "info-summary"
],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        "NotificationSystem",
        "window.IconSystem",
        "window.SelectPopulatorService",
        "window.DataCollectionService",
        "window.DefaultValueSetter",
        "window.TableSortValueAdapter",
        "window.LinkedItemsService",
        "window.CRUDResponseHandler",
        "window.createActionsMenu",
        "window.ModalNavigationManager",
        "window.ModalManagerV2",
        "window.conditionsInitializer",
        "window.ConditionsUIManager",
        "window.PendingTradePlanWidget",
        "window.PaginationSystem",
        "window.InfoSummarySystem"
,
      ],
      preloadAssets: ['strategy-analysis-page-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📄 Initializing strategy-analysis-page...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },    'strategy-analysis': {
      name: 'ניתוח אסטרטגיות',
      description: 'עמוד ניתוח אסטרטגיות - ניתוח ביצועי אסטרטגיות מסחר',
      lastModified: '2025-01-27',
      pageType: 'main',
      packages: [
        "base",
        "services",
        "ui-advanced",
        "modules",
        "crud",
        "preferences",
        "entity-services",
        "entity-details",
        "info-summary",
        "conditions",
        "tradingview-charts",
        "init-system"
      ],
      requiredGlobals: [
        'window.UnifiedAppInitializer',
        'window.pageInitializationConfigs',
        'window.PACKAGE_MANIFEST',
        "NotificationSystem",
        "window.IconSystem",
        "window.FieldRendererService",
        "window.SelectPopulatorService",
        "window.DataCollectionService",
        "window.DefaultValueSetter",
        "window.TableSortValueAdapter",
        "window.LinkedItemsService",
        "window.CRUDResponseHandler",
        "window.createActionsMenu",
        "window.ModalNavigationManager",
        "window.ModalManagerV2",
        "window.conditionsInitializer",
        "window.ConditionsUIManager",
        "window.PaginationSystem",
        "window.InfoSummarySystem",
        "window.TradingViewChartAdapter"
      ],
      preloadAssets: ['strategy-analysis-data'],
      cacheStrategy: 'standard',
      requiresFilters: true,
      requiresValidation: false,
      requiresTables: true,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📊 Initializing strategy-analysis page...', {
            page: 'page-initialization-configs',
          });
          
          // Wait for strategy-analysis-page.js to be available
          if (window.strategyAnalysisPage && typeof window.strategyAnalysisPage.initializePage === 'function') {
            await window.strategyAnalysisPage.initializePage();
          } else {
            // Wait up to 5 seconds for the script to load
            let retries = 0;
            while ((!window.strategyAnalysisPage || typeof window.strategyAnalysisPage?.initializePage !== 'function') && retries < 50) {
              await new Promise(resolve => setTimeout(resolve, 100));
              retries++;
            }
            
            if (window.strategyAnalysisPage && typeof window.strategyAnalysisPage.initializePage === 'function') {
              await window.strategyAnalysisPage.initializePage();
            } else {
              window.Logger?.warn('⚠️ strategyAnalysisPage.initializePage not available', {
                page: 'page-initialization-configs',
              });
            }
          }
        },
      ],
    },    'economic-calendar-page': {
      name: 'Economic Calendar Page',
      description: 'עמוד מוקאפ - economic-calendar-page',
      lastModified: '2025-02-02',
      pageType: 'mockup',
      packages: [
        "base",
        "services",
        "ui-advanced",
        "modules",
        "crud",
        "conditions",
        "dashboard-widgets",
        "init-system",
        "info-summary"
],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        "NotificationSystem",
        "window.IconSystem",
        "window.SelectPopulatorService",
        "window.DataCollectionService",
        "window.DefaultValueSetter",
        "window.TableSortValueAdapter",
        "window.LinkedItemsService",
        "window.CRUDResponseHandler",
        "window.createActionsMenu",
        "window.ModalNavigationManager",
        "window.ModalManagerV2",
        "window.conditionsInitializer",
        "window.ConditionsUIManager",
        "window.PendingTradePlanWidget",
        "window.PaginationSystem",
        "window.InfoSummarySystem"
,
      ],
      preloadAssets: ['economic-calendar-page-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📄 Initializing economic-calendar-page...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },    'history-widget': {
      name: 'History Widget',
      description: 'עמוד מוקאפ - history-widget',
      lastModified: '2025-02-02',
      pageType: 'mockup',
      packages: [
        "base",
        "services",
        "ui-advanced",
        "modules",
        "crud",
        "conditions",
        "dashboard-widgets",
        "init-system",
        "info-summary"
],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        "NotificationSystem",
        "window.IconSystem",
        "window.SelectPopulatorService",
        "window.DataCollectionService",
        "window.DefaultValueSetter",
        "window.TableSortValueAdapter",
        "window.LinkedItemsService",
        "window.CRUDResponseHandler",
        "window.createActionsMenu",
        "window.ModalNavigationManager",
        "window.ModalManagerV2",
        "window.conditionsInitializer",
        "window.ConditionsUIManager",
        "window.PendingTradePlanWidget",
        "window.PaginationSystem",
        "window.InfoSummarySystem"
,
      ],
      preloadAssets: ['history-widget-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📄 Initializing history-widget...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },    'emotional-tracking-widget': {
      name: 'Emotional Tracking Widget',
      description: 'עמוד מוקאפ - emotional-tracking-widget',
      lastModified: '2025-02-02',
      pageType: 'mockup',
      packages: [
        "base",
        "services",
        "ui-advanced",
        "modules",
        "crud",
        "conditions",
        "dashboard-widgets",
        "init-system"
],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        "NotificationSystem",
        "window.IconSystem",
        "window.SelectPopulatorService",
        "window.DataCollectionService",
        "window.DefaultValueSetter",
        "window.TableSortValueAdapter",
        "window.LinkedItemsService",
        "window.CRUDResponseHandler",
        "window.createActionsMenu",
        "window.ModalNavigationManager",
        "window.ModalManagerV2",
        "window.conditionsInitializer",
        "window.ConditionsUIManager",
        "window.PendingTradePlanWidget",
        "window.PaginationSystem"
,
      ],
      preloadAssets: ['emotional-tracking-widget-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📄 Initializing emotional-tracking-widget...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },    'date-comparison-modal': {
      name: 'Date Comparison Modal',
      description: 'עמוד מוקאפ - date-comparison-modal',
      lastModified: '2025-02-02',
      pageType: 'mockup',
      packages: [
        "base",
        "services",
        "ui-advanced",
        "modules",
        "crud",
        "conditions",
        "dashboard-widgets",
        "init-system",
        "info-summary"
],
      requiredGlobals: [
        'window.UnifiedAppInitializer', // Unified Init System
        'window.pageInitializationConfigs', // Unified Init System
        'window.PACKAGE_MANIFEST', // Unified Init System

        "NotificationSystem",
        "window.IconSystem",
        "window.SelectPopulatorService",
        "window.DataCollectionService",
        "window.DefaultValueSetter",
        "window.TableSortValueAdapter",
        "window.LinkedItemsService",
        "window.CRUDResponseHandler",
        "window.createActionsMenu",
        "window.ModalNavigationManager",
        "window.ModalManagerV2",
        "window.conditionsInitializer",
        "window.ConditionsUIManager",
        "window.PendingTradePlanWidget",
        "window.PaginationSystem",
        "window.InfoSummarySystem"
,
      ],
      preloadAssets: ['date-comparison-modal-data'],
      cacheStrategy: 'standard',
      requiresFilters: false,
      requiresValidation: false,
      requiresTables: false,
      customInitializers: [
        async pageConfig => {
          window.Logger?.info('📄 Initializing date-comparison-modal...', {
            page: 'page-initialization-configs',
          });
        },
      ],
    },










  };

  // ===== GLOBAL EXPORT =====

  // Merge additional configs
  Object.assign(pageInitializationConfigs, additionalPageInitializationConfigs);

  const CACHE_CONTROL_GLOBAL = 'window.CacheControlMenu';
  Object.values(pageInitializationConfigs).forEach(config => {
    if (Array.isArray(config.requiredGlobals)) {
      if (!config.requiredGlobals.includes(CACHE_CONTROL_GLOBAL)) {
        config.requiredGlobals.push(CACHE_CONTROL_GLOBAL);
      }
    } else {
      config.requiredGlobals = [CACHE_CONTROL_GLOBAL];
    }
  });

  // CRITICAL: Add aliases AFTER pageInitializationConfigs is fully defined to avoid "Cannot access before initialization" error
  // Alias for ai_analysis.html (underscore instead of hyphen)
  if (pageInitializationConfigs['ai-analysis']) {
    pageInitializationConfigs['ai_analysis'] = pageInitializationConfigs['ai-analysis'];
  }
  // Alias for user_profile.html (underscore instead of hyphen)
  if (pageInitializationConfigs['user-profile']) {
    pageInitializationConfigs['user_profile'] = pageInitializationConfigs['user-profile'];
  }
  // Alias for user_management.html (underscore instead of hyphen)
  if (pageInitializationConfigs['user-management']) {
    pageInitializationConfigs['user_management'] = pageInitializationConfigs['user-management'];
  }
  // Alias for ticker_dashboard.html (underscore instead of hyphen)
  if (pageInitializationConfigs['ticker-dashboard']) {
    pageInitializationConfigs['ticker_dashboard'] = pageInitializationConfigs['ticker-dashboard'];
  }

// endregion

// ================================================================================================
// ===== DEV TOOLS PAGE CONFIGURATION =====
// ================================================================================================

if (!pageInitializationConfigs['dev_tools']) {
  pageInitializationConfigs['dev_tools'] = {
    name: 'Development Tools',
    packages: ['base', 'header', 'services', 'crud', 'preferences', 'dev-tools', 'init-system'],
    requiredGlobals: [
      'window.UnifiedAppInitializer', // Unified Init System
      'window.pageInitializationConfigs', // Unified Init System
      'window.PACKAGE_MANIFEST', // Unified Init System

      'NotificationSystem',
      'window.IconSystem',
      'window.FieldRendererService',
      'window.updatePageSummaryStats',
      'window.toggleSection', // UI utilities for section toggling
    ],
    description: 'עמוד כלי פיתוח ראשי - סקירה מלאה של כל העמודים והמערכות',
    lastModified: '2025-12-23',
    pageType: 'development',
    preloadAssets: ['dev-tools-data'],
    cacheStrategy: 'standard',
    requiresFilters: false,
    requiresValidation: false,
    requiresTables: true, // Enable table sorting via core-systems.js
    customInitializers: [
      function () {
        window.Logger.info('🛠️ Initializing Development Tools page...', {
          page: 'dev_tools',
          timestamp: new Date().toISOString()
        });

        // Initialize development tools specific functionality
        if (typeof window.initializeDevTools === 'function') {
          window.initializeDevTools();
        }
      },
    ],
  };
}

// CRUD Testing Dashboard 2.0
console.log('[PAGE-INIT] Setting up crud_testing_dashboard config');
if (!pageInitializationConfigs['crud_testing_dashboard']) {
  pageInitializationConfigs['crud_testing_dashboard'] = {
    name: 'CRUD Testing Dashboard 2.0',
    packages: ['base', 'auth', 'services', 'ui-advanced', 'crud', 'init-system'],
    requiredGlobals: [
      'window.UnifiedAppInitializer', // Unified Init System
      'window.pageInitializationConfigs', // Unified Init System
      'window.PACKAGE_MANIFEST', // Unified Init System

      'NotificationSystem',
      'window.IconSystem',
      'window.Logger',
      'window.initializeCRUDTestingDashboard',
      'window.runIntegratedTests',
      'window.runUITests',
      'window.runAPITests',
      'window.runDebugTools',
      'window.runExecutionsDefaultsTest',
      'window.runCrossPageTestForGroup',
      'window.runTestsForSinglePage',
      'window.runExecutionTestOnly',
      'window.runTradeTestOnly',
      'window.runTradePlanTestOnly',
      'window.runAlertTestOnly',
      'window.runTickerTestOnly',
      'window.runTradingAccountTestOnly',
      'window.runCashFlowTestOnly',
      'window.runNoteTestOnly',
      'window.runWatchListTestOnly',
      'window.runTradingJournalTestOnly',
      'window.runTagCategoryTestOnly',
      'window.runUserProfileTestOnly',
      'window.runPreferenceProfileTestOnly',
      'window.runImportSessionTestOnly'
    ],
    description: 'Advanced testing dashboard for CRUD operations with UI, API, and E2E testing',
    lastModified: '2025-12-23',
    pageType: 'dev-tools',
    preloadAssets: [],
    cacheStrategy: 'standard',
    requiresFilters: false,
    requiresValidation: false,
    requiresTables: true,
    customInitializers: [
      async function () {
        // ===== AUTH GUARD WITH RETRY LOGIC (Fix Pack 5 Phase 3) =====
        await ensureAuthenticatedForPage('crud_testing_dashboard');

        window.Logger?.info('🧪 Initializing CRUD Testing Dashboard 2.0...', {
          page: 'crud_testing_dashboard',
          timestamp: new Date().toISOString()
        });

        // Initialize the CRUD testing dashboard
        if (window.initializeCRUDTestingDashboard) {
          await window.initializeCRUDTestingDashboard();
        }

        // Define global function for executions defaults test
        // region agent log
        window.runExecutionsDefaultsTest = async function() {
          try {
            console.log('DEBUG: runExecutionsDefaultsTest started - running ONLY for executions page', {
                crudTesterExists: !!window.crudTester,
                CrossPageTesterExists: !!window.CrossPageTester
            });

            // Check if crudTester is initialized
            if (!window.crudTester) {
                // Wait for crudTester to be initialized
                let attempts = 0;
                while (!window.crudTester && attempts < 50) { // Wait up to 5 seconds
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }

                if (!window.crudTester) {
                    throw new Error('crudTester not initialized after waiting');
                }
            }

            // Create CrossPageTester instance
            const crossPageTester = new window.CrossPageTester(window.crudTester);

            // Show the test section (will be handled by updateTestResults)

            // Initialize results if needed in main crudTester
            if (window.crudTester) {
              window.crudTester.currentTestType = 'crossPage';
              // crossPage is already initialized in crudTester constructor
            }

            // Run test for ONLY the executions page
            console.log('🔍 DEBUG: About to call crossPageTester.runTestsForSinglePage for executions page');
            await crossPageTester.runTestsForSinglePage('executions', 'defaults');
            console.log('🔍 DEBUG: crossPageTester.runTestsForSinglePage completed for executions page');

            // Update dashboard
            if (window.crudTester && typeof window.crudTester.updateDashboard === 'function') {
              window.crudTester.updateDashboard();
            }
            if (window.crudTester && typeof window.crudTester.updateTestResults === 'function') {
              window.crudTester.updateTestResults();
            }

            // Show success notification
            if (window.showSuccessNotification) {
              const stats = crossPageTester.stats;
              window.showSuccessNotification(`בדיקת ברירות מחדל - ביצועים הושלמה: ${stats.passed} עברו, ${stats.failed} נכשלו`);
            }

            console.log('DEBUG: runExecutionsDefaultsTest completed successfully - ran ONLY for executions page');

          } catch (error) {
            console.error('Error in runExecutionsDefaultsTest:', error);
            if (window.showErrorNotification) {
              window.showErrorNotification('שגיאה', `שגיאה בבדיקת ברירות מחדל לביצועים: ${error.message}`);
            }
          }
        };

        // Define global function for cross-page testing by group (deprecated - use crud_testing_dashboard version)
        // region agent log
        window.runCrossPageTestForGroup_old = async function(groupType, testType, displayName) {
          console.log('🔍 DEBUG: runCrossPageTestForGroup called with:', groupType, testType, displayName);

          fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  location: 'page-initialization-configs.js:runCrossPageTestForGroup',
                  message: 'runCrossPageTestForGroup called',
                  data: { groupType, testType, displayName },
                  timestamp: Date.now(),
                  sessionId: 'debug-session',
                  runId: 'debug-run',
                  hypothesisId: 'D'
              })
          }).catch(() => {});

          try {
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    location: 'page-initialization-configs.js:runCrossPageTestForGroup',
                    message: 'runCrossPageTestForGroup called',
                    data: { groupType, testType, displayName },
                    timestamp: Date.now(),
                    sessionId: 'debug-session',
                    runId: 'debug-run',
                    hypothesisId: 'B'
                })
            }).catch(() => {});

            // Check if crudTester is initialized
            if (!window.crudTester) {
                // Wait for crudTester to be initialized
                let attempts = 0;
                while (!window.crudTester && attempts < 50) { // Wait up to 5 seconds
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }

                if (!window.crudTester) {
                    throw new Error('crudTester not initialized after waiting');
                }
            }

            // Create CrossPageTester instance
            const crossPageTester = new window.CrossPageTester(window.crudTester);

            // Show the test section (will be handled by updateTestResults)

            // Initialize results if needed in main crudTester
            if (window.crudTester) {
              window.crudTester.currentTestType = 'crossPage';
              // crossPage is already initialized in crudTester constructor
            }

            console.log('🔍 DEBUG: About to call crossPageTester.runTestsForGroup with:', groupType, testType);

            // Run tests for the specified group
            await crossPageTester.runTestsForGroup(groupType, testType);

            console.log('🔍 DEBUG: crossPageTester.runTestsForGroup completed for:', groupType, testType);

            // Update dashboard
            if (window.crudTester && typeof window.crudTester.updateDashboard === 'function') {
              window.crudTester.updateDashboard();
            }
            if (window.crudTester && typeof window.crudTester.updateTestResults === 'function') {
              window.crudTester.updateTestResults();
            }

            // Show success notification
            if (window.showSuccessNotification) {
              const stats = crossPageTester.stats;
              window.showSuccessNotification(`בדיקת ${displayName} - ${testType} הושלמה: ${stats.passed} עברו, ${stats.failed} נכשלו`);
            }

          } catch (error) {
            console.error('❌ Error running cross-page test', error);
            if (window.showErrorNotification) {
              window.showErrorNotification('שגיאה', `שגיאה בהרצת בדיקת ${displayName}: ${error.message}`);
            }
          }
        };

        // Define global function for single page tests
        window.runTestsForSinglePage = async function(pageKey, testType) {
          console.log('🔍 DEBUG: runTestsForSinglePage called with:', pageKey, testType);

          fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  location: 'page-initialization-configs.js:runTestsForSinglePage',
                  message: 'runTestsForSinglePage called',
                  data: { pageKey, testType },
                  timestamp: Date.now(),
                  sessionId: 'debug-session',
                  runId: 'debug-run',
                  hypothesisId: 'D'
              })
          }).catch(() => {});

          try {
            // Check if crudTester is initialized
            if (!window.crudTester) {
                console.log('🔄 crudTester not found, initializing...');
                // Try to initialize crudTester
                if (window.initializeCRUDTestingDashboard) {
                  window.initializeCRUDTestingDashboard();
                } else if (window.IntegratedCRUDE2ETester) {
                  window.crudTester = new window.IntegratedCRUDE2ETester();
                  console.log('✅ crudTester initialized successfully');
                } else {
                  throw new Error('IntegratedCRUDE2ETester class not available');
                }
            }

            // Create CrossPageTester instance
            const crossPageTester = new window.CrossPageTester(window.crudTester);

            // Initialize results if needed in main crudTester
            if (window.crudTester) {
              window.crudTester.currentTestType = 'crossPage';
              // crossPage is already initialized in crudTester constructor
            }

            // Run test for the single page
            console.log('🔍 DEBUG: About to call crossPageTester.runTestsForSinglePage');
            await crossPageTester.runTestsForSinglePage(pageKey, testType);
            console.log('🔍 DEBUG: crossPageTester.runTestsForSinglePage completed');

            // Update dashboard
            if (window.crudTester && typeof window.crudTester.updateDashboard === 'function') {
              window.crudTester.updateDashboard();
            }
            if (window.crudTester && typeof window.crudTester.updateTestResults === 'function') {
              window.crudTester.updateTestResults();
            }

            // Show success notification
            if (window.showSuccessNotification) {
              const stats = crossPageTester.stats;
              window.showSuccessNotification(`בדיקת ${testType} - ${pageKey} הושלמה: ${stats.passed} עברו, ${stats.failed} נכשלו`);
            }

          } catch (error) {
            console.error('❌ Error running single page test', error);
            if (window.showErrorNotification) {
              window.showErrorNotification('שגיאה', `שגיאה בהרצת בדיקת ${testType} ל${pageKey}: ${error.message}`);
            }
          }
        };

        // Individual entity defaults testing functions
        window.runExecutionsDefaultsTest = async function() {
          console.log('🔍 DEBUG: runExecutionsDefaultsTest called');
          await window.runTestsForSinglePage('executions', 'defaults');
        };

        window.runTradesDefaultsTest = async function() {
          console.log('🔍 DEBUG: runTradesDefaultsTest called');
          await window.runTestsForSinglePage('trades', 'defaults');
        };

        window.runAlertsDefaultsTest = async function() {
          console.log('🔍 DEBUG: runAlertsDefaultsTest called');
          await window.runTestsForSinglePage('alerts', 'defaults');
        };

        window.runTradePlansDefaultsTest = async function() {
          console.log('🔍 DEBUG: runTradePlansDefaultsTest called');
          await window.runTestsForSinglePage('trade_plans', 'defaults');
        };

        window.runTickersDefaultsTest = async function() {
          console.log('🔍 DEBUG: runTickersDefaultsTest called');
          await window.runTestsForSinglePage('tickers', 'defaults');
        };

        window.runTradingAccountsDefaultsTest = async function() {
          console.log('🔍 DEBUG: runTradingAccountsDefaultsTest called');
          await window.runTestsForSinglePage('trading_accounts', 'defaults');
        };

        window.runNotesDefaultsTest = async function() {
          console.log('🔍 DEBUG: runNotesDefaultsTest called');
          await window.runTestsForSinglePage('notes', 'defaults');
        };

        window.runCashFlowsDefaultsTest = async function() {
          console.log('🔍 DEBUG: runCashFlowsDefaultsTest called');
          await window.runTestsForSinglePage('cash_flows', 'defaults');
        };

        window.runTradeHistoryDefaultsTest = async function() {
          console.log('🔍 DEBUG: runTradeHistoryDefaultsTest called');
          await window.runTestsForSinglePage('trade_history', 'defaults');
        };

        window.runTradingJournalDefaultsTest = async function() {
          console.log('🔍 DEBUG: runTradingJournalDefaultsTest called');
          await window.runTestsForSinglePage('trading_journal', 'defaults');
        };

        window.runWatchListsDefaultsTest = async function() {
          console.log('🔍 DEBUG: runWatchListsDefaultsTest called');
          await window.runTestsForSinglePage('watch_lists', 'defaults');
        };

        window.runTagManagementDefaultsTest = async function() {
          console.log('🔍 DEBUG: runTagManagementDefaultsTest called');
          await window.runTestsForSinglePage('tag_management', 'defaults');
        };

        // General defaults test runner - runs all individual tests in sequence
        window.runAllDefaultsTests = async function() {
          console.log('🔍 DEBUG: runAllDefaultsTests called - running all entity defaults tests in sequence');

          // Ensure crudTester is initialized
          if (!window.crudTester) {
            console.log('🔄 Initializing crudTester in runAllDefaultsTests...');
            if (window.initializeCRUDTestingDashboard) {
              window.initializeCRUDTestingDashboard();
            } else {
              window.crudTester = new window.IntegratedCRUDE2ETester();
            }
          }

          const testFunctions = [
            { name: 'ביצועי עסקאות', func: window.runExecutionsDefaultsTest },
            { name: 'טריידים', func: window.runTradesDefaultsTest },
            { name: 'התראות', func: window.runAlertsDefaultsTest },
            { name: 'תכניות מסחר', func: window.runTradePlansDefaultsTest },
            { name: 'טיקרים', func: window.runTickersDefaultsTest },
            { name: 'חשבונות מסחר', func: window.runTradingAccountsDefaultsTest },
            { name: 'הערות', func: window.runNotesDefaultsTest },
            { name: 'תזרימי מזומן', func: window.runCashFlowsDefaultsTest },
            { name: 'היסטוריית טרייד', func: window.runTradeHistoryDefaultsTest },
            { name: 'יומן מסחר', func: window.runTradingJournalDefaultsTest },
            { name: 'רשימות צפייה', func: window.runWatchListsDefaultsTest },
            { name: 'תגיות', func: window.runTagManagementDefaultsTest }
          ];

          let totalPassed = 0, totalFailed = 0, totalWarning = 0;

          try {
            for (const test of testFunctions) {
              console.log(`🔍 DEBUG: Running ${test.name} defaults test...`);
              await test.func();
              // Give a small delay between tests to prevent interference
              await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Calculate summary from all tests
            if (window.crudTester && window.crudTester.results && window.crudTester.results.crossPage && window.crudTester.results.crossPage.defaults) {
              const allResults = window.crudTester.results.crossPage.defaults;
              totalPassed = allResults.filter(r => r.status === 'success').length;
              totalFailed = allResults.filter(r => r.status === 'failed').length;
              totalWarning = allResults.filter(r => r.status === 'warning').length;
            }

            // Show final summary notification
            const message = `בדיקת ברירות מחדל כללית הושלמה: ${totalPassed} עברו, ${totalFailed} נכשלו, ${totalWarning} אזהרות`;
            if (totalFailed > 0) {
              if (window.showErrorNotification) {
                window.showErrorNotification('בדיקה כללית הושלמה עם שגיאות', message);
              }
            } else if (totalWarning > 0) {
              if (window.showWarningNotification) {
                window.showWarningNotification('בדיקה כללית הושלמה עם אזהרות', message);
              }
            } else {
              if (window.showSuccessNotification) {
                window.showSuccessNotification('בדיקה כללית הושלמה בהצלחה', message);
              }
            }

            console.log('🔍 DEBUG: runAllDefaultsTests completed successfully');

          } catch (error) {
            console.error('❌ Error in runAllDefaultsTests:', error);
            if (window.showErrorNotification) {
              window.showErrorNotification('שגיאה בבדיקה כללית', `שגיאה בהרצת בדיקות ברירות מחדל: ${error.message}`);
            }
          }
        };

        // Define individual entity test functions
        window.runExecutionTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('execution');
          }
        };

        window.runTradeTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('trade');
          }
        };

        window.runTradePlanTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('trade_plan');
          }
        };

        window.runAlertTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('alert');
          }
        };

        window.runTickerTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('ticker');
          }
        };

        window.runTradingAccountTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('trading_account');
          }
        };

        window.runCashFlowTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('cash_flow');
          }
        };

        window.runNoteTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('note');
          }
        };

        window.runWatchListTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('watch_list');
          }
        };

        window.runTradingJournalTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('trading_journal');
          }
        };

        window.runTagCategoryTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('tag');
          }
        };

        window.runUserProfileTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('user');
          }
        };

        window.runPreferenceProfileTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('preference');
          }
        };

        window.runImportSessionTestOnly = async function() {
          if (window.crudTester) {
            await window.crudTester.runSingleEntityTest('import_session');
          }
        };
      },
    ],
  };
}

// ===== AUTH GUARD WITH RETRY LOGIC (Fix Pack 5 Phase 3) =====

/**
 * Ensure user is authenticated for page initialization
 * Provides retry logic and testing environment support
 * @param {string} pageName - Name of the page requiring authentication
 */
async function ensureAuthenticatedForPage(pageName) {
  const MAX_AUTH_RETRIES = 3;
  const AUTH_RETRY_DELAY = 1000; // 1 second

  const startTime = Date.now();

  // ===== HARD FAIL: Verify auth package is loaded for protected pages =====
  // Task 0: Option1 Load-Order Discipline - Hard fail when auth package missing
  if (!window.TikTrackAuth) {
    const errorMsg = `[AUTH PACKAGE MISSING] Protected page '${pageName}' requires auth package but window.TikTrackAuth is not available. Auth package must be loaded before protected pages.`;
    console.error(errorMsg);
    window.Logger?.error(errorMsg, {
      page: 'page-initialization-configs',
      pageName: pageName,
      hasTikTrackAuth: !!window.TikTrackAuth,
      availableGlobals: Object.keys(window).filter(k => k.includes('Auth') || k.includes('auth'))
    });

    // Show critical error and prevent page loading
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאת מערכת: חבילת האימות חסרה', 'error');
    }

    throw new Error(`Auth package missing for protected page: ${pageName}`);
  }

  // region agent log - ensureAuthenticatedForPage entry
  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:entry',message:`ensureAuthenticatedForPage called for ${pageName}`,data:{pageName:pageName,startTime:startTime,documentReadyState:document.readyState,locationHref:window.location.href,hasAuthToken:!!window.authToken,hasCurrentUser:!!window.currentUser,sessionToken:sessionStorage.getItem('authToken'),sessionUser:sessionStorage.getItem('currentUser'),authPackageVerified:!!window.TikTrackAuth},sessionId:'debug-session',runId:'user_profile_loop_fix',hypothesisId:'H1_multiple_calls',timestamp:Date.now()})}).catch(()=>{});
  // endregion

  console.log(`[page-init] 🔐 ensureAuthenticatedForPage called for: ${pageName}`);
  window.Logger?.info(`🔐 Checking authentication for page: ${pageName}`, {
    page: 'page-initialization-configs',
    timestamp: new Date().toISOString()
  });

  // ===== WAIT FOR AUTH BOOTSTRAP COMPLETION =====
  // Ensure auth bootstrap has completed before checking authentication
  if (!window.authToken || !window.currentUser) {
    // Wait for bootstrap to complete
    let bootstrapWaitAttempts = 0;
    while ((!window.authToken || !window.currentUser) && bootstrapWaitAttempts < 100) {
      await new Promise(resolve => setTimeout(resolve, 50));
      bootstrapWaitAttempts++;

      // Check if UnifiedCacheManager can provide the data
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        try {
          const token = await window.UnifiedCacheManager.get('authToken', { layer: 'sessionStorage' });
          const user = await window.UnifiedCacheManager.get('currentUser', { layer: 'sessionStorage' });
          if (token) window.authToken = token;
          if (user) window.currentUser = user;
          window.Logger?.debug(`✅ Synced auth data from UnifiedCacheManager: token=${!!token}, user=${!!user}`, { page: 'page-initialization-configs' });
          break;
        } catch (e) {
          window.Logger?.warn(`Failed to sync auth data: ${e.message}`, { page: 'page-initialization-configs' });
        }
      }
    }

    if (bootstrapWaitAttempts >= 100) {
      window.Logger?.warn(`⚠️ Bootstrap wait timeout after ${bootstrapWaitAttempts} attempts`, { page: 'page-initialization-configs' });
    } else {
      window.Logger?.info(`✅ Bootstrap completed after ${bootstrapWaitAttempts} attempts`, { page: 'page-initialization-configs' });
    }
  }

  // ===== DEBUG INSTRUMENTATION - FIX PACK 5 =====
  // region agent log
  if (typeof fetch !== 'undefined') {
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        location: 'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage',
        message: `auth guard started for page: ${pageName}`,
        data: {
          page: pageName,
          startTime: startTime,
          isTestingEnv: window.AuthTesting?.isTestingEnvironment?.(),
          hasAuthToken: !!window.authToken,
          hasCurrentUser: !!window.currentUser,
          currentUserId: window.currentUser?.id,
          currentUserName: window.currentUser?.username
        },
        sessionId: 'fix_pack_5_test',
        runId: 'auth_guard_verification',
        hypothesisId: 'auth_guard_retry_logic'
      })
    }).catch(() => {});
  }
  // endregion agent log

  for (let attempt = 1; attempt <= MAX_AUTH_RETRIES; attempt++) {
    try {
      // region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            location: 'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:retry_loop',
            message: `auth check attempt ${attempt} for page: ${pageName}`,
            data: {
              page: pageName,
              attempt: attempt,
              hasAuthToken: !!window.authToken,
              hasCurrentUser: !!window.currentUser,
              tokenLength: window.authToken?.length,
              userId: window.currentUser?.id
            },
            sessionId: 'fix_pack_5_test',
            runId: 'auth_guard_verification',
            hypothesisId: 'auth_guard_retry_logic'
          })
        }).catch(() => {});
      }
      // endregion agent log

      // Check if already authenticated (bootstrap or previous check)
      if (window.authToken && window.currentUser) {
        // region agent log
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              location: 'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:already_authenticated',
              message: `authentication already confirmed for ${pageName}`,
              data: {
                page: pageName,
                attempt: attempt,
                userId: window.currentUser.id,
                username: window.currentUser.username
              },
              sessionId: 'fix_pack_5_test',
              runId: 'auth_guard_verification',
              hypothesisId: 'auth_guard_false_negative'
            })
          }).catch(() => {});
        }
        // endregion agent log

        window.Logger?.info(`✅ Authentication confirmed for ${pageName} (attempt ${attempt})`, {
          page: 'page-initialization-configs',
          userId: window.currentUser.id,
          username: window.currentUser.username
        });
        return;
      }

      // If bootstrap didn't set window.authToken/currentUser, try checkAuthentication() to verify with server
      if (window.TikTrackAuth && typeof window.TikTrackAuth.checkAuthentication === 'function') {
        try {
          // region agent log - calling checkAuthentication
          fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              location: 'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:checkAuthentication',
              message: `Calling checkAuthentication for ${pageName}`,
              data: {
                page: pageName,
                attempt: attempt,
                hasAuthToken: !!window.authToken,
                hasCurrentUser: !!window.currentUser,
                timestamp: Date.now()
              },
              sessionId: 'bootstrap_auth_debug',
              runId: 'user_profile_redirect_fix',
              hypothesisId: 'checkAuthentication_call'
            })
          }).catch(() => {});
          // endregion

          const authResult = await window.TikTrackAuth.checkAuthentication();
          if (authResult && authResult.authenticated) {
            // region agent log - checkAuthentication success
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                location: 'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:checkAuthentication_success',
                message: `checkAuthentication succeeded for ${pageName}`,
                data: {
                  page: pageName,
                  attempt: attempt,
                  hasAuthToken: !!window.authToken,
                  hasCurrentUser: !!window.currentUser,
                  timestamp: Date.now()
                },
                sessionId: 'bootstrap_auth_debug',
                runId: 'user_profile_redirect_fix',
                hypothesisId: 'checkAuthentication_success'
              })
            }).catch(() => {});
            // endregion

            window.Logger?.info(`✅ Authentication confirmed via checkAuthentication for ${pageName} (attempt ${attempt})`, {
              page: 'page-initialization-configs'
            });
            return;
          }
        } catch (error) {
          window.Logger?.warn(`⚠️ checkAuthentication failed for ${pageName}:`, error, {
            page: 'page-initialization-configs'
          });
        }
      }

      // No testing auto-login or bypass is allowed; authentication must be real.

      // If no tokens available yet, wait for them (e.g., after login redirect)
      if (!window.authToken && !window.currentUser && attempt === 1) {
        // Wait for auth data to be available
        window.Logger?.info(`⏳ [ensureAuthenticatedForPage] No auth tokens found, waiting for login completion...`, {
          page: 'page-initialization-configs',
          pageName: pageName
        });

        let waitAttempts = 0;
        const maxWaitAttempts = 100; // Wait up to 5 seconds
        while ((!window.authToken || !window.currentUser) && waitAttempts < maxWaitAttempts) {
          await new Promise(resolve => setTimeout(resolve, 50));
          waitAttempts++;

          // Try to sync from sessionStorage if UnifiedCacheManager is available
          if (window.UnifiedCacheManager?.initialized) {
            try {
              const token = await window.UnifiedCacheManager.get('authToken', { layer: 'sessionStorage' });
              const user = await window.UnifiedCacheManager.get('currentUser', { layer: 'sessionStorage' });
              if (token) window.authToken = token;
              if (user) window.currentUser = user;
            } catch (e) {
              // Ignore sync errors
            }
          }
        }

        window.Logger?.info(`✅ [ensureAuthenticatedForPage] Auth wait completed after ${waitAttempts} attempts`, {
          page: 'page-initialization-configs',
          hasAuthToken: !!window.authToken,
          hasCurrentUser: !!window.currentUser
        });

        // If we got the tokens, continue with the check
        if (window.authToken && window.currentUser) {
          continue;
        }
      }

      // If we reach here, authentication failed
      if (attempt === MAX_AUTH_RETRIES) {
        // region agent log
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              location: 'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:final_failure',
              message: `authentication failed after ${MAX_AUTH_RETRIES} attempts for ${pageName}`,
              data: {
                page: pageName,
                maxRetries: MAX_AUTH_RETRIES,
                isTestingEnv: window.AuthTesting?.isTestingEnvironment?.(),
                hasShowErrorNotification: !!window.showErrorNotification
              },
              sessionId: 'fix_pack_5_test',
              runId: 'auth_guard_verification',
              hypothesisId: 'auth_guard_final_failure'
            })
          }).catch(() => {});
        }
        // endregion agent log

        window.Logger?.error(`❌ Authentication failed for ${pageName} after ${MAX_AUTH_RETRIES} attempts`, {
          page: 'page-initialization-configs'
        });

        // Show user-friendly error for non-testing environments
        if (!window.AuthTesting?.isTestingEnvironment?.()) {
          // region agent log
          if (typeof fetch !== 'undefined') {
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                location: 'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:error_notification',
                message: `showing error notification for ${pageName}`,
                data: {
                  page: pageName,
                  hasShowErrorNotification: !!window.showErrorNotification
                },
                sessionId: 'fix_pack_5_test',
                runId: 'auth_guard_verification',
                hypothesisId: 'auth_guard_notification'
              })
            }).catch(() => {});
          }
          // endregion agent log

          if (window.showErrorNotification) {
            window.showErrorNotification(
              'שגיאת התחברות',
              'נדרשת התחברות למערכת. אנא התחבר ונסה שוב.'
            );
          }
        }

        // PRODUCTION: Always redirect to login page, never show modal
        // TESTING: Show modal for automated testing
        const isTestingEnvironment = window.AuthTesting?.isTestingEnvironment?.() ||
                                   window.location.hostname === 'localhost' ||
                                   window.location.hostname === '127.0.0.1' ||
                                   window.location.search.includes('test_mode');

        // REMOVE MODAL FLOW: Always redirect to login page in all environments
        // region agent log - auth guard redirect verification
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            location: 'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage',
            message: 'auth guard triggering redirect to login page',
            data: {
              pageName: pageName,
              port: window.location.port,
              hostname: window.location.hostname,
              pathname: window.location.pathname,
              isTestingEnvironment: isTestingEnvironment,
              redirectUrl: '/login.html',
              timestamp: Date.now(),
              noModalFallback: true
            },
            sessionId: 'auth_flow_verification_8080',
            runId: 'auth_redirect_verification',
            hypothesisId: 'auth_guard_redirect_only'
          })
        }).catch(() => {});
        // endregion

        window.Logger?.info(`🔐 [page-initialization-configs] Authentication required, redirecting to login page for ${pageName}`, {
          page: 'page-initialization-configs',
          isTestingEnvironment
        });

        // region agent log - pre-redirect state
        const preRedirectState = {
          pageName: pageName,
          attempt: attempt,
          hasAuthToken: !!window.authToken,
          hasCurrentUser: !!window.currentUser,
          authTokenValue: window.authToken,
          currentUserValue: window.currentUser,
          isAuthenticated: window.TikTrackAuth?.isAuthenticated?.(),
          sessionStorageAuthToken: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('authToken') : null,
          sessionStorageCurrentUser: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('currentUser') : null,
          documentReadyState: document.readyState,
          windowLocation: window.location.href,
          timestamp: Date.now()
        };
        
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              location: 'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:pre_redirect',
              message: `PRE-REDIRECT STATE for ${pageName}`,
              data: preRedirectState,
              sessionId: 'bootstrap_auth_debug',
              runId: 'user_profile_redirect_fix',
              hypothesisId: 'pre_redirect_state'
            })
          }).catch(() => {});
        }
        // endregion

        // Debug: Show confirm dialog before redirect to allow inspection
        const shouldRedirect = confirm(
          `🔐 Redirect to login?\n\n` +
          `Page: ${pageName}\n` +
          `Attempt: ${attempt}/${MAX_AUTH_RETRIES}\n` +
          `window.authToken: ${!!window.authToken}\n` +
          `window.currentUser: ${!!window.currentUser}\n` +
          `isAuthenticated(): ${window.TikTrackAuth?.isAuthenticated?.()}\n` +
          `sessionStorage.authToken: ${typeof sessionStorage !== 'undefined' ? !!sessionStorage.getItem('authToken') : 'N/A'}\n` +
          `sessionStorage.currentUser: ${typeof sessionStorage !== 'undefined' ? !!sessionStorage.getItem('currentUser') : 'N/A'}\n\n` +
          `Check console for full state object: window.preRedirectState`
        );

        // Store state in window for console inspection
        window.preRedirectState = preRedirectState;

        // region agent log - redirect decision
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/page-initialization-configs.js:ensureAuthenticatedForPage:redirect_decision',message:`Redirect decision for ${pageName}: ${shouldRedirect}`,data:{pageName:pageName,attempt:attempt,shouldRedirect:shouldRedirect,preRedirectState:preRedirectState},sessionId:'debug-session',runId:'user_profile_loop_fix',hypothesisId:'H2_redirect_loop',timestamp:Date.now()})}).catch(()=>{});
        // endregion

        if (!shouldRedirect) {
          // User cancelled - don't redirect (for debugging)
          return;
        }

        window.location.href = '/login.html';

        // Don't throw error - we've handled it with modal/redirect
        return;
      }

      // Wait before retry
      window.Logger?.info(`⏳ Waiting before auth retry ${attempt + 1}/${MAX_AUTH_RETRIES} for ${pageName}`, {
        page: 'page-initialization-configs'
      });
      await new Promise(resolve => setTimeout(resolve, AUTH_RETRY_DELAY));

    } catch (error) {
      window.Logger?.warn(`⚠️ Auth check error for ${pageName} (attempt ${attempt}): ${error.message}`, {
        page: 'page-initialization-configs'
      });

      if (attempt === MAX_AUTH_RETRIES) {
        throw error;
      }
    }
  }
}

// Export pageInitializationConfigs for core-systems.js to find
if (typeof window !== 'undefined') {
  window.pageInitializationConfigs = pageInitializationConfigs;
  // Alias watch list page keys for underscore/hyphen variants
  if (pageInitializationConfigs['watch-list']) {
    pageInitializationConfigs['watch-lists'] = pageInitializationConfigs['watch-list'];
    pageInitializationConfigs['watch_lists'] = pageInitializationConfigs['watch-list'];
  }
  if (pageInitializationConfigs['init-system-management']) {
    pageInitializationConfigs['init_system_management'] = pageInitializationConfigs['init-system-management'];
  }
  window.ensureAuthenticatedForPage = ensureAuthenticatedForPage;
}
