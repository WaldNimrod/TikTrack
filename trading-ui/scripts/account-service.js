// ===== שירות חשבונות כללי =====
/*
 * Account Service - Global Account Management
 * ========================================
 *
 * שירות כללי לחשבונות שמספק פונקציות מתקדמות לקבלת חשבונות
 * לפי תנאים שונים. זמין לכל העמודים באפליקציה.
 *
 * פונקציות עיקריות:
 * - getAccounts() - קבלת כל החשבונות
 * - getActiveAccounts() - חשבונות פעילים
 * - getAccountsByStatus() - חשבונות לפי סטטוס
 * - cancelAccount() - ביטול חשבון
 * - reactivateAccount() - הפעלה מחדש של חשבון
 *
 * File: trading-ui/scripts/account-service.js
 * Version: 1.0
 * Created: August 31, 2025
 */

// Cache לחשבונות
let accountsCache = null;
let accountsLastCacheUpdate = null;
// const CACHE_DURATION = 5 * 60 * 1000; // 5 דקות - לא בשימוש כרגע

// Function removed - not in use

/**
 * ניקוי ה-cache
 */
function clearCache() {
  accountsCache = null;
  accountsLastCacheUpdate = null;
}

/**
 * עיבוד נתוני חשבונות עם מערכת מיפוי טבלאות
 * @param {Array} rawData - נתונים גולמיים מהשרת
 * @returns {Array} נתונים מעובדים
 */
function processAccountsData(rawData) {
  const accounts = rawData.data || rawData;
  
  return accounts.map(account => {
    // שימוש במערכת מיפוי טבלאות אם זמינה
    if (window.getColumnValue && window.tableMappings) {
      return {
        id: window.getColumnValue(account, 0, 'accounts') || account.id,
        name: window.getColumnValue(account, 1, 'accounts') || account.name,
        currency: window.getColumnValue(account, 2, 'accounts') || account.currency,
        status: window.getColumnValue(account, 3, 'accounts') || account.status,
        cashBalance: parseFloat(window.getColumnValue(account, 4, 'accounts')) || 0,
        totalValue: parseFloat(window.getColumnValue(account, 5, 'accounts')) || 0,
        totalPL: parseFloat(window.getColumnValue(account, 6, 'accounts')) || 0,
        notes: window.getColumnValue(account, 7, 'accounts') || account.notes || ''
      };
    } else {
      // fallback למיפוי ידני
      return {
        id: account.id,
        name: account.name || 'Unknown',
        currency: account.currency || 'USD',
        status: account.status || 'unknown',
        cashBalance: parseFloat(account.cash_balance) || 0,
        totalValue: parseFloat(account.total_value) || 0,
        totalPL: parseFloat(account.total_pl) || 0,
        notes: account.notes || ''
      };
    }
  });
}

/**
 * קבלת כל החשבונות מהשרת עם אינטגרציה למערכת מטמון מאוחדת
 * @returns {Promise<Array>} מערך של חשבונות
 */
async function getAccounts() {
  try {
    // נסה לקבל ממטמון מאוחד קודם
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
      const cachedData = await window.UnifiedCacheManager.get('trading_accounts_data', {
        layer: 'localStorage'
      });
      if (cachedData && isCacheValid(cachedData)) {
        console.log('📦 נתונים נטענו ממטמון');
        return cachedData.data;
      }
    }

    // אם אין במטמון, טען מהשרת
    console.log('🌐 טוען נתונים מהשרת...');
    const response = await fetch('/api/trading-accounts/'); // תיקון endpoint
    if (response.ok) {
      const data = await response.json();
      
      // עיבוד נתונים עם מערכת מיפוי טבלאות
      const processedAccounts = processAccountsData(data);
      
      // שמור במטמון מאוחד עם מדיניות
      if (window.UnifiedCacheManager) {
        await window.UnifiedCacheManager.save('trading_accounts_data', {
          data: processedAccounts,
          timestamp: Date.now()
        }, {
          layer: 'localStorage',
          ttl: 300000, // 5 דקות
          compress: false
        });
      }
      
      return processedAccounts;
    } else {
      console.warn('⚠️ תגובת שרת לא תקינה:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }
}

/**
 * בדיקת תקינות מטמון
 * @param {Object} cachedData - נתוני מטמון
 * @returns {boolean} האם המטמון תקין
 */
function isCacheValid(cachedData) {
  if (!cachedData || !cachedData.timestamp) return false;
  
  const now = Date.now();
  const cacheAge = now - cachedData.timestamp;
  const maxAge = 300000; // 5 דקות
  
  return cacheAge < maxAge;
}

/**
 * קבלת חשבונות פעילים (לא מבוטלים)
 * @returns {Promise<Array>} מערך של חשבונות פעילים
 */
async function getActiveAccounts() {
  const accounts = await getAccounts();
  return accounts.filter(account => account.status !== 'cancelled');
}

/**
 * קבלת חשבונות לפי סטטוס
 * @param {string} status - הסטטוס הרצוי
 * @returns {Promise<Array>} מערך של חשבונות
 */
async function getAccountsByStatus(status) {
  const accounts = await getAccounts();
  return accounts.filter(account => account.status === status);
}

/**
 * ביטול חשבון עם אינטגרציה למערכות כלליות
 * @param {number} accountId - מזהה החשבון
 * @param {string} accountName - שם החשבון (לאופציונלי להודעות)
 * @returns {Promise<boolean>} האם הביטול הצליח
 */
async function cancelAccount(accountId, accountName = 'החשבון') {
  try {
    const response = await fetch(`/api/trading-accounts/${accountId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      // הצגת הודעה באמצעות מערכת התראות
      if (window.showSuccessNotification) {
        window.showSuccessNotification(`חשבון "${accountName}" בוטל בהצלחה`);
      }
      
      // ניקוי מטמון מקומי
      if (window.UnifiedCacheManager) {
        await window.UnifiedCacheManager.remove('trading_accounts_data', {
          layer: 'localStorage'
        });
      }
      
      // סינכרון עם שרת - ביטול מטמון Backend
      if (window.CacheSyncManager) {
        await window.CacheSyncManager.invalidateBackend(['trading_accounts']);
      }
      
      // ניקוי cache מקומי (legacy)
      clearCache();
      
      return true;
    } else {
      throw new Error(`Failed to cancel account: ${response.status}`);
    }
  } catch (error) {
    console.error('Error canceling account:', error);
    if (window.showErrorNotification) {
      window.showErrorNotification(`שגיאה בביטול חשבון "${accountName}"`);
    }
    return false;
  }
}

/**
 * הפעלה מחדש של חשבון מבוטל - גרסה פשוטה
 * @param {number} accountId - מזהה החשבון
 * @returns {Promise<boolean>} האם ההפעלה מחדש הצליחה
 */
async function reactivateAccount(accountId) {
  // הפעלה מחדש של חשבון

  const response = await fetch(`/api/accounts/${accountId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'open' }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'שגיאה בהפעלה מחדש של החשבון');
  }

  // ניקוי ה-cache
  clearCache();

  return true;
}

/**
 * קבלת חשבון לפי מזהה
 * @param {number} accountId - מזהה החשבון
 * @returns {Promise<Object|null>} החשבון או null אם לא נמצא
 */
async function getAccountById(accountId) {
  try {
    const response = await fetch(`/api/accounts/${accountId}`);
    if (response.ok) {
      const data = await response.json();
      return data.data || data;
    } else {
      // Failed to fetch account
      return null;
    }
  } catch {
    // Error fetching account
    return null;
  }
}

// ייצוא הפונקציות לגלובל
window.getAccounts = getAccounts;
window.getActiveAccounts = getActiveAccounts;
window.getAccountsByStatus = getAccountsByStatus;
window.cancelAccount = cancelAccount;
window.reactivateAccount = reactivateAccount;
window.getAccountById = getAccountById;
window.clearAccountsCache = clearCache;

// הוספת פונקציות נוספות שנדרשות
/**
 * פונקציה לבדיקה אם החשבונות נטענו
 * @returns {boolean} האם החשבונות נטענו
 */
function isAccountsLoaded() {
  return accountsCache !== null && accountsLastCacheUpdate !== null;
}

// ייצוא הפונקציה הנוספת
window.isAccountsLoaded = isAccountsLoaded;

