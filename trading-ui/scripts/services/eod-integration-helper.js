/**
 * EOD Integration Helper - תבנית אחידה לשימוש ב-EOD Historical Metrics
 *
 * מספק wrapper functions אחידים לשימוש ב-EOD APIs בכל הממשקים.
 * כולל error handling, fallback mechanism, loading states, ו-cache management.
 *
 * @author EOD Historical Metrics System
 * @version 1.0.0
 * @since 2025-01-01
 */

// ===== FUNCTION INDEX =====
// === Core Integration Functions ===
// - integrateEODMetrics() - אינטגרציה מלאה עם EOD APIs
// - loadEODDataStrict() - טעינת נתונים ללא fallback
// - handleEODError() - טיפול בשגיאות EOD
// - showEODLoadingState() - הצגת מצב טעינה
// - hideEODLoadingState() - הסתרת מצב טעינה
//
// === Portfolio & Trading Data Loaders ===
// - loadEODPortfolioMetrics() - טעינת מדדי פורטפוליו
// - loadEODPositions() - טעינת פוזיציות
// - loadEODCashFlows() - טעינת תזרימי מזומנים
//
// === System & Monitoring Functions ===
// - loadEODJobStatus() - טעינת סטטוס משימות EOD
// - loadEODJobHistory() - טעינת היסטוריית משימות EOD
// - loadEODPerformanceStats() - טעינת סטטיסטיקות ביצועים
//
// === Data Access Functions ===
// - loadEODTable() - טעינת טבלאות EOD ישירות
// - loadEODAlerts() - טעינת התראות מבוססות EOD
// - loadEODComparisonData() - טעינת נתונים להשוואות היסטוריות
//
// === Validation & Quality ===
// - validateEODData() - ולידציה של נתוני EOD
// - handleEODValidationErrors() - טיפול בשגיאות ולידציה
// - suggestEODRecompute() - הצעה לחישוב מחדש
// - performEODRecompute() - ביצוע חישוב מחדש
//
// === Utilities ===
// - formatEODError() - עיצוב הודעות שגיאה
// - getEODCacheKey() - יצירת cache key
// - isEODAvailable() - בדיקת זמינות EOD
//
// ==========================================

(function eodIntegrationHelper() {
    'use strict';

    // Configuration
    const CONFIG = {
        loadingTimeout: 10000, // 10 seconds
        retryAttempts: 2,
        cacheTTL: 300000, // 5 minutes
        fallbackEnabled: true
    };

    /**
     * בודק אם מערכת EOD זמינה
     *
     * @returns {boolean} true אם EOD זמין
     */
    function isEODAvailable() {
        return !!(window.EODMetricsDataService &&
                 typeof window.EODMetricsDataService.getPortfolioMetrics === 'function');
    }

    /**
     * יוצר cache key עבור EOD data
     *
     * @param {string} type - סוג הנתונים (portfolio, positions, cash-flows)
     * @param {number} userId - מזהה המשתמש
     * @param {Object} filters - מסננים
     * @returns {string} cache key
     */
    function getEODCacheKey(type, userId, filters = {}) {
        const filterStr = Object.keys(filters)
            .sort()
            .map(key => `${key}:${filters[key]}`)
            .join('|');
        return `eod_${type}_${userId}_${filterStr}`;
    }

    /**
     * מציג מצב טעינה ל-EOD data
     *
     * @param {string} containerId - מזהה הקונטיינר
     * @param {string} message - הודעת טעינה (אופציונלי)
     */
    function showEODLoadingState(containerId, message = 'טוען נתונים היסטוריים...') {
        const container = document.getElementById(containerId);
        if (!container) {
            if (window.Logger) {
                window.Logger.warn('Container not found for EOD loading state', { containerId });
            }
            return;
        }

        const loadingHtml = `
            <div class="eod-loading-state text-center p-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">טוען...</span>
                </div>
                <div class="mt-2 text-muted small">${message}</div>
            </div>
        `;

        container.innerHTML = loadingHtml;

        if (window.Logger) {
            window.Logger.info('EOD loading state shown', { containerId, message });
        }
    }

    /**
     * מסתיר מצב טעינה
     *
     * @param {string} containerId - מזהה הקונטיינר
     */
    function hideEODLoadingState(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const loadingState = container.querySelector('.eod-loading-state');
        if (loadingState) {
            loadingState.remove();
        }
    }

    /**
     * מעצב הודעת שגיאה ל-EOD
     *
     * @param {Error|string} error - השגיאה
     * @param {string} context - הקשר (אופציונלי)
     * @returns {string} הודעת שגיאה מעוצבת
     */
    function formatEODError(error, context = '') {
        const errorMsg = error.message || error || 'שגיאה לא ידועה';
        const contextStr = context ? ` (${context})` : '';

        return `שגיאה בטעינת נתונים היסטוריים${contextStr}: ${errorMsg}`;
    }

    /**
     * מטפל בשגיאות EOD בצורה אחידה
     *
     * @param {Error|string} error - השגיאה
     * @param {string} context - הקשר
     * @param {boolean} showNotification - האם להציג התראה
     */
    function handleEODError(error, context = '', showNotification = true) {
        const formattedError = formatEODError(error, context);

        if (window.Logger) {
            window.Logger.error('EOD Error', {
                error: formattedError,
                context,
                originalError: error
            });
        }

        if (showNotification && window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה בנתונים היסטוריים', formattedError);
        }
    }

    /**
     * ולידציה של נתוני EOD
     *
     * @param {Object} data - נתוני EOD
     * @param {string} type - סוג הנתונים
     * @returns {Object} תוצאת ולידציה
     */
    function validateEODData(data, type = 'unknown') {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (!data) {
            result.isValid = false;
            result.errors.push('נתונים ריקים');
            return result;
        }

        // Check for validation errors in data
        if (data.validation_errors && Array.isArray(data.validation_errors) && data.validation_errors.length > 0) {
            result.warnings.push(...data.validation_errors);
        }

        // Type-specific validations
        switch (type) {
            case 'portfolio':
                if (data.nav_total === null || data.nav_total === undefined) {
                    result.errors.push('NAV חסר');
                }
                break;
            case 'positions':
                if (!Array.isArray(data.data)) {
                    result.errors.push('פוזיציות לא בפורמט נכון');
                }
                break;
            case 'cash-flows':
                if (!Array.isArray(data.data)) {
                    result.errors.push('תזרימי מזומנים לא בפורמט נכון');
                }
                break;
        }

        result.isValid = result.errors.length === 0;

        return result;
    }

    /**
     * מטפל בשגיאות ולידציה של EOD
     *
     * @param {Object} validationResult - תוצאת ולידציה
     * @param {string} type - סוג הנתונים
     * @param {Object} filters - מסננים (ל-recompute)
     */
    function handleEODValidationErrors(validationResult, type = 'unknown', filters = {}) {
        if (!validationResult || validationResult.isValid) return;

        // Show warnings
        if (validationResult.warnings && validationResult.warnings.length > 0) {
            const warningMsg = `אזהרות נתונים: ${validationResult.warnings.join(', ')}`;
            if (window.NotificationSystem) {
                window.NotificationSystem.showWarning('אזהרת נתונים היסטוריים', warningMsg);
            }
        }

        // Show errors and suggest recompute
        if (validationResult.errors && validationResult.errors.length > 0) {
            const errorMsg = `שגיאות נתונים: ${validationResult.errors.join(', ')}`;
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאת נתונים היסטוריים', errorMsg);
            }

            // Suggest recompute for critical errors
            suggestEODRecompute(type, filters);
        }
    }

    /**
     * מציע חישוב מחדש של EOD data
     *
     * @param {string} type - סוג הנתונים
     * @param {Object} filters - מסננים
     */
    function suggestEODRecompute(type, filters = {}) {
        const recomputeMsg = `הנתונים עשויים להיות לא עדכניים. האם ברצונך לחשב מחדש?`;

        if (window.NotificationSystem && typeof window.NotificationSystem.showConfirm === 'function') {
            window.NotificationSystem.showConfirm(
                'חישוב מחדש נתונים היסטוריים',
                recomputeMsg,
                () => performEODRecompute(type, filters),
                () => {
                    if (window.Logger) {
                        window.Logger.info('User declined EOD recompute', { type, filters });
                    }
                }
            );
        }
    }

    /**
     * מבצע חישוב מחדש של EOD data
     *
     * @param {string} type - סוג הנתונים
     * @param {Object} filters - מסננים
     */
    async function performEODRecompute(type, filters = {}) {
        try {
            if (window.Logger) {
                window.Logger.info('Starting EOD recompute', { type, filters });
            }

            // Call recompute API
            const response = await fetch('/api/eod/recompute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date_from: filters.date_from || '2025-01-01',
                    date_to: filters.date_to || new Date().toISOString().split('T')[0],
                    account_ids: filters.account_ids || []
                })
            });

            if (!response.ok) {
                throw new Error(`Recompute failed: ${response.status}`);
            }

            const result = await response.json();

            if (window.NotificationSystem) {
                window.NotificationSystem.showSuccess(
                    'חישוב מחדש התחיל',
                    'הנתונים ההיסטוריים יתעדכנו בעוד מספר דקות'
                );
            }

        } catch (error) {
            handleEODError(error, `recompute ${type}`);
        }
    }

    /**
     * טוען סטטוס משימות EOD (לניטור שרת ומערכת)
     *
     * @param {Object} filters - מסננים
     * @returns {Promise<Object>} סטטוס משימות EOD
     */
    async function loadEODJobStatus(filters = {}) {
        return loadEODDataStrict(
            'job-status',
            null, // global status
            filters,
            () => window.EODMetricsDataService.getJobStatus(filters)
        );
    }

    /**
     * טוען היסטוריית משימות EOD (לניהול מערכת)
     *
     * @param {Object} filters - מסננים (date range, job types)
     * @returns {Promise<Object>} היסטוריית משימות
     */
    async function loadEODJobHistory(filters = {}) {
        return loadEODDataStrict(
            'job-history',
            null, // global history
            filters,
            () => window.EODMetricsDataService.getJobHistory(filters)
        );
    }

    /**
     * טוען טבלאות EOD ישירות (ל-DB Display)
     *
     * @param {string} tableName - שם הטבלה
     * @param {Object} filters - מסננים
     * @returns {Promise<Object>} נתוני טבלה
     */
    async function loadEODTable(tableName, filters = {}) {
        return loadEODDataStrict(
            `table-${tableName}`,
            null, // direct table access
            filters,
            () => window.EODMetricsDataService.getTableData(tableName, filters)
        );
    }

    /**
     * טוען התראות מבוססות EOD (ל-Alerts Page)
     *
     * @param {Object} filters - מסננים
     * @returns {Promise<Object>} התראות EOD
     */
    async function loadEODAlerts(filters = {}) {
        return loadEODDataStrict(
            'alerts',
            null, // global alerts
            filters,
            () => window.EODMetricsDataService.getValidationAlerts(filters)
        );
    }

    /**
     * טוען סטטיסטיקות ביצועים של EOD (לניטור)
     *
     * @param {Object} filters - מסננים
     * @returns {Promise<Object>} סטטיסטיקות ביצועים
     */
    async function loadEODPerformanceStats(filters = {}) {
        return loadEODDataStrict(
            'performance',
            null, // global stats
            filters,
            () => window.EODMetricsDataService.getPerformanceStats(filters)
        );
    }

    /**
     * טוען נתונים להשוואות היסטוריות (ל-Research Page)
     *
     * @param {Object} filters - מסננים (date ranges, metrics)
     * @returns {Promise<Object>} נתונים להשוואה
     */
    async function loadEODComparisonData(filters = {}) {
        return loadEODDataStrict(
            'comparison',
            null, // global comparison data
            filters,
            () => window.EODMetricsDataService.getComparisonData(filters)
        );
    }

    /**
     * טוען מדדי פורטפוליו מ-EOD - ללא fallback!
     *
     * @async
     * @param {number} userId - מזהה המשתמש
     * @param {Object} filters - מסננים
     * @returns {Promise<Object>} נתוני מדדי פורטפוליו או שגיאה מפורטת
     */
    async function loadEODPortfolioMetrics(userId, filters = {}) {
        return loadEODDataStrict(
            'portfolio',
            userId,
            filters,
            () => window.EODMetricsDataService.getPortfolioMetrics(userId, filters)
        );
    }

    /**
     * טוען פוזיציות מ-EOD - ללא fallback!
     *
     * @async
     * @param {number} userId - מזהה המשתמש
     * @param {Object} filters - מסננים
     * @returns {Promise<Object>} נתוני פוזיציות או שגיאה מפורטת
     */
    async function loadEODPositions(userId, filters = {}) {
        return loadEODDataStrict(
            'positions',
            userId,
            filters,
            () => window.EODMetricsDataService.getPositions(userId, filters)
        );
    }

    /**
     * טוען תזרימי מזומנים מ-EOD - ללא fallback!
     *
     * @async
     * @param {number} userId - מזהה המשתמש
     * @param {Object} filters - מסננים
     * @returns {Promise<Object>} נתוני תזרימי מזומנים או שגיאה מפורטת
     */
    async function loadEODCashFlows(userId, filters = {}) {
        return loadEODDataStrict(
            'cash-flows',
            userId,
            filters,
            () => window.EODMetricsDataService.getCashFlows(userId, filters)
        );
    }

    /**
     * טוען נתונים מ-EOD - ללא fallback כלל!
     * אם אין נתונים אמיתיים - מציג הודעת שגיאה מפורטת
     *
     * @async
     * @param {string} type - סוג הנתונים
     * @param {number} userId - מזהה המשתמש
     * @param {Object} filters - מסננים
     * @param {Function} eodFn - פונקציית EOD
     * @returns {Promise<Object>} נתונים או שגיאה מפורטת
     */
    async function loadEODDataStrict(type, userId, filters, eodFn) {
        const cacheKey = getEODCacheKey(type, userId, filters);

        // Try to load from cache first
        if (window.UnifiedCacheManager) {
            try {
                const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: CONFIG.cacheTTL });
                if (cached) {
                    if (window.Logger) {
                        window.Logger.info('EOD data loaded from cache', { type, userId, cacheKey });
                    }
                    return {
                        data: cached,
                        source: 'cache',
                        isEOD: true
                    };
                }
            } catch (cacheError) {
                if (window.Logger) {
                    window.Logger.warn('Cache read error', { error: cacheError.message, cacheKey });
                }
            }
        }

        // Check if EOD is available
        if (!isEODAvailable()) {
            if (window.Logger) {
                window.Logger.warn('EOD not available, using fallback', { type, userId });
            }

            if (fallbackFn) {
                try {
                    const fallbackData = await fallbackFn();
                    return {
                        data: fallbackData,
                        source: 'fallback',
                        isEOD: false
                    };
                } catch (fallbackError) {
                    handleEODError(fallbackError, `fallback ${type}`);
                    throw fallbackError;
                }
            }

            throw new Error('EOD system not available and no fallback provided');
        }

        // Load from EOD with timeout and retry
        let lastError;
        for (let attempt = 1; attempt <= CONFIG.retryAttempts + 1; attempt++) {
            try {
                if (window.Logger) {
                    window.Logger.info('Loading EOD data', { type, userId, attempt, filters });
                }

                const data = await Promise.race([
                    eodFn(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('EOD request timeout')), CONFIG.loadingTimeout)
                    )
                ]);

                // Validate data
                const validation = validateEODData(data, type);
                if (!validation.isValid) {
                    handleEODValidationErrors(validation, type, filters);
                }

                // Cache the result
                if (window.UnifiedCacheManager && validation.isValid) {
                    try {
                        await window.UnifiedCacheManager.save(cacheKey, data, { ttl: CONFIG.cacheTTL });
                    } catch (cacheError) {
                        if (window.Logger) {
                            window.Logger.warn('Cache save error', { error: cacheError.message, cacheKey });
                        }
                    }
                }

                return {
                    data,
                    source: 'eod',
                    isEOD: true,
                    validation
                };

            } catch (error) {
                lastError = error;
                if (window.Logger) {
                    window.Logger.warn('EOD load attempt failed', { type, userId, attempt, error: error.message });
                }

                // If this is not the last attempt, wait before retry
                if (attempt <= CONFIG.retryAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        // No fallback allowed! If EOD data is not available, show detailed error message
        const errorDetails = {
            dataType: type,
            userId,
            filters,
            lastError: lastError.message,
            attempts: CONFIG.retryAttempts + 1
        };

        const detailedErrorMsg = `נתוני ${type} היסטוריים לא זמינים. ` +
            `לא ניתן לטעון נתונים אמיתיים מהשרת. ` +
            `אנא פנה למנהל המערכת או נסה שוב מאוחר יותר. ` +
            `(פרטים: ${JSON.stringify(errorDetails)})`;

        if (window.Logger) {
            window.Logger.error('EOD data completely unavailable - no fallback used', errorDetails);
        }

        // Show detailed error message to user - NO FALLBACK DATA!
        if (window.NotificationSystem) {
            window.NotificationSystem.showError(
                'נתונים היסטוריים לא זמינים',
                detailedErrorMsg
            );
        }

        throw new Error(detailedErrorMsg);
    }

    /**
     * אינטגרציה מלאה עם EOD APIs - ללא fallback!
     *
     * @async
     * @param {string} containerId - מזהה הקונטיינר
     * @param {string} type - סוג הנתונים
     * @param {number} userId - מזהה המשתמש
     * @param {Object} filters - מסננים
     * @param {Function} successCallback - callback להצלחה
     * @returns {Promise<Object>} תוצאת האינטגרציה או שגיאה מפורטת
     */
    async function integrateEODMetrics(containerId, type, userId, filters = {}, successCallback) {
        try {
            showEODLoadingState(containerId);

            let result;
            switch (type) {
                case 'portfolio':
                    result = await loadEODPortfolioMetrics(userId, filters);
                    break;
                case 'positions':
                    result = await loadEODPositions(userId, filters);
                    break;
                case 'cash-flows':
                    result = await loadEODCashFlows(userId, filters);
                    break;
                default:
                    throw new Error(`Unknown EOD type: ${type}`);
            }

            hideEODLoadingState(containerId);

            if (successCallback) {
                await successCallback(result);
            }

            return result;

        } catch (error) {
            hideEODLoadingState(containerId);
            // Don't call handleEODError here - loadEODDataStrict already handles error display
            throw error;
        }
    }

    // Export functions
    window.EODIntegrationHelper = {
        // Core functions - NO FALLBACK!
        integrateEODMetrics,
        loadEODDataStrict,
        handleEODError,
        showEODLoadingState,
        hideEODLoadingState,

        // Specific loaders - Portfolio & Trading
        loadEODPortfolioMetrics,
        loadEODPositions,
        loadEODCashFlows,

        // System & Monitoring functions
        loadEODJobStatus,
        loadEODJobHistory,
        loadEODPerformanceStats,

        // Data Access functions
        loadEODTable,
        loadEODAlerts,
        loadEODComparisonData,

        // Validation & Recompute
        validateEODData,
        handleEODValidationErrors,
        suggestEODRecompute,
        performEODRecompute,

        // Utilities
        formatEODError,
        getEODCacheKey,
        isEODAvailable,

        // Configuration
        CONFIG
    };

    if (window.Logger) {
        window.Logger.info('EOD Integration Helper loaded successfully');
    }

})();
