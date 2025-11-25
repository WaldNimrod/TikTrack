/**
 * Page Packages Analyzer
 * ניתוח חבילות לכל עמוד
 */

const fs = require('fs');
const path = require('path');

const configsPath = path.join(__dirname, 'page-initialization-configs.js');
const content = fs.readFileSync(configsPath, 'utf8');

// Extract all page configurations
const pages = {};
const pageRegex = /([a-z_]+):\s*\{[\s\S]*?packages:\s*\[([^\]]+)\]/g;
let match;

while ((match = pageRegex.exec(content)) !== null) {
  const pageName = match[1];
  const packagesStr = match[2];
  const packages = packagesStr.split(',').map(p => p.trim().replace(/['\"]/g, '')).filter(p => p.length > 0);
  pages[pageName] = packages;
}

console.log('='.repeat(80));
console.log('ניתוח חבילות לכל עמוד');
console.log('='.repeat(80));
console.log(`\nסה"כ עמודים: ${Object.keys(pages).length}\n`);

// 1. List all pages with their packages
console.log('1. רשימת כל העמודים וחבילותיהם:');
console.log('-'.repeat(80));
Object.keys(pages).sort().forEach(page => {
  console.log(`${page.padEnd(25)}: [${pages[page].join(', ')}]`);
});

// 2. Package frequency
console.log('\n2. תדירות חבילות (כמה עמודים משתמשים בכל חבילה):');
console.log('-'.repeat(80));
const packageCount = {};
Object.values(pages).forEach(pkgs => {
  pkgs.forEach(pkg => {
    packageCount[pkg] = (packageCount[pkg] || 0) + 1;
  });
});

Object.entries(packageCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([pkg, count]) => {
    const percentage = ((count / Object.keys(pages).length) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(percentage / 5));
    console.log(`${pkg.padEnd(25)}: ${count.toString().padStart(2)} עמודים (${percentage.padStart(5)}%) ${bar}`);
  });

// 3. Common patterns
console.log('\n3. דפוסי חבילות נפוצים:');
console.log('-'.repeat(80));
const patterns = {};
Object.entries(pages).forEach(([page, pkgs]) => {
  const key = pkgs.sort().join(',');
  if (!patterns[key]) {
    patterns[key] = [];
  }
  patterns[key].push(page);
});

const sortedPatterns = Object.entries(patterns)
  .sort((a, b) => b[1].length - a[1].length);

sortedPatterns.forEach(([pattern, pageList]) => {
  console.log(`\nדפוס (${pageList.length} עמודים):`);
  console.log(`  חבילות: [${pattern.split(',').join(', ')}]`);
  console.log(`  עמודים: ${pageList.join(', ')}`);
});

// 4. Standard packages (appear in most pages)
console.log('\n4. חבילות סטנדרטיות (מופיעות ברוב העמודים):');
console.log('-'.repeat(80));
const standardThreshold = Object.keys(pages).length * 0.8; // 80% of pages
const standardPackages = Object.entries(packageCount)
  .filter(([pkg, count]) => count >= standardThreshold)
  .map(([pkg]) => pkg);

if (standardPackages.length > 0) {
  console.log(`חבילות סטנדרטיות (מופיעות ב-${Math.ceil(standardThreshold)}+ עמודים):`);
  standardPackages.forEach(pkg => {
    console.log(`  ✅ ${pkg} (${packageCount[pkg]} עמודים)`);
  });
} else {
  console.log('לא נמצאו חבילות סטנדרטיות (80%+ מהעמודים)');
}

// 5. Page types analysis
console.log('\n5. ניתוח לפי סוגי עמודים:');
console.log('-'.repeat(80));

const pageTypes = {
  'crud': ['trades', 'executions', 'trade_plans', 'alerts', 'trading_accounts', 'cash_flows', 'tickers', 'notes'],
  'system': ['preferences', 'system-management', 'cache-management', 'background-tasks'],
  'dev': ['init-system-management', 'external-data-dashboard', 'conditions-test'],
  'dashboard': ['index'],
  'other': []
};

// Categorize pages
const categorized = {};
Object.keys(pages).forEach(page => {
  let found = false;
  for (const [type, pageList] of Object.entries(pageTypes)) {
    if (pageList.includes(page)) {
      if (!categorized[type]) categorized[type] = [];
      categorized[type].push(page);
      found = true;
      break;
    }
  }
  if (!found) {
    if (!categorized['other']) categorized['other'] = [];
    categorized['other'].push(page);
  }
});

Object.entries(categorized).forEach(([type, pageList]) => {
  console.log(`\n${type.toUpperCase()} (${pageList.length} עמודים):`);
  
  // Find common packages for this type
  const typePackages = {};
  pageList.forEach(page => {
    pages[page].forEach(pkg => {
      typePackages[pkg] = (typePackages[pkg] || 0) + 1;
    });
  });
  
  const commonPackages = Object.entries(typePackages)
    .filter(([pkg, count]) => count === pageList.length) // Appears in all pages of this type
    .map(([pkg]) => pkg);
  
  if (commonPackages.length > 0) {
    console.log(`  חבילות משותפות (כל העמודים): [${commonPackages.join(', ')}]`);
  }
  
  pageList.forEach(page => {
    const uniquePackages = pages[page].filter(pkg => !commonPackages.includes(pkg));
    if (uniquePackages.length > 0) {
      console.log(`  ${page}: +[${uniquePackages.join(', ')}]`);
    }
  });
});

// 6. Missing standard packages
console.log('\n6. עמודים שחסרות להם חבילות סטנדרטיות:');
console.log('-'.repeat(80));
const mandatoryPackages = ['base', 'init-system'];
Object.keys(pages).forEach(page => {
  const missing = mandatoryPackages.filter(pkg => !pages[page].includes(pkg));
  if (missing.length > 0) {
    console.log(`  ❌ ${page}: חסרות [${missing.join(', ')}]`);
  }
});

// 7. Summary
console.log('\n' + '='.repeat(80));
console.log('סיכום:');
console.log('='.repeat(80));
console.log(`✅ עמודים: ${Object.keys(pages).length}`);
console.log(`✅ חבילות ייחודיות: ${Object.keys(packageCount).length}`);
console.log(`✅ דפוסים שונים: ${sortedPatterns.length}`);
console.log(`✅ חבילות סטנדרטיות: ${standardPackages.length}`);

