/**
 * EOD Validation & Notification Service - שירות ולידציה והודעות EOD
 *
 * שירות זה אחראי על ולידציה של נתוני מדדי EOD, הצגת הודעות שגיאה למשתמש,
 * וניהול תהליכי חישוב מחדש אוטומטיים. השירות משלב עם NotificationSystem
 * להצגת הודעות מתקדמות ועם EODMetricsDataService לרענון נתונים.
 *
 * @author EOD Historical Metrics System
 * @version 1.0.0
 * @since 2025-01-01
 */

class EODValidationService {
    /**
     * יוצר מופע חדש של שירות הולידציה והודעות
     *
     * @constructor
     */
    constructor() {
        this.recomputeJobs = new Map(); // Track active recompute jobs
    }

    /**
     * מבצע ולידציה מקיפה של מדדי פורטפוליו
     *
     * בודק עקביות NAV, ערכים שליליים, חשיפות, איכות נתונים ושגיאות ולידציה שמורות
     *
     * @param {Object} metrics - מדדי הפורטפוליו לבדיקה
     * @param {number} metrics.nav_total - שווי נקי של הפורטפוליו
     * @param {number} metrics.market_value_total - שווי שוק כולל
     * @param {number} metrics.cash_total - סכום המזומנים
     * @param {number} [metrics.exposure_long=0] - חשיפה ארוכה
     * @param {number} [metrics.exposure_short=0] - חשיפה קצרה
     * @param {string} [metrics.data_quality_status] - סטטוס איכות נתונים
     * @param {Array} [metrics.validation_errors] - שגיאות ולידציה שמורות
     * @returns {Array<Object>} רשימת שגיאות הולידציה שנמצאו
     */
    validatePortfolioMetrics(metrics) {
        const errors = [];

        if (!metrics || typeof metrics !== 'object') {
            errors.push({
                type: 'INVALID_DATA',
                message: 'Invalid metrics data structure',
                severity: 'high'
            });
            return errors;
        }

        // בדיקת עקביות NAV
        const navCalculated = (metrics.market_value_total || 0) + (metrics.cash_total || 0);
        const navStored = metrics.nav_total || 0;

        if (Math.abs(navStored - navCalculated) > 0.01) {
            errors.push({
                type: 'NAV_INCONSISTENCY',
                message: `NAV inconsistency: stored ${this.formatCurrency(navStored)}, calculated ${this.formatCurrency(navCalculated)}`,
                severity: 'high',
                details: {
                    stored: navStored,
                    calculated: navCalculated,
                    difference: navStored - navCalculated
                }
            });
        }

        // בדיקת ערכים שליליים לא הגיוניים
        if ((metrics.nav_total || 0) < -1000) { // Allow small negative for rounding
            errors.push({
                type: 'NEGATIVE_NAV',
                message: `Negative NAV detected: ${this.formatCurrency(metrics.nav_total)}`,
                severity: 'high',
                details: { nav_total: metrics.nav_total }
            });
        }

        // בדיקת עקביות חשיפות
        const exposureTotal = (metrics.exposure_long || 0) + (metrics.exposure_short || 0);
        const marketValue = metrics.market_value_total || 0;

        if (Math.abs(exposureTotal - marketValue) > 1.0) { // $1 tolerance
            errors.push({
                type: 'EXPOSURE_INCONSISTENCY',
                message: `Exposure inconsistency: total exposure ${this.formatCurrency(exposureTotal)}, market value ${this.formatCurrency(marketValue)}`,
                severity: 'medium',
                details: {
                    exposure_total: exposureTotal,
                    market_value: marketValue,
                    difference: exposureTotal - marketValue
                }
            });
        }

        // בדיקת סטטוס איכות נתונים
        if (metrics.data_quality_status === 'needs_recompute') {
            errors.push({
                type: 'DATA_NEEDS_RECOMPUTE',
                message: 'Data quality indicates recompute needed',
                severity: 'medium'
            });
        }

        // בדיקת שגיאות ולידציה שמורות
        if (metrics.validation_errors && Array.isArray(metrics.validation_errors)) {
            metrics.validation_errors.forEach(validationError => {
                errors.push({
                    type: validationError.type || 'VALIDATION_ERROR',
                    message: validationError.message || 'Validation error detected',
                    severity: validationError.severity || 'medium',
                    details: validationError
                });
            });
        }

        return errors;
    }

    /**
     * מטפל בשגיאות ולידציה ומציג הודעות למשתמש
     *
     * מקבץ שגיאות לפי רמת חומרה ומראה הודעות מתאימות
     *
     * @async
     * @param {Object} metrics - מדדי הפורטפוליו
     * @param {Array<Object>} errors - רשימת שגיאות הולידציה
     */
    async handleValidationErrors(metrics, errors) {
        if (!errors || errors.length === 0) return;

        // קיבוץ שגיאות לפי severity
        const highSeverity = errors.filter(e => e.severity === 'high');
        const mediumSeverity = errors.filter(e => e.severity === 'medium');
        const lowSeverity = errors.filter(e => e.severity === 'low');

        // טיפול בשגיאות חמורות
        for (const error of highSeverity) {
            await this.showHighSeverityError(error, metrics);
        }

        // טיפול בשגיאות בינוניות
        for (const error of mediumSeverity) {
            await this.showMediumSeverityError(error, metrics);
        }

        // טיפול בשגיאות קלות (logging only)
        if (lowSeverity.length > 0) {
            console.warn('Low severity EOD validation errors:', lowSeverity);
        }
    }

    async showHighSeverityError(error, metrics) {
        const confirmed = await NotificationSystem.showConfirm(
            'שגיאת אימות נתונים חמורה',
            `${error.message}\n\nהאם ברצונך לרענן את הנתונים?`,
            {
                confirmText: 'רענן עכשיו',
                cancelText: 'ביטול',
                type: 'error'
            }
        );

        if (confirmed) {
            await this.triggerRecompute(metrics.user_id, metrics.date_utc);
        }
    }

    async showMediumSeverityError(error, metrics) {
        await NotificationSystem.showWarning(
            'אזהרת אימות נתונים',
            error.message,
            {
                details: error.details,
                autoHide: false
            }
        );

        // הצעה לרענון אוטומטי
        setTimeout(async () => {
            const confirmed = await NotificationSystem.showConfirm(
                'הצעה לרענון נתונים',
                'האם ברצונך לרענן את הנתונים כדי לתקן את הבעיה?',
                {
                    confirmText: 'רענן',
                    cancelText: 'לא עכשיו'
                }
            );

            if (confirmed) {
                await this.triggerRecompute(metrics.user_id, metrics.date_utc);
            }
        }, 3000); // Show after 3 seconds
    }

    async suggestRecompute(metrics) {
        const confirmed = await NotificationSystem.showConfirm(
            'רענון נתונים מומלץ',
            'הנתונים עבור התאריך הנבחר אינם מעודכנים. האם ברצונך לרענן?',
            {
                confirmText: 'רענן עכשיו',
                cancelText: 'ביטול'
            }
        );

        if (confirmed) {
            await this.triggerRecompute(metrics.user_id, metrics.date_utc);
        }
    }

    /**
     * מפעיל תהליך חישוב מחדש של מדדי EOD
     *
     * @async
     * @param {number} userId - מזהה המשתמש
     * @param {string} date - התאריך לחישוב מחדש (YYYY-MM-DD)
     */
    async triggerRecompute(userId, date) {
        try {
            NotificationSystem.showInfo('מתחיל רענון נתונים...', '', { autoHide: false });

            const job = await EODMetricsDataService.recomputeDateRange(userId, {
                date_from: date,
                date_to: date
            });

            NotificationSystem.showSuccess(
                'רענון נתונים התחיל',
                `מעקב אחרי job: ${job.job_id}`,
                { autoHide: false }
            );

            // התחלת מעקב אחרי סטטוס
            this.monitorRecomputeJob(job.job_id);

        } catch (error) {
            NotificationSystem.showError('שגיאה ברענון נתונים', error.message);
        }
    }

    async monitorRecomputeJob(jobId) {
        // Prevent multiple monitors for same job
        if (this.recomputeJobs.has(jobId)) {
            return;
        }

        this.recomputeJobs.set(jobId, true);

        const checkStatus = async () => {
            try {
                const status = await EODMetricsDataService.getRecomputeStatus(jobId);

                if (status.status === 'completed') {
                    NotificationSystem.showSuccess('רענון נתונים הושלם בהצלחה');
                    this.recomputeJobs.delete(jobId);

                    // Invalidate relevant caches
                    EODMetricsDataService.invalidateCache();

                    // Trigger page refresh for updated data
                    setTimeout(() => {
                        location.reload();
                    }, 1000);

                    return;

                } else if (status.status === 'completed_with_errors') {
                    NotificationSystem.showWarning(
                        'רענון נתונים הושלם עם אזהרות',
                        `הושלמו עם ${status.errors?.length || 0} שגיאות`
                    );
                    this.recomputeJobs.delete(jobId);

                } else if (status.status === 'failed') {
                    NotificationSystem.showError(
                        'רענון נתונים נכשל',
                        status.errors?.[0]?.general_error || 'Unknown error'
                    );
                    this.recomputeJobs.delete(jobId);
                    return;

                } else if (status.status === 'running') {
                    // Still running, continue monitoring
                    setTimeout(checkStatus, 5000); // Check again in 5 seconds
                    return;
                }

                // For other statuses, continue monitoring
                setTimeout(checkStatus, 5000);

            } catch (error) {
                console.error('Error checking recompute status:', error);
                this.recomputeJobs.delete(jobId);
            }
        };

        checkStatus();
    }

    // Utility methods

    /**
     * מעצב סכום כמטבע
     *
     * @param {number} amount - הסכום לעיצוב
     * @param {string} [currency='USD'] - סוג המטבע
     * @returns {string} הסכום המעוצב
     */
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount || 0);
    }

    /**
     * מעצב תאריך לתצוגה בעברית
     *
     * @param {string} dateString - מחרוזת תאריך
     * @returns {string} התאריך המעוצב
     */
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('he-IL');
    }

    /**
     * מבצע ולידציה על מערך של מדדים
     *
     * @async
     * @param {Array<Object>} metricsArray - מערך מדדי פורטפוליו לבדיקה
     * @returns {Promise<Array<Object>>} רשימת שגיאות לכל מדד
     */
    async validateBatch(metricsArray) {
        const allErrors = [];

        for (const metrics of metricsArray) {
            const errors = this.validatePortfolioMetrics(metrics);
            if (errors.length > 0) {
                allErrors.push({
                    date: metrics.date_utc,
                    account_id: metrics.account_id,
                    errors: errors
                });
            }
        }

        if (allErrors.length > 0) {
            await this.handleBatchValidationErrors(allErrors);
        }

        return allErrors;
    }

    async handleBatchValidationErrors(batchErrors) {
        const highSeverityCount = batchErrors.reduce((count, item) =>
            count + item.errors.filter(e => e.severity === 'high').length, 0);

        if (highSeverityCount > 0) {
            await NotificationSystem.showError(
                'שגיאות אימות נתונים',
                `נמצאו ${highSeverityCount} שגיאות חמורות בנתוני EOD`,
                {
                    details: batchErrors,
                    autoHide: false
                }
            );
        }
    }
}

// Global instance
window.EODValidationService = new EODValidationService();

/**
 * FUNCTION INDEX - EOD Validation & Notification Service
 * ====================================================
 *
 * Core Validation Methods:
 * -----------------------
 * validatePortfolioMetrics(metrics) - ולידציה מקיפה של מדדי פורטפוליו
 * validateBatch(metricsArray) - ולידציה על מערך מדדים
 *
 * Error Handling Methods:
 * ----------------------
 * handleValidationErrors(metrics, errors) - טיפול בשגיאות ולידציה
 * handleBatchValidationErrors(batchErrors) - טיפול בשגיאות batch
 * showHighSeverityError(error, metrics) - הצגת שגיאות חמורות
 * showMediumSeverityError(error, metrics) - הצגת שגיאות בינוניות
 *
 * Recompute Methods:
 * -----------------
 * triggerRecompute(userId, date) - הפעלת חישוב מחדש
 * monitorRecomputeJob(jobId) - מעקב אחרי משימת חישוב
 * suggestRecompute(metrics) - הצעת חישוב מחדש
 *
 * Utility Methods:
 * ---------------
 * formatCurrency(amount, currency) - עיצוב מטבע
 * formatDate(dateString) - עיצוב תאריך
 *
 * Validation Rules:
 * ---------------
 * - NAV Consistency: בדיקת עקביות בין nav_total לבין חישוב
 * - Negative NAV: זיהוי ערכי NAV שליליים לא הגיוניים
 * - Exposure Consistency: בדיקת עקביות חשיפות
 * - Data Quality: בדיקת סטטוס איכות נתונים
 * - Stored Errors: בדיקת שגיאות ולידציה שמורות
 *
 * Notification Integration:
 * -----------------------
 * - NotificationSystem.showError() - שגיאות חמורות
 * - NotificationSystem.showWarning() - אזהרות
 * - NotificationSystem.showConfirm() - בקשות אישור
 * - NotificationSystem.showInfo() - הודעות מידע
 * - NotificationSystem.showSuccess() - הודעות הצלחה
 *
 * Recompute Workflow:
 * -----------------
 * 1. זיהוי בעיית נתונים
 * 2. הצגת הודעת שגיאה עם אפשרות רענון
 * 3. הפעלת recompute job דרך EODMetricsDataService
 * 4. מעקב אחרי סטטוס המשימה
 * 5. עדכון cache ורענון דף עם נתונים חדשים
 *
 * Error Severity Levels:
 * --------------------
 * - high: שגיאות חמורות - מציגות confirm dialog עם אפשרות רענון
 * - medium: שגיאות בינוניות - מציגות warning עם הצעה לרענון
 * - low: שגיאות קלות - logging בלבד
 */
