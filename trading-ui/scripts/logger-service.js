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
        'notification-system': 'notifications',
        'cache': 'cache',
        'preferences': 'system',
        'ui-utils': 'ui_components',
        'color-scheme': 'ui_components',
        'monitoring': 'system',
        'init-check': 'initialization',
        'cache-sync': 'cache',
        'entity-details': 'system',
        'trades': 'business',
        'executions': 'business',
        'alerts': 'business',
        'accounts': 'business',
        'tickers': 'business',
        'trade-plans': 'business',
        'cash-flows': 'business',
        'notes': 'business'
    };

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

                console.log(`✅ Sent ${batch.length} logs to server`);
                
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
            console.log(`✅ Sent ${logsToSend.length} logs to server`);
            
            // Clear localStorage after successful send
            this.clearPendingLogs();
            this.flushAttempts = 0; // איפוס מונה הניסיונות

        } catch (error) {
            console.error('❌ Failed to send logs to server:', error);
            
            // Put logs back in pending queue
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

        // Monitor long tasks (רק במצב DEBUG)
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
                console.warn(`⚠️ Logs truncated to ${maxLogs} entries`);
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
     * בדוק אם צריך לוג לקונסול - זמנית: רק שגיאות
     */
    shouldLogToConsole(category) {
        // במצב DEBUG - מציגים לוגים
        if (Logger.DEBUG_MODE) {
            return true;
        }
        
        // במצב ייצור - רק שגיאות
        return false;
    }

    /**
     * פלט לקונסול - פישוט
     */
    outputToConsole(level, message, context) {
        // Extract category from context.page
        const page = context?.page || 'system';
        const category = Logger.CATEGORY_MAPPING[page] || 'system';
        
        // בדיקה פשוטה אם צריך להדפיס לוג
        if (!this.shouldLogToConsole(category)) {
            return;
        }
        
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

console.log('📝 Logger Service loaded');
