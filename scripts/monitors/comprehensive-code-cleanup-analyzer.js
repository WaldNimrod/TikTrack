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
     */
    extractFunctions(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const functions = [];
            
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
            
            for (const pattern of patterns) {
                let match;
                while ((match = pattern.regex.exec(content)) !== null) {
                    const functionName = match[1];
                    if (this.isValidFunction(functionName)) {
                        const lineNumber = content.substring(0, match.index).split('\n').length;
                        functions.push({
                            name: functionName,
                            type: pattern.type,
                            lineNumber: lineNumber,
                            startIndex: match.index,
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
     */
    extractFunctionCalls(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const calls = new Set();
            
            // דפוסים שונים לקריאות פונקציות
            const callPatterns = [
                // name()
                /(\w+)\s*\(/g,
                // object.name()
                /\.(\w+)\s*\(/g,
                // window.name()
                /window\.(\w+)\s*\(/g
            ];
            
            for (const pattern of callPatterns) {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const functionName = match[1];
                    if (this.isValidFunction(functionName)) {
                        calls.add(functionName);
                    }
                }
            }
            
            return Array.from(calls);
        } catch (error) {
            console.error(`Error reading ${filePath}:`, error.message);
            return [];
        }
    }

    /**
     * בניית call graph - איזה פונקציות קוראות לאיזה פונקציות
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
        
        // חילוץ קריאות מכל קובץ
        for (const [filePath, functions] of this.allFunctions.entries()) {
            const callsInFile = this.extractFunctionCalls(filePath);
            
            for (const func of functions) {
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
            }
        }
    }

    /**
     * זיהוי פונקציות ללא קריאות
     */
    findUnusedFunctions() {
        console.log('\n🔍 Finding unused functions...');
        
        for (const [filePath, functions] of this.allFunctions.entries()) {
            for (const func of functions) {
                const callers = this.functionCalls.get(func.name);
                
                // אם אין קריאות או רק קריאות עצמית
                if (!callers || callers.size === 0 || 
                    (callers.size === 1 && callers.has(filePath) && 
                     !this.hasExternalCallers(func.name, filePath))) {
                    
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
            
            // מציאת כפילויות
            for (const [name, funcs] of functionGroups.entries()) {
                if (funcs.length > 1) {
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

