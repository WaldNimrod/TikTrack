/**
 * Authentication Debug Monitor
 * מערכת ניטור מפורטת לבעיות authentication
 * 
 * תכונות:
 * - לוגים מתמידים ב-localStorage (לא נמחקים בריענון)
 * - ניטור כל פעולות המטמון
 * - בדיקת מפתחות מדויקים
 * - breakpoints ו-debugging helpers
 * 
 * @version 1.0.0
 * @created December 2025
 */

// ===== FUNCTION INDEX =====
// === Event Handlers ===
// - AuthDebugMonitor.loadErrors() - Loaderrors
// - AuthDebugMonitor.saveError() - Saveerror
// - AuthDebugMonitor.clearErrors() - Clearerrors
// - AuthDebugMonitor.getAllErrors() - Getallerrors
// - AuthDebugMonitor.loadLogs() - Loadlogs
// - AuthDebugMonitor.saveLogs() - Savelogs
// - AuthDebugMonitor.log() - Log
// - AuthDebugMonitor.getCurrentUserId() - Getcurrentuserid
// - AuthDebugMonitor.interceptAuthFunctions() - Interceptauthfunctions
// - AuthDebugMonitor.getAllLogs() - Getalllogs
// - AuthDebugMonitor.clearLogs() - Clearlogs
// - AuthDebugMonitor.exportLogs() - Exportlogs
// - console.error() - Error
// - request.onsuccess() - Onsuccess
// - getRequest.onsuccess() - Onsuccess
// - getRequest.onerror() - Onerror
// - transaction.onerror() - Onerror
// - request.onupgradeneeded() - Onupgradeneeded

// === Initialization ===
// - AuthDebugMonitor.setupGlobalErrorHandling() - Setupglobalerrorhandling
// - AuthDebugMonitor.setupCacheMonitoring() - Setupcachemonitoring
// - AuthDebugMonitor.setupInterceptors() - Setupinterceptors

(function() {
  'use strict';

  const DEBUG_STORAGE_KEY = 'tiktrack_auth_debug_logs';
  const MAX_LOGS = 500;

  class AuthDebugMonitor {
    constructor() {
      this.logs = [];
      this.errors = []; // שגיאות שנאספו לפני ריענון
      this.errorStorageKey = 'tiktrack_auth_errors';
      this.loadLogs();
      this.loadErrors();
      this.setupInterceptors();
      this.setupCacheMonitoring();
      this.setupGlobalErrorHandling();
    }
    
    /**
     * טעינת שגיאות מ-localStorage
     */
    loadErrors() {
      try {
        const saved = localStorage.getItem(this.errorStorageKey);
        if (saved) {
          this.errors = JSON.parse(saved);
          if (this.errors.length > 0 && window.DEBUG_AUTH_MONITOR === true) {
            console.warn(`⚠️ [Auth Debug] Found ${this.errors.length} errors from previous session`);
            this.errors.forEach((error, index) => {
              console.error(`❌ Error ${index + 1}:`, error);
            });
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to load auth errors:', error);
      }
    }
    
    /**
     * שמירת שגיאה
     */
    saveError(error, context = {}) {
      const errorEntry = {
        timestamp: new Date().toISOString(),
        message: error.message || String(error),
        stack: error.stack || new Error().stack,
        name: error.name,
        context: {
          ...context,
          url: window.location.href,
          userAgent: navigator.userAgent.substring(0, 100)
        }
      };
      
      this.errors.push(errorEntry);
      
      // הגבלת מספר שגיאות
      if (this.errors.length > 100) {
        this.errors = this.errors.slice(-100);
      }
      
      try {
        localStorage.setItem(this.errorStorageKey, JSON.stringify(this.errors));
      } catch (e) {
        console.warn('⚠️ Failed to save error to localStorage:', e);
      }
      
      // גם ללוגים
      this.log('error', `❌ Error captured: ${errorEntry.message}`, errorEntry);
    }
    
    /**
     * ניקוי שגיאות
     */
    clearErrors() {
      this.errors = [];
      localStorage.removeItem(this.errorStorageKey);
      this.log('info', '✅ Errors cleared');
    }
    
    /**
     * קבלת כל השגיאות
     */
    getAllErrors() {
      return this.errors;
    }
    
    /**
     * הגדרת global error handlers
     */
    setupGlobalErrorHandling() {
      // Capture unhandled errors
      window.addEventListener('error', (event) => {
        this.saveError(event.error || new Error(event.message), {
          type: 'unhandled_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });
      
      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.saveError(event.reason, {
          type: 'unhandled_promise_rejection'
        });
      });
      
      // Intercept console.error
      const originalConsoleError = console.error;
      console.error = (...args) => {
        try {
          const error = args.find(arg => arg instanceof Error) || new Error(args.join(' '));
          this.saveError(error, {
            type: 'console_error',
            args: args.map(arg => String(arg))
          });
        } catch (e) {
          // swallow to avoid breaking app on monitor failure
        }
        try {
          originalConsoleError.apply(console, args);
        } catch (_) {}
      };
      
      this.log('info', '✅ Global error handling setup complete');
    }

    /**
     * טעינת לוגים מ-localStorage
     */
    loadLogs() {
      try {
        const saved = localStorage.getItem(DEBUG_STORAGE_KEY);
        if (saved) {
          this.logs = JSON.parse(saved);
          console.log(`🔍 [Auth Debug] Loaded ${this.logs.length} debug logs from localStorage`);
        }
      } catch (error) {
        console.warn('⚠️ Failed to load auth debug logs:', error);
      }
    }

    /**
     * שמירת לוגים ל-localStorage
     */
    saveLogs() {
      try {
        // הגבלת מספר לוגים
        if (this.logs.length > MAX_LOGS) {
          this.logs = this.logs.slice(-MAX_LOGS);
        }
        localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(this.logs));
      } catch (error) {
        // Silent fail - don't log to console to avoid performance issues
        // Only log if explicitly debugging
        if (window.DEBUG_AUTH_MONITOR) {
          console.warn('⚠️ Failed to save auth debug logs:', error);
        }
      }
    }

    /**
     * הוספת לוג
     */
    log(level, message, data = {}) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data: {
          ...data,
          url: window.location.href,
          userAgent: navigator.userAgent.substring(0, 100)
        },
        stack: new Error().stack
      };

      this.logs.push(logEntry);
      this.saveLogs();

      // גם ל-Logger Service אם זמין (רק במצב DEBUG כדי לא לזהם קונסול)
      if (window.DEBUG_AUTH_MONITOR && window.Logger) {
        const loggerMethod = window.Logger[level] || window.Logger.info;
        loggerMethod.call(window.Logger, `[Auth Debug] ${message}`, { ...data, debug: true });
      }

      // Console output (silent unless DEBUG flag)
      if (window.DEBUG_AUTH_MONITOR) {
        const consoleMethod = console[level] || console.log;
        consoleMethod(`🔍 [Auth Debug ${level.toUpperCase()}] ${message}`, data);
      }
    }

    /**
     * בדיקת מפתחות במטמון
     */
    async checkCacheKeys() {
      const keys = ['currentUser', 'authToken'];
      const results = {};

      if (!window.UnifiedCacheManager) {
        this.log('error', 'UnifiedCacheManager not available for cache check');
        return results;
      }

      for (const key of keys) {
        try {
          // בדיקה עם user_id prefix
          const userId = this.getCurrentUserId();
          const prefixedKey = userId ? `u${userId}:${key}` : key;
          
          // בדיקה בכל השכבות
          const memoryLayer = window.UnifiedCacheManager.layers?.memory;
          const localStorageLayer = window.UnifiedCacheManager.layers?.localStorage;
          const indexedDBLayer = window.UnifiedCacheManager.layers?.indexedDB;

          const memoryValue = memoryLayer?.cache?.get?.(prefixedKey) || memoryLayer?.cache?.get?.(key);
          const localStorageValue = localStorage.getItem(`tiktrack_${prefixedKey}`) || localStorage.getItem(`tiktrack_${key}`);
          const indexedDBValue = await this.checkIndexedDB(prefixedKey) || await this.checkIndexedDB(key);

          results[key] = {
            originalKey: key,
            prefixedKey: prefixedKey,
            userId: userId,
            memory: memoryValue ? 'exists' : 'not found',
            localStorage: localStorageValue ? 'exists' : 'not found',
            indexedDB: indexedDBValue ? 'exists' : 'not found',
            memoryValue: memoryValue ? (typeof memoryValue === 'object' ? Object.keys(memoryValue) : 'value') : null,
            localStorageValue: localStorageValue ? (localStorageValue.length > 100 ? 'too long' : localStorageValue.substring(0, 50)) : null
          };

          this.log('info', `Cache key check: ${key}`, results[key]);
        } catch (error) {
          this.log('error', `Error checking cache key ${key}`, { error: error.message });
        }
      }

      return results;
    }

    /**
     * בדיקת IndexedDB
     */
    async checkIndexedDB(key) {
      try {
        if (!window.indexedDB) return null;
        
        // Use the same database name as UnifiedCacheManager
        const dbName = 'UnifiedCacheDB';
        const request = window.indexedDB.open(dbName);
        
        return new Promise((resolve) => {
          request.onsuccess = () => {
            try {
              const db = request.result;
              
              // Check if object store exists
              if (!db.objectStoreNames.contains('unified-cache')) {
                db.close();
                resolve(null);
                return;
              }
              
              const transaction = db.transaction(['unified-cache'], 'readonly');
              const store = transaction.objectStore('unified-cache');
              const getRequest = store.get(key);
              
              getRequest.onsuccess = () => {
                resolve(getRequest.result ? getRequest.result.data : null);
              };
              
              getRequest.onerror = () => {
                resolve(null);
              };
              
              transaction.onerror = () => {
                resolve(null);
              };
            } catch (error) {
              this.log('error', 'Error checking IndexedDB', { error: error.message });
              resolve(null);
            }
          };
          
          request.onerror = () => resolve(null);
          request.onupgradeneeded = () => {
            // Database doesn't exist or needs upgrade - no data yet
            resolve(null);
          };
        });
      } catch (error) {
        this.log('error', 'Exception in checkIndexedDB', { error: error.message });
        return null;
      }
    }

    /**
     * קבלת user_id נוכחי
     */
    getCurrentUserId() {
      try {
        // ניסיון לקבל מ-window.TikTrackAuth
        if (window.TikTrackAuth?.getCurrentUser) {
          const user = window.TikTrackAuth.getCurrentUser();
          if (user?.id) return user.id;
        }
        
        // ניסיון לקבל מ-memory variable
        if (window.currentUser?.id) return window.currentUser.id;
        
        // ניסיון לקבל מ-UnifiedCacheManager (ללא prefix)
        // זה יכול ליצור לולאה, אז נעשה זאת בזהירות
        return null;
      } catch (error) {
        return null;
      }
    }

    /**
     * הגדרת interceptors ל-UnifiedCacheManager
     */
    setupCacheMonitoring() {
      if (!window.UnifiedCacheManager) {
        // נמתין ל-UnifiedCacheManager
        setTimeout(() => this.setupCacheMonitoring(), 1000);
        return;
      }

      // שמירת הפונקציות המקוריות
      const originalSave = window.UnifiedCacheManager.save.bind(window.UnifiedCacheManager);
      const originalGet = window.UnifiedCacheManager.get.bind(window.UnifiedCacheManager);
      const originalRemove = window.UnifiedCacheManager.remove.bind(window.UnifiedCacheManager);
      const originalBuildUserCacheKey = window.UnifiedCacheManager.buildUserCacheKey?.bind(window.UnifiedCacheManager);

      // Intercept save
      window.UnifiedCacheManager.save = async (key, data, options = {}) => {
        const userId = this.getCurrentUserId();
        const originalKey = key;
        // Calculate prefixedKey only if includeUserId is not false
        const prefixedKey = (options.includeUserId !== false && originalBuildUserCacheKey) 
          ? originalBuildUserCacheKey(key, options.userId) 
          : key;
        
        this.log('info', 'Cache SAVE operation', {
          originalKey,
          prefixedKey,
          userId,
          optionsUserId: options.userId,
          includeUserId: options.includeUserId !== false,
          dataType: typeof data,
          dataKeys: data && typeof data === 'object' ? Object.keys(data) : null,
          stack: new Error().stack.split('\n').slice(1, 4).join('\n')
        });

        // BREAKPOINT: אפשר להוסיף debugger כאן
        // debugger;

        const result = await originalSave(key, data, options);
        
        // בדיקה שהנתונים אכן נשמרו
        setTimeout(async () => {
          const checkResult = await originalGet(key, { ...options, includeUserId: false });
          this.log('info', 'Cache SAVE verification', {
            originalKey,
            prefixedKey,
            saved: checkResult !== null,
            resultType: checkResult ? typeof checkResult : null
          });
        }, 100);

        return result;
      };

      // Intercept get
      window.UnifiedCacheManager.get = async (key, options = {}) => {
        const userId = this.getCurrentUserId();
        const originalKey = key;
        // Calculate prefixedKey only if includeUserId is not false
        const prefixedKey = (options.includeUserId !== false && originalBuildUserCacheKey) 
          ? originalBuildUserCacheKey(key, options.userId) 
          : key;
        
        this.log('info', 'Cache GET operation', {
          originalKey,
          prefixedKey,
          userId,
          optionsUserId: options.userId,
          includeUserId: options.includeUserId !== false
        });

        // BREAKPOINT: אפשר להוסיף debugger כאן
        // debugger;

        const result = await originalGet(key, options);
        
        this.log('info', 'Cache GET result', {
          originalKey,
          prefixedKey,
          found: result !== null,
          resultType: result ? typeof result : null,
          resultKeys: result && typeof result === 'object' ? Object.keys(result) : null
        });

        return result;
      };

      // Intercept remove
      window.UnifiedCacheManager.remove = async (key, options = {}) => {
        const userId = this.getCurrentUserId();
        const originalKey = key;
        // Calculate prefixedKey only if includeUserId is not false
        const prefixedKey = (options.includeUserId !== false && originalBuildUserCacheKey) 
          ? originalBuildUserCacheKey(key, options.userId) 
          : key;
        
        this.log('warn', 'Cache REMOVE operation', {
          originalKey,
          prefixedKey,
          userId,
          optionsUserId: options.userId,
          includeUserId: options.includeUserId !== false,
          stack: new Error().stack.split('\n').slice(1, 4).join('\n')
        });

        // BREAKPOINT: אפשר להוסיף debugger כאן
        // debugger;

        return await originalRemove(key, options);
      };

      this.log('info', 'Cache monitoring interceptors installed');
    }

    /**
     * הגדרת interceptors ל-auth functions
     */
    setupInterceptors() {
      // נמתין ל-auth.js
      const checkAuth = setInterval(() => {
        if (window.TikTrackAuth) {
          clearInterval(checkAuth);
          this.interceptAuthFunctions();
        }
      }, 100);

      // timeout אחרי 10 שניות
      setTimeout(() => {
        clearInterval(checkAuth);
        if (!window.TikTrackAuth) {
          this.log('error', 'TikTrackAuth not found after 10 seconds');
        }
      }, 10000);
    }

    /**
     * Intercept auth functions
     */
    interceptAuthFunctions() {
      // Intercept login
      if (window.TikTrackAuth.login) {
        const originalLogin = window.TikTrackAuth.login.bind(window.TikTrackAuth);
        window.TikTrackAuth.login = async (username, password) => {
          this.log('info', 'LOGIN attempt', { username, timestamp: new Date().toISOString() });
          
          // BREAKPOINT
          // debugger;

          try {
            const result = await originalLogin(username, password);
            
            this.log('info', 'LOGIN success', {
              username,
              userId: result?.data?.user?.id,
              hasUser: !!result?.data?.user
            });

            // בדיקת מטמון אחרי כניסה
            setTimeout(async () => {
              const cacheCheck = await this.checkCacheKeys();
              this.log('info', 'Cache state after login', cacheCheck);
            }, 500);

            return result;
          } catch (error) {
            this.log('error', 'LOGIN failed', {
              username,
              error: error.message,
              stack: error.stack
            });
            throw error;
          }
        };
      }

      // Intercept checkAuthentication
      if (window.TikTrackAuth.checkAuthentication) {
        const originalCheck = window.TikTrackAuth.checkAuthentication.bind(window.TikTrackAuth);
        window.TikTrackAuth.checkAuthentication = async (onAuthenticated, onNotAuthenticated) => {
          this.log('info', 'CHECK_AUTHENTICATION called', {
            timestamp: new Date().toISOString()
          });

          // BREAKPOINT
          // debugger;

          // בדיקת מטמון לפני
          const cacheBefore = await this.checkCacheKeys();
          this.log('info', 'Cache state before checkAuthentication', cacheBefore);

          try {
            const result = await originalCheck(onAuthenticated, onNotAuthenticated);
            
            // בדיקת מטמון אחרי
            setTimeout(async () => {
              const cacheAfter = await this.checkCacheKeys();
              this.log('info', 'Cache state after checkAuthentication', cacheAfter);
            }, 500);

            return result;
          } catch (error) {
            this.log('error', 'CHECK_AUTHENTICATION error', {
              error: error.message,
              stack: error.stack
            });
            throw error;
          }
        };
      }

      this.log('info', 'Auth function interceptors installed');
    }

    /**
     * קבלת כל הלוגים
     */
    getAllLogs() {
      return this.logs;
    }

    /**
     * ניקוי לוגים
     */
    clearLogs() {
      this.logs = [];
      this.saveLogs();
      this.log('info', 'Debug logs cleared');
    }

    /**
     * יצוא לוגים ל-JSON
     */
    exportLogs() {
      return JSON.stringify(this.logs, null, 2);
    }

    /**
     * בדיקת מצב נוכחי
     */
    async getCurrentState() {
      const state = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        user: {
          fromTikTrackAuth: window.TikTrackAuth?.getCurrentUser?.(),
          fromWindow: window.currentUser,
          fromCache: await window.UnifiedCacheManager?.get?.('currentUser', { includeUserId: false })
        },
        cache: await this.checkCacheKeys(),
        unifiedCacheManager: {
          initialized: window.UnifiedCacheManager?.initialized,
          stats: window.UnifiedCacheManager?.stats
        },
        authGuard: {
          exists: typeof window.AuthGuard !== 'undefined'
        }
      };

      this.log('info', 'Current state snapshot', state);
      return state;
    }
  }

  // יצירת instance גלובלי
  window.AuthDebugMonitor = new AuthDebugMonitor();

  // Helper functions ל-console
  window.debugAuth = {
    logs: () => window.AuthDebugMonitor.getAllLogs(),
    clear: () => window.AuthDebugMonitor.clearLogs(),
    export: () => window.AuthDebugMonitor.exportLogs(),
    state: () => window.AuthDebugMonitor.getCurrentState(),
    cache: () => window.AuthDebugMonitor.checkCacheKeys(),
    errors: () => window.AuthDebugMonitor.getAllErrors(),
    clearErrors: () => window.AuthDebugMonitor.clearErrors()
  };

  if (window.DEBUG_AUTH_MONITOR) {
    console.log('✅ Auth Debug Monitor initialized');
    console.log('💡 Use window.debugAuth.logs() to view all logs');
    console.log('💡 Use window.debugAuth.state() to get current state');
    console.log('💡 Use window.debugAuth.cache() to check cache keys');
    console.log('💡 Use window.debugAuth.errors() to view all errors (survives page reload)');
    console.log('💡 Use window.debugAuth.clearErrors() to clear error log');
  }
  
  // Check for errors from previous session (after initialization)
  setTimeout(() => {
    try {
      const previousErrors = window.AuthDebugMonitor?.getAllErrors?.() || [];
      if (previousErrors.length > 0) {
        if (window.DEBUG_AUTH_MONITOR) {
          console.warn(`⚠️ [Auth Debug] Found ${previousErrors.length} errors from previous session:`);
          previousErrors.forEach((error, index) => {
            console.error(`❌ Error ${index + 1} (${error.timestamp}):`, error.message, error.context);
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to check previous errors:', error);
    }
  }, 100);

})();

