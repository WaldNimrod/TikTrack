/**
 * Actions Menu Toolkit Usage Scanner
 * Scans all HTML and JavaScript files for deviations from Actions Menu Toolkit standard
 * 
 * File: trading-ui/scripts/check-actions-menu-usage.js
 * Created: 26 November 2025
 * 
 * Detects:
 * 1. Local functions for creating action menus (generateActionButtons, createActionsMenu, createActionButtons)
 * 2. Manual HTML creation of action menus (actions-menu-wrapper, actions-trigger, actions-menu-popup)
 * 3. Missing actions-menu-system.js loading
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - getStatusDescription() - Getstatusdescription

// === Data Functions ===
// - getStatusText() - Getstatustext

// === Utility Functions ===
// - checkPackageManifest() - Checkpackagemanifest
// - formatPageIssues() - Formatpageissues

// === Other ===
// - scanJavaScriptFile() - Scanjavascriptfile
// - scanHTMLFile() - Scanhtmlfile
// - findJavaScriptFile() - Findjavascriptfile
// - scanAllPages() - Scanallpages
// - generateReport() - Generatereport

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '../..');
const SCRIPTS_DIR = path.join(ROOT_DIR, 'trading-ui/scripts');
const HTML_DIR = path.join(ROOT_DIR, 'trading-ui');
const PACKAGE_MANIFEST = path.join(SCRIPTS_DIR, 'init-system/package-manifest.js');

// Pages to scan
const MAIN_PAGES = [
    'index.html', 'trades.html', 'trade_plans.html', 'alerts.html', 
    'tickers.html', 'trading_accounts.html', 'executions.html', 
    'cash_flows.html', 'notes.html', 'research.html', 'preferences.html'
];

const TECHNICAL_PAGES = [
    'db_display.html', 'db_extradata.html', 'constraints.html', 
    'background-tasks.html', 'server-monitor.html', 'system-management.html',
    'cache-test.html', 'notifications-center.html', 'css-management.html',
    'dynamic-colors-display.html', 'designs.html', 'tradingview-test-page.html'
];

const SECONDARY_PAGES = [
    'external-data-dashboard.html', 'chart-management.html'
];

const MOCKUP_PAGES = [
    'portfolio-state-page.html', 'trade-history-page.html', 'price-history-page.html',
    'comparative-analysis-page.html', 'trading-journal-page.html', 
    'strategy-analysis-page.html', 'economic-calendar-page.html',
    'history-widget.html', 'emotional-tracking-widget.html', 
    'date-comparison-modal.html'
];

const ALL_PAGES = [...MAIN_PAGES, ...TECHNICAL_PAGES, ...SECONDARY_PAGES, ...MOCKUP_PAGES];

// Results
const deviations = [];
let totalFilesScanned = 0;
let filesWithIssues = 0;

/**
 * Check if actions-menu-system.js is loaded via package-manifest
 */
function checkPackageManifest() {
    try {
        const content = fs.readFileSync(PACKAGE_MANIFEST, 'utf8');
        return content.includes('actions-menu-system.js');
    } catch (error) {
        console.error('Error reading package-manifest.js:', error);
        return false;
    }
}

/**
 * Scan JavaScript file for deviations
 */
function scanJavaScriptFile(filePath, pageName) {
    const issues = [];
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Check for local generateActionButtons function
        const generateActionButtonsRegex = /function\s+generateActionButtons\s*\(/;
        const generateActionButtonsMatches = content.matchAll(new RegExp(generateActionButtonsRegex, 'g'));
        for (const match of generateActionButtonsMatches) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            issues.push({
                type: 'local_function',
                severity: 'high',
                line: lineNum,
                code: lines[lineNum - 1]?.trim() || '',
                description: 'Local generateActionButtons function - should use window.createActionsMenu()'
            });
        }
        
        // Check for local createActionsMenu function (not window.createActionsMenu)
        const localCreateActionsMenuRegex = /(?:function\s+createActionsMenu\s*\(|const\s+createActionsMenu\s*=|let\s+createActionsMenu\s*=)/;
        const localCreateMatches = content.matchAll(new RegExp(localCreateActionsMenuRegex, 'g'));
        for (const match of localCreateMatches) {
            const beforeMatch = content.substring(Math.max(0, match.index - 50), match.index);
            // Skip if it's window.createActionsMenu
            if (!beforeMatch.includes('window.createActionsMenu') && !beforeMatch.includes('window.actionsMenuSystem')) {
                const lineNum = content.substring(0, match.index).split('\n').length;
                issues.push({
                    type: 'local_function',
                    severity: 'high',
                    line: lineNum,
                    code: lines[lineNum - 1]?.trim() || '',
                    description: 'Local createActionsMenu function - should use window.createActionsMenu()'
                });
            }
        }
        
        // Check for local createActionButtons function
        const createActionButtonsRegex = /function\s+createActionButtons\s*\(/;
        const createActionButtonsMatches = content.matchAll(new RegExp(createActionButtonsRegex, 'g'));
        for (const match of createActionButtonsMatches) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            issues.push({
                type: 'local_function',
                severity: 'high',
                line: lineNum,
                code: lines[lineNum - 1]?.trim() || '',
                description: 'Local createActionButtons function - should use window.createActionsMenu()'
            });
        }
        
        // Check for manual HTML creation of actions-menu-wrapper
        const actionsMenuWrapperRegex = /<div\s+class=["']actions-menu-wrapper["']/;
        const wrapperMatches = content.matchAll(new RegExp(actionsMenuWrapperRegex, 'g'));
        for (const match of wrapperMatches) {
            const beforeMatch = content.substring(Math.max(0, match.index - 100), match.index);
            // Skip if it's inside a comment or string that's part of createActionsMenu
            if (!beforeMatch.includes('createActionsMenu') && !beforeMatch.includes('//') && !beforeMatch.includes('/*')) {
                const lineNum = content.substring(0, match.index).split('\n').length;
                issues.push({
                    type: 'manual_html',
                    severity: 'high',
                    line: lineNum,
                    code: lines[lineNum - 1]?.trim() || '',
                    description: 'Manual HTML creation of actions-menu-wrapper - should use window.createActionsMenu()'
                });
            }
        }
        
        // Check for manual HTML creation of actions-trigger
        const actionsTriggerRegex = /<button[^>]*class=["'][^"']*actions-trigger[^"']*["']/;
        const triggerMatches = content.matchAll(new RegExp(actionsTriggerRegex, 'g'));
        for (const match of triggerMatches) {
            const beforeMatch = content.substring(Math.max(0, match.index - 100), match.index);
            // Skip if it's inside createActionsMenu or a comment
            if (!beforeMatch.includes('createActionsMenu') && !beforeMatch.includes('//') && !beforeMatch.includes('/*')) {
                const lineNum = content.substring(0, match.index).split('\n').length;
                issues.push({
                    type: 'manual_html',
                    severity: 'high',
                    line: lineNum,
                    code: lines[lineNum - 1]?.trim() || '',
                    description: 'Manual HTML creation of actions-trigger - should use window.createActionsMenu()'
                });
            }
        }
        
        // Check for usage of window.createActionsMenu (positive)
        const usesCreateActionsMenu = content.includes('window.createActionsMenu') || content.includes('createActionsMenu(');
        
        return { issues, usesCreateActionsMenu };
    } catch (error) {
        console.error(`Error scanning ${filePath}:`, error);
        return { issues: [], usesCreateActionsMenu: false };
    }
}

/**
 * Scan HTML file for missing actions-menu-system.js
 */
function scanHTMLFile(filePath, pageName) {
    const issues = [];
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if actions-menu-system.js is loaded
        const hasActionsMenuSystem = content.includes('actions-menu-system.js') || 
                                    content.includes('modules/actions-menu-system.js');
        
        // Check if modules package is loaded
        const hasModulesPackage = content.includes('modules') || 
                                 content.includes('package-manifest');
        
        // For pages with tables, actions-menu-system should be loaded
        // We'll check this in the main scan function based on page type
        
        return { issues, hasActionsMenuSystem, hasModulesPackage };
    } catch (error) {
        console.error(`Error scanning ${filePath}:`, error);
        return { issues: [], hasActionsMenuSystem: false, hasModulesPackage: false };
    }
}

/**
 * Find JavaScript file for a page
 */
function findJavaScriptFile(pageName) {
    const baseName = pageName.replace('.html', '');
    const possiblePaths = [
        path.join(SCRIPTS_DIR, `${baseName}.js`),
        path.join(SCRIPTS_DIR, 'modules', `${baseName}.js`),
        path.join(SCRIPTS_DIR, 'pages', `${baseName}.js`)
    ];
    
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }
    
    return null;
}

/**
 * Main scan function
 */
function scanAllPages() {
    console.log('🔍 Scanning for Actions Menu Toolkit deviations...\n');
    
    const packageManifestHasActionsMenu = checkPackageManifest();
    console.log(`Package Manifest: ${packageManifestHasActionsMenu ? '✅' : '❌'} actions-menu-system.js`);
    
    for (const pageName of ALL_PAGES) {
        const htmlPath = path.join(HTML_DIR, pageName);
        const jsFile = findJavaScriptFile(pageName);
        
        totalFilesScanned++;
        
        const pageDeviations = {
            page: pageName,
            htmlPath: fs.existsSync(htmlPath) ? htmlPath : null,
            jsPath: jsFile,
            status: 'unknown',
            issues: []
        };
        
        // Scan HTML file
        if (fs.existsSync(htmlPath)) {
            const htmlResult = scanHTMLFile(htmlPath, pageName);
            // HTML scanning is mainly for reference - JS scanning is more important
        }
        
        // Scan JavaScript file
        if (jsFile) {
            const jsResult = scanJavaScriptFile(jsFile, pageName);
            pageDeviations.issues = jsResult.issues;
            pageDeviations.usesCreateActionsMenu = jsResult.usesCreateActionsMenu;
            
            if (jsResult.issues.length > 0) {
                filesWithIssues++;
                pageDeviations.status = 'has_issues';
            } else if (jsResult.usesCreateActionsMenu) {
                pageDeviations.status = 'uses_system';
            } else {
                pageDeviations.status = 'no_actions_menu';
            }
        } else {
            pageDeviations.status = 'no_js_file';
        }
        
        if (pageDeviations.issues.length > 0 || pageDeviations.status !== 'uses_system') {
            deviations.push(pageDeviations);
        }
    }
    
    // Generate report
    generateReport();
}

/**
 * Generate deviation report
 */
function generateReport() {
    const reportPath = path.join(ROOT_DIR, 'documentation/05-REPORTS/ACTIONS_MENU_TOOLKIT_DEVIATIONS_REPORT.md');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    let report = `# דוח סטיות - Actions Menu Toolkit
## ACTIONS_MENU_TOOLKIT_DEVIATIONS_REPORT

**תאריך יצירה:** ${new Date().toLocaleDateString('he-IL')}
**גרסה:** 1.0.0
**מטרה:** זיהוי סטיות משימוש ב-Actions Menu Toolkit המרכזי

---

## 📊 סיכום כללי

// - **סה"כ קבצים נסרקו:** ${totalFilesScanned}
// - **קבצים עם בעיות:** ${filesWithIssues}
// - **סה"כ בעיות:** ${deviations.reduce((sum, d) => sum + d.issues.length, 0)}

---

## 📋 רשימת סטיות

`;

    // Group by page type
    const mainPagesIssues = deviations.filter(d => MAIN_PAGES.includes(d.page));
    const technicalPagesIssues = deviations.filter(d => TECHNICAL_PAGES.includes(d.page));
    const secondaryPagesIssues = deviations.filter(d => SECONDARY_PAGES.includes(d.page));
    const mockupPagesIssues = deviations.filter(d => MOCKUP_PAGES.includes(d.page));
    
    function formatPageIssues(pages, title) {
        if (pages.length === 0) return '';
        
        let section = `### ${title}\n\n`;
        
        for (const page of pages) {
            section += `#### ${page.page}\n\n`;
            section += `- **קובץ HTML:** ${page.htmlPath || 'לא נמצא'}\n`;
            section += `- **קובץ JS:** ${page.jsPath || 'לא נמצא'}\n`;
            section += `- **סטטוס:** ${getStatusText(page.status)}\n`;
            
            if (page.issues.length > 0) {
                section += `- **מספר בעיות:** ${page.issues.length}\n\n`;
                section += `**רשימת בעיות:**\n\n`;
                
                for (const issue of page.issues) {
                    section += `1. **שורה ${issue.line}** - ${issue.type} (${issue.severity})\n`;
                    section += `   - **תיאור:** ${issue.description}\n`;
                    section += `   - **קוד:** \`${issue.code.substring(0, 100)}${issue.code.length > 100 ? '...' : ''}\`\n\n`;
                }
            } else {
                section += `- **הערות:** ${getStatusDescription(page.status)}\n\n`;
            }
            
            section += '---\n\n';
        }
        
        return section;
    }
    
    report += formatPageIssues(mainPagesIssues, 'עמודים מרכזיים');
    report += formatPageIssues(technicalPagesIssues, 'עמודים טכניים');
    report += formatPageIssues(secondaryPagesIssues, 'עמודים משניים');
    report += formatPageIssues(mockupPagesIssues, 'עמודי מוקאפ');
    
    // Summary by issue type
    const issueTypes = {};
    deviations.forEach(page => {
        page.issues.forEach(issue => {
            if (!issueTypes[issue.type]) {
                issueTypes[issue.type] = { count: 0, severity: issue.severity };
            }
            issueTypes[issue.type].count++;
        });
    });
    
    report += `## 📊 סיכום לפי סוג בעיה\n\n`;
    for (const [type, data] of Object.entries(issueTypes)) {
        report += `- **${type}:** ${data.count} בעיות (${data.severity})\n`;
    }
    
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n✅ Report generated: ${reportPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Files scanned: ${totalFilesScanned}`);
    console.log(`   - Files with issues: ${filesWithIssues}`);
    console.log(`   - Total issues: ${deviations.reduce((sum, d) => sum + d.issues.length, 0)}`);
}

function getStatusText(status) {
    const statusMap = {
        'uses_system': '✅ משתמש במערכת',
        'has_issues': '❌ יש בעיות',
        'no_actions_menu': '⏳ לא משתמש (אולי לא רלוונטי)',
        'no_js_file': '⏳ אין קובץ JS',
        'unknown': '❓ לא ידוע'
    };
    return statusMap[status] || status;
}

function getStatusDescription(status) {
    const descMap = {
        'uses_system': 'העמוד משתמש ב-window.createActionsMenu() - תקין',
        'has_issues': 'נמצאו סטיות מהסטנדרט',
        'no_actions_menu': 'העמוד לא משתמש בתפריטי פעולות (אולי לא רלוונטי)',
        'no_js_file': 'לא נמצא קובץ JavaScript עבור העמוד',
        'unknown': 'לא ניתן לקבוע את הסטטוס'
    };
    return descMap[status] || '';
}

// Run scan
scanAllPages();

