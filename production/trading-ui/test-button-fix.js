/**
 * Test Button Fix - בדיקת תיקון מערכת הכפתורים
 * =============================================
 * 
 * סקריפט לבדיקת תיקון מערכת הכפתורים לאחר הוספת event-handler-manager.js
 */

function testButtonSystemFix() {
    console.log('🔍 === בדיקת תיקון מערכת הכפתורים ===');
    
    // בדיקה 1: EventHandlerManager נטען
    console.log('\n1. בדיקת EventHandlerManager:');
    if (window.EventHandlerManager) {
        console.log('✅ EventHandlerManager נטען:', window.EventHandlerManager);
        console.log('✅ EventHandlerManager initialized:', window.EventHandlerManager.initialized);
    } else {
        console.log('❌ EventHandlerManager לא נטען!');
    }
    
    // בדיקה 2: ButtonSystem נטען
    console.log('\n2. בדיקת ButtonSystem:');
    if (window.ButtonSystem || window.advancedButtonSystem) {
        console.log('✅ ButtonSystem נטען:', window.ButtonSystem || window.advancedButtonSystem);
    } else {
        console.log('❌ ButtonSystem לא נטען!');
    }
    
    // בדיקה 3: כפתורים עם data-onclick
    console.log('\n3. בדיקת כפתורים עם data-onclick:');
    const dataOnclickButtons = document.querySelectorAll('button[data-onclick]');
    console.log(`✅ נמצאו ${dataOnclickButtons.length} כפתורים עם data-onclick`);
    
    // בדיקה 4: כפתורים עם onclick רגיל
    console.log('\n4. בדיקת כפתורים עם onclick רגיל:');
    const onclickButtons = document.querySelectorAll('button[onclick]:not([data-onclick])');
    console.log(`✅ נמצאו ${onclickButtons.length} כפתורים עם onclick רגיל`);
    
    // בדיקה 5: כפתור ייבוא ספציפי
    console.log('\n5. בדיקת כפתור ייבוא:');
    const importButton = document.querySelector('button[data-onclick*="openImportUserDataModal"]');
    if (importButton) {
        console.log('✅ כפתור ייבוא נמצא:', importButton);
        console.log('✅ כפתור ייבוא disabled:', importButton.disabled);
        console.log('✅ כפתור ייבוא data-onclick:', importButton.getAttribute('data-onclick'));
    } else {
        console.log('❌ כפתור ייבוא לא נמצא!');
    }
    
    // בדיקה 6: כפתורי פילטר
    console.log('\n6. בדיקת כפתורי פילטר:');
    const filterButtons = document.querySelectorAll('button[onclick*="toggleHeaderFilters"], button[onclick*="toggleStatusFilterMenu"]');
    console.log(`✅ נמצאו ${filterButtons.length} כפתורי פילטר`);
    
    // בדיקה 7: פונקציות חשובות
    console.log('\n7. בדיקת פונקציות חשובות:');
    const importantFunctions = [
        'openImportUserDataModal',
        'toggleHeaderFilters',
        'toggleStatusFilterMenu',
        'clearCacheQuick',
        'runQuickQualityCheck'
    ];
    
    importantFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} זמין`);
        } else {
            console.log(`❌ ${funcName} לא זמין!`);
        }
    });
    
    // בדיקה 8: Console errors
    console.log('\n8. בדיקת console errors:');
    const originalError = console.error;
    const errors = [];
    console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    // בדיקה 9: בדיקת לחיצה על כפתור ייבוא
    console.log('\n9. בדיקת לחיצה על כפתור ייבוא:');
    if (importButton && !importButton.disabled) {
        console.log('🔄 מנסה ללחוץ על כפתור ייבוא...');
        try {
            importButton.click();
            console.log('✅ לחיצה על כפתור ייבוא הצליחה');
        } catch (error) {
            console.log('❌ שגיאה בלחיצה על כפתור ייבוא:', error);
        }
    } else {
        console.log('⚠️ כפתור ייבוא disabled או לא נמצא');
    }
    
    // שחזור console.error
    console.error = originalError;
    
    console.log('\n📊 סיכום:');
    console.log(`- EventHandlerManager: ${window.EventHandlerManager ? '✅' : '❌'}`);
    console.log(`- ButtonSystem: ${window.ButtonSystem || window.advancedButtonSystem ? '✅' : '❌'}`);
    console.log(`- כפתורי data-onclick: ${dataOnclickButtons.length}`);
    console.log(`- כפתורי onclick: ${onclickButtons.length}`);
    console.log(`- כפתור ייבוא: ${importButton ? '✅' : '❌'}`);
    console.log(`- Console errors: ${errors.length}`);
    
    if (errors.length > 0) {
        console.log('\n❌ Console errors שנמצאו:');
        errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
    }
    
    console.log('\n✅ === בדיקת תיקון מערכת הכפתורים הושלמה ===');
    
    return {
        eventHandlerManager: !!window.EventHandlerManager,
        buttonSystem: !!(window.ButtonSystem || window.advancedButtonSystem),
        dataOnclickButtons: dataOnclickButtons.length,
        onclickButtons: onclickButtons.length,
        importButton: !!importButton,
        consoleErrors: errors.length,
        errors: errors
    };
}

// הרצה אוטומטית
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testButtonSystemFix);
} else {
    testButtonSystemFix();
}

// יצוא לפונקציה גלובלית
window.testButtonSystemFix = testButtonSystemFix;
