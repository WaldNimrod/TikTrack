/**
 * Smart Script Loader - Intelligent Script Loading System
 * מערכת טעינת סקריפטים חכמה - מערכת טעינת סקריפטים אינטליגנטית
 * 
 * תאריך יצירה: 19 אוקטובר 2025
 * גרסה: 1.0.0
 * סטטוס: ✅ פעיל
 * 
 * מערכת טעינת סקריפטים חכמה עם ניהול תלויות, טעינה אופטימלית
 * ומערכת משוב מתקדמת
 */

class SmartScriptLoader {
    constructor() {
        this.loadingStrategies = {
            'SEQUENTIAL': 'sequential',
            'PARALLEL': 'parallel',
            'LAZY': 'lazy',
            'CRITICAL_FIRST': 'critical-first'
        };

        this.scriptCategories = {
            'CRITICAL': {
                name: 'קריטי',
                priority: 1,
                description: 'סקריפטים קריטיים שמונעים את פעולת המערכת'
            },
            'ESSENTIAL': {
                name: 'חיוני',
                priority: 2,
                description: 'סקריפטים חיוניים לפונקציונליות בסיסית'
            },
            'IMPORTANT': {
                name: 'חשוב',
                priority: 3,
                description: 'סקריפטים חשובים לפונקציונליות מתקדמת'
            },
            'OPTIONAL': {
                name: 'אופציונלי',
                priority: 4,
                description: 'סקריפטים אופציונליים לשיפור חוויית משתמש'
            }
        };

        this.loadingQueue = [];
        this.loadedScripts = new Map();
        this.failedScripts = new Map();
        this.loadingPromises = new Map();
        this.dependencies = new Map();
        this.scriptMetadata = new Map();
        this.isInitialized = false;
        this.loadingStartTime = null;
        this.loadingEndTime = null;
    }

    /**
     * אתחול מערכת טעינת סקריפטים
     */
    async initialize() {
        try {
            this.loadingStartTime = Date.now();
            this.logInfo('SCRIPT_LOADING', 'מערכת טעינת סקריפטים מאותחלת');
            
            // טעינת מטא-דאטה של סקריפטים
            await this.loadScriptMetadata();
            
            // בניית גרף תלויות
            await this.buildDependencyGraph();
            
            this.isInitialized = true;
            this.loadingEndTime = Date.now();
            
            this.logSuccess('SmartScriptLoader', 'מערכת טעינת סקריפטים אותחלה בהצלחה', {
                initializationTime: this.loadingEndTime - this.loadingStartTime
            });
            
            return true;
        } catch (error) {
            this.logError('SCRIPT_LOADING', 'ERROR', 'כשל באתחול מערכת טעינת סקריפטים', {
                error: error.message,
                stack: error.stack
            });
            return false;
        }
    }

    /**
     * טעינת סקריפטים לפי אסטרטגיה
     */
    async loadScripts(scripts, strategy = 'CRITICAL_FIRST') {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            this.logInfo('SCRIPT_LOADING', `מתחיל טעינת ${scripts.length} סקריפטים באסטרטגיה: ${strategy}`);
            
            // הכנת רשימת טעינה
            const loadingList = await this.prepareLoadingList(scripts, strategy);
            
            // טעינת סקריפטים
            const results = await this.executeLoadingStrategy(loadingList, strategy);
            
            // בדיקת תוצאות
            const validation = this.validateLoadingResults(results);
            if (!validation.valid) {
                this.logError('SCRIPT_LOADING', 'ERROR', 'טעינת סקריפטים לא תקינה', {
                    errors: validation.errors
                });
                throw new Error('Invalid script loading results');
            }
            
            this.logSuccess('SmartScriptLoader', `טעינת ${scripts.length} סקריפטים הושלמה בהצלחה`, {
                loaded: results.loaded.length,
                failed: results.failed.length,
                totalTime: Date.now() - this.loadingStartTime
            });
            
            return results;
        } catch (error) {
            this.logError('SCRIPT_LOADING', 'ERROR', 'כשל בטעינת סקריפטים', {
                error: error.message,
                scripts: scripts,
                strategy: strategy
            });
            throw error;
        }
    }

    /**
     * טעינת סקריפט בודד
     */
    async loadScript(scriptPath, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // בדיקת סקריפט כבר נטען
        if (this.loadedScripts.has(scriptPath)) {
            return this.loadedScripts.get(scriptPath);
        }

        // בדיקת סקריפט כבר נכשל
        if (this.failedScripts.has(scriptPath)) {
            throw new Error(`Script already failed: ${scriptPath}`);
        }

        // בדיקת טעינה בתהליך
        if (this.loadingPromises.has(scriptPath)) {
            return this.loadingPromises.get(scriptPath);
        }

        try {
            this.logInfo('SCRIPT_LOADING', `טוען סקריפט: ${scriptPath}`);
            
            // יצירת Promise לטעינה
            const loadingPromise = this.createScriptElement(scriptPath, options);
            this.loadingPromises.set(scriptPath, loadingPromise);
            
            // טעינת סקריפט
            const result = await loadingPromise;
            
            // עדכון מטמון
            this.loadedScripts.set(scriptPath, result);
            this.loadingPromises.delete(scriptPath);
            
            this.logSuccess('SmartScriptLoader', `סקריפט נטען בהצלחה: ${scriptPath}`, {
                loadTime: result.loadTime,
                size: result.size
            });
            
            return result;
        } catch (error) {
            this.failedScripts.set(scriptPath, error);
            this.loadingPromises.delete(scriptPath);
            
            this.logError('SCRIPT_LOADING', 'ERROR', `כשל בטעינת סקריפט: ${scriptPath}`, {
                script: scriptPath,
                error: error.message
            });
            
            throw error;
        }
    }

    /**
     * טעינת סקריפטים ברצף
     */
    async loadScriptsSequentially(scripts, options = {}) {
        const results = {
            loaded: [],
            failed: [],
            totalTime: 0
        };

        const startTime = Date.now();

        for (const script of scripts) {
            try {
                const result = await this.loadScript(script, options);
                results.loaded.push(result);
            } catch (error) {
                results.failed.push({
                    script: script,
                    error: error
                });
                
                // אם הסקריפט קריטי, עצור את הטעינה
                if (this.isCriticalScript(script)) {
                    this.logError('SCRIPT_LOADING', 'CRITICAL', `סקריפט קריטי נכשל: ${script}`, {
                        script: script,
                        error: error.message
                    });
                    break;
                }
            }
        }

        results.totalTime = Date.now() - startTime;
        return results;
    }

    /**
     * טעינת סקריפטים במקביל
     */
    async loadScriptsParallel(scripts, options = {}) {
        const results = {
            loaded: [],
            failed: [],
            totalTime: 0
        };

        const startTime = Date.now();

        // יצירת Promise לכל סקריפט
        const promises = scripts.map(async (script) => {
            try {
                const result = await this.loadScript(script, options);
                return { success: true, result: result };
            } catch (error) {
                return { success: false, script: script, error: error };
            }
        });

        // המתנה לכל ההבטחות
        const results_array = await Promise.allSettled(promises);

        // עיבוד תוצאות
        for (const result of results_array) {
            if (result.status === 'fulfilled') {
                if (result.value.success) {
                    results.loaded.push(result.value.result);
                } else {
                    results.failed.push({
                        script: result.value.script,
                        error: result.value.error
                    });
                }
            } else {
                results.failed.push({
                    script: 'unknown',
                    error: result.reason
                });
            }
        }

        results.totalTime = Date.now() - startTime;
        return results;
    }

    /**
     * טעינת סקריפטים עם עדיפות קריטית
     */
    async loadScriptsCriticalFirst(scripts, options = {}) {
        const results = {
            loaded: [],
            failed: [],
            totalTime: 0
        };

        const startTime = Date.now();

        // מיון סקריפטים לפי עדיפות
        const sortedScripts = this.sortScriptsByPriority(scripts);

        // טעינת סקריפטים קריטיים ברצף
        const criticalScripts = sortedScripts.filter(s => this.isCriticalScript(s));
        if (criticalScripts.length > 0) {
            const criticalResults = await this.loadScriptsSequentially(criticalScripts, options);
            results.loaded.push(...criticalResults.loaded);
            results.failed.push(...criticalResults.failed);
        }

        // טעינת סקריפטים לא קריטיים במקביל
        const nonCriticalScripts = sortedScripts.filter(s => !this.isCriticalScript(s));
        if (nonCriticalScripts.length > 0) {
            const nonCriticalResults = await this.loadScriptsParallel(nonCriticalScripts, options);
            results.loaded.push(...nonCriticalResults.loaded);
            results.failed.push(...nonCriticalResults.failed);
        }

        results.totalTime = Date.now() - startTime;
        return results;
    }

    /**
     * טעינת סקריפטים עצלה
     */
    async loadScriptsLazy(scripts, options = {}) {
        const results = {
            loaded: [],
            failed: [],
            totalTime: 0
        };

        const startTime = Date.now();

        // טעינת סקריפטים קריטיים מיד
        const criticalScripts = scripts.filter(s => this.isCriticalScript(s));
        if (criticalScripts.length > 0) {
            const criticalResults = await this.loadScriptsSequentially(criticalScripts, options);
            results.loaded.push(...criticalResults.loaded);
            results.failed.push(...criticalResults.failed);
        }

        // טעינת סקריפטים לא קריטיים ברקע
        const nonCriticalScripts = scripts.filter(s => !this.isCriticalScript(s));
        if (nonCriticalScripts.length > 0) {
            // טעינה ברקע ללא המתנה
            this.loadScriptsParallel(nonCriticalScripts, options).then(backgroundResults => {
                results.loaded.push(...backgroundResults.loaded);
                results.failed.push(...backgroundResults.failed);
            });
        }

        results.totalTime = Date.now() - startTime;
        return results;
    }

    /**
     * הכנת רשימת טעינה
     */
    async prepareLoadingList(scripts, strategy) {
        const loadingList = [];

        for (const script of scripts) {
            // בדיקת תלויות
            const dependencies = this.getScriptDependencies(script);
            if (dependencies.length > 0) {
                // הוספת תלויות לרשימה
                for (const dependency of dependencies) {
                    if (!loadingList.includes(dependency)) {
                        loadingList.push(dependency);
                    }
                }
            }

            // הוספת הסקריפט עצמו
            if (!loadingList.includes(script)) {
                loadingList.push(script);
            }
        }

        // מיון לפי אסטרטגיה
        switch (strategy) {
            case 'CRITICAL_FIRST':
                return this.sortScriptsByPriority(loadingList);
            case 'SEQUENTIAL':
                return loadingList;
            case 'PARALLEL':
                return loadingList;
            case 'LAZY':
                return this.sortScriptsByPriority(loadingList);
            default:
                return loadingList;
        }
    }

    /**
     * ביצוע אסטרטגיית טעינה
     */
    async executeLoadingStrategy(loadingList, strategy) {
        switch (strategy) {
            case 'SEQUENTIAL':
                return await this.loadScriptsSequentially(loadingList);
            case 'PARALLEL':
                return await this.loadScriptsParallel(loadingList);
            case 'CRITICAL_FIRST':
                return await this.loadScriptsCriticalFirst(loadingList);
            case 'LAZY':
                return await this.loadScriptsLazy(loadingList);
            default:
                return await this.loadScriptsSequentially(loadingList);
        }
    }

    /**
     * יצירת אלמנט סקריפט
     */
    async createScriptElement(scriptPath, options = {}) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.async = options.async || false;
            script.defer = options.defer || false;
            script.crossOrigin = options.crossOrigin || null;
            script.integrity = options.integrity || null;

            const startTime = Date.now();

            script.onload = () => {
                const loadTime = Date.now() - startTime;
                resolve({
                    script: script,
                    path: scriptPath,
                    loadTime: loadTime,
                    size: this.getScriptSize(script),
                    timestamp: Date.now()
                });
            };

            script.onerror = () => {
                reject(new Error(`Failed to load script: ${scriptPath}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * טעינת מטא-דאטה של סקריפטים
     */
    async loadScriptMetadata() {
        // מטא-דאטה של סקריפטים קריטיים
        this.scriptMetadata.set('unified-app-initializer.js', {
            category: 'CRITICAL',
            priority: 1,
            dependencies: [],
            size: '15KB',
            description: 'מערכת אתחול מאוחדת'
        });

        this.scriptMetadata.set('notification-system.js', {
            category: 'CRITICAL',
            priority: 1,
            dependencies: [],
            size: '8KB',
            description: 'מערכת התראות'
        });

        this.scriptMetadata.set('tables.js', {
            category: 'ESSENTIAL',
            priority: 2,
            dependencies: ['notification-system.js'],
            size: '25KB',
            description: 'מערכת טבלאות'
        });

        this.scriptMetadata.set('data-utils.js', {
            category: 'ESSENTIAL',
            priority: 2,
            dependencies: ['notification-system.js'],
            size: '12KB',
            description: 'כלי עזר לנתונים'
        });

        this.scriptMetadata.set('chart-system.js', {
            category: 'IMPORTANT',
            priority: 3,
            dependencies: ['tables.js', 'data-utils.js'],
            size: '45KB',
            description: 'מערכת גרפים'
        });

        this.scriptMetadata.set('advanced-filters.js', {
            category: 'OPTIONAL',
            priority: 4,
            dependencies: ['tables.js'],
            size: '18KB',
            description: 'מסננים מתקדמים'
        });
    }

    /**
     * בניית גרף תלויות
     */
    async buildDependencyGraph() {
        for (const [script, metadata] of this.scriptMetadata) {
            this.dependencies.set(script, metadata.dependencies || []);
        }
    }

    /**
     * קבלת תלויות סקריפט
     */
    getScriptDependencies(scriptPath) {
        return this.dependencies.get(scriptPath) || [];
    }

    /**
     * בדיקת סקריפט קריטי
     */
    isCriticalScript(scriptPath) {
        const metadata = this.scriptMetadata.get(scriptPath);
        return metadata && metadata.category === 'CRITICAL';
    }

    /**
     * מיון סקריפטים לפי עדיפות
     */
    sortScriptsByPriority(scripts) {
        return scripts.sort((a, b) => {
            const metadataA = this.scriptMetadata.get(a);
            const metadataB = this.scriptMetadata.get(b);
            
            const priorityA = metadataA ? metadataA.priority : 5;
            const priorityB = metadataB ? metadataB.priority : 5;
            
            return priorityA - priorityB;
        });
    }

    /**
     * קבלת גודל סקריפט
     */
    getScriptSize(scriptElement) {
        // ניסיון לקבל גודל מהתגובה
        if (scriptElement.responseText) {
            return scriptElement.responseText.length;
        }
        
        // גודל משוער
        return 'unknown';
    }

    /**
     * ולידציה של תוצאות טעינה
     */
    validateLoadingResults(results) {
        const errors = [];

        // בדיקת סקריפטים קריטיים
        const criticalScripts = Array.from(this.scriptMetadata.entries())
            .filter(([_, metadata]) => metadata.category === 'CRITICAL')
            .map(([script, _]) => script);

        for (const criticalScript of criticalScripts) {
            if (!results.loaded.some(r => r.path === criticalScript)) {
                errors.push(`סקריפט קריטי לא נטען: ${criticalScript}`);
            }
        }

        // בדיקת שגיאות
        if (results.failed.length > 0) {
            const criticalFailures = results.failed.filter(f => 
                this.isCriticalScript(f.script)
            );
            
            if (criticalFailures.length > 0) {
                errors.push(`סקריפטים קריטיים נכשלו: ${criticalFailures.map(f => f.script).join(', ')}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * קבלת סטטוס טעינה
     */
    getLoadingStatus() {
        return {
            isInitialized: this.isInitialized,
            loadedScripts: Array.from(this.loadedScripts.keys()),
            failedScripts: Array.from(this.failedScripts.keys()),
            loadingPromises: Array.from(this.loadingPromises.keys()),
            totalLoaded: this.loadedScripts.size,
            totalFailed: this.failedScripts.size,
            totalLoading: this.loadingPromises.size
        };
    }

    /**
     * ניקוי מטמון
     */
    clearCache() {
        this.loadedScripts.clear();
        this.failedScripts.clear();
        this.loadingPromises.clear();
        this.logInfo('SCRIPT_LOADING', 'מטמון סקריפטים נוקה');
    }

    /**
     * רישום שגיאה
     */
    logError(category, severity, message, details = {}) {
        if (window.enhancedFeedbackSystem) {
            return window.enhancedFeedbackSystem.logError(category, severity, message, details);
        } else {
            console.error(`[${category}] ${severity}: ${message}`, details);
        }
    }

    /**
     * רישום הצלחה
     */
    logSuccess(system, message, details = {}) {
        if (window.enhancedFeedbackSystem) {
            return window.enhancedFeedbackSystem.logSuccess(system, message, details);
        } else {
            console.log(`[${system}] SUCCESS: ${message}`, details);
        }
    }

    /**
     * רישום מידע
     */
    logInfo(category, message, details = {}) {
        if (window.enhancedFeedbackSystem) {
            return window.enhancedFeedbackSystem.logInfo(category, message, details);
        } else {
            console.info(`[${category}] INFO: ${message}`, details);
        }
    }
}

// יצירת instance גלובלי
window.smartScriptLoader = new SmartScriptLoader();

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', async () => {
    await window.smartScriptLoader.initialize();
});

// חשיפת API גלובלי
window.SmartScriptLoader = SmartScriptLoader;
window.loadScripts = async function(scripts, strategy) {
    return await window.smartScriptLoader.loadScripts(scripts, strategy);
};
window.loadScript = async function(scriptPath, options) {
    return await window.smartScriptLoader.loadScript(scriptPath, options);
};
window.getScriptLoadingStatus = function() {
    return window.smartScriptLoader.getLoadingStatus();
};

console.log('✅ Smart Script Loader loaded successfully');
