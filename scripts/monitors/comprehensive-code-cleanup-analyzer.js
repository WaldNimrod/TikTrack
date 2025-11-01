#!/usr/bin/env node

/**
 * Comprehensive Code Cleanup Analyzer - TikTrack
 * =============================================
 * 
 * כלי מקיף לזיהוי קוד כפול ופונקציות לא בשימוש
 * 
 * המטרה:
 * 1. זיהוי פונקציות שאין אליהן שום קריאה
 * 2. זיהוי פונקציות כפולות בתוך העמוד
 * 3. זיהוי פונקציות מקומיות שיש להן תחליפים במערכת הכללית
 * 
 * ⚠️ חשוב: הכלי רק מזהה ומדווח - לא מתקן שום דבר!
 * 
 * @version 1.0.0
 * @created November 2, 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    scriptsDir: 'trading-ui/scripts',
    outputDir: 'reports',
    corePages: [
        'index.js',
        'trades.js', 
        'executions.js',
        'alerts.js',
        'trade_plans.js',
        'cash_flows.js',
        'research.js',
        'notes.js',
        'preferences-page.js',
        'tickers.js',
        'trading_accounts.js',
        'database.js'
    ],
    // רשימת קבצים של מערכות כלליות (מתוך package-manifest.js)
    globalSystemsFiles: [
        'notification-system.js',
        'logger-service.js',
        'unified-cache-manager.js',
        'ui-utils.js',
        'tables.js',
        'main.js',
        'header-system.js',
        'page-utils.js',
        'translation-utils.js',
        'button-icons.js',
        'event-handler-manager.js',
        'button-system-init.js',
        'color-scheme-system.js',
        'services/data-collection-service.js',
        'services/field-renderer-service.js',
        'services/select-populator-service.js',
        'services/statistics-calculator.js',
        'services/default-value-setter.js',
        'services/crud-response-handler.js',
        'services/alert-condition-renderer.js',
        'pagination-system.js',
        'modules/actions-menu-system.js',
        'modules/business-module.js',
        'modules/cache-module.js',
        'modules/communication-module.js',
        'modules/core-systems.js',
        'modules/data-advanced.js',
        'modules/data-basic.js',
        'modules/ui-advanced.js',
        'modules/ui-basic.js',
        'modal-manager-v2.js',
        'date-utils.js',
        'data-utils.js',
        'preferences-core-new.js',
        'preferences-colors.js',
        'preferences-profiles.js',
        'preferences-lazy-loader.js',
        'preferences-validation.js',
        'preferences-ui.js',
        'validation-utils.js',
        'account-service.js',
        'alert-service.js',
        'ticker-service.js',
        'trade-plan-service.js',
        'active-alerts-component.js',
        'condition-translator.js',
        'constraints.js',
        'linked-items.js',
        'related-object-filters.js',
        'yahoo-finance-service.js',
        'external-data-service.js',
        'external-data-settings-service.js',
        'external-data-dashboard.js'
    ],
    // פונקציות מובנות שלא נחשבות כפונקציות לא בשימוש
    builtInFunctions: [
        'console', 'alert', 'confirm', 'prompt', 'setTimeout', 'setInterval',
        'clearTimeout', 'clearInterval', 'fetch', 'XMLHttpRequest',
        'addEventListener', 'removeEventListener', 'querySelector', 'querySelectorAll',
        'getElementById', 'getElementsByClassName', 'createElement', 'appendChild',
        'removeChild', 'insertBefore', 'JSON', 'parse', 'stringify', 'Math',
        'Date', 'Array', 'Object', 'window', 'document', 'location', 'history',
        'require', 'module', 'exports', 'process', 'Buffer', 'global'
    ]
};

/**
 * רשימת פונקציות כלליות מתוך המערכות הכלליות
 * מבוסס על GENERAL_SYSTEMS_LIST.md
 */
const GLOBAL_SYSTEM_FUNCTIONS = {
    // Notification System
    'showNotification': { system: 'notification-system.js', category: 'NOTIFICATION' },
    'showSuccessNotification': { system: 'notification-system.js', category: 'NOTIFICATION' },
    'showErrorNotification': { system: 'notification-system.js', category: 'NOTIFICATION' },
    'showWarningNotification': { system: 'notification-system.js', category: 'NOTIFICATION' },
    'showInfoNotification': { system: 'notification-system.js', category: 'NOTIFICATION' },
    
    // UI Utils
    'toggleSection': { system: 'ui-utils.js', category: 'UI_MANAGEMENT' },
    'toggleAllSections': { system: 'ui-utils.js', category: 'UI_MANAGEMENT' },
    'restoreSectionStates': { system: 'ui-utils.js', category: 'UI_MANAGEMENT' },
    'enhancedTableRefresh': { system: 'ui-utils.js', category: 'UI_MANAGEMENT' },
    'handleApiResponseWithRefresh': { system: 'ui-utils.js', category: 'API' },
    
    // Tables
    'sortTableData': { system: 'tables.js', category: 'DATA_LOADING' },
    'sortTable': { system: 'tables.js', category: 'DATA_LOADING' },
    
    // Cache
    'clearAllCache': { system: 'unified-cache-manager.js', category: 'CACHE' },
    'clearDevelopmentCache': { system: 'unified-cache-manager.js', category: 'CACHE' },
    
    // Page Utils
    'loadPageState': { system: 'page-utils.js', category: 'UTILITY' },
    'savePageState': { system: 'page-utils.js', category: 'UTILITY' },
    
    // Field Renderer
    'renderStatus': { system: 'services/field-renderer-service.js', category: 'UI_MANAGEMENT' },
    'renderType': { system: 'services/field-renderer-service.js', category: 'UI_MANAGEMENT' },
    'renderAmount': { system: 'services/field-renderer-service.js', category: 'UI_MANAGEMENT' },
    'renderSide': { system: 'services/field-renderer-service.js', category: 'UI_MANAGEMENT' },
    
    // CRUD Response Handler
    'handleCrudResponse': { system: 'services/crud-response-handler.js', category: 'API' },
    'handleCrudError': { system: 'services/crud-response-handler.js', category: 'API' },
    
    // Modal Manager
    'showModal': { system: 'modal-manager-v2.js', category: 'UI_MANAGEMENT' },
    'closeModal': { system: 'modal-manager-v2.js', category: 'UI_MANAGEMENT' },
    'closeModalGlobal': { system: 'modal-manager-v2.js', category: 'UI_MANAGEMENT' },
    
    // Date Utils
    'formatDate': { system: 'date-utils.js', category: 'FORMATTING' },
    'parseDate': { system: 'date-utils.js', category: 'FORMATTING' },
    
    // Data Utils
    'isNumeric': { system: 'data-utils.js', category: 'VALIDATION' },
    
    // Validation
    'validateSelectField': { system: 'validation-utils.js', category: 'VALIDATION' },
    
    // Linked Items
    'viewLinkedItems': { system: 'linked-items.js', category: 'DATA_LOADING' },
    'checkLinkedItemsBeforeAction': { system: 'linked-items.js', category: 'VALIDATION' },
    
    // Statistics
    'updatePageSummaryStats': { system: 'services/statistics-calculator.js', category: 'DATA_LOADING' }
};

class ComprehensiveCodeCleanupAnalyzer {
    constructor() {
        this.allFunctions = new Map(); // file -> functions[]
        this.functionDefinitions = new Map(); // functionName -> [{ file, line, type }]
        this.functionCalls = new Map(); // functionName -> Set<callerFile>
        this.callGraph = new Map(); // functionName -> Set<calledFunctions>
        this.results = {
            unusedFunctions: [], // פונקציות ללא קריאות
            duplicateFunctions: [], // פונקציות כפולות בתוך קובץ
            localWithGlobalAlternative: [], // פונקציות מקומיות עם תחליף כללי
            summary: {
                totalFiles: 0,
                totalFunctions: 0,
                unusedCount: 0,
                duplicateCount: 0,
                localAlternativeCount: 0
            }
        };
    }

    /**
     * חילוץ כל הפונקציות מקובץ
     * ⚠️ שיפור: מתעלם מ-JSDoc @function (false positives)
     */
    extractFunctions(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const functions = [];
            const seenFunctions = new Map(); // name -> {type, lineNumber, startIndex}
            
            // דפוסים שונים להגדרת פונקציות
            const patterns = [
                // function name() {}
                { regex: /function\s+(\w+)\s*\([^)]*\)\s*{/g, type: 'function' },
                // const name = function() {}
                { regex: /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function\s*\([^)]*\)\s*{/g, type: 'const-function' },
                // const name = () => {}
                { regex: /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*{/g, type: 'arrow' },
                // async function name() {}
                { regex: /async\s+function\s+(\w+)\s*\([^)]*\)\s*{/g, type: 'async-function' },
                // name: function() {}
                { regex: /(\w+)\s*:\s*(?:async\s+)?function\s*\([^)]*\)\s*{/g, type: 'method' },
                // name: () => {}
                { regex: /(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>\s*{/g, type: 'arrow-method' }
            ];
            
            // התעלמות מ-JSDoc @function (false positives)
            const jsdocPattern = /\/\*\*[\s\S]*?@function\s+(\w+)[\s\S]*?\*\//g;
            const jsdocFunctions = new Set();
            let jsdocMatch;
            while ((jsdocMatch = jsdocPattern.exec(content)) !== null) {
                jsdocFunctions.add(jsdocMatch[1]);
            }
            
            for (const pattern of patterns) {
                // Reset regex
                pattern.regex.lastIndex = 0;
                let match;
                while ((match = pattern.regex.exec(content)) !== null) {
                    const functionName = match[1];
                    const matchIndex = match.index;
                    
                    // בדיקה אם הפונקציה הוסרה/הוערהה
                    const funcContext = content.substring(Math.max(0, matchIndex - 100), Math.min(content.length, matchIndex + 300));
                    if (/REMOVED|_REMOVED|\/\/.*(?:removed|הוסר|מחוק|deprecated)/i.test(funcContext)) {
                        continue; // דילוג על פונקציות שהוסרו
                    }
                    
                    // התעלמות מ-JSDoc @function
                    if (jsdocFunctions.has(functionName)) {
                        // בדיקה אם זה באמת הגדרת פונקציה או רק JSDoc
                        const beforeMatch = content.substring(Math.max(0, matchIndex - 50), matchIndex);
                        if (beforeMatch.trim().endsWith('*/') || beforeMatch.trim().endsWith('*/')) {
                            continue; // זה כנראה JSDoc, לא הגדרת פונקציה אמיתית
                        }
                    }
                    
                    if (this.isValidFunction(functionName)) {
                        const lineNumber = content.substring(0, matchIndex).split('\n').length;
                        
                        // בדיקה אם אותה פונקציה כבר נמצאה (function vs async-function)
                        const existing = seenFunctions.get(functionName);
                        if (existing) {
                            // אם זה function ו-async-function - זה אותו דבר, לא כפילות
                            if ((existing.type === 'function' && pattern.type === 'async-function') ||
                                (existing.type === 'async-function' && pattern.type === 'function')) {
                                // זה אותו דבר - נשמור את ה-async-function (יותר מדויק)
                                if (pattern.type === 'async-function') {
                                    seenFunctions.set(functionName, {
                                        type: pattern.type,
                                        lineNumber: lineNumber,
                                        startIndex: matchIndex
                                    });
                                }
                                continue; // לא נוסיף כפילות
                            }
                        }
                        
                        seenFunctions.set(functionName, {
                            type: pattern.type,
                            lineNumber: lineNumber,
                            startIndex: matchIndex
                        });
                        
                        functions.push({
                            name: functionName,
                            type: pattern.type,
                            lineNumber: lineNumber,
                            startIndex: matchIndex,
                            file: path.basename(filePath),
                            filePath: filePath
                        });
                    }
                }
            }
            
            return functions;
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error.message);
            return [];
        }
    }

    /**
     * בדיקה אם פונקציה תקפה (לא מובנה)
     */
    isValidFunction(functionName) {
        if (!functionName) return false;
        
        // דילוג על פונקציות מובנות
        if (CONFIG.builtInFunctions.includes(functionName)) {
            return false;
        }
        
        // דילוג על שמות לא תקינים
        if (functionName.startsWith('_') || 
            functionName.includes('$') ||
            functionName.length < 2 ||
            /^\d/.test(functionName) ||
            functionName.includes('test') && functionName.includes('mock')) {
            return false;
        }
        
        return true;
    }

    /**
     * חילוץ כל קריאות לפונקציות מקובץ
     * ⚠️ שיפור: מזהה גם export-ים ל-window ו-calls דינמיים
     */
    extractFunctionCalls(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const calls = new Set();
            const exports = new Set();
            
            // זיהוי פונקציות שהוסרו/הוערהו (לא נבדוק אותן)
            const removedPattern = /(?:REMOVED|_REMOVED|\/\/.*(?:removed|הוסר|מחוק|deprecated))/i;
            const isInRemovedSection = (index) => {
                // בדיקה אם המיקום נמצא בתוך פונקציה שהוסרה או הוערהה
                const beforeText = content.substring(Math.max(0, index - 200), index);
                const afterText = content.substring(index, Math.min(content.length, index + 50));
                return removedPattern.test(beforeText + afterText);
            };
            
            // דפוסים שונים לקריאות פונקציות
            const callPatterns = [
                // name() - רק אם לא אחרי נקודה או window
                /(?:^|[^.\w])(\w+)\s*\(/g,
                // object.name()
                /\.(\w+)\s*\(/g,
                // window.name()
                /window\.(\w+)\s*\(/g,
                // window[functionName]() - קריאות דינמיות
                /window\[\s*['"]([\w]+)['"]\s*\]\s*\(/g,
                /window\[\s*(\w+)\s*\]\s*\(/g
            ];
            
            for (const pattern of callPatterns) {
                // Reset regex
                pattern.lastIndex = 0;
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const functionName = match[1];
                    if (this.isValidFunction(functionName) && !isInRemovedSection(match.index)) {
                        calls.add(functionName);
                    }
                }
            }
            
            // ⚠️ שיפור משמעותי: זיהוי export-ים ל-window (כל הצורות)
            const exportPatterns = [
                // window.functionName = functionName
                /window\.(\w+)\s*=\s*\1\b/g,
                // window.functionName = function...
                /window\.(\w+)\s*=\s*(?:async\s+)?function\b/g,
                // window.functionName = () =>
                /window\.(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
                // window['functionName'] = functionName
                /window\[['"](\w+)['"]\]\s*=\s*\1\b/g,
                // window.ObjectName.methodName = functionName (methods של objects)
                /window\.(\w+)\.(\w+)\s*=\s*(?:\2|\w+)\b/g,
                // window.ObjectName = { methodName: functionName } (object exports)
                /window\.(\w+)\s*=\s*\{[^}]*(\w+)\s*:\s*(?:\2|\w+)\s*[,}]/g,
                // window.ObjectName = class { methodName() {} }
                /window\.(\w+)\s*=\s*class\s+[^{]*\{[^}]*(\w+)\s*\([^)]*\)\s*\{[^}]+\}/g,
                // object exports with function as property (updateNumericValueColors)
                /\{\s*[^}]*(\w+)\s*:\s*\1\s*[,}]/g
            ];
            
            for (const pattern of exportPatterns) {
                pattern.lastIndex = 0;
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    // טיפול בכמה קבוצות (match[1] הוא שם ה-object, match[2] הוא שם ה-method)
                    const functionName = match[match.length - 1] || match[1];
                    if (this.isValidFunction(functionName) && !isInRemovedSection(match.index)) {
                        exports.add(functionName);
                        calls.add(functionName); // Export נחשב גם כשימוש
                        // אם זה method של object, נסמן גם את ה-object
                        if (match.length > 2 && match[1] !== match[2]) {
                            const objectName = match[1];
                            if (this.isValidFunction(objectName)) {
                                exports.add(objectName);
                                calls.add(objectName);
                            }
                        }
                    }
                }
            }
            
            // זיהוי exports נוספים - Object.methodName = functionName (בתוך object literals)
            const objectMethodPattern = /(\w+)\s*:\s*(?:async\s+)?(?:function\s*\([^)]*\)|\([^)]*\)\s*=>)\s*\{/g;
            let objMatch;
            while ((objMatch = objectMethodPattern.exec(content)) !== null) {
                const methodName = objMatch[1];
                if (this.isValidFunction(methodName) && !isInRemovedSection(objMatch.index)) {
                    // בדיקה אם זה חלק מ-window export או object export
                    const beforeText = content.substring(Math.max(0, objMatch.index - 100), objMatch.index);
                    if (/window\.[\w]+[^}]*\{[^}]*$/.test(beforeText) || 
                        /=\s*\{[^}]*$/.test(beforeText)) {
                        exports.add(methodName);
                        calls.add(methodName);
                    }
                }
            }
            
            // ⚠️ שיפור: זיהוי exports דרך object properties (updateNumericValueColors, etc.)
            const objectPropertyExportPattern = /(\w+)\s*:\s*(\w+)\s*[,}]/g;
            let propExportMatch;
            while ((propExportMatch = objectPropertyExportPattern.exec(content)) !== null) {
                const propName = propExportMatch[1];
                const functionName = propExportMatch[2];
                if (propName === functionName && this.isValidFunction(functionName) && !isInRemovedSection(propExportMatch.index)) {
                    // בדיקה אם זה export (לפני זה יש window או =)
                    const beforeText = content.substring(Math.max(0, propExportMatch.index - 50), propExportMatch.index);
                    if (/window\.[\w]+|=\s*\{/.test(beforeText)) {
                        exports.add(functionName);
                        calls.add(functionName);
                    }
                }
            }
            
            return {
                calls: Array.from(calls),
                exports: Array.from(exports)
            };
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error.message);
            return { calls: [], exports: [] };
        }
    }

    /**
     * בניית call graph - איזה פונקציות קוראות לאיזה פונקציות
     * ⚠️ שיפור: מזהה גם export-ים ל-window ו-HTML calls
     */
    buildCallGraph() {
        console.log('🔗 Building call graph...');
        
        // אתחול
        for (const [filePath, functions] of this.allFunctions.entries()) {
            for (const func of functions) {
                if (!this.callGraph.has(func.name)) {
                    this.callGraph.set(func.name, new Set());
                }
                if (!this.functionCalls.has(func.name)) {
                    this.functionCalls.set(func.name, new Set());
                }
            }
        }
        
        // חילוץ קריאות מכל קובץ JS
        for (const [filePath, functions] of this.allFunctions.entries()) {
            const result = this.extractFunctionCalls(filePath);
            const callsInFile = result.calls || [];
            const exportsInFile = result.exports || [];
            
            for (const func of functions) {
                // טיפול בקריאות
                for (const calledFunc of callsInFile) {
                    if (calledFunc !== func.name) {
                        const callGraphSet = this.callGraph.get(func.name);
                        const functionCallsSet = this.functionCalls.get(calledFunc);
                        
                        if (callGraphSet) {
                            callGraphSet.add(calledFunc);
                        }
                        if (functionCallsSet) {
                            functionCallsSet.add(filePath);
                        }
                    }
                }
                
                // ⚠️ שיפור: Export ל-window נחשב כשימוש
                if (exportsInFile.includes(func.name)) {
                    const functionCallsSet = this.functionCalls.get(func.name);
                    if (functionCallsSet) {
                        functionCallsSet.add(filePath); // Export = שימוש
                        functionCallsSet.add('window'); // סימון שזה export
                    }
                }
            }
        }
        
        // ⚠️ שיפור: סריקת קבצי HTML לקריאות
        this.scanHtmlFilesForFunctionCalls();
    }
    
    /**
     * סריקת קבצי HTML לקריאות פונקציות
     * ⚠️ שיפור חדש: מזהה onclick, data-onclick, ועוד
     */
    scanHtmlFilesForFunctionCalls() {
        const htmlDir = 'trading-ui/html';
        if (!fs.existsSync(htmlDir)) {
            return;
        }
        
        const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
        
        for (const htmlFile of htmlFiles) {
            const htmlPath = path.join(htmlDir, htmlFile);
            try {
                const content = fs.readFileSync(htmlPath, 'utf8');
                
                // דפוסים לקריאות מ-HTML
                const htmlPatterns = [
                    /onclick\s*=\s*["']([^"']+)\(/g,  // onclick="functionName()"
                    /onclick\s*=\s*`([^`]+)`/g,  // onclick=`functionName()`
                    /data-onclick\s*=\s*["']([^"']+)\(/g,  // data-onclick="functionName()"
                    /data-onclick\s*=\s*`([^`]+)`/g,  // data-onclick=`functionName()`
                    /on\w+\s*=\s*["']([^"']+)\(/g  // כל on* handlers
                ];
                
                for (const pattern of htmlPatterns) {
                    pattern.lastIndex = 0;
                    let match;
                    while ((match = pattern.exec(content)) !== null) {
                        // חילוץ שם הפונקציה מהקריאה
                        const callExpression = match[1];
                        // נסה לחלץ שם פונקציה (עם או בלי window.)
                        const funcNameMatch = callExpression.match(/(?:window\.)?(\w+)\s*\(/);
                        if (funcNameMatch) {
                            const functionName = funcNameMatch[1];
                            if (this.isValidFunction(functionName)) {
                                const functionCallsSet = this.functionCalls.get(functionName);
                                if (functionCallsSet) {
                                    functionCallsSet.add(htmlPath); // HTML file = שימוש
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                // התעלם משגיאות בקבצי HTML
            }
        }
    }

    /**
     * זיהוי פונקציות ללא קריאות
     * ⚠️ שיפור משמעותי: מתעלם מפונקציות עם window exports, HTML calls, internal calls
     */
    findUnusedFunctions() {
        console.log('\n🔍 Finding unused functions...');
        
        for (const [filePath, functions] of this.allFunctions.entries()) {
            // קריאת תוכן הקובץ לבדיקת קריאות פנימיות
            let fileContent = '';
            try {
                fileContent = fs.readFileSync(filePath, 'utf8');
            } catch (e) {
                // אם לא ניתן לקרוא - נמשיך
            }
            
            for (const func of functions) {
                // בדיקה אם הפונקציה הוסרה/הוערהה (לא נבדוק אותה)
                const funcDefinition = this.getFunctionDefinition(fileContent, func);
                if (this.isRemovedOrCommented(funcDefinition)) {
                    continue; // דילוג על פונקציות שהוסרו
                }
                
                const callers = this.functionCalls.get(func.name);
                
                // ⚠️ שיפור: אם יש export ל-window - זה לא לא בשימוש
                const hasWindowExport = callers && callers.has('window');
                
                // ⚠️ שיפור: אם יש קריאה מ-HTML - זה לא לא בשימוש
                const hasHtmlCall = callers && Array.from(callers).some(c => c.endsWith('.html'));
                
                // ⚠️ שיפור חדש: בדיקה אם יש קריאות פנימיות בקובץ
                const hasInternalCall = fileContent && this.hasInternalCall(fileContent, func.name, func.startIndex);
                
                // ⚠️ שיפור חדש: בדיקה אם זה method של class/object (חלק מה-API)
                const isClassOrObjectMethod = this.isClassOrObjectMethod(fileContent, func);
                
                // אם אין קריאות או רק קריאות עצמית (וללא export/HTML/internal/API)
                if (!hasWindowExport && !hasHtmlCall && !hasInternalCall && !isClassOrObjectMethod &&
                    (!callers || callers.size === 0 || 
                     (callers.size === 1 && callers.has(filePath) && 
                      !this.hasExternalCallers(func.name, filePath)))) {
                    
                    this.results.unusedFunctions.push({
                        functionName: func.name,
                        file: func.file,
                        filePath: func.filePath,
                        lineNumber: func.lineNumber,
                        type: func.type,
                        severity: this.calculateUnusedSeverity(func)
                    });
                }
            }
        }
        
        this.results.summary.unusedCount = this.results.unusedFunctions.length;
        console.log(`   Found ${this.results.unusedFunctions.length} unused functions`);
    }
    
    /**
     * בדיקה אם יש קריאה פנימית לפונקציה בקובץ (מחוץ להגדרת הפונקציה עצמה)
     * ⚠️ שיפור: מזהה גם קריאות דרך object properties ו-arrow functions
     */
    hasInternalCall(fileContent, functionName, functionStartIndex) {
        if (!fileContent || !functionName) return false;
        
        // חיפוש כל הקריאות לפונקציה
        const callPatterns = [
            new RegExp(`\\b${functionName}\\s*\\(`, 'g'),
            new RegExp(`\\.${functionName}\\s*\\(`, 'g'),
            new RegExp(`window\\.${functionName}\\s*\\(`, 'g')
        ];
        
        for (const pattern of callPatterns) {
            pattern.lastIndex = 0;
            let match;
            while ((match = pattern.exec(fileContent)) !== null) {
                const callIndex = match.index;
                // בדיקה שהקריאה היא מחוץ להגדרת הפונקציה עצמה
                // (קרובה, אבל לא בתוך ההגדרה)
                if (Math.abs(callIndex - functionStartIndex) > 20) {
                    // בדיקה שהקריאה לא בתוך הערה או string
                    const beforeCall = fileContent.substring(Math.max(0, callIndex - 10), callIndex);
                    const afterCall = fileContent.substring(callIndex, Math.min(fileContent.length, callIndex + 10));
                    if (!beforeCall.includes('//') && !beforeCall.includes('/*') && 
                        !afterCall.includes('*/') && !beforeCall.match(/['"`]$/)) {
                        return true; // נמצאה קריאה פנימית אמיתית
                    }
                }
            }
        }
        
        // ⚠️ שיפור: זיהוי קריאות דרך object properties (validation: functionName)
        const objectPropertyPattern = new RegExp(`(?:validation|callback|handler|fn|func|function)\\s*:\\s*${functionName}\\b`, 'g');
        let propMatch;
        while ((propMatch = objectPropertyPattern.exec(fileContent)) !== null) {
            const propIndex = propMatch.index;
            if (Math.abs(propIndex - functionStartIndex) > 20) {
                const beforeProp = fileContent.substring(Math.max(0, propIndex - 10), propIndex);
                if (!beforeProp.includes('//') && !beforeProp.includes('/*') && !beforeProp.match(/['"`]$/)) {
                    return true; // נמצאה קריאה דרך object property
                }
            }
        }
        
        // ⚠️ שיפור: זיהוי arrow functions שמוגדרות ונקראות באותו קובץ
        // בדיקה אם יש const/let עם אותו שם לפני או אחרי
        const arrowDefPattern = new RegExp(`(?:const|let|var)\\s+${functionName}\\s*=`, 'g');
        const arrowCallPattern = new RegExp(`\\b${functionName}\\s*\\(`, 'g');
        
        let arrowDefMatch;
        while ((arrowDefMatch = arrowDefPattern.exec(fileContent)) !== null) {
            const defIndex = arrowDefMatch.index;
            // אם ההגדרה היא קרובה להגדרת הפונקציה (אותו מקום) - זה אותו דבר
            if (Math.abs(defIndex - functionStartIndex) < 100) {
                // בדיקה אם יש קריאה ל-arrow function הזה
                arrowCallPattern.lastIndex = 0;
                let arrowCallMatch;
                while ((arrowCallMatch = arrowCallPattern.exec(fileContent)) !== null) {
                    const callIndex = arrowCallMatch.index;
                    if (Math.abs(callIndex - defIndex) > 20 && 
                        Math.abs(callIndex - functionStartIndex) > 20) {
                        const beforeCall = fileContent.substring(Math.max(0, callIndex - 10), callIndex);
                        if (!beforeCall.includes('//') && !beforeCall.includes('/*') && !beforeCall.match(/['"`]$/)) {
                            return true; // נמצאה קריאה ל-arrow function
                        }
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * בדיקה אם פונקציה היא method של class או object (חלק מה-API)
     */
    isClassOrObjectMethod(fileContent, func) {
        if (!fileContent || !func.startIndex) return false;
        
        const beforeFunc = fileContent.substring(Math.max(0, func.startIndex - 200), func.startIndex);
        
        // בדיקה אם זה בתוך class
        if (/class\s+\w+[^{]*\{[^}]*$/.test(beforeFunc)) {
            return true; // זה method של class
        }
        
        // בדיקה אם זה בתוך object literal שהוא export
        if (/=\s*\{[^}]*$/.test(beforeFunc) && /window\.\w+\s*=|export\s+/.test(beforeFunc)) {
            return true; // זה method של exported object
        }
        
        // בדיקה אם זה method של object (objectName.methodName)
        if (/\.(\w+)\s*:\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>)/.test(beforeFunc)) {
            return true; // זה method של object
        }
        
        return false;
    }
    
    /**
     * חילוץ הגדרת פונקציה מהקובץ
     */
    getFunctionDefinition(fileContent, func) {
        if (!fileContent || !func.startIndex) return '';
        
        const start = Math.max(0, func.startIndex - 100);
        const end = Math.min(fileContent.length, func.startIndex + 500);
        return fileContent.substring(start, end);
    }
    
    /**
     * בדיקה אם פונקציה הוסרה או הוערהה
     */
    isRemovedOrCommented(funcDefinition) {
        if (!funcDefinition) return false;
        
        const removedPatterns = [
            /REMOVED/i,
            /_REMOVED/i,
            /\/\/.*(?:removed|הוסר|מחוק|deprecated)/i,
            /\/\*.*(?:removed|הוסר|מחוק|deprecated).*\*\//i
        ];
        
        return removedPatterns.some(pattern => pattern.test(funcDefinition));
    }

    /**
     * בדיקה אם יש קריאות חיצוניות
     */
    hasExternalCallers(functionName, definingFile) {
        const callers = this.functionCalls.get(functionName);
        if (!callers) return false;
        
        for (const callerFile of callers) {
            if (callerFile !== definingFile) {
                return true;
            }
        }
        return false;
    }

    /**
     * חישוב חומרת פונקציה לא בשימוש
     */
    calculateUnusedSeverity(func) {
        // פונקציות async/arrow בדרך כלל חשובות פחות
        if (func.type.includes('async') || func.type.includes('arrow')) {
            return 'MEDIUM';
        }
        return 'HIGH';
    }

    /**
     * זיהוי פונקציות כפולות בתוך קובץ
     * ⚠️ שיפור: מתעלם מ-function + async-function (אותו דבר, לא כפילות)
     */
    findDuplicateFunctions() {
        console.log('\n🔍 Finding duplicate functions within files...');
        
        for (const [filePath, functions] of this.allFunctions.entries()) {
            const functionGroups = new Map();
            
            // קיבוץ פונקציות לפי שם
            for (const func of functions) {
                if (!functionGroups.has(func.name)) {
                    functionGroups.set(func.name, []);
                }
                functionGroups.get(func.name).push(func);
            }
            
            // מציאת כפילויות (אמיתיות בלבד)
            for (const [name, funcs] of functionGroups.entries()) {
                // ⚠️ שיפור: אם יש רק function + async-function - זה לא כפילות
                if (funcs.length === 2) {
                    const types = funcs.map(f => f.type);
                    if ((types.includes('function') && types.includes('async-function'))) {
                        continue; // זה אותו דבר, לא כפילות
                    }
                }
                
                // רק אם יש יותר מ-2, או שזה לא function+async-function
                if (funcs.length > 1 && !(funcs.length === 2 && 
                    funcs.some(f => f.type === 'function') && 
                    funcs.some(f => f.type === 'async-function'))) {
                    
                    // בדיקה נוספת - אם זה אותו startIndex, זה כנראה false positive
                    const uniqueStarts = new Set(funcs.map(f => f.startIndex));
                    if (uniqueStarts.size < funcs.length) {
                        continue; // כפילות של אותה הגדרה, לא אמיתי
                    }
                    
                    this.results.duplicateFunctions.push({
                        functionName: name,
                        file: path.basename(filePath),
                        filePath: filePath,
                        occurrences: funcs.map(f => ({
                            lineNumber: f.lineNumber,
                            type: f.type
                        })),
                        count: funcs.length,
                        severity: 'HIGH'
                    });
                }
            }
        }
        
        this.results.summary.duplicateCount = this.results.duplicateFunctions.length;
        console.log(`   Found ${this.results.duplicateFunctions.length} duplicate function groups`);
    }

    /**
     * זיהוי פונקציות מקומיות עם תחליפים כללים
     */
    findLocalWithGlobalAlternatives() {
        console.log('\n🔍 Finding local functions with global alternatives...');
        
        for (const [filePath, functions] of this.allFunctions.entries()) {
            const fileName = path.basename(filePath);
            
            // דילוג על קבצי מערכות כלליות
            if (CONFIG.globalSystemsFiles.includes(fileName) || 
                CONFIG.globalSystemsFiles.some(gf => fileName.includes(gf))) {
                continue;
            }
            
            for (const func of functions) {
                // בדיקה אם יש פונקציה כללית דומה
                const globalAlternative = this.findGlobalAlternative(func.name);
                
                if (globalAlternative) {
                    this.results.localWithGlobalAlternative.push({
                        localFunction: func.name,
                        localFile: func.file,
                        localFilePath: func.filePath,
                        localLineNumber: func.lineNumber,
                        globalAlternative: globalAlternative.function,
                        globalSystem: globalAlternative.system,
                        category: globalAlternative.category,
                        similarity: this.calculateFunctionSimilarity(func.name, globalAlternative.function),
                        severity: this.calculateAlternativeSeverity(func.name, globalAlternative.function)
                    });
                }
            }
        }
        
        this.results.summary.localAlternativeCount = this.results.localWithGlobalAlternative.length;
        console.log(`   Found ${this.results.localWithGlobalAlternative.length} local functions with global alternatives`);
    }

    /**
     * חיפוש תחליף כללי לפונקציה מקומית
     */
    findGlobalAlternative(functionName) {
        // בדיקה ישירה
        if (GLOBAL_SYSTEM_FUNCTIONS[functionName]) {
            return {
                function: functionName,
                ...GLOBAL_SYSTEM_FUNCTIONS[functionName]
            };
        }
        
        // בדיקה סמנטית - חיפוש לפי דפוסים
        const patterns = [
            { pattern: /show.*notification/i, alt: 'showNotification', category: 'NOTIFICATION' },
            { pattern: /show.*error/i, alt: 'showErrorNotification', category: 'NOTIFICATION' },
            { pattern: /show.*success/i, alt: 'showSuccessNotification', category: 'NOTIFICATION' },
            { pattern: /toggle.*section/i, alt: 'toggleSection', category: 'UI_MANAGEMENT' },
            { pattern: /format.*date/i, alt: 'formatDate', category: 'FORMATTING' },
            { pattern: /sort.*table/i, alt: 'sortTableData', category: 'DATA_LOADING' },
            { pattern: /render.*status/i, alt: 'renderStatus', category: 'UI_MANAGEMENT' },
            { pattern: /clear.*cache/i, alt: 'clearAllCache', category: 'CACHE' },
            { pattern: /show.*modal/i, alt: 'showModal', category: 'UI_MANAGEMENT' },
            { pattern: /validate.*select/i, alt: 'validateSelectField', category: 'VALIDATION' }
        ];
        
        for (const { pattern, alt, category } of patterns) {
            if (pattern.test(functionName) && GLOBAL_SYSTEM_FUNCTIONS[alt]) {
                return {
                    function: alt,
                    system: GLOBAL_SYSTEM_FUNCTIONS[alt].system,
                    category: category
                };
            }
        }
        
        return null;
    }

    /**
     * חישוב דמיון בין פונקציות
     */
    calculateFunctionSimilarity(name1, name2) {
        // חישוב פשוט של דמיון לפי שם
        const longer = name1.length > name2.length ? name1 : name2;
        const shorter = name1.length > name2.length ? name2 : name1;
        
        if (longer.includes(shorter.toLowerCase())) {
            return 0.9;
        }
        
        // חישוב Levenshtein distance פשוט
        let matches = 0;
        for (let i = 0; i < Math.min(name1.length, name2.length); i++) {
            if (name1[i].toLowerCase() === name2[i].toLowerCase()) {
                matches++;
            }
        }
        
        return matches / Math.max(name1.length, name2.length);
    }

    /**
     * חישוב חומרה עבור תחליף כללי
     */
    calculateAlternativeSeverity(localName, globalName) {
        const similarity = this.calculateFunctionSimilarity(localName, globalName);
        
        if (similarity >= 0.8) {
            return 'HIGH';
        } else if (similarity >= 0.6) {
            return 'MEDIUM';
        }
        return 'LOW';
    }

    /**
     * סריקת כל הקבצים
     */
    scanAllFiles() {
        console.log('📄 Scanning all files...\n');
        
        const allFiles = [...CONFIG.corePages];
        
        // הוספת קבצי מערכות כלליות לניתוח (לצורך call graph)
        for (const globalFile of CONFIG.globalSystemsFiles) {
            const fullPath = path.join(CONFIG.scriptsDir, globalFile);
            if (fs.existsSync(fullPath)) {
                allFiles.push(globalFile);
            }
        }
        
        for (const fileName of allFiles) {
            const filePath = path.join(CONFIG.scriptsDir, fileName);
            
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️  File not found: ${fileName}`);
                continue;
            }
            
            const functions = this.extractFunctions(filePath);
            this.allFunctions.set(filePath, functions);
            
            // שמירת הגדרות פונקציות
            for (const func of functions) {
                if (!this.functionDefinitions.has(func.name)) {
                    this.functionDefinitions.set(func.name, []);
                }
                this.functionDefinitions.get(func.name).push(func);
            }
            
            console.log(`   📄 ${fileName}: ${functions.length} functions`);
            this.results.summary.totalFunctions += functions.length;
        }
        
        this.results.summary.totalFiles = this.allFunctions.size;
    }

    /**
     * יצירת דוח מפורט
     */
    generateReport() {
        const timestamp = Date.now();
        
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: this.results.summary,
            unusedFunctions: this.results.unusedFunctions,
            duplicateFunctions: this.results.duplicateFunctions,
            localWithGlobalAlternative: this.results.localWithGlobalAlternative,
            recommendations: this.generateRecommendations()
        };
        
        // שמירת JSON
        const jsonPath = path.join(CONFIG.outputDir, `comprehensive-code-cleanup-${timestamp}.json`);
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
        fs.writeFileSync(jsonPath, JSON.stringify(reportData, null, 2));
        
        // יצירת Markdown
        const mdPath = path.join(CONFIG.outputDir, `comprehensive-code-cleanup-${timestamp}.md`);
        const mdContent = this.generateMarkdownReport(reportData);
        fs.writeFileSync(mdPath, mdContent);
        
        console.log(`\n📊 Comprehensive Code Cleanup Report Generated:`);
        console.log(`   JSON: ${jsonPath}`);
        console.log(`   Markdown: ${mdPath}`);
        
        return reportData;
    }

    /**
     * יצירת המלצות
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.results.unusedFunctions.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                issue: 'Unused functions found',
                count: this.results.unusedFunctions.length,
                action: 'Review and remove unused functions to reduce code complexity',
                files: [...new Set(this.results.unusedFunctions.map(f => f.file))]
            });
        }
        
        if (this.results.duplicateFunctions.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                issue: 'Duplicate functions found within files',
                count: this.results.duplicateFunctions.length,
                action: 'Consolidate duplicate functions into single implementation',
                files: [...new Set(this.results.duplicateFunctions.map(f => f.file))]
            });
        }
        
        if (this.results.localWithGlobalAlternative.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                issue: 'Local functions with global alternatives found',
                count: this.results.localWithGlobalAlternative.length,
                action: 'Replace local functions with global system functions for consistency',
                files: [...new Set(this.results.localWithGlobalAlternative.map(f => f.localFile))]
            });
        }
        
        return recommendations;
    }

    /**
     * יצירת דוח Markdown
     */
    generateMarkdownReport(data) {
        let md = `# דוח מקיף לניקוי קוד כפול ופונקציות לא בשימוש\n\n`;
        md += `**תאריך**: ${new Date().toLocaleString('he-IL')}\n\n`;
        md += `---\n\n`;
        
        md += `## סיכום\n\n`;
        md += `- **סה"כ קבצים**: ${data.summary.totalFiles}\n`;
        md += `- **סה"כ פונקציות**: ${data.summary.totalFunctions}\n`;
        md += `- **פונקציות לא בשימוש**: ${data.summary.unusedCount}\n`;
        md += `- **קבוצות כפולות**: ${data.summary.duplicateCount}\n`;
        md += `- **פונקציות מקומיות עם תחליף כללי**: ${data.summary.localAlternativeCount}\n\n`;
        
        if (data.recommendations.length > 0) {
            md += `## המלצות\n\n`;
            data.recommendations.forEach((rec, index) => {
                md += `### ${index + 1}. ${rec.issue} (${rec.priority})\n\n`;
                md += `- **כמות**: ${rec.count}\n`;
                md += `- **קבצים מעורבים**: ${rec.files.join(', ')}\n`;
                md += `- **פעולה מומלצת**: ${rec.action}\n\n`;
            });
        }
        
        if (data.unusedFunctions.length > 0) {
            md += `## 1. פונקציות לא בשימוש (${data.unusedFunctions.length})\n\n`;
            
            // קיבוץ לפי קובץ
            const byFile = new Map();
            for (const func of data.unusedFunctions) {
                if (!byFile.has(func.file)) {
                    byFile.set(func.file, []);
                }
                byFile.get(func.file).push(func);
            }
            
            for (const [file, funcs] of byFile.entries()) {
                md += `### ${file}\n\n`;
                funcs.forEach((func, index) => {
                    md += `${index + 1}. **${func.functionName}** (שורה ${func.lineNumber}, ${func.type}) - ${func.severity}\n`;
                });
                md += `\n`;
            }
        }
        
        if (data.duplicateFunctions.length > 0) {
            md += `## 2. פונקציות כפולות בתוך קובץ (${data.duplicateFunctions.length})\n\n`;
            
            data.duplicateFunctions.forEach((dup, index) => {
                md += `### ${index + 1}. ${dup.file} - ${dup.functionName}\n\n`;
                md += `- **כמות כפילויות**: ${dup.count}\n`;
                md += `- **מיקומים**:\n`;
                dup.occurrences.forEach((occ, i) => {
                    md += `  ${i + 1}. שורה ${occ.lineNumber} (${occ.type})\n`;
                });
                md += `\n`;
            });
        }
        
        if (data.localWithGlobalAlternative.length > 0) {
            md += `## 3. פונקציות מקומיות עם תחליף כללי (${data.localWithGlobalAlternative.length})\n\n`;
            
            // קיבוץ לפי קובץ
            const byFile = new Map();
            for (const func of data.localWithGlobalAlternative) {
                if (!byFile.has(func.localFile)) {
                    byFile.set(func.localFile, []);
                }
                byFile.get(func.localFile).push(func);
            }
            
            for (const [file, funcs] of byFile.entries()) {
                md += `### ${file}\n\n`;
                funcs.forEach((func, index) => {
                    md += `${index + 1}. **${func.localFunction}** (שורה ${func.localLineNumber})\n`;
                    md += `   - תחליף כללי: \`${func.globalAlternative}\` (${func.globalSystem})\n`;
                    md += `   - קטגוריה: ${func.category}\n`;
                    md += `   - דמיון: ${(func.similarity * 100).toFixed(1)}%\n`;
                    md += `   - חומרה: ${func.severity}\n`;
                });
                md += `\n`;
            }
        }
        
        return md;
    }

    /**
     * הרצת הניתוח המלא
     */
    async run() {
        console.log('🔍 Starting Comprehensive Code Cleanup Analysis...\n');
        console.log('='.repeat(60));
        
        // 1. סריקת כל הקבצים
        this.scanAllFiles();
        
        // 2. בניית call graph
        this.buildCallGraph();
        
        // 3. זיהוי פונקציות לא בשימוש
        this.findUnusedFunctions();
        
        // 4. זיהוי פונקציות כפולות
        this.findDuplicateFunctions();
        
        // 5. זיהוי תחליפים כללים
        this.findLocalWithGlobalAlternatives();
        
        // 6. יצירת דוח
        console.log('\n📝 Generating comprehensive report...');
        const report = this.generateReport();
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Analysis complete!');
        console.log(`\n📊 Summary:`);
        console.log(`   Total Files: ${report.summary.totalFiles}`);
        console.log(`   Total Functions: ${report.summary.totalFunctions}`);
        console.log(`   Unused Functions: ${report.summary.unusedCount}`);
        console.log(`   Duplicate Groups: ${report.summary.duplicateCount}`);
        console.log(`   Local with Global Alternatives: ${report.summary.localAlternativeCount}`);
        
        return report;
    }
}

// הרצה אם נקרא ישירות
if (require.main === module) {
    const analyzer = new ComprehensiveCodeCleanupAnalyzer();
    analyzer.run().catch(console.error);
}

module.exports = ComprehensiveCodeCleanupAnalyzer;

