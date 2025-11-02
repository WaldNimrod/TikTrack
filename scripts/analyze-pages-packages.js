#!/usr/bin/env node
/**
 * Page Packages Comparison Tool
 * =============================
 * 
 * משווה את החבילות המוגדרות לכל עמודי המשתמש
 * ומציג טבלה מסודרת
 */

const fs = require('fs');
const path = require('path');

// User-facing pages (not development tools)
const USER_PAGES = [
    'index',
    'preferences',
    'trades',
    'executions',
    'trade_plans',
    'alerts',
    'trading_accounts',
    'cash_flows',
    'tickers',
    'notes',
    'research',
    'db_display',
    'db_extradata'
];

// Map page names if needed
const PAGE_NAME_MAP = {
    'notes': 'Notes',
    'research': 'Research',
    'db_display': 'Database Display',
    'db_extradata': 'Database Extra Data'
};

// Read the page-initialization-configs.js file
const configPath = path.join(__dirname, '../trading-ui/scripts/page-initialization-configs.js');
const configContent = fs.readFileSync(configPath, 'utf8');

// Parse PAGE_CONFIGS - find the main object (before ADDITIONAL_PAGE_CONFIGS or closing brace)
// Find the opening of PAGE_CONFIGS
const pageConfigsStart = configContent.indexOf('const PAGE_CONFIGS = {');
if (pageConfigsStart === -1) {
    console.error('❌ Could not find PAGE_CONFIGS');
    process.exit(1);
}

// Find where PAGE_CONFIGS ends (before ADDITIONAL_PAGE_CONFIGS or closing brace)
const additionalStart = configContent.indexOf('const ADDITIONAL_PAGE_CONFIGS');
let pageConfigsEnd;
if (additionalStart !== -1) {
    // Find the closing brace before ADDITIONAL
    let braceCount = 0;
    let foundOpen = false;
    for (let i = pageConfigsStart + 'const PAGE_CONFIGS = {'.length; i < additionalStart; i++) {
        if (configContent[i] === '{') {
            braceCount++;
            foundOpen = true;
        }
        if (configContent[i] === '}') {
            braceCount--;
            if (braceCount === 0 && foundOpen) {
                pageConfigsEnd = i;
                break;
            }
        }
    }
} else {
    // No ADDITIONAL, find the closing brace
    let braceCount = 0;
    let foundOpen = false;
    for (let i = pageConfigsStart + 'const PAGE_CONFIGS = {'.length; i < configContent.length; i++) {
        if (configContent[i] === '{') {
            braceCount++;
            foundOpen = true;
        }
        if (configContent[i] === '}') {
            braceCount--;
            if (braceCount === 0 && foundOpen) {
                pageConfigsEnd = i;
                break;
            }
        }
    }
}

let pageConfigsText = configContent.substring(pageConfigsStart + 'const PAGE_CONFIGS = {'.length, pageConfigsEnd || configContent.length);

// Also parse ADDITIONAL_PAGE_CONFIGS if exists
const additionalMatch = configContent.match(/const ADDITIONAL_PAGE_CONFIGS = \{([\s\S]*?)\};/);
if (additionalMatch) {
    pageConfigsText += ',' + additionalMatch[1];
}

// Extract page configurations - parse manually
const pages = {};
// Find all page entries - use a more robust pattern that handles both quoted keys
const pagePattern = /['"](\w+)['"]\s*:\s*\{/g;
let match;
const allMatches = [];
let lastIndex = 0;

while ((match = pagePattern.exec(pageConfigsText)) !== null) {
    allMatches.push({
        name: match[1],
        startPos: match.index,
        startMatch: match[0]
    });
    lastIndex = match.index + match[0].length;
}

// For each page, extract its config
allMatches.forEach((matchInfo, idx) => {
    const pageName = matchInfo.name;
    const startPos = matchInfo.startPos;
    const endPos = idx < allMatches.length - 1 ? allMatches[idx + 1].startPos : pageConfigsText.length;
    let pageConfigText = pageConfigsText.substring(startPos, endPos);
    
    // Find the closing brace for this page config
    let braceCount = 0;
    let configEnd = 0;
    for (let i = 0; i < pageConfigText.length; i++) {
        if (pageConfigText[i] === '{') braceCount++;
        if (pageConfigText[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                configEnd = i + 1;
                break;
            }
        }
    }
    pageConfigText = pageConfigText.substring(0, configEnd);
    
    // Extract packages
    const packagesMatch = pageConfigText.match(/packages:\s*\[([\s\S]*?)\]/);
    const packages = packagesMatch 
        ? packagesMatch[1]
            .split(',')
            .map(p => p.trim().replace(/['"]/g, ''))
            .filter(p => p)
        : [];
    
    // Extract requiredGlobals
    const globalsMatch = pageConfigText.match(/requiredGlobals:\s*\[([\s\S]*?)\]/);
    const globals = globalsMatch
        ? globalsMatch[1]
            .split(',')
            .map(g => g.trim().replace(/['"]/g, ''))
            .filter(g => g && !g.includes('window.'))
            .map(g => g.replace(/^window\./, ''))
        : [];
    
    // Extract name
    const nameMatch = pageConfigText.match(/name:\s*['"]([^'"]+)['"]/);
    const name = nameMatch ? nameMatch[1] : (PAGE_NAME_MAP[pageName] || pageName);
    
    pages[pageName] = {
        name,
        packages,
        globals
    };
});

// Get all unique packages
const allPackages = new Set();
Object.values(pages).forEach(page => {
    page.packages.forEach(pkg => allPackages.add(pkg));
});

const sortedPackages = Array.from(allPackages).sort();

// Read package-manifest.js to get package descriptions
const manifestPath = path.join(__dirname, '../trading-ui/scripts/init-system/package-manifest.js');
let packageDescriptions = {};
try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const pkgRegex = /['"](\w+)['"]:\s*\{([\s\S]*?)(?=['"]\w+['"]:\s*\{|};)/g;
    let pkgMatch;
    while ((pkgMatch = pkgRegex.exec(manifestContent)) !== null) {
        const pkgName = pkgMatch[1];
        const pkgConfig = pkgMatch[2];
        const descMatch = pkgConfig.match(/description:\s*['"]([^'"]+)['"]/);
        if (descMatch) {
            packageDescriptions[pkgName] = descMatch[1];
        }
    }
} catch (e) {
    console.warn('⚠️ Could not read package-manifest.js for descriptions');
}

// Generate table
console.log('\n' + '='.repeat(120));
console.log('📊 השוואת חבילות לכל עמודי המשתמש');
console.log('='.repeat(120));
console.log(`\nסה"כ עמודים: ${USER_PAGES.length}`);
console.log(`סה"כ חבילות: ${sortedPackages.length}\n`);

// Create header
const header = ['עמוד', ...sortedPackages, 'סה"כ'];
const headerLine = '| ' + header.join(' | ') + ' |';
const separator = '|' + header.map(() => '---').join('|') + '|';

console.log(headerLine);
console.log(separator);

// Create rows
USER_PAGES.forEach(pageName => {
    const page = pages[pageName];
    if (!page) {
        console.log(`| ${pageName} | ${'⚠️ לא נמצא ב-PAGE_CONFIGS'.padEnd(120)} |`);
        return;
    }
    
    const row = [page.name || pageName];
    let totalPackages = 0;
    
    sortedPackages.forEach(pkg => {
        const hasPackage = page.packages.includes(pkg);
        row.push(hasPackage ? '✅' : '');
        if (hasPackage) totalPackages++;
    });
    
    row.push(totalPackages.toString());
    
    console.log('| ' + row.join(' | ') + ' |');
});

console.log('\n' + '='.repeat(120));

// Summary by package
console.log('\n📦 סיכום לפי חבילות:\n');
sortedPackages.forEach(pkg => {
    const pagesWithPackage = USER_PAGES.filter(pageName => {
        const page = pages[pageName];
        return page && page.packages.includes(pkg);
    });
    
    const percentage = Math.round((pagesWithPackage.length / USER_PAGES.length) * 100);
    const desc = packageDescriptions[pkg] || '';
    
    console.log(`  ${pkg.padEnd(25)} - ${pagesWithPackage.length.toString().padStart(2)} עמודים (${percentage.toString().padStart(3)}%) ${desc ? `- ${desc}` : ''}`);
});

console.log('\n' + '='.repeat(120));

// Detailed packages per page
console.log('\n📋 חבילות מפורטות לכל עמוד:\n');
USER_PAGES.forEach(pageName => {
    const page = pages[pageName];
    if (!page) {
        console.log(`  ${pageName}: ⚠️ לא נמצא`);
        return;
    }
    
    console.log(`  ${page.name || pageName} (${page.packages.length} חבילות):`);
    console.log(`    ${page.packages.join(', ')}`);
});

console.log('\n' + '='.repeat(120) + '\n');

