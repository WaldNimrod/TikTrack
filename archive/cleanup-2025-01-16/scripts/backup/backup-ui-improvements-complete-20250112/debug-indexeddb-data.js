/**
 * Debug IndexedDB Data - TikTrack
 * ===============================
 * 
 * בדיקת נתונים מ-IndexedDB
 */

async function debugIndexedDBData() {
    console.clear();
    console.log('🔍 בודק נתונים מ-IndexedDB...\n');
    
    // בדוק אם UnifiedIndexedDB זמין
    if (!window.UnifiedIndexedDB) {
        console.log('❌ UnifiedIndexedDB לא זמין!');
        return;
    }
    
    console.log('✅ UnifiedIndexedDB זמין');
    console.log(`   📊 מאותחל: ${window.UnifiedIndexedDB.isInitialized}`);
    
    if (!window.UnifiedIndexedDB.isInitialized) {
        console.log('⚠️ UnifiedIndexedDB לא מאותחל!');
        return;
    }
    
    // בדוק נתוני התראות
    try {
        console.log('\n📊 בודק נתוני התראות...');
        const notificationHistory = await window.UnifiedIndexedDB.getAll('notificationHistory');
        console.log(`   📚 היסטוריית התראות: ${notificationHistory.length} רשומות`);
        
        if (notificationHistory.length > 0) {
            console.log('   📋 דוגמאות:');
            notificationHistory.slice(0, 3).forEach((item, i) => {
                console.log(`      ${i+1}. ${item.type || item.level} - "${item.title || item.message}"`);
            });
        }
        
        const notificationStats = await window.UnifiedIndexedDB.getAll('notificationStats');
        console.log(`   📊 סטטיסטיקות התראות: ${notificationStats.length} רשומות`);
        
    } catch (error) {
        console.log(`❌ שגיאה בטעינת נתוני התראות: ${error.message}`);
    }
    
    // בדוק את UnifiedLogManager
    if (!window.UnifiedLogManager) {
        console.log('\n❌ UnifiedLogManager לא זמין!');
        return;
    }
    
    console.log('\n✅ UnifiedLogManager זמין');
    
    try {
        console.log('\n📊 בודק UnifiedLogManager...');
        const logData = await window.UnifiedLogManager.getLogData('notificationHistory');
        console.log(`   📚 נתוני לוג: ${logData.data ? logData.data.length : 0} רשומות`);
        
        if (logData.data && logData.data.length > 0) {
            console.log('   📋 דוגמאות:');
            logData.data.slice(0, 3).forEach((item, i) => {
                console.log(`      ${i+1}. ${item.type || item.level} - "${item.title || item.message}"`);
            });
        }
        
    } catch (error) {
        console.log(`❌ שגיאה ב-UnifiedLogManager: ${error.message}`);
    }
}

// הפעל בדיקה
debugIndexedDBData();

// הוסף לגלובל
window.debugIndexedDBData = debugIndexedDBData;

console.log('\n💡 השתמש ב: debugIndexedDBData() לבדיקה חוזרת');
