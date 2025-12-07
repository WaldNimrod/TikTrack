// Fallback גלובלי למקרה ש-Logger לא נטען
if (!window.Logger) {
    window.Logger = {
        info: () => {},
        error: () => {},
        warn: () => {},
        debug: () => {},
        critical: () => {}
    };
}

/**
 * Logger Service - TikTrack
 * שירות לוגים מתקדם עם אינטגרציה לשרת
 * 
 * תכונות:
 * - רמות לוג שונות (DEBUG, INFO, WARN, ERROR, CRITICAL)
 * - שליחה לשרת עם batching (רק במצב DEBUG או שגיאות)
 * - שמירה מקומית ב-localStorage (רק במצב DEBUG)
 * - ניטור ביצועים (רק במצב DEBUG)
 * - טיפול בשגיאות מתקדם עם הגנות
 * - מניעת לופים אינסופיים
 * - הגבלת גודל context
 * - מניעת לוגים כפולים
 * 
 * מצב DEBUG:
 * - נקבע לפי hostname (localhost/127.0.0.1) או URL parameters (debug=true, dev=true)
 * - במצב DEBUG: כל הלוגים מוצגים, נשמרים ב-localStorage, נשלחים לשרת
 * - במצב ייצור: רק שגיאות מוצגות ונשלחות לשרת
 * 
 * מחבר: TikTrack Development Team
 * תאריך יצירה: 24 אוקטובר 2025
 * תאריך עדכון: 25 אוקטובר 2025
 * גרסה: 2.1.0
 */

class Logger {
    static LogLevel = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        CRITICAL: 4
    };

    // הגדרת מצב דיבג - נשמר פעם אחת
    static _debugMode = null;
    static get DEBUG_MODE() {
        if (Logger._debugMode === null) {
            Logger._debugMode = window.location.hostname === 'localhost' || 
                                window.location.hostname === '127.0.0.1' ||
                                window.location.hostname === '0.0.0.0' ||
                                window.location.search.includes('debug=true') ||
                                window.location.search.includes('dev=true') ||
                                window.location.port === '8080'; // Development server port
        }
        return Logger._debugMode;
    }

    constructor() {
        this.initialized = false;
        // במצב DEBUG - מציגים INFO ומעלה, במצב ייצור - רק WARN ומעלה
        this.currentLevel = Logger.DEBUG_MODE ? Logger.LogLevel.INFO : Logger.LogLevel.WARN;
        this.pendingLogs = [];
        this.batchSize = 50; // הגדלת batch size להפחתת בקשות
        this.batchTimeout = 10000; // 10 seconds - הפחתת תדירות
        this.flushTimeout = null;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        // Performance monitoring
        this.performanceThreshold = 100; // ms
        this.longTaskThreshold = 50; // ms
        
        // Debouncing and protection
        this.isFlushing = false;
        this.flushAttempts = 0;
        this.maxFlushAttempts = 5;
        
        // הגנות נוספות
        this.isLogging = false;
        this.maxContextSize = 1000; // מקסימום 1KB ל-context
        this.duplicateLogs = new Set(); // מניעת לוגים כפולים
        this.consolePreferenceCache = new Map();
        this.consolePreferenceCacheTimestamps = new Map();
        this.consolePreferenceCacheTTL = 5 * 60 * 1000;
        this.consolePreferenceFetchPromises = new Map();
        this.verboseLoggingEnabled = Logger.DEBUG_MODE;
        this.preferenceLoadInProgress = null;
        this.preferencesApplied = false;
        this.preferenceListenersRegistered = false;
        
        this.registerPreferenceListeners();
        
        this.init();
    }

    /**
     * מיפוי קטגוריות למערכות
     * Maps page names to console log categories
     */
    static CATEGORY_MAPPING = {
        'header-system': 'initialization',
        'unified-app-initializer': 'initialization',
        'button-system': 'ui_components',
        'actions-menu': 'ui_components',
        'actions-menu-system': 'ui_components',
        'notification-system': 'notifications',
        'cache': 'cache',
        'preferences': 'system',
        'ui-utils': 'ui_components',
        'color-scheme': 'ui_components',
        'logger-service': 'system',
        'monitoring': 'system',
        'init-check': 'initialization',
        'cache-sync': 'cache',
        'entity-details': 'system',
        'unified-crud-service': 'business',
        'trades': 'business',
        'executions': 'business',
        'alerts': 'business',
        'trading_accounts': 'business',
        'accounts': 'business', // Legacy support
        'tickers': 'business',
        'trade-plans': 'business',
        'cash-flows': 'business',
        'notes': 'business',
        'trade-history': 'business',
        'trade-history-page': 'business'
    };

    registerPreferenceListeners() {
        if (this.preferenceListenersRegistered || typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
            return;
        }
        const handler = () => {
            this.consolePreferenceCache.clear();
            this.consolePreferenceCacheTimestamps.clear();
            this.applyLoggingPreferences();
        };
        window.addEventListener('preferences:loaded', handler);
        window.addEventListener('preferences:updated', handler);
        this.preferenceListenersRegistered = true;
    }

    async applyLoggingPreferences() {
        if (this.preferenceLoadInProgress) {
            try {
                return await this.preferenceLoadInProgress;
            } catch {
                return;
            }
        }

        this.preferenceLoadInProgress = (async () => {
            try {
                const logLevelPref = await this.resolvePreferenceValue('logLevel');
                this.applyLogLevelPreference(logLevelPref);

                const verbosePref = await this.resolvePreferenceValue('verboseLogging');
                const normalizedVerbose = this.normalizeBoolean(verbosePref);
                if (Logger.DEBUG_MODE) {
                    this.verboseLoggingEnabled = true;
                } else if (normalizedVerbose !== undefined) {
                    this.verboseLoggingEnabled = normalizedVerbose;
                } else if (!this.preferencesApplied) {
                    this.verboseLoggingEnabled = false;
                }

                this.preferencesApplied = true;
            } finally {
                this.preferenceLoadInProgress = null;
            }
        })();

        return this.preferenceLoadInProgress;
    }

    async resolvePreferenceValue(preferenceName) {
        const cachedValue = this.readPreferenceFromSources(preferenceName);
        if (cachedValue !== undefined) {
            return cachedValue;
        }
        return await this.safeGetPreference(preferenceName);
    }

    readPreferenceFromSources(preferenceName) {
        const sources = [
            typeof window !== 'undefined' ? window.currentPreferences : undefined,
            typeof window !== 'undefined' ? window.userPreferences : undefined,
            typeof window !== 'undefined' && window.PreferencesSystem ? window.PreferencesSystem.manager?.currentPreferences : undefined
        ];

        for (const source of sources) {
            if (source && Object.prototype.hasOwnProperty.call(source, preferenceName)) {
                return source[preferenceName];
            }
            if (!source) {
                continue;
            }
            if (preferenceName === 'logLevel') {
                if (source.console && Object.prototype.hasOwnProperty.call(source.console, 'logLevel')) {
                    return source.console.logLevel;
                }
            }
            if (preferenceName === 'verboseLogging') {
                if (source.console && Object.prototype.hasOwnProperty.call(source.console, 'verboseLogging')) {
                    return source.console.verboseLogging;
                }
            }
            if (preferenceName.startsWith('console_logs_')) {
                if (source.categories && Object.prototype.hasOwnProperty.call(source.categories, preferenceName)) {
                    return source.categories[preferenceName];
                }
                if (source.console && source.console.categories && Object.prototype.hasOwnProperty.call(source.console.categories, preferenceName)) {
                    return source.console.categories[preferenceName];
                }
                if (source.notifications && source.notifications.categories && Object.prototype.hasOwnProperty.call(source.notifications.categories, preferenceName)) {
                    return source.notifications.categories[preferenceName];
                }
            }
        }
        return undefined;
    }

    async safeGetPreference(preferenceName) {
        if (typeof window === 'undefined' || typeof window.getPreference !== 'function') {
            return undefined;
        }
        try {
            return await window.getPreference(preferenceName);
        } catch (error) {
            if (Logger.DEBUG_MODE) {
                console.warn(`LoggerService: failed to get preference "${preferenceName}"`, error);
            }
            return undefined;
        }
    }

    applyLogLevelPreference(prefValue) {
        if (prefValue === undefined || prefValue === null) {
            if (!this.preferencesApplied) {
                this.resetLogLevelToDefault();
            }
            return;
        }

        const normalized = String(prefValue).trim().toUpperCase();
        const levelMap = {
            DEBUG: Logger.LogLevel.DEBUG,
            INFO: Logger.LogLevel.INFO,
            WARN: Logger.LogLevel.WARN,
            ERROR: Logger.LogLevel.ERROR,
            CRITICAL: Logger.LogLevel.CRITICAL
        };

        if (levelMap.hasOwnProperty(normalized)) {
            this.currentLevel = levelMap[normalized];
        } else if (!this.preferencesApplied) {
            this.resetLogLevelToDefault();
        }
    }

    resetLogLevelToDefault() {
        this.currentLevel = Logger.DEBUG_MODE ? Logger.LogLevel.INFO : Logger.LogLevel.WARN;
    }

    normalizeBoolean(value) {
        if (value === null || value === undefined) {
            return undefined;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        const normalized = String(value).trim().toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(normalized)) {
            return true;
        }
        if (['false', '0', 'no', 'off'].includes(normalized)) {
            return false;
        }
        return undefined;
    }

    shouldEmitVerboseLogs() {
        return Logger.DEBUG_MODE || this.verboseLoggingEnabled === true;
    }

    cacheConsolePreference(key, value) {
        this.consolePreferenceCache.set(key, value);
        this.consolePreferenceCacheTimestamps.set(key, Date.now());
    }

    isConsolePreferenceCached(key) {
        if (!this.consolePreferenceCacheTimestamps.has(key)) {
            return false;
        }
        const timestamp = this.consolePreferenceCacheTimestamps.get(key);
        return Date.now() - timestamp <= this.consolePreferenceCacheTTL;
    }

    fetchConsolePreference(preferenceKey) {
        if (this.consolePreferenceCache.has(preferenceKey) && this.isConsolePreferenceCached(preferenceKey)) {
            return this.consolePreferenceCache.get(preferenceKey);
        }

        if (this.consolePreferenceFetchPromises.has(preferenceKey)) {
            return this.consolePreferenceFetchPromises.get(preferenceKey);
        }

        if (typeof window === 'undefined' || typeof window.getPreference !== 'function') {
            const cached = this.consolePreferenceCache.get(preferenceKey);
            return cached !== undefined ? cached : true;
        }

        // CRITICAL: Prevent infinite recursion - if getPreference is currently being called (during preferences loading),
        // don't call it again. Instead, return default value (true) to allow logging.
        // This prevents: getPreference() → Logger.info() → shouldLogToConsole() → fetchConsolePreference() → getPreference() → ...
        if (window.__GET_PREFERENCE_IN_PROGRESS__) {
            // During preferences loading, return default (true) to allow logging
            const defaultValue = true;
            this.cacheConsolePreference(preferenceKey, defaultValue);
            return Promise.resolve(defaultValue);
        }

        const promise = window.getPreference(preferenceKey)
            .then(value => {
                const boolValue = this.normalizeBoolean(value);
                const finalValue = boolValue !== undefined ? boolValue : false;
                this.cacheConsolePreference(preferenceKey, finalValue);
                return finalValue;
            })
            .catch(error => {
                if (Logger.DEBUG_MODE) {
                    console.warn(`LoggerService: failed to fetch preference "${preferenceKey}"`, error);
                }
                this.cacheConsolePreference(preferenceKey, true);
                return true;
            })
            .finally(() => {
                this.consolePreferenceFetchPromises.delete(preferenceKey);
            });

        this.consolePreferenceFetchPromises.set(preferenceKey, promise);
        return promise;
    }

    /**
     * אתחול מערכת הלוגים
     */
    async init() {
        try {
            this.info('📝 Initializing Logger Service...', { page: "logger-service" });
            
            // Load saved logs from localStorage
            this.loadPendingLogs();
            
            // Start batch processing
            this.startBatchProcessing();
            
            // Performance monitoring
            this.setupPerformanceMonitoring();
            
            // Apply user preferences for logging
            await this.applyLoggingPreferences();
            
            this.initialized = true;
            this.info('✅ Logger Service initialized successfully', { page: "logger-service" });
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Logger Service:', error);
            return false;
        }
    }

    /**
     * לוג ברמת DEBUG
     */
    debug(message, context = {}) {
        this.log(Logger.LogLevel.DEBUG, message, context);
    }

    /**
     * לוג ברמת INFO
     */
    info(message, context = {}) {
        this.log(Logger.LogLevel.INFO, message, context);
    }

    /**
     * לוג ברמת WARN
     */
    warn(message, context = {}) {
        this.log(Logger.LogLevel.WARN, message, context);
    }

    /**
     * לוג ברמת ERROR
     */
    error(message, context = {}) {
        this.log(Logger.LogLevel.ERROR, message, context);
    }

    /**
     * לוג ברמת CRITICAL
     */
    critical(message, context = {}) {
        this.log(Logger.LogLevel.CRITICAL, message, context);
    }

    /**
     * לוג ביצועים
     */
    performance(message, duration, context = {}) {
        this.log(Logger.LogLevel.INFO, `Performance: ${message}`, {
            ...context,
            duration: duration,
            type: 'performance'
        });
    }

    /**
     * לוג פעולת משתמש
     */
    userAction(action, context = {}) {
        this.log(Logger.LogLevel.INFO, `User Action: ${action}`, {
            ...context,
            type: 'user_action'
        });
    }

    /**
     * לוג קריאת API
     */
    apiCall(method, url, status, duration, context = {}) {
        this.log(Logger.LogLevel.INFO, `API Call: ${method} ${url}`, {
            ...context,
            method: method,
            url: url,
            status: status,
            duration: duration,
            type: 'api_call'
        });
    }

    /**
     * לוג פעולת מטמון
     */
    cacheOperation(operation, key, context = {}) {
        this.log(Logger.LogLevel.DEBUG, `Cache ${operation}: ${key}`, {
            ...context,
            operation: operation,
            key: key,
            type: 'cache_operation'
        });
    }

    /**
     * פונקציית הלוג הראשית עם הגנות
     */
    async log(level, message, context = {}) {
        // הגנה מפני recursive calls
        if (this.isLogging) {
            return;
        }

        if (level < this.currentLevel) {
            return;
        }

        // במצב DEBUG - מציגים כל הלוגים
        if (Logger.DEBUG_MODE) {
            // במצב DEBUG - מציגים הכל
        } else {
            // במצב ייצור - רק שגיאות קריטיות
            if (level < Logger.LogLevel.ERROR) {
                return;
            }
        }

        // הגבלת גודל context
        const contextString = JSON.stringify(context);
        if (contextString.length > this.maxContextSize) {
            context = {
                ...context,
                _truncated: true,
                _originalSize: contextString.length
            };
        }

        // מניעת לוגים כפולים (רק ל-ERROR ו-CRITICAL)
        if (level >= Logger.LogLevel.ERROR) {
            const logKey = `${level}-${message}-${JSON.stringify(context)}`;
            if (this.duplicateLogs.has(logKey)) {
                return; // לוג כפול - לא מטפלים
            }
            this.duplicateLogs.add(logKey);
            
            // ניקוי מערכת מניעת כפילויות כל 1000 לוגים
            if (this.duplicateLogs.size > 1000) {
                this.duplicateLogs.clear();
            }
        }

        this.isLogging = true;

        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                level: this.getLevelName(level),
                message: message,
                context: {
                    ...context,
                    page: window.location.pathname,
                    userAgent: navigator.userAgent,
                    sessionId: this.getSessionId(),
                    userId: this.getUserId()
                }
            };

            // Console output
            this.outputToConsole(level, message, context);

            // Send to server if batch is ready (queueForServer יוסיף ל-pendingLogs)
            this.queueForServer(logEntry);
        } finally {
            this.isLogging = false;
        }
    }

    /**
     * שליחה לשרת
     */
    queueForServer(logEntry) {
        this.pendingLogs.push(logEntry);

        // Save to localStorage
        this.savePendingLogs();

        // Send batch if full
        if (this.pendingLogs.length >= this.batchSize) {
            this.flushToServer();
        }

        // Set timeout for partial batch (longer delay to avoid 429)
        if (!this.flushTimeout) {
            this.flushTimeout = setTimeout(() => {
                this.flushToServer();
            }, this.batchTimeout * 2); // Double the timeout
        }
    }

    /**
     * שליחת לוגים בקבוצות קטנות יותר
     */
    async flushToServerGradually() {
        if (this.pendingLogs.length === 0) {
            return;
        }

        // Send in smaller batches to avoid 429 errors
        const smallBatchSize = 10;
        const batches = [];
        
        for (let i = 0; i < this.pendingLogs.length; i += smallBatchSize) {
            batches.push(this.pendingLogs.slice(i, i + smallBatchSize));
        }

        for (const batch of batches) {
            try {
                const response = await fetch('/api/logs/batch', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        logs: batch
                    })
                });

                if (!response.ok) {
                    if (response.status === 429) {
                        // Rate limited - wait before retrying
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                if (this.shouldEmitVerboseLogs()) {
                    console.log(`✅ Sent ${batch.length} logs to server`);
                }
                
                // Remove sent logs from pending
                this.pendingLogs = this.pendingLogs.filter(log => !batch.includes(log));
                
            } catch (error) {
                console.error('❌ Failed to send log batch:', error);
                // Wait before trying next batch
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Save remaining logs
        this.savePendingLogs();
    }

    /**
     * שליחת לוגים לשרת עם debouncing והגנות
     */
    async flushToServer() {
        // הגנה מפני קריאות מרובות
        if (this.isFlushing) {
            return;
        }

        if (this.pendingLogs.length === 0) {
            return;
        }

        // הגבלת מספר ניסיונות
        if (this.flushAttempts >= this.maxFlushAttempts) {
            console.warn('⚠️ Max flush attempts reached, clearing logs');
            this.pendingLogs = [];
            this.clearPendingLogs();
            return;
        }

        // הגבלה: שולחים לשרת רק במצב דיבג או שגיאות קריטיות
        const shouldSendToServer = Logger.DEBUG_MODE || 
            this.pendingLogs.some(log => log.level >= Logger.LogLevel.ERROR);
        
        if (!shouldSendToServer) {
            this.pendingLogs = []; // מנקים את הלוגים
            return;
        }

        this.isFlushing = true;
        this.flushAttempts++;

        const logsToSend = [...this.pendingLogs];
        this.pendingLogs = [];

        try {
            // Timeout לשליחה
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 שניות timeout

            const response = await fetch('/api/logs/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    logs: logsToSend
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 429) {
                    // Rate limited - put logs back and try later
                    this.pendingLogs.unshift(...logsToSend);
                    this.savePendingLogs();
                    console.warn('⚠️ Rate limited, will retry later');
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            if (this.shouldEmitVerboseLogs()) {
                console.log(`✅ Sent ${logsToSend.length} logs to server`);
            }
            
            // Clear localStorage after successful send
            this.clearPendingLogs();
            this.flushAttempts = 0; // איפוס מונה הניסיונות

        } catch (error) {
            // Don't throw - handle gracefully
            if (error.name === 'AbortError') {
                // Timeout - put logs back and retry later
                this.pendingLogs.unshift(...logsToSend);
                this.savePendingLogs();
                if (window.DEBUG_MODE) {
                    console.warn('⚠️ Logger flush timeout, will retry later');
                }
                this.isFlushing = false;
                return;
            }
            
            // Network error or server error - handle gracefully
            // Don't log to console.error as it creates noise - only in DEBUG mode
            if (window.DEBUG_MODE) {
                console.warn('⚠️ Logger server unavailable, using fallback:', error.message);
            }
            
            // Fallback: log to console only (don't throw, don't create errors)
            // Only log critical errors to console in non-DEBUG mode
            const criticalLogs = logsToSend.filter(log => log.level >= Logger.LogLevel.ERROR);
            if (criticalLogs.length > 0 && !window.DEBUG_MODE) {
                criticalLogs.forEach(log => {
                    const level = ['debug', 'info', 'warn', 'error', 'critical'][log.level] || 'error';
                    console[level] || console.error(log.message);
                });
            }
            
            // Put logs back in pending queue for retry
            this.pendingLogs.unshift(...logsToSend);
            this.savePendingLogs();
        } finally {
            this.isFlushing = false;
        }

        if (this.flushTimeout) {
            clearTimeout(this.flushTimeout);
            this.flushTimeout = null;
        }
    }

    /**
     * התחלת עיבוד batch - הוסר setInterval למניעת לופים אינסופיים
     */
    startBatchProcessing() {
        // setInterval הוסר - עיבוד batch מתבצע רק על ידי flushTimeout
        // זה מונע לופים אינסופיים ומשפר ביצועים
    }

    /**
     * ניטור ביצועים - רק במצב DEBUG
     */
    setupPerformanceMonitoring() {
        // ניטור רק במצב DEBUG
        if (!Logger.DEBUG_MODE) {
            return;
        }

        // Monitor long tasks (רק במצב DEBUG) - disabled to reduce console noise
        // if ('PerformanceObserver' in window) {
        //     const observer = new PerformanceObserver(list => {
        //         list.getEntries().forEach(entry => {
        //             if (entry.duration > this.longTaskThreshold) {
        //                 this.performance('Long task detected', entry.duration, {
        //                     name: entry.name,
        //                     startTime: entry.startTime
        //                 });
        //             }
        //         });
        //     });
        //
        //     try {
        //         observer.observe({ entryTypes: ['longtask'] });
        //     } catch (e) {
        //         // Long task API not supported
        //     }
        // }
    }

    /**
     * שמירת לוגים ב-localStorage - זמנית: תמיד שומרים
     */
    savePendingLogs() {
        // שמירה רק במצב DEBUG
        if (!Logger.DEBUG_MODE) {
            return;
        }

        try {
            // הגבלת מספר לוגים מקסימלי
            const maxLogs = 100;
            let logsToSave = [...this.pendingLogs];
            
            if (logsToSave.length > maxLogs) {
                // שומרים רק את הלוגים החדשים ביותר
                logsToSave = logsToSave.slice(-maxLogs);
            }

            localStorage.setItem('tiktrack_pending_logs', JSON.stringify(logsToSave));
        } catch (error) {
            console.warn('⚠️ Failed to save logs to localStorage:', error);
        }
    }

    /**
     * טעינת לוגים מ-localStorage - רק במצב DEBUG
     */
    loadPendingLogs() {
        // טעינה רק במצב DEBUG
        if (!Logger.DEBUG_MODE) {
            return;
        }

        try {
            const saved = localStorage.getItem('tiktrack_pending_logs');
            if (saved) {
                this.pendingLogs = JSON.parse(saved);
                if (this.shouldEmitVerboseLogs()) {
                    console.log(`📝 Loaded ${this.pendingLogs.length} pending logs from localStorage`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to load logs from localStorage:', error);
        }
    }

    /**
     * ניקוי לוגים מ-localStorage
     */
    clearPendingLogs() {
        try {
            localStorage.removeItem('tiktrack_pending_logs');
        } catch (error) {
            console.warn('⚠️ Failed to clear logs from localStorage:', error);
        }
    }

    /**
     * בדוק אם צריך לוג לקונסול לפי העדפות המשתמש
     */
    shouldLogToConsole(category) {
        if (Logger.DEBUG_MODE || this.verboseLoggingEnabled === true) {
            return true;
        }

        const preferenceKey = `console_logs_${category}_enabled`;

        if (this.consolePreferenceCache.has(preferenceKey) && this.isConsolePreferenceCached(preferenceKey)) {
            return this.consolePreferenceCache.get(preferenceKey);
        }

        const cachedValue = this.readPreferenceFromSources(preferenceKey);
        if (cachedValue !== undefined) {
            const boolValue = this.normalizeBoolean(cachedValue);
            const finalValue = boolValue !== undefined ? boolValue : false;
            this.cacheConsolePreference(preferenceKey, finalValue);
            return finalValue;
        }

        if (!this.preferencesApplied) {
            return true;
        }

        if (typeof window !== 'undefined' && typeof window.shouldLogToConsole === 'function') {
            try {
                const result = window.shouldLogToConsole(category);
                if (result && typeof result.then === 'function') {
                    return result.then(value => {
                        const boolValue = this.normalizeBoolean(value);
                        const finalValue = boolValue !== undefined ? boolValue : false;
                        this.cacheConsolePreference(preferenceKey, finalValue);
                        return finalValue;
                    }).catch(() => true);
                }
                const boolValue = this.normalizeBoolean(result);
                const finalValue = boolValue !== undefined ? boolValue : false;
                this.cacheConsolePreference(preferenceKey, finalValue);
                return finalValue;
            } catch (error) {
                if (Logger.DEBUG_MODE) {
                    console.warn('LoggerService: shouldLogToConsole fallback error', error);
                }
            }
        }

        return this.fetchConsolePreference(preferenceKey);
    }

    /**
     * פלט לקונסול בהתאם להעדפות
     */
    outputToConsole(level, message, context = {}) {
        const page = context?.page || 'system';
        const category = Logger.CATEGORY_MAPPING[page] || 'system';
        const decision = this.shouldLogToConsole(category);

        if (decision && typeof decision.then === 'function') {
            decision.then(shouldLog => {
                if (shouldLog) {
                    this.printToConsole(level, message, context);
                }
            }).catch(() => {
                this.printToConsole(level, message, context);
            });
        } else if (decision) {
            this.printToConsole(level, message, context);
        }
    }

    printToConsole(level, message, context) {
        const timestamp = new Date().toLocaleTimeString();
        const levelName = this.getLevelName(level);
        const logMessage = `[${timestamp}] ${levelName}: ${message}`;

        switch (level) {
            case Logger.LogLevel.DEBUG:
                console.debug(logMessage, context);
                break;
            case Logger.LogLevel.INFO:
                console.info(logMessage, context);
                break;
            case Logger.LogLevel.WARN:
                console.warn(logMessage, context);
                break;
            case Logger.LogLevel.ERROR:
                console.error(logMessage, context);
                break;
            case Logger.LogLevel.CRITICAL:
                console.error(`🚨 ${logMessage}`, context);
                break;
        }
    }

    /**
     * קבלת שם רמת הלוג
     */
    getLevelName(level) {
        const names = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
        return names[level] || 'UNKNOWN';
    }

    /**
     * קבלת session ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('tiktrack_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('tiktrack_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * קבלת user ID
     */
    getUserId() {
        return localStorage.getItem('tiktrack_user_id') || 'anonymous';
    }

    /**
     * קבלת סטטיסטיקות
     */
    getStats() {
        return {
            initialized: this.initialized,
            currentLevel: this.getLevelName(this.currentLevel),
            pendingLogs: this.pendingLogs.length,
            batchSize: this.batchSize,
            batchTimeout: this.batchTimeout
        };
    }

    /**
     * שינוי רמת הלוג
     */
    setLevel(level) {
        this.currentLevel = level;
        if (this.shouldEmitVerboseLogs()) {
            console.log(`📝 Logger level set to: ${this.getLevelName(level)}`);
        }
    }

    /**
     * ניקוי כל הלוגים
     */
    clear() {
        this.pendingLogs = [];
        this.clearPendingLogs();
        if (this.shouldEmitVerboseLogs()) {
            console.log('🧹 Logger cleared all logs');
        }
    }
}

// יצירת instance גלובלי
window.Logger = new Logger();

// ===== DETAILED LOG GENERATION FUNCTIONS =====
// These functions are used across multiple pages for detailed logging

/**
 * Generate detailed log for any page - Unified function
 * Creates comprehensive log data including performance, memory, and page-specific stats
 * 
 * @function generateDetailedLog
 * @param {string} pageName - Name of the page (alerts, trading_accounts, etc.)
 * @param {Object} pageSpecificStats - Page-specific statistics object
 * @returns {string} JSON string of log data
 */
function generateDetailedLog(pageName, pageSpecificStats = {}) {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            page: pageName,
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            performance: {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            },
            memory: window.performance.memory ? {
                used: window.performance.memory.usedJSHeapSize,
                total: window.performance.memory.totalJSHeapSize,
                limit: window.performance.memory.jsHeapSizeLimit
            } : null,
            pageStats: pageSpecificStats,
            sections: {
                topSection: {
                    visible: !document.getElementById('topSection')?.classList.contains('d-none'),
                    summaryStats: document.getElementById('summaryStats')?.textContent || 'לא נמצא'
                },
                section1: {
                    visible: !document.getElementById('section1')?.classList.contains('d-none'),
                    tableRows: document.querySelectorAll('table tbody tr').length,
                    tableData: document.querySelector('table')?.textContent?.substring(0, 300) || 'לא נמצא'
                }
            },
            tableData: {
                totalRows: document.querySelectorAll('table tbody tr').length,
                headers: Array.from(document.querySelectorAll('table thead th')).map(th => th.textContent?.trim()),
                sortableColumns: document.querySelectorAll('.sortable-header').length,
                hasData: document.querySelectorAll('table tbody tr').length > 0
            },
            filters: {
                allButton: document.querySelector('button[data-type="all"]') ? 'זמין' : 'לא זמין',
                activeFilter: document.querySelector('.btn.active')?.textContent || 'לא נמצא'
            },
            modals: {
                addModal: document.querySelector('[id*="add"][id*="Modal"]') ? 'זמין' : 'לא זמין',
                editModal: document.querySelector('[id*="edit"][id*="Modal"]') ? 'זמין' : 'לא זמין',
                deleteModal: document.querySelector('[id*="delete"][id*="Modal"]') ? 'זמין' : 'לא זמין'
            },
            functions: {
                showAddModal: typeof window[`showAdd${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Modal`] === 'function' ? 'זמין' : 'לא זמין',
                editFunction: typeof window[`edit${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`] === 'function' ? 'זמין' : 'לא זמין',
                deleteFunction: typeof window[`delete${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`] === 'function' ? 'זמין' : 'לא זמין'
                // toggleSection removed to break circular dependency with Logger
                // toggleSection checks are done directly in ui-utils.js without Logger dependency
            },
            errors: window.Logger ? window.Logger.getErrors() : [],
            warnings: window.Logger ? window.Logger.getWarnings() : []
        };

        return JSON.stringify(logData, null, 2);
    } catch (error) {
        console.error('Error generating detailed log:', error);
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            page: pageName,
            error: error.message,
            stack: error.stack
        }, null, 2);
    }
}

// הוספה למערכת האתחול המאוחדת
if (window.UnifiedInitializationSystem) {
    window.UnifiedInitializationSystem.addCoreSystem('Logger', () => {
        return window.Logger.init();
    });
}

if (Logger.DEBUG_MODE) {
    console.log('📝 Logger Service loaded');
}
