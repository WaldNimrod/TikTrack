/**
 * Package Registry - TikTrack Smart Initialization System
 * ======================================================
 * 
 * Central registry for system packages with dependency management
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @created October 19, 2025
 */

class PackageRegistry {
  constructor() {
    this.packages = new Map();
    this.dependencies = new Map();
    this.loadedPackages = new Set();
    this.initialized = false;
    
    // Initialize with predefined packages
    this.initializePackages();
  }

  /**
   * Initialize predefined packages
   * אתחול חבילות מוגדרות מראש
   */
  initializePackages() {
    console.log('📦 Initializing Package Registry...');

    // 1. Base Package - חבילת בסיס (חובה לכל עמוד)
    this.registerPackage('base', {
      name: 'Base Package',
      description: 'חבילת בסיס חובה לכל עמוד',
      systems: [
        'unified-app-initializer',
        'notification-system',
        'ui-utils',
        'page-utils',
        'translation-utils',
        'global-favicon',
        'warning-system',
        'unified-cache-manager',
        'cache-sync-manager',
        'header-system'
      ],
      required: true,
      critical: true,
      scripts: [
        'scripts/unified-app-initializer.js',
        'scripts/notification-system.js',
        'scripts/ui-utils.js',
        'scripts/page-utils.js',
        'scripts/translation-utils.js',
        'scripts/global-favicon.js',
        'scripts/warning-system.js',
        'scripts/unified-cache-manager.js',
        'scripts/cache-sync-manager.js',
        'scripts/header-system.js'
      ],
      dependencies: [],
      loadOrder: 1
    });

    // 2. CRUD Package - חבילת CRUD
    this.registerPackage('crud', {
      name: 'CRUD Package',
      description: 'מערכות לניהול נתונים וטבלאות',
      systems: [
        'tables',
        'table-mappings',
        'data-utils',
        'pagination-system'
      ],
      required: false,
      critical: false,
      scripts: [
        'scripts/tables.js',
        'scripts/data-utils.js',
        'scripts/pagination-system.js'
      ],
      dependencies: ['base'],
      loadOrder: 2
    });

    // 3. Filters Package - חבילת פילטרים
    this.registerPackage('filters', {
      name: 'Filters Package',
      description: 'מערכות סינון וחיפוש',
      systems: [
        'header-filters',
        'category-detector',
        'search-utils'
      ],
      required: false,
      critical: false,
      scripts: [
        'scripts/header-system.js', // Already in base, but needed for filters
        'scripts/category-detector.js'
      ],
      dependencies: ['base', 'crud'],
      loadOrder: 3
    });

    // 4. Charts Package - חבילת גרפים
    this.registerPackage('charts', {
      name: 'Charts Package',
      description: 'מערכות להצגת נתונים ויזואלית',
      systems: [
        'chart-system',
        'chart-export',
        'chart-utils'
      ],
      required: false,
      critical: false,
      scripts: [
        'scripts/charts/chart-system.js',
        'scripts/charts/chart-export.js'
      ],
      dependencies: ['base', 'crud'],
      loadOrder: 4
    });

    // 5. Advanced Notifications Package - חבילת התראות מתקדמות
    this.registerPackage('advanced-notifications', {
      name: 'Advanced Notifications',
      description: 'מערכות התראות מתקדמות',
      systems: [
        'notification-category-detector',
        'global-notification-collector',
        'active-alerts-component'
      ],
      required: false,
      critical: false,
      scripts: [
        'scripts/notification-category-detector.js',
        'scripts/global-notification-collector.js',
        'scripts/active-alerts-component.js'
      ],
      dependencies: ['base'],
      loadOrder: 5
    });

    // 6. Advanced UI Package - חבילת ממשק משתמש מתקדם
    this.registerPackage('ui-advanced', {
      name: 'Advanced UI Package',
      description: 'מערכות ממשק משתמש מתקדמות',
      systems: [
        'button-system',
        'color-scheme-system',
        'entity-details-system',
        'modal-system'
      ],
      required: false,
      critical: false,
      scripts: [
        'scripts/button-system-init.js',
        'scripts/color-scheme-system.js',
        'scripts/entity-details-system.js'
      ],
      dependencies: ['base'],
      loadOrder: 6
    });

    // 7. Preferences Package - חבילת העדפות
    this.registerPackage('preferences', {
      name: 'Preferences Package',
      description: 'מערכות העדפות והגדרות',
      systems: [
        'preferences-system',
        'preferences-admin'
      ],
      required: false,
      critical: false,
      scripts: [
        'scripts/preferences.js',
        'scripts/preferences-admin.js'
      ],
      dependencies: ['base'],
      loadOrder: 7
    });

    // 8. File Mapping Package - חבילת מיפוי קבצים
    this.registerPackage('file-mapping', {
      name: 'File Mapping Package',
      description: 'מערכות למיפוי וניהול קבצים',
      systems: [
        'file-mapping-system',
        'file-utils'
      ],
      required: false,
      critical: false,
      scripts: [
        'scripts/file-mapping.js'
      ],
      dependencies: ['base'],
      loadOrder: 8
    });

    // 9. External Data Package - חבילת נתונים חיצוניים
    this.registerPackage('external-data', {
      name: 'External Data Package',
      description: 'מערכות לנתונים חיצוניים',
      systems: [
        'external-data-system',
        'external-data-dashboard'
      ],
      required: false,
      critical: false,
      scripts: [
        'scripts/external-data-dashboard.js'
      ],
      dependencies: ['base', 'crud'],
      loadOrder: 9
    });

    // 10. Date Time Package - חבילת תאריכים וזמן
    this.registerPackage('date-time', {
      name: 'Date Time Package',
      description: 'מערכות לתאריכים וזמן',
      systems: [
        'date-utils',
        'time-utils'
      ],
      required: false,
      critical: false,
      scripts: [
        'scripts/date-utils.js',
        'scripts/time-utils.js'
      ],
      dependencies: ['base'],
      loadOrder: 10
    });

    this.initialized = true;
    console.log(`✅ Package Registry initialized with ${this.packages.size} packages`);
  }

  /**
   * Register a package
   * רישום חבילה
   */
  registerPackage(id, config) {
    if (this.packages.has(id)) {
      console.warn(`⚠️ Package '${id}' already registered, overwriting...`);
    }

    // Validate package configuration
    this.validatePackageConfig(id, config);

    this.packages.set(id, {
      id,
      ...config,
      registeredAt: new Date().toISOString()
    });

    console.log(`📦 Registered package: ${id} - ${config.name}`);
  }

  /**
   * Validate package configuration
   * ולידציה של קונפיגורציית חבילה
   */
  validatePackageConfig(id, config) {
    const required = ['name', 'description', 'systems', 'scripts', 'dependencies'];
    const missing = required.filter(field => !config[field]);
    
    if (missing.length > 0) {
      throw new Error(`Package '${id}' missing required fields: ${missing.join(', ')}`);
    }

    if (!Array.isArray(config.systems)) {
      throw new Error(`Package '${id}' systems must be an array`);
    }

    if (!Array.isArray(config.scripts)) {
      throw new Error(`Package '${id}' scripts must be an array`);
    }

    if (!Array.isArray(config.dependencies)) {
      throw new Error(`Package '${id}' dependencies must be an array`);
    }
  }

  /**
   * Get package by ID
   * קבלת חבילה לפי מזהה
   */
  getPackage(id) {
    return this.packages.get(id);
  }

  /**
   * Get all packages
   * קבלת כל החבילות
   */
  getAllPackages() {
    return Array.from(this.packages.values());
  }

  /**
   * Get required packages
   * קבלת חבילות חובה
   */
  getRequiredPackages() {
    return this.getAllPackages().filter(pkg => pkg.required);
  }

  /**
   * Get optional packages
   * קבלת חבילות אופציונליות
   */
  getOptionalPackages() {
    return this.getAllPackages().filter(pkg => !pkg.required);
  }

  /**
   * Resolve package dependencies
   * פתרון תלויות חבילות
   */
  resolveDependencies(packageIds) {
    const resolved = new Set();
    const loading = new Set();
    const order = [];

    const resolve = (pkgId) => {
      if (resolved.has(pkgId)) return;
      if (loading.has(pkgId)) {
        throw new Error(`Circular dependency detected: ${pkgId}`);
      }

      loading.add(pkgId);
      const pkg = this.getPackage(pkgId);
      
      if (!pkg) {
        throw new Error(`Package not found: ${pkgId}`);
      }

      // Resolve dependencies first
      for (const dep of pkg.dependencies) {
        resolve(dep);
      }

      resolved.add(pkgId);
      loading.delete(pkgId);
      order.push(pkgId);
    };

    // Resolve all requested packages
    for (const pkgId of packageIds) {
      resolve(pkgId);
    }

    return order;
  }

  /**
   * Get scripts for packages in correct order
   * קבלת סקריפטים לחבילות בסדר נכון
   */
  getScriptsForPackages(packageIds) {
    const resolvedOrder = this.resolveDependencies(packageIds);
    const scripts = [];

    for (const pkgId of resolvedOrder) {
      const pkg = this.getPackage(pkgId);
      if (pkg && pkg.scripts) {
        scripts.push(...pkg.scripts);
      }
    }

    return scripts;
  }

  /**
   * Get systems for packages
   * קבלת מערכות לחבילות
   */
  getSystemsForPackages(packageIds) {
    const resolvedOrder = this.resolveDependencies(packageIds);
    const systems = [];

    for (const pkgId of resolvedOrder) {
      const pkg = this.getPackage(pkgId);
      if (pkg && pkg.systems) {
        systems.push(...pkg.systems);
      }
    }

    return systems;
  }

  /**
   * Validate package dependencies
   * ולידציה של תלויות חבילות
   */
  validateDependencies(packageIds) {
    const errors = [];
    const warnings = [];

    for (const pkgId of packageIds) {
      const pkg = this.getPackage(pkgId);
      if (!pkg) {
        errors.push(`Package not found: ${pkgId}`);
        continue;
      }

      // Check if all dependencies are available
      for (const dep of pkg.dependencies) {
        if (!this.packages.has(dep)) {
          errors.push(`Package '${pkgId}' depends on missing package: ${dep}`);
        }
      }

      // Check for circular dependencies
      try {
        this.resolveDependencies([pkgId]);
      } catch (error) {
        if (error.message.includes('Circular dependency')) {
          errors.push(`Circular dependency in package: ${pkgId}`);
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Get package statistics
   * קבלת סטטיסטיקות חבילות
   */
  getStatistics() {
    const allPackages = this.getAllPackages();
    
    return {
      total: allPackages.length,
      required: allPackages.filter(p => p.required).length,
      optional: allPackages.filter(p => !p.required).length,
      critical: allPackages.filter(p => p.critical).length,
      totalSystems: allPackages.reduce((sum, p) => sum + p.systems.length, 0),
      totalScripts: allPackages.reduce((sum, p) => sum + p.scripts.length, 0),
      loaded: this.loadedPackages.size
    };
  }

  /**
   * Mark package as loaded
   * סימון חבילה כנטענת
   */
  markPackageLoaded(packageId) {
    this.loadedPackages.add(packageId);
  }

  /**
   * Check if package is loaded
   * בדיקה אם חבילה נטענה
   */
  isPackageLoaded(packageId) {
    return this.loadedPackages.has(packageId);
  }

  /**
   * Get loaded packages
   * קבלת חבילות נטענות
   */
  getLoadedPackages() {
    return Array.from(this.loadedPackages);
  }

  /**
   * Reset loaded packages
   * איפוס חבילות נטענות
   */
  resetLoadedPackages() {
    this.loadedPackages.clear();
  }

  /**
   * Export package configuration
   * ייצוא קונפיגורציית חבילה
   */
  exportConfiguration() {
    return {
      packages: Object.fromEntries(this.packages),
      dependencies: Object.fromEntries(this.dependencies),
      loaded: Array.from(this.loadedPackages),
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString()
    };
  }
}

// Create global instance
window.PackageRegistry = PackageRegistry;
window.packageRegistry = new PackageRegistry();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PackageRegistry;
}

console.log('📦 Package Registry loaded successfully');
