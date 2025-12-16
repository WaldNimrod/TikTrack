/**
 * Conditions System Usage Scanner
 * =================================
 * 
 * Scans all HTML and JavaScript files to identify deviations from
 * the centralized Conditions System standard.
 * 
 * Identifies:
 * - Local functions for managing conditions
 * - Direct API calls to /api/plan-conditions or /api/trade-conditions
 * - Missing package loading
 * - Local condition field management functions
 * - Local condition modal opening functions
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - checkPageInitializationConfigs() - Checkpageinitializationconfigs

// === Core Functions ===
// - main() - Main

// === Data Functions ===
// - getAllFiles() - Getallfiles

// === Other ===
// - scanFile() - Scanfile
// - generateReport() - Generatereport

const fs = require('fs');
const path = require('path');

// Configuration
const TRADING_UI_DIR = path.join(__dirname, '..');
const HTML_DIR = TRADING_UI_DIR;
const JS_DIR = path.join(TRADING_UI_DIR, 'scripts');
const REPORT_DIR = path.join(__dirname, '../../documentation/05-REPORTS');

// Patterns to search for
const PATTERNS = {
    // שימוש ב-Conditions System (חיובי)
    usingSystem: [
        /window\.conditionsInitializer/g,
        /window\.conditionsCRUDManager/g,
        /window\.ConditionsUIManager/g,
        /window\.ConditionsModalController/g,
        /conditionsInitializer\.initialize/g,
        /ConditionsUIManager\.initialize/g,
        /conditionsCRUDManager\.(createCondition|readConditions|updateCondition|deleteCondition)/g,
    ],
    // פונקציות מקומיות לניהול תנאים
    localConditionFunctions: [
        /function\s+(enableConditionFields|disableConditionFields|openTradeConditionsModal|openTradePlanConditionsModal|addEditCondition|isConditionsModalOpen)\s*\(/gi,
        /const\s+(enableConditionFields|disableConditionFields|openTradeConditionsModal|openTradePlanConditionsModal|addEditCondition|isConditionsModalOpen)\s*=/gi,
        /async\s+function\s+(enableConditionFields|disableConditionFields|openTradeConditionsModal|openTradePlanConditionsModal|addEditCondition|isConditionsModalOpen)\s*\(/gi,
    ],
    // פונקציות מקומיות ב-alerts.js
    localAlertConditionFunctions: [
        /function\s+(loadConditionsFromSource|loadTradePlansForConditions|loadTradesForConditions|loadConditionsFromItem|getMethodIdFromCondition|createAlertFromCondition|toggleConditionFields|enableConditionFields|disableConditionFields|enableEditConditionFields|disableEditConditionFields|parseAlertCondition|displayAvailableConditions|selectConditionForAlert|evaluateAllConditions|refreshConditionEvaluations)\s*\(/gi,
        /const\s+(loadConditionsFromSource|loadTradePlansForConditions|loadTradesForConditions|loadConditionsFromItem|getMethodIdFromCondition|createAlertFromCondition|toggleConditionFields|enableConditionFields|disableConditionFields|enableEditConditionFields|disableEditConditionFields|parseAlertCondition|displayAvailableConditions|selectConditionForAlert|evaluateAllConditions|refreshConditionEvaluations)\s*=/gi,
        /async\s+function\s+(loadConditionsFromSource|loadTradePlansForConditions|loadTradesForConditions|loadConditionsFromItem|getMethodIdFromCondition|createAlertFromCondition|toggleConditionFields|enableConditionFields|disableConditionFields|enableEditConditionFields|disableEditConditionFields|parseAlertCondition|displayAvailableConditions|selectConditionForAlert|evaluateAllConditions|refreshConditionEvaluations)\s*\(/gi,
    ],
    // קריאות ישירות ל-API
    directApiCalls: [
        /fetch\s*\(\s*['"]\/api\/(plan-conditions|trade-conditions)/g,
        /fetch\s*\(\s*[`'"]\/api\/(plan-conditions|trade-conditions)/g,
        /['"`]\/api\/(plan-conditions|trade-conditions)/g,
    ],
    // טעינת conditions package
    loadingPackage: [
        /['"]conditions['"]/g,
        /package.*conditions/g,
    ],
    // שימוש ב-conditions modal
    usingConditionsModal: [
        /conditionsModal/g,
        /conditions-modal/g,
        /ConditionsModal/g,
    ]
};

// Helper functions
function getAllFiles(dir, extensions, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules, .git, etc.
            if (!file.startsWith('.') && file !== 'node_modules') {
                getAllFiles(filePath, extensions, fileList);
            }
        } else if (extensions.some(ext => file.endsWith(ext))) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(TRADING_UI_DIR, filePath);
    const issues = [];
    
    // Check for local condition functions
    PATTERNS.localConditionFunctions.forEach((pattern, index) => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            issues.push({
                type: 'localFunction',
                severity: 'high',
                line: lineNumber,
                code: match[0],
                description: `פונקציה מקומית לניהול תנאים: ${match[1] || match[0]}`
            });
        }
    });
    
    // Check for local alert condition functions
    PATTERNS.localAlertConditionFunctions.forEach((pattern, index) => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            issues.push({
                type: 'localAlertFunction',
                severity: 'high',
                line: lineNumber,
                code: match[0],
                description: `פונקציה מקומית ב-alerts.js: ${match[1] || match[0]}`
            });
        }
    });
    
    // Check for direct API calls
    PATTERNS.directApiCalls.forEach((pattern, index) => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            issues.push({
                type: 'directApiCall',
                severity: 'high',
                line: lineNumber,
                code: match[0],
                description: `קריאה ישירה ל-API: ${match[0]}`
            });
        }
    });
    
    // Check for using system (positive)
    const usingSystem = PATTERNS.usingSystem.some(pattern => pattern.test(content));
    
    // Check for loading package
    const loadingPackage = PATTERNS.loadingPackage.some(pattern => pattern.test(content));
    
    return {
        file: relativePath,
        issues,
        usingSystem,
        loadingPackage
    };
}

function checkPageInitializationConfigs() {
    const configPath = path.join(JS_DIR, 'page-initialization-configs.js');
    if (!fs.existsSync(configPath)) {
        return {};
    }
    
    const content = fs.readFileSync(configPath, 'utf8');
    const pagesWithConditions = {};
    
    // Find all page configs with 'conditions' in packages
    const pageConfigRegex = /(\w+):\s*\{[^}]*packages:\s*\[([^\]]*)\]/g;
    let match;
    
    while ((match = pageConfigRegex.exec(content)) !== null) {
        const pageName = match[1];
        const packages = match[2];
        if (packages.includes('conditions')) {
            pagesWithConditions[pageName] = true;
        }
    }
    
    return pagesWithConditions;
}

function generateReport(results, pagesWithConditions) {
    const timestamp = new Date().toLocaleString('he-IL');
    
    let report = `# דוח סטיות - Conditions System
## CONDITIONS_SYSTEM_DEVIATIONS_REPORT

**תאריך יצירה:** ${timestamp}
**גרסה:** 1.0.0
**מטרה:** זיהוי שימושים מקומיים במקום Conditions System המרכזית

---

## 📊 סיכום כללי

// - **סה"כ קבצים נסרקו:** ${results.length}
// - **קבצים המשתמשים במערכת:** ${results.filter(r => r.usingSystem).length}
// - **קבצים עם בעיות:** ${results.filter(r => r.issues.length > 0).length}
// - **סה"כ בעיות נמצאו:** ${results.reduce((sum, r) => sum + r.issues.length, 0)}

### פילוח בעיות לפי סוג:

// - **פונקציות מקומיות לניהול תנאים:** ${results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'localFunction').length, 0)}
// - **פונקציות מקומיות ב-alerts.js:** ${results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'localAlertFunction').length, 0)}
// - **קריאות ישירות ל-API:** ${results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'directApiCall').length, 0)}

---

## 📋 דוח מפורט לכל קובץ

`;

    results.forEach(result => {
        if (result.issues.length === 0 && result.usingSystem) {
            return; // Skip files with no issues that use the system
        }
        
        const fileName = path.basename(result.file, path.extname(result.file));
        const pageName = fileName.replace('.html', '').replace('.js', '');
        const hasPackage = pagesWithConditions[pageName] || false;
        
        report += `### ${fileName}
**קובץ:** \`${result.file}\`
**קטגוריה:** ${result.file.endsWith('.html') ? 'HTML' : 'JavaScript'}

#### סטטוס:
// - **משתמש במערכת:** ${result.usingSystem ? '✅ כן' : '❌ לא'}
// - **טוען את המערכת:** ${hasPackage ? '✅ כן' : '❌ לא'}
// - **יש בעיות:** ${result.issues.length > 0 ? '⚠️ כן' : '✅ לא'}

`;

        if (result.issues.length > 0) {
            report += `#### סטיות שנמצאו:

`;
            result.issues.forEach((issue, index) => {
                const severityEmoji = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
                report += `${index + 1}. **שורה ${issue.line}:** ${issue.description}
// - **סוג:** ${issue.type}
// - **חומרה:** ${severityEmoji} ${issue.severity === 'high' ? 'גבוהה' : issue.severity === 'medium' ? 'בינונית' : 'נמוכה'}
// - **קוד:** \`${issue.code.substring(0, 100)}${issue.code.length > 100 ? '...' : ''}\`

`;
            });
        } else if (!result.usingSystem && !hasPackage) {
            report += `#### ✅ אין סטיות - הקובץ לא משתמש בתנאים

`;
        } else {
            report += `#### ✅ אין סטיות - הקובץ משתמש במערכת המרכזית נכון

`;
        }
        
        report += `---

`;
    });
    
    report += `## 🎯 סיכום והמלצות

### בעיות קריטיות (גבוהה חומרה):
${results.filter(r => r.issues.some(i => i.severity === 'high')).length > 0 ? 
    results.filter(r => r.issues.some(i => i.severity === 'high'))
        .map(r => `- **${r.file}** - ${r.issues.filter(i => i.severity === 'high').length} בעיות`)
        .join('\n') : 
    '- אין בעיות קריטיות'}

### עמודים שצריך להוסיף conditions package:
${Object.keys(pagesWithConditions).length > 0 ? 
    results.filter(r => !pagesWithConditions[path.basename(r.file, path.extname(r.file)).replace('.html', '').replace('.js', '')] && r.issues.length > 0)
        .map(r => `- **${r.file}**`)
        .join('\n') || '- כל העמודים הרלוונטיים כבר טוענים את המערכת' : 
    '- אין עמודים שצריך להוסיף'}

---

**תאריך עדכון אחרון:** ${timestamp}
`;
    
    return report;
}

// Main execution
function main() {
    console.log('🔍 Scanning for Conditions System usage deviations...\n');
    
    // Get all HTML and JS files
    const htmlFiles = getAllFiles(HTML_DIR, ['.html']);
    const jsFiles = getAllFiles(JS_DIR, ['.js']).filter(f => 
        !f.includes('check-conditions-usage.js') && 
        !f.includes('node_modules') &&
        !f.includes('conditions/') // Skip conditions system files themselves
    );
    
    const allFiles = [...htmlFiles, ...jsFiles];
    console.log(`📁 Found ${allFiles.length} files to scan\n`);
    
    // Scan all files
    const results = allFiles.map(scanFile);
    
    // Check page initialization configs
    const pagesWithConditions = checkPageInitializationConfigs();
    
    // Generate report
    const report = generateReport(results, pagesWithConditions);
    
    // Write report
    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
    
    const reportPath = path.join(REPORT_DIR, 'CONDITIONS_SYSTEM_DEVIATIONS_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    
    console.log('✅ Scan complete!');
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Files scanned: ${allFiles.length}`);
    console.log(`   - Files with issues: ${results.filter(r => r.issues.length > 0).length}`);
    console.log(`   - Total issues: ${results.reduce((sum, r) => sum + r.issues.length, 0)}`);
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { scanFile, generateReport, checkPageInitializationConfigs };

