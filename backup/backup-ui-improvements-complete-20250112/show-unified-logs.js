/**
 * Show Unified Logs - TikTrack
 * ============================
 * 
 * קוד להצגת מערכת הלוגים החדשה
 */

function showUnifiedLogs() {
    console.log('🚀 מציג את מערכת הלוגים החדשה...');
    
    // מצא את הסקציה
    const section = document.querySelector('[data-section="unified-logs"]');
    if (!section) {
        console.log('❌ סקציית מערכת הלוגים לא נמצאה!');
        return;
    }
    
    // הצג את הסקציה
    section.style.display = 'block';
    console.log('✅ הסקציה הוצגה');
    
    // גלול אליה
    section.scrollIntoView({ behavior: 'smooth' });
    console.log('📍 גלילה לסקציה');
    
    // בדוק את הכפתורים
    const buttons = section.querySelectorAll('.btn');
    console.log(`🔘 נמצאו ${buttons.length} כפתורים`);
    
    buttons.forEach((btn, i) => {
        console.log(`   ${i+1}. "${btn.textContent.trim()}" - ${btn.offsetWidth}x${btn.offsetHeight}`);
    });
    
    // בדוק אם הפונקציות קיימות
    const functions = [
        'showNotificationLogNew',
        'showSystemLogsNew', 
        'showErrorReportsNew',
        'exportAllLogs',
        'testUnifiedLogSystem'
    ];
    
    console.log('\n🔧 בדיקת פונקציות:');
    functions.forEach(func => {
        const exists = typeof window[func] !== 'undefined';
        console.log(`   ${func}: ${exists ? '✅' : '❌'}`);
    });
}

// הפעל
showUnifiedLogs();

// הוסף לגלובל
window.showUnifiedLogs = showUnifiedLogs;

console.log('\n💡 השתמש ב: showUnifiedLogs() להצגת המערכת');
