// Verify init/loading on 5 representative pages
// Check for Logger evidence and JS errors

const pages = [
    { name: 'index', path: 'index.html', description: 'Main application page' },
    { name: 'login', path: 'login.html', description: 'Authentication page' },
    { name: 'trades', path: 'trades.html', description: 'Core trading functionality' },
    { name: 'executions', path: 'executions.html', description: 'Executions management' },
    { name: 'crud_testing_dashboard', path: 'crud_testing_dashboard.html', description: 'Testing/QA dashboard' }
];

const fs = require('fs');
const path = require('path');

function checkPageInitLoading(page) {
    console.log(`\n=== VERIFYING: ${page.name.toUpperCase()} ===`);
    console.log(`Page: ${page.description}`);
    console.log(`Path: trading-ui/${page.path}`);

    try {
        const filePath = path.join(__dirname, '..', 'trading-ui', page.path);
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for UnifiedAppInitializer references
        const hasInitializer = content.includes('UnifiedAppInitializer');
        console.log(`✅ UnifiedAppInitializer reference: ${hasInitializer ? 'FOUND' : 'NOT FOUND'}`);

        // Check for Logger usage
        const hasLogger = content.includes('window.Logger') || content.includes('Logger.');
        console.log(`✅ Logger usage: ${hasLogger ? 'FOUND' : 'NOT FOUND'}`);

        // Check for script loading errors (basic syntax check)
        const scriptErrors = [];
        const scriptBlocks = content.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];

        scriptBlocks.forEach((script, index) => {
            // Basic checks for common JS errors
            if (script.includes('console.log') && !script.includes('Logger.')) {
                scriptErrors.push(`Script ${index + 1}: Contains console.log instead of Logger`);
            }
            if (script.includes('undefined') && script.includes('function')) {
                scriptErrors.push(`Script ${index + 1}: Potential undefined reference`);
            }
        });

        if (scriptErrors.length === 0) {
            console.log('✅ JS Syntax Check: NO OBVIOUS ERRORS');
        } else {
            console.log('⚠️  JS Syntax Check: POTENTIAL ISSUES FOUND');
            scriptErrors.forEach(error => console.log(`   - ${error}`));
        }

        // Check for defer attributes (important for init loading)
        const deferScripts = (content.match(/<script[^>]*defer[^>]*>/gi) || []).length;
        const totalScripts = (content.match(/<script[^>]*src[^>]*>/gi) || []).length;
        console.log(`✅ Script Loading: ${deferScripts}/${totalScripts} scripts use defer`);

        // Expected Logger evidence for successful init
        console.log('\n--- EXPECTED LOGGER EVIDENCE ---');
        console.log('Logger.info("UnifiedAppInitializer completed")');
        console.log('Logger.info("Page initialization completed for ' + page.name + '")');
        console.log('Logger.debug("All core systems loaded successfully")');

        // Check for error indicators
        const errorIndicators = [];
        if (!hasInitializer) {
            errorIndicators.push('Missing UnifiedAppInitializer - init may not complete');
        }
        if (!hasLogger) {
            errorIndicators.push('No Logger usage - errors may not be captured');
        }
        if (deferScripts < totalScripts * 0.5) {
            errorIndicators.push('Low defer usage - may cause loading issues');
        }

        if (errorIndicators.length === 0) {
            console.log('\n🎯 VERIFICATION RESULT: ✅ PASS - Ready for init testing');
        } else {
            console.log('\n🎯 VERIFICATION RESULT: ⚠️  WARNING - Potential issues found');
            errorIndicators.forEach(issue => console.log(`   - ${issue}`));
        }

        return {
            page: page.name,
            hasInitializer,
            hasLogger,
            scriptErrors: scriptErrors.length,
            deferRatio: `${deferScripts}/${totalScripts}`,
            errorIndicators,
            status: errorIndicators.length === 0 ? 'PASS' : 'WARNING'
        };

    } catch (error) {
        console.log(`❌ ERROR: Cannot read page file - ${error.message}`);
        return {
            page: page.name,
            error: error.message,
            status: 'ERROR'
        };
    }
}

// Main verification
console.log('🚀 INIT/LOADING VERIFICATION - 5 REPRESENTATIVE PAGES');
console.log('=======================================================');
console.log('Checking for Logger evidence and blocking JS errors');
console.log('Pages: index, login, trades, executions, crud_testing_dashboard');

const results = [];

pages.forEach(page => {
    const result = checkPageInitLoading(page);
    results.push(result);
});

console.log('\n\n📊 SUMMARY REPORT');
console.log('=================');

results.forEach(result => {
    console.log(`${result.page.toUpperCase()}: ${result.status}`);
});

const passCount = results.filter(r => r.status === 'PASS').length;
const warningCount = results.filter(r => r.status === 'WARNING').length;
const errorCount = results.filter(r => r.status === 'ERROR').length;

console.log(`\n📈 OVERALL STATUS: ${passCount} PASS, ${warningCount} WARNING, ${errorCount} ERROR`);

if (passCount === results.length) {
    console.log('✅ ALL PAGES: Ready for init/loading verification');
} else {
    console.log('⚠️  SOME PAGES: May have init/loading issues');
}

console.log('\n🔍 NEXT STEPS:');
console.log('1. Run actual browser testing for Logger evidence');
console.log('2. Verify "UnifiedAppInitializer completed" messages');
console.log('3. Check for blocking JS errors in console');
console.log('4. Confirm all core systems load successfully');
