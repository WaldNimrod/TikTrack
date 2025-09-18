/**
 * בדיקה מקיפה של תשתית IndexedDB - שלב 2.5.1
 *
 * @description מבצע בדיקות מקיפות על כל פונקציונליות IndexedDBAdapter
 * @version 1.0.0
 * @since 2025-01-18
 */

class IndexedDBTester {
    constructor() {
        this.adapter = null;
        this.testResults = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
        this.testData = {
            validPoint: {
                timestamp: new Date().toISOString(),
                sessionId: 'test_session_123',
                metrics: {
                    totalFiles: 156,
                    errors: 24,
                    warnings: 45,
                    qualityScore: 67,
                    scanDuration: 8500
                }
            },
            invalidPoint: {
                metrics: {
                    totalFiles: 'invalid',
                    errors: -5,
                    qualityScore: 150
                }
            }
        };
    }

    /**
     * הרצת כל הבדיקות
     */
    async runAllTests() {
        console.log('🧪 מתחיל בדיקה מקיפה של IndexedDB...');

        try {
            // אתחול Adapter
            this.adapter = new IndexedDBAdapter();

            // בדיקות בסיסיות
            await this.testInitialization();
            await this.testSchemaCreation();
            await this.testDataValidation();
            await this.testSaveOperations();
            await this.testReadOperations();
            await this.testCleanupOperations();
            await this.testPerformance();
            await this.testErrorHandling();

            // סיכום
            this.printSummary();

        } catch (error) {
            console.error('❌ שגיאה בבדיקה:', error);
            this.logError('General Test Failure', error);
        } finally {
            // ניקוי
            if (this.adapter && this.adapter.isReady()) {
                await this.adapter.clearAllData();
                this.adapter.close();
            }
        }
    }

    /**
     * בדיקת אתחול
     */
    async testInitialization() {
        console.log('🔧 בודק אתחול...');

        try {
            await this.adapter.initialize();

            this.assert(this.adapter.isReady(), 'Adapter should be ready after initialization');
            this.assert(this.adapter.db !== null, 'Database should be initialized');

            console.log('✅ אתחול הצליח');
            this.testPassed('testInitialization');

        } catch (error) {
            console.error('❌ שגיאה באתחול:', error);
            this.testFailed('testInitialization', error);
        }
    }

    /**
     * בדיקת יצירת Schema
     */
    async testSchemaCreation() {
        console.log('📊 בודק יצירת Schema...');

        try {
            const stores = this.adapter.db.objectStoreNames;
            this.assert(stores.contains('chart_history'), 'chart_history store should exist');
            this.assert(stores.contains('system_logs'), 'system_logs store should exist');

            // בדיקת אינדקסים
            const transaction = this.adapter.db.transaction(['chart_history'], 'readonly');
            const store = transaction.objectStore('chart_history');
            const indexes = store.indexNames;

            this.assert(indexes.contains('timestamp'), 'timestamp index should exist');
            this.assert(indexes.contains('sessionId'), 'sessionId index should exist');
            this.assert(indexes.contains('qualityScore'), 'qualityScore index should exist');
            this.assert(indexes.contains('errorCount'), 'errorCount index should exist');

            console.log('✅ Schema נוצר נכון');
            this.testPassed('testSchemaCreation');

        } catch (error) {
            console.error('❌ שגיאה בבדיקת Schema:', error);
            this.testFailed('testSchemaCreation', error);
        }
    }

    /**
     * בדיקת validation של נתונים
     */
    async testDataValidation() {
        console.log('🔍 בודק validation...');

        try {
            // בדיקת נתונים תקינים
            const validResult = this.adapter.validateDataPoint(this.testData.validPoint);
            this.assert(validResult === undefined, 'Valid data should not throw error');

            // בדיקת נתונים לא תקינים
            let errorThrown = false;
            try {
                this.adapter.validateDataPoint(this.testData.invalidPoint);
            } catch (error) {
                errorThrown = true;
                this.assert(error.message.includes('חייב להיות מספר'), 'Should validate numeric fields');
            }
            this.assert(errorThrown, 'Invalid data should throw error');

            console.log('✅ Validation עובד נכון');
            this.testPassed('testDataValidation');

        } catch (error) {
            console.error('❌ שגיאה בבדיקת Validation:', error);
            this.testFailed('testDataValidation', error);
        }
    }

    /**
     * בדיקת פעולות שמירה
     */
    async testSaveOperations() {
        console.log('💾 בודק פעולות שמירה...');

        try {
            // שמירת נקודה בודדת
            const savedId = await this.adapter.saveDataPoint(this.testData.validPoint);
            this.assert(typeof savedId === 'string' && savedId.length > 0, 'Should return valid ID');

            // שמירת מערך נקודות
            const batchData = [
                { ...this.testData.validPoint, id: 'batch_1' },
                { ...this.testData.validPoint, id: 'batch_2' },
                { ...this.testData.validPoint, id: 'batch_3' }
            ];

            const batchResults = await this.adapter.saveBatch(batchData);
            this.assert(Array.isArray(batchResults), 'Should return array of IDs');
            this.assert(batchResults.length === 3, 'Should save all points');

            console.log('✅ פעולות שמירה עובדות');
            this.testPassed('testSaveOperations');

        } catch (error) {
            console.error('❌ שגיאה בבדיקת שמירה:', error);
            this.testFailed('testSaveOperations', error);
        }
    }

    /**
     * בדיקת פעולות קריאה
     */
    async testReadOperations() {
        console.log('📖 בודק פעולות קריאה...');

        try {
            // הכנת נתונים לבדיקה
            const testPoints = [];
            for (let i = 0; i < 5; i++) {
                const point = {
                    ...this.testData.validPoint,
                    id: `read_test_${i}`,
                    timestamp: new Date(Date.now() - (i * 60 * 60 * 1000)).toISOString(), // שעה אחורה לכל נקודה
                    metrics: {
                        ...this.testData.validPoint.metrics,
                        totalFiles: 100 + i * 10
                    }
                };
                testPoints.push(point);
            }
            await this.adapter.saveBatch(testPoints);

            // בדיקת קריאה לפי שעות
            const historyData = await this.adapter.loadHistory(2);
            this.assert(Array.isArray(historyData), 'Should return array');
            this.assert(historyData.length >= 2, 'Should return recent points');

            // בדיקת קריאה לפי מספר
            const lastPoints = await this.adapter.loadLastNPoints(3);
            this.assert(Array.isArray(lastPoints), 'Should return array');
            this.assert(lastPoints.length === 3, 'Should return exact count');

            // בדיקת קריאה לפי מזהה
            const singlePoint = await this.adapter.loadById('read_test_0');
            this.assert(singlePoint !== null, 'Should find point by ID');
            this.assert(singlePoint.id === 'read_test_0', 'Should return correct point');

            // בדיקת קריאה לפי טווח תאריכים
            const startDate = new Date(Date.now() - (24 * 60 * 60 * 1000));
            const endDate = new Date();
            const rangeData = await this.adapter.loadByDateRange(startDate, endDate);
            this.assert(Array.isArray(rangeData), 'Should return array for date range');

            console.log('✅ פעולות קריאה עובדות');
            this.testPassed('testReadOperations');

        } catch (error) {
            console.error('❌ שגיאה בבדיקת קריאה:', error);
            this.testFailed('testReadOperations', error);
        }
    }

    /**
     * בדיקת פעולות ניקוי
     */
    async testCleanupOperations() {
        console.log('🗑️ בודק פעולות ניקוי...');

        try {
            // הוספת נתונים ישנים
            const oldPoint = {
                ...this.testData.validPoint,
                id: 'old_point',
                timestamp: new Date(Date.now() - (48 * 60 * 60 * 1000)).toISOString() // 48 שעות אחורה
            };
            await this.adapter.saveDataPoint(oldPoint);

            // בדיקת סטטיסטיקות לפני ניקוי
            const beforeStats = await this.adapter.getStats();
            this.assert(beforeStats.chartHistory.count >= 1, 'Should have data before cleanup');

            // בדיקת ניקוי נתונים ישנים
            const cleanupResult = await this.adapter.cleanupOldData(24); // ניקוי מעל 24 שעות
            this.assert(cleanupResult.success, 'Cleanup should succeed');
            this.assert(typeof cleanupResult.deletedCount === 'number', 'Should return deleted count');

            // בדיקת סטטיסטיקות אחרי ניקוי
            const afterStats = await this.adapter.getStats();
            console.log(`נמחקו ${cleanupResult.deletedCount} רשומות ישנות`);

            // בדיקת גודל אחסון
            const storageSize = await this.adapter.getStorageSize();
            this.assert(typeof storageSize === 'object', 'Should return storage info');

            console.log('✅ פעולות ניקוי עובדות');
            this.testPassed('testCleanupOperations');

        } catch (error) {
            console.error('❌ שגיאה בבדיקת ניקוי:', error);
            this.testFailed('testCleanupOperations', error);
        }
    }

    /**
     * בדיקת ביצועים
     */
    async testPerformance() {
        console.log('⚡ בודק ביצועים...');

        try {
            const startTime = Date.now();

            // הוספת 100 נקודות נתונים
            const batchData = [];
            for (let i = 0; i < 100; i++) {
                batchData.push({
                    ...this.testData.validPoint,
                    id: `perf_test_${i}`,
                    timestamp: new Date(Date.now() - (i * 1000)).toISOString()
                });
            }

            const saveStart = Date.now();
            await this.adapter.saveBatch(batchData);
            const saveTime = Date.now() - saveStart;

            const readStart = Date.now();
            const allData = await this.adapter.loadAll();
            const readTime = Date.now() - readStart;

            const totalTime = Date.now() - startTime;

            // בדיקות ביצועים
            this.assert(saveTime < 5000, `Save should be fast (<5s), was ${saveTime}ms`);
            this.assert(readTime < 2000, `Read should be fast (<2s), was ${readTime}ms`);
            this.assert(allData.length >= 100, 'Should have all test data');

            console.log(`📊 ביצועים: שמירה ${saveTime}ms, קריאה ${readTime}ms, סה"כ ${totalTime}ms`);
            console.log('✅ ביצועים טובים');
            this.testPassed('testPerformance');

        } catch (error) {
            console.error('❌ שגיאה בבדיקת ביצועים:', error);
            this.testFailed('testPerformance', error);
        }
    }

    /**
     * בדיקת טיפול בשגיאות
     */
    async testErrorHandling() {
        console.log('🚨 בודק טיפול בשגיאות...');

        try {
            // בדיקת שמירה ללא אתחול
            const uninitializedAdapter = new IndexedDBAdapter();
            let errorThrown = false;
            try {
                await uninitializedAdapter.saveDataPoint(this.testData.validPoint);
            } catch (error) {
                errorThrown = true;
                this.assert(error.message.includes('לא מאותחל'), 'Should handle uninitialized adapter');
            }
            this.assert(errorThrown, 'Should throw error for uninitialized adapter');

            // בדיקת שמירת נתונים לא תקינים
            errorThrown = false;
            try {
                await this.adapter.saveDataPoint(this.testData.invalidPoint);
            } catch (error) {
                errorThrown = true;
            }
            this.assert(errorThrown, 'Should reject invalid data');

            // בדיקת קריאת מזהה לא קיים
            const nonExistent = await this.adapter.loadById('non_existent_id');
            this.assert(nonExistent === null, 'Should return null for non-existent ID');

            console.log('✅ טיפול בשגיאות עובד נכון');
            this.testPassed('testErrorHandling');

        } catch (error) {
            console.error('❌ שגיאה בבדיקת טיפול בשגיאות:', error);
            this.testFailed('testErrorHandling', error);
        }
    }

    /**
     * Assert פונקציה לבדיקות
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    /**
     * רישום בדיקה שעברה
     */
    testPassed(testName) {
        this.testResults.total++;
        this.testResults.passed++;
        console.log(`✅ ${testName} - עבר`);
    }

    /**
     * רישום בדיקה שנכשלה
     */
    testFailed(testName, error) {
        this.testResults.total++;
        this.testResults.failed++;
        this.logError(testName, error);
        console.log(`❌ ${testName} - נכשל: ${error.message}`);
    }

    /**
     * רישום שגיאה
     */
    logError(testName, error) {
        this.testResults.errors.push({
            test: testName,
            error: error.message,
            stack: error.stack
        });
    }

    /**
     * הדפסת סיכום הבדיקות
     */
    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('📋 סיכום בדיקות IndexedDB');
        console.log('='.repeat(50));
        console.log(`סה"כ בדיקות: ${this.testResults.total}`);
        console.log(`עברו: ${this.testResults.passed} (${Math.round(this.testResults.passed / this.testResults.total * 100)}%)`);
        console.log(`נכשלו: ${this.testResults.failed} (${Math.round(this.testResults.failed / this.testResults.total * 100)}%)`);

        if (this.testResults.errors.length > 0) {
            console.log('\n❌ שגיאות:');
            this.testResults.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.test}: ${error.error}`);
            });
        }

        console.log('='.repeat(50));

        if (this.testResults.failed === 0) {
            console.log('🎉 כל הבדיקות עברו בהצלחה!');
        } else {
            console.log('⚠️ יש שגיאות שצריך לתקן');
        }
    }
}

// ייצוא לבדיקה
if (typeof window !== 'undefined') {
    window.IndexedDBTester = IndexedDBTester;

    // פונקציה גלובלית להרצת הבדיקה
    window.runIndexedDBTests = async function() {
        console.log('🚀 מתחיל בדיקה מקיפה של IndexedDB...');
        const tester = new IndexedDBTester();
        await tester.runAllTests();
        return tester.testResults;
    };

    // הרצה אוטומטית אם זה עמוד הבדיקה
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            if (window.location.pathname.includes('test') || window.location.search.includes('test')) {
                const tester = new IndexedDBTester();
                await tester.runAllTests();
            }
        });
    }
}

console.log('🧪 IndexedDBTester loaded successfully');
