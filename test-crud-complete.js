#!/usr/bin/env node
/**
 * ========================================
 * Complete CRUD Testing Script - Node.js
 * ========================================
 * 
 * בדיקה מקיפה של כל פעולות CRUD בכל העמודים
 * מריץ בדיקות אמיתיות על הקבצים
 */

const fs = require('fs');
const path = require('path');

// ===== Configuration =====
const PAGES_TO_TEST = [
    {
        name: 'trading_accounts',
        file: 'trading-ui/scripts/trading_accounts.js',
        functions: {
            create: 'saveTradingAccount',
            update: 'updateTradingAccount'
        }
    },
    {
        name: 'trades',
        file: 'trading-ui/scripts/trades.js',
        functions: {
            create: 'addTrade',
            update: 'saveTrade',
            delete: 'deleteTrade'
        }
    },
    {
        name: 'executions',
        file: 'trading-ui/scripts/executions.js',
        functions: {
            create: 'saveExecution',
            update: 'updateExecution'
        }
    },
    {
        name: 'alerts',
        file: 'trading-ui/scripts/alerts.js',
        functions: {
            create: 'saveAlert',
            update: 'updateAlert',
            delete: 'confirmDeleteAlert'
        }
    },
    {
        name: 'cash_flows',
        file: 'trading-ui/scripts/cash_flows.js',
        functions: {
            create: 'saveCashFlow',
            update: 'updateCashFlow',
            delete: 'deleteCashFlow'
        }
    },
    {
        name: 'trade_plans',
        file: 'trading-ui/scripts/trade_plans.js',
        functions: {
            create: 'saveNewTradePlan',
            update: 'saveEditTradePlan',
            delete: 'deleteTradePlan',
            cancel: 'cancelTradePlan',
            reactivate: 'reactivateTradePlan',
            copy: 'copyTradePlan'
        }
    },
    {
        name: 'notes',
        file: 'trading-ui/scripts/notes.js',
        functions: {
            create: 'saveNote',
            update: 'updateNoteFromModal',
            delete: 'deleteNoteFromServer'
        }
    },
    {
        name: 'tickers',
        file: 'trading-ui/scripts/tickers.js',
        functions: {
            create: 'saveTicker',
            update: 'updateTicker',
            delete: 'confirmDeleteTicker'
        }
    }
];

// ===== Helper Functions =====

function extractFunctionBody(content, functionName) {
    // חיפוש הפונקציה
    const patterns = [
        new RegExp(`async\\s+function\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{`, 'g'),
        new RegExp(`function\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{`, 'g'),
        new RegExp(`const\\s+${functionName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>\\s*\\{`, 'g'),
        new RegExp(`const\\s+${functionName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\{`, 'g')
    ];
    
    let match = null;
    let pattern = null;
    
    for (const p of patterns) {
        const m = p.exec(content);
        if (m) {
            match = m;
            pattern = p;
            break;
        }
    }
    
    if (!match) return null;
    
    const startIndex = match.index + match[0].length - 1;
    let braceCount = 1;
    let endIndex = startIndex + 1;
    
    while (braceCount > 0 && endIndex < content.length) {
        if (content[endIndex] === '{') braceCount++;
        if (content[endIndex] === '}') braceCount--;
        endIndex++;
    }
    
    return content.substring(match.index, endIndex);
}

function analyzeFunctionImplementation(functionBody) {
    if (!functionBody) {
        return {
            exists: false,
            usesCRUDResponseHandler: false,
            usesDataCollectionService: false,
            usesGlobalElementCache: false,
            usesOldPattern: false,
            lines: 0
        };
    }
    
    const lines = functionBody.split('\n').filter(l => l.trim()).length;
    
    return {
        exists: true,
        usesCRUDResponseHandler: functionBody.includes('CRUDResponseHandler.handle'),
        usesDataCollectionService: functionBody.includes('DataCollectionService.'),
        usesGlobalElementCache: functionBody.includes('window.getElement'),
        usesOldPattern: functionBody.includes("result.status === 'success'") || 
                       (functionBody.includes('response.ok') && !functionBody.includes('CRUDResponseHandler')),
        isAsync: functionBody.includes('async '),
        hasAwait: functionBody.includes('await '),
        hasTryCatch: functionBody.includes('try {') && functionBody.includes('catch'),
        lines: lines
    };
}

function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (err) {
        return 0;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ===== Main Testing =====

console.log('\n🧪 COMPREHENSIVE CRUD TESTING');
console.log('='.repeat(100));
console.log('Testing all CRUD functions across 8 pages\n');

const allResults = [];
const fileSizes = [];

PAGES_TO_TEST.forEach(page => {
    console.log(`\n📄 ${page.name.toUpperCase()}`);
    console.log('-'.repeat(100));
    
    const filePath = path.join(__dirname, page.file);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileSize = getFileSize(filePath);
        const lineCount = content.split('\n').length;
        
        fileSizes.push({
            page: page.name,
            size: fileSize,
            lines: lineCount,
            path: page.file
        });
        
        console.log(`   📁 File: ${page.file}`);
        console.log(`   📊 Size: ${formatBytes(fileSize)} | Lines: ${lineCount}`);
        console.log('');
        
        const pageResults = {
            page: page.name,
            fileSize: fileSize,
            functions: []
        };
        
        Object.entries(page.functions).forEach(([type, funcName]) => {
            const functionBody = extractFunctionBody(content, funcName);
            const analysis = analyzeFunctionImplementation(functionBody);
            
            const result = {
                name: funcName,
                type: type,
                ...analysis
            };
            
            pageResults.functions.push(result);
            
            // הדפסה צבעונית
            const status = analysis.usesCRUDResponseHandler ? '✅' : (analysis.usesOldPattern ? '⚠️' : '❌');
            const crudStatus = analysis.usesCRUDResponseHandler ? 'CRUDResponseHandler' : (analysis.usesOldPattern ? 'Old Pattern' : 'Not Found');
            const dataCollection = analysis.usesDataCollectionService ? '✅ DataCollection' : '   -';
            const globalCache = analysis.usesGlobalElementCache ? '✅ GlobalCache' : '   -';
            
            console.log(`   ${status} ${type.padEnd(10)} | ${funcName.padEnd(25)} | ${crudStatus.padEnd(20)} | ${dataCollection.padEnd(20)} | ${globalCache.padEnd(15)} | ${analysis.lines} lines`);
        });
        
        allResults.push(pageResults);
        
    } catch (err) {
        console.log(`   ❌ Error reading file: ${err.message}`);
    }
});

// ===== Summary Statistics =====

console.log('\n\n' + '='.repeat(100));
console.log('📊 SUMMARY STATISTICS');
console.log('='.repeat(100));

let totalFunctions = 0;
let withCRUD = 0;
let withDataCollection = 0;
let withGlobalCache = 0;
let withOldPattern = 0;

allResults.forEach(page => {
    page.functions.forEach(func => {
        totalFunctions++;
        if (func.usesCRUDResponseHandler) withCRUD++;
        if (func.usesDataCollectionService) withDataCollection++;
        if (func.usesGlobalElementCache) withGlobalCache++;
        if (func.usesOldPattern) withOldPattern++;
    });
});

console.log(`\nTotal CRUD Functions Analyzed: ${totalFunctions}`);
console.log(`✅ Using CRUDResponseHandler: ${withCRUD} (${Math.round(withCRUD/totalFunctions*100)}%)`);
console.log(`✅ Using DataCollectionService: ${withDataCollection} (${Math.round(withDataCollection/totalFunctions*100)}%)`);
console.log(`✅ Using Global Element Cache: ${withGlobalCache} (${Math.round(withGlobalCache/totalFunctions*100)}%)`);
console.log(`⚠️  Using Old Patterns: ${withOldPattern} (${Math.round(withOldPattern/totalFunctions*100)}%)`);

// ===== File Sizes Table =====

console.log('\n\n' + '='.repeat(100));
console.log('📦 FILE SIZES ANALYSIS');
console.log('='.repeat(100));
console.log('\nSorted by size (largest first):\n');

fileSizes.sort((a, b) => b.size - a.size);

console.log('Rank | Page              | Size      | Lines  | Path');
console.log('-'.repeat(100));

fileSizes.forEach((file, index) => {
    const rank = (index + 1).toString().padStart(2, ' ');
    const name = file.page.padEnd(17);
    const size = formatBytes(file.size).padStart(9);
    const lines = file.lines.toString().padStart(6);
    console.log(`${rank}   | ${name} | ${size} | ${lines} | ${file.path}`);
});

// Calculate averages
const avgSize = fileSizes.reduce((sum, f) => sum + f.size, 0) / fileSizes.length;
const avgLines = Math.round(fileSizes.reduce((sum, f) => sum + f.lines, 0) / fileSizes.length);

console.log('-'.repeat(100));
console.log(`AVG  | ${''.padEnd(17)} | ${formatBytes(avgSize).padStart(9)} | ${avgLines.toString().padStart(6)} |`);

// Identify large files
console.log('\n⚠️  FILES REQUIRING REVIEW (>100KB or >3000 lines):\n');

const largeFiles = fileSizes.filter(f => f.size > 100000 || f.lines > 3000);

if (largeFiles.length === 0) {
    console.log('   ✅ All files are within acceptable size limits!');
} else {
    largeFiles.forEach(file => {
        console.log(`   ⚠️  ${file.page}: ${formatBytes(file.size)} | ${file.lines} lines`);
        console.log(`      → Consider refactoring or splitting into smaller modules`);
    });
}

console.log('\n' + '='.repeat(100));
console.log('✅ Testing Complete!\n');

// Export results as JSON
const outputPath = path.join(__dirname, 'crud-test-results.json');
fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results: allResults,
    fileSizes: fileSizes,
    summary: {
        totalFunctions,
        withCRUD,
        withDataCollection,
        withGlobalCache,
        withOldPattern
    }
}, null, 2));

console.log(`📄 Detailed results saved to: crud-test-results.json\n`);

