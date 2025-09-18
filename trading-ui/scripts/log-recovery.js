/**
 * Log Recovery System - שחזור נתונים מהלוגים
 *
 * @description מחלקה לשחזור נתוני גרף מהלוגים הקיימים
 * @version 1.0.0
 * @since 2025-01-18
 */

/**
 * @class LogRecovery
 * @description מטפל בשחזור נתונים מהלוגים הקיימים
 */
class LogRecovery {
    constructor() {
        this.logPatterns = {
            scanComplete: /נמצאו (\d+) שגיאות ו-(\d+) אזהרות/,
            fixComplete: /תוקנו (\d+) שגיאות/,
            filesScanned: /נסרקו (\d+) קבצים/,
            qualityScore: /איכות קוד: (\d+(?:\.\d+)?)%/,
            scanTime: /זמן סריקה: (\d+(?:\.\d+)?)ms/,
            sessionStart: /session_(\w+)/
        };

        this.recoveredData = [];
        this.lastRecoveryTime = null;
    }

    /**
     * שחזור נתונים מהלוגים הקיימים
     * @returns {Promise<Array>} מערך נקודות נתונים משוחזרות
     */
    async recoverFromSystemLog() {
        console.log('🔄 מתחיל שחזור מהלוגים...');

        try {
            // קריאת הלוגים הקיימים
            const systemLogs = await this.loadSystemLogs();
            const recoveredData = [];

            if (systemLogs.length === 0) {
                console.log('📝 לא נמצאו לוגים לשחזור');
                return [];
            }

            // עיבוד הלוגים לפי סשנים
            const sessions = this.groupLogsBySession(systemLogs);

            for (const [sessionId, sessionLogs] of Object.entries(sessions)) {
                const sessionData = this.extractSessionData(sessionId, sessionLogs);
                if (sessionData.length > 0) {
                    recoveredData.push(...sessionData);
                }
            }

            // מיון לפי timestamp
            recoveredData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            this.recoveredData = recoveredData;
            this.lastRecoveryTime = new Date();

            console.log(`✅ שוחזרו ${recoveredData.length} נקודות נתונים מ-${Object.keys(sessions).length} סשנים`);
            return recoveredData;

        } catch (error) {
            console.error('❌ שגיאה בשחזור מהלוגים:', error);
            return [];
        }
    }

    /**
     * טעינת הלוגים הקיימים
     * @returns {Promise<Array>} מערך רשומות לוג
     */
    async loadSystemLogs() {
        // בדיקה אם יש לוגים ב-sessionStorage
        const sessionLogs = this.loadFromSessionStorage();

        // בדיקה אם יש לוגים בקבצים (אם ניתן)
        const fileLogs = await this.loadFromFiles();

        return [...sessionLogs, ...fileLogs];
    }

    /**
     * טעינת לוגים מ-sessionStorage
     * @returns {Array} רשומות לוג
     */
    loadFromSessionStorage() {
        try {
            const logs = JSON.parse(sessionStorage.getItem('systemLogs') || '[]');
            return Array.isArray(logs) ? logs : [];
        } catch (error) {
            console.warn('שגיאה בטעינת לוגים מ-sessionStorage:', error);
            return [];
        }
    }

    /**
     * טעינת לוגים מקבצים (אם זמין)
     * @returns {Promise<Array>} רשומות לוג מקבצים
     */
    async loadFromFiles() {
        // כאן ניתן להוסיף לוגיקה לטעינת קבצי לוג
        // בינתיים מחזיר מערך ריק
        return [];
    }

    /**
     * קיבוץ לוגים לפי סשנים
     * @param {Array} logs - רשומות לוג
     * @returns {Object} לוגים מקובצים לפי סשן
     */
    groupLogsBySession(logs) {
        const sessions = {};

        logs.forEach(log => {
            let sessionId = 'default';

            // חיפוש session ID בלוג
            const sessionMatch = log.message?.match(this.logPatterns.sessionStart);
            if (sessionMatch) {
                sessionId = sessionMatch[1];
            }

            if (!sessions[sessionId]) {
                sessions[sessionId] = [];
            }

            sessions[sessionId].push(log);
        });

        return sessions;
    }

    /**
     * חילוץ נתונים מסשן ספציפי
     * @param {string} sessionId - מזהה הסשן
     * @param {Array} sessionLogs - לוגי הסשן
     * @returns {Array} נקודות נתונים משוחזרות
     */
    extractSessionData(sessionId, sessionLogs) {
        const dataPoints = [];
        let currentScan = null;

        sessionLogs.forEach(log => {
            const timestamp = new Date(log.timestamp || Date.now());

            // זיהוי התחלת סריקה
            if (log.message?.includes('סריקה התחילה') || log.message?.includes('Starting scan')) {
                currentScan = {
                    timestamp: timestamp.toISOString(),
                    sessionId,
                    metrics: {
                        totalFiles: 0,
                        errors: 0,
                        warnings: 0,
                        qualityScore: 50,
                        scanDuration: 0
                    },
                    source: 'log_recovery'
                };
            }

            // חילוץ מספר קבצים שנמצאו
            const filesMatch = log.message?.match(this.logPatterns.filesScanned);
            if (filesMatch && currentScan) {
                currentScan.metrics.totalFiles = parseInt(filesMatch[1]);
            }

            // חילוץ שגיאות ואזהרות
            const issuesMatch = log.message?.match(this.logPatterns.scanComplete);
            if (issuesMatch && currentScan) {
                currentScan.metrics.errors = parseInt(issuesMatch[1]);
                currentScan.metrics.warnings = parseInt(issuesMatch[2]);

                // חישוב איכות קוד
                currentScan.metrics.qualityScore = this.calculateQualityScore(
                    currentScan.metrics.errors,
                    currentScan.metrics.warnings
                );
            }

            // חילוץ זמן סריקה
            const timeMatch = log.message?.match(this.logPatterns.scanTime);
            if (timeMatch && currentScan) {
                currentScan.metrics.scanDuration = parseFloat(timeMatch[1]);
            }

            // חילוץ איכות קוד מפורשת
            const qualityMatch = log.message?.match(this.logPatterns.qualityScore);
            if (qualityMatch && currentScan) {
                currentScan.metrics.qualityScore = parseFloat(qualityMatch[1]);
            }

            // סיום סריקה והוספה לרשימה
            if (log.message?.includes('סריקה הושלמה') || log.message?.includes('Scan completed')) {
                if (currentScan) {
                    dataPoints.push({ ...currentScan });
                    currentScan = null;
                }
            }
        });

        return dataPoints;
    }

    /**
     * חישוב איכות קוד
     * @param {number} errors - מספר שגיאות
     * @param {number} warnings - מספר אזהרות
     * @returns {number} ציון איכות (0-100)
     */
    calculateQualityScore(errors, warnings) {
        const baseScore = 100;
        const errorPenalty = errors * 5;
        const warningPenalty = warnings * 2;

        const score = Math.max(0, baseScore - errorPenalty - warningPenalty);
        return Math.round(score * 10) / 10; // עיגול לעשירית
    }

    /**
     * מיזוג נתונים משוחזרים עם נתונים קיימים
     * @param {Array} existingData - נתונים קיימים
     * @param {Array} recoveredData - נתונים משוחזרים
     * @returns {Array} נתונים משולבים
     */
    mergeWithExistingData(existingData, recoveredData) {
        const merged = [...existingData];
        const existingIds = new Set(existingData.map(item => item.id));

        // הוספת נתונים משוחזרים שלא קיימים
        recoveredData.forEach(recovered => {
            if (!existingIds.has(recovered.id)) {
                merged.push(recovered);
            }
        });

        // מיון לפי timestamp
        merged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        console.log(`🔀 מוזגו ${recoveredData.length} נקודות משוחזרות עם ${existingData.length} קיימות`);
        return merged;
    }

    /**
     * וידוא תקינות הנתונים המשוחזרים
     * @param {Array} data - נתונים לבדיקה
     * @returns {Array} נתונים תקינים
     */
    validateRecoveredData(data) {
        return data.filter(item => {
            try {
                // בדיקת מבנה בסיסי
                if (!item.timestamp || !item.metrics) {
                    return false;
                }

                // בדיקת timestamp תקין
                const timestamp = new Date(item.timestamp);
                if (isNaN(timestamp.getTime())) {
                    return false;
                }

                // בדיקת metrics
                const metrics = item.metrics;
                if (typeof metrics.totalFiles !== 'number' ||
                    typeof metrics.errors !== 'number' ||
                    typeof metrics.warnings !== 'number' ||
                    typeof metrics.qualityScore !== 'number') {
                    return false;
                }

                // בדיקת טווחים
                if (metrics.qualityScore < 0 || metrics.qualityScore > 100) {
                    return false;
                }

                if (metrics.totalFiles < 0 || metrics.errors < 0 || metrics.warnings < 0) {
                    return false;
                }

                return true;

            } catch (error) {
                console.warn('נתון משוחזר לא תקין:', item, error);
                return false;
            }
        });
    }

    /**
     * ייצוא נתונים משוחזרים לקובץ
     * @returns {Promise<string>} תוכן הקובץ
     */
    async exportToFile() {
        const data = {
            recoveredData: this.recoveredData,
            exportTime: new Date().toISOString(),
            totalPoints: this.recoveredData.length,
            lastRecoveryTime: this.lastRecoveryTime
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * יבוא נתונים מקובץ
     * @param {string} jsonData - תוכן הקובץ
     * @returns {Promise<boolean>} האם היבוא הצליח
     */
    async importFromFile(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            if (data.recoveredData && Array.isArray(data.recoveredData)) {
                this.recoveredData = this.validateRecoveredData(data.recoveredData);
                this.lastRecoveryTime = data.lastRecoveryTime ? new Date(data.lastRecoveryTime) : new Date();

                console.log(`📥 יובאו ${this.recoveredData.length} נקודות נתונים מקובץ`);
                return true;
            }

            return false;

        } catch (error) {
            console.error('❌ שגיאה ביבוא מקובץ:', error);
            return false;
        }
    }

    /**
     * יצירת גיבוי של הנתונים המשוחזרים
     * @returns {Promise<void>}
     */
    async createBackup() {
        try {
            const backupData = await this.exportToFile();
            const backupName = `log_recovery_backup_${Date.now()}.json`;

            // שמירה ב-localStorage כגיבוי
            localStorage.setItem(`log_recovery_backup_${Date.now()}`, backupData);

            console.log(`💾 גיבוי נוצר: ${backupName}`);
            return backupName;

        } catch (error) {
            console.error('❌ שגיאה ביצירת גיבוי:', error);
            throw error;
        }
    }

    /**
     * קבלת סטטיסטיקות השחזור
     * @returns {Object} סטטיסטיקות
     */
    getRecoveryStats() {
        const stats = {
            totalRecovered: this.recoveredData.length,
            lastRecoveryTime: this.lastRecoveryTime,
            dataQuality: this.calculateDataQuality(),
            timeRange: this.getTimeRange()
        };

        return stats;
    }

    /**
     * חישוב איכות הנתונים המשוחזרים
     * @returns {number} ציון איכות (0-100)
     */
    calculateDataQuality() {
        if (this.recoveredData.length === 0) {
            return 0;
        }

        let qualityScore = 100;
        const issues = this.recoveredData.filter(item =>
            !item.metrics ||
            item.metrics.qualityScore < 30 ||
            item.metrics.errors > item.metrics.totalFiles * 0.5
        );

        qualityScore -= (issues.length / this.recoveredData.length) * 30;

        return Math.max(0, Math.round(qualityScore));
    }

    /**
     * קבלת טווח זמנים של הנתונים
     * @returns {Object} טווח זמנים
     */
    getTimeRange() {
        if (this.recoveredData.length === 0) {
            return null;
        }

        const timestamps = this.recoveredData.map(item => new Date(item.timestamp));
        const earliest = new Date(Math.min(...timestamps));
        const latest = new Date(Math.max(...timestamps));

        return {
            earliest: earliest.toISOString(),
            latest: latest.toISOString(),
            duration: latest - earliest
        };
    }
}

// ייצוא למערכת גלובלית
if (typeof window !== 'undefined') {
    window.LogRecovery = LogRecovery;
}

console.log('🔄 LogRecovery system loaded successfully');

