/**
 * System Dependency Graph - TikTrack Smart Initialization System
 * =============================================================
 * 
 * Manages dependencies between individual systems with validation and fallback
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @created October 19, 2025
 */

class SystemDependencyGraph {
  constructor() {
    this.dependencies = new Map();
    this.systems = new Map();
    this.loadedSystems = new Set();
    this.failedSystems = new Set();
    this.initialized = false;
    
    // Initialize with system dependencies
    this.initializeSystemDependencies();
  }

  /**
   * Initialize system dependencies
   * אתחול תלויות מערכות
   */
  initializeSystemDependencies() {
    console.log('🔗 Initializing System Dependency Graph...');

    // Base Systems (no dependencies)
    this.registerSystem('unified-app-initializer', {
      name: 'Unified App Initializer',
      description: 'מערכת אתחול מרכזית',
      dependencies: [],
      critical: true,
      fallback: null,
      loadOrder: 1,
      scripts: ['scripts/unified-app-initializer.js']
    });

    this.registerSystem('notification-system', {
      name: 'Notification System',
      description: 'מערכת התראות גלובלית',
      dependencies: [],
      critical: true,
      fallback: 'console.log',
      loadOrder: 2,
      scripts: ['scripts/notification-system.js']
    });

    this.registerSystem('ui-utils', {
      name: 'UI Utils',
      description: 'כלי עזר לממשק משתמש',
      dependencies: [],
      critical: true,
      fallback: null,
      loadOrder: 3,
      scripts: ['scripts/ui-utils.js']
    });

    this.registerSystem('page-utils', {
      name: 'Page Utils',
      description: 'כלי עזר לעמודים',
      dependencies: [],
      critical: true,
      fallback: null,
      loadOrder: 4,
      scripts: ['scripts/page-utils.js']
    });

    this.registerSystem('translation-utils', {
      name: 'Translation Utils',
      description: 'מערכת תרגום',
      dependencies: [],
      critical: false,
      fallback: 'identity',
      loadOrder: 5,
      scripts: ['scripts/translation-utils.js']
    });

    this.registerSystem('global-favicon', {
      name: 'Global Favicon',
      description: 'ניהול favicon גלובלי',
      dependencies: [],
      critical: false,
      fallback: null,
      loadOrder: 6,
      scripts: ['scripts/global-favicon.js']
    });

    this.registerSystem('warning-system', {
      name: 'Warning System',
      description: 'מערכת החלפת confirm',
      dependencies: [],
      critical: false,
      fallback: 'window.confirm',
      loadOrder: 7,
      scripts: ['scripts/warning-system.js']
    });

    // Cache Systems
    this.registerSystem('unified-cache-manager', {
      name: 'Unified Cache Manager',
      description: 'מנהל מטמון מאוחד',
      dependencies: [],
      critical: true,
      fallback: 'localStorage',
      loadOrder: 8,
      scripts: ['scripts/unified-cache-manager.js']
    });

    this.registerSystem('cache-sync-manager', {
      name: 'Cache Sync Manager',
      description: 'מנהל סינכרון מטמון',
      dependencies: ['unified-cache-manager'],
      critical: false,
      fallback: null,
      loadOrder: 9,
      scripts: ['scripts/cache-sync-manager.js']
    });

    // Header System
    this.registerSystem('header-system', {
      name: 'Header System',
      description: 'מערכת כותרת',
      dependencies: ['notification-system', 'ui-utils'],
      critical: true,
      fallback: 'basicHeader',
      loadOrder: 10,
      scripts: ['scripts/header-system.js']
    });

    // CRUD Systems
    this.registerSystem('tables', {
      name: 'Tables System',
      description: 'מערכת טבלאות',
      dependencies: ['ui-utils', 'page-utils'],
      critical: false,
      fallback: 'basicTable',
      loadOrder: 11,
      scripts: ['scripts/tables.js']
    });

    this.registerSystem('data-utils', {
      name: 'Data Utils',
      description: 'כלי עזר לנתונים',
      dependencies: ['unified-cache-manager'],
      critical: false,
      fallback: 'basicDataUtils',
      loadOrder: 12,
      scripts: ['scripts/data-utils.js']
    });

    this.registerSystem('pagination-system', {
      name: 'Pagination System',
      description: 'מערכת עמודים',
      dependencies: ['tables', 'ui-utils'],
      critical: false,
      fallback: 'basicPagination',
      loadOrder: 13,
      scripts: ['scripts/pagination-system.js']
    });

    // Filter Systems
    this.registerSystem('header-filters', {
      name: 'Header Filters',
      description: 'פילטרים בכותרת',
      dependencies: ['header-system', 'tables'],
      critical: false,
      fallback: 'basicFilters',
      loadOrder: 14,
      scripts: ['scripts/header-system.js'] // Reuses header system
    });

    this.registerSystem('category-detector', {
      name: 'Category Detector',
      description: 'זיהוי קטגוריות',
      dependencies: ['data-utils'],
      critical: false,
      fallback: 'basicCategoryDetector',
      loadOrder: 15,
      scripts: ['scripts/notification-category-detector.js']
    });

    // Chart Systems
    this.registerSystem('chart-system', {
      name: 'Chart System',
      description: 'מערכת גרפים',
      dependencies: ['data-utils', 'ui-utils'],
      critical: false,
      fallback: 'basicChart',
      loadOrder: 16,
      scripts: ['scripts/charts/chart-system.js']
    });

    this.registerSystem('chart-export', {
      name: 'Chart Export',
      description: 'ייצוא גרפים',
      dependencies: ['chart-system'],
      critical: false,
      fallback: null,
      loadOrder: 17,
      scripts: ['scripts/charts/chart-export.js']
    });

    // Advanced Notification Systems
    this.registerSystem('notification-category-detector', {
      name: 'Notification Category Detector',
      description: 'זיהוי קטגוריות התראות',
      dependencies: ['notification-system'],
      critical: false,
      fallback: 'basicCategoryDetector',
      loadOrder: 18,
      scripts: ['scripts/notification-category-detector.js']
    });

    this.registerSystem('global-notification-collector', {
      name: 'Global Notification Collector',
      description: 'איסוף התראות גלובלי',
      dependencies: ['notification-system', 'notification-category-detector'],
      critical: false,
      fallback: 'basicNotificationCollector',
      loadOrder: 19,
      scripts: ['scripts/global-notification-collector.js']
    });

    this.registerSystem('active-alerts-component', {
      name: 'Active Alerts Component',
      description: 'רכיב התראות פעילות',
      dependencies: ['global-notification-collector'],
      critical: false,
      fallback: 'basicAlertsComponent',
      loadOrder: 20,
      scripts: ['scripts/active-alerts-component.js']
    });

    // Advanced UI Systems
    this.registerSystem('button-system', {
      name: 'Button System',
      description: 'מערכת כפתורים',
      dependencies: ['ui-utils'],
      critical: false,
      fallback: 'basicButtons',
      loadOrder: 21,
      scripts: ['scripts/button-system-init.js']
    });

    this.registerSystem('color-scheme-system', {
      name: 'Color Scheme System',
      description: 'מערכת צבעים',
      dependencies: ['ui-utils'],
      critical: false,
      fallback: 'basicColorScheme',
      loadOrder: 22,
      scripts: ['scripts/color-scheme-system.js']
    });

    this.registerSystem('entity-details-system', {
      name: 'Entity Details System',
      description: 'מערכת פרטי ישות',
      dependencies: ['ui-utils', 'data-utils'],
      critical: false,
      fallback: 'basicEntityDetails',
      loadOrder: 23,
      scripts: ['scripts/entity-details-system.js']
    });

    // Preferences Systems
    this.registerSystem('preferences-system', {
      name: 'Preferences System',
      description: 'מערכת העדפות',
      dependencies: ['unified-cache-manager'],
      critical: false,
      fallback: 'basicPreferences',
      loadOrder: 24,
      scripts: ['scripts/preferences.js']
    });

    this.registerSystem('preferences-admin', {
      name: 'Preferences Admin',
      description: 'ניהול העדפות',
      dependencies: ['preferences-system', 'ui-utils'],
      critical: false,
      fallback: 'basicPreferencesAdmin',
      loadOrder: 25,
      scripts: ['scripts/preferences-admin.js']
    });

    // External Data Systems
    this.registerSystem('external-data-system', {
      name: 'External Data System',
      description: 'מערכת נתונים חיצוניים',
      dependencies: ['data-utils', 'unified-cache-manager'],
      critical: false,
      fallback: 'basicExternalData',
      loadOrder: 26,
      scripts: ['scripts/external-data-dashboard.js']
    });

    // Date Time Systems
    this.registerSystem('date-utils', {
      name: 'Date Utils',
      description: 'כלי עזר לתאריכים',
      dependencies: [],
      critical: false,
      fallback: 'basicDateUtils',
      loadOrder: 27,
      scripts: ['scripts/date-utils.js']
    });

    this.registerSystem('time-utils', {
      name: 'Time Utils',
      description: 'כלי עזר לזמן',
      dependencies: ['date-utils'],
      critical: false,
      fallback: 'basicTimeUtils',
      loadOrder: 28,
      scripts: ['scripts/time-utils.js']
    });

    this.initialized = true;
    console.log(`✅ System Dependency Graph initialized with ${this.systems.size} systems`);
  }

  /**
   * Register a system
   * רישום מערכת
   */
  registerSystem(id, config) {
    if (this.systems.has(id)) {
      console.warn(`⚠️ System '${id}' already registered, overwriting...`);
    }

    // Validate system configuration
    this.validateSystemConfig(id, config);

    this.systems.set(id, {
      id,
      ...config,
      registeredAt: new Date().toISOString(),
      status: 'pending'
    });

    console.log(`🔗 Registered system: ${id} - ${config.name}`);
  }

  /**
   * Validate system configuration
   * ולידציה של קונפיגורציית מערכת
   */
  validateSystemConfig(id, config) {
    const required = ['name', 'description', 'dependencies', 'critical', 'fallback', 'loadOrder'];
    const missing = required.filter(field => !(field in config));
    
    if (missing.length > 0) {
      throw new Error(`System '${id}' missing required fields: ${missing.join(', ')}`);
    }

    if (!Array.isArray(config.dependencies)) {
      throw new Error(`System '${id}' dependencies must be an array`);
    }

    if (typeof config.critical !== 'boolean') {
      throw new Error(`System '${id}' critical must be a boolean`);
    }

    if (typeof config.loadOrder !== 'number') {
      throw new Error(`System '${id}' loadOrder must be a number`);
    }
  }

  /**
   * Get system by ID
   * קבלת מערכת לפי מזהה
   */
  getSystem(id) {
    return this.systems.get(id);
  }

  /**
   * Get all systems
   * קבלת כל המערכות
   */
  getAllSystems() {
    return Array.from(this.systems.values());
  }

  /**
   * Get critical systems
   * קבלת מערכות קריטיות
   */
  getCriticalSystems() {
    return this.getAllSystems().filter(system => system.critical);
  }

  /**
   * Get non-critical systems
   * קבלת מערכות לא קריטיות
   */
  getNonCriticalSystems() {
    return this.getAllSystems().filter(system => !system.critical);
  }

  /**
   * Resolve system dependencies
   * פתרון תלויות מערכות
   */
  resolveSystemDependencies(systemIds) {
    const resolved = new Set();
    const loading = new Set();
    const order = [];

    const resolve = (systemId) => {
      if (resolved.has(systemId)) return;
      if (loading.has(systemId)) {
        throw new Error(`Circular dependency detected: ${systemId}`);
      }

      loading.add(systemId);
      const system = this.getSystem(systemId);
      
      if (!system) {
        throw new Error(`System not found: ${systemId}`);
      }

      // Resolve dependencies first
      for (const dep of system.dependencies) {
        resolve(dep);
      }

      resolved.add(systemId);
      loading.delete(systemId);
      order.push(systemId);
    };

    // Resolve all requested systems
    for (const systemId of systemIds) {
      resolve(systemId);
    }

    // Sort by loadOrder
    return order.sort((a, b) => {
      const systemA = this.getSystem(a);
      const systemB = this.getSystem(b);
      return systemA.loadOrder - systemB.loadOrder;
    });
  }

  /**
   * Get scripts for systems in correct order
   * קבלת סקריפטים למערכות בסדר נכון
   */
  getScriptsForSystems(systemIds) {
    const resolvedOrder = this.resolveSystemDependencies(systemIds);
    const scripts = [];

    for (const systemId of resolvedOrder) {
      const system = this.getSystem(systemId);
      if (system && system.scripts) {
        scripts.push(...system.scripts);
      }
    }

    return scripts;
  }

  /**
   * Validate system dependencies
   * ולידציה של תלויות מערכות
   */
  validateSystemDependencies(systemIds) {
    const errors = [];
    const warnings = [];

    for (const systemId of systemIds) {
      const system = this.getSystem(systemId);
      if (!system) {
        errors.push(`System not found: ${systemId}`);
        continue;
      }

      // Check if all dependencies are available
      for (const dep of system.dependencies) {
        if (!this.systems.has(dep)) {
          errors.push(`System '${systemId}' depends on missing system: ${dep}`);
        }
      }

      // Check for circular dependencies
      try {
        this.resolveSystemDependencies([systemId]);
      } catch (error) {
        if (error.message.includes('Circular dependency')) {
          errors.push(`Circular dependency in system: ${systemId}`);
        }
      }

      // Check if critical system has fallback
      if (system.critical && !system.fallback) {
        warnings.push(`Critical system '${systemId}' has no fallback`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Mark system as loaded
   * סימון מערכת כנטענת
   */
  markSystemLoaded(systemId) {
    this.loadedSystems.add(systemId);
    const system = this.getSystem(systemId);
    if (system) {
      system.status = 'loaded';
    }
  }

  /**
   * Mark system as failed
   * סימון מערכת כנכשלת
   */
  markSystemFailed(systemId) {
    this.failedSystems.add(systemId);
    const system = this.getSystem(systemId);
    if (system) {
      system.status = 'failed';
    }
  }

  /**
   * Check if system is loaded
   * בדיקה אם מערכת נטענה
   */
  isSystemLoaded(systemId) {
    return this.loadedSystems.has(systemId);
  }

  /**
   * Check if system failed
   * בדיקה אם מערכת נכשלה
   */
  isSystemFailed(systemId) {
    return this.failedSystems.has(systemId);
  }

  /**
   * Get system status
   * קבלת סטטוס מערכת
   */
  getSystemStatus(systemId) {
    const system = this.getSystem(systemId);
    if (!system) return 'not-found';
    
    if (this.isSystemLoaded(systemId)) return 'loaded';
    if (this.isSystemFailed(systemId)) return 'failed';
    return system.status;
  }

  /**
   * Get loaded systems
   * קבלת מערכות נטענות
   */
  getLoadedSystems() {
    return Array.from(this.loadedSystems);
  }

  /**
   * Get failed systems
   * קבלת מערכות נכשלות
   */
  getFailedSystems() {
    return Array.from(this.failedSystems);
  }

  /**
   * Reset system status
   * איפוס סטטוס מערכות
   */
  resetSystemStatus() {
    this.loadedSystems.clear();
    this.failedSystems.clear();
    
    // Reset all system statuses
    for (const system of this.systems.values()) {
      system.status = 'pending';
    }
  }

  /**
   * Get system statistics
   * קבלת סטטיסטיקות מערכות
   */
  getStatistics() {
    const allSystems = this.getAllSystems();
    
    return {
      total: allSystems.length,
      critical: allSystems.filter(s => s.critical).length,
      nonCritical: allSystems.filter(s => !s.critical).length,
      loaded: this.loadedSystems.size,
      failed: this.failedSystems.size,
      pending: allSystems.length - this.loadedSystems.size - this.failedSystems.size,
      withFallback: allSystems.filter(s => s.fallback).length,
      withoutFallback: allSystems.filter(s => !s.fallback).length
    };
  }

  /**
   * Get dependency chain for a system
   * קבלת שרשרת תלויות למערכת
   */
  getDependencyChain(systemId) {
    const chain = [];
    const visited = new Set();

    const buildChain = (id) => {
      if (visited.has(id)) return;
      visited.add(id);

      const system = this.getSystem(id);
      if (!system) return;

      // Add dependencies first
      for (const dep of system.dependencies) {
        buildChain(dep);
      }

      chain.push(id);
    };

    buildChain(systemId);
    return chain;
  }

  /**
   * Get systems that depend on a system
   * קבלת מערכות שתלויות במערכת
   */
  getDependents(systemId) {
    const dependents = [];
    
    for (const system of this.systems.values()) {
      if (system.dependencies.includes(systemId)) {
        dependents.push(system.id);
      }
    }
    
    return dependents;
  }

  /**
   * Export system configuration
   * ייצוא קונפיגורציית מערכות
   */
  exportConfiguration() {
    return {
      systems: Object.fromEntries(this.systems),
      loaded: Array.from(this.loadedSystems),
      failed: Array.from(this.failedSystems),
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString()
    };
  }
}

// Create global instance
window.SystemDependencyGraph = SystemDependencyGraph;
window.systemDependencyGraph = new SystemDependencyGraph();
window.SYSTEM_DEPENDENCIES = window.systemDependencyGraph.dependencies;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SystemDependencyGraph;
}

console.log('🔗 System Dependency Graph loaded successfully');
