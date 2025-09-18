/**
 * Data Collector - איסוף נתונים למערכת הלינטר
 *
 * @description מחלקה לאיסוף וחישוב נתונים מאירועי סריקה ותיקון
 * @version 1.0.0
 * @since 2025-01-18
 */

class DataCollector {
    constructor() {
        this.triggers = {
            scanComplete: true,
            fixApplied: true,
            manualRefresh: true,
            pageLoad: false,
            autoRefresh: false
        };

        this.lastScanMetrics = null;
        this.sessionStartTime = Date.now();
        this.scanCount = 0;
        this.fixCount = 0;

        console.log('📊 DataCollector initialized');
    }

    /**
     * איסוף נתונים מסריקת קוד
     * @param {Object} scanResults - תוצאות הסריקה
     * @returns {Object} מדדים מחושבים
     */
    collectFromScan(scanResults) {
        try {
            console.log('🔍 אוסף נתונים מסריקה...');

            const startTime = performance.now();
            this.scanCount++;

            // נתוני בסיס מהסריקה
            const totalFiles = scanResults.totalFiles || 0;
            const errors = scanResults.errors || 0;
            const warnings = scanResults.warnings || 0;
            const scanDuration = scanResults.scanDuration || (performance.now() - startTime);

            // חישוב מדדי איכות
            const qualityScore = this.calculateQualityScore(errors, warnings);
            const performanceMetrics = this.calculatePerformanceMetrics(totalFiles, scanDuration);

            const metrics = {
                totalFiles: totalFiles,
                errors: errors,
                warnings: warnings,
                qualityScore: qualityScore,
                scanDuration: scanDuration,
                filesPerSecond: totalFiles > 0 ? (totalFiles / (scanDuration / 1000)).toFixed(2) : 0,
                performanceMetrics: performanceMetrics,
                sessionId: this.generateSessionId(),
                timestamp: new Date().toISOString(),
                trigger: 'scan',
                metadata: {
                    scanType: scanResults.scanType || 'full',
                    fileTypes: scanResults.fileTypes || [],
                    totalSize: scanResults.totalSize || 0
                }
            };

            // שמירת נתוני הסריקה האחרונה
            this.lastScanMetrics = metrics;

            console.log(`✅ נתוני סריקה נאספו: איכות ${qualityScore.toFixed(1)}%, ${errors + warnings} בעיות`);
            return metrics;

        } catch (error) {
            console.error('❌ שגיאה באיסוף נתונים מסריקה:', error);
            return this.createErrorMetrics('scan_collection_error');
        }
    }

    /**
     * איסוף נתונים מתיקון קוד
     * @param {Object} fixResults - תוצאות התיקון
     * @returns {Object} מדדים מחושבים
     */
    collectFromFix(fixResults) {
        try {
            console.log('🔧 אוסף נתונים מתיקון...');

            const startTime = performance.now();
            this.fixCount++;

            // נתוני בסיס מהתיקון
            const totalFixes = fixResults.totalFixes || 0;
            const successfulFixes = fixResults.successfulFixes || 0;
            const failedFixes = fixResults.failedFixes || 0;
            const fixDuration = fixResults.fixDuration || (performance.now() - startTime);

            // השתמש בנתוני הסריקה האחרונה כבסיס
            const baseMetrics = this.lastScanMetrics || {
                totalFiles: 0,
                errors: 0,
                warnings: 0,
                qualityScore: 100
            };

            // חישוב מדדי איכות לאחר תיקון
            const remainingErrors = Math.max(0, baseMetrics.errors - successfulFixes);
            const newQualityScore = this.calculateQualityScore(remainingErrors, baseMetrics.warnings);

            const metrics = {
                totalFiles: baseMetrics.totalFiles,
                errors: remainingErrors,
                warnings: baseMetrics.warnings,
                qualityScore: newQualityScore,
                scanDuration: baseMetrics.scanDuration,
                filesPerSecond: baseMetrics.filesPerSecond,
                fixMetrics: {
                    totalFixes: totalFixes,
                    successfulFixes: successfulFixes,
                    failedFixes: failedFixes,
                    fixSuccessRate: totalFixes > 0 ? (successfulFixes / totalFixes * 100).toFixed(1) : 0,
                    fixDuration: fixDuration,
                    qualityImprovement: (newQualityScore - baseMetrics.qualityScore).toFixed(1)
                },
                sessionId: this.generateSessionId(),
                timestamp: new Date().toISOString(),
                trigger: 'fix',
                metadata: {
                    fixType: fixResults.fixType || 'auto',
                    rulesApplied: fixResults.rulesApplied || [],
                    backupCreated: fixResults.backupCreated || false
                }
            };

            console.log(`✅ נתוני תיקון נאספו: שיפור איכות ${metrics.fixMetrics.qualityImprovement}%`);
            return metrics;

        } catch (error) {
            console.error('❌ שגיאה באיסוף נתונים מתיקון:', error);
            return this.createErrorMetrics('fix_collection_error');
        }
    }

    /**
     * חישוב ציון איכות קוד
     * @param {number} errors - מספר שגיאות
     * @param {number} warnings - מספר אזהרות
     * @returns {number} ציון איכות (0-100)
     */
    calculateQualityScore(errors, warnings) {
        try {
            if (typeof errors !== 'number' || typeof warnings !== 'number') {
                return 0;
            }

            // חישוב בסיסי: 100 - (שגיאות * 5) - (אזהרות * 2)
            let qualityScore = 100 - (errors * 5) - (warnings * 2);

            // הגבלות טווח
            qualityScore = Math.max(0, Math.min(100, qualityScore));

            // עיגול לשתי ספרות אחרי הנקודה
            return Math.round(qualityScore * 10) / 10;

        } catch (error) {
            console.error('❌ שגיאה בחישוב ציון איכות:', error);
            return 0;
        }
    }

    /**
     * חישוב מדדי ביצועים
     * @param {number} totalFiles - סך כל הקבצים
     * @param {number} scanDuration - זמן הסריקה ב-ms
     * @returns {Object} מדדי ביצועים
     */
    calculatePerformanceMetrics(totalFiles, scanDuration) {
        try {
            const metrics = {
                scanTime: scanDuration,
                filesPerSecond: totalFiles > 0 ? (totalFiles / (scanDuration / 1000)).toFixed(2) : 0,
                efficiency: this.calculateEfficiency(totalFiles, scanDuration),
                memoryUsage: this.getMemoryUsage(),
                timestamp: Date.now()
            };

            return metrics;

        } catch (error) {
            console.error('❌ שגיאה בחישוב מדדי ביצועים:', error);
            return {
                scanTime: 0,
                filesPerSecond: 0,
                efficiency: 0,
                memoryUsage: 0,
                timestamp: Date.now()
            };
        }
    }

    /**
     * חישוב יעילות הסריקה
     * @param {number} totalFiles - סך כל הקבצים
     * @param {number} scanDuration - זמן הסריקה
     * @returns {number} ציון יעילות (0-100)
     */
    calculateEfficiency(totalFiles, scanDuration) {
        try {
            if (totalFiles <= 0 || scanDuration <= 0) return 0;

            // יעילות מבוססת על קבצים לשנייה
            const filesPerSecond = totalFiles / (scanDuration / 1000);
            const efficiency = Math.min(100, filesPerSecond * 10); // יעילות מקסימלית ב-10 קבצים לשנייה

            return Math.round(efficiency);

        } catch (error) {
            return 0;
        }
    }

    /**
     * קבלת נתוני שימוש בזיכרון
     * @returns {number} שימוש בזיכרון ב-MB
     */
    getMemoryUsage() {
        try {
            if (performance.memory) {
                return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            }
            return 0;
        } catch (error) {
            return 0;
        }
    }

    /**
     * יצירת Data Point מלא
     * @param {Object} metrics - מדדים בסיסיים
     * @returns {Object} Data Point מלא
     */
    createDataPoint(metrics) {
        try {
            const dataPoint = {
                id: this.generateDataPointId(),
                timestamp: metrics.timestamp || new Date().toISOString(),
                sessionId: metrics.sessionId || this.generateSessionId(),
                metrics: {
                    totalFiles: metrics.totalFiles || 0,
                    errors: metrics.errors || 0,
                    warnings: metrics.warnings || 0,
                    qualityScore: metrics.qualityScore || 0,
                    scanDuration: metrics.scanDuration || 0,
                    filesPerSecond: metrics.filesPerSecond || 0
                },
                scanInfo: {
                    trigger: metrics.trigger || 'manual',
                    fileTypes: metrics.metadata?.fileTypes || [],
                    totalSize: metrics.metadata?.totalSize || 0
                },
                performance: metrics.performanceMetrics || {},
                fixInfo: metrics.fixMetrics || null,
                version: '1.0.0',
                metadata: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };

            // ולידציה של Data Point
            if (!this.validateDataPoint(dataPoint)) {
                throw new Error('Data Point validation failed');
            }

            return dataPoint;

        } catch (error) {
            console.error('❌ שגיאה ביצירת Data Point:', error);
            return this.createErrorDataPoint();
        }
    }

    /**
     * ולידציה של Data Point
     * @param {Object} dataPoint - Data Point לבדיקה
     * @returns {boolean} תוצאת הולידציה
     */
    validateDataPoint(dataPoint) {
        try {
            if (!dataPoint) return false;
            if (!dataPoint.id || !dataPoint.timestamp) return false;
            if (!dataPoint.metrics || typeof dataPoint.metrics !== 'object') return false;

            // בדיקת ערכים נומריים
            const requiredNumeric = ['totalFiles', 'errors', 'warnings', 'qualityScore'];
            for (const field of requiredNumeric) {
                if (typeof dataPoint.metrics[field] !== 'number' ||
                    isNaN(dataPoint.metrics[field])) {
                    return false;
                }
            }

            // בדיקת טווח ערכים
            if (dataPoint.metrics.qualityScore < 0 || dataPoint.metrics.qualityScore > 100) {
                return false;
            }

            return true;

        } catch (error) {
            console.error('❌ שגיאה בולידציה של Data Point:', error);
            return false;
        }
    }

    /**
     * הוספת metadata ל-Data Point
     * @param {Object} dataPoint - Data Point קיים
     * @returns {Object} Data Point עם metadata
     */
    addMetadata(dataPoint) {
        try {
            const enhancedPoint = {
                ...dataPoint,
                metadata: {
                    ...dataPoint.metadata,
                    collectedAt: new Date().toISOString(),
                    collectorVersion: '1.0.0',
                    sessionDuration: Date.now() - this.sessionStartTime,
                    totalScans: this.scanCount,
                    totalFixes: this.fixCount
                }
            };

            return enhancedPoint;

        } catch (error) {
            console.error('❌ שגיאה בהוספת metadata:', error);
            return dataPoint;
        }
    }

    /**
     * יצירת מזהה ייחודי ל-Data Point
     * @returns {string} מזהה ייחודי
     */
    generateDataPointId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `dp_${timestamp}_${random}`;
    }

    /**
     * יצירת מזהה סשן
     * @returns {string} מזהה סשן
     */
    generateSessionId() {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return `session_${date}_${Math.random().toString(36).substr(2, 5)}`;
    }

    /**
     * יצירת מדדים לשגיאה
     * @param {string} errorType - סוג השגיאה
     * @returns {Object} מדדי שגיאה
     */
    createErrorMetrics(errorType) {
        return {
            totalFiles: 0,
            errors: 1,
            warnings: 0,
            qualityScore: 0,
            scanDuration: 0,
            filesPerSecond: 0,
            sessionId: this.generateSessionId(),
            timestamp: new Date().toISOString(),
            trigger: 'error',
            metadata: {
                errorType: errorType,
                errorTimestamp: Date.now()
            }
        };
    }

    /**
     * יצירת Data Point לשגיאה
     * @returns {Object} Data Point שגיאה
     */
    createErrorDataPoint() {
        return {
            id: this.generateDataPointId(),
            timestamp: new Date().toISOString(),
            sessionId: this.generateSessionId(),
            metrics: {
                totalFiles: 0,
                errors: 1,
                warnings: 0,
                qualityScore: 0,
                scanDuration: 0,
                filesPerSecond: 0
            },
            scanInfo: {
                trigger: 'error',
                fileTypes: [],
                totalSize: 0
            },
            performance: {},
            fixInfo: null,
            version: '1.0.0',
            metadata: {
                error: true,
                errorTimestamp: Date.now()
            }
        };
    }

    /**
     * קבלת סטטיסטיקות איסוף
     * @returns {Object} סטטיסטיקות
     */
    getCollectionStats() {
        return {
            sessionStartTime: this.sessionStartTime,
            scanCount: this.scanCount,
            fixCount: this.fixCount,
            sessionDuration: Date.now() - this.sessionStartTime,
            lastScanMetrics: this.lastScanMetrics,
            triggers: this.triggers
        };
    }

    /**
     * איפוס נתוני הסשן
     */
    resetSession() {
        this.lastScanMetrics = null;
        this.sessionStartTime = Date.now();
        this.scanCount = 0;
        this.fixCount = 0;
        console.log('🔄 נתוני הסשן אופסו');
    }
}

// ייצוא למערכת גלובלית
if (typeof window !== 'undefined') {
    window.DataCollector = DataCollector;
}

console.log('📊 DataCollector loaded successfully');
