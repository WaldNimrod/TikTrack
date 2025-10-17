/**
 * ========================================
 * Cache Policy Manager - TikTrack
 * ========================================
 * 
 * מנהל מדיניות מטמון אחידה עם קריטריונים ברורים לכל סוג נתונים
 * 
 * תכונות:
 * - קריטריונים ברורים לכל סוג נתונים
 * - validation אוטומטי של נתונים
 * - אופטימיזציה אוטומטית
 * - monitoring ו-alerts
 * 
 * מחבר: TikTrack Development Team
 * תאריך יצירה: 26 בינואר 2025
 * גרסה: 1.0.0
 * ========================================
 */

class CachePolicyManager {
    constructor() {
        this.initialized = false;
        this.policies = new Map();
        this.validators = new Map();
        this.optimizers = new Map();
        this.alerts = [];
        
        // מדיניות ברירת מחדל
        this.defaultPolicies = {
            // נתונים זמניים - Frontend Memory
            'page-data': {
                layer: 'memory',
                maxSize: 100 * 1024, // 100KB
                ttl: null, // עד רענון דף
                compress: false,
                validate: true,
                optimize: false,
                syncToBackend: false,
                description: 'נתוני עמוד זמניים'
            },
            'ui-state': {
                layer: 'memory',
                maxSize: 50 * 1024, // 50KB
                ttl: null,
                compress: false,
                validate: true,
                optimize: false,
                syncToBackend: false,
                description: 'מצב UI זמני'
            },
            'form-data': {
                layer: 'memory',
                maxSize: 25 * 1024, // 25KB
                ttl: null,
                compress: false,
                validate: true,
                optimize: false,
                syncToBackend: false,
                description: 'נתוני טופס זמניים'
            },
            
            // נתונים פשוטים - localStorage
            'user-preferences': {
                layer: 'localStorage',
                maxSize: 1024 * 1024, // 1MB
                ttl: null, // persistent
                compress: false,
                validate: true,
                optimize: false,
                syncToBackend: true,
                description: 'העדפות משתמש'
            },
            'filter-state': {
                layer: 'localStorage',
                maxSize: 512 * 1024, // 512KB
                ttl: 3600000, // שעה
                compress: false,
                validate: true,
                optimize: false,
                syncToBackend: false,
                description: 'מצבי פילטרים'
            },
            'ui-settings': {
                layer: 'localStorage',
                maxSize: 256 * 1024, // 256KB
                ttl: null,
                compress: false,
                validate: true,
                optimize: false,
                syncToBackend: false,
                description: 'הגדרות UI'
            },
            
            // נתונים מורכבים - IndexedDB
            'notifications-history': {
                layer: 'indexedDB',
                maxSize: 50 * 1024 * 1024, // 50MB
                ttl: 86400000, // 24 שעות
                compress: true,
                validate: true,
                optimize: true,
                syncToBackend: false,
                description: 'היסטוריית התראות'
            },
            'file-mappings': {
                layer: 'indexedDB',
                maxSize: 25 * 1024 * 1024, // 25MB
                ttl: null,
                compress: true,
                validate: true,
                optimize: true,
                syncToBackend: false,
                description: 'מיפוי קבצים'
            },
            'linter-results': {
                layer: 'indexedDB',
                maxSize: 10 * 1024 * 1024, // 10MB
                ttl: 86400000, // 24 שעות
                compress: true,
                validate: true,
                optimize: true,
                syncToBackend: false,
                description: 'תוצאות לינטר'
            },
            'js-analysis': {
                layer: 'indexedDB',
                maxSize: 15 * 1024 * 1024, // 15MB
                ttl: 86400000, // 24 שעות
                compress: true,
                validate: true,
                optimize: true,
                syncToBackend: false,
                description: 'ניתוח JavaScript'
            },
            
            // נתונים קריטיים - Backend Cache
            'market-data': {
                layer: 'backend',
                maxSize: 10 * 1024 * 1024, // 10MB
                ttl: 30000, // 30 שניות
                compress: false,
                validate: true,
                optimize: false,
                syncToBackend: true,
                description: 'נתוני שוק'
            },
            'trade-data': {
                layer: 'backend',
                maxSize: 5 * 1024 * 1024, // 5MB
                ttl: 30000, // 30 שניות
                compress: false,
                validate: true,
                optimize: false,
                syncToBackend: true,
                description: 'נתוני טריידים'
            },
            'execution-data': {
                layer: 'backend',
                maxSize: 5 * 1024 * 1024, // 5MB
                ttl: 30000, // 30 שניות
                compress: false,
                validate: true,
                optimize: false,
                syncToBackend: true,
                description: 'נתוני ביצועים'
            },
            'dashboard-data': {
                layer: 'backend',
                maxSize: 2 * 1024 * 1024, // 2MB
                ttl: 300000, // 5 דקות
                compress: false,
                validate: true,
                optimize: false,
                syncToBackend: true,
                description: 'נתוני dashboard'
            }
        };
        
        // Validators
        this.setupValidators();
        
        // Optimizers
        this.setupOptimizers();
    }

    /**
     * אתחול מערכת המדיניות
     * @returns {Promise<boolean>} הצלחת האתחול
     */
    async initialize() {
        try {
            console.log('🔄 Initializing Cache Policy Manager...');
            
            // טעינת מדיניות ברירת מחדל
            for (const [key, policy] of Object.entries(this.defaultPolicies)) {
                this.policies.set(key, { ...policy });
            }
            
            // טעינת מדיניות מ-localStorage
            await this.loadCustomPolicies();
            
            // בדיקת תקינות מדיניות
            await this.validateAllPolicies();
            
            this.initialized = true;
            console.log('✅ Cache Policy Manager initialized successfully');
            
            // הודעת הצלחה - מועברת להודעה סופית
            // if (window.notificationSystem) {
            //     window.notificationSystem.showNotification(
            //         'מערכת מדיניות מטמון אותחלה בהצלחה',
            //         'success'
            //     );
            // }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Cache Policy Manager:', error);
            
            // הודעת שגיאה
            if (window.notificationSystem) {
                window.notificationSystem.showNotification(
                    'שגיאה באתחול מערכת מדיניות מטמון',
                    'error'
                );
            }
            
            return false;
        }
    }

    /**
     * קבלת מדיניות מטמון לסוג נתונים
     * @param {string} dataType - סוג הנתונים
     * @returns {Object} מדיניות מטמון
     */
    getPolicy(dataType) {
        if (!this.initialized) {
            console.warn('⚠️ Cache Policy Manager not initialized');
            return this.getDefaultPolicy();
        }

        // חיפוש מדיניות מדויקת
        if (this.policies.has(dataType)) {
            return { ...this.policies.get(dataType) };
        }
        
        // חיפוש מדיניות לפי דפוס
        for (const [pattern, policy] of this.policies.entries()) {
            if (dataType.includes(pattern) || pattern.includes(dataType)) {
                return { ...policy };
            }
        }
        
        // מדיניות ברירת מחדל
        return this.getDefaultPolicy();
    }

    /**
     * הגדרת מדיניות מטמון חדשה
     * @param {string} dataType - סוג הנתונים
     * @param {Object} policy - מדיניות מטמון
     * @returns {boolean} הצלחת ההגדרה
     */
    setPolicy(dataType, policy) {
        if (!this.initialized) {
            console.warn('⚠️ Cache Policy Manager not initialized');
            return false;
        }

        try {
            // אימות מדיניות
            const validatedPolicy = this.validatePolicy(policy);
            if (!validatedPolicy) {
                console.error(`❌ Invalid policy for ${dataType}`);
                return false;
            }
            
            // שמירת מדיניות
            this.policies.set(dataType, validatedPolicy);
            
            // שמירה ב-localStorage
            this.saveCustomPolicies();
            
            console.log(`✅ Policy set for ${dataType}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to set policy for ${dataType}:`, error);
            return false;
        }
    }

    /**
     * אימות נתונים לפי מדיניות
     * @param {any} data - הנתונים לאימות
     * @param {Object} policy - מדיניות המטמון
     * @returns {boolean} האם הנתונים תקינים
     */
    validateData(data, policy) {
        if (!this.initialized) {
            console.warn('⚠️ Cache Policy Manager not initialized');
            return true;
        }

        try {
            // בדיקת גודל
            const dataSize = this.calculateDataSize(data);
            if (dataSize > policy.maxSize) {
                this.addAlert('error', `Data size (${dataSize} bytes) exceeds maximum (${policy.maxSize} bytes)`);
                return false;
            }
            
            // בדיקת מבנה נתונים
            if (policy.validate && this.validators.has(policy.layer)) {
                const validator = this.validators.get(policy.layer);
                if (!validator(data)) {
                    this.addAlert('warning', 'Data structure validation failed');
                    return false;
                }
            }
            
            // בדיקת תוכן
            if (this.hasInvalidContent(data)) {
                this.addAlert('warning', 'Data contains invalid content');
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Data validation error:', error);
            this.addAlert('error', `Data validation error: ${error.message}`);
            return false;
        }
    }

    /**
     * אופטימיזציה של נתונים לפי מדיניות
     * @param {any} data - הנתונים לאופטימיזציה
     * @param {Object} policy - מדיניות המטמון
     * @returns {any} הנתונים המאופטמים
     */
    optimizeData(data, policy) {
        if (!this.initialized) {
            console.warn('⚠️ Cache Policy Manager not initialized');
            return data;
        }

        try {
            let optimizedData = data;
            
            // אופטימיזציה לפי שכבה
            if (policy.optimize && this.optimizers.has(policy.layer)) {
                const optimizer = this.optimizers.get(policy.layer);
                optimizedData = optimizer(optimizedData, policy);
            }
            
            // דחיסה אם נדרש
            if (policy.compress) {
                optimizedData = this.compressData(optimizedData);
            }
            
            return optimizedData;
            
        } catch (error) {
            console.error('❌ Data optimization error:', error);
            this.addAlert('error', `Data optimization error: ${error.message}`);
            return data;
        }
    }

    /**
     * קבלת התראות מדיניות
     * @returns {Array<Object>} רשימת התראות
     */
    getAlerts() {
        return [...this.alerts];
    }

    /**
     * ניקוי התראות ישנות
     * @param {number} maxAge - גיל מקסימלי של התראות במילישניות
     */
    clearOldAlerts(maxAge = 3600000) { // שעה
        const now = Date.now();
        this.alerts = this.alerts.filter(alert => now - alert.timestamp < maxAge);
    }

    /**
     * קבלת סטטיסטיקות מדיניות
     * @returns {Object} סטטיסטיקות מפורטות
     */
    getStats() {
        return {
            initialized: this.initialized,
            policiesCount: this.policies.size,
            alertsCount: this.alerts.length,
            validatorsCount: this.validators.size,
            optimizersCount: this.optimizers.size,
            policies: Array.from(this.policies.entries()).map(([key, policy]) => ({
                key,
                layer: policy.layer,
                maxSize: policy.maxSize,
                ttl: policy.ttl,
                compress: policy.compress,
                validate: policy.validate,
                optimize: policy.optimize
            }))
        };
    }

    /**
     * הגדרת validators
     */
    setupValidators() {
        // Memory Layer Validator
        this.validators.set('memory', (data) => {
            return this.calculateDataSize(data) <= 100 * 1024; // 100KB
        });
        
        // LocalStorage Validator
        this.validators.set('localStorage', (data) => {
            const size = this.calculateDataSize(data);
            return size <= 1024 * 1024 && this.isSimpleData(data); // 1MB ופשוט
        });
        
        // IndexedDB Validator
        this.validators.set('indexedDB', (data) => {
            return this.calculateDataSize(data) <= 100 * 1024 * 1024; // 100MB
        });
        
        // Backend Cache Validator
        this.validators.set('backend', (data) => {
            return this.calculateDataSize(data) <= 50 * 1024 * 1024; // 50MB
        });
    }

    /**
     * הגדרת optimizers
     */
    setupOptimizers() {
        // Memory Layer Optimizer
        this.optimizers.set('memory', (data, policy) => {
            // הסרת properties מיותרים
            if (typeof data === 'object' && data !== null) {
                const optimized = { ...data };
                delete optimized._cacheMeta;
                delete optimized._tempData;
                return optimized;
            }
            return data;
        });
        
        // LocalStorage Optimizer
        this.optimizers.set('localStorage', (data, policy) => {
            // הסרת null/undefined values
            if (typeof data === 'object' && data !== null) {
                const optimized = {};
                for (const [key, value] of Object.entries(data)) {
                    if (value !== null && value !== undefined) {
                        optimized[key] = value;
                    }
                }
                return optimized;
            }
            return data;
        });
        
        // IndexedDB Optimizer
        this.optimizers.set('indexedDB', (data, policy) => {
            // אופטימיזציה למבנים מורכבים
            if (Array.isArray(data)) {
                return data.filter(item => item !== null && item !== undefined);
            }
            
            if (typeof data === 'object' && data !== null) {
                const optimized = {};
                for (const [key, value] of Object.entries(data)) {
                    if (value !== null && value !== undefined) {
                        if (typeof value === 'object') {
                            // רק אם האובייקט לא ריק
                            if (Object.keys(value).length > 0) {
                                optimized[key] = value;
                            }
                        } else {
                            optimized[key] = value;
                        }
                    }
                }
                return optimized;
            }
            
            return data;
        });
        
        // Backend Cache Optimizer
        this.optimizers.set('backend', (data, policy) => {
            // אופטימיזציה מינימלית - רק הסרת metadata
            if (typeof data === 'object' && data !== null) {
                const optimized = { ...data };
                delete optimized._cacheMeta;
                delete optimized._syncMeta;
                return optimized;
            }
            return data;
        });
    }

    /**
     * קבלת מדיניות ברירת מחדל
     * @returns {Object} מדיניות ברירת מחדל
     */
    getDefaultPolicy() {
        return {
            layer: 'localStorage',
            maxSize: 1024 * 1024, // 1MB
            ttl: 3600000, // שעה
            compress: false,
            validate: true,
            optimize: false,
            syncToBackend: false,
            description: 'מדיניות ברירת מחדל'
        };
    }

    /**
     * אימות מדיניות
     * @param {Object} policy - מדיניות לאימות
     * @returns {Object|null} מדיניות מאומתת או null
     */
    validatePolicy(policy) {
        try {
            // בדיקת שדות חובה
            const requiredFields = ['layer', 'maxSize', 'ttl'];
            for (const field of requiredFields) {
                if (!(field in policy)) {
                    console.error(`❌ Missing required field: ${field}`);
                    return null;
                }
            }
            
            // בדיקת ערכים תקינים
            if (!['memory', 'localStorage', 'indexedDB', 'backend'].includes(policy.layer)) {
                console.error(`❌ Invalid layer: ${policy.layer}`);
                return null;
            }
            
            if (typeof policy.maxSize !== 'number' || policy.maxSize <= 0) {
                console.error(`❌ Invalid maxSize: ${policy.maxSize}`);
                return null;
            }
            
            if (policy.ttl !== null && (typeof policy.ttl !== 'number' || policy.ttl <= 0)) {
                console.error(`❌ Invalid ttl: ${policy.ttl}`);
                return null;
            }
            
            // החזרת מדיניות מאומתת
            return {
                layer: policy.layer,
                maxSize: policy.maxSize,
                ttl: policy.ttl,
                compress: Boolean(policy.compress),
                validate: Boolean(policy.validate),
                optimize: Boolean(policy.optimize),
                syncToBackend: Boolean(policy.syncToBackend),
                description: policy.description || 'מדיניות מותאמת אישית'
            };
            
        } catch (error) {
            console.error('❌ Policy validation error:', error);
            return null;
        }
    }

    /**
     * חישוב גודל נתונים
     * @param {any} data - הנתונים
     * @returns {number} גודל בבייטים
     */
    calculateDataSize(data) {
        try {
            return new Blob([JSON.stringify(data)]).size;
        } catch (error) {
            return 0;
        }
    }

    /**
     * בדיקה אם נתונים פשוטים
     * @param {any} data - הנתונים
     * @returns {boolean} האם פשוטים
     */
    isSimpleData(data) {
        if (data === null || data === undefined) return true;
        if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') return true;
        
        if (Array.isArray(data)) {
            return data.length <= 100 && data.every(item => this.isSimpleData(item));
        }
        
        if (typeof data === 'object') {
            const keys = Object.keys(data);
            return keys.length <= 50 && keys.every(key => this.isSimpleData(data[key]));
        }
        
        return false;
    }

    /**
     * בדיקה אם נתונים מכילים תוכן לא תקין
     * @param {any} data - הנתונים
     * @returns {boolean} האם מכילים תוכן לא תקין
     */
    hasInvalidContent(data) {
        try {
            const jsonString = JSON.stringify(data);
            
            // בדיקת תווים לא תקינים
            if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(jsonString)) {
                return true;
            }
            
            // בדיקת circular references
            JSON.stringify(data);
            
            return false;
        } catch (error) {
            return true;
        }
    }

    /**
     * דחיסת נתונים
     * @param {any} data - הנתונים
     * @returns {any} הנתונים הדחוסים
     */
    compressData(data) {
        try {
            const jsonString = JSON.stringify(data);
            return jsonString.replace(/\s+/g, ' ').trim();
        } catch (error) {
            console.warn('⚠️ Failed to compress data:', error);
            return data;
        }
    }

    /**
     * הוספת התראה
     * @param {string} type - סוג ההתראה
     * @param {string} message - הודעת ההתראה
     */
    addAlert(type, message) {
        const alert = {
            type,
            message,
            timestamp: Date.now()
        };
        
        this.alerts.push(alert);
        
        // הגבלת מספר התראות
        if (this.alerts.length > 100) {
            this.alerts.shift();
        }
        
        console.log(`🚨 Policy Alert [${type}]: ${message}`);
    }

    /**
     * טעינת מדיניות מותאמת אישית
     */
    async loadCustomPolicies() {
        try {
            const customPolicies = localStorage.getItem('tiktrack_cache_policies');
            if (customPolicies) {
                const policies = JSON.parse(customPolicies);
                for (const [key, policy] of Object.entries(policies)) {
                    this.policies.set(key, policy);
                }
                console.log(`✅ Loaded ${Object.keys(policies).length} custom policies`);
            }
        } catch (error) {
            console.warn('⚠️ Failed to load custom policies:', error);
        }
    }

    /**
     * שמירת מדיניות מותאמת אישית
     */
    saveCustomPolicies() {
        try {
            const customPolicies = {};
            for (const [key, policy] of this.policies.entries()) {
                if (!this.defaultPolicies[key]) {
                    customPolicies[key] = policy;
                }
            }
            
            localStorage.setItem('tiktrack_cache_policies', JSON.stringify(customPolicies));
        } catch (error) {
            console.warn('⚠️ Failed to save custom policies:', error);
        }
    }

    /**
     * בדיקת תקינות כל המדיניות
     */
    async validateAllPolicies() {
        let validCount = 0;
        let invalidCount = 0;
        
        for (const [key, policy] of this.policies.entries()) {
            if (this.validatePolicy(policy)) {
                validCount++;
            } else {
                invalidCount++;
                console.error(`❌ Invalid policy: ${key}`);
            }
        }
        
        console.log(`✅ Policy validation: ${validCount} valid, ${invalidCount} invalid`);
        
        if (invalidCount > 0) {
            this.addAlert('error', `${invalidCount} policies are invalid`);
        }
    }
}

// יצירת instance גלובלי
window.CachePolicyManager = new CachePolicyManager();

// הוספה למערכת האתחול המאוחדת
if (window.UnifiedInitializationSystem) {
    window.UnifiedInitializationSystem.addCoreSystem('CachePolicyManager', () => {
        return window.CachePolicyManager.initialize();
    });
}

console.log('📋 Cache Policy Manager loaded');




