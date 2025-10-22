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
 *         console.log('New script loaded!');
 *     }
 *     
 *     // IMPORTANT: Create Global for identification
 *     window.MyNewScript = {
 *         init: myNewFunction,
 *         version: '1.0.0'
 *     };
 *     
 *     console.log('✅ MyNewScript loaded successfully');
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
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-details', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
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
                // console.log('📊 Initializing Dashboard...');
                
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
        // - 'system-management': ניהול מערכת (constraint-manager.js)
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'validation', 'system-management', 'entity-details', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.initializePreferences'
        ],
        
        // ← NEW: מטאדאטה
        description: 'עמוד העדפות משתמש - הגדרות מערכת וצבעים',
        lastModified: '2025-10-19',
        pageType: 'settings',
        
        // ← NEW: אופטימיזציה
        preloadAssets: ['preferences-data'],
        cacheStrategy: 'persistent',
        
        // קיים
        requiresFilters: false,
        requiresValidation: true,
        requiresTables: false,
        customInitializers: [
            // Preferences-specific initialization
            async (pageConfig) => {
                console.log('⚙️ Initializing Preferences...');
                
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
        // - 'crud': מערכות CRUD ו-entity-details
        // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-details', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.loadTradesData'
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
                console.log('📈 Initializing Trades...');
                
                // Use the new unified initialization function
                if (typeof window.initializeTradesPage === 'function') {
                    await window.initializeTradesPage();
                } else {
                    // Fallback to old method
                    if (typeof window.loadTradesData === 'function') {
                        await window.loadTradesData();
                    }
                }
            },
            async (pageConfig) => {
                console.log('🔧 Initializing Trades Conditions System...');
                
                // Initialize conditions system for trades
                if (typeof window.initializeTradeConditionsSystem === 'function') {
                    window.initializeTradeConditionsSystem();
                } else {
                    console.warn('⚠️ Trades conditions system not available');
                }
            }
        ]
    },
    
    'executions': {
        name: 'Executions',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
        // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
        // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
        // - 'crud': מערכות CRUD ו-entity-details
        // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-details', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.loadExecutionsData'
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
                console.log('⚡ Initializing Executions...');
                
                if (typeof window.loadExecutionsData === 'function') {
                    await window.loadExecutionsData();
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
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-details', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.loadTradePlansData'
        ],
        
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('📋 Initializing Trade Plans...');
                
                // Use the new unified initialization function
                if (typeof window.initializeTradePlansPage === 'function') {
                    await window.initializeTradePlansPage();
                } else {
                    // Fallback to old method
                    if (typeof window.loadTradePlansData === 'function') {
                        await window.loadTradePlansData();
                    }
                }
            },
            async (pageConfig) => {
                console.log('🔧 Initializing Trade Plans Conditions System...');
                
                // Initialize conditions system for trade plans
                if (typeof window.initializeTradePlanConditionsSystem === 'function') {
                    window.initializeTradePlanConditionsSystem();
                } else {
                    console.warn('⚠️ Trade plans conditions system not available');
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
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-details', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.loadAlertsData'
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
                console.log('🔔 Initializing Alerts...');
                
                if (typeof window.loadAlertsData === 'function') {
                    await window.loadAlertsData();
                }
                
                // Setup alert-specific handlers (function not implemented yet)
                // if (typeof window.setupAlertHandlers === 'function') {
                //     window.setupAlertHandlers();
                // }
            },
            async (pageConfig) => {
                console.log('🔧 Initializing Alerts Conditions Integration...');
                
                // Initialize conditions integration for alerts
                if (typeof window.initializeAlertModalTabs === 'function') {
                    window.initializeAlertModalTabs();
                } else {
                    console.warn('⚠️ Alert modal tabs system not available');
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
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-details', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.loadTradingAccountsDataForTradingAccountsPage'
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
                
                if (typeof window.loadTradingAccountsDataForTradingAccountsPage === 'function') {
                    console.log('📡 Calling loadTradingAccountsDataForTradingAccountsPage...');
                    await window.loadTradingAccountsDataForTradingAccountsPage();
                } else if (typeof window.loadAccountsData === 'function') {
                    console.log('📡 Calling loadAccountsData...');
                    await window.loadAccountsData();
                } else {
                    console.log('⚠️ No suitable function found for loading trading accounts data');
                }
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
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-details', 'init-system'],
        requiredGlobals: [
            'NotificationSystem',    // from base package
            'DataUtils',            // from services package  
            'window.loadCashFlowsData'
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
                console.log('💰 Initializing Cash Flows...');
                
                // אתחול מערכת ההעדפות לפני טעינת הנתונים
                if (window.PreferencesSystem && !window.PreferencesSystem.initialized) {
                    console.log('⚙️ Initializing PreferencesSystem for Cash Flows...');
                    await window.PreferencesSystem.initialize();
                }
                
                if (typeof window.loadCashFlowsData === 'function') {
                    await window.loadCashFlowsData();
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
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-details', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
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
                console.log('📊 Initializing Tickers...');
                
                if (typeof window.loadTickersData === 'function') {
                    await window.loadTickersData();
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
        // - 'crud': מערכות CRUD ו-entity-details
        // - 'preferences': מערכת העדפות (לקריאת צבעים והגדרות)
        // - 'init-system': מערכות אתחול וניטור (נטען בכל עמוד)
        packages: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-details', 'init-system'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils',
            'window.loadNotesData'
        ],
        
        requiresFilters: true,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('📝 Initializing Notes...');
                
                if (typeof window.loadNotesData === 'function') {
                    await window.loadNotesData();
                }
            }
        ]
    },
    
    // Development Tools
    'system-management': {
        name: 'System Management',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
        // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
        // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
        // - 'crud': מערכות CRUD ו-entity-details
        packages: ['base', 'services', 'ui-advanced', 'crud'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils'
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
                console.log('🔧 Initializing System Management...');
                
                if (typeof window.loadSystemInfo === 'function') {
                    await window.loadSystemInfo();
                }
                
                // Initialize Unified Log System
                if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
                    try {
                        await window.UnifiedLogAPI.initialize();
                        console.log('✅ Unified Log System initialized for System Management');
                    } catch (error) {
                        console.warn('⚠️ Failed to initialize Unified Log System:', error);
                    }
                }
            }
        ]
    },
    
    'server-monitor': {
        name: 'Server Monitor',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        packages: ['base', 'services', 'ui-advanced', 'crud'],
        
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils'
        ],
        
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('🔧 Initializing Server Monitor...');
                
                // Initialize server monitor if available
                if (window.serverMonitor) {
                    console.log('✅ Server Monitor already initialized');
                } else {
                    console.log('⚠️ Server Monitor not available');
                }
                
                console.log('✅ Server Monitor initialization completed');
            }
        ]
    },
    
    'crud-testing-dashboard': {
        name: 'CRUD Testing',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        packages: ['base', 'services', 'ui-advanced', 'crud'],
        
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils'
        ],
        
        requiresFilters: false,
        requiresValidation: true,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('🧪 Initializing CRUD Testing...');
                
                if (typeof window.initializeCRUDTesting === 'function') {
                    await window.initializeCRUDTesting();
                }
            }
        ]
    },
    
    'external-data-dashboard': {
        name: 'External Data',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        // - 'base': מערכות ליבה בסיסיות (התראות, שגיאות, צבעים, תאריכים)
        // - 'services': שירותי עזר כלליים (נתונים, שדות, סטטיסטיקות)
        // - 'ui-advanced': ממשק משתמש מתקדם (כפתורים, טבלאות, עימוד)
        // - 'crud': מערכות CRUD ו-entity-details
        packages: ['base', 'services', 'ui-advanced', 'crud'],
        
        // ← NEW: בדיקות תקינות
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils'
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
                console.log('🌐 Initializing External Data...');
                
                // Check if ExternalDataDashboard class is available
                console.log('🔍 Checking ExternalDataDashboard availability:', {
                    ExternalDataDashboard: typeof ExternalDataDashboard,
                    windowExternalDataDashboard: typeof window.ExternalDataDashboard
                });
                
                if (typeof window.loadExternalData === 'function') {
                    await window.loadExternalData();
                }
                
                // Initialize External Data Dashboard
                if (typeof ExternalDataDashboard !== 'undefined' && !window.externalDataDashboard) {
                    try {
                        window.externalDataDashboard = new ExternalDataDashboard();
                        window.externalDataDashboard.init();
                        console.log('✅ External Data Dashboard initialized');
                    } catch (error) {
                        console.error('❌ Failed to initialize External Data Dashboard:', error);
                    }
                } else {
                    console.log('🔍 External Data Dashboard check:', {
                        ExternalDataDashboard: typeof ExternalDataDashboard,
                        externalDataDashboard: typeof window.externalDataDashboard
                    });
                }
                
                // Initialize Unified Log System
                if (window.UnifiedLogAPI && !window.UnifiedLogAPI.initialized) {
                    try {
                        await window.UnifiedLogAPI.initialize();
                        console.log('✅ Unified Log System initialized for External Data Dashboard');
                    } catch (error) {
                        console.warn('⚠️ Failed to initialize Unified Log System:', error);
                    }
                }
                
                // Define global functions for button onclick handlers
                console.log('🔧 Defining global functions for External Data Dashboard...');
                
                window.testProvider = function(providerId) {
                    // console.log('🧪 Testing provider:', providerId);
                    // Implementation for testing specific provider
                };

                window.toggleProvider = function(providerId) {
                    // console.log('🔄 Toggling provider:', providerId);
                    // Implementation for toggling provider status
                };

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
                    console.log('🔔 testAllProviders called from global function');
                    if (window.externalDataDashboard) {
                        window.externalDataDashboard.testAllProviders();
                    } else {
                        console.error('❌ externalDataDashboard not available');
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
                                console.warn(`Unknown chart ID: ${chartId}`);
                        }
                    }
                };
                
                console.log('✅ Global functions defined for External Data Dashboard');
                
                // Load external data log after page initialization
                setTimeout(async () => {
                    try {
                        if (typeof window.loadExternalDataLog === 'function') {
                            await window.loadExternalDataLog();
                            console.log('✅ External data log loaded after page initialization');
                        }
                    } catch (error) {
                        console.error('❌ Failed to load external data log:', error);
                    }
                }, 1000); // Wait 1 second after page load
            }
        ]
    },
    
    'linter-realtime-monitor': {
        name: 'Linter Monitor',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        packages: ['base', 'services', 'ui-advanced', 'crud'],
        
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils'
        ],
        
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('🔍 Initializing Linter Monitor...');
                
                if (typeof window.startLinterMonitoring === 'function') {
                    await window.startLinterMonitoring();
                }
            }
        ]
    },
    
    'notifications-center': {
        name: 'Notifications Center',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        packages: ['base', 'services', 'ui-advanced', 'crud'],
        
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils'
        ],
        
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('📬 Initializing Notifications Center...');
                
                if (typeof window.initializeNotificationsCenter === 'function') {
                    await window.initializeNotificationsCenter();
                } else if (typeof window.loadNotifications === 'function') {
                    await window.loadNotifications();
                }
            }
        ]
    },
    'notifications-center.html': {
        name: 'Notifications Center HTML',
        
        // 📦 STANDARD BASIC PACKAGE FOR ALL PAGES:
        packages: ['base', 'services', 'ui-advanced', 'crud'],
        
        requiredGlobals: [
            'NotificationSystem',
            'DataUtils'
        ],
        
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: false,
        customInitializers: [
            async (pageConfig) => {
                console.log('📬 Initializing Notifications Center HTML...');
                
                if (typeof window.initializeNotificationsCenter === 'function') {
                    await window.initializeNotificationsCenter();
                } else if (typeof window.loadNotifications === 'function') {
                    await window.loadNotifications();
                }
                
                // Initialize Unified Log System if available
                if (window.UnifiedLogAPI) {
                    console.log('📊 Initializing Unified Log System for notifications center...');
                    try {
                        await window.UnifiedLogAPI.initialize();
                        
                        // Load notification log in the correct container
                        const logContainer = document.getElementById('notification-log-container');
                        if (logContainer && !logContainer.querySelector('.unified-log-display')) {
                            console.log('🔄 Loading notification log in container...');
                            await window.showNotificationLog('notification-log-container', {
                                displayConfig: 'default',
                                autoRefresh: true,
                                refreshInterval: 10000
                            });
                        }
                    } catch (error) {
                        console.warn('⚠️ Failed to initialize Unified Log System:', error);
                    }
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
                console.log('📊 Initializing Unified Logs Demo...');
                
                // Initialize Unified Log System
                if (window.UnifiedLogAPI) {
                    try {
                        await window.UnifiedLogAPI.initialize();
                        console.log('✅ Unified Log System initialized for demo');
                    } catch (error) {
                        console.warn('⚠️ Failed to initialize Unified Log System for demo:', error);
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
                console.log('🗄️ Initializing Database Display...');
                
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
                console.log('🔬 Initializing Research...');
                
                if (typeof window.initializeResearchTools === 'function') {
                    await window.initializeResearchTools();
                }
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
                console.log('🗄️ Initializing Database Extra Data...');
                if (typeof window.loadExtraData === 'function') {
                    await window.loadExtraData();
                }
            }
        ]
    },
    
    'constraints': {
        name: 'System Constraints',
        packages: ['base', 'validation', 'preferences'],
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
                console.log('🔒 Initializing System Constraints...');
                if (typeof window.loadConstraints === 'function') {
                    await window.loadConstraints();
                }
            }
        ]
    },
    
    'background-tasks': {
        name: 'Background Tasks',
        packages: ['base', 'system-management', 'preferences'],
        requiredGlobals: [
            'NotificationSystem',
            'window.loadBackgroundTasks',
            'window.BackgroundTaskManager'
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
                console.log('⚙️ Initializing Background Tasks...');
                if (typeof window.loadBackgroundTasks === 'function') {
                    await window.loadBackgroundTasks();
                }
            }
        ]
    },
    
    'page-scripts-matrix': {
        name: 'Page Scripts Matrix',
        packages: ['base', 'dev-tools', 'preferences'],
        requiredGlobals: [
            'NotificationSystem',
            'window.loadScriptsMatrix',
            'window.ScriptsMatrix'
        ],
        description: 'מטריצת סקריפטים לעמודים',
        lastModified: '2025-10-19',
        pageType: 'development',
        preloadAssets: ['scripts-matrix'],
        cacheStrategy: 'standard',
        requiresFilters: false,
        requiresValidation: false,
        requiresTables: true,
        customInitializers: [
            async (pageConfig) => {
                console.log('📊 Initializing Page Scripts Matrix...');
                if (typeof window.loadScriptsMatrix === 'function') {
                    await window.loadScriptsMatrix();
                }
            }
        ]
    },
    
    'css-management': {
        name: 'CSS Management',
        packages: ['base', 'dev-tools', 'preferences'],
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
                console.log('🎨 Initializing CSS Management...');
                if (typeof window.loadCSSManagement === 'function') {
                    await window.loadCSSManagement();
                }
            }
        ]
    },
    
    'dynamic-colors-display': {
        name: 'Dynamic Colors Display',
        packages: ['base', 'preferences'],
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
                console.log('🌈 Initializing Dynamic Colors Display...');
                if (typeof window.loadColorDisplay === 'function') {
                    await window.loadColorDisplay();
                }
            }
        ]
    },
    
    'designs': {
        name: 'Design Gallery',
        packages: ['base', 'preferences'],
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
                console.log('🎭 Initializing Design Gallery...');
                if (typeof window.loadDesigns === 'function') {
                    await window.loadDesigns();
                }
            }
        ]
    },
    
    'chart-management': {
        name: 'Chart Management',
        packages: ['base', 'charts', 'preferences'],
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
                console.log('📈 Initializing Chart Management...');
                if (typeof window.loadChartManagement === 'function') {
                    await window.loadChartManagement();
                }
            }
        ]
    },
    
    // Init System Management
    'init-system-management': {
        name: 'Init System Management',
        packages: ['base', 'dev-tools', 'preferences'],
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
                console.log('🚀 Initializing Init System Management...');
                // Init system management specific initialization
            }
        ]
    },
    
    // Cache Management
    'cache-management': {
        name: 'Cache Management',
        packages: ['base', 'system-management', 'preferences'],
        requiredGlobals: [
            'NotificationSystem',
            'window.loadCacheManagement',
            'window.CacheManager'
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
                console.log('🗄️ Initializing Cache Management...');
                if (typeof window.loadCacheManagement === 'function') {
                    await window.loadCacheManagement();
                }
            }
        ]
    },
    
    // Conditions Test
    'conditions-test': {
        name: 'Conditions Test',
        packages: ['base', 'validation', 'preferences'],
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
                console.log('🧪 Initializing Conditions Test...');
                if (typeof window.loadConditionsTest === 'function') {
                    await window.loadConditionsTest();
                }
            }
        ]
    }
};

// ===== GLOBAL EXPORT =====

// Merge additional configs
Object.assign(PAGE_CONFIGS, ADDITIONAL_PAGE_CONFIGS);

window.PAGE_CONFIGS = PAGE_CONFIGS;
window.pageInitializationConfigs = PAGE_CONFIGS;

