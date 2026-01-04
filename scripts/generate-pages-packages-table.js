#!/usr/bin/env node
/**
 * Generate Pages Packages Comparison Table
 * ========================================
 * 
 * יצירת טבלת השוואה של חבילות לכל עמודי המשתמש
 */

const fs = require('fs');
const path = require('path');

// User-facing pages
const USER_PAGES = {
    'index': 'Dashboard',
    'preferences': 'Preferences',
    'trades': 'Trades',
    'executions': 'Executions',
    'trade_plans': 'Trade Plans',
    'alerts': 'Alerts',
    'trading_accounts': 'Trading Accounts',
    'cash_flows': 'Cash Flows',
    'tickers': 'Tickers',
    'notes': 'Notes',
    'research': 'Research',
    'db_display': 'Database Display',
    'db_extradata': 'Database Extra Data'
};

// Read config file
const configPath = path.join(__dirname, '../trading-ui/scripts/page-initialization-configs.js');
const content = fs.readFileSync(configPath, 'utf8');

// Extract page configs
const pages = {};

Object.keys(USER_PAGES).forEach(pageKey => {
    // Find the page config block
    const pageStartPattern = new RegExp(`'${pageKey}'\\s*:\\s*\\{`);
    const match = content.match(pageStartPattern);
    
    if (!match) return;
    
    const startPos = match.index + match[0].length;
    
    // Find closing brace
    let braceCount = 1;
    let endPos = startPos;
    for (let i = startPos; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                endPos = i;
                break;
            }
        }
    }
    
    const pageConfig = content.substring(startPos, endPos);
    
    // Extract packages
    const packagesMatch = pageConfig.match(/packages:\s*\[([\s\S]*?)\]/);
    const packages = packagesMatch 
        ? packagesMatch[1]
            .split(',')
            .map(p => p.trim().replace(/['"]/g, ''))
            .filter(p => p)
        : [];
    
    // Extract name
    const nameMatch = pageConfig.match(/name:\s*['"]([^'"]+)['"]/);
    const name = nameMatch ? nameMatch[1] : USER_PAGES[pageKey];
    
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

// Generate markdown table
let markdown = '# השוואת חבילות לכל עמודי המשתמש - TikTrack\n\n';
markdown += '**תאריך יצירה:** ' + new Date().toLocaleDateString('he-IL') + '\n';
markdown += `**עמודים נבדקים:** ${Object.keys(USER_PAGES).length} עמודי משתמש\n\n`;
markdown += '---\n\n';

// Table header
markdown += '| עמוד | ' + sortedPackages.join(' | ') + ' | **סה"כ** |\n';
markdown += '|------|' + sortedPackages.map(() => ':---:|').join('') + ':---:|\n';

// Table rows
Object.keys(USER_PAGES).forEach(pageKey => {
    const page = pages[pageKey];
    const row = [page ? page.name : pageKey];
    
    sortedPackages.forEach(pkg => {
        row.push(page && page.packages.includes(pkg) ? '✅' : '');
    });
    
    row.push(page ? page.packages.length.toString() : '0');
    markdown += '| ' + row.join(' | ') + ' |\n';
});

markdown += '\n---\n\n';

// Summary
markdown += '## 📦 סיכום לפי חבילות\n\n';
markdown += '| חבילה | מספר עמודים | אחוז |\n';
markdown += '|--------|:-----------:|:----:|\n';

sortedPackages.forEach(pkg => {
    const pagesWithPackage = Object.keys(USER_PAGES).filter(pageKey => {
        const page = pages[pageKey];
        return page && page.packages.includes(pkg);
    });
    const percentage = Math.round((pagesWithPackage.length / Object.keys(USER_PAGES).length) * 100);
    markdown += `| **${pkg}** | ${pagesWithPackage.length} | ${percentage}% |\n`;
});

markdown += '\n---\n\n';

// Detailed list
markdown += '## 📋 חבילות מפורטות לכל עמוד\n\n';
Object.keys(USER_PAGES).forEach(pageKey => {
    const page = pages[pageKey];
    if (!page) {
        markdown += `### ${USER_PAGES[pageKey]}\n\n`;
        markdown += '⚠️ **לא נמצא ב-pageInitializationConfigs**\n\n';
        return;
    }
    
    markdown += `### ${page.name} (${page.packages.length} חבילות)\n\n`;
    markdown += page.packages.join(', ') + '\n\n';
});

markdown += '\n---\n\n';
markdown += '**נוצר:** ' + new Date().toISOString() + '\n';

// Output
console.log(markdown);

// Also save to file
const outputPath = path.join(__dirname, '../documentation/05-REPORTS/PAGES_PACKAGES_COMPARISON.md');
fs.writeFileSync(outputPath, markdown, 'utf8');
console.log('\n✅ טבלה נשמרה ב: ' + outputPath + '\n');


