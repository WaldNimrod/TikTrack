#!/usr/bin/env node

/**
 * CRUD Operations Validation Script
 * ==================================
 * 
 * סקריפט בדיקה מקיף לוודא שכל פעולות CRUD בכל 8 העמודים
 * משתמשות במערכות הכלליות הנכונות
 */

const fs = require('fs');
const path = require('path');

// רשימת העמודים לבדוק
const pages = [
    { name: 'trades', file: 'trading-ui/scripts/trades.js' },
    { name: 'trading_accounts', file: 'trading-ui/scripts/trading_accounts.js' },
    { name: 'alerts', file: 'trading-ui/scripts/alerts.js' },
    { name: 'executions', file: 'trading-ui/scripts/executions.js' },
    { name: 'tickers', file: 'trading-ui/scripts/tickers.js' },
    { name: 'cash_flows', file: 'trading-ui/scripts/cash_flows.js' },
    { name: 'trade_plans', file: 'trading-ui/scripts/trade_plans.js' },
    { name: 'notes', file: 'trading-ui/scripts/notes.js' }
];

// מערכות כלליות שאמור להיות שימוש בהן
const requiredSystems = {
    CREATE: {
        clearCacheBeforeCRUD: true,
        DataCollectionService: true,
        CRUDResponseHandler: true
    },
    UPDATE: {
        clearCacheBeforeCRUD: true,
        DataCollectionService: false, // אופציונלי
        CRUDResponseHandler: true
    },
    DELETE: {
        clearCacheBeforeCRUD: true,
        CRUDResponseHandler: true,
        showDeleteWarning: false // אופציונלי
    },
    READ: {
        showEntityDetails: true
    }
};

// תוצאות
const results = {
    pages: {},
    summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
    }
};

/**
 * קריאת קובץ
 */
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`❌ שגיאה בקריאת קובץ ${filePath}:`, error.message);
        return null;
    }
}

/**
 * בדיקת CREATE
 */
function checkCREATE(content, pageName) {
    const checks = {
        hasSaveFunction: false,
        usesClearCache: false,
        usesDataCollection: false,
        usesResponseHandler: false,
        hasValidation: false
    };
    
    // בדיקת פונקציית save - חיפוש בפונקציות שיש להן 'add' או 'save'
    const saveFunctionPattern = /async function save\w+\(|function save\w+\(/;
    checks.hasSaveFunction = saveFunctionPattern.test(content);
    
    // בדיקת clearCacheBeforeCRUD עם 'add' - רק quotes פשוטים
    checks.usesClearCache = /clearCacheBeforeCRUD.*'add'/.test(content);
    
    // בדיקת DataCollectionService
    checks.usesDataCollection = /DataCollectionService\.collectFormData/.test(content);
    
    // בדיקת CRUDResponseHandler
    checks.usesResponseHandler = /CRUDResponseHandler\.handle(?:Save|Update)Response/.test(content);
    
    // בדיקת ולידציה
    checks.hasValidation = /showValidationWarning/.test(content) || /validateEntityForm/.test(content);
    
    return checks;
}

/**
 * בדיקת UPDATE
 */
function checkUPDATE(content, pageName) {
    const checks = {
        hasUpdateFunction: false,
        usesClearCache: false,
        usesResponseHandler: false
    };
    
    // בדיקת פונקציית update
    const updateFunctionPattern = /async function (?:update|save)\w+\(|function (?:update|save)\w+\(/;
    checks.hasUpdateFunction = updateFunctionPattern.test(content);
    
    // בדיקת clearCacheBeforeCRUD עם 'edit' - רק quotes פשוטים
    checks.usesClearCache = /clearCacheBeforeCRUD.*'edit'/.test(content);
    
    // בדיקת CRUDResponseHandler עם handleUpdateResponse או handleSaveResponse
    checks.usesResponseHandler = /CRUDResponseHandler\.handle(?:Save|Update)Response/.test(content);
    
    return checks;
}

/**
 * בדיקת DELETE
 */
function checkDELETE(content, pageName) {
    const checks = {
        hasDeleteFunction: false,
        usesClearCache: false,
        usesResponseHandler: false,
        usesWarning: false
    };
    
    // בדיקת פונקציית delete או performDeletion
    const deleteFunctionPattern = /async function (?:delete|perform.*Deletion)\w+\(|function (?:delete|perform.*Deletion)\w+\(/;
    checks.hasDeleteFunction = deleteFunctionPattern.test(content);
    
    // בדיקת clearCacheBeforeCRUD עם 'delete' - רק quotes פשוטים
    checks.usesClearCache = /clearCacheBeforeCRUD.*'delete'/.test(content);
    
    // בדיקת CRUDResponseHandler
    checks.usesResponseHandler = /CRUDResponseHandler\.handleDeleteResponse/.test(content);
    
    // בדיקת showDeleteWarning
    checks.usesWarning = /showDeleteWarning/.test(content);
    
    return checks;
}

/**
 * בדיקת READ
 */
function checkREAD(content, pageName) {
    const checks = {
        hasViewFunction: false,
        usesEntityDetails: false
    };
    
    // בדיקת פונקציית view או show
    const viewFunctionPattern = /(?:function|async function)\s+(?:view|show)\w+Details?\s*\(/;
    checks.hasViewFunction = viewFunctionPattern.test(content);
    
    // בדיקת showEntityDetails - חיפוש בביטוי או בחלק מהפונקציה
    checks.usesEntityDetails = /showEntityDetails\s*\(/.test(content);
    
    return checks;
}

/**
 * הערכת תוצאות
 */
function evaluateResults(checks, type) {
    let passed = true;
    let warnings = [];
    
    const requiredChecks = requiredSystems[type];
    if (!requiredChecks) return { passed: false, warnings: ['Unknown operation type'] };
    
    // מיפוי בין שמות השדות ל-checks
    const fieldMapping = {
        'clearCacheBeforeCRUD': 'usesClearCache',
        'DataCollectionService': 'usesDataCollection',
        'CRUDResponseHandler': 'usesResponseHandler',
        'showDeleteWarning': 'usesWarning',
        'showEntityDetails': 'usesEntityDetails'
    };
    
    for (const [key, isRequired] of Object.entries(requiredChecks)) {
        const actualFieldName = fieldMapping[key] || key;
        if (isRequired && !checks[actualFieldName]) {
            passed = false;
            warnings.push(`Missing: ${key}`);
        }
    }
    
    return { passed, warnings };
}

/**
 * הרצת בדיקות על עמוד
 */
function testPage(page) {
    console.log(`\n🔍 בודק עמוד: ${page.name}`);
    console.log(`📄 קובץ: ${page.file}`);
    
    const content = readFile(page.file);
    if (!content) {
        results.pages[page.name] = { error: 'Cannot read file' };
        return;
    }
    
    const pageResults = {
        CREATE: checkCREATE(content, page.name),
        UPDATE: checkUPDATE(content, page.name),
        DELETE: checkDELETE(content, page.name),
        READ: checkREAD(content, page.name)
    };
    
    // הערכת תוצאות
    for (const [type, checks] of Object.entries(pageResults)) {
        const evaluation = evaluateResults(checks, type);
        pageResults[type].evaluation = evaluation;
        
        if (evaluation.passed) {
            console.log(`  ✅ ${type}: OK`);
            results.summary.passed++;
        } else {
            console.log(`  ❌ ${type}: FAILED`);
            console.log(`     Warnings: ${evaluation.warnings.join(', ')}`);
            results.summary.failed++;
        }
        results.summary.total++;
    }
    
    results.pages[page.name] = pageResults;
}

/**
 * הרצת בדיקות
 */
function runTests() {
    console.log('🚀 מתחיל בדיקת CRUD בכל 8 העמודים...\n');
    console.log('='.repeat(80));
    
    for (const page of pages) {
        testPage(page);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 סיכום תוצאות:');
    console.log(`✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log(`📊 Total: ${results.summary.total}`);
    
    // שמירת תוצאות ל-JSON
    fs.writeFileSync('crud-validation-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 תוצאות נשמרו ל-crud-validation-results.json');
    
    return results.summary.failed === 0;
}

// הרצה
if (require.main === module) {
    const success = runTests();
    process.exit(success ? 0 : 1);
}

module.exports = { runTests };
