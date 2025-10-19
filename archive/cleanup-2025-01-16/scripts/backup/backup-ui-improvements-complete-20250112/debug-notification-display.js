/**
 * Debug Notification Display - TikTrack
 * =====================================
 * 
 * בדיקת תצוגת הודעות
 */

function debugNotificationDisplay() {
    console.clear();
    console.log('🔍 בודק תצוגת הודעות...\n');
    
    // בדוק אם יש הודעות בדף
    const allNotifications = document.querySelectorAll('*');
    const notificationElements = [];
    
    allNotifications.forEach(element => {
        const className = element.className || '';
        const id = element.id || '';
        
        if (className.includes('notification') || 
            className.includes('alert') || 
            id.includes('notification') || 
            id.includes('alert')) {
            notificationElements.push(element);
        }
    });
    
    console.log(`📊 נמצאו ${notificationElements.length} אלמנטי הודעות:`);
    
    notificationElements.forEach((element, i) => {
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        
        console.log(`\n   ${i+1}. ${element.tagName} - ${element.id || element.className}`);
        console.log(`      Text: "${element.textContent?.substring(0, 50)}..."`);
        console.log(`      Position: x=${rect.x}, y=${rect.y}, width=${rect.width}, height=${rect.height}`);
        console.log(`      Display: ${computedStyle.display}`);
        console.log(`      Visibility: ${computedStyle.visibility}`);
        console.log(`      Opacity: ${computedStyle.opacity}`);
        console.log(`      Z-index: ${computedStyle.zIndex}`);
        console.log(`      Position: ${computedStyle.position}`);
        console.log(`      Top: ${computedStyle.top}`);
        console.log(`      Left: ${computedStyle.left}`);
        console.log(`      Right: ${computedStyle.right}`);
        console.log(`      Bottom: ${computedStyle.bottom}`);
    });
    
    // בדוק אם יש container להודעות
    console.log('\n📦 בדיקת containers:');
    const containers = document.querySelectorAll('body, #app, .app, main, .main, #notifications, .notifications');
    
    containers.forEach(container => {
        const rect = container.getBoundingClientRect();
        console.log(`   ${container.tagName} - ${container.id || container.className}`);
        console.log(`      Size: ${rect.width}x${rect.height}`);
        console.log(`      Position: x=${rect.x}, y=${rect.y}`);
    });
    
    // נסה ליצור הודעה ידנית
    console.log('\n🧪 יוצר הודעה ידנית...');
    const testNotification = document.createElement('div');
    testNotification.className = 'notification test-notification';
    testNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #007bff;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 9999;
        font-size: 14px;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    testNotification.textContent = '🧪 הודעה לבדיקה - זה אמור להיות נראה!';
    
    document.body.appendChild(testNotification);
    console.log('✅ הודעה ידנית נוצרה');
    
    // הסר אחרי 5 שניות
    setTimeout(() => {
        if (testNotification.parentNode) {
            testNotification.parentNode.removeChild(testNotification);
            console.log('🗑️ הודעה ידנית הוסרה');
        }
    }, 5000);
}

// הפעל בדיקה
debugNotificationDisplay();

// הוסף לגלובל
window.debugNotificationDisplay = debugNotificationDisplay;

console.log('\n💡 השתמש ב: debugNotificationDisplay() לבדיקה חוזרת');
