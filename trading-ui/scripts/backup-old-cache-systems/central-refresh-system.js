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
          window.showSuccessNotification('הצלחה', message, 4000, 'system');
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
      window.showSuccessNotification('הצלחה', message, 4000, 'system');
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
      case 'fileMappings':
        // ניקוי מטמון מקומי עבור fileMappings
        if (window.projectFiles) {
          window.projectFiles = {};
        }
        break;
      case 'notifications':
        // ניקוי מטמון מקומי עבור notifications
        if (window.notificationHistory) {
          window.notificationHistory = [];
        }
        if (window.notificationStats) {
          window.notificationStats = {};
        }
        break;
      case 'header':
        // ניקוי מטמון מקומי עבור header
        if (window.headerState) {
          window.headerState = {};
        }
        if (window.filterStates) {
          window.filterStates = {};
        }
        if (window.sectionStates) {
          window.sectionStates = {};
        }
        if (window.accountsData) {
          window.accountsData = {};
        }
        break;
      case 'linter':
        // ניקוי מטמון מקומי עבור linter
        if (window.scanningResults) {
          window.scanningResults = {};
        }
        if (window.linterLogEntries) {
          window.linterLogEntries = [];
        }
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
        
      case 'fileMappings':
        // ניקוי מטמון IndexedDB עבור fileMappings
        if (window.UnifiedIndexedDB && typeof window.UnifiedIndexedDB.clearStore === 'function') {
          window.UnifiedIndexedDB.clearStore('fileMappings').catch(error => {
            console.warn('⚠️ Failed to clear fileMappings from IndexedDB:', error);
          });
        }
        // ניקוי מטמון מקומי
        if (window.projectFiles) {
          window.projectFiles = {};
        }
        if (window.projectFilesScanner) {
          window.projectFilesScanner.clearCache().catch(error => {
            console.warn('⚠️ Failed to clear project files scanner cache:', error);
          });
        }
        break;
        
      case 'notifications':
        // ניקוי מטמון IndexedDB עבור notifications
        if (window.UnifiedIndexedDB && typeof window.UnifiedIndexedDB.clearStore === 'function') {
          window.UnifiedIndexedDB.clearStore('notificationHistory').catch(error => {
            console.warn('⚠️ Failed to clear notificationHistory from IndexedDB:', error);
          });
          window.UnifiedIndexedDB.clearStore('notificationStats').catch(error => {
            console.warn('⚠️ Failed to clear notificationStats from IndexedDB:', error);
          });
        }
        // ניקוי מטמון מקומי
        if (window.notificationHistory) {
          window.notificationHistory = [];
        }
        if (window.notificationStats) {
          window.notificationStats = {};
        }
        // ניקוי localStorage fallback
        try {
          localStorage.removeItem('tiktrack_global_notifications_history');
          localStorage.removeItem('tiktrack_global_notifications_stats');
        } catch (e) {
          console.warn('⚠️ Failed to clear notification localStorage:', e);
        }
        break;
        
      case 'header':
        // ניקוי מטמון IndexedDB עבור header
        if (window.UnifiedIndexedDB && typeof window.UnifiedIndexedDB.clearStore === 'function') {
          window.UnifiedIndexedDB.clearStore('headerStates').catch(error => {
            console.warn('⚠️ Failed to clear headerStates from IndexedDB:', error);
          });
          window.UnifiedIndexedDB.clearStore('filterStates').catch(error => {
            console.warn('⚠️ Failed to clear filterStates from IndexedDB:', error);
          });
          window.UnifiedIndexedDB.clearStore('sectionStates').catch(error => {
            console.warn('⚠️ Failed to clear sectionStates from IndexedDB:', error);
          });
          window.UnifiedIndexedDB.clearStore('accountsData').catch(error => {
            console.warn('⚠️ Failed to clear accountsData from IndexedDB:', error);
          });
        }
        // ניקוי מטמון מקומי
        if (window.headerState) {
          window.headerState = {};
        }
        if (window.filterStates) {
          window.filterStates = {};
        }
        if (window.sectionStates) {
          window.sectionStates = {};
        }
        if (window.accountsData) {
          window.accountsData = {};
        }
        // ניקוי localStorage fallback
        try {
          localStorage.removeItem('headerState');
          localStorage.removeItem('filterStates');
          localStorage.removeItem('tiktrack_accounts');
        } catch (e) {
          console.warn('⚠️ Failed to clear header localStorage:', e);
        }
        break;
        
      case 'linter':
        // ניקוי מטמון IndexedDB עבור linter
        if (window.UnifiedIndexedDB && typeof window.UnifiedIndexedDB.clearStore === 'function') {
          window.UnifiedIndexedDB.clearStore('linterScanningResults').catch(error => {
            console.warn('⚠️ Failed to clear linterScanningResults from IndexedDB:', error);
          });
          window.UnifiedIndexedDB.clearStore('linterLogEntries').catch(error => {
            console.warn('⚠️ Failed to clear linterLogEntries from IndexedDB:', error);
          });
        }
        // ניקוי מטמון מקומי
        if (window.scanningResults) {
          window.scanningResults = {};
        }
        if (window.linterLogEntries) {
          window.linterLogEntries = [];
        }
        // ניקוי localStorage fallback
        try {
          localStorage.removeItem('linterScanningResults');
          localStorage.removeItem('linterLogEntries');
        } catch (e) {
          console.warn('⚠️ Failed to clear linter localStorage:', e);
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
window.clearCacheBeforeCRUD = (pageType, operation = 'full', itemId = null) => window.centralRefresh.clearCacheBeforeCRUD(pageType, operation, itemId);
window.getRefreshStats = () => window.centralRefresh.getStats();

// פונקציה מיוחדת לניקוי cache של קבצים סטטיים בלבד
window.clearStaticFilesCache = () => {
  console.log('🧹 Clearing static files cache...');
  
  try {
    // ניקוי Browser Cache לקבצים סטטיים
    clearBrowserCache();
    
    // הצגת התראה למשתמש
    console.log('✅ מטמון הקבצים הסטטיים נוקה בהצלחה');
    if (typeof showNotification === 'function') {
      showNotification('מטמון הקבצים הסטטיים נוקה בהצלחה', 'success', 'הצלחה', 3000, 'system');
    } else {
      console.log('🔔 הודעת הצלחה: מטמון הקבצים הסטטיים נוקה בהצלחה');
    }
    
    console.log('✅ Static files cache cleared');
  } catch (error) {
    console.error('❌ Error clearing static files cache:', error);
    if (typeof showNotification === 'function') {
      showNotification('שגיאה בניקוי מטמון הקבצים הסטטיים', 'error', 'שגיאה', 3000, 'system');
    }
  }
};

// פונקציה מיוחדת לכפיית רענון אייקונים
window.forceIconRefresh = () => {
  console.log('🖼️ Forcing icon refresh...');
  
  try {
    // כפיית רענון אייקונים
    forceIconRefresh();
    
    // הצגת התראה למשתמש
    console.log('✅ האייקונים רוענו בהצלחה');
    if (typeof showNotification === 'function') {
      showNotification('האייקונים רוענו בהצלחה', 'success', 'הצלחה', 2000, 'system');
    } else {
      console.log('🔔 הודעת הצלחה: האייקונים רוענו בהצלחה');
    }
    
    console.log('✅ Icon refresh forced');
  } catch (error) {
    console.error('❌ Error forcing icon refresh:', error);
    if (typeof showNotification === 'function') {
      showNotification('שגיאה ברענון האייקונים', 'error', 'שגיאה', 2000, 'system');
    }
  }
};

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
    'currenciesData', 'currenciesLoaded',
    'scanningResults', 'projectFiles'
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
  
  // ניקוי Browser Cache - הוספה חדשה!
  clearBrowserCache();
  
  console.log('✅ All global cache cleared');
  
  // הצגת התראה למשתמש
  if (typeof showNotification === 'function') {
    showNotification('המטמון נוקה בהצלחה (כולל קבצים סטטיים)', 'success', 'הצלחה', 4000, 'system');
  }
  
  // Note: Linter-specific cache clearing is handled by the linter system itself
};

/**
 * ניקוי Browser Cache - פונקציה חדשה
 * מנקה את מטמון הדפדפן לקבצים סטטיים
 */
function clearBrowserCache() {
  console.log('🧹 Clearing browser cache...');
  
  try {
    // ניקוי localStorage ו-sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // ניקוי IndexedDB
    if (window.indexedDB && window.indexedDB.deleteDatabase) {
      // רשימת מסדי נתונים לנקות
      const dbNames = ['UnifiedIndexedDB', 'TikTrackCache', 'ProjectFilesCache'];
      
      dbNames.forEach(dbName => {
        try {
          const deleteReq = window.indexedDB.deleteDatabase(dbName);
          deleteReq.onsuccess = () => console.log(`✅ Deleted database: ${dbName}`);
          deleteReq.onerror = () => console.warn(`⚠️ Failed to delete database: ${dbName}`);
        } catch (e) {
          console.warn(`⚠️ Error deleting database ${dbName}:`, e);
        }
      });
    }
    
    // ניקוי Service Worker cache אם קיים
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName).then(() => {
            console.log(`✅ Deleted cache: ${cacheName}`);
          }).catch(err => {
            console.warn(`⚠️ Failed to delete cache ${cacheName}:`, err);
          });
        });
      }).catch(err => {
        console.warn('⚠️ Error getting cache names:', err);
      });
    }
    
    // הוספת timestamp לקבצים סטטיים כדי לשבור cache
    addTimestampToStaticFiles();
    
    console.log('✅ Browser cache cleared');
  } catch (error) {
    console.error('❌ Error clearing browser cache:', error);
  }
}

/**
 * הוספת timestamp לקבצים סטטיים כדי לשבור cache
 */
function addTimestampToStaticFiles() {
  console.log('🕒 Adding timestamps to static files...');
  
  try {
    // רשימת קבצים סטטיים שעלולים להיות במטמון
    const staticFiles = [
      'images/icons/trading_accounts.svg',
      'images/icons/accounts.svg',
      'images/icons/alerts.svg',
      'images/icons/trades.svg',
      'images/icons/tickers.svg',
      'styles-new/main.css',
      'scripts/trading_accounts.js',
      'scripts/accounts.js'
    ];
    
    let updatedFiles = 0;
    
    staticFiles.forEach(filePath => {
      // חיפוש כל האלמנטים שמשתמשים בקבצים האלה
      const selectors = [
        `img[src*="${filePath}"]`,
        `link[href*="${filePath}"]`,
        `script[src*="${filePath}"]`
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const currentSrc = element.src || element.href;
          if (currentSrc && !currentSrc.includes('?t=')) {
            const separator = currentSrc.includes('?') ? '&' : '?';
            const newSrc = currentSrc + separator + 't=' + Date.now();
            
            if (element.src) {
              element.src = newSrc;
            } else if (element.href) {
              element.href = newSrc;
            }
            
            console.log(`🕒 Added timestamp to: ${filePath}`);
            updatedFiles++;
          }
        });
      });
    });
    
    // אם לא מצאנו קבצים לעדכון, ננסה לכפות רענון של כל האייקונים
    if (updatedFiles === 0) {
      console.log('🔄 No files found with timestamps, forcing icon refresh...');
      forceIconRefresh();
    }
    
    console.log(`✅ Timestamps added to ${updatedFiles} static files`);
  } catch (error) {
    console.error('❌ Error adding timestamps to static files:', error);
  }
}

/**
 * כפיית רענון אייקונים - פונקציה חדשה
 */
function forceIconRefresh() {
  console.log('🔄 Forcing icon refresh...');
  
  try {
    // רשימת אייקונים שעלולים להיות במטמון
    const iconSelectors = [
      'img[src*="images/icons/"]',
      'img[src*="trading_accounts.svg"]',
      'img[src*="accounts.svg"]'
    ];
    
    iconSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const originalSrc = element.src;
        if (originalSrc) {
          // הוספת timestamp ייחודי לכל אייקון
          const separator = originalSrc.includes('?') ? '&' : '?';
          const newSrc = originalSrc + separator + 'cache_bust=' + Date.now() + '_' + Math.random();
          
          // שמירת המקור המקורי
          element.setAttribute('data-original-src', originalSrc);
          
          // עדכון המקור
          element.src = newSrc;
          
          console.log(`🔄 Forced refresh for icon: ${originalSrc}`);
        }
      });
    });
    
    console.log('✅ Icon refresh forced');
  } catch (error) {
    console.error('❌ Error forcing icon refresh:', error);
  }
}

// פונקציה לניקוי מטמון פג תוקף
window.clearExpiredCache = async () => {
  console.log('🧹 Clearing expired cache...');
  
  try {
    const response = await fetch('/api/cache/clear', { method: 'POST' });
    if (response.ok) {
      console.log('✅ Expired cache cleared from server');
      if (typeof window.showSuccessNotification === 'function') {
        window.showSuccessNotification('הצלחה', 'נוקו ערכי מטמון פגי תוקף', 4000, 'system');
      }
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error clearing expired cache:', error);
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה בניקוי מטמון פג תוקף - השרת לא זמין');
    }
  }
};

// פונקציה לניקוי מטמון פיתוח
window.clearDevelopmentCacheGlobal = async (event) => {
  console.log('🧹 Clearing development cache...');
  
  // הגדרת המשתנה button בתחילת הפונקציה
  let button = null;

  try {
    // מציאת הכפתור - קודם מנסה event.target, אחרת מחפש ב-DOM
    if (event && event.target) {
      button = event.target;
    } else {
      // חיפוש אחר הכפתור ב-DOM
      button = document.querySelector('[onclick*="clearDevelopmentCache"]') ||
               document.querySelector('a[onclick*="clearDevelopmentCache"]');
    }

    // אם עדיין לא מצאנו את הכפתור, נחפש לפי הטקסט
    if (!button) {
      button = document.querySelector('a:contains("נקה Cache (פיתוח)")') ||
               Array.from(document.querySelectorAll('a')).find(a =>
                 a.textContent.includes('נקה Cache (פיתוח)'),
               );
    }

    // הצגת הודעת טעינה
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מנקה...';
      button.disabled = true;
      button.dataset.originalText = originalText;
    }

    // ===== שלב 1: ניקוי Cache של הדפדפן =====

    // ניקוי localStorage (רק פריטים שקשורים למערכת)
    try {
      const keysToKeep = ['user-preferences', 'theme', 'language', 'auth-token'];
      const allKeys = Object.keys(localStorage);
      let clearedLocalStorage = 0;

      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
          clearedLocalStorage++;
        }
      });
      
      console.log(`🗑️ נוקה ${clearedLocalStorage} פריטים מ-localStorage`);
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות localStorage:', e);
    }

    // ניקוי sessionStorage
    try {
      sessionStorage.clear();
      console.log('🗑️ נוקה sessionStorage');
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות sessionStorage:', e);
    }

    // ניקוי IndexedDB
    try {
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        let clearedDatabases = 0;
        for (const db of databases) {
          await indexedDB.deleteDatabase(db.name);
          clearedDatabases++;
        }
        console.log(`🗑️ נוקה ${clearedDatabases} מסדי נתונים מ-IndexedDB`);
      }
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות IndexedDB:', e);
    }

    // ===== שלב 2: ניקוי Service Workers =====
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        let clearedWorkers = 0;
        for (const registration of registrations) {
          await registration.unregister();
          clearedWorkers++;
        }
        console.log(`🗑️ נוקה ${clearedWorkers} Service Workers`);
      }
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות Service Workers:', e);
    }

    // ===== שלב 3: ניקוי Cache API =====
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        let clearedCaches = 0;
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          clearedCaches++;
        }
        console.log(`🗑️ נוקה ${clearedCaches} Cache API entries`);
      }
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות Cache API:', e);
    }

    // ===== שלב 4: ניקוי Application Cache =====
    try {
      if ('applicationCache' in window) {
        window.applicationCache.update();
        console.log('🗑️ נוקה Application Cache');
      }
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות Application Cache:', e);
    }

    // ===== שלב 5: ניקוי Cache של Fetch =====
    try {
      if ('fetch' in window && window.fetch.cache) {
        window.fetch.cache.clear();
        console.log('🗑️ נוקה Fetch cache');
      }
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות Fetch cache:', e);
    }

    // ===== שלב 6: ניקוי Cache של השרת =====
    try {
      const response = await fetch('/api/cache/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ נוקה מטמון השרת:', result.message);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות מטמון השרת:', e);
    }

    // ===== שלב 7: ניקוי DOM Cache =====
    try {
      // ניקוי cache של תמונות
      const images = document.querySelectorAll('img');
      let refreshedImages = 0;
      images.forEach(img => {
        if (img.src) {
          img.src = img.src + '?t=' + Date.now();
          refreshedImages++;
        }
      });
      console.log(`🗑️ רענן ${refreshedImages} תמונות`);
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות תמונות:', e);
    }

    // ===== שלב 8: ניקוי Cache של JavaScript Files =====
    try {
      // ניקוי cache של JavaScript files
      const scripts = document.querySelectorAll('script[src]');
      let refreshedScripts = 0;
      scripts.forEach(script => {
        if (script.src && !script.src.includes('?t=')) {
          script.src = script.src + '?t=' + Date.now();
          refreshedScripts++;
        }
      });
      console.log(`🗑️ רענן ${refreshedScripts} JavaScript files`);
    } catch (e) {
      console.warn('⚠️ לא ניתן לנקות JavaScript files:', e);
    }

    // Clear global cache variables
    window.clearAllCache();

    // ===== הצגת הודעת הצלחה =====
    console.log('✅ Cache נוקה בהצלחה - כולל דפדפן ושרת');
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הצלחה', 'Cache נוקה בהצלחה - כולל דפדפן ושרת', 4000, 'system');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('Cache נוקה בהצלחה - כולל דפדפן ושרת', 'success', 'הצלחה', 4000, 'system');
    } else {
      console.log('🔔 הודעת הצלחה: Cache נוקה בהצלחה - כולל דפדפן ושרת');
    }

    // ===== הודעת רענון הדף =====
    console.log('🔄 הדף ירענן בעוד 3 שניות...');
    if (typeof window.showInfoNotification === 'function') {
      window.showInfoNotification('מידע', 'הדף ירענן בעוד 3 שניות...', 3000, 'system');
    } else if (typeof window.showNotification === 'function') {
      window.showNotification('הדף ירענן בעוד 3 שניות...', 'info', 'מידע', 3000, 'system');
    } else {
      console.log('🔔 הודעת מידע: הדף ירענן בעוד 3 שניות...');
    }

    setTimeout(() => {
      setTimeout(() => {
        // forced reload - bypass all cache
        window.location.reload(true);
      }, 1000);
    }, 2000);

  } catch (error) {
    console.error('❌ שגיאה כללית בניקוי Cache:', error);

    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', 'שגיאה כללית בניקוי Cache: ' + error.message);
    }
  } finally {
    // החזרת הכפתור למצב רגיל
    if (button) {
      const originalText = button.dataset.originalText || '🧹';
      button.innerHTML = originalText;
      button.disabled = false;
    }
  }
};

// Export the same function under the original name for backward compatibility
window.clearDevelopmentCache = window.clearDevelopmentCacheGlobal;

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

// ===== CENTRAL REFRESH HANDLER FUNCTIONS =====
// פונקציות ניהול רענון מרכזיות

/**
 * Register refresh handler for a specific page or component
 * רישום מטפל רענון לעמוד או רכיב ספציפי
 * 
 * @param {string} handlerId - מזהה ייחודי למטפל
 * @param {Function} refreshFunction - פונקציית הרענון
 * @param {Object} options - אפשרויות נוספות
 */
function registerRefreshHandler(handlerId, refreshFunction, options = {}) {
  try {
    console.log(`📝 Registering refresh handler: ${handlerId}`);
    
    // בדיקה שהפונקציה תקינה
    if (typeof refreshFunction !== 'function') {
      throw new Error('Refresh function must be a valid function');
    }
    
    // יצירת מטפל רענון
    const handler = {
      id: handlerId,
      function: refreshFunction,
      options: {
        autoRefresh: options.autoRefresh || false,
        interval: options.interval || 30000, // 30 seconds default
        enabled: options.enabled !== false, // enabled by default
        priority: options.priority || 'normal', // low, normal, high
        dependencies: options.dependencies || [],
        ...options
      },
      lastRefresh: 0,
      refreshCount: 0,
      isActive: false
    };
    
    // שמירה במערכת המרכזית
    if (!window.centralRefresh.refreshHandlers) {
      window.centralRefresh.refreshHandlers = new Map();
    }
    
    window.centralRefresh.refreshHandlers.set(handlerId, handler);
    
    // הפעלת רענון אוטומטי אם מוגדר
    if (handler.options.autoRefresh && handler.options.enabled) {
      startAutoRefresh(handlerId);
    }
    
    console.log(`✅ Refresh handler registered: ${handlerId}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error registering refresh handler ${handlerId}:`, error);
    return false;
  }
}

/**
 * Trigger page refresh for a specific handler
 * הפעלת רענון עמוד עבור מטפל ספציפי
 * 
 * @param {string} handlerId - מזהה המטפל
 * @param {Object} options - אפשרויות רענון
 */
async function triggerPageRefresh(handlerId, options = {}) {
  try {
    console.log(`🔄 Triggering page refresh: ${handlerId}`);
    
    // בדיקה שהמטפל קיים
    if (!window.centralRefresh.refreshHandlers || !window.centralRefresh.refreshHandlers.has(handlerId)) {
      console.warn(`⚠️ Refresh handler not found: ${handlerId}`);
      return false;
    }
    
    const handler = window.centralRefresh.refreshHandlers.get(handlerId);
    
    // בדיקה שהמטפל מופעל
    if (!handler.options.enabled) {
      console.log(`⏭️ Refresh handler disabled: ${handlerId}`);
      return false;
    }
    
    // בדיקה אם צריך רענון (לא יותר מדי תכוף)
    const now = Date.now();
    if (!options.force && (now - handler.lastRefresh) < 1000) {
      console.log(`⏭️ Refresh too recent for handler: ${handlerId}`);
      return true;
    }
    
    // הפעלת הפונקציה
    try {
      await handler.function(options);
      
      // עדכון סטטיסטיקות
      handler.lastRefresh = now;
      handler.refreshCount++;
      
      console.log(`✅ Page refresh completed: ${handlerId} (count: ${handler.refreshCount})`);
      return true;
      
    } catch (error) {
      console.error(`❌ Error in refresh function for ${handlerId}:`, error);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error triggering page refresh ${handlerId}:`, error);
    return false;
  }
}

/**
 * Check if auto refresh is enabled for a handler
 * בדיקה אם רענון אוטומטי מופעל עבור מטפל
 * 
 * @param {string} handlerId - מזהה המטפל
 * @returns {boolean} האם רענון אוטומטי מופעל
 */
function autoRefreshEnabled(handlerId) {
  try {
    if (!window.centralRefresh.refreshHandlers || !window.centralRefresh.refreshHandlers.has(handlerId)) {
      return false;
    }
    
    const handler = window.centralRefresh.refreshHandlers.get(handlerId);
    return handler.options.autoRefresh && handler.options.enabled;
    
  } catch (error) {
    console.error(`❌ Error checking auto refresh status for ${handlerId}:`, error);
    return false;
  }
}

/**
 * Start auto refresh for a handler
 * הפעלת רענון אוטומטי עבור מטפל
 * 
 * @param {string} handlerId - מזהה המטפל
 */
function startAutoRefresh(handlerId) {
  try {
    if (!window.centralRefresh.refreshHandlers || !window.centralRefresh.refreshHandlers.has(handlerId)) {
      console.warn(`⚠️ Cannot start auto refresh - handler not found: ${handlerId}`);
      return;
    }
    
    const handler = window.centralRefresh.refreshHandlers.get(handlerId);
    
    // בדיקה אם כבר מופעל
    if (handler.isActive) {
      console.log(`⏭️ Auto refresh already active for: ${handlerId}`);
      return;
    }
    
    // הפעלת הרענון האוטומטי
    handler.isActive = true;
    handler.intervalId = setInterval(async () => {
      if (handler.options.enabled && handler.options.autoRefresh) {
        await triggerPageRefresh(handlerId);
      } else {
        stopAutoRefresh(handlerId);
      }
    }, handler.options.interval);
    
    console.log(`✅ Auto refresh started for: ${handlerId} (interval: ${handler.options.interval}ms)`);
    
  } catch (error) {
    console.error(`❌ Error starting auto refresh for ${handlerId}:`, error);
  }
}

/**
 * Stop auto refresh for a handler
 * עצירת רענון אוטומטי עבור מטפל
 * 
 * @param {string} handlerId - מזהה המטפל
 */
function stopAutoRefresh(handlerId) {
  try {
    if (!window.centralRefresh.refreshHandlers || !window.centralRefresh.refreshHandlers.has(handlerId)) {
      console.warn(`⚠️ Cannot stop auto refresh - handler not found: ${handlerId}`);
      return;
    }
    
    const handler = window.centralRefresh.refreshHandlers.get(handlerId);
    
    if (handler.intervalId) {
      clearInterval(handler.intervalId);
      handler.intervalId = null;
    }
    
    handler.isActive = false;
    console.log(`✅ Auto refresh stopped for: ${handlerId}`);
    
  } catch (error) {
    console.error(`❌ Error stopping auto refresh for ${handlerId}:`, error);
  }
}

/**
 * Enable/disable a refresh handler
 * הפעלה/השבתה של מטפל רענון
 * 
 * @param {string} handlerId - מזהה המטפל
 * @param {boolean} enabled - האם להפעיל
 */
function setRefreshHandlerEnabled(handlerId, enabled) {
  try {
    if (!window.centralRefresh.refreshHandlers || !window.centralRefresh.refreshHandlers.has(handlerId)) {
      console.warn(`⚠️ Cannot set enabled status - handler not found: ${handlerId}`);
      return false;
    }
    
    const handler = window.centralRefresh.refreshHandlers.get(handlerId);
    handler.options.enabled = enabled;
    
    // הפעלה/עצירה של רענון אוטומטי
    if (enabled && handler.options.autoRefresh) {
      startAutoRefresh(handlerId);
    } else if (!enabled) {
      stopAutoRefresh(handlerId);
    }
    
    console.log(`✅ Refresh handler ${enabled ? 'enabled' : 'disabled'}: ${handlerId}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error setting enabled status for ${handlerId}:`, error);
    return false;
  }
}

/**
 * Get refresh handler statistics
 * קבלת סטטיסטיקות מטפלי רענון
 * 
 * @returns {Object} סטטיסטיקות
 */
function getRefreshHandlerStats() {
  try {
    if (!window.centralRefresh.refreshHandlers) {
      return { totalHandlers: 0, activeHandlers: 0, handlers: {} };
    }
    
    const stats = {
      totalHandlers: window.centralRefresh.refreshHandlers.size,
      activeHandlers: 0,
      handlers: {}
    };
    
    for (const [handlerId, handler] of window.centralRefresh.refreshHandlers) {
      stats.handlers[handlerId] = {
        enabled: handler.options.enabled,
        autoRefresh: handler.options.autoRefresh,
        isActive: handler.isActive,
        refreshCount: handler.refreshCount,
        lastRefresh: handler.lastRefresh,
        interval: handler.options.interval,
        priority: handler.options.priority
      };
      
      if (handler.isActive) {
        stats.activeHandlers++;
      }
    }
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error getting refresh handler stats:', error);
    return { totalHandlers: 0, activeHandlers: 0, handlers: {} };
  }
}

// Export refresh handler functions
window.registerRefreshHandler = registerRefreshHandler;
window.triggerPageRefresh = triggerPageRefresh;
window.autoRefreshEnabled = autoRefreshEnabled;
window.startAutoRefresh = startAutoRefresh;
window.stopAutoRefresh = stopAutoRefresh;
window.setRefreshHandlerEnabled = setRefreshHandlerEnabled;
window.getRefreshHandlerStats = getRefreshHandlerStats;
