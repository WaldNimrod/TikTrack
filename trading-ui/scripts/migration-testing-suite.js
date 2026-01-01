/**
 * כלי בדיקות מיגרציה - מערכת מטמון מאוחדת
 * TikTrack Migration Testing Suite
 * 
 * תאריך יצירה: 26 בינואר 2025
 * גרסה: 1.0
 * 
 * דוקומנטציה: CACHE_UNIFICATION_WORK_PLAN.md
 */

class MigrationTestingSuite {
    constructor() {
        this.testResults = [];
        this.currentTestSuite = null;
        this.testStats = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            startTime: null,
            endTime: null
        };
        
        // הגדרות בדיקות
        this.settings = {
            timeout: 30000, // 30 שניות
            retryAttempts: 3,
            enableDetailedLogging: true,
            autoRunAfterMigration: true
        };
        
        // רשימת בדיקות זמינות
        this.availableTests = [
            'basic-cache-operations',
            'localStorage-migration',
            'indexeddb-migration',
            'cross-page-consistency',
            'performance-benchmark',
            'error-handling',
            'rollback-functionality',
            'data-integrity'
        ];
    }

    /**
     * הרצת כל הבדיקות
     */
    async runAllTests() {
        const suiteId = this.startTestSuite('Migration Full Test Suite');
        
        try {
            window.Logger?.info('🧪 התחלת בדיקות מיגרציה מלאות...');
            
            for (const testName of this.availableTests) {
                await this.runTest(testName);
            }
            
            const results = this.endTestSuite(suiteId);
            this.generateTestReport();
            
            return results;
            
        } catch (error) {
            window.Logger?.error('❌ שגיאה בהרצת בדיקות:', error);
            return this.endTestSuite(suiteId, 'FAILED');
        }
    }

    /**
     * בדיקת פעולות מטמון בסיסיות
     */
    async testBasicCacheOperations() {
        const testName = 'basic-cache-operations';
        const testId = this.startTest(testName);
        
        try {
            // בדיקה 1: זמינות UnifiedCacheManager
            if (!window.UnifiedCacheManager) {
                throw new Error('UnifiedCacheManager לא זמין');
            }
            
            // בדיקה 2: אתחול מערכת
            if (!window.UnifiedCacheManager.isInitialized()) {
                await window.UnifiedCacheManager.initialize();
            }
            
            // בדיקה 3: שמירה וקבלה
            const testData = { test: 'data', timestamp: Date.now() };
            await window.UnifiedCacheManager.save('test-key', testData);
            const retrieved = await window.UnifiedCacheManager.get('test-key');
            
            if (JSON.stringify(retrieved) !== JSON.stringify(testData)) {
                throw new Error('נתונים לא תואמים');
            }
            
            // בדיקה 4: מחיקה
            await window.UnifiedCacheManager.remove('test-key');
            const afterDelete = await window.UnifiedCacheManager.get('test-key');
            
            if (afterDelete !== null) {
                throw new Error('נתונים לא נמחקו');
            }
            
            this.endTest(testId, 'PASSED', 'כל הפעולות הבסיסיות עובדות תקין');
            
        } catch (error) {
            this.endTest(testId, 'FAILED', error.message);
        }
    }

    /**
     * בדיקת מיגרציה מ-localStorage
     */
    async testLocalStorageMigration() {
        const testName = 'localStorage-migration';
        const testId = this.startTest(testName);
        
        try {
            // הכנת נתוני בדיקה
            const testKeys = ['test-key-1', 'test-key-2', 'colorScheme'];
            const testData = {
                'test-key-1': JSON.stringify({ data: 'test1' }),
                'test-key-2': JSON.stringify({ data: 'test2' }),
                'colorScheme': 'light'
            };
            
            // שמירת נתונים ב-localStorage
            for (const [key, value] of Object.entries(testData)) {
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
            
            // מיגרציה באמצעות CacheMigrationHelper
            if (window.CacheMigrationHelper) {
                const result = await window.CacheMigrationHelper.migrateSystem('test-system', {
                    testKeys: testKeys
                });
                
                if (!result.success) {
                    throw new Error(`מיגרציה נכשלה: ${result.error}`);
                }
            }
            
            // בדיקה שהנתונים הועברו
            for (const key of testKeys) {
                const newKey = `migrated-${key}`;
                const data = await window.UnifiedCacheManager.get(newKey);
                
                if (!data) {
                    throw new Error(`נתון ${key} לא הועבר`);
                }
            }
            
            // בדיקה שהנתונים הישנים נמחקו
            for (const key of testKeys) {
                let value = null;
                if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                    value = await window.UnifiedCacheManager.get(key);
                } else {
                    value = localStorage.getItem(key); // fallback
                }
                
                if (value) {
                    throw new Error(`נתון ישן ${key} לא נמחק`);
                }
            }
            
            this.endTest(testId, 'PASSED', 'מיגרציה מ-localStorage הושלמה בהצלחה');
            
        } catch (error) {
            this.endTest(testId, 'FAILED', error.message);
        }
    }

    /**
     * בדיקת מיגרציה מ-IndexedDB
     */
    async testIndexedDBMigration() {
        const testName = 'indexeddb-migration';
        const testId = this.startTest(testName);
        
        try {
            // בדיקת זמינות IndexedDB
            if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.isInitialized()) {
                throw new Error('UnifiedCacheManager לא זמין');
            }
            
            // הכנת נתוני בדיקה גדולים
            const largeData = {
                notifications: Array.from({ length: 1000 }, (_, i) => ({
                    id: i,
                    message: `Notification ${i}`,
                    timestamp: Date.now() - i * 1000
                })),
                logs: Array.from({ length: 5000 }, (_, i) => ({
                    id: i,
                    level: ['INFO', 'WARNING', 'ERROR'][i % 3],
                    message: `Log entry ${i}`
                }))
            };
            
            // שמירה ב-IndexedDB
            await window.UnifiedCacheManager.save('large-notifications', largeData.notifications, {
                layer: 'indexedDB',
                compress: true
            });
            
            await window.UnifiedCacheManager.save('large-logs', largeData.logs, {
                layer: 'indexedDB',
                compress: true
            });
            
            // בדיקת גישה לנתונים
            const retrievedNotifications = await window.UnifiedCacheManager.get('large-notifications');
            const retrievedLogs = await window.UnifiedCacheManager.get('large-logs');
            
            if (retrievedNotifications.length !== largeData.notifications.length) {
                throw new Error('נתוני התראות לא תואמים');
            }
            
            if (retrievedLogs.length !== largeData.logs.length) {
                throw new Error('נתוני לוגים לא תואמים');
            }
            
            // בדיקת ביצועים
            const startTime = Date.now();
            await window.UnifiedCacheManager.get('large-notifications');
            const responseTime = Date.now() - startTime;
            
            if (responseTime > 1000) { // יותר משנייה
                this.logWarning(`זמן תגובה איטי: ${responseTime}ms`);
            }
            
            this.endTest(testId, 'PASSED', `מיגרציה מ-IndexedDB הושלמה (${responseTime}ms)`);
            
        } catch (error) {
            this.endTest(testId, 'FAILED', error.message);
        }
    }

    /**
     * בדיקת עקביות בין עמודים
     */
    async testCrossPageConsistency() {
        const testName = 'cross-page-consistency';
        const testId = this.startTest(testName);
        
        try {
            // בדיקת שמירת העדפות משתמש
            const userPrefs = {
                theme: 'light',
                language: 'he',
                notifications: true,
                autoRefresh: false
            };
            
            await window.UnifiedCacheManager.save('user-preferences', userPrefs, {
                syncToBackend: true
            });
            
            // סימולציה של מעבר עמוד
            const retrievedPrefs = await window.UnifiedCacheManager.get('user-preferences');
            
            if (JSON.stringify(retrievedPrefs) !== JSON.stringify(userPrefs)) {
                throw new Error('העדפות משתמש לא עקביות');
            }
            
            // שמירה ב-UnifiedCacheManager (במקום CacheSyncManager שהוסר)
            if (window.UnifiedCacheManager?.isInitialized()) {
                await window.UnifiedCacheManager.save('user-preferences', userPrefs, {
                    layer: 'localStorage',
                    ttl: null
                });
                window.Logger?.info('✅ User preferences saved to UnifiedCacheManager');
            }
            
            this.endTest(testId, 'PASSED', 'עקביות בין עמודים תקינה');
            
        } catch (error) {
            this.endTest(testId, 'FAILED', error.message);
        }
    }

    /**
     * בדיקת ביצועים
     */
    async testPerformanceBenchmark() {
        const testName = 'performance-benchmark';
        const testId = this.startTest(testName);
        
        try {
            const benchmarks = {};
            
            // בדיקת זמן שמירה
            const saveData = Array.from({ length: 1000 }, (_, i) => ({ id: i, data: `item-${i}` }));
            const saveStart = Date.now();
            await window.UnifiedCacheManager.save('benchmark-save', saveData);
            benchmarks.saveTime = Date.now() - saveStart;
            
            // בדיקת זמן קבלה
            const getStart = Date.now();
            const retrieved = await window.UnifiedCacheManager.get('benchmark-save');
            benchmarks.getTime = Date.now() - getStart;
            
            // בדיקת זמן מחיקה
            const deleteStart = Date.now();
            await window.UnifiedCacheManager.remove('benchmark-save');
            benchmarks.deleteTime = Date.now() - deleteStart;
            
            // בדיקת זמני תגובה מקובלים
            const thresholds = {
                saveTime: 500,   // 500ms
                getTime: 200,    // 200ms
                deleteTime: 100  // 100ms
            };
            
            for (const [operation, time] of Object.entries(benchmarks)) {
                if (time > thresholds[operation]) {
                    this.logWarning(`ביצועים איטיים ב-${operation}: ${time}ms (סף: ${thresholds[operation]}ms)`);
                }
            }
            
            this.endTest(testId, 'PASSED', `ביצועים: שמירה ${benchmarks.saveTime}ms, קבלה ${benchmarks.getTime}ms`);
            
        } catch (error) {
            this.endTest(testId, 'FAILED', error.message);
        }
    }

    /**
     * בדיקת טיפול בשגיאות
     */
    async testErrorHandling() {
        const testName = 'error-handling';
        const testId = this.startTest(testName);
        
        try {
            // בדיקת טיפול בנתונים לא תקינים
            try {
                await window.UnifiedCacheManager.save('invalid-key', null);
            } catch (error) {
                // זה בסדר - צריך לזרוק שגיאה
            }
            
            // בדיקת טיפול במפתח לא קיים
            const nonExistent = await window.UnifiedCacheManager.get('non-existent-key');
            if (nonExistent !== null) {
                throw new Error('החזרת נתונים למפתח לא קיים');
            }
            
            // בדיקת rollback במקרה של כשל
            if (window.CacheMigrationHelper) {
                // ניסיון מיגרציה עם נתונים לא תקינים
                const result = await window.CacheMigrationHelper.migrateSystem('error-test', {
                    forceError: true
                });
                
                if (result.success) {
                    throw new Error('מיגרציה לא אמורה להצליח עם נתונים לא תקינים');
                }
            }
            
            this.endTest(testId, 'PASSED', 'טיפול בשגיאות תקין');
            
        } catch (error) {
            this.endTest(testId, 'FAILED', error.message);
        }
    }

    /**
     * בדיקת פונקציונליות rollback
     */
    async testRollbackFunctionality() {
        const testName = 'rollback-functionality';
        const testId = this.startTest(testName);
        
        try {
            if (!window.CacheMigrationHelper) {
                throw new Error('CacheMigrationHelper לא זמין');
            }
            
            // יצירת גיבוי
            const originalData = { test: 'original', timestamp: Date.now() };
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                await window.UnifiedCacheManager.save('rollback-test', originalData, {
                    layer: 'localStorage',
                    ttl: null, // persistent
                    syncToBackend: false
                });
            } else {
                localStorage.setItem('rollback-test', JSON.stringify(originalData)); // fallback
            }
            
            // מיגרציה
            const migrationResult = await window.CacheMigrationHelper.migrateSystem('rollback-test', {
                testKeys: ['rollback-test']
            });
            
            // rollback
            if (migrationResult.success) {
                await window.CacheMigrationHelper.rollbackMigration('rollback-test', migrationResult.migrationId);
                
                // בדיקה שהנתונים חזרו
                let restoredData = null;
                if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                    restoredData = await window.UnifiedCacheManager.get('rollback-test');
                } else {
                    restoredData = localStorage.getItem('rollback-test'); // fallback
                }
                
                const parsedData = typeof restoredData === 'string' ? JSON.parse(restoredData) : restoredData;
                if (!restoredData || parsedData.test !== 'original') {
                    throw new Error('Rollback לא שחזר את הנתונים המקוריים');
                }
            }
            
            this.endTest(testId, 'PASSED', 'פונקציונליות rollback תקינה');
            
        } catch (error) {
            this.endTest(testId, 'FAILED', error.message);
        }
    }

    /**
     * בדיקת שלמות נתונים
     */
    async testDataIntegrity() {
        const testName = 'data-integrity';
        const testId = this.startTest(testName);
        
        try {
            // בדיקת checksum של נתונים
            const testData = {
                accounts: [
                    { id: 1, name: 'Account 1', balance: 1000 },
                    { id: 2, name: 'Account 2', balance: 2000 }
                ],
                trades: [
                    { id: 1, accountId: 1, amount: 100, timestamp: Date.now() },
                    { id: 2, accountId: 2, amount: 200, timestamp: Date.now() }
                ]
            };
            
            // שמירה עם checksum
            const checksum = this.calculateChecksum(testData);
            const dataWithChecksum = { ...testData, _checksum: checksum };
            
            await window.UnifiedCacheManager.save('integrity-test', dataWithChecksum);
            
            // קבלה ובדיקת checksum
            const retrieved = await window.UnifiedCacheManager.get('integrity-test');
            const retrievedChecksum = this.calculateChecksum(retrieved);
            
            if (retrieved._checksum !== checksum) {
                throw new Error('Checksum לא תואם - נתונים פגומים');
            }
            
            // בדיקת מבנה נתונים
            if (!retrieved.accounts || !Array.isArray(retrieved.accounts)) {
                throw new Error('מבנה נתונים לא תקין');
            }
            
            this.endTest(testId, 'PASSED', 'שלמות נתונים תקינה');
            
        } catch (error) {
            this.endTest(testId, 'FAILED', error.message);
        }
    }

    // פונקציות עזר

    /**
     * התחלת בדיקה
     */
    startTest(testName) {
        const testId = `test-${testName}-${Date.now()}`;
        this.testResults.push({
            id: testId,
            name: testName,
            startTime: Date.now(),
            status: 'RUNNING'
        });
        
        return testId;
    }

    /**
     * סיום בדיקה
     */
    endTest(testId, status, message = '') {
        const test = this.testResults.find(t => t.id === testId);
        if (test) {
            test.endTime = Date.now();
            test.duration = test.endTime - test.startTime;
            test.status = status;
            test.message = message;
            
            this.testStats.totalTests++;
            this.testStats[`${status.toLowerCase()}Tests`]++;
            
            const statusIcon = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⏭️';
            window.Logger?.info(`${statusIcon} ${test.name}: ${message} (${test.duration}ms)`);
        }
        
        return test;
    }

    /**
     * התחלת סדרת בדיקות
     */
    startTestSuite(suiteName) {
        const suiteId = `suite-${suiteName}-${Date.now()}`;
        this.currentTestSuite = {
            id: suiteId,
            name: suiteName,
            startTime: Date.now(),
            tests: []
        };
        
        this.testStats.startTime = Date.now();
        window.Logger?.info(`🧪 התחלת סדרת בדיקות: ${suiteName}`);
        
        return suiteId;
    }

    /**
     * סיום סדרת בדיקות
     */
    endTestSuite(suiteId, status = 'COMPLETED') {
        if (this.currentTestSuite && this.currentTestSuite.id === suiteId) {
            this.currentTestSuite.endTime = Date.now();
            this.currentTestSuite.duration = this.currentTestSuite.endTime - this.currentTestSuite.startTime;
            this.currentTestSuite.status = status;
            
            this.testStats.endTime = Date.now();
            
            const successRate = this.testStats.totalTests > 0 ? 
                (this.testStats.passedTests / this.testStats.totalTests * 100).toFixed(2) : 0;
            
            window.Logger?.info(`🏁 סיום סדרת בדיקות: ${status}`);
            window.Logger?.info(`📊 תוצאות: ${this.testStats.passedTests}/${this.testStats.totalTests} הצליחו (${successRate}%)`);
            
            return {
                ...this.currentTestSuite,
                stats: this.testStats,
                results: this.testResults
            };
        }
        
        return null;
    }

    /**
     * יצירת דוח בדיקות
     */
    generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            suite: this.currentTestSuite,
            stats: this.testStats,
            results: this.testResults,
            summary: {
                successRate: this.testStats.totalTests > 0 ? 
                    (this.testStats.passedTests / this.testStats.totalTests * 100).toFixed(2) + '%' : '0%',
                totalDuration: this.testStats.endTime - this.testStats.startTime,
                averageTestTime: this.testResults.length > 0 ? 
                    this.testResults.reduce((sum, test) => sum + (test.duration || 0), 0) / this.testResults.length : 0
            }
        };
        
        // שמירת הדוח
        if (window.MigrationLogger) {
            window.MigrationLogger.info('דוח בדיקות מיגרציה נוצר', 'testing', report);
        }
        
        return report;
    }

    /**
     * חישוב checksum
     */
    calculateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    /**
     * רישום אזהרה
     */
    logWarning(message) {
        if (window.MigrationLogger) {
            window.MigrationLogger.warning(message, 'testing');
        } else {
            window.Logger?.warn(`⚠️ ${message}`);
        }
    }

    /**
     * הרצת בדיקה ספציפית
     */
    async runTest(testName) {
        const testMethod = this[`test${testName.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join('')}`];
        
        if (typeof testMethod === 'function') {
            await testMethod.call(this);
        } else {
            window.Logger?.warn(`⚠️ בדיקה לא נמצאה: ${testName}`);
        }
    }
}

// יצירת instance גלובלי
window.MigrationTestingSuite = new MigrationTestingSuite();

// הוספה למערכת האתחול המאוחדת
if (window.UnifiedInitializationSystem) {
    window.UnifiedInitializationSystem.addCoreSystem('MigrationTestingSuite', {
        initialize: async () => {
            window.Logger?.info('🧪 MigrationTestingSuite initialized');
            return true;
        },
        dependencies: ['UnifiedCacheManager', 'MigrationLogger'],
        priority: 6
    });
}

window.Logger?.info('✅ MigrationTestingSuite loaded successfully');
