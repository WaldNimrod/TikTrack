/**
 * Compare configurations for all 8 core pages
 * משווה את ההגדרות של כל 8 העמודים המרכזיים
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../trading-ui/scripts/page-initialization-configs.js');
const content = fs.readFileSync(CONFIG_PATH, 'utf8');

// 8 core pages
const CORE_PAGES = ['trades', 'executions', 'trade_plans', 'alerts', 'trading_accounts', 'cash_flows', 'tickers', 'notes'];

// Standard packages (without import which is only for executions)
const STANDARD_PACKAGES = ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'validation', 'entity-details', 'entity-services', 'info-summary', 'modules', 'init-system'];

// Standard required globals
const STANDARD_GLOBALS = ['NotificationSystem', 'DataUtils', 'window.Logger', 'window.CacheSyncManager'];

// Required metadata fields
const REQUIRED_METADATA = ['description', 'lastModified', 'pageType', 'preloadAssets', 'cacheStrategy'];

// Required flags
const REQUIRED_FLAGS = ['requiresFilters', 'requiresValidation', 'requiresTables'];

const pages = {};
const issues = [];
const differences = {
    packages: {},
    globals: {},
    metadata: {},
    flags: {}
};

// Extract page configurations
CORE_PAGES.forEach(pageName => {
    const pagePattern = new RegExp(`'${pageName}':\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'm');
    const match = content.match(pagePattern);
    
    if (!match) {
        issues.push({
            page: pageName,
            type: 'missing',
            message: `Page ${pageName} not found in PAGE_CONFIGS`
        });
        return;
    }
    
    const pageContent = match[1];
    
    // Extract packages
    const packagesMatch = pageContent.match(/packages:\s*\[(.*?)\]/s);
    const packages = packagesMatch 
        ? packagesMatch[1].split(',').map(p => p.trim().replace(/['"]/g, ''))
        : [];
    
    // Extract requiredGlobals
    const globalsMatch = pageContent.match(/requiredGlobals:\s*\[([\s\S]*?)\]/);
    const globals = globalsMatch 
        ? globalsMatch[1].split(',').map(g => g.trim().replace(/['"]/g, '').replace(/\/\/.*$/, '').trim()).filter(g => g.length > 0)
        : [];
    
    // Extract metadata
    const metadata = {};
    REQUIRED_METADATA.forEach(field => {
        // Try array format first (e.g., preloadAssets: ['trades-data'])
        const arrayMatch = pageContent.match(new RegExp(`${field}:\\s*\\[['"]([^'"]+)['"]\\]`, 'i'));
        if (arrayMatch) {
            metadata[field] = arrayMatch[1];
        } else {
            // Try string format (e.g., description: 'text')
            const stringMatch = pageContent.match(new RegExp(`${field}:\\s*['"]([^'"]+)['"]`, 'i'));
            if (stringMatch) {
                metadata[field] = stringMatch[1];
            }
        }
    });
    
    // Extract flags
    const flags = {};
    REQUIRED_FLAGS.forEach(flag => {
        const flagMatch = pageContent.match(new RegExp(`${flag}:\\s*(true|false)`, 'i'));
        if (flagMatch) {
            flags[flag] = flagMatch[1] === 'true';
        }
    });
    
    pages[pageName] = {
        packages,
        globals,
        metadata,
        flags
    };
});

// Compare packages
CORE_PAGES.forEach(page => {
    if (!pages[page]) return;
    
    const pagePackages = pages[page].packages.filter(p => p !== 'import'); // Remove import from executions for comparison
    
    // Check if all standard packages are present
    const missingPackages = STANDARD_PACKAGES.filter(p => !pagePackages.includes(p));
    const extraPackages = pagePackages.filter(p => !STANDARD_PACKAGES.includes(p) && p !== 'import');
    
    if (missingPackages.length > 0) {
        differences.packages[page] = {
            type: 'missing',
            packages: missingPackages
        };
        issues.push({
            page,
            type: 'missing_packages',
            message: `Missing packages: ${missingPackages.join(', ')}`,
            packages: missingPackages
        });
    }
    
    if (extraPackages.length > 0) {
        differences.packages[page] = {
            type: 'extra',
            packages: extraPackages,
            ...differences.packages[page]
        };
    }
    
    // Check package order
    const standardOrder = STANDARD_PACKAGES.map((p, idx) => ({ package: p, expectedIndex: idx }));
    const actualOrder = pagePackages.map((p, idx) => ({ package: p, actualIndex: idx }));
    
    let orderIssues = [];
    STANDARD_PACKAGES.forEach((stdPkg, expectedIdx) => {
        const actualIdx = pagePackages.indexOf(stdPkg);
        if (actualIdx !== -1 && actualIdx !== expectedIdx) {
            orderIssues.push({
                package: stdPkg,
                expected: expectedIdx,
                actual: actualIdx
            });
        }
    });
    
    if (orderIssues.length > 0) {
        differences.packages[page] = {
            ...differences.packages[page],
            orderIssues
        };
        issues.push({
            page,
            type: 'package_order',
            message: `Package order issues`,
            orderIssues
        });
    }
});

// Compare globals
CORE_PAGES.forEach(page => {
    if (!pages[page]) return;
    
    const pageGlobals = pages[page].globals.filter(g => !g.startsWith('window.load') && !g.startsWith('window.initialize') && !g.startsWith('window.check') && !g.startsWith('window.SelectPopulator') && !g.startsWith('window.tickerService') && !g.startsWith('window.openImport'));
    
    const missingGlobals = STANDARD_GLOBALS.filter(g => !pageGlobals.includes(g));
    
    if (missingGlobals.length > 0) {
        differences.globals[page] = {
            missing: missingGlobals
        };
        issues.push({
            page,
            type: 'missing_globals',
            message: `Missing standard globals: ${missingGlobals.join(', ')}`,
            globals: missingGlobals
        });
    }
});

// Compare metadata
CORE_PAGES.forEach(page => {
    if (!pages[page]) return;
    
    const missingMetadata = REQUIRED_METADATA.filter(field => !pages[page].metadata[field]);
    
    if (missingMetadata.length > 0) {
        differences.metadata[page] = {
            missing: missingMetadata
        };
        issues.push({
            page,
            type: 'missing_metadata',
            message: `Missing metadata fields: ${missingMetadata.join(', ')}`,
            fields: missingMetadata
        });
    }
});

// Compare flags
CORE_PAGES.forEach(page => {
    if (!pages[page]) return;
    
    const missingFlags = REQUIRED_FLAGS.filter(flag => pages[page].flags[flag] === undefined);
    
    if (missingFlags.length > 0) {
        differences.flags[page] = {
            missing: missingFlags
        };
        issues.push({
            page,
            type: 'missing_flags',
            message: `Missing flags: ${missingFlags.join(', ')}`,
            flags: missingFlags
        });
    }
});

// Generate report
let markdown = '# השוואת הגדרות - 8 העמודים המרכזיים\n\n';
markdown += `**תאריך:** ${new Date().toISOString().split('T')[0]}\n\n`;

if (issues.length === 0) {
    markdown += '✅ **כל ההגדרות אחידות ומדויקות!**\n\n';
} else {
    markdown += `⚠️ **נמצאו ${issues.length} בעיות:**\n\n`;
    
    // Group by type
    const byType = {};
    issues.forEach(issue => {
        if (!byType[issue.type]) {
            byType[issue.type] = [];
        }
        byType[issue.type].push(issue);
    });
    
    Object.keys(byType).forEach(type => {
        markdown += `## ${type}\n\n`;
        byType[type].forEach(issue => {
            markdown += `### ${issue.page}\n`;
            markdown += `- ${issue.message}\n\n`;
        });
    });
}

markdown += '\n## פירוט לפי עמוד:\n\n';
CORE_PAGES.forEach(page => {
    if (!pages[page]) {
        markdown += `### ❌ ${page}\n\n`;
        markdown += `**סטטוס:** לא נמצא בקובץ ההגדרות\n\n`;
        return;
    }
    
    const pageIssues = issues.filter(i => i.page === page);
    const status = pageIssues.length === 0 ? '✅' : '⚠️';
    
    markdown += `### ${status} ${page}\n\n`;
    
    // Packages
    const pagePackages = pages[page].packages;
    markdown += `**חבילות (${pagePackages.length}):** ${pagePackages.join(', ')}\n\n`;
    
    if (differences.packages[page]) {
        markdown += '**בעיות חבילות:**\n';
        if (differences.packages[page].missing) {
            markdown += `- חסרות: ${differences.packages[page].packages.join(', ')}\n`;
        }
        if (differences.packages[page].extra) {
            markdown += `- נוספות: ${differences.packages[page].packages.join(', ')}\n`;
        }
        if (differences.packages[page].orderIssues) {
            markdown += `- בעיות סדר: ${differences.packages[page].orderIssues.map(o => `${o.package} (צפוי: ${o.expected}, בפועל: ${o.actual})`).join(', ')}\n`;
        }
        markdown += '\n';
    }
    
    // Globals
    markdown += `**Required Globals (${pages[page].globals.length}):** ${pages[page].globals.join(', ')}\n\n`;
    if (differences.globals[page]) {
        markdown += `- חסרים: ${differences.globals[page].missing.join(', ')}\n\n`;
    }
    
    // Metadata
    markdown += '**Metadata:**\n';
    REQUIRED_METADATA.forEach(field => {
        const value = pages[page].metadata[field] || '(לא מוגדר)';
        markdown += `- ${field}: ${value}\n`;
    });
    markdown += '\n';
    
    // Flags
    markdown += '**Flags:**\n';
    REQUIRED_FLAGS.forEach(flag => {
        const value = pages[page].flags[flag] !== undefined ? pages[page].flags[flag] : '(לא מוגדר)';
        markdown += `- ${flag}: ${value}\n`;
    });
    markdown += '\n';
});

const reportPath = path.join(__dirname, '../documentation/05-REPORTS/CORE_PAGES_CONFIG_COMPARISON.md');
fs.writeFileSync(reportPath, markdown);

console.log('# השוואת הגדרות - 8 העמודים המרכזיים\n');
console.log(`**תאריך:** ${new Date().toISOString().split('T')[0]}\n`);

if (issues.length === 0) {
    console.log('✅ **כל ההגדרות אחידות ומדויקות!**\n');
} else {
    console.log(`⚠️ **נמצאו ${issues.length} בעיות:**\n`);
    issues.forEach(issue => {
        console.log(`- ${issue.page}: ${issue.message}`);
    });
}

console.log(`\n✅ דוח מפורט נשמר ב: ${reportPath}`);

