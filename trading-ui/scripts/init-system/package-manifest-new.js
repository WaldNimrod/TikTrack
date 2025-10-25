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
 * 2. SERVICES (5 scripts) - שירותים כלליים
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
        required: true
      },
      {
        file: 'services/field-renderer-service.js',
        globalCheck: 'window.FieldRendererService',
        description: 'שירות רנדור שדות',
        required: true
      },
      {
        file: 'services/select-populator-service.js',
        globalCheck: 'window.SelectPopulatorService',
        description: 'שירות מילוי select boxes',
        required: true
      },
      {
        file: 'services/statistics-calculator.js',
        globalCheck: 'window.StatisticsCalculator',
        description: 'מחשבון סטטיסטיקות',
        required: true
      },
      {
        file: 'services/default-value-setter.js',
        globalCheck: 'window.DefaultValueSetter',
        description: 'שירות ברירות מחדל',
        required: true
      }
    ],
    estimatedSize: '~120KB',
    initTime: '~80ms'
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
        file: 'modules/actions-menu-system.js',
        globalCheck: 'window.ActionsMenuSystem',
        description: 'מערכת תפריט פעולות',
        required: true
      }
    ],
    estimatedSize: '~80KB',
    initTime: '~50ms'
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
        required: true
      },
      {
        file: 'data-utils.js',
        globalCheck: 'window.isNumeric',
        description: 'כלי עזר נתונים כלליים',
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
        globalCheck: 'window.showEntityDetails',
        description: 'מודל פרטי ישויות',
        required: true
      }
    ],
    estimatedSize: '~100KB',
    initTime: '~60ms'
  },

  // 5. PREFERENCES PACKAGE - העדפות
  preferences: {
    id: 'preferences',
    name: 'Preferences Package',
    description: 'מערכת העדפות משתמש',
    version: '2.0.0',
    critical: false,
    loadOrder: 5,
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
        globalCheck: 'window.PreferencesSystem',
        description: 'ליבת העדפות',
        required: true
      },
      {
        file: 'preferences-page.js',
        globalCheck: 'window.loadColorsForPreferences',
        description: 'עמוד העדפות',
        required: false
      }
    ],
    estimatedSize: '~140KB',
    initTime: '~70ms'
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
        globalCheck: 'window.validateRequired',
        description: 'כלי ולידציה',
        required: true
      }
    ],
    estimatedSize: '~15KB',
    initTime: '~10ms'
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
      },
      {
        file: 'external-data-dashboard.js',
        globalCheck: 'window.ExternalDataDashboard',
        description: 'דשבורד נתונים חיצוניים',
        required: true
      }
    ],
    estimatedSize: '~200KB',
    initTime: '~120ms'
  },

  // 8. LOGS PACKAGE - לוגים
  logs: {
    id: 'logs',
    name: 'Logs Package',
    description: 'מערכות לוגים',
    version: '2.0.0',
    critical: false,
    loadOrder: 8,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'unified-log-api.js',
        globalCheck: 'window.UnifiedLogAPI',
        description: 'API לוגים מאוחד',
        required: true
      },
      {
        file: 'unified-log-display.js',
        globalCheck: 'window.UnifiedLogDisplay',
        description: 'תצוגת לוגים מאוחדת',
        required: true
      },
      {
        file: 'unified-log-manager.js',
        globalCheck: 'window.UnifiedLogManager',
        description: 'מנהל לוגים מאוחד',
        required: true
      },
      {
        file: 'table-mappings.js',
        globalCheck: 'window.TABLE_COLUMN_MAPPINGS',
        description: 'מיפוי טבלאות',
        required: true
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
        file: 'cache-management.js',
        globalCheck: 'window.cacheManagementPage',
        description: 'ניהול מטמון',
        required: true
      },
      {
        file: 'cache-policy-manager.js',
        globalCheck: 'window.CachePolicyManager',
        description: 'מנהל מדיניות מטמון',
        required: true
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
        file: 'account-service.js',
        globalCheck: 'window.getAccounts',
        description: 'שירות חשבונות',
        required: true
      },
      {
        file: 'alert-service.js',
        globalCheck: 'window.getAlertState',
        description: 'שירות התראות',
        required: true
      },
      {
        file: 'ticker-service.js',
        globalCheck: 'window.tickerService',
        description: 'שירות טיקרים',
        required: true
      },
      {
        file: 'trade-plan-service.js',
        globalCheck: 'window.getTradePlans',
        description: 'שירות תכניות מסחר',
        required: true
      },
      {
        file: 'active-alerts-component.js',
        globalCheck: 'window.updateActiveAlertsComponent',
        description: 'רכיב התראות פעילות',
        required: true
      },
      {
        file: 'condition-translator.js',
        globalCheck: 'window.conditionTranslator',
        description: 'מתרגם תנאים',
        required: true
      },
      {
        file: 'constraints.js',
        globalCheck: 'window.toggleLayer',
        description: 'מערכת אילוצים',
        required: true
      },
      {
        file: 'linked-items.js',
        globalCheck: 'window.viewLinkedItems',
        description: 'פריטים מקושרים',
        required: true
      },
      {
        file: 'related-object-filters.js',
        globalCheck: 'window.filterByRelatedObjectType',
        description: 'פילטרים של אובייקטים קשורים',
        required: true
      }
    ],
    estimatedSize: '~150KB',
    initTime: '~100ms'
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
        file: 'currencies.js',
        globalCheck: 'window.openCurrencyDetails',
        description: 'מערכת מטבעות',
        required: true
      },
      {
        file: 'designs.js',
        globalCheck: 'window.generateDetailedLog',
        description: 'מערכת עיצובים',
        required: true
      },
      {
        file: 'notes.js',
        globalCheck: 'window.loadNotesData',
        description: 'מערכת הערות',
        required: true
      },
      {
        file: 'research.js',
        globalCheck: 'window.initializeResearchPage',
        description: 'מערכת מחקר',
        required: true
      }
    ],
    estimatedSize: '~60KB',
    initTime: '~40ms'
  },

  // 12. MANAGEMENT PACKAGE - ניהול
  management: {
    id: 'management',
    name: 'Management Package',
    description: 'מערכות ניהול',
    version: '2.0.0',
    critical: false,
    loadOrder: 12,
    dependencies: ['base', 'services'],
    scripts: [
      {
        file: 'server-monitor.js',
        globalCheck: 'window.ServerMonitor',
        description: 'ניטור שרת',
        required: true
      },
      {
        file: 'background-tasks.js',
        globalCheck: 'window.BackgroundTasksManager',
        description: 'משימות רקע',
        required: true
      },
      {
        file: 'auth.js',
        globalCheck: 'window.login',
        description: 'מערכת אימות',
        required: true
      },
      {
        file: 'system-management.js',
        globalCheck: 'window.generateDetailedLog',
        description: 'ניהול מערכת כללי',
        required: true
      },
      {
        file: 'constraint-manager.js',
        globalCheck: 'window.addEnumValue',
        description: 'מנהל אילוצים',
        required: true
      }
    ],
    estimatedSize: '~200KB',
    initTime: '~120ms'
  },

  // 13. INIT PACKAGE - אתחול
  init: {
    id: 'init',
    name: 'Initialization Package',
    description: 'מערכות אתחול וניטור',
    version: '2.0.0',
    critical: false,
    loadOrder: 13,
    dependencies: ['base', 'crud', 'services', 'ui-advanced', 'preferences', 'validation', 'external-data', 'logs', 'cache', 'entity-services', 'helper', 'management'],
    scripts: [
      {
        file: 'init-system/package-manifest.js',
        globalCheck: 'window.PACKAGE_MANIFEST',
        description: 'מנפסט חבילות',
        required: true
      },
      {
        file: 'page-initialization-configs.js',
        globalCheck: 'window.PAGE_INITIALIZATION_CONFIGS',
        description: 'הגדרות אתחול עמודים',
        required: true
      },
      {
        file: 'unified-app-initializer.js',
        globalCheck: 'window.UnifiedAppInitializer',
        description: 'מאתחל אפליקציה מאוחד',
        required: true
      }
    ],
    estimatedSize: '~45KB',
    initTime: '~30ms'
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
