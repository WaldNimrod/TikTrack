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
 * // scripts/page-initialization-configs.js
 * 'my-page': {
 *     packages: ['base', 'my-package'], // Add the new package
 *     requiredGlobals: ['MyNewScript'] // Add the new Global
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
 * - Compare documented scripts vs actually loaded scripts
 * - Validate script availability via global checks
 * - Report mismatches between documentation and reality
 * 
 * The monitoring system does NOT load scripts automatically.
 * It only compares and reports differences.
 * 
 * 🏗️ HIERARCHY & DEPENDENCIES:
 * =============================
 * 
 * 📦 BASE PACKAGE (חובה לכל עמוד)
 * ├── מערכות ליבה בסיסיות
 * ├── notification-system.js
 * ├── button-system-init.js
 * ├── ui-utils.js
 * └── translation-utils.js
 * 
 * 📦 CRUD PACKAGE (תלוי ב-BASE)
 * ├── מערכות ניהול נתונים
 * ├── tables.js
 * ├── data-utils.js
 * ├── date-utils.js ← formatDate function
 * └── actions-menu-system.js
 * 
 * 📦 CHARTS PACKAGE (תלוי ב-BASE)
 * ├── מערכות גרפים
 * ├── chart-utils.js
 * └── chart-renderer.js
 * 
 * ⚠️ IMPORTANT NOTES:
 * ==================
 * - BASE is MANDATORY for all pages
 * - CRUD includes date-utils.js (formatDate function)
 * - CHARTS is optional, depends on BASE
 * - Each package is INDEPENDENT - no automatic inclusion
 * - Pages must explicitly request packages they need
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
        file: 'global-favicon.js',
        globalCheck: 'window.setFavicon',
        description: 'ניהול favicon',
        required: true
      },
      {
        file: 'notification-system.js',
        globalCheck: 'window.NotificationSystem',
        description: 'מערכת התראות',
        required: true
      },
      {
        file: 'ui-utils.js',
        globalCheck: 'window.toggleSection',
        description: 'כלי עזר UI',
        required: true
      },
      {
        file: 'warning-system.js',
        globalCheck: 'window.WarningSystem',
        description: 'מערכת אזהרות',
        required: true
      },
      {
        file: 'error-handlers.js',
        globalCheck: 'window.handleApiError',
        description: 'מערכת טיפול בשגיאות',
        required: true
      },
      {
        file: 'unified-cache-manager.js',
        globalCheck: 'window.UnifiedCacheManager',
        description: 'מנהל מטמון מאוחד',
        required: true
      },
      {
        file: 'cache-sync-manager.js',
        globalCheck: 'window.CacheSyncManager',
        description: 'מנהל סנכרון מטמון',
        required: true
      },
      {
        file: 'header-system.js',
        globalCheck: 'window.HeaderSystem',
        description: 'מערכת כותרת',
        required: true
      },
      {
        file: 'page-utils.js',
        globalCheck: 'window.loadPageState',
        description: 'כלי עזר עמוד',
        required: true
      },
      {
        file: 'translation-utils.js',
        globalCheck: 'window.translateStatus',
        description: 'תרגומים',
        required: true
      },
      {
        file: 'button-icons.js',
        globalCheck: 'window.BUTTON_ICONS',
        description: 'מערכת איקונים וכפתורים',
        required: true
      },
      {
        file: 'button-system-init.js',
        globalCheck: 'window.ButtonSystem',
        description: 'מערכת כפתורים',
        required: true
      },
      {
        file: 'color-scheme-system.js',
        globalCheck: 'window.loadDynamicColors',
        description: 'מערכת צבעים דינמית',
        required: true
      }
    ],
    estimatedSize: '~280KB',
    initTime: '~150ms'
  },

  // 2. CRUD PACKAGE
  crud: {
    id: 'crud',
    name: 'CRUD Operations Package',
    description: 'מערכות לניהול נתונים וטבלאות',
    version: '1.0.0',
    critical: false,
    loadOrder: 2,
    dependencies: ['base'],
    scripts: [
      {
        file: 'date-utils.js',
        globalCheck: 'window.formatDate',
        description: 'כלי עזר תאריכים',
        required: true
      },
      {
        file: 'entity-details-api.js',
        globalCheck: 'window.EntityDetailsAPI',
        description: 'API פרטי ישויות',
        required: true
      },
      {
        file: 'entity-details-renderer.js',
        globalCheck: 'window.EntityDetailsRenderer',
        description: 'מציג פרטי ישויות',
        required: true
      },
      {
        file: 'entity-details-modal.js',
        globalCheck: 'window.EntityDetailsModal',
        description: 'מודל פרטי ישויות',
        required: true
      },
      {
        file: 'default-value-setter.js',
        globalCheck: 'window.DefaultValueSetter',
        description: 'מגדיר ברירות מחדל',
        required: true
      },
      {
        file: 'crud-response-handler.js',
        globalCheck: 'window.CRUDResponseHandler',
        description: 'מטפל בתגובות CRUD',
        required: true
      }
    ],
    estimatedSize: '~150KB',
    initTime: '~80ms'
  },

  // 3. SERVICES PACKAGE - שירותי עזר כלליים
  services: {
    id: 'services',
    name: 'Services Package',
    description: 'שירותי עזר כלליים למערכת',
    version: '1.0.0',
    critical: false,
    loadOrder: 3,
    dependencies: ['base'],
    scripts: [
      {
        file: 'data-utils.js',
        globalCheck: 'window.DataUtils',
        description: 'כלי עזר נתונים כלליים',
        required: true
      },
      {
        file: 'data-collection-service.js',
        globalCheck: 'window.DataCollectionService',
        description: 'שירות איסוף נתונים מטפסים',
        required: true
      },
      {
        file: 'field-renderer-service.js',
        globalCheck: 'window.FieldRendererService',
        description: 'שירות רנדור שדות מתקדם',
        required: true
      },
      {
        file: 'select-populator-service.js',
        globalCheck: 'window.SelectPopulatorService',
        description: 'שירות מילוי select boxes',
        required: true
      },
      {
        file: 'statistics-calculator.js',
        globalCheck: 'window.StatisticsCalculator',
        description: 'מחשבון סטטיסטיקות',
        required: true
      }
    ],
    estimatedSize: '~120KB',
    initTime: '~60ms'
  },

  // 4. UI-ADVANCED PACKAGE - ממשק משתמש מתקדם
  'ui-advanced': {
    id: 'ui-advanced',
    name: 'Advanced UI Package',
    description: 'ממשק משתמש מתקדם - כפתורים, טבלאות ופעולות',
    version: '1.0.0',
    critical: false,
    loadOrder: 4,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'tables.js',
        globalCheck: 'window.sortTableData',
        description: 'מערכת טבלאות',
        required: true
      },
      {
        file: 'pagination-system.js',
        globalCheck: 'window.PaginationSystem',
        description: 'מערכת עימוד',
        required: true
      },
      {
        file: 'actions-menu-system.js',
        globalCheck: 'window.createActionsMenu',
        description: 'מערכת תפריט פעולות',
        required: true
      }
    ],
    estimatedSize: '~80KB',
    initTime: '~40ms'
  },

  // 5. FILTERS PACKAGE
  filters: {
    id: 'filters',
    name: 'Filter System Package',
    description: 'מערכת פילטרים מתקדמת',
    version: '1.0.0',
    critical: false,
    loadOrder: 3,
    dependencies: ['base'],
    scripts: [
      {
        file: 'related-object-filters.js',
        globalCheck: 'window.RelatedObjectFilters',
        description: 'פילטרים מתקדמים',
        required: false
      }
    ],
    estimatedSize: '~50KB',
    initTime: '~30ms'
  },

  // 4. ADVANCED NOTIFICATIONS PACKAGE
  'advanced-notifications': {
    id: 'advanced-notifications',
    name: 'Advanced Notifications Package',
    description: 'מערכות התראות מתקדמות',
    version: '1.0.0',
    critical: false,
    loadOrder: 4,
    dependencies: ['base'],
    scripts: [
      {
        file: 'active-alerts-component.js',
        globalCheck: 'window.ActiveAlertsComponent',
        description: 'רכיב התראות פעילות',
        required: false
      },
      {
        file: 'notifications-center.js',
        globalCheck: 'window.NotificationsCenter',
        description: 'מרכז התראות',
        required: false
      },
      {
        file: 'realtime-notifications-client.js',
        globalCheck: 'window.RealtimeNotificationsClient',
        description: 'התראות בזמן אמת',
        required: false
      }
    ],
    estimatedSize: '~120KB',
    initTime: '~60ms'
  },

  // 5. CHARTS PACKAGE
  charts: {
    id: 'charts',
    name: 'Charts Package',
    description: 'מערכות גרפים ותרשימים',
    version: '1.0.0',
    critical: false,
    loadOrder: 5,
    dependencies: ['base'],
    scripts: [
      {
        file: 'chart-management.js',
        globalCheck: 'window.ChartManagement',
        description: 'ניהול גרפים',
        required: false
      }
    ],
    estimatedSize: '~80KB',
    initTime: '~40ms'
  },

  // 6. EXTERNAL DATA PACKAGE
  'external-data': {
    id: 'external-data',
    name: 'External Data Package',
    description: 'מערכות נתונים חיצוניים',
    version: '1.0.0',
    critical: false,
    loadOrder: 6,
    dependencies: ['base'],
    scripts: [
      {
        file: 'external-data-service.js',
        globalCheck: 'window.ExternalDataService',
        description: 'שירות נתונים חיצוניים',
        required: false
      },
      {
        file: 'yahoo-finance-service.js',
        globalCheck: 'window.YahooFinanceService',
        description: 'שירות Yahoo Finance',
        required: false
      },
      {
        file: 'external-data-dashboard.js',
        globalCheck: 'window.ExternalDataDashboard',
        description: 'דשבורד נתונים חיצוניים',
        required: false
      }
    ],
    estimatedSize: '~200KB',
    initTime: '~100ms'
  },

  // 7. SYSTEM MANAGEMENT PACKAGE
  'system-management': {
    id: 'system-management',
    name: 'System Management Package',
    description: 'כלי ניהול מערכת',
    version: '1.0.0',
    critical: false,
    loadOrder: 7,
    dependencies: ['base'],
    scripts: [
      {
        file: 'system-management.js',
        globalCheck: 'window.SystemManagement',
        description: 'Legacy system management',
        required: false
      },
      {
        file: 'cache-management.js',
        globalCheck: 'window.CacheManagement',
        description: 'ניהול cache',
        required: false
      },
      {
        file: 'server-monitor.js',
        globalCheck: 'window.ServerMonitor',
        description: 'מעקב שרת',
        required: false
      }
    ],
    estimatedSize: '~180KB',
    initTime: '~90ms'
  },

  // 8. DEVELOPMENT TOOLS PACKAGE
  'dev-tools': {
    id: 'dev-tools',
    name: 'Development Tools Package',
    description: 'כלי פיתוח ודיבאג',
    version: '1.0.0',
    critical: false,
    loadOrder: 8,
    dependencies: ['base'],
    scripts: [
      {
        file: 'linter-realtime-monitor.js',
        globalCheck: 'window.LinterRealtimeMonitor',
        description: 'מעקב linter בזמן אמת',
        required: false
      },
      {
        file: 'crud-testing-dashboard.js',
        globalCheck: 'window.CrudTestingDashboard',
        description: 'דשבורד בדיקות CRUD',
        required: false
      },
      {
        file: 'css-duplicates-analyzer.js',
        globalCheck: 'window.CssDuplicatesAnalyzer',
        description: 'ניתוח כפילויות CSS',
        required: false
      }
    ],
    estimatedSize: '~160KB',
    initTime: '~80ms'
  },

  // 9. PREFERENCES PACKAGE
  preferences: {
    id: 'preferences',
    name: 'Preferences Package',
    description: 'מערכת העדפות משתמש',
    version: '1.0.0',
    critical: false,
    loadOrder: 9,
    dependencies: ['base'],
    scripts: [
      {
        file: 'preferences.js',
        globalCheck: 'window.getCurrentPreference',
        description: 'מערכת העדפות',
        required: true
      },
      {
        file: 'preferences-core.js',
        globalCheck: 'window.PreferencesCore',
        description: 'ליבת העדפות',
        required: true
      },
      {
        file: 'preferences-page.js',
        globalCheck: 'window.PreferencesPage',
        description: 'עמוד העדפות',
        required: false
      }
    ],
    estimatedSize: '~140KB',
    initTime: '~70ms'
  },

  // 10. INIT PACKAGE - מערכות אתחול
  init: {
    id: 'init',
    name: 'Initialization Package',
    description: 'מערכות אתחול וניהול המערכת',
    version: '1.0.0',
    critical: true,
    loadOrder: 10,
    dependencies: ['base', 'services', 'ui-advanced', 'crud', 'preferences'],
    scripts: [
      {
        file: 'package-manifest.js',
        globalCheck: 'window.PACKAGE_MANIFEST',
        description: 'מנפסט החבילות',
        required: true
      },
      {
        file: 'page-initialization-configs.js',
        globalCheck: 'window.PAGE_CONFIGS',
        description: 'תצורות אתחול העמודים',
        required: true
      },
      {
        file: 'unified-app-initializer.js',
        globalCheck: 'window.UnifiedAppInitializer',
        description: 'מערכת אתחול מאוחדת',
        required: true
      }
    ],
    estimatedSize: '~50KB',
    initTime: '~30ms'
  },

  // 11. CASH FLOWS PACKAGE - חבילה ספציפית לעמוד תזרימי מזומנים
  'cash-flows': {
    id: 'cash-flows',
    name: 'Cash Flows Page Package',
    description: 'חבילה ספציפית לעמוד תזרימי מזומנים',
    version: '1.0.0',
    critical: false,
    loadOrder: 11,
    dependencies: ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'init'],
    scripts: [
      {
        file: 'cash_flows.js',
        globalCheck: 'window.loadCashFlowsData',
        description: 'לוגיקת עמוד תזרימי מזומנים',
        required: true
      }
    ],
    estimatedSize: '~50KB',
    initTime: '~30ms'
  },

  // 12. VALIDATION PACKAGE
  validation: {
    id: 'validation',
    name: 'Validation Package',
    description: 'מערכות ולידציה',
    version: '1.0.0',
    critical: false,
    loadOrder: 12,
    dependencies: ['base'],
    scripts: [
      {
        file: 'validation-utils.js',
        globalCheck: 'window.ValidationUtils',
        description: 'כלי ולידציה',
        required: false
      },
      {
        file: 'constraint-manager.js',
        globalCheck: 'window.ConstraintManager',
        description: 'מנהל אילוצים',
        required: false
      }
    ],
    estimatedSize: '~60KB',
    initTime: '~30ms'
  }
};

// Helper functions for package management
const PackageManifest = {
  /**
   * Get package by ID
   */
  getPackage(packageId) {
    return PACKAGE_MANIFEST[packageId] || null;
  },

  /**
   * Get all packages
   */
  getAllPackages() {
    return Object.values(PACKAGE_MANIFEST);
  },

  /**
   * Get critical packages only
   */
  getCriticalPackages() {
    return Object.values(PACKAGE_MANIFEST).filter(pkg => pkg.critical);
  },

  /**
   * Get package dependencies
   */
  getPackageDependencies(packageId) {
    const pkg = this.getPackage(packageId);
    if (!pkg) return [];
    
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
  },

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
  },

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
  },

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
};

// Export to global scope
if (typeof window !== 'undefined') {
  window.PACKAGE_MANIFEST = PACKAGE_MANIFEST;
  window.PackageManifest = PackageManifest;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PACKAGE_MANIFEST, PackageManifest };
}
