#!/usr/bin/env node
/**
 * Page Packages Comparison Tool V2
 * ================================
 * 
 * משווה את החבילות המוגדרות לכל עמודי המשתמש
 * ומציג טבלה מסודרת - גרסה משופרת
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

// Read the page-initialization-configs.js file
const configPath = path.join(__dirname, '../trading-ui/scripts/page-initialization-configs.js');
const configContent = fs.readFileSync(configPath, 'utf8');

// Simple extraction - find each page config manually
const pages = {};

// Extract pageInitializationConfigs section
const pageConfigsMatch = configContent.match(/const pageInitializationConfigs = \{([\s\S]*?)\}(?=\s*;|\s*const additionalPageInitializationConfigs)/);
const mainConfigText = pageConfigsMatch ? pageConfigsMatch[1] : '';

// Extract additionalPageInitializationConfigs section
const additionalMatch = configContent.match(/const additionalPageInitializationConfigs = \{([\s\S]*?)\};/);
const additionalConfigText = additionalMatch ? additionalMatch[1] : '';

const allConfigText = mainConfigText + (additionalConfigText ? ',' + additionalConfigText : '');

// For each user page, extract its config
USER_PAGES.forEach(pageKey => {
    // Try both 'page' and "page" patterns
    const patterns = [
        new RegExp(`'${pageKey}':\\s*\\{([\\s\\S]*?)(?=\\s*'[^']+'\\s*:|\\s*\\};|$)`, 'g'),
        new RegExp(`"${pageKey}":\\s*\\{([\\s\\S]*?)(?=\\s*"[^"]+"\\s*:|\\s*\\};|$)`, 'g')
    ];
    
    let pageConfigText = null;
    for (const pattern of patterns) {
        const match = allConfigText.match(pattern);
        if (match) {
            pageConfigText = match[1];
            break;
        }
    }
    
    if (!pageConfigText) {
        return; // Page not found
    }
    
    // Find closing brace
    let braceCount = 0;
    let configEnd = 0;
    for (let i = 0; i < pageConfigText.length; i++) {
        if (pageConfigText[i] === '{') braceCount++;
        if (pageConfigText[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                configEnd = i;
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
    
    // Extract name
    const nameMatch = pageConfigText.match(/name:\s*['"]([^'"]+)['"]/);
    const name = nameMatch ? nameMatch[1] : pageKey;
    
    pages[pageKey] = {
        name,
        packages
    };
});

// Get all unique packages
const allPackages = new Set();
Object.values(pages).forEach(page => {
    page.packages.forEach(pkg => allPackages.add(pkg));
});

const sortedPackages = Array.from(allPackages).sort();

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
        console.log(`| ${pageName} | ${'⚠️ לא נמצא ב-pageInitializationConfigs'.padEnd(sortedPackages.length * 5)} |`);
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
    
    console.log(`  ${pkg.padEnd(25)} - ${pagesWithPackage.length.toString().padStart(2)} עמודים (${percentage.toString().padStart(3)}%)`);
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


