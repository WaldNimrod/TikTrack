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
// - loadEODDataWithFallback() - טעינת נתונים עם fallback
// - handleEODError() - טיפול בשגיאות EOD
// - showEODLoadingState() - הצגת מצב טעינה
// - hideEODLoadingState() - הסתרת מצב טעינה
//
// === Specific Data Loaders ===
// - loadEODPortfolioMetrics() - טעינת מדדי פורטפוליו
// - loadEODPositions() - טעינת פוזיציות
// - loadEODCashFlows() - טעינת תזרימי מזומנים
//
// === Validation & Quality ===
// - validateEODData() - ולידציה של נתוני EOD
// - handleEODValidationErrors() - טיפול בשגיאות ולידציה
// - suggestEODRecompute() - הצעה לחישוב מחדש
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
     * טוען מדדי פורטפוליו מ-EOD עם fallback
     *
     * @async
     * @param {number} userId - מזהה המשתמש
     * @param {Object} filters - מסננים
     * @param {Function} fallbackFn - פונקציית fallback (אופציונלי)
     * @returns {Promise<Object>} נתוני מדדי פורטפוליו
     */
    async function loadEODPortfolioMetrics(userId, filters = {}, fallbackFn = null) {
        return loadEODDataWithFallback(
            'portfolio',
            userId,
            filters,
            () => window.EODMetricsDataService.getPortfolioMetrics(userId, filters),
            fallbackFn
        );
    }

    /**
     * טוען פוזיציות מ-EOD עם fallback
     *
     * @async
     * @param {number} userId - מזהה המשתמש
     * @param {Object} filters - מסננים
     * @param {Function} fallbackFn - פונקציית fallback (אופציונלי)
     * @returns {Promise<Object>} נתוני פוזיציות
     */
    async function loadEODPositions(userId, filters = {}, fallbackFn = null) {
        return loadEODDataWithFallback(
            'positions',
            userId,
            filters,
            () => window.EODMetricsDataService.getPositions(userId, filters),
            fallbackFn
        );
    }

    /**
     * טוען תזרימי מזומנים מ-EOD עם fallback
     *
     * @async
     * @param {number} userId - מזהה המשתמש
     * @param {Object} filters - מסננים
     * @param {Function} fallbackFn - פונקציית fallback (אופציונלי)
     * @returns {Promise<Object>} נתוני תזרימי מזומנים
     */
    async function loadEODCashFlows(userId, filters = {}, fallbackFn = null) {
        return loadEODDataWithFallback(
            'cash-flows',
            userId,
            filters,
            () => window.EODMetricsDataService.getCashFlows(userId, filters),
            fallbackFn
        );
    }

    /**
     * טוען נתונים מ-EOD עם fallback mechanism
     *
     * @async
     * @param {string} type - סוג הנתונים
     * @param {number} userId - מזהה המשתמש
     * @param {Object} filters - מסננים
     * @param {Function} eodFn - פונקציית EOD
     * @param {Function} fallbackFn - פונקציית fallback
     * @returns {Promise<Object>} נתונים עם סטטוס
     */
    async function loadEODDataWithFallback(type, userId, filters, eodFn, fallbackFn = null) {
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

        // All attempts failed, try fallback if available
        if (fallbackFn && CONFIG.fallbackEnabled) {
            try {
                if (window.Logger) {
                    window.Logger.info('All EOD attempts failed, using fallback', { type, userId });
                }

                const fallbackData = await fallbackFn();
                return {
                    data: fallbackData,
                    source: 'fallback',
                    isEOD: false
                };
            } catch (fallbackError) {
                if (window.Logger) {
                    window.Logger.error('Fallback also failed', { type, userId, fallbackError: fallbackError.message });
                }
            }
        }

        // Everything failed
        handleEODError(lastError, `load ${type}`);
        throw lastError;
    }

    /**
     * אינטגרציה מלאה עם EOD APIs
     *
     * @async
     * @param {string} containerId - מזהה הקונטיינר
     * @param {string} type - סוג הנתונים
     * @param {number} userId - מזהה המשתמש
     * @param {Object} filters - מסננים
     * @param {Function} successCallback - callback להצלחה
     * @param {Function} fallbackFn - פונקציית fallback
     * @returns {Promise<Object>} תוצאת האינטגרציה
     */
    async function integrateEODMetrics(containerId, type, userId, filters = {}, successCallback, fallbackFn = null) {
        try {
            showEODLoadingState(containerId);

            let result;
            switch (type) {
                case 'portfolio':
                    result = await loadEODPortfolioMetrics(userId, filters, fallbackFn);
                    break;
                case 'positions':
                    result = await loadEODPositions(userId, filters, fallbackFn);
                    break;
                case 'cash-flows':
                    result = await loadEODCashFlows(userId, filters, fallbackFn);
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
            handleEODError(error, `integrate ${type}`);

            throw error;
        }
    }

    // Export functions
    window.EODIntegrationHelper = {
        // Core functions
        integrateEODMetrics,
        loadEODDataWithFallback,
        handleEODError,
        showEODLoadingState,
        hideEODLoadingState,

        // Specific loaders
        loadEODPortfolioMetrics,
        loadEODPositions,
        loadEODCashFlows,

        // Validation
        validateEODData,
        handleEODValidationErrors,
        suggestEODRecompute,

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
