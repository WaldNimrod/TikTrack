/**
 * Smart App Initializer - Enhanced Unified Initialization System
 * מערכת אתחול חכמה - מערכת אתחול מאוחדת משודרגת
 * 
 * תאריך יצירה: 19 אוקטובר 2025
 * גרסה: 2.0.0
 * סטטוס: ✅ פעיל
 * 
 * מערכת אתחול חכמה עם Package Resolution, Dependency Management
 * ומערכת משוב מתקדמת
 */

class SmartAppInitializer {
    constructor() {
        this.initializationPhases = {
            'DETECT_AND_ANALYZE': 'זיהוי וניתוח',
            'PREPARE_CONFIGURATION': 'הכנת קונפיגורציה',
            'RESOLVE_PACKAGES': 'פתרון חבילות',
            'RESOLVE_DEPENDENCIES': 'פתרון תלויות',
            'LOAD_SCRIPTS': 'טעינת סקריפטים',
            'EXECUTE_INITIALIZATION': 'ביצוע אתחול',
            'FINALIZE_INITIALIZATION': 'סיום אתחול'
        };

        this.currentPhase = null;
        this.initializationStartTime = null;
        this.initializationEndTime = null;
        this.pageInfo = null;
        this.pageConfig = null;
        this.resolvedPackages = [];
        this.resolvedSystems = [];
        this.loadedScripts = [];
        this.initializationErrors = [];
        this.initializationWarnings = [];
        this.customInitializers = [];
        this.errorHandlers = [];
        this.isInitialized = false;
        this.initializationStatus = 'NOT_STARTED';
    }

    /**
     * אתחול המערכת החכמה
     */
    async initialize() {
        try {
            // Start performance monitoring
            if (window.InitPerformanceOptimizer) {
                window.InitPerformanceOptimizer.startMonitoring();
            }
            
            this.initializationStartTime = Date.now();
            this.initializationStatus = 'IN_PROGRESS';
            
            // Phase 1: זיהוי וניתוח
            await this.detectAndAnalyze();
            
            // Phase 2: הכנת קונפיגורציה
            await this.prepareConfiguration();
            
            // Phase 3: פתרון חבילות
            await this.resolvePackages();
            
            // Phase 4: פתרון תלויות
            await this.resolveDependencies();
            
            // Phase 5: טעינת סקריפטים
            await this.loadScripts();
            
            // Phase 6: ביצוע אתחול
            await this.executeInitialization();
            
            // Phase 7: סיום אתחול
            await this.finalizeInitialization();
            
            this.initializationStatus = 'COMPLETED';
            this.isInitialized = true;
            
            // Stop performance monitoring and apply optimizations
            if (window.InitPerformanceOptimizer) {
                window.InitPerformanceOptimizer.stopMonitoring();
                await window.InitPerformanceOptimizer.applyOptimizations();
            }
            
            return true;
        } catch (error) {
            this.initializationStatus = 'FAILED';
            this.handleError(error);
            
            // Stop performance monitoring on error
            if (window.InitPerformanceOptimizer) {
                window.InitPerformanceOptimizer.stopMonitoring();
            }
            
            return false;
        }
    }

    /**
     * Phase 1: זיהוי וניתוח
     */
    async detectAndAnalyze() {
        this.currentPhase = 'DETECT_AND_ANALYZE';
        this.logInfo('INITIALIZATION', 'מתחיל זיהוי וניתוח עמוד');
        
        try {
            // זיהוי מידע עמוד
            this.pageInfo = this.detectPageInfo();
            this.logInfo('INITIALIZATION', `זוהה עמוד: ${this.pageInfo.name} (${this.pageInfo.type})`);
            
            // זיהוי מערכות זמינות
            const availableSystems = this.detectAvailableSystems();
            this.logInfo('INITIALIZATION', `זוהו ${availableSystems.length} מערכות זמינות`);
            
            // בדיקת תאימות דפדפן
            const browserCompatibility = this.checkBrowserCompatibility();
            if (!browserCompatibility.compatible) {
                this.logWarning('COMPATIBILITY', 'בעיות תאימות דפדפן', browserCompatibility);
            }
            
        } catch (error) {
            this.logError('INITIALIZATION', 'ERROR', 'כשל בזיהוי וניתוח עמוד', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Phase 2: הכנת קונפיגורציה
     */
    async prepareConfiguration() {
        this.currentPhase = 'PREPARE_CONFIGURATION';
        this.logInfo('INITIALIZATION', 'מכין קונפיגורציה לעמוד');
        
        try {
            // קבלת קונפיגורציה בסיסית
            this.pageConfig = this.getPageConfiguration();
            
            // בדיקת תבנית עמוד
            if (this.pageConfig.template && window.pageTemplates) {
                const template = window.pageTemplates.getTemplate(this.pageConfig.template);
                if (template) {
                    this.logInfo('INITIALIZATION', `נמצאה תבנית: ${template.name}`);
                    this.pageConfig = this.mergeTemplateConfiguration(this.pageConfig, template);
                }
            }
            
            // ולידציה של קונפיגורציה
            const validation = this.validatePageConfiguration(this.pageConfig);
            if (!validation.valid) {
                this.logError('CONFIGURATION', 'ERROR', 'קונפיגורציה לא תקינה', {
                    errors: validation.errors
                });
                throw new Error('Invalid page configuration');
            }
            
            this.logInfo('INITIALIZATION', 'קונפיגורציה הוכנה בהצלחה');
            
        } catch (error) {
            this.logError('CONFIGURATION', 'ERROR', 'כשל בהכנת קונפיגורציה', {
                error: error.message,
                pageConfig: this.pageConfig
            });
            throw error;
        }
    }

    /**
     * Phase 3: פתרון חבילות
     */
    async resolvePackages() {
        this.currentPhase = 'RESOLVE_PACKAGES';
        this.logInfo('INITIALIZATION', 'פותר חבילות נדרשות');
        
        try {
            if (!window.SYSTEM_PACKAGES) {
                throw new Error('Package Registry לא זמין');
            }
            
            // קבלת חבילות נדרשות
            const requiredPackages = this.getRequiredPackages();
            this.logInfo('INITIALIZATION', `נדרשות ${requiredPackages.length} חבילות`);
            
            // פתרון חבילות
            this.resolvedPackages = await this.resolvePackageDependencies(requiredPackages);
            this.logInfo('INITIALIZATION', `נפתרו ${this.resolvedPackages.length} חבילות`);
            
            // בדיקת תקינות חבילות
            const packageValidation = this.validateResolvedPackages();
            if (!packageValidation.valid) {
                this.logError('PACKAGE_LOADING', 'ERROR', 'חבילות לא תקינות', {
                    errors: packageValidation.errors
                });
                throw new Error('Invalid packages');
            }
            
        } catch (error) {
            this.logError('PACKAGE_LOADING', 'ERROR', 'כשל בפתרון חבילות', {
                error: error.message,
                requiredPackages: this.getRequiredPackages()
            });
            throw error;
        }
    }

    /**
     * Phase 4: פתרון תלויות
     */
    async resolveDependencies() {
        this.currentPhase = 'RESOLVE_DEPENDENCIES';
        this.logInfo('INITIALIZATION', 'פותר תלויות מערכות');
        
        try {
            if (!window.SYSTEM_DEPENDENCIES) {
                throw new Error('System Dependency Graph לא זמין');
            }
            
            // קבלת מערכות נדרשות
            const requiredSystems = this.getRequiredSystems();
            this.logInfo('INITIALIZATION', `נדרשות ${requiredSystems.length} מערכות`);
            
            // פתרון תלויות
            this.resolvedSystems = await this.resolveSystemDependencies(requiredSystems);
            this.logInfo('INITIALIZATION', `נפתרו ${this.resolvedSystems.length} מערכות`);
            
            // בדיקת תקינות תלויות
            const dependencyValidation = this.validateResolvedDependencies();
            if (!dependencyValidation.valid) {
                this.logError('SYSTEM_DEPENDENCY', 'ERROR', 'תלויות לא תקינות', {
                    errors: dependencyValidation.errors
                });
                throw new Error('Invalid dependencies');
            }
            
        } catch (error) {
            this.logError('SYSTEM_DEPENDENCY', 'ERROR', 'כשל בפתרון תלויות', {
                error: error.message,
                requiredSystems: this.getRequiredSystems()
            });
            throw error;
        }
    }

    /**
     * Phase 5: טעינת סקריפטים
     */
    async loadScripts() {
        this.currentPhase = 'LOAD_SCRIPTS';
        this.logInfo('INITIALIZATION', 'טוען סקריפטים נדרשים');
        
        try {
            // קבלת סקריפטים נדרשים
            const requiredScripts = this.getRequiredScripts();
            this.logInfo('INITIALIZATION', `נדרשים ${requiredScripts.length} סקריפטים`);
            
            // טעינת סקריפטים
            this.loadedScripts = await this.loadScriptsSequentially(requiredScripts);
            this.logInfo('INITIALIZATION', `נטענו ${this.loadedScripts.length} סקריפטים`);
            
            // בדיקת תקינות סקריפטים
            const scriptValidation = this.validateLoadedScripts();
            if (!scriptValidation.valid) {
                this.logError('SCRIPT_LOADING', 'ERROR', 'סקריפטים לא תקינים', {
                    errors: scriptValidation.errors
                });
                throw new Error('Invalid scripts');
            }
            
        } catch (error) {
            this.logError('SCRIPT_LOADING', 'ERROR', 'כשל בטעינת סקריפטים', {
                error: error.message,
                requiredScripts: this.getRequiredScripts()
            });
            throw error;
        }
    }

    /**
     * Phase 6: ביצוע אתחול
     */
    async executeInitialization() {
        this.currentPhase = 'EXECUTE_INITIALIZATION';
        this.logInfo('INITIALIZATION', 'מבצע אתחול מערכות');
        
        try {
            // אתחול מערכת מטמון
            await this.initializeCacheSystem();
            
            // אתחול מערכות בסיסיות
            await this.initializeBaseSystems();
            
            // אתחול מערכות נוספות
            await this.initializeAdditionalSystems();
            
            // ביצוע אתחולים מותאמים אישית
            await this.executeCustomInitializers();
            
            this.logInfo('INITIALIZATION', 'אתחול מערכות הושלם בהצלחה');
            
        } catch (error) {
            this.logError('INITIALIZATION', 'ERROR', 'כשל בביצוע אתחול', {
                error: error.message,
                phase: this.currentPhase
            });
            throw error;
        }
    }

    /**
     * Phase 7: סיום אתחול
     */
    async finalizeInitialization() {
        this.currentPhase = 'FINALIZE_INITIALIZATION';
        this.logInfo('INITIALIZATION', 'מסיים אתחול מערכת');
        
        try {
            // עדכון סטטוס מערכת
            this.updateSystemStatus();
            
            // רישום הצלחה
            this.initializationEndTime = Date.now();
            const totalTime = this.initializationEndTime - this.initializationStartTime;
            
            this.logSuccess('SmartAppInitializer', `אתחול הושלם בהצלחה תוך ${totalTime}ms`, {
                totalTime: totalTime,
                packages: this.resolvedPackages.length,
                systems: this.resolvedSystems.length,
                scripts: this.loadedScripts.length,
                errors: this.initializationErrors.length,
                warnings: this.initializationWarnings.length
            });
            
            // עדכון דשבורד ניטור
            this.updateMonitoringDashboard();
            
        } catch (error) {
            this.logError('INITIALIZATION', 'ERROR', 'כשל בסיום אתחול', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * זיהוי מידע עמוד
     */
    detectPageInfo() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop().replace('.html', '') || 'index';
        
        return {
            name: pageName,
            path: path,
            type: this.determinePageType(pageName),
            url: window.location.href,
            timestamp: Date.now()
        };
    }

    /**
     * זיהוי מערכות זמינות
     */
    detectAvailableSystems() {
        const systems = [];
        
        // בדיקת מערכות גלובליות
        const globalSystems = Object.keys(window).filter(key => 
            key.endsWith('System') || key.endsWith('Manager') || key.endsWith('Utils')
        );
        
        systems.push(...globalSystems);
        
        return systems;
    }

    /**
     * בדיקת תאימות דפדפן
     */
    checkBrowserCompatibility() {
        const userAgent = navigator.userAgent;
        const isChrome = userAgent.includes('Chrome');
        const isFirefox = userAgent.includes('Firefox');
        const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
        const isEdge = userAgent.includes('Edge');
        
        return {
            compatible: isChrome || isFirefox || isSafari || isEdge,
            browser: isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : 'Unknown',
            userAgent: userAgent,
            issues: []
        };
    }

    /**
     * קבלת קונפיגורציה עמוד
     */
    getPageConfiguration() {
        // ניסיון לקבל קונפיגורציה מ-PAGE_CONFIGS
        if (window.PAGE_CONFIGS && window.PAGE_CONFIGS[this.pageInfo.name]) {
            return window.PAGE_CONFIGS[this.pageInfo.name];
        }
        
        // קונפיגורציה ברירת מחדל
        return {
            name: this.pageInfo.name,
            template: 'simple-page',
            packages: ['base'],
            systems: [],
            features: [],
            customInitializers: []
        };
    }

    /**
     * מיזוג קונפיגורציה מתבנית
     */
    mergeTemplateConfiguration(pageConfig, template) {
        return {
            ...pageConfig,
            packages: [...new Set([...pageConfig.packages, ...template.packages])],
            systems: [...new Set([...pageConfig.systems, ...template.systems])],
            features: [...new Set([...pageConfig.features, ...template.features])],
            customInitializers: [...pageConfig.customInitializers, ...template.initializers]
        };
    }

    /**
     * ולידציה של קונפיגורציה
     */
    validatePageConfiguration(config) {
        const errors = [];
        
        if (!config.name) {
            errors.push('שם עמוד חסר');
        }
        
        if (!config.packages || !Array.isArray(config.packages)) {
            errors.push('חבילות לא מוגדרות או לא תקינות');
        }
        
        if (!config.systems || !Array.isArray(config.systems)) {
            errors.push('מערכות לא מוגדרות או לא תקינות');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * קבלת חבילות נדרשות
     */
    getRequiredPackages() {
        const packages = new Set();
        
        // חבילות מקונפיגורציה
        if (this.pageConfig.packages) {
            this.pageConfig.packages.forEach(pkg => packages.add(pkg));
        }
        
        // חבילות מתבנית
        if (this.pageConfig.template && window.pageTemplates) {
            const template = window.pageTemplates.getTemplate(this.pageConfig.template);
            if (template && template.packages) {
                template.packages.forEach(pkg => packages.add(pkg));
            }
        }
        
        return Array.from(packages);
    }

    /**
     * פתרון תלויות חבילות
     */
    async resolvePackageDependencies(requiredPackages) {
        const resolved = [];
        const visited = new Set();
        
        const resolvePackage = async (packageName) => {
            if (visited.has(packageName)) {
                return;
            }
            
            visited.add(packageName);
            
            const pkg = window.SYSTEM_PACKAGES[packageName];
            if (!pkg) {
                throw new Error(`חבילה לא נמצאה: ${packageName}`);
            }
            
            // פתרון תלויות
            if (pkg.requires) {
                for (const dependency of pkg.requires) {
                    await resolvePackage(dependency);
                }
            }
            
            resolved.push(packageName);
        };
        
        for (const packageName of requiredPackages) {
            await resolvePackage(packageName);
        }
        
        return resolved;
    }

    /**
     * ולידציה של חבילות
     */
    validateResolvedPackages() {
        const errors = [];
        
        for (const packageName of this.resolvedPackages) {
            const pkg = window.SYSTEM_PACKAGES[packageName];
            if (!pkg) {
                errors.push(`חבילה לא נמצאה: ${packageName}`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * קבלת מערכות נדרשות
     */
    getRequiredSystems() {
        const systems = new Set();
        
        // מערכות מחבילות
        for (const packageName of this.resolvedPackages) {
            const pkg = window.SYSTEM_PACKAGES[packageName];
            if (pkg && pkg.systems) {
                pkg.systems.forEach(system => systems.add(system));
            }
        }
        
        // מערכות מקונפיגורציה
        if (this.pageConfig.systems) {
            this.pageConfig.systems.forEach(system => systems.add(system));
        }
        
        return Array.from(systems);
    }

    /**
     * פתרון תלויות מערכות
     */
    async resolveSystemDependencies(requiredSystems) {
        const resolved = [];
        const visited = new Set();
        
        const resolveSystem = async (systemName) => {
            if (visited.has(systemName)) {
                return;
            }
            
            visited.add(systemName);
            
            const system = window.SYSTEM_DEPENDENCIES[systemName];
            if (!system) {
                this.logWarning('SYSTEM_DEPENDENCY', `מערכת לא נמצאה בתלויות: ${systemName}`);
                return;
            }
            
            // פתרון תלויות
            if (system.depends) {
                for (const dependency of system.depends) {
                    await resolveSystem(dependency);
                }
            }
            
            resolved.push(systemName);
        };
        
        for (const systemName of requiredSystems) {
            await resolveSystem(systemName);
        }
        
        return resolved;
    }

    /**
     * ולידציה של תלויות
     */
    validateResolvedDependencies() {
        const errors = [];
        
        for (const systemName of this.resolvedSystems) {
            const system = window.SYSTEM_DEPENDENCIES[systemName];
            if (system && system.depends) {
                for (const dependency of system.depends) {
                    if (!this.resolvedSystems.includes(dependency)) {
                        errors.push(`תלות חסרה: ${systemName} תלוי ב-${dependency}`);
                    }
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * קבלת סקריפטים נדרשים
     */
    getRequiredScripts() {
        const scripts = new Set();
        
        // סקריפטים מחבילות
        for (const packageName of this.resolvedPackages) {
            if (window.pageTemplates) {
                const packageScripts = window.pageTemplates.getScriptsForPackage(packageName);
                if (packageScripts) {
                    packageScripts.forEach(script => scripts.add(script));
                }
            }
        }
        
        // סקריפטים מקונפיגורציה
        if (this.pageConfig.customScripts) {
            this.pageConfig.customScripts.forEach(script => scripts.add(script));
        }
        
        return Array.from(scripts);
    }

    /**
     * טעינת סקריפטים ברצף
     */
    async loadScriptsSequentially(scripts) {
        const loaded = [];
        
        for (const script of scripts) {
            try {
                await this.loadScript(script);
                loaded.push(script);
            } catch (error) {
                this.logError('SCRIPT_LOADING', 'ERROR', `כשל בטעינת סקריפט: ${script}`, {
                    script: script,
                    error: error.message
                });
                throw error;
            }
        }
        
        return loaded;
    }

    /**
     * טעינת סקריפט בודד
     */
    async loadScript(scriptPath) {
        // Try to load from cache first
        if (window.InitAdvancedCache) {
            const cachedScript = await window.InitAdvancedCache.get(`script:${scriptPath}`);
            if (cachedScript) {
                // Execute cached script
                const script = document.createElement('script');
                script.textContent = cachedScript;
                document.head.appendChild(script);
                return script;
            }
        }
        
        // Load from network if not in cache
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.onload = async () => {
                // Cache the script content for future use
                if (window.InitAdvancedCache) {
                    try {
                        const response = await fetch(scriptPath);
                        const content = await response.text();
                        await window.InitAdvancedCache.set(`script:${scriptPath}`, content);
                    } catch (error) {
                        console.warn('Failed to cache script:', scriptPath, error);
                    }
                }
                resolve(script);
            };
            script.onerror = () => reject(new Error(`Failed to load script: ${scriptPath}`));
            document.head.appendChild(script);
        });
    }

    /**
     * ולידציה של סקריפטים
     */
    validateLoadedScripts() {
        const errors = [];
        
        // בדיקת סקריפטים קריטיים
        const criticalScripts = ['unified-app-initializer.js', 'notification-system.js'];
        for (const script of criticalScripts) {
            if (!this.loadedScripts.some(s => s.includes(script))) {
                errors.push(`סקריפט קריטי חסר: ${script}`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * אתחול מערכת מטמון
     */
    async initializeCacheSystem() {
        try {
            // Initialize Advanced Cache System
            if (window.InitAdvancedCache) {
                await window.InitAdvancedCache.warmCache();
                this.logSuccess('AdvancedCacheSystem', 'מערכת מטמון מתקדמת אותחלה בהצלחה');
            }
            
            // Initialize Unified Cache Manager for backward compatibility
            if (window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.initialize();
                this.logSuccess('UnifiedCacheSystem', 'מערכת מטמון מאוחדת אותחלה בהצלחה');
            }
        } catch (error) {
            this.logError('INITIALIZATION', 'ERROR', 'כשל באתחול מערכת מטמון', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * אתחול מערכות בסיסיות
     */
    async initializeBaseSystems() {
        const baseSystems = ['NotificationSystem', 'ModalSystem', 'TranslationSystem'];
        
        for (const systemName of baseSystems) {
            try {
                if (window[systemName] && typeof window[systemName].initialize === 'function') {
                    await window[systemName].initialize();
                    this.logSuccess(systemName, 'מערכת אותחלה בהצלחה');
                }
            } catch (error) {
                this.logError('INITIALIZATION', 'ERROR', `כשל באתחול מערכת: ${systemName}`, {
                    system: systemName,
                    error: error.message
                });
                throw error;
            }
        }
    }

    /**
     * אתחול מערכות נוספות
     */
    async initializeAdditionalSystems() {
        for (const systemName of this.resolvedSystems) {
            try {
                if (window[systemName] && typeof window[systemName].initialize === 'function') {
                    await window[systemName].initialize();
                    this.logSuccess(systemName, 'מערכת אותחלה בהצלחה');
                }
            } catch (error) {
                this.logError('INITIALIZATION', 'ERROR', `כשל באתחול מערכת: ${systemName}`, {
                    system: systemName,
                    error: error.message
                });
                throw error;
            }
        }
    }

    /**
     * ביצוע אתחולים מותאמים אישית
     */
    async executeCustomInitializers() {
        if (this.pageConfig.customInitializers) {
            for (const initializer of this.pageConfig.customInitializers) {
                try {
                    if (typeof initializer === 'function') {
                        await initializer(this.pageConfig);
                    } else if (typeof initializer === 'string' && window[initializer]) {
                        await window[initializer](this.pageConfig);
                    }
                    this.logSuccess('CustomInitializer', `אתחול מותאם הושלם: ${initializer}`);
                } catch (error) {
                    this.logError('INITIALIZATION', 'ERROR', `כשל באתחול מותאם: ${initializer}`, {
                        initializer: initializer,
                        error: error.message
                    });
                    throw error;
                }
            }
        }
    }

    /**
     * עדכון סטטוס מערכת
     */
    updateSystemStatus() {
        // עדכון סטטוס גלובלי
        window.smartAppInitializerStatus = {
            isInitialized: this.isInitialized,
            status: this.initializationStatus,
            phase: this.currentPhase,
            startTime: this.initializationStartTime,
            endTime: this.initializationEndTime,
            totalTime: this.initializationEndTime - this.initializationStartTime,
            packages: this.resolvedPackages,
            systems: this.resolvedSystems,
            scripts: this.loadedScripts,
            errors: this.initializationErrors,
            warnings: this.initializationWarnings
        };
    }

    /**
     * עדכון דשבורד ניטור
     */
    updateMonitoringDashboard() {
        if (window.SystemManagement && window.SystemManagement.updateInitializationStatus) {
            const performanceMetrics = window.InitPerformanceOptimizer ? 
                window.InitPerformanceOptimizer.getMetrics() : null;
            
            const cacheStats = window.InitAdvancedCache ? 
                window.InitAdvancedCache.getStats() : null;
            
            window.SystemManagement.updateInitializationStatus({
                status: this.initializationStatus,
                phase: this.currentPhase,
                totalTime: this.initializationEndTime - this.initializationStartTime,
                packages: this.resolvedPackages.length,
                systems: this.resolvedSystems.length,
                scripts: this.loadedScripts.length,
                errors: this.initializationErrors.length,
                warnings: this.initializationWarnings.length,
                performance: performanceMetrics,
                cache: cacheStats
            });
        }
    }

    /**
     * טיפול בשגיאות
     */
    handleError(error) {
        this.initializationErrors.push({
            timestamp: Date.now(),
            error: error,
            phase: this.currentPhase,
            context: {
                pageInfo: this.pageInfo,
                pageConfig: this.pageConfig,
                resolvedPackages: this.resolvedPackages,
                resolvedSystems: this.resolvedSystems
            }
        });
        
        this.logError('INITIALIZATION', 'CRITICAL', 'כשל באתחול מערכת', {
            error: error.message,
            stack: error.stack,
            phase: this.currentPhase
        });
    }

    /**
     * רישום שגיאה
     */
    logError(category, severity, message, details = {}, context = {}) {
        if (window.enhancedFeedbackSystem) {
            return window.enhancedFeedbackSystem.logError(category, severity, message, details, context);
        } else {
            console.error(`[${category}] ${severity}: ${message}`, details, context);
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

    /**
     * רישום אזהרה
     */
    logWarning(category, message, details = {}) {
        if (window.enhancedFeedbackSystem) {
            return window.enhancedFeedbackSystem.logWarning(category, message, details);
        } else {
            console.warn(`[${category}] WARNING: ${message}`, details);
        }
    }

    /**
     * קבלת סטטוס מערכת
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            status: this.initializationStatus,
            phase: this.currentPhase,
            startTime: this.initializationStartTime,
            endTime: this.initializationEndTime,
            totalTime: this.initializationEndTime ? this.initializationEndTime - this.initializationStartTime : null,
            packages: this.resolvedPackages,
            systems: this.resolvedSystems,
            scripts: this.loadedScripts,
            errors: this.initializationErrors,
            warnings: this.initializationWarnings
        };
    }

    /**
     * איפוס מערכת
     */
    reset() {
        this.currentPhase = null;
        this.initializationStartTime = null;
        this.initializationEndTime = null;
        this.pageInfo = null;
        this.pageConfig = null;
        this.resolvedPackages = [];
        this.resolvedSystems = [];
        this.loadedScripts = [];
        this.initializationErrors = [];
        this.initializationWarnings = [];
        this.isInitialized = false;
        this.initializationStatus = 'NOT_STARTED';
    }
}

// יצירת instance גלובלי
window.smartAppInitializer = new SmartAppInitializer();

// אתחול אוטומטי
document.addEventListener('DOMContentLoaded', async () => {
    await window.smartAppInitializer.initialize();
});

// חשיפת API גלובלי
window.SmartAppInitializer = SmartAppInitializer;
window.initializeSmartApp = async function() {
    return await window.smartAppInitializer.initialize();
};
window.getSmartAppStatus = function() {
    return window.smartAppInitializer.getStatus();
};

console.log('✅ Smart App Initializer loaded successfully');
