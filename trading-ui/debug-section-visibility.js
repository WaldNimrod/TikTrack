/**
 * Debug Section Visibility - TikTrack
 * ===================================
 * 
 * בדיקת נראות הסקציות
 */

function debugSectionVisibility() {
    console.clear();
    console.log('🔍 בודק נראות הסקציות...\n');
    
    // בדוק את הסקציה של מערכת הלוגים
    const unifiedLogsSection = document.querySelector('[data-section="unified-logs"]');
    if (unifiedLogsSection) {
        console.log('📊 סקציית מערכת הלוגים:');
        console.log(`   📏 גודל: ${unifiedLogsSection.offsetWidth}x${unifiedLogsSection.offsetHeight}`);
        console.log(`   👁️ נראה: ${unifiedLogsSection.offsetParent !== null ? 'כן' : 'לא'}`);
        console.log(`   🎨 Display: ${window.getComputedStyle(unifiedLogsSection).display}`);
        console.log(`   👁️ Visibility: ${window.getComputedStyle(unifiedLogsSection).visibility}`);
        console.log(`   🔍 Opacity: ${window.getComputedStyle(unifiedLogsSection).opacity}`);
        console.log(`   📍 Position: ${window.getComputedStyle(unifiedLogsSection).position}`);
        console.log(`   📐 Z-index: ${window.getComputedStyle(unifiedLogsSection).zIndex}`);
        
        // בדוק אם הסקציה מוסתרת
        const isHidden = unifiedLogsSection.style.display === 'none' || 
                        window.getComputedStyle(unifiedLogsSection).display === 'none';
        
        if (isHidden) {
            console.log('   ⚠️ הסקציה מוסתרת!');
            console.log('   💡 נסה: activateUnifiedLogSystem() להצגה');
        } else {
            console.log('   ✅ הסקציה נראית');
        }
        
        // בדוק את הכפתורים בתוך הסקציה
        const buttons = unifiedLogsSection.querySelectorAll('.btn');
        console.log(`   🔘 כפתורים בסקציה: ${buttons.length}`);
        
        buttons.forEach((btn, i) => {
            console.log(`      ${i+1}. "${btn.textContent.trim()}" - ${btn.offsetWidth}x${btn.offsetHeight}`);
        });
        
    } else {
        console.log('❌ סקציית מערכת הלוגים לא נמצאה!');
    }
    
    // בדוק את הכפתור להפעלת המערכת
    const activateBtn = document.querySelector('[onclick*="activateUnifiedLogSystem"]');
    if (activateBtn) {
        console.log('\n🚀 כפתור הפעלת המערכת:');
        console.log(`   📝 Text: "${activateBtn.textContent.trim()}"`);
        console.log(`   📏 גודל: ${activateBtn.offsetWidth}x${activateBtn.offsetHeight}`);
        console.log(`   👁️ נראה: ${activateBtn.offsetParent !== null ? 'כן' : 'לא'}`);
    } else {
        console.log('\n❌ כפתור הפעלת המערכת לא נמצא!');
    }
    
    // בדוק את הפונקציה להפעלת המערכת
    console.log('\n🔧 בדיקת פונקציות:');
    console.log(`   activateUnifiedLogSystem: ${typeof window.activateUnifiedLogSystem !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   showNotificationLogNew: ${typeof window.showNotificationLogNew !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   showSystemLogsNew: ${typeof window.showSystemLogsNew !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   showErrorReportsNew: ${typeof window.showErrorReportsNew !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   exportAllLogs: ${typeof window.exportAllLogs !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   testUnifiedLogSystem: ${typeof window.testUnifiedLogSystem !== 'undefined' ? '✅' : '❌'}`);
}

// הפעל בדיקה
debugSectionVisibility();

// הוסף לגלובל
window.debugSectionVisibility = debugSectionVisibility;

console.log('\n💡 השתמש ב: debugSectionVisibility() לבדיקה חוזרת');
