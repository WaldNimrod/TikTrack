/**
 * Field Renderer Service - Browser Test Script
 * ============================================
 * 
 * תסריט בדיקה אוטומטי לבדיקת Field Renderer Service בכל העמודים
 * 
 * @version 1.0.0
 * @created 28 בינואר 2025
 */

// רשימת עמודים לבדיקה
const PAGES_TO_TEST = [
    // עמודים מרכזיים
    { name: 'index.html', url: 'http://localhost:8080/index.html', type: 'main' },
    { name: 'trades.html', url: 'http://localhost:8080/trades.html', type: 'main' },
    { name: 'trade_plans.html', url: 'http://localhost:8080/trade_plans.html', type: 'main' },
    { name: 'alerts.html', url: 'http://localhost:8080/alerts.html', type: 'main' },
    { name: 'tickers.html', url: 'http://localhost:8080/tickers.html', type: 'main' },
    { name: 'trading_accounts.html', url: 'http://localhost:8080/trading_accounts.html', type: 'main' },
    { name: 'executions.html', url: 'http://localhost:8080/executions.html', type: 'main' },
    { name: 'cash_flows.html', url: 'http://localhost:8080/cash_flows.html', type: 'main' },
    { name: 'notes.html', url: 'http://localhost:8080/notes.html', type: 'main' },
    { name: 'preferences.html', url: 'http://localhost:8080/preferences.html', type: 'main' },
];

// תוצאות בדיקה
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    pages: []
};

/**
 * בדיקת עמוד בודד
 */
async function testPage(page) {
    const result = {
        page: page.name,
        url: page.url,
        type: page.type,
        tests: [],
        errors: [],
        warnings: [],
        performance: {}
    };

    console.log(`\n🧪 בודק עמוד: ${page.name}...`);

    try {
        // נווט לדף
        await navigate(page.url);
        
        // המתן לטעינה
        await waitForPageLoad(5000);

        // בדיקת טעינת FieldRendererService
        const serviceCheck = await evaluate(`
            (function() {
                const checks = {
                    FieldRendererServiceExists: typeof window.FieldRendererService !== 'undefined',
                    FieldRendererServiceType: typeof window.FieldRendererService,
                    renderStatusExists: typeof window.FieldRendererService?.renderStatus === 'function',
                    renderSideExists: typeof window.FieldRendererService?.renderSide === 'function',
                    renderAmountExists: typeof window.FieldRendererService?.renderAmount === 'function',
                    renderDateExists: typeof window.FieldRendererService?.renderDate === 'function',
                    shortcutsExist: typeof window.renderStatus !== 'undefined'
                };
                return checks;
            })()
        `);

        result.tests.push({
            name: 'טעינת FieldRendererService',
            passed: serviceCheck.FieldRendererServiceExists && serviceCheck.FieldRendererServiceType === 'object',
            details: serviceCheck
        });

        // בדיקת פונקציונליות בסיסית
        const functionalityCheck = await evaluate(`
            (function() {
                try {
                    const testStatus = window.FieldRendererService.renderStatus('open', 'trade');
                    const testSide = window.FieldRendererService.renderSide('long');
                    const testAmount = window.FieldRendererService.renderAmount(1234.56, '$');
                    const testDate = window.FieldRendererService.renderDate(new Date());
                    
                    return {
                        renderStatusWorks: testStatus && typeof testStatus === 'string' && testStatus.includes('badge'),
                        renderSideWorks: testSide && typeof testSide === 'string' && testSide.includes('badge'),
                        renderAmountWorks: testAmount && typeof testAmount === 'string',
                        renderDateWorks: testDate && typeof testDate === 'string'
                    };
                } catch (e) {
                    return { error: e.message };
                }
            })()
        `);

        result.tests.push({
            name: 'פונקציונליות בסיסית',
            passed: !functionalityCheck.error && functionalityCheck.renderStatusWorks && 
                    functionalityCheck.renderSideWorks && functionalityCheck.renderAmountWorks && 
                    functionalityCheck.renderDateWorks,
            details: functionalityCheck
        });

        // בדיקת שגיאות קונסולה
        const consoleMessages = await getConsoleMessages();
        const errors = consoleMessages.filter(msg => msg.type === 'error');
        const warnings = consoleMessages.filter(msg => msg.type === 'warning');
        
        result.errors = errors;
        result.warnings = warnings;

        result.tests.push({
            name: 'שגיאות קונסולה',
            passed: errors.length === 0,
            details: { errors: errors.length, warnings: warnings.length }
        });

        // בדיקת ביצועים
        const performanceCheck = await evaluate(`
            (function() {
                const start = performance.now();
                for (let i = 0; i < 100; i++) {
                    window.FieldRendererService.renderStatus('open', 'trade');
                    window.FieldRendererService.renderSide('long');
                    window.FieldRendererService.renderAmount(1234.56, '$');
                }
                const end = performance.now();
                return {
                    timeMs: end - start,
                    avgTimePerCall: (end - start) / 400
                };
            })()
        `);

        result.performance = performanceCheck;
        result.tests.push({
            name: 'ביצועים',
            passed: performanceCheck.timeMs < 100, // פחות מ-100ms ל-100 קריאות
            details: performanceCheck
        });

        // חישוב סטטוס כללי
        const passedTests = result.tests.filter(t => t.passed).length;
        result.overallPassed = passedTests === result.tests.length && errors.length === 0;

        testResults.total++;
        if (result.overallPassed) {
            testResults.passed++;
        } else {
            testResults.failed++;
        }

        console.log(`✅ ${page.name}: ${passedTests}/${result.tests.length} בדיקות עברו`);

    } catch (error) {
        result.errors.push({ message: error.message, stack: error.stack });
        result.overallPassed = false;
        testResults.total++;
        testResults.failed++;
        console.log(`❌ ${page.name}: שגיאה - ${error.message}`);
    }

    testResults.pages.push(result);
    return result;
}

/**
 * הרצת כל הבדיקות
 */
async function runAllTests() {
    console.log('🚀 מתחיל בדיקות Field Renderer Service...\n');
    
    for (const page of PAGES_TO_TEST) {
        await testPage(page);
        // המתן קצת בין בדיקות
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // הדפסת סיכום
    console.log('\n' + '='.repeat(60));
    console.log('📊 סיכום תוצאות:');
    console.log(`✅ עברו: ${testResults.passed}/${testResults.total}`);
    console.log(`❌ נכשלו: ${testResults.failed}/${testResults.total}`);
    console.log(`📈 אחוז הצלחה: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');

    return testResults;
}

// פונקציות עזר (יש לממש לפי הכלים הזמינים)
function navigate(url) {
    // יש לממש עם browser_navigate
}

function waitForPageLoad(timeout) {
    return new Promise((resolve) => {
        // יש לממש המתנה לטעינת דף
        setTimeout(resolve, timeout);
    });
}

function evaluate(script) {
    // יש לממש עם browser_evaluate
}

function getConsoleMessages() {
    // יש לממש עם browser_console_messages
}

// ייצוא
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, testPage, PAGES_TO_TEST };
}

