/**
 * Linked Items Service Usage Scanner
 * ====================================
 * 
 * Scans all HTML and JavaScript files to identify deviations from
 * the centralized Linked Items Service standard.
 * 
 * Identifies:
 * - Local functions for showing linked items
 * - Local functions for checking linked items before actions
 * - Local logic for sorting/formatting linked items
 * - Missing linked-items.js or linked-items-service.js loading
 * - Direct modal creation for linked items instead of using showLinkedItemsModal
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TRADING_UI_DIR = path.join(__dirname, '..');
const HTML_DIR = TRADING_UI_DIR;
const JS_DIR = path.join(TRADING_UI_DIR, 'scripts');
const REPORT_DIR = path.join(__dirname, '../../documentation/05-REPORTS');

// Patterns to search for
const PATTERNS = {
    // שימוש ב-Linked Items Service (חיובי)
    usingSystem: [
        /window\.showLinkedItemsModal\s*\(/g,
        /window\.viewLinkedItems\s*\(/g,
        /window\.checkLinkedItemsBeforeAction\s*\(/g,
        /window\.checkLinkedItemsAndPerformAction\s*\(/g,
        /window\.viewLinkedItemsFor(Trade|Account|Ticker|Alert|CashFlow|Note|TradePlan|Execution)\s*\(/g,
        /window\.LinkedItemsService/g,
        /LinkedItemsService\.(sortLinkedItems|formatLinkedItemName|generateLinkedItemActions|getLinkedItemIcon|getLinkedItemColor|getEntityLabel)\s*\(/g,
    ],
    // פונקציות מקומיות להצגת פריטים מקושרים
    localShowFunctions: [
        /function\s+(showLinkedItems|viewLinkedItems|displayLinkedItems|showRelatedItems|viewRelatedItems)\s*\(/gi,
        /const\s+(showLinkedItems|viewLinkedItems|displayLinkedItems|showRelatedItems|viewRelatedItems)\s*=/gi,
        /async\s+function\s+(showLinkedItems|viewLinkedItems|displayLinkedItems|showRelatedItems|viewRelatedItems)\s*\(/gi,
    ],
    // בדיקות מקומיות לפני פעולות
    localCheckFunctions: [
        /function\s+(checkLinkedItems|checkRelatedItems)\s*\(/gi,
        /const\s+(checkLinkedItems|checkRelatedItems)\s*=/gi,
        /async\s+function\s+(checkLinkedItems|checkRelatedItems)\s*\(/gi,
    ],
    // לוגיקה מקומית למיון/פורמט/כפתורים
    localLogicFunctions: [
        /function\s+(sortLinkedItems|formatLinkedItemName|generateLinkedItemActions)\s*\(/gi,
        /const\s+(sortLinkedItems|formatLinkedItemName|generateLinkedItemActions)\s*=/gi,
        /async\s+function\s+(sortLinkedItems|formatLinkedItemName|generateLinkedItemActions)\s*\(/gi,
    ],
    // יצירת מודלים מקומיים לפריטים מקושרים
    localModalCreation: [
        /createModal\s*\([^)]*linked[^)]*items/gi,
        /new\s+Bootstrap\.Modal\s*\([^)]*linked[^)]*items/gi,
        /getElementById\s*\([^)]*linked[^)]*items[^)]*\)/gi,
    ],
    // טעינת linked-items.js ו-linked-items-service.js
    loadingLinkedItems: [
        /linked-items\.js/g,
        /linked-items-service\.js/g,
    ],
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
    
    // Check for local show functions
    PATTERNS.localShowFunctions.forEach((pattern) => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            // Skip if it's the actual linked-items.js file
            if (relativePath.includes('linked-items.js')) continue;
            // Check if it's a wrapper function that uses the system
            const context = content.substring(Math.max(0, match.index - 100), Math.min(content.length, match.index + 500));
            if (context.includes('window.showLinkedItemsModal') || context.includes('window.loadLinkedItemsData') || context.includes('window.viewLinkedItemsFor') || context.includes('window.viewLinkedItems')) {
                // It's a wrapper function that uses the system - skip
                continue;
            }
            // Skip if it's just checking for modal existence (not creating it)
            if (context.includes('getElementById') && (context.includes('classList.contains') || context.includes('modalExists') || context.includes('isModalOpen'))) {
                continue;
            }
            issues.push({
                type: 'localShowFunction',
                severity: 'high',
                line: lineNumber,
                code: match[0],
                description: `פונקציה מקומית להצגת פריטים מקושרים: ${match[1] || match[0]}`
            });
        }
    });
    
    // Check for local check functions
    PATTERNS.localCheckFunctions.forEach((pattern) => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            // Skip if it's the actual linked-items.js file
            if (relativePath.includes('linked-items.js')) continue;
            // Skip if it's commented out
            const lines = content.split('\n');
            const lineContent = lines[lineNumber - 1] || '';
            if (lineContent.trim().startsWith('//') || lineContent.trim().startsWith('*')) continue;
            // Check if it's a wrapper function that uses the system
            const context = content.substring(Math.max(0, match.index - 100), Math.min(content.length, match.index + 500));
            if (context.includes('window.checkLinkedItemsBeforeAction') || context.includes('window.checkLinkedItemsAndPerformAction')) {
                // It's a wrapper function that uses the system - skip
                continue;
            }
            issues.push({
                type: 'localCheckFunction',
                severity: 'high',
                line: lineNumber,
                code: match[0],
                description: `פונקציה מקומית לבדיקה לפני פעולות: ${match[1] || match[0]}`
            });
        }
    });
    
    // Check for local logic functions
    PATTERNS.localLogicFunctions.forEach((pattern) => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            // Skip if it's the actual linked-items-service.js file
            if (relativePath.includes('linked-items-service.js')) continue;
            issues.push({
                type: 'localLogicFunction',
                severity: 'medium',
                line: lineNumber,
                code: match[0],
                description: `פונקציית לוגיקה מקומית: ${match[1] || match[0]}`
            });
        }
    });
    
    // Check for local modal creation
    PATTERNS.localModalCreation.forEach((pattern) => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            // Skip if it's the actual linked-items.js file
            if (relativePath.includes('linked-items.js')) continue;
            // Skip if it's linkedItemsFilter (this is a filter, not a modal)
            if (match[0].includes('linkedItemsFilter')) continue;
            // Skip test files
            if (relativePath.includes('test-') || relativePath.includes('mockup')) continue;
            // Skip if it's just checking for modal existence (debug code)
            const context = content.substring(Math.max(0, match.index - 50), Math.min(content.length, match.index + 50));
            if (context.includes('זמין') || context.includes('לא זמין') || context.includes('available')) continue;
            // Skip if it's linkedItemsContent (this is a content div, not a modal)
            if (match[0].includes('linkedItemsContent')) continue;
            // Skip if it's linkedItemsContainer (this is a container, not a modal)
            if (match[0].includes('linkedItemsContainer')) continue;
            issues.push({
                type: 'localModalCreation',
                severity: 'high',
                line: lineNumber,
                code: match[0],
                description: 'יצירת מודל מקומי לפריטים מקושרים במקום showLinkedItemsModal'
            });
        }
    });
    
    // Check for using system (positive)
    const usingSystem = PATTERNS.usingSystem.some(pattern => pattern.test(content));
    
    // Check for loading linked-items
    const loadingLinkedItems = PATTERNS.loadingLinkedItems.some(pattern => pattern.test(content));
    
    return {
        file: relativePath,
        issues,
        usingSystem,
        loadingLinkedItems
    };
}

function checkPackageManifest() {
    const manifestPath = path.join(JS_DIR, 'init-system', 'package-manifest.js');
    if (!fs.existsSync(manifestPath)) {
        return false;
    }
    
    const content = fs.readFileSync(manifestPath, 'utf8');
    // Check if linked-items.js and linked-items-service.js are in entity-services package
    return /linked-items\.js/.test(content) && /linked-items-service\.js/.test(content);
}

function generateReport(results, hasInManifest) {
    const timestamp = new Date().toLocaleString('he-IL');
    
    let report = `# דוח סטיות - Linked Items Service
## LINKED_ITEMS_SERVICE_DEVIATIONS_REPORT

**תאריך יצירה:** ${timestamp}
**גרסה:** 1.0.0
**מטרה:** זיהוי שימושים מקומיים במקום Linked Items Service המרכזית

---

## 📊 סיכום כללי

- **סה"כ קבצים נסרקו:** ${results.length}
- **קבצים המשתמשים במערכת:** ${results.filter(r => r.usingSystem).length}
- **קבצים עם בעיות:** ${results.filter(r => r.issues.length > 0).length}
- **סה"כ בעיות נמצאו:** ${results.reduce((sum, r) => sum + r.issues.length, 0)}

### פילוח בעיות לפי סוג:

- **פונקציות הצגה מקומיות:** ${results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'localShowFunction').length, 0)}
- **פונקציות בדיקה מקומיות:** ${results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'localCheckFunction').length, 0)}
- **פונקציות לוגיקה מקומיות:** ${results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'localLogicFunction').length, 0)}
- **יצירת מודלים מקומית:** ${results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'localModalCreation').length, 0)}

### סטטוס טעינת המערכת:

- **linked-items.js ו-linked-items-service.js במוניפסט:** ${hasInManifest ? '✅ כן' : '❌ לא'}

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
- **משתמש במערכת:** ${result.usingSystem ? '✅ כן' : '❌ לא'}
- **טוען את המערכת:** ${result.loadingLinkedItems ? '✅ כן' : '❌ לא (נטען דרך entity-services package)'}
- **יש בעיות:** ${result.issues.length > 0 ? '⚠️ כן' : '✅ לא'}

`;

        if (result.issues.length > 0) {
            report += `#### סטיות שנמצאו:

`;
            result.issues.forEach((issue, index) => {
                const severityEmoji = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
                report += `${index + 1}. **שורה ${issue.line}:** ${issue.description}
   - **סוג:** ${issue.type}
   - **חומרה:** ${severityEmoji} ${issue.severity === 'high' ? 'גבוהה' : issue.severity === 'medium' ? 'בינונית' : 'נמוכה'}
   - **קוד:** \`${issue.code.substring(0, 100)}${issue.code.length > 100 ? '...' : ''}\`

`;
            });
        } else if (!result.usingSystem) {
            report += `#### ✅ אין סטיות - הקובץ לא משתמש בפריטים מקושרים

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
    console.log('🔍 Scanning for Linked Items Service usage deviations...\n');
    
    // Get all HTML and JS files
    const htmlFiles = getAllFiles(HTML_DIR, ['.html']);
    const jsFiles = getAllFiles(JS_DIR, ['.js']).filter(f => 
        !f.includes('check-linked-items-usage.js') && 
        !f.includes('node_modules')
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
    
    const reportPath = path.join(REPORT_DIR, 'LINKED_ITEMS_SERVICE_DEVIATIONS_REPORT.md');
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

