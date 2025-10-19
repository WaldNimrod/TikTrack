/**
 * Package Manifest - TikTrack Initialization System
 * מנפסט חבילות מרכזי לניהול תלויות ובדיקות תקינות
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
    version: '1.0.0',
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
        file: 'button-system-init.js',
        globalCheck: 'window.ButtonSystem',
        description: 'מערכת כפתורים',
        required: true
      },
      {
        file: 'unified-cache-manager.js',
        globalCheck: 'window.UnifiedCacheManager',
        description: 'מנהל cache מאוחד',
        required: true
      },
      {
        file: 'cache-sync-manager.js',
        globalCheck: 'window.CacheSyncManager',
        description: 'סנכרון cache',
        required: true
      },
      {
        file: 'header-system.js',
        globalCheck: 'window.HeaderSystem',
        description: 'מערכת header',
        required: true
      },
      {
        file: 'preferences.js',
        globalCheck: 'window.getCurrentPreference',
        description: 'מערכת העדפות',
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
        file: 'tables.js',
        globalCheck: 'window.setupSortableHeaders',
        description: 'מערכת טבלאות',
        required: true
      },
      {
        file: 'data-utils.js',
        globalCheck: 'window.DataUtils',
        description: 'כלי עזר נתונים',
        required: true
      },
      {
        file: 'date-utils.js',
        globalCheck: 'window.formatDate',
        description: 'כלי עזר תאריכים',
        required: true
      },
      {
        file: 'pagination-system.js',
        globalCheck: 'window.PaginationSystem',
        description: 'מערכת עימוד',
        required: false
      },
      {
        file: 'modules/actions-menu-system.js',
        globalCheck: 'window.createActionsMenu',
        description: 'מערכת תפריט פעולות נפתח',
        required: false
      }
    ],
    estimatedSize: '~150KB',
    initTime: '~80ms'
  },

  // 3. FILTERS PACKAGE
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
        description: 'ניהול מערכת',
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
        globalCheck: 'window.Preferences',
        description: 'מערכת העדפות',
        required: false
      },
      {
        file: 'preferences-core.js',
        globalCheck: 'window.PreferencesCore',
        description: 'ליבת העדפות',
        required: false
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

  // 10. VALIDATION PACKAGE
  validation: {
    id: 'validation',
    name: 'Validation Package',
    description: 'מערכות ולידציה',
    version: '1.0.0',
    critical: false,
    loadOrder: 10,
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
