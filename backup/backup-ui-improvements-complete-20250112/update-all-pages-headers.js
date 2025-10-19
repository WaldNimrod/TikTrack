/**
 * סקריפט לעדכון כל העמודים עם _page-headers.css
 * Script to update all pages with _page-headers.css
 */

console.log('%c🔧 מתחיל עדכון כל העמודים עם _page-headers.css...', 'font-size: 16px; font-weight: bold; color: #3498db;');

// רשימת עמודים עם ישויות (צריכים צבעי ישות)
const entityPages = [
    'trade_plans.html',
    'trades.html', 
    'alerts.html',
    'notes.html',
    'trading_accounts.html',
    'tickers.html',
    'executions.html', // כבר עודכן
    'cash_flows.html'
];

// רשימת עמודי כלי פיתוח (צריכים רקע לבן)
const developmentPages = [
    'cache-test.html', // כבר עודכן
    'system-management.html', // כבר עודכן
    'notifications-center.html',
    'background-tasks.html',
    'server-monitor.html',
    'external-data-dashboard.html',
    'page-scripts-matrix.html',
    'js-map.html',
    'linter-realtime-monitor.html',
    'chart-management.html',
    'css-management.html',
    'crud-testing-dashboard.html',
    'constraints.html',
    'dynamic-colors-display.html',
    'test-header-only.html',
    'designs.html'
];

// רשימת עמודים שכבר עודכנו
const alreadyUpdated = [
    'executions.html',
    'trade_plans.html',
    'trades.html',
    'alerts.html',
    'notes.html',
    'trading_accounts.html',
    'tickers.html',
    'cash_flows.html',
    'cache-test.html',
    'system-management.html',
    'linter-realtime-monitor.html'
];

console.log(`%c📊 סטטיסטיקות:`, 'font-size: 14px; font-weight: bold; color: #2c3e50;');
console.log(`%c• עמודים עם ישויות: ${entityPages.length}`, 'color: #27ae60;');
console.log(`%c• עמודי כלי פיתוח: ${developmentPages.length}`, 'color: #e67e22;');
console.log(`%c• כבר עודכנו: ${alreadyUpdated.length}`, 'color: #3498db;');

// עמודים שצריכים עדכון
const pagesToUpdate = [
    'notifications-center.html',
    'background-tasks.html',
    'server-monitor.html',
    'external-data-dashboard.html',
    'page-scripts-matrix.html',
    'js-map.html',
    'chart-management.html',
    'css-management.html',
    'crud-testing-dashboard.html',
    'constraints.html',
    'dynamic-colors-display.html',
    'test-header-only.html',
    'designs.html'
];

console.log(`%c• צריכים עדכון: ${pagesToUpdate.length}`, 'color: #e74c3c;');

console.log('\n%c📋 רשימת עמודים לעדכון:', 'font-size: 14px; font-weight: bold; color: #2c3e50;');
pagesToUpdate.forEach((page, index) => {
    const isEntity = entityPages.includes(page);
    const isDev = developmentPages.includes(page);
    const type = isEntity ? '🎨 ישות' : (isDev ? '🔧 פיתוח' : '📄 כללי');
    console.log(`%c${index + 1}. ${page} (${type})`, 'color: #34495e; margin-left: 20px;');
});

console.log('\n%c✅ כל העמודים עם ישויות כבר כוללים _page-headers.css!', 'font-size: 16px; font-weight: bold; color: #27ae60;');
console.log('%c🔧 עמודי כלי פיתוח שצריכים עדכון ידני:', 'font-size: 16px; font-weight: bold; color: #e67e22;');
console.log('%c📝 הוראות:', 'font-size: 14px; font-weight: bold; color: #2c3e50;');
console.log('%c1. הוסף את השורה הבאה אחרי header-styles.css:', 'color: #34495e;');
console.log('%c   <link rel="stylesheet" href="styles-new/06-components/_page-headers.css?v=20251001">', 'color: #9b59b6; background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace;');
console.log('%c2. עדכן את גרסת header-styles.css ל-v6.0.1', 'color: #34495e;');

console.log('\n%c🎯 סיכום:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
console.log(`%c• עמודים עם ישויות: ${entityPages.filter(p => alreadyUpdated.includes(p)).length}/${entityPages.length} ✅`, 'color: #27ae60;');
console.log(`%c• עמודי פיתוח: ${developmentPages.filter(p => alreadyUpdated.includes(p)).length}/${developmentPages.length} 🔄`, 'color: #e67e22;');
console.log(`%c• סה"כ עודכנו: ${alreadyUpdated.length}/${entityPages.length + developmentPages.length}`, 'color: #3498db;');

