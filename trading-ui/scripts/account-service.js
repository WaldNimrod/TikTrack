/**
 * Account Service - Comprehensive Function Index
 * ==========================================
 *
 * This file contains the account service for TikTrack.
 * Provides advanced account management functions with caching and status filtering.
 *
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/ACCOUNT_SERVICE_SYSTEM.md
 *
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

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
 * - cancelAccount() - ביטול חשבון מסחר
 * - reactivateAccount() - הפעלה מחדש של חשבון מסחר
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
/**
 * Clear accounts cache
 * @function clearCache
 * @returns {void}
 * @deprecated Use window.clearCacheQuick() or window.clearAllCacheAdvanced() instead
 */
function clearCache() {
  // Use centralized cache clearing instead of local clearing
  if (typeof window.clearCacheQuick === 'function') {
    window.clearCacheQuick();
  } else {
    // Fallback to local clearing only if centralized system not available
    accountsCache = null;
    accountsLastCacheUpdate = null;
    console.log('🧹 Accounts cache cleared (local fallback)');
  }
}

/**
 * קבלת כל החשבונות מהשרת
 * @returns {Promise<Array>} מערך של חשבונות
 */
/**
 * Get all accounts from server
 * @function getAccounts
 * @async
 * @returns {Promise<Array>} Array of accounts
 */
async function getAccounts() {
  try {
    const response = await fetch('/api/accounts/');
    if (response.ok) {
      const data = await response.json();
      const accounts = data.data || data || [];
      return accounts;
    } else {
      // Failed to fetch accounts
      return [];
    }
  } catch {
    // Error fetching accounts
    return [];
  }
}

/**
 * קבלת חשבונות פעילים (לא מבוטלים)
 * @returns {Promise<Array>} מערך של חשבונות פעילים
 */
/**
 * Get active accounts only
 * @function getActiveAccounts
 * @async
 * @returns {Promise<Array>} Array of active accounts
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
/**
 * Get accounts by status
 * @function getAccountsByStatus
 * @async
 * @param {string} status - Account status
 * @returns {Promise<Array>} Array of accounts with specified status
 */
async function getAccountsByStatus(status) {
  const accounts = await getAccounts();
  return accounts.filter(account => account.status === status);
}

/**
 * ביטול חשבון מסחר - גרסה פשוטה
 * @param {number} accountId - מזהה החשבון מסחר
 * @returns {Promise<boolean>} האם הביטול הצליח
 */
/**
 * Cancel account
 * @function cancelAccount
 * @async
 * @param {number} accountId - Account ID
 * @returns {Promise<boolean>} Success status
 */
async function cancelAccount(accountId) {
  // ביטול חשבון מסחר – השתמש בתהליך המאוחד של trading_accounts
  if (typeof window.cancelTradingAccountWithLinkedItemsCheck === 'function') {
    await window.cancelTradingAccountWithLinkedItemsCheck(accountId);
    return true;
  }

  if (
    typeof window.checkLinkedItemsAndPerformAction === 'function' &&
    typeof window.performTradingAccountCancellation === 'function'
  ) {
    await window.checkLinkedItemsAndPerformAction(
      'account',
      accountId,
      'cancel',
      window.performTradingAccountCancellation,
    );
    return true;
  }

  // Fallback legacy flow (should not be used anymore)
  const response = await fetch(`/api/accounts/${accountId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled' }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'שגיאה בביטול החשבון מסחר');
  }

  clearCache();
  return true;
}

/**
 * הפעלה מחדש של חשבון מסחר מבוטל - גרסה פשוטה
 * @param {number} accountId - מזהה החשבון מסחר
 * @returns {Promise<boolean>} האם ההפעלה מחדש הצליחה
 */
/**
 * Reactivate account
 * @function reactivateAccount
 * @async
 * @param {number} accountId - Account ID
 * @returns {Promise<boolean>} Success status
 */
async function reactivateAccount(accountId) {
  // הפעלה מחדש של חשבון מסחר

  const response = await fetch(`/api/accounts/${accountId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'open' }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'שגיאה בהפעלה מחדש של החשבון מסחר');
  }

  // ניקוי ה-cache
  clearCache();

  return true;
}

/**
 * קבלת חשבון מסחר לפי מזהה
 * @param {number} accountId - מזהה החשבון מסחר
 * @returns {Promise<Object|null>} החשבון מסחר או null אם לא נמצא
 */
/**
 * Get account by ID
 * @function getAccountById
 * @async
 * @param {number} accountId - Account ID
 * @returns {Promise<Object|null>} Account object or null
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
/**
 * Check if accounts are loaded
 * @function isAccountsLoaded
 * @returns {boolean} Whether accounts are loaded
 */
function isAccountsLoaded() {
  return accountsCache !== null && accountsLastCacheUpdate !== null;
}

// ===== GLOBAL EXPORTS =====
window.clearCache = clearCache;
window.getAccounts = getAccounts;
window.getActiveAccounts = getActiveAccounts;
window.getAccountsByStatus = getAccountsByStatus;
window.cancelAccount = cancelAccount;
window.reactivateAccount = reactivateAccount;
window.getAccountById = getAccountById;
window.isAccountsLoaded = isAccountsLoaded;

