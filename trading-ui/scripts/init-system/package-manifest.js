/**
 * Package Manifest - TikTrack Initialization System
 * מנפסט חבילות מרכזי לניהול תלויות ובדיקות תקינות
 *
 * ⚠️ IMPORTANT FOR DEVELOPERS:
 * ============================
 *
 * This file defines the PACKAGE STRUCTURE for the monitoring system.
 * When you add new scripts to pages, you MUST update this file to avoid monitoring errors.
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
 * STEP 2: Update This File (Package Manifest)
 * -------------------------------------------
 * Add to appropriate package:
 * 'my-package': {
 *     id: 'my-package',
 *     name: 'My Package',
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
 * STEP 3: Update Page Configuration
 * ---------------------------------
 * Update page-initialization-configs.js for the specific page:
 * 'my-page': {
 *     packages: ['base', 'my-package'],
 *     requiredGlobals: ['window.MyNewScript']
 * }
 *
 * STEP 4: Test the Integration
 * ----------------------------
 * 1. Load the page
 * 2. Check console for "✅ MyNewScript loaded successfully"
 * 3. Run monitoring system to verify no errors
 *
 * 📋 PACKAGE STRUCTURE (Updated October 2025):
 * ============================================
 *
 * 1. BASE (13 scripts) - חובה לכל עמוד
 * 2. SERVICES (6 scripts) - שירותים כלליים
 * 3. UI-ADVANCED (3 scripts) - ממשק מתקדם
 * 4. CRUD (6 scripts) - עמודים עם טבלאות
 * 5. PREFERENCES (3 scripts) - העדפות
 * 6. VALIDATION (1 script) - ולידציה
 * 7. EXTERNAL-DATA (4 scripts) - נתונים חיצוניים
 * 8. LOGS (4 scripts) - לוגים
 * 9. CACHE (2 scripts) - מטמון
 * 10. ENTITY-SERVICES (9 scripts) - שירותי ישויות
 * 11. HELPER (4 scripts) - עזר
 * 12. MANAGEMENT (5 scripts) - ניהול
 * 13. INIT (3 scripts) - אתחול
 *
 * @version 2.0.0
 * @created October 2025
 * @author TikTrack Development Team
 */

const PACKAGE_MANIFEST = {
  // 1. BASE PACKAGE - חובה לכל עמוד
  base: {
    id: 'base',
    name: 'Base Package',
    description: 'מערכות ליבה חובה לכל עמוד',
    version: '2.0.0',
    critical: true,
    loadOrder: 1,
    dependencies: [],
    scripts: [
      {
        file: 'api-config.js',
        globalCheck: 'window.API_BASE_URL',
        description: 'הגדרות API מרכזיות',
        required: true,
        loadOrder: 0
      },
      {
        file: 'global-favicon.js',
        globalCheck: 'window.setFavicon',
        description: 'ניהול favicon',
        required: true,
        loadOrder: 1
      },
      {
        file: 'notification-system.js',
        globalCheck: 'window.NotificationSystem',
        description: 'מערכת התראות',
        required: true,
        loadOrder: 2
      },
      {
        file: 'cache-sync-manager.js',
        globalCheck: 'window.CacheSyncManager',
        description: 'מנהל סנכרון מטמון',
        required: true,
        loadOrder: 3
      },
      {
        file: 'ui-utils.js',
        globalCheck: 'window.toggleSection',
        description: 'כלי עזר UI',
        required: true,
        loadOrder: 4
      },
      {
        file: 'warning-system.js',
        globalCheck: 'window.WarningSystem',
        description: 'מערכת אזהרות',
        required: true,
        loadOrder: 5
      },
      {
        file: 'error-handlers.js',
        globalCheck: 'window.handleApiError',
        description: 'מערכת טיפול בשגיאות',
        required: true,
        loadOrder: 6
      },
      {
        file: 'unified-cache-manager.js',
        globalCheck: 'window.UnifiedCacheManager',
        description: 'מנהל מטמון מאוחד',
        required: true,
        loadOrder: 7
      },
      {
        file: 'icon-mappings.js',
        globalCheck: 'window.IconMappings',
        description: 'מיפוי איקונים מרכזי',
        required: true,
        loadOrder: 7.5
      },
      {
        file: 'icon-system.js',
        globalCheck: 'window.IconSystem',
        description: 'מערכת איקונים מרכזית',
        required: true,
        loadOrder: 7.6
      },
      {
        file: 'cache-clear-menu.js',
        globalCheck: 'window.CacheControlMenu',
        description: 'שליטת ניקוי מטמון(Stage B-Lite)',
        required: true,
        loadOrder: 8
      },
      {
        file: 'cache-ttl-guard.js',
        globalCheck: 'window.CacheTTLGuard',
        description: 'TTL guard for entity loaders',
        required: true,
        loadOrder: 9
      },
      {
        file: 'logger-service.js',
        globalCheck: 'window.Logger',
        description: 'שירות לוגים מתקדם',
        required: true,
        loadOrder: 10
      },
      {
        file: 'header-system.js',
        globalCheck: 'window.HeaderSystem',
        description: 'מערכת כותרת',
        required: true,
        loadOrder: 11
      },
      {
        file: 'page-state-manager.js',
        globalCheck: 'window.PageStateManager',
        description: 'מנהל מצב עמודים מאוחד',
        required: true,
        loadOrder: 12
      },
      {
        file: 'page-utils.js',
        globalCheck: 'window.loadPageState',
        description: 'כלי עזר עמוד',
        required: true,
        loadOrder: 13
      },
      {
        file: 'translation-utils.js',
        globalCheck: 'window.translateStatus',
        description: 'תרגומים',
        required: true,
        loadOrder: 14
      },
      {
        file: 'button-icons.js',
        globalCheck: 'window.BUTTON_ICONS',
        description: 'מערכת איקונים וכפתורים',
        required: true,
        loadOrder: 15
      },
      {
        file: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
        globalCheck: 'window.bootstrap',
        description: 'Bootstrap JS Bundle (Tooltips & Modals)',
        required: true,
        loadOrder: 16,
        external: true
      },
      {
        file: 'event-handler-manager.js',
        globalCheck: 'window.EventHandlerManager',
        description: 'מערכת ניהול אירועים מרכזית',
        required: true,
        loadOrder: 17
      },
      {
        file: 'button-system-init.js',
        globalCheck: 'window.ButtonSystem',
        description: 'מערכת כפתורים',
        required: true,
        loadOrder: 18
      },
      {
        file: 'color-scheme-system.js',
        globalCheck: 'window.loadDynamicColors',
        description: 'מערכת צבעים דינמית',
        required: true,
        loadOrder: 19
      },
      {
        file: 'debug-modal-z-index.js',
        globalCheck: 'window.debugModalZIndex',
        description: 'כלי דיבאג לבדיקת שכבות z-index של מודלים',
        required: false,
        loadOrder: 20
      },
      {
        file: 'modules/core-systems.js',
        globalCheck: 'window.UnifiedAppInitializer',
        description: 'מערכת אתחול מאוחדת - נקודת כניסה אחת (חובה לכל עמוד)',
        required: true,
        loadOrder: 21
      }
    ],
    estimatedSize: '~280KB',
    initTime: '~150ms'
  },

  // 2. SERVICES PACKAGE - שירותים כלליים
  services: {
    id: 'services',
    name: 'Services Package',
    description: 'שירותים כלליים',
    version: '2.0.0',
    critical: false,
    loadOrder: 2,
    dependencies: ['base'],
    scripts: [
      {
        file: 'services/data-collection-service.js',
        globalCheck: 'window.DataCollectionService',
        description: 'שירות איסוף נתונים',
        required: true,
        loadOrder: 1
      },
      {
        file: 'services/field-renderer-service.js',
        globalCheck: 'window.FieldRendererService',
        description: 'שירות רנדור שדות',
        required: true,
        loadOrder: 2
      },
      {
        file: 'services/select-populator-service.js',
        globalCheck: 'window.SelectPopulatorService',
        description: 'שירות מילוי select boxes',
        required: true,
        loadOrder: 3
      },
      {
        file: 'services/statistics-calculator.js',
        globalCheck: 'window.StatisticsCalculator',
        description: 'מחשבון סטטיסטיקות',
        required: true,
        loadOrder: 4
      },
      {
        file: 'services/default-value-setter.js',
        globalCheck: 'window.DefaultValueSetter',
        description: 'שירות ברירות מחדל',
        required: true,
        loadOrder: 5
      },
      {
        file: 'services/preferences-data.js',
        globalCheck: 'window.PreferencesData',
        description: 'שירות נתוני העדפות (API + Cache)',
        required: true,
        loadOrder: 5.1
      },
      {
        file: 'services/executions-data.js',
        globalCheck: 'window.loadExecutionsData',
        description: 'שירות נתונים לביצועים',
        required: false,
        loadOrder: 5.2
      },
      {
        file: 'services/crud-response-handler.js',
        globalCheck: 'window.CrudResponseHandler',
        description: 'מטפל בתגובות CRUD',
        required: true,
        loadOrder: 6
      },
      {
        file: 'services/unified-crud-service.js',
        globalCheck: 'window.UnifiedCRUDService',
        description: 'שירות CRUD מאוחד לכל הישויות',
        required: true,
        loadOrder: 6.5
      },
      {
        file: 'services/research-data.js',
        globalCheck: 'window.ResearchData',
        description: 'שירות נתוני תחקיר',
        required: false,
        loadOrder: 6.6
      },
      {
        file: 'services/investment-calculation-service.js',
        globalCheck: 'window.InvestmentCalculationService',
        description: 'חישובי סכום ↔ כמות לטפסי השקעות',
        required: true,
        loadOrder: 7
      },
      {
        file: 'services/tag-service.js',
        globalCheck: 'window.TagService',
        description: 'שירות תגיות מרכזי (ניהול ואחזור תגיות)',
        required: true,
        loadOrder: 8
      },
      {
        file: 'services/table-sort-value-adapter.js',
        globalCheck: 'window.TableSortValueAdapter',
        description: 'Adapter למסירת ערכי מיון אחידים (DateEnvelope, legacy)',
        required: true,
        loadOrder: 9
      },
      {
        file: 'services/lint-status-service.js',
        globalCheck: 'window.LintStatusService',
        description: 'שירות סטטוס לינטר מאוחד (קריאת API והמרת נתונים)',
        required: true,
        loadOrder: 10
      },
      {
        file: 'services/alert-condition-renderer.js',
        globalCheck: 'window.AlertConditionRenderer',
        description: 'מציג תנאי התראות',
        required: false,
        loadOrder: 11
      },
      {
        file: 'https://cdn.jsdelivr.net/npm/quill@1.3.7/dist/quill.min.js',
        globalCheck: 'window.Quill',
        description: 'Quill.js - Rich Text Editor Library',
        required: true,
        loadOrder: 12,
        external: true
      },
      {
        file: 'https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js',
        globalCheck: 'window.DOMPurify',
        description: 'DOMPurify - HTML Sanitizer',
        required: true,
        loadOrder: 13,
        external: true
      },
      {
        file: 'services/rich-text-editor-service.js',
        globalCheck: 'window.RichTextEditorService',
        description: 'שירות עורך טקסט עשיר',
        required: true,
        loadOrder: 14
      }
    ],
    estimatedSize: '~180KB',
    initTime: '~100ms'
  },

  // 3. UI-ADVANCED PACKAGE - ממשק מתקדם
  'ui-advanced': {
    id: 'ui-advanced',
    name: 'UI Advanced Package',
    description: 'ממשק משתמש מתקדם',
    version: '2.0.0',
    critical: false,
    loadOrder: 3,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'table-mappings.js',
        globalCheck: 'window.TABLE_COLUMN_MAPPINGS',
        description: 'מיפוי טבלאות',
        required: true,
        loadOrder: 0
      },
      {
        file: 'tables.js',
        globalCheck: 'window.sortTableData',
        description: 'מערכת טבלאות',
        required: true,
        loadOrder: 1
      },
      {
        file: 'table-data-registry.js',
        globalCheck: 'window.TableDataRegistry',
        description: 'רישום נתוני טבלאות',
        required: true,
        loadOrder: 2
      },
      {
        file: 'pagination-system.js',
        globalCheck: 'window.PaginationSystem',
        description: 'מערכת עימוד',
        required: true,
        loadOrder: 3
      },
      {
        file: 'modules/actions-menu-system.js',
        globalCheck: 'window.ActionsMenuSystem',
        description: 'מערכת תפריט פעולות',
        required: true,
        loadOrder: 4
      }
    ],
    estimatedSize: '~80KB',
    initTime: '~50ms'
  },

  // 3.5. MODULES PACKAGE - מודולים
  modules: {
    id: 'modules',
    name: 'Modules Package',
    description: 'מודולים כלליים',
    version: '2.0.0',
    critical: false,
    loadOrder: 3.5,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'modal-navigation-manager.js',
        globalCheck: 'window.modalNavigationManager',
        description: 'מערכת ניווט מודולים מקוננים',
        required: true,
        loadOrder: 1
      },
      {
        file: 'modal-manager-v2.js',
        globalCheck: 'window.ModalManagerV2',
        description: 'מנהל מודלים V2',
        required: true,
        loadOrder: 2
      },
      {
        file: 'tag-ui-manager.js',
        globalCheck: 'window.TagUIManager',
        description: 'ניהול בחירת תגיות במודלים',
        required: true,
        loadOrder: 3
      },
      {
        file: 'tag-events.js',
        globalCheck: 'window.TagEvents',
        description: 'מערכת אירועים גלובלית לתגיות',
        required: true,
        loadOrder: 4
      },
      {
        file: 'modules/data-basic.js',
        globalCheck: 'window.DataBasic',
        description: 'נתונים בסיסיים',
        required: true,
        loadOrder: 6
      },
      {
        file: 'modules/ui-basic.js',
        globalCheck: 'window.UIBasic',
        description: 'ממשק בסיסי',
        required: true,
        loadOrder: 7
      },
      {
        file: 'modules/data-advanced.js',
        globalCheck: 'window.DataAdvanced',
        description: 'נתונים מתקדמים',
        required: true,
        loadOrder: 8
      },
      {
        file: 'modules/ui-advanced.js',
        globalCheck: 'window.UIAdvanced',
        description: 'ממשק מתקדם',
        required: true,
        loadOrder: 9,
        exports: ['window.loadUserPreferences'] // Explicitly document that this script exports loadUserPreferences
      },
      {
        file: 'modules/communication-module.js',
        globalCheck: 'window.CommunicationModule',
        description: 'מודול תקשורת',
        required: true,
        loadOrder: 10
      },
      {
        file: 'modules/business-module.js',
        globalCheck: 'window.BusinessModule',
        description: 'מודול עסקי',
        required: true,
        loadOrder: 11
      },
      {
        file: 'modules/localstorage-sync.js',
        globalCheck: 'window.LocalStorageSync',
        description: 'סנכרון localStorage',
        required: true,
        loadOrder: 12
      },
      {
        file: 'modules/dynamic-loader-config.js',
        globalCheck: 'window.DynamicLoaderConfig',
        description: 'תצורת טעינה דינמית',
        required: true,
        loadOrder: 13
      },
      {
        file: 'import-user-data.js',
        globalCheck: 'window.openImportUserDataModal',
        description: 'מודל ייבוא נתוני ביצועים',
        required: true,
        loadOrder: 14
      },
      {
        file: 'modal-configs/trading-accounts-config.js',
        globalCheck: 'window.tradingAccountsModalConfig',
        description: 'קונפיגורציית מודל חשבונות מסחר',
        required: false,
        loadOrder: 15
      },
      {
        file: 'modal-configs/alerts-config.js',
        globalCheck: 'window.alertsModalConfig',
        description: 'קונפיגורציית מודל התראות',
        required: false,
        loadOrder: 16
      },
      {
        file: 'modal-configs/trades-config.js',
        globalCheck: 'window.tradesModalConfig',
        description: 'קונפיגורציית מודל טריידים',
        required: true,
        loadOrder: 17
      },
      {
        file: 'modal-configs/executions-config.js',
        globalCheck: 'window.executionsModalConfig',
        description: 'קונפיגורציית מודל ביצועים (ספציפי לעמוד executions)',
        required: false,
        loadOrder: 18
      },
      {
        file: 'modal-configs/trade-plans-config.js',
        globalCheck: 'window.tradePlansModalConfig',
        description: 'קונפיגורציית מודל תוכניות מסחר',
        required: true,
        loadOrder: 19
      },
      {
        file: 'modal-configs/tickers-config.js',
        globalCheck: 'window.tickersModalConfig',
        description: 'קונפיגורציית מודל טיקרים',
        required: false,
        loadOrder: 20
      },
      {
        file: 'modal-configs/cash-flows-config.js',
        globalCheck: 'window.cashFlowModalConfig',
        description: 'קונפיגורציית מודל תזרימי מזומנים',
        required: false,
        loadOrder: 21
      },
      {
        file: 'modal-configs/notes-config.js',
        globalCheck: 'window.notesModalConfig',
        description: 'קונפיגורציית מודל הערות',
        required: false, // Not required for tag-management page
        loadOrder: 22
      },
      {
        file: 'modal-configs/tag-management-config.js',
        globalCheck: 'window.tagModalConfig',
        description: 'קונפיגורציית מודלים למערכת התגיות',
        required: true,
        loadOrder: 23
      },
      {
        file: 'trade-selector-modal.js',
        globalCheck: 'window.tradeSelectorModal',
        description: 'מודל בחירת טרייד',
        required: false,
        loadOrder: 24
      }
    ],
    estimatedSize: '~250KB',
    initTime: '~140ms'
  },

  // 4. CRUD PACKAGE - עמודים עם טבלאות
  crud: {
    id: 'crud',
    name: 'CRUD Operations Package',
    description: 'מערכות לניהול נתונים וטבלאות',
    version: '2.0.0',
    critical: false,
    loadOrder: 4,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'date-utils.js',
        globalCheck: 'window.formatDate',
        description: 'כלי עזר תאריכים',
        required: true,
        loadOrder: 1
      },
      {
        file: 'data-utils.js',
        globalCheck: 'window.isNumeric',
        description: 'כלי עזר נתונים כלליים',
        required: true,
        loadOrder: 2
      },
      {
        file: 'unified-table-system.js',
        globalCheck: 'window.UnifiedTableSystem',
        description: 'מערכת טבלאות מרכזית מאוחדת',
        required: true,
        loadOrder: 3
      }
    ],
    estimatedSize: '~150KB',
    initTime: '~80ms'
  },

  // 4.2. TAG MANAGEMENT PAGE PACKAGE - ניהול תגיות
  'tag-management': {
    id: 'tag-management',
    name: 'Tag Management Page Package',
    description: 'לוגיקה ייעודית לעמוד ניהול תגיות',
    version: '1.0.0',
    critical: false,
    loadOrder: 4.2,
    dependencies: ['base', 'services', 'modules', 'ui-advanced', 'crud', 'preferences'],
    scripts: [
      {
        file: 'tag-management-page.js',
        globalCheck: 'window.TagManagementPage',
        description: 'ניהול תצוגת עמוד ניהול התגיות',
        required: true,
        loadOrder: 1
      }
    ],
    estimatedSize: '~45KB',
    initTime: '~35ms'
  },

  // 5. PREFERENCES PACKAGE - העדפות
  preferences: {
    id: 'preferences',
    name: 'Preferences Package',
    description: 'מערכת העדפות משתמש v2.0 (6 קבצים)',
    version: '2.0.0',
    critical: false,
    loadOrder: 5,
    dependencies: ['base', 'services'], // Added 'services' dependency for preferences-data.js
    scripts: [
      {
        file: 'services/preferences-v4.js',
        globalCheck: 'window.PreferencesV4',
        description: 'Preferences V4 SDK (group-first)',
        required: true,
        loadOrder: 0.5  // Must load before preferences-core-new.js
      },
      {
        file: 'preferences-core-new.js',
        globalCheck: 'window.PreferencesCore',
        description: 'ליבת העדפות (ללא צבעים)',
        required: true,
        loadOrder: 1
      },
      {
        file: 'preferences-colors.js',
        globalCheck: 'window.ColorManager',
        description: 'מערכת צבעים (60+ העדפות)',
        required: true,
        loadOrder: 2
      },
      {
        file: 'preferences-profiles.js',
        globalCheck: 'window.ProfileManager',
        description: 'ניהול פרופילים',
        required: true,
        loadOrder: 3
      },
      {
        file: 'preferences-lazy-loader.js',
        globalCheck: 'window.LazyLoader',
        description: 'lazy loading system',
        required: true,
        loadOrder: 4
      },
      {
        file: 'preferences-validation.js',
        globalCheck: 'window.PreferenceValidator',
        description: 'validation system',
        required: true,
        loadOrder: 5
      },
      {
        file: 'preferences-ui-v4.js',
        globalCheck: 'window.PreferencesUIV4',
        description: 'ממשק משתמש V4 (Group-First)',
        required: true,
        loadOrder: 5.5  // Must load before preferences-ui.js and preferences-group-manager.js
      },
      {
        file: 'preferences-ui.js',
        globalCheck: 'window.PreferencesUI',
        description: 'ממשק משתמש',
        required: true,
        loadOrder: 6
      },
      {
        file: 'preferences-page.js',
        globalCheck: 'window.loadAccountsForPreferences',
        description: 'פונקציות ספציפיות לעמוד העדפות',
        required: false,
        loadOrder: 7
      },
      {
        file: 'preferences-debug-monitor.js',
        globalCheck: 'window.PreferencesDebugMonitor',
        description: 'קוד ניטור ובדיקה לבעיות העדפות',
        required: false,
        loadOrder: 7.1
      },
      {
        file: 'preferences-group-manager.js',
        globalCheck: 'window.PreferencesGroupManager',
        description: 'מנהל קבוצות העדפות',
        required: true,
        loadOrder: 8
      }
    ],
    estimatedSize: '~160KB',
    initTime: '~90ms'
  },

  // 6. VALIDATION PACKAGE - ולידציה
  validation: {
    id: 'validation',
    name: 'Validation Package',
    description: 'מערכות ולידציה',
    version: '2.0.0',
    critical: false,
    loadOrder: 6,
    dependencies: ['base'],
    scripts: [
      {
        file: 'validation-utils.js',
        globalCheck: 'window.validateSelectField',
        description: 'כלי ולידציה',
        required: true
      }
    ],
    estimatedSize: '~15KB',
    initTime: '~10ms'
  },

  // 6.5. CONDITIONS PACKAGE - תנאים
  conditions: {
    id: 'conditions',
    name: 'Conditions Package',
    description: 'מערכות תנאים',
    version: '2.0.0',
    critical: false,
    loadOrder: 6.5,
    dependencies: ['base', 'validation'],
    scripts: [
      {
        file: 'conditions/conditions-translations.js',
        globalCheck: 'window.conditionsTranslations',
        description: 'תרגומי תנאים',
        required: true,
        loadOrder: 1
      },
      {
        file: 'conditions/conditions-validator.js',
        globalCheck: 'window.conditionsValidator',
        description: 'ולידטור תנאים',
        required: true,
        loadOrder: 2
      },
      {
        file: 'conditions/conditions-form-generator.js',
        globalCheck: 'window.conditionsFormGenerator',
        description: 'מחולל טפסי תנאים',
        required: true,
        loadOrder: 3
      },
      {
        file: 'conditions/conditions-crud-manager.js',
        globalCheck: 'window.conditionsCRUDManager',
        description: 'מנהל CRUD תנאים',
        required: true,
        loadOrder: 4
      },
      {
        file: 'conditions/conditions-initializer.js',
        globalCheck: 'window.conditionsInitializer',
        description: 'מאתחל תנאים',
        required: true,
        loadOrder: 5
      },
      {
        file: 'modal-configs/conditions-config.js',
        globalCheck: 'window.conditionsModalConfig',
        description: 'קונפיגורציית מודל תנאים',
        required: true,
        loadOrder: 6
      },
      {
        file: 'conditions/conditions-ui-manager.js',
        globalCheck: 'window.ConditionsUIManager',
        description: 'מנהל ממשק תנאים',
        required: true,
        loadOrder: 7
      },
      {
        file: 'conditions/conditions-modal-controller.js',
        globalCheck: 'window.ConditionsModalController',
        description: 'בקר מודל תנאים',
        required: true,
        loadOrder: 8
      }
    ],
    estimatedSize: '~150KB',
    initTime: '~80ms'
  },

  // 7. EXTERNAL-DATA PACKAGE - נתונים חיצוניים
  'external-data': {
    id: 'external-data',
    name: 'External Data Package',
    description: 'מערכות נתונים חיצוניים',
    version: '2.0.0',
    critical: false,
    loadOrder: 7,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'yahoo-finance-service.js',
        globalCheck: 'window.YahooFinanceService',
        description: 'שירות Yahoo Finance',
        required: true
      },
      {
        file: 'external-data-service.js',
        globalCheck: 'window.ExternalDataService',
        description: 'שירות נתונים חיצוניים',
        required: true
      },
      {
        file: 'external-data-settings-service.js',
        globalCheck: 'window.ExternalDataSettingsService',
        description: 'הגדרות נתונים חיצוניים',
        required: true
      }
    ],
    estimatedSize: '~200KB',
    initTime: '~120ms'
  },

  // 8. CHARTS PACKAGE - גרפים
  charts: {
    id: 'charts',
    name: 'Charts Package',
    description: 'מערכות גרפים ותרשימים',
    version: '2.0.0',
    critical: false,
    loadOrder: 8,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
        globalCheck: 'window.Chart',
        description: 'ספריית Chart.js (CDN)',
        required: true,
        loadOrder: 0,
        external: true
      },
      {
        file: 'charts/chart-theme.js',
        globalCheck: 'window.ChartTheme',
        description: 'ערכת גרפים',
        required: true,
        loadOrder: 1
      },
      {
        file: 'charts/chart-system.js',
        globalCheck: 'window.ChartSystem',
        description: 'מערכת גרפים',
        required: true,
        loadOrder: 2
      },
      {
        file: 'charts/chart-loader.js',
        globalCheck: 'window.ChartLoader',
        description: 'טוען גרפים',
        required: true,
        loadOrder: 3
      },
      {
        file: 'charts/chart-export.js',
        globalCheck: 'window.ChartExport',
        description: 'ייצוא גרפים',
        required: true,
        loadOrder: 4
      },
      {
        file: 'charts/adapters/performance-adapter.js',
        globalCheck: 'window.PerformanceAdapter',
        description: 'מתאם ביצועים',
        required: true,
        loadOrder: 5
      },
      {
        file: 'charts/adapters/trades-adapter.js',
        globalCheck: 'window.TradesAdapter',
        description: 'מתאם עסקאות',
        required: true,
        loadOrder: 6
      }
    ],
    estimatedSize: '~300KB',
    initTime: '~150ms'
  },

  // 9. LOGS PACKAGE - לוגים
  logs: {
    id: 'logs',
    name: 'Logs Package',
    description: 'מערכות לוגים',
    version: '2.0.0',
    critical: false,
    loadOrder: 9,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'unified-log-api.js',
        globalCheck: 'window.UnifiedLogAPI',
        description: 'API לוגים מאוחד',
        required: true,
        loadOrder: 1
      },
      {
        file: 'unified-log-manager.js',
        globalCheck: 'window.UnifiedLogManager',
        description: 'מנהל לוגים מאוחד',
        required: true,
        loadOrder: 2
      },
      {
        file: 'unified-log-display.js',
        globalCheck: 'window.UnifiedLogDisplay',
        description: 'תצוגת לוגים מאוחדת',
        required: true,
        loadOrder: 3
      }
    ],
    estimatedSize: '~80KB',
    initTime: '~50ms'
  },

  // 9. CACHE PACKAGE - מטמון
  cache: {
    id: 'cache',
    name: 'Cache Package',
    description: 'מערכות מטמון',
    version: '2.0.0',
    critical: false,
    loadOrder: 9,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'cache-policy-manager.js',
        globalCheck: 'window.CachePolicyManager',
        description: 'מנהל מדיניות מטמון',
        required: true,
        loadOrder: 1
      },
      {
        file: 'cache-management.js',
        globalCheck: 'window.cacheManagementPage',
        description: 'ניהול מטמון',
        required: true,
        loadOrder: 2
      }
    ],
    estimatedSize: '~40KB',
    initTime: '~25ms'
  },

  // 10. ENTITY-SERVICES PACKAGE - שירותי ישויות
  'entity-services': {
    id: 'entity-services',
    name: 'Entity Services Package',
    description: 'שירותי ישויות',
    version: '2.0.0',
    critical: false,
    loadOrder: 10,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'services/trades-data.js',
        globalCheck: 'window.TradesData',
        description: 'שירות נתוני טריידים (CRUD + Cache)',
        required: false,  // Required only for trades page, not all pages
        loadOrder: 0
      },
      {
        file: 'account-service.js',
        globalCheck: 'window.getAccounts',
        description: 'שירות חשבונות',
        required: true,
        loadOrder: 1
      },
      {
        file: 'alert-service.js',
        globalCheck: 'window.getAlertState',
        description: 'שירות התראות',
        required: true,
        loadOrder: 3
      },
      {
        file: 'ticker-service.js',
        globalCheck: 'window.tickerService',
        description: 'שירות טיקרים',
        required: true,
        loadOrder: 4
      },
      {
        file: 'trade-plan-service.js',
        globalCheck: 'window.getTradePlans',
        description: 'שירות תכניות מסחר',
        required: true,
        loadOrder: 5
      },
      {
        file: 'services/trade-plans-data.js',
        globalCheck: 'window.TradePlansData',
        description: 'שירות נתוני תוכניות מסחר',
        required: false,
        loadOrder: 6
      },
      {
        file: 'services/notes-data.js',
        globalCheck: 'window.NotesData',
        description: 'שירות נתוני הערות',
        required: false,
        loadOrder: 6.5
      },
      {
        file: 'services/alerts-data.js',
        globalCheck: 'window.AlertsData',
        description: 'שירות נתוני התראות',
        required: false,
        loadOrder: 6.6
      },
      {
        file: 'services/tickers-data.js',
        globalCheck: 'window.TickersData',
        description: 'שירות נתוני טיקרים',
        required: false,
        loadOrder: 6.7
      },
      {
        file: 'services/trading-accounts-data.js',
        globalCheck: 'window.TradingAccountsData',
        description: 'שירות נתוני חשבונות מסחר',
        required: false,
        loadOrder: 6.8
      },
      {
        file: 'services/cash-flows-data.js',
        globalCheck: 'window.CashFlowsData',
        description: 'שירות נתוני תזרימים',
        required: false,
        loadOrder: 6.9
      },
      {
        file: 'condition-translator.js',
        globalCheck: 'window.conditionTranslator',
        description: 'מתרגם תנאים',
        required: true,
        loadOrder: 7
      },
      {
        file: 'constraints.js',
        globalCheck: 'window.toggleLayer',
        description: 'מערכת אילוצים',
        required: true,
        loadOrder: 8
      },
      {
        file: 'services/linked-items-service.js',
        globalCheck: 'window.LinkedItemsService',
        description: 'שירות לוגיקה משותפת לפריטים מקושרים',
        required: true,
        loadOrder: 9
      },
      {
        file: 'linked-items.js',
        globalCheck: 'window.viewLinkedItems',
        description: 'פריטים מקושרים',
        required: true,
        loadOrder: 10
      },
      {
        file: 'related-object-filters.js',
        globalCheck: 'window.filterByRelatedObjectType',
        description: 'פילטרים של אובייקטים קשורים',
        required: true,
        loadOrder: 11
      },
      {
        file: 'account-activity.js',
        globalCheck: 'window.initAccountActivity',
        description: 'מערכת תנועות חשבון',
        required: false,
        loadOrder: 12
      },
      {
        file: 'positions-portfolio.js',
        globalCheck: 'window.initPositionsPortfolio',
        description: 'מערכת פוזיציות ופורטפוליו',
        required: false,
        loadOrder: 13
      }
    ],
    estimatedSize: '~180KB',
    initTime: '~110ms'
  },

  // 11. HELPER PACKAGE - עזר
  helper: {
    id: 'helper',
    name: 'Helper Package',
    description: 'מערכות עזר',
    version: '2.0.0',
    critical: false,
    loadOrder: 11,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'utils/cache-key-helper.js',
        globalCheck: 'window.CacheKeyHelper',
        description: 'עזר ליצירת מפתחות מטמון אופטימליים',
        required: false,
        loadOrder: 0
      },
      {
        file: 'utils/business-logic-batch-helper.js',
        globalCheck: 'window.BusinessLogicBatchHelper',
        description: 'עזר ל-Batch Operations עם Business Logic API',
        required: false,
        loadOrder: 1
      },
      {
        file: 'utils/request-deduplication-helper.js',
        globalCheck: 'window.RequestDeduplicationHelper',
        description: 'עזר ל-Request Deduplication',
        required: false,
        loadOrder: 2
      },
      {
        file: 'currencies.js',
        globalCheck: 'window.openCurrencyDetails',
        description: 'מערכת מטבעות',
        required: true,
        loadOrder: 1
      },
      {
        file: 'designs.js',
        globalCheck: 'window.generateDetailedLog',
        description: 'מערכת עיצובים',
        required: true,
        loadOrder: 2
      },
      {
        file: 'research.js',
        globalCheck: 'window.initializeResearchPage',
        description: 'מערכת מחקר',
        required: true,
        loadOrder: 3
      }
    ],
    estimatedSize: '~45KB',
    initTime: '~30ms'
  },

  // 12. SYSTEM-MANAGEMENT PACKAGE - ניהול מערכת
  'system-management': {
    id: 'system-management',
    name: 'System Management Package',
    description: 'ניהול מערכת מתקדם',
    version: '2.0.0',
    critical: false,
    loadOrder: 12,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'system-management/system-management-main.js',
        globalCheck: 'window.SystemManagementMain',
        description: 'ניהול מערכת ראשי',
        required: true
      },
      {
        file: 'system-management/core/sm-base.js',
        globalCheck: 'window.SMBaseSection',
        description: 'בסיס ניהול מערכת',
        required: true
      },
      {
        file: 'system-management/core/sm-error-handler.js',
        globalCheck: 'window.SMErrorHandler',
        description: 'מטפל שגיאות ניהול מערכת',
        required: true
      },
      {
        file: 'system-management/core/sm-ui-components.js',
        globalCheck: 'window.SMUIComponents',
        description: 'רכיבי UI ניהול מערכת',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-alerts.js',
        globalCheck: 'window.SMSectionAlerts',
        description: 'סקציית התראות',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-background-tasks.js',
        globalCheck: 'window.SMSectionBackgroundTasks',
        description: 'סקציית משימות רקע',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-cache.js',
        globalCheck: 'window.SMSectionCache',
        description: 'סקציית מטמון',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-dashboard.js',
        globalCheck: 'window.SMSectionDashboard',
        description: 'סקציית דשבורד',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-database.js',
        globalCheck: 'window.SMSectionDatabase',
        description: 'סקציית מסד נתונים',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-external-data.js',
        globalCheck: 'window.SMSectionExternalData',
        description: 'סקציית נתונים חיצוניים',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-operations.js',
        globalCheck: 'window.SMSectionOperations',
        description: 'סקציית פעולות',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-performance.js',
        globalCheck: 'window.SMSectionPerformance',
        description: 'סקציית ביצועים',
        required: true
      },
      {
        file: 'system-management/sections/sm-section-server.js',
        globalCheck: 'window.SMSectionServer',
        description: 'סקציית שרת',
        required: true
      }
    ],
    estimatedSize: '~400KB',
    initTime: '~200ms'
  },

  // 13. MANAGEMENT PACKAGE - ניהול
  management: {
    id: 'management',
    name: 'Management Package',
    description: 'מערכות ניהול',
    version: '2.0.0',
    critical: false,
    loadOrder: 13,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'auth.js',
        globalCheck: 'window.login',
        description: 'מערכת אימות',
        required: true,
        loadOrder: 1
      },
      {
        file: 'background-tasks.js',
        globalCheck: 'window.startScheduler',
        description: 'משימות רקע',
        required: true,
        loadOrder: 2
      }
    ],
    estimatedSize: '~150KB',
    initTime: '~100ms'
  },

  // 14. DEV-TOOLS PACKAGE - כלי פיתוח
  'dev-tools': {
    id: 'dev-tools',
    name: 'Development Tools Package',
    description: 'כלי פיתוח ודיבאג',
    version: '2.0.0',
    critical: false,
    loadOrder: 14,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'init-system/dev-tools/page-template-generator.js',
        globalCheck: 'window.PageTemplateGenerator',
        description: 'מחולל תבניות עמודים',
        required: true
      },
      {
        file: 'init-system/dev-tools/script-analyzer.js',
        globalCheck: 'window.ScriptAnalyzer',
        description: 'מנתח סקריפטים',
        required: true
      },
      {
        file: 'init-system/validators/runtime-validator.js',
        globalCheck: 'window.RuntimeValidator',
        description: 'ולידטור זמן ריצה',
        required: true
      },
      {
        file: 'debug-filter-tooltips-comprehensive.js',
        globalCheck: 'window.debugFilterTooltips',
        description: 'כלי דיבאג לטולטיפים של פילטרים',
        required: false,
        loadOrder: 4
      }
    ],
    estimatedSize: '~100KB',
    initTime: '~60ms'
  },

  // 15. FILTERS PACKAGE - מערכת סינון
  filters: {
    id: 'filters',
    name: 'Filters Package',
    description: 'מערכת הפילטרים המשולבת (מוטמעת ב-header-system.js)',
    version: '2.0.0',
    critical: false,
    loadOrder: 15,
    dependencies: ['base', 'ui-advanced'],
    scripts: [],
    estimatedSize: '~0KB',
    initTime: '~0ms',
    notes: 'המערכת פעילה דרך window.filterSystem שנוצר בתוך header-system.js; אין קובץ טעינה ייעודי.'
  },

  // 16. ADVANCED-NOTIFICATIONS PACKAGE - התראות מתקדמות
  'advanced-notifications': {
    id: 'advanced-notifications',
    name: 'Advanced Notifications Package',
    description: 'מערכת התראות מתקדמת',
    version: '2.0.0',
    critical: false,
    loadOrder: 16,
    dependencies: ['base'],
    scripts: [
      {
        file: 'notification-system.js',
        globalCheck: 'window.NotificationSystem',
        description: 'מערכת התראות מתקדמת',
        required: true
      },
      {
        file: 'warning-system.js',
        globalCheck: 'window.WarningSystem',
        description: 'מערכת אזהרות',
        required: true
      }
    ],
    estimatedSize: '~60KB',
    initTime: '~35ms'
  },


  // 17. ENTITY DETAILS PACKAGE - פרטי ישויות
  'entity-details': {
    id: 'entity-details',
    name: 'Entity Details Package',
    description: 'מערכות פרטי ישויות',
    version: '2.0.0',
    critical: false,
    loadOrder: 17,
    dependencies: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'entity-services'],
    scripts: [
      {
        file: 'entity-details-api.js',
        globalCheck: 'window.EntityDetailsAPI',
        description: 'API פרטי ישויות',
        required: true,
        loadOrder: 1
      },
      {
        file: 'entity-details-renderer.js',
        globalCheck: 'window.EntityDetailsRenderer',
        description: 'מציג פרטי ישויות',
        required: true,
        loadOrder: 2
      },
      {
        file: 'entity-details-modal.js',
        globalCheck: 'window.showEntityDetails',
        description: 'מודל פרטי ישויות',
        required: true,
        loadOrder: 3
      }
    ],
    estimatedSize: '~45KB',
    initTime: '~30ms'
  },

  // 18. INFO SUMMARY PACKAGE - מערכת סיכום נתונים מאוחדת
  'info-summary': {
    id: 'info-summary',
    name: 'Info Summary Package',
    description: 'מערכת סיכום נתונים מאוחדת לכל העמודים',
    version: '1.0.0',
    critical: false,
    loadOrder: 18,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'info-summary-system.js',
        globalCheck: 'window.InfoSummarySystem',
        description: 'מערכת סיכום נתונים ליבה',
        required: true,
        loadOrder: 1
      },
      {
        file: 'info-summary-configs.js',
        globalCheck: 'window.INFO_SUMMARY_CONFIGS',
        description: 'תצורות עמודים לסיכום נתונים',
        required: true,
        loadOrder: 2
      }
    ],
    estimatedSize: '~25KB',
    initTime: '~15ms'
  },

  // 20. TRADINGVIEW CHARTS PACKAGE - גרפים TradingView
  'tradingview-charts': {
    id: 'tradingview-charts',
    name: 'TradingView Charts Package',
    description: 'מערכת גרפים TradingView Lightweight Charts',
    version: '1.0.0',
    critical: false,
    loadOrder: 20,
    dependencies: ['base'],
    scripts: [
      {
        file: 'charts/vendor/lightweight-charts.standalone.production.js',
        globalCheck: 'window.LightweightCharts',
        description: 'TradingView Lightweight Charts',
        required: true,
        loadOrder: 0
      },
      {
        file: 'charts/tradingview-theme.js',
        globalCheck: 'window.TradingViewTheme',
        description: 'ערכת נושא TradingView',
        required: true,
        loadOrder: 1
      },
      {
        file: 'charts/tradingview-adapter.js',
        globalCheck: 'window.TradingViewChartAdapter',
        description: 'Adapter למערכת TradingView',
        required: true,
        loadOrder: 2
      }
    ],
    estimatedSize: '~35KB',
    initTime: '~20ms'
  },

  // 21. INIT PACKAGE - אתחול
  'init-system': {
    id: 'init-system',
    name: 'Initialization Package',
    description: 'מערכות אתחול וניטור',
    version: '2.0.0',
    critical: false,
    loadOrder: 19,
    dependencies: ['base', 'crud', 'services', 'ui-advanced', 'modules', 'preferences', 'validation', 'conditions', 'external-data', 'charts', 'logs', 'cache', 'entity-services', 'helper', 'system-management', 'management', 'dev-tools', 'advanced-notifications', 'entity-details', 'info-summary'],
    scripts: [
      {
        file: 'init-system/package-manifest.js',
        globalCheck: 'window.PACKAGE_MANIFEST',
        description: 'מנפסט חבילות',
        required: true,
        loadOrder: 1
      },
      {
        file: 'page-initialization-configs.js',
        globalCheck: 'window.PAGE_INITIALIZATION_CONFIGS',
        description: 'הגדרות אתחול עמודים',
        required: true,
        loadOrder: 2
      },
      {
        file: 'init-system-check.js',
        globalCheck: 'window.initSystemCheck',
        description: 'בדיקת מערכת איתחול',
        required: true,
        loadOrder: 3
      },
      {
        file: 'monitoring-functions.js',
        globalCheck: 'window.runDetailedPageScan',
        description: 'פונקציות ניטור עמודים',
        required: true,
        loadOrder: 4
      },
      {
        file: 'init-system/all-pages-monitoring-test.js',
        globalCheck: 'window.allPagesMonitoringTest',
        description: 'בדיקה אוטומטית של כל העמודים',
        required: false,
        loadOrder: 5
      },
      {
        file: 'init-system/pages-standardization-plan.js',
        globalCheck: 'window.pagesStandardizationPlan',
        description: 'תוכנית סטנדרטיזציה לכל העמודים',
        required: false,
        loadOrder: 6
      },
      {
        file: 'init-system/dependency-analyzer.js',
        globalCheck: 'window.dependencyAnalyzer',
        description: 'ניתוח תלויות במניפסט החבילות',
        required: false,
        loadOrder: 7
      },
      {
        file: 'init-system/load-order-validator.js',
        globalCheck: 'window.loadOrderValidator',
        description: 'בדיקת סדר טעינה בפועל בעמודים',
        required: false,
        loadOrder: 8
      },
      // unified-app-initializer.js removed - initialization now handled by core-systems.js
    ],
    estimatedSize: '~45KB',
    initTime: '~30ms'
  },

  // 19.5 DASHBOARD WIDGETS PACKAGE - רכיבי דף הבית
  'dashboard-widgets': {
    id: 'dashboard-widgets',
    name: 'Dashboard Widgets',
    description: 'ווידג׳טים וממשקי דף הבית (Pending Executions, Trade Creation)',
    version: '1.0.0',
    critical: false,
    loadOrder: 19.5,
    dependencies: ['base', 'services', 'ui-advanced', 'entity-services'],
    scripts: [
      {
        file: 'services/dashboard-data.js',
        globalCheck: 'window.DashboardData',
        description: 'שירות נתוני דשבורד מאוחד',
        required: true,
        loadOrder: 0
      },
      {
        file: 'widgets/recent-trades-widget.js',
        globalCheck: 'window.RecentTradesWidget',
        description: 'ווידג׳ט טריידים אחרונים',
        required: true,
        loadOrder: 1
      },
      {
        file: 'pending-executions-widget.js',
        globalCheck: 'window.PendingExecutionsHighlights',
        description: 'ווידג׳ט המלצות שיוך',
        required: true,
        loadOrder: 2
      },
      {
        file: 'pending-execution-trade-creation.js',
        globalCheck: 'window.PendingExecutionTradeCreation',
        description: 'ממשק יצירת טרייד מביצועים',
        required: false,
        loadOrder: 3
      },
      {
        file: 'pending-trade-plan-widget.js',
        globalCheck: 'window.PendingTradePlanWidget',
        description: 'ווידג׳ט שיוך תוכניות למסחר',
        required: true,
        loadOrder: 4
      },
      {
        file: 'active-alerts-component.js',
        globalCheck: 'window.updateActiveAlertsComponent',
        description: 'רכיב התראות פעילות',
        required: true,
        loadOrder: 5
      },
      {
        file: 'modal-configs/tag-search-config.js',
        globalCheck: 'window.tagSearchDrawerConfig',
        description: 'תצורת מגירת חיפוש תגיות',
        required: true,
        loadOrder: 6
      },
      {
        file: 'tag-search-controller.js',
        globalCheck: 'window.TagSearchController',
        description: 'בקר חיפוש תגיות',
        required: true,
        loadOrder: 7
      },
      {
        file: 'index.js',
        globalCheck: 'window.initializeIndexPage',
        description: 'לוגיקת דף הבית',
        required: true,
        loadOrder: 8
      }
    ],
    estimatedSize: '~110KB',
    initTime: '~60ms'
  },

  // Game plan: dynamic loader uses PAGE_REQUIREMENTS; add validation dependencies for dashboard use cases
  'dashboard': {
    id: 'dashboard-modules',
    name: 'Dashboard Modules',
    description: 'מודולים ייעודיים לדשבורד כולל תמיכה ביצירת טרייד',
    version: '1.0.0',
    critical: false,
    loadOrder: 3.6,
    dependencies: ['modules', 'validation'],
    scripts: [
      {
        file: 'trade-selector-modal.js',
        globalCheck: 'window.openTradeSelectorModal',
        description: 'מודול בחירת טרייד',
        required: false,
        loadOrder: 0
      },
      {
        file: 'modal-configs/trades-config.js',
        globalCheck: 'window.tradesModalConfig',
        description: 'הגדרות מודל טריידים',
        required: false,
        loadOrder: 1
      }
    ],
    estimatedSize: '~20KB',
    initTime: '~10ms'
  }
};

/**
 * Package Manifest Manager Class
 * מנהל חבילות מתקדם עם פונקציות עזר
 */
class PackageManifest {
  /**
   * Get all packages
   */
  getAllPackages() {
    return Object.values(PACKAGE_MANIFEST);
  }

  /**
   * Get package by ID
   */
  getPackage(packageId) {
    return PACKAGE_MANIFEST[packageId];
  }

  /**
   * Get packages by load order
   */
  getPackagesByLoadOrder() {
    return this.getAllPackages().sort((a, b) => a.loadOrder - b.loadOrder);
  }

  /**
   * Get critical packages only
   */
  getCriticalPackages() {
    return this.getAllPackages().filter(pkg => pkg.critical);
  }

  /**
   * Get package dependencies (recursive)
   */
  getPackageDependencies(packageId) {
    const dependencies = [];
    const visited = new Set();
    
    const collectDeps = (id) => {
      if (visited.has(id)) return;
      visited.add(id);
      
      const depPkg = this.getPackage(id);
      if (depPkg && depPkg.dependencies) {
        depPkg.dependencies.forEach(depId => {
          dependencies.push(depId);
          collectDeps(depId);
        });
      }
    };
    
    collectDeps(packageId);
    return dependencies;
  }

  /**
   * Get all scripts for packages
   */
  getScriptsForPackages(packageIds) {
    const scripts = [];
    const seen = new Set();
    
    packageIds.forEach(pkgId => {
      const pkg = this.getPackage(pkgId);
      if (pkg && pkg.scripts) {
        pkg.scripts.forEach(script => {
          if (!seen.has(script.file)) {
            scripts.push(script);
            seen.add(script.file);
          }
        });
      }
    });
    
    return scripts;
  }

  /**
   * Validate package configuration
   */
  validatePackage(packageId) {
    const pkg = this.getPackage(packageId);
    if (!pkg) {
      return { valid: false, error: `Package ${packageId} not found` };
    }
    
    const errors = [];
    
    // Check required fields
    if (!pkg.id) errors.push('Missing id');
    if (!pkg.name) errors.push('Missing name');
    if (!pkg.scripts || pkg.scripts.length === 0) errors.push('No scripts defined');
    
    // Check dependencies exist
    if (pkg.dependencies) {
      pkg.dependencies.forEach(depId => {
        if (!this.getPackage(depId)) {
          errors.push(`Dependency ${depId} not found`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get package statistics
   */
  getStats() {
    const packages = this.getAllPackages();
    const critical = packages.filter(pkg => pkg.critical).length;
    const totalScripts = packages.reduce((sum, pkg) => sum + (pkg.scripts?.length || 0), 0);
    const totalSize = packages.reduce((sum, pkg) => {
      const size = pkg.estimatedSize?.replace(/[^\d]/g, '') || '0';
      return sum + parseInt(size);
    }, 0);
    
    return {
      totalPackages: packages.length,
      criticalPackages: critical,
      totalScripts: totalScripts,
      estimatedTotalSize: `${totalSize}KB`
    };
  }
}

// Export to global scope
if (typeof window !== 'undefined') {
  window.PACKAGE_MANIFEST = PACKAGE_MANIFEST;
  window.PackageManifest = PackageManifest;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PACKAGE_MANIFEST, PackageManifest };
}
