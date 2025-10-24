/**
 * Logger Service - TikTrack
 * שירות לוגים מתקדם עם אינטגרציה לשרת
 * 
 * תכונות:
 * - רמות לוג שונות (DEBUG, INFO, WARN, ERROR, CRITICAL)
 * - שליחה לשרת עם batching
 * - שמירה מקומית ב-localStorage
 * - ניטור ביצועים
 * - טיפול בשגיאות מתקדם
 * 
 * מחבר: TikTrack Development Team
 * תאריך יצירה: 24 אוקטובר 2025
 * גרסה: 2.0.0
 */

class Logger {
    static LogLevel = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        CRITICAL: 4
    };

    constructor() {
        this.initialized = false;
        this.currentLevel = Logger.LogLevel.INFO;
        this.pendingLogs = [];
        this.batchSize = 10;
        this.batchTimeout = 5000; // 5 seconds
        this.flushTimeout = null;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        // Performance monitoring
        this.performanceThreshold = 100; // ms
        this.longTaskThreshold = 50; // ms
        
        this.init();
    }

    /**
     * אתחול מערכת הלוגים
     */
    async init() {
        try {
            console.log('📝 Initializing Logger Service...');
            
            // Load saved logs from localStorage
            this.loadPendingLogs();
            
            // Start batch processing
            this.startBatchProcessing();
            
            // Performance monitoring
            this.setupPerformanceMonitoring();
            
            this.initialized = true;
            console.log('✅ Logger Service initialized successfully');
            
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
     * פונקציית הלוג הראשית
     */
    log(level, message, context = {}) {
        if (level < this.currentLevel) {
            return;
        }

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

        // Add to pending logs
        this.pendingLogs.push(logEntry);

        // Save to localStorage
        this.savePendingLogs();

        // Send to server if batch is ready
        this.queueForServer(logEntry);
    }

    /**
     * שליחה לשרת
     */
    async queueForServer(logEntry) {
        this.pendingLogs.push(logEntry);

        // Send batch if full
        if (this.pendingLogs.length >= this.batchSize) {
            await this.flushToServer();
        }

        // Set timeout for partial batch
        if (!this.flushTimeout) {
            this.flushTimeout = setTimeout(() => {
                this.flushToServer();
            }, this.batchTimeout);
        }
    }

    /**
     * שליחת לוגים לשרת
     */
    async flushToServer() {
        if (this.pendingLogs.length === 0) {
            return;
        }

        const logsToSend = [...this.pendingLogs];
        this.pendingLogs = [];

        try {
            const response = await fetch('/api/logs/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    logs: logsToSend
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`✅ Sent ${logsToSend.length} logs to server`);
            
            // Clear localStorage after successful send
            this.clearPendingLogs();

        } catch (error) {
            console.error('❌ Failed to send logs to server:', error);
            
            // Put logs back in pending queue
            this.pendingLogs.unshift(...logsToSend);
            this.savePendingLogs();
        }

        if (this.flushTimeout) {
            clearTimeout(this.flushTimeout);
            this.flushTimeout = null;
        }
    }

    /**
     * התחלת עיבוד batch
     */
    startBatchProcessing() {
        // Process pending logs every 30 seconds
        setInterval(() => {
            if (this.pendingLogs.length > 0) {
                this.flushToServer();
            }
        }, 30000);
    }

    /**
     * ניטור ביצועים
     */
    setupPerformanceMonitoring() {
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver(list => {
                list.getEntries().forEach(entry => {
                    if (entry.duration > this.longTaskThreshold) {
                        this.performance('Long task detected', entry.duration, {
                            name: entry.name,
                            startTime: entry.startTime
                        });
                    }
                });
            });

            try {
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task API not supported
            }
        }
    }

    /**
     * שמירת לוגים ב-localStorage
     */
    savePendingLogs() {
        try {
            localStorage.setItem('tiktrack_pending_logs', JSON.stringify(this.pendingLogs));
        } catch (error) {
            console.warn('⚠️ Failed to save logs to localStorage:', error);
        }
    }

    /**
     * טעינת לוגים מ-localStorage
     */
    loadPendingLogs() {
        try {
            const saved = localStorage.getItem('tiktrack_pending_logs');
            if (saved) {
                this.pendingLogs = JSON.parse(saved);
                console.log(`📝 Loaded ${this.pendingLogs.length} pending logs from localStorage`);
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
     * פלט לקונסול
     */
    outputToConsole(level, message, context) {
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
        console.log(`📝 Logger level set to: ${this.getLevelName(level)}`);
    }

    /**
     * ניקוי כל הלוגים
     */
    clear() {
        this.pendingLogs = [];
        this.clearPendingLogs();
        console.log('🧹 Logger cleared all logs');
    }
}

// יצירת instance גלובלי
window.Logger = new Logger();

// הוספה למערכת האתחול המאוחדת
if (window.UnifiedInitializationSystem) {
    window.UnifiedInitializationSystem.addCoreSystem('Logger', () => {
        return window.Logger.init();
    });
}

console.log('📝 Logger Service loaded');
