/**
 * Verify Console Usage for Stage 2 Testing Code
 * Ensure no console.error/warn/alert usage in testing code for executions/trading_accounts
 */

const fs = require('fs');
const path = require('path');

// Files to check
const filesToCheck = [
    'trading-ui/scripts/crud_testing_dashboard.js',
    'trading-ui/scripts/crud-testing-enhanced.js'
];

// Forbidden console methods (only error/warn/alert functions, not variable names)
const forbiddenMethods = ['console.error', 'console.warn', 'alert('];

function checkConsoleUsage(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    const violations = [];
    let inExecutionsFunction = false;
    let inTradingAccountsFunction = false;

    lines.forEach((line, index) => {
        // Track if we're in executions or trading_accounts related functions
        if (line.includes('executions') || line.includes('trading_accounts') ||
            line.includes('runExecutionTestOnly') || line.includes('runTradingAccountTestOnly')) {
            if (line.includes('function') || line.includes('async') || line.includes('=')) {
                inExecutionsFunction = line.includes('execution') || line.includes('Execution');
                inTradingAccountsFunction = line.includes('trading_account') || line.includes('TradingAccount');
            }
        }

        // Check for forbidden methods only in executions/trading_accounts related code
        if (inExecutionsFunction || inTradingAccountsFunction) {
            forbiddenMethods.forEach(method => {
                if (line.includes(method)) {
                    violations.push({
                        file: filePath,
                        line: index + 1,
                        method,
                        content: line.trim(),
                        context: inExecutionsFunction ? 'executions' : 'trading_accounts'
                    });
                }
            });
        }

        // Reset flags at function end
        if (line.includes('}')) {
            inExecutionsFunction = false;
            inTradingAccountsFunction = false;
        }
    });

    return violations;
}

function main() {
    console.log('🔍 Checking console usage in Stage 2 testing code...\n');

    let totalViolations = 0;

    filesToCheck.forEach(filePath => {
        const fullPath = path.join(__dirname, filePath);
        if (!fs.existsSync(fullPath)) {
            console.log(`❌ File not found: ${filePath}`);
            return;
        }

        console.log(`📋 Checking ${filePath}:`);
        const violations = checkConsoleUsage(fullPath);

        if (violations.length > 0) {
            violations.forEach(v => {
                console.log(`  ❌ Line ${v.line}: ${v.method} - ${v.content}`);
                totalViolations++;
            });
        } else {
            console.log('  ✅ No forbidden console usage found');
        }
        console.log('');
    });

    console.log(`📊 Summary:`);
    console.log(`  Total violations: ${totalViolations}`);
    console.log(`  Forbidden methods checked: ${forbiddenMethods.join(', ')}`);

    if (totalViolations === 0) {
        console.log('✅ All testing code follows Logger-only policy for errors');
        process.exit(0);
    } else {
        console.log('❌ Found forbidden console usage - must be replaced with Logger');
        process.exit(1);
    }
}

main();
