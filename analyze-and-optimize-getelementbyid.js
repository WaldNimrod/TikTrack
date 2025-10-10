#!/usr/bin/env node

/**
 * סקריפט ניתוח וייעול getElementById
 * מזהה דפוסים ומציע אופטימיזציות
 */

const fs = require('fs');
const path = require('path');

// קבצים לניתוח
const files = [
  'trading-ui/scripts/trades.js',
  'trading-ui/scripts/tickers.js',
  'trading-ui/scripts/notes.js',
  'trading-ui/scripts/executions.js',
  'trading-ui/scripts/alerts.js',
  'trading-ui/scripts/trade_plans.js'
];

// דפוסים נפוצים
const patterns = {
  modal: /document\.getElementById\(['"](\w*[Mm]odal\w*)['"]\)/g,
  form: /document\.getElementById\(['"](\w*[Ff]orm\w*)['"]\)/g,
  select: /document\.getElementById\(['"](\w*[Ss]elect\w*)['"]\)/g,
  input: /document\.getElementById\(['"](\w*Input\w*|\w*Date\w*|\w*Time\w*)['"]\)/g,
  button: /document\.getElementById\(['"](\w*[Bb]tn\w*|\w*[Bb]utton\w*)['"]\)/g,
};

// פונקציה לניתוח קובץ
function analyzeFile(filePath) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📄 מנתח: ${filePath}`);
  console.log('='.repeat(80));
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // ספירת כל ה-getElementById
  const allMatches = content.match(/document\.getElementById/g) || [];
  console.log(`\n📊 סה"כ קריאות getElementById: ${allMatches.length}`);
  
  // מפה של אלמנטים ייחודיים
  const uniqueElements = new Map();
  
  // ניתוח לפי דפוסים
  console.log('\n🔍 ניתוח דפוסים:');
  for (const [type, pattern] of Object.entries(patterns)) {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      console.log(`\n  ${type.toUpperCase()} (${matches.length} מופעים):`);
      const elements = new Set();
      matches.forEach(m => {
        elements.add(m[1]);
        uniqueElements.set(m[1], (uniqueElements.get(m[1]) || 0) + 1);
      });
      elements.forEach(el => {
        const count = uniqueElements.get(el);
        console.log(`    - ${el} (${count}x)`);
      });
    }
  }
  
  // רשימת אלמנטים שחוזרים הכי הרבה
  console.log('\n🎯 Top 10 אלמנטים חוזרים:');
  const sorted = [...uniqueElements.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  sorted.forEach(([el, count], i) => {
    console.log(`  ${i + 1}. ${el}: ${count} פעמים`);
  });
  
  // הצעת Global Cache
  console.log('\n💡 הצעה ל-Global Element Cache:');
  console.log('\n```javascript');
  console.log('// ===== Global Element Cache =====');
  
  const cacheVars = [];
  sorted.forEach(([el]) => {
    const varName = el.replace(/[A-Z]/g, letter => letter.toLowerCase())
                       .replace(/-/g, '')
                       .replace(/^(.)/, (_, c) => c.toLowerCase());
    console.log(`let ${varName}Element = null;`);
    cacheVars.push({ id: el, varName: varName + 'Element' });
  });
  
  console.log('\n// Initialize on DOM ready');
  console.log('document.addEventListener(\'DOMContentLoaded\', () => {');
  cacheVars.forEach(({ id, varName }) => {
    console.log(`  ${varName} = document.getElementById('${id}');`);
  });
  console.log('});');
  console.log('```');
  
  // ניתוח לפי סוג פעולה
  console.log('\n📋 ניתוח לפי פעולה:');
  
  // .show() / .hide()
  const modalOps = content.match(/bootstrap\.Modal\.(getInstance|new bootstrap\.Modal)/g);
  if (modalOps) {
    console.log(`  - פעולות Modal: ${modalOps.length}`);
  }
  
  // .value
  const valueOps = content.match(/document\.getElementById[^;]+\.value/g);
  if (valueOps) {
    console.log(`  - קריאת/כתיבת .value: ${valueOps.length}`);
  }
  
  // .innerHTML
  const htmlOps = content.match(/document\.getElementById[^;]+\.innerHTML/g);
  if (htmlOps) {
    console.log(`  - שינוי .innerHTML: ${htmlOps.length}`);
  }
  
  // פוטנציאל חיסכון
  const potentialSavings = allMatches.length - uniqueElements.size;
  const savingsPercent = ((potentialSavings / allMatches.length) * 100).toFixed(1);
  
  console.log('\n💰 פוטנציאל חיסכון:');
  console.log(`  - אלמנטים ייחודיים: ${uniqueElements.size}`);
  console.log(`  - קריאות נוכחיות: ${allMatches.length}`);
  console.log(`  - חיסכון פוטנציאלי: ${potentialSavings} קריאות (${savingsPercent}%)`);
  
  return {
    file: filePath,
    total: allMatches.length,
    unique: uniqueElements.size,
    savings: potentialSavings,
    elements: sorted
  };
}

// ריצה על כל הקבצים
console.log('\n🚀 מתחיל ניתוח...\n');

const results = files.map(file => {
  try {
    return analyzeFile(file);
  } catch (error) {
    console.error(`❌ שגיאה בקובץ ${file}:`, error.message);
    return null;
  }
}).filter(Boolean);

// סיכום כללי
console.log('\n' + '='.repeat(80));
console.log('📊 סיכום כללי');
console.log('='.repeat(80));

const totalCalls = results.reduce((sum, r) => sum + r.total, 0);
const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);
const savingsPercent = ((totalSavings / totalCalls) * 100).toFixed(1);

console.log(`\n📈 סטטיסטיקות:`);
console.log(`  - סה"כ קבצים: ${results.length}`);
console.log(`  - סה"כ קריאות getElementById: ${totalCalls}`);
console.log(`  - פוטנציאל חיסכון כולל: ${totalSavings} (${savingsPercent}%)`);

console.log('\n📋 לפי קובץ:');
results.forEach(r => {
  const percent = ((r.savings / r.total) * 100).toFixed(1);
  console.log(`  - ${path.basename(r.file)}: ${r.total} → ${r.unique} (${percent}% חיסכון)`);
});

console.log('\n✅ ניתוח הושלם!\n');
console.log('💡 המלצה: השתמש בתוצאות כדי ליצור Global Element Cache בכל קובץ\n');

