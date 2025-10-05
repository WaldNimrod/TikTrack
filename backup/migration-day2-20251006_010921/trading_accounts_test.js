/**
 * ========================================
 * Trading Accounts Testing Suite - TikTrack
 * ========================================
 * 
 * סקריפט בדיקות מקיף לעמוד חשבונות מסחר
 * בודק אינטגרציה עם כל המערכות הכלליות
 * 
 * מחבר: TikTrack Development Team
 * תאריך יצירה: 5 בינואר 2025
 * גרסה: 1.0.0
 * ========================================
 */

console.log('🧪 Trading Accounts Testing Suite loaded');

class TradingAccountsTestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    /**
     * הרצת כל הבדיקות
     */
    async runAllTests() {
        console.log('🚀 Starting Trading Accounts Test Suite...');
        
        // בדיקות מערכת אתחול מאוחדת
        await this.testUnifiedInitializationSystem();
        
        // בדיקות מערכת מטמון
        await this.testCacheSystem();
        
        // בדיקות אינטגרציה
        await this.testIntegrationSystems();
        
        // בדיקות פונקציונליות
        await this.testFunctionalRequirements();
        
        // סיכום תוצאות
        this.printResults();
        
        return this.results;
    }

    /**
     * בדיקות מערכת אתחול מאוחדת
     */
    async testUnifiedInitializationSystem() {
        console.log('🔍 Testing Unified Initialization System...');
        
        // בדיקה 1: Unified App Initializer מאותחל נכון
        this.runTest('Unified App Initializer initialized', () => {
            return window.unifiedAppInit && window.unifiedAppInit.isInitialized();
        });

        // בדיקה 2: כל 5 השלבים הושלמו
        this.runTest('All 5 initialization stages completed', () => {
            const status = window.getUnifiedAppStatus && window.getUnifiedAppStatus();
            return status && status.initialized && status.performanceMetrics.totalTime < 2000;
        });

        // בדיקה 3: הגדרת עמוד נכונה
        this.runTest('Page configuration correct', () => {
            const pageConfig = window.getPageConfig && window.getPageConfig('trading_accounts');
            return pageConfig && 
                   pageConfig.name === 'Trading Accounts' &&
                   pageConfig.requiresFilters === true &&
                   pageConfig.requiresTables === true;
        });

        // בדיקה 4: Custom Initializers עובדים
        this.runTest('Custom Initializers working', () => {
            return typeof window.getAccounts === 'function' &&
                   typeof window.setupTradingAccountsHandlers === 'function';
        });
    }

    /**
     * בדיקות מערכת מטמון
     */
    async testCacheSystem() {
        console.log('🔍 Testing Cache System...');
        
        // בדיקה 1: UnifiedCacheManager מאותחל נכון
        this.runTest('UnifiedCacheManager initialized', () => {
            return window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized();
        });

        // בדיקה 2: נתונים נשמרים במטמון נכון
        this.runAsyncTest('Cache save/get functionality', async () => {
            const testData = { test: 'data', timestamp: Date.now() };
            
            if (window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.save('test_accounts', testData, {
                    layer: 'localStorage',
                    ttl: 300000
                });
                
                const retrieved = await window.UnifiedCacheManager.get('test_accounts', {
                    layer: 'localStorage'
                });
                
                return JSON.stringify(retrieved) === JSON.stringify(testData);
            }
            return false;
        });

        // בדיקה 3: מדיניות מטמון מוגדרת נכון
        this.runTest('Cache policy defined correctly', () => {
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.getPolicy) {
                const policy = window.UnifiedCacheManager.getPolicy('trading_accounts_data');
                return policy && policy.layer === 'localStorage' && policy.ttl === 300000;
            }
            return false;
        });

        // בדיקה 4: Cache Sync עובד
        this.runAsyncTest('Cache Sync working', async () => {
            if (window.CacheSyncManager) {
                try {
                    await window.CacheSyncManager.invalidateBackend(['trading_accounts']);
                    const syncStatus = window.CacheSyncManager.getSyncStatus();
                    return syncStatus && syncStatus.lastSync > 0;
                } catch (error) {
                    console.warn('Cache sync test failed:', error);
                    return false;
                }
            }
            return false;
        });
    }

    /**
     * בדיקות אינטגרציה
     */
    async testIntegrationSystems() {
        console.log('🔍 Testing Integration Systems...');
        
        // בדיקה 1: מערכת מיפוי טבלאות
        this.runTest('Table Mapping System available', () => {
            return window.getColumnValue && window.tableMappings;
        });

        // בדיקה 2: מערכת התראות
        this.runTest('Notification System available', () => {
            return window.showSuccessNotification && window.showErrorNotification;
        });

        // בדיקה 3: מערכת ניהול סקשנים
        this.runTest('Section State Persistence available', () => {
            return window.toggleSection && typeof window.toggleSection === 'function';
        });

        // בדיקה 4: מערכת מודולים
        this.runTest('Modal Management System available', () => {
            return window.showModal && window.closeModal;
        });

        // בדיקה 5: מערכת כותרת ופילטרים
        this.runTest('Header System available', () => {
            return window.updateHeaderFilters && window.applyFilters;
        });
    }

    /**
     * בדיקות פונקציונליות
     */
    async testFunctionalRequirements() {
        console.log('🔍 Testing Functional Requirements...');
        
        // בדיקה 1: TradingAccountsController זמין
        this.runTest('TradingAccountsController available', () => {
            return window.TradingAccountsController && 
                   typeof window.TradingAccountsController.initialize === 'function';
        });

        // בדיקה 2: פונקציות account-service זמינות
        this.runTest('Account Service functions available', () => {
            return typeof window.getAccounts === 'function' &&
                   typeof window.getActiveAccounts === 'function' &&
                   typeof window.cancelAccount === 'function';
        });

        // בדיקה 3: פונקציות עזר זמינות
        this.runTest('Helper functions available', () => {
            return typeof window.updateTradingAccountsStatistics === 'function';
        });

        // בדיקה 4: טעינת נתונים
        this.runAsyncTest('Data loading functionality', async () => {
            try {
                if (window.getAccounts) {
                    const accounts = await window.getAccounts();
                    return Array.isArray(accounts);
                }
                return false;
            } catch (error) {
                console.warn('Data loading test failed:', error);
                return false;
            }
        });
    }

    /**
     * הרצת בדיקה רגילה
     */
    runTest(testName, testFunction) {
        try {
            const result = testFunction();
            this.recordTest(testName, result, null);
        } catch (error) {
            this.recordTest(testName, false, error.message);
        }
    }

    /**
     * הרצת בדיקה אסינכרונית
     */
    async runAsyncTest(testName, testFunction) {
        try {
            const result = await testFunction();
            this.recordTest(testName, result, null);
        } catch (error) {
            this.recordTest(testName, false, error.message);
        }
    }

    /**
     * רישום תוצאות בדיקה
     */
    recordTest(testName, passed, error = null) {
        this.tests.push({
            name: testName,
            passed,
            error,
            timestamp: new Date().toISOString()
        });

        this.results.total++;
        if (passed) {
            this.results.passed++;
            console.log(`✅ ${testName}`);
        } else {
            this.results.failed++;
            console.log(`❌ ${testName}${error ? ': ' + error : ''}`);
        }
    }

    /**
     * הדפסת סיכום תוצאות
     */
    printResults() {
        console.log('\n📊 Trading Accounts Test Suite Results:');
        console.log('=====================================');
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed} (${Math.round(this.results.passed / this.results.total * 100)}%)`);
        console.log(`Failed: ${this.results.failed} (${Math.round(this.results.failed / this.results.total * 100)}%)`);
        console.log('=====================================');

        // הצגת בדיקות שנכשלו
        const failedTests = this.tests.filter(test => !test.passed);
        if (failedTests.length > 0) {
            console.log('\n❌ Failed Tests:');
            failedTests.forEach(test => {
                console.log(`- ${test.name}${test.error ? ': ' + test.error : ''}`);
            });
        }

        // הצגת בדיקות שעברו
        const passedTests = this.tests.filter(test => test.passed);
        if (passedTests.length > 0) {
            console.log('\n✅ Passed Tests:');
            passedTests.forEach(test => {
                console.log(`- ${test.name}`);
            });
        }

        console.log('\n🎯 Test Suite Complete!');
    }

    /**
     * יצירת דוח מפורט
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            results: this.results,
            tests: this.tests,
            summary: {
                successRate: Math.round(this.results.passed / this.results.total * 100),
                criticalTests: this.tests.filter(t => 
                    t.name.includes('Unified') || 
                    t.name.includes('Cache') || 
                    t.name.includes('Initialization')
                ),
                integrationTests: this.tests.filter(t => 
                    t.name.includes('Integration') || 
                    t.name.includes('System available')
                )
            }
        };

        return report;
    }
}

// יצירת instance גלובלי
window.TradingAccountsTestSuite = new TradingAccountsTestSuite();

// פונקציה להרצת בדיקות מה-DEV Tools
window.runTradingAccountsTests = async function() {
    console.log('🧪 Running Trading Accounts Tests from Console...');
    return await window.TradingAccountsTestSuite.runAllTests();
};

// הרצה אוטומטית של בדיקות אם הקובץ נטען ישירות
if (typeof window !== 'undefined') {
    // המתן לאתחול המערכת
    setTimeout(async () => {
        console.log('🚀 Auto-running Trading Accounts Tests...');
        await window.TradingAccountsTestSuite.runAllTests();
    }, 3000); // המתן 3 שניות לאתחול המערכת
}

console.log('✅ Trading Accounts Test Suite loaded successfully');
console.log('💡 Run tests manually with: window.runTradingAccountsTests()');
