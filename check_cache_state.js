// קוד לבדיקת מצב המטמון
console.log('🔍 בדיקת מצב המטמון');
console.log('====================');

// 1. בדיקת מטמון העדפות
console.log('\n💾 מטמון העדפות:');
if (window.preferencesCache) {
    const cached = window.preferencesCache.get();
    console.log(`   Cache exists: ${!!cached}`);
    console.log(`   Cache size: ${Object.keys(cached || {}).length} items`);
    
    if (cached) {
        console.log('   Cache contents:');
        Object.keys(cached).forEach(key => {
            if (key.includes('Color') || key.includes('primary') || key.includes('secondary')) {
                console.log(`     ${key}: "${cached[key]}"`);
            }
        });
    }
} else {
    console.log('   ❌ preferencesCache לא זמין');
}

// 2. בדיקת UnifiedCacheManager
console.log('\n🔄 UnifiedCacheManager:');
if (window.UnifiedCacheManager) {
    console.log(`   Initialized: ${window.UnifiedCacheManager.initialized}`);
    console.log(`   Available: ${!!window.UnifiedCacheManager}`);
    
    // בדיקת מטמון user-preferences
    if (window.UnifiedCacheManager.initialized) {
        window.UnifiedCacheManager.get('user-preferences').then(data => {
            console.log(`   user-preferences cache: ${data ? 'exists' : 'empty'}`);
            if (data) {
                console.log(`   user-preferences size: ${Object.keys(data).length} items`);
            }
        }).catch(err => {
            console.log(`   user-preferences error: ${err.message}`);
        });
    }
} else {
    console.log('   ❌ UnifiedCacheManager לא זמין');
}

// 3. בדיקת localStorage
console.log('\n💾 localStorage:');
const localStorageKeys = Object.keys(localStorage);
console.log(`   Total keys: ${localStorageKeys.length}`);
localStorageKeys.forEach(key => {
    if (key.includes('preferences') || key.includes('color') || key.includes('profile')) {
        console.log(`     ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
    }
});

// 4. בדיקת IndexedDB
console.log('\n🗄️ IndexedDB:');
if ('indexedDB' in window) {
    console.log('   IndexedDB available: true');
    // בדיקה בסיסית של IndexedDB
    const request = indexedDB.open('TikTrackCache', 1);
    request.onsuccess = function() {
        console.log('   IndexedDB connection: success');
        request.result.close();
    };
    request.onerror = function() {
        console.log('   IndexedDB connection: error');
    };
} else {
    console.log('   ❌ IndexedDB לא זמין');
}

console.log('\n✅ בדיקת מטמון הושלמה');
