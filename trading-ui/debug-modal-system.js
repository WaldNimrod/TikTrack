/**
 * Debug Modal System - TikTrack
 * =============================
 * 
 * בדיקת מערכת המודולים
 */

function debugModalSystem() {
    console.clear();
    console.log('🔍 בודק מערכת המודולים...\n');
    
    // בדוק פונקציות מודולים זמינות
    const modalFunctions = [
        'showModal',
        'showConfirmationDialog',
        'showInfoModal',
        'showErrorModal',
        'showWarningModal',
        'closeModal'
    ];
    
    console.log('🔧 פונקציות מודולים זמינות:');
    modalFunctions.forEach(func => {
        const exists = typeof window[func] === 'function';
        console.log(`   ${func}: ${exists ? '✅' : '❌'}`);
    });
    
    // בדוק אם יש Bootstrap
    console.log('\n🎨 בדיקת Bootstrap:');
    console.log(`   Bootstrap: ${typeof window.bootstrap !== 'undefined' ? '✅' : '❌'}`);
    console.log(`   jQuery: ${typeof window.$ !== 'undefined' ? '✅' : '❌'}`);
    
    // בדוק אם יש מודולים קיימים
    console.log('\n📋 מודולים קיימים:');
    const modals = document.querySelectorAll('.modal, [id*="modal"], [class*="modal"]');
    console.log(`   נמצאו ${modals.length} מודולים`);
    
    modals.forEach((modal, i) => {
        console.log(`      ${i+1}. ${modal.id || modal.className} - ${modal.tagName}`);
    });
    
    // בדוק אם יש פונקציה showConfirmationDialog
    if (typeof window.showConfirmationDialog === 'function') {
        console.log('\n🧪 בודק showConfirmationDialog...');
        try {
            window.showConfirmationDialog(
                'בדיקה',
                'זהו מודול בדיקה',
                () => console.log('✅ אישור'),
                () => console.log('❌ ביטול')
            );
            console.log('✅ showConfirmationDialog עובד');
        } catch (error) {
            console.log(`❌ שגיאה ב-showConfirmationDialog: ${error.message}`);
        }
    }
    
    // בדוק אם יש פונקציה showModal
    if (typeof window.showModal === 'function') {
        console.log('\n🧪 בודק showModal...');
        console.log('   showModal זמין - צריך modalId');
    }
}

// הפעל בדיקה
debugModalSystem();

// הוסף לגלובל
window.debugModalSystem = debugModalSystem;

console.log('\n💡 השתמש ב: debugModalSystem() לבדיקה חוזרת');
