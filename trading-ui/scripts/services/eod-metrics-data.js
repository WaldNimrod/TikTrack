/**
 * EOD Metrics Data Service - שירות נתוני EOD עם caching
 *
 * שירות זה מספק גישה לנתוני מדדי EOD (End of Day) עם caching מתקדם
 * ותמיכה ב-TTL. השירות משלב עם UnifiedCacheManager ו-CacheTTLGuard
 * כדי להבטיח ביצועים גבוהים ופחת חישובים מיותרים.
 *
 * @author EOD Historical Metrics System
 * @version 1.0.0
 * @since 2025-01-01
 */

class EODMetricsDataService {
    /**
     * יוצר מופע חדש של שירות נתוני EOD
     *
     * @constructor
     */
    constructor() {
        this.baseUrl = '/api/eod';
        this.cachePrefix = 'eod_';
    }

    /**
     * מקבל מדדי פורטפוליו יומיים עבור משתמש
     *
     * @async
     * @param {number} userId - מזהה המשתמש
     * @param {Object} [filters={}] - מסננים
     * @param {number} [filters.account_id] - מזהה חשבון מסחר (אופציונלי)
     * @param {string} [filters.date_from] - תאריך התחלה (YYYY-MM-DD)
     * @param {string} [filters.date_to] - תאריך סיום (YYYY-MM-DD)
     * @param {boolean} [filters.include_positions] - האם לכלול מידע על פוזיציות
     * @returns {Promise<Object>} נתוני מדדי הפורטפוליו עם caching
     * @throws {Error} אם הבקשה נכשלה
     */
    async getPortfolioMetrics(userId, filters = {}) {
        const params = new URLSearchParams();

        if (filters.account_id) params.append('account_id', filters.account_id);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);
        if (filters.include_positions) params.append('include_positions', 'true');

        const cacheKey = `${this.cachePrefix}portfolio_${userId}_${filters.account_id || 'all'}_${filters.date_from || ''}_${filters.date_to || ''}`;

        return await CacheTTLGuard.get(cacheKey, async () => {
            const response = await fetch(`${this.baseUrl}/portfolio?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch portfolio metrics: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }, { ttl: 3600000 }); // 1 hour TTL
    }

    /**
     * מקבל נתוני פוזיציות יומיות עבור משתמש
     *
     * @async
     * @param {number} userId - מזהה המשתמש
     * @param {Object} [filters={}] - מסננים
     * @param {number} [filters.account_id] - מזהה חשבון מסחר (אופציונלי)
     * @param {number} [filters.ticker_id] - מזהה טיקר (אופציונלי)
     * @param {string} [filters.date_from] - תאריך התחלה (YYYY-MM-DD)
     * @param {string} [filters.date_to] - תאריך סיום (YYYY-MM-DD)
     * @returns {Promise<Object>} נתוני הפוזיציות עם caching
     * @throws {Error} אם הבקשה נכשלה
     */
    async getPositions(userId, filters = {}) {
        const params = new URLSearchParams();

        if (filters.account_id) params.append('account_id', filters.account_id);
        if (filters.ticker_id) params.append('ticker_id', filters.ticker_id);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);

        const cacheKey = `${this.cachePrefix}positions_${userId}_${filters.account_id || 'all'}_${filters.ticker_id || 'all'}_${filters.date_from || ''}_${filters.date_to || ''}`;

        return await CacheTTLGuard.get(cacheKey, async () => {
            const response = await fetch(`${this.baseUrl}/positions?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch positions: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }, { ttl: 3600000 });
    }

    /**
     * מקבל נתוני תזרימי מזומנים יומיים עבור משתמש
     *
     * @async
     * @param {number} userId - מזהה המשתמש
     * @param {Object} [filters={}] - מסננים
     * @param {number} [filters.account_id] - מזהה חשבון מסחר (אופציונלי)
     * @param {string} [filters.date_from] - תאריך התחלה (YYYY-MM-DD)
     * @param {string} [filters.date_to] - תאריך סיום (YYYY-MM-DD)
     * @returns {Promise<Object>} נתוני תזרימי המזומנים עם caching
     * @throws {Error} אם הבקשה נכשלה
     */
    async getCashFlows(userId, filters = {}) {
        const params = new URLSearchParams();

        if (filters.account_id) params.append('account_id', filters.account_id);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);

        const cacheKey = `${this.cachePrefix}cash_flows_${userId}_${filters.account_id || 'all'}_${filters.date_from || ''}_${filters.date_to || ''}`;

        return await CacheTTLGuard.get(cacheKey, async () => {
            const response = await fetch(`${this.baseUrl}/cash-flows?${params}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch cash flows: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }, { ttl: 3600000 });
    }

    /**
     * מתחיל תהליך חישוב מחדש של מדדי EOD לטווח תאריכים
     *
     * @async
     * @param {number} userId - מזהה המשתמש
     * @param {Object} dateRange - טווח התאריכים לחישוב מחדש
     * @param {string} dateRange.date_from - תאריך התחלה (YYYY-MM-DD)
     * @param {string} dateRange.date_to - תאריך סיום (YYYY-MM-DD)
     * @param {number[]} [dateRange.account_ids] - מזהי חשבונות (אופציונלי)
     * @returns {Promise<Object>} פרטי המשימה שנוצרה
     * @throws {Error} אם הבקשה נכשלה
     */
    async recomputeDateRange(userId, dateRange) {
        const response = await fetch(`${this.baseUrl}/recompute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                date_from: dateRange.date_from,
                date_to: dateRange.date_to,
                account_ids: dateRange.account_ids
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to start recompute: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }

    /**
     * מקבל סטטוס של משימת חישוב מחדש
     *
     * @async
     * @param {string} jobId - מזהה המשימה
     * @returns {Promise<Object>} סטטוס המשימה
     * @throws {Error} אם הבקשה נכשלה
     */
    async getRecomputeStatus(jobId) {
        const response = await fetch(`${this.baseUrl}/recompute/${jobId}`);
        if (!response.ok) {
            throw new Error(`Failed to get recompute status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }

    /**
     * מקבל היסטוריית משימות חישוב מחדש
     *
     * @async
     * @param {number} userId - מזהה המשתמש
     * @param {number} [limit=10] - מספר המשימות להחזרה
     * @returns {Promise<Object[]>} רשימת משימות חישוב מחדש
     * @throws {Error} אם הבקשה נכשלה
     */
    async getRecomputeHistory(userId, limit = 10) {
        const response = await fetch(`${this.baseUrl}/recompute/history?limit=${limit}`);
        if (!response.ok) {
            throw new Error(`Failed to get recompute history: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }

    // Utility methods

    /**
     * מבטל תקפות של ערכי cache
     *
     * @param {string} [pattern=null] - תבנית לחיפוש (אופציונלי)
     */
    invalidateCache(pattern = null) {
        // Invalidate cache entries matching pattern
        if (window.CacheSyncManager) {
            if (pattern) {
                CacheSyncManager.invalidatePattern(pattern);
            } else {
                CacheSyncManager.invalidatePattern(`${this.cachePrefix}*`);
            }
        }
    }

    /**
     * מנקה את כל ה-cache של משתמש מסוים
     *
     * @param {number} userId - מזהה המשתמש
     */
    clearUserCache(userId) {
        // Clear all EOD cache for specific user
        this.invalidateCache(`${this.cachePrefix}*_${userId}_*`);
    }
}

// Global instance
window.EODMetricsDataService = new EODMetricsDataService();

/**
 * FUNCTION INDEX - EOD Metrics Data Service
 * ========================================
 *
 * Core Methods:
 * -------------
 * constructor() - יוצר מופע חדש של השירות
 *
 * Data Retrieval Methods:
 * ----------------------
 * getPortfolioMetrics(userId, filters) - מקבל מדדי פורטפוליו יומיים
 * getPositions(userId, filters) - מקבל נתוני פוזיציות יומיות
 * getCashFlows(userId, filters) - מקבל נתוני תזרימי מזומנים יומיים
 *
 * Recompute Methods:
 * -----------------
 * recomputeDateRange(userId, dateRange) - מתחיל חישוב מחדש לטווח תאריכים
 * getRecomputeStatus(jobId) - מקבל סטטוס משימת חישוב מחדש
 * getRecomputeHistory(userId, limit) - מקבל היסטוריית משימות
 *
 * Cache Management:
 * ----------------
 * invalidateCache(pattern) - מבטל תקפות ערכי cache
 * clearUserCache(userId) - מנקה cache למשתמש מסוים
 *
 * Integration Points:
 * ------------------
 * - CacheTTLGuard - caching עם TTL
 * - UnifiedCacheManager - ניהול cache מאוחד
 * - CacheSyncManager - סנכרון cache
 *
 * Error Handling:
 * --------------
 * כל השגיאות מועברות למעלה עם הודעות ברורות
 * שילוב עם Notification System לעדכונים למשתמש
 *
 * Performance:
 * -----------
 * - TTL של שעה לכל נתונים
 * - Cache keys מתקדמים למניעת חישובים מיותרים
 * - Lazy loading עם background refresh
 */
