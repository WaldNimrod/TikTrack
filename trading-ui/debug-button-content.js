/**
 * Debug Button Content - TikTrack
 * ===============================
 * 
 * בדיקת התוכן של הכפתורים בלוג
 */

function debugButtonContent() {
    console.clear();
    console.log('🔍 בודק תוכן הכפתורים בלוג...\n');
    
    // מצא כפתורים
    const buttons = document.querySelectorAll('.unified-log-display .btn, .log-display-controls .btn');
    console.log(`📊 נמצאו ${buttons.length} כפתורים`);
    
    if (buttons.length === 0) {
        console.log('❌ לא נמצאו כפתורים!');
        return;
    }
    
    // בדוק כל כפתור
    buttons.forEach((btn, i) => {
        console.log(`\n🔘 כפתור ${i+1}:`);
        console.log(`   📝 Text Content: "${btn.textContent}"`);
        console.log(`   📝 Inner HTML: "${btn.innerHTML}"`);
        console.log(`   📝 Inner Text: "${btn.innerText}"`);
        console.log(`   🏷️ Classes: "${btn.className}"`);
        console.log(`   🆔 ID: "${btn.id || 'ללא ID'}"`);
        console.log(`   📏 גודל: ${btn.offsetWidth}x${btn.offsetHeight}`);
        
        // בדוק אם יש children
        console.log(`   👶 Children: ${btn.children.length}`);
        if (btn.children.length > 0) {
            Array.from(btn.children).forEach((child, j) => {
                console.log(`      ${j+1}. ${child.tagName}: "${child.textContent || child.className}"`);
            });
        }
        
        // בדוק אם יש attributes
        const attributes = Array.from(btn.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', ');
        console.log(`   🏷️ Attributes: ${attributes || 'ללא attributes'}`);
        
        // בדוק אם הכפתור ריק
        const isEmpty = btn.textContent.trim() === '' && btn.innerHTML.trim() === '';
        if (isEmpty) {
            console.log(`   ⚠️ כפתור ריק!`);
        } else {
            console.log(`   ✅ יש תוכן`);
        }
    });
    
    // בדוק כפתורים ספציפיים
    console.log('\n🎯 בדיקת כפתורים ספציפיים:');
    
    const specificButtons = [
        '.log-export-btn',
        '.log-refresh-btn',
        '[onclick*="showNotificationLog"]',
        '[onclick*="showSystemLogs"]',
        '[onclick*="showErrorReports"]',
        '[onclick*="exportAllLogs"]',
        '[onclick*="testUnifiedLogSystem"]'
    ];
    
    specificButtons.forEach(selector => {
        const btn = document.querySelector(selector);
        if (btn) {
            console.log(`   📍 ${selector}:`);
            console.log(`      📝 Text: "${btn.textContent.trim()}"`);
            console.log(`      📝 HTML: "${btn.innerHTML.trim()}"`);
            console.log(`      🏷️ Classes: "${btn.className}"`);
        } else {
            console.log(`   ❌ ${selector}: לא נמצא`);
        }
    });
    
    // בדוק אם יש בעיות עם JavaScript
    console.log('\n🔧 בדיקת JavaScript:');
    console.log(`   showNotificationLog: ${typeof window.showNotificationLog !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   showSystemLogs: ${typeof window.showSystemLogs !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   showErrorReports: ${typeof window.showErrorReports !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   exportAllLogs: ${typeof window.exportAllLogs !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   testUnifiedLogSystem: ${typeof window.testUnifiedLogSystem !== 'undefined' ? '✅' : '❌'}`);
}

// הפעל בדיקה
debugButtonContent();

// הוסף לגלובל
window.debugButtonContent = debugButtonContent;

console.log('\n💡 השתמש ב: debugButtonContent() לבדיקה חוזרת');
