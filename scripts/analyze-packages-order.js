/**
 * Script to analyze loadOrder within packages
 * מנתח את הסדר של הסקריפטים בתוך כל חבילה
 */

const fs = require('fs');
const path = require('path');

const PACKAGE_MANIFEST_PATH = path.join(__dirname, '../trading-ui/scripts/init-system/package-manifest.js');

// Read the file
const content = fs.readFileSync(PACKAGE_MANIFEST_PATH, 'utf8');

const packages = [];
const issues = [];

// Find all package definitions
const packagePattern = /(\w+):\s*\{[\s\S]*?id:\s*['"](\w+)['"][\s\S]*?scripts:\s*\[([\s\S]*?)\]/g;
let match;

while ((match = packagePattern.exec(content)) !== null) {
    const packageKey = match[1];
    const packageId = match[2];
    const scriptsText = match[3];
    
    const scripts = [];
    const scriptPattern = /\{\s*file:\s*['"]([^'"]+)['"]([\s\S]*?)\}/g;
    let scriptMatch;
    
    while ((scriptMatch = scriptPattern.exec(scriptsText)) !== null) {
        const file = scriptMatch[1];
        const rest = scriptMatch[2];
        
        // Extract loadOrder
        const loadOrderMatch = rest.match(/loadOrder:\s*(\d+)/);
        const loadOrder = loadOrderMatch ? parseInt(loadOrderMatch[1]) : null;
        
        scripts.push({ file, loadOrder, fullText: scriptMatch[0] });
    }
    
    if (scripts.length > 0) {
        packages.push({
            id: packageId,
            key: packageKey,
            scripts
        });
    }
}

// Analyze each package
packages.forEach(pkg => {
    const pkgIssues = [];
    const scriptsWithOrder = pkg.scripts.filter(s => s.loadOrder !== null);
    const scriptsWithoutOrder = pkg.scripts.filter(s => s.loadOrder === null);
    
    // Issue 1: Missing loadOrder when multiple scripts
    if (pkg.scripts.length > 1 && scriptsWithoutOrder.length > 0) {
        pkgIssues.push({
            type: 'missing_loadorder',
            severity: 'warning',
            message: `${scriptsWithoutOrder.length} scripts without loadOrder`,
            scripts: scriptsWithoutOrder.map(s => s.file.split('/').pop())
        });
    }
    
    // Issue 2: Non-sequential loadOrders
    if (scriptsWithOrder.length > 1) {
        const sorted = [...scriptsWithOrder].sort((a, b) => a.loadOrder - b.loadOrder);
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i].loadOrder !== sorted[i-1].loadOrder + 1) {
                pkgIssues.push({
                    type: 'non_sequential',
                    severity: 'error',
                    message: `Gap in loadOrder: ${sorted[i-1].file.split('/').pop()} (${sorted[i-1].loadOrder}) -> ${sorted[i].file.split('/').pop()} (${sorted[i].loadOrder})`,
                    expected: sorted[i-1].loadOrder + 1,
                    actual: sorted[i].loadOrder
                });
            }
        }
    }
    
    // Issue 3: Duplicate loadOrders
    const loadOrders = scriptsWithOrder.map(s => s.loadOrder);
    const duplicates = [];
    loadOrders.forEach((order, index) => {
        if (loadOrders.indexOf(order) !== index) {
            duplicates.push(order);
        }
    });
    if (duplicates.length > 0) {
        pkgIssues.push({
            type: 'duplicate_loadorder',
            severity: 'error',
            message: `Duplicate loadOrders: ${[...new Set(duplicates)].join(', ')}`,
            duplicates: [...new Set(duplicates)]
        });
    }
    
    // Issue 4: Should start from 1
    if (scriptsWithOrder.length > 0) {
        const minOrder = Math.min(...scriptsWithOrder.map(s => s.loadOrder));
        if (minOrder !== 1) {
            pkgIssues.push({
                type: 'not_starting_from_one',
                severity: 'warning',
                message: `loadOrder doesn't start from 1 (starts from ${minOrder})`,
                minOrder
            });
        }
    }
    
    if (pkgIssues.length > 0) {
        issues.push({
            package: pkg.id,
            issues: pkgIssues
        });
    }
});

// Generate report
let markdown = '# בדיקת סדר סקריפטים בתוך חבילות\n\n';
markdown += `**תאריך:** ${new Date().toISOString().split('T')[0]}\n\n`;

if (issues.length === 0) {
    markdown += '✅ **כל החבילות מסודרות נכון!**\n\n';
} else {
    markdown += `⚠️ **נמצאו ${issues.length} חבילות עם בעיות:**\n\n`;
    
    // Group by severity
    const errors = issues.filter(i => i.issues.some(issue => issue.severity === 'error'));
    const warnings = issues.filter(i => i.issues.some(issue => issue.severity === 'warning') && !errors.includes(i));
    
    if (errors.length > 0) {
        markdown += `## ❌ שגיאות (${errors.length} חבילות)\n\n`;
        errors.forEach(({ package: pkg, issues: pkgIssues }) => {
            markdown += `### ${pkg}\n\n`;
            pkgIssues.filter(i => i.severity === 'error').forEach(issue => {
                markdown += `- **${issue.type}**: ${issue.message}\n`;
            });
            markdown += '\n';
        });
    }
    
    if (warnings.length > 0) {
        markdown += `## ⚠️ אזהרות (${warnings.length} חבילות)\n\n`;
        warnings.forEach(({ package: pkg, issues: pkgIssues }) => {
            markdown += `### ${pkg}\n\n`;
            pkgIssues.filter(i => i.severity === 'warning').forEach(issue => {
                markdown += `- **${issue.type}**: ${issue.message}\n`;
            });
            markdown += '\n';
        });
    }
}

markdown += '\n## פירוט כל חבילה:\n\n';
packages.forEach(pkg => {
    const hasIssues = issues.some(i => i.package === pkg.id);
    const status = hasIssues ? '⚠️' : '✅';
    
    markdown += `### ${status} ${pkg.id}\n\n`;
    markdown += `**סקריפטים:** ${pkg.scripts.length}\n\n`;
    
    if (pkg.scripts.length > 0) {
        // Sort by loadOrder (nulls last)
        const sorted = [...pkg.scripts].sort((a, b) => {
            if (a.loadOrder === null && b.loadOrder === null) return 0;
            if (a.loadOrder === null) return 1;
            if (b.loadOrder === null) return -1;
            return a.loadOrder - b.loadOrder;
        });
        
        markdown += '**רשימת סקריפטים:**\n';
        sorted.forEach((script, index) => {
            const fileName = script.file.split('/').pop();
            const orderStr = script.loadOrder !== null 
                ? `(loadOrder: ${script.loadOrder})` 
                : '(no loadOrder)';
            const position = index + 1;
            markdown += `${position}. ${fileName} ${orderStr}\n`;
        });
        markdown += '\n';
    }
    
    const pkgIssues = issues.find(i => i.package === pkg.id);
    if (pkgIssues) {
        markdown += '**בעיות:**\n';
        pkgIssues.issues.forEach(issue => {
            const icon = issue.severity === 'error' ? '❌' : '⚠️';
            markdown += `${icon} ${issue.type}: ${issue.message}\n`;
        });
        markdown += '\n';
    }
});

const reportPath = path.join(__dirname, '../documentation/05-REPORTS/PACKAGES_ORDER_CHECK.md');
fs.writeFileSync(reportPath, markdown);

console.log('# בדיקת סדר סקריפטים בתוך חבילות\n');
console.log(`**תאריך:** ${new Date().toISOString().split('T')[0]}\n`);

if (issues.length === 0) {
    console.log('✅ **כל החבילות מסודרות נכון!**\n');
} else {
    console.log(`⚠️ **נמצאו ${issues.length} חבילות עם בעיות:**\n`);
    issues.forEach(({ package: pkg, issues: pkgIssues }) => {
        console.log(`### ${pkg}`);
        pkgIssues.forEach(issue => {
            const icon = issue.severity === 'error' ? '❌' : '⚠️';
            console.log(`${icon} ${issue.type}: ${issue.message}`);
        });
        console.log('');
    });
}

console.log(`\n✅ דוח מפורט נשמר ב: ${reportPath}`);


