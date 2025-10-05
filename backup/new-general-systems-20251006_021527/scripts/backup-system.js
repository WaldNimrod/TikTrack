/**
 * מערכת גיבוי אוטומטית - מיגרציה למערכת מטמון מאוחדת
 * TikTrack Automatic Backup System for Cache Migration
 * 
 * תאריך יצירה: 26 בינואר 2025
 * גרסה: 1.0
 * 
 * דוקומנטציה: CACHE_UNIFICATION_WORK_PLAN.md
 */

class BackupSystem {
    constructor() {
        this.backupPrefix = 'tiktrack_cache_migration_backup_';
        this.maxBackups = 5; // מקסימום 5 גיבויים
        this.backupInterval = 24 * 60 * 60 * 1000; // 24 שעות
        this.lastBackupTime = null;
        this.backupStats = {
            totalBackups: 0,
            successfulBackups: 0,
            failedBackups: 0,
            totalDataSize: 0,
            lastBackupSize: 0
        };
        
        // רשימת קבצים קריטיים לגיבוי
        this.criticalFiles = [
            'scripts/ui-utils.js',
            'scripts/color-scheme-system.js',
            'scripts/header-system.js',
            'scripts/css-management.js',
            'scripts/cash_flows.js',
            'scripts/executions.js',
            'scripts/notification-system.js',
            'scripts/preferences.js',
            'scripts/trading_accounts.js',
            'scripts/unified-cache-manager.js',
            'scripts/cache-sync-manager.js',
            'scripts/cache-policy-manager.js',
            'scripts/memory-optimizer.js'
        ];
        
        // רשימת עמודים קריטיים לגיבוי
        this.criticalPages = [
            'index.html',
            'trading_accounts.html',
            'executions.html',
            'preferences.html',
            'alerts.html',
            'css-management.html',
            'cash_flows.html',
            'trades.html',
            'research.html',
            'server-monitor.html',
            'system-management.html'
        ];
    }

    /**
     * יצירת גיבוי מלא לפני מיגרציה
     * @param {string} migrationType - סוג המיגרציה
     * @param {Object} options - אפשרויות גיבוי
     */
    async createFullBackup(migrationType = 'cache-migration', options = {}) {
        const backupId = this.generateBackupId();
        const startTime = Date.now();
        
        try {
            console.log(`🔄 יצירת גיבוי מלא: ${backupId}`);
            
            const backupData = {
                metadata: {
                    backupId,
                    timestamp: new Date().toISOString(),
                    migrationType,
                    version: '1.0',
                    createdBy: 'BackupSystem'
                },
                localStorage: {},
                indexedDB: {},
                systemFiles: {},
                pages: {},
                migrationConfig: options
            };

            // גיבוי localStorage
            backupData.localStorage = await this.backupLocalStorage();
            
            // גיבוי IndexedDB
            if (options.includeIndexedDB !== false) {
                backupData.indexedDB = await this.backupIndexedDB();
            }
            
            // גיבוי קבצי מערכת
            if (options.includeFiles !== false) {
                backupData.systemFiles = await this.backupSystemFiles();
            }
            
            // גיבוי עמודים
            if (options.includePages !== false) {
                backupData.pages = await this.backupPages();
            }
            
            // שמירת הגיבוי
            const backupSize = await this.saveBackup(backupId, backupData);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            this.backupStats.successfulBackups++;
            this.backupStats.totalDataSize += backupSize;
            this.backupStats.lastBackupSize = backupSize;
            this.lastBackupTime = new Date();
            
            console.log(`✅ גיבוי הושלם בהצלחה: ${backupId} (${this.formatBytes(backupSize)}, ${duration}ms)`);
            
            // ניקוי גיבויים ישנים
            await this.cleanupOldBackups();
            
            return {
                success: true,
                backupId,
                size: backupSize,
                duration,
                location: this.getBackupLocation(backupId)
            };
            
        } catch (error) {
            this.backupStats.failedBackups++;
            console.error(`❌ שגיאה ביצירת גיבוי: ${error.message}`);
            
            return {
                success: false,
                error: error.message,
                backupId
            };
        }
    }

    /**
     * גיבוי localStorage
     */
    async backupLocalStorage() {
        const localStorageData = {};
        
        try {
            // גיבוי כל המפתחות ב-localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && !key.startsWith(this.backupPrefix)) {
                    localStorageData[key] = localStorage.getItem(key);
                }
            }
            
            console.log(`💾 גיבוי localStorage: ${Object.keys(localStorageData).length} מפתחות`);
            return localStorageData;
            
        } catch (error) {
            throw new Error(`שגיאה בגיבוי localStorage: ${error.message}`);
        }
    }

    /**
     * גיבוי IndexedDB
     */
    async backupIndexedDB() {
        const indexedDBData = {};
        
        try {
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                // קבלת רשימת כל המפתחות במטמון
                const stats = await window.UnifiedCacheManager.getStats();
                
                // גיבוי נתונים מ-IndexedDB
                if (stats.layers && stats.layers.indexedDB) {
                    const indexedDBKeys = stats.layers.indexedDB.keys || [];
                    
                    for (const key of indexedDBKeys) {
                        try {
                            const data = await window.UnifiedCacheManager.get(key);
                            if (data) {
                                indexedDBData[key] = data;
                            }
                        } catch (error) {
                            console.warn(`⚠️ לא ניתן לגבות ${key} מ-IndexedDB:`, error);
                        }
                    }
                }
                
                console.log(`🗄️ גיבוי IndexedDB: ${Object.keys(indexedDBData).length} מפתחות`);
            } else {
                console.log('ℹ️ IndexedDB לא זמין לגיבוי');
            }
            
            return indexedDBData;
            
        } catch (error) {
            throw new Error(`שגיאה בגיבוי IndexedDB: ${error.message}`);
        }
    }

    /**
     * גיבוי קבצי מערכת
     */
    async backupSystemFiles() {
        const systemFiles = {};
        
        try {
            // גיבוי תוכן קבצי JavaScript קריטיים
            for (const filePath of this.criticalFiles) {
                try {
                    const response = await fetch(filePath);
                    if (response.ok) {
                        const content = await response.text();
                        systemFiles[filePath] = {
                            content,
                            lastModified: response.headers.get('last-modified'),
                            size: content.length
                        };
                    }
                } catch (error) {
                    console.warn(`⚠️ לא ניתן לגבות קובץ ${filePath}:`, error);
                }
            }
            
            console.log(`📁 גיבוי קבצי מערכת: ${Object.keys(systemFiles).length} קבצים`);
            return systemFiles;
            
        } catch (error) {
            throw new Error(`שגיאה בגיבוי קבצי מערכת: ${error.message}`);
        }
    }

    /**
     * גיבוי עמודים
     */
    async backupPages() {
        const pages = {};
        
        try {
            // גיבוי תוכן עמודים קריטיים
            for (const pagePath of this.criticalPages) {
                try {
                    const response = await fetch(pagePath);
                    if (response.ok) {
                        const content = await response.text();
                        pages[pagePath] = {
                            content,
                            lastModified: response.headers.get('last-modified'),
                            size: content.length
                        };
                    }
                } catch (error) {
                    console.warn(`⚠️ לא ניתן לגבות עמוד ${pagePath}:`, error);
                }
            }
            
            console.log(`📄 גיבוי עמודים: ${Object.keys(pages).length} עמודים`);
            return pages;
            
        } catch (error) {
            throw new Error(`שגיאה בגיבוי עמודים: ${error.message}`);
        }
    }

    /**
     * שמירת הגיבוי
     * @param {string} backupId - מזהה הגיבוי
     * @param {Object} backupData - נתוני הגיבוי
     */
    async saveBackup(backupId, backupData) {
        try {
            // המרה ל-JSON
            const jsonData = JSON.stringify(backupData, null, 2);
            const dataSize = new Blob([jsonData]).size;
            
            // שמירה ב-localStorage (אם יש מקום)
            if (dataSize < 5 * 1024 * 1024) { // פחות מ-5MB
                const storageKey = `${this.backupPrefix}${backupId}`;
                localStorage.setItem(storageKey, jsonData);
                console.log(`💾 גיבוי נשמר ב-localStorage: ${storageKey}`);
            } else {
                // שמירה ב-IndexedDB (אם זמין)
                if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                    await window.UnifiedCacheManager.save(
                        `${this.backupPrefix}${backupId}`,
                        backupData,
                        {
                            layer: 'indexedDB',
                            compress: true,
                            ttl: 30 * 24 * 60 * 60 * 1000 // 30 ימים
                        }
                    );
                    console.log(`🗄️ גיבוי נשמר ב-IndexedDB: ${backupId}`);
                } else {
                    throw new Error('אין מקום מספיק לשמירת הגיבוי');
                }
            }
            
            return dataSize;
            
        } catch (error) {
            throw new Error(`שגיאה בשמירת הגיבוי: ${error.message}`);
        }
    }

    /**
     * שחזור מגיבוי
     * @param {string} backupId - מזהה הגיבוי
     * @param {Object} options - אפשרויות שחזור
     */
    async restoreFromBackup(backupId, options = {}) {
        try {
            console.log(`🔄 שחזור מגיבוי: ${backupId}`);
            
            // טעינת נתוני הגיבוי
            const backupData = await this.loadBackup(backupId);
            if (!backupData) {
                throw new Error(`גיבוי ${backupId} לא נמצא`);
            }
            
            // שחזור localStorage
            if (options.restoreLocalStorage !== false && backupData.localStorage) {
                await this.restoreLocalStorage(backupData.localStorage);
            }
            
            // שחזור IndexedDB
            if (options.restoreIndexedDB !== false && backupData.indexedDB) {
                await this.restoreIndexedDB(backupData.indexedDB);
            }
            
            console.log(`✅ שחזור הושלם בהצלחה: ${backupId}`);
            
            return {
                success: true,
                backupId,
                restoredItems: {
                    localStorage: Object.keys(backupData.localStorage || {}).length,
                    indexedDB: Object.keys(backupData.indexedDB || {}).length
                }
            };
            
        } catch (error) {
            console.error(`❌ שגיאה בשחזור: ${error.message}`);
            
            return {
                success: false,
                error: error.message,
                backupId
            };
        }
    }

    /**
     * טעינת גיבוי
     * @param {string} backupId - מזהה הגיבוי
     */
    async loadBackup(backupId) {
        try {
            // ניסיון טעינה מ-localStorage
            const storageKey = `${this.backupPrefix}${backupId}`;
            const localData = localStorage.getItem(storageKey);
            
            if (localData) {
                return JSON.parse(localData);
            }
            
            // ניסיון טעינה מ-IndexedDB
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                const indexedData = await window.UnifiedCacheManager.get(storageKey);
                if (indexedData) {
                    return indexedData;
                }
            }
            
            return null;
            
        } catch (error) {
            throw new Error(`שגיאה בטעינת גיבוי: ${error.message}`);
        }
    }

    /**
     * שחזור localStorage
     * @param {Object} localStorageData - נתוני localStorage
     */
    async restoreLocalStorage(localStorageData) {
        try {
            // מחיקת localStorage הנוכחי
            localStorage.clear();
            
            // שחזור נתונים
            for (const [key, value] of Object.entries(localStorageData)) {
                localStorage.setItem(key, value);
            }
            
            console.log(`💾 שחזור localStorage: ${Object.keys(localStorageData).length} מפתחות`);
            
        } catch (error) {
            throw new Error(`שגיאה בשחזור localStorage: ${error.message}`);
        }
    }

    /**
     * שחזור IndexedDB
     * @param {Object} indexedDBData - נתוני IndexedDB
     */
    async restoreIndexedDB(indexedDBData) {
        try {
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                // ניקוי IndexedDB הנוכחי
                await window.UnifiedCacheManager.clear('indexedDB');
                
                // שחזור נתונים
                for (const [key, value] of Object.entries(indexedDBData)) {
                    await window.UnifiedCacheManager.save(key, value, {
                        layer: 'indexedDB',
                        compress: true
                    });
                }
                
                console.log(`🗄️ שחזור IndexedDB: ${Object.keys(indexedDBData).length} מפתחות`);
            }
            
        } catch (error) {
            throw new Error(`שגיאה בשחזור IndexedDB: ${error.message}`);
        }
    }

    /**
     * רשימת גיבויים זמינים
     */
    async listAvailableBackups() {
        const backups = [];
        
        try {
            // חיפוש ב-localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.backupPrefix)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        if (data && data.metadata) {
                            backups.push({
                                id: data.metadata.backupId,
                                timestamp: data.metadata.timestamp,
                                migrationType: data.metadata.migrationType,
                                size: JSON.stringify(data).length,
                                location: 'localStorage'
                            });
                        }
                    } catch (error) {
                        console.warn(`⚠️ שגיאה בטעינת גיבוי ${key}:`, error);
                    }
                }
            }
            
            // חיפוש ב-IndexedDB
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                // כאן נוכל להוסיף חיפוש ב-IndexedDB אם נדרש
            }
            
            // מיון לפי תאריך (החדש ביותר ראשון)
            backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            return backups;
            
        } catch (error) {
            throw new Error(`שגיאה ברשימת גיבויים: ${error.message}`);
        }
    }

    /**
     * מחיקת גיבויים ישנים
     */
    async cleanupOldBackups() {
        try {
            const backups = await this.listAvailableBackups();
            
            if (backups.length > this.maxBackups) {
                const backupsToDelete = backups.slice(this.maxBackups);
                
                for (const backup of backupsToDelete) {
                    await this.deleteBackup(backup.id);
                }
                
                console.log(`🧹 ניקוי גיבויים: ${backupsToDelete.length} גיבויים ישנים נמחקו`);
            }
            
        } catch (error) {
            console.warn(`⚠️ שגיאה בניקוי גיבויים: ${error.message}`);
        }
    }

    /**
     * מחיקת גיבוי
     * @param {string} backupId - מזהה הגיבוי
     */
    async deleteBackup(backupId) {
        try {
            const storageKey = `${this.backupPrefix}${backupId}`;
            
            // מחיקה מ-localStorage
            localStorage.removeItem(storageKey);
            
            // מחיקה מ-IndexedDB
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                await window.UnifiedCacheManager.remove(storageKey);
            }
            
            console.log(`🗑️ גיבוי נמחק: ${backupId}`);
            
        } catch (error) {
            throw new Error(`שגיאה במחיקת גיבוי: ${error.message}`);
        }
    }

    /**
     * דוח סטטיסטיקות גיבוי
     */
    getBackupStats() {
        return {
            ...this.backupStats,
            lastBackupTime: this.lastBackupTime,
            successRate: this.backupStats.totalBackups > 0 ? 
                (this.backupStats.successfulBackups / this.backupStats.totalBackups * 100).toFixed(2) + '%' : '0%'
        };
    }

    // פונקציות עזר

    /**
     * יצירת מזהה גיבוי
     */
    generateBackupId() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const random = Math.random().toString(36).substr(2, 5);
        return `${timestamp}_${random}`;
    }

    /**
     * מיקום הגיבוי
     */
    getBackupLocation(backupId) {
        return `${this.backupPrefix}${backupId}`;
    }

    /**
     * עיצוב גודל בקילובייטים
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * בדיקת זמינות גיבוי אוטומטי
     */
    shouldCreateAutoBackup() {
        if (!this.lastBackupTime) return true;
        
        const timeSinceLastBackup = Date.now() - this.lastBackupTime.getTime();
        return timeSinceLastBackup > this.backupInterval;
    }
}

// יצירת instance גלובלי
window.BackupSystem = new BackupSystem();

// הוספה למערכת האתחול המאוחדת
if (window.UnifiedInitializationSystem) {
    window.UnifiedInitializationSystem.addCoreSystem('BackupSystem', {
        initialize: async () => {
            console.log('💾 BackupSystem initialized');
            
            // בדיקה אם צריך ליצור גיבוי אוטומטי
            if (window.BackupSystem.shouldCreateAutoBackup()) {
                console.log('🔄 יצירת גיבוי אוטומטי...');
                try {
                    await window.BackupSystem.createFullBackup('auto-backup', {
                        includeIndexedDB: true,
                        includeFiles: false,
                        includePages: false
                    });
                } catch (error) {
                    console.warn('⚠️ שגיאה בגיבוי אוטומטי:', error);
                }
            }
            
            return true;
        },
        dependencies: ['UnifiedCacheManager'],
        priority: 3
    });
}

console.log('✅ BackupSystem loaded successfully');
