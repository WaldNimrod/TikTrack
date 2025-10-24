/**
 * Debug Preferences Cache System
 * בדיקת מערכת המטמון של ההעדפות
 * 
 * קוד זה בודק איזה מטמון משתמשת מערכת ההעדפות בפועל
 * ומציג מידע מפורט על הפרופיל הפעיל והמטמון
 */

// פונקציה לבדיקת מערכת המטמון של ההעדפות
window.debugPreferencesCache = async function() {
    console.log('🔍 === בדיקת מערכת המטמון של ההעדפות ===');
    
    // 1. בדיקת מערכות המטמון הזמינות
    console.log('\n📊 מערכות מטמון זמינות:');
    console.log('• UnifiedCacheManager:', window.UnifiedCacheManager ? '✅ זמין' : '❌ לא זמין');
    console.log('• PreferencesCore:', window.PreferencesCore ? '✅ זמין' : '❌ לא זמין');
    console.log('• PreferencesUI:', window.PreferencesUI ? '✅ זמין' : '❌ לא זמין');
    
    // 2. בדיקת הפרופיל הפעיל הנוכחי
    console.log('\n👤 פרופיל פעיל נוכחי:');
    if (window.PreferencesCore) {
        console.log(`• User ID: ${window.PreferencesCore.currentUserId}`);
        console.log(`• Profile ID: ${window.PreferencesCore.currentProfileId}`);
    } else {
        console.log('❌ PreferencesCore לא זמין');
    }
    
    if (window.PreferencesUI) {
        console.log(`• UI User ID: ${window.PreferencesUI.currentUserId}`);
        console.log(`• UI Profile ID: ${window.PreferencesUI.currentProfileId}`);
    } else {
        console.log('❌ PreferencesUI לא זמין');
    }
    
    // 3. בדיקת מטמון הפרופיל הפעיל
    console.log('\n💾 מטמון הפרופיל הפעיל:');
    
    // בדיקת localStorage
    console.log('📱 localStorage:');
    const localStorageKeys = Object.keys(localStorage).filter(key => 
        key.includes('preference_') || key.includes('profile_') || key.includes('active')
    );
    console.log(`• מפתחות רלוונטיים: ${localStorageKeys.length}`);
    localStorageKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`  - ${key}: ${value ? value.substring(0, 50) + '...' : 'null'}`);
    });
    
    // בדיקת sessionStorage
    console.log('🔄 sessionStorage:');
    const sessionStorageKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('preference_') || key.includes('profile_') || key.includes('active')
    );
    console.log(`• מפתחות רלוונטיים: ${sessionStorageKeys.length}`);
    sessionStorageKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        console.log(`  - ${key}: ${value ? value.substring(0, 50) + '...' : 'null'}`);
    });
    
    // 4. בדיקת UnifiedCacheManager
    if (window.UnifiedCacheManager) {
        console.log('\n🔧 UnifiedCacheManager:');
        try {
            const allKeys = await window.UnifiedCacheManager.getAllKeys();
            const preferenceKeys = allKeys.filter(key => 
                key.includes('preference_') || key.includes('profile_') || key.includes('active')
            );
            console.log(`• מפתחות רלוונטיים: ${preferenceKeys.length}`);
            preferenceKeys.forEach(key => {
                console.log(`  - ${key}`);
            });
        } catch (error) {
            console.log(`❌ שגיאה בבדיקת UnifiedCacheManager: ${error.message}`);
        }
    }
    
    // 5. בדיקת הפרופיל הפעיל מהשרת
    console.log('\n🌐 פרופיל פעיל מהשרת:');
    try {
        const response = await fetch('/api/preferences/profiles');
        if (response.ok) {
            const result = await response.json();
            const activeProfile = result.data.profiles.find(p => p.active === true);
            if (activeProfile) {
                console.log(`• שם: ${activeProfile.name}`);
                console.log(`• ID: ${activeProfile.id}`);
                console.log(`• תיאור: ${activeProfile.description}`);
                console.log(`• ברירת מחדל: ${activeProfile.default ? 'כן' : 'לא'}`);
            } else {
                console.log('❌ לא נמצא פרופיל פעיל');
            }
        } else {
            console.log(`❌ שגיאה בקבלת פרופילים: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ שגיאה בבדיקת הפרופיל מהשרת: ${error.message}`);
    }
    
    // 6. בדיקת מטמון העדפות ספציפי
    console.log('\n🎯 מטמון העדפות ספציפי:');
    if (window.PreferencesCore) {
        const userId = window.PreferencesCore.currentUserId;
        const profileId = window.PreferencesCore.currentProfileId;
        
        // בדיקת מפתחות מטמון ספציפיים
        const cacheKeys = [
            `preference_primaryColor_${userId}_${profileId}`,
            `preference_backgroundColor_${userId}_${profileId}`,
            `preference_textColor_${userId}_${profileId}`,
            `all_preferences_${userId}_${profileId}`
        ];
        
        for (const key of cacheKeys) {
            try {
                if (window.UnifiedCacheManager) {
                    const value = await window.UnifiedCacheManager.get(key);
                    console.log(`• ${key}: ${value ? '✅ נמצא' : '❌ לא נמצא'}`);
                }
            } catch (error) {
                console.log(`• ${key}: ❌ שגיאה - ${error.message}`);
            }
        }
    }
    
    // 7. בדיקת סטטוס המטמון
    console.log('\n📈 סטטוס המטמון:');
    if (window.UnifiedCacheManager) {
        try {
            const stats = await window.UnifiedCacheManager.getStats();
            console.log(`• מפתחות כולל: ${stats.totalKeys || 'לא זמין'}`);
            console.log(`• זיכרון בשימוש: ${stats.memoryUsage || 'לא זמין'}`);
            console.log(`• TTL ממוצע: ${stats.averageTTL || 'לא זמין'}`);
        } catch (error) {
            console.log(`❌ שגיאה בקבלת סטטיסטיקות: ${error.message}`);
        }
    }
    
    console.log('\n✅ === סיום בדיקת מערכת המטמון ===');
};

// פונקציה לבדיקת החלפת פרופיל
window.debugProfileSwitch = async function() {
    console.log('🔄 === בדיקת החלפת פרופיל ===');
    
    // 1. בדיקת הפרופיל הנוכחי
    console.log('\n👤 פרופיל נוכחי:');
    if (window.PreferencesCore) {
        console.log(`• User ID: ${window.PreferencesCore.currentUserId}`);
        console.log(`• Profile ID: ${window.PreferencesCore.currentProfileId}`);
    }
    
    // 2. בדיקת הפרופיל הפעיל מהשרת
    console.log('\n🌐 פרופיל פעיל מהשרת:');
    try {
        const response = await fetch('/api/preferences/profiles');
        if (response.ok) {
            const result = await response.json();
            const activeProfile = result.data.profiles.find(p => p.active === true);
            if (activeProfile) {
                console.log(`• שם: ${activeProfile.name}`);
                console.log(`• ID: ${activeProfile.id}`);
                
                // בדיקת התאמה
                if (window.PreferencesCore && window.PreferencesCore.currentProfileId === activeProfile.id) {
                    console.log('✅ הפרופיל תואם');
                } else {
                    console.log('❌ הפרופיל לא תואם');
                    console.log(`• PreferencesCore: ${window.PreferencesCore?.currentProfileId}`);
                    console.log(`• Server: ${activeProfile.id}`);
                }
            }
        }
    } catch (error) {
        console.log(`❌ שגיאה: ${error.message}`);
    }
    
    // 3. בדיקת מטמון לפני החלפה
    console.log('\n💾 מטמון לפני החלפה:');
    if (window.UnifiedCacheManager) {
        try {
            const allKeys = await window.UnifiedCacheManager.getAllKeys();
            const preferenceKeys = allKeys.filter(key => key.includes('preference_'));
            console.log(`• מפתחות העדפות: ${preferenceKeys.length}`);
        } catch (error) {
            console.log(`❌ שגיאה: ${error.message}`);
        }
    }
    
    console.log('\n✅ === סיום בדיקת החלפת פרופיל ===');
};

// פונקציה לבדיקת מטמון העדפות ספציפי
window.debugPreferenceCache = async function(preferenceName) {
    console.log(`🎯 === בדיקת מטמון העדפה: ${preferenceName} ===`);
    
    if (!window.PreferencesCore) {
        console.log('❌ PreferencesCore לא זמין');
        return;
    }
    
    const userId = window.PreferencesCore.currentUserId;
    const profileId = window.PreferencesCore.currentProfileId;
    const cacheKey = `preference_${preferenceName}_${userId}_${profileId}`;
    
    console.log(`• מפתח מטמון: ${cacheKey}`);
    console.log(`• User ID: ${userId}`);
    console.log(`• Profile ID: ${profileId}`);
    
    // בדיקת מטמון
    if (window.UnifiedCacheManager) {
        try {
            const value = await window.UnifiedCacheManager.get(cacheKey);
            if (value) {
                console.log(`✅ נמצא במטמון: ${JSON.stringify(value)}`);
            } else {
                console.log('❌ לא נמצא במטמון');
            }
        } catch (error) {
            console.log(`❌ שגיאה בבדיקת מטמון: ${error.message}`);
        }
    }
    
    // בדיקת localStorage
    const localStorageValue = localStorage.getItem(cacheKey);
    if (localStorageValue) {
        console.log(`✅ נמצא ב-localStorage: ${localStorageValue}`);
    } else {
        console.log('❌ לא נמצא ב-localStorage');
    }
    
    // בדיקת sessionStorage
    const sessionStorageValue = sessionStorage.getItem(cacheKey);
    if (sessionStorageValue) {
        console.log(`✅ נמצא ב-sessionStorage: ${sessionStorageValue}`);
    } else {
        console.log('❌ לא נמצא ב-sessionStorage');
    }
    
    console.log('\n✅ === סיום בדיקת מטמון העדפה ===');
};

// הוספת הפונקציות לגלובל
console.log('🔧 פונקציות דיבוג נוספו:');
console.log('• debugPreferencesCache() - בדיקת מערכת המטמון');
console.log('• debugProfileSwitch() - בדיקת החלפת פרופיל');
console.log('• debugPreferenceCache(preferenceName) - בדיקת מטמון העדפה ספציפית');
console.log('\n💡 דוגמאות שימוש:');
console.log('• debugPreferencesCache()');
console.log('• debugProfileSwitch()');
console.log('• debugPreferenceCache("primaryColor")');
