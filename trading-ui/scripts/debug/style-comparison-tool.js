/**
 * ========================================
 * Style Comparison Tool - TikTrack
 * ========================================
 * 
 * כלי בדיקה מקיף להשוואת עיצובים בין עמודים
 * להריץ בקונסולת הדפדפן בכל עמוד
 * 
 * שימוש:
 * 1. פתח עמוד (trade_plans או trades)
 * 2. פתח Console (F12)
 * 3. העתק והדבק את הקוד הזה
 * 4. הרץ: analyzePageStyles()
 * 
 * תאריך: 12 אוקטובר 2025
 * גרסה: 1.0.0
 * ========================================
 */

function analyzePageStyles() {
    console.clear();
    console.log('%c════════════════════════════════════════', 'color: #26baac; font-weight: bold; font-size: 16px;');
    console.log('%c   TikTrack Style Comparison Tool', 'color: #26baac; font-weight: bold; font-size: 16px;');
    console.log('%c════════════════════════════════════════', 'color: #26baac; font-weight: bold; font-size: 16px;');
    console.log('');
    
    // ===== 1. זיהוי עמוד =====
    const pageTitle = document.title;
    const pageName = document.body.className.split(' ')[0] || 'unknown';
    console.log('%c📄 עמוד נוכחי:', 'color: #fc5a06; font-weight: bold; font-size: 14px;');
    console.log(`   כותרת: ${pageTitle}`);
    console.log(`   Class: ${pageName}`);
    console.log('');
    
    // ===== 2. בדיקת Inline Styles =====
    console.log('%c🎨 בדיקת Inline Styles:', 'color: #fc5a06; font-weight: bold; font-size: 14px;');
    const elementsWithStyle = document.querySelectorAll('[style]');
    console.log(`   סה"כ אלמנטים עם style=: ${elementsWithStyle.length}`);
    
    if (elementsWithStyle.length > 0) {
        console.log('%c   ⚠️ נמצאו inline styles:', 'color: #dc3545; font-weight: bold;');
        elementsWithStyle.forEach((el, i) => {
            if (i < 10) { // הצג רק 10 ראשונים
                console.log(`   ${i+1}. ${el.tagName}.${el.className} → style="${el.getAttribute('style')}"`);
            }
        });
        if (elementsWithStyle.length > 10) {
            console.log(`   ... ועוד ${elementsWithStyle.length - 10} אלמנטים`);
        }
    } else {
        console.log('%c   ✅ אין inline styles!', 'color: #28a745; font-weight: bold;');
    }
    console.log('');
    
    // ===== 3. בדיקת גרסאות CSS =====
    console.log('%c📦 גרסאות CSS שנטענו:', 'color: #fc5a06; font-weight: bold; font-size: 14px;');
    const cssFiles = {
        '_modals.css': null,
        '_tables.css': null,
        '_forms-advanced.css': null,
        '_badges-status.css': null,
        '_entity-colors.css': null
    };
    
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href');
        Object.keys(cssFiles).forEach(fileName => {
            if (href && href.includes(fileName)) {
                const versionMatch = href.match(/\?v=([^"]+)/);
                cssFiles[fileName] = versionMatch ? versionMatch[1] : 'no version';
            }
        });
    });
    
    Object.entries(cssFiles).forEach(([file, version]) => {
        const icon = version ? '✅' : '❌';
        const color = version ? '#28a745' : '#dc3545';
        console.log(`   ${icon} ${file}: %c${version || 'לא נטען'}`, `color: ${color}; font-weight: bold;`);
    });
    console.log('');
    
    // ===== 4. בדיקת Badges =====
    console.log('%c🏷️ ניתוח Badges:', 'color: #fc5a06; font-weight: bold; font-size: 14px;');
    
    // Status badges
    const statusBadges = document.querySelectorAll('.status-badge, [class*="status-"]');
    console.log(`   Status badges: ${statusBadges.length} מצאתי`);
    
    if (statusBadges.length > 0) {
        const firstBadge = statusBadges[0];
        const computedStyle = window.getComputedStyle(firstBadge);
        console.log(`   דוגמה ראשונה:`);
        console.log(`     - Class: ${firstBadge.className}`);
        console.log(`     - data-status-category: ${firstBadge.getAttribute('data-status-category') || 'אין'}`);
        console.log(`     - data-color-category: ${firstBadge.getAttribute('data-color-category') || 'אין'}`);
        console.log(`     - צבע טקסט: ${computedStyle.color}`);
        console.log(`     - צבע רקע: ${computedStyle.backgroundColor}`);
        console.log(`     - מסגרת: ${computedStyle.border}`);
    }
    
    // Side badges
    const sideBadges = document.querySelectorAll('.side-badge, [class*="side-"]');
    console.log(`   Side badges: ${sideBadges.length} מצאתי`);
    
    // Numeric badges
    const numericBadges = document.querySelectorAll('.numeric-badge, [class*="numeric-"]');
    console.log(`   Numeric badges: ${numericBadges.length} מצאתי`);
    console.log('');
    
    // ===== 5. בדיקת Sortable Headers =====
    console.log('%c🔀 ניתוח Sortable Headers:', 'color: #fc5a06; font-weight: bold; font-size: 14px;');
    const sortableHeaders = document.querySelectorAll('.sortable-header');
    console.log(`   סה"כ sortable headers: ${sortableHeaders.length}`);
    
    if (sortableHeaders.length > 0) {
        const firstHeader = sortableHeaders[0];
        const computedStyle = window.getComputedStyle(firstHeader);
        console.log(`   דוגמה ראשונה:`);
        console.log(`     - Class: ${firstHeader.className}`);
        console.log(`     - צבע טקסט: ${computedStyle.color}`);
        console.log(`     - רקע: ${computedStyle.backgroundColor}`);
        console.log(`     - text-decoration: ${computedStyle.textDecoration}`);
        console.log(`     - cursor: ${computedStyle.cursor}`);
        
        // בדוק אם יש btn btn-link
        const hasBootstrap = firstHeader.classList.contains('btn') && firstHeader.classList.contains('btn-link');
        if (hasBootstrap) {
            console.log('%c     ⚠️ יש Bootstrap classes (btn btn-link)!', 'color: #ffc107; font-weight: bold;');
        } else {
            console.log('%c     ✅ נקי מ-Bootstrap!', 'color: #28a745; font-weight: bold;');
        }
    }
    console.log('');
    
    // ===== 6. בדיקת רוחבי עמודות =====
    console.log('%c📏 רוחבי עמודות בטבלה:', 'color: #fc5a06; font-weight: bold; font-size: 14px;');
    const table = document.querySelector('.data-table');
    
    if (table) {
        const headers = table.querySelectorAll('thead th');
        console.log(`   סה"כ עמודות: ${headers.length}`);
        console.log('   רוחבים:');
        
        headers.forEach((th, i) => {
            const computedStyle = window.getComputedStyle(th);
            const className = th.className.split(' ').find(c => c.startsWith('col-')) || 'no-class';
            const width = computedStyle.width;
            const minWidth = computedStyle.minWidth;
            console.log(`     ${i+1}. ${className.padEnd(20)} → width: ${width.padEnd(10)} | min-width: ${minWidth}`);
        });
    }
    console.log('');
    
    // ===== 7. בדיקת Table Classes =====
    console.log('%c📊 טבלה - Classes:', 'color: #fc5a06; font-weight: bold; font-size: 14px;');
    if (table) {
        console.log(`   Classes: ${table.className}`);
        console.log(`   data-table-type: ${table.getAttribute('data-table-type')}`);
        
        const hasDataTable = table.classList.contains('data-table');
        const hasTable = table.classList.contains('table');
        const hasPageSpecific = table.classList.contains('trade-plans-table') || table.classList.contains('trades-table');
        
        console.log(`   ✅ data-table: ${hasDataTable ? 'כן' : 'לא'}`);
        console.log(`   ${hasTable ? '⚠️' : '✅'} table (Bootstrap): ${hasTable ? 'כן - בעייתי!' : 'לא'}`);
        console.log(`   ✅ page-specific class: ${hasPageSpecific ? 'כן' : 'לא'}`);
    }
    console.log('');
    
    // ===== 8. בדיקת Scripts שנטענו =====
    console.log('%c📜 Scripts שנטענו:', 'color: #fc5a06; font-weight: bold; font-size: 14px;');
    const scripts = {
        'button-icons.js': false,
        'date-utils.js': false,
        'field-renderer-service.js': false,
        'trade_plans.js': null,
        'trades.js': null
    };
    
    document.querySelectorAll('script[src]').forEach(script => {
        const src = script.getAttribute('src');
        Object.keys(scripts).forEach(fileName => {
            if (src && src.includes(fileName)) {
                const versionMatch = src.match(/\?v=([^"]+)/);
                scripts[fileName] = versionMatch ? versionMatch[1] : 'no version';
            }
        });
    });
    
    Object.entries(scripts).forEach(([file, version]) => {
        if (version === false) {
            console.log(`   ❌ ${file}: לא נטען`);
        } else if (version) {
            console.log(`   ✅ ${file}: %cv=${version}`, 'color: #28a745; font-weight: bold;');
        }
    });
    console.log('');
    
    // ===== 9. בדיקת Dynamic Colors =====
    console.log('%c🎨 צבעים דינמיים (CSS Variables):', 'color: #fc5a06; font-weight: bold; font-size: 14px;');
    const rootStyles = window.getComputedStyle(document.documentElement);
    const colorVars = [
        '--status-open-color',
        '--status-closed-color',
        '--status-cancelled-color',
        '--type-swing-color',
        '--type-investment-color',
        '--numeric-positive-color',
        '--numeric-negative-color'
    ];
    
    colorVars.forEach(varName => {
        const value = rootStyles.getPropertyValue(varName).trim();
        if (value) {
            console.log(`   ✅ ${varName}: %c${value}`, `color: ${value}; font-weight: bold;`);
        } else {
            console.log(`   ❌ ${varName}: לא מוגדר`);
        }
    });
    console.log('');
    
    // ===== 10. בדיקת Responsive =====
    console.log('%c📱 Responsive:', 'color: #fc5a06; font-weight: bold; font-size: 14px;');
    const tableContainer = document.querySelector('.table-responsive');
    if (tableContainer && table) {
        const containerWidth = tableContainer.offsetWidth;
        const tableWidth = table.offsetWidth;
        const hasHorizontalScroll = table.scrollWidth > containerWidth;
        
        console.log(`   רוחב container: ${containerWidth}px`);
        console.log(`   רוחב טבלה: ${tableWidth}px`);
        console.log(`   ${hasHorizontalScroll ? '✅' : '❌'} גלילה אופקית: ${hasHorizontalScroll ? 'יש (טבלה רחבה)' : 'אין'}`);
    }
    console.log('');
    
    // ===== 11. סיכום מהיר =====
    console.log('%c📋 סיכום מהיר:', 'color: #26baac; font-weight: bold; font-size: 14px;');
    
    const summary = {
        'Inline Styles': elementsWithStyle.length === 0 ? '✅ 0' : `❌ ${elementsWithStyle.length}`,
        'CSS Versions': Object.values(cssFiles).every(v => v) ? '✅ הכל נטען' : '⚠️ חסרים',
        'Badges': statusBadges.length + sideBadges.length + numericBadges.length,
        'Sortable Headers': sortableHeaders.length,
        'Columns': headers ? headers.length : 0,
        'Table Class': table ? (table.classList.contains('data-table') ? '✅ data-table' : '❌ לא data-table') : 'אין טבלה'
    };
    
    Object.entries(summary).forEach(([key, value]) => {
        const icon = typeof value === 'string' && value.includes('✅') ? '✅' : 
                     typeof value === 'string' && value.includes('❌') ? '❌' : '📊';
        console.log(`   ${icon} ${key}: ${value}`);
    });
    
    console.log('');
    console.log('%c════════════════════════════════════════', 'color: #26baac; font-weight: bold; font-size: 16px;');
    
    // החזר אובייקט לבדיקה נוספת
    return {
        page: {
            title: pageTitle,
            name: pageName
        },
        inlineStyles: {
            count: elementsWithStyle.length,
            elements: Array.from(elementsWithStyle).slice(0, 10)
        },
        cssVersions: cssFiles,
        badges: {
            status: statusBadges.length,
            side: sideBadges.length,
            numeric: numericBadges.length,
            examples: Array.from(statusBadges).slice(0, 3)
        },
        scripts: scripts,
        table: {
            columns: headers ? headers.length : 0,
            hasDataTableClass: table ? table.classList.contains('data-table') : false,
            hasTableClass: table ? table.classList.contains('table') : false
        },
        colors: Object.fromEntries(
            colorVars.map(v => [v, rootStyles.getPropertyValue(v).trim()])
        )
    };
}

// ===== פונקציה להשוואת שני עמודים =====
function comparePages(page1Data, page2Data) {
    console.clear();
    console.log('%c════════════════════════════════════════', 'color: #26baac; font-weight: bold; font-size: 18px;');
    console.log('%c   השוואת עמודים - Comparison', 'color: #26baac; font-weight: bold; font-size: 18px;');
    console.log('%c════════════════════════════════════════', 'color: #26baac; font-weight: bold; font-size: 18px;');
    console.log('');
    
    console.log(`%c${page1Data.page.title} ↔ ${page2Data.page.title}`, 'font-size: 14px; font-weight: bold;');
    console.log('');
    
    // השוואת Inline Styles
    console.log('%c📊 Inline Styles:', 'color: #fc5a06; font-weight: bold;');
    console.log(`   ${page1Data.page.name}: ${page1Data.inlineStyles.count}`);
    console.log(`   ${page2Data.page.name}: ${page2Data.inlineStyles.count}`);
    console.log(`   ${page1Data.inlineStyles.count === page2Data.inlineStyles.count ? '✅' : '❌'} זהה: ${page1Data.inlineStyles.count === page2Data.inlineStyles.count ? 'כן' : 'לא'}`);
    console.log('');
    
    // השוואת CSS Versions
    console.log('%c📦 גרסאות CSS:', 'color: #fc5a06; font-weight: bold;');
    Object.keys(page1Data.cssVersions).forEach(file => {
        const v1 = page1Data.cssVersions[file];
        const v2 = page2Data.cssVersions[file];
        const match = v1 === v2;
        console.log(`   ${match ? '✅' : '❌'} ${file}:`);
        console.log(`     ${page1Data.page.name}: ${v1 || 'חסר'}`);
        console.log(`     ${page2Data.page.name}: ${v2 || 'חסר'}`);
    });
    console.log('');
    
    // השוואת Badges
    console.log('%c🏷️ Badges:', 'color: #fc5a06; font-weight: bold;');
    console.log(`   ${page1Data.page.name}: ${page1Data.badges.status + page1Data.badges.side + page1Data.badges.numeric}`);
    console.log(`   ${page2Data.page.name}: ${page2Data.badges.status + page2Data.badges.side + page2Data.badges.numeric}`);
    console.log('');
    
    // השוואת עמודות
    console.log('%c📏 עמודות:', 'color: #fc5a06; font-weight: bold;');
    console.log(`   ${page1Data.page.name}: ${page1Data.table.columns} עמודות`);
    console.log(`   ${page2Data.page.name}: ${page2Data.table.columns} עמודות`);
    console.log('');
    
    console.log('%c════════════════════════════════════════', 'color: #26baac; font-weight: bold; font-size: 18px;');
}

// ===== פונקציה לבדיקת Badge ספציפי =====
function inspectBadge(selector) {
    console.clear();
    console.log('%c🔍 בדיקת Badge מפורטת', 'color: #26baac; font-weight: bold; font-size: 16px;');
    console.log('');
    
    const badge = document.querySelector(selector);
    if (!badge) {
        console.log(`%c❌ לא נמצא badge עם selector: ${selector}`, 'color: #dc3545; font-weight: bold;');
        return;
    }
    
    const computed = window.getComputedStyle(badge);
    
    console.log('%cHTML:', 'font-weight: bold;');
    console.log(badge.outerHTML);
    console.log('');
    
    console.log('%cClasses:', 'font-weight: bold;');
    badge.classList.forEach(c => console.log(`  - ${c}`));
    console.log('');
    
    console.log('%cData Attributes:', 'font-weight: bold;');
    Array.from(badge.attributes).forEach(attr => {
        if (attr.name.startsWith('data-')) {
            console.log(`  - ${attr.name}: ${attr.value}`);
        }
    });
    console.log('');
    
    console.log('%cComputed Styles:', 'font-weight: bold;');
    const relevantProps = [
        'color', 'backgroundColor', 'border', 'borderRadius',
        'padding', 'fontSize', 'fontWeight', 'display'
    ];
    
    relevantProps.forEach(prop => {
        console.log(`  - ${prop}: ${computed[prop]}`);
    });
    console.log('');
    
    // בדוק CSS Variables
    console.log('%cCSS Variables בשימוש:', 'font-weight: bold;');
    const text = badge.textContent || badge.innerText;
    console.log(`  טקסט: "${text}"`);
    
    // נסה למצוא את הצבע מה-variable
    const colorMatch = badge.className.match(/(status|type|side|numeric)-(open|closed|swing|long|short|positive|negative)/);
    if (colorMatch) {
        const varName = `--${colorMatch[1]}-${colorMatch[2]}-color`;
        const rootStyle = window.getComputedStyle(document.documentElement);
        const varValue = rootStyle.getPropertyValue(varName);
        console.log(`  משתנה: ${varName} = ${varValue || 'לא מוגדר'}`);
    }
}

// ===== פונקציה להשוואת Computed Styles =====
function compareBadgeStyles(selector1, selector2) {
    console.clear();
    console.log('%c⚖️ השוואת Badges', 'color: #26baac; font-weight: bold; font-size: 16px;');
    console.log('');
    
    const badge1 = document.querySelector(selector1);
    const badge2 = document.querySelector(selector2);
    
    if (!badge1 || !badge2) {
        console.log('%c❌ לא נמצאו שני ה-badges', 'color: #dc3545; font-weight: bold;');
        return;
    }
    
    const computed1 = window.getComputedStyle(badge1);
    const computed2 = window.getComputedStyle(badge2);
    
    const props = ['color', 'backgroundColor', 'border', 'borderRadius', 'padding', 'fontSize', 'fontWeight'];
    
    console.log(`Badge 1: ${selector1}`);
    console.log(`Badge 2: ${selector2}`);
    console.log('');
    
    console.table(
        props.map(prop => ({
            Property: prop,
            'Badge 1': computed1[prop],
            'Badge 2': computed2[prop],
            'Match': computed1[prop] === computed2[prop] ? '✅' : '❌'
        }))
    );
}

// ===== Export =====
console.log('%c✅ Style Comparison Tool נטען!', 'color: #28a745; font-weight: bold; font-size: 14px;');
console.log('%cשימוש:', 'font-weight: bold;');
console.log('  analyzePageStyles()                           - ניתוח עמוד נוכחי');
console.log('  inspectBadge(".status-badge")                 - בדיקת badge ספציפי');
console.log('  compareBadgeStyles(".badge1", ".badge2")      - השוואת 2 badges');
console.log('');
console.log('%cלהשוואת עמודים:', 'font-weight: bold;');
console.log('  1. הרץ בעמוד 1: const page1 = analyzePageStyles()');
console.log('  2. הרץ בעמוד 2: const page2 = analyzePageStyles()');
console.log('  3. העתק את התוצאות והשווה ידנית');
console.log('');

