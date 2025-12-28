/**
 * Select Populator Service Usage Scanner
 * =======================================
 * 
 * סורק את כל העמודים במערכת לזיהוי שימושים מקומיים במקום Select Populator Service
 * 
 * @version 1.0.0
 * @created January 2025
 */


// ===== FUNCTION INDEX =====

// === Other ===
// - scanJavaScriptFile() - Scanjavascriptfile
// - scanHTMLFile() - Scanhtmlfile
// - scanPage() - Scanpage
// - scanAllPages() - Scanallpages
// - generateReport() - Generatereport

const fs = require('fs');
const path = require('path');

// רשימת כל העמודים לסריקה
const PAGES = {
    main: [
        'index.html', 'trades.html', 'trade_plans.html', 'alerts.html', 
        'tickers.html', 'trading_accounts.html', 'executions.html', 
        'cash_flows.html', 'notes.html', 'research.html', 'preferences.html'
    ],
    technical: [
        'db_display.html', 'db_extradata.html', 'constraints.html', 
        'background_tasks.html', 'server_monitor.html', 'system_management.html',
        'cache-test.html', 'notifications_center.html', 'css_management.html',
        'dynamic_colors_display.html', 'designs.html', 'tradingview_test_page.html'
    ],
    secondary: [
        'external_data_dashboard.html', 'chart_management.html'
    ],
    mockups: [
        'mockups/daily-snapshots/portfolio_state_page.html',
        'mockups/daily-snapshots/trade_history_page.html',
        'mockups/daily-snapshots/price_history_page.html',
        'mockups/daily-snapshots/comparative_analysis_page.html',
        'mockups/daily-snapshots/trading_journal_page.html',
        'mockups/daily-snapshots/strategy_analysis_page.html',
        'mockups/daily-snapshots/economic_calendar_page.html',
        'mockups/daily-snapshots/history_widget.html',
        'mockups/daily-snapshots/emotional_tracking_widget.html',
        'mockups/daily-snapshots/date_comparison_modal.html',
        'mockups/daily-snapshots/tradingview_test_page.html'
    ]
};

// דפוסים לזיהוי שימושים מקומיים
const PATTERNS = {
    // טיפול ידני במילוי select
    manualSelectPopulation: [
        /select\.innerHTML\s*=/g,
        /select\.appendChild\s*\(/g,
        /new\s+Option\s*\(/g,
        /document\.createElement\s*\(\s*['"]option['"]/g,
        /\.options\.length\s*=\s*0/g,
        /\.options\.clear\s*\(/g
    ],
    // קריאות fetch ישירות למילוי select
    directFetchForSelect: [
        /fetch\s*\([^)]*\/api\/(tickers|trading-accounts|currencies|trades|trade-plans)/g,
        /fetch\s*\([^)]*['"]\/api\/[^'"]*['"][^)]*\)\s*\.then\s*\([^)]*select/gi
    ],
    // פונקציות מקומיות למילוי select
    localPopulateFunctions: [
        /function\s+(populate|load|fill).*Select/gi,
        /const\s+(populate|load|fill).*Select\s*=/gi,
        /async\s+function\s+(populate|load|fill).*Select/gi,
        /function\s+.*\([^)]*\)\s*\{[^}]*select\.innerHTML/gi
    ],
    // שימוש ב-SelectPopulatorService (חיובי)
    usingService: [
        /SelectPopulatorService\.(populateTickersSelect|populateAccountsSelect|populateCurrenciesSelect|populateTradesSelect|populateTradePlansSelect|populateGenericSelect)/g,
        /window\.SelectPopulatorService\.(populateTickersSelect|populateAccountsSelect|populateCurrenciesSelect|populateTradesSelect|populateTradePlansSelect|populateGenericSelect)/g,
        /window\.(populateTickersSelect|populateAccountsSelect|populateCurrenciesSelect|populateTradesSelect|populateTradePlansSelect|populateGenericSelect)/g
    ],
    // טעינת select-populator-service.js
    loadingService: [
        /select-populator-service\.js/g
    ]
};

const results = {
    pages: {},
    summary: {
        totalPages: 0,
        pagesWithService: 0,
        pagesWithIssues: 0,
        totalIssues: 0,
        issuesByType: {
            manualPopulation: 0,
            directFetch: 0,
            localFunctions: 0,
            missingService: 0
        }
    }
};

/**
 * סריקת קובץ JavaScript
 */
function scanJavaScriptFile(filePath, pageName) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // בדיקת שימושים מקומיים
    PATTERNS.manualSelectPopulation.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
            const lines = content.split('\n');
            matches.forEach(match => {
                const lineIndex = content.substring(0, content.indexOf(match)).split('\n').length;
                issues.push({
                    type: 'manualPopulation',
                    severity: 'high',
                    line: lineIndex,
                    code: lines[lineIndex - 1]?.trim() || match,
                    description: 'טיפול ידני במילוי select במקום SelectPopulatorService'
                });
            });
        }
    });
    
    // בדיקת קריאות fetch ישירות
    PATTERNS.directFetchForSelect.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
            const lines = content.split('\n');
            matches.forEach(match => {
                const lineIndex = content.substring(0, content.indexOf(match)).split('\n').length;
                issues.push({
                    type: 'directFetch',
                    severity: 'high',
                    line: lineIndex,
                    code: lines[lineIndex - 1]?.trim() || match,
                    description: 'קריאת fetch ישירה למילוי select במקום SelectPopulatorService'
                });
            });
        }
    });
    
    // בדיקת פונקציות מקומיות
    PATTERNS.localPopulateFunctions.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
            const lines = content.split('\n');
            matches.forEach(match => {
                const lineIndex = content.substring(0, content.indexOf(match)).split('\n').length;
                issues.push({
                    type: 'localFunction',
                    severity: 'medium',
                    line: lineIndex,
                    code: lines[lineIndex - 1]?.trim() || match,
                    description: 'פונקציה מקומית למילוי select במקום SelectPopulatorService'
                });
            });
        }
    });
    
    // בדיקת שימוש במערכת
    const usingService = PATTERNS.usingService.some(pattern => pattern.test(content));
    
    // בדיקת טעינת המערכת
    const loadingService = PATTERNS.loadingService.some(pattern => pattern.test(content));
    
    return {
        usingService,
        loadingService,
        issues,
        hasIssues: issues.length > 0
    };
}

/**
 * סריקת קובץ HTML
 */
function scanHTMLFile(filePath, pageName) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // בדיקת טעינת select-populator-service.js
    const loadingService = PATTERNS.loadingService.some(pattern => pattern.test(content));
    
    return {
        loadingService
    };
}

/**
 * סריקת עמוד
 */
function scanPage(pagePath, category) {
    const basePath = path.join(__dirname, '..');
    const htmlPath = path.join(basePath, pagePath);
    const pageName = path.basename(pagePath, '.html');
    const jsPath = path.join(basePath, 'scripts', `${pageName}.js`);
    
    const result = {
        page: pagePath,
        category,
        html: scanHTMLFile(htmlPath, pageName),
        js: scanJavaScriptFile(jsPath, pageName),
        issues: [],
        usingService: false,
        loadingService: false
    };
    
    if (result.js) {
        result.usingService = result.js.usingService;
        result.loadingService = result.js.loadingService || result.html?.loadingService || false;
        result.issues = result.js.issues || [];
    } else if (result.html) {
        result.loadingService = result.html.loadingService;
    }
    
    return result;
}

/**
 * סריקת כל העמודים
 */
function scanAllPages() {
    console.log('🔍 Starting scan of all pages...\n');
    
    Object.entries(PAGES).forEach(([category, pages]) => {
        pages.forEach(pagePath => {
            const result = scanPage(pagePath, category);
            results.pages[pagePath] = result;
            results.summary.totalPages++;
            
            if (result.usingService) {
                results.summary.pagesWithService++;
            }
            
            if (result.hasIssues || (result.js && result.js.hasIssues)) {
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
    const reportPath = path.join(__dirname, '..', '..', 'documentation', '05-REPORTS', 'SELECT_POPULATOR_SERVICE_DEVIATIONS_REPORT.md');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    let report = `# דוח סטיות - Select Populator Service
## SELECT_POPULATOR_SERVICE_DEVIATIONS_REPORT

**תאריך יצירה:** ${new Date().toLocaleDateString('he-IL')}  
**גרסה:** 1.0.0  
**מטרה:** זיהוי שימושים מקומיים במקום Select Populator Service המרכזית

---

## 📊 סיכום כללי

// - **סה"כ עמודים נסרקו:** ${results.summary.totalPages}
// - **עמודים המשתמשים במערכת:** ${results.summary.pagesWithService}
// - **עמודים עם בעיות:** ${results.summary.pagesWithIssues}
// - **סה"כ בעיות נמצאו:** ${results.summary.totalIssues}

### פילוח בעיות לפי סוג:

// - **טיפול ידני במילוי select:** ${results.summary.issuesByType.manualPopulation || 0}
// - **קריאות fetch ישירות:** ${results.summary.issuesByType.directFetch || 0}
// - **פונקציות מקומיות:** ${results.summary.issuesByType.localFunction || 0}
// - **חסר טעינת המערכת:** ${results.summary.totalPages - results.summary.pagesWithService}

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
// - **יש בעיות:** ${result.issues && result.issues.length > 0 ? '⚠️ כן' : '✅ לא'}

`;

        if (result.issues && result.issues.length > 0) {
            report += `#### סטיות שנמצאו:\n\n`;
            result.issues.forEach((issue, index) => {
                report += `${index + 1}. **שורה ${issue.line}:** ${issue.description}
// - **סוג:** ${issue.type}
// - **חומרה:** ${issue.severity === 'high' ? '🔴 גבוהה' : '🟡 בינונית'}
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
console.log(`Pages with issues: ${results.summary.pagesWithIssues}`);
console.log(`Total issues: ${results.summary.totalIssues}`);


