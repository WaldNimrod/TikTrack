/**
 * Debug Notification System - TikTrack
 * ====================================
 * 
 * בדיקת מערכת ההודעות
 */

function debugNotificationSystem() {
    console.clear();
    console.log('🔍 בודק מערכת ההודעות...\n');
    
    // בדוק פונקציות הודעות זמינות
    const notificationFunctions = [
        'showInfoNotification',
        'showSuccessNotification',
        'showErrorNotification',
        'showWarningNotification',
        'showNotification'
    ];
    
    console.log('🔧 פונקציות הודעות זמינות:');
    notificationFunctions.forEach(func => {
        const exists = typeof window[func] === 'function';
        console.log(`   ${func}: ${exists ? '✅' : '❌'}`);
    });
    
    // בדוק אם יש אלמנטים של הודעות
    console.log('\n📋 אלמנטי הודעות:');
    const notificationElements = document.querySelectorAll('.notification, .alert, [class*="notification"], [class*="alert"]');
    console.log(`   נמצאו ${notificationElements.length} אלמנטי הודעות`);
    
    notificationElements.forEach((element, i) => {
        console.log(`      ${i+1}. ${element.className} - ${element.tagName}`);
        console.log(`         Text: "${element.textContent?.substring(0, 50)}..."`);
        console.log(`         Visible: ${element.offsetWidth > 0 && element.offsetHeight > 0 ? '✅' : '❌'}`);
    });
    
    // בדוק אם יש container להודעות
    console.log('\n📦 containers להודעות:');
    const containers = document.querySelectorAll('#notifications, .notifications, [id*="notification"], [class*="notification"]');
    console.log(`   נמצאו ${containers.length} containers`);
    
    containers.forEach((container, i) => {
        console.log(`      ${i+1}. ${container.id || container.className} - ${container.tagName}`);
        console.log(`         Children: ${container.children.length}`);
        console.log(`         Visible: ${container.offsetWidth > 0 && container.offsetHeight > 0 ? '✅' : '❌'}`);
    });
    
    // נסה להציג הודעה לבדיקה
    if (typeof window.showInfoNotification === 'function') {
        console.log('\n🧪 בודק showInfoNotification...');
        try {
            window.showInfoNotification('בדיקה', 'זהו טקסט בדיקה', 0);
            console.log('✅ showInfoNotification הופעל');
            
            // בדוק אם נוצרה הודעה
            setTimeout(() => {
                const newNotifications = document.querySelectorAll('.notification, .alert, [class*="notification"], [class*="alert"]');
                console.log(`📊 אחרי 1 שנייה: ${newNotifications.length} הודעות`);
                
                newNotifications.forEach((notification, i) => {
                    console.log(`   ${i+1}. "${notification.textContent?.substring(0, 30)}..." - Visible: ${notification.offsetWidth > 0 && notification.offsetHeight > 0 ? '✅' : '❌'}`);
                });
            }, 1000);
            
        } catch (error) {
            console.log(`❌ שגיאה ב-showInfoNotification: ${error.message}`);
        }
    }
}

// הפעל בדיקה
debugNotificationSystem();

// הוסף לגלובל
window.debugNotificationSystem = debugNotificationSystem;

console.log('\n💡 השתמש ב: debugNotificationSystem() לבדיקה חוזרת');
