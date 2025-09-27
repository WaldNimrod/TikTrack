/**
 * ========================================
 * Cache Sync Manager - TikTrack
 * ========================================
 * 
 * מנהל סינכרון בין Frontend ו-Backend
 * 
 * תכונות:
 * - עדכון אוטומטי של Backend Cache
 * - invalidate cache לפי dependencies
 * - רטריט אוטומטי במקרה של כשל
 * - הודעות ברורות על סטטוס סינכרון
 * 
 * מחבר: TikTrack Development Team
 * תאריך יצירה: 26 בינואר 2025
 * גרסה: 1.0.0
 * ========================================
 */

class CacheSyncManager {
    constructor() {
        this.initialized = false;
        this.syncQueue = [];
        this.isProcessing = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 שנייה
        this.maxQueueSize = 100;
        
        // סטטיסטיקות סינכרון
        this.stats = {
            operations: {
                syncToBackend: 0,
                syncFromBackend: 0,
                invalidate: 0
            },
            success: {
                syncToBackend: 0,
                syncFromBackend: 0,
                invalidate: 0
            },
            failures: {
                syncToBackend: 0,
                syncFromBackend: 0,
                invalidate: 0
            },
            retries: 0,
            queueSize: 0
        };
        
        // Dependencies mapping
        this.dependencies = {
            'user-preferences': [],
            'accounts-data': ['user-preferences'],
            'trades-data': ['accounts-data'],
            'executions-data': ['accounts-data'],
            'tickers-data': ['accounts-data'],
            'alerts-data': ['accounts-data'],
            'market-data': ['tickers-data'],
            'dashboard-data': ['market-data', 'trades-data', 'executions-data']
        };
        
        // Cache invalidation patterns
        this.invalidationPatterns = {
            'account-created': ['accounts-data', 'trades-data', 'executions-data'],
            'account-updated': ['accounts-data', 'trades-data', 'executions-data'],
            'account-deleted': ['accounts-data', 'trades-data', 'executions-data'],
            'trade-created': ['trades-data', 'dashboard-data'],
            'trade-updated': ['trades-data', 'dashboard-data'],
            'trade-deleted': ['trades-data', 'dashboard-data'],
            'execution-created': ['executions-data', 'dashboard-data'],
            'execution-updated': ['executions-data', 'dashboard-data'],
            'execution-deleted': ['executions-data', 'dashboard-data'],
            'ticker-updated': ['tickers-data', 'market-data'],
            'alert-created': ['alerts-data'],
            'alert-updated': ['alerts-data'],
            'alert-deleted': ['alerts-data']
        };
    }

    /**
     * אתחול מערכת הסינכרון
     * @returns {Promise<boolean>} הצלחת האתחול
     */
    async initialize() {
        try {
            console.log('🔄 Initializing Cache Sync Manager...');
            
            // בדיקת חיבור לשרת
            const isConnected = await this.checkServerConnection();
            if (!isConnected) {
                console.warn('⚠️ Server not available, sync will be queued');
            }
            
            // התחלת עיבוד תור הסינכרון
            this.startQueueProcessing();
            
            this.initialized = true;
            console.log('✅ Cache Sync Manager initialized successfully');
            
            // הודעת הצלחה
            if (window.notificationSystem) {
                window.notificationSystem.showNotification(
                    'מערכת סינכרון מטמון אותחלה בהצלחה',
                    'success'
                );
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Cache Sync Manager:', error);
            
            // הודעת שגיאה
            if (window.notificationSystem) {
                window.notificationSystem.showNotification(
                    'שגיאה באתחול מערכת סינכרון מטמון',
                    'error'
                );
            }
            
            return false;
        }
    }

    /**
     * סינכרון נתונים לשרת
     * @param {string} key - מפתח הנתונים
     * @param {any} data - הנתונים לסינכרון
     * @param {Object} options - אפשרויות נוספות
     * @returns {Promise<boolean>} הצלחת הסינכרון
     */
    async syncToBackend(key, data, options = {}) {
        if (!this.initialized) {
            console.warn('⚠️ Cache Sync Manager not initialized');
            return false;
        }

        const startTime = performance.now();
        
        try {
            this.stats.operations.syncToBackend++;
            
            // הכנת נתוני סינכרון
            const syncData = {
                key,
                data,
                timestamp: Date.now(),
                dependencies: this.getDependencies(key),
                options
            };
            
            // ניסיון סינכרון ישיר
            let success = await this.performSyncToBackend(syncData);
            
            if (!success) {
                // הוספה לתור אם הסינכרון נכשל
                await this.addToQueue('syncToBackend', syncData);
                console.log(`⚠️ Sync failed, added ${key} to queue`);
            }
            
            const responseTime = performance.now() - startTime;
            
            if (success) {
                this.stats.success.syncToBackend++;
                console.log(`✅ Synced ${key} to backend (${responseTime.toFixed(2)}ms)`);
            } else {
                this.stats.failures.syncToBackend++;
                console.log(`❌ Failed to sync ${key} to backend (${responseTime.toFixed(2)}ms)`);
            }
            
            return success;
            
        } catch (error) {
            console.error(`❌ Error syncing ${key} to backend:`, error);
            this.stats.failures.syncToBackend++;
            return false;
        }
    }

    /**
     * סינכרון נתונים מהשרת
     * @param {string} key - מפתח הנתונים
     * @param {Object} options - אפשרויות נוספות
     * @returns {Promise<any>} הנתונים מהשרת
     */
    async syncFromBackend(key, options = {}) {
        if (!this.initialized) {
            console.warn('⚠️ Cache Sync Manager not initialized');
            return null;
        }

        const startTime = performance.now();
        
        try {
            this.stats.operations.syncFromBackend++;
            
            // ניסיון סינכרון ישיר
            let data = await this.performSyncFromBackend(key, options);
            
            if (data === null && options.retries !== false) {
                // הוספה לתור אם הסינכרון נכשל
                await this.addToQueue('syncFromBackend', { key, options });
                console.log(`⚠️ Sync failed, added ${key} to queue`);
            }
            
            const responseTime = performance.now() - startTime;
            
            if (data !== null) {
                this.stats.success.syncFromBackend++;
                console.log(`✅ Synced ${key} from backend (${responseTime.toFixed(2)}ms)`);
            } else {
                this.stats.failures.syncFromBackend++;
                console.log(`❌ Failed to sync ${key} from backend (${responseTime.toFixed(2)}ms)`);
            }
            
            return data;
            
        } catch (error) {
            console.error(`❌ Error syncing ${key} from backend:`, error);
            this.stats.failures.syncFromBackend++;
            return null;
        }
    }

    /**
     * ביטול מטמון שרת לפי dependencies
     * @param {Array<string>} dependencies - רשימת dependencies
     * @returns {Promise<boolean>} הצלחת הביטול
     */
    async invalidateBackend(dependencies = []) {
        if (!this.initialized) {
            console.warn('⚠️ Cache Sync Manager not initialized');
            return false;
        }

        const startTime = performance.now();
        
        try {
            this.stats.operations.invalidate++;
            
            // ביטול מטמון לפי dependencies
            let success = await this.performInvalidateBackend(dependencies);
            
            if (!success) {
                // הוספה לתור אם הביטול נכשל
                await this.addToQueue('invalidate', { dependencies });
                console.log(`⚠️ Invalidation failed, added to queue`);
            }
            
            const responseTime = performance.now() - startTime;
            
            if (success) {
                this.stats.success.invalidate++;
                console.log(`✅ Invalidated backend cache (${responseTime.toFixed(2)}ms)`);
            } else {
                this.stats.failures.invalidate++;
                console.log(`❌ Failed to invalidate backend cache (${responseTime.toFixed(2)}ms)`);
            }
            
            return success;
            
        } catch (error) {
            console.error('❌ Error invalidating backend cache:', error);
            this.stats.failures.invalidate++;
            return false;
        }
    }

    /**
     * ביטול מטמון לפי פעולה
     * @param {string} action - שם הפעולה
     * @returns {Promise<boolean>} הצלחת הביטול
     */
    async invalidateByAction(action) {
        const patterns = this.invalidationPatterns[action];
        if (!patterns) {
            console.warn(`⚠️ No invalidation patterns found for action: ${action}`);
            return false;
        }
        
        return await this.invalidateBackend(patterns);
    }

    /**
     * קבלת סטטוס סינכרון
     * @returns {Object} סטטוס סינכרון מפורט
     */
    getSyncStatus() {
        return {
            initialized: this.initialized,
            isProcessing: this.isProcessing,
            queueSize: this.syncQueue.length,
            stats: {
                ...this.stats,
                successRate: {
                    syncToBackend: this.stats.operations.syncToBackend > 0 ? 
                        (this.stats.success.syncToBackend / this.stats.operations.syncToBackend * 100).toFixed(2) + '%' : '0%',
                    syncFromBackend: this.stats.operations.syncFromBackend > 0 ? 
                        (this.stats.success.syncFromBackend / this.stats.operations.syncFromBackend * 100).toFixed(2) + '%' : '0%',
                    invalidate: this.stats.operations.invalidate > 0 ? 
                        (this.stats.success.invalidate / this.stats.operations.invalidate * 100).toFixed(2) + '%' : '0%'
                }
            },
            dependencies: Object.keys(this.dependencies),
            invalidationPatterns: Object.keys(this.invalidationPatterns)
        };
    }

    /**
     * ביצוע סינכרון לשרת
     * @param {Object} syncData - נתוני סינכרון
     * @returns {Promise<boolean>} הצלחת הסינכרון
     */
    async performSyncToBackend(syncData) {
        try {
            const response = await fetch('/api/cache/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(syncData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result.success === true;
            
        } catch (error) {
            console.error('❌ Backend sync failed:', error);
            return false;
        }
    }

    /**
     * ביצוע סינכרון מהשרת
     * @param {string} key - מפתח הנתונים
     * @param {Object} options - אפשרויות נוספות
     * @returns {Promise<any>} הנתונים מהשרת
     */
    async performSyncFromBackend(key, options) {
        try {
            const response = await fetch(`/api/cache/${key}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result.success ? result.data : null;
            
        } catch (error) {
            console.error('❌ Backend sync failed:', error);
            return null;
        }
    }

    /**
     * ביצוע ביטול מטמון שרת
     * @param {Array<string>} dependencies - רשימת dependencies
     * @returns {Promise<boolean>} הצלחת הביטול
     */
    async performInvalidateBackend(dependencies) {
        try {
            const response = await fetch('/api/cache/invalidate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dependencies })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result.success === true;
            
        } catch (error) {
            console.error('❌ Backend invalidation failed:', error);
            return false;
        }
    }

    /**
     * הוספה לתור סינכרון
     * @param {string} type - סוג הפעולה
     * @param {Object} data - נתוני הפעולה
     */
    async addToQueue(type, data) {
        // בדיקת גודל תור
        if (this.syncQueue.length >= this.maxQueueSize) {
            console.warn('⚠️ Sync queue is full, removing oldest item');
            this.syncQueue.shift();
        }
        
        const queueItem = {
            type,
            data,
            timestamp: Date.now(),
            attempts: 0
        };
        
        this.syncQueue.push(queueItem);
        this.stats.queueSize = this.syncQueue.length;
        
        console.log(`📋 Added ${type} to sync queue (${this.syncQueue.length} items)`);
    }

    /**
     * התחלת עיבוד תור הסינכרון
     */
    startQueueProcessing() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.processQueue();
    }

    /**
     * עיבוד תור הסינכרון
     */
    async processQueue() {
        while (this.isProcessing && this.syncQueue.length > 0) {
            const item = this.syncQueue[0];
            let success = false;
            
            try {
                switch (item.type) {
                    case 'syncToBackend':
                        success = await this.performSyncToBackend(item.data);
                        break;
                    case 'syncFromBackend':
                        const data = await this.performSyncFromBackend(item.data.key, item.data.options);
                        success = data !== null;
                        break;
                    case 'invalidate':
                        success = await this.performInvalidateBackend(item.data.dependencies);
                        break;
                }
                
                if (success) {
                    this.syncQueue.shift();
                    console.log(`✅ Processed queued ${item.type}`);
                } else {
                    item.attempts++;
                    if (item.attempts >= this.retryAttempts) {
                        this.syncQueue.shift();
                        this.stats.retries++;
                        console.log(`❌ Failed to process queued ${item.type} after ${this.retryAttempts} attempts`);
                    } else {
                        console.log(`⚠️ Retrying queued ${item.type} (attempt ${item.attempts + 1})`);
                        await this.delay(this.retryDelay * item.attempts);
                    }
                }
                
            } catch (error) {
                console.error(`❌ Error processing queue item:`, error);
                item.attempts++;
                if (item.attempts >= this.retryAttempts) {
                    this.syncQueue.shift();
                }
            }
            
            this.stats.queueSize = this.syncQueue.length;
        }
        
        // המשך עיבוד אם יש פריטים נוספים
        if (this.syncQueue.length > 0) {
            setTimeout(() => this.processQueue(), 1000);
        } else {
            this.isProcessing = false;
        }
    }

    /**
     * עצירת עיבוד תור הסינכרון
     */
    stopQueueProcessing() {
        this.isProcessing = false;
    }

    /**
     * ניקוי תור הסינכרון
     */
    clearQueue() {
        this.syncQueue = [];
        this.stats.queueSize = 0;
        console.log('🧹 Sync queue cleared');
    }

    /**
     * בדיקת חיבור לשרת
     * @returns {Promise<boolean>} האם השרת זמין
     */
    async checkServerConnection() {
        try {
            const response = await fetch('/api/health', {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * קבלת dependencies למפתח
     * @param {string} key - מפתח הנתונים
     * @returns {Array<string>} רשימת dependencies
     */
    getDependencies(key) {
        return this.dependencies[key] || [];
    }

    /**
     * הוספת dependency
     * @param {string} key - מפתח הנתונים
     * @param {string} dependency - dependency להוספה
     */
    addDependency(key, dependency) {
        if (!this.dependencies[key]) {
            this.dependencies[key] = [];
        }
        
        if (!this.dependencies[key].includes(dependency)) {
            this.dependencies[key].push(dependency);
        }
    }

    /**
     * הסרת dependency
     * @param {string} key - מפתח הנתונים
     * @param {string} dependency - dependency להסרה
     */
    removeDependency(key, dependency) {
        if (this.dependencies[key]) {
            const index = this.dependencies[key].indexOf(dependency);
            if (index > -1) {
                this.dependencies[key].splice(index, 1);
            }
        }
    }

    /**
     * הוספת תבנית ביטול מטמון
     * @param {string} action - שם הפעולה
     * @param {Array<string>} patterns - תבניות ביטול
     */
    addInvalidationPattern(action, patterns) {
        this.invalidationPatterns[action] = patterns;
    }

    /**
     * הסרת תבנית ביטול מטמון
     * @param {string} action - שם הפעולה
     */
    removeInvalidationPattern(action) {
        delete this.invalidationPatterns[action];
    }

    /**
     * השהייה
     * @param {number} ms - זמן השהייה במילישניות
     * @returns {Promise} Promise שמתממש אחרי ההשהייה
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            initialized: this.initialized,
            ...this.stats,
            isProcessing: this.isProcessing,
            queueSize: this.syncQueue.length
        };
    }

    /**
     * Initialize the Cache Sync Manager
     */
    async initialize() {
        if (this.initialized) {
            console.log('✅ CacheSyncManager already initialized');
            return;
        }

        try {
            console.log('🔄 Initializing CacheSyncManager...');
            
            // Initialize sync queue
            this.syncQueue = [];
            this.isProcessing = false;
            
            // Start processing queue
            this.startQueueProcessor();
            
            this.initialized = true;
            console.log('✅ CacheSyncManager initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize CacheSyncManager:', error);
            throw error;
        }
    }

    /**
     * Start processing sync queue
     */
    startQueueProcessor() {
        setInterval(() => {
            if (this.syncQueue.length > 0 && !this.isProcessing) {
                this.processQueue();
            }
        }, 1000); // Check every second
    }
}

// יצירת instance גלובלי
window.CacheSyncManager = new CacheSyncManager();

// הוספה למערכת האתחול המאוחדת
if (window.UnifiedInitializationSystem) {
    window.UnifiedInitializationSystem.addCoreSystem('CacheSyncManager', () => {
        return window.CacheSyncManager.initialize();
    });
}

console.log('🔄 Cache Sync Manager loaded');
