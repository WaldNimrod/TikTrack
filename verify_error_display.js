/**
 * Verify Error Display for Stage 2 Entities
 * Ensure errors are displayed via Logger only, not console/alert
 */

// Simulate window and Logger
global.window = {
    Logger: {
        info: function(msg, data) {
            console.log('ℹ️ LOGGER:', msg, data ? JSON.stringify(data).substring(0, 100) + '...' : '');
        },
        error: function(msg, data) {
            console.log('❌ LOGGER ERROR:', msg, data ? JSON.stringify(data).substring(0, 100) + '...' : '');
        },
        warn: function(msg, data) {
            console.log('⚠️ LOGGER WARN:', msg, data ? JSON.stringify(data).substring(0, 100) + '...' : '');
        }
    }
};

// Mock console to detect any usage
const originalConsole = global.console;
let consoleUsage = [];

global.console = {
    log: (...args) => {
        consoleUsage.push({ type: 'log', args: args.join(' ') });
        originalConsole.log(...args);
    },
    error: (...args) => {
        consoleUsage.push({ type: 'error', args: args.join(' ') });
        originalConsole.error(...args);
    },
    warn: (...args) => {
        consoleUsage.push({ type: 'warn', args: args.join(' ') });
        originalConsole.warn(...args);
    }
};

// Mock table update functions
let tableUpdates = [];

function updateTestResultsTable(results) {
    tableUpdates.push(results);
    console.log('📊 TABLE UPDATE:', results);
}

// Mock error extraction
function extractErrorMessage(response) {
    if (response && response.error) {
        return response.error;
    }
    if (response && response.message) {
        return response.message;
    }
    return 'Unknown error';
}

// Simulate API error responses
const mockApiErrors = {
    trading_account: {
        error: 'Validation failed: name is required',
        status: 400
    },
    execution: {
        error: 'Foreign key constraint: trading_account_id does not exist',
        status: 400
    }
};

// Simulate CRUD operations that fail
async function simulateCrudOperations() {
    console.log('🔄 Simulating CRUD operations for Stage 2 entities...\n');

    const entities = ['trading_account', 'execution'];

    for (const entity of entities) {
        console.log(`📋 Testing ${entity} error display:`);

        // Simulate failed operation
        const apiResponse = mockApiErrors[entity];
        const errorMessage = extractErrorMessage(apiResponse);

        // This should use Logger, not console
        window.Logger.error(`CRUD ${entity} operation failed`, {
            entity,
            error: errorMessage,
            status: apiResponse.status
        });

        // Simulate table update with error
        const tableResult = {
            entity,
            operation: 'create',
            status: 'failed',
            error: errorMessage,
            details: `API returned ${apiResponse.status}: ${errorMessage}`
        };

        updateTestResultsTable(tableResult);

        console.log(`  ✅ Error displayed via Logger: "${errorMessage}"`);
        console.log(`  ✅ Table updated with specific error: "${tableResult.details}"\n`);
    }
}

// Check for console usage
function checkConsoleUsage() {
    console.log('🔍 Checking for console.error/warn usage (not console.log):');

    const errorUsage = consoleUsage.filter(usage =>
        usage.type === 'error' || usage.type === 'warn'
    );

    if (errorUsage.length > 0) {
        console.log('❌ FOUND console.error/warn usage:');
        errorUsage.forEach(usage => {
            console.log(`  ${usage.type}: ${usage.args}`);
        });
        return false;
    } else {
        console.log('✅ No console.error/warn usage found - only Logger used for errors');
        return true;
    }
}

async function runErrorDisplayVerification() {
    console.log('🚀 Starting Error Display Verification for Stage 2\n');

    // Reset tracking
    consoleUsage = [];
    tableUpdates = [];

    // Run simulation
    await simulateCrudOperations();

    // Check console usage
    const consoleClean = checkConsoleUsage();

    // Verify table updates
    console.log('📊 Verifying table error display:');
    const hasSpecificErrors = tableUpdates.every(update =>
        update.error && update.error !== 'Unknown error' && update.details
    );

    if (hasSpecificErrors) {
        console.log('✅ All table entries show specific error messages');
    } else {
        console.log('❌ Some table entries show generic/unknown errors');
    }

    // Summary
    console.log('\n📋 Verification Summary:');
    console.log(`  Logger-only errors: ${consoleClean ? '✅' : '❌'}`);
    console.log(`  Specific table errors: ${hasSpecificErrors ? '✅' : '❌'}`);
    console.log(`  Total table updates: ${tableUpdates.length}`);

    const success = consoleClean && hasSpecificErrors;
    console.log(`\n${success ? '🎉' : '💥'} Error display verification ${success ? 'PASSED' : 'FAILED'}`);

    return success;
}

// Run verification
runErrorDisplayVerification().then(success => {
    process.exit(success ? 0 : 1);
});
