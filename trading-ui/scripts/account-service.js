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
let lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 דקות

/**
 * בדיקה אם ה-cache עדכני
 */
function isCacheValid() {
  return lastCacheUpdate && Date.now() - lastCacheUpdate < CACHE_DURATION;
}

/**
 * ניקוי ה-cache
 */
function clearCache() {
  accountsCache = null;
  lastCacheUpdate = null;
}

/**
 * קבלת כל החשבונות מהשרת
 * @returns {Promise<Array>} מערך של חשבונות
 */
async function getAccounts() {
  try {
    const response = await fetch('/api/v1/accounts/');
    if (response.ok) {
      const data = await response.json();
      const accounts = data.data || data || [];
      return accounts;
    } else {
      // Failed to fetch accounts
      return [];
    }
  } catch (error) {
    // Error fetching accounts
    return [];
  }
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
 * ביטול חשבון - גרסה פשוטה
 * @param {number} accountId - מזהה החשבון
 * @returns {Promise<boolean>} האם הביטול הצליח
 */
async function cancelAccount(accountId) {
  try {
    // ביטול חשבון

    const response = await fetch(`/api/v1/accounts/${accountId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'שגיאה בביטול החשבון');
    }

    // ניקוי ה-cache
    clearCache();

    return true;

  } catch (error) {
    // שגיאה בביטול חשבון
    throw error;
  }
}

/**
 * הפעלה מחדש של חשבון מבוטל - גרסה פשוטה
 * @param {number} accountId - מזהה החשבון
 * @returns {Promise<boolean>} האם ההפעלה מחדש הצליחה
 */
async function reactivateAccount(accountId) {
  try {
    // הפעלה מחדש של חשבון

    const response = await fetch(`/api/v1/accounts/${accountId}`, {
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

  } catch (error) {
    // שגיאה בהפעלה מחדש של חשבון
    throw error;
  }
}

/**
 * קבלת חשבון לפי מזהה
 * @param {number} accountId - מזהה החשבון
 * @returns {Promise<Object|null>} החשבון או null אם לא נמצא
 */
async function getAccountById(accountId) {
  try {
    const response = await fetch(`/api/v1/accounts/${accountId}`);
    if (response.ok) {
      const data = await response.json();
      return data.data || data;
    } else {
      // Failed to fetch account
      return null;
    }
  } catch (error) {
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
  return accountsCache !== null && lastCacheUpdate !== null;
}

// ייצוא הפונקציה הנוספת
window.isAccountsLoaded = isAccountsLoaded;

