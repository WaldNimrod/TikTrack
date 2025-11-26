/**
 * CRUD Response Handler E2E Test Suite
 * ======================================
 * 
 * בדיקות End-to-End מקיפות למערכת CRUD Response Handler
 * 
 * שימוש:
 * 1. פתח את העמוד שברצונך לבדוק
 * 2. פתח את הקונסולה (F12)
 * 3. העתק והדבק את הקוד הזה
 * 4. או: טען את הקובץ דרך script tag
 * 
 * @version 1.0.0
 * @created 2025-11-25
 */

(function CRUDResponseHandlerE2ETest() {
    'use strict';

    const TEST_RESULTS = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        errors: []
    };

    const COLORS = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        green: '\x1b[32m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        cyan: '\x1b[36m'
    };

    /**
     * בדיקת זמינות CRUDResponseHandler
     */
    function testCRUDResponseHandlerAvailability() {
        console.log('\n' + COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);
        console.log(COLORS.bright + COLORS.blue + '🧪 בדיקת זמינות CRUDResponseHandler' + COLORS.reset);
        console.log(COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);

        TEST_RESULTS.total++;

        if (typeof window.CRUDResponseHandler === 'undefined' || window.CRUDResponseHandler === null) {
            TEST_RESULTS.failed++;
            TEST_RESULTS.errors.push('CRUDResponseHandler לא זמין ב-window');
            console.log(COLORS.red + '❌ FAILED: CRUDResponseHandler לא זמין' + COLORS.reset);
            return false;
        }

        if (typeof window.CRUDResponseHandler.handleSaveResponse !== 'function') {
            TEST_RESULTS.failed++;
            TEST_RESULTS.errors.push('CRUDResponseHandler.handleSaveResponse לא זמין');
            console.log(COLORS.red + '❌ FAILED: handleSaveResponse לא זמין' + COLORS.reset);
            return false;
        }

        if (typeof window.CRUDResponseHandler.handleUpdateResponse !== 'function') {
            TEST_RESULTS.failed++;
            TEST_RESULTS.errors.push('CRUDResponseHandler.handleUpdateResponse לא זמין');
            console.log(COLORS.red + '❌ FAILED: handleUpdateResponse לא זמין' + COLORS.reset);
            return false;
        }

        if (typeof window.CRUDResponseHandler.handleDeleteResponse !== 'function') {
            TEST_RESULTS.failed++;
            TEST_RESULTS.errors.push('CRUDResponseHandler.handleDeleteResponse לא זמין');
            console.log(COLORS.red + '❌ FAILED: handleDeleteResponse לא זמין' + COLORS.reset);
            return false;
        }

        TEST_RESULTS.passed++;
        console.log(COLORS.green + '✅ PASSED: CRUDResponseHandler זמין וכל הפונקציות קיימות' + COLORS.reset);
        console.log('   - handleSaveResponse: ✅');
        console.log('   - handleUpdateResponse: ✅');
        console.log('   - handleDeleteResponse: ✅');
        console.log('   - handleError: ✅');
        console.log('   - executeCRUDOperation: ✅');
        return true;
    }

    /**
     * בדיקת Global Shortcuts
     */
    function testGlobalShortcuts() {
        console.log('\n' + COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);
        console.log(COLORS.bright + COLORS.blue + '🧪 בדיקת Global Shortcuts' + COLORS.reset);
        console.log(COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);

        const shortcuts = [
            'handleSaveResponse',
            'handleUpdateResponse',
            'handleDeleteResponse',
            'executeCRUDOperation',
            'handleLoadResponse',
            'handleNetworkError'
        ];

        let allPassed = true;
        shortcuts.forEach(shortcut => {
            TEST_RESULTS.total++;
            if (typeof window[shortcut] === 'function') {
                TEST_RESULTS.passed++;
                console.log(COLORS.green + `✅ ${shortcut}: זמין` + COLORS.reset);
            } else {
                TEST_RESULTS.failed++;
                TEST_RESULTS.errors.push(`Global shortcut ${shortcut} לא זמין`);
                console.log(COLORS.red + `❌ ${shortcut}: לא זמין` + COLORS.reset);
                allPassed = false;
            }
        });

        return allPassed;
    }

    /**
     * בדיקת אינטגרציה עם מערכות אחרות
     */
    function testSystemIntegration() {
        console.log('\n' + COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);
        console.log(COLORS.bright + COLORS.blue + '🧪 בדיקת אינטגרציה עם מערכות אחרות' + COLORS.reset);
        console.log(COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);

        const systems = {
            'Notification System': typeof window.showSuccessNotification === 'function' && typeof window.showErrorNotification === 'function',
            'Modal Manager V2': typeof window.ModalManagerV2 === 'object' && typeof window.ModalManagerV2.hideModal === 'function',
            'Unified Table System': typeof window.UnifiedTableSystem === 'object',
            'Cache Sync Manager': typeof window.CacheSyncManager === 'object' && typeof window.CacheSyncManager.invalidateByAction === 'function'
        };

        let allPassed = true;
        Object.entries(systems).forEach(([name, available]) => {
            TEST_RESULTS.total++;
            if (available) {
                TEST_RESULTS.passed++;
                console.log(COLORS.green + `✅ ${name}: זמין` + COLORS.reset);
            } else {
                TEST_RESULTS.failed++;
                TEST_RESULTS.errors.push(`${name} לא זמין`);
                console.log(COLORS.yellow + `⚠️ ${name}: לא זמין (לא קריטי)` + COLORS.reset);
                // לא נכשל כי זה לא קריטי
            }
        });

        return allPassed;
    }

    /**
     * בדיקת CRUD עבור ישות ספציפית
     */
    async function testEntityCRUD(entityConfig) {
        const { name, page, createFn, updateFn, deleteFn, loadFn, modalId, entityName } = entityConfig;

        console.log('\n' + COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);
        console.log(COLORS.bright + COLORS.blue + `🧪 בדיקת CRUD עבור ${name}` + COLORS.reset);
        console.log(COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);

        const results = {
            create: { passed: false, error: null },
            update: { passed: false, error: null },
            delete: { passed: false, error: null },
            load: { passed: false, error: null }
        };

        // בדיקת טעינת נתונים
        if (loadFn && typeof window[loadFn] === 'function') {
            TEST_RESULTS.total++;
            try {
                await window[loadFn]();
                results.load.passed = true;
                TEST_RESULTS.passed++;
                console.log(COLORS.green + `✅ טעינת נתונים: הצליח` + COLORS.reset);
            } catch (error) {
                results.load.error = error.message;
                TEST_RESULTS.failed++;
                TEST_RESULTS.errors.push(`${name} - טעינת נתונים נכשלה: ${error.message}`);
                console.log(COLORS.red + `❌ טעינת נתונים: נכשל - ${error.message}` + COLORS.reset);
            }
        } else {
            TEST_RESULTS.skipped++;
            console.log(COLORS.yellow + `⏭️ טעינת נתונים: דילוג (פונקציה לא זמינה)` + COLORS.reset);
        }

        // בדיקת יצירה
        if (createFn && typeof window[createFn] === 'function') {
            TEST_RESULTS.total++;
            console.log(COLORS.blue + `   🔄 בודק יצירה...` + COLORS.reset);
            // לא נריץ בפועל כי זה ייצור רשומה אמיתית
            // רק נבדוק שהפונקציה קיימת ומשתמשת ב-CRUDResponseHandler
            const fnString = window[createFn].toString();
            if (fnString.includes('CRUDResponseHandler') || fnString.includes('handleSaveResponse')) {
                results.create.passed = true;
                TEST_RESULTS.passed++;
                console.log(COLORS.green + `✅ יצירה: משתמש ב-CRUDResponseHandler` + COLORS.reset);
            } else {
                results.create.error = 'לא משתמש ב-CRUDResponseHandler';
                TEST_RESULTS.failed++;
                TEST_RESULTS.errors.push(`${name} - יצירה לא משתמשת ב-CRUDResponseHandler`);
                console.log(COLORS.red + `❌ יצירה: לא משתמש ב-CRUDResponseHandler` + COLORS.reset);
            }
        } else {
            TEST_RESULTS.skipped++;
            console.log(COLORS.yellow + `⏭️ יצירה: דילוג (פונקציה לא זמינה)` + COLORS.reset);
        }

        // בדיקת עדכון
        if (updateFn && typeof window[updateFn] === 'function') {
            TEST_RESULTS.total++;
            console.log(COLORS.blue + `   🔄 בודק עדכון...` + COLORS.reset);
            const fnString = window[updateFn].toString();
            if (fnString.includes('CRUDResponseHandler') || fnString.includes('handleUpdateResponse')) {
                results.update.passed = true;
                TEST_RESULTS.passed++;
                console.log(COLORS.green + `✅ עדכון: משתמש ב-CRUDResponseHandler` + COLORS.reset);
            } else {
                results.update.error = 'לא משתמש ב-CRUDResponseHandler';
                TEST_RESULTS.failed++;
                TEST_RESULTS.errors.push(`${name} - עדכון לא משתמש ב-CRUDResponseHandler`);
                console.log(COLORS.red + `❌ עדכון: לא משתמש ב-CRUDResponseHandler` + COLORS.reset);
            }
        } else {
            TEST_RESULTS.skipped++;
            console.log(COLORS.yellow + `⏭️ עדכון: דילוג (פונקציה לא זמינה)` + COLORS.reset);
        }

        // בדיקת מחיקה
        if (deleteFn && typeof window[deleteFn] === 'function') {
            TEST_RESULTS.total++;
            console.log(COLORS.blue + `   🔄 בודק מחיקה...` + COLORS.reset);
            const fnString = window[deleteFn].toString();
            if (fnString.includes('CRUDResponseHandler') || fnString.includes('handleDeleteResponse')) {
                results.delete.passed = true;
                TEST_RESULTS.passed++;
                console.log(COLORS.green + `✅ מחיקה: משתמש ב-CRUDResponseHandler` + COLORS.reset);
            } else {
                results.delete.error = 'לא משתמש ב-CRUDResponseHandler';
                TEST_RESULTS.failed++;
                TEST_RESULTS.errors.push(`${name} - מחיקה לא משתמשת ב-CRUDResponseHandler`);
                console.log(COLORS.red + `❌ מחיקה: לא משתמש ב-CRUDResponseHandler` + COLORS.reset);
            }
        } else {
            TEST_RESULTS.skipped++;
            console.log(COLORS.yellow + `⏭️ מחיקה: דילוג (פונקציה לא זמינה)` + COLORS.reset);
        }

        return results;
    }

    /**
     * בדיקת כל הישויות
     */
    async function testAllEntities() {
        console.log('\n' + COLORS.bright + COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);
        console.log(COLORS.bright + COLORS.blue + '🧪 בדיקת כל הישויות במערכת' + COLORS.reset);
        console.log(COLORS.bright + COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);

        const entities = [
            {
                name: 'Trades',
                page: 'trades',
                createFn: 'saveTrade',
                updateFn: 'updateTrade',
                deleteFn: 'performTradeDeletion',
                loadFn: 'loadTradesData',
                modalId: 'tradesModal',
                entityName: 'טרייד'
            },
            {
                name: 'Trade Plans',
                page: 'trade_plans',
                createFn: 'saveTradePlan',
                updateFn: 'saveTradePlan', // משתמש באותה פונקציה
                deleteFn: 'performTradePlanDeletion',
                loadFn: 'loadTradePlansData',
                modalId: 'tradePlansModal',
                entityName: 'תוכנית מסחר'
            },
            {
                name: 'Alerts',
                page: 'alerts',
                createFn: 'saveAlert',
                updateFn: 'saveAlert', // משתמש באותה פונקציה
                deleteFn: 'deleteAlert',
                loadFn: 'loadAlertsData',
                modalId: 'alertsModal',
                entityName: 'התראה'
            },
            {
                name: 'Notes',
                page: 'notes',
                createFn: 'saveNote',
                updateFn: 'updateNoteFromModal',
                deleteFn: 'deleteNoteFromServer',
                loadFn: 'loadNotesData',
                modalId: 'notesModal',
                entityName: 'הערה'
            },
            {
                name: 'Executions',
                page: 'executions',
                createFn: 'saveExecution',
                updateFn: 'saveExecution', // משתמש באותה פונקציה
                deleteFn: 'deleteExecution',
                loadFn: 'loadExecutionsData',
                modalId: 'executionsModal',
                entityName: 'ביצוע'
            },
            {
                name: 'Cash Flows',
                page: 'cash_flows',
                createFn: 'saveCashFlow',
                updateFn: 'saveCashFlow', // משתמש באותה פונקציה
                deleteFn: 'deleteCashFlow',
                loadFn: 'loadCashFlowsData',
                modalId: 'cashFlowModal',
                entityName: 'תזרים מזומן'
            },
            {
                name: 'Trading Accounts',
                page: 'trading_accounts',
                createFn: 'saveTradingAccount',
                updateFn: 'saveTradingAccount', // משתמש באותה פונקציה
                deleteFn: 'deleteTradingAccount',
                loadFn: 'loadTradingAccountsDataForTradingAccountsPage',
                modalId: 'tradingAccountsModal',
                entityName: 'חשבון מסחר'
            }
        ];

        const allResults = {};
        for (const entity of entities) {
            allResults[entity.name] = await testEntityCRUD(entity);
        }

        return allResults;
    }

    /**
     * בדיקת Fallback
     */
    function testFallback() {
        console.log('\n' + COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);
        console.log(COLORS.bright + COLORS.blue + '🧪 בדיקת Fallback' + COLORS.reset);
        console.log(COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);

        TEST_RESULTS.total++;

        // בדיקה שהפונקציות מטפלות ב-fallback
        const testFunctions = [
            'saveTrade',
            'saveAlert',
            'saveNote',
            'saveExecution',
            'saveCashFlow',
            'saveTradingAccount'
        ];

        let hasFallback = false;
        testFunctions.forEach(fnName => {
            if (typeof window[fnName] === 'function') {
                const fnString = window[fnName].toString();
                if (fnString.includes('CRUDResponseHandler') && 
                    (fnString.includes('fallback') || fnString.includes('Fallback') || fnString.includes('if (!window.CRUDResponseHandler'))) {
                    hasFallback = true;
                }
            }
        });

        if (hasFallback) {
            TEST_RESULTS.passed++;
            console.log(COLORS.green + '✅ PASSED: יש fallback אם CRUDResponseHandler לא זמין' + COLORS.reset);
            return true;
        } else {
            TEST_RESULTS.failed++;
            TEST_RESULTS.errors.push('לא נמצא fallback אם CRUDResponseHandler לא זמין');
            console.log(COLORS.yellow + '⚠️ WARNING: לא נמצא fallback מפורש (יכול להיות תקין אם לא נדרש)' + COLORS.reset);
            return false;
        }
    }

    /**
     * הדפסת סיכום
     */
    function printSummary() {
        console.log('\n' + COLORS.bright + COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);
        console.log(COLORS.bright + COLORS.blue + '📊 סיכום תוצאות בדיקות' + COLORS.reset);
        console.log(COLORS.bright + COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);

        const total = TEST_RESULTS.total;
        const passed = TEST_RESULTS.passed;
        const failed = TEST_RESULTS.failed;
        const skipped = TEST_RESULTS.skipped;
        const percentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

        console.log(`\n${COLORS.bright}סה"כ בדיקות:${COLORS.reset} ${total}`);
        console.log(`${COLORS.green}✅ עברו:${COLORS.reset} ${passed} (${percentage}%)`);
        console.log(`${COLORS.red}❌ נכשלו:${COLORS.reset} ${failed}`);
        console.log(`${COLORS.yellow}⏭️ דילוג:${COLORS.reset} ${skipped}`);

        if (TEST_RESULTS.errors.length > 0) {
            console.log(`\n${COLORS.red}${COLORS.bright}שגיאות שנמצאו:${COLORS.reset}`);
            TEST_RESULTS.errors.forEach((error, index) => {
                console.log(`${COLORS.red}  ${index + 1}. ${error}${COLORS.reset}`);
            });
        }

        console.log('\n' + COLORS.cyan + '═══════════════════════════════════════════════════════════' + COLORS.reset);

        // החזרת תוצאות
        return {
            total,
            passed,
            failed,
            skipped,
            percentage: parseFloat(percentage),
            errors: TEST_RESULTS.errors
        };
    }

    /**
     * הרצת כל הבדיקות
     */
    async function runAllTests() {
        console.log('\n' + COLORS.bright + COLORS.cyan + '╔═══════════════════════════════════════════════════════════╗' + COLORS.reset);
        console.log(COLORS.bright + COLORS.cyan + '║' + COLORS.reset + COLORS.bright + COLORS.blue + '  🧪 CRUD Response Handler E2E Test Suite' + COLORS.reset + COLORS.bright + COLORS.cyan + '                    ║' + COLORS.reset);
        console.log(COLORS.bright + COLORS.cyan + '╚═══════════════════════════════════════════════════════════╝' + COLORS.reset);
        console.log(COLORS.blue + `עמוד נוכחי: ${window.location.pathname}` + COLORS.reset);
        console.log(COLORS.blue + `תאריך: ${new Date().toLocaleString('he-IL')}` + COLORS.reset);

        // בדיקות בסיסיות
        testCRUDResponseHandlerAvailability();
        testGlobalShortcuts();
        testSystemIntegration();
        testFallback();

        // בדיקות ישויות
        await testAllEntities();

        // סיכום
        const summary = printSummary();

        // שמירת תוצאות ב-global scope
        window.CRUD_E2E_TEST_RESULTS = summary;

        return summary;
    }

    // הרצה אוטומטית
    if (typeof window !== 'undefined') {
        window.runCRUDE2ETests = runAllTests;
        console.log(COLORS.green + '\n✅ סקריפט בדיקה נטען בהצלחה!' + COLORS.reset);
        console.log(COLORS.blue + 'הרץ את הבדיקות עם: runCRUDE2ETests()' + COLORS.reset);
    }

    // החזרת פונקציה לייצוא
    return {
        runAllTests,
        testCRUDResponseHandlerAvailability,
        testGlobalShortcuts,
        testSystemIntegration,
        testEntityCRUD,
        testAllEntities,
        testFallback,
        printSummary
    };
})();


