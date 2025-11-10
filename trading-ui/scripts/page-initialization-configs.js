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
    'index': {
        name: 'Dashboard',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
        // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
        // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
        // - 'crud': מערכות CRUD ו-entity-details
        // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
        // - 'entity-details': מערכות פרטי ישויות
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-details', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.Logger',
            'window.CacheSyncManager',
            'window.loadDashboardData'
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
            async (pageConfig) => {
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
                        window.Logger?.warn('⚠️ Error loading accounts data:', error, { page: "page-initialization-configs" });
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
                        if (window.CacheTTLGuard?.ensure) {
                            await window.CacheTTLGuard.ensure('dashboard-data', window.loadDashboardData);
                        } else {
                            await window.loadDashboardData();
                        }
                    }
                }
                
                // Initialize positions & portfolio system
                if (typeof window.initPositionsPortfolio === 'function') {
                    try {
                        await window.initPositionsPortfolio(false); // Don't auto-select account on home page
                    } catch (error) {
                        window.Logger?.warn('⚠️ Error initializing positions portfolio:', error, { page: "page-initialization-configs" });
                    }
                }
            }
        ]
    },
    
    'preferences': {
        name: 'Preferences',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
        // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
        // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
        // - 'crud': מערכות CRUD ו-entity-details
        // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
        // - 'validation': מערכת ולידציה (validation-utils.js)
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        // NOTE: constraint-manager.js נטען בנפרד כקובץ page-specific (לא דרך חבילת system-management)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'validation', 'entity-details', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.Logger',
            'window.CacheSyncManager',
            'window.initializePreferences'
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
        sectionsDefaultState: 'closed',  // 'closed' | 'open'
        
        // קיים
        requiresFilters: false,
        requiresValidation: true,
        requiresTables: false,
        customInitializers: [
            // Preferences-specific initialization
            async (pageConfig) => {
                window.Logger.info('⚙️ Initializing Preferences...', { page: "page-initialization-configs" });
                
                // Load trading accounts for default account preference
                if (typeof window.loadAccountsForPreferences === 'function') {
                    await window.loadAccountsForPreferences();
                }
                
                // טעינת מערכת העדפות
                if (typeof window.initializePreferences === 'function') {
                    await window.initializePreferences();
                } else if (typeof window.loadAllPreferences === 'function') {
                    await window.loadAllPreferences();
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
            }
        ]
    },
    
    // Trading Pages
    'trades': {
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
        packages: ['base', 'services', 'modules', 'ui-advanced', 'crud', 'preferences', 'validation', 'entity-details', 'entity-services', 'info-summary', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.Logger',
            'window.CacheSyncManager',
            'window.ModalManagerV2',
            'window.InvestmentCalculationService',
            'window.loadTradesData',
            'window.checkLinkedItemsBeforeAction',
            'window.RichTextEditorService',
            'window.Quill',
            'window.DOMPurify'
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
            async (pageConfig) => {
                window.Logger.info('📈 Initializing Trades...', { page: "page-initialization-configs" });
                
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
            async (pageConfig) => {
                window.Logger.info('🔧 Initializing Trades Conditions System...', { page: "page-initialization-configs" });
                
                // Initialize conditions system for trades
                if (typeof window.initializeTradeConditionsSystem === 'function') {
                    window.initializeTradeConditionsSystem();
                } else {
                    window.Logger.warn('⚠️ Trades conditions system not available', { page: "page-initialization-configs" });
                }
            }
        ]
    },
    
    'executions': {
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
        packages: ['base', 'services', 'modules', 'ui-advanced', 'crud', 'preferences', 'validation', 'entity-details', 'entity-services', 'info-summary', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.Logger',
            'window.CacheSyncManager',
            'window.loadExecutionsData',
            'window.SelectPopulatorService',
            'window.tickerService',
            'window.loadUserPreferences', // From modules/ui-advanced.js (modules package)
            'window.RichTextEditorService',
            'window.Quill',
            'window.DOMPurify'
        ],
        
        // ← NEW: מטאדאטה
        description: 'מעקב ביצועי עסקאות - היסטוריית עסקאות שבוצעו',
        lastModified: '2025-10-19',
        pageType: 'crud',
        
        // ← NEW: אופטימיזציה
        preloadAssets: ['executions-data'],
        cacheStrategy: 'aggressive',
        
        // קיים
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('⚡ Initializing Executions...', { page: "page-initialization-configs" });
                
                // Load user preferences first
                if (typeof window.loadUserPreferences === 'function') {
                    window.Logger.info('⚙️ Loading user preferences for Executions...', { page: "page-initialization-configs" });
                    
                    // Debug current profile
                    console.log('🧪 Current PreferencesCore state:', {
                        currentUserId: window.PreferencesCore?.currentUserId,
                        currentProfileId: window.PreferencesCore?.currentProfileId
                    });
                    
                    const prefs = await window.loadUserPreferences();
                    console.log('🧪 loadUserPreferences returned:', prefs);
                } else {
                    console.warn('⚠️ loadUserPreferences not available!');
                }
                
                if (typeof window.loadExecutionsData === 'function') {
                    if (window.CacheTTLGuard?.ensure) {
                        await window.CacheTTLGuard.ensure('executions-data', window.loadExecutionsData);
                    } else {
                        await window.loadExecutionsData();
                    }
                }
                
                // Initialize import modal
                if (typeof window.initializeImportUserDataModal === 'function') {
                    window.Logger.info('📥 Initializing Import User Data Modal...', { page: "page-initialization-configs" });
                    window.initializeImportUserDataModal();
                }
            }
        ]
    },
    
    'data_import': {
        name: 'Data Import',
        
        // 📦 Required packages for the Data Import dashboard
        packages: ['base', 'services', 'modules', 'ui-advanced', 'crud', 'preferences', 'validation', 'entity-services', 'entity-details', 'info-summary', 'init-system'],
        
        requiredGlobals: [
            'NotificationSystem',
            'window.Logger',
            'window.ModalManagerV2',
            'window.initializeDataImportPage',
            'window.refreshDataImportHistory',
            'window.showImportUserDataNotification'
        ],
        
        description: 'דף מרכזי לניהול תהליכי ייבוא נתונים ושיגור המודול המאוחד',
        lastModified: '2025-11-11',
        pageType: 'crud',
        
        requiresFilters: false,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async () => {
                if (typeof window.initializeDataImportPage === 'function') {
                    await window.initializeDataImportPage();
                }
            }
        ]
    },
    
    'trade_plans': {
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
        packages: ['base', 'services', 'modules', 'ui-advanced', 'crud', 'preferences', 'validation', 'entity-services', 'entity-details', 'info-summary', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.loadTradePlansData',
            'window.ModalManagerV2',
            'window.InvestmentCalculationService',
            'window.RichTextEditorService',
            'window.Quill',
            'window.DOMPurify'
        ],
        
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('📋 Initializing Trade Plans...', { page: "page-initialization-configs" });
                
                // Load trade plans data directly
                if (typeof window.loadTradePlansData === 'function') {
                    if (window.CacheTTLGuard?.ensure) {
                        await window.CacheTTLGuard.ensure('trade-plans-data', window.loadTradePlansData);
                    } else {
                        await window.loadTradePlansData();
                    }
                } else {
                    window.Logger.warn('⚠️ loadTradePlansData function not available', { page: "page-initialization-configs" });
                }
            },
            async (pageConfig) => {
                window.Logger.info('🔧 Initializing Trade Plans Conditions System...', { page: "page-initialization-configs" });
                
                // Initialize conditions system for trade plans
                if (typeof window.initializeTradePlanConditionsSystem === 'function') {
                    window.initializeTradePlanConditionsSystem();
                } else {
                    window.Logger.warn('⚠️ Trade plans conditions system not available', { page: "page-initialization-configs" });
                }
            }
        ]
    },
    
    'alerts': {
        name: 'Alerts',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
        // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
        // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
        // - 'crud': מערכות CRUD ו-entity-details
        // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
        // - 'info-summary': מערכת סיכום נתונים מאוחדת
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'modules', 'ui-advanced', 'crud', 'preferences', 'validation', 'entity-services', 'entity-details', 'info-summary', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.loadAlertsData',
            'window.ModalManagerV2',
            'window.RichTextEditorService',
            'window.Quill',
            'window.DOMPurify'
        ],
        
        // ← NEW: מטאדאטה
        description: 'מערכת התראות עסקיות - ניהול תנאי שוק והתראות',
        lastModified: '2025-10-19',
        pageType: 'crud',
        
        // ← NEW: אופטימיזציה
        preloadAssets: ['alerts-data'],
        cacheStrategy: 'aggressive',
        
        // קיים
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('🔔 Initializing Alerts...', { page: "page-initialization-configs" });
                
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
            async (pageConfig) => {
                window.Logger.info('🔧 Initializing Alerts Conditions Integration...', { page: "page-initialization-configs" });
                
                // Initialize conditions integration for alerts
                if (typeof window.initializeAlertModalTabs === 'function') {
                    window.initializeAlertModalTabs();
                } else {
                    window.Logger.warn('⚠️ Alert modal tabs system not available', { page: "page-initialization-configs" });
                }
            }
        ]
    },
    
    // Account Management
    'trading_accounts': {
        name: 'Trading Accounts',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
        // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
        // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
        // - 'crud': מערכות CRUD ו-entity-details
        // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
        // - 'info-summary': מערכת סיכום נתונים מאוחדת
        // - 'entity-services': שירותי ישויות (כולל LinkedItemsService לפריטים מקושרים)
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'validation', 'entity-details', 'entity-services', 'info-summary', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.loadTradingAccountsDataForTradingAccountsPage',
            'window.RichTextEditorService',
            'window.Quill',
            'window.DOMPurify'
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
            async (pageConfig) => {
                console.log('🏦 Initializing Trading Accounts...');
                console.log('🔍 Checking function availability:');
                console.log('  - loadTradingAccountsDataForTradingAccountsPage:', typeof window.loadTradingAccountsDataForTradingAccountsPage);
                console.log('  - loadAccountsData:', typeof window.loadAccountsData);
                window.Logger.info('🏦 Initializing Trading Accounts...', { page: "page-initialization-configs" });
                window.Logger.info('🔍 Checking function availability:', { page: "page-initialization-configs" });
                window.Logger.info('  - loadTradingAccountsDataForTradingAccountsPage:', typeof window.loadTradingAccountsDataForTradingAccountsPage, { page: "page-initialization-configs" });
                window.Logger.info('  - loadAccountsData:', typeof window.loadAccountsData, { page: "page-initialization-configs" });
                
                const loadTradingAccounts =
                    typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function'
                        ? window.loadTradingAccountsDataForTradingAccountsPage
                        : window.loadAccountsData;
                if (typeof loadTradingAccounts === 'function') {
                    console.log('📡 Calling trading accounts loader via CacheTTLGuard...');
                    window.Logger.info('📡 Calling trading accounts loader via CacheTTLGuard...', { page: "page-initialization-configs" });
                    if (window.CacheTTLGuard?.ensure) {
                        await window.CacheTTLGuard.ensure('accounts-data', loadTradingAccounts);
                    } else {
                        await loadTradingAccounts();
                    }
                } else {
                    console.warn('⚠️ No suitable function found for loading trading accounts data');
                    window.Logger.info('⚠️ No suitable function found for loading trading accounts data', { page: "page-initialization-configs" });
                }
                // Initialize account activity system
                if (typeof window.initAccountActivity === 'function') {
                    await window.initAccountActivity(true); // Auto-select default account
                }
                
                // Initialize positions & portfolio system
                if (typeof window.initPositionsPortfolio === 'function') {
                    await window.initPositionsPortfolio(true); // Auto-select default account
                }
                
                console.log('✅ Trading Accounts initialization completed');
            }
        ]
    },
    
    'cash_flows': {
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
        packages: ['base', 'services', 'ui-advanced', 'modules', 'crud', 'preferences', 'validation', 'entity-details', 'info-summary', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',    // from base package
            'DataUtils',            // from services package  
            'window.loadCashFlowsData',
            'window.RichTextEditorService',
            'window.Quill',
            'window.DOMPurify'
        ],
        description: 'ניהול תזרימי מזומנים - הכנסות והוצאות',
        lastModified: '2025-10-19',
        pageType: 'crud',
        preloadAssets: ['cash-flows-data'],
        cacheStrategy: 'standard',
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('💰 Initializing Cash Flows...', { page: "page-initialization-configs" });
                
                // אתחול מערכת ההעדפות לפני טעינת הנתונים
                if (window.PreferencesSystem && !window.PreferencesSystem.initialized) {
                    window.Logger.info('⚙️ Initializing PreferencesSystem for Cash Flows...', { page: "page-initialization-configs" });
                    await window.PreferencesSystem.initialize();
                }
                
                if (typeof window.loadCashFlowsData === 'function') {
                    if (window.CacheTTLGuard?.ensure) {
                        await window.CacheTTLGuard.ensure('cash_flows-data', window.loadCashFlowsData);
                    } else {
                        await window.loadCashFlowsData();
                    }
                }
            }
        ]
    },
    
    // Data Management
    'tickers': {
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
        packages: ['base', 'services', 'modules', 'ui-advanced', 'crud', 'preferences', 'validation', 'entity-details', 'info-summary', 'external-data', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'ExternalDataService',
            'window.loadTickersData'
        ],
        
        // ← NEW: מטאדאטה
        description: 'ניהול טיקרים - מעקב מחירים ונתונים פיננסיים',
        lastModified: '2025-10-19',
        pageType: 'crud',
        
        // ← NEW: אופטימיזציה
        preloadAssets: ['tickers-data'],
        cacheStrategy: 'aggressive',
        
        // קיים
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('📊 Initializing Tickers...', { page: "page-initialization-configs" });
                
                if (typeof window.loadTickersData === 'function') {
                    if (window.CacheTTLGuard?.ensure) {
                        await window.CacheTTLGuard.ensure('tickers-data', window.loadTickersData);
                    } else {
                        await window.loadTickersData();
                    }
                }
            }
        ]
    },
    
    'notes': {
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
        packages: ['base', 'services', 'ui-advanced', 'modules', 'crud', 'preferences', 'validation', 'entity-services', 'entity-details', 'info-summary', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.loadNotesData',
            'window.RichTextEditorService',
            'window.Quill',
            'window.DOMPurify'
        ],
        
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('📝 [page-initialization-configs] Notes customInitializer started');
                
                // Use general system getPageDataFunctions() instead of local code
                if (typeof window.getPageDataFunctions === 'function') {
                    console.log('✅ [page-initialization-configs] getPageDataFunctions found');
                    const { loadData } = window.getPageDataFunctions();
                    console.log('🔍 [page-initialization-configs] loadData type:', typeof loadData);
                    
                    if (loadData && typeof loadData === 'function') {
                        console.log('📝 [page-initialization-configs] Initializing Notes via general system...');
                        try {
                            await loadData();
                            console.log('✅ [page-initialization-configs] Notes data loaded successfully');
                        } catch (error) {
                            console.error('❌ [page-initialization-configs] Error loading notes data:', error);
                        }
                    } else {
                        console.warn('⚠️ [page-initialization-configs] loadData is not a function, trying fallback...');
                        // Fallback to direct function call if general system doesn't have it
                        if (typeof window.loadNotesData === 'function') {
                            console.log('📝 [page-initialization-configs] Initializing Notes (fallback to loadNotesData via TTL guard)...');
                            try {
                                if (window.CacheTTLGuard?.ensure) {
                                    await window.CacheTTLGuard.ensure('notes-data', window.loadNotesData);
                                } else {
                                    await window.loadNotesData();
                                }
                                console.log('✅ [page-initialization-configs] Notes data loaded successfully (fallback)');
                            } catch (error) {
                                console.error('❌ [page-initialization-configs] Error in loadNotesData:', error);
                            }
                        } else {
                            console.error('❌ [page-initialization-configs] loadNotesData function not available');
                        }
                    }
                } else {
                    console.warn('⚠️ [page-initialization-configs] getPageDataFunctions not found, trying direct loadNotesData...');
                    // Fallback if getPageDataFunctions doesn't exist
                    if (typeof window.loadNotesData === 'function') {
                        console.log('📝 [page-initialization-configs] Initializing Notes (direct loadNotesData via TTL guard)...');
                        try {
                            if (window.CacheTTLGuard?.ensure) {
                                await window.CacheTTLGuard.ensure('notes-data', window.loadNotesData);
                            } else {
                                await window.loadNotesData();
                            }
                            console.log('✅ [page-initialization-configs] Notes data loaded successfully (direct)');
                        } catch (error) {
                            console.error('❌ [page-initialization-configs] Error in loadNotesData:', error);
                        }
                    } else {
                        console.error('❌ [page-initialization-configs] loadNotesData function not available');
                    }
                }
            }
        ]
    },
    
    // Development Tools
    'system-management': {
        name: 'System Management',
        
        // החבילות הדרושות למערכת הניהול המשולבת
        packages: ['base', 'logs', 'cache', 'system-management', 'management', 'init-system'],
        
        requiredGlobals: [
            'NotificationSystem',
            'window.systemManagement'
        ],
        
        // ← NEW: מטאדאטה
        description: 'כלי ניהול מערכת - מעקב ביצועים, לוגים וסטטיסטיקות',
        lastModified: '2025-10-19',
        pageType: 'admin',
        
        // ← NEW: אופטימיזציה
        preloadAssets: ['system-info'],
        cacheStrategy: 'minimal',
        
        // קיים
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('🔧 Initializing System Management...', { page: "page-initialization-configs" });
                
                if (typeof window.loadSystemInfo === 'function') {
                    await window.loadSystemInfo();
                }
                
                // Initialize Unified Log System
                if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
                    try {
                        await window.UnifiedLogAPI.initialize();
                        window.Logger.info('✅ Unified Log System initialized for System Management', { page: "page-initialization-configs" });
                    } catch (error) {
                        window.Logger.warn('⚠️ Failed to initialize Unified Log System:', error, { page: "page-initialization-configs" });
                    }
                }
            }
        ]
    },
    
    'server-monitor': {
        name: 'Server Monitor',
        
        packages: ['base', 'management', 'init-system'],
        
        requiredGlobals: [
            'NotificationSystem',
            'window.serverMonitor'
        ],
        
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('🔧 Initializing Server Monitor...', { page: "page-initialization-configs" });
                
                // Initialize server monitor if available
                if (window.serverMonitor) {
                    window.Logger.info('✅ Server Monitor already initialized', { page: "page-initialization-configs" });
                } else {
                    window.Logger.info('⚠️ Server Monitor not available', { page: "page-initialization-configs" });
                }
                
                window.Logger.info('✅ Server Monitor initialization completed', { page: "page-initialization-configs" });
            }
        ]
    },
    
    'external-data-dashboard': {
        name: 'External Data',
        
        packages: ['base', 'logs', 'external-data', 'init-system'],
        
        requiredGlobals: [
            'NotificationSystem',
            'window.ExternalDataDashboard',
            'window.YahooFinanceService'
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
            async (pageConfig) => {
                window.Logger.info('🌐 Initializing External Data...', { page: "page-initialization-configs" });
                
                // Ensure dashboard instance is ready
                if (!window.externalDataDashboard && typeof window.ExternalDataDashboard === 'function') {
                    window.externalDataDashboard = new window.ExternalDataDashboard();
                    window.externalDataDashboard.init();
                    window.Logger.info('✅ External Data Dashboard initialized', { page: "page-initialization-configs" });
                }
                
                // Initialize Unified Log System
                if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
                    try {
                        await window.UnifiedLogAPI.initialize();
                        window.Logger.info('✅ Unified Log System initialized for External Data Dashboard', { page: "page-initialization-configs" });
                    } catch (error) {
                        window.Logger.warn('⚠️ Failed to initialize Unified Log System:', error, { page: "page-initialization-configs" });
                    }
                }
                
                // Define global functions for button onclick handlers
                window.Logger.info('🔧 Defining global functions for External Data Dashboard...', { page: "page-initialization-configs" });
                
                window.refreshLogs = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.loadLogs();
                    }
                };

                window.saveSettings = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.saveSettings();
                    }
                };

                window.clearLogs = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.clearLogs();
                    }
                };

                window.analyzeData = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.analyzeData();
                    }
                };

                window.backupData = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.backupData();
                    }
                };

                window.optimizeCache = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.optimizeCache();
                    }
                };

                window.refreshProviders = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.loadProviders();
                    }
                };

                window.testAllProviders = function() {
                    window.Logger.info('🔔 testAllProviders called from global function', { page: "page-initialization-configs" });
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.testAllProviders();
                    } else {
                        window.Logger.error('❌ externalDataDashboard not available', { page: "page-initialization-configs" });
                    }
                };

                window.exportData = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.exportData();
                    }
                };

                window.resetSettings = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.resetSettings();
                    }
                };

                window.refreshGroupHistory = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.loadGroupRefreshHistory();
                    }
                };

                window.exportGroupHistory = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.exportGroupHistory();
                    }
                };

                window.validateData = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.validateData();
                    }
                };

                window.runUnitTests = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.runUnitTests();
                    }
                };

                window.testSpecificFunction = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.testSpecificFunction();
                    }
                };

                window.generateTestReport = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.generateTestReport();
                    }
                };

                window.startPerformanceMonitoring = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.startPerformanceMonitoring();
                    }
                };

                window.analyzeBottlenecks = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.analyzeBottlenecks();
                    }
                };

                window.stopPerformanceMonitoring = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.stopPerformanceMonitoring();
                    }
                };

                window.testAPIEndpoints = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.testAPIEndpoints();
                    }
                };

                window.testRateLimiting = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.testRateLimiting();
                    }
                };

                window.testErrorHandling = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.testErrorHandling();
                    }
                };

                window.refreshPerformanceCharts = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.refreshPerformanceCharts();
                    }
                };

                window.exportPerformanceData = function() {
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.exportPerformanceData();
                    }
                };

                window.refreshChart = function(chartId) {
                    if (window.externalDataDashboard) {
                        switch(chartId) {
                            case 'responseTimeChart':
                                window.externalDataDashboard.refreshPerformanceCharts();
                                break;
                            case 'dataQualityChart':
                                window.externalDataDashboard.refreshPerformanceCharts();
                                break;
                            case 'providerComparisonChart':
                                window.externalDataDashboard.refreshPerformanceCharts();
                                break;
                            case 'errorAnalysisChart':
                                window.externalDataDashboard.refreshPerformanceCharts();
                                break;
                            default:
                                window.Logger.warn(`Unknown chart ID: ${chartId}`, { page: "page-initialization-configs" });
                        }
                    }
                };
                
                window.Logger.info('✅ Global functions defined for External Data Dashboard', { page: "page-initialization-configs" });
                
                // Load external data log after page initialization
                setTimeout(async () => {
                    try {
                        if (typeof window.loadExternalDataLog === 'function') {
                            await window.loadExternalDataLog();
                            window.Logger.info('✅ External data log loaded after page initialization', { page: "page-initialization-configs" });
                        }
                    } catch (error) {
                        window.Logger.error('❌ Failed to load external data log:', error, { page: "page-initialization-configs" });
                    }
                }, 1000); // Wait 1 second after page load
            }
        ]
    },
    
    'linter-realtime-monitor': {
        name: 'Linter Monitor',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        packages: ['base', 'init-system'],
        
        requiredGlobals: [
            'NotificationSystem'
        ],
        
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('🔍 Initializing Linter Monitor...', { page: "page-initialization-configs" });
                
                if (typeof window.startLinterMonitoring === 'function') {
                    await window.startLinterMonitoring();
                }
            }
        ]
    },
    
    'notifications-center': {
        name: 'Notifications Center',
        packages: ['base', 'crud', 'logs', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'window.initializeNotificationsCenter'
        ],
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async () => {
                window.Logger.info('📬 Initializing Notifications Center...', { page: "page-initialization-configs" });

                if (typeof window.initializeNotificationsCenter === 'function') {
                    await window.initializeNotificationsCenter();
                } else if (typeof window.loadNotifications === 'function') {
                    await window.loadNotifications();
                } else {
                    window.Logger.warn('⚠️ Notifications Center initializer not found', { page: "page-initialization-configs" });
                }
            }
        ]
    },
    'notifications-center.html': {
        name: 'Notifications Center HTML',
        packages: ['base', 'crud', 'logs', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'window.initializeNotificationsCenter'
        ],
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async () => {
                window.Logger.info('📬 Initializing Notifications Center (HTML)...', { page: "page-initialization-configs" });

                if (typeof window.initializeNotificationsCenter === 'function') {
                    await window.initializeNotificationsCenter();
                } else if (typeof window.loadNotifications === 'function') {
                    await window.loadNotifications();
                } else {
                    window.Logger.warn('⚠️ Notifications Center initializer not found', { page: "page-initialization-configs" });
                }
            }
        ]
    },

    'unified-logs-demo.html': {
        name: 'Unified Logs Demo',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('📊 Initializing Unified Logs Demo...', { page: "page-initialization-configs" });
                
                // Initialize Unified Log System
                if (window.UnifiedLogAPI) {
                    try {
                        await window.UnifiedLogAPI.initialize();
                        window.Logger.info('✅ Unified Log System initialized for demo', { page: "page-initialization-configs" });
                    } catch (error) {
                        window.Logger.warn('⚠️ Failed to initialize Unified Log System for demo:', error, { page: "page-initialization-configs" });
                    }
                }
            }
        ]
    },
    
    'db_display': {
        name: 'Database Display',
        packages: ['base', 'crud', 'preferences'],
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: true,
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.loadDatabaseInfo',
            'window.loadUserPreferences'
        ],
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('🗄️ Initializing Database Display...', { page: "page-initialization-configs" });
                
                if (typeof window.loadDatabaseInfo === 'function') {
                    await window.loadDatabaseInfo();
                }
            }
        ]
    },
    
    'research': {
        name: 'Research',
        requiresFilters: true,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('🔬 Initializing Research...', { page: "page-initialization-configs" });
                
                if (typeof window.initializeResearchTools === 'function') {
                    await window.initializeResearchTools();
                }
            }
        ]
    },
    
    'background-tasks': {
        name: 'Background Tasks',
        packages: ['base', 'crud', 'logs', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'window.startScheduler',
            'window.refreshBackgroundTasksLog'
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
            async (pageConfig) => {
                window.Logger.info('⚙️ Initializing Background Tasks...', { page: "page-initialization-configs" });
                if (typeof window.initializeBackgroundTasksLog === 'function') {
                    window.initializeBackgroundTasksLog();
                }
            }
        ]
    },
    
    'init-system-management': {
        name: 'Init System Management',
        packages: ['base', 'dev-tools', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'PackageManifest',
            'RuntimeValidator',
            'ScriptAnalyzer',
            'PageTemplateGenerator'
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
            function() {
                window.Logger.info('🚀 Initializing Init System Management...', { page: "page-initialization-configs" });
                // Init system management specific initialization
            }
        ]
    },
    
    // Cache Management
    'cache-management': {
        name: 'Cache Management',
        packages: ['base', 'logs', 'cache', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'window.cacheManagementPage',
            'window.refreshCacheStats'
        ],
        description: 'ניהול מטמון מערכת - ניקוי, אופטימיזציה וניטור',
        lastModified: '2025-10-19',
        pageType: 'system',
        preloadAssets: ['cache-data'],
        cacheStrategy: 'standard',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('🗄️ Initializing Cache Management...', { page: "page-initialization-configs" });
                if (typeof window.refreshCacheStats === 'function') {
                    await window.refreshCacheStats();
                }
            }
        ]
    },
    
    // Conditions Test
    'conditions-test': {
        name: 'Conditions Test',
        packages: ['base', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'window.loadConditionsTest',
            'window.ConditionsTestManager'
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
            async (pageConfig) => {
                window.Logger.info('🧪 Initializing Conditions Test...', { page: "page-initialization-configs" });
                if (typeof window.loadConditionsTest === 'function') {
                    await window.loadConditionsTest();
                }
            }
        ]
    },
    
    // CRUD Testing Dashboard
    'crud-testing-dashboard': {
        name: 'CRUD Testing Dashboard',
        packages: ['base', 'services', 'ui-advanced', 'crud', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'CRUDEnhancedTester',
            'window.runCRUDTests',
            'window.runAPITests',
            'window.runUITests'
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
            async (pageConfig) => {
                window.Logger.info('🧪 Initializing CRUD Testing Dashboard...', { page: "page-initialization-configs" });
                
                // Initialize CRUD Enhanced Tester
                if (typeof window.CRUDEnhancedTester !== 'undefined') {
                    window.crudTester = new window.CRUDEnhancedTester();
                    window.Logger.info('✅ CRUD Enhanced Tester initialized', { page: "page-initialization-configs" });
                }
                
                // Define global functions for CRUD testing
                window.runCRUDTests = function() {
                    if (window.crudTester) {
                        window.crudTester.runAllTests();
                    }
                };
                
                window.runAPITests = function() {
                    if (window.crudTester) {
                        window.crudTester.runAPITests();
                    }
                };
                
                window.runUITests = function() {
                    if (window.crudTester) {
                        window.crudTester.runUITests();
                    }
                };
                
                window.Logger.info('✅ CRUD Testing Dashboard initialized successfully', { page: "page-initialization-configs" });
            }
        ]
    }
};

// ===== CONFIGURATION HELPER FUNCTIONS =====

/**
 * Get page configuration by page name
 * @param {string} pageName - Page name
 * @returns {Object} Page configuration
 */
window.getPageConfig = function(pageName) {
    return PAGE_CONFIGS[pageName] || {
        name: pageName,
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: []
    };
};

/**
 * Get all available page configurations
 * @returns {Object} All page configurations
 */
window.getAllPageConfigs = function() {
    return PAGE_CONFIGS;
};

/**
 * Check if page requires specific system
 * @param {string} pageName - Page name
 * @param {string} system - System name (filters, validation, tables)
 * @returns {boolean} Whether page requires the system
 */
window.pageRequiresSystem = function(pageName, system) {
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
window.getPageInitSummary = function(pageName) {
    const config = window.getPageConfig(pageName);
    
    return {
        name: config.name,
        systems: {
            filters: config.requiresFilters,
            validation: config.requiresValidation,
            tables: config.requiresTables
        },
        customInitializers: config.customInitializers.length,
        totalSystems: (config.requiresFilters ? 1 : 0) + 
                     (config.requiresValidation ? 1 : 0) + 
                     (config.requiresTables ? 1 : 0) + 
                     config.customInitializers.length
    };
};

// ===== ADDITIONAL PAGE CONFIGS =====

const ADDITIONAL_PAGE_CONFIGS = {
    // Test page for monitoring system
    'test-monitoring': {
        name: 'Test Monitoring Page',
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'DataCollectionService',
            'UnifiedCacheManager',
            'Logger'
        ],
        description: 'עמוד בדיקה למערכת הניטור וכלי יצירת קוד טעינה',
        lastModified: '2025-01-31',
        pageType: 'test',
        preloadAssets: [],
        cacheStrategy: 'none',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: []
    },
    
    // Missing pages from documentation
    'db_extradata': {
        name: 'Database Extra Data',
        packages: ['base', 'crud', 'preferences'],
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.loadExtraData',
            'window.loadUserPreferences'
        ],
        description: 'תצוגת נתונים נוספים במסד הנתונים',
        lastModified: '2025-10-19',
        pageType: 'database',
        preloadAssets: ['extra-data'],
        cacheStrategy: 'standard',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('🗄️ Initializing Database Extra Data...', { page: "page-initialization-configs" });
                if (typeof window.loadExtraData === 'function') {
                    await window.loadExtraData();
                }
            }
        ]
    },
    
    'constraints': {
        name: 'System Constraints',
        packages: ['base', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'window.loadConstraints',
            'window.ConstraintManager'
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
            async (pageConfig) => {
                window.Logger.info('🔒 Initializing System Constraints...', { page: "page-initialization-configs" });
                if (typeof window.loadConstraints === 'function') {
                    await window.loadConstraints();
                }
            }
        ]
    },
    
    'css-management': {
        name: 'CSS Management',
        packages: ['base', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'window.loadCSSManagement',
            'window.CSSManager'
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
            async (pageConfig) => {
                window.Logger.info('🎨 Initializing CSS Management...', { page: "page-initialization-configs" });
                if (typeof window.loadCSSManagement === 'function') {
                    await window.loadCSSManagement();
                }
            }
        ]
    },
    
    'dynamic-colors-display': {
        name: 'Dynamic Colors Display',
        packages: ['base', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'window.loadColorDisplay',
            'window.ColorSchemeSystem'
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
            async (pageConfig) => {
                window.Logger.info('🌈 Initializing Dynamic Colors Display...', { page: "page-initialization-configs" });
                if (typeof window.loadColorDisplay === 'function') {
                    await window.loadColorDisplay();
                }
            }
        ]
    },
    
    'designs': {
        name: 'Design Gallery',
        packages: ['base', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'window.loadDesigns',
            'window.DesignGallery'
        ],
        description: 'גלריית עיצובים',
        lastModified: '2025-10-19',
        pageType: 'utility',
        preloadAssets: ['designs-data'],
        cacheStrategy: 'standard',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('🎭 Initializing Design Gallery...', { page: "page-initialization-configs" });
                if (typeof window.loadDesigns === 'function') {
                    await window.loadDesigns();
                }
            }
        ]
    },
    
    'chart-management': {
        name: 'Chart Management',
        packages: ['base', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'window.loadChartManagement',
            'window.ChartManagement'
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
            async (pageConfig) => {
                window.Logger.info('📈 Initializing Chart Management...', { page: "page-initialization-configs" });
                if (typeof window.loadChartManagement === 'function') {
                    await window.loadChartManagement();
                }
            }
        ]
    },
    
    // Init System Management
    'init-system-management': {
        name: 'Init System Management',
        packages: ['base', 'dev-tools', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'PackageManifest',
            'RuntimeValidator',
            'ScriptAnalyzer',
            'PageTemplateGenerator'
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
            function() {
                window.Logger.info('🚀 Initializing Init System Management...', { page: "page-initialization-configs" });
                // Init system management specific initialization
            }
        ]
    },
    
    // Cache Management
    'cache-management': {
        name: 'Cache Management',
        packages: ['base', 'logs', 'cache', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'window.cacheManagementPage',
            'window.refreshCacheStats'
        ],
        description: 'ניהול מטמון מערכת - ניקוי, אופטימיזציה וניטור',
        lastModified: '2025-10-19',
        pageType: 'system',
        preloadAssets: ['cache-data'],
        cacheStrategy: 'standard',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                window.Logger.info('🗄️ Initializing Cache Management...', { page: "page-initialization-configs" });
                if (typeof window.refreshCacheStats === 'function') {
                    await window.refreshCacheStats();
                }
            }
        ]
    },
    
    // Conditions Test
    'conditions-test': {
        name: 'Conditions Test',
        packages: ['base', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'window.loadConditionsTest',
            'window.ConditionsTestManager'
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
            async (pageConfig) => {
                window.Logger.info('🧪 Initializing Conditions Test...', { page: "page-initialization-configs" });
                if (typeof window.loadConditionsTest === 'function') {
                    await window.loadConditionsTest();
                }
            }
        ]
    },
    
    // CRUD Testing Dashboard
    'crud-testing-dashboard': {
        name: 'CRUD Testing Dashboard',
        packages: ['base', 'services', 'ui-advanced', 'crud', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',
            'CRUDEnhancedTester',
            'window.runCRUDTests',
            'window.runAPITests',
            'window.runUITests'
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
            async (pageConfig) => {
                window.Logger.info('🧪 Initializing CRUD Testing Dashboard...', { page: "page-initialization-configs" });
                
                // Initialize CRUD Enhanced Tester
                if (typeof window.CRUDEnhancedTester !== 'undefined') {
                    window.crudTester = new window.CRUDEnhancedTester();
                    window.Logger.info('✅ CRUD Enhanced Tester initialized', { page: "page-initialization-configs" });
                }
                
                // Define global functions for CRUD testing
                window.runCRUDTests = function() {
                    if (window.crudTester) {
                        window.crudTester.runAllTests();
                    }
                };
                
                window.runAPITests = function() {
                    if (window.crudTester) {
                        window.crudTester.runAPITests();
                    }
                };
                
                window.runUITests = function() {
                    if (window.crudTester) {
                        window.crudTester.runUITests();
                    }
                };
                
                window.Logger.info('✅ CRUD Testing Dashboard initialized successfully', { page: "page-initialization-configs" });
            }
        ]
    }
};

// ===== GLOBAL EXPORT =====

// Merge additional configs
Object.assign(PAGE_CONFIGS, ADDITIONAL_PAGE_CONFIGS);

const CACHE_CONTROL_GLOBAL = 'window.CacheControlMenu';
Object.values(PAGE_CONFIGS).forEach((config) => {
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
console.log('✅ PAGE_CONFIGS loaded, trading_accounts exists:', !!PAGE_CONFIGS.trading_accounts);
} else {
  // אם PAGE_CONFIGS כבר הוגדר, נמזג רק את הקונפיגים החדשים
  if (typeof PAGE_CONFIGS !== 'undefined') {
    Object.assign(window.PAGE_CONFIGS, PAGE_CONFIGS);
  }
}

