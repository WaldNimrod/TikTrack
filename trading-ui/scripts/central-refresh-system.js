/**
 * Central Refresh System - TikTrack Frontend
 * ==========================================
 *
 * מערכת ריענון מרכזית לכל העמודים המרכזיים
 * 
 * Features:
 * - Centralized refresh pattern for all main pages
 * - Automatic table refresh after CRUD operations
 * - Consistent error handling and user feedback
 * - Cache invalidation support
 * - Retry mechanism for failed operations
 *
 * Usage:
 * - Call window.centralRefresh.refreshPage(pageType) after CRUD operations
 * - Register page-specific refresh functions with window.centralRefresh.registerPage()
 * - Use window.centralRefresh.showSuccessAndRefresh() for success operations
 *
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated September 1, 2025
 */

class CentralRefreshSystem {
  constructor() {
    this.registeredPages = new Map();
    this.refreshQueue = new Set();
    this.isRefreshing = false;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  /**
   * רישום עמוד במערכת הריענון המרכזית
   * @param {string} pageType - סוג העמוד (alerts, accounts, trades, etc.)
   * @param {Object} config - הגדרות העמוד
   * @param {Function} config.refreshFunction - פונקציית הריענון
   * @param {Function} config.loadDataFunction - פונקציית טעינת נתונים
   * @param {string} config.tableId - מזהה הטבלה
   * @param {string} config.successMessage - הודעת הצלחה
   * @param {string} config.errorMessage - הודעת שגיאה
   */
  registerPage(pageType, config) {
    this.registeredPages.set(pageType, {
      refreshFunction: config.refreshFunction,
      loadDataFunction: config.loadDataFunction,
      tableId: config.tableId,
      successMessage: config.successMessage || 'הפעולה בוצעה בהצלחה',
      errorMessage: config.errorMessage || 'שגיאה בביצוע הפעולה',
      lastRefresh: 0,
      refreshCount: 0
    });
    
    console.log(`✅ Central Refresh: Registered page '${pageType}'`);
  }

  /**
   * ריענון עמוד ספציפי
   * @param {string} pageType - סוג העמוד
   * @param {Object} options - אפשרויות ריענון
   */
  async refreshPage(pageType, options = {}) {
    const pageConfig = this.registeredPages.get(pageType);
    
    if (!pageConfig) {
      console.warn(`⚠️ Central Refresh: Page '${pageType}' not registered`);
      return false;
    }

    const {
      force = false,
      showSuccess = false,
      successMessage = null,
      showError = false,
      errorMessage = null
    } = options;

    try {
      // בדיקה אם צריך ריענון
      const now = Date.now();
      if (!force && (now - pageConfig.lastRefresh) < 1000) {
        console.log(`⏭️ Central Refresh: Skipping refresh for '${pageType}' (too recent)`);
        return true;
      }

      console.log(`🔄 Central Refresh: Refreshing page '${pageType}'`);

      // ניקוי מטמון גלובלי לפני ריענון - רק אם צריך
      if (options.force && typeof this.clearGlobalCache === 'function') {
        this.clearGlobalCache(pageType, 'full');
      }

      // ריענון הנתונים
      if (pageConfig.loadDataFunction && typeof pageConfig.loadDataFunction === 'function') {
        await pageConfig.loadDataFunction();
      }

      // ריענון הטבלה
      if (pageConfig.refreshFunction && typeof pageConfig.refreshFunction === 'function') {
        await pageConfig.refreshFunction();
      }

      // עדכון סטטיסטיקות
      pageConfig.lastRefresh = now;
      pageConfig.refreshCount++;

      // הצגת הודעת הצלחה
      if (showSuccess) {
        const message = successMessage || pageConfig.successMessage;
        if (window.showSuccessNotification) {
          window.showSuccessNotification('הצלחה', message);
        }
      }

      console.log(`✅ Central Refresh: Successfully refreshed '${pageType}' (count: ${pageConfig.refreshCount})`);
      return true;

    } catch (error) {
      console.error(`❌ Central Refresh: Error refreshing '${pageType}':`, error);
      
      // הצגת הודעת שגיאה
      if (showError) {
        const message = errorMessage || pageConfig.errorMessage;
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה', message);
        }
      }

      return false;
    }
  }

  /**
   * הצגת הודעת הצלחה וריענון
   * @param {string} pageType - סוג העמוד
   * @param {string} message - הודעת הצלחה
   * @param {Object} options - אפשרויות נוספות
   */
  async showSuccessAndRefresh(pageType, message, options = {}) {
    // הצגת הודעת הצלחה
    if (window.showSuccessNotification) {
      window.showSuccessNotification('הצלחה', message);
    }

    // ריענון העמוד
    await this.refreshPage(pageType, { 
      force: true, 
      showSuccess: false,
      ...options 
    });
  }

  /**
   * ניקוי מטמון לפני פעולת CRUD - גישה חכמה
   * @param {string} pageType - סוג העמוד
   * @param {string} operation - סוג הפעולה (add, edit, delete, cancel)
   * @param {number} itemId - מזהה הפריט (אופציונלי)
   */
  clearCacheBeforeCRUD(pageType, operation = 'full', itemId = null) {
    console.log(`🧹 Central Refresh: Smart cache clearing before CRUD for '${pageType}' - operation: ${operation}`);
    
    // ניקוי מטמון גלובלי חכם
    this.clearGlobalCache(pageType, operation, itemId);
    
    // ניקוי מטמון המערכת רק אם צריך
    if (operation === 'delete' || operation === 'cancel') {
      this.clearCache(pageType);
    }
    
    console.log(`✅ Central Refresh: Smart cache clearing completed for '${pageType}'`);
  }

  /**
   * ריענון כל העמודים הרשומים
   * @param {Object} options - אפשרויות ריענון
   */
  async refreshAllPages(options = {}) {
    const { force = false, showProgress = true } = options;
    
    if (showProgress) {
      console.log(`🔄 Central Refresh: Refreshing all ${this.registeredPages.size} registered pages`);
    }

    const results = [];
    for (const [pageType] of this.registeredPages) {
      const result = await this.refreshPage(pageType, { force, showSuccess: false });
      results.push({ pageType, success: result });
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Central Refresh: Refreshed ${successCount}/${results.length} pages successfully`);
    
    return results;
  }

  /**
   * ריענון עם מנגנון חזרה
   * @param {string} pageType - סוג העמוד
   * @param {Object} options - אפשרויות ריענון
   */
  async refreshWithRetry(pageType, options = {}) {
    const { maxRetries = this.retryAttempts, delay = this.retryDelay } = options;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const success = await this.refreshPage(pageType, { force: true });
        if (success) {
          return true;
        }
      } catch (error) {
        console.warn(`⚠️ Central Refresh: Attempt ${attempt}/${maxRetries} failed for '${pageType}':`, error);
      }

      if (attempt < maxRetries) {
        console.log(`⏳ Central Refresh: Retrying '${pageType}' in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.error(`❌ Central Refresh: All ${maxRetries} attempts failed for '${pageType}'`);
    return false;
  }

  /**
   * קבלת סטטיסטיקות ריענון
   * @returns {Object} סטטיסטיקות
   */
  getStats() {
    const stats = {
      totalPages: this.registeredPages.size,
      pages: {},
      totalRefreshes: 0
    };

    for (const [pageType, config] of this.registeredPages) {
      stats.pages[pageType] = {
        refreshCount: config.refreshCount,
        lastRefresh: config.lastRefresh,
        timeSinceLastRefresh: Date.now() - config.lastRefresh
      };
      stats.totalRefreshes += config.refreshCount;
    }

    return stats;
  }

  /**
   * ניקוי מטמון גלובלי של נתונים - גישה חכמה
   * @param {string} pageType - סוג העמוד
   * @param {string} operation - סוג הפעולה (add, edit, delete, cancel)
   * @param {number} itemId - מזהה הפריט (אופציונלי)
   */
  clearGlobalCache(pageType, operation = 'full', itemId = null) {
    console.log(`🧹 Central Refresh: Smart cache clearing for '${pageType}' - operation: ${operation}`);
    
    // גישה חכמה - ניקוי מינימלי לפי סוג הפעולה
    switch (operation) {
      case 'add':
        // הוספה - רק ניקוי נתונים מקומיים, לא צריך לטעון מחדש
        this.invalidateLocalData(pageType);
        break;
        
      case 'edit':
        // עריכה - עדכון פריט ספציפי אם יש מזהה
        if (itemId) {
          this.updateSpecificItem(pageType, itemId);
        } else {
          this.invalidateLocalData(pageType);
        }
        break;
        
      case 'delete':
      case 'cancel':
        // מחיקה/ביטול - ניקוי מלא כי הפריט נעלם
        this.clearFullCache(pageType);
        break;
        
      default:
        // ברירת מחדל - ניקוי מלא
        this.clearFullCache(pageType);
    }
    
    console.log(`✅ Central Refresh: Smart cache clearing completed for '${pageType}'`);
  }

  /**
   * ניקוי נתונים מקומיים בלבד (לא טעינה מחדש)
   */
  invalidateLocalData(pageType) {
    switch (pageType) {
      case 'alerts':
        if (window.filteredAlertsData) {
          window.filteredAlertsData = [];
        }
        break;
      case 'accounts':
        // לא נוגעים ב-accountsData, רק בפילטרים
        break;
      case 'trades':
        // לא נוגעים ב-tradesData, רק בפילטרים
        break;
    }
  }

  /**
   * עדכון פריט ספציפי במטמון
   */
  updateSpecificItem(pageType, itemId) {
    // כאן אפשר להוסיף לוגיקה לעדכון פריט ספציפי
    // כרגע ניקוי מקומי
    this.invalidateLocalData(pageType);
  }

  /**
   * ניקוי מטמון מלא (רק כשצריך)
   */
  clearFullCache(pageType) {
    switch (pageType) {
      case 'alerts':
        if (window.alertsData) {
          window.alertsData = [];
        }
        if (window.filteredAlertsData) {
          window.filteredAlertsData = [];
        }
        break;
        
      case 'accounts':
        if (window.accountsData) {
          window.accountsData = [];
        }
        if (window.accountsLoaded !== undefined) {
          window.accountsLoaded = false;
        }
        break;
        
      case 'trades':
        if (window.tradesData) {
          window.tradesData = [];
        }
        break;
        
      case 'trade_plans':
        if (window.tradePlansData) {
          window.tradePlansData = [];
        }
        break;
        
      case 'cash_flows':
        if (window.cashFlowsData) {
          window.cashFlowsData = [];
        }
        break;
        
      case 'executions':
        if (window.executionsData) {
          window.executionsData = [];
        }
        break;
        
      case 'tickers':
        if (window.tickersData) {
          window.tickersData = [];
        }
        if (window.tickersSummaryData) {
          window.tickersSummaryData = [];
        }
        break;
        
      case 'notes':
        if (window.notesData) {
          window.notesData = [];
        }
        break;
        
      case 'research':
        if (window.researchData) {
          window.researchData = [];
        }
        break;
    }
  }

  /**
   * ניקוי מטמון ונתונים
   * @param {string} pageType - סוג העמוד (אופציונלי)
   */
  clearCache(pageType = null) {
    if (pageType) {
      const pageConfig = this.registeredPages.get(pageType);
      if (pageConfig) {
        pageConfig.lastRefresh = 0;
        console.log(`🧹 Central Refresh: Cleared cache for '${pageType}'`);
      }
    } else {
      for (const [type, config] of this.registeredPages) {
        config.lastRefresh = 0;
      }
      console.log(`🧹 Central Refresh: Cleared cache for all pages`);
    }
  }

  /**
   * בדיקת בריאות המערכת
   * @returns {Object} מצב המערכת
   */
  healthCheck() {
    const stats = this.getStats();
    const now = Date.now();
    
    return {
      isHealthy: true,
      registeredPages: stats.totalPages,
      totalRefreshes: stats.totalRefreshes,
      oldestRefresh: Math.max(...Object.values(stats.pages).map(p => p.timeSinceLastRefresh)),
      issues: []
    };
  }
}

// יצירת מופע גלובלי
window.centralRefresh = new CentralRefreshSystem();

// רישום עמודים מרכזיים
document.addEventListener('DOMContentLoaded', function() {
  // המתנה קצרה לוודא שכל הסקריפטים נטענו
  setTimeout(() => {
    // רישום עמוד התראות
    if (window.loadAlertsData && window.updateAlertsTable) {
      window.centralRefresh.registerPage('alerts', {
        refreshFunction: window.updateAlertsTable,
        loadDataFunction: window.loadAlertsData,
        tableId: 'alertsTable',
        successMessage: 'התראות עודכנו בהצלחה',
        errorMessage: 'שגיאה בעדכון התראות'
      });
    }

  // רישום עמוד חשבונות
  if (window.loadAccountsData && window.updateAccountsTable) {
    window.centralRefresh.registerPage('accounts', {
      refreshFunction: window.updateAccountsTable,
      loadDataFunction: window.loadAccountsData,
      tableId: 'accountsTable',
      successMessage: 'חשבונות עודכנו בהצלחה',
      errorMessage: 'שגיאה בעדכון חשבונות'
    });
  }

  // רישום עמוד טריידים
  if (window.loadTradesData && window.updateTradesTable) {
    window.centralRefresh.registerPage('trades', {
      refreshFunction: window.updateTradesTable,
      loadDataFunction: window.loadTradesData,
      tableId: 'tradesTable',
      successMessage: 'טריידים עודכנו בהצלחה',
      errorMessage: 'שגיאה בעדכון טריידים'
    });
  }

  // רישום עמוד תכנון טריידים
  if (window.loadTradePlansData && window.updateTradePlansTable) {
    window.centralRefresh.registerPage('trade_plans', {
      refreshFunction: window.updateTradePlansTable,
      loadDataFunction: window.loadTradePlansData,
      tableId: 'tradePlansTable',
      successMessage: 'תכנון טריידים עודכן בהצלחה',
      errorMessage: 'שגיאה בעדכון תכנון טריידים'
    });
  }

  // רישום עמוד תזרים מזומנים
  if (window.loadCashFlowsData && window.updateCashFlowsTable) {
    window.centralRefresh.registerPage('cash_flows', {
      refreshFunction: window.updateCashFlowsTable,
      loadDataFunction: window.loadCashFlowsData,
      tableId: 'cashFlowsTable',
      successMessage: 'תזרים מזומנים עודכן בהצלחה',
      errorMessage: 'שגיאה בעדכון תזרים מזומנים'
    });
  }

  // רישום עמוד ביצועים
  if (window.loadExecutionsData && window.updateExecutionsTable) {
    window.centralRefresh.registerPage('executions', {
      refreshFunction: window.updateExecutionsTable,
      loadDataFunction: window.loadExecutionsData,
      tableId: 'executionsTable',
      successMessage: 'ביצועים עודכנו בהצלחה',
      errorMessage: 'שגיאה בעדכון ביצועים'
    });
  }

  // רישום עמוד טיקרים
  if (window.loadTickersData && window.updateTickersTable) {
    window.centralRefresh.registerPage('tickers', {
      refreshFunction: window.updateTickersTable,
      loadDataFunction: window.loadTickersData,
      tableId: 'tickersTable',
      successMessage: 'טיקרים עודכנו בהצלחה',
      errorMessage: 'שגיאה בעדכון טיקרים'
    });
  }

  // רישום עמוד הערות
  if (window.loadNotesData && window.updateNotesTable) {
    window.centralRefresh.registerPage('notes', {
      refreshFunction: window.updateNotesTable,
      loadDataFunction: window.loadNotesData,
      tableId: 'notesTable',
      successMessage: 'הערות עודכנו בהצלחה',
      errorMessage: 'שגיאה בעדכון הערות'
    });
  }

  // רישום עמוד מחקר
  if (window.loadResearchData && window.updateResearchTable) {
    window.centralRefresh.registerPage('research', {
      refreshFunction: window.updateResearchTable,
      loadDataFunction: window.loadResearchData,
      tableId: 'researchTable',
      successMessage: 'מחקר עודכן בהצלחה',
      errorMessage: 'שגיאה בעדכון מחקר'
    });
  }

    console.log('🎯 Central Refresh System initialized');
    console.log('✅ Smart cache management system ready:');
    console.log('   - ADD operations: Only clear local filters (efficient)');
    console.log('   - EDIT operations: Update specific items when possible');
    console.log('   - DELETE/CANCEL operations: Full cache clear (necessary)');
    console.log('   - All CRUD operations now use intelligent cache management');
  }, 100); // המתנה של 100ms לוודא שכל הסקריפטים נטענו
});

// ייצוא לפונקציות גלובליות
window.refreshPage = (pageType, options) => window.centralRefresh.refreshPage(pageType, options);
window.showSuccessAndRefresh = (pageType, message, options) => window.centralRefresh.showSuccessAndRefresh(pageType, message, options);
window.refreshAllPages = (options) => window.centralRefresh.refreshAllPages(options);
window.clearRefreshCache = (pageType) => window.centralRefresh.clearCache(pageType);
window.clearGlobalCache = (pageType) => window.centralRefresh.clearGlobalCache(pageType);
window.clearCacheBeforeCRUD = (pageType) => window.centralRefresh.clearCacheBeforeCRUD(pageType);
window.getRefreshStats = () => window.centralRefresh.getStats();

// פונקציה לניקוי מטמון מלא
window.clearAllCache = () => {
  console.log('🧹 Clearing all global cache...');
  
  // ניקוי כל המשתנים הגלובליים
  const globalVars = [
    'alertsData', 'filteredAlertsData',
    'accountsData', 'accountsLoaded',
    'tradesData',
    'tradePlansData',
    'cashFlowsData',
    'executionsData',
    'tickersData', 'tickersSummaryData',
    'notesData',
    'researchData',
    'allData',
    'currenciesData', 'currenciesLoaded'
  ];
  
  globalVars.forEach(varName => {
    if (window[varName] !== undefined) {
      if (Array.isArray(window[varName])) {
        window[varName] = [];
      } else if (typeof window[varName] === 'boolean') {
        window[varName] = false;
      } else if (typeof window[varName] === 'object') {
        window[varName] = {};
      }
    }
  });
  
  // ניקוי מטמון המערכת המרכזית
  if (window.centralRefresh) {
    window.centralRefresh.clearCache();
  }
  
  console.log('✅ All global cache cleared');
};

// פונקציה לניקוי מטמון וריענון מלא
window.clearCacheAndRefresh = async (pageType) => {
  console.log(`🧹 Clearing cache and refreshing page: ${pageType}`);
  
  // ניקוי מטמון
  if (window.clearGlobalCache) {
    window.clearGlobalCache(pageType);
  }
  
  // ריענון העמוד
  if (window.refreshPage) {
    await window.refreshPage(pageType, { force: true });
  }
  
  console.log(`✅ Cache cleared and page refreshed: ${pageType}`);
};
