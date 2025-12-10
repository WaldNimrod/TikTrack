/**
 * Translation Utilities Usage Scanner
 * ====================================
 * 
 * Scans all HTML and JavaScript files to identify deviations from
 * the centralized Translation Utilities standard.
 * 
 * Identifies:
 * - Local translation functions
 * - Local translation maps (statusMap, typeMap, actionMap, conditionMap)
 * - Local format functions (formatNumber, formatCurrency, formatAmount, colorAmount)
 * - Missing translation-utils.js loading
 * - Direct use of Hebrew strings instead of translation functions
 */


// ===== FUNCTION INDEX =====

// === Core Functions ===
// - main() - Main

// === Data Functions ===
// - getAllFiles() - Getallfiles

// === Utility Functions ===
// - checkPackageManifest() - Checkpackagemanifest

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
    // שימוש ב-Translation Utilities (חיובי)
    usingSystem: [
        /window\.translate(Status|AccountStatus|TickerStatus|NoteStatus|AlertStatus|TradeStatus|TradePlanStatus)/g,
        /window\.translate(TradeType|TradePlanType|CashFlowType|CashFlowSource|AlertType|AlertCondition|ExecutionAction)/g,
        /window\.translationUtils/g,
        /window\.formatNumberWithCommas/g,
        /window\.formatCurrencyWithCommas/g,
        /window\.colorAmountByValue/g,
        /window\.getTypeDisplay/g,
        /window\.getTypeDisplayName/g,
    ],
    // פונקציות תרגום מקומיות
    localTranslationFunctions: [
        /function\s+(getTypeDisplayName|getTypeDisplay|convert.*ToHebrew)\s*\(/gi,
        /const\s+(getTypeDisplayName|getTypeDisplay|convert.*ToHebrew)\s*=/gi,
        /async\s+function\s+(getTypeDisplayName|getTypeDisplay|convert.*ToHebrew)\s*\(/gi,
    ],
    // מפות תרגום מקומיות
    localTranslationMaps: [
        /const\s+statusMap\s*=\s*\{/g,
        /const\s+typeMap\s*=\s*\{/g,
        /const\s+actionMap\s*=\s*\{/g,
        /const\s+conditionMap\s*=\s*\{/g,
        /statusMap\s*=\s*\{/g,
        /typeMap\s*=\s*\{/g,
        /actionMap\s*=\s*\{/g,
        /conditionMap\s*=\s*\{/g,
    ],
    // פונקציות פורמט מקומיות
    localFormatFunctions: [
        /function\s+(formatNumber|formatCurrency|formatAmount|colorAmount)\s*\(/gi,
        /const\s+(formatNumber|formatCurrency|formatAmount|colorAmount)\s*=/gi,
        /async\s+function\s+(formatNumber|formatCurrency|formatAmount|colorAmount)\s*\(/gi,
    ],
    // טעינת translation-utils.js
    loadingTranslationUtils: [
        /translation-utils\.js/g,
    ],
    // שימוש ישיר במחרוזות עברית (קשה לזהות, אבל נחפש דפוסים נפוצים)
    directHebrewStrings: [
        /['"](פתוח|סגור|מבוטל|פעיל|לא פעיל)['"]/g,
        /['"](מניות|ETF|אג"ח|קריפטו)['"]/g,
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
            if (!file.startsWith('.') && file !== 'node_modules' && file !== 'conditions') {
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
    
    // Check for local translation functions
    PATTERNS.localTranslationFunctions.forEach((pattern, index) => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            issues.push({
                type: 'localTranslationFunction',
                severity: 'high',
                line: lineNumber,
                code: match[0],
                description: `פונקציה מקומית לתרגום: ${match[1] || match[0]}`
            });
        }
    });
    
    // Check for local translation maps
    PATTERNS.localTranslationMaps.forEach((pattern, index) => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            const mapType = match[0].includes('statusMap') ? 'statusMap' :
                           match[0].includes('typeMap') ? 'typeMap' :
                           match[0].includes('actionMap') ? 'actionMap' :
                           match[0].includes('conditionMap') ? 'conditionMap' : 'unknown';
            issues.push({
                type: 'localTranslationMap',
                severity: 'high',
                line: lineNumber,
                code: match[0],
                description: `מפת תרגום מקומית: ${mapType}`
            });
        }
    });
    
    // Check for local format functions
    PATTERNS.localFormatFunctions.forEach((pattern, index) => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            issues.push({
                type: 'localFormatFunction',
                severity: 'medium',
                line: lineNumber,
                code: match[0],
                description: `פונקציית פורמט מקומית: ${match[1] || match[0]}`
            });
        }
    });
    
    // Check for using system (positive)
    const usingSystem = PATTERNS.usingSystem.some(pattern => pattern.test(content));
    
    // Check for loading translation-utils
    const loadingTranslationUtils = PATTERNS.loadingTranslationUtils.some(pattern => pattern.test(content));
    
    return {
        file: relativePath,
        issues,
        usingSystem,
        loadingTranslationUtils
    };
}

function checkPackageManifest() {
    const manifestPath = path.join(JS_DIR, 'init-system', 'package-manifest.js');
    if (!fs.existsSync(manifestPath)) {
        return false;
    }
    
    const content = fs.readFileSync(manifestPath, 'utf8');
    // Check if translation-utils.js is in base package
    return /translation-utils\.js/.test(content);
}

function generateReport(results, hasInManifest) {
    const timestamp = new Date().toLocaleString('he-IL');
    
    let report = `# דוח סטיות - Translation Utilities
## TRANSLATION_UTILITIES_DEVIATIONS_REPORT

**תאריך יצירה:** ${timestamp}
**גרסה:** 1.0.0
**מטרה:** זיהוי שימושים מקומיים במקום Translation Utilities המרכזית

---

## 📊 סיכום כללי

// - **סה"כ קבצים נסרקו:** ${results.length}
// - **קבצים המשתמשים במערכת:** ${results.filter(r => r.usingSystem).length}
// - **קבצים עם בעיות:** ${results.filter(r => r.issues.length > 0).length}
// - **סה"כ בעיות נמצאו:** ${results.reduce((sum, r) => sum + r.issues.length, 0)}

### פילוח בעיות לפי סוג:

// - **פונקציות תרגום מקומיות:** ${results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'localTranslationFunction').length, 0)}
// - **מפות תרגום מקומיות:** ${results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'localTranslationMap').length, 0)}
// - **פונקציות פורמט מקומיות:** ${results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'localFormatFunction').length, 0)}

### סטטוס טעינת המערכת:

// - **translation-utils.js במוניפסט:** ${hasInManifest ? '✅ כן' : '❌ לא'}

---

## 📋 דוח מפורט לכל קובץ

`;

    results.forEach(result => {
        if (result.issues.length === 0 && result.usingSystem) {
            return; // Skip files with no issues that use the system
        }
        
        const fileName = path.basename(result.file, path.extname(result.file));
        const pageName = fileName.replace('.html', '').replace('.js', '');
        
        report += `### ${fileName}
**קובץ:** \`${result.file}\`
**קטגוריה:** ${result.file.endsWith('.html') ? 'HTML' : 'JavaScript'}

#### סטטוס:
// - **משתמש במערכת:** ${result.usingSystem ? '✅ כן' : '❌ לא'}
// - **טוען את המערכת:** ${result.loadingTranslationUtils ? '✅ כן' : '❌ לא (נטען דרך base package)'}
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
        } else if (!result.usingSystem) {
            report += `#### ✅ אין סטיות - הקובץ לא משתמש בתרגום

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

### בעיות בינוניות:
${results.filter(r => r.issues.some(i => i.severity === 'medium')).length > 0 ? 
    results.filter(r => r.issues.some(i => i.severity === 'medium'))
        .map(r => `- **${r.file}** - ${r.issues.filter(i => i.severity === 'medium').length} בעיות`)
        .join('\n') : 
    '- אין בעיות בינוניות'}

---

**תאריך עדכון אחרון:** ${timestamp}
`;
    
    return report;
}

// Main execution
function main() {
    console.log('🔍 Scanning for Translation Utilities usage deviations...\n');
    
    // Get all HTML and JS files
    const htmlFiles = getAllFiles(HTML_DIR, ['.html']);
    const jsFiles = getAllFiles(JS_DIR, ['.js']).filter(f => 
        !f.includes('check-translation-usage.js') && 
        !f.includes('node_modules') &&
        !f.includes('translation-utils.js') // Skip translation-utils.js itself
    );
    
    const allFiles = [...htmlFiles, ...jsFiles];
    console.log(`📁 Found ${allFiles.length} files to scan\n`);
    
    // Scan all files
    const results = allFiles.map(scanFile);
    
    // Check package manifest
    const hasInManifest = checkPackageManifest();
    
    // Generate report
    const report = generateReport(results, hasInManifest);
    
    // Write report
    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
    
    const reportPath = path.join(REPORT_DIR, 'TRANSLATION_UTILITIES_DEVIATIONS_REPORT.md');
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

module.exports = { scanFile, generateReport, checkPackageManifest };

