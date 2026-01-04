/**
 * Test Script Generator - בדיקת הכלי לייצור קוד טעינה
 * 
 * בודק את הכלי עבור מגוון עמודים וחבילות
 */

const fs = require('fs');
const path = require('path');

// Load package manifest
const manifestPath = path.join(__dirname, '../trading-ui/scripts/init-system/package-manifest.js');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');

// Simple eval to get PACKAGE_MANIFEST
eval(manifestContent.replace('const PACKAGE_MANIFEST =', 'var PACKAGE_MANIFEST ='));

// Load page configs
const configsPath = path.join(__dirname, '../trading-ui/scripts/page-initialization-configs.js');
const configsContent = fs.readFileSync(configsPath, 'utf8');

// Extract pageInitializationConfigs using regex
const configsMatch = configsContent.match(/const pageInitializationConfigs = \{([\s\S]*?)\};/);
if (!configsMatch) {
    console.error('❌ Could not find pageInitializationConfigs');
    process.exit(1);
}

// Pages to test
const TEST_PAGES = ['trades', 'executions', 'alerts', 'trade_plans', 'trading_accounts', 'cash_flows', 'tickers', 'notes'];

// Simulate window.PACKAGE_MANIFEST and window.pageInitializationConfigs
global.window = { PACKAGE_MANIFEST, pageInitializationConfigs: {} };

// Parse pageInitializationConfigs (simplified - just extract packages)
const pagesToTest = {};

TEST_PAGES.forEach(pageName => {
    const pageRegex = new RegExp(`'${pageName}':\\s*\\{([\\s\\S]*?)\\}(?=\\s*(?:,|'|\\}))`, 'g');
    const match = configsContent.match(pageRegex);
    if (match) {
        const packagesMatch = match[0].match(/packages:\s*\[(.*?)\]/s);
        if (packagesMatch) {
            const packagesStr = packagesMatch[1];
            const packages = packagesStr.match(/'([^']+)'/g)?.map(p => p.replace(/'/g, '')) || [];
            pagesToTest[pageName] = packages;
        }
    }
});

console.log('📋 Pages to test:', Object.keys(pagesToTest));
console.log('📦 Package Manifest has', Object.keys(PACKAGE_MANIFEST).length, 'packages');

// Test generator logic (from page-template-generator.js)
function generateCompleteScriptSection(pageName, packages) {
    let html = '';
    let scriptCounter = 0;
    
    // Header with clear markers
    html += '    <!-- ===== START SCRIPT LOADING ORDER ===== -->\n';
    html += '    <!-- ⚠️ DO NOT MODIFY MANUALLY - Use PageTemplateGenerator.generateScriptTagsForPage() -->\n';
    html += `    <!-- 🎯 Page: ${pageName} | Generated: ${new Date().toISOString()} -->\n`;
    html += `    <!-- 📦 Packages: ${packages.join(', ')} -->\n\n`;
    
    if (PACKAGE_MANIFEST) {
        const sortedPackages = packages
            .map(pkgName => PACKAGE_MANIFEST[pkgName])
            .filter(pkg => pkg)
            .sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0));
        
        sortedPackages.forEach((pkg, pkgIndex) => {
            // Package header
            html += `    <!-- ===== PACKAGE ${pkgIndex + 1}: ${pkg.name.toUpperCase()} (loadOrder: ${pkg.loadOrder}) ===== -->\n`;
            html += `    <!-- ${pkg.description} -->\n`;
            html += `    <!-- Dependencies: ${pkg.dependencies ? pkg.dependencies.join(', ') : 'none'} -->\n`;
            html += `    <!-- Critical: ${pkg.critical ? 'YES' : 'NO'} | Version: ${pkg.version} -->\n`;
            
            // Sort scripts within package by loadOrder
            const sortedScripts = pkg.scripts
                .filter(script => script.required !== false)
                .sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0));
            
            sortedScripts.forEach((script, scriptIndex) => {
                scriptCounter++;
                html += `    <script src="scripts/${script.file}?v=1.0.0"></script> <!-- [${scriptCounter}] ${script.description} -->\n`;
            });
            html += '\n';
        });
        
        // Footer with clear markers
        html += '    <!-- ===== END SCRIPT LOADING ORDER ===== -->\n';
        html += `    <!-- 🔧 Total Scripts: ${scriptCounter} | For maintenance: Use PageTemplateGenerator.generateScriptTagsForPage("${pageName}") -->\n`;
    } else {
        html += '    <!-- ⚠️ PACKAGE_MANIFEST not available -->\n';
    }
    
    return { html, scriptCount: scriptCounter };
}

// Test all pages
const results = {};

TEST_PAGES.forEach(pageName => {
    const packages = pagesToTest[pageName];
    if (!packages || packages.length === 0) {
        console.log(`⚠️ No packages found for ${pageName}`);
        return;
    }
    
    const result = generateCompleteScriptSection(pageName, packages);
    results[pageName] = {
        packages: packages.length,
        scripts: result.scriptCount,
        html: result.html
    };
    
    console.log(`✅ ${pageName}: ${packages.length} packages, ${result.scriptCount} scripts`);
});

// Generate report
const reportPath = path.join(__dirname, '../documentation/05-REPORTS/SCRIPT_GENERATOR_TEST_REPORT.md');
let report = `# דוח בדיקת כלי ייצור קוד טעינה

**תאריך:** ${new Date().toLocaleDateString('he-IL')}

## סיכום

נבדקו ${TEST_PAGES.length} עמודים:

`;

TEST_PAGES.forEach(pageName => {
    const r = results[pageName];
    if (r) {
        report += `- **${pageName}**: ${r.packages} חבילות, ${r.scripts} סקריפטים\n`;
    }
});

report += `\n## דוגמאות קוד מיוצר\n\n`;

// Show sample for first page
const firstPage = TEST_PAGES[0];
if (results[firstPage]) {
    report += `### ${firstPage}\n\n\`\`\`html\n${results[firstPage].html}\`\`\`\n\n`;
}

fs.writeFileSync(reportPath, report, 'utf8');
console.log(`\n✅ Report saved to: ${reportPath}`);


