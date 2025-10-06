/**
 * Dynamic Loader Configuration - TikTrack
 * תצורת טעינה דינמית
 * 
 * @fileoverview קובץ תצורה לטעינה דינמית של מודולים
 * @version 1.0.0
 * @author TikTrack Development Team
 * @created 2025-01-06
 */

// ============================================================================
// DYNAMIC LOADER CONFIGURATION - תצורת טעינה דינמית
// ============================================================================

/**
 * Module Configuration Registry
 * רישום תצורות מודולים
 */
const MODULE_CONFIGS = {
    'core-systems': {
        name: 'Core Systems',
        path: 'modules/core-systems.js',
        priority: 1,
        dependencies: [],
        required: true,
        size: '92KB',
        description: 'מערכות ליבה חיוניות - אתחול, התראות, מודולים',
        category: 'core'
    },

    'ui-basic': {
        name: 'UI Basic',
        path: 'modules/ui-basic.js',
        priority: 2,
        dependencies: ['core-systems'],
        required: false,
        size: '56KB',
        description: 'ממשק משתמש בסיסי - כפתורים, טפסים, טבלאות',
        category: 'ui'
    },

    'data-basic': {
        name: 'Data Basic',
        path: 'modules/data-basic.js',
        priority: 2,
        dependencies: ['core-systems'],
        required: false,
        size: '81KB',
        description: 'נתונים בסיסיים - מיפוי טבלאות, מיון, ולידציה',
        category: 'data'
    },

    'ui-advanced': {
        name: 'UI Advanced',
        path: 'modules/ui-advanced.js',
        priority: 3,
        dependencies: ['ui-basic'],
        required: false,
        size: '100KB',
        description: 'ממשק משתמש מתקדם - גרפים, דשבורד, צבעים',
        category: 'ui'
    },

    'data-advanced': {
        name: 'Data Advanced',
        path: 'modules/data-advanced.js',
        priority: 3,
        dependencies: ['data-basic'],
        required: false,
        size: '14KB',
        description: 'נתונים מתקדמים - אנליטיקס, ייצוא, ייבוא',
        category: 'data'
    },

    'business-module': {
        name: 'Business Module',
        path: 'modules/business-module.js',
        priority: 4,
        dependencies: ['data-basic', 'ui-basic'],
        required: false,
        size: '124KB',
        description: 'לוגיקה עסקית - מסחר, חשבונות, התראות',
        category: 'business'
    },

    'communication-module': {
        name: 'Communication Module',
        path: 'modules/communication-module.js',
        priority: 4,
        dependencies: ['core-systems'],
        required: false,
        size: '6.1KB',
        description: 'תקשורת - API, WebSocket, HTTP, שגיאות',
        category: 'communication'
    },

    'cache-module': {
        name: 'Cache Module',
        path: 'modules/cache-module.js',
        priority: 2,
        dependencies: ['core-systems'],
        required: false,
        size: '38KB',
        description: 'מערכת מטמון מותאמת - 4 שכבות, סינכרון',
        category: 'cache'
    }
};

/**
 * Page Requirements Mapping
 * מיפוי דרישות עמודים
 */
const PAGE_REQUIREMENTS = {
    // CRUD Pages
    'trades': {
        modules: ['core-systems', 'data-basic', 'ui-basic', 'business-module'],
        description: 'עמוד מעקב - דורש מערכות בסיסיות ולוגיקה עסקית'
    },
    'executions': {
        modules: ['core-systems', 'data-basic', 'ui-basic', 'business-module'],
        description: 'עמוד ביצועים - דורש מערכות בסיסיות ולוגיקה עסקית'
    },
    'alerts': {
        modules: ['core-systems', 'data-basic', 'ui-basic', 'business-module'],
        description: 'עמוד התראות - דורש מערכות בסיסיות ולוגיקה עסקית'
    },
    'notes': {
        modules: ['core-systems', 'data-basic', 'ui-basic'],
        description: 'עמוד הערות - דורש מערכות בסיסיות'
    },
    'trade_plans': {
        modules: ['core-systems', 'data-basic', 'ui-basic', 'business-module'],
        description: 'עמוד תכנון - דורש מערכות בסיסיות ולוגיקה עסקית'
    },
    'cash_flows': {
        modules: ['core-systems', 'data-basic', 'ui-basic'],
        description: 'עמוד תזרים מזומנים - דורש מערכות בסיסיות'
    },
    'trading_accounts': {
        modules: ['core-systems', 'data-basic', 'ui-basic', 'business-module'],
        description: 'עמוד חשבונות מסחר - דורש מערכות בסיסיות ולוגיקה עסקית'
    },

    // Graph Pages
    'index': {
        modules: ['core-systems', 'ui-basic', 'ui-advanced', 'data-basic'],
        description: 'דשבורד ראשי - דורש מערכות UI מתקדמות'
    },
    'tickers': {
        modules: ['core-systems', 'ui-basic', 'ui-advanced', 'data-basic'],
        description: 'עמוד מניות - דורש מערכות UI מתקדמות'
    },

    // Settings Pages
    'preferences': {
        modules: ['core-systems', 'ui-basic', 'data-basic'],
        description: 'עמוד העדפות - דורש מערכות בסיסיות'
    },

    // Development Tools Pages
    'system-management': {
        modules: ['core-systems', 'ui-basic', 'data-basic', 'communication-module'],
        description: 'ניהול מערכת - דורש מערכות תקשורת'
    },
    'cache-test': {
        modules: ['core-systems', 'cache-module', 'ui-basic'],
        description: 'בדיקת מטמון - דורש מערכת מטמון'
    },
    'js-map': {
        modules: ['core-systems', 'ui-basic', 'data-advanced'],
        description: 'מפת JS - דורש מערכות נתונים מתקדמות'
    },
    'linter-realtime-monitor': {
        modules: ['core-systems', 'ui-basic', 'data-advanced', 'communication-module'],
        description: 'ניטור Linter - דורש מערכות תקשורת ונתונים מתקדמות'
    },
    'chart-management': {
        modules: ['core-systems', 'ui-basic', 'ui-advanced', 'data-basic'],
        description: 'ניהול גרפים - דורש מערכות UI מתקדמות'
    }
};

/**
 * Loading Strategies
 * אסטרטגיות טעינה
 */
const LOADING_STRATEGIES = {
    'eager': {
        name: 'Eager Loading',
        description: 'טעינה מהירה - טוען את כל המודולים הנדרשים מיד',
        useCase: 'עמודים קריטיים שדורשים ביצועים מקסימליים'
    },
    'lazy': {
        name: 'Lazy Loading',
        description: 'טעינה עצלה - טוען מודולים רק כשנדרשים',
        useCase: 'עמודים עם פונקציונליות אופציונלית'
    },
    'hybrid': {
        name: 'Hybrid Loading',
        description: 'טעינה היברידית - טוען מודולים קריטיים מיד, אחרים עצלנית',
        useCase: 'עמודים עם דרישות מעורבות'
    }
};

/**
 * Performance Thresholds
 * ספי ביצועים
 */
const PERFORMANCE_THRESHOLDS = {
    maxInitialLoadSize: '200KB',
    maxModuleSize: '150KB',
    maxLoadingTime: 3000, // milliseconds
    maxConcurrentLoads: 3
};

/**
 * Get module configuration
 * קבלת תצורת מודול
 * 
 * @param {string} moduleName - Module name
 * @returns {Object|null} Module configuration
 */
function getModuleConfig(moduleName) {
    return MODULE_CONFIGS[moduleName] || null;
}

/**
 * Get page requirements
 * קבלת דרישות עמוד
 * 
 * @param {string} pageName - Page name
 * @returns {Object|null} Page requirements
 */
function getPageRequirements(pageName) {
    return PAGE_REQUIREMENTS[pageName] || null;
}

/**
 * Get all available modules
 * קבלת כל המודולים הזמינים
 * 
 * @returns {Array<string>} Available module names
 */
function getAllModules() {
    return Object.keys(MODULE_CONFIGS);
}

/**
 * Get modules by category
 * קבלת מודולים לפי קטגוריה
 * 
 * @param {string} category - Module category
 * @returns {Array<string>} Module names in category
 */
function getModulesByCategory(category) {
    return Object.keys(MODULE_CONFIGS).filter(name => 
        MODULE_CONFIGS[name].category === category
    );
}

/**
 * Calculate total size for modules
 * חישוב גודל כולל למודולים
 * 
 * @param {Array<string>} moduleNames - Module names
 * @returns {string} Total size
 */
function calculateTotalSize(moduleNames) {
    let totalKB = 0;
    for (const moduleName of moduleNames) {
        const config = MODULE_CONFIGS[moduleName];
        if (config) {
            totalKB += parseInt(config.size.replace('KB', ''));
        }
    }
    return `${totalKB}KB`;
}

/**
 * Get loading strategy recommendation
 * קבלת המלצה לאסטרטגיית טעינה
 * 
 * @param {string} pageName - Page name
 * @returns {string} Recommended strategy
 */
function getRecommendedStrategy(pageName) {
    const requirements = getPageRequirements(pageName);
    if (!requirements) return 'lazy';

    const totalSize = calculateTotalSize(requirements.modules);
    const sizeKB = parseInt(totalSize.replace('KB', ''));

    if (sizeKB > 200) return 'lazy';
    if (sizeKB > 100) return 'hybrid';
    return 'eager';
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export to global scope
window.DynamicLoaderConfig = {
    MODULE_CONFIGS,
    PAGE_REQUIREMENTS,
    LOADING_STRATEGIES,
    PERFORMANCE_THRESHOLDS,
    getModuleConfig,
    getPageRequirements,
    getAllModules,
    getModulesByCategory,
    calculateTotalSize,
    getRecommendedStrategy
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MODULE_CONFIGS,
        PAGE_REQUIREMENTS,
        LOADING_STRATEGIES,
        PERFORMANCE_THRESHOLDS,
        getModuleConfig,
        getPageRequirements,
        getAllModules,
        getModulesByCategory,
        calculateTotalSize,
        getRecommendedStrategy
    };
}

console.log('✅ Dynamic Loader Configuration loaded successfully');
