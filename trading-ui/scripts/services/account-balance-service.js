/**
 * Account Balance Service - Comprehensive Function Index
 * ======================================================
 * 
 * מערכת מרכזית לטעינת יתרות חשבונות מסחר
 * מספקת גישה נוחה ומהירה ליתרות בכל המערכת
 * 
 * Related Documentation:
 * - documentation/04-FEATURES/CORE/ACCOUNTS/ACCOUNT_BALANCE_SERVICE.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Last Updated: November 2025
 * 
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 7
 * 
 * BALANCE LOADING (2)
 * - getBalance(accountId, options) - טעינת יתרה עבור חשבון בודד
 * - getBalances(accountIds, options) - טעינת יתרות עבור מספר חשבונות (batch)
 * 
 * CACHE REFRESH (2)
 * - refreshBalance(accountId) - רענון יתרה (נקיית cache וטעינה מחדש)
 * - refreshBalances(accountIds) - רענון מספר יתרות (batch)
 * 
 * CACHE MANAGEMENT (2)
 * - clearCache(accountId) - נקיית cache עבור חשבון ספציפי
 * - clearCaches(accountIds) - נקיית cache עבור מספר חשבונות
 * 
 * UTILITIES (1)
 * - _checkDependencies() - בדיקה האם תלויות נדרשות זמינות (private)
 * 
 * ==========================================
 * 
 * תכונות:
 * - טעינת יתרה עבור חשבון בודד
 * - טעינת יתרות עבור מספר חשבונות (batch)
 * - ניהול cache אוטומטי דרך UnifiedCacheManager
 * - API אופטימלי עם batch loading
 * - תמיכה ב-refresh manual
 * - אינטגרציה עם cache invalidation
 * 
 * שימוש בסיסי:
 * ```javascript
 * // יתרה בודדת
 * const balance = await AccountBalanceService.getBalance(1);
 * console.log(balance.base_currency_total); // 10000.50
 * 
 * // מספר יתרות (batch - יעיל יותר)
 * const balances = await AccountBalanceService.getBalances([1, 2, 3]);
 * balances.forEach((balance, accountId) => {
 *   console.log(`Account ${accountId}: ${balance.base_currency_total}`);
 * });
 * ```
 */

// ===== ACCOUNT BALANCE SERVICE =====

class AccountBalanceService {
    /**
     * בדיקה האם תלויות נדרשות זמינות
     * 
     * @function _checkDependencies
     * @private
     * @returns {boolean} האם כל התלויות זמינות (true) או לא (false)
     * 
     * @description
     * בודק אם UnifiedCacheManager זמין. משמש פונקציות פנימיות של ה-service
     * לוודא שתנאי הקדם נענים לפני ניסיון שימוש ב-cache.
     */
    static _checkDependencies() {
        if (!window.UnifiedCacheManager) {
            window.Logger?.warn('⚠️ AccountBalanceService: UnifiedCacheManager not available', { page: "account-balance-service" });
            return false;
        }
        return true;
    }

    /**
     * טעינת יתרה עבור חשבון בודד
     * 
     * @function getBalance
     * @param {number} accountId - ID של חשבון מסחר
     * @param {Object} [options={}] - אופציות טעינה
     * @param {boolean} [options.useCache=true] - האם להשתמש ב-cache
     * @param {boolean} [options.forceRefresh=false] - האם לעקוף cache ולטעון מחדש
     * @returns {Promise<Object|null>} נתוני יתרה או null במקרה של שגיאה
     * 
     * @description
     * טוען יתרה עבור חשבון מסחר בודד. משתמש ב-cache אוטומטית (TTL: 60 שניות)
     * ומספק אפשרות לרענון ידני. הנתונים כוללים יתרה במטבע בסיס ויתרות לפי מטבע.
     * 
     * @example
     * // שימוש רגיל (עם cache)
     * const balance = await AccountBalanceService.getBalance(1);
     * if (balance) {
     *   console.log(`Balance: ${balance.base_currency_total} ${balance.base_currency}`);
     *   console.log(`Balances by currency:`, balance.balances_by_currency);
     * }
     * 
     * @example
     * // רענון ידני (עוקף cache)
     * const freshBalance = await AccountBalanceService.getBalance(1, { 
     *   forceRefresh: true 
     * });
     * 
     * @example
     * // בלי cache כלל
     * const balance = await AccountBalanceService.getBalance(1, { 
     *   useCache: false 
     * });
     * 
     * @see {@link getBalances} לטעינת מספר יתרות (יעיל יותר)
     * @see {@link refreshBalance} לרענון מהיר
     */
    static async getBalance(accountId, options = {}) {
        if (!accountId || accountId <= 0) {
            window.Logger?.warn('⚠️ AccountBalanceService: Invalid accountId', { accountId, page: "account-balance-service" });
            return null;
        }

        const { useCache = true, forceRefresh = false } = options;
        const cacheKey = `account-balance-${accountId}`;

        // בדיקת cache אם מותר
        if (useCache && !forceRefresh && this._checkDependencies()) {
            try {
                const cached = await window.UnifiedCacheManager.get(cacheKey, {
                    ttl: 60000 // 1 minute
                });
                
                if (cached) {
                    window.Logger?.debug(`✅ AccountBalanceService: Retrieved balance for account ${accountId} from cache`, { page: "account-balance-service" });
                    return cached;
                }
            } catch (error) {
                window.Logger?.warn('⚠️ AccountBalanceService: Cache retrieval failed, fetching from API', error, { page: "account-balance-service" });
            }
        }

        // טעינה מ-API
        try {
            const response = await fetch(`/api/account-activity/${accountId}/balances`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.status === 'success' && result.data) {
                const balanceData = result.data;
                
                // שמירה ב-cache
                if (useCache && this._checkDependencies()) {
                    try {
                        await window.UnifiedCacheManager.save(cacheKey, balanceData, {
                            ttl: 60000, // 1 minute
                            layer: 'backend' // Use backend cache layer for consistency
                        });
                    } catch (cacheError) {
                        window.Logger?.warn('⚠️ AccountBalanceService: Failed to cache balance', cacheError, { page: "account-balance-service" });
                    }
                }

                window.Logger?.debug(`✅ AccountBalanceService: Loaded balance for account ${accountId}`, { 
                    base_currency_total: balanceData.base_currency_total,
                    base_currency: balanceData.base_currency,
                    page: "account-balance-service" 
                });

                return balanceData;
            } else {
                throw new Error(result.error?.message || 'Failed to load balance');
            }
        } catch (error) {
            window.Logger?.error(`❌ AccountBalanceService: Error loading balance for account ${accountId}:`, error, { page: "account-balance-service" });
            return null;
        }
    }

    /**
     * טעינת יתרות עבור מספר חשבונות (batch loading)
     * יעיל יותר מטעינה נפרדת - טוען במקביל
     * 
     * @function getBalances
     * @param {Array<number>} accountIds - מערך של IDs של חשבונות מסחר
     * @param {Object} [options={}] - אופציות טעינה
     * @param {boolean} [options.useCache=true] - האם להשתמש ב-cache
     * @param {boolean} [options.forceRefresh=false] - האם לעקוף cache ולטעון מחדש
     * @returns {Promise<Map<number, Object>>} Map של accountId -> balance data
     * 
     * @description
     * טוען יתרות עבור מספר חשבונות במקביל (Promise.all). יעיל יותר מטעינה נפרדת
     * ומספק Map נוח לגישה לפי accountId. משתמש ב-cache אוטומטית לכל חשבון.
     * 
     * @example
     * // טעינת מספר יתרות
     * const balances = await AccountBalanceService.getBalances([1, 2, 3]);
     * 
     * // שימוש ב-Map
     * balances.forEach((balance, accountId) => {
     *   console.log(`Account ${accountId}: ${balance.base_currency_total}`);
     * });
     * 
     * // המרה ל-Array אם צריך
     * const balanceArray = Array.from(balances.entries());
     * 
     * @example
     * // רענון מספר יתרות
     * const freshBalances = await AccountBalanceService.getBalances([1, 2, 3], {
     *   forceRefresh: true
     * });
     * 
     * @see {@link getBalance} לטעינת יתרה בודדת
     * @see {@link refreshBalances} לרענון מהיר
     */
    static async getBalances(accountIds, options = {}) {
        if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
            window.Logger?.warn('⚠️ AccountBalanceService: Invalid accountIds array', { accountIds, page: "account-balance-service" });
            return new Map();
        }

        const balanceMap = new Map();

        // טעינה במקביל (Promise.all)
        const promises = accountIds.map(async (accountId) => {
            const balance = await this.getBalance(accountId, options);
            if (balance) {
                balanceMap.set(accountId, balance);
            }
        });

        await Promise.all(promises);

        window.Logger?.debug(`✅ AccountBalanceService: Loaded ${balanceMap.size} balances from ${accountIds.length} accounts`, { 
            loaded: balanceMap.size,
            requested: accountIds.length,
            page: "account-balance-service" 
        });

        return balanceMap;
    }

    /**
     * רענון יתרה (נקיית cache וטעינה מחדש)
     * 
     * @function refreshBalance
     * @param {number} accountId - ID של חשבון מסחר
     * @returns {Promise<Object|null>} נתוני יתרה מעודכנים או null במקרה של שגיאה
     * 
     * @description
     * מנקה את ה-cache עבור חשבון ספציפי וטוען יתרה מחדש מהשרת.
     * שימושי לאחר יצירת/עדכון/mמחיקת execution או cash flow.
     * 
     * @example
     * // אחרי יצירת execution
     * await createExecution(executionData);
     * const freshBalance = await AccountBalanceService.refreshBalance(1);
     * 
     * @see {@link refreshBalances} לרענון מספר יתרות
     * @see {@link getBalance} לטעינה רגילה (עם cache)
     */
    static async refreshBalance(accountId) {
        return await this.getBalance(accountId, { useCache: true, forceRefresh: true });
    }

    /**
     * רענון מספר יתרות (batch)
     * 
     * @function refreshBalances
     * @param {Array<number>} accountIds - מערך של IDs של חשבונות מסחר
     * @returns {Promise<Map<number, Object>>} Map של accountId -> balance data
     * 
     * @description
     * מנקה את ה-cache עבור מספר חשבונות וטוען יתרות מחדש מהשרת במקביל.
     * שימושי לאחר פעולות CRUD מרובות.
     * 
     * @example
     * // אחרי יצירת מספר executions
     * await createExecutions([exec1, exec2, exec3]);
     * const freshBalances = await AccountBalanceService.refreshBalances([1, 2, 3]);
     * 
     * @see {@link refreshBalance} לרענון יתרה בודדת
     * @see {@link getBalances} לטעינה רגילה (עם cache)
     */
    static async refreshBalances(accountIds) {
        return await this.getBalances(accountIds, { useCache: true, forceRefresh: true });
    }

    /**
     * נקיית cache עבור חשבון ספציפי
     * 
     * @function clearCache
     * @param {number} accountId - ID של חשבון מסחר
     * @returns {Promise<boolean>} האם הניקוי הצליח (true) או נכשל (false)
     * 
     * @description
     * מנקה את ה-cache עבור חשבון ספציפי. לרוב לא נדרש ידנית - cache מתנקה
     * אוטומטית דרך CacheSyncManager כאשר נוצרים/מתעדכנים/נמחקים executions
     * או cash flows.
     * 
     * @example
     * // נקיית cache ידנית (לרוב לא נדרש)
     * await AccountBalanceService.clearCache(1);
     * 
     * @see {@link clearCaches} לנקיית מספר חשבונות
     * @see {@link refreshBalance} לרענון מלא (נקייה + טעינה מחדש)
     */
    static async clearCache(accountId) {
        if (!accountId || accountId <= 0) {
            return false;
        }

        if (!this._checkDependencies()) {
            return false;
        }

        const cacheKey = `account-balance-${accountId}`;
        
        try {
            await window.UnifiedCacheManager.remove(cacheKey);
            window.Logger?.debug(`✅ AccountBalanceService: Cleared cache for account ${accountId}`, { page: "account-balance-service" });
            return true;
        } catch (error) {
            window.Logger?.warn('⚠️ AccountBalanceService: Failed to clear cache', error, { page: "account-balance-service" });
            return false;
        }
    }

    /**
     * נקיית cache עבור מספר חשבונות
     * 
     * @function clearCaches
     * @param {Array<number>} accountIds - מערך של IDs של חשבונות מסחר
     * @returns {Promise<number>} מספר חשבונות שנוקו בהצלחה
     * 
     * @description
     * מנקה את ה-cache עבור מספר חשבונות במקביל. מחזיר את מספר החשבונות
     * שנוקו בהצלחה (יכול להיות פחות מהמספר המבוקש אם חלקם נכשלו).
     * 
     * @example
     * // נקיית cache עבור מספר חשבונות
     * const cleared = await AccountBalanceService.clearCaches([1, 2, 3]);
     * console.log(`Cleared ${cleared} account caches`);
     * 
     * @see {@link clearCache} לנקיית חשבון בודד
     * @see {@link refreshBalances} לרענון מלא (נקייה + טעינה מחדש)
     */
    static async clearCaches(accountIds) {
        if (!accountIds || !Array.isArray(accountIds)) {
            return 0;
        }

        const promises = accountIds.map(accountId => this.clearCache(accountId));
        const results = await Promise.all(promises);
        
        const successCount = results.filter(r => r === true).length;
        
        window.Logger?.debug(`✅ AccountBalanceService: Cleared ${successCount}/${accountIds.length} account caches`, { 
            cleared: successCount,
            total: accountIds.length,
            page: "account-balance-service" 
        });

        return successCount;
    }
}

// ===== GLOBAL EXPORTS =====

// Export as class
window.AccountBalanceService = AccountBalanceService;

// Export convenience functions (backward compatibility)
window.getAccountBalance = AccountBalanceService.getBalance.bind(AccountBalanceService);
window.getAccountBalances = AccountBalanceService.getBalances.bind(AccountBalanceService);
window.refreshAccountBalance = AccountBalanceService.refreshBalance.bind(AccountBalanceService);
window.refreshAccountBalances = AccountBalanceService.refreshBalances.bind(AccountBalanceService);
window.clearAccountBalanceCache = AccountBalanceService.clearCache.bind(AccountBalanceService);
window.clearAccountBalanceCaches = AccountBalanceService.clearCaches.bind(AccountBalanceService);

// Mark as ready
window.AccountBalanceServiceReady = true;

// Log initialization
if (window.Logger) {
    window.Logger.info('✅ AccountBalanceService loaded successfully', { page: "account-balance-service" });
} else {
    console.log('✅ AccountBalanceService loaded successfully');
}

