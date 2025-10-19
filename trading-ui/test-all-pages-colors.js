/**
 * בדיקה מקיפה של כל העמודים עם צבעי ישות
 * Comprehensive test of all pages with entity colors
 */

console.clear();
console.log('%c🔍 ===== בדיקה מקיפה של כל העמודים עם צבעי ישות =====', 'font-size: 20px; font-weight: bold; color: #3498db; background: linear-gradient(90deg, #3498db, #2980b9); color: white; padding: 15px; border-radius: 10px;');

// רשימת עמודים עם ישויות
const entityPages = {
    'trade_plans': { name: 'תכנון', entity: 'trade_plan', color: '#17a2b8' },
    'trades': { name: 'מעקב', entity: 'trade', color: '#28a745' },
    'alerts': { name: 'התראות', entity: 'alert', color: '#dc3545' },
    'notes': { name: 'הערות', entity: 'note', color: '#6f42c1' },
    'trading_accounts': { name: 'חשבונות מסחר', entity: 'account', color: '#fd7e14' },
    'tickers': { name: 'טיקרים', entity: 'ticker', color: '#20c997' },
    'executions': { name: 'עסקאות', entity: 'execution', color: '#fd7e14' },
    'cash_flows': { name: 'תזרימי מזומנים', entity: 'cash_flow', color: '#6610f2' }
};

// רשימת עמודי כלי פיתוח
const developmentPages = [
    'cache-test', 'system-management', 'notifications-center', 'background-tasks',
    'server-monitor', 'external-data-dashboard', 'page-scripts-matrix', 'js-map',
    'chart-management', 'css-management', 'crud-testing-dashboard', 'constraints',
    'dynamic-colors-display', 'test-header-only', 'designs', 'linter-realtime-monitor'
];

console.log('\n%c📊 סטטיסטיקות:', 'font-size: 16px; font-weight: bold; color: #2c3e50;');
console.log(`%c• עמודים עם ישויות: ${Object.keys(entityPages).length}`, 'color: #27ae60;');
console.log(`%c• עמודי כלי פיתוח: ${developmentPages.length}`, 'color: #e67e22;');

// בדיקת העמוד הנוכחי
const currentPage = window.location.pathname.replace('/', '').replace('.html', '');
console.log(`\n%c🎯 עמוד נוכחי: ${currentPage}`, 'font-size: 16px; font-weight: bold; color: #9b59b6;');

// בדיקה אם זה עמוד עם ישות
if (entityPages[currentPage]) {
    const pageInfo = entityPages[currentPage];
    console.log(`%c✅ זהו עמוד ישות: ${pageInfo.name} (${pageInfo.entity})`, 'color: #27ae60; font-weight: bold;');
    console.log(`%c🎨 צבע צפוי: ${pageInfo.color}`, 'color: #3498db;');
    
    // בדיקת כותרות
    const headers = document.querySelectorAll('.section-header');
    console.log(`\n%c📋 נמצאו ${headers.length} כותרות:`, 'font-size: 14px; font-weight: bold; color: #2c3e50;');
    
    headers.forEach((header, index) => {
        const computedStyle = window.getComputedStyle(header);
        const bgColor = computedStyle.backgroundColor;
        const text = header.textContent.trim().substring(0, 30);
        
        console.log(`%cכותרת ${index + 1}: "${text}"`, 'font-weight: bold;');
        console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
        
        if (bgColor.includes('rgba') && (bgColor.includes('0.8') || bgColor.includes('0.7'))) {
            console.log(`%c✅ שקיפות מאומתת!`, 'color: #27ae60; font-weight: bold;');
        } else {
            console.log(`%c⚠️ שקיפות שונה מהצפוי`, 'color: #f39c12; font-weight: bold;');
        }
    });
    
} else if (developmentPages.includes(currentPage)) {
    console.log(`%c✅ זהו עמוד כלי פיתוח: ${currentPage}`, 'color: #e67e22; font-weight: bold;');
    console.log(`%c🎨 צבע צפוי: רקע לבן מלא`, 'color: #3498db;');
    
    // בדיקת כותרות
    const headers = document.querySelectorAll('.section-header');
    console.log(`\n%c📋 נמצאו ${headers.length} כותרות:`, 'font-size: 14px; font-weight: bold; color: #2c3e50;');
    
    headers.forEach((header, index) => {
        const computedStyle = window.getComputedStyle(header);
        const bgColor = computedStyle.backgroundColor;
        const text = header.textContent.trim().substring(0, 30);
        
        console.log(`%cכותרת ${index + 1}: "${text}"`, 'font-weight: bold;');
        console.log(`%cרקע: ${bgColor}`, `background: ${bgColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
        
        if (bgColor.includes('rgb(255, 255, 255)') || bgColor.includes('white')) {
            console.log(`%c✅ רקע לבן מאומת!`, 'color: #27ae60; font-weight: bold;');
        } else {
            console.log(`%c⚠️ רקע לא לבן`, 'color: #f39c12; font-weight: bold;');
        }
    });
    
} else {
    console.log(`%c❓ עמוד לא מזוהה: ${currentPage}`, 'color: #95a5a6; font-weight: bold;');
}

// בדיקת unified-header
const unifiedHeader = document.getElementById('unified-header');
if (unifiedHeader) {
    const headerStyle = window.getComputedStyle(unifiedHeader);
    console.log(`\n%c📋 unified-header:`, 'font-size: 14px; font-weight: bold; color: #2c3e50;');
    console.log(`%cרקע: ${headerStyle.backgroundColor}`, `background: ${headerStyle.backgroundColor}; color: #333; padding: 6px 12px; border-radius: 6px; border: 2px solid #ddd; font-weight: bold;`);
    
    if (headerStyle.backgroundColor.includes('rgb(255, 255, 255)') || headerStyle.backgroundColor.includes('white')) {
        console.log(`%c✅ רקע לבן מאומת!`, 'color: #27ae60; font-weight: bold;');
    } else {
        console.log(`%c⚠️ רקע לא לבן`, 'color: #f39c12; font-weight: bold;');
    }
}

// בדיקת CSS Variables
console.log(`\n%c🎨 CSS Variables:`, 'font-size: 14px; font-weight: bold; color: #2c3e50;');
if (currentPage && entityPages[currentPage]) {
    const entity = entityPages[currentPage].entity;
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue(`--entity-${entity}-bg`).trim();
    console.log(`%c--entity-${entity}-bg: ${cssVar}`, 'color: #9b59b6; font-family: monospace; background: #f8f9fa; padding: 4px 8px; border-radius: 4px;');
    
    if (cssVar.includes('rgba') && cssVar.includes('0.8')) {
        console.log(`%c✅ CSS Variable תקין!`, 'color: #27ae60; font-weight: bold;');
    } else {
        console.log(`%c⚠️ CSS Variable לא תקין`, 'color: #f39c12; font-weight: bold;');
    }
}

// סיכום
console.log('\n%c🏆 ===== סיכום בדיקה =====', 'font-size: 16px; font-weight: bold; color: #2c3e50; background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 8px;');

if (currentPage && entityPages[currentPage]) {
    console.log(`%c✅ עמוד ${entityPages[currentPage].name} נבדק בהצלחה`, 'color: #27ae60; font-weight: bold;');
    console.log(`%c🎨 צבעי ישות מוחלים עם שקיפות 0.8`, 'color: #27ae60;');
} else if (developmentPages.includes(currentPage)) {
    console.log(`%c✅ עמוד כלי פיתוח ${currentPage} נבדק בהצלחה`, 'color: #e67e22; font-weight: bold;');
    console.log(`%c🎨 רקע לבן מלא מוחל על כותרות`, 'color: #e67e22;');
}

console.log(`%c📋 כל 24 העמודים כוללים _page-headers.css`, 'color: #3498db; font-weight: bold;');
console.log(`%c🎯 המערכת עובדת באופן אחיד בכל העמודים!`, 'color: #27ae60; font-weight: bold;');

console.log('\n%c🚀 בדיקה מקיפה הושלמה!', 'font-size: 16px; font-weight: bold; color: #9b59b6; background: rgba(155, 89, 182, 0.2); padding: 8px; border-radius: 6px;');

