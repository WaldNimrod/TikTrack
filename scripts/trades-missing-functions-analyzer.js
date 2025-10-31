#!/usr/bin/env node

/**
 * Trades Missing Functions Analyzer
 * ==================================
 * 
 * ניתוח מפורט של כל הפונקציות החסרות בעמוד trades
 * 
 * @version 1.0.0
 * @created January 31, 2025
 */

const fs = require('fs');
const path = require('path');

const TRADES_HTML = path.join(__dirname, '../trading-ui/trades.html');
const TRADES_JS = path.join(__dirname, '../trading-ui/scripts/trades.js');

/**
 * Extract functions called from HTML
 */
function extractHTMLCalls(htmlContent) {
    const calls = new Set();
    
    // onclick attributes
    const onclickRegex = /onclick=["']([^"']+)["']/gi;
    let match;
    while ((match = onclickRegex.exec(htmlContent)) !== null) {
        const call = match[1].trim();
        // Extract function names from calls like "showAddTradeModal()" or "toggleSection('top')"
        const funcMatch = call.match(/^(\w+)\(/);
        if (funcMatch) {
            calls.add(funcMatch[1]);
        }
    }
    
    // data-onclick attributes
    const dataOnclickRegex = /data-onclick=["']([^"']+)["']/gi;
    while ((match = dataOnclickRegex.exec(htmlContent)) !== null) {
        const call = match[1].trim();
        const funcMatch = call.match(/^(\w+)\(/);
        if (funcMatch) {
            calls.add(funcMatch[1]);
        }
    }
    
    // onclick in button elements
    const buttonOnclickRegex = /<button[^>]*onclick=["']([^"']+)["'][^>]*>/gi;
    while ((match = buttonOnclickRegex.exec(htmlContent)) !== null) {
        const call = match[1].trim();
        const funcMatch = call.match(/^(\w+)\(/);
        if (funcMatch) {
            calls.add(funcMatch[1]);
        }
    }
    
    return Array.from(calls);
}

/**
 * Extract functions defined and exported in JS
 */
function extractJSFunctions(jsContent) {
    const defined = new Set();
    const exported = new Set();
    
    // Function declarations: function funcName(, async function funcName(, const funcName = function
    const funcDeclRegex = /(?:function|async\s+function|const|let|var)\s+(\w+)\s*(?:=|\(|=\s*async\s*\()/g;
    let match;
    while ((match = funcDeclRegex.exec(jsContent)) !== null) {
        defined.add(match[1]);
    }
    
    // Arrow functions: const funcName = ( => , const funcName = async ( =>
    const arrowRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/g;
    while ((match = arrowRegex.exec(jsContent)) !== null) {
        defined.add(match[1]);
    }
    
    // Global exports: window.funcName = funcName, window.funcName = ..., window['funcName'] =
    const exportRegex = /window\.(\w+)\s*=|window\[['"](\w+)['"]\]\s*=/g;
    while ((match = exportRegex.exec(jsContent)) !== null) {
        const name = match[1] || match[2];
        exported.add(name);
    }
    
    // Check if exported functions are actually defined
    const exports = Array.from(exported);
    const missingExports = exports.filter(name => !defined.has(name));
    
    return {
        defined: Array.from(defined),
        exported: exports,
        missingExports
    };
}

/**
 * Extract function calls from JS
 */
function extractJSCalls(jsContent) {
    const calls = new Set();
    
    // Direct function calls: funcName(, window.funcName(
    const directCallRegex = /(?:^|[^.\w])(\w+)\s*\(/gm;
    const windowCallRegex = /window\.(\w+)\s*\(/g;
    
    let match;
    while ((match = directCallRegex.exec(jsContent)) !== null) {
        const name = match[1];
        // Skip common built-ins
        if (!['console', 'document', 'window', 'setTimeout', 'setInterval', 'parseInt', 
              'parseFloat', 'JSON', 'Date', 'Array', 'Object', 'Math', 'String', 
              'Number', 'Boolean', 'RegExp', 'Error', 'Promise', 'fetch', 'localStorage',
              'sessionStorage', 'typeof', 'delete', 'new', 'return', 'if', 'else', 'for',
              'while', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally',
              'throw', 'await', 'async', 'let', 'const', 'var', 'function'].includes(name)) {
            calls.add(name);
        }
    }
    
    while ((match = windowCallRegex.exec(jsContent)) !== null) {
        calls.add(match[1]);
    }
    
    return Array.from(calls);
}

/**
 * Main analysis
 */
function analyzeTradesPage() {
    console.log('🔍 מתחיל ניתוח מפורט של עמוד Trades...\n');
    
    // Read files
    const htmlContent = fs.readFileSync(TRADES_HTML, 'utf8');
    const jsContent = fs.readFileSync(TRADES_JS, 'utf8');
    
    // Extract information
    const htmlCalls = extractHTMLCalls(htmlContent);
    const jsInfo = extractJSFunctions(jsContent);
    const jsCalls = extractJSCalls(jsContent);
    
    console.log('📊 תוצאות ניתוח:\n');
    console.log(`   • פונקציות נקראות מה-HTML: ${htmlCalls.length}`);
    console.log(`   • פונקציות מוגדרות ב-JS: ${jsInfo.defined.length}`);
    console.log(`   • פונקציות מיוצאות גלובלית: ${jsInfo.exported.length}`);
    console.log(`   • קריאות לפונקציות ב-JS: ${jsCalls.length}\n`);
    
    // Find missing functions
    console.log('❌ פונקציות חסרות:\n');
    
    // 1. Functions called from HTML but not exported
    const missingFromHTML = htmlCalls.filter(name => !jsInfo.exported.includes(name));
    if (missingFromHTML.length > 0) {
        console.log('   🔴 נקראות מה-HTML אבל לא מיוצאות:');
        missingFromHTML.forEach(name => {
            const isDefined = jsInfo.defined.includes(name);
            console.log(`      • ${name} ${isDefined ? '(קיימת אבל לא מיוצאת!)' : '(לא קיימת בכלל!)'}`);
        });
        console.log('');
    }
    
    // 2. Functions exported but not defined
    if (jsInfo.missingExports.length > 0) {
        console.log('   🟡 מיוצאות אבל לא מוגדרות:');
        jsInfo.missingExports.forEach(name => {
            console.log(`      • window.${name} = ${name}; // אבל ${name} לא קיים!`);
        });
        console.log('');
    }
    
    // 3. Functions called from JS but not defined
    const missingFromJS = jsCalls.filter(name => 
        !jsInfo.defined.includes(name) && 
        !jsInfo.exported.includes(name) &&
        !htmlCalls.includes(name)
    ).slice(0, 20); // Limit to 20 most relevant
    
    if (missingFromJS.length > 0) {
        console.log('   🟠 נקראות מ-JS אבל לא מוגדרות (20 ראשונות):');
        missingFromJS.forEach(name => {
            console.log(`      • ${name}()`);
        });
        console.log('');
    }
    
    // Summary
    console.log('\n📋 סיכום:');
    console.log(`   • סך הכל פונקציות חסרות: ${missingFromHTML.length + jsInfo.missingExports.length}`);
    console.log(`   • קריטיות (נקראות מה-HTML): ${missingFromHTML.length}`);
    console.log(`   • מיוצאות אבל לא קיימות: ${jsInfo.missingExports.length}`);
    
    // Detailed HTML calls report
    if (htmlCalls.length > 0) {
        console.log('\n📝 פירוט פונקציות נקראות מה-HTML:');
        htmlCalls.forEach(name => {
            const isExported = jsInfo.exported.includes(name);
            const isDefined = jsInfo.defined.includes(name);
            const status = isExported ? '✅' : (isDefined ? '⚠️' : '❌');
            console.log(`   ${status} ${name} - ${isExported ? 'מיוצאת' : (isDefined ? 'מוגדרת (לא מיוצאת)' : 'לא קיימת')}`);
        });
    }
    
    return {
        htmlCalls,
        jsInfo,
        jsCalls,
        missingFromHTML,
        missingExports: jsInfo.missingExports
    };
}

// Run analysis
try {
    const results = analyzeTradesPage();
    
    // Save detailed report
    const reportPath = path.join(__dirname, '../reports/trades-missing-functions-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 דוח מפורט נשמר ב: ${reportPath}`);
    
} catch (error) {
    console.error('❌ שגיאה בניתוח:', error);
    process.exit(1);
}

