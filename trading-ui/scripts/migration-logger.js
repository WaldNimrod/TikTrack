/**
 * מערכת לוג מפורט לפעולות מיגרציה
 * TikTrack Migration Logger System
 * 
 * תאריך יצירה: 26 בינואר 2025
 * גרסה: 1.0
 * 
 * דוקומנטציה: CACHE_UNIFICATION_WORK_PLAN.md
 */

class MigrationLogger {
    constructor() {
        this.logs = [];
        this.maxLogEntries = 1000;
        this.logLevels = {
            ERROR: 0,
            WARNING: 1,
            INFO: 2,
            SUCCESS: 3,
            DEBUG: 4
        };
        this.currentLogLevel = this.logLevels.INFO;
        
        // סטטיסטיקות לוג
        this.stats = {
            totalLogs: 0,
            errorLogs: 0,
            warningLogs: 0,
            infoLogs: 0,
            successLogs: 0,
            debugLogs: 0,
            lastLogTime: null
        };
        
        // הגדרות לוג
        this.settings = {
            enableConsoleOutput: true,
            enableLocalStorageBackup: true,
            enableIndexedDBBackup: true,
            autoFlushInterval: 30000, // 30 שניות
            maxLogSize: 1024 * 1024 // 1MB
        };
        
        // מזהי פעילות נוכחיים
        this.currentActivity = null;
        this.activityStack = [];
        
        this.initializeLogger();
    }

    /**
     * אתחול מערכת הלוג
     */
    initializeLogger() {
        // טעינת הגדרות מ-localStorage
        this.loadSettings();
        
        // הגדרת auto-flush
        if (this.settings.autoFlushInterval > 0) {
            setInterval(() => {
                this.flushLogs();
            }, this.settings.autoFlushInterval);
        }
        
        // הוספת event listeners
        window.addEventListener('beforeunload', () => {
            this.flushLogs();
        });
        
        this.log('INFO', 'MigrationLogger initialized', 'system');
    }

    /**
     * רישום לוג
     * @param {string} level - רמת הלוג (ERROR, WARNING, INFO, SUCCESS, DEBUG)
     * @param {string} message - הודעת הלוג
     * @param {string} context - הקשר/מודול
     * @param {Object} data - נתונים נוספים
     */
    log(level, message, context = 'general', data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            id: this.generateLogId(),
            timestamp,
            level: level.toUpperCase(),
            message,
            context,
            data,
            activityId: this.currentActivity?.id,
            activityName: this.currentActivity?.name,
            stackTrace: level === 'ERROR' ? this.getStackTrace() : null
        };
        
        // הוספה לרשימת הלוגים
        this.logs.push(logEntry);
        
        // עדכון סטטיסטיקות
        this.updateStats(level);
        
        // פלט לקונסול
        if (this.settings.enableConsoleOutput && this.shouldLog(level)) {
            this.outputToConsole(logEntry);
        }
        
        // שמירה אוטומטית אם נדרש
        if (this.shouldAutoSave()) {
            this.saveLogs();
        }
        
        // ניקוי לוגים ישנים
        this.cleanupOldLogs();
        
        return logEntry.id;
    }

    /**
     * התחלת פעילות חדשה
     * @param {string} activityName - שם הפעילות
     * @param {Object} metadata - מטא-דטה
     */
    startActivity(activityName, metadata = {}) {
        const activityId = this.generateLogId();
        const activity = {
            id: activityId,
            name: activityName,
            startTime: Date.now(),
            metadata,
            logs: []
        };
        
        this.activityStack.push(this.currentActivity);
        this.currentActivity = activity;
        
        this.log('INFO', `פעילות התחילה: ${activityName}`, 'activity', { activityId, metadata });
        
        return activityId;
    }

    /**
     * סיום פעילות נוכחית
     * @param {string} result - תוצאת הפעילות (SUCCESS, FAILED, CANCELLED)
     * @param {Object} summary - סיכום הפעילות
     */
    endActivity(result = 'SUCCESS', summary = {}) {
        if (!this.currentActivity) {
            this.log('WARNING', 'ניסיון לסיום פעילות ללא פעילות פעילה', 'activity');
            return null;
        }
        
        const endTime = Date.now();
        const duration = endTime - this.currentActivity.startTime;
        
        const activitySummary = {
            ...this.currentActivity,
            endTime,
            duration,
            result,
            summary,
            logCount: this.currentActivity.logs.length
        };
        
        this.log('INFO', `פעילות הסתיימה: ${this.currentActivity.name} (${result}, ${duration}ms)`, 'activity', activitySummary);
        
        // החזרת הפעילות הקודמת
        this.currentActivity = this.activityStack.pop();
        
        return activitySummary;
    }

    /**
     * רישום שגיאה
     */
    error(message, context = 'general', data = null) {
        return this.log('ERROR', message, context, data);
    }

    /**
     * רישום אזהרה
     */
    warning(message, context = 'general', data = null) {
        return this.log('WARNING', message, context, data);
    }

    /**
     * רישום מידע
     */
    info(message, context = 'general', data = null) {
        return this.log('INFO', message, context, data);
    }

    /**
     * רישום הצלחה
     */
    success(message, context = 'general', data = null) {
        return this.log('SUCCESS', message, context, data);
    }

    /**
     * רישום debug
     */
    debug(message, context = 'general', data = null) {
        return this.log('DEBUG', message, context, data);
    }

    /**
     * שמירת לוגים
     */
    async saveLogs() {
        try {
            const logsData = {
                logs: this.logs,
                stats: this.stats,
                settings: this.settings,
                timestamp: new Date().toISOString()
            };
            
            // שמירה ב-localStorage
            if (this.settings.enableLocalStorageBackup) {
                const storageKey = 'tiktrack_migration_logs';
                const logsJson = JSON.stringify(logsData);
                
                if (logsJson.length < 5 * 1024 * 1024) { // פחות מ-5MB
                    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                        await window.UnifiedCacheManager.save(storageKey, logsData, {
                            layer: 'localStorage',
                            ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
                            syncToBackend: false
                        });
                    } else {
                        localStorage.setItem(storageKey, logsJson); // fallback
                    }
                    this.debug('לוגים נשמרו ב-localStorage', 'logger');
                } else {
                    this.warning('לוגים גדולים מדי לשמירה ב-localStorage', 'logger');
                }
            }
            
            // שמירה ב-IndexedDB
            if (this.settings.enableIndexedDBBackup && window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                await window.UnifiedCacheManager.save(
                    'migration_logs',
                    logsData,
                    {
                        layer: 'indexedDB',
                        compress: true,
                        ttl: 7 * 24 * 60 * 60 * 1000 // 7 ימים
                    }
                );
                this.debug('לוגים נשמרו ב-IndexedDB', 'logger');
            }
            
        } catch (error) {
            console.error('שגיאה בשמירת לוגים:', error);
        }
    }

    /**
     * טעינת לוגים
     */
    async loadLogs() {
        try {
            // טעינה מ-localStorage
            const storageKey = 'tiktrack_migration_logs';
            let localData = null;
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                localData = await window.UnifiedCacheManager.get(storageKey);
            } else {
                localData = localStorage.getItem(storageKey); // fallback
            }
            
            if (localData) {
                const logsData = JSON.parse(localData);
                this.logs = logsData.logs || [];
                this.stats = logsData.stats || this.stats;
                this.debug('לוגים נטענו מ-localStorage', 'logger');
                return true;
            }
            
            // טעינה מ-IndexedDB
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                const indexedData = await window.UnifiedCacheManager.get('migration_logs');
                if (indexedData) {
                    this.logs = indexedData.logs || [];
                    this.stats = indexedData.stats || this.stats;
                    this.debug('לוגים נטענו מ-IndexedDB', 'logger');
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            this.error('שגיאה בטעינת לוגים', 'logger', { error: error.message });
            return false;
        }
    }

    /**
     * ניקוי לוגים ישנים
     */
    cleanupOldLogs() {
        if (this.logs.length > this.maxLogEntries) {
            const logsToRemove = this.logs.length - this.maxLogEntries;
            this.logs.splice(0, logsToRemove);
            this.debug(`ניקוי לוגים: ${logsToRemove} ערכים ישנים נמחקו`, 'logger');
        }
    }

    /**
     * פלט לקונסול
     */
    outputToConsole(logEntry) {
        const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
        const prefix = `[${timestamp}] [${logEntry.context}]`;
        const message = `${prefix} ${logEntry.message}`;
        
        switch (logEntry.level) {
            case 'ERROR':
                console.error(message, logEntry.data || '');
                break;
            case 'WARNING':
                console.warn(message, logEntry.data || '');
                break;
            case 'SUCCESS':
                console.log(`✅ ${message}`, logEntry.data || '');
                break;
            case 'DEBUG':
                console.debug(message, logEntry.data || '');
                break;
            default:
                console.log(message, logEntry.data || '');
        }
    }

    /**
     * דוח לוגים מפורט
     */
    generateLogReport(options = {}) {
        const {
            level = null,
            context = null,
            startTime = null,
            endTime = null,
            limit = 100
        } = options;
        
        let filteredLogs = this.logs;
        
        // סינון לפי רמה
        if (level) {
            filteredLogs = filteredLogs.filter(log => log.level === level.toUpperCase());
        }
        
        // סינון לפי הקשר
        if (context) {
            filteredLogs = filteredLogs.filter(log => log.context === context);
        }
        
        // סינון לפי זמן
        if (startTime) {
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(startTime));
        }
        
        if (endTime) {
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(endTime));
        }
        
        // הגבלת מספר התוצאות
        if (limit > 0) {
            filteredLogs = filteredLogs.slice(-limit);
        }
        
        return {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalLogs: this.logs.length,
                filteredLogs: filteredLogs.length,
                filters: { level, context, startTime, endTime, limit }
            },
            stats: this.stats,
            logs: filteredLogs,
            summary: this.generateLogSummary(filteredLogs)
        };
    }

    /**
     * סיכום לוגים
     */
    generateLogSummary(logs) {
        const summary = {
            totalLogs: logs.length,
            levelCounts: {},
            contextCounts: {},
            timeRange: {
                start: logs.length > 0 ? logs[0].timestamp : null,
                end: logs.length > 0 ? logs[logs.length - 1].timestamp : null
            }
        };
        
        logs.forEach(log => {
            // ספירת רמות
            summary.levelCounts[log.level] = (summary.levelCounts[log.level] || 0) + 1;
            
            // ספירת הקשרים
            summary.contextCounts[log.context] = (summary.contextCounts[log.context] || 0) + 1;
        });
        
        return summary;
    }

    /**
     * יצירת דוח HTML
     */
    generateHTMLReport(options = {}) {
        const report = this.generateLogReport(options);
        
        let html = `
            <div class="migration-log-report">
                <h2>דוח לוג מיגרציה</h2>
                <div class="report-metadata">
                    <p><strong>נוצר ב:</strong> ${report.metadata.generatedAt}</p>
                    <p><strong>סה"כ לוגים:</strong> ${report.metadata.totalLogs}</p>
                    <p><strong>לוגים מסוננים:</strong> ${report.metadata.filteredLogs}</p>
                </div>
                <div class="report-stats">
                    <h3>סטטיסטיקות</h3>
                    <ul>
                        <li>שגיאות: ${report.stats.errorLogs}</li>
                        <li>אזהרות: ${report.stats.warningLogs}</li>
                        <li>מידע: ${report.stats.infoLogs}</li>
                        <li>הצלחות: ${report.stats.successLogs}</li>
                    </ul>
                </div>
                <div class="report-logs">
                    <h3>לוגים</h3>
                    <table class="log-table">
                        <thead>
                            <tr>
                                <th>זמן</th>
                                <th>רמה</th>
                                <th>הקשר</th>
                                <th>הודעה</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        report.logs.forEach(log => {
            const timestamp = new Date(log.timestamp).toLocaleString();
            html += `
                <tr class="log-row log-${log.level.toLowerCase()}">
                    <td>${timestamp}</td>
                    <td>${log.level}</td>
                    <td>${log.context}</td>
                    <td>${log.message}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        return html;
    }

    // פונקציות עזר

    /**
     * בדיקה אם צריך לרשום לוג
     */
    shouldLog(level) {
        return this.logLevels[level.toUpperCase()] <= this.currentLogLevel;
    }

    /**
     * עדכון סטטיסטיקות
     */
    updateStats(level) {
        this.stats.totalLogs++;
        this.stats[`${level.toLowerCase()}Logs`]++;
        this.stats.lastLogTime = new Date();
    }

    /**
     * בדיקה אם צריך שמירה אוטומטית
     */
    shouldAutoSave() {
        return this.logs.length % 50 === 0; // כל 50 לוגים
    }

    /**
     * יצירת מזהה לוג
     */
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }

    /**
     * קבלת stack trace
     */
    getStackTrace() {
        const stack = new Error().stack;
        return stack ? stack.split('\n').slice(2) : [];
    }

    /**
     * טעינת הגדרות
     */
    async loadSettings() {
        try {
            let savedSettings = null;
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                savedSettings = await window.UnifiedCacheManager.get('tiktrack_migration_logger_settings');
            } else {
                savedSettings = localStorage.getItem('tiktrack_migration_logger_settings'); // fallback
            }
            
            if (savedSettings) {
                const parsed = typeof savedSettings === 'string' ? JSON.parse(savedSettings) : savedSettings;
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (error) {
            console.warn('שגיאה בטעינת הגדרות לוגר:', error);
        }
    }

    /**
     * שמירת הגדרות
     */
    async saveSettings() {
        try {
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                await window.UnifiedCacheManager.save('tiktrack_migration_logger_settings', this.settings, {
                    layer: 'localStorage',
                    ttl: null, // persistent
                    syncToBackend: false
                });
            } else {
                localStorage.setItem('tiktrack_migration_logger_settings', JSON.stringify(this.settings)); // fallback
            }
        } catch (error) {
            console.warn('שגיאה בשמירת הגדרות לוגר:', error);
        }
    }

    /**
     * ניקוי לוגים
     */
    clearLogs() {
        this.logs = [];
        this.stats = {
            totalLogs: 0,
            errorLogs: 0,
            warningLogs: 0,
            infoLogs: 0,
            successLogs: 0,
            debugLogs: 0,
            lastLogTime: null
        };
        this.info('לוגים נוקו', 'logger');
    }

    /**
     * הגדרת רמת לוג
     */
    setLogLevel(level) {
        if (this.logLevels[level.toUpperCase()] !== undefined) {
            this.currentLogLevel = this.logLevels[level.toUpperCase()];
            this.info(`רמת לוג שונתה ל: ${level}`, 'logger');
        }
    }

    /**
     * פלט לוגים
     */
    flushLogs() {
        this.saveLogs();
    }
}

// יצירת instance גלובלי
window.MigrationLogger = new MigrationLogger();

// הוספה למערכת האתחול המאוחדת
if (window.UnifiedInitializationSystem) {
    window.UnifiedInitializationSystem.addCoreSystem('MigrationLogger', {
        initialize: async () => {
            console.log('📝 MigrationLogger initialized');
            
            // טעינת לוגים קיימים
            await window.MigrationLogger.loadLogs();
            
            return true;
        },
        dependencies: ['UnifiedCacheManager'],
        priority: 2
    });
}

console.log('✅ MigrationLogger loaded successfully');
