/**
 * Info Summary System Usage Scanner
 * =======================================
 * 
 * סורק את כל העמודים במערכת לזיהוי שימושים מקומיים במקום Info Summary System
 * 
 * @version 1.0.0
 * @created November 2025
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - findFunctionEnd() - Findfunctionend

// === Other ===
// - scanJavaScriptFile() - Scanjavascriptfile
// - scanHTMLFile() - Scanhtmlfile
// - scanPage() - Scanpage
// - scanAllPages() - Scanallpages
// - generateReport() - Generatereport

const fs = require('fs');
const path = require('path');

// רשימת כל העמודים לסריקה (36 עמודים)
const PAGES = {
    main: [
        'index.html', 'trades.html', 'trade_plans.html', 'alerts.html', 
        'tickers.html', 'trading_accounts.html', 'executions.html', 
        'cash_flows.html', 'notes.html', 'research.html', 'preferences.html'
    ],
    technical: [
        'db_display.html', 'db_extradata.html', 'constraints.html', 
        'background-tasks.html', 'server-monitor.html', 'system-management.html',
        'cache-test.html', 'notifications-center.html', 'css-management.html',
        'dynamic-colors-display.html', 'designs.html', 'tradingview-test-page.html'
    ],
    secondary: [
        'external_data_dashboard.html', 'chart_management.html'
    ],
    mockups: [
        'portfolio-state-page.html',
        'trade-history-page.html',
        'price-history-page.html',
        'comparative-analysis-page.html',
        'trading-journal-page.html',
        'strategy-analysis-page.html',
        'economic-calendar-page.html',
        'history-widget.html',
        'emotional-tracking-widget.html',
        'date-comparison-modal.html',
        'tradingview-test-page.html' // מוקאפ
    ]
};

// דפוסים לזיהוי שימושים מקומיים
const PATTERNS = {
    // חישוב ידני של סטטיסטיקות עם innerHTML
    manualInnerHTML: [
        /getElementById\s*\(\s*['"]summaryStats['"]\s*\)\s*\.\s*innerHTML\s*=/g,
        /getElementById\s*\(\s*['"]summaryStats['"]\s*\)\s*\.\s*innerHTML\s*\+/g,
        /querySelector\s*\([^)]*summary[^)]*\)\s*\.\s*innerHTML\s*=/g,
        /\.innerHTML\s*=\s*[^;]*סה"כ[^;]*/g,
        /\.innerHTML\s*=\s*[^;]*סטטיסטיקות[^;]*/g
    ],
    // פונקציות מקומיות לעדכון summary
    localSummaryFunctions: [
        /function\s+update.*Summary\s*\(/gi,
        /const\s+update.*Summary\s*=/gi,
        /async\s+function\s+update.*Summary\s*\(/gi,
        /function\s+calculate.*Summary\s*\(/gi,
        /function\s+render.*Summary\s*\(/gi,
        /function\s+updateTableStats\s*\(/gi,
        /const\s+updateTableStats\s*=/gi
    ],
    // חישוב ידני של סטטיסטיקות (filter, reduce, map)
    manualCalculations: [
        /\.filter\s*\([^)]*status\s*===/g,
        /\.reduce\s*\([^)]*sum[^)]*\)\s*[^;]*summary/g,
        /\.map\s*\([^)]*\)\s*\.\s*reduce\s*\([^)]*\)\s*[^;]*summary/g,
        /\.length\s*[^;]*summary/g
    ],
    // שימוש ב-InfoSummarySystem (חיובי)
    usingService: [
        /InfoSummarySystem\.(calculateAndRender|updateSummary)/g,
        /window\.InfoSummarySystem\.(calculateAndRender|updateSummary)/g,
        /updatePageSummaryStats\s*\(/g,
        /window\.updatePageSummaryStats\s*\(/g
    ],
    // טעינת info-summary-system.js
    loadingService: [
        /info-summary-system\.js/g,
        /info-summary-configs\.js/g
    ],
    // בדיקת קיום summary element ב-HTML
    summaryElementInHTML: [
        /id\s*=\s*['"]summaryStats['"]/g,
        /id\s*=\s*['"]summary-stats['"]/g,
        /class\s*=\s*['"][^'"]*summary[^'"]*['"]/g
    ]
};

const results = {
    pages: {},
    summary: {
        totalPages: 0,
        pagesWithService: 0,
        pagesWithIssues: 0,
        totalIssues: 0,
        pagesWithSummaryElement: 0,
        pagesWithConfig: 0,
        issuesByType: {
            manualInnerHTML: 0,
            localFunctions: 0,
            manualCalculations: 0,
            missingService: 0,
            missingConfig: 0
        }
    }
};

// רשימת configs קיימים
const EXISTING_CONFIGS = [
    'trades', 'executions', 'trade_plans', 'cash_flows', 'alerts', 
    'notes', 'tickers', 'trading_accounts', 'economic-calendar-page', 
    'date-comparison-modal', 'portfolio-state-page'
];

/**
 * סריקת קובץ JavaScript
 */
function scanJavaScriptFile(filePath, pageName) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // בדיקת innerHTML ישיר
    PATTERNS.manualInnerHTML.forEach((pattern) => {
        let match;
        const lines = content.split('\n');
        while ((match = pattern.exec(content)) !== null) {
            const lineIndex = content.substring(0, match.index).split('\n').length;
            // בדיקה אם זה לא חלק מ-InfoSummarySystem
            const context = lines.slice(Math.max(0, lineIndex - 3), Math.min(lines.length, lineIndex + 3)).join('\n');
            if (!context.includes('InfoSummarySystem') && !context.includes('updatePageSummaryStats')) {
                issues.push({
                    type: 'manualInnerHTML',
                    severity: 'high',
                    line: lineIndex,
                    code: lines[lineIndex - 1]?.trim() || match[0],
                    description: 'עדכון summary עם innerHTML ישיר במקום InfoSummarySystem'
                });
            }
        }
    });
    
    // בדיקת פונקציות מקומיות
    PATTERNS.localSummaryFunctions.forEach((pattern) => {
        let match;
        const lines = content.split('\n');
        while ((match = pattern.exec(content)) !== null) {
            const lineIndex = content.substring(0, match.index).split('\n').length;
            const funcName = match[0].match(/(update|calculate|render).*Summary|updateTableStats/)?.[0];
            // בדיקה אם הפונקציה לא משתמשת ב-InfoSummarySystem
            const funcStart = match.index;
            const funcEnd = findFunctionEnd(content, funcStart);
            const funcContent = content.substring(funcStart, funcEnd);
            if (!funcContent.includes('InfoSummarySystem') && !funcContent.includes('updatePageSummaryStats')) {
                issues.push({
                    type: 'localFunction',
                    severity: funcName === 'updateTableStats' ? 'high' : 'medium',
                    line: lineIndex,
                    code: lines[lineIndex - 1]?.trim() || match[0],
                    description: `פונקציה מקומית ${funcName || 'לעדכון summary'} במקום InfoSummarySystem`
                });
            }
        }
    });
    
    // בדיקת חישוב ידני (רק אם לא משתמש במערכת)
    const usingService = PATTERNS.usingService.some(pattern => pattern.test(content));
    if (!usingService) {
        PATTERNS.manualCalculations.forEach((pattern) => {
            let match;
            const lines = content.split('\n');
            while ((match = pattern.exec(content)) !== null) {
                const lineIndex = content.substring(0, match.index).split('\n').length;
                const context = lines.slice(Math.max(0, lineIndex - 5), Math.min(lines.length, lineIndex + 5)).join('\n');
                // בדיקה אם זה חלק מחישוב summary
                if (context.includes('summary') || context.includes('Summary') || context.includes('סטטיסטיקות')) {
                    issues.push({
                        type: 'manualCalculations',
                        severity: 'medium',
                        line: lineIndex,
                        code: lines[lineIndex - 1]?.trim() || match[0],
                        description: 'חישוב ידני של סטטיסטיקות במקום InfoSummarySystem'
                    });
                }
            }
        });
    }
    
    // בדיקת שימוש במערכת
    const usingInfoSummary = PATTERNS.usingService.some(pattern => pattern.test(content));
    
    // בדיקת טעינת המערכת
    const loadingService = PATTERNS.loadingService.some(pattern => pattern.test(content));
    
    return {
        usingService: usingInfoSummary,
        loadingService,
        issues,
        hasIssues: issues.length > 0
    };
}

/**
 * מציאת סוף פונקציה
 */
function findFunctionEnd(content, startIndex) {
    let braceCount = 0;
    let inString = false;
    let stringChar = null;
    
    for (let i = startIndex; i < content.length; i++) {
        const char = content[i];
        const prevChar = i > 0 ? content[i - 1] : '';
        
        // טיפול במחרוזות
        if (!inString && (char === '"' || char === "'" || char === '`')) {
            inString = true;
            stringChar = char;
        } else if (inString && char === stringChar && prevChar !== '\\') {
            inString = false;
            stringChar = null;
        }
        
        if (!inString) {
            if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    return i + 1;
                }
            }
        }
    }
    
    return content.length;
}

/**
 * סריקת קובץ HTML
 */
function scanHTMLFile(filePath, pageName) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // בדיקת טעינת info-summary-system.js
    const loadingService = PATTERNS.loadingService.some(pattern => pattern.test(content));
    
    // בדיקת קיום summary element
    const hasSummaryElement = PATTERNS.summaryElementInHTML.some(pattern => pattern.test(content));
    
    // בדיקת config (לפי שם העמוד)
    const pageNameForConfig = pageName.replace(/-/g, '_').replace('.html', '');
    const hasConfig = EXISTING_CONFIGS.includes(pageNameForConfig) || 
                      EXISTING_CONFIGS.includes(pageName.replace('.html', ''));
    
    return {
        loadingService,
        hasSummaryElement,
        hasConfig,
        pageNameForConfig: pageName.replace('.html', '')
    };
}

/**
 * סריקת עמוד
 */
function scanPage(pagePath, category) {
    const basePath = path.join(__dirname, '..');
    let htmlPath, jsPath, pageName;
    
    if (category === 'mockups') {
        // עמודי מוקאפ - בדיקה אם הם בתיקיית mockups או ישירות
        htmlPath = path.join(basePath, 'mockups', 'daily-snapshots', pagePath);
        if (!fs.existsSync(htmlPath)) {
            htmlPath = path.join(basePath, pagePath);
        }
        pageName = path.basename(pagePath, '.html');
        jsPath = path.join(basePath, 'scripts', `${pageName}.js`);
    } else {
        htmlPath = path.join(basePath, pagePath);
        pageName = path.basename(pagePath, '.html');
        jsPath = path.join(basePath, 'scripts', `${pageName}.js`);
    }
    
    const result = {
        page: pagePath,
        category,
        html: scanHTMLFile(htmlPath, pageName),
        js: scanJavaScriptFile(jsPath, pageName),
        issues: [],
        usingService: false,
        loadingService: false,
        hasSummaryElement: false,
        hasConfig: false,
        missingConfig: false
    };
    
    if (result.js) {
        result.usingService = result.js.usingService;
        result.loadingService = result.js.loadingService || result.html?.loadingService || false;
        result.issues = result.js.issues || [];
    } else if (result.html) {
        result.loadingService = result.html.loadingService;
    }
    
    if (result.html) {
        result.hasSummaryElement = result.html.hasSummaryElement;
        result.hasConfig = result.html.hasConfig;
        result.missingConfig = result.hasSummaryElement && !result.hasConfig;
    }
    
    // הוספת בעיה אם יש summary element אבל אין config
    if (result.missingConfig) {
        result.issues.push({
            type: 'missingConfig',
            severity: 'high',
            line: 0,
            code: 'N/A',
            description: `עמוד עם summary element אבל ללא config ב-INFO_SUMMARY_CONFIGS`
        });
    }
    
    // הוספת בעיה אם יש summary element אבל לא טוען את המערכת
    if (result.hasSummaryElement && !result.loadingService) {
        result.issues.push({
            type: 'missingService',
            severity: 'high',
            line: 0,
            code: 'N/A',
            description: `עמוד עם summary element אבל לא טוען את info-summary-system.js`
        });
    }
    
    return result;
}

/**
 * סריקת כל העמודים
 */
function scanAllPages() {
    console.log('🔍 Starting scan of all pages for Info Summary System...\n');
    
    Object.entries(PAGES).forEach(([category, pages]) => {
        pages.forEach(pagePath => {
            const result = scanPage(pagePath, category);
            results.pages[pagePath] = result;
            results.summary.totalPages++;
            
            if (result.usingService) {
                results.summary.pagesWithService++;
            }
            
            if (result.hasSummaryElement) {
                results.summary.pagesWithSummaryElement++;
            }
            
            if (result.hasConfig) {
                results.summary.pagesWithConfig++;
            }
            
            if (result.issues && result.issues.length > 0) {
                results.summary.pagesWithIssues++;
            }
            
            if (result.issues) {
                result.issues.forEach(issue => {
                    results.summary.totalIssues++;
                    results.summary.issuesByType[issue.type] = 
                        (results.summary.issuesByType[issue.type] || 0) + 1;
                });
            }
        });
    });
}

/**
 * יצירת דוח
 */
function generateReport() {
    const reportPath = path.join(__dirname, '..', '..', 'documentation', '05-REPORTS', 'INFO_SUMMARY_SYSTEM_DEVIATIONS_REPORT.md');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    let report = `# דוח סטיות - Info Summary System
## INFO_SUMMARY_SYSTEM_DEVIATIONS_REPORT

**תאריך יצירה:** ${new Date().toLocaleDateString('he-IL')}  
**גרסה:** 1.0.0  
**מטרה:** זיהוי שימושים מקומיים במקום Info Summary System המרכזית

---

## 📊 סיכום כללי

// - **סה"כ עמודים נסרקו:** ${results.summary.totalPages}
// - **עמודים המשתמשים במערכת:** ${results.summary.pagesWithService}
// - **עמודים עם summary element:** ${results.summary.pagesWithSummaryElement}
// - **עמודים עם config:** ${results.summary.pagesWithConfig}
// - **עמודים עם בעיות:** ${results.summary.pagesWithIssues}
// - **סה"כ בעיות נמצאו:** ${results.summary.totalIssues}

### פילוח בעיות לפי סוג:

// - **עדכון summary עם innerHTML ישיר:** ${results.summary.issuesByType.manualInnerHTML || 0}
// - **פונקציות מקומיות:** ${results.summary.issuesByType.localFunctions || 0}
// - **חישוב ידני של סטטיסטיקות:** ${results.summary.issuesByType.manualCalculations || 0}
// - **חסר טעינת המערכת:** ${results.summary.issuesByType.missingService || 0}
// - **חסר config:** ${results.summary.issuesByType.missingConfig || 0}

---

## 📋 דוח מפורט לכל עמוד

`;

    Object.entries(results.pages).forEach(([pagePath, result]) => {
        const pageName = path.basename(pagePath, '.html');
        report += `### ${pageName}
**קובץ HTML:** \`trading-ui/${pagePath}\`  
**קובץ JS:** \`trading-ui/scripts/${pageName}.js\`  
**קטגוריה:** ${result.category}

#### סטטוס:
// - **משתמש במערכת:** ${result.usingService ? '✅ כן' : '❌ לא'}
// - **טוען את המערכת:** ${result.loadingService ? '✅ כן' : '❌ לא'}
// - **יש summary element:** ${result.hasSummaryElement ? '✅ כן' : '❌ לא'}
// - **יש config:** ${result.hasConfig ? '✅ כן' : '❌ לא'}
// - **יש בעיות:** ${result.issues && result.issues.length > 0 ? '⚠️ כן' : '✅ לא'}

`;

        if (result.issues && result.issues.length > 0) {
            report += `#### סטיות שנמצאו:\n\n`;
            result.issues.forEach((issue, index) => {
                const severityEmoji = issue.severity === 'high' ? '🔴' : '🟡';
                report += `${index + 1}. **שורה ${issue.line}:** ${issue.description}
// - **סוג:** ${issue.type}
// - **חומרה:** ${severityEmoji} ${issue.severity === 'high' ? 'גבוהה' : 'בינונית'}
// - **קוד:** \`${issue.code.substring(0, 100)}${issue.code.length > 100 ? '...' : ''}\`

`;
            });
        } else {
            report += `#### ✅ אין סטיות - העמוד משתמש במערכת המרכזית נכון\n\n`;
        }
        
        report += `---\n\n`;
    });
    
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`✅ Report generated: ${reportPath}`);
}

// הרצה
scanAllPages();
generateReport();

console.log('\n📊 Summary:');
console.log(`Total pages: ${results.summary.totalPages}`);
console.log(`Pages using service: ${results.summary.pagesWithService}`);
console.log(`Pages with summary element: ${results.summary.pagesWithSummaryElement}`);
console.log(`Pages with config: ${results.summary.pagesWithConfig}`);
console.log(`Pages with issues: ${results.summary.pagesWithIssues}`);
console.log(`Total issues: ${results.summary.totalIssues}`);

