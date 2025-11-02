/**
 * Script to check loadOrder within packages
 * בודק את הסדר של הסקריפטים בתוך כל חבילה
 */

const fs = require('fs');
const path = require('path');

const PACKAGE_MANIFEST_PATH = path.join(__dirname, '../trading-ui/scripts/init-system/package-manifest.js');

// Read the file
const content = fs.readFileSync(PACKAGE_MANIFEST_PATH, 'utf8');

// Extract package definitions
const packageMatches = content.matchAll(/\/\/\s*\d+\.\s*([A-Z-]+)\s*PACKAGE[\s\S]*?'(\w+)':\s*\{[\s\S]*?scripts:\s*\[([\s\S]*?)\],/g);

const issues = [];
const report = [];

// Parse each package
for (const match of packageMatches) {
    const packageName = match[2];
    const scriptsSection = match[3];
    
    // Extract all scripts with their loadOrder
    const scriptMatches = scriptsSection.matchAll(/\{\s*file:\s*['"]([^'"]+)['"][\s\S]*?(?:loadOrder:\s*(\d+))?/g);
    
    const scripts = [];
    for (const scriptMatch of scriptMatches) {
        const file = scriptMatch[1];
        const loadOrder = scriptMatch[2] ? parseInt(scriptMatch[2]) : null;
        scripts.push({ file, loadOrder });
    }
    
    // Check for issues
    const packageIssues = [];
    
    // Check if all scripts have loadOrder
    const scriptsWithoutOrder = scripts.filter(s => s.loadOrder === null);
    if (scriptsWithoutOrder.length > 0 && scripts.length > 1) {
        packageIssues.push({
            type: 'missing_loadorder',
            message: `${scriptsWithoutOrder.length} scripts without loadOrder: ${scriptsWithoutOrder.map(s => s.file).join(', ')}`,
            scripts: scriptsWithoutOrder.map(s => s.file)
        });
    }
    
    // Check if loadOrders are sequential
    const scriptsWithOrder = scripts.filter(s => s.loadOrder !== null).sort((a, b) => a.loadOrder - b.loadOrder);
    if (scriptsWithOrder.length > 1) {
        for (let i = 1; i < scriptsWithOrder.length; i++) {
            if (scriptsWithOrder[i].loadOrder !== scriptsWithOrder[i-1].loadOrder + 1) {
                packageIssues.push({
                    type: 'non_sequential',
                    message: `Non-sequential loadOrder: ${scriptsWithOrder[i-1].file} (${scriptsWithOrder[i-1].loadOrder}) -> ${scriptsWithOrder[i].file} (${scriptsWithOrder[i].loadOrder})`,
                    expected: scriptsWithOrder[i-1].loadOrder + 1,
                    actual: scriptsWithOrder[i].loadOrder
                });
            }
        }
    }
    
    // Check for duplicates
    const loadOrders = scriptsWithOrder.map(s => s.loadOrder);
    const duplicates = loadOrders.filter((order, index) => loadOrders.indexOf(order) !== index);
    if (duplicates.length > 0) {
        packageIssues.push({
            type: 'duplicate_loadorder',
            message: `Duplicate loadOrders: ${duplicates.join(', ')}`,
            duplicates
        });
    }
    
    report.push({
        package: packageName,
        totalScripts: scripts.length,
        scriptsWithOrder: scriptsWithOrder.length,
        scriptsWithoutOrder: scriptsWithoutOrder.length,
        issues: packageIssues,
        scripts: scripts.map(s => ({
            file: s.file.split('/').pop(),
            loadOrder: s.loadOrder
        }))
    });
    
    if (packageIssues.length > 0) {
        issues.push({
            package: packageName,
            issues: packageIssues
        });
    }
}

// Generate report
console.log('# בדיקת סדר סקריפטים בתוך חבילות\n');
console.log(`**תאריך:** ${new Date().toISOString().split('T')[0]}\n`);

if (issues.length === 0) {
    console.log('✅ **כל החבילות מסודרות נכון!**\n');
} else {
    console.log(`⚠️ **נמצאו ${issues.length} חבילות עם בעיות:**\n`);
    issues.forEach(({ package: pkg, issues: pkgIssues }) => {
        console.log(`## ${pkg}\n`);
        pkgIssues.forEach(issue => {
            console.log(`- **${issue.type}**: ${issue.message}`);
        });
        console.log('');
    });
}

console.log('\n## סיכום לפי חבילה:\n');
report.forEach(({ package: pkg, totalScripts, scriptsWithOrder, scriptsWithoutOrder, issues: pkgIssues, scripts }) => {
    const status = pkgIssues.length === 0 ? '✅' : '⚠️';
    console.log(`${status} **${pkg}**: ${totalScripts} scripts, ${scriptsWithOrder} עם loadOrder, ${scriptsWithoutOrder} בלי`);
    if (scripts.length > 1) {
        console.log('  Scripts:');
        scripts.forEach(({ file, loadOrder }) => {
            const orderStr = loadOrder !== null ? `(order: ${loadOrder})` : '(no order)';
            console.log(`    - ${file} ${orderStr}`);
        });
    }
    console.log('');
});

// Save detailed report
const reportPath = path.join(__dirname, '../documentation/05-REPORTS/PACKAGES_ORDER_CHECK.md');
let markdown = '# בדיקת סדר סקריפטים בתוך חבילות\n\n';
markdown += `**תאריך:** ${new Date().toISOString().split('T')[0]}\n\n`;

if (issues.length === 0) {
    markdown += '✅ **כל החבילות מסודרות נכון!**\n\n';
} else {
    markdown += `⚠️ **נמצאו ${issues.length} חבילות עם בעיות:**\n\n`;
    issues.forEach(({ package: pkg, issues: pkgIssues }) => {
        markdown += `## ${pkg}\n\n`;
        pkgIssues.forEach(issue => {
            markdown += `- **${issue.type}**: ${issue.message}\n`;
        });
        markdown += '\n';
    });
}

markdown += '\n## פירוט כל חבילה:\n\n';
report.forEach(({ package: pkg, totalScripts, scriptsWithOrder, scriptsWithoutOrder, issues: pkgIssues, scripts }) => {
    const status = pkgIssues.length === 0 ? '✅' : '⚠️';
    markdown += `### ${status} ${pkg}\n\n`;
    markdown += `- **סקריפטים:** ${totalScripts}\n`;
    markdown += `- **עם loadOrder:** ${scriptsWithOrder}\n`;
    markdown += `- **בלי loadOrder:** ${scriptsWithoutOrder}\n`;
    
    if (scripts.length > 0) {
        markdown += '\n**רשימת סקריפטים:**\n';
        scripts.forEach(({ file, loadOrder }) => {
            const orderStr = loadOrder !== null ? `(order: ${loadOrder})` : '(no order)';
            markdown += `- ${file} ${orderStr}\n`;
        });
    }
    
    if (pkgIssues.length > 0) {
        markdown += '\n**בעיות:**\n';
        pkgIssues.forEach(issue => {
            markdown += `- ${issue.type}: ${issue.message}\n`;
        });
    }
    
    markdown += '\n';
});

fs.writeFileSync(reportPath, markdown);
console.log(`\n✅ דוח מפורט נשמר ב: ${reportPath}`);


