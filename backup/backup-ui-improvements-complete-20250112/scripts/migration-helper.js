/**
 * Cache Migration Helper - כלי עזר למיגרציה למערכת מטמון מאוחדת
 * TikTrack Unified Cache System Migration Tool
 * 
 * תאריך יצירה: 26 בינואר 2025
 * גרסה: 1.0
 * 
 * דוקומנטציה: CACHE_UNIFICATION_WORK_PLAN.md
 */

class CacheMigrationHelper {
    constructor() {
        this.migrationLog = [];
        this.rollbackData = new Map();
        this.stats = {
            totalSystems: 0,
            migratedSystems: 0,
            failedSystems: 0,
            totalDataItems: 0,
            migratedDataItems: 0,
            failedDataItems: 0
        };
        
        // מפת מיגרציה מפורטת לפי הניתוח שלנו
        this.migrationMap = {
            // מערכות UI בסיסיות (9 קריאות)
            'colorScheme': 'user-color-scheme',
            'customColorScheme': 'user-custom-color-scheme',
            'headerFilters': 'header-filters',
            
            // מערכות CSS וניהול (4 קריאות)
            'css-duplicates-results': 'css-duplicates-results',
            
            // מערכות נתונים (2 קריאות)
            'cashFlowsSectionState': 'cash-flows-section-state',
            'executionsTopSectionCollapsed': 'executions-top-section-collapsed',
            
            // מערכות התראות (17 קריאות)
            'globalNotificationHistory': 'notifications-history',
            'globalNotificationStats': 'notifications-stats',
            'tiktrack_global_notifications_history': 'notifications-history-v2',
            'tiktrack_global_notifications_stats': 'notifications-stats-v2',
            
            // מערכות לוגים (9 קריאות)
            'lastExternalDataRefresh': 'external-data-last-refresh',
            'cache_mode': 'cache-mode',
            
            // מערכות עזר (22 קריאות)
            'tiktrack_cache_policies': 'cache-policies-custom',
            'tiktrack_memory_optimizer_settings': 'memory-optimizer-settings',
            'serverMonitorSettings': 'server-monitor-settings'
        };
        
        // הגדרות מדיניות מטמון לכל סוג נתונים
        this.cachePolicies = {
            'user-color-scheme': {
                layer: 'localStorage',
                ttl: null,
                compress: false,
                syncToBackend: false
            },
            'user-custom-color-scheme': {
                layer: 'localStorage',
                ttl: null,
                compress: true,
                syncToBackend: false
            },
            'header-filters': {
                layer: 'localStorage',
                ttl: 3600000, // 1 שעה
                compress: true,
                syncToBackend: false
            },
            'css-duplicates-results': {
                layer: 'indexedDB',
                ttl: 86400000, // 24 שעות
                compress: true,
                syncToBackend: false
            },
            'cash-flows-section-state': {
                layer: 'localStorage',
                ttl: null,
                compress: false,
                syncToBackend: false
            },
            'executions-top-section-collapsed': {
                layer: 'localStorage',
                ttl: null,
                compress: false,
                syncToBackend: false
            },
            'notifications-history': {
                layer: 'indexedDB',
                ttl: 604800000, // 7 ימים
                compress: true,
                syncToBackend: true
            },
            'notifications-history-v2': {
                layer: 'indexedDB',
                ttl: 604800000, // 7 ימים
                compress: true,
                syncToBackend: true
            },
            'notifications-stats': {
                layer: 'indexedDB',
                ttl: 86400000, // 24 שעות
                compress: true,
                syncToBackend: true
            },
            'notifications-stats-v2': {
                layer: 'indexedDB',
                ttl: 86400000, // 24 שעות
                compress: true,
                syncToBackend: true
            },
            'external-data-last-refresh': {
                layer: 'localStorage',
                ttl: 3600000, // 1 שעה
                compress: false,
                syncToBackend: false
            },
            'cache-mode': {
                layer: 'localStorage',
                ttl: null,
                compress: false,
                syncToBackend: false
            },
            'cache-policies-custom': {
                layer: 'localStorage',
                ttl: null,
                compress: true,
                syncToBackend: false
            },
            'memory-optimizer-settings': {
                layer: 'localStorage',
                ttl: null,
                compress: true,
                syncToBackend: false
            },
            'server-monitor-settings': {
                layer: 'localStorage',
                ttl: 3600000, // 1 שעה
                compress: true,
                syncToBackend: false
            }
        };
    }

    /**
     * מיגרציה של מערכת ספציפית
     * @param {string} systemName - שם המערכת
     * @param {Object} migrationConfig - הגדרות מיגרציה
     */
    async migrateSystem(systemName, migrationConfig = {}) {
        const startTime = Date.now();
        const migrationId = `migration-${systemName}-${startTime}`;
        
        try {
            this.logMigration(`🚀 התחלת מיגרציה של מערכת: ${systemName}`, migrationId);
            
            // גיבוי נתונים קיימים
            const backupData = await this.backupSystemData(systemName);
            
            // מיגרציה של נתונים
            const migrationResult = await this.performDataMigration(systemName, migrationConfig);
            
            // אימות המיגרציה
            const validationResult = await this.validateMigration(systemName);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            this.stats.migratedSystems++;
            this.logMigration(`✅ מיגרציה הושלמה בהצלחה: ${systemName} (${duration}ms)`, migrationId);
            
            return {
                success: true,
                migrationId,
                duration,
                migratedItems: migrationResult.migratedItems,
                validationResult
            };
            
        } catch (error) {
            this.stats.failedSystems++;
            this.logMigration(`❌ שגיאה במיגרציה של ${systemName}: ${error.message}`, migrationId);
            
            // ניסיון rollback
            try {
                await this.rollbackMigration(systemName, migrationId);
                this.logMigration(`🔄 Rollback הושלם בהצלחה: ${systemName}`, migrationId);
            } catch (rollbackError) {
                this.logMigration(`💥 שגיאה ב-rollback: ${rollbackError.message}`, migrationId);
            }
            
            return {
                success: false,
                migrationId,
                error: error.message,
                rollbackAttempted: true
            };
        }
    }

    /**
     * גיבוי נתונים של מערכת
     * @param {string} systemName - שם המערכת
     */
    async backupSystemData(systemName) {
        const backupData = {};
        
        try {
            // גיבוי מ-localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (this.isSystemKey(key, systemName)) {
                    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                        backupData[key] = await window.UnifiedCacheManager.get(key);
                    } else {
                        backupData[key] = localStorage.getItem(key); // fallback
                    }
                }
            }
            
            // גיבוי מ-IndexedDB (אם זמין)
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                // גיבוי נתונים ממערכת המטמון המאוחדת
                const cacheKeys = Object.keys(this.migrationMap);
                for (const oldKey of cacheKeys) {
                    const newKey = this.migrationMap[oldKey];
                    try {
                        const data = await window.UnifiedCacheManager.get(newKey);
                        if (data) {
                            backupData[newKey] = data;
                        }
                    } catch (error) {
                        console.warn(`⚠️ לא ניתן לגבות ${newKey}:`, error);
                    }
                }
            }
            
            this.rollbackData.set(systemName, backupData);
            this.logMigration(`💾 גיבוי הושלם: ${Object.keys(backupData).length} פריטים`, systemName);
            
            return backupData;
            
        } catch (error) {
            throw new Error(`שגיאה בגיבוי מערכת ${systemName}: ${error.message}`);
        }
    }

    /**
     * ביצוע מיגרציה של נתונים
     * @param {string} systemName - שם המערכת
     * @param {Object} migrationConfig - הגדרות מיגרציה
     */
    async performDataMigration(systemName, migrationConfig) {
        const migratedItems = [];
        let totalItems = 0;
        
        try {
            // מיגרציה מ-localStorage למערכת המטמון המאוחדת
            for (const [oldKey, newKey] of Object.entries(this.migrationMap)) {
                if (this.isSystemKey(oldKey, systemName)) {
                    totalItems++;
                    
                    let data = null;
                    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                        data = await window.UnifiedCacheManager.get(oldKey);
                    } else {
                        data = localStorage.getItem(oldKey); // fallback
                    }
                    
                    if (data) {
                        try {
                            const parsedData = this.parseData(data);
                            const policy = this.cachePolicies[newKey] || this.getDefaultPolicy();
                            
                            // שמירה במערכת המטמון המאוחדת
                            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                                await window.UnifiedCacheManager.save(newKey, parsedData, policy);
                                
                                // מחיקה מ-localStorage המקורי
                                if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                                    await window.UnifiedCacheManager.remove(oldKey, { layer: 'localStorage' });
                                } else {
                                    localStorage.removeItem(oldKey); // fallback
                                }
                                
                                migratedItems.push({
                                    oldKey,
                                    newKey,
                                    size: JSON.stringify(parsedData).length,
                                    policy
                                });
                                
                                this.stats.migratedDataItems++;
                            } else {
                                throw new Error('מערכת המטמון המאוחדת לא זמינה');
                            }
                            
                        } catch (error) {
                            this.stats.failedDataItems++;
                            this.logMigration(`⚠️ שגיאה במיגרציה של ${oldKey}: ${error.message}`, systemName);
                        }
                    }
                }
            }
            
            this.stats.totalDataItems += totalItems;
            
            return {
                migratedItems,
                totalItems,
                success: migratedItems.length > 0
            };
            
        } catch (error) {
            throw new Error(`שגיאה במיגרציה של נתונים: ${error.message}`);
        }
    }

    /**
     * אימות הצלחת המיגרציה
     * @param {string} systemName - שם המערכת
     */
    async validateMigration(systemName) {
        const validationResults = {
            systemName,
            timestamp: new Date().toISOString(),
            checks: []
        };
        
        try {
            // בדיקה 1: אין נתונים ישנים ב-localStorage
            const oldKeys = [];
            for (const key of Object.keys(this.migrationMap)) {
                if (this.isSystemKey(key, systemName)) {
                    let value = null;
                    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                        value = await window.UnifiedCacheManager.get(key);
                    } else {
                        value = localStorage.getItem(key); // fallback
                    }
                    if (value) {
                        oldKeys.push(key);
                    }
                }
            }
            
            validationResults.checks.push({
                name: 'localStorage Cleanup',
                status: oldKeys.length === 0 ? 'PASS' : 'FAIL',
                details: oldKeys.length === 0 ? 'כל הנתונים הישנים הוסרו' : `נותרו ${oldKeys.length} מפתחות`
            });
            
            // בדיקה 2: נתונים חדשים זמינים במערכת המטמון המאוחדת
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                const newKeys = Object.values(this.migrationMap).filter(key => 
                    this.isSystemKey(key, systemName)
                );
                
                let accessibleCount = 0;
                for (const newKey of newKeys) {
                    try {
                        const data = await window.UnifiedCacheManager.get(newKey);
                        if (data) {
                            accessibleCount++;
                        }
                    } catch (error) {
                        // מפתח לא קיים - זה בסדר
                    }
                }
                
                validationResults.checks.push({
                    name: 'Unified Cache Access',
                    status: accessibleCount > 0 ? 'PASS' : 'WARNING',
                    details: `${accessibleCount}/${newKeys.length} מפתחות נגישים`
                });
            }
            
            // בדיקה 3: מדדי ביצועים
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.getStats) {
                const stats = await window.UnifiedCacheManager.getStats();
                validationResults.checks.push({
                    name: 'Performance Metrics',
                    status: 'INFO',
                    details: `Cache Hits: ${stats.hits}, Response Time: ${stats.averageResponseTime}ms`
                });
            }
            
            return validationResults;
            
        } catch (error) {
            validationResults.checks.push({
                name: 'Validation Error',
                status: 'ERROR',
                details: error.message
            });
            
            return validationResults;
        }
    }

    /**
     * Rollback במקרה של כשל
     * @param {string} systemName - שם המערכת
     * @param {string} migrationId - מזהה המיגרציה
     */
    async rollbackMigration(systemName, migrationId) {
        try {
            const backupData = this.rollbackData.get(systemName);
            if (!backupData) {
                throw new Error('אין נתוני גיבוי זמינים');
            }
            
            // שחזור נתונים ל-localStorage
            for (const [key, value] of Object.entries(backupData)) {
                if (this.isOriginalKey(key)) {
                    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                        await window.UnifiedCacheManager.save(key, value, {
                            layer: 'localStorage',
                            ttl: null, // persistent
                            syncToBackend: false
                        });
                    } else {
                        localStorage.setItem(key, value); // fallback
                    }
                }
            }
            
            // מחיקת נתונים חדשים ממערכת המטמון המאוחדת
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                for (const newKey of Object.values(this.migrationMap)) {
                    if (this.isSystemKey(newKey, systemName)) {
                        try {
                            await window.UnifiedCacheManager.remove(newKey);
                        } catch (error) {
                            // מפתח לא קיים - זה בסדר
                        }
                    }
                }
            }
            
            this.rollbackData.delete(systemName);
            this.logMigration(`🔄 Rollback הושלם: ${systemName}`, migrationId);
            
            return true;
            
        } catch (error) {
            throw new Error(`שגיאה ב-rollback: ${error.message}`);
        }
    }

    /**
     * דוח מיגרציה מפורט
     */
    generateMigrationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalSystems: this.stats.totalSystems,
                migratedSystems: this.stats.migratedSystems,
                failedSystems: this.stats.failedSystems,
                totalDataItems: this.stats.totalDataItems,
                migratedDataItems: this.stats.migratedDataItems,
                failedDataItems: this.stats.failedDataItems,
                successRate: this.stats.totalSystems > 0 ? 
                    (this.stats.migratedSystems / this.stats.totalSystems * 100).toFixed(2) + '%' : '0%'
            },
            migrationLog: this.migrationLog,
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    /**
     * יצירת המלצות על בסיס תוצאות המיגרציה
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.stats.failedSystems > 0) {
            recommendations.push({
                type: 'WARNING',
                message: `${this.stats.failedSystems} מערכות נכשלו במיגרציה`,
                action: 'בדוק את הלוגים ותקן שגיאות לפני המשך'
            });
        }
        
        if (this.stats.failedDataItems > 0) {
            recommendations.push({
                type: 'INFO',
                message: `${this.stats.failedDataItems} פריטי נתונים נכשלו`,
                action: 'בדוק אם הנתונים קיימים ב-localStorage המקורי'
            });
        }
        
        if (this.stats.migratedSystems === this.stats.totalSystems && this.stats.totalSystems > 0) {
            recommendations.push({
                type: 'SUCCESS',
                message: 'כל המערכות הועברו בהצלחה',
                action: 'ניתן להמשיך לשלב הבא - מחיקת קוד ישן'
            });
        }
        
        return recommendations;
    }

    // פונקציות עזר

    /**
     * בדיקה אם מפתח שייך למערכת
     */
    isSystemKey(key, systemName) {
        const systemKeyMappings = {
            'ui-utils': ['SectionHidden', 'collapsed'],
            'color-scheme': ['colorScheme', 'customColorScheme'],
            'header-system': ['headerFilters'],
            'css-management': ['css-duplicates-results'],
            'cash-flows': ['cashFlowsSectionState'],
            'executions': ['executionsTopSectionCollapsed'],
            'notifications': ['globalNotification', 'tiktrack_global_notifications'],
            'logs': ['lastExternalDataRefresh', 'cache_mode'],
            'system': ['tiktrack_cache_policies', 'tiktrack_memory_optimizer_settings', 'serverMonitorSettings']
        };
        
        const systemKeys = systemKeyMappings[systemName] || [];
        return systemKeys.some(systemKey => key.includes(systemKey));
    }

    /**
     * בדיקה אם זה מפתח מקורי (לocalStorage)
     */
    isOriginalKey(key) {
        return Object.keys(this.migrationMap).includes(key);
    }

    /**
     * פירוש נתונים
     */
    parseData(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            // אם זה לא JSON, החזר כמחרוזת
            return data;
        }
    }

    /**
     * מדיניות ברירת מחדל
     */
    getDefaultPolicy() {
        return {
            layer: 'localStorage',
            ttl: null,
            compress: false,
            syncToBackend: false
        };
    }

    /**
     * רישום לוג מיגרציה
     */
    logMigration(message, context = '') {
        const logEntry = {
            timestamp: new Date().toISOString(),
            message,
            context,
            level: message.includes('❌') ? 'ERROR' : 
                   message.includes('⚠️') ? 'WARNING' : 
                   message.includes('✅') ? 'SUCCESS' : 'INFO'
        };
        
        this.migrationLog.push(logEntry);
        console.log(`[Migration Helper] ${message}`, context ? `(${context})` : '');
    }

    /**
     * ניקוי נתוני rollback
     */
    cleanupRollbackData() {
        this.rollbackData.clear();
        this.logMigration('🧹 ניקוי נתוני rollback הושלם');
    }

    /**
     * איפוס סטטיסטיקות
     */
    resetStats() {
        this.stats = {
            totalSystems: 0,
            migratedSystems: 0,
            failedSystems: 0,
            totalDataItems: 0,
            migratedDataItems: 0,
            failedDataItems: 0
        };
        this.migrationLog = [];
        this.logMigration('🔄 איפוס סטטיסטיקות הושלם');
    }
}

// יצירת instance גלובלי
window.CacheMigrationHelper = new CacheMigrationHelper();

// הוספה למערכת האתחול המאוחדת
if (window.UnifiedInitializationSystem) {
    window.UnifiedInitializationSystem.addCoreSystem('CacheMigrationHelper', {
        initialize: async () => {
            console.log('🔧 CacheMigrationHelper initialized');
            return true;
        },
        dependencies: ['UnifiedCacheManager'],
        priority: 5
    });
}

console.log('✅ CacheMigrationHelper loaded successfully');
