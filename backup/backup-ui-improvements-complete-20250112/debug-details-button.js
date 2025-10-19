/**
 * Debug Details Button - TikTrack
 * ===============================
 * 
 * בדיקת כפתור הפרטים
 */

function debugDetailsButton() {
    console.clear();
    console.log('🔍 בודק כפתור הפרטים...\n');
    
    // מצא כפתורי פרטים
    const detailButtons = document.querySelectorAll('.view-details-btn');
    console.log(`🔘 נמצאו ${detailButtons.length} כפתורי פרטים`);
    
    if (detailButtons.length === 0) {
        console.log('❌ לא נמצאו כפתורי פרטים!');
        return;
    }
    
    // בדוק כל כפתור
    detailButtons.forEach((btn, i) => {
        console.log(`\n🔘 כפתור פרטים ${i+1}:`);
        console.log(`   📝 Text: "${btn.textContent.trim()}"`);
        console.log(`   📏 גודל: ${btn.offsetWidth}x${btn.offsetHeight}`);
        console.log(`   👁️ נראה: ${btn.offsetParent !== null ? 'כן' : 'לא'}`);
        console.log(`   🎨 Display: ${window.getComputedStyle(btn).display}`);
        
        // בדוק אם יש event listener
        const hasListener = btn.onclick !== null || btn.addEventListener !== undefined;
        console.log(`   🎯 Event Listener: ${hasListener ? 'כן' : 'לא'}`);
        
        // בדוק אם יש onclick
        if (btn.onclick) {
            console.log(`   📋 Onclick: ${btn.onclick.toString().substring(0, 100)}...`);
        }
        
        // בדוק אם יש data attributes
        const dataAttrs = Array.from(btn.attributes).filter(attr => attr.name.startsWith('data-'));
        if (dataAttrs.length > 0) {
            console.log(`   🏷️ Data Attributes: ${dataAttrs.map(attr => `${attr.name}="${attr.value}"`).join(', ')}`);
        }
    });
    
    // בדוק אם יש פונקציה showItemDetails
    console.log('\n🔧 בדיקת פונקציות:');
    console.log(`   showItemDetails: ${typeof window.showItemDetails !== 'undefined' ? '✅' : '❌'}`);
    
    // בדוק אם יש UnifiedLogDisplay
    if (window.UnifiedLogDisplay) {
        console.log(`   UnifiedLogDisplay: ✅`);
        
        // בדוק אם יש instance
        const containers = document.querySelectorAll('.unified-log-display');
        console.log(`   UnifiedLogDisplay instances: ${containers.length}`);
        
        containers.forEach((container, i) => {
            console.log(`      ${i+1}. ${container.id || 'ללא ID'}`);
        });
    } else {
        console.log(`   UnifiedLogDisplay: ❌`);
    }
    
    // בדוק אם יש event listeners על כפתורים
    console.log('\n🎯 בדיקת Event Listeners:');
    detailButtons.forEach((btn, i) => {
        // נסה ללחוץ על הכפתור
        console.log(`   כפתור ${i+1}: נסה ללחוץ...`);
        try {
            btn.click();
            console.log(`      ✅ לחיצה הצליחה`);
        } catch (error) {
            console.log(`      ❌ שגיאה בלחיצה: ${error.message}`);
        }
    });
}

// הפעל בדיקה
debugDetailsButton();

// הוסף לגלובל
window.debugDetailsButton = debugDetailsButton;

console.log('\n💡 השתמש ב: debugDetailsButton() לבדיקה חוזרת');
